const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  abTestGroup: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D'], // Support up to 4 test groups
    index: true
  },
  balance: {
    type: Number,
    default: 1000 // Each user starts with $1000 decoy money
  },
  metadata: {
    userAgent: String,
    firstVisit: Date,
    lastVisit: Date
  },
  surveyResponses: {
    age: {
      type: String,
      enum: ['18-24', '25-34', '35-44', '45+', '']
    },
    gender: {
      type: String,
      enum: ['Kadın', 'Erkek', 'Diğer', '']
    },
    completedAt: Date
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
