const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['Casual', 'Sick', 'Earned', 'Maternity', 'Unpaid'],
    required: true,
  },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  appliedOn: { type: Date, default: Date.now },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedOn: { type: Date },
  rejectionReason: { type: String },
}, {
  timestamps: true,
});

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  year: { type: Number, required: true },
  casual: {
    total: { type: Number, default: 12 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 12 }
  },
  sick: {
    total: { type: Number, default: 10 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 10 }
  },
  earned: {
    total: { type: Number, default: 15 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 15 }
  }
}, {
  timestamps: true,
});

module.exports = {
  Leave: mongoose.model('Leave', leaveSchema),
  LeaveBalance: mongoose.model('LeaveBalance', leaveBalanceSchema)
};
