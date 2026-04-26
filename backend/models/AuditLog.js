const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { 
    type: String, 
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'TRANSFER', 'APPROVE', 'REJECT'],
    required: true 
  },
  module: { 
    type: String, 
    enum: ['material', 'hrms', 'erp', 'crm', 'auth', 'system'],
    required: true 
  },
  resourceType: { type: String, required: true }, // e.g., 'Employee', 'Material'
  resourceId: { type: String }, // ID of the impacted resource
  oldData: { type: Object }, // JSON state before change
  newData: { type: Object }, // JSON state after change
  ipAddress: { type: String },
  userAgent: { type: String },
  description: { type: String, required: true },
}, {
  timestamps: true,
});

// Index for auditing performance
auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
