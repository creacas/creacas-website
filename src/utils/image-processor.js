const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const SIZE_CONFIG = {
  hero: { width: 1920, height: null },
  portfolio: { width: 800, height: 600 },
  gallery: { width: 1400, height: null },
  about: { width: 600, height: null },
  page: { width: 1200, height: null }
};

const THUMBNAIL_SIZE = { width: 400, height: 300 };

async function processImage(inputPath, type) {
  const config = SIZE_CONFIG[type] || SIZE_CONFIG.gallery;
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const dir = path.dirname(inputPath);

  // SVG files don't need processing
  if (ext.toLowerCase() === '.svg') {
    return { processed: inputPath, thumbnail: inputPath };
  }

  const webpName = `${baseName}.webp`;
  const outputPath = path.join(dir, webpName);

  // Process main image
  let pipeline = sharp(inputPath).rotate(); // auto-orient via EXIF

  if (config.height) {
    pipeline = pipeline.resize(config.width, config.height, { fit: 'cover' });
  } else {
    pipeline = pipeline.resize(config.width, null, { withoutEnlargement: true });
  }

  await pipeline.webp({ quality: 80 }).toFile(outputPath);

  // Generate thumbnail
  const thumbDir = path.join(UPLOAD_DIR, 'thumbnails');
  const thumbPath = path.join(thumbDir, webpName);

  await sharp(inputPath)
    .rotate()
    .resize(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height, { fit: 'cover' })
    .webp({ quality: 75 })
    .toFile(thumbPath);

  // Remove original if different from output
  if (inputPath !== outputPath) {
    try { fs.unlinkSync(inputPath); } catch (e) { /* ignore */ }
  }

  // Return paths relative to uploads dir for URL usage
  const relProcessed = '/' + path.relative(path.join(UPLOAD_DIR, '..'), outputPath).replace(/\\/g, '/');
  const relThumb = '/' + path.relative(path.join(UPLOAD_DIR, '..'), thumbPath).replace(/\\/g, '/');

  return { processed: relProcessed, thumbnail: relThumb };
}

function deleteImage(imagePath) {
  if (!imagePath || imagePath.startsWith('/assets/')) return; // Don't delete seed images

  const fullPath = path.join(__dirname, '..', '..', imagePath.replace(/^\//, ''));
  try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }

  // Also try to delete thumbnail
  const baseName = path.basename(imagePath);
  const thumbPath = path.join(UPLOAD_DIR, 'thumbnails', baseName);
  try { fs.unlinkSync(thumbPath); } catch (e) { /* ignore */ }
}

module.exports = { processImage, deleteImage };
