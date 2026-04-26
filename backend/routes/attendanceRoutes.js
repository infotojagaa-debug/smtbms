const express = require('express');
const router = express.Router();
const { markCheckIn, markCheckOut, getAttendanceByEmployee, getTodayAttendance, toggleLOP } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/checkin', protect, markCheckIn);
router.post('/checkout', protect, markCheckOut);
router.get('/today', protect, getTodayAttendance);
router.get('/:employeeId', protect, getAttendanceByEmployee);
router.patch('/:id/lop', protect, toggleLOP);


module.exports = router;
