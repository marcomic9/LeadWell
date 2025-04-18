import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { dbStorage as storage } from "./db-storage";
import { aiService } from "./ai-service";
import { 
  insertLeadSchema, 
  insertCallSchema, 
  insertUserSchema, 
  insertProjectTypeSchema,
  insertMarketingChannelSchema,
  insertAiInsightSchema,
  insertStatSchema,
  insertFormSubmissionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // User routes
  router.get("/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json(user);
  });
  
  router.post("/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Lead routes
  router.get("/leads", async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const { leads, total } = await storage.getLeads(page, limit);
    
    res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  });
  
  router.get("/leads/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid lead ID" });
    }
    
    const lead = await storage.getLead(id);
    
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    
    return res.json(lead);
  });
  
  router.post("/leads", async (req: Request, res: Response) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      
      // Use AI to score the lead
      const score = await aiService.scoreLead(leadData);
      const lead = await storage.createLead({ ...leadData, score });
      
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      console.error("Failed to create lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });
  
  router.patch("/leads/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid lead ID" });
    }
    
    try {
      const updates = req.body;
      const updated = await storage.updateLead(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });
  
  // Call routes
  router.get("/calls", async (req: Request, res: Response) => {
    const upcomingOnly = req.query.upcoming === "true";
    const calls = await storage.getCalls(upcomingOnly);
    
    // Get the associated lead for each call
    const callsWithLeadInfo = await Promise.all(
      calls.map(async (call) => {
        const lead = await storage.getLead(call.leadId);
        return {
          ...call,
          lead: lead ? {
            id: lead.id,
            name: lead.name,
            projectType: lead.projectType
          } : null
        };
      })
    );
    
    res.json(callsWithLeadInfo);
  });
  
  router.get("/calls/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid call ID" });
    }
    
    const call = await storage.getCall(id);
    
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }
    
    const lead = await storage.getLead(call.leadId);
    
    res.json({
      ...call,
      lead: lead ? {
        id: lead.id,
        name: lead.name,
        projectType: lead.projectType
      } : null
    });
  });
  
  router.post("/calls", async (req: Request, res: Response) => {
    try {
      const callData = insertCallSchema.parse(req.body);
      
      // Verify that the lead exists
      const lead = await storage.getLead(callData.leadId);
      if (!lead) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }
      
      const call = await storage.createCall(callData);
      
      res.status(201).json(call);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid call data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create call" });
    }
  });
  
  router.patch("/calls/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid call ID" });
    }
    
    try {
      const updates = req.body;
      const updated = await storage.updateCall(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Call not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update call" });
    }
  });
  
  // Project type routes
  router.get("/project-types", async (_req: Request, res: Response) => {
    const projectTypes = await storage.getProjectTypes();
    res.json(projectTypes);
  });
  
  router.post("/project-types", async (req: Request, res: Response) => {
    try {
      const projectTypeData = insertProjectTypeSchema.parse(req.body);
      const projectType = await storage.createProjectType(projectTypeData);
      res.status(201).json(projectType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project type data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project type" });
    }
  });
  
  // Marketing channel routes
  router.get("/marketing-channels", async (_req: Request, res: Response) => {
    const channels = await storage.getMarketingChannels();
    res.json(channels);
  });
  
  router.post("/marketing-channels", async (req: Request, res: Response) => {
    try {
      const channelData = insertMarketingChannelSchema.parse(req.body);
      const channel = await storage.createMarketingChannel(channelData);
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid marketing channel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create marketing channel" });
    }
  });
  
  // AI Insights routes
  router.get("/ai-insights", async (_req: Request, res: Response) => {
    const insights = await storage.getAiInsights();
    res.json(insights);
  });
  
  router.post("/ai-insights", async (req: Request, res: Response) => {
    try {
      const insightData = insertAiInsightSchema.parse(req.body);
      const insight = await storage.createAiInsight(insightData);
      res.status(201).json(insight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid insight data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create insight" });
    }
  });
  
  // Generate AI insights based on leads data
  router.post("/ai-insights/generate", async (_req: Request, res: Response) => {
    try {
      const { leads } = await storage.getLeads(1, 100); // Get up to 100 leads for analysis
      const insights = await aiService.generateInsights(leads);
      
      // Store the generated insights
      const storedInsights = await Promise.all(
        insights.map(insight => {
          // Remove id and createdAt as they'll be assigned by storage
          const { id, createdAt, ...insightData } = insight;
          return storage.createAiInsight(insightData);
        })
      );
      
      res.status(201).json(storedInsights);
    } catch (error) {
      console.error("Failed to generate insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });
  
  // Form submission routes
  router.post("/form-submissions", async (req: Request, res: Response) => {
    try {
      // Basic validation
      if (!req.body.content) {
        return res.status(400).json({ message: "Form content is required" });
      }
      
      // Convert the req.body to a proper JSON object to store in rawData
      const formData = {
        formType: req.body.formType || "contact",
        source: req.body.source || "website",
        status: "new",
        rawData: JSON.stringify(req.body), // Store the entire request body as raw data JSON string
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      };
      
      // Create the form submission record
      const submission = await storage.createFormSubmission(formData);
      
      // Process the form with AI
      try {
        const aiResult = await aiService.processFormSubmission(submission);
        
        // Create the lead
        if (!aiResult.isScam) {
          const leadData = {
            ...aiResult.leadData,
            source: formData.source,
            sourceIcon: "ri-global-line",
          };
          
          const lead = await storage.createLead(leadData);
          
          // If we should schedule a call, create it
          if (aiResult.callData) {
            const callData = {
              ...aiResult.callData,
              leadId: lead.id
            };
            
            await storage.createCall(callData);
          }
          
          // Update form submission with lead id and AI processed status
          await storage.updateFormSubmission(submission.id, {
            leadId: lead.id,
            aiProcessed: true,
            aiResponse: aiResult
          });
          
          return res.status(201).json({
            submission,
            lead,
            qualification: aiResult.qualificationReason,
            message: "Form processed successfully"
          });
        } else {
          // It's a scam, just mark it processed but don't create lead
          await storage.updateFormSubmission(submission.id, {
            aiProcessed: true,
            aiResponse: aiResult,
            status: "spam"
          });
          
          return res.status(201).json({
            submission,
            message: "Form identified as potential spam",
            isScam: true
          });
        }
      } catch (aiError) {
        console.error("AI processing failed:", aiError);
        // Still return success, but note that AI processing failed
        return res.status(201).json({
          submission,
          message: "Form submitted, but AI processing failed",
          aiError: true
        });
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      res.status(500).json({ message: "Failed to process form submission" });
    }
  });
  
  // Stats routes
  router.get("/stats", async (req: Request, res: Response) => {
    const period = req.query.period as string || 'week';
    const stats = await storage.getStats(period);
    res.json(stats);
  });
  
  router.post("/stats", async (req: Request, res: Response) => {
    try {
      const statData = insertStatSchema.parse(req.body);
      const stat = await storage.createStat(statData);
      res.status(201).json(stat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stat data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stat" });
    }
  });
  
  app.use("/api", router);
  
  const httpServer = createServer(app);
  return httpServer;
}
