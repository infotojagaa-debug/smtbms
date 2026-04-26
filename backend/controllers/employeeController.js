const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { LeaveBalance } = require('../models/Leave.js');
const nodemailer = require('nodemailer');
const { notifyRole } = require('./notificationController');

// Helper: Auto-generate Employee ID (EMP001, EMP002...)
const generateEmployeeId = async () => {
  const lastEmp = await Employee.findOne().sort({ createdAt: -1 });
  if (!lastEmp) return 'EMP001';
  const lastId = parseInt(lastEmp.employeeId.replace('EMP', ''));
  return `EMP${(lastId + 1).toString().padStart(3, '0')}`;
};

// @desc    Create new employee + User account + Welcome Email
// @route   POST /api/hr/employees
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, department, designation, salary, phone, joiningDate, role, password } = req.body;

    // 1. Check if user already exists
    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (user) {
       // User exists, check if they already have an employee profile
       const existingEmp = await Employee.findOne({ userId: user._id });
       if (existingEmp) {
          return res.status(400).json({ message: 'An employee profile for this email already exists.' });
       }
       // If user exists but has no employee profile, we will link them.
       // Update their role if a new one is provided
       if (role && role !== user.role) {
          user.role = role;
          await user.save();
       }
    } else {
       // 2. Generate or Use Provided Credentials
       isNewUser = true;
       const finalPassword = password || Math.random().toString(36).slice(-8);

       // 3. Create User Account
       user = await User.create({
         name,
         email,
         password: finalPassword,
         role: role || 'Employee'
       });
    }

    let employee;
    try {
      // 3. Generate Employee ID
      const employeeId = await generateEmployeeId();

      // 4. Create Employee Profile
      employee = await Employee.create({
        ...req.body,
        employeeId,
        userId: user._id
      });

      // 6. Initialize Leave Balance
      await LeaveBalance.create({
        employeeId: employee._id,
        year: new Date().getFullYear()
      });

      // 7. Send Welcome Email (Placeholder logic)
      if (isNewUser) {
          console.log(`Sending Welcome Email to ${email} with New Node Instructions`);
      } else {
          console.log(`Sending Notification to ${email} for Workforce linking`);
      }

      // 8. Notify HR & Admin
      await notifyRole(['HR', 'Admin'], {
        title: 'New Workforce Node',
        message: `New employee added: ${name} (${employeeId})`,
        type: 'success',
        module: 'hrms',
        link: '/hr/employees'
      });

      res.status(201).json({ employee, linkedExistingUser: !isNewUser });
    } catch (err) {
      if (isNewUser && user) {
         await User.findByIdAndDelete(user._id);
      }
      return res.status(400).json({ message: err.message || 'Validation failed during employee creation. Profile not saved.' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees with filters & pagination
// @route   GET /api/hr/employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, status, employeeType, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (employeeType) query.employeeType = employeeType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('reportingManager', 'name employeeId')
      .populate('userId', 'role');

    const count = await Employee.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalEmployees: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee profile
// @route   GET /api/hr/employees/:id
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('reportingManager', 'name employeeId');
    
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee details
// @route   PUT /api/hr/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Update Employee record
    Object.assign(employee, req.body);
    await employee.save();

    // Synchronize with User record
    const user = await User.findById(employee.userId);
    if (user) {
      if (req.body.name) user.name = req.body.name;
      if (req.body.email) user.email = req.body.email;
      if (req.body.department) user.department = req.body.department;
      if (req.body.phone) user.phone = req.body.phone;
      await user.save();
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete (Terminate)
// @route   DELETE /api/hr/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, { status: 'Terminated' }, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee terminated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get HR Stats
// @route   GET /api/hr/employees/stats
exports.getEmployeeStats = async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ status: 'Active' });
    const deptWise = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({ total, active, deptWise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply increment to an employee's salary
// @route   PATCH /api/hr/employees/:id/increment
exports.applyIncrement = async (req, res) => {
  try {
    const { amount, type } = req.body; // type can be 'percentage' or 'flat'
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    let oldBasic = employee.salary.basic;
    if (type === 'percentage') {
       employee.salary.basic = Math.round(employee.salary.basic + (employee.salary.basic * (amount / 100)));
    } else {
       employee.salary.basic += parseFloat(amount);
    }
    
    await employee.save();
    res.json({ message: 'Increment applied successfully', oldBasic, newBasic: employee.salary.basic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload document for employee
// @route   POST /api/hr/employees/:id/documents
exports.uploadDocument = async (req, res) => {
  try {
    const { name } = req.body;
    const url = req.file ? req.file.path : req.body.url;
    
    if (!url) return res.status(400).json({ message: 'No document file or URL provided' });

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $push: { documents: { name: name || 'Document', url, uploadedAt: new Date() } } },
      { new: true }
    );
    
    res.json({ message: 'Document archived successfully', documents: employee.documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const { Leave } = require('../models/Leave');

// @desc    Get currently logged in employee profile
// @route   GET /api/hr/employees/profile/self
exports.getSelfProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id })
      .populate('userId', 'name email role')
      .populate('reportingManager', 'name employeeId');
    
    // For non-employee roles (Customer, Admin without Employee record),
    // return a lightweight profile built from the User model
    if (!employee) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      return res.json({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || null,
        designation: user.role,
        department: user.role === 'Customer' ? 'External' : 'Management',
        employeeId: `USR-${user._id.toString().slice(-5).toUpperCase()}`,
        photo: user.photo || null,
        userId: user,
        stats: { workingDays: 0, tasksCompleted: 0, leavesTaken: 0 }
      });
    }

    // Aggregating Stats for Digital Identity Card
    const workingDays = await Attendance.countDocuments({ 
      employeeId: employee._id, 
      status: { $in: ['Present', 'Late', 'Half-day'] } 
    });

    const tasksCompleted = await Task.countDocuments({ 
      assignedTo: { $elemMatch: { user: req.user.id, status: 'Completed' } }
    });

    const leavesTaken = await Leave.countDocuments({ 
      employeeId: employee._id, 
      status: 'Approved' 
    });

    res.json({
      ...employee._doc,
      stats: {
        workingDays,
        tasksCompleted,
        leavesTaken
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update self profile
// @route   PUT /api/hr/employees/profile/self
exports.updateSelfProfile = async (req, res) => {
  try {
    // Only allow updating certain fields for security
    const allowedUpdates = ['phone', 'address', 'dateOfBirth', 'photo', 'bankDetails', 'emergencyContact'];
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) updates[key] = req.body[key];
    });

    if (req.file) {
      updates.photo = req.file.path;
    }

    let employee = await Employee.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    // If no employee profile exists (Manager/Admin/Customer), update the User record directly
    if (!employee) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true }
      ).select('-password');
      
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      return res.json({
        message: 'Identity updated via User record',
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        photo: user.photo
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
