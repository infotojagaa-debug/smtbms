const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');

// @desc    Create new budget
// @route   POST /api/erp/budgets
exports.createBudget = async (req, res) => {
  try {
    const budgetId = `BGT-${Math.floor(1000 + Math.random() * 9000)}`;
    const budget = await Budget.create({
      ...req.body,
      budgetId
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all budgets
// @route   GET /api/erp/budgets
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find(req.query).sort('-year -month');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Budget vs Actual Charts Data
// @route   GET /api/erp/budgets/vs-actual
exports.getBudgetVsActual = async (req, res) => {
  try {
    const data = await Budget.aggregate([
      { $group: { 
        _id: '$department', 
        allocated: { $sum: '$allocatedAmount' },
        spent: { $sum: '$spentAmount' }
      }}
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Financial Summary for Dashboard
// @route   GET /api/erp/budgets/summary
exports.getFinancialSummary = async (req, res) => {
  try {
    // 1. Sales Revenue
    const revenue = await Invoice.aggregate([
      { $match: { invoiceType: 'sale', status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // 2. Expenses (Approved)
    const expenses = await Expense.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const rev = revenue[0]?.total || 0;
    const exp = expenses[0]?.total || 0;

    res.json({
      totalRevenue: rev,
      totalExpenses: exp,
      profit: rev - exp
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
