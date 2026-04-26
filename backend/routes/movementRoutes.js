const express = require('express');
const router = express.Router();
const { transferMaterial, getMovements } = require('../controllers/movementController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMovements);

router.route('/transfer')
  .post(protect, transferMaterial);

module.exports = router;
