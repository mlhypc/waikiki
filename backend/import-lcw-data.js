const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/waikiki-store';
const DATA_PATH = 'C:\\Users\\Qwilleran\\Desktop\\waikiki_model\\DATA_GET\\data\\0_3-data_seperated';

// Parse Turkish price string to number
function parseTurkishPrice(priceStr) {
  if (!priceStr) return null;
  // Remove "TL" and convert comma to dot
  return parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.'));
}

// Recursively find all info.json files
function findInfoJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findInfoJsonFiles(filePath, fileList);
    } else if (file === 'info.json') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Extract category from file path
function extractCategoryFromPath(filePath) {
  const parts = filePath.split(path.sep);
  const categoryIndex = parts.findIndex(p => ['alt_giyim', 'ust_giyim', 'dis_giyim', 'ayakkabi'].includes(p));
  return categoryIndex !== -1 ? parts[categoryIndex] : 'ust_giyim';
}

// Extract gender from file path
function extractGenderFromPath(filePath) {
  const parts = filePath.split(path.sep);
  const genderIndex = parts.findIndex(p => ['Kadın', 'Erkek'].includes(p));
  return genderIndex !== -1 ? parts[genderIndex] : 'Kadın';
}

// Extract product IDs from URLs
function extractProductIds(urls) {
  if (!urls || !Array.isArray(urls)) return [];

  return urls.map(url => {
    const match = url.match(/\/([^\/]+)$/);
    return match ? match[1] : null;
  }).filter(Boolean);
}

// Process combination suggestions to extract product IDs
function processCombinationSuggestions(combinations) {
  if (!combinations || !Array.isArray(combinations)) return [];

  return combinations.map(combo => ({
    comboIndex: combo.combo_index,
    products: combo.products.map(p => ({
      productId: extractProductIds([p.url])[0] || '',
      title: p.title,
      url: p.url
    }))
  }));
}

// Process single product from info.json
function processProduct(infoJsonPath) {
  try {
    const data = JSON.parse(fs.readFileSync(infoJsonPath, 'utf8'));
    const category = extractCategoryFromPath(infoJsonPath);
    const gender = extractGenderFromPath(infoJsonPath);

    // Parse prices (for internal tracking only, not displayed on site)
    const originalPrice = parseTurkishPrice(data.price);
    const discountedPrice = parseTurkishPrice(data.discounted_price);
    const finalPrice = discountedPrice || originalPrice || 0;

    // Get image paths - check what's actually in the public/products folder
    const images = [];

    // Check the actual copied images in frontend/public/products
    const publicProductDir = path.join(__dirname, '..', 'frontend', 'public', 'products', data.folder_name);

    if (fs.existsSync(publicProductDir)) {
      const copiedPhotos = fs.readdirSync(publicProductDir)
        .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
        .sort();

      copiedPhotos.forEach(photo => {
        // Store relative path for frontend
        images.push(`/products/${data.folder_name}/${photo}`);
      });
    }

    // Extract product IDs from related products
    const relatedProductIds = extractProductIds(data.related_products);

    // Process combination suggestions with product IDs
    const combinationSuggestions = processCombinationSuggestions(data.combination_suggestions);

    return {
      productId: data.folder_name,
      name: data.title,
      description: data.description || [],
      price: finalPrice,
      originalPrice: originalPrice,
      discountedPrice: discountedPrice,
      currency: 'TL',
      category: category,
      gender: gender,
      images: images,
      image: images[0] || '',
      sizes: data.sizes || [],
      stock: 100,
      featured: false,
      productCode: data.product_code || '',
      url: data.url || '',
      folderName: data.folder_name,
      mannequinInfo: data.mannequin_info || '',
      properties: data.properties || {},
      combinationSuggestions: combinationSuggestions,
      relatedProducts: relatedProductIds,
      abTestGroup: 'B' // Default to random suggestions
    };
  } catch (error) {
    console.error(`❌ Error processing ${infoJsonPath}:`, error.message);
    return null;
  }
}

async function importData() {
  try {
    console.log('🔍 Scanning for products...');
    const infoJsonFiles = findInfoJsonFiles(DATA_PATH);
    console.log(`📦 Found ${infoJsonFiles.length} products`);

    console.log('📝 Processing product data...');
    const products = [];

    for (const filePath of infoJsonFiles) {
      const product = processProduct(filePath);
      if (product) {
        products.push(product);
      }
    }

    console.log(`✅ Successfully processed ${products.length} products`);

    // Category breakdown
    const categoryCount = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Category Breakdown:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });

    console.log('\n💾 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  Removing ${existingCount} existing products...`);
      await Product.deleteMany({});
    }

    console.log('📥 Importing products to database...');
    await Product.insertMany(products);

    console.log(`\n🎉 Successfully imported ${products.length} products!`);
    console.log('\n📝 A/B Test Groups (for cart suggestions):');
    console.log('   Group A: No cart suggestions');
    console.log('   Group B: Random suggestions (from combination data)');
    console.log('   Group C: AI-powered suggestions (to be implemented)');
    console.log('   Group D: Control group');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: node copy-images.js (to copy product images)');
    console.log('   2. Start backend: npm start');
    console.log('   3. Start frontend: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  }
}

importData();
