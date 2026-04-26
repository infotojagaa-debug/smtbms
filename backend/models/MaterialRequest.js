const mongoose = require('mongoose');

const materialRequestSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Internal = employee usage, External = client/customer purchase
  requestType: {
    type: String,
    enum: ['internal', 'external'],
    default: 'internal',
  },
  // For external (client) requests
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
  clientName: {
    type: String,
    default: null,
  },
  quantityRequested: {
    type: Number,
    required: true,
    min: [0.1, 'Quantity utilized must be strictly positive'],
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Delivered'],
    default: 'Pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewNotes: String,
  // Delivery tracking
  deliveredAt: { type: Date, default: null },
  deliveryNote: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('MaterialRequest', materialRequestSchema);
