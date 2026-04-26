const mongoose = require('mongoose');

const customerOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  items: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending' 
  },
  trackingDetails: {
    stage: {
      type: String,
      enum: ['Ordered', 'Packed', 'In Transit', 'Delivered'],
      default: 'Ordered'
    },
    history: [{
      stage: String,
      timestamp: { type: Date, default: Date.now },
      description: String,
      location: String
    }],
    estimatedDelivery: { type: Date },
    courier: { type: String },
    trackingNumber: { type: String }
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CustomerOrder', customerOrderSchema);
