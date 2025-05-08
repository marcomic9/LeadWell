import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as businessModel from '../models/business.js';
import * as userModel from '../models/user.js';

const router = express.Router();

/**
 * Set up business profile
 * POST /api/onboarding/business
 */
router.post(
  '/business',
  [
    authenticate,
    body('name').notEmpty().withMessage('Business name is required'),
    body('industry').notEmpty().withMessage('Industry is required'),
    body('services').notEmpty().withMessage('Services description is required'),
    body('timezone').notEmpty().withMessage('Timezone is required'),
    body('businessHours').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const userId = req.user.id;
      
      // Check if business already exists for this user
      const existingBusiness = await businessModel.getBusinessByUserId(userId);
      if (existingBusiness) {
        return res.status(400).json({ 
          error: true, 
          message: 'Business profile already exists for this user' 
        });
      }
      
      // Create business
      const business = await businessModel.createBusiness(userId, req.body);
      
      res.status(201).json({
        error: false,
        message: 'Business profile created successfully',
        business
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Configure virtual assistant
 * POST /api/onboarding/assistant
 */
router.post(
  '/assistant',
  [
    authenticate,
    body('role').notEmpty().withMessage('Assistant role is required'),
    body('tone').notEmpty().withMessage('Conversation tone is required'),
    body('greeting_message').optional(),
    body('required_info').notEmpty().withMessage('Required information is required'),
    body('enable_scheduling').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const userId = req.user.id;
      
      // Get business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found. Please complete business setup first.' });
      }
      
      // Check if assistant config already exists
      const existingConfig = await businessModel.getAssistantConfig(business.id);
      if (existingConfig) {
        return res.status(400).json({ 
          error: true, 
          message: 'Assistant already configured for this business' 
        });
      }
      
      // Create assistant configuration
      const assistantConfig = await businessModel.createAssistantConfig(business.id, req.body);
      
      res.status(201).json({
        error: false,
        message: 'Assistant configured successfully',
        assistantConfig
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update business profile
 * PUT /api/onboarding/business
 */
router.put(
  '/business',
  [
    authenticate,
    body('name').optional(),
    body('industry').optional(),
    body('services').optional(),
    body('timezone').optional(),
    body('website').optional(),
    body('businessHours').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const userId = req.user.id;
      
      // Get business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found. Please complete business setup first.' });
      }
      
      // Update business
      const updateData = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.industry) updateData.industry = req.body.industry;
      if (req.body.services) updateData.services = req.body.services;
      if (req.body.timezone) updateData.timezone = req.body.timezone;
      if (req.body.website) updateData.website = req.body.website;
      
      // Only update if there are fields to update
      let updatedBusiness = business;
      if (Object.keys(updateData).length > 0) {
        updatedBusiness = await businessModel.updateBusiness(business.id, updateData);
      }
      
      // Update business hours if provided
      if (req.body.businessHours && Array.isArray(req.body.businessHours)) {
        await businessModel.updateBusinessHours(business.id, req.body.businessHours);
      }
      
      // Get current business hours
      const businessHours = await businessModel.getBusinessHours(business.id);
      
      res.json({
        error: false,
        message: 'Business profile updated successfully',
        business: updatedBusiness,
        businessHours
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update assistant configuration
 * PUT /api/onboarding/assistant
 */
router.put(
  '/assistant',
  [
    authenticate,
    body('role').optional(),
    body('tone').optional(),
    body('greeting_message').optional(),
    body('required_info').optional(),
    body('enable_scheduling').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const userId = req.user.id;
      
      // Get business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found. Please complete business setup first.' });
      }
      
      // Get existing assistant config
      const existingConfig = await businessModel.getAssistantConfig(business.id);
      if (!existingConfig) {
        return res.status(404).json({ 
          error: true, 
          message: 'Assistant configuration not found. Please complete assistant setup first.' 
        });
      }
      
      // Update assistant configuration
      const updatedConfig = await businessModel.updateAssistantConfig(existingConfig.id, req.body);
      
      res.json({
        error: false,
        message: 'Assistant configuration updated successfully',
        assistantConfig: updatedConfig
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get onboarding status and data
 * GET /api/onboarding/status
 */
router.get(
  '/status',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Get business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      
      // Get assistant config if business exists
      let assistantConfig = null;
      let businessHours = [];
      if (business) {
        assistantConfig = await businessModel.getAssistantConfig(business.id);
        businessHours = await businessModel.getBusinessHours(business.id);
      }
      
      // Get calendar integration
      const calendarIntegration = await userModel.getCalendarCredentials(userId);
      
      res.json({
        error: false,
        onboardingStatus: {
          business: business ? true : false,
          assistant: assistantConfig ? true : false,
          calendar: calendarIntegration ? true : false
        },
        business,
        businessHours,
        assistantConfig,
        hasCalendarIntegration: !!calendarIntegration
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Connect calendar integration for meeting scheduling
 * POST /api/onboarding/calendar
 */
router.post(
  '/calendar',
  [
    authenticate,
    body('provider').notEmpty().withMessage('Calendar provider is required'),
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    body('accessToken').optional(),
    body('expiresAt').optional()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const userId = req.user.id;
      const { provider, refreshToken, accessToken, expiresAt } = req.body;
      
      // Store calendar credentials
      await userModel.storeCalendarCredentials(
        userId,
        provider,
        refreshToken,
        accessToken,
        expiresAt
      );
      
      res.json({
        error: false,
        message: 'Calendar integration set up successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as onboardingRouter }; 