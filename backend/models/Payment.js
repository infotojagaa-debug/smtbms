const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  paymentType: { 
    type: String, 
    enum: ['incoming', 'outgoing'],
    required: true 
  },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'cheque', 'bank-transfer', 'upi', 'card'],
    required: true 
  },
  referenceNumber: { type: String },
  bankDetails: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'completed' 
  },
  notes: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
