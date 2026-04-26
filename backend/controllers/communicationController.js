const Communication = require('../models/Communication');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

// @desc    Log a new communication
// @route   POST /api/crm/communications
exports.logCommunication = async (req, res) => {
  try {
    const communicationId = `COM-${Math.floor(100000 + Math.random() * 900000)}`;
    const communication = await Communication.create({
      ...req.body,
      communicationId,
      createdBy: req.user._id
    });

    // 1. Update Lead Last Contact Date
    if (req.body.leadId) {
       await Lead.findByIdAndUpdate(req.body.leadId, { lastContactDate: new Date() });
    }

    // 2. Create Next Action Activity if specified
    if (req.body.nextAction && req.body.nextActionDate) {
       await Activity.create({
          activityId: `ACT-COM-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'follow-up',
          title: `Next Action: ${req.body.nextAction}`,
          description: `Spawned from communication: ${req.body.subject}`,
          customerId: req.body.customerId,
          leadId: req.body.leadId,
          dealId: req.body.dealId,
          assignedTo: req.user._id,
          dueDate: req.body.nextActionDate,
          createdBy: req.user._id
       });
    }

    res.status(201).json(communication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all communications
// @route   GET /api/crm/communications
exports.getAllCommunications = async (req, res) => {
  try {
    const communications = await Communication.find(req.query)
      .populate('customerId', 'name company')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(communications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Communication Summary for Analytics
// @route   GET /api/crm/communications/summary
exports.getSummary = async (req, res) => {
  try {
    const summary = await Communication.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
