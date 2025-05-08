import { google } from 'googleapis';
import dotenv from 'dotenv';
import moment from 'moment-timezone';

dotenv.config();

/**
 * Creates a Google Calendar API client with the provided OAuth2 credentials
 * 
 * @param {string} refreshToken - OAuth2 refresh token
 * @returns {object} - Configured Google Calendar API client
 */
const createCalendarClient = (refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

/**
 * Checks availability for a given time range in the user's calendar
 * 
 * @param {string} refreshToken - User's OAuth2 refresh token
 * @param {string} startTime - ISO datetime string for the meeting start
 * @param {string} endTime - ISO datetime string for the meeting end
 * @returns {Promise<boolean>} - Whether the time slot is available
 */
export const checkAvailability = async (refreshToken, startTime, endTime) => {
  try {
    const calendar = createCalendarClient(refreshToken);
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: 'primary' }]
      }
    });

    const busySlots = response.data.calendars.primary.busy;
    return busySlots.length === 0; // Returns true if no busy slots found
  } catch (error) {
    console.error('Google Calendar Availability Error:', error);
    throw new Error('Failed to check calendar availability');
  }
};

/**
 * Creates a meeting event in the user's calendar
 * 
 * @param {string} refreshToken - User's OAuth2 refresh token
 * @param {string} summary - Meeting title
 * @param {string} description - Meeting description
 * @param {string} startTime - ISO datetime string for the meeting start
 * @param {string} endTime - ISO datetime string for the meeting end
 * @param {string} timezone - Timezone identifier (e.g., 'America/New_York')
 * @param {Array} attendees - Array of {email} objects for attendees
 * @param {string} location - Optional meeting location (can be virtual)
 * @returns {Promise<object>} - Created event details
 */
export const createMeeting = async (
  refreshToken,
  summary,
  description,
  startTime,
  endTime,
  timezone,
  attendees,
  location = null
) => {
  try {
    const calendar = createCalendarClient(refreshToken);
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: timezone
      },
      end: {
        dateTime: endTime,
        timeZone: timezone
      },
      attendees,
      sendUpdates: 'all'
    };

    if (location) {
      event.location = location;
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });

    return response.data;
  } catch (error) {
    console.error('Google Calendar Event Creation Error:', error);
    throw new Error('Failed to create calendar event');
  }
};

/**
 * Suggests available time slots for a given date range
 * 
 * @param {string} refreshToken - User's OAuth2 refresh token
 * @param {string} startDate - ISO date string for the start of search range
 * @param {string} endDate - ISO date string for the end of search range
 * @param {string} timezone - Timezone identifier
 * @param {number} durationMinutes - Meeting duration in minutes
 * @param {array} businessHours - Array of business hours objects by day of week
 * @returns {Promise<array>} - List of available time slots
 */
export const suggestTimeSlots = async (
  refreshToken,
  startDate,
  endDate,
  timezone,
  durationMinutes = 30,
  businessHours
) => {
  try {
    const calendar = createCalendarClient(refreshToken);
    
    // Get busy times from calendar
    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: moment.tz(startDate, timezone).startOf('day').toISOString(),
        timeMax: moment.tz(endDate, timezone).endOf('day').toISOString(),
        items: [{ id: 'primary' }]
      }
    });
    
    const busySlots = freebusy.data.calendars.primary.busy;
    
    // Generate all possible slots within business hours
    const availableSlots = [];
    const current = moment.tz(startDate, timezone).startOf('day');
    const end = moment.tz(endDate, timezone).endOf('day');
    
    while (current.isSameOrBefore(end, 'day')) {
      const dayOfWeek = current.format('dddd').toLowerCase();
      const dayHours = businessHours.find(h => h.day === dayOfWeek);
      
      if (dayHours) {
        const dayStart = moment.tz(current.format('YYYY-MM-DD') + 'T' + dayHours.start, timezone);
        const dayEnd = moment.tz(current.format('YYYY-MM-DD') + 'T' + dayHours.end, timezone);
        
        // Create slots in 30-minute increments
        const slotStart = dayStart.clone();
        while (slotStart.add(durationMinutes, 'minutes').isSameOrBefore(dayEnd)) {
          const slotEnd = slotStart.clone().add(durationMinutes, 'minutes');
          
          // Check if slot conflicts with any busy time
          const isAvailable = !busySlots.some(busy => {
            const busyStart = moment(busy.start);
            const busyEnd = moment(busy.end);
            return (
              (slotStart.isSameOrAfter(busyStart) && slotStart.isBefore(busyEnd)) ||
              (slotEnd.isAfter(busyStart) && slotEnd.isSameOrBefore(busyEnd)) ||
              (slotStart.isSameOrBefore(busyStart) && slotEnd.isSameOrAfter(busyEnd))
            );
          });
          
          if (isAvailable) {
            availableSlots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString()
            });
          }
        }
      }
      
      current.add(1, 'day');
    }
    
    return availableSlots;
  } catch (error) {
    console.error('Calendar Slot Suggestion Error:', error);
    throw new Error('Failed to suggest available time slots');
  }
};

export default {
  checkAvailability,
  createMeeting,
  suggestTimeSlots
}; 