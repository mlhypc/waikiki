const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');

// Get real-time statistics
router.get('/', async (req, res) => {
  try {
    // IMPORTANT: Only count users who completed the simulation
    // Users who started but didn't finish should NOT be counted
    const totalUsers = await User.countDocuments({ simulationCompleted: true });
    const allUsers = await User.countDocuments(); // For debugging

    // Group distribution - ONLY completed simulations
    const usersByGroup = await User.aggregate([
      { $match: { simulationCompleted: true } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    // Survey completion - among those who completed simulation
    const surveyCompleted = await User.countDocuments({
      simulationCompleted: true,
      'surveyResponses.completedAt': { $exists: true }
    });

    // Survey demographics - ONLY from completed simulations
    const genderStats = await User.aggregate([
      { $match: {
        simulationCompleted: true,
        'surveyResponses.gender': { $exists: true, $ne: '' }
      }},
      { $group: { _id: '$surveyResponses.gender', count: { $sum: 1 } } }
    ]);

    const ageStats = await User.aggregate([
      { $match: {
        simulationCompleted: true,
        'surveyResponses.age': { $exists: true, $ne: '' }
      }},
      { $group: { _id: '$surveyResponses.age', count: { $sum: 1 } } }
    ]);

    const frequencyStats = await User.aggregate([
      { $match: {
        simulationCompleted: true,
        'surveyResponses.frequency': { $exists: true, $ne: '' }
      }},
      { $group: { _id: '$surveyResponses.frequency', count: { $sum: 1 } } }
    ]);

    // Get userIds of completed simulations ONLY
    const completedUserIds = await User.find({ simulationCompleted: true })
      .distinct('userId');

    // Event statistics - ONLY from completed simulations
    const totalEvents = await Event.countDocuments({ userId: { $in: completedUserIds } });
    const eventsByType = await Event.aggregate([
      { $match: { userId: { $in: completedUserIds } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);

    // A/B/C test metrics - ONLY from completed simulations
    const suggestionViews = await Event.aggregate([
      { $match: { eventType: 'suggestion_view', userId: { $in: completedUserIds } } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    const suggestionClicks = await Event.aggregate([
      { $match: { eventType: 'suggestion_click', userId: { $in: completedUserIds } } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    const suggestionAddToCart = await Event.aggregate([
      { $match: { eventType: 'suggestion_add_to_cart', userId: { $in: completedUserIds } } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    // Checkout statistics - ONLY from completed simulations
    const checkoutStarts = await Event.countDocuments({
      eventType: 'checkout_start',
      userId: { $in: completedUserIds }
    });
    const checkoutCompletes = await Event.countDocuments({
      eventType: 'checkout_complete',
      userId: { $in: completedUserIds }
    });

    const checkoutByGroup = await Event.aggregate([
      { $match: { eventType: 'checkout_complete', userId: { $in: completedUserIds } } },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 24 hours) - ONLY completed simulations
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      simulationCompleted: true,
      createdAt: { $gte: last24Hours }
    });
    const recentEvents = await Event.countDocuments({
      userId: { $in: completedUserIds },
      timestamp: { $gte: last24Hours }
    });

    // Calculate group distribution balance
    const groupDistribution = usersByGroup.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, { A: 0, B: 0, C: 0 });

    const maxDiff = Math.max(...Object.values(groupDistribution)) - Math.min(...Object.values(groupDistribution));
    const isBalanced = maxDiff <= 1; // Balanced if difference is at most 1

    res.json({
      timestamp: new Date(),
      users: {
        total: totalUsers, // Only completed simulations
        started: allUsers, // All users (including incomplete)
        completedSimulations: totalUsers, // Same as total now
        dropoffCount: allUsers - totalUsers, // Started but didn't finish
        simulationCompletionRate: allUsers > 0 ? ((totalUsers / allUsers) * 100).toFixed(2) + '%' : '100%',
        byGroup: groupDistribution,
        groupBalance: {
          isBalanced,
          maxDifference: maxDiff,
          distribution: `A:${groupDistribution.A} | B:${groupDistribution.B} | C:${groupDistribution.C}`
        },
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

// Reset all statistics (DANGER: Use only for testing!)
router.post('/reset', async (req, res) => {
  try {
    const { confirmSecret } = req.body;

    // Require secret confirmation to prevent accidental deletion
    const RESET_SECRET = process.env.STATS_RESET_SECRET || 'RESET_STATS_2025';
    if (confirmSecret !== RESET_SECRET) {
      return res.status(403).json({
        error: 'Invalid secret. Provide correct confirmSecret to reset stats.',
        hint: 'Check STATS_RESET_SECRET in .env or use default'
      });
    }

    // Delete all users and events
    const usersDeleted = await User.deleteMany({});
    const eventsDeleted = await Event.deleteMany({});

    res.json({
      success: true,
      message: 'All statistics have been reset',
      deleted: {
        users: usersDeleted.deletedCount,
        events: eventsDeleted.deletedCount
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Stats reset error:', error);
    res.status(500).json({ error: 'Failed to reset statistics' });
  }
});

module.exports = router;
