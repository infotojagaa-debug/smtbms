const express = require('express');
const router = express.Router();
const { 
  getAllPayroll, 
  generatePayroll,
  markAsPaid 
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('Admin', 'HR'), getAllPayroll);

router.post('/generate', protect, authorize('Admin', 'HR'), generatePayroll);
router.patch('/:id/pay', protect, authorize('Admin', 'HR'), markAsPaid);

module.exports = router;
