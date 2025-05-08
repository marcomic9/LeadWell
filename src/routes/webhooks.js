import express from 'express';
import { processIncomingMessage } from '../services/conversation.js';

const router = express.Router();

/**
 * Twilio Webhook for Incoming Messages
 * POST /api/webhooks/twilio/incoming
 * 
 * This endpoint handles incoming messages from Twilio (WhatsApp, SMS, etc.)
 */
router.post('/twilio/incoming', async (req, res, next) => {
  try {
    // Extract info from Twilio webhook payload
    const from = req.body.From;
    const body = req.body.Body;
    
    // Determine which channel this is coming from
    let channel = 'sms';
    if (from && from.startsWith('whatsapp:')) {
      channel = 'whatsapp';
    }
    
    // Process the message
    // For WhatsApp, Twilio prefixes numbers with "whatsapp:" - let's remove that prefix
    const phoneNumber = from.replace('whatsapp:', '');
    
    // Process the message asynchronously, don't wait for it to complete
    // This ensures we respond to Twilio quickly to avoid timeout errors
    processIncomingMessage(phoneNumber, body, channel)
      .catch(error => console.error('Webhook processing error:', error));
    
    // Return empty TwiML response to acknowledge receipt
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  } catch (error) {
    console.error('Twilio Webhook Error:', error);
    
    // Even in case of error, we need to return a 200 response to Twilio
    // to prevent them from retrying, as retries won't fix the issue
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  }
});

/**
 * Generic Webhook for Other Integrations
 * POST /api/webhooks/generic
 * 
 * This endpoint can be used for other integration services that need to send lead data
 */
router.post('/generic', async (req, res, next) => {
  try {
    const { apiKey, lead } = req.body;
    
    if (!apiKey) {
      return res.status(401).json({ error: true, message: 'API key is required' });
    }
    
    if (!lead || (!lead.phone && !lead.email)) {
      return res.status(400).json({ 
        error: true, 
        message: 'Lead data is required and must include phone or email' 
      });
    }
    
    // Validate API key against database in a real implementation
    // For now, acknowledge receipt
    
    res.status(202).json({
      error: false,
      message: 'Webhook received successfully',
      status: 'processing'
    });
    
    // Process lead creation in the background
    // This would be implemented in a real system to create the lead
    // and start a conversation
    
  } catch (error) {
    next(error);
  }
});

export { router as webhooksRouter };