const mongoose = require('mongoose');

const stockAlertSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  currentStock: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved'],
    default: 'Active',
  },
  notified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StockAlert', stockAlertSchema);
