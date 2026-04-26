const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { Leave } = require('../models/Leave');
const SystemSettings = require('../models/SystemSettings');
const mongoose = require('mongoose');
const { createNotification, notifyRole } = require('./notificationController');


// @desc    Get Current Month Draft Payroll for an employee
// @route   GET /api/payroll/draft/:employeeId
exports.getDraftPayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // EXTREME DIAGNOSTIC LOGGING (Resolves 403)
    const rawRole = req.user.role || 'none';
    const userRole = rawRole.trim().toLowerCase();
    const isSpecialRole = ['admin', 'hr', 'manager'].includes(userRole);
    
    console.log(`[DEBUG 403] Incoming Request for: ${employeeId}`);
    console.log(`[DEBUG 403] User: ${req.user.email} | Role: '${rawRole}' | Parsed: '${userRole}'`);

    if (!isSpecialRole && userRole !== 'employee') {
       console.warn(`[DENIED] Blocked ${req.user.email}. Role '${rawRole}' is not in authorized list.`);
       return res.status(403).json({ message: `Access denied: Role '${rawRole}' unauthorized.` });
    }

    if (userRole === 'employee') {
      const self = await Employee.findOne({ userId: req.user._id });
      
      console.log(`[DEBUG 403] Employee Record Found: ${self ? 'YES' : 'NO'}`);
      if (self) {
        console.log(`[DEBUG 403] Match Check: self._id(${self._id}) vs employeeId(${employeeId})`);
      }

      if (!self || self._id.toString() !== employeeId) {
        console.warn(`[DENIED] Self-only mismatch for ${req.user.email}.`);
        return res.status(403).json({ 
          message: 'Access denied: Profile linkage failed.',
          debug: {
            authUserId: req.user._id,
            authRole: req.user.role,
            requestedEmployeeId: employeeId,
            foundEmployeeId: self ? self._id : 'NONE'
          }
        });
      }
    }

    const now = new Date();
    // Accept optional ?month=&year= query params (HR selecting a period)
    const currentMonth = parseInt(req.query.month) || (now.getMonth() + 1);
    const currentYear  = parseInt(req.query.year)  || now.getFullYear();

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // 1. Calculate month days
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    const totalDaysInMonth = endDate.getDate();

    // 2. Fetch Attendance, Leaves, & Existing Config
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    const leaveRecords = await Leave.find({
      employeeId,
      status: 'Approved',
      $or: [
        { fromDate: { $gte: startDate, $lte: endDate } },
        { toDate: { $gte: startDate, $lte: endDate } },
        { fromDate: { $lt: startDate }, toDate: { $gt: endDate } }
      ]
    });

    const existingPayroll = await Payroll.findOne({ employeeId, month: currentMonth, year: currentYear });

    const toISODate = (d) => {
      if (!d) return null;
      try {
        const date = new Date(d);
        return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
      } catch (e) { return null; }
    };
    const joiningDateStr = toISODate(employee.joiningDate) || '1970-01-01';


     // 1. Calculate Standard Working Days (Denominator for per-day rate)
    let workingDaysInMonth = 0;
    const settings = await SystemSettings.getSettings();
    const holidays = settings.holidays || [];
    const quotas = settings.leaveSettings || { casual: 12, sick: 10, earned: 15 };

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const loopDate = new Date(currentYear, currentMonth - 1, day, 12, 0, 0);
      const isSunday = (loopDate.getDay() === 0);
      const isHoliday = holidays.some(h => toISODate(h.date) === toISODate(loopDate));
      if (!isSunday && !isHoliday) workingDaysInMonth++;
    }

    // 2. Main Processing Loop
    let presentDays = 0;
    let paidLeaveDays = 0;
    let lopDays = 0;
    let lateDays = 0;
    let totalHours = 0;
    let overTimeFromDoublePay = 0;

    const leaveUsage = { 'Casual': 0, 'Sick': 0, 'Earned': 0 };
    // For past months, all days have passed. For current month, use today's date.
    const isCurrentMonth = (currentMonth === now.getMonth() + 1) && (currentYear === now.getFullYear());
    const daysPassed = isCurrentMonth ? now.getDate() : totalDaysInMonth;

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const loopDate = new Date(currentYear, currentMonth - 1, day, 12, 0, 0);
      const loopDateStr = toISODate(loopDate);
      
      if (loopDateStr < joiningDateStr) continue; 

      const dayOfWeek = loopDate.getDay();
      const isSunday = (dayOfWeek === 0);
      const isHoliday = holidays.some(h => toISODate(h.date) === loopDateStr);

      // Check Leave status for this day (both past and future for projection)
      let leaveRec = null;
      for (const lv of leaveRecords) {
        if (loopDateStr >= toISODate(lv.fromDate) && loopDateStr <= toISODate(lv.toDate)) {
          leaveRec = lv;
          break;
        }
      }

      const att = attendanceRecords.find(a => toISODate(a.date) === loopDateStr);

      // --- PRIORITY LOGIC ---
      
      // A. Manual HR LOP (Overrides everything)
      if (att && att.isLOP) {
        lopDays++;
        continue;
      }

      // B. Approved Leaves (Sanctioned entries)
      if (leaveRec) {
        if (leaveRec.leaveType === 'Unpaid') {
          lopDays++;
        } else {
          // Any other approved leave (Sick, Casual, Earned) is paid
          paidLeaveDays++;
          presentDays++; // Counts towards salary magnitude
        }
        continue;
      }

      // C. Working Day Logic (Sundays/Holidays)
      if (isSunday || isHoliday) {
        presentDays++; 
        continue;
      }

      // D. Attendance Actuals (Only for Past/Today)
      if (day <= daysPassed) {
        if (att) {
          if (['Present', 'Late', 'Half-day'].includes(att.status)) {
             presentDays += (att.status === 'Half-day' ? 0.5 : 1);
             if (att.status === 'Half-day') lopDays += 0.5;
          }
          if (att.status === 'Late') lateDays++;
          if (att.status === 'Absent') lopDays++;
          
          totalHours += (att.workingHours || 0);
          if (att.isDoublePay) overTimeFromDoublePay++; 
        } else if (day < daysPassed) {
          // KEY FIX: Only penalize with LOP if employee has SOME attendance records.
          // If they have zero records (brand-new employee), treat as Present — not absent.
          // This prevents massive LOP deductions for newly enrolled staff.
          if (attendanceRecords.length > 0) {
            lopDays++; // Has records but this day is missing = genuine absence
          } else {
            presentDays++; // No records at all = new employee, assume present
          }
        }
      }
    }

    // 3. Calculation Engine
    const baseSalary = employee.salary?.basic || 30000;
    const workingDaysCount = Math.max(1, workingDaysInMonth); 
    const perDayRate = baseSalary / workingDaysCount;
    const earnedSalary = baseSalary; // Fixed Fundamental block
    
    // Deductions based on Loss Of Pay
    const lopDeduction = lopDays * perDayRate; 
    const latePenalty = lateDays * (employee.salary?.latePenalty || 0);

    
    // Overtime Base
    const standardHours = presentDays * 8;
    const overtimeHours = Math.max(0, totalHours - standardHours);
    
    // Combine physical OT Hours with Double Pay Special Day bonus limits
    const extraHoursPay = overtimeHours * (employee.salary?.overtimeRate || 0);
    const doublePayBonusValue = overTimeFromDoublePay * perDayRate;
    const overtimePay = extraHoursPay + doublePayBonusValue;

    const draft = {
      employeeId,
      name: employee.name,
      month: currentMonth,
      year: currentYear,
      baseSalary,
      earnedSalary: baseSalary,
      paidLeaveDays,
      lopDays,
      lopDeduction,
      allowances: {
        food: employee.salary?.foodAllowance || 0,
        travel: employee.salary?.travelAllowance || 0,
        other: 0
      },
      overtimePay,
      bonus: existingPayroll ? existingPayroll.bonus : 0,
      deductions: {
        absent: lopDeduction,
        late: latePenalty,
        tax: 0,
        other: 0
      },
      totalDays: totalDaysInMonth,
      workingDaysCount,
      presentDays,
      absentDays: lopDays,
      lateDays,
      workingHours: totalHours
    };


    // Calculate net: Base - Absenteeism - Penalties + Bonuses + Allowances
    const totalAllowances = draft.allowances.food + draft.allowances.travel + draft.allowances.other;
    const totalDeductions = draft.deductions.absent + draft.deductions.late + draft.deductions.tax + draft.deductions.other;
    draft.netSalary = Math.round(Math.max(0, draft.earnedSalary + totalAllowances + overtimePay - totalDeductions));
    // Round all monetary values to avoid decimals
    draft.lopDeduction = Math.round(draft.lopDeduction);
    draft.deductions.absent = Math.round(draft.deductions.absent);
    draft.earnedSalary = Math.round(draft.earnedSalary);
    draft.overtimePay = Math.round(draft.overtimePay);

    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upsert (Finalize/Process) Payroll
