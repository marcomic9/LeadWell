import { Lead, InsertLead, AiInsight, FormSubmission, InsertCall, Call } from "@shared/schema";
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

interface ScoringFactors {
  projectType: number;
  source: number;
  completeness: number;
}

export const aiService = {
  // Score a lead based on various factors using both heuristics and AI
  scoreLead: async (lead: InsertLead | Lead): Promise<number> => {
    // First calculate the basic heuristic score
    const factors: ScoringFactors = {
      projectType: getProjectTypeScore(lead.projectType),
      source: getSourceScore(lead.source),
      completeness: getCompletenessScore(lead)
    };
    
    // Calculate weighted score
    const heuristicScore = 
      factors.projectType * 0.3 + 
      factors.source * 0.3 + 
      factors.completeness * 0.4;
    
    try {
      // If OpenAI API is available, enhance the score with AI analysis
      const prompt = `
        You are an expert at evaluating construction leads. Please analyze this lead information:
        - Name: ${lead.name}
        - Email: ${lead.email}
        - Phone: ${lead.phone || 'Not provided'}
        - Company: ${lead.company || 'Not provided'}
        - Project Type: ${lead.projectType}
        - Source: ${lead.source}
        
        Score this lead from 0-100 based on:
        1. How likely they are to convert to a paying customer
        2. The potential value of their project
        3. How well their project aligns with what construction companies typically handle
        4. How complete their information is
        
        Respond with a JSON object in this format:
        { "score": number, "reason": "detailed explanation", "isScam": boolean }
      `;

      const aiResponse = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      
      const aiResult = JSON.parse(aiResponse.choices[0].message.content);
      
      // Use a weighted average of heuristic and AI scores
      const finalScore = (heuristicScore * 100 * 0.4) + (aiResult.score * 0.6);
      
      return Math.min(100, Math.round(finalScore));
    } catch (error) {
      console.error("AI lead scoring failed, using heuristic score:", error);
      // Fallback to heuristic score if AI fails
      return Math.min(100, Math.round(heuristicScore * 100));
    }
  },
  
  // Process a form submission to extract lead information and schedule follow-ups
  processFormSubmission: async (submission: FormSubmission): Promise<{
    leadData: Partial<InsertLead>,
    callData?: Partial<InsertCall>,
    qualificationReason: string,
    isScam: boolean
  }> => {
    try {
      // Analyze the form content with AI
      let rawData;
      try {
        rawData = typeof submission.rawData === 'string' 
          ? JSON.parse(submission.rawData as string)
          : submission.rawData;
      } catch (e) {
        rawData = {};
      }
      const content = rawData?.content || '';
      
      const prompt = `
        You are an AI assistant for a construction company. Analyze this form submission:
        
        Form content: ${content}
        
        Extract the following information in JSON format:
        1. Customer name
        2. Email address
        3. Phone number
        4. Company name
        5. Project type (classify as: Residential Renovation, Commercial Office, Industrial Facility, Residential New Build, or Other)
        6. Budget estimate (number in dollars)
        7. Timeline (when they want to start the project)
        8. A qualification score from 0-100 (how qualified this lead is)
        9. Explanation for qualification score
        10. Schedule a call? (true/false - should we schedule a follow-up call?)
        11. Suggested call date (provide specific date and time if a call is recommended)
        12. Is this possibly a scam or spam? (true/false)
        13. Reason for scam/spam classification

        Respond in this JSON format:
        {
          "name": string,
          "email": string,
          "phone": string,
          "company": string,
          "projectType": string,
          "budget": number,
          "timeline": string,
          "qualificationScore": number,
          "qualificationReason": string,
          "scheduleCall": boolean,
          "callDate": string (ISO format),
          "isScam": boolean,
          "scamReason": string
        }
      `;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content);
      
      // Create the lead data object
      const leadData: Partial<InsertLead> = {
        name: result.name,
        email: result.email,
        phone: result.phone,
        company: result.company,
        projectType: result.projectType,
        budget: result.budget,
        timeline: result.timeline,
        source: "Website Form",
        sourceIcon: "ri-global-line",
        score: result.qualificationScore,
        status: result.qualificationScore > 70 ? "qualified" : "new",
        aiQualified: result.qualificationScore > 70,
        aiQualificationReason: result.qualificationReason,
        aiProcessed: true
      };
      
      let callData: Partial<InsertCall> | undefined = undefined;
      
      if (result.scheduleCall && !result.isScam) {
        callData = {
          title: `Initial Consultation - ${result.projectType}`,
          scheduledAt: new Date(result.callDate),
          duration: 30, // Default 30 minute call
          notes: `Auto-scheduled from form submission. Project details: ${result.projectType}, Budget: $${result.budget}, Timeline: ${result.timeline}`,
          aiScheduled: true
        };
      }
      
      return {
        leadData,
        callData,
        qualificationReason: result.qualificationReason,
        isScam: result.isScam
      };
    } catch (error) {
      console.error("AI form processing failed:", error);
      throw error;
    }
  },
  
  // Generate AI insights based on lead data
  generateInsights: async (leads: Lead[]): Promise<AiInsight[]> => {
    if (leads.length === 0) {
      return [];
    }
    
    try {
      // First generate insights using simple heuristics
      const insights: Partial<AiInsight>[] = [];
      
      // Analyze lead sources
      const sourceCounts = countLeadSources(leads);
      const topSource = getTopLeadSource(sourceCounts);
      
      if (topSource) {
        insights.push({
          title: `${topSource.name} is Your Top Lead Source`,
          description: `${topSource.name} has generated ${topSource.count} leads (${topSource.percentage}% of total). Focus more resources on this channel.`,
          type: "source",
          icon: "ri-line-chart-line",
          action: "Optimize Channel",
          actionUrl: `/marketing/${topSource.name.toLowerCase()}`,
          createdAt: new Date(),
          read: false
        });
      }
      
      // Analyze lead qualification
      const qualifiedLeads = leads.filter(lead => lead.score && lead.score >= 70);
      const qualificationRate = (qualifiedLeads.length / leads.length) * 100;
      
      insights.push({
        title: "Lead Qualification Rate",
        description: `Your lead qualification rate is ${qualificationRate.toFixed(1)}%. ${
          qualificationRate > 50 ? "Great job!" : "This is below industry average. Review your lead sources."
        }`,
        type: "quality",
        icon: "ri-shield-check-line",
        action: "Improve Quality",
        actionUrl: "/leads/quality",
        createdAt: new Date(),
        read: false
      });
      
      // Analyze project types
      const projectTypes = countProjectTypes(leads);
      const topProjectType = getTopProjectType(projectTypes);
      
      if (topProjectType) {
        insights.push({
          title: "Popular Project Type",
          description: `${topProjectType.name} is your most requested project type (${topProjectType.percentage}%). Consider creating specialized workflows for these projects.`,
          type: "trend",
          icon: "ri-building-line",
          action: "Create Workflow",
          actionUrl: "/workflows/new",
          createdAt: new Date(),
          read: false
        });
      }
      
      // Now use AI to generate deeper insights
      const leadsData = leads.slice(0, 10).map(lead => ({
        name: lead.name,
        email: lead.email,
        source: lead.source,
        projectType: lead.projectType,
        score: lead.score,
        status: lead.status,
        createdAt: lead.createdAt
      }));
      
      const prompt = `
        You are an expert AI assistant for a construction lead management platform. Analyze the following lead data:
        
        ${JSON.stringify(leadsData, null, 2)}
        
        Analyze this data and provide 3 key insights about:
        1. Lead trends (sources, project types, etc.)
        2. Conversion opportunities
        3. Process improvement suggestions
        
        Format each insight as a JSON object with:
        - title (short and attention-grabbing)
        - description (2-3 sentences with specific data points)
        - type (choose one: trend, quality, schedule, opportunity)
        - icon (choose one: ri-robot-line, ri-calendar-check-line, ri-building-line, ri-line-chart-line)
        
        Return an array of exactly 3 insight objects.
      `;
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      
      const aiInsights = JSON.parse(response.choices[0].message.content);
      
      // Combine AI and heuristic insights
      aiInsights.forEach((insight: any) => {
        insights.push({
          title: insight.title,
          description: insight.description,
          type: insight.type,
          icon: insight.icon,
          action: "View Details",
          actionUrl: `/insights/${insight.type}`,
          createdAt: new Date(),
          read: false
        });
      });
      
      return insights as AiInsight[];
    } catch (error) {
      console.error("AI insight generation failed:", error);
      return [];
    }
  },
  
  // Generate a summary for a call
  generateCallSummary: async (call: Call, leadInfo: Lead): Promise<string> => {
    try {
      const prompt = `
        You are an AI assistant for a construction company. Create a summary of this call:
        
        Call Details:
        - Title: ${call.title}
        - Notes: ${call.notes || 'No notes available'}
        - Duration: ${call.duration || 'Unknown'} minutes
        - Lead: ${leadInfo.name} from ${leadInfo.company || 'Unknown company'}
        - Project Type: ${leadInfo.projectType}
        
        Create a professional, concise summary of this call that:
        1. Highlights the key points discussed
        2. Notes any action items or follow-ups
        3. Provides a brief assessment of the lead's potential

        Write this in a professional, constructive tone. 
        Limit the summary to 3-4 sentences.
      `;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }]
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI call summary generation failed:", error);
      return "Call summary generation failed. Please create a manual summary.";
    }
  }
};

