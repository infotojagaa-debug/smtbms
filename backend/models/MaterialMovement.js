const mongoose = require('mongoose');

const materialMovementSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  fromDepartment: {
    type: String,
    required: true,
  },
  toDepartment: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['In', 'Out', 'Transfer'],
    default: 'Transfer',
  },
  movedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  remarks: String,
  metaData: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('MaterialMovement', materialMovementSchema);
