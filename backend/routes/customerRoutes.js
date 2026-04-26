const express = require('express');
const { getDashboard, getOrders, trackOrder } = require('../controllers/customerPortalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/orders', getOrders);
router.get('/orders/:id/track', trackOrder);

module.exports = router;
