const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '..', 'debug_auth.log');
    const logMsg = `[${new Date().toISOString()}] Email: ${req.user.email} | Role: '${req.user.role}' | Target: ${req.originalUrl}\n`;
    fs.appendFileSync(logPath, logMsg);

    if (!roles.includes(req.user.role)) {
      console.warn(`[AUTH] Access Denied for ${req.user.email}. Role: '${req.user.role}'. Required: [${roles.join(', ')}]`);
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
        debug: {
          userRole: req.user.role,
          requiredRoles: roles
        }
      });
    }
    next();
  };
};
