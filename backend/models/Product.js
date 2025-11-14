const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['shirts', 'pants', 'dresses', 'shoes', 'accessories', 'outerwear']
  },
  image: String,
  stock: {
    type: Number,
    default: 100
  },
  featured: {
    type: Boolean,
    default: false
  },
  // For A/B testing - different pricing strategies
  priceVariants: {
    A: Number,
    B: Number,
    C: Number,
    D: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
