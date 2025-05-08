import { validationResult } from 'express-validator';

/**
 * Centralized validation middleware that handles validation results
 * from express-validator and standardizes error responses
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format validation errors for consistent response
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Generic data validation utility for validating objects against schemas
 * outside of HTTP request contexts
 * 
 * @param {object} data - Data to validate
 * @param {object} schema - Schema with validation rules
 * @returns {object} - Validation result with isValid and errors
 */
export const validateData = (data, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: rules.message || `${field} is required`,
        rule: 'required'
      });
      continue; // Skip other validation if required field is missing
    }
    
    // Skip other validations if field is not provided and not required
    if (value === undefined || value === null) continue;
    
    // Type checks
    if (rules.type) {
      let valid = true;
      switch (rules.type) {
        case 'string':
          valid = typeof value === 'string';
          break;
        case 'number':
          valid = typeof value === 'number' && !isNaN(value);
          break;
        case 'boolean':
          valid = typeof value === 'boolean';
          break;
        case 'array':
          valid = Array.isArray(value);
          break;
        case 'object':
          valid = typeof value === 'object' && !Array.isArray(value) && value !== null;
          break;
        case 'email':
          valid = typeof value === 'string' && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/g.test(value);
          break;
        case 'phone':
          valid = typeof value === 'string' && /^\+?[1-9]\d{1,14}$/.test(value);
          break;
        case 'date':
          valid = value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
          break;
      }
      
      if (!valid) {
        errors.push({
          field,
          message: rules.typeMessage || `${field} must be a valid ${rules.type}`,
          rule: 'type',
          expectedType: rules.type
        });
      }
    }
    
    // Length checks for strings and arrays
    if (rules.minLength !== undefined && ['string', 'array'].includes(rules.type)) {
      if ((typeof value === 'string' || Array.isArray(value)) && value.length < rules.minLength) {
        errors.push({
          field,
          message: rules.minLengthMessage || `${field} must be at least ${rules.minLength} characters long`,
          rule: 'minLength',
          minLength: rules.minLength
        });
      }
    }
    
    if (rules.maxLength !== undefined && ['string', 'array'].includes(rules.type)) {
      if ((typeof value === 'string' || Array.isArray(value)) && value.length > rules.maxLength) {
        errors.push({
          field,
          message: rules.maxLengthMessage || `${field} must be at most ${rules.maxLength} characters long`,
          rule: 'maxLength',
          maxLength: rules.maxLength
        });
      }
    }
    
    // Value range checks for numbers
    if (rules.min !== undefined && rules.type === 'number') {
      if (typeof value === 'number' && value < rules.min) {
        errors.push({
          field,
          message: rules.minMessage || `${field} must be at least ${rules.min}`,
          rule: 'min',
          min: rules.min
        });
      }
    }
    
    if (rules.max !== undefined && rules.type === 'number') {
      if (typeof value === 'number' && value > rules.max) {
        errors.push({
          field,
          message: rules.maxMessage || `${field} must be at most ${rules.max}`,
          rule: 'max',
          max: rules.max
        });
      }
    }
    
    // Custom pattern check
    if (rules.pattern && typeof value === 'string') {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors.push({
          field,
          message: rules.patternMessage || `${field} has an invalid format`,
          rule: 'pattern'
        });
      }
    }
    
    // Enum check
    if (rules.enum && Array.isArray(rules.enum)) {
      if (!rules.enum.includes(value)) {
        errors.push({
          field,
          message: rules.enumMessage || `${field} must be one of: ${rules.enum.join(', ')}`,
          rule: 'enum',
          allowedValues: rules.enum
        });
      }
    }
    
    // Custom validator function
    if (rules.validator && typeof rules.validator === 'function') {
      try {
        const result = rules.validator(value, data);
        if (result !== true) {
          errors.push({
            field,
            message: typeof result === 'string' ? result : rules.validatorMessage || `${field} is invalid`,
            rule: 'custom'
          });
        }
      } catch (error) {
        errors.push({
          field,
          message: error.message || rules.validatorMessage || `${field} validation failed`,
          rule: 'custom'
        });
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Common validation schemas for reuse across the application
 */
export const validationSchemas = {
  email: {
    type: 'email',
    message: 'Please enter a valid email address'
  },
  password: {
    type: 'string',
    minLength: 8,
    message: 'Password must be at least 8 characters long'
  },
  phone: {
    type: 'phone',
    message: 'Please enter a valid phone number (e.g., +15551234567)'
  },
  name: {
    type: 'string',
    minLength: 1,
    message: 'Name is required'
  },
  businessName: {
    type: 'string',
    minLength: 1,
    message: 'Business name is required'
  },
  timezone: {
    type: 'string',
    validator: (value) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
        return true;
      } catch (error) {
        return 'Invalid timezone';
      }
    },
    message: 'Please enter a valid timezone (e.g., America/New_York)'
  },
  leadStatus: {
    type: 'string',
    enum: ['new', 'qualified', 'unqualified', 'converted', 'inactive'],
    message: 'Status must be one of: new, qualified, unqualified, converted, inactive'
  },
  meetingStatus: {
    type: 'string',
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    message: 'Status must be one of: scheduled, completed, cancelled, rescheduled'
  },
  conversationStatus: {
    type: 'string',
    enum: ['active', 'closed'],
    message: 'Status must be one of: active, closed'
  },
  contactChannel: {
    type: 'string',
    enum: ['whatsapp', 'sms', 'email'],
    message: 'Contact channel must be one of: whatsapp, sms, email'
  }
};

export default { validateRequest, validateData, validationSchemas }; 