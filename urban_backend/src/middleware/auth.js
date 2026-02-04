const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// ✅ AUTHENTICATE TOKEN - WORKING VERSION
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'urban_secret');

    // Find user in both collections to verify existence
    let userExists = await User.findById(decoded.id);
    let adminExists = null;

    if (!userExists) {
      adminExists = await Admin.findById(decoded.id);
      if (!adminExists) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }
    }

    // ✅ SET FULL USER OBJECT (NOT JUST DECODED TOKEN)
    if (userExists) {
      req.user = userExists;
    } else {
      req.user = adminExists;
    }
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired.' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

// ✅ ADMIN ONLY MIDDLEWARE
const adminOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'Admin')) {
    return res.status(403).json({ success: false, error: 'Access denied. Admin only.' });
  }
  next();
};

const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'urban_secret');

    // Find user in both collections
    let userExists = await User.findById(decoded.id);
    let adminExists = null;

    if (!userExists) {
      adminExists = await Admin.findById(decoded.id);
    }

    if (userExists) {
      req.user = userExists;
    } else if (adminExists) {
      req.user = adminExists;
    } else {
      req.user = null;
    }
    next();

  } catch (error) {
    // If token is invalid or expired, just treat as guest
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  adminOnly
};