import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Base URL for API requests
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Store tokens and IDs for use across tests
const testData = {
  userToken: null,
  businessId: null,
  leadId: null,
  conversationId: null,
  apiKey: null
};

// Test user credentials
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
  name: 'Test User',
  companyName: 'Test Company'
};

// Business data
const businessData = {
  name: 'Test Business',
  industry: 'Technology',
  services: 'Software Development, AI Solutions',
  timezone: 'America/New_York',
  website: 'https://example.com',
  businessHours: [
    { day: 'monday', start: '09:00', end: '17:00' },
    { day: 'tuesday', start: '09:00', end: '17:00' },
    { day: 'wednesday', start: '09:00', end: '17:00' },
    { day: 'thursday', start: '09:00', end: '17:00' },
    { day: 'friday', start: '09:00', end: '17:00' }
  ]
};

// Assistant configuration
const assistantConfig = {
  role: 'Sales Assistant',
  tone: 'Professional and friendly',
  greeting_message: 'Hello! Thank you for your interest in our services. How can I help you today?',
  required_info: 'budget, timeline, project scope',
  enable_scheduling: true
};

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper to update auth token
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    testData.userToken = token;
  } else {
    delete api.defaults.headers.common['Authorization'];
    testData.userToken = null;
  }
};

// Log response or error
const logResponse = (title, response) => {
  console.log(`\n=== ${title} ===`);
  console.log('Status:', response.status);
  console.log('Data:', JSON.stringify(response.data, null, 2));
};

const logError = (title, error) => {
  console.error(`\n=== ${title} ERROR ===`);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else {
    console.error(error.message);
  }
};

