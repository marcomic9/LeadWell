import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as leadModel from '../models/lead.js';
import * as conversationModel from '../models/conversation.js';
import * as schedulingModel from '../models/scheduling.js';
import * as businessModel from '../models/business.js';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * Get dashboard overview data
 * GET /api/dashboard/overview
 */
router.get(
  '/overview',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get counts for leads by status
      const leadStats = {
        total: 0,
        new: 0,
        qualified: 0,
        unqualified: 0,
        converted: 0,
        inactive: 0
      };
      
      // Get all leads for this business
      const leads = await leadModel.getLeadsByBusinessId(business.id);
      
      // Calculate lead statistics
      leads.forEach(lead => {
        leadStats.total++;
        leadStats[lead.status]++;
      });
      
      // Get recent leads (last 5)
      const recentLeads = leads
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      // Get upcoming meetings
      const upcomingMeetings = await schedulingModel.getMeetingsByBusinessId(business.id, {
        status: 'scheduled',
        startDate: new Date().toISOString(),
        sortBy: 'start_time',
        limit: 5
      });
      
      // Get active conversations
      const activeConversations = await supabase
        .from('conversations')
        .select('*, leads(*)')
        .eq('business_id', business.id)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })
        .limit(5);
      
      // Calculate engagement metrics
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get leads in the last 30 days
      const recentLeadsCount = leads.filter(
        lead => new Date(lead.created_at) >= thirtyDaysAgo
      ).length;
      
      // Get meetings in the last 30 days
      const { data: recentMeetings } = await supabase
        .from('meetings')
        .select('*')
        .eq('business_id', business.id)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      const recentMeetingsCount = recentMeetings ? recentMeetings.length : 0;
      
      // Get message count in the last 30 days
      const { data: recentMessageData, error: messageError } = await supabase
        .from('messages')
        .select('id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .in('conversation_id', activeConversations.data.map(c => c.id));
      
      const recentMessagesCount = recentMessageData ? recentMessageData.length : 0;
      
      // Calculate engagement rate (simplified)
      const engagementRate = recentLeadsCount > 0 
        ? Math.round((recentMeetingsCount / recentLeadsCount) * 100) 
        : 0;
      
      res.json({
        error: false,
        leadStats,
        recentLeads,
        upcomingMeetings,
        activeConversations: activeConversations.data,
        engagementMetrics: {
          leadsLast30Days: recentLeadsCount,
          meetingsLast30Days: recentMeetingsCount,
          messagesLast30Days: recentMessagesCount,
          engagementRate: `${engagementRate}%`
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get lead analytics
 * GET /api/dashboard/analytics/leads
 */
router.get(
  '/analytics/leads',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const period = req.query.period || '30days'; // '7days', '30days', '90days', 'year'
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Calculate date range based on period
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Get leads created in the period
      const { data: periodicLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', business.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (leadsError) throw leadsError;
      
      // Group leads by date for time series
      const leadsByDate = {};
      const leadsBySource = {};
      const leadsByStatus = {
        new: 0,
        qualified: 0,
        unqualified: 0,
        converted: 0,
        inactive: 0
      };
      
      periodicLeads.forEach(lead => {
        // Group by date (YYYY-MM-DD)
        const dateStr = new Date(lead.created_at).toISOString().split('T')[0];
        if (!leadsByDate[dateStr]) {
          leadsByDate[dateStr] = 0;
        }
        leadsByDate[dateStr]++;
        
        // Group by source
        const source = lead.source || 'unknown';
        if (!leadsBySource[source]) {
          leadsBySource[source] = 0;
        }
        leadsBySource[source]++;
        
        // Count by status
        leadsByStatus[lead.status]++;
      });
      
      // Convert to time series format for charts
      const timeSeriesData = Object.keys(leadsByDate)
        .sort()
        .map(date => ({
          date,
          count: leadsByDate[date]
        }));
      
      // Convert source data to array for charts
      const sourceData = Object.keys(leadsBySource).map(source => ({
        source,
        count: leadsBySource[source]
      })).sort((a, b) => b.count - a.count);
      
      // Convert status data to array for charts
      const statusData = Object.keys(leadsByStatus).map(status => ({
        status,
        count: leadsByStatus[status]
      }));
      
      res.json({
        error: false,
        totalLeads: periodicLeads.length,
        timeSeriesData,
        sourceData,
        statusData,
        period
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get conversation analytics
 * GET /api/dashboard/analytics/conversations
 */
router.get(
  '/analytics/conversations',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const period = req.query.period || '30days'; // '7days', '30days', '90days', 'year'
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Calculate date range based on period
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Get conversations in the period
      const { data: conversations, error: convoError } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', business.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (convoError) throw convoError;
      
      // Get message counts
      const conversationIds = conversations.map(c => c.id);
      
      let messageAnalytics = {
        totalMessages: 0,
        fromLead: 0,
        fromAssistant: 0,
        averageMessagesPerConversation: 0
      };
      
      if (conversationIds.length > 0) {
        // Get all messages for these conversations
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds);
        
        if (msgError) throw msgError;
        
        if (messages && messages.length > 0) {
          messageAnalytics.totalMessages = messages.length;
          messageAnalytics.fromLead = messages.filter(m => m.is_from_lead).length;
          messageAnalytics.fromAssistant = messages.filter(m => !m.is_from_lead).length;
          messageAnalytics.averageMessagesPerConversation = Math.round(
            messages.length / conversationIds.length
          );
        }
      }
      
      // Group conversations by date
      const conversationsByDate = {};
      conversations.forEach(convo => {
        const dateStr = new Date(convo.created_at).toISOString().split('T')[0];
        if (!conversationsByDate[dateStr]) {
          conversationsByDate[dateStr] = 0;
        }
        conversationsByDate[dateStr]++;
      });
      
      // Convert to time series format
      const timeSeriesData = Object.keys(conversationsByDate)
        .sort()
        .map(date => ({
          date,
          count: conversationsByDate[date]
        }));
      
      res.json({
        error: false,
        totalConversations: conversations.length,
        messageAnalytics,
        timeSeriesData,
        period
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get meeting analytics
 * GET /api/dashboard/analytics/meetings
 */
router.get(
  '/analytics/meetings',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const period = req.query.period || '30days'; // '7days', '30days', '90days', 'year'
      
      // Get the business for this user
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Calculate date range based on period
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Get meetings in the period
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .eq('business_id', business.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (meetingsError) throw meetingsError;
      
      // Group meetings by status
      const meetingsByStatus = {
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        rescheduled: 0
      };
      
      // Group meetings by date
      const meetingsByDate = {};
      
      meetings.forEach(meeting => {
        // Count by status
        meetingsByStatus[meeting.status] = (meetingsByStatus[meeting.status] || 0) + 1;
        
        // Group by date (when the meeting is scheduled for, not created)
        const dateStr = new Date(meeting.start_time).toISOString().split('T')[0];
        if (!meetingsByDate[dateStr]) {
          meetingsByDate[dateStr] = 0;
        }
        meetingsByDate[dateStr]++;
      });
      
      // Convert to arrays for charts
      const statusData = Object.keys(meetingsByStatus).map(status => ({
        status,
        count: meetingsByStatus[status]
      }));
      
      const timeSeriesData = Object.keys(meetingsByDate)
        .sort()
        .map(date => ({
          date,
          count: meetingsByDate[date]
        }));
      
      // Calculate conversion rate (leads to meetings)
      const { data: leadsInPeriod, error: leadsError } = await supabase
        .from('leads')
        .select('id')
        .eq('business_id', business.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (leadsError) throw leadsError;
      
      const leadCount = leadsInPeriod ? leadsInPeriod.length : 0;
      const conversionRate = leadCount > 0 
        ? Math.round((meetings.length / leadCount) * 100) 
        : 0;
      
      res.json({
        error: false,
        totalMeetings: meetings.length,
        statusData,
        timeSeriesData,
        conversionMetrics: {
          totalLeads: leadCount,
          leadsToMeetingRate: `${conversionRate}%`
        },
        period
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as dashboardRouter }; 