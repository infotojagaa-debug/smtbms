const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');

// Helper: Auto-generate Invoice Number (INV-2024-001...)
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const lastInv = await Invoice.findOne({ invoiceNumber: { $regex: `INV-${year}` } }).sort({ createdAt: -1 });
  if (!lastInv) return `INV-${year}-001`;
  const lastId = parseInt(lastInv.invoiceNumber.split('-')[2]);
  return `INV-${year}-${(lastId + 1).toString().padStart(3, '0')}`;
};

// @desc    Create new invoice (Manual or from PO)
// @route   POST /api/erp/invoices
exports.createInvoice = async (req, res) => {
  try {
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await Invoice.create({
      ...req.body,
      invoiceNumber,
      createdBy: req.user._id
    });

    // If linked to PO, maybe update PO status or log
    if (req.body.poId) {
       // Logic to link or verify
    }

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invoices
// @route   GET /api/erp/invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const query = {};
    if (type) query.invoiceType = type;
    if (status) query.status = status;
    if (search) query.invoiceNumber = { $regex: search, $options: 'i' };

    const invoices = await Invoice.find(query)
      .populate('vendorId', 'name vendorId')
      .populate('customerId', 'name')
      .sort('-createdAt');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice detail
// @route   GET /api/erp/invoices/:id
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendorId')
      .populate('customerId')
      .populate('poId');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Invoice Stats
// @route   GET /api/erp/invoices/stats
exports.getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      { $group: { 
        _id: '$status', 
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 } 
      }}
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update status to sent
// @route   POST /api/erp/invoices/:id/send
exports.sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'sent' }, { new: true });
    // Email logic here
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
