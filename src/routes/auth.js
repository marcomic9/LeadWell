import express from 'express';
import { body, validationResult } from 'express-validator';
import * as userModel from '../models/user.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('companyName').notEmpty().withMessage('Company name is required')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const { email, password, name, companyName } = req.body;
      
      // Check if user already exists
      const existingUser = await userModel.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: true, message: 'User with this email already exists' });
      }
      
      // Create user
      const user = await userModel.createUser(email, password, name, companyName);
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return user and token
      res.status(201).json({
        error: false,
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyName: user.company_name
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Login user
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const { email, password } = req.body;
      
      // Get user by email
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: true, message: 'Invalid email or password' });
      }
      
      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({ error: true, message: 'Your account is inactive' });
      }
      
      // Verify password
      const isPasswordValid = await userModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: true, message: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return user and token
      res.json({
        error: false,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyName: user.company_name
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Change password
 * POST /api/auth/change-password
 */
router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      // Get user
      const user = await userModel.getUserById(userId);
      
      // Verify current password
      const isPasswordValid = await userModel.verifyPassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: true, message: 'Current password is incorrect' });
      }
      
      // Update password
      await userModel.updateUser(userId, { password: newPassword });
      
      res.json({
        error: false,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Forgot password
 * POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please enter a valid email')
  ],
  async (req, res, next) => {
    try {
      // In a real implementation, this would send a password reset email
      // For now, we'll just return a success message
      
      res.json({
        error: false,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as authRouter }; 