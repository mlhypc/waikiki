const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');

// Get real-time statistics
router.get('/', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const usersByGroup = await User.aggregate([
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    const surveyCompleted = await User.countDocuments({ 'surveyResponses.completedAt': { $exists: true } });

    // Survey demographics
    const genderStats = await User.aggregate([
      { $match: { 'surveyResponses.gender': { $exists: true, $ne: '' } } },
      { $group: { _id: '$surveyResponses.gender', count: { $sum: 1 } } }
    ]);

    const ageStats = await User.aggregate([
      { $match: { 'surveyResponses.age': { $exists: true, $ne: '' } } },
      { $group: { _id: '$surveyResponses.age', count: { $sum: 1 } } }
    ]);

    const frequencyStats = await User.aggregate([
      { $match: { 'surveyResponses.frequency': { $exists: true, $ne: '' } } },
      { $group: { _id: '$surveyResponses.frequency', count: { $sum: 1 } } }
    ]);

    // Event statistics
    const totalEvents = await Event.countDocuments();
    const eventsByType = await Event.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);

    // A/B/C test metrics
    const suggestionViews = await Event.aggregate([
      { $match: { eventType: 'suggestion_view' } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    const suggestionClicks = await Event.aggregate([
      { $match: { eventType: 'suggestion_click' } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    const suggestionAddToCart = await Event.aggregate([
      { $match: { eventType: 'suggestion_add_to_cart' } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    // Checkout statistics
    const checkoutStarts = await Event.countDocuments({ eventType: 'checkout_start' });
    const checkoutCompletes = await Event.countDocuments({ eventType: 'checkout_complete' });

    const checkoutByGroup = await Event.aggregate([
      { $match: { eventType: 'checkout_complete' } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: last24Hours } });
    const recentEvents = await Event.countDocuments({ timestamp: { $gte: last24Hours } });

    res.json({
      timestamp: new Date(),
      users: {
        total: totalUsers,
        byGroup: usersByGroup.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {}),
        surveyCompleted,
        surveyCompletionRate: totalUsers > 0 ? (surveyCompleted / totalUsers * 100).toFixed(2) + '%' : '0%',
        demographics: {
          gender: genderStats.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
          }, {}),
          age: ageStats.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
          }, {}),
          frequency: frequencyStats.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
          }, {})
        }
      },
      events: {
        total: totalEvents,
        byType: eventsByType.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {})
      },
      abTest: {
        suggestionViews: suggestionViews.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {}),
        suggestionClicks: suggestionClicks.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {}),
        suggestionAddToCart: suggestionAddToCart.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {}),
        // Calculate CTR (Click Through Rate)
        ctr: (() => {
          const ctr = {};
          suggestionViews.forEach(({ _id, count: views }) => {
            const clicks = suggestionClicks.find(c => c._id === _id)?.count || 0;
            ctr[_id] = views > 0 ? ((clicks / views) * 100).toFixed(2) + '%' : '0%';
          });
          return ctr;
        })(),
        // Calculate conversion rate (add to cart / views)
        conversionRate: (() => {
          const cr = {};
          suggestionViews.forEach(({ _id, count: views }) => {
            const addToCarts = suggestionAddToCart.find(c => c._id === _id)?.count || 0;
            cr[_id] = views > 0 ? ((addToCarts / views) * 100).toFixed(2) + '%' : '0%';
          });
          return cr;
        })()
      },
      checkout: {
        starts: checkoutStarts,
        completes: checkoutCompletes,
        completionRate: checkoutStarts > 0 ? ((checkoutCompletes / checkoutStarts) * 100).toFixed(2) + '%' : '0%',
        byGroup: checkoutByGroup.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {})
      },
      recentActivity: {
        last24Hours: {
          newUsers: recentUsers,
          events: recentEvents
        }
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
