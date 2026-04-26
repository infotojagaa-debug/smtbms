const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true,
    default: 'unit'
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 5
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['IN STOCK', 'LOW STOCK', 'OUT OF STOCK'],
    default: 'IN STOCK'
  }
}, {
  timestamps: true
});

// Automated status calculation before saving
inventoryItemSchema.pre('save', function(next) {
  if (this.stockQuantity <= 0) {
    this.status = 'OUT OF STOCK';
  } else if (this.stockQuantity <= this.minStockLevel) {
    this.status = 'LOW STOCK';
  } else {
    this.status = 'IN STOCK';
  }
  next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
