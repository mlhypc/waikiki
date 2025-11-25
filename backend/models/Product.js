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
  description: [String],
  price: {
    type: Number,
    required: true
  },
  originalPrice: Number,
  discountedPrice: Number,
  currency: {
    type: String,
    default: 'TL'
  },
  category: {
    type: String,
    required: true,
    enum: ['alt_giyim', 'ust_giyim', 'dis_giyim', 'ayakkabi']
  },
  gender: {
    type: String,
    enum: ['Kadın', 'Erkek', 'Unisex'],
    default: 'Kadın'
  },
  images: [String],
  image: String,
  sizes: [String],
  stock: {
    type: Number,
    default: 100
  },
  featured: {
    type: Boolean,
    default: false
  },
  productCode: String,
  url: String,
  folderName: String,
  mannequinInfo: String,
  properties: mongoose.Schema.Types.Mixed,
  combinationSuggestions: [{
    comboIndex: Number,
    products: [{
      url: String,
      title: String
    }]
  }],
  relatedProducts: [String],
  // For A/B testing - cart suggestion strategies
  // A = no suggestions, B = random suggestions, C = AI suggestions, D = control
  abTestGroup: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    default: 'B'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
