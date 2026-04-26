const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true }, // HTML Content
  category: { 
    type: String, 
    enum: ['lead', 'follow-up', 'proposal', 'welcome', 'support'],
    required: true 
  },
  variables: [String], // Array of placeholder names like ['customerName', 'ticketId']
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
