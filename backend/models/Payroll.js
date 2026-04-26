const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  
  // Breakdown
  baseSalary: { type: Number, required: true },
  earnedSalary: { type: Number, default: 0 },
  
  // Additions
  allowances: {
    food: { type: Number, default: 0 },
    travel: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  overtimePay: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },

  // Deductions
  deductions: {
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },

  netSalary: { type: Number, default: 0 },
  
  // Meta
  totalDays: { type: Number, default: 30 },
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  paidLeaveDays: { type: Number, default: 0 },
  lopDays: { type: Number, default: 0 },
  lateDays: { type: Number, default: 0 },
  workingHours: { type: Number, default: 0 },


  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Paid'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Other'],
  },
  paymentDate: { type: Date },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  remarks: { type: String }
}, {
  timestamps: true,
});

// Middleware to calculate net salary before saving
payrollSchema.pre('save', function(next) {
  const totalAllowances = this.allowances.food + this.allowances.travel + this.allowances.other;
  const totalDeductions = this.deductions.absent + this.deductions.late + this.deductions.tax + this.deductions.other;
  
  this.netSalary = Math.max(0, this.earnedSalary + totalAllowances + this.overtimePay + this.bonus - totalDeductions);
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);
