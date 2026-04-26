const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Helper: Auto-generate Expense ID (EXP-2024-001...)
const generateExpenseId = async () => {
  const year = new Date().getFullYear();
  const lastExp = await Expense.findOne({ expenseId: { $regex: `EXP-${year}` } }).sort({ createdAt: -1 });
  if (!lastExp) return `EXP-${year}-001`;
  const lastId = parseInt(lastExp.expenseId.split('-')[2]);
  return `EXP-${year}-${(lastId + 1).toString().padStart(3, '0')}`;
};

// @desc    Submit new expense
// @route   POST /api/erp/expenses
exports.createExpense = async (req, res) => {
  try {
    const expenseId = await generateExpenseId();
    const expense = await Expense.create({
      ...req.body,
      expenseId,
      submittedBy: req.user._id
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve Expense + Update Budget
// @route   PUT /api/erp/expenses/:id/approve
exports.approveExpense = async (req, res) => {
  const session = await Expense.startSession();
  session.startTransaction();
  try {
    const expense = await Expense.findById(req.params.id).session(session);
    if (!expense) throw new Error('Expense not found');
    if (expense.status !== 'pending') throw new Error('Expense already processed');

    // 1. Update Status
    expense.status = 'approved';
    expense.approvedBy = req.user._id;
    await expense.save({ session });

    // 2. Update Budget Linked
    if (expense.budgetId) {
       await Budget.findByIdAndUpdate(expense.budgetId, {
         $inc: { spentAmount: expense.amount }
       }, { session, new: true });
    }

    await session.commitTransaction();
    session.endSession();

    res.json(expense);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject Expense
// @route   PUT /api/erp/expenses/:id/reject
exports.rejectExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, { 
      status: 'rejected',
      approvedBy: req.user._id 
    }, { new: true });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all expenses
// @route   GET /api/erp/expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find(req.query)
      .populate('submittedBy', 'name')
      .populate('budgetId', 'budgetId department')
      .sort('-expenseDate');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Monthly Expense Summary Chart
// @route   GET /api/erp/expenses/summary
exports.getExpenseSummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { status: 'approved' } },
      { $group: { 
        _id: '$category', 
        amount: { $sum: '$amount' }
      }}
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
