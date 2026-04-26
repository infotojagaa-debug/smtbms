const Material = require('../models/Material');
const MaterialUsage = require('../models/MaterialUsage');
const MaterialRequest = require('../models/MaterialRequest');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const { notifyRole } = require('./notificationController');

// @desc    Employee uses material
// @route   POST /api/materials/activity/usage
// @access  Private (Employee)
exports.useMaterial = async (req, res) => {
  const { materialId, quantityUsed, purpose } = req.body;

  try {
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    if (quantityUsed > material.quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock! Attempted to use ${quantityUsed}, but only ${material.quantity} available. Please submit a Material Request instead.` 
      });
    }

    // Deduct stock securely
    material.quantity -= quantityUsed;
    await material.save();

    // Log the usage
    const usage = await MaterialUsage.create({
      materialId,
      employeeId: req.user._id,
      quantityUsed,
      purpose
    });

    // Notify system of stock adjustment
    req.app.get('io').emit('inventory:update', { materialId, newQuantity: material.quantity });
    req.app.get('io').emit('usage:new', usage);

    // Notify managers via the Notification panel
    await notifyRole(['Manager', 'Admin'], {
      title: 'Material Consumed',
      message: `${req.user.name || 'An Employee'} has utilized ${quantityUsed}x ${material.name} for direct consumption (Purpose: ${purpose}).`,
      type: 'info',
      module: 'material',
      priority: 'medium',
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Material successfully consumed', usage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Employee requests material
// @route   POST /api/materials/activity/request
// @access  Private (Employee)
exports.requestMaterial = async (req, res) => {
  const { materialId, quantityRequested, reason, requestType, customerId, clientName } = req.body;

  try {
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    const request = await MaterialRequest.create({
      materialId,
      employeeId: req.user._id,
      quantityRequested,
      reason,
      requestType: requestType || 'internal',
      customerId: requestType === 'external' ? (customerId || null) : null,
      clientName: requestType === 'external' ? (clientName || null) : null,
    });

    // Notify of new request
    req.app.get('io').emit('request:new', request);

    // Notify managers via the Notification panel
    await notifyRole(['Manager', 'Admin'], {
      title: 'Material Request Pending',
      message: `${req.user.name || 'An Employee'} is requesting ${quantityRequested}x ${material.name} (Reason: ${reason}).`,
      type: 'warning',
      module: 'material',
      priority: 'high',
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Material request submitted to management successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all material requests for Manager oversight
// @route   GET /api/materials/activity/requests
// @access  Private (Manager/Admin)
exports.getRequests = async (req, res) => {
  try {
    const filter = req.user.role === 'Employee' ? { employeeId: req.user._id } : {};
    // Filter by type if query param is provided
    if (req.query.type) filter.requestType = req.query.type;
    
    const requests = await MaterialRequest.find(filter)
      .populate('materialId', 'name quantity code')
      .populate('employeeId', 'name email role')
      .populate('customerId', 'name company phone email')
      .sort('-createdAt');
      
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manager approves or rejects an employee material requisition
// @route   PUT /api/materials/activity/request/:id/review
// @access  Private (Manager)
exports.reviewRequest = async (req, res) => {
  const { status, reviewNotes } = req.body; // status: 'Approved' or 'Rejected'

  try {
    const request = await MaterialRequest.findById(req.params.id).populate('materialId');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewNotes = reviewNotes;

    // If approved, verify stock mathematics to see if we can resolve it directly vs triggering a PO
    let purchaseTriggered = false;
    let newPoId = null;

    if (status === 'Approved') {
      if (request.materialId.quantity >= request.quantityRequested) {
        // Stock is sufficient! Deduct and allow immediately
        request.materialId.quantity -= request.quantityRequested;
        await request.materialId.save();
        
        // Emulate the usage automatically since they requested it and got approved
        await MaterialUsage.create({
          materialId: request.materialId._id,
          employeeId: request.employeeId,
          quantityUsed: request.quantityRequested,
          purpose: 'Fulfilled via Management Approval: ' + request.reason
        });
      } else {
        // Stock insufficient. Formulate an automated Purchase Order!
        purchaseTriggered = true;
        
        // Find default vendor to assign
        let defaultVendor = await Vendor.findOne();
        let vendorId = defaultVendor ? defaultVendor._id : null;

        // If no vendors exist in the system, we need to create a dummy one or fail gracefully. For now, create dummy if null.
        if (!vendorId) {
           const dummyVendor = await Vendor.create({ name: 'Default System Supplier', email: 'req@supplier.com', phone: '000' });
           vendorId = dummyVendor._id;
        }

        const po = await PurchaseOrder.create({
          poNumber: `PO-AUTO-${Date.now()}`,
          vendorId: vendorId,
          items: [{
            materialId: request.materialId._id,
            itemName: request.materialId.name,
            description: request.reason,
            quantity: request.quantityRequested,
            unit: request.materialId.unit || 'unit',
            unitPrice: 0, // Needs manual configuring by procurement later
            totalPrice: 0
          }],
          subtotal: 0,
          totalAmount: 0,
          status: 'draft',
          notes: `Automated Requisition from Employee Request #${request._id}`,
          createdBy: req.user._id
        });
        
        newPoId = po._id;
      }
    }

    await request.save();

    res.json({ 
      message: `Request ${status} successfully.`, 
      purchaseTriggered, 
      poId: newPoId,
      request 
    });

    // Notify of status change
    req.app.get('io').emit('inventory:request_status', { id: request._id, status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark an approved request as Delivered (client physically received material)
// @route   PUT /api/materials/activity/request/:id/deliver
// @access  Private (Manager/Admin)
exports.markDelivered = async (req, res) => {
  const { deliveryNote } = req.body;
  try {
    const request = await MaterialRequest.findById(req.params.id)
      .populate('materialId', 'name')
      .populate('employeeId', 'name');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'Approved') {
      return res.status(400).json({ 
        message: `Only Approved requests can be marked Delivered. Current: ${request.status}` 
      });
    }

    request.status = 'Delivered';
    request.deliveredAt = new Date();
    request.deliveryNote = deliveryNote || 'Delivered to client';
    await request.save();

    req.app.get('io').emit('inventory:delivered', { id: request._id });

    await notifyRole(['Manager', 'Admin'], {
      title: 'Material Delivered to Client',
      message: `${request.materialId?.name} delivered successfully. Confirmed by ${req.user.name}.`,
      type: 'success',
      module: 'material',
      priority: 'medium',
      createdBy: req.user._id
    });

    res.json({ message: 'Marked as Delivered successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent usage history for the live log
// @route   GET /api/material-activity/usage
exports.getRecentUsage = async (req, res) => {
  try {
    const filter = req.user.role === 'Employee' ? { employeeId: req.user._id } : {};
    const usage = await MaterialUsage.find(filter)
      .populate('materialId', 'name code quantity')
      .populate('employeeId', 'name email role')
      .sort('-createdAt');
    res.json(usage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stats for the current employee dashboard
// @route   GET /api/material-activity/stats
exports.getEmployeeStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [consumptionToday, pendingRequests, materialsCount] = await Promise.all([
      MaterialUsage.aggregate([
        { $match: { employeeId: req.user._id, createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$quantityUsed' } } }
      ]),
      MaterialRequest.countDocuments({ 
        employeeId: req.user._id, 
        status: 'Pending' 
      }),
      Material.countDocuments({ isActive: true })
    ]);

    res.json({
      todayConsumption: consumptionToday[0]?.total || 0,
      pendingRequests,
      availableMaterials: materialsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get global material stats for Admin Dashboard
// @route   GET /api/material-activity/admin-stats
// @access  Private (Admin)
exports.getAdminGlobalStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [consumptionTotal, totalStock, pendingReqs] = await Promise.all([
      MaterialUsage.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$quantityUsed' } } }
      ]),
      Material.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]),
      MaterialRequest.countDocuments({ status: 'Pending' })
    ]);

    res.json({
      totalAvailableStock: totalStock[0]?.total || 0,
      todayGlobalConsumption: consumptionTotal[0]?.total || 0,
      totalPendingRequests: pendingReqs,
      systemStatus: 'Online'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
