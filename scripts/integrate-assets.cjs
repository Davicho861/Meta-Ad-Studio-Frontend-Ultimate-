const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Usage: node scripts/integrate-assets.cjs /absolute/path/to/incoming --dry
// incoming folder expected to have files named exactly as targets: aura_times_square.webp etc.

const incoming = process.argv[2];
const dry = process.argv.includes('--dry');
if (!incoming) {
  console.error('Usage: node scripts/integrate-assets.cjs /path/to/incoming [--dry]');
  process.exit(1);
}

const targetDir = path.join(__dirname, '..', 'public', 'images', 'campaign-examples');

(async () => {
  const files = await fs.promises.readdir(incoming);
  const candidates = files.filter(f => /\.(webp|jpg|png)$/i.test(f));
  if (candidates.length === 0) {
    console.error('No candidate images found in incoming folder.');
    process.exit(1);
  }

  for (const file of candidates) {
    const src = path.join(incoming, file);
    const dest = path.join(targetDir, file);
    console.log(`${dry ? '[DRY] ' : ''}Copying ${src} -> ${dest}`);
    if (!dry) await fs.promises.copyFile(src, dest);

    // generate 2x
    const base = file.replace(/\.(webp|jpg|png)$/i, '');
    const outJpg2x = path.join(targetDir, `${base}-2x.jpg`);
    const outWebp2x = path.join(targetDir, `${base}-2x.webp`);
    if (!dry) {
      await sharp(src).resize({ width: 1600 }).toFile(outJpg2x);
      await sharp(src).resize({ width: 1600 }).webp({ quality: 80 }).toFile(outWebp2x);
      console.log(`Generated ${outJpg2x} and ${outWebp2x}`);
    } else {
      console.log(`[DRY] Would generate ${outJpg2x} and ${outWebp2x}`);
    }
  }

  console.log('Integration script finished.');
})();
