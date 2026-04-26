const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for role-based broadcasts
  },
  role: { type: String }, // For role-based notifications (HR, Admin, etc.)
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['leave', 'payroll', 'attendance', 'task', 'system', 'info', 'success', 'warning', 'error', 'danger'],
    default: 'info' 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  metadata: {
    type: Object,
    default: {}
  },
  groupId: {
    type: String,
    required: false
  },
  module: { 
    type: String, 
    enum: ['material', 'hrms', 'erp', 'crm', 'auth', 'system'],
    required: true 
  },
  link: { type: String }, // Frontend route to navigate
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for performance
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
