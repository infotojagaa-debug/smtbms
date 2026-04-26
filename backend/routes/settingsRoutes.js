const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getSettings,
  updateSettings,
  addHoliday,
  testEmailConnection
} = require('../controllers/settingsController');

router.get('/', protect, authorize('Admin'), getSettings);
router.put('/', protect, authorize('Admin'), updateSettings);
router.post('/holiday', protect, authorize('Admin'), addHoliday);
router.post('/test-email', protect, authorize('Admin'), testEmailConnection);

module.exports = router;
