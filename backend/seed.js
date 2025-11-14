const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/waikiki-store';

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
    productId: 'shirt-003',
    name: 'Black Polo Shirt',
    description: 'Classic polo shirt',
    price: 39.99,
    category: 'shirts',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400',
    priceVariants: { A: 39.99, B: 34.99, C: 44.99, D: 37.99 }
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
    productId: 'pants-003',
    name: 'Blue Jeans',
    description: 'Classic blue jeans',
    price: 74.99,
    category: 'pants',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    priceVariants: { A: 74.99, B: 64.99, C: 84.99, D: 69.99 }
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
    productId: 'dress-002',
    name: 'Evening Gown',
    description: 'Elegant evening dress',
    price: 159.99,
    category: 'dresses',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400',
    priceVariants: { A: 159.99, B: 139.99, C: 179.99, D: 149.99 }
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
    productId: 'shoes-003',
    name: 'Running Shoes',
    description: 'Comfortable running shoes',
    price: 119.99,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    priceVariants: { A: 119.99, B: 109.99, C: 129.99, D: 114.99 }
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
    productId: 'acc-003',
    name: 'Watch',
    description: 'Elegant wristwatch',
    price: 199.99,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    priceVariants: { A: 199.99, B: 179.99, C: 219.99, D: 189.99 }
  },
  {
    productId: 'outer-001',
    name: 'Denim Jacket',
    description: 'Classic denim jacket',
    price: 119.99,
    category: 'outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    priceVariants: { A: 119.99, B: 99.99, C: 139.99, D: 109.99 }
  },
  {
    productId: 'outer-002',
    name: 'Leather Jacket',
    description: 'Premium leather jacket',
    price: 249.99,
    category: 'outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    priceVariants: { A: 249.99, B: 219.99, C: 279.99, D: 234.99 }
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Database already has ${count} products. Skipping seed.`);
      console.log('To re-seed, delete the products collection first.');
      process.exit(0);
    }

    console.log('Seeding products...');
    await Product.insertMany(products);

    console.log(`✅ Successfully seeded ${products.length} products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
