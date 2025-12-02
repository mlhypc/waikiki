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
    enum: ['A', 'B', 'C'], // A: No suggestions, B: Classic combination, C: AI combination
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
      enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65 yaş ve üzeri', '']
    },
    gender: {
      type: String,
      enum: ['Kadın', 'Erkek', '']
    },
    frequency: {
      type: String,
      enum: ['Haftada bir veya daha sık', 'Ayda bir', '2-3 ayda bir', '6 ayda bir', 'Yılda bir veya daha seyrek', 'Hiç yapmam', '']
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
  },
  simulationCompleted: {
    type: Boolean,
    default: false
  },
  simulationCompletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
