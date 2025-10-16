const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. Please provide a valid token.',
        details: 'No token provided in Authorization or x-auth-token header',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, isAdmin }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired. Please login again.',
        details: error.message,
      });
    }
    return res.status(401).json({
      message: 'Invalid token. Please login again.',
      details: error.message,
    });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin privileges required.',
        details: 'User is not an admin',
      });
    }
    next();
  });
};

module.exports = { auth, adminAuth };