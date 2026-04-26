const PurchaseOrder = require('../models/PurchaseOrder');
const Material = require('../models/Material');
const Invoice = require('../models/Invoice');

// @desc    Get all purchase orders
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('vendor', 'name company')
      .populate('items.material', 'name code unit');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new purchase order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order status (Includes Stock Sync logic)
// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Logical Lock: Only sync once when transitioning to 'Received'
    if (status === 'Received' && order.status !== 'Received') {
      // 1. Update Material Stocks
      for (const item of order.items) {
        await Material.findByIdAndUpdate(item.material, {
          $inc: { quantity: item.quantity }
        });
      }

      // 2. Auto-generate Invoice for finance
      await Invoice.create({
        invoiceNumber: `INV-PO-${order.poNumber}`,
        purchaseOrder: order._id,
        vendor: order.vendor,
        amount: order.totalAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day Net
        status: 'Unpaid',
      });
    }

    order.status = status;
    await order.save();

    res.json({ message: `Order status updated to ${status}. Inventory synchronized.`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