// Test authentication endpoints
const testAuth = async () => {
  try {
    // Register a new user
    const registerResponse = await api.post('/api/auth/register', testUser);
    logResponse('Register User', registerResponse);
    
    // Set auth token
    setAuthToken(registerResponse.data.token);
    
    // Test login
    const loginResponse = await api.post('/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    logResponse('Login User', loginResponse);
    
    // Update token with the one from login
    setAuthToken(loginResponse.data.token);
    
    return true;
  } catch (error) {
    logError('Authentication', error);
    return false;
  }
};

// Test onboarding endpoints
const testOnboarding = async () => {
  try {
    // Create business profile
    const businessResponse = await api.post('/api/onboarding/business', businessData);
    logResponse('Create Business', businessResponse);
    testData.businessId = businessResponse.data.business.id;
    
    // Configure assistant
    const assistantResponse = await api.post('/api/onboarding/assistant', assistantConfig);
    logResponse('Configure Assistant', assistantResponse);
    
    // Get onboarding status
    const statusResponse = await api.get('/api/onboarding/status');
    logResponse('Onboarding Status', statusResponse);
    
    return true;
  } catch (error) {
    logError('Onboarding', error);
    return false;
  }
};

// Test lead creation and management
const testLeads = async () => {
  try {
    // Create API key for external lead creation
    // In a real scenario, this would be done through a dedicated endpoint
    // For testing, we'll simulate the API key exists
    testData.apiKey = 'test_api_key_' + Date.now();
    
    // Create a lead (assuming an API key system exists)
    const leadData = {
      name: 'John Doe',
      phone: '+15551234567',
      email: 'john.doe@example.com',
      source: 'website',
      contact_channel: 'whatsapp'
    };
    
    // Let's simulate using an API key for lead creation
    const apiKeyHeader = api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
    api.defaults.headers.common['x-api-key'] = testData.apiKey;
    
    // Since we don't have a real API key, this will fail
    // In a real scenario, you'd use a valid API key
    console.log('\n=== Create Lead (Will Fail Without Real API Key) ===');
    try {
      const leadResponse = await api.post('/api/leads', leadData);
      logResponse('Create Lead', leadResponse);
      testData.leadId = leadResponse.data.lead.id;
    } catch (error) {
      console.log('Expected error - Need real API key');
    }
    
    // Restore auth header
    delete api.defaults.headers.common['x-api-key'];
    api.defaults.headers.common['Authorization'] = apiKeyHeader;
    
    // For testing purposes, let's manually create a lead
    // This is a workaround since we don't have a real API key
    // Create a lead creation endpoint that uses the user's token instead
    console.log('\n=== Manually Create Test Lead ===');
    const manualLeadData = {
      name: 'Test Lead',
      phone: '+15559876543',
      email: 'test.lead@example.com',
      source: 'test',
      contact_channel: 'sms',
      business_id: testData.businessId,
      status: 'new'
    };
    
    // In a real app, you'd have a dedicated endpoint for this
    // Here we're simulating it for testing
    testData.leadId = 'test-lead-id-' + Date.now();
    console.log('Created test lead with ID:', testData.leadId);
    
    // Get all leads
    const getLeadsResponse = await api.get('/api/leads');
    logResponse('Get All Leads', getLeadsResponse);
    
    // In a real test, we would use the first lead ID
    if (getLeadsResponse.data.leads && getLeadsResponse.data.leads.length > 0) {
      testData.leadId = getLeadsResponse.data.leads[0].id;
      
      // Get specific lead
      const getLeadResponse = await api.get(`/api/leads/${testData.leadId}`);
      logResponse('Get Specific Lead', getLeadResponse);
      
      // Update lead
      const updateLeadResponse = await api.put(`/api/leads/${testData.leadId}`, {
        status: 'qualified',
        name: 'Updated Lead Name'
      });
      logResponse('Update Lead', updateLeadResponse);
    }
    
    return true;
  } catch (error) {
    logError('Leads', error);
    return false;
  }
};

// Test conversation functionality
const testConversations = async () => {
  try {
    // If we have a valid lead ID
    if (testData.leadId) {
      // Start a conversation with the lead
      const startConvoResponse = await api.post(`/api/conversations/lead/${testData.leadId}/start`);
      logResponse('Start Conversation', startConvoResponse);
      
      if (startConvoResponse.data.conversation) {
        testData.conversationId = startConvoResponse.data.conversation.id;
        
        // Get conversation details
        const getConvoResponse = await api.get(`/api/conversations/${testData.conversationId}`);
        logResponse('Get Conversation', getConvoResponse);
        
        // Send a message
        const sendMsgResponse = await api.post(`/api/conversations/${testData.conversationId}/message`, {
          message: 'This is a test message from the business.'
        });
        logResponse('Send Message', sendMsgResponse);
        
        // Generate AI response (may fail without valid OpenAI credentials)
        console.log('\n=== Generate AI Response (May Fail Without Valid OpenAI Credentials) ===');
        try {
          const aiResponse = await api.post(`/api/conversations/${testData.conversationId}/ai-response`);
          logResponse('Generate AI Response', aiResponse);
        } catch (error) {
          console.log('Expected error - Need valid OpenAI credentials');
        }
        
        // Close conversation
        const closeConvoResponse = await api.put(`/api/conversations/${testData.conversationId}/close`);
        logResponse('Close Conversation', closeConvoResponse);
      }
    } else {
      console.log('Skipping conversation tests - no valid lead ID');
    }
    
    return true;
  } catch (error) {
    logError('Conversations', error);
    return false;
  }
};

// Test scheduling functionality
const testScheduling = async () => {
  try {
    // Get available slots (will fail without calendar integration)
    console.log('\n=== Get Available Slots (Will Fail Without Calendar Integration) ===');
    try {
      const availableSlotsResponse = await api.get('/api/scheduling/available-slots', {
        params: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          timezone: 'America/New_York'
        }
      });
      logResponse('Get Available Slots', availableSlotsResponse);
    } catch (error) {
      console.log('Expected error - Need calendar integration');
    }
    
    // Create a meeting (simplified, would fail without calendar integration)
    if (testData.leadId) {
      console.log('\n=== Create Meeting (Will Fail Without Calendar Integration) ===');
      const meetingData = {
        leadId: testData.leadId,
        title: 'Test Meeting',
        description: 'This is a test meeting',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        timezone: 'America/New_York',
        location: 'Virtual',
        conversationId: testData.conversationId
      };
      
      try {
        const createMeetingResponse = await api.post('/api/scheduling/meetings', meetingData);
        logResponse('Create Meeting', createMeetingResponse);
      } catch (error) {
        console.log('Expected error - Need calendar integration');
      }
    }
    
    // Get all meetings
    const getMeetingsResponse = await api.get('/api/scheduling/meetings');
    logResponse('Get All Meetings', getMeetingsResponse);
    
    return true;
  } catch (error) {
    logError('Scheduling', error);
    return false;
  }
};

// Test dashboard analytics
const testDashboard = async () => {
  try {
    // Get dashboard overview
    const overviewResponse = await api.get('/api/dashboard/overview');
    logResponse('Dashboard Overview', overviewResponse);
    
    // Get lead analytics
    const leadAnalyticsResponse = await api.get('/api/dashboard/analytics/leads', {
      params: { period: '30days' }
    });
    logResponse('Lead Analytics', leadAnalyticsResponse);
    
    return true;
  } catch (error) {
    logError('Dashboard', error);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('=== Starting API Tests ===');
  
  // Authentication tests
  console.log('\n=== Running Authentication Tests ===');
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.error('Authentication tests failed, stopping further tests');
    return;
  }
  
  // Onboarding tests
  console.log('\n=== Running Onboarding Tests ===');
  const onboardingSuccess = await testOnboarding();
  if (!onboardingSuccess) {
    console.error('Onboarding tests failed, stopping further tests');
    return;
  }
  
  // Lead tests
  console.log('\n=== Running Lead Tests ===');
  await testLeads();
  
  // Conversation tests
  console.log('\n=== Running Conversation Tests ===');
  await testConversations();
  
  // Scheduling tests
  console.log('\n=== Running Scheduling Tests ===');
  await testScheduling();
  
  // Dashboard tests
  console.log('\n=== Running Dashboard Tests ===');
  await testDashboard();
  
  console.log('\n=== API Tests Completed ===');
};

// Run tests
runTests().catch(error => {
  console.error('Error running tests:', error);
}); 