const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  type: {
    type: String,
    enum: ['IN', 'OUT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  afterStockQuantity: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Linking to the existing generic user/employee ID system without breaking it
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryStockLog', stockLogSchema);
