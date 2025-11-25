const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'product_view',
      'product_click',
      'add_to_cart',
      'remove_from_cart',
      'cart_view',
      'checkout_start',
      'checkout_complete',
      'scroll',
      'hover',
      'click',
      'time_spent',
      'search',
      'filter_applied',
      'sort_applied',
      'suggestion_view',
      'suggestion_click',
      'suggestion_add_to_cart'
    ]
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  abTestGroup: {
    type: String,
    index: true
  },
  userAgent: String,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for analytics queries
eventSchema.index({ userId: 1, timestamp: -1 });
eventSchema.index({ sessionId: 1, timestamp: -1 });
eventSchema.index({ eventType: 1, timestamp: -1 });
eventSchema.index({ abTestGroup: 1, eventType: 1 });

module.exports = mongoose.model('Event', eventSchema);