// Helper functions
function getProjectTypeScore(projectType: string): number {
  const scores: {[key: string]: number} = {
    "Commercial Office": 0.9,
    "Industrial Facility": 0.85,
    "Residential New Build": 0.8,
    "Residential Renovation": 0.7
  };
  
  return scores[projectType] || 0.5;
}

function getSourceScore(source: string): number {
  const scores: {[key: string]: number} = {
    "Referrals": 0.95,
    "LinkedIn": 0.85,
    "Website": 0.8,
    "Google": 0.75,
    "Facebook": 0.7
  };
  
  return scores[source] || 0.6;
}

function getCompletenessScore(lead: InsertLead | Lead): number {
  let score = 0;
  if (lead.name) score += 0.2;
  if (lead.email) score += 0.2;
  if (lead.phone) score += 0.2;
  if (lead.company) score += 0.2;
  if (lead.projectType) score += 0.2;
  
  return score;
}

function countLeadSources(leads: Lead[]): {[key: string]: number} {
  return leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as {[key: string]: number});
}

function getTopLeadSource(sourceCounts: {[key: string]: number}) {
  const sources = Object.entries(sourceCounts);
  if (sources.length === 0) return null;
  
  sources.sort((a, b) => b[1] - a[1]);
  const total = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
  
  return {
    name: sources[0][0],
    count: sources[0][1],
    percentage: Math.round((sources[0][1] / total) * 100)
  };
}

function countProjectTypes(leads: Lead[]): {[key: string]: number} {
  return leads.reduce((acc, lead) => {
    acc[lead.projectType] = (acc[lead.projectType] || 0) + 1;
    return acc;
  }, {} as {[key: string]: number});
}

function getTopProjectType(projectTypes: {[key: string]: number}) {
  const types = Object.entries(projectTypes);
  if (types.length === 0) return null;
  
  types.sort((a, b) => b[1] - a[1]);
  const total = Object.values(projectTypes).reduce((sum, count) => sum + count, 0);
  
  return {
    name: types[0][0],
    count: types[0][1],
    percentage: Math.round((types[0][1] / total) * 100)
  };
}
