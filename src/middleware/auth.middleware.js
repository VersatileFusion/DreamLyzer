const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
const protect = async (req, res, next) => {
  console.log('Auth middleware - Checking authentication');
  
  let token;
  
  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth middleware - Token found in headers');
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_in_production');
      console.log('Auth middleware - Token verified:', { userId: decoded.id });
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('Auth middleware - User not found for token ID:', decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      console.log('Auth middleware - Authentication successful:', { 
        userId: req.user._id, 
        username: req.user.username 
      });
      
      next();
    } catch (error) {
      console.error('Auth middleware - Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('Auth middleware - No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect }; 