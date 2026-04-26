const { Leave, LeaveBalance } = require('../models/Leave');
const Employee = require('../models/Employee');
const { createNotification, notifyRole } = require('./notificationController');

// @desc    Apply for leave (Check balance first)
// @route   POST /api/hr/leaves
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found for this user.' });
    }

    // 1. Calculate days
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // 2. Check Balance
    let balance = await LeaveBalance.findOne({ 
      employeeId: employee._id, 
      year: new Date().getFullYear() 
    });

    if (!balance) {
      // Auto-provision balance if missing
      balance = await LeaveBalance.create({
        employeeId: employee._id,
        year: new Date().getFullYear()
      });
    }

    const typeKey = leaveType.toLowerCase();
    
    if (typeKey !== 'unpaid' && balance[typeKey] && balance[typeKey].remaining < totalDays) {
      return res.status(400).json({ message: `Insufficient ${leaveType} leave balance` });
    }

    // 3. Deduct from balance immediately (Real-time logic)
    if (typeKey !== 'unpaid') {
      balance[typeKey].used += totalDays;
      balance[typeKey].remaining -= totalDays;
      await balance.save();
    }

    // 4. Create Leave Request
    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
      appliedOn: new Date()
    });

    // 5. Notify Management Registry (HR, Admin) (Using Grouped Logic for Pending Summary)
    const { notifyGrouped } = require('./notificationController');
    const pendingCount = await Leave.countDocuments({ status: 'Pending' });

    await notifyGrouped({
      groupId: 'pending_leaves_summary',
      title: 'Workforce: Pending Leaves',
      message: `There are ${pendingCount} leave requests awaiting authorization.`,
      type: 'leave',
      priority: pendingCount > 5 ? 'high' : 'medium',
      module: 'hrms',
      link: '/hr/leave',
      role: 'Admin',
      metadata: { count: pendingCount }
    });

    await notifyGrouped({
      groupId: 'pending_leaves_summary_hr',
      title: 'Workforce: Pending Leaves',
      message: `There are ${pendingCount} leave requests awaiting authorization.`,
      type: 'leave',
      priority: pendingCount > 5 ? 'high' : 'medium',
      module: 'hrms',
      link: '/hr/leave',
      role: 'HR',
      metadata: { count: pendingCount }
    });

    await notifyRole('Manager', {
      title: 'Team Leave Request',
      message: `${employee.name} has submitted a leave application for approval.`,
      type: 'leave',
      module: 'hrms',
      link: '/manager/requests'
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update status (Approval logic includes balance deduction)
// @route   PUT /api/hr/leaves/:id/status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave record not found' });

    if (status === 'Approved') {
      leave.status = 'Approved';
      leave.approvedBy = req.user._id;
      leave.approvedOn = new Date();
    } else {
      // Refund balance if rejected (Real-time reversal)
      const balance = await LeaveBalance.findOne({ 
        employeeId: leave.employeeId, 
        year: new Date().getFullYear() 
      });
      
      const typeKey = leave.leaveType.toLowerCase();
      if (balance && typeKey !== 'unpaid') {
        balance[typeKey].used = Math.max(0, balance[typeKey].used - leave.totalDays);
        balance[typeKey].remaining += leave.totalDays;
        await balance.save();
      }

      leave.status = 'Rejected';
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Notify Employee of Status Change
    const employee = await Employee.findById(leave.employeeId);
    if (employee) {
      await createNotification({
        userId: employee.userId,
        title: `Leave Request ${status}`,
        message: status === 'Approved' 
          ? `Your leave request for ${new Date(leave.fromDate).toLocaleDateString()} has been authorized.`
          : `Your leave request was rejected. Reason: ${rejectionReason || 'Not specified'}`,
        type: 'leave',
        module: 'hrms',
        link: '/my-leaves'
      });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leaves (Self for employee, All for HR/Manager)
// @route   GET /api/hr/leaves
exports.getAllLeaves = async (req, res) => {
  try {
    let query = {};
    const { my } = req.query;

    const userRole = req.user.role?.toLowerCase();
    const isManagement = ['admin', 'hr', 'manager'].includes(userRole);

    // Filter by self if explicitly requested or if not a management role
    if (my === 'true' || !isManagement) {
      const emp = await Employee.findOne({ userId: req.user._id });
      if (!emp) return res.json([]);
      query.employeeId = emp._id;
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name employeeId department')
      .sort('-appliedOn');
      
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave balance by employee
// @route   GET /api/hr/leaves/balance/:id
exports.getLeaveBalance = async (req, res) => {
  try {
    const balance = await LeaveBalance.findOne({ 
      employeeId: req.params.id, 
      year: new Date().getFullYear() 
    });
    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's leave balance
// @route   GET /api/hr/leaves/balance/my
exports.getMyLeaveBalance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const balance = await LeaveBalance.findOne({ 
      employeeId: employee._id, 
      year: new Date().getFullYear() 
    });
    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
