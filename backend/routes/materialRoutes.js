const express = require('express');
const router = express.Router();
const { 
  createMaterial, 
  updateStock, 
  getMaterialById,
  getAllMaterials,
  updateMaterial,
  deleteMaterial,
  transferMaterial,
  dispatchMaterial,
  getMovementHistory,
  sendLowStockAlert
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllMaterials)
  .post(protect, authorize('Admin', 'Manager'), createMaterial);

router.post('/transfer', protect, authorize('Admin', 'Manager'), transferMaterial);
router.post('/dispatch', protect, authorize('Admin', 'Manager'), dispatchMaterial);
router.post('/low-stock/alert', protect, authorize('Admin', 'Manager'), sendLowStockAlert);
router.get('/history/:id', protect, getMovementHistory);

router.route('/:id')
  .get(protect, getMaterialById)
  .put(protect, authorize('Admin', 'Manager'), updateMaterial)
  .delete(protect, authorize('Admin'), deleteMaterial);

router.route('/:id/stock')
  .patch(protect, authorize('Admin', 'Manager'), updateStock);

module.exports = router;
