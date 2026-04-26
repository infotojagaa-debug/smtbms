const express = require('express');
const router = express.Router();
const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  addStock,
  removeStock,
  getStockHistory,
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder
} = require('../controllers/inventoryController');
const { protect } = require('../../../middleware/authMiddleware'); // Linking into existing Auth cleanly

// All routes require authentication
router.use(protect);

// Inventory Items
router.route('/items')
  .get(getItems)
  .post(createItem);

router.route('/items/:id')
  .put(updateItem)
  .delete(deleteItem);

// Stock Movements
router.post('/stock/in', addStock);
router.post('/stock/out', removeStock);
router.get('/stock/history', getStockHistory);

// Suppliers
router.route('/suppliers')
  .get(getSuppliers)
  .post(createSupplier);

// Purchase Orders
router.route('/purchase-orders')
  .get(getPurchaseOrders)
  .post(createPurchaseOrder);

module.exports = router;
