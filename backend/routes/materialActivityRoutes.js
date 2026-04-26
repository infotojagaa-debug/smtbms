const express = require('express');
const { 
  useMaterial, 
  requestMaterial, 
  getRequests, 
  reviewRequest,
  markDelivered,
  getRecentUsage,
  getEmployeeStats,
  getAdminGlobalStats
} = require('../controllers/materialActivityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// 1. Transactional Operations (Active Consumption)
router.post('/usage', authorize('Employee', 'Manager', 'Admin'), useMaterial);
router.post('/request', authorize('Employee', 'Manager', 'Admin'), requestMaterial);

// 2. Oversight & Approvals
router.get('/requests', authorize('Employee', 'Manager', 'Admin'), getRequests);
router.put('/request/:id/review', authorize('Manager', 'Admin'), reviewRequest);
router.put('/request/:id/deliver', authorize('Manager', 'Admin'), markDelivered);

// 3. Operational Intelligence (Live Feeds)
router.get('/usage', authorize('Employee', 'Manager', 'Admin'), getRecentUsage);
router.get('/stats', authorize('Employee', 'Manager', 'Admin'), getEmployeeStats);
router.get('/admin-stats', authorize('Admin'), getAdminGlobalStats);

module.exports = router;
