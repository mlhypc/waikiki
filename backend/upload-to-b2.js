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

  // Return public URL
  return `https://${process.env.B2_ENDPOINT}/file/${BUCKET_NAME}/${key}`;
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
    let updatedProducts = 0;

    for (const folderName of productFolders) {
      const folderPath = path.join(UPLOADS_DIR, folderName);
      const photos = fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
        .sort();

      if (photos.length === 0) continue;

      console.log(`📸 Processing: ${folderName} (${photos.length} photos)`);

      const uploadedUrls = [];

      // Upload each photo
      for (const photo of photos) {
        const filePath = path.join(folderPath, photo);
        const key = `products/${folderName}/${photo}`;

        try {
          const url = await uploadFile(filePath, key);
          uploadedUrls.push(url);
          uploadedCount++;
          process.stdout.write('.');
        } catch (err) {
          console.error(`\n❌ Error uploading ${photo}:`, err.message);
        }
      }

      // Update MongoDB with B2 URLs
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

      console.log(` ✅`);
    }

    console.log(`\n\n🎉 Upload completed!`);
    console.log(`📸 Uploaded ${uploadedCount} images`);
    console.log(`📦 Updated ${updatedProducts} products in MongoDB`);
    console.log(`\n🌐 Images are now accessible from Backblaze B2 CDN`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Upload error:', error);
    process.exit(1);
  }
}

uploadAllImages();
