import { relations } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email"),
  phone: text("phone"),
  jobTitle: text("job_title"),
  department: text("department"),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  calls: many(calls),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  email: true,
  phone: true,
  jobTitle: true,
  department: true,
  bio: true,
  avatar: true,
});

// Leads Table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  projectType: text("project_type").notNull(),
  budget: integer("budget"),
  timeline: text("timeline"),
  source: text("source").notNull(),
  sourceIcon: text("source_icon"),
  score: integer("score").default(0),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  // New fields for AI automation
  aiQualified: boolean("ai_qualified"), // If lead was qualified by AI
  aiQualificationReason: text("ai_qualification_reason"), // Reason for AI qualification decision
  aiProcessed: boolean("ai_processed").default(false), // Whether AI has processed this lead
  aiScoreDetails: json("ai_score_details").$type<{
    intentScore: number;
    budgetScore: number;
    projectFitScore: number;
    legitimacyScore: number;
    urgencyScore: number;
  }>(),
  aiAnalysis: text("ai_analysis"), // Full AI analysis of the lead
  aiFollowUpStatus: text("ai_follow_up_status"), // Status of AI follow-up
  aiFollowUpDate: timestamp("ai_follow_up_date"), // When to follow up
  aiSentiment: text("ai_sentiment"), // Sentiment analysis
  aiIntent: text("ai_intent"), // Extracted intent
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
});

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignee: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  calls: many(calls),
  tasks: many(leadTasks)
}));

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  aiQualified: true,
  aiQualificationReason: true,
  aiProcessed: true,
  aiScoreDetails: true,
  aiAnalysis: true,
  aiFollowUpStatus: true,
  aiFollowUpDate: true,
  aiSentiment: true,
  aiIntent: true,
});

// Lead Tasks (for AI-generated tasks and follow-ups)
export const leadTasks = pgTable("lead_tasks", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(),
  priority: text("priority").default("medium").notNull(),
  dueDate: timestamp("due_date"),
  assignedTo: integer("assigned_to").references(() => users.id),
  isAiGenerated: boolean("is_ai_generated").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadTasksRelations = relations(leadTasks, ({ one }) => ({
  lead: one(leads, {
    fields: [leadTasks.leadId],
    references: [leads.id],
  }),
  assignee: one(users, {
    fields: [leadTasks.assignedTo],
    references: [users.id],
  }),
}));

export const insertLeadTaskSchema = createInsertSchema(leadTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Calls Table
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(30),
  title: text("title").notNull(),
  notes: text("notes"),
  completed: boolean("completed").default(false),
  attendees: json("attendees").default([]),
  // New fields for AI-scheduled calls
  aiScheduled: boolean("ai_scheduled").default(false), // If call was scheduled by AI
  aiSummary: text("ai_summary"), // AI-generated summary before/after call
  recordingUrl: text("recording_url"),
  followUpNeeded: boolean("follow_up_needed").default(false),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const callsRelations = relations(calls, ({ one }) => ({
  lead: one(leads, {
    fields: [calls.leadId],
    references: [leads.id],
  }),
}));

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  aiSummary: true,
  recordingUrl: true,
});

// Project Types
export const projectTypes = pgTable("project_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  minBudget: integer("min_budget"),
  averageTimeline: text("average_timeline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectTypeSchema = createInsertSchema(projectTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Marketing Channels
export const marketingChannels = pgTable("marketing_channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  active: boolean("active").default(true),
  conversionRate: integer("conversion_rate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketingChannelSchema = createInsertSchema(marketingChannels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Form Submissions (for lead intake with AI processing)
export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formType: text("form_type").notNull(), // contact, quote, consultation, etc.
  rawData: json("raw_data").notNull(), // All form fields as submitted
  leadId: integer("lead_id").references(() => leads.id), // Created lead (if qualified)
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  aiProcessed: boolean("ai_processed").default(false),
  aiResponse: json("ai_response"), // AI response data
  status: text("status").default("pending").notNull(), // pending, processed, qualified, rejected
  source: text("source"), // Where the form was submitted from
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  lead: one(leads, {
    fields: [formSubmissions.leadId],
    references: [leads.id],
  }),
}));

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  aiProcessed: true,
  aiResponse: true,
  leadId: true,
});

// AI Insights
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  icon: text("icon").notNull(),
  action: text("action"),
  actionUrl: text("action_url"),
  relatedLeads: json("related_leads").$type<number[]>().default([]), // IDs of related leads
  relatedProjectTypes: json("related_project_types").$type<string[]>().default([]), // Types of projects
  priority: text("priority").default("medium"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false),
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

// Automated Communications
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // email, sms, etc
  direction: text("direction").notNull(), // inbound, outbound
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  status: text("status").default("pending").notNull(), // pending, sent, delivered, failed
  sentAt: timestamp("sent_at"),
  aiGenerated: boolean("ai_generated").default(false),
  aiAnalysis: text("ai_analysis"), // AI analysis of inbound communication
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communicationsRelations = relations(communications, ({ one }) => ({
  lead: one(leads, {
    fields: [communications.leadId],
    references: [leads.id],
  }),
}));

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  aiAnalysis: true,
});

// Stats
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), 
  value: text("value").notNull(),
  changePercentage: integer("change_percentage"),
  icon: text("icon").notNull(),
  iconBg: text("icon_bg").notNull(),
  iconColor: text("icon_color").notNull(),
  period: text("period").notNull().default("week"),
  date: date("date").defaultNow(), // Date this stat was recorded
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStatSchema = createInsertSchema(stats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type LeadTask = typeof leadTasks.$inferSelect;
export type InsertLeadTask = z.infer<typeof insertLeadTaskSchema>;

export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;

export type ProjectType = typeof projectTypes.$inferSelect;
export type InsertProjectType = z.infer<typeof insertProjectTypeSchema>;

export type MarketingChannel = typeof marketingChannels.$inferSelect;
export type InsertMarketingChannel = z.infer<typeof insertMarketingChannelSchema>;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;

export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;

export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;
