const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  createVendor,
  getAllVendors,
  getVendorStats,
  getVendorById,
  updateVendor,
  rateVendor
} = require('../controllers/vendorController');

const {
  createPO,
  getAllPOs,
  getPOStats,
  getPOById,
  approvePO,
  receivePO
} = require('../controllers/purchaseOrderController');

const {
  createInvoice,
  getAllInvoices,
  getInvoiceStats,
  getInvoiceById,
  sendInvoice
} = require('../controllers/invoiceController');

const {
  recordPayment,
  getAllPayments,
  getPaymentSummary,
  getOutstanding
} = require('../controllers/paymentController');

const {
  createBudget,
  getAllBudgets,
  getBudgetVsActual,
  getFinancialSummary
} = require('../controllers/budgetController');

const {
  createExpense,
  getAllExpenses,
  approveExpense,
  rejectExpense,
  getExpenseSummary
} = require('../controllers/expenseController');

// --- Vendors ---
router.post('/vendors', protect, authorize('Admin', 'Manager'), createVendor);
router.get('/vendors', protect, getAllVendors);
router.get('/vendors/stats', protect, authorize('Admin', 'Manager'), getVendorStats);
router.get('/vendors/:id', protect, getVendorById);
router.put('/vendors/:id', protect, authorize('Admin', 'Manager'), updateVendor);
router.put('/vendors/:id/rate', protect, authorize('Admin', 'Manager'), rateVendor);

// --- Purchase Orders ---
router.post('/po', protect, authorize('Admin', 'Manager'), createPO);
router.get('/po', protect, getAllPOs);
router.get('/po/stats', protect, authorize('Admin', 'Manager'), getPOStats);
router.get('/po/:id', protect, getPOById);
router.put('/po/:id/approve', protect, authorize('Admin', 'Manager'), approvePO);
router.post('/po/:id/receive', protect, authorize('Admin', 'Manager'), receivePO);

// --- Invoices ---
router.post('/invoices', protect, authorize('Admin', 'Manager'), createInvoice);
router.get('/invoices', protect, getAllInvoices);
router.get('/invoices/stats', protect, authorize('Admin', 'Manager'), getInvoiceStats);
router.get('/invoices/:id', protect, getInvoiceById);
router.post('/invoices/:id/send', protect, authorize('Admin', 'Manager'), sendInvoice);

// --- Payments ---
router.post('/payments', protect, authorize('Admin', 'Manager'), recordPayment);
router.get('/payments', protect, getAllPayments);
router.get('/payments/summary', protect, authorize('Admin', 'Manager'), getPaymentSummary);
router.get('/payments/outstanding', protect, authorize('Admin', 'Manager'), getOutstanding);

// --- Budget & Expenses ---
router.post('/budgets', protect, authorize('Admin', 'Manager'), createBudget);
router.get('/budgets', protect, authorize('Admin', 'Manager'), getAllBudgets);
router.get('/budgets/vs-actual', protect, authorize('Admin', 'Manager'), getBudgetVsActual);
router.get('/budgets/summary', protect, authorize('Admin', 'Manager'), getFinancialSummary);
router.post('/expenses', protect, createExpense);
router.get('/expenses', protect, authorize('Admin', 'Manager'), getAllExpenses);
router.get('/expenses/summary', protect, authorize('Admin', 'Manager'), getExpenseSummary);
router.put('/expenses/:id/approve', protect, authorize('Admin', 'Manager'), approveExpense);
router.put('/expenses/:id/reject', protect, authorize('Admin', 'Manager'), rejectExpense);

module.exports = router;
