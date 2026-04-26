const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  reviewPeriod: { type: String, required: true }, // e.g. "Q1 2024"
  reviewDate: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 },
  categories: {
    productivity: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    teamwork: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
  },
  strengths: { type: String },
  improvements: { type: String },
  goals: { type: String },
  comments: { type: String },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Performance', performanceSchema);
