const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  address: { type: String },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  employeeType: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract'],
    default: 'Full-time'
  },
  joiningDate: { type: Date, required: true, default: Date.now },
  salary: {
    basic: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    foodAllowance: { type: Number, default: 0 },
    travelAllowance: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 }, // per hour
    latePenalty: { type: Number, default: 0 }, // per late instance
    deductions: { type: Number, default: 0 },
  },
  bankDetails: {
    accountNo: { type: String },
    ifsc: { type: String },
    bankName: { type: String },
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  photo: { type: String }, // Cloudinary URL
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Terminated'],
    default: 'Active',
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Employee', employeeSchema);
