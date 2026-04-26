const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityId: {
    type: String,
    required: true,
    unique: true,
  },
  type: { 
    type: String, 
    enum: ['call', 'meeting', 'task', 'email', 'deadline', 'follow-up'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: { type: Date, required: true },
  dueTime: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium' 
  },
  reminder: { 
    type: Number, 
    enum: [15, 30, 60, 1440], 
    default: 30 
  },
  completedAt: { type: Date },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Activity', activitySchema);
