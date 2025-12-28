const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');

// Get real-time statistics
router.get('/', async (req, res) => {
  try {
    // Check if survey mode is enabled
    const surveyMode = process.env.SURVEY_MODE === 'true';

    if (!surveyMode) {
      return res.status(403).json({
        error: 'Statistics are only available in survey mode',
        mode: 'test'
      });
    }

    // IMPORTANT: Only count users who completed the survey
    // Users who didn't complete survey should NOT be counted at all
    const usersWithSurvey = await User.countDocuments({
      'surveyResponses.completedAt': { $exists: true }
    });

    const totalUsers = await User.countDocuments({
      simulationCompleted: true,
      'surveyResponses.completedAt': { $exists: true }
    });

    // Group distribution - ONLY completed simulations with survey
    const usersByGroup = await User.aggregate([
      { $match: {
        simulationCompleted: true,
        'surveyResponses.completedAt': { $exists: true }
      }},
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    // Survey demographics - ONLY from users who completed survey
    const genderStats = await User.aggregate([
      { $match: {
        'surveyResponses.completedAt': { $exists: true },
        'surveyResponses.gender': { $exists: true, $ne: '' }
      }},
      { $group: { _id: '$surveyResponses.gender', count: { $sum: 1 } } }
    ]);

    const ageStats = await User.aggregate([
      { $match: {
        'surveyResponses.completedAt': { $exists: true },
        'surveyResponses.age': { $exists: true, $ne: '' }
      }},
      { $group: { _id: '$surveyResponses.age', count: { $sum: 1 } } }
    ]);

    const frequencyStats = await User.aggregate([
      { $match: {
        'surveyResponses.completedAt': { $exists: true },
        'surveyResponses.frequency': { $exists: true, $ne: '' }
      }},
      { $group: { _id: '$surveyResponses.frequency', count: { $sum: 1 } } }
    ]);

    // Get userIds of users who completed survey ONLY
    const completedUserIds = await User.find({
      'surveyResponses.completedAt': { $exists: true }
    }).distinct('userId');

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

    // Recent activity (last 24 hours) - ONLY users with survey
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      'surveyResponses.completedAt': { $exists: true },
      simulationCompleted: true,
      createdAt: { $gte: last24Hours }
    });
    const recentEvents = await Event.countDocuments({
      userId: { $in: completedUserIds },
      timestamp: { $gte: last24Hours }
    });

    // Calculate simulation duration metrics - ONLY users with survey
    const usersWithDuration = await User.find({
      'surveyResponses.completedAt': { $exists: true },
      simulationCompleted: true,
      simulationCompletedAt: { $exists: true }
    }).select('createdAt simulationCompletedAt');

    const durations = usersWithDuration.map(u =>
      (new Date(u.simulationCompletedAt) - new Date(u.createdAt)) / 1000 // seconds
    );

    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    // Additional interaction metrics
    const productViewCount = await Event.countDocuments({
      eventType: 'product_view',
      userId: { $in: completedUserIds }
    });
    const productClickCount = await Event.countDocuments({
      eventType: 'product_click',
      userId: { $in: completedUserIds }
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
        total: totalUsers, // Only completed simulations with survey
        started: usersWithSurvey, // All users who completed survey
        completedSimulations: totalUsers, // Same as total now
        dropoffCount: usersWithSurvey - totalUsers, // Completed survey but didn't finish simulation
        simulationCompletionRate: usersWithSurvey > 0 ? ((totalUsers / usersWithSurvey) * 100).toFixed(2) + '%' : '100%',
        byGroup: groupDistribution,
        groupBalance: {
          isBalanced,
          maxDifference: maxDiff,
          distribution: `A:${groupDistribution.A} | B:${groupDistribution.B} | C:${groupDistribution.C}`
        },
        surveyCompleted: usersWithSurvey,
        surveyCompletionRate: '100%', // All counted users completed survey by definition
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
      },
      metrics: {
        simulationDuration: {
          averageSeconds: avgDuration,
          minSeconds: Math.round(minDuration),
          maxSeconds: Math.round(maxDuration),
          averageFormatted: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`
        },
        interactions: {
          productViews: productViewCount,
          productClicks: productClickCount,
          avgProductViewsPerUser: totalUsers > 0 ? (productViewCount / totalUsers).toFixed(2) : '0',
          avgProductClicksPerUser: totalUsers > 0 ? (productClickCount / totalUsers).toFixed(2) : '0'
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

// Export data for scientific analysis (JSON format)
router.get('/export', async (req, res) => {
  try {
    // Check if survey mode is enabled
    const surveyMode = process.env.SURVEY_MODE === 'true';

    if (!surveyMode) {
      return res.status(403).json({
        error: 'Data export is only available in survey mode',
        mode: 'test'
      });
    }

    // Get all users who completed survey (regardless of simulation completion)
    const users = await User.find({
      'surveyResponses.completedAt': { $exists: true }
    }).lean();

    // Get all events for users with survey
    const completedUserIds = users.map(u => u.userId);
    const events = await Event.find({ userId: { $in: completedUserIds } })
      .sort({ timestamp: 1 })
      .lean();

    // Build detailed export data
    const exportData = users.map(user => {
      const userEvents = events.filter(e => e.userId === user.userId);

      // Calculate simulation duration (in seconds)
      const duration = user.simulationCompletedAt && user.createdAt
        ? Math.round((new Date(user.simulationCompletedAt) - new Date(user.createdAt)) / 1000)
        : 0;

      // Extract detailed cart activities
      const addToCartEvents = userEvents
        .filter(e => e.eventType === 'add_to_cart')
        .map(e => ({
          productId: e.eventData?.productId || '',
          productName: e.eventData?.productName || '',
          timestamp: e.timestamp,
          source: 'normal_page'
        }));

      const suggestionAddToCartEvents = userEvents
        .filter(e => e.eventType === 'suggestion_add_to_cart')
        .map(e => ({
          productId: e.eventData?.productId || '',
          productName: e.eventData?.productName || '',
          sourceProductId: e.eventData?.sourceProductId || '',
          timestamp: e.timestamp,
          source: 'suggestion'
        }));

      // Combine all cart additions
      const allCartAdditions = [...addToCartEvents, ...suggestionAddToCartEvents]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return {
        userId: user.userId,
        abTestGroup: user.abTestGroup,
        demographics: {
          gender: user.surveyResponses?.gender || '',
          age: user.surveyResponses?.age || '',
          shoppingFrequency: user.surveyResponses?.frequency || ''
        },
        timeline: {
          createdAt: user.createdAt,
          surveyCompletedAt: user.surveyResponses?.completedAt,
          simulationCompletedAt: user.simulationCompletedAt,
          durationSeconds: duration
        },
        metrics: {
          productViews: userEvents.filter(e => e.eventType === 'product_view').length,
          productClicks: userEvents.filter(e => e.eventType === 'product_click').length,
          suggestionViews: userEvents.filter(e => e.eventType === 'suggestion_view').length,
          suggestionClicks: userEvents.filter(e => e.eventType === 'suggestion_click').length,
          normalAddToCart: addToCartEvents.length,
          suggestionAddToCart: suggestionAddToCartEvents.length,
          totalAddToCart: allCartAdditions.length,
          checkoutCompleted: !!userEvents.find(e => e.eventType === 'checkout_complete')
        },
        cartDetails: allCartAdditions
      };
    });

    res.json({
      exportDate: new Date(),
      totalUsers: exportData.length,
      users: exportData
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
