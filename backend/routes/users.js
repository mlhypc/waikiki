const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Create or get anonymous user
router.post('/init', async (req, res) => {
  try {
    // Check if survey mode is enabled
    const surveyMode = process.env.SURVEY_MODE === 'true';

    const { userId } = req.body;

    // Assign to A/B/C test group (uniform distribution using round-robin)
    const groups = ['A', 'B', 'C'];
    let abTestGroup;

    if (surveyMode) {
      // Count existing users per group to ensure balanced distribution
      const groupCounts = await User.aggregate([
        { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
      ]);

      const counts = { A: 0, B: 0, C: 0 };
      groupCounts.forEach(({ _id, count }) => {
        counts[_id] = count;
      });

      // Assign to group with least members (round-robin)
      abTestGroup = Object.keys(counts).reduce((min, key) =>
        counts[key] < counts[min] ? key : min
      );
    } else {
      // Random for test mode
      abTestGroup = groups[Math.floor(Math.random() * groups.length)];
    }

    // If userId provided, try to get existing user (only in survey mode)
    if (surveyMode && userId) {
      const existingUser = await User.findOne({ userId });
      if (existingUser) {
        existingUser.metadata.lastVisit = new Date();
        await existingUser.save();
        return res.json({ user: existingUser, mode: 'survey' });
      }
    }

    // In test mode, return a mock user without saving
    if (!surveyMode) {
      const mockUser = {
        userId: userId || uuidv4(),
        abTestGroup,
        balance: 1000,
        totalPurchases: 0,
        totalSpent: 0,
        metadata: {
          userAgent: req.headers['user-agent'],
          firstVisit: new Date(),
          lastVisit: new Date()
        }
      };
      return res.status(201).json({ user: mockUser, mode: 'test', saved: false });
    }

    // Create new user (survey mode only)
    const newUserId = userId || uuidv4();

    const user = new User({
      userId: newUserId,
      abTestGroup,
      balance: 1000, // $1000 decoy money
      metadata: {
        userAgent: req.headers['user-agent'],
        firstVisit: new Date(),
        lastVisit: new Date()
      }
    });

    await user.save();
    res.status(201).json({ user, mode: 'survey', saved: true });
  } catch (error) {
    console.error('User init error:', error);
    res.status(500).json({ error: 'Failed to initialize user' });
  }
});

// Get user info
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user balance (after purchase)
router.patch('/:userId/balance', async (req, res) => {
  try {
    // Check if survey mode is enabled
    const surveyMode = process.env.SURVEY_MODE === 'true';

    if (!surveyMode) {
      // In test mode, return mock response
      const { amount, type } = req.body;
      const mockUser = {
        userId: req.params.userId,
        balance: type === 'deduct' ? 1000 - amount : 1000 + amount,
        totalPurchases: type === 'deduct' ? 1 : 0,
        totalSpent: type === 'deduct' ? amount : 0
      };
      return res.json({ user: mockUser, mode: 'test', saved: false });
    }

    const { userId } = req.params;
    const { amount, type } = req.body; // type: 'deduct' or 'add'

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'deduct') {
      if (user.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      user.balance -= amount;
      user.totalSpent += amount;
      user.totalPurchases += 1;
    } else if (type === 'add') {
      user.balance += amount;
    }

    await user.save();
    res.json({ user, mode: 'survey', saved: true });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

// Submit survey responses
router.patch('/:userId/survey', async (req, res) => {
  try {
    // Check if survey mode is enabled
    const surveyMode = process.env.SURVEY_MODE === 'true';

    if (!surveyMode) {
      // In test mode, return mock response
      const { age, gender, frequency } = req.body;
      const mockUser = {
        userId: req.params.userId,
        surveyResponses: {
          age: age || '',
          gender: gender || '',
          frequency: frequency || '',
          completedAt: new Date()
        }
      };
      return res.json({ user: mockUser, mode: 'test', saved: false });
    }

    const { userId } = req.params;
    const { age, gender, frequency } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.surveyResponses = {
      age: age || '',
      gender: gender || '',
      frequency: frequency || '',
      completedAt: new Date()
    };

    await user.save();
    res.json({ user, mode: 'survey', saved: true });
  } catch (error) {
    console.error('Submit survey error:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

// Complete simulation
router.patch('/:userId/complete-simulation', async (req, res) => {
  try {
    // Check if survey mode is enabled
    const surveyMode = process.env.SURVEY_MODE === 'true';

    if (!surveyMode) {
      // In test mode, return mock response
      const mockUser = {
        userId: req.params.userId,
        simulationCompleted: true,
        simulationCompletedAt: new Date()
      };
      return res.json({ user: mockUser, mode: 'test', saved: false });
    }

    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.simulationCompleted = true;
    user.simulationCompletedAt = new Date();

    await user.save();
    res.json({ user, mode: 'survey', saved: true });
  } catch (error) {
    console.error('Complete simulation error:', error);
    res.status(500).json({ error: 'Failed to complete simulation' });
  }
});

module.exports = router;
