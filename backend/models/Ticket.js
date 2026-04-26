const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['billing', 'technical', 'general', 'complaint', 'feature-request', 'other'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'waiting', 'resolved', 'closed'],
    default: 'open' 
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  attachments: [{
    name: String,
    url: String,
  }],
  resolution: { type: String },
  resolvedAt: { type: Date },
  satisfactionRating: { type: Number, min: 1, max: 5 },
  satisfactionComment: { type: String },
  firstResponseAt: { type: Date },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ticket', ticketSchema);
