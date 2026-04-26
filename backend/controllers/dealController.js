const Deal = require('../models/Deal');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Material = require('../models/Material');
const { sendNotification } = require('../utils/notificationHelper');

// Helper: Auto-generate Deal ID
const generateDealId = async () => {
  const lastDeal = await Deal.findOne().sort({ createdAt: -1 });
  if (!lastDeal) return 'DEA001';
  const lastIdNum = parseInt(lastDeal.dealId.replace('DEA', ''));
  return `DEA${(lastIdNum + 1).toString().padStart(3, '0')}`;
};

// @desc    Create new deal
// @route   POST /api/crm/deals
exports.createDeal = async (req, res) => {
  try {
    const dealId = await generateDealId();
    const deal = await Deal.create({
      ...req.body,
      dealId,
      createdBy: req.user._id
    });

    // Notify Admin
    const io = req.app.get('io');
    await sendNotification({
      title: 'Sales Pipeline: New Deal',
      message: `Strategic deal "${deal.title}" initiated by ${req.user.name} (Value: ₹${deal.value.toLocaleString()})`,
      type: 'info',
      module: 'crm',
      role: 'Admin',
      link: `/admin/dashboard/crm/deals`
    }, io);

    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Deal Stage
// @route   PUT /api/crm/deals/:id/stage
exports.updateDealStage = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, { 
      stage: req.body.stage,
      probability: req.body.probability // updated manually from UI usually
    }, { new: true });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Close Deal (Won/Lost) + Update Customer Stats
// @route   PUT /api/crm/deals/:id/close
exports.closeDeal = async (req, res) => {
  try {
    const { status, lostReason } = req.body; // status: 'closed-won' or 'closed-lost'
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    deal.stage = status;
    deal.lostReason = lostReason;
    deal.actualCloseDate = new Date();
    await deal.save();

    // Update Customer Stats if Won
    if (status === 'closed-won') {
       await Customer.findByIdAndUpdate(deal.customerId, {
         $inc: { totalDeals: 1, totalRevenue: deal.value },
          $set: { isStrategicPartner: true, loyaltyLevel: 'Silver' }
       });
       
       // STOCK DEDUCTION LOGIC
       if (deal.products && deal.products.length > 0 && !deal.stockDeducted) {
         for (const product of deal.products) {
           if (product.materialId) {
             const material = await Material.findById(product.materialId);
             if (material) {
               // Deduct stock
               material.quantity = Math.max(0, material.quantity - (product.quantity || 0));
               await material.save();
               
               // Emit socket update for inventory UI
               const io = req.app.get('io');
               io.emit('inventory:update', { materialId: material._id, newQuantity: material.quantity });
             }
           }
         }
         deal.stockDeducted = true;
         await deal.save();
       }

       // Notify Admin & Manager
       const io = req.app.get('io');
       await sendNotification({
         title: 'Business Growth: Deal Won',
         message: `Partner status elevated: ${deal.title} closed for ₹${deal.value.toLocaleString()}`,
         type: 'success',
         module: 'crm',
         role: 'Admin',
         link: '/admin/dashboard/crm/deals'
       }, io);

       await sendNotification({
          title: 'Commission Alert',
          message: `Manager ${req.user.name} successfully closed a deal.`,
          type: 'info',
          module: 'crm',
          role: 'Manager'
       }, io);
    }

    res.json({ message: 'Deal finalized successfully', deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Deal (Full)
// @route   PUT /api/crm/deals/:id
exports.updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    // Update fields
    Object.assign(deal, req.body);

    // Trigger stock deduction if just became won OR if won and products changed
    if (deal.stage === 'closed-won' && !deal.stockDeducted) {
      if (deal.products && deal.products.length > 0) {
        for (const product of deal.products) {
          if (product.materialId) {
            const material = await Material.findById(product.materialId);
            if (material) {
              material.quantity = Math.max(0, material.quantity - (product.quantity || 0));
              await material.save();
              req.app.get('io').emit('inventory:update', { materialId: material._id, newQuantity: material.quantity });
            }
          }
        }
        deal.stockDeducted = true;
      }
    }

    await deal.save();
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Deal Statistics
// @route   GET /api/crm/deals/stats
exports.getDealStats = async (req, res) => {
  try {
    const pipelineValue = await Deal.aggregate([
      { $match: { stage: { $nin: ['closed-won', 'closed-lost'] } } },
      { $group: { _id: '$stage', total: { $sum: '$value' } } }
    ]);

    const winRate = await Deal.aggregate([
      { $facet: {
        total: [{ $match: { stage: { $in: ['closed-won', 'closed-lost'] } } }, { $count: 'count' }],
        won: [{ $match: { stage: 'closed-won' } }, { $count: 'count' }]
      }}
    ]);

    res.json({ pipelineValue, winRate: winRate[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all deals
// @route   GET /api/crm/deals
exports.getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find(req.query).populate('customerId', 'name company').sort('-createdAt');
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get deal by ID
// @route   GET /api/crm/deals/:id
exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('customerId', 'name company email phone')
      .populate('leadId', 'title source');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
