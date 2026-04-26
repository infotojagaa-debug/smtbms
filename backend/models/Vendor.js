const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  gstNumber: { type: String },
  panNumber: { type: String },
  bankDetails: {
    accountNo: { type: String },
    ifsc: { type: String },
    bankName: { type: String },
    accountName: { type: String },
  },
  category: { 
    type: String, 
    enum: ['raw-material', 'service', 'equipment', 'consumable'],
    required: true 
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalOrders: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active' 
  },
  documents: [{
    name: String,
    url: String,
  }],
  notes: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Vendor', vendorSchema);
