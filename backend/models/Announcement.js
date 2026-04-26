const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  desc: {
    type: String,
    required: [true, 'Please add a desc']
  },
  type: {
    type: String,
    enum: ['Info', 'Warning', 'Action Required', 'System Update'],
    default: 'Info'
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Critical'],
    default: 'Normal'
  },
  targetRole: {
    type: String,
    enum: ['All', 'HR', 'Manager', 'Employee', 'Sales Team'],
    default: 'All'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
