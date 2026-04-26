const InventoryItem = require('../models/InventoryItem');
const Supplier = require('../models/Supplier');
const InventoryPO = require('../models/InventoryPO');
const StockLog = require('../models/StockLog');

/* =========================================
   INVENTORY ITEMS
   ========================================= */

exports.getItems = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort('-createdAt');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    Object.assign(item, req.body);
    await item.save(); // pre-save hook updates status
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted logistically' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   STOCK MOVEMENT LOGIC
   ========================================= */

exports.addStock = async (req, res) => {
  const { materialId, quantity, notes } = req.body;
  try {
    const item = await InventoryItem.findById(materialId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.stockQuantity += Number(quantity);
    await item.save();

    const log = await StockLog.create({
      materialId,
      type: 'IN',
      quantity: Number(quantity),
      afterStockQuantity: item.stockQuantity,
      notes,
      handledBy: req.user._id // Using existing auth token decoded ID
    });

    res.json({ message: 'Stock received', item, log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeStock = async (req, res) => {
  const { materialId, quantity, notes } = req.body;
  try {
    const item = await InventoryItem.findById(materialId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.stockQuantity < Number(quantity)) {
      return res.status(400).json({ message: 'Insufficient stock in ATUM database to fulfill removal request.' });
    }

    item.stockQuantity -= Number(quantity);
    await item.save();

    const log = await StockLog.create({
      materialId,
      type: 'OUT',
      quantity: Number(quantity),
      afterStockQuantity: item.stockQuantity,
      notes,
      handledBy: req.user._id
    });

    res.json({ message: 'Stock dispensed', item, log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStockHistory = async (req, res) => {
  try {
    const history = await StockLog.find()
      .populate('materialId', 'name category')
      .populate('handledBy', 'name email role')
      .sort('-createdAt')
      .limit(100); // Standard pagination cap
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================
   SUPPLIERS
   ========================================= */

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================================
   PURCHASE ORDERS
   ========================================= */

exports.getPurchaseOrders = async (req, res) => {
  try {
    const pos = await InventoryPO.find()
      .populate('materialId', 'name unit price')
      .populate('supplierId', 'name contact');
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const po = await InventoryPO.create(req.body);
    res.status(201).json(po);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
