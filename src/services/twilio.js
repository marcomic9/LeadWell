import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Missing Twilio credentials. Please check your .env file.');
}

const client = twilio(accountSid, authToken);

/**
 * Send a message to a lead via WhatsApp
 * 
 * @param {string} to - Lead's WhatsApp number in format: whatsapp:+1234567890
 * @param {string} message - Message content to send
 * @returns {Promise<object>} - Twilio message response
 */
export const sendWhatsAppMessage = async (to, message) => {
  try {
    return await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`
    });
  } catch (error) {
    console.error('Twilio WhatsApp Error:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
};

/**
 * Send an SMS to a lead
 * 
 * @param {string} to - Lead's phone number
 * @param {string} message - Message content to send
 * @returns {Promise<object>} - Twilio message response
 */
export const sendSMS = async (to, message) => {
  try {
    return await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
  } catch (error) {
    console.error('Twilio SMS Error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Send a message via any supported Twilio channel
 * 
 * @param {string} to - Recipient contact info
 * @param {string} message - Message content
 * @param {string} channel - Channel to use ('whatsapp', 'sms', etc.)
 * @returns {Promise<object>} - Twilio message response
 */
export const sendMessage = async (to, message, channel) => {
  switch (channel.toLowerCase()) {
    case 'whatsapp':
      return sendWhatsAppMessage(to, message);
    case 'sms':
      return sendSMS(to, message);
    default:
      throw new Error(`Unsupported channel: ${channel}`);
  }
};

export default { sendWhatsAppMessage, sendSMS, sendMessage }; 