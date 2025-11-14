const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products (with A/B test pricing)
router.get('/', async (req, res) => {
  try {
    const { abTestGroup, category } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query);

    // If abTestGroup provided, apply variant pricing
    const productsWithPricing = products.map(product => {
      const productObj = product.toObject();

      if (abTestGroup && productObj.priceVariants && productObj.priceVariants[abTestGroup]) {
        productObj.price = productObj.priceVariants[abTestGroup];
      }

      // Remove price variants from response
      delete productObj.priceVariants;

      return productObj;
    });

    res.json({ products: productsWithPricing });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get single product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { abTestGroup } = req.query;

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productObj = product.toObject();

    // Apply variant pricing if applicable
    if (abTestGroup && productObj.priceVariants && productObj.priceVariants[abTestGroup]) {
      productObj.price = productObj.priceVariants[abTestGroup];
    }

    delete productObj.priceVariants;

    res.json({ product: productObj });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Seed products (for initial setup)
router.post('/seed', async (req, res) => {
  try {
    // Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.status(400).json({ error: 'Products already seeded' });
    }

    const products = [
      {
        productId: 'shirt-001',
        name: 'Classic White T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 29.99,
        category: 'shirts',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        priceVariants: { A: 29.99, B: 24.99, C: 34.99, D: 27.99 }
      },
      {
        productId: 'shirt-002',
        name: 'Blue Denim Shirt',
        description: 'Stylish denim shirt',
        price: 49.99,
        category: 'shirts',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        priceVariants: { A: 49.99, B: 44.99, C: 54.99, D: 47.99 }
      },
      {
        productId: 'pants-001',
        name: 'Black Jeans',
        description: 'Slim fit black jeans',
        price: 79.99,
        category: 'pants',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
        priceVariants: { A: 79.99, B: 69.99, C: 89.99, D: 74.99 }
      },
      {
        productId: 'pants-002',
        name: 'Khaki Chinos',
        description: 'Smart casual chinos',
        price: 69.99,
        category: 'pants',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
        priceVariants: { A: 69.99, B: 59.99, C: 74.99, D: 64.99 }
      },
      {
        productId: 'dress-001',
        name: 'Summer Dress',
        description: 'Light and breezy summer dress',
        price: 89.99,
        category: 'dresses',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        priceVariants: { A: 89.99, B: 79.99, C: 99.99, D: 84.99 }
      },
      {
        productId: 'shoes-001',
        name: 'White Sneakers',
        description: 'Classic white sneakers',
        price: 99.99,
        category: 'shoes',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        priceVariants: { A: 99.99, B: 89.99, C: 109.99, D: 94.99 }
      },
      {
        productId: 'shoes-002',
        name: 'Leather Boots',
        description: 'Premium leather boots',
        price: 149.99,
        category: 'shoes',
        image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400',
        priceVariants: { A: 149.99, B: 129.99, C: 169.99, D: 139.99 }
      },
      {
        productId: 'acc-001',
        name: 'Leather Belt',
        description: 'Genuine leather belt',
        price: 39.99,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        priceVariants: { A: 39.99, B: 34.99, C: 44.99, D: 37.99 }
      },
      {
        productId: 'acc-002',
        name: 'Sunglasses',
        description: 'UV protection sunglasses',
        price: 59.99,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
        priceVariants: { A: 59.99, B: 49.99, C: 69.99, D: 54.99 }
      },
      {
        productId: 'outer-001',
        name: 'Denim Jacket',
        description: 'Classic denim jacket',
        price: 119.99,
        category: 'outerwear',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        priceVariants: { A: 119.99, B: 99.99, C: 139.99, D: 109.99 }
      }
    ];

    await Product.insertMany(products);
    res.status(201).json({ message: 'Products seeded successfully', count: products.length });
  } catch (error) {
    console.error('Seed products error:', error);
    res.status(500).json({ error: 'Failed to seed products' });
  }
});

module.exports = router;
