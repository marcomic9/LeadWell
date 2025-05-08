import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Get error details
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  
  // Log the error with appropriate level based on status code
  if (statusCode >= 500) {
    logger.error(`Server Error: ${message}`, {
      statusCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      stack: err.stack
    });
  } else {
    logger.warn(`Client Error: ${message}`, {
      statusCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  }
  
  // Send error response
  res.status(statusCode).json({
    error: true,
    message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}; 