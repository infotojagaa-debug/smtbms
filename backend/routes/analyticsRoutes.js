const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    getAdminDashboard, 
    getHRDashboard, 
    getSalesDashboard, 
    getEmployeeDashboard, 
    globalSearch 
} = require('../controllers/analyticsController');

router.get('/admin', protect, getAdminDashboard);
router.get('/hr', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), getHRDashboard);
router.get('/sales', protect, authorize('Admin', 'Sales', 'Sales Team', 'Manager', 'admin', 'sales', 'manager'), getSalesDashboard);
router.get('/employee', protect, getEmployeeDashboard);
router.get('/search', protect, globalSearch);

module.exports = router;
