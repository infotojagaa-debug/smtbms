const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  communicationId: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
  },
  type: { 
    type: String, 
    enum: ['call', 'email', 'meeting', 'whatsapp', 'video-call', 'site-visit', 'other'],
    required: true 
  },
  direction: { 
    type: String, 
    enum: ['incoming', 'outgoing'],
    required: true 
  },
  subject: { type: String },
  content: { type: String, required: true },
  duration: { type: Number }, // in minutes for calls
  outcome: { 
    type: String, 
    enum: ['positive', 'neutral', 'negative', 'no-answer'],
    default: 'neutral' 
  },
  nextAction: { type: String },
  nextActionDate: { type: Date },
  attachments: [{
    name: String,
    url: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Communication', communicationSchema);
