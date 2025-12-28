const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const aiRecommendationsLoader = require('../ai-recommendations-loader');

console.log('🔄 Products route loaded at:', new Date().toISOString());

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

    // Return products with B2 URLs (no conversion needed for production)
    const processedProducts = products.map(product => product.toObject());

    res.json({
      products: processedProducts,
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

    // Return product with B2 URLs (no conversion needed for production)
    const productData = product.toObject();

    res.json({ product: productData });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Simple hash function for deterministic seeding
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Get cart suggestions based on user's A/B test group
router.get('/suggestions/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { abTestGroup, userId } = req.query;

    if (!abTestGroup) {
      return res.status(400).json({ error: 'abTestGroup is required' });
    }

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let suggestions = [];

    // Group A: No suggestions (control group)
    if (abTestGroup === 'A') {
      suggestions = [];
    }
    // Group B: Classic combination suggestions (deterministic based on userId + productId)
    else if (abTestGroup === 'B' && product.combinationSuggestions && product.combinationSuggestions.length > 0) {
      console.log(`[Group B] Product ${productId} has ${product.combinationSuggestions.length} combinations`);

      // Use userId + productId as seed for deterministic selection
      const seed = userId ? hashString(userId + productId) : Math.floor(Math.random() * 1000000);
      const index = seed % product.combinationSuggestions.length;

      const randomCombo = product.combinationSuggestions[index];

      if (randomCombo && randomCombo.products) {
        // Extract productId from URL - get OTHER items from the same combination (exclude current product)
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
          .filter(id => id !== productId) // Exclude current product
          .slice(0, 6); // Get 6 IDs as backup

        console.log(`[Group B] Extracted product IDs from same combination:`, productIds);
        suggestions = await Product.find({
          productId: { $in: productIds }
        }).limit(3); // Show only first 3 available products
        console.log(`[Group B] Found ${suggestions.length} suggestions from same combination`);
      }
    }
    // Group C: AI-powered combination suggestions
    else if (abTestGroup === 'C') {
      console.log(`[Group C] Product ${productId}, category: ${product.category}`);
      // Map product category to AI recommendation category
      const aiCategory = aiRecommendationsLoader.mapCategory(product.category);
      console.log(`[Group C] Mapped to AI category: ${aiCategory}`);

      if (aiCategory) {
        // Get AI-powered recommendations - returns a single combination's items
        const recommendedIds = aiRecommendationsLoader.getRecommendations(productId, aiCategory, product.gender);
        console.log(`[Group C] AI recommended IDs from same combination (${product.gender}):`, recommendedIds);

        if (recommendedIds && recommendedIds.length > 0) {
          // Find products by their numeric IDs - get exactly 3 items from the SAME AI combination
          suggestions = await Product.find({
            productId: { $regex: new RegExp(recommendedIds.map(id => `${id}$`).join('|')) }
          }).limit(3);
          // Reverse order for Group C: [1,2,3] -> [3,2,1]
          suggestions.reverse();
          console.log(`[Group C] Found ${suggestions.length} AI suggestions from same combination (reversed)`);
        }
      }

      // Fallback to related products if AI recommendations not available
      if (suggestions.length === 0 && product.relatedProducts && product.relatedProducts.length > 0) {
        console.log(`[Group C] Falling back to relatedProducts`);
        const relatedIds = product.relatedProducts.slice(0, 3);
        suggestions = await Product.find({
          productId: { $in: relatedIds }
        }).limit(3);
        // Reverse order for Group C fallback as well
        suggestions.reverse();
        console.log(`[Group C] Found ${suggestions.length} related product suggestions (reversed)`);
      }
    }

    // Return suggestions with B2 URLs (no conversion needed for production)
    const processedSuggestions = suggestions.map(suggestion => suggestion.toObject());

    res.json({ suggestions: processedSuggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;
