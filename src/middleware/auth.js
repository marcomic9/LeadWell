import jwt from 'jsonwebtoken';
import { getUserById } from '../models/user.js';
import supabase from '../config/supabase.js';

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: true, message: 'Authentication token is required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid token or user not found' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: true, message: 'User account is inactive' });
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: true, message: 'Invalid or expired token' });
    }
    
    next(error);
  }
};

/**
 * Generate JWT token for authenticated user
 * 
 * @param {object} user - User object
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Middleware to check if request has a valid API key
 */
export const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: true, message: 'API key is required' });
    }
    
    // Verify the API key against the database
    const { data, error } = await supabase
      .from('api_keys')
      .select('*, businesses(*)')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      return res.status(401).json({ error: true, message: 'Invalid API key' });
    }
    
    // Attach business info to request
    req.business = data.businesses;
    req.apiKey = data;
    
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  authenticate,
  generateToken,
  validateApiKey
}; 