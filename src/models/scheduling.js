import supabase from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Scheduling Model for handling meeting scheduling functionality
 */
export const createMeeting = async (
  leadId,
  businessId,
  conversationId,
  meetingData
) => {
  try {
    const {
      title,
      description,
      start_time,
      end_time,
      timezone,
      status = 'scheduled',
      location,
      google_event_id,
      outlook_event_id,
      additional_info = {}
    } = meetingData;

    const { data, error } = await supabase
      .from('meetings')
      .insert([
        {
          id: uuidv4(),
          lead_id: leadId,
          business_id: businessId,
          conversation_id: conversationId,
          title,
          description,
          start_time,
          end_time,
          timezone,
          status,
          location,
          google_event_id,
          outlook_event_id,
          additional_info,
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Meeting Creation Error:', error);
    throw new Error(`Failed to create meeting: ${error.message}`);
  }
};

export const getMeetingById = async (meetingId) => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Meeting Error:', error);
    throw new Error(`Failed to fetch meeting: ${error.message}`);
  }
};

export const getMeetingsByBusinessId = async (businessId, filters = {}) => {
  try {
    let query = supabase
      .from('meetings')
      .select('*, leads(*)')
      .eq('business_id', businessId);
    
    // Apply filters if provided
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('start_time', filters.endDate);
    }
    
    // Apply sorting
    const sortField = filters.sortBy || 'start_time';
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
    console.error('Get Meetings Error:', error);
    throw new Error(`Failed to fetch meetings: ${error.message}`);
  }
};

export const getMeetingsByLeadId = async (leadId) => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('lead_id', leadId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Lead Meetings Error:', error);
    throw new Error(`Failed to fetch meetings for lead: ${error.message}`);
  }
};

export const updateMeetingStatus = async (meetingId, status) => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('id', meetingId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Update Meeting Status Error:', error);
    throw new Error(`Failed to update meeting status: ${error.message}`);
  }
};

export const updateMeeting = async (meetingId, updates) => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', meetingId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Update Meeting Error:', error);
    throw new Error(`Failed to update meeting: ${error.message}`);
  }
};

export const deleteMeeting = async (meetingId) => {
  try {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Delete Meeting Error:', error);
    throw new Error(`Failed to delete meeting: ${error.message}`);
  }
};

export default {
  createMeeting,
  getMeetingById,
  getMeetingsByBusinessId,
  getMeetingsByLeadId,
  updateMeetingStatus,
  updateMeeting,
  deleteMeeting
}; 