import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { leadsRouter } from './routes/leads.js';
import { webhooksRouter } from './routes/webhooks.js';
import { conversationsRouter } from './routes/conversations.js';
import { schedulingRouter } from './routes/scheduling.js';
import { dashboardRouter } from './routes/dashboard.js';
import { onboardingRouter } from './routes/onboarding.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger.requestLogger()); // Add request logging

// Routes
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/scheduling', schedulingRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/onboarding', onboardingRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LeadWell API is running' });
});

// No route found handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
  });
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', {
    promise,
    reason: reason?.stack || reason
  });
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught Exception:', { error: error?.stack || error });
  // Give the logger time to flush
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`LeadWell server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default server; 