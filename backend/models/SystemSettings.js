const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'SMTBMS Enterprise' },
  companyLogo: { type: String },
  companyEmail: { type: String },
  companyPhone: { type: String },
  companyAddress: { type: String },
  
  timezone: { type: String, default: 'Asia/Kolkata' },
  currency: { type: String, default: 'INR' },
  dateFormat: { type: String, default: 'DD/MM/YYYY' },
  
  emailSettings: {
    host: { type: String },
    port: { type: Number },
    user: { type: String },
    pass: { type: String },
  },
  
  notificationSettings: {
    emailOnLowStock: { type: Boolean, default: true },
    emailOnLeaveRequest: { type: Boolean, default: true },
    emailOnInvoiceOverdue: { type: Boolean, default: true },
    emailOnTicketAssigned: { type: Boolean, default: true },
  },
  
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
  },
  
  workingDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  
  holidays: [{
    name: { type: String },
    date: { type: Date },
  }],
  
  leaveSettings: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    earned: { type: Number, default: 15 },
  },
  
  payrollSettings: {
    pfPercent: { type: Number, default: 12 },
    taxSlabs: [{
      min: Number,
      max: Number,
      rate: Number,
    }],
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Static method to ensure singleton
systemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
