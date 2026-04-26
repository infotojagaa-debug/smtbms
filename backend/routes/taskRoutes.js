const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const { createNotification } = require('../controllers/notificationController');

// @desc    Fetch personal tasks for a specific date
// @route   GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const query = { 
      user: req.user._id,
      assignedBy: req.user._id // Personal tasks are assigned by self
    };
    if (date) query.date = date;

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching personal tasks:', error);
    res.status(500).json({ message: 'Error fetching personal tasks', error: error.message });
  }
});

// @desc    Create a personal task
// @route   POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, priority, date, dueDate, duration } = req.body;
    const task = await Task.create({
      user: req.user._id,
      assignedBy: req.user._id,
      assignedTo: [{ user: req.user._id, status: 'Pending' }],
      title,
      description,
      priority,
      date,
      dueDate,
      duration
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error creating personal task', error: error.message });
  }
});

// @desc    Fetch all assignments (Manager: all; Employee: only where assigned)
// @route   GET /api/tasks/assignments
router.get('/assignments', protect, async (req, res) => {
  try {
    let query = {};
    const isManagerial = req.user.role === 'Manager' || req.user.role === 'Admin';
    
    if (!isManagerial) {
      // Find tasks where the current user is in the assignedTo array
      query = { 'assignedTo.user': req.user._id };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo.user', 'name role department')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
});

// @desc    Assign a new team mission (Unified Multi-Assignee)
// @route   POST /api/tasks/assignments
router.post('/assignments', protect, upload.single('attachment'), async (req, res) => {
  const { title, description, priority, assignedTo, dueDate, category } = req.body;
  const attachment = req.file ? req.file.path : null;

  if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Deployment unauthorized' });
  }

  try {
    const User = require('../models/User');
    let targetAssignees = [];

    if (assignedTo === 'all') {
      const allUsers = await User.find({ role: { $ne: 'Admin' }, status: 'Active' }).select('_id');
      targetAssignees = allUsers.map(u => ({ user: u._id, status: 'Pending' }));
    } else {
      targetAssignees = [{ user: assignedTo, status: 'Pending' }];
    }

    let finalAttachment = attachment;
    if (attachment && !attachment.startsWith('http')) {
      const webPath = attachment.replace(/\\/g, '/');
      finalAttachment = `${req.protocol}://${req.get('host')}/${webPath}`;
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      priority: priority || 'Medium',
      date: new Date().toISOString().split('T')[0],
      dueDate,
      assignedBy: req.user._id,
      assignedTo: targetAssignees,
      category: category || 'General',
      attachment: finalAttachment,
      isBroadcast: assignedTo === 'all'
    });

    // Notify all assignees
    await Promise.all(targetAssignees.map(async (assignee) => {
      await createNotification({
        userId: assignee.user,
        title: assignedTo === 'all' ? 'New Broadcast Mission' : 'New Task Assigned',
        message: `Manager ${req.user.name} deployed a new objective: ${title}`,
        type: 'task',
        priority: priority === 'High' ? 'high' : 'medium',
        module: 'hrms',
        link: '/my-tasks'
      });
    }));

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error creating mission', error: error.message });
  }
});

// @desc    Update mission status (Unified)
// @route   PUT /api/tasks/assignments/:id
router.put('/assignments/:id', protect, upload.single('attachment'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isManager = req.user.role === 'Manager' || req.user.role === 'Admin';
    
    if (isManager) {
      const { title, description, priority, dueDate, category } = req.body;
      if (title) task.title = title;
      if (description) task.description = description;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
      if (category) task.category = category;

      if (req.file) {
        let finalAttachment = req.file.path;
        if (finalAttachment && !finalAttachment.startsWith('http')) {
          const webPath = finalAttachment.replace(/\\/g, '/');
          finalAttachment = `${req.protocol}://${req.get('host')}/${webPath}`;
        }
        task.attachment = finalAttachment;
      }
    } else {
      const { status, progressNotes } = req.body;
      const assigneeEntry = task.assignedTo.find(a => a.user.toString() === req.user._id.toString());
      
      if (!assigneeEntry) return res.status(403).json({ message: 'Not authorized for this mission' });

      if (status) {
        if (status !== assigneeEntry.status) {
          await createNotification({
            userId: task.assignedBy,
            title: 'Mission Update',
            message: `${req.user.name} shifted status to "${status}" for: ${task.title}`,
            type: 'task',
            priority: 'medium',
            module: 'hrms',
            link: '/manager/task-assign'
          });
        }
        assigneeEntry.status = status;
      }
      if (progressNotes !== undefined) assigneeEntry.progressNotes = progressNotes;
      assigneeEntry.updatedAt = Date.now();
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error updating mission', error: error.message });
  }
});

// @desc    Fetch distinct dates with tasks
// @route   GET /api/tasks/dates
router.get('/dates', protect, async (req, res) => {
  try {
    const dates = await Task.distinct('date', { user: req.user._id });
    res.json(dates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task dates', error: error.message });
  }
});

// @desc    Purge mission
// @route   DELETE /api/tasks/assignments/:id
router.delete('/assignments/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Both manager and owner can delete
    const isOwner = task.user && task.user.toString() === req.user._id.toString();
    const isManager = req.user.role === 'Manager' || req.user.role === 'Admin';

    if (!isOwner && !isManager) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task purged' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router;
