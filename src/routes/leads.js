import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, validateApiKey } from '../middleware/auth.js';
import * as leadModel from '../models/lead.js';
import * as conversationModel from '../models/conversation.js';
import * as businessModel from '../models/business.js';
import { startLeadConversation } from '../services/conversation.js';

const router = express.Router();

/**
 * Create a new lead
 * POST /api/leads
 */
router.post(
  '/',
  [
    validateApiKey,
    body('name').optional(),
    body('phone').optional(),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('source').optional()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      // Ensure at least one contact method is provided
      if (!req.body.phone && !req.body.email) {
        return res.status(400).json({ 
          error: true, 
          message: 'At least one contact method (phone or email) is required' 
        });
      }
      
      const businessId = req.business.id;
      
      // Create the lead
      const lead = await leadModel.createLead(businessId, req.body);
      
      // Start a conversation with the lead
      await startLeadConversation(lead.id, businessId);
      
      res.status(201).json({
        error: false,
        message: 'Lead created successfully',
        lead
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get all leads for a business
 * GET /api/leads
 */
router.get(
  '/',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Extract filter parameters
      const filters = {
        status: req.query.status,
        source: req.query.source,
        sortBy: req.query.sortBy,
        sortDesc: req.query.sortDesc === 'true',
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };
      
      // Get leads
      const leads = await leadModel.getLeadsByBusinessId(business.id, filters);
      
      res.json({
        error: false,
        leads,
        count: leads.length,
        filters
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get a specific lead by ID
 * GET /api/leads/:id
 */
router.get(
  '/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const leadId = req.params.id;
      const userId = req.user.id;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get lead
      const lead = await leadModel.getLeadById(leadId);
      
      // Check if lead belongs to this business
      if (!lead || lead.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Lead not found' });
      }
      
      // Get conversations for this lead
      const conversations = await conversationModel.getConversationsByLeadId(leadId);
      
      res.json({
        error: false,
        lead,
        conversations
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update a lead
 * PUT /api/leads/:id
 */
router.put(
  '/:id',
  [
    authenticate,
    body('name').optional(),
    body('phone').optional(),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('status').optional().isIn(['new', 'qualified', 'unqualified', 'converted', 'inactive']).withMessage('Invalid status')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const leadId = req.params.id;
      const userId = req.user.id;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get lead
      const lead = await leadModel.getLeadById(leadId);
      
      // Check if lead belongs to this business
      if (!lead || lead.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Lead not found' });
      }
      
      // Update lead
      const updatedLead = await leadModel.updateLeadInfo(leadId, {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        status: req.body.status
      });
      
      res.json({
        error: false,
        message: 'Lead updated successfully',
        lead: updatedLead
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update lead qualification data
 * POST /api/leads/:id/qualification
 */
router.post(
  '/:id/qualification',
  [
    authenticate,
    body('qualificationData').isObject().withMessage('Qualification data is required')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const leadId = req.params.id;
      const userId = req.user.id;
      const { qualificationData } = req.body;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get lead
      const lead = await leadModel.getLeadById(leadId);
      
      // Check if lead belongs to this business
      if (!lead || lead.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Lead not found' });
      }
      
      // Update qualification data
      const updatedLead = await leadModel.addLeadQualificationData(leadId, qualificationData);
      
      res.json({
        error: false,
        message: 'Lead qualification data updated successfully',
        lead: updatedLead
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as leadsRouter }; 