// @route   POST /api/payroll
exports.upsertPayroll = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    
    let payroll = await Payroll.findOne({ employeeId, month, year });
    
    const payload = {
      ...req.body,
      status: 'Paid',
      paymentDate: new Date(),
      generatedBy: req.user._id
    };

    if (payroll) {
      // Update existing
      payroll = await Payroll.findByIdAndUpdate(payroll._id, payload, { new: true });
    } else {
      // Create new
      payroll = new Payroll(payload);
      await payroll.save();
    }
    
    // Notify HR of Calculation
    if (payroll && payroll.status !== 'Paid') {
      await notifyRole('HR', {
        title: 'Payroll Vector Calculated',
        message: `Payroll draft for ${employee.name} (Period ${currentMonth}) is now ready for finalisation.`,
        type: 'payroll',
        module: 'hrms',
        link: '/hr/payroll'
      });
    }

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk Finalize Payroll
// @route   POST /api/payroll/bulk
exports.bulkUpsertPayroll = async (req, res) => {
  try {
    const { payrolls } = req.body; // Expecting array of payroll objects
    
    const results = await Promise.all(payrolls.map(async (p) => {
       const payload = {
         ...p,
         status: 'Paid',
         paymentDate: new Date(),
         generatedBy: req.user._id
       };
        const result = await Payroll.findOneAndUpdate(
          { employeeId: p.employeeId, month: p.month, year: p.year },
          payload,
          { upsert: true, new: true }
        );

        // Notify Employee
        const emp = await Employee.findById(p.employeeId);
        if (emp) {
          await createNotification({
            userId: emp.userId,
            title: 'Salary Disbursed',
            message: `Your salary for Period ${p.month}/${p.year} has been processed and credited.`,
            type: 'payroll',
            module: 'hrms',
            link: '/my-salary'
          });
        }
        return result;
     }));

    // Notify Admin & HR of bulk disbursement
    const { notifyRole } = require('./notificationController');
    await notifyRole(['Admin', 'HR'], {
      title: 'Fiscal: Bulk Payroll Processed',
      message: `Strategic Node: ${results.length} payroll records have been successfully disbursed.`,
      type: 'success',
      priority: 'high',
      module: 'hrms',
      link: '/hr/payroll'
    });

    res.json({ message: `Successfully disbursed ${results.length} payrolls`, count: results.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Payrolls (Admin)
// @route   GET /api/payroll
exports.getAllPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = year;

    const payrolls = await Payroll.find(filter).populate('employeeId', 'name employeeId department designation');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get My Payroll History (Employee)
// @route   GET /api/payroll/my
exports.getMyPayrollHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const employee = await Employee.findOne({ userId });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const history = await Payroll.find({ employeeId: employee._id })
      .sort({ year: -1, month: -1 });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ad-hoc bonus for dynamic calculation
// @route   PATCH /api/payroll/draft/:employeeId/bonus
exports.updateBonus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { bonus, month, year } = req.body;
    
    let payroll = await Payroll.findOne({ employeeId, month, year });
    if (!payroll) {
       payroll = new Payroll({
         employeeId, month, year, baseSalary: 0, bonus: bonus
       })
    } else {
       payroll.bonus = bonus;
    }
    await payroll.save();
    res.json({ message: 'Bonus configured for calculation engine.', bonus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
