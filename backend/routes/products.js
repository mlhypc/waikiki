const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
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

    // Process images - keep B2 URLs as-is, convert local paths to backend URLs
    const processedProducts = products.map(product => {
      const productData = product.toObject();

      if (productData.images && Array.isArray(productData.images)) {
        productData.images = productData.images
          .filter(img => img) // Remove null/undefined
          .map(img => {
            // If it's already a full URL (B2 CDN), keep it as-is
            if (img.startsWith('http://') || img.startsWith('https://')) {
              return img;
            }

            // Handle local paths
            let cleanPath = img.startsWith('/') ? img.slice(1) : img;
            // If path starts with 'products/', add 'uploads/' prefix
            if (cleanPath.startsWith('products/')) {
              cleanPath = 'uploads/' + cleanPath;
            }
            return `/${cleanPath}`;
          });
      }

      return productData;
    });

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

    // Process images - keep B2 URLs as-is, convert local paths to backend URLs
    const validImages = [];

    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (!img) continue;

        // If it's already a full URL (B2 CDN), keep it as-is
        if (img.startsWith('http://') || img.startsWith('https://')) {
          validImages.push(img);
          continue;
        }

        // Handle local paths
        let cleanPath = img.startsWith('/') ? img.slice(1) : img;

        // If path starts with 'products/', add 'uploads/' prefix
        if (cleanPath.startsWith('products/')) {
          cleanPath = 'uploads/' + cleanPath;
        }

        const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');
        const imagePath = path.join(uploadsPath, cleanPath.replace('uploads/', ''));

        try {
          if (fs.existsSync(imagePath)) {
            // Convert to backend URL
            validImages.push(`/${cleanPath}`);
          }
        } catch (err) {
          // Skip invalid images
          continue;
        }
      }
    }

    // Return product with only valid images as backend URLs
    const productData = product.toObject();
    productData.images = validImages;

    res.json({ product: productData });
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

    // Group A: No suggestions (control group)
    if (abTestGroup === 'A') {
      suggestions = [];
    }
    // Group B: Classic combination suggestions
    else if (abTestGroup === 'B' && product.combinationSuggestions && product.combinationSuggestions.length > 0) {
      console.log(`[Group B] Product ${productId} has ${product.combinationSuggestions.length} combinations`);
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

        console.log(`[Group B] Extracted product IDs:`, productIds);
        suggestions = await Product.find({
          productId: { $in: productIds }
        }).limit(4);
        console.log(`[Group B] Found ${suggestions.length} suggestions`);
      }
    }
    // Group C: AI-powered combination suggestions
    else if (abTestGroup === 'C') {
      console.log(`[Group C] Product ${productId}, category: ${product.category}`);
      // Map product category to AI recommendation category
      const aiCategory = aiRecommendationsLoader.mapCategory(product.category);
      console.log(`[Group C] Mapped to AI category: ${aiCategory}`);

      if (aiCategory) {
        // Get AI-powered recommendations
        const recommendedIds = aiRecommendationsLoader.getRecommendations(productId, aiCategory);
        console.log(`[Group C] AI recommended IDs:`, recommendedIds);

        if (recommendedIds && recommendedIds.length > 0) {
          // Find products by their numeric IDs
          suggestions = await Product.find({
            productId: { $regex: new RegExp(recommendedIds.map(id => `${id}$`).join('|')) }
          }).limit(4);
          console.log(`[Group C] Found ${suggestions.length} AI suggestions`);
        }
      }

      // Fallback to related products if AI recommendations not available
      if (suggestions.length === 0 && product.relatedProducts && product.relatedProducts.length > 0) {
        console.log(`[Group C] Falling back to relatedProducts`);
        const relatedIds = product.relatedProducts.slice(0, 4);
        suggestions = await Product.find({
          productId: { $in: relatedIds }
        }).limit(4);
        console.log(`[Group C] Found ${suggestions.length} related product suggestions`);
      }
    }

    // Process image paths for suggestions
    const processedSuggestions = suggestions.map(suggestion => {
      const suggestionData = suggestion.toObject();

      if (suggestionData.images && Array.isArray(suggestionData.images)) {
        suggestionData.images = suggestionData.images
          .filter(img => img)
          .map(img => {
            let cleanPath = img.startsWith('/') ? img.slice(1) : img;
            if (cleanPath.startsWith('products/')) {
              cleanPath = 'uploads/' + cleanPath;
            }
            return `/${cleanPath}`;
          });
      }

      return suggestionData;
    });

    res.json({ suggestions: processedSuggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;
