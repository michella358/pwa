const jwt = require('jsonwebtoken');

// Conditional import berdasarkan environment
let User;
if (process.env.USE_MOCK_MODELS === 'true') {
  console.log('🔧 Using mock User model in auth middleware');
  User = require('../models/mock/User');
} else {
  console.log('🔧 Using Supabase User model in auth middleware');
  User = require('../models/supabase/User');
}

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin_master') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is client
const isClient = (req, res, next) => {
  if (req.user && req.user.role === 'client') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Client privileges required.' });
  }
};

// Middleware to check if user is verified
const isVerified = (req, res, next) => {
  if (req.user && req.user.verified) {
    next();
  } else {
    res.status(403).json({ message: 'Account not verified. Please verify your WhatsApp number.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isClient,
  isVerified
};