const jwt = require('jsonwebtoken');
const { touchOnlineUser } = require('../onlineUsers');
require('dotenv').config();

/**
 * Middleware to protect routes — verifies the JWT from the Authorization header.
 * Usage: router.get('/protected', authMiddleware, handler)
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    touchOnlineUser(decoded);
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Middleware to restrict access to admin-only routes.
 * Must be used AFTER authMiddleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
