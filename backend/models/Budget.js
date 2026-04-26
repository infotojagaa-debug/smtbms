const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  budgetId: {
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
  year: { type: Number, required: true },
  month: { type: Number, default: 0 }, // 0 = Annual budget
  allocatedAmount: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number },
  status: { 
    type: String, 
    enum: ['active', 'closed'],
    default: 'active' 
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: { type: String },
}, {
  timestamps: true,
});

// Auto-calculate remaining amount before saving
budgetSchema.pre('save', function(next) {
  this.remainingAmount = this.allocatedAmount - this.spentAmount;
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
