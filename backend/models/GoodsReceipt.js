const mongoose = require('mongoose');

const goodsReceiptSchema = new mongoose.Schema({
  grnNumber: {
    type: String,
    required: true,
    unique: true,
  },
  poId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  items: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    itemName: { type: String, required: true },
    orderedQty: { type: Number, required: true },
    receivedQty: { type: Number, required: true },
    rejectedQty: { type: Number, default: 0 },
    rejectionReason: { type: String },
    unit: { type: String, required: true },
  }],
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receivedDate: { type: Date, default: Date.now },
  remarks: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('GoodsReceipt', goodsReceiptSchema);
