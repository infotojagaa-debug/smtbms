const express = require('express');
const router = express.Router();
const { getVendors, createVendor, getVendorById } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getVendors)
  .post(protect, authorize('Admin', 'Manager'), createVendor);

router.route('/:id')
  .get(protect, getVendorById);

module.exports = router;
