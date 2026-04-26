const User = require('../models/User');
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Customer', // Default to Customer if not provided
    });

    // Mirror to Customer Profile if role is Customer
    if (user.role === 'Customer') {
      await Customer.create({
        userId: user._id,
        customerId: `CUST-${Date.now()}`,
        name: user.name,
        email: user.email,
        phone: req.body.phone || '0000000000', // Mock/default
        industry: req.body.industry || 'other',
        customerType: req.body.customerType || 'individual',
        source: 'website',
        status: 'active'
      });
    }

    // Mirror to Employee Profile if role is Employee or Admin
    if (user.role === 'Employee' || user.role === 'Admin') {
      await Employee.create({
        userId: user._id,
        employeeId: `EMP-${Date.now()}`,
        name: user.name,
        email: user.email,
        phone: req.body.phone || '0000000000',
        department: 'Operations',
        designation: user.role === 'Admin' ? 'System Administrator' : 'Staff Engineer',
        joiningDate: new Date(),
        salary: {
          basic: 30000,
          allowances: 5000,
          deductions: 0
        },
        status: 'Active'
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // ... existing success logic
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        refreshToken,
      });
    } else {
      // Notify Admin of Failed Login (Security Alert)
      const { notifyRole } = require('./notificationController');
      await notifyRole('Admin', {
        title: 'Security: Failed Login',
        message: `Repeated failed attempt or invalid credentials for ${email}.`,
        type: 'error',
        priority: 'high',
        module: 'auth',
        link: '/admin/audit-logs'
      });
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: 'Refresh Token is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Refresh token is not valid' });
    }

    const newToken = generateToken(user._id);
    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token is not valid' });
  }
};

// @desc    Update own profile (name, phone, photo) — works for all roles
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, photo, address, dateOfBirth, password } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (photo) user.photo = photo;
    if (address !== undefined) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (password) user.password = password; // pre-save hook will hash it

    await user.save();

    // Also update Employee record if one exists
    const Employee = require('../models/Employee');
    await Employee.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { 
        ...(name && { name }), 
        ...(phone && { phone }), 
        ...(photo && { photo }),
        ...(address !== undefined && { address }),
        ...(dateOfBirth && { dateOfBirth })
      } }
    );

    res.json({ message: 'Profile updated successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
