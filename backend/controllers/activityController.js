const Activity = require('../models/Activity');

// @desc    Create new activity
// @route   POST /api/crm/activities
exports.createActivity = async (req, res) => {
  try {
    const activityId = `ACT-${Math.floor(10000 + Math.random() * 90000)}`;
    const activity = await Activity.create({
      ...req.body,
      activityId,
      createdBy: req.user._id
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete activity
// @route   PUT /api/crm/activities/:id/complete
exports.completeActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, { 
      status: 'completed',
      completedAt: new Date()
    }, { new: true });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Today's Activities
// @route   GET /api/crm/activities/today
exports.getTodayActivities = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const activities = await Activity.find({
      dueDate: { $gte: today, $lte: endOfDay },
      assignedTo: req.user._id,
      status: { $ne: 'completed' }
    }).populate('customerId leadId dealId', 'name company title');
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Overdue Activities
// @route   GET /api/crm/activities/overdue
exports.getOverdueActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      dueDate: { $lt: new Date() },
      assignedTo: req.user._id,
      status: { $in: ['pending', 'in-progress'] }
    }).populate('customerId leadId dealId', 'name company title');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all activities with filters
// @route   GET /api/crm/activities
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find(req.query).sort('dueDate').populate('customerId leadId', 'name title');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
