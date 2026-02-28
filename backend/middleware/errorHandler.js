// Error handling middleware
// Centralizes all error responses and logging

const errorHandler = (err, req, res, next) => {
  // Log the error for debugging (you see this in terminal)
  console.error('❌ Error occurred:');
  console.error('   Path:', req.method, req.path);
  console.error('   Message:', err.message);
  console.error('   Stack:', err.stack);

  // Determine error type and send appropriate response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation errors
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.name === 'CastError') {
    // Invalid MongoDB ID format
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    // Duplicate key error (e.g., email already exists)
    statusCode = 400;
    message = 'This email is already registered';
  }

  if (err.name === 'JsonWebTokenError') {
    // Invalid JWT token
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    // Expired JWT token
    statusCode = 401;
    message = 'Your session has expired. Please login again.';
  }

  // Send clean error response to client
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Show stack only in dev
  });
};

// Not Found handler - for routes that don't exist
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async handler wrapper - removes try/catch from routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};

// This replaces all the try/catch blocks in your routes!
// Usage:
// router.get('/', asyncHandler(async (req, res) => {
//   const data = await someAsyncFunction();
//   res.json(data);
// }));