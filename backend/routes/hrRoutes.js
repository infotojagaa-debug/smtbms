const express = require('express');
const router = express.Router();
const { getDraftPayroll, upsertPayroll, bulkUpsertPayroll, getAllPayrolls, getMyPayrollHistory, updateBonus } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  createEmployee,
  getAllEmployees,
  getEmployeeStats,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  applyIncrement,
  uploadDocument,
  getSelfProfile,
  updateSelfProfile
} = require('../controllers/employeeController');

const { upload } = require('../config/cloudinary');

const {
  markCheckIn,
  markCheckOut,
  getAttendanceByEmployee,
  getMyMonthlyAttendance,
  getAttendanceByDate,
  getTodayAttendance,
  bulkMarkAttendance,
  deleteTodayAttendance,
  flagDoublePay,
  updateAttendance,
  sendLateWarning
} = require('../controllers/attendanceController');

const {
  applyLeave,
  getAllLeaves,
  getLeaveBalance,
  getMyLeaveBalance, // NEW
  updateLeaveStatus
} = require('../controllers/leaveController');

// Performance controller imports (removed duplicate payroll imports)
const {
  addReview,
  getReviewsByEmployee,
  getPerformanceSummary
} = require('../controllers/performanceController');

// --- Employees ---
router.post('/employees', protect, authorize('Admin', 'HR', 'admin', 'hr'), createEmployee);
router.get('/employees/profile/self', protect, getSelfProfile);
router.put('/employees/profile/self', protect, upload.single('photo'), updateSelfProfile);
router.get('/employees', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), getAllEmployees);
router.get('/employees/stats', protect, authorize('Admin', 'HR', 'admin', 'hr'), getEmployeeStats);
router.get('/employees/:id', protect, getEmployeeById);
router.put('/employees/:id', protect, authorize('Admin', 'HR', 'admin', 'hr'), updateEmployee);
router.patch('/employees/:id/increment', protect, authorize('Admin', 'HR', 'admin', 'hr'), applyIncrement);
router.delete('/employees/:id', protect, authorize('Admin', 'admin'), deleteEmployee);
router.post('/employees/:id/documents', protect, authorize('Admin', 'HR', 'admin', 'hr'), upload.single('file'), uploadDocument);

// --- Attendance ---
router.post('/attendance/checkin', protect, markCheckIn);
router.post('/attendance/checkout', protect, markCheckOut);
router.get('/attendance/today', protect, getTodayAttendance);
router.delete('/attendance/today', protect, deleteTodayAttendance);
router.get('/attendance/my/monthly', protect, getMyMonthlyAttendance);
router.get('/attendance/:employeeId', protect, getAttendanceByEmployee);
router.get('/attendance/date/:date', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), getAttendanceByDate);
router.post('/attendance/bulk', protect, authorize('Admin', 'HR', 'admin', 'hr'), bulkMarkAttendance);
router.patch('/attendance/:id/double-pay', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), flagDoublePay);
router.put('/attendance/:id', protect, authorize('Admin', 'HR', 'admin', 'hr'), updateAttendance);
router.post('/attendance/warning', protect, authorize('Admin', 'HR', 'admin', 'hr'), sendLateWarning);

// --- Leaves ---
router.post('/leaves', protect, applyLeave);
router.get('/leaves', protect, getAllLeaves);
router.get('/leaves/balance/my', protect, getMyLeaveBalance);
router.get('/leaves/balance/:id', protect, getLeaveBalance);
router.put('/leaves/:id/status', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), updateLeaveStatus);


// --- Performance ---
router.post('/performance', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), addReview);
router.get('/performance/:id', protect, getReviewsByEmployee);
router.get('/performance/summary', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), getPerformanceSummary);

// --- Payroll Routes ---
router.get('/payroll/my', protect, getMyPayrollHistory);
router.get('/payroll/draft/:employeeId', protect, getDraftPayroll);
router.patch('/payroll/draft/:employeeId/bonus', protect, authorize('Admin', 'HR', 'admin', 'hr'), updateBonus);
router.post('/payroll/bulk', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), bulkUpsertPayroll);
router.post('/payroll', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), upsertPayroll);
router.get('/payroll', protect, authorize('Admin', 'HR', 'Manager', 'admin', 'hr', 'manager'), getAllPayrolls);

module.exports = router;
