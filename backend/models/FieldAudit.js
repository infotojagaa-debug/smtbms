const mongoose = require('mongoose');

const fieldAuditSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  storeName: {
    type: String,
    required: true
  },
  targetLocation: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  checkIn: {
    time: { type: Date },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    verified: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['Assigned', 'In Progress', 'Submitted', 'Reviewed'],
    default: 'In Progress'
  },
  checklist: [{
    question: { type: String, required: true },
    answer: { type: String }, // e.g., 'Yes', 'No', 'Good', 'Average', 'Poor'
    remarks: { type: String },
    photoUrl: { type: String } // Conditional proof if needed
  }],
  evidence: [{
    url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  }],
  issues: [{
    title: { type: String },
    severity: { type: String, enum: ['Low', 'Medium', 'High'] },
    description: { type: String },
    photoUrl: { type: String },
    generatedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
  }],
  timeSpentMinutes: {
    type: Number,
    default: 0
  },
  managerNotes: {
    type: String
  },
  offlineSyncId: {
    type: String // To track client-side generated audits before sync
  }
}, { timestamps: true });

module.exports = mongoose.model('FieldAudit', fieldAuditSchema);
