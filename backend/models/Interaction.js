const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  type: {
    type: String,
    enum: ['Call', 'Email', 'Meeting', 'Message'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  summary: {
    type: String,
    required: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Interaction', interactionSchema);
