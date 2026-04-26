const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  company: { type: String },
  designation: { type: String },
  industry: { 
    type: String, 
    enum: ['IT', 'manufacturing', 'retail', 'healthcare', 'education', 'other'],
    required: true 
  },
  customerType: { 
    type: String, 
    enum: ['individual', 'corporate', 'government'],
    required: true 
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  source: { 
    type: String, 
    enum: ['website', 'referral', 'cold-call', 'social-media', 'exhibition', 'email-campaign', 'other'],
    required: true 
  },
  tags: [String],
  totalDeals: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked'],
    default: 'active' 
  },
  isStrategicPartner: { type: Boolean, default: false },
  loyaltyLevel: { 
    type: String, 
    enum: ['Standard', 'Silver', 'Gold', 'Platinum'], 
    default: 'Standard' 
  },
  photo: { type: String },
  notes: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);
