const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    if (decoded.type !== 'access') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token type'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or no longer exists'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account has been deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error.message);
    
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please log in again.',
      error: error.message
    });
  }
};

/**
 * Optional authentication
 * Attaches user if token is provided but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (decoded.type === 'access') {
      const user = await User.findById(decoded.id).select('-password');
      req.user = user && user.isActive ? user : null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Check if user is room host
 */
const isRoomHost = (room, userId) => {
  return room.host.toString() === userId.toString();
};

module.exports = {
  authenticate,
  optionalAuth,
  isRoomHost
};
