const SystemSettings = require('../models/SystemSettings');
const nodemailer = require('nodemailer');

// @desc    Get current system settings
// @route   GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await SystemSettings.create({
        companyName: 'SMTBMS Enterprise',
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate({}, req.body, { 
      new: true, 
      upsert: true 
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Test Email SMTP Connection
// @route   POST /api/settings/test-email
exports.testEmailConnection = async (req, res) => {
  try {
    const { host, port, user, pass } = req.body;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    await transporter.verify();
    res.json({ message: 'SMTP Connection Successful' });
  } catch (error) {
    res.status(500).json({ message: `SMTP Failure: ${error.message}` });
  }
};

// @desc    Add Company Holiday
// @route   POST /api/settings/holiday
exports.addHoliday = async (req, res) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      {},
      { $push: { holidays: req.body } },
      { new: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
