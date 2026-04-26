const Notification = require('../models/Notification');
const { getIO } = require('../socket/socket'); // Will enhance in step 10

// @desc    Get user notifications with filtering and pagination
// @route   GET /api/notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { module, type, priority, isRead, page = 1, limit = 20 } = req.query;
    
    const query = {
      $or: [
        { userId: req.user._id },
        { role: req.user.role },
        { role: 'all' }
      ]
    };

    if (module) query.module = module;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const count = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email role');
    
    res.json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      $or: [
        { userId: req.user._id },
        { role: req.user.role },
        { role: 'all' }
      ],
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, 
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all notifications for user
// @route   DELETE /api/notifications/clear
exports.clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'Notification history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create and emit notification (Internal Helper)
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    const io = getIO();
    if (io) {
      if (data.userId) {
        io.to(`user_${data.userId}`).emit('notification', notification);
      }
      if (data.role) {
        io.to(`role_${data.role}`).emit('notification', notification);
      }
    }
    return notification;
  } catch (error) {
    console.error('Notification Error:', error.message);
  }
};

// @desc    Notify specific role with individual records and real-time socket emission
exports.notifyRole = async (role, data) => {
  try {
    const roles = Array.isArray(role) ? role : [role];
    const io = getIO();
    
    for (const r of roles) {
      const notif = await Notification.create({ ...data, role: r });
      if (io) {
        // Emit to primary role room (e.g., role_Admin)
        io.to(`role_${r}`).emit('notification', notif);
        
        // Secondary fallback rooms for cross-compatibility
        const lowerRole = r.toLowerCase();
        if (lowerRole !== r) {
           io.to(`role_${lowerRole}`).emit('notification', notif);
        }
        
        // Special case for admin room
        if (lowerRole === 'admin') {
           io.to('admin').emit('notification', notif);
        }
      }
    }
  } catch (error) {
    console.error('Role Notification Error:', error.message);
  }
};

// @desc    Notify with grouping logic (Merges similar unread notifications)
exports.notifyGrouped = async (data) => {
  try {
    const { groupId, role, userId, title, message, ...rest } = data;
    const io = getIO();

    if (groupId) {
      const existing = await Notification.findOne({
        groupId,
        role: role || 'all',
        userId: userId || null,
        isRead: false
      });

      if (existing) {
        // Update existing notification
        existing.message = message;
        existing.title = title;
        existing.metadata = { ...existing.metadata, ...rest.metadata, updatedAt: new Date() };
        existing.createdAt = new Date(); // Bump to top
        await existing.save();

        if (io) {
          const room = userId ? `user_${userId}` : `role_${role || 'all'}`;
          io.to(room).emit('notification_updated', existing);
          
          // Fallbacks for roles
          if (!userId && role) {
             const lowerRole = role.toLowerCase();
             if (lowerRole !== role) io.to(`role_${lowerRole}`).emit('notification_updated', existing);
             if (lowerRole === 'admin') io.to('admin').emit('notification_updated', existing);
          }
        }
        return existing;
      }
    }

    // Create new if no grouping or not found
    const notification = await Notification.create(data);
    if (io) {
      const room = userId ? `user_${userId}` : `role_${role || 'all'}`;
      io.to(room).emit('notification', notification);
      
      // Fallbacks for roles
      if (!userId && role) {
         const lowerRole = role.toLowerCase();
         if (lowerRole !== role) io.to(`role_${lowerRole}`).emit('notification', notification);
         if (lowerRole === 'admin') io.to('admin').emit('notification', notification);
      }
    }
    return notification;
  } catch (error) {
    console.error('Grouped Notification Error:', error.message);
  }
};

// @desc    Send Bulk notification (Internal Helper)
exports.sendBulkNotification = async (userIds, data) => {
  try {
    const notifications = userIds.map(uid => ({ ...data, userId: uid }));
    const saved = await Notification.insertMany(notifications);
    const io = getIO();
    if (io) {
      userIds.forEach((uid, index) => {
        io.to(`user_${uid}`).emit('notification', saved[index]);
      });
    }
  } catch (error) {
    console.error('Bulk Notification Error:', error.message);
  }
};
