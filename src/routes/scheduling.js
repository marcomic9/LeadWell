import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as schedulingModel from '../models/scheduling.js';
import * as businessModel from '../models/business.js';
import * as leadModel from '../models/lead.js';
import * as userModel from '../models/user.js';
import * as calendarService from '../services/calendar.js';

const router = express.Router();

/**
 * Get available time slots
 * GET /api/scheduling/available-slots
 */
router.get(
  '/available-slots',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const timezone = req.query.timezone;
      
      if (!startDate || !endDate || !timezone) {
        return res.status(400).json({
          error: true,
          message: 'startDate, endDate, and timezone are required'
        });
      }
      
      // Get the business
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get business hours
      const businessHours = await businessModel.getBusinessHours(business.id);
      
      // Get calendar credentials
      const calendarCredentials = await userModel.getCalendarCredentials(userId);
      if (!calendarCredentials) {
        return res.status(400).json({
          error: true,
          message: 'Calendar integration not set up'
        });
      }
      
      // Get available slots
      const availableSlots = await calendarService.suggestTimeSlots(
        calendarCredentials.refresh_token,
        startDate,
        endDate,
        timezone,
        30, // Default to 30-minute slots
        businessHours.map(hour => ({
          day: hour.day,
          start: hour.start_time,
          end: hour.end_time
        }))
      );
      
      res.json({
        error: false,
        availableSlots
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create a meeting
 * POST /api/scheduling/meetings
 */
router.post(
  '/meetings',
  [
    authenticate,
    body('leadId').notEmpty().withMessage('Lead ID is required'),
    body('title').notEmpty().withMessage('Meeting title is required'),
    body('startTime').isISO8601().withMessage('Valid ISO start time is required'),
    body('endTime').isISO8601().withMessage('Valid ISO end time is required'),
    body('timezone').notEmpty().withMessage('Timezone is required')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const userId = req.user.id;
      const {
        leadId,
        title,
        description,
        startTime,
        endTime,
        timezone,
        location,
        conversationId
      } = req.body;
      
      // Get the business
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Verify lead belongs to business
      const lead = await leadModel.getLeadById(leadId);
      if (!lead || lead.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Lead not found' });
      }
      
      // Get calendar credentials
      const calendarCredentials = await userModel.getCalendarCredentials(userId);
      
      // Create meeting in calendar if credentials exist
      let googleEventId = null;
      if (calendarCredentials) {
        // Check calendar availability
        const isAvailable = await calendarService.checkAvailability(
          calendarCredentials.refresh_token,
          startTime,
          endTime
        );
        
        if (!isAvailable) {
          return res.status(409).json({
            error: true,
            message: 'Selected time slot is no longer available'
          });
        }
        
        // Create calendar event
        const attendees = [];
        if (lead.email) {
          attendees.push({ email: lead.email });
        }
        
        const calendarEvent = await calendarService.createMeeting(
          calendarCredentials.refresh_token,
          title,
          description || '',
          startTime,
          endTime,
          timezone,
          attendees,
          location
        );
        
        googleEventId = calendarEvent.id;
      }
      
      // Create meeting in database
      const meeting = await schedulingModel.createMeeting(
        leadId,
        business.id,
        conversationId,
        {
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          timezone,
          location,
          google_event_id: googleEventId
        }
      );
      
      // If lead was created through a conversation, update lead status
      if (lead.status === 'new') {
        await leadModel.updateLeadStatus(leadId, 'qualified');
      }
      
      res.status(201).json({
        error: false,
        message: 'Meeting created successfully',
        meeting
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get all meetings for a business
 * GET /api/scheduling/meetings
 */
router.get(
  '/meetings',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Get the business
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Extract filter parameters
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy,
        sortDesc: req.query.sortDesc === 'true',
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };
      
      // Get meetings
      const meetings = await schedulingModel.getMeetingsByBusinessId(business.id, filters);
      
      res.json({
        error: false,
        meetings,
        count: meetings.length,
        filters
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get a specific meeting
 * GET /api/scheduling/meetings/:id
 */
router.get(
  '/meetings/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const meetingId = req.params.id;
      
      // Get the business
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get meeting
      const meeting = await schedulingModel.getMeetingById(meetingId);
      
      // Check if meeting belongs to this business
      if (!meeting || meeting.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Meeting not found' });
      }
      
      // Get lead information
      const lead = await leadModel.getLeadById(meeting.lead_id);
      
      res.json({
        error: false,
        meeting,
        lead
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update a meeting
 * PUT /api/scheduling/meetings/:id
 */
router.put(
  '/meetings/:id',
  [
    authenticate,
    body('title').optional(),
    body('description').optional(),
    body('startTime').optional().isISO8601().withMessage('Valid ISO start time is required'),
    body('endTime').optional().isISO8601().withMessage('Valid ISO end time is required'),
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'rescheduled']).withMessage('Invalid status')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
      }
      
      const userId = req.user.id;
      const meetingId = req.params.id;
      
      // Get the business
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get meeting
      const meeting = await schedulingModel.getMeetingById(meetingId);
      
      // Check if meeting belongs to this business
      if (!meeting || meeting.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Meeting not found' });
      }
      
      // Update meeting
      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.startTime) updates.start_time = req.body.startTime;
      if (req.body.endTime) updates.end_time = req.body.endTime;
      if (req.body.status) updates.status = req.body.status;
      
      const updatedMeeting = await schedulingModel.updateMeeting(meetingId, updates);
      
      // TODO: If calendar integration exists, update the calendar event too
      
      res.json({
        error: false,
        message: 'Meeting updated successfully',
        meeting: updatedMeeting
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Cancel a meeting
 * DELETE /api/scheduling/meetings/:id
 */
router.delete(
  '/meetings/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const meetingId = req.params.id;
      
      // Get the business
      const business = await businessModel.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: true, message: 'Business not found' });
      }
      
      // Get meeting
      const meeting = await schedulingModel.getMeetingById(meetingId);
      
      // Check if meeting belongs to this business
      if (!meeting || meeting.business_id !== business.id) {
        return res.status(404).json({ error: true, message: 'Meeting not found' });
      }
      
      // Delete meeting
      await schedulingModel.deleteMeeting(meetingId);
      
      // TODO: If calendar integration exists, delete the calendar event too
      
      res.json({
        error: false,
        message: 'Meeting cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as schedulingRouter };