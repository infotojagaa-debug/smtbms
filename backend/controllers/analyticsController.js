const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { Leave, LeaveBalance } = require('../models/Leave');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const Task = require('../models/Task');
const Payroll = require('../models/Payroll');
const Announcement = require('../models/Announcement');
const SystemSettings = require('../models/SystemSettings');

// @desc    Get Admin Dashboard Summary
// @route   GET /api/analytics/admin
exports.getAdminDashboard = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Material Summary
    const materialCount = await Material.countDocuments({ isActive: true });
    const lowStockCount = await Material.countDocuments({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true
    });
    const topLowStock = await Material.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true
    }).limit(5).select('name quantity minStockLevel unit');

    // 2. HRMS Summary — Use date range to capture all check-ins for today regardless of exact time
    const employeeCount = await Employee.countDocuments({ status: 'Active' });
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const presentToday = await Attendance.countDocuments({ 
      date: { $gte: startOfDay, $lte: endOfDay }, 
      status: { $in: ['Present', 'Late', 'Half-day'] } 
    });
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // 3. ERP Summary
    const invoices = await Invoice.find({ createdAt: { $gte: startOfMonth } });
    const totalRevenue = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const pendingPOs = await PurchaseOrder.countDocuments({ status: 'sent' });

    // 4. CRM Summary
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const newLeads = await Lead.countDocuments({ createdAt: { $gte: startOfMonth } });
    const pipelineValue = await Deal.aggregate([
      { $match: { stage: { $nin: ['closed-won', 'closed-lost'] } } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    const openTickets = await Ticket.countDocuments({ status: { $ne: 'resolved' } });

    // 5. Historical Revenue (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueHistory = await Invoice.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: "$totalAmount" }
      } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formattedRevenue = revenueHistory.map(r => ({
      name: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][r._id.month - 1],
      revenue: r.total,
      expense: r.total * 0.7 // Mock expense as 70% of revenue for visualization if not tracked
    }));

    // 6. Headcount by Department
    const headcountByDept = await Employee.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$department', value: { $sum: 1 } } }
    ]).then(res => res.map(r => ({ name: r._id, value: r.value })));

    // 7. Recent Activities
    let recentActivities = [];
    try {
      recentActivities = await AuditLog.find()
        .populate({ path: 'userId', select: 'name', options: { lean: true } })
        .sort('-createdAt')
        .limit(10)
        .lean();
    } catch (populateErr) {
      recentActivities = await AuditLog.find()
        .sort('-createdAt')
        .limit(10)
        .lean();
    }

    res.json({
      materials: { total: materialCount, lowStock: lowStockCount, topLowStock },
      hrms: {
        totalEmployees: employeeCount,
        presentToday,
        presentPercent: ((presentToday / (employeeCount || 1)) * 100).toFixed(1),
        pendingLeaves,
        headcountByDept
      },
      erp: { monthlyRevenue: totalRevenue, pendingPOs, revenueHistory: formattedRevenue },
      crm: { activeCustomers, newLeads, pipelineTotal: pipelineValue[0]?.total || 0, openTickets },
      recentActivities
    });
  } catch (error) {
    console.error('Admin dashboard error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get HR Dashboard Summary
// @route   GET /api/analytics/hr
exports.getHRDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const headcountByDept = await Employee.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const attendanceSummary = await Attendance.aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 1. Attendance Trend (Last 7 Days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const attendanceTrend = await Attendance.aggregate([
      { $match: { date: { $gte: sevenDaysAgo, $lte: endOfDay } } },
      { $group: { 
          _id: { $dateToString: { format: "%m-%d", date: "$date" } },
          Present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Late", "Half-day"]] }, 1, 0] } },
          Absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
          Leave: { $sum: { $cond: [{ $eq: ["$status", "On-leave"] }, 1, 0] } }
      } },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Payroll Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const payrollTrend = await Payroll.aggregate([
      // We assume month/year fields or use createdAt
      { $group: { 
          _id: { month: "$month", year: "$year" },
          total: { $sum: "$netSalary" }
      } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ]);

    // 3. Leave Distribution
    const leaveDistribution = await Leave.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$leaveType', count: { $sum: 1 } } }
    ]);

    // 4. Workforce Metrics
    const totalCount = await Employee.countDocuments();
    const activeCount = await Employee.countDocuments({ status: 'Active' });
    const inactiveCount = totalCount - activeCount;
    const retentionRate = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) : 100;
    const attritionRate = totalCount > 0 ? ((inactiveCount / totalCount) * 100).toFixed(1) : 0;

    // 5. Productivity Stats (Last 30 Days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const productivity = await Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo }, status: { $ne: 'Absent' } } },
      { $group: {
          _id: null,
          avgHours: { $avg: '$workingHours' },
          totalOvertime: { $sum: '$overtime' }
      } }
    ]);

    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });

    const recentLeaves = await Leave.find({ status: { $in: ['Pending', 'Approved'] } })
      .sort('-createdAt')
      .limit(5)
      .populate('employeeId', 'name department')
      .lean()
      .catch(() => []);

    const payrollSummary = await Payroll.aggregate([
      { $match: { month: today.getMonth() + 1, year: today.getFullYear() } },
      { $group: { _id: null, totalDisbursed: { $sum: '$netSalary' }, count: { $sum: 1 } } }
    ]);

    const presentCount = attendanceSummary.find(a => a._id === 'Present')?.count || 0;
    const lateCount = attendanceSummary.find(a => a._id === 'Late')?.count || 0;
    const onLeaveToday = attendanceSummary.find(a => a._id === 'On-leave')?.count || 0;

    res.json({
      headcountByDept,
      attendanceSummary,
      attendanceTrend,
      activeEmployees: presentCount + lateCount,
      onLeaveToday,
      payrollTrend: payrollTrend.map(p => ({ 
        name: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][p._id.month-1]} ${p._id.year}`, 
        total: p.total 
      })),
      leaveDistribution: leaveDistribution.map(l => ({ name: l._id, value: l.count })),
      retentionStats: { retentionRate, attritionRate },
      productivityStats: {
        avgHours: (productivity[0]?.avgHours || 0).toFixed(1),
        totalOvertime: productivity[0]?.totalOvertime || 0
      },
      pendingLeaves,
      totalEmployees,
      recentLeaves,
      payroll: payrollSummary[0] || { totalDisbursed: 0, count: 0 }
    });
  } catch (error) {
    console.error('HR dashboard error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Sales Dashboard Summary
// @route   GET /api/analytics/sales
exports.getSalesDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const myLeadsCount = await Lead.countDocuments({ assignedTo: userId });
    const myPipeline = await Deal.aggregate([
      { $match: { assignedTo: userId, stage: { $nin: ['closed-won', 'closed-lost'] } } },
      { $group: { _id: '$stage', total: { $sum: '$value' }, count: { $sum: 1 } } }
    ]);

    // Won deals this month
    const wonDeals = await Deal.aggregate([
      { $match: { assignedTo: userId, stage: 'closed-won', updatedAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$value' }, count: { $sum: 1 } } }
    ]);

    const totalPipelineValue = myPipeline.reduce((acc, p) => acc + p.total, 0);

    // Additional CRM features synced from Admin
    const activeStrategicClients = await Customer.countDocuments({ status: 'active' });
    const openTickets = await Ticket.countDocuments({ status: { $ne: 'resolved' } });
    
    let recentActivities = [];
    try {
      recentActivities = await AuditLog.find({ module: { $in: ['CRM', 'Sales', 'Leads', 'Deals'] } })
        .populate({ path: 'userId', select: 'name', options: { lean: true } })
        .sort('-createdAt')
        .limit(10)
        .lean();
    } catch (err) {
      recentActivities = await AuditLog.find({ module: { $in: ['CRM', 'Sales', 'Leads', 'Deals'] } })
        .sort('-createdAt')
        .limit(10)
        .lean();
    }

    res.json({
      myLeadsCount,
      myPipeline,
      wonThisMonth: wonDeals[0]?.total || 0,
      wonDealsCount: wonDeals[0]?.count || 0,
      totalPipelineValue,
      activeStrategicClients,
      openTickets,
      recentActivities
    });
  } catch (error) {
    console.error('Sales dashboard error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Employee Personal Dashboard
// @route   GET /api/analytics/employee
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get Employee Profile (including salary for earnings calculation)
    const employee = await Employee.findOne({ userId }).select('name department designation employeeType salary joiningDate createdAt');
    if (!employee) {
      return res.json({ 
        employee: null, 
        todayAttendance: null, 
        myPendingLeaves: 0,
        attendance: { present: 0, absent: 0, late: 0, leave: 0, totalDays: 30 },
        leaveBalance: []
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 2. Today's Status
    const todayAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date: today
    });

    const myPendingLeaves = await Leave.countDocuments({
      employeeId: employee._id,
      status: 'Pending'
    });

    // 3. Leave Balance
    const leaveBalanceDoc = await LeaveBalance.findOne({
      employeeId: employee._id,
      year: currentYear
    });

    const leaveBalance = leaveBalanceDoc ? [
      { name: 'Casual', value: leaveBalanceDoc.casual.remaining, total: leaveBalanceDoc.casual.total, color: '#6366f1' },
      { name: 'Sick', value: leaveBalanceDoc.sick.remaining, total: leaveBalanceDoc.sick.total, color: '#10b981' },
      { name: 'Earned', value: leaveBalanceDoc.earned.remaining, total: leaveBalanceDoc.earned.total, color: '#f59e0b' }
    ] : [
      { name: 'Casual', value: 12, total: 12, color: '#6366f1' },
      { name: 'Sick', value: 10, total: 10, color: '#10b981' },
      { name: 'Earned', value: 15, total: 15, color: '#f59e0b' }
    ];

    // 4. Precision Monthly Analytics (Accounting for Weekends, Holidays, & Hiring Date)
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    const totalDaysInMonth = endDate.getDate();
    const daysPassed = now.getDate();

    const attendanceRecords = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const monthLeaves = await Leave.find({
      employeeId: employee._id,
      status: { $in: ['Approved', 'Pending'] },
      $or: [
        { fromDate: { $gte: startDate, $lte: endDate } },
        { toDate: { $gte: startDate, $lte: endDate } },
        { fromDate: { $lt: startDate }, toDate: { $gt: endDate } }
      ]
    });

    const toISODate = (d) => {
      if (!d) return null;
      try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return null;
        // Use local date parts to prevent timezone shifts during ISO string conversion
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (e) { return null; }
    };
    const settings = await SystemSettings.getSettings();
    const holidays = settings.holidays || [];
    const joiningDateStr = toISODate(employee.joiningDate) || toISODate(employee.createdAt) || '1970-01-01';

    // 1. Calculate Standard Working Days (Denominator for per-day rate)
    let workingDaysInMonth = 0;

    const quotas = settings.leaveSettings || { casual: 12, sick: 10, earned: 15 };

    for (let day = 1; day <= totalDaysInMonth; day++) {
       const loopDate = new Date(currentYear, currentMonth - 1, day, 12, 0, 0);
       const isSunday = (loopDate.getDay() === 0);
       const isHoliday = holidays.some(h => toISODate(h.date) === toISODate(loopDate));
       if (!isSunday && !isHoliday) workingDaysInMonth++;
    }

    let daysPresent = 0;
    let daysLate = 0;
    let daysOnLeave = 0;
    let lopDays = 0;
    let pendingLeaveDays = 0;
    let approvedLeaveDays = 0;
    const leaveUsage = { 'Casual': 0, 'Sick': 0, 'Earned': 0 };

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const loopDate = new Date(currentYear, currentMonth - 1, d, 12, 0, 0);
      const loopDateStr = toISODate(loopDate);
      const dayOfWeek = loopDate.getDay();
      const isSunday = (dayOfWeek === 0);
      
      if (loopDateStr < joiningDateStr) continue; 

      const isHoliday = holidays.find(h => toISODate(h.date) === loopDateStr);

      const leave = monthLeaves.find(l => {
        const s = toISODate(l.fromDate);
        const e = toISODate(l.toDate);
        return loopDateStr >= s && loopDateStr <= e;
      });

      const att = attendanceRecords.find(a => toISODate(a.date) === loopDateStr);

      // --- SYNCED PRIORITY LOGIC ---
      if (att && att.isLOP) {
        lopDays++;
        continue;
      }

      if (leave) {
        if (leave.status === 'Approved') {
          const type = leave.leaveType;
          if (type === 'Unpaid') {
             lopDays++;
          } else if (['Sick', 'Casual', 'Earned'].includes(type)) {
             const quotaKey = type.toLowerCase();
             if (leaveUsage[type] < quotas[quotaKey]) {
                leaveUsage[type]++;
                approvedLeaveDays++;
                daysOnLeave++;
                daysPresent++;
             } else {
                lopDays++;
             }
          }
        } else if (leave.status === 'Pending') {
          pendingLeaveDays++;
        }
        continue;
      }

      if (isHoliday || isSunday) {
        // Only skip if there's NO attendance record for this day (overtime/voluntary work)
        if (!att) {
           continue;
        }
      }

      // Past days only for attendance/absenteeism
      if (d <= daysPassed) {
        if (att) {
          if (['Present', 'Late', 'Half-day'].includes(att.status)) {
            daysPresent += (att.status === 'Half-day' ? 0.5 : 1);
            if (att.status === 'Half-day') lopDays += 0.5;
          }
          if (att.status === 'Late') daysLate++;
          if (att.status === 'Absent') lopDays++;
        } else if (d < daysPassed) {
          lopDays++;
        }
      }
    }

    // 5. Net Earnings Calculation
    const activeSalary = (employee.salary?.basic || 30000);
    const workingDaysCount = Math.max(1, workingDaysInMonth);
    const perDayRate = activeSalary / workingDaysCount;
    const lopDeduction = lopDays * perDayRate;
    const latePenalty = daysLate * (employee.salary?.latePenalty || 0);
    const netEarnings = Math.max(0, activeSalary - lopDeduction - latePenalty);

    // 6. Task Accuracy / Ratio
    const todayStr = now.toISOString().split('T')[0];
    const userTasks = await Task.find({ user: userId, date: todayStr });
    const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
    const taskRatio = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 85;

    // 8. Announcements
    const announcements = await Announcement.find({
      targetRole: { $in: ['All', req.user.role || 'Employee'] }
    })
    .populate('author', 'name role')
    .sort('-createdAt').limit(5);

    res.json({
      employee,
      todayAttendance: attendanceRecords.find(a => new Date(a.date).toDateString() === now.toDateString()),
      myPendingLeaves: await Leave.countDocuments({ employeeId: employee._id, status: 'Pending' }),
      attendance: {
        present: daysPresent,
        absent: lopDays,
        late: daysLate,
        leave: daysOnLeave,
        pendingLeave: pendingLeaveDays,
        approvedLeave: approvedLeaveDays,
        totalDays: totalDaysInMonth
      },
      leaveBalance: leaveBalanceDoc ? [
        { name: 'Casual', value: leaveBalanceDoc.casual.remaining, total: leaveBalanceDoc.casual.total, color: '#6366f1' },
        { name: 'Sick', value: leaveBalanceDoc.sick.remaining, total: leaveBalanceDoc.sick.total, color: '#10b981' },
        { name: 'Earned', value: leaveBalanceDoc.earned.remaining, total: leaveBalanceDoc.earned.total, color: '#f59e0b' }
      ] : [
        { name: 'Casual', value: 12, total: 12, color: '#6366f1' },
        { name: 'Sick', value: 10, total: 10, color: '#10b981' },
        { name: 'Earned', value: 15, total: 15, color: '#f59e0b' }
      ],
      taskRatio,
      netEarnings,
      events: [
        { label: 'Team Standup', time: '10:00 AM', type: 'Meeting' },
        { label: 'Project Review', time: '2:00 PM', type: 'Review' },
      ],
      announcements,
      holidays,
      monthLeaves,
      monthlyHistory: attendanceRecords
    });
  } catch (error) {
    console.error('Employee dashboard error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Global Search across all modules
// @route   GET /api/analytics/search
exports.globalSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({});

    const regex = new RegExp(query, 'i');

    const [materials, employees, customers, leads, invoices] = await Promise.all([
      Material.find({ $or: [{ name: regex }, { code: regex }] }).limit(5).select('name code'),
      Employee.find({ $or: [{ name: regex }, { employeeId: regex }] }).limit(5).select('name employeeId'),
      Customer.find({ $or: [{ name: regex }, { company: regex }] }).limit(5).select('name company'),
      Lead.find({ title: regex }).limit(5).select('title'),
      Invoice.find({ invoiceNumber: regex }).limit(5).select('invoiceNumber')
    ]);

    res.json({ materials, employees, customers, leads, invoices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
