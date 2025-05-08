import supabase from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Lead Model for handling leads and their data
 */
export const createLead = async (businessId, leadData) => {
  try {
    const { 
      name,
      phone,
      email,
      source,
      contact_channel = 'whatsapp',
      additional_info = {}
    } = leadData;

    // Insert lead in Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        { 
          id: uuidv4(),
          business_id: businessId,
          name, 
          phone,
          email,
          source,
          contact_channel,
          status: 'new',
          additional_info,
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Lead Creation Error:', error);
    throw new Error(`Failed to create lead: ${error.message}`);
  }
};

export const getLeadById = async (leadId) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Lead Error:', error);
    throw new Error(`Failed to fetch lead: ${error.message}`);
  }
};

export const getLeadsByBusinessId = async (businessId, filters = {}) => {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .eq('business_id', businessId);
    
    // Apply filters if provided
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    
    // Apply sorting
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortDesc ? 'desc' : 'asc';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Leads Error:', error);
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }
};

export const updateLeadInfo = async (leadId, updates) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', leadId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Update Lead Error:', error);
    throw new Error(`Failed to update lead: ${error.message}`);
  }
};

export const updateLeadStatus = async (leadId, status) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('id', leadId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Update Lead Status Error:', error);
    throw new Error(`Failed to update lead status: ${error.message}`);
  }
};

export const addLeadQualificationData = async (leadId, qualificationData) => {
  try {
    // Get the current lead
    const lead = await getLeadById(leadId);
    
    // Merge the new qualification data with any existing data
    const updatedInfo = { 
      ...lead.additional_info,
      qualification_data: {
        ...(lead.additional_info?.qualification_data || {}),
        ...qualificationData
      }
    };
    
    // Update the lead
    const { data, error } = await supabase
      .from('leads')
      .update({
        additional_info: updatedInfo,
        updated_at: new Date()
      })
      .eq('id', leadId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Add Lead Qualification Error:', error);
    throw new Error(`Failed to add lead qualification data: ${error.message}`);
  }
};

export const getLeadsByPhone = async (phone) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', phone);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Leads By Phone Error:', error);
    throw new Error(`Failed to fetch leads by phone: ${error.message}`);
  }
};

export default {
  createLead,
  getLeadById,
  getLeadsByBusinessId,
  updateLeadInfo,
  updateLeadStatus,
  addLeadQualificationData,
  getLeadsByPhone
}; 