const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../../middleware/authMiddleware'); 
const {
  getDashboardKPIs,
  getMainAnalyticsData,
  getDistributionCharts,
  getTableData
} = require('../controllers/adminStatsController');

router.use(protect);
router.use(authorize('Admin'));

router.get('/kpi-stats', getDashboardKPIs);
router.get('/analytics-charts', getMainAnalyticsData);
router.get('/distribution-pies', getDistributionCharts);
router.get('/data-tables', getTableData);

module.exports = router;
