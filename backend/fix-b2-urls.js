const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function fixUrls() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let updated = 0;

    for (const product of products) {
      let needsUpdate = false;

      // Fix images array
      if (product.images && Array.isArray(product.images)) {
        const newImages = product.images.map(img => {
          if (img && img.includes('s3.eu-central-003.backblazeb2.com')) {
            needsUpdate = true;
            return img.replace('s3.eu-central-003.backblazeb2.com', 'f003.backblazeb2.com');
          }
          return img;
        });
        product.images = newImages;
      }

      // Fix main image field
      if (product.image && product.image.includes('s3.eu-central-003.backblazeb2.com')) {
        needsUpdate = true;
        product.image = product.image.replace('s3.eu-central-003.backblazeb2.com', 'f003.backblazeb2.com');
      }

      if (needsUpdate) {
        await product.save();
        updated++;
        process.stdout.write('.');
      }
    }

    console.log(`\n\n✅ Updated ${updated} products`);
    console.log('🎉 Done!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUrls();
