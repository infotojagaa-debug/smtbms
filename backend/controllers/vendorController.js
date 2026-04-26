const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const { sendNotification } = require('../utils/notificationHelper');

// Helper: Auto-generate Vendor ID (VEN001, VEN002...)
const generateVendorId = async () => {
  const lastVendor = await Vendor.findOne().sort({ createdAt: -1 });
  if (!lastVendor) return 'VEN001';
  const lastId = parseInt(lastVendor.vendorId.replace('VEN', ''));
  return `VEN${(lastId + 1).toString().padStart(3, '0')}`;
};

// @desc    Create new vendor
// @route   POST /api/erp/vendors
exports.createVendor = async (req, res) => {
  try {
    const vendorId = await generateVendorId();
    const vendor = await Vendor.create({
      ...req.body,
      vendorId,
      createdBy: req.user._id
    });

    // Notify Admins
    const io = req.app.get('io');
    await sendNotification({
      title: 'Partner Onboarded',
      message: `${req.user.name} established a new relationship with ${vendor.name}`,
      type: 'success',
      module: 'erp',
      role: 'Admin',
      link: `/admin/dashboard/erp/vendors/${vendor._id}`
    }, io);

    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all vendors with filters & pagination
// @route   GET /api/erp/vendors
exports.getAllVendors = async (req, res) => {
  try {
    const { category, status, rating, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (rating) query.rating = { $gte: Number(rating) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { vendorId: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await Vendor.countDocuments(query);

    res.json({
      vendors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalVendors: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single vendor with order history
// @route   GET /api/erp/vendors/:id
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const orders = await PurchaseOrder.find({ vendorId: vendor._id }).sort('-createdAt').limit(10);
    res.json({ vendor, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vendor
// @route   PUT /api/erp/vendors/:id
exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Notify Admins
    const io = req.app.get('io');
    await sendNotification({
      title: 'Partner Record Modified',
      message: `Strategic data for ${vendor.name} has been updated by ${req.user.name}`,
      type: 'warning',
      module: 'erp',
      role: 'Admin'
    }, io);

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate vendor
// @route   PUT /api/erp/vendors/:id/rate
exports.rateVendor = async (req, res) => {
  try {
    const { rating } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { rating }, { new: true });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Vendor Stats
// @route   GET /api/erp/vendors/stats
exports.getVendorStats = async (req, res) => {
  try {
    const total = await Vendor.countDocuments();
    const active = await Vendor.countDocuments({ status: 'active' });
    const categoryWise = await Vendor.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ total, active, categoryWise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
