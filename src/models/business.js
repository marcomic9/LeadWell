import supabase from '../config/supabase.js';

/**
 * Business Model for handling business settings and configurations
 */
export const createBusiness = async (userId, businessData) => {
  try {
    const { 
      name, 
      industry, 
      services, 
      website, 
      timezone, 
      businessHours = [] 
    } = businessData;

    // Insert business in Supabase
    const { data, error } = await supabase
      .from('businesses')
      .insert([
        { 
          user_id: userId,
          name, 
          industry, 
          services,
          website,
          timezone,
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) throw error;
    
    // Insert business hours if provided
    if (businessHours.length > 0) {
      const formattedHours = businessHours.map(hour => ({
        business_id: data[0].id,
        day: hour.day.toLowerCase(),
        start_time: hour.start,
        end_time: hour.end
      }));

      const { error: hoursError } = await supabase
        .from('business_hours')
        .insert(formattedHours);
      
      if (hoursError) throw hoursError;
    }
    
    return data[0];
  } catch (error) {
    console.error('Business Creation Error:', error);
    throw new Error(`Failed to create business: ${error.message}`);
  }
};

export const getBusinessById = async (businessId) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Business Error:', error);
    throw new Error(`Failed to fetch business: ${error.message}`);
  }
};

export const getBusinessByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error('Get Business By User Error:', error);
    throw new Error(`Failed to fetch business by user: ${error.message}`);
  }
};

export const updateBusiness = async (businessId, updates) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Update Business Error:', error);
    throw new Error(`Failed to update business: ${error.message}`);
  }
};

export const getBusinessHours = async (businessId) => {
  try {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Business Hours Error:', error);
    throw new Error(`Failed to fetch business hours: ${error.message}`);
  }
};

export const updateBusinessHours = async (businessId, hours) => {
  try {
    // First delete existing hours
    const { error: deleteError } = await supabase
      .from('business_hours')
      .delete()
      .eq('business_id', businessId);
    
    if (deleteError) throw deleteError;
    
    // Then insert new hours
    const formattedHours = hours.map(hour => ({
      business_id: businessId,
      day: hour.day.toLowerCase(),
      start_time: hour.start,
      end_time: hour.end
    }));

    const { data, error } = await supabase
      .from('business_hours')
      .insert(formattedHours)
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Update Business Hours Error:', error);
    throw new Error(`Failed to update business hours: ${error.message}`);
  }
};

export const createAssistantConfig = async (businessId, configData) => {
  try {
    const {
      role,
      tone,
      greeting_message,
      required_info,
      enable_scheduling = true
    } = configData;

    const { data, error } = await supabase
      .from('assistant_configs')
      .insert([
        {
          business_id: businessId,
          role,
          tone,
          greeting_message,
          required_info,
          enable_scheduling,
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Assistant Config Creation Error:', error);
    throw new Error(`Failed to create assistant config: ${error.message}`);
  }
};

export const getAssistantConfig = async (businessId) => {
  try {
    const { data, error } = await supabase
      .from('assistant_configs')
      .select('*')
      .eq('business_id', businessId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error('Get Assistant Config Error:', error);
    throw new Error(`Failed to fetch assistant config: ${error.message}`);
  }
};

export const updateAssistantConfig = async (configId, updates) => {
  try {
    const { data, error } = await supabase
      .from('assistant_configs')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', configId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Update Assistant Config Error:', error);
    throw new Error(`Failed to update assistant config: ${error.message}`);
  }
};

export default {
  createBusiness,
  getBusinessById,
  getBusinessByUserId,
  updateBusiness,
  getBusinessHours,
  updateBusinessHours,
  createAssistantConfig,
  getAssistantConfig,
  updateAssistantConfig
}; 