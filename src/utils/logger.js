import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const debugLogPath = path.join(logsDir, 'debug.log');
const errorLogPath = path.join(logsDir, 'error.log');
const accessLogPath = path.join(logsDir, 'access.log');

// Log levels
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

// ANSI colors for console output
const Colors = {
  reset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m'
};

// Log level colors
const levelColors = {
  [LogLevel.DEBUG]: Colors.cyan,
  [LogLevel.INFO]: Colors.green,
  [LogLevel.WARN]: Colors.yellow,
  [LogLevel.ERROR]: Colors.red,
  [LogLevel.FATAL]: Colors.brightRed
};

// Current environment
const environment = process.env.NODE_ENV || 'development';

// Only show debug logs in development
const minConsoleLevel = environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

/**
 * Format a log message
 * 
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 * @returns {string} Formatted log entry
 */
const formatLogEntry = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

/**
 * Write a log entry to file
 * 
 * @param {string} filePath - Path to log file
 * @param {string} entry - Log entry
 */
const writeToFile = (filePath, entry) => {
  try {
    fs.appendFileSync(filePath, entry + '\n');
  } catch (error) {
    console.error(`Failed to write to log file ${filePath}:`, error);
  }
};

/**
 * Write log to console with color
 * 
 * @param {string} level - Log level
 * @param {string} entry - Log entry
 */
const writeToConsole = (level, entry) => {
  const levelOrder = Object.values(LogLevel);
  const minLevelIndex = levelOrder.indexOf(minConsoleLevel);
  const currentLevelIndex = levelOrder.indexOf(level);

  // Only log if current level is equal or above minimum level
  if (currentLevelIndex >= minLevelIndex) {
    const color = levelColors[level] || Colors.reset;
    console.log(`${color}${entry}${Colors.reset}`);
  }
};

/**
 * Log a message
 * 
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 */
const log = (level, message, meta = {}) => {
  const entry = formatLogEntry(level, message, meta);
  
  // Always write to debug log
  writeToFile(debugLogPath, entry);
  
  // Write errors to error log
  if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
    writeToFile(errorLogPath, entry);
  }
  
  // Write to console with color
  writeToConsole(level, entry);
};

/**
 * Log HTTP requests
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
const logRequest = (req, res, duration) => {
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || '';
  const statusCode = res.statusCode;
  const contentLength = res.get('content-length') || 0;

  // Format: timestamp [method] url status duration ip user-agent
  const entry = `[${timestamp}] [${method}] ${originalUrl} ${statusCode} ${duration}ms ${contentLength}b ${ip} "${userAgent}"`;
  
  writeToFile(accessLogPath, entry);
  
  // Log to console in development
  if (environment === 'development') {
    const color = statusCode >= 400 ? Colors.red : statusCode >= 300 ? Colors.yellow : Colors.green;
    console.log(`${color}${entry}${Colors.reset}`);
  }
};

/**
 * Create an Express middleware for request logging
 * 
 * @returns {function} Express middleware
 */
const requestLogger = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Capture response finishing
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logRequest(req, res, duration);
    });
    
    next();
  };
};

// Export public API
const logger = {
  debug: (message, meta) => log(LogLevel.DEBUG, message, meta),
  info: (message, meta) => log(LogLevel.INFO, message, meta),
  warn: (message, meta) => log(LogLevel.WARN, message, meta),
  error: (message, meta) => log(LogLevel.ERROR, message, meta),
  fatal: (message, meta) => log(LogLevel.FATAL, message, meta),
  requestLogger
};

export default logger; 