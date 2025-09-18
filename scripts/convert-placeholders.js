const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.resolve(__dirname, '../public/images/campaign-examples');

async function convert() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  for (const file of files) {
    const base = path.basename(file, '.svg');
    const input = path.join(dir, file);
    const outJpg = path.join(dir, `${base}.jpg`);
    const outWebp = path.join(dir, `${base}.webp`);
    try {
      const svgBuffer = fs.readFileSync(input);
      await sharp(svgBuffer).resize(1920, 1080, { fit: 'inside' }).jpeg({ quality: 82 }).toFile(outJpg);
      await sharp(svgBuffer).resize(1920, 1080, { fit: 'inside' }).webp({ quality: 80 }).toFile(outWebp);
      console.log('Converted', file, '->', outJpg, outWebp);
    } catch (e) {
      console.error('Failed to convert', file, e);
    }
  }
}

convert().catch(e => { console.error(e); process.exit(1); });
