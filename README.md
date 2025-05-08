# LeadWell - Smart Lead Qualification and Meeting Scheduling

LeadWell is a SaaS platform that automates lead qualification and meeting scheduling through smart, human-like conversations. When a lead submits a form or responds to an ad, LeadWell instantly reaches out using WhatsApp, SMS, or any other Twilio-supported messaging app. It chats naturally, gathers key information, and books meetings by checking calendar availability.

## Features

- **Automated Outreach**: Instantly contact leads via WhatsApp, SMS, or other messaging platforms
- **Human-like Conversations**: Dynamic, flowing, natural-sounding conversations powered by AI
- **Lead Qualification**: Automatically collect key information from leads
- **Automated Scheduling**: Check calendar availability and book meetings
- **Client Dashboard**: Monitor leads, conversations, and meetings
- **Omnichannel Support**: Work with all Twilio-supported platforms
- **Customizable Prompts**: Configure your virtual assistant for your specific business needs

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT
- **Messaging**: Twilio API
- **Calendar Integration**: Google Calendar API

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/leadwell-backend.git
cd leadwell-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_WHATSAPP_NUMBER=+15551234567

# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### 4. Set up Supabase database
Create the necessary tables in your Supabase project as outlined in the SQL schema below.

### 5. Start the development server
```bash
npm run dev
```

### 6. Start the production server
```bash
npm start
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar integrations table
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  services TEXT NOT NULL,
  website TEXT,
  timezone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business hours table
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assistant configurations table
CREATE TABLE assistant_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  tone TEXT NOT NULL,
  greeting_message TEXT,
  required_info TEXT NOT NULL,
  enable_scheduling BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  email TEXT,
  source TEXT,
  contact_channel TEXT NOT NULL,
  status TEXT NOT NULL,
  additional_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_from_lead BOOLEAN NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  google_event_id TEXT,
  outlook_event_id TEXT,
  additional_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset

### Onboarding
- `POST /api/onboarding/business` - Set up business profile
- `POST /api/onboarding/assistant` - Configure virtual assistant
- `PUT /api/onboarding/business` - Update business profile
- `PUT /api/onboarding/assistant` - Update assistant configuration
- `GET /api/onboarding/status` - Get onboarding status
- `POST /api/onboarding/calendar` - Connect calendar integration

### Leads
- `POST /api/leads` - Create a new lead
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get a specific lead
- `PUT /api/leads/:id` - Update a lead
- `POST /api/leads/:id/qualification` - Update lead qualification data

### Conversations
- `GET /api/conversations/lead/:leadId` - Get all conversations for a lead
- `GET /api/conversations/:id` - Get a specific conversation with messages
- `POST /api/conversations/:id/message` - Send a message to a lead
- `POST /api/conversations/:id/ai-response` - Generate and send an AI response
- `POST /api/conversations/lead/:leadId/start` - Start a new conversation with a lead
- `PUT /api/conversations/:id/close` - Close/Archive a conversation

### Scheduling
- `GET /api/scheduling/available-slots` - Get available time slots
- `POST /api/scheduling/meetings` - Create a meeting
- `GET /api/scheduling/meetings` - Get all meetings
- `GET /api/scheduling/meetings/:id` - Get a specific meeting
- `PUT /api/scheduling/meetings/:id` - Update a meeting
- `DELETE /api/scheduling/meetings/:id` - Cancel a meeting

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview data
- `GET /api/dashboard/analytics/leads` - Get lead analytics
- `GET /api/dashboard/analytics/conversations` - Get conversation analytics
- `GET /api/dashboard/analytics/meetings` - Get meeting analytics

### Webhooks
- `POST /api/webhooks/twilio/incoming` - Twilio webhook for incoming messages
- `POST /api/webhooks/generic` - Generic webhook for other integrations

## License

This project is licensed under the MIT License - see the LICENSE file for details. 