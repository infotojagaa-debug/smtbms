const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAuditLogs, getUserAuditLogs } = require('../controllers/auditController');

router.get('/logs', protect, authorize('Admin'), getAuditLogs);
router.get('/user/:id', protect, getUserAuditLogs);

module.exports = router;
