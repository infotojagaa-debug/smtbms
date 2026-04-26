const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearNotifications
} = require('../controllers/notificationController');

router.get('/', protect, getUserNotifications);
router.get('/count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/clear', protect, clearNotifications);

module.exports = router;
