const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Create or get anonymous user
router.post('/init', async (req, res) => {
  try {
    const { userId } = req.body;

    // If userId provided, try to get existing user
    if (userId) {
      const existingUser = await User.findOne({ userId });
      if (existingUser) {
        existingUser.metadata.lastVisit = new Date();
        await existingUser.save();
        return res.json({ user: existingUser });
      }
    }

    // Create new user
    const newUserId = userId || uuidv4();

    // Assign to A/B test group (random distribution)
    const groups = ['A', 'B', 'C', 'D'];
    const abTestGroup = groups[Math.floor(Math.random() * groups.length)];

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
    res.status(201).json({ user });
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
    res.json({ user });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

module.exports = router;
