const express = require('express');
const router = express.Router();
const { 
  getAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement 
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAnnouncements)
  .post(protect, authorize('Admin', 'HR'), createAnnouncement);

router.route('/:id')
  .delete(protect, authorize('Admin'), deleteAnnouncement);

module.exports = router;
