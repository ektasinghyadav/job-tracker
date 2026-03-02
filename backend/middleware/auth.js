// Middleware to check if user is authenticated
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from request header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided. Please login.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user id to request so routes can use it
    req.userId = decoded.userId;

    // Only log in development — avoids leaking user IDs in production logs
    if (process.env.NODE_ENV === 'development') {
      console.log('User authenticated:', req.userId);
    }

    next();
  } catch (error) {
    console.log('Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid token. Please login again.' });
  }
};

module.exports = authMiddleware;