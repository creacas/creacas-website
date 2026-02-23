const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST_FILE = '.imagemanifest.json';
const IMAGE_DIR = 'assets/images';

const SIZES = {
  hero: { maxWidth: 1920, quality: 80 },
  portfolio: { maxWidth: 800, quality: 80 },
  gallery: { maxWidth: 1200, quality: 80 },
  about: { maxWidth: 600, quality: 80 },
};

function getConfig(filePath) {
  for (const [key, config] of Object.entries(SIZES)) {
    if (filePath.includes(key)) return config;
  }
  return { maxWidth: 1200, quality: 80 };
}

function fileHash(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

function findImages(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findImages(fullPath));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimize() {
  let manifest = {};
  if (fs.existsSync(MANIFEST_FILE)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  }

  const images = findImages(IMAGE_DIR);
  let processed = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const img of images) {
    const hash = fileHash(img);
    const key = img.split(path.sep).join('/');

    if (manifest[key] === hash) {
      skipped++;
      continue;
    }

    const config = getConfig(img);
    const beforeSize = fs.statSync(img).size;
    totalBefore += beforeSize;

    try {
      // Read file into buffer once to avoid file locking issues
      const inputBuffer = fs.readFileSync(img);

      // Compress JPEG from buffer
      const jpegBuffer = await sharp(inputBuffer)
        .resize({ width: config.maxWidth, withoutEnlargement: true })
        .jpeg({ quality: config.quality, mozjpeg: true })
        .toBuffer();

      // Generate WebP from same buffer
      const webpPath = img.replace(/\.(jpe?g|png)$/i, '.webp');
      const webpBuffer = await sharp(inputBuffer)
        .resize({ width: config.maxWidth, withoutEnlargement: true })
        .webp({ quality: config.quality })
        .toBuffer();

      // Write JPEG only if smaller
      if (jpegBuffer.length < beforeSize) {
        fs.writeFileSync(img, jpegBuffer);
      }
      fs.writeFileSync(webpPath, webpBuffer);

      const afterSize = fs.statSync(img).size;
      totalAfter += afterSize;
      const jpgSaved = Math.round((1 - afterSize / beforeSize) * 100);
      const webpSaved = Math.round((1 - webpBuffer.length / beforeSize) * 100);

      console.log('  ' + key + ':');
      console.log('    JPG:  ' + (beforeSize/1024).toFixed(0) + 'KB -> ' + (afterSize/1024).toFixed(0) + 'KB (' + (jpgSaved > 0 ? '-' + jpgSaved : '~0') + '%)');
      console.log('    WebP: ' + (webpBuffer.length/1024).toFixed(0) + 'KB (-' + webpSaved + '%)');

      manifest[key] = fileHash(img);
      processed++;
    } catch (err) {
      console.warn('  Skipped ' + key + ': ' + err.message);
      totalAfter += beforeSize;
    }
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n');

  if (totalBefore > 0) {
    console.log('\nTotal: ' + (totalBefore/1024/1024).toFixed(1) + 'MB -> ' + (totalAfter/1024/1024).toFixed(1) + 'MB JPG');
  }
  console.log('Done! ' + processed + ' processed, ' + skipped + ' skipped (unchanged).');
}

optimize();
