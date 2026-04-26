const mongoose = require('mongoose');

const materialUsageSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Linking to User model as decided
    required: true,
  },
  quantityUsed: {
    type: Number,
    required: true,
    min: [0.1, 'Quantity utilized must be strictly positive'],
  },
  purpose: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MaterialUsage', materialUsageSchema);
