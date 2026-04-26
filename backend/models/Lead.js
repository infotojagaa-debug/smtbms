const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadId: {
    type: String,
    required: true,
    unique: true,
  },
  title: { type: String, required: true },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  source: { 
    type: String, 
    enum: ['website', 'referral', 'cold-call', 'social-media', 'exhibition', 'email-campaign', 'other'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won', 'lost', 'on-hold'],
    default: 'new' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium' 
  },
  value: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  followUpDate: { type: Date },
  lastContactDate: { type: Date },
  lostReason: { type: String },
  notes: { type: String },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Lead', leadSchema);
