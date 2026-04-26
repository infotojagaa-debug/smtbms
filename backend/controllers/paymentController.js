const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// Helper: Auto-generate Payment Number (PAY-2024-001...)
const generatePaymentNumber = async () => {
  const year = new Date().getFullYear();
  const lastPay = await Payment.findOne({ paymentNumber: { $regex: `PAY-${year}` } }).sort({ createdAt: -1 });
  if (!lastPay) return `PAY-${year}-001`;
  const lastId = parseInt(lastPay.paymentNumber.split('-')[2]);
  return `PAY-${year}-${(lastId + 1).toString().padStart(3, '0')}`;
};

// @desc    Record a payment + Update invoice
// @route   POST /api/erp/payments
exports.recordPayment = async (req, res) => {
  const session = await Payment.startSession();
  session.startTransaction();
  try {
    const { invoiceId, amount } = req.body;
    const paymentNumber = await generatePaymentNumber();

    // 1. Create Payment Record
    const payment = await Payment.create([{
      ...req.body,
      paymentNumber,
      createdBy: req.user._id
    }], { session });

    // 2. Update Invoice Paid Amount & Status
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) throw new Error('Invoice not found');

    invoice.paidAmount += Number(amount);
    
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(payment[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/erp/payments
exports.getAllPayments = async (req, res) => {
  try {
    const { type, method, status } = req.query;
    const query = {};
    if (type) query.paymentType = type;
    if (method) query.paymentMethod = method;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .populate('vendorId', 'name')
      .populate('customerId', 'name')
      .sort('-createdAt');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Payment Summary (Incoming vs Outgoing)
// @route   GET /api/erp/payments/summary
exports.getPaymentSummary = async (req, res) => {
  try {
    const summary = await Payment.aggregate([
      { $group: { 
        _id: '$paymentType', 
        total: { $sum: '$amount' }
      }}
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get outstanding invoices
// @route   GET /api/erp/payments/outstanding
exports.getOutstanding = async (req, res) => {
  try {
    const invoices = await Invoice.find({ 
      status: { $in: ['sent', 'partial', 'overdue'] } 
    }).populate('vendorId', 'name').populate('customerId', 'name');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
