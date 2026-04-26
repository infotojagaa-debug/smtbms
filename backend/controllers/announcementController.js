const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    const role = req.user.role;
    const query = role === 'Admin' ? {} : { $or: [{ targetRole: { $in: ['All', role] } }, { targetRole: { $exists: false } }] };
    
    const announcements = await Announcement.find(query)
      .populate('author', 'name role')
      .sort('-createdAt')
      .limit(50);
      
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, desc, type, priority, targetRole } = req.body;

    const announcement = await Announcement.create({
      title,
      desc,
      type,
      priority,
      targetRole: targetRole || 'All',
      author: req.user._id
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate('author', 'name role');

    // Broadcast via socket.io
    const io = req.app.get('io');
    if (io) {
      if (targetRole && targetRole !== 'All') {
        io.to(targetRole).emit('announcement', populatedAnnouncement);
      } else {
        io.emit('announcement', populatedAnnouncement);
      }
    }

    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
      await announcement.deleteOne();
      res.json({ message: 'Announcement removed' });
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
