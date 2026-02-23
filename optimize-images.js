const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = {
  'hero': { maxWidth: 1920, quality: 80 },
  'portfolio': { maxWidth: 800, quality: 80 },
  'gallery': { maxWidth: 1200, quality: 80 },
  'about': { maxWidth: 600, quality: 80 },
};

function getConfig(filePath) {
  for (const [key, config] of Object.entries(SIZES)) {
    if (filePath.includes(key)) return config;
  }
  return { maxWidth: 1200, quality: 80 };
}

async function findImages(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findImages(fullPath));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimize() {
  const images = await findImages('assets/images');
  console.log(`Optimizing ${images.length} images...`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const img of images) {
    const config = getConfig(img);
    const before = fs.statSync(img).size;
    totalBefore += before;

    try {
      const buffer = await sharp(img)
        .resize({ width: config.maxWidth, withoutEnlargement: true })
        .jpeg({ quality: config.quality, mozjpeg: true })
        .toBuffer();

      fs.writeFileSync(img, buffer);
      totalAfter += buffer.length;

      const saved = Math.round((1 - buffer.length / before) * 100);
      if (saved > 0) {
        console.log(`  ${img}: ${(before/1024).toFixed(0)}KB → ${(buffer.length/1024).toFixed(0)}KB (-${saved}%)`);
      }
    } catch (err) {
      console.warn(`  Skipped ${img}: ${err.message}`);
      totalAfter += before;
    }
  }

  const totalSaved = Math.round((1 - totalAfter / totalBefore) * 100);
  console.log(`\nDone! ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB (-${totalSaved}%)`);
}

optimize();
