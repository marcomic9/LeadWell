import { 
  users, type User, type InsertUser,
  leads, type Lead, type InsertLead,
  calls, type Call, type InsertCall,
  projectTypes, type ProjectType, type InsertProjectType,
  marketingChannels, type MarketingChannel, type InsertMarketingChannel,
  aiInsights, type AiInsight, type InsertAiInsight,
  stats, type Stat, type InsertStat,
  communications, type Communication, type InsertCommunication,
  formSubmissions, type FormSubmission, type InsertFormSubmission,
  leadTasks, type LeadTask, type InsertLeadTask
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private calls: Map<number, Call>;
  private projectTypes: Map<number, ProjectType>;
  private marketingChannels: Map<number, MarketingChannel>;
  private aiInsights: Map<number, AiInsight>;
  private stats: Map<number, Stat>;
  private formSubmissions: Map<number, FormSubmission>;
  
  private nextUserId: number;
  private nextLeadId: number;
  private nextCallId: number;
  private nextProjectTypeId: number;
  private nextMarketingChannelId: number;
  private nextAiInsightId: number;
  private nextStatId: number;
  private nextFormSubmissionId: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.calls = new Map();
    this.projectTypes = new Map();
    this.marketingChannels = new Map();
    this.aiInsights = new Map();
    this.stats = new Map();
    this.formSubmissions = new Map();
    
    this.nextUserId = 1;
    this.nextLeadId = 1;
    this.nextCallId = 1;
    this.nextProjectTypeId = 1;
    this.nextMarketingChannelId = 1;
    this.nextAiInsightId = 1;
    this.nextStatId = 1;
    this.nextFormSubmissionId = 1;
    
    // Initialize with some demo data
    this.initDemoData();
  }

  // Helper to initialize demo data
  private initDemoData() {
    // Add a demo user
    const user: InsertUser = {
      username: "mike",
      password: "password123",
      name: "Mike Henderson",
      role: "Project Manager",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    };
    this.createUser(user);
    
    // Add project types
    const projectTypes: InsertProjectType[] = [
      { name: "Residential Renovation", description: "Home renovation projects" },
      { name: "Commercial Office", description: "Office building projects" },
      { name: "Industrial Facility", description: "Industrial and manufacturing facilities" },
      { name: "Residential New Build", description: "New home construction" }
    ];
    
    projectTypes.forEach(type => this.createProjectType(type));
    
    // Add marketing channels
    const marketingChannels: InsertMarketingChannel[] = [
      { name: "Facebook", icon: "ri-facebook-circle-fill", active: true },
      { name: "Google", icon: "ri-google-fill", active: true },
      { name: "LinkedIn", icon: "ri-linkedin-box-fill", active: true },
      { name: "Website", icon: "ri-global-line", active: true },
      { name: "Referrals", icon: "ri-contacts-line", active: true }
    ];
    
    marketingChannels.forEach(channel => this.createMarketingChannel(channel));
    
    // Add stats
    const stats: InsertStat[] = [
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
    
    stats.forEach(stat => this.createStat(stat));
    
    // Add demo leads
    const leads: InsertLead[] = [
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
    
    leads.forEach(lead => this.createLead(lead));
    
    // Add demo calls
    const now = new Date();
    
    const calls: InsertCall[] = [
      {
        leadId: 2, // Sarah Green
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30),
        duration: 30,
        title: "Initial Consultation - Commercial Office",
        notes: "Discuss project requirements and timeline",
        attendees: [{ id: 1, name: "Mike Henderson", role: "Project Manager" }, { id: 0, name: "John", role: "Architect" }]
      },
      {
        leadId: 3, // Robert Martinez
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 15),
        duration: 45,
        title: "Site Assessment - Industrial Facility",
        notes: "Review site plans and discuss logistics",
        attendees: [{ id: 1, name: "Mike Henderson", role: "Project Manager" }, { id: 0, name: "Alex", role: "Engineer" }]
      },
      {
        leadId: 4, // Alice Peterson
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0),
        duration: 30,
        title: "Follow-up - Residential New Build",
        notes: "Present initial design concept",
        attendees: [{ id: 1, name: "Mike Henderson", role: "Project Manager" }]
      }
    ];
    
    calls.forEach(call => this.createCall(call));
    
    // Add AI insights
    const insights: InsertAiInsight[] = [
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
    
    insights.forEach(insight => this.createAiInsight(insight));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Lead methods
  async getLeads(page: number = 1, limit: number = 10): Promise<{ leads: Lead[], total: number }> {
    const allLeads = Array.from(this.leads.values());
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    
    return {
      leads: allLeads.slice(startIdx, endIdx),
      total: allLeads.length
    };
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }
  
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.nextLeadId++;
    const createdAt = new Date();
    const lead = { ...insertLead, id, createdAt };
    this.leads.set(id, lead);
    return lead;
  }
  
  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...updates };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }
  
  // Call methods
  async getCalls(upcomingOnly: boolean = false): Promise<Call[]> {
    const allCalls = Array.from(this.calls.values());
    
    if (upcomingOnly) {
      const now = new Date();
      return allCalls.filter(call => new Date(call.scheduledAt) >= now && !call.completed);
    }
    
    return allCalls;
  }
  
  async getCall(id: number): Promise<Call | undefined> {
    return this.calls.get(id);
  }
  
  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.nextCallId++;
    const call = { ...insertCall, id };
    this.calls.set(id, call);
    return call;
  }
  
  async updateCall(id: number, updates: Partial<InsertCall>): Promise<Call | undefined> {
    const call = this.calls.get(id);
    if (!call) return undefined;
    
    const updatedCall = { ...call, ...updates };
    this.calls.set(id, updatedCall);
    return updatedCall;
  }
  
  // Project type methods
  async getProjectTypes(): Promise<ProjectType[]> {
    return Array.from(this.projectTypes.values());
  }
  
  async createProjectType(insertProjectType: InsertProjectType): Promise<ProjectType> {
    const id = this.nextProjectTypeId++;
    const projectType = { ...insertProjectType, id };
    this.projectTypes.set(id, projectType);
    return projectType;
  }
  
  // Marketing channel methods
  async getMarketingChannels(): Promise<MarketingChannel[]> {
    return Array.from(this.marketingChannels.values());
  }
  
  async createMarketingChannel(insertChannel: InsertMarketingChannel): Promise<MarketingChannel> {
    const id = this.nextMarketingChannelId++;
    const channel = { ...insertChannel, id };
    this.marketingChannels.set(id, channel);
    return channel;
  }
  
  // AI Insight methods
  async getAiInsights(): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values());
  }
  
  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = this.nextAiInsightId++;
    const createdAt = new Date();
    const insight = { ...insertInsight, id, createdAt, read: false };
    this.aiInsights.set(id, insight);
    return insight;
  }
  
  // Stats methods
  async getStats(period: string = 'week'): Promise<Stat[]> {
    return Array.from(this.stats.values())
      .filter(stat => !period || stat.period === period);
  }
  
  async createStat(insertStat: InsertStat): Promise<Stat> {
    const id = this.nextStatId++;
    const stat = { ...insertStat, id };
    this.stats.set(id, stat);
    return stat;
  }
  
  async updateStat(id: number, updates: Partial<InsertStat>): Promise<Stat | undefined> {
    const stat = this.stats.get(id);
    if (!stat) return undefined;
    
    const updatedStat = { ...stat, ...updates };
    this.stats.set(id, updatedStat);
    return updatedStat;
  }
  
  // Form submission methods
  async getFormSubmissions(page: number = 1, limit: number = 10): Promise<{ submissions: FormSubmission[], total: number }> {
    const submissions = Array.from(this.formSubmissions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * limit, page * limit);
    
    return {
      submissions,
      total: this.formSubmissions.size
    };
  }
  
  async getFormSubmission(id: number): Promise<FormSubmission | undefined> {
    return this.formSubmissions.get(id);
  }
  
  async createFormSubmission(insertSubmission: Partial<InsertFormSubmission>): Promise<FormSubmission> {
    const id = this.nextFormSubmissionId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const submission: FormSubmission = {
      id,
      createdAt,
      updatedAt,
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
    
    this.formSubmissions.set(id, submission);
    return submission;
  }
  
  async updateFormSubmission(id: number, updates: Partial<InsertFormSubmission>): Promise<FormSubmission | undefined> {
    const submission = this.formSubmissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission: FormSubmission = {
      ...submission,
      ...updates,
      updatedAt: new Date()
    };
    
    this.formSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }
}

