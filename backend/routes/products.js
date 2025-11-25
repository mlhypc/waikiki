const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, gender, page = 1, limit = 20 } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }
    if (gender) {
      query.gender = gender;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ _id: 1 }), // Consistent ordering by ID
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get single product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Get cart suggestions based on user's A/B test group
router.get('/suggestions/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { abTestGroup } = req.query;

    if (!abTestGroup) {
      return res.status(400).json({ error: 'abTestGroup is required' });
    }

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let suggestions = [];

    // Group A: No suggestions
    if (abTestGroup === 'A') {
      suggestions = [];
    }
    // Group B: Random suggestions from combinationSuggestions
    else if (abTestGroup === 'B' && product.combinationSuggestions && product.combinationSuggestions.length > 0) {
      const randomCombo = product.combinationSuggestions[
        Math.floor(Math.random() * product.combinationSuggestions.length)
      ];

      if (randomCombo && randomCombo.products) {
        // Extract productId from URL
        const productIds = randomCombo.products
          .map(p => {
            if (p.productId) return p.productId;
            if (p.url) {
              const match = p.url.match(/\/([^\/]+)$/);
              return match ? match[1] : null;
            }
            return null;
          })
          .filter(Boolean)
          .slice(1, 5); // Skip first item (it's the current product)

        suggestions = await Product.find({
          productId: { $in: productIds }
        }).limit(4);
      }
    }
    // Group C: AI suggestions (to be implemented)
    else if (abTestGroup === 'C') {
      // For now, use related products as placeholder
      if (product.relatedProducts && product.relatedProducts.length > 0) {
        const relatedIds = product.relatedProducts.slice(0, 4);
        suggestions = await Product.find({
          productId: { $in: relatedIds }
        }).limit(4);
      }
    }
    // Group D: Related products (control group)
    else if (abTestGroup === 'D' && product.relatedProducts && product.relatedProducts.length > 0) {
      const relatedIds = product.relatedProducts.slice(0, 4);
      suggestions = await Product.find({
        productId: { $in: relatedIds }
      }).limit(4);
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;
