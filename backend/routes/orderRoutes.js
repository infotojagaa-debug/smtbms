const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getOrders)
  .post(protect, authorize('Admin', 'Manager'), createOrder);

router.route('/:id/status')
  .patch(protect, authorize('Admin', 'Manager'), updateOrderStatus);

module.exports = router;
