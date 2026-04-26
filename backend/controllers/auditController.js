const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs (Admin Only)
// @route   GET /api/audit/logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { module, action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (module) query.module = module;
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit logs for specific user
// @route   GET /api/audit/user/:id
exports.getUserAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ userId: req.params.id }).sort('-createdAt').limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Internal Helper to log actions
exports.logAction = async (data) => {
  try {
    await AuditLog.create(data);
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
};
