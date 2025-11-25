const fs = require('fs');
const path = require('path');

const SOURCE_PATH = 'C:\\Users\\Qwilleran\\Desktop\\waikiki_model\\DATA_GET\\data\\0_3-data_seperated';
const DEST_PATH = path.join(__dirname, '..', 'frontend', 'public', 'products');

// Limit number of photos per product (set to 2, 3, or 4 as needed)
const limit_get = 2;

// Create destination directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Recursively find all product folders with photos
function findProductFolders(dir, folderList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Check if this directory contains a photos folder
      const photosDir = path.join(filePath, 'photos');
      if (fs.existsSync(photosDir)) {
        folderList.push({ productFolder: filePath, photosDir });
      } else {
        // Continue searching deeper
        findProductFolders(filePath, folderList);
      }
    }
  });

  return folderList;
}

// Copy images for a single product
function copyProductImages(productFolder, photosDir) {
  try {
    const folderName = path.basename(productFolder);
    const destProductDir = path.join(DEST_PATH, folderName);

    // Create product directory
    ensureDirectoryExists(destProductDir);

    // Get all image files and limit them
    const imageFiles = fs.readdirSync(photosDir)
      .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
      .slice(0, limit_get); // Limit number of photos per product

    let copiedCount = 0;

    imageFiles.forEach(imageFile => {
      const sourcePath = path.join(photosDir, imageFile);
      const destPath = path.join(destProductDir, imageFile);

      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
    });

    return copiedCount;
  } catch (error) {
    console.error(`❌ Error copying images for ${path.basename(productFolder)}:`, error.message);
    return 0;
  }
}

async function copyAllImages() {
  try {
    console.log('🔍 Scanning for product folders...');
    const productFolders = findProductFolders(SOURCE_PATH);
    console.log(`📦 Found ${productFolders.length} products with images`);

    console.log('📁 Creating destination directory...');
    ensureDirectoryExists(DEST_PATH);

    console.log('📸 Copying images...');
    let totalImages = 0;
    let processedProducts = 0;

    productFolders.forEach(({ productFolder, photosDir }) => {
      const count = copyProductImages(productFolder, photosDir);
      totalImages += count;
      processedProducts++;

      if (processedProducts % 50 === 0) {
        console.log(`   Processed ${processedProducts}/${productFolders.length} products...`);
      }
    });

    console.log(`\n✅ Successfully copied ${totalImages} images from ${processedProducts} products!`);
    console.log(`📂 Images location: ${DEST_PATH}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Run: node import-lcw-data.js (to import product data to MongoDB)');
    console.log('   2. Start backend: npm start');
    console.log('   3. Start frontend: npm run dev');

  } catch (error) {
    console.error('❌ Copy error:', error);
    process.exit(1);
  }
}

copyAllImages();
