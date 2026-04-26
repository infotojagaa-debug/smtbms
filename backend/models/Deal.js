const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  dealId: {
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
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  value: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  stage: { 
    type: String, 
    enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
    default: 'prospecting' 
  },
  probability: { type: Number, min: 0, max: 100, default: 20 },
  expectedCloseDate: { type: Date },
  actualCloseDate: { type: Date },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  products: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
    },
    name: String,
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  }],
  competitors: [String],
  lostReason: { type: String },
  notes: { type: String },
  stockDeducted: { type: Boolean, default: false },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Deal', dealSchema);
