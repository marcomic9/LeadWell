import supabase from '../config/supabase.js';
import bcrypt from 'bcrypt';

/**
 * User/Client Model for handling user accounts and authentication
 */
export const createUser = async (email, password, name, companyName) => {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user in Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          name,
          company_name: companyName,
          is_active: true,
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('User Creation Error:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get User Error:', error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error('Get User By Email Error:', error);
    throw new Error(`Failed to fetch user by email: ${error.message}`);
  }
};

export const updateUser = async (userId, updates) => {
  try {
    // If password is being updated, hash it first
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Update User Error:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const deactivateUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Deactivate User Error:', error);
    throw new Error(`Failed to deactivate user: ${error.message}`);
  }
};

export const storeCalendarCredentials = async (userId, provider, refreshToken, accessToken, expiresAt) => {
  try {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .upsert([
        {
          user_id: userId,
          provider,
          refresh_token: refreshToken,
          access_token: accessToken,
          expires_at: expiresAt,
          updated_at: new Date()
        }
      ])
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Store Calendar Credentials Error:', error);
    throw new Error(`Failed to store calendar credentials: ${error.message}`);
  }
};

export const getCalendarCredentials = async (userId, provider = 'google') => {
  try {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error('Get Calendar Credentials Error:', error);
    throw new Error(`Failed to get calendar credentials: ${error.message}`);
  }
};

export default {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  verifyPassword,
  deactivateUser,
  storeCalendarCredentials,
  getCalendarCredentials
}; 