import { 
  users, type User, type InsertUser,
  leads, type Lead, type InsertLead,
  calls, type Call, type InsertCall,
  projectTypes, type ProjectType, type InsertProjectType,
  marketingChannels, type MarketingChannel, type InsertMarketingChannel,
  aiInsights, type AiInsight, type InsertAiInsight,
  stats, type Stat, type InsertStat,
  formSubmissions, type FormSubmission, type InsertFormSubmission
} from "@shared/schema";

// Import database
import { db } from './db';
import { eq, and, desc, gte, sql, asc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead methods
  getLeads(page?: number, limit?: number): Promise<{ leads: Lead[], total: number }>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  
  // Call methods
  getCalls(upcomingOnly?: boolean): Promise<Call[]>;
  getCall(id: number): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<InsertCall>): Promise<Call | undefined>;
  
  // Project type methods
  getProjectTypes(): Promise<ProjectType[]>;
  createProjectType(projectType: InsertProjectType): Promise<ProjectType>;
  
  // Marketing channel methods
  getMarketingChannels(): Promise<MarketingChannel[]>;
  createMarketingChannel(channel: InsertMarketingChannel): Promise<MarketingChannel>;
  
  // AI Insight methods
  getAiInsights(): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  
  // Stats methods
  getStats(period?: string): Promise<Stat[]>;
  createStat(stat: InsertStat): Promise<Stat>;
  updateStat(id: number, stat: Partial<InsertStat>): Promise<Stat | undefined>;
  
  // Form submission methods
  getFormSubmissions(page?: number, limit?: number): Promise<{ submissions: FormSubmission[], total: number }>;
  getFormSubmission(id: number): Promise<FormSubmission | undefined>;
  createFormSubmission(submission: Partial<InsertFormSubmission>): Promise<FormSubmission>;
  updateFormSubmission(id: number, updates: Partial<InsertFormSubmission>): Promise<FormSubmission | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Lead methods
  async getLeads(page: number = 1, limit: number = 10): Promise<{ leads: Lead[], total: number }> {
    const offset = (page - 1) * limit;
    
    const leadsResult = await db.select().from(leads)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(leads.createdAt));
      
    const countResult = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(leads);
    
    return {
      leads: leadsResult,
      total: countResult[0].count
    };
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }
  
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(insertLead).returning();
    return result[0];
  }
  
  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await db
      .update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();
      
    return result[0];
  }
  
  // Call methods
  async getCalls(upcomingOnly: boolean = false): Promise<Call[]> {
    if (upcomingOnly) {
      return db.select().from(calls)
        .where(
          and(
            gte(calls.scheduledAt, new Date()),
            eq(calls.completed, false)
          )
        )
        .orderBy(asc(calls.scheduledAt));
    }
    
    return db.select().from(calls).orderBy(asc(calls.scheduledAt));
  }
  
  async getCall(id: number): Promise<Call | undefined> {
    const result = await db.select().from(calls).where(eq(calls.id, id));
    return result[0];
  }
  
  async createCall(insertCall: InsertCall): Promise<Call> {
    const result = await db.insert(calls).values(insertCall).returning();
    return result[0];
  }
  
  async updateCall(id: number, updates: Partial<InsertCall>): Promise<Call | undefined> {
    const result = await db
      .update(calls)
      .set(updates)
      .where(eq(calls.id, id))
      .returning();
      
    return result[0];
  }
  
  // Project type methods
  async getProjectTypes(): Promise<ProjectType[]> {
    return db.select().from(projectTypes);
  }
  
  async createProjectType(insertProjectType: InsertProjectType): Promise<ProjectType> {
    const result = await db.insert(projectTypes).values(insertProjectType).returning();
    return result[0];
  }
  
  // Marketing channel methods
  async getMarketingChannels(): Promise<MarketingChannel[]> {
    return db.select().from(marketingChannels);
  }
  
  async createMarketingChannel(insertChannel: InsertMarketingChannel): Promise<MarketingChannel> {
    const result = await db.insert(marketingChannels).values(insertChannel).returning();
    return result[0];
  }
  
  // AI Insight methods
  async getAiInsights(): Promise<AiInsight[]> {
    return db.select().from(aiInsights).orderBy(desc(aiInsights.createdAt));
  }
  
  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const result = await db.insert(aiInsights).values(insertInsight).returning();
    return result[0];
  }
  
  // Stats methods
  async getStats(period: string = 'week'): Promise<Stat[]> {
    return db.select().from(stats).where(eq(stats.period, period));
  }
  
  async createStat(insertStat: InsertStat): Promise<Stat> {
    const result = await db.insert(stats).values(insertStat).returning();
    return result[0];
  }
  
  async updateStat(id: number, updates: Partial<InsertStat>): Promise<Stat | undefined> {
    const result = await db
      .update(stats)
      .set(updates)
      .where(eq(stats.id, id))
      .returning();
      
    return result[0];
  }
  
  // Form submission methods
  async getFormSubmissions(page: number = 1, limit: number = 10): Promise<{ submissions: FormSubmission[], total: number }> {
    const offset = (page - 1) * limit;
    
    const submissionsResult = await db.select().from(formSubmissions)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(formSubmissions.createdAt));
      
    const countResult = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(formSubmissions);
    
    return {
      submissions: submissionsResult,
      total: countResult[0].count
    };
  }
  
  async getFormSubmission(id: number): Promise<FormSubmission | undefined> {
    const result = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    return result[0];
  }
  
  async createFormSubmission(insertSubmission: Partial<InsertFormSubmission>): Promise<FormSubmission> {
    // Set default values for any required fields that aren't provided
    const submission: InsertFormSubmission = {
      formType: insertSubmission.formType || 'contact',
      source: insertSubmission.source || 'website',
      content: insertSubmission.content || '',
      processed: insertSubmission.processed || false,
      isScam: insertSubmission.isScam || false,
      data: insertSubmission.data || {},
      aiDetectedIntent: insertSubmission.aiDetectedIntent || null,
      aiSentiment: insertSubmission.aiSentiment || null,
      aiActionNeeded: insertSubmission.aiActionNeeded || null,
      leadCreated: insertSubmission.leadCreated || false,
      leadId: insertSubmission.leadId || null
    };
    
    const result = await db.insert(formSubmissions).values(submission).returning();
    return result[0];
  }
  
  async updateFormSubmission(id: number, updates: any): Promise<FormSubmission | undefined> {
    // Convert any field to the proper format
    const formattedUpdates: Record<string, any> = {};
    
    // Add all valid fields from updates to formattedUpdates
    Object.keys(updates).forEach(key => {
      formattedUpdates[key] = updates[key];
    });
    
    const result = await db
      .update(formSubmissions)
      .set(formattedUpdates)
      .where(eq(formSubmissions.id, id))
      .returning();
      
    return result[0];
  }

  // Helper to seed initial data if tables are empty
  async seedInitialData() {
    try {
      // Check if users table is empty
      const userResult = await db.select({ 
        count: sql<number>`count(*)` 
      }).from(users);
      
      if (userResult[0].count === 0) {
        console.log("Seeding database with initial data...");
        
        // Create demo user
        await this.createUser({
          username: "mike",
          password: "password123",
          name: "Mike Henderson",
          role: "Project Manager",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        });

        // Create project types
        const projectTypeData = [
          { name: "Residential Renovation", description: "Home renovation projects" },
          { name: "Commercial Office", description: "Office building projects" },
          { name: "Industrial Facility", description: "Industrial and manufacturing facilities" },
          { name: "Residential New Build", description: "New home construction" }
        ];
        
        for (const type of projectTypeData) {
          await this.createProjectType(type);
        }
        
        // Create marketing channels
        const channelData = [
          { name: "Facebook", icon: "ri-facebook-circle-fill", active: true },
          { name: "Google", icon: "ri-google-fill", active: true },
          { name: "LinkedIn", icon: "ri-linkedin-box-fill", active: true },
          { name: "Website", icon: "ri-global-line", active: true },
          { name: "Referrals", icon: "ri-contacts-line", active: true }
        ];
        
        for (const channel of channelData) {
          await this.createMarketingChannel(channel);
        }
        
        // Create stats
        const statsData = [
          { 
            name: "New Leads", 
            value: "24", 
            changePercentage: 12, 
            icon: "ri-user-add-line", 
            iconBg: "bg-primary-100", 
            iconColor: "text-primary-600", 
            period: "week" 
          },
          { 
            name: "Qualified Leads", 
            value: "18", 
            changePercentage: 8, 
            icon: "ri-shield-check-line", 
            iconBg: "bg-success bg-opacity-20", 
            iconColor: "text-success", 
            period: "week" 
          },
          { 
            name: "Scheduled Calls", 
            value: "12", 
            changePercentage: -3, 
            icon: "ri-phone-line", 
            iconBg: "bg-secondary-100", 
            iconColor: "text-secondary-600", 
            period: "week" 
          },
          { 
            name: "Conversion Rate", 
            value: "32%", 
            changePercentage: 5, 
            icon: "ri-percent-line", 
            iconBg: "bg-primary-100", 
            iconColor: "text-primary-600", 
            period: "week" 
          }
        ];
        
        for (const stat of statsData) {
          await this.createStat(stat);
        }
        
        // Create demo leads
        const leadsData = [
          {
            name: "James Donovan",
            email: "jdonovan@email.com",
            phone: "555-123-4567",
            company: "Donovan Construction",
            projectType: "Residential Renovation",
            source: "Facebook",
            sourceIcon: "ri-facebook-circle-fill",
            score: 87,
            status: "qualified",
            assignedTo: 1
          },
          {
            name: "Sarah Green",
            email: "sgreen@company.com",
            phone: "555-234-5678",
            company: "Green Enterprises",
            projectType: "Commercial Office",
            source: "Google",
            sourceIcon: "ri-google-fill",
            score: 92,
            status: "new",
            assignedTo: 1
          },
          {
            name: "Robert Martinez",
            email: "rmartinez@construction.co",
            phone: "555-345-6789",
            company: "Martinez Construction",
            projectType: "Industrial Facility",
            source: "LinkedIn",
            sourceIcon: "ri-linkedin-box-fill",
            score: 65,
            status: "in-progress",
            assignedTo: 1
          },
          {
            name: "Alice Peterson",
            email: "apeterson@gmail.com",
            phone: "555-456-7890",
            company: "Peterson Homes",
            projectType: "Residential New Build",
            source: "Website",
            sourceIcon: "ri-global-line",
            score: 78,
            status: "contacted",
            assignedTo: 1
          }
        ];
        
        for (const lead of leadsData) {
          await this.createLead(lead);
        }
        
        // Create AI insights
        const insightsData = [
          {
            title: "Lead Quality Improving",
            description: "Your qualified lead ratio increased by 15% this week compared to last week. Facebook campaigns are generating the highest quality leads.",
            type: "quality",
            icon: "ri-robot-line",
            action: "View Details",
            actionUrl: "/insights/lead-quality"
          },
          {
            title: "Optimal Call Times",
            description: "Based on your data, Tuesday and Thursday mornings (9-11 AM) have the highest lead-to-client conversion rates for scheduled calls.",
            type: "schedule",
            icon: "ri-calendar-check-line",
            action: "Adjust Schedule",
            actionUrl: "/calendar/optimize"
          },
          {
            title: "Project Type Trends",
            description: "There's a 32% increase in Commercial Office inquiries this month. Consider creating a specialized workflow for these leads.",
            type: "trend",
            icon: "ri-building-line",
            action: "Create Workflow",
            actionUrl: "/workflows/new"
          }
        ];
        
        for (const insight of insightsData) {
          await this.createAiInsight(insight);
        }

        console.log("Database seeded with initial data successfully!");
      }
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}

export const dbStorage = new DatabaseStorage();