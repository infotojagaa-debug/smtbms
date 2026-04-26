const User = require('../models/User');
const Employee = require('../models/Employee');
const { LeaveBalance } = require('../models/Leave');
const bcrypt = require('bcryptjs');

const generateEmployeeId = async () => {
  const lastEmp = await Employee.findOne().sort({ createdAt: -1 });
  if (!lastEmp) return 'EMP001';
  const lastId = parseInt(lastEmp.employeeId.replace('EMP', ''));
  if (isNaN(lastId)) return `EMP-${Date.now()}`;
  return `EMP${(lastId + 1).toString().padStart(3, '0')}`;
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean().sort('-createdAt');
    // Aggregate salary data from linked employee profiles
    const employees = await Employee.find({ userId: { $in: users.map(u => u._id) } }).select('userId salary').lean();
    
    const usersWithSalary = users.map(u => {
      const emp = employees.find(e => e.userId.toString() === u._id.toString());
      return { ...u, salary: emp ? emp.salary : null };
    });
    
    res.json(usersWithSalary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin Create User
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const { name, email, role, department, phone, password: customPassword, salary } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use custom password or generate a secure random one
    const tempPassword = customPassword || (Math.random().toString(36).slice(-8) + 'A1!');

    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role: role || 'Employee',
      department,
      phone
    });

    if (user) {
      // Create complementary Employee Profile
      try {
        const employeeId = await generateEmployeeId();
        const employee = await Employee.create({
          userId: user._id,
          employeeId,
          name: user.name,
          email: user.email,
          phone: phone || '0000000000',
          department: department || 'Operations',
          designation: (role === 'Admin' ? 'System Administrator' : (role === 'Manager' ? 'Operations Lead' : 'Staff Engineer')),
          joiningDate: new Date(),
          salary: salary || { basic: 30000, allowances: 5000, deductions: 0 },
          status: 'Active'
        });

        // Initialize Leave Balance
        await LeaveBalance.create({
          employeeId: employee._id,
          year: new Date().getFullYear()
        });
      } catch (empErr) {
        console.error("Auto-Employee creation failed:", empErr);
        // We still have the user, but HR side will be missing the profile.
        // In a production app, we might want to roll back the user creation here.
      }

      // TODO: Send email via nodemailer
      // 9. Notify Admin of new registration
      await notifyRole('Admin', {
        title: 'Security: New Account',
        message: `New user account provisioned: ${name} (${email})`,
        type: 'info',
        module: 'auth',
        link: '/admin/users'
      });

      console.log(`User created. Temporary password for ${email} is ${tempPassword}`);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        tempPassword 
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  const { name, email, role, department, phone, password, salary } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      user.department = department || user.department;
      user.phone = phone || user.phone;
      
      if (password) {
        user.password = password;
      }

      const updatedUser = await user.save();

      // Notify Admin of Change
      const { notifyRole } = require('./notificationController');
      await notifyRole('Admin', {
        title: 'Management: Profile Update',
        message: `Admin/Manager has updated the profile of ${user.name} (${user.email}).`,
        type: 'info',
        priority: role && role !== user.role ? 'high' : 'medium',
        module: 'auth',
        link: '/admin/users'
      });

      // Synchronize with Employee record
      const employee = await Employee.findOne({ userId: user._id });
      if (employee) {
        employee.name = user.name;
        employee.email = user.email;
        employee.department = user.department;
        employee.phone = user.phone;
        if (salary) employee.salary = salary;
        await employee.save();
      }
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        phone: updatedUser.phone
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'Admin' && (await User.countDocuments({ role: 'Admin' })) <= 1) {
         return res.status(400).json({ message: 'Cannot delete the last Admin account' });
      }

      const employee = await Employee.findOne({ userId: user._id });
      if (employee) {
        await LeaveBalance.deleteMany({ employeeId: employee._id });
        await employee.deleteOne();
      }

      await user.deleteOne();
      res.json({ message: 'User and all related profiles expunged' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle User Status
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
exports.toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = user.status === 'Active' ? 'Inactive' : 'Active';
      await user.save();

      // Notify Admin of Status Change (Critical Security Alert)
      const { notifyRole } = require('./notificationController');
      await notifyRole('Admin', {
        title: 'Security: Account Status',
        message: `User account ${user.name} has been ${user.status.toLowerCase()}.`,
        type: user.status === 'Active' ? 'success' : 'error',
        priority: 'high',
        module: 'auth',
        link: '/admin/users'
      });
      res.json({ message: `User moved to ${user.status} state`, status: user.status });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset User Password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'; 
      user.password = tempPassword;
      await user.save();
      
      // TODO: Send via email
      res.json({ message: 'Password reset successful', tempPassword });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
