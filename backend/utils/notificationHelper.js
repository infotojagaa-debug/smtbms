const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send a notification to a specific user, role, or broadcast to all admins.
 * @param {Object} data - Notification data
 * @param {string} data.title - Title of notification
 * @param {string} data.message - Body message
 * @param {string} data.type - success, info, warning, danger, etc.
 * @param {string} data.module - hrms, erp, crm, material, etc.
 * @param {string} [data.userId] - Specific user ID
 * @param {string} [data.role] - Target role (e.g. 'Admin', 'Manager')
 * @param {string} [data.link] - Optional frontend link
 * @param {Object} [io] - Socket.io instance
 */
const sendNotification = async (data, io) => {
  try {
    const notification = await Notification.create(data);

    if (io) {
      if (data.userId) {
        // Direct to user room (e.g. user_60a...)
        io.to(`user_${data.userId}`).emit('notification', notification);
      } else if (data.role) {
        // Direct to role room (e.g. role_Admin)
        io.to(`role_${data.role}`).emit('notification', notification);
      } else {
        // Broadcast
        io.emit('notification', notification);
      }
      
      // Always notify admins for critical module updates
      if (data.role !== 'Admin') {
         io.to('role_Admin').emit('notification', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('Notification Error:', error);
  }
};

module.exports = { sendNotification };
