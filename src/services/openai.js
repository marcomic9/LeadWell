import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a response using GPT for lead conversations
 * 
 * @param {string} businessName - The client's business name
 * @param {string} industry - The client's industry
 * @param {string} services - Description of services offered
 * @param {string} tone - Desired conversation tone
 * @param {string} role - Role of the virtual assistant
 * @param {string} requiredInfo - Information needed from leads
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} userMessage - The lead's latest message
 * @returns {Promise<string>} The AI-generated response
 */
export const generateConversation = async (
  businessName,
  industry,
  services,
  tone,
  role,
  requiredInfo,
  conversationHistory,
  userMessage
) => {
  try {
    // Format previous conversation as context
    const formattedHistory = conversationHistory.map(msg => {
      return {
        role: msg.isFromLead ? 'user' : 'assistant',
        content: msg.content
      };
    });

    // Create system prompt from client configuration
    const systemPrompt = `You are a helpful ${role} for ${businessName}, a company in the ${industry} industry that offers ${services}. 
    Your tone should be ${tone}. Your goal is to qualify leads by collecting the following information: ${requiredInfo}.
    If appropriate in the conversation, suggest booking a meeting. Be natural, friendly and conversational.`;

    // Create the messages array for the GPT call
    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: userMessage }
    ];

    // Make the API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate response from AI');
  }
};

export default { generateConversation }; 