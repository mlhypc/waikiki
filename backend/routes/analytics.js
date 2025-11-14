const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

// Get analytics overview
router.get('/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();

    const usersByGroup = await User.aggregate([
      {
        $group: {
          _id: '$abTestGroup',
          count: { $sum: 1 },
          avgBalance: { $avg: '$balance' },
          avgPurchases: { $avg: '$totalPurchases' },
          avgSpent: { $avg: '$totalSpent' }
        }
      }
    ]);

    const eventsByType = await Event.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalEvents,
        usersByGroup,
        eventsByType
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get conversion funnel
router.get('/funnel', async (req, res) => {
  try {
    const { abTestGroup } = req.query;

    const matchStage = abTestGroup ? { abTestGroup } : {};

    const funnel = await Event.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$eventType',
          uniqueUsers: { $addToSet: '$userId' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          eventType: '$_id',
          uniqueUsers: { $size: '$uniqueUsers' },
          totalEvents: '$count'
        }
      }
    ]);

    // Calculate funnel metrics
    const pageViews = funnel.find(f => f.eventType === 'page_view') || { uniqueUsers: 0 };
    const productViews = funnel.find(f => f.eventType === 'product_view') || { uniqueUsers: 0 };
    const addToCarts = funnel.find(f => f.eventType === 'add_to_cart') || { uniqueUsers: 0 };
    const checkoutStarts = funnel.find(f => f.eventType === 'checkout_start') || { uniqueUsers: 0 };
    const purchases = funnel.find(f => f.eventType === 'checkout_complete') || { uniqueUsers: 0 };

    res.json({
      funnel: {
        pageViews: pageViews.uniqueUsers,
        productViews: productViews.uniqueUsers,
        addToCarts: addToCarts.uniqueUsers,
        checkoutStarts: checkoutStarts.uniqueUsers,
        purchases: purchases.uniqueUsers,
        conversionRate: pageViews.uniqueUsers > 0
          ? ((purchases.uniqueUsers / pageViews.uniqueUsers) * 100).toFixed(2)
          : 0
      },
      rawData: funnel
    });
  } catch (error) {
    console.error('Funnel analytics error:', error);
    res.status(500).json({ error: 'Failed to get funnel analytics' });
  }
});

// Export all data (for analysis)
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, abTestGroup } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    let groupFilter = {};
    if (abTestGroup) {
      groupFilter.abTestGroup = abTestGroup;
    }

    const events = await Event.find({ ...dateFilter, ...groupFilter }).lean();
    const users = await User.find(groupFilter).lean();

    const exportData = {
      events,
      users,
      metadata: {
        exportDate: new Date().toISOString(),
        eventCount: events.length,
        userCount: users.length,
        filters: { startDate, endDate, abTestGroup }
      }
    };

    if (format === 'csv') {
      // Simple CSV export for events
      const csvHeaders = 'userId,sessionId,eventType,timestamp,abTestGroup\n';
      const csvRows = events.map(e =>
        `${e.userId},${e.sessionId},${e.eventType},${e.timestamp},${e.abTestGroup || ''}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      res.send(csvHeaders + csvRows);
    } else {
      res.json(exportData);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Get user journey
router.get('/journey/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const events = await Event.find({ userId })
      .sort({ timestamp: 1 })
      .lean();

    const user = await User.findOne({ userId });

    res.json({
      user,
      journey: events,
      summary: {
        totalEvents: events.length,
        uniqueSessions: [...new Set(events.map(e => e.sessionId))].length,
        eventTypes: [...new Set(events.map(e => e.eventType))]
      }
    });
  } catch (error) {
    console.error('User journey error:', error);
    res.status(500).json({ error: 'Failed to get user journey' });
  }
});

// A/B test comparison
router.get('/ab-comparison', async (req, res) => {
  try {
    const comparison = await User.aggregate([
      {
        $group: {
          _id: '$abTestGroup',
          totalUsers: { $sum: 1 },
          avgBalance: { $avg: '$balance' },
          avgPurchases: { $avg: '$totalPurchases' },
          avgSpent: { $avg: '$totalSpent' },
          totalRevenue: { $sum: '$totalSpent' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ comparison });
  } catch (error) {
    console.error('A/B comparison error:', error);
    res.status(500).json({ error: 'Failed to get A/B comparison' });
  }
});

module.exports = router;
