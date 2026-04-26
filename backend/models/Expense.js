const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expenseId: {
    type: String,
    required: true,
    unique: true,
  },
  department: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['salary', 'material', 'equipment', 'marketing', 'operations', 'other'],
    required: true 
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  expenseDate: { type: Date, default: Date.now },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
  },
  receiptUrl: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);
