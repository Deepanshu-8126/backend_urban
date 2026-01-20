const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ 
      success: false, 
      error: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'urban_secret');
    req.user = decoded;
    console.log('✅ Token verified for user:', decoded.email);
    next();
  } catch (error) {
    console.log('❌ Invalid token:', error.message);
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid token. Please login again.' 
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. Admin only.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  adminOnly
};