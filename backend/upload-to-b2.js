const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Configure B2 client (S3-compatible)
const s3Client = new S3Client({
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  region: 'eu-central-003',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

const UPLOADS_DIR = path.join(__dirname, 'uploads', 'products');
const BUCKET_NAME = process.env.B2_BUCKET_NAME;

// Upload single file to B2
async function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = filePath.endsWith('.jpg') ? 'image/jpeg' : 'image/png';

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return public URL (Friendly URL format for public buckets)
  // S3 endpoint is for API operations, Friendly URL is for public access
  const friendlyUrl = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/${key}`;
  return friendlyUrl;
}

// Get all product folders
function getProductFolders() {
  const folders = [];
  const items = fs.readdirSync(UPLOADS_DIR);

  items.forEach(item => {
    const itemPath = path.join(UPLOADS_DIR, item);
    if (fs.statSync(itemPath).isDirectory()) {
      folders.push(item);
    }
  });

  return folders;
}

async function uploadAllImages() {
  try {
    console.log('🚀 Starting B2 upload...\n');

    // Connect to MongoDB
    console.log('💾 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all product folders
    const productFolders = getProductFolders();
    console.log(`📦 Found ${productFolders.length} product folders\n`);

    let uploadedCount = 0;
    let skippedCount = 0;
    let updatedProducts = 0;

    for (const folderName of productFolders) {
      const folderPath = path.join(UPLOADS_DIR, folderName);
      const photos = fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
        .sort();

      if (photos.length === 0) continue;

      // Check if product already has B2 URLs
      const existingProduct = await Product.findOne({ folderName: folderName });

      // Get existing B2 URLs
      const existingUrls = [];
      const existingPhotoNames = new Set();

      if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
        existingProduct.images.forEach(url => {
          if (url && (url.startsWith('https://f003.backblazeb2.com') || url.startsWith('http://'))) {
            existingUrls.push(url);
            // Extract photo name from URL: .../photo_1.jpg -> photo_1.jpg
            const photoName = url.split('/').pop();
            existingPhotoNames.add(photoName);
          }
        });
      }

      // Filter out already uploaded photos
      const photosToUpload = photos.filter(photo => !existingPhotoNames.has(photo));

      if (photosToUpload.length === 0 && existingUrls.length > 0) {
        console.log(`⏭️  Skipping: ${folderName} (all ${photos.length} photos already uploaded)`);
        skippedCount++;
        continue;
      }

      console.log(`\n📦 Processing: ${folderName} (${photosToUpload.length} new / ${existingUrls.length} existing)`);

      const uploadedUrls = [...existingUrls]; // Start with existing URLs

      // Upload each new photo
      for (const photo of photosToUpload) {
        const filePath = path.join(folderPath, photo);
        const key = `products/${folderName}/${photo}`;

        try {
          const url = await uploadFile(filePath, key);
          uploadedUrls.push(url);
          uploadedCount++;
          console.log(`  📸 Uploaded: ${photo}`);
        } catch (err) {
          console.error(`  ❌ Error uploading ${photo}:`, err.message);
        }
      }

      // Update MongoDB with all URLs (existing + new)
      try {
        const result = await Product.updateOne(
          { folderName: folderName },
          {
            $set: {
              images: uploadedUrls,
              image: uploadedUrls[0] || ''
            }
          }
        );

        if (result.modifiedCount > 0) {
          updatedProducts++;
        }
      } catch (err) {
        console.error(`\n❌ Error updating product ${folderName}:`, err.message);
      }

      console.log(`✅ Completed: ${folderName} (Total: ${uploadedUrls.length} photos)`);
    }

    console.log(`\n\n🎉 Upload completed!`);
    console.log(`📸 Uploaded ${uploadedCount} images`);
    console.log(`⏭️  Skipped ${skippedCount} products (already uploaded)`);
    console.log(`📦 Updated ${updatedProducts} products in MongoDB`);
    console.log(`\n🌐 Images are now accessible from Backblaze B2 CDN`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Upload error:', error);
    process.exit(1);
  }
}

uploadAllImages();
