const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkPhotos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // İlk 5 ürünü göster
    const products = await Product.find().limit(5);
    products.forEach(p => {
      console.log('Ürün:', p.name);
      console.log('Fotoğraflar:', p.images?.length || 0, 'adet');
      if (p.images?.length > 0) {
        console.log('  -', p.images[0]);
      }
      console.log('');
    });

    // İstatistikler
    const withPhotos = await Product.countDocuments({
      images: { $exists: true, $not: { $size: 0 } }
    });
    const withoutPhotos = await Product.countDocuments({
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    });

    console.log('📊 Özet:');
    console.log('✅ Fotoğraflı ürün:', withPhotos);
    console.log('❌ Fotoğrafsız ürün:', withoutPhotos);

    process.exit(0);
  } catch (err) {
    console.error('❌ Hata:', err);
    process.exit(1);
  }
}

checkPhotos();
