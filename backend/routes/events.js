const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Track event
router.post('/', async (req, res) => {
  try {
    // Check if survey mode is enabled
    const surveyMode = process.env.SURVEY_MODE === 'true';

    if (!surveyMode) {
      // In test mode, acknowledge but don't save
      return res.status(201).json({ success: true, mode: 'test', saved: false });
    }

    const {
      userId,
      sessionId,
      eventType,
      eventData,
      abTestGroup
    } = req.body;

    // Validate required fields
    if (!userId || !sessionId || !eventType || !eventData) {
      return res.status(400).json({
        error: 'Missing required fields: userId, sessionId, eventType, eventData'
      });
    }

    const event = new Event({
      userId,
      sessionId,
      eventType,
      eventData,
      abTestGroup,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await event.save();
    res.status(201).json({ success: true, eventId: event._id, mode: 'survey', saved: true });
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Batch track events (for better performance)
router.post('/batch', async (req, res) => {
  try {
    // Check if survey mode is enabled
    const surveyMode = process.env.SURVEY_MODE === 'true';

    if (!surveyMode) {
      // In test mode, acknowledge but don't save
      return res.status(201).json({ success: true, mode: 'test', saved: false, count: 0 });
    }

    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Events array is required' });
    }

    const enrichedEvents = events.map(event => ({
      ...event,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    }));

    await Event.insertMany(enrichedEvents);
    res.status(201).json({ success: true, mode: 'survey', saved: true, count: events.length });
  } catch (error) {
    console.error('Batch event tracking error:', error);
    res.status(500).json({ error: 'Failed to track events' });
  }
});

// Get events for a user (for debugging/admin)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const events = await Event.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({ events, count: events.length });
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
