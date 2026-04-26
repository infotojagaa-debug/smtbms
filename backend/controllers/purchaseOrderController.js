const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const Material = require('../models/Material');
const GoodsReceipt = require('../models/GoodsReceipt');
const { sendNotification } = require('../utils/notificationHelper');

// Helper: Auto-generate PO Number (PO-2024-001...)
const generatePONumber = async () => {
  const year = new Date().getFullYear();
  const lastPO = await PurchaseOrder.findOne({ poNumber: { $regex: `PO-${year}` } }).sort({ createdAt: -1 });
  if (!lastPO) return `PO-${year}-001`;
  const lastId = parseInt(lastPO.poNumber.split('-')[2]);
  return `PO-${year}-${(lastId + 1).toString().padStart(3, '0')}`;
};

// @desc    Create new PO
// @route   POST /api/erp/po
exports.createPO = async (req, res) => {
  try {
    const poNumber = await generatePONumber();
    const po = await PurchaseOrder.create({
      ...req.body,
      poNumber,
      createdBy: req.user._id
    });

    // Notify Admins
    const io = req.app.get('io');
    await sendNotification({
      title: 'New Acquisition Sequence',
      message: `${req.user.name} generated ${poNumber} for ₹${po.totalAmount.toLocaleString()}`,
      type: 'info',
      module: 'erp',
      role: 'Admin',
      link: `/admin/dashboard/erp/orders/${po._id}`
    }, io);

    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve PO
// @route   PUT /api/erp/po/:id/approve
exports.approvePO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'PO not found' });

    po.status = 'sent';
    po.approvedBy = req.user._id;
    po.approvedOn = new Date();
    await po.save();

    // Logic for Email to Vendor would go here (Nodemailer)
    
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Receive Goods (GRN + Material Stock Update Sync)
// @route   POST /api/erp/po/:id/receive
exports.receivePO = async (req, res) => {
  try {
    const { items, remarks } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'PO not found' });

    // 1. Create GRN
    const grnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const grn = await GoodsReceipt.create({
      grnNumber,
      poId: po._id,
      vendorId: po.vendorId,
      items,
      remarks,
      receivedBy: req.user._id
    });

    // 2. Update Material Inventory (Cross-module sync)
    for (const item of items) {
      if (Number(item.receivedQty) > 0 && item.materialId) {
        await Material.findByIdAndUpdate(item.materialId, {
          $inc: { quantity: Number(item.receivedQty) }
        });
      }
    }

    // 3. Update PO Status
    po.status = 'received';
    po.actualDeliveryDate = new Date();
    await po.save();

    // Notify Admins & Managers
    const io = req.app.get('io');
    await sendNotification({
      title: 'Inventory Synchronized',
      message: `Goods received for ${po.poNumber}. Stock levels updated.`,
      type: 'success',
      module: 'erp',
      role: 'Admin',
      link: `/admin/dashboard/erp/orders/${po._id}`
    }, io);

    await sendNotification({
       title: 'GRN Logged',
       message: `Material receipt confirmed by ${req.user.name}`,
       type: 'info',
       module: 'material',
       role: 'Manager'
    }, io);

    res.status(201).json({ message: 'Goods received and stock updated', grn });
  } catch (error) {
    console.error('PO Receipt Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all POs
// @route   GET /api/erp/po
exports.getAllPOs = async (req, res) => {
  try {
    const { status, vendorId, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;
    if (search) query.poNumber = { $regex: search, $options: 'i' };

    const pos = await PurchaseOrder.find(query).populate('vendorId', 'name vendorId').sort('-createdAt');
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get PO Stats
// @route   GET /api/erp/po/stats
exports.getPOStats = async (req, res) => {
  try {
    const stats = await PurchaseOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get PO by ID
// @route   GET /api/erp/po/:id
exports.getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('vendorId', 'name email phone address')
      .populate('items.materialId', 'name code unit');
    if (!po) return res.status(404).json({ message: 'PO not found' });
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
