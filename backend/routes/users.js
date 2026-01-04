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

    // Group assignment will happen after survey completion (stratified randomization)
    // For now, all users start with null group
    const abTestGroup = null;

    // If userId provided, try to get existing user (only in survey mode)
    if (surveyMode && userId) {
      const existingUser = await User.findOne({ userId });
      if (existingUser) {
        existingUser.metadata.lastVisit = new Date();
        await existingUser.save();
        return res.json({ user: existingUser, mode: 'survey' });
      }
    }

    // In test mode, return a mock user without saving (assign random group for testing)
    if (!surveyMode) {
      const groups = ['A', 'B', 'C'];
      const testGroup = groups[Math.floor(Math.random() * groups.length)];

      const mockUser = {
        userId: userId || uuidv4(),
        abTestGroup: testGroup,
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

    // Save survey responses
    user.surveyResponses = {
      age: age || '',
      gender: gender || '',
      frequency: frequency || '',
      completedAt: new Date()
    };

    // Weighted stratified randomization: Assign to A/B/C group based on demographics
    // Group C gets 2x weight (25:25:50 distribution) while maintaining demographic balance

    // Count users with same demographic profile in each group
    const demographicCounts = await User.aggregate([
      {
        $match: {
          'surveyResponses.completedAt': { $exists: true },
          'surveyResponses.age': age,
          'surveyResponses.gender': gender,
          'surveyResponses.frequency': frequency,
          abTestGroup: { $ne: null }
        }
      },
      { $group: { _id: '$abTestGroup', count: { $sum: 1 } } }
    ]);

    // Build count map
    const counts = { A: 0, B: 0, C: 0 };
    demographicCounts.forEach(({ _id, count }) => {
      counts[_id] = count;
    });

    // Target distribution: 25% A, 25% B, 50% C
    const targetRatios = { A: 0.25, B: 0.25, C: 0.5 };

    // Calculate total users in this demographic
    const totalUsers = counts.A + counts.B + counts.C;

    // If no users yet, randomly assign with weighted probability
    if (totalUsers === 0) {
      const rand = Math.random();
      if (rand < 0.25) {
        user.abTestGroup = 'A';
      } else if (rand < 0.5) {
        user.abTestGroup = 'B';
      } else {
        user.abTestGroup = 'C';
      }
    } else {
      // Calculate how far each group is from its target
      // Negative score = below target (needs more users)
      const scores = {
        A: (counts.A / totalUsers) - targetRatios.A,
        B: (counts.B / totalUsers) - targetRatios.B,
        C: (counts.C / totalUsers) - targetRatios.C
      };

      // Find group(s) that are most below target (most negative score)
      const minScore = Math.min(scores.A, scores.B, scores.C);
      const candidateGroups = Object.keys(scores).filter(group => scores[group] === minScore);

      // Randomly select from candidate groups (if tie) for fairness
      const assignedGroup = candidateGroups[Math.floor(Math.random() * candidateGroups.length)];
      user.abTestGroup = assignedGroup;
    }

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

    // Check if survey is completed (in survey mode)
    if (!user.surveyResponses?.completedAt) {
      return res.status(400).json({
        error: 'Survey must be completed before finishing simulation',
        surveyCompleted: false
      });
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