// Database Storage implementation

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Lead methods
  async getLeads(page: number = 1, limit: number = 10): Promise<{ leads: Lead[], total: number }> {
    const offset = (page - 1) * limit;
    
    const leadsData = await db.select().from(leads)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(leads.createdAt));
      
    const [countResult] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(leads);
    
    return {
      leads: leadsData,
      total: countResult.count
    };
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }
  
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }
  
  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updatedLead] = await db
      .update(leads)
      .set({...updates, updatedAt: new Date()})
      .where(eq(leads.id, id))
      .returning();
      
    return updatedLead;
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
    const [call] = await db.select().from(calls).where(eq(calls.id, id));
    return call;
  }
  
  async createCall(insertCall: InsertCall): Promise<Call> {
    const [call] = await db.insert(calls).values(insertCall).returning();
    return call;
  }
  
  async updateCall(id: number, updates: Partial<InsertCall>): Promise<Call | undefined> {
    const [updatedCall] = await db
      .update(calls)
      .set({...updates, updatedAt: new Date()})
      .where(eq(calls.id, id))
      .returning();
      
    return updatedCall;
  }
  
  // Project type methods
  async getProjectTypes(): Promise<ProjectType[]> {
    return db.select().from(projectTypes);
  }
  
  async createProjectType(insertProjectType: InsertProjectType): Promise<ProjectType> {
    const [projectType] = await db.insert(projectTypes).values(insertProjectType).returning();
    return projectType;
  }
  
  // Marketing channel methods
  async getMarketingChannels(): Promise<MarketingChannel[]> {
    return db.select().from(marketingChannels);
  }
  
  async createMarketingChannel(insertChannel: InsertMarketingChannel): Promise<MarketingChannel> {
    const [channel] = await db.insert(marketingChannels).values(insertChannel).returning();
    return channel;
  }
  
  // AI Insight methods
  async getAiInsights(): Promise<AiInsight[]> {
    return db.select().from(aiInsights).orderBy(desc(aiInsights.createdAt));
  }
  
  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const [insight] = await db.insert(aiInsights).values(insertInsight).returning();
    return insight;
  }
  
  // Stats methods
  async getStats(period: string = 'week'): Promise<Stat[]> {
    return db.select().from(stats).where(eq(stats.period, period));
  }
  
  async createStat(insertStat: InsertStat): Promise<Stat> {
    const [stat] = await db.insert(stats).values(insertStat).returning();
    return stat;
  }
  
  async updateStat(id: number, updates: Partial<InsertStat>): Promise<Stat | undefined> {
    const [updatedStat] = await db
      .update(stats)
      .set({...updates, updatedAt: new Date()})
      .where(eq(stats.id, id))
      .returning();
      
    return updatedStat;
  }
  
  // New methods for form submissions (AI lead processing)
  async getFormSubmissions(page: number = 1, limit: number = 10): Promise<{ submissions: FormSubmission[], total: number }> {
    const offset = (page - 1) * limit;
    
    const submissions = await db.select().from(formSubmissions)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(formSubmissions.createdAt));
      
    const [countResult] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(formSubmissions);
    
    return {
      submissions,
      total: countResult.count
    };
  }
  
  async getFormSubmission(id: number): Promise<FormSubmission | undefined> {
    const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    return submission;
  }
  
  async createFormSubmission(insertSubmission: InsertFormSubmission): Promise<FormSubmission> {
    const [submission] = await db.insert(formSubmissions).values(insertSubmission).returning();
    return submission;
  }
  
  async updateFormSubmission(id: number, updates: Partial<InsertFormSubmission>): Promise<FormSubmission | undefined> {
    const [updatedSubmission] = await db
      .update(formSubmissions)
      .set({...updates, updatedAt: new Date()})
      .where(eq(formSubmissions.id, id))
      .returning();
      
    return updatedSubmission;
  }
  
  // Lead task methods
  async getLeadTasks(leadId?: number): Promise<LeadTask[]> {
    if (leadId) {
      return db.select().from(leadTasks)
        .where(eq(leadTasks.leadId, leadId))
        .orderBy(asc(leadTasks.dueDate));
    }
    
    return db.select().from(leadTasks).orderBy(asc(leadTasks.dueDate));
  }
  
  async getLeadTask(id: number): Promise<LeadTask | undefined> {
    const [task] = await db.select().from(leadTasks).where(eq(leadTasks.id, id));
    return task;
  }
  
  async createLeadTask(insertTask: InsertLeadTask): Promise<LeadTask> {
    const [task] = await db.insert(leadTasks).values(insertTask).returning();
    return task;
  }
  
  async updateLeadTask(id: number, updates: Partial<InsertLeadTask>): Promise<LeadTask | undefined> {
    const [updatedTask] = await db
      .update(leadTasks)
      .set({...updates, updatedAt: new Date()})
      .where(eq(leadTasks.id, id))
      .returning();
      
    return updatedTask;
  }
  
  // Communications methods
  async getCommunications(leadId?: number): Promise<Communication[]> {
    if (leadId) {
      return db.select().from(communications)
        .where(eq(communications.leadId, leadId))
        .orderBy(desc(communications.createdAt));
    }
    
    return db.select().from(communications).orderBy(desc(communications.createdAt));
  }
  
  async getCommunication(id: number): Promise<Communication | undefined> {
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    return communication;
  }
  
  async createCommunication(insertCommunication: InsertCommunication): Promise<Communication> {
    const [communication] = await db.insert(communications).values(insertCommunication).returning();
    return communication;
  }
  
  async updateCommunication(id: number, updates: Partial<InsertCommunication>): Promise<Communication | undefined> {
    const [updatedCommunication] = await db
      .update(communications)
      .set({...updates, updatedAt: new Date()})
      .where(eq(communications.id, id))
      .returning();
      
    return updatedCommunication;
  }

  // Helper to seed initial data if tables are empty
  async seedInitialData() {
    // Check if users table is empty
    const [userCount] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(users);
    
    if (userCount.count === 0) {
      // Add a demo user
      await this.createUser({
        username: "mike",
        password: "password123",
        name: "Mike Henderson",
        role: "Project Manager",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      });
      
      // Add project types
      const projectTypes = [
        { name: "Residential Renovation", description: "Home renovation projects" },
        { name: "Commercial Office", description: "Office building projects" },
        { name: "Industrial Facility", description: "Industrial and manufacturing facilities" },
        { name: "Residential New Build", description: "New home construction" }
      ];
      
      for (const type of projectTypes) {
        await this.createProjectType(type);
      }
      
      // Add marketing channels
      const marketingChannels = [
        { name: "Facebook", icon: "ri-facebook-circle-fill", active: true },
        { name: "Google", icon: "ri-google-fill", active: true },
        { name: "LinkedIn", icon: "ri-linkedin-box-fill", active: true },
        { name: "Website", icon: "ri-global-line", active: true },
        { name: "Referrals", icon: "ri-contacts-line", active: true }
      ];
      
      for (const channel of marketingChannels) {
        await this.createMarketingChannel(channel);
      }
      
      // Add stats
      const stats = [
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
      
      for (const stat of stats) {
        await this.createStat(stat);
      }
      
      // Add demo leads
      const leads = [
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
      
      for (const lead of leads) {
        await this.createLead(lead);
      }
      
      // Add demo calls
      const now = new Date();
      
      const calls = [
        {
          leadId: 2, // Sarah Green
          scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30),
          duration: 30,
          title: "Initial Consultation - Commercial Office",
          notes: "Discuss project requirements and timeline",
          attendees: [{ id: 1, name: "Mike Henderson", role: "Project Manager" }, { id: 0, name: "John", role: "Architect" }]
        },
        {
          leadId: 3, // Robert Martinez
          scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 15),
          duration: 45,
          title: "Site Assessment - Industrial Facility",
          notes: "Review site plans and discuss logistics",
          attendees: [{ id: 1, name: "Mike Henderson", role: "Project Manager" }, { id: 0, name: "Alex", role: "Engineer" }]
        },
        {
          leadId: 4, // Alice Peterson
          scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0),
          duration: 30,
          title: "Follow-up - Residential New Build",
          notes: "Present initial design concept",
          attendees: [{ id: 1, name: "Mike Henderson", role: "Project Manager" }]
        }
      ];
      
      for (const call of calls) {
        await this.createCall(call);
      }
      
      // Add AI insights
      const insights = [
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
      
      for (const insight of insights) {
        await this.createAiInsight(insight);
      }
    }
  }
}

export const storage = new DatabaseStorage();
