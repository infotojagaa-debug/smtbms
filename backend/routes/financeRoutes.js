const express = require('express');
const router = express.Router();
const { getInvoices, getExpenses, createExpense } = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/invoices', protect, authorize('Admin', 'Manager'), getInvoices);
router.get('/expenses', protect, authorize('Admin', 'Manager'), getExpenses);
router.post('/expenses', protect, authorize('Admin', 'Manager'), createExpense);

module.exports = router;
