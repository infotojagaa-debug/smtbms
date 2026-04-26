const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Communication = require('../models/Communication');
const Ticket = require('../models/Ticket');

// Helper: Auto-generate Customer ID (CUS001, CUS002...)
const generateCustomerId = async () => {
  const lastCustomer = await Customer.findOne().sort({ createdAt: -1 });
  if (!lastCustomer) return 'CUS001';
  const lastIdNum = parseInt(lastCustomer.customerId.replace('CUS', ''));
  return `CUS${(lastIdNum + 1).toString().padStart(3, '0')}`;
};

// @desc    Create new customer
// @route   POST /api/crm/customers
exports.createCustomer = async (req, res) => {
  try {
    const customerId = await generateCustomerId();
    const customer = await Customer.create({
      ...req.body,
      customerId,
      createdBy: req.user._id
    });
    // Send welcome email logic here
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all customers with filters & pagination
// @route   GET /api/crm/customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { industry, status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (industry) query.industry = industry;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single customer profile + summarized timeline
// @route   GET /api/crm/customers/:id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('assignedTo', 'name email');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const leads = await Lead.find({ customerId: customer._id }).limit(5);
    const deals = await Deal.find({ customerId: customer._id }).limit(5);
    const communications = await Communication.find({ customerId: customer._id }).sort('-createdAt').limit(5);
    const tickets = await Ticket.find({ customerId: customer._id }).limit(5);

    res.json({ customer, leads, deals, communications, tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get full chronological timeline for a customer
// @route   GET /api/crm/customers/:id/timeline
exports.getCustomerTimeline = async (req, res) => {
  try {
    const custId = req.params.id;
    const communications = await Communication.find({ customerId: custId }).sort('-createdAt');
    const deals = await Deal.find({ customerId: custId }).sort('-createdAt');
    const leads = await Lead.find({ customerId: custId }).sort('-createdAt');

    // Combine and sort (simplified logic)
    const timeline = [...communications, ...deals, ...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update customer
// @route   PUT /api/crm/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Customer Stats
// @route   GET /api/crm/customers/stats
exports.getCustomerStats = async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    const industryWise = await Customer.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } }
    ]);
    const sourceWise = await Customer.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    res.json({ total, industryWise, sourceWise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
