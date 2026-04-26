const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');

// @desc    Get all invoices
// @route   GET /api/finance/invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('vendor', 'name company');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update invoice payment status
// @route   PATCH /api/finance/invoices/:id
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { 
      status: req.body.status,
      paidAt: req.body.status === 'Paid' ? new Date() : null
    }, { new: true });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all expenses
// @route   GET /api/finance/expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort('-date');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new expense
// @route   POST /api/finance/expenses
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      recordedBy: req.user._id,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
