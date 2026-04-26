const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Deal = require('../models/Deal');

// @desc    Get all leads
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate('assignedTo', 'name');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Convert Lead to Customer (Enhanced with Deal creation)
// @route   POST /api/leads/:id/convert
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // 1. Create Corporate Customer
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      leadSource: lead._id,
    });

    // 2. Auto-initialize Discovery Deal
    await Deal.create({
      title: `Initial engagement - ${lead.company || lead.name}`,
      customer: customer._id,
      value: 0,
      stage: 'Discovery',
      assignedTo: req.user._id,
    });

    // 3. Mark lead as Qualified
    lead.status = 'Qualified';
    await lead.save();

    res.status(201).json({ message: 'Lead converted successfully. Pipeline initialized.', customer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort('-createdAt');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
