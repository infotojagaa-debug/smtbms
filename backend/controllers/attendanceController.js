const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { Leave } = require('../models/Leave');
const SystemSettings = require('../models/SystemSettings');
const { notifyRole } = require('./notificationController');

// @desc    Mark Check-In (Late detection > 9 AM)
// @route   POST /api/hr/attendance/checkin
exports.markCheckIn = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let employee = await Employee.findOne({ userId: req.user._id });
    
    // Auto-create profile if missing (Self-healing logic for dev/testing)
    if (!employee) {
      console.log(`Auto-provisioning employee profile for user: ${req.user.name}`);
      employee = await Employee.create({
        userId: req.user._id,
        employeeId: `EMP-${Date.now()}`,
        name: req.user.name,
        email: req.user.email,
        phone: '0000000000',
        department: 'Operations',
        designation: req.user.role === 'Admin' ? 'System Administrator' : 'Staff Engineer',
        joiningDate: new Date(),
        salary: { basic: 30000, allowances: 5000, deductions: 0 },
        status: 'Active'
      });
    }

    // Check if already checked in today (strict date match)
    const existing = await Attendance.findOne({ employeeId: employee._id, date: today });
    if (existing) return res.status(400).json({ message: 'Already checked in for today' });

    let status = 'Present';

    // Late detection (If after 9:05 AM - adding 5 mins grace)
    const nineAM = new Date();
    nineAM.setHours(9, 5, 0, 0);
    if (now > nineAM) status = 'Late';

    const attendance = await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkIn: now,
      status,
      markedBy: req.user._id
    });

    // Notify Management (HR, Admin) if Late (Using Grouped Logic)
    if (status === 'Late') {
      const { notifyGrouped } = require('./notificationController');
      const todayStr = today.toISOString().split('T')[0];
      
      // Get all late users for today for the message
      const lateCount = await Attendance.countDocuments({ date: today, status: 'Late' });

      await notifyGrouped({
        groupId: `late_attendance_${todayStr}`,
        title: 'Attendance Exception: Late Entry',
        message: `${lateCount} personnel have checked in late today. Latest: ${employee.name}`,
        type: 'warning',
        priority: 'medium',
        module: 'hrms',
        link: '/hr/attendance',
        role: 'Admin', // Also handle HR via another call or array if supported by notifyGrouped
        metadata: { count: lateCount, lastUser: employee.name }
      });

      await notifyGrouped({
        groupId: `late_attendance_hr_${todayStr}`,
        title: 'Attendance Exception: Late Entry',
        message: `${lateCount} personnel have checked in late today. Latest: ${employee.name}`,
        type: 'warning',
        priority: 'medium',
        module: 'hrms',
        link: '/hr/attendance',
        role: 'HR',
        metadata: { count: lateCount, lastUser: employee.name }
      });
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark Check-Out (Auto calculate hours & overtime)
// @route   POST /api/hr/attendance/checkout
exports.markCheckOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const attendance = await Attendance.findOne({ employeeId: employee._id, date: today });

    if (!attendance) return res.status(400).json({ message: 'No check-in record found for today' });
    if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out for today' });

    attendance.checkOut = new Date();
    
    // Logic for working hours & overtime
    const diff = attendance.checkOut - attendance.checkIn;
    const hours = (diff / (1000 * 60 * 60)).toFixed(2);
    attendance.workingHours = parseFloat(hours);

    if (attendance.workingHours > 8) {
      attendance.overtime = parseFloat((attendance.workingHours - 8).toFixed(2));
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Today's Attendance for User
// @route   GET /api/hr/attendance/today
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const attendance = await Attendance.findOne({ employeeId: employee._id, date: today });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly attendance for one employee
// @route   GET /api/hr/attendance/:employeeId
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const currentMonth = parseInt(month) || now.getMonth() + 1;
    const currentYear = parseInt(year) || now.getFullYear();

    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const startDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    const totalDaysInMonth = endDate.getDate();

    const history = await Attendance.find({
      employeeId: req.params.employeeId,
      date: { $gte: startDate, $lte: endDate }
    }).sort('date');

    const toISODate = (d) => new Date(d).toISOString().split('T')[0];
    const joiningDateStr = toISODate(employee.joiningDate);
    let daysPassed = totalDaysInMonth;
    if (currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear()) {
      daysPassed = now.getDate();
    }

    let daysPresent = 0;
    let daysLate = 0;
    let daysAbsent = 0;

    for (let d = 1; d <= daysPassed; d++) {
      const loopDate = new Date(currentYear, currentMonth - 1, d, 12, 0, 0); // midday for TZ safety
      const loopDateStr = toISODate(loopDate);
      
      if (loopDateStr < joiningDateStr) continue;

      const dayOfWeek = loopDate.getDay();
      const isSunday = (dayOfWeek === 0);
      const att = history.find(a => toISODate(a.date) === loopDateStr);

      if (att) {
        if (['Present', 'Late', 'Half-day'].includes(att.status)) {
          daysPresent += (att.status === 'Half-day' ? 0.5 : 1);
          if (att.status === 'Half-day') daysAbsent += 0.5;
        }
        if (att.status === 'Late') daysLate++;
        if (att.status === 'Absent') daysAbsent++;
      } else if (!isSunday) {
        daysAbsent++;
      }
    }

    const settings = await SystemSettings.getSettings();
    const holidays = settings.holidays || [];
    
    // Month Leaves (Approved only or Pending for visualization)
    const monthLeaves = await Leave.find({
      employeeId: employee._id,
      status: { $in: ['Approved', 'Pending'] },
      $or: [
        { fromDate: { $gte: startDate, $lte: endDate } },
        { toDate: { $gte: startDate, $lte: endDate } },
        { fromDate: { $lt: startDate }, toDate: { $gt: endDate } }
      ]
    });

    res.json({
      history,
      holidays,
      monthLeaves,
      joiningDate: employee.joiningDate,
      statistics: {
        totalDaysInMonth,
        daysPresent,
        daysAbsent,
        daysLate,
        month: currentMonth,
        year: currentYear
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly attendance for current employee
// @route   GET /api/hr/attendance/my/monthly
exports.getMyMonthlyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const now = new Date();
    const currentMonth = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
    const currentYear = req.query.year ? parseInt(req.query.year) : now.getFullYear();

    // Use midday for boundary calculation to prevent timezone shifts during ISO string conversion
    const startDate = new Date(currentYear, currentMonth - 1, 1, 12, 0, 0);
    const endDate = new Date(currentYear, currentMonth, 0, 12, 0, 0);
    const totalDaysInMonth = endDate.getDate();

    const history = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: new Date(currentYear, currentMonth - 1, 1), $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59) }
    }).sort('date');


    const toISODate = (d) => {
      if (!d) return null;
      try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (e) { return null; }
    };
    const joiningDateStr = toISODate(employee.joiningDate) || toISODate(employee.createdAt) || '1970-01-01';
    const daysPassed = now.getDate();


    const settings = await SystemSettings.getSettings();
    const holidays = settings.holidays || [];
    
    // Month Leaves (Approved only or Pending for visualization)
    const monthLeaves = await Leave.find({
      employeeId: employee._id,
      status: { $in: ['Approved', 'Pending'] },
      $or: [
        { fromDate: { $gte: startDate, $lte: endDate } },
        { toDate: { $gte: startDate, $lte: endDate } },
        { fromDate: { $lt: startDate }, toDate: { $gt: endDate } }
      ]
    });

    let daysPresent = 0;
    let daysLate = 0;
    let daysAbsent = 0;
    let approvedLeaveDays = 0;
    let daysOnLeave = 0;
    let pendingLeaveDays = 0;

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const loopDate = new Date(currentYear, currentMonth - 1, d, 12, 0, 0); // midday for TZ safety
      const loopDateStr = toISODate(loopDate);
      
      if (loopDateStr < joiningDateStr) continue;

      const dayOfWeek = loopDate.getDay();
      const isSunday = (dayOfWeek === 0);
      const isHoliday = holidays.some(h => toISODate(h.date) === loopDateStr);
      
      const leave = monthLeaves.find(l => {
         const s = toISODate(l.fromDate);
         const e = toISODate(l.toDate);
         return loopDateStr >= s && loopDateStr <= e;
      });

      if (leave) {
        if (leave.status === 'Approved') {
          approvedLeaveDays++;
          daysOnLeave++;
        } else if (leave.status === 'Pending') {
          pendingLeaveDays++;
        }
        continue;
      }

      if (d <= daysPassed) {
        const att = history.find(a => toISODate(a.date) === loopDateStr);
        if (att) {
          if (['Present', 'Late', 'Half-day'].includes(att.status)) {
            daysPresent += (att.status === 'Half-day' ? 0.5 : 1);
            if (att.status === 'Half-day') daysAbsent += 0.5;
          }
          if (att.status === 'Late') daysLate++;
          if (att.status === 'Absent') daysAbsent++;
        } else if (d < daysPassed && !isSunday && !isHoliday) {
          // Only count as absent if it's a PAST working day with no attendance and no leave
          daysAbsent++;
        }
      }
    }



    res.json({
      history,
      holidays,
      monthLeaves,
      joiningDate: employee.joiningDate,
      statistics: {
        totalDaysInMonth,
        daysPresent,
        daysAbsent,
        daysLate,
        month: currentMonth,
        year: currentYear
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance for a specific date (Including Absent users)
// @route   GET /api/hr/attendance/date/:date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const dateStr = req.params.date;
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    // Aggregate starting from Employee to ensure all registered personnel are listed
    const records = await Employee.aggregate([
      // 1. Join with User to get role and verify exclusion of Admin if needed
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      
      // 2. Filter out Admin role (as per typical HR module security)
      { $match: { 'userData.role': { $ne: 'Admin' } } },

      // 3. Join with Attendance for the specific date
      {
        $lookup: {
          from: 'attendances',
          let: { empId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$employeeId', '$$empId'] },
                    { $gte: ['$date', startOfDay] },
                    { $lte: ['$date', endOfDay] }
                  ]
                }
              }
            }
          ],
          as: 'attendanceData'
        }
      },
      
      // 4. Transform and default values
      {
        $project: {
          _id: { $ifNull: [{ $arrayElemAt: ['$attendanceData._id', 0] }, '$_id'] }, // Use attendance ID if exists, else emp ID
          employeeId: {
            _id: '$_id',
            name: '$name',
            employeeId: '$employeeId',
            department: '$department',
            userId: {
               _id: '$userData._id',
               role: '$userData.role'
            }
          },
          checkIn: { $arrayElemAt: ['$attendanceData.checkIn', 0] },
          checkOut: { $arrayElemAt: ['$attendanceData.checkOut', 0] },
          status: { $ifNull: [{ $arrayElemAt: ['$attendanceData.status', 0] }, 'Absent'] },
          isAbsent: { $cond: [{ $eq: [{ $size: '$attendanceData' }, 0] }, true, false] }
        }
      },
      { $sort: { 'employeeId.name': 1 } }
    ]);

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk mark attendance (HR)
// @route   POST /api/hr/attendance/bulk
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { employees, status, date } = req.body;
    const markDate = new Date(date);
    markDate.setHours(0, 0, 0, 0);

    const bulkData = employees.map(empId => ({
      employeeId: empId,
      date: markDate,
      status,
      checkIn: markDate, // Placeholder
      markedBy: req.user._id
    }));

    await Attendance.insertMany(bulkData);
    res.json({ message: 'Bulk attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete today's attendance record (for testing / re-punch)
// @route   DELETE /api/hr/attendance/today
exports.deleteTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const result = await Attendance.deleteMany({ employeeId: employee._id, date: today });

    res.json({
      message: `Deleted ${result.deletedCount} attendance record(s) for today`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Flag an attendance record as a Double Pay Day 
// @route   PATCH /api/hr/attendance/:id/double-pay
exports.flagDoublePay = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
    
    attendance.isDoublePay = req.body.isDoublePay !== undefined ? req.body.isDoublePay : true;
    await attendance.save();
    
    res.json({ message: `Double Pay marked: ${attendance.isDoublePay}`, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Toggle LOP (Loss of Pay) status for a record
// @route   PATCH /api/hr/attendance/:id/lop
exports.toggleLOP = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

    attendance.isLOP = !attendance.isLOP;
    await attendance.save();

    res.json({ message: `LOP status switched to ${attendance.isLOP}`, record: attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update single attendance record (HR Override / Upsert)
// @route   PUT /api/hr/attendance/:id
exports.updateAttendance = async (req, res) => {
  try {
    const { status, remarks, date, employeeId } = req.body;
    
    // Try to find and update first
    let attendance = await Attendance.findByIdAndUpdate(
      req.params.id, 
      { status, remarks }, 
      { new: true }
    );

    // If not found, it might be a new record for an 'Absent' user
    if (!attendance && date && employeeId) {
      const markDate = new Date(date);
      markDate.setHours(0, 0, 0, 0);

      attendance = await Attendance.findOneAndUpdate(
        { employeeId, date: markDate },
        { 
          status, 
          remarks, 
          checkIn: markDate, // Default check-in for manual override
          markedBy: req.user._id 
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    if (!attendance) return res.status(404).json({ message: 'Record not found and insufficient data for upsert' });
    
    res.json({ message: 'Attendance matrix node updated', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send warning message to late login candidates
// @route   POST /api/hr/attendance/warning
exports.sendLateWarning = async (req, res) => {
  try {
    const { employeeId, message } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const { createNotification } = require('./notificationController');

    await createNotification({
      userId: employee.userId,
      title: 'Attendance Warning: Late Arrival',
      message: message || `System Protocol Alert: Your check-in for today was marked as LATE. Please ensure punctuality in the next operational cycle.`,
      type: 'warning',
      priority: 'high',
      module: 'hrms',
      link: '/attendance/my'
    });

    res.json({ success: true, message: 'Warning dispatched to employee terminal' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
