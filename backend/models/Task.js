const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Original creator/primary user for single-assignee backwards compat
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  assignedTo: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    progressNotes: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
  }],
  date: {
    type: String, // Stored as YYYY-MM-DD
    required: true,
  },
  dueDate: {
    type: String, // Stored as YYYY-MM-DD
  },
  category: {
    type: String,
    default: 'General',
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attachment: {
    type: String, // URL to attachment
  },
  isBroadcast: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', TaskSchema);
