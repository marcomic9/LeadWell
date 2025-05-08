import * as openaiService from './openai.js';
import * as twilioService from './twilio.js';
import * as leadModel from '../models/lead.js';
import * as conversationModel from '../models/conversation.js';
import * as businessModel from '../models/business.js';

/**
 * Start a conversation with a new lead
 * 
 * @param {string} leadId - ID of the lead
 * @param {string} businessId - ID of the business
 * @returns {Promise<object>} - Created conversation
 */
export const startLeadConversation = async (leadId, businessId) => {
  try {
    // Get the lead
    const lead = await leadModel.getLeadById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    // Get business information and assistant configuration
    const business = await businessModel.getBusinessById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }
    
    const assistantConfig = await businessModel.getAssistantConfig(businessId);
    if (!assistantConfig) {
      throw new Error('Assistant configuration not found');
    }
    
    // Create initial greeting message
    const greeting = assistantConfig.greeting_message || 
      `Hi there! I'm the virtual assistant for ${business.name}. How can I help you today?`;
    
    // Start conversation
    const conversation = await conversationModel.startConversation(leadId, businessId, greeting);
    
    // Send the greeting message to the lead
    if (lead.phone) {
      await twilioService.sendMessage(lead.phone, greeting, lead.contact_channel);
    }
    
    return conversation;
  } catch (error) {
    console.error('Start Lead Conversation Error:', error);
    throw new Error(`Failed to start lead conversation: ${error.message}`);
  }
};

/**
 * Process an incoming message from a lead
 * 
 * @param {string} phone - Lead's phone number
 * @param {string} message - Message content
 * @param {string} channel - Communication channel
 * @returns {Promise<object>} - AI response
 */
export const processIncomingMessage = async (phone, message, channel = 'whatsapp') => {
  try {
    // Find the lead by phone number
    const leads = await leadModel.getLeadsByPhone(phone);
    if (!leads || leads.length === 0) {
      throw new Error('Lead not found for this phone number');
    }
    
    // Use the most recent lead if multiple exist with the same phone
    const lead = leads[0];
    
    // Get or create active conversation
    let conversation = await conversationModel.getActiveConversationByLeadId(lead.id);
    
    if (!conversation) {
      // If no active conversation exists, start a new one
      conversation = await conversationModel.startConversation(lead.id, lead.business_id);
    }
    
    // Add the incoming message to conversation
    await conversationModel.addMessage(conversation.id, message, true);
    
    // Get business and assistant configuration
    const business = await businessModel.getBusinessById(lead.business_id);
    const assistantConfig = await businessModel.getAssistantConfig(lead.business_id);
    
    if (!business || !assistantConfig) {
      throw new Error('Business or assistant configuration not found');
    }
    
    // Get recent conversation history for context
    const conversationHistory = await conversationModel.getRecentMessages(conversation.id, 20);
    
    // Generate AI response
    const aiResponse = await openaiService.generateConversation(
      business.name,
      business.industry,
      business.services,
      assistantConfig.tone,
      assistantConfig.role,
      assistantConfig.required_info,
      conversationHistory,
      message
    );
    
    // Save AI response to conversation
    await conversationModel.addMessage(conversation.id, aiResponse, false);
    
    // Send response back to the lead
    await twilioService.sendMessage(phone, aiResponse, channel);
    
    // Extract and store qualification data from the conversation
    await extractQualificationData(lead.id, conversation.id, assistantConfig.required_info);
    
    return {
      lead,
      conversation,
      response: aiResponse
    };
  } catch (error) {
    console.error('Process Incoming Message Error:', error);
    throw new Error(`Failed to process incoming message: ${error.message}`);
  }
};

/**
 * Extract qualification data from conversation history
 * 
 * @param {string} leadId - ID of the lead
 * @param {string} conversationId - ID of the conversation
 * @param {string} requiredInfo - Information required from the lead
 */
const extractQualificationData = async (leadId, conversationId, requiredInfo) => {
  try {
    // Get the conversation messages
    const messages = await conversationModel.getMessagesByConversationId(conversationId);
    
    // In a real implementation, you would use a more sophisticated extraction method
    // For now, we'll use a simple approach that looks for key phrases
    
    const qualificationData = {};
    const requiredFields = requiredInfo.split(',').map(field => field.trim().toLowerCase());
    
    // Look for patterns in the conversation that might indicate qualification data
    // This is a very simplistic approach and would be much more sophisticated in a real system
    for (const field of requiredFields) {
      for (const message of messages) {
        if (!message.is_from_lead) continue; // Only analyze lead messages
        
        const content = message.content.toLowerCase();
        
        if (field === 'budget' && content.includes('budget')) {
          // Simplistic budget extraction - look for numbers near 'budget'
          const budgetMatch = content.match(/budget\s*(?:is|of|:)?\s*[\$£€]?\s*(\d+[,\d]*)/i);
          if (budgetMatch) {
            qualificationData.budget = budgetMatch[1].replace(/,/g, '');
          }
        }
        
        if (field === 'timeline' && (content.includes('timeline') || content.includes('time frame'))) {
          // Simple timeline extraction
          if (content.includes('month')) {
            qualificationData.timeline = 'months';
          } else if (content.includes('week')) {
            qualificationData.timeline = 'weeks';
          } else if (content.includes('day')) {
            qualificationData.timeline = 'days';
          }
        }
        
        // Add more field extraction logic as needed
      }
    }
    
    // Only update if we found some qualification data
    if (Object.keys(qualificationData).length > 0) {
      await leadModel.addLeadQualificationData(leadId, qualificationData);
    }
  } catch (error) {
    console.error('Extract Qualification Data Error:', error);
    // Don't throw here, just log the error, as this is a background process
  }
};

export default {
  startLeadConversation,
  processIncomingMessage
}; 