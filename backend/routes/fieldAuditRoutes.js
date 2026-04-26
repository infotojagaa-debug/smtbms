const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  startAudit,
  submitAudit,
  syncAudits,
  getMyAudits,
  getAllAudits,
  reviewAudit
} = require('../controllers/fieldAuditController');

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/start', startAudit);
router.post('/submit', submitAudit);
router.post('/sync', syncAudits);
router.get('/my', getMyAudits);

// Manager/Admin routes
router.get('/all', authorize('Admin', 'Manager'), getAllAudits);
router.put('/:id/review', authorize('Admin', 'Manager'), reviewAudit);

module.exports = router;
