const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  items: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    itemName: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  taxPercentage: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  shippingCharges: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'acknowledged', 'partial-received', 'received', 'cancelled'],
    default: 'draft' 
  },
  expectedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  deliveryAddress: { type: String },
  terms: { type: String },
  notes: { type: String },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedOn: { type: Date },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
