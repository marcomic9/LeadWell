import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as conversationModel from '../models/conversation.js';
import * as leadModel from '../models/lead.js';
import * as businessModel from '../models/business.js';
import * as openaiService from '../services/openai.js';
import * as twilioService from '../services/twilio.js';

const router = express.Router();

/**
 * Get all conversations for a lead
 * GET /api/conversations/lead/:leadId
 */
router.get(
  '/lead/:leadId',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const leadId = req.params.leadId;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get lead and verify it belongs to this business
      const lead = await leadModel.getLeadById(leadId);
      if (!lead || lead.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Lead not found' });
      }
      
      // Get conversations for this lead
      const conversations = await conversationModel.getConversationsByLeadId(leadId);
      
      res.json({
        error: false,
        conversations
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get a specific conversation with messages
 * GET /api/conversations/:id
 */
router.get(
  '/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get conversation
      const conversation = await conversationModel.getConversationById(conversationId);
      
      // Check if conversation belongs to this business
      if (!conversation || conversation.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Conversation not found' });
      }
      
      // Get messages
      const messages = await conversationModel.getMessagesByConversationId(conversationId);
      
      // Get lead info
      const lead = await leadModel.getLeadById(conversation.lead_id);
      
      res.json({
        error: false,
        conversation,
        messages,
        lead
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Send a message to a lead through the AI assistant
 * POST /api/conversations/:id/message
 */
router.post(
  '/:id/message',
  [
    authenticate,
    body('message').notEmpty().withMessage('Message content is required')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const userId = req.user.id;
      const conversationId = req.params.id;
      const { message } = req.body;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get conversation
      const conversation = await conversationModel.getConversationById(conversationId);
      
      // Check if conversation belongs to this business
      if (!conversation || conversation.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Conversation not found' });
      }
      
      // Get lead info
      const lead = await leadModel.getLeadById(conversation.lead_id);
      
      // Add message to conversation (human-sent, not from lead)
      const sentMessage = await conversationModel.addMessage(
        conversationId, 
        message, 
        false, 
        { sent_by_user_id: userId }
      );
      
      // Send message to lead via Twilio if phone exists
      if (lead.phone) {
        await twilioService.sendMessage(lead.phone, message, lead.contact_channel);
      }
      
      res.json({
        error: false,
        message: 'Message sent successfully',
        sentMessage
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Generate and send an AI response to a lead
 * POST /api/conversations/:id/ai-response
 */
router.post(
  '/:id/ai-response',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get conversation
      const conversation = await conversationModel.getConversationById(conversationId);
      
      // Check if conversation belongs to this business
      if (!conversation || conversation.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Conversation not found' });
      }
      
      // Get lead info
      const lead = await leadModel.getLeadById(conversation.lead_id);
      
      // Get assistant configuration
      const assistantConfig = await businessModel.getAssistantConfig(business.id);
      
      if (!assistantConfig) {
        return res.status(400).json({ error: true, message: 'Assistant configuration not found' });
      }
      
      // Get recent conversation history
      const conversationHistory = await conversationModel.getRecentMessages(conversationId, 20);
      
      // Check if there are any messages in the conversation
      if (conversationHistory.length === 0) {
        return res.status(400).json({ 
          error: true, 
          message: 'Cannot generate AI response for an empty conversation' 
        });
      }
      
      // Get the last message from the lead for context
      const lastLeadMessage = conversationHistory.filter(msg => msg.is_from_lead).pop();
      
      if (!lastLeadMessage) {
        return res.status(400).json({ 
          error: true, 
          message: 'No lead messages found in this conversation to respond to' 
        });
      }
      
      // Generate AI response
      const aiResponse = await openaiService.generateConversation(
        business.name,
        business.industry,
        business.services,
        assistantConfig.tone,
        assistantConfig.role,
        assistantConfig.required_info,
        conversationHistory,
        lastLeadMessage.content
      );
      
      // Add AI response to conversation
      const sentMessage = await conversationModel.addMessage(
        conversationId, 
        aiResponse, 
        false,
        { generated_by_ai: true }
      );
      
      // Send response to lead via Twilio if phone exists
      if (lead.phone) {
        await twilioService.sendMessage(lead.phone, aiResponse, lead.contact_channel);
      }
      
      res.json({
        error: false,
        message: 'AI response sent successfully',
        sentMessage,
        aiResponse
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Start a new conversation with a lead
 * POST /api/conversations/lead/:leadId/start
 */
router.post(
  '/lead/:leadId/start',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const leadId = req.params.leadId;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get lead and verify it belongs to this business
      const lead = await leadModel.getLeadById(leadId);
      if (!lead || lead.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Lead not found' });
      }
      
      // Get assistant configuration
      const assistantConfig = await businessModel.getAssistantConfig(business.id);
      
      if (!assistantConfig) {
        return res.status(400).json({ error: true, message: 'Assistant configuration not found' });
      }
      
      // Create initial greeting message
      const greeting = assistantConfig.greeting_message || 
        `Hi there! I'm the virtual assistant for ${business.name}. How can I help you today?`;
      
      // Start conversation
      const conversation = await conversationModel.startConversation(leadId, business.id, greeting);
      
      // Send the greeting message to the lead
      if (lead.phone) {
        await twilioService.sendMessage(lead.phone, greeting, lead.contact_channel);
      }
      
      res.json({
        error: false,
        message: 'Conversation started successfully',
        conversation
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Close/Archive a conversation
 * PUT /api/conversations/:id/close
 */
router.put(
  '/:id/close',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get conversation
      const conversation = await conversationModel.getConversationById(conversationId);
      
      // Check if conversation belongs to this business
      if (!conversation || conversation.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Conversation not found' });
      }
      
      // Close the conversation
      const updatedConversation = await conversationModel.updateConversationStatus(
        conversationId, 
        'closed'
      );
      
      res.json({
        error: false,
        message: 'Conversation closed successfully',
        conversation: updatedConversation
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as conversationsRouter }; 