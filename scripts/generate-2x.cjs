const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const dir = path.join(__dirname, '..', 'public', 'images', 'campaign-examples');

(async () => {
  const files = await fs.promises.readdir(dir);
  const baseNames = new Set(files.map(f => f.replace(/(-2x)?\.(webp|jpg|svg)$/i, '')));

  for (const base of baseNames) {
    try {
      const srcJpg = path.join(dir, `${base}.jpg`);
      const srcWebp = path.join(dir, `${base}.webp`);
      const outJpg2x = path.join(dir, `${base}-2x.jpg`);
      const outWebp2x = path.join(dir, `${base}-2x.webp`);

      let input = null;
      if (fs.existsSync(srcJpg)) input = srcJpg;
      else if (fs.existsSync(srcWebp)) input = srcWebp;
      else {
        console.warn(`Skipping ${base}: no jpg/webp source found`);
        continue;
      }

      // produce 2x by resizing to 1600px width (assuming base 800px)
      await sharp(input)
        .resize({ width: 1600 })
        .toFile(outJpg2x);

      await sharp(input)
        .resize({ width: 1600 })
        .webp({ quality: 80 })
        .toFile(outWebp2x);

      console.log(`Generated ${outJpg2x} and ${outWebp2x}`);
    } catch (e) {
      console.error('Error processing', base, e);
    }
  }
})();
