import supabase from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Conversation Model for handling message histories between leads and assistants
 */
export const startConversation = async (leadId, businessId, initialMessage = null) => {
  try {
    // Create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          id: uuidv4(),
          lead_id: leadId,
          business_id: businessId,
          status: 'active',
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) throw error;
    
    // If an initial message was provided, add it to the conversation
    if (initialMessage) {
      await addMessage(data[0].id, initialMessage, false);
    }
    
    return data[0];
  } catch (error) {
    console.error('Conversation Creation Error:', error);
    throw new Error(`Failed to start conversation: ${error.message}`);
  }
};

export const getConversationById = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Conversation Error:', error);
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }
};

export const getConversationsByLeadId = async (leadId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Conversations By Lead Error:', error);
    throw new Error(`Failed to fetch conversations by lead: ${error.message}`);
  }
};

export const getActiveConversationByLeadId = async (leadId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error('Get Active Conversation Error:', error);
    throw new Error(`Failed to fetch active conversation: ${error.message}`);
  }
};

export const updateConversationStatus = async (conversationId, status) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('id', conversationId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Update Conversation Status Error:', error);
    throw new Error(`Failed to update conversation status: ${error.message}`);
  }
};

export const addMessage = async (conversationId, content, isFromLead, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          id: uuidv4(),
          conversation_id: conversationId,
          content,
          is_from_lead: isFromLead,
          metadata,
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) throw error;
    
    // Update the conversation's last_message_at
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', conversationId);
    
    return data[0];
  } catch (error) {
    console.error('Add Message Error:', error);
    throw new Error(`Failed to add message: ${error.message}`);
  }
};

export const getMessagesByConversationId = async (conversationId, limit = 100, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Messages Error:', error);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
};

export const getRecentMessages = async (conversationId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Return messages in chronological order
    return data.reverse();
  } catch (error) {
    console.error('Get Recent Messages Error:', error);
    throw new Error(`Failed to fetch recent messages: ${error.message}`);
  }
};

export default {
  startConversation,
  getConversationById,
  getConversationsByLeadId,
  getActiveConversationByLeadId,
  updateConversationStatus,
  addMessage,
  getMessagesByConversationId,
  getRecentMessages
}; 