const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkPhotos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const products = await Product.find({});
    let emptyImages = 0;
    let localPaths = 0;
    let b2Urls = 0;

    products.forEach(p => {
      if (!p.images || p.images.length === 0) {
        emptyImages++;
      } else if (p.images[0].startsWith('http')) {
        b2Urls++;
      } else {
        localPaths++;
      }
    });

    console.log('\n📊 Image Statistics:');
    console.log('  ✅ B2 URLs:', b2Urls);
    console.log('  📁 Local paths:', localPaths);
    console.log('  ❌ Empty/no images:', emptyImages);
    console.log('  📦 Total products:', products.length);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPhotos();
