const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const { sendNotification } = require('../utils/notificationHelper');

// Helper: Auto-generate Lead ID (LED001, LED002...)
const generateLeadId = async () => {
  const lastLead = await Lead.findOne().sort({ createdAt: -1 });
  if (!lastLead) return 'LED001';
  const lastIdNum = parseInt(lastLead.leadId.replace('LED', ''));
  return `LED${(lastIdNum + 1).toString().padStart(3, '0')}`;
};

// @desc    Create new lead
// @route   POST /api/crm/leads
exports.createLead = async (req, res) => {
  try {
    const leadId = await generateLeadId();
    const lead = await Lead.create({
      ...req.body,
      leadId,
      createdBy: req.user._id
    });

    // Auto-create follow-up activity
    await Activity.create({
      activityId: `ACT-LED-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'follow-up',
      title: `Initial Follow-up: ${lead.title}`,
      leadId: lead._id,
      customerId: lead.customerId,
      assignedTo: lead.assignedTo || req.user._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      createdBy: req.user._id
    });

    // Notify Admin & Sales Manager of New Lead
    const io = req.app.get('io');
    await sendNotification({
      title: 'CRM: New Lead Detected',
      message: `Strategic Lead Provisioned: ${lead.title} (${lead.source}).`,
      type: 'info',
      module: 'crm',
      role: 'Admin',
      link: '/admin/dashboard/crm/leads'
    }, io);

    await sendNotification({
       title: 'Lead Assigned',
       message: `You have a new lead: ${lead.title}`,
       type: 'info',
       module: 'crm',
       userId: lead.assignedTo || req.user._id
    }, io);

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Lead Pipeline (Kanban Data)
// @route   GET /api/crm/leads/pipeline
exports.getLeadPipeline = async (req, res) => {
  try {
    const leads = await Lead.find().populate('customerId', 'name company');
    const stages = ['new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won', 'lost', 'on-hold'];
    
    const pipeline = {};
    stages.forEach(stage => {
      pipeline[stage] = {
        leads: leads.filter(l => l.status === stage),
        count: leads.filter(l => l.status === stage).length,
        totalValue: leads.filter(l => l.status === stage).reduce((acc, curr) => acc + (curr.value || 0), 0)
      };
    });

    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Convert Won Lead to Deal
// @route   POST /api/crm/leads/:id/convert
exports.convertLead = async (req, res) => {
  const session = await Lead.startSession();
  session.startTransaction();
  try {
    const lead = await Lead.findById(req.params.id).session(session);
    if (!lead) throw new Error('Lead not found');
    if (lead.status !== 'won') throw new Error('Lead must be marked as WON before conversion');

    // 1. Create Deal
    const dealId = `DEA-${Math.floor(1000 + Math.random() * 9000)}`;
    const deal = await Deal.create([{
      dealId,
      title: lead.title,
      customerId: lead.customerId,
      leadId: lead._id,
      value: lead.value,
      assignedTo: lead.assignedTo,
      createdBy: req.user._id
    }], { session });

    // 2. Update Lead Status (if not already won, though checked above)
    lead.status = 'won';
    await lead.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Notify Admin of Deal Closure (Success Alert)
    const io = req.app.get('io');
    await sendNotification({
      title: 'Revenue: Deal Closed',
      message: `Contract Authorized: ${lead.title} worth ₹${lead.value.toLocaleString()}.`,
      type: 'success',
      module: 'crm',
      role: 'Admin',
      link: '/admin/dashboard/crm/deals'
    }, io);

    res.json({ message: 'Lead converted to deal successfully', deal: deal[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leads
// @route   GET /api/crm/leads
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find(req.query).populate('customerId', 'name company').sort('-createdAt');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Lead Status
// @route   PUT /api/crm/leads/:id/status
exports.updateLeadStatus = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const oldStatus = lead.status;
    lead.status = req.body.status;
    await lead.save();

    // Workflow Automation: If Lead is won, trigger conversion to Deal
    if (req.body.status === 'won' && oldStatus !== 'won') {
      // We call the conversion logic here
      const dealId = `DEA-${Math.floor(1000 + Math.random() * 9000)}`;
      await Deal.create({
        dealId,
        title: lead.title,
        customerId: lead.customerId,
        leadId: lead._id,
        value: lead.value,
        assignedTo: lead.assignedTo || req.user._id,
        createdBy: req.user._id,
        stage: 'discovery' // Initial Deal Stage
      });

      // Notify of Auto-Conversion
      const { notifyRole } = require('../controllers/notificationController');
      await notifyRole(['Admin', 'Sales Team'], {
        title: 'CRM Workflow: Deal Provisioned',
        message: `Lead "${lead.title}" successfully converted to Strategic Deal.`,
        type: 'success',
        priority: 'high',
        module: 'crm',
        link: '/crm/deals'
      });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Lead Stats
// @route   GET /api/crm/leads/stats
exports.getLeadStats = async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const stats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ total, breakdown: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/crm/leads/:id
exports.getLeadById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Invalid Lead Identifier' });
    }
    
    const lead = await Lead.findById(req.params.id).populate('customerId', 'name company email phone');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
