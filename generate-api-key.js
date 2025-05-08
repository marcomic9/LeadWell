import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import supabase from './src/config/supabase.js';

// Load environment variables
dotenv.config();

/**
 * Generate API key for a business to use with webhooks and API integrations
 * 
 * @param {string} businessId - UUID of the business
 * @param {string} keyName - Name/description for the API key
 * @returns {string} The generated API key
 */
const generateApiKey = async (businessId, keyName) => {
  try {
    // Generate a unique API key
    const apiKey = `lw_${uuidv4().replace(/-/g, '')}`;
    
    // Store it in the database
    const { data, error } = await supabase
      .from('api_keys')
      .insert([{
        business_id: businessId,
        key: apiKey,
        name: keyName,
        is_active: true,
        created_at: new Date()
      }])
      .select();
    
    if (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
    
    return {
      id: data[0].id,
      key: apiKey,
      name: keyName
    };
  } catch (error) {
    console.error('API Key Generation Error:', error);
    throw new Error(`Failed to generate API key: ${error.message}`);
  }
};

// If run directly from command line
if (process.argv[2] && process.argv[3]) {
  const businessId = process.argv[2];
  const keyName = process.argv[3];
  
  generateApiKey(businessId, keyName)
    .then(result => {
      console.log('=== API Key Generated Successfully ===');
      console.log('API Key:', result.key);
      console.log('Name:', result.name);
      console.log('ID:', result.id);
      console.log('\nUse this key in the x-api-key header for webhook and lead creation endpoints');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
} else {
  console.log('Usage: node generate-api-key.js <business-id> <key-name>');
  console.log('Example: node generate-api-key.js 550e8400-e29b-41d4-a716-446655440000 "Website Integration"');
  process.exit(1);
}

export default generateApiKey; 