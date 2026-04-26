const CustomerOrder = require('../models/CustomerOrder');
const Customer = require('../models/Customer');
const Ticket = require('../models/Ticket');

// @desc    Get Customer Dashboard Data
// @route   GET /api/customer/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

    const totalOrders = await CustomerOrder.countDocuments({ customerId: customer._id });
    const activeOrders = await CustomerOrder.countDocuments({ 
      customerId: customer._id, 
      status: { $nin: ['Delivered', 'Cancelled'] } 
    });
    const openTickets = await Ticket.countDocuments({ 
      assignedTo: customer.userId, // Assuming tickets can link here, or createdBy
      status: 'open' 
    });

    const recentOrders = await CustomerOrder.find({ customerId: customer._id })
      .sort('-createdAt')
      .limit(3)
      .populate('items.materialId', 'name location');

    res.json({
      totalOrders,
      activeOrders,
      openTickets,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for the logged-in customer
// @route   GET /api/customer/orders
exports.getOrders = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    const orders = await CustomerOrder.find({ customerId: customer._id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific order tracking details
// @route   GET /api/customer/orders/:id/track
exports.trackOrder = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id)
       .populate('items.materialId', 'name barcodeImage qrCode code');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
