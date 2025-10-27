const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../portraits');
const outputDir = path.join(__dirname, '../portraits/previews');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.readdirSync(inputDir).forEach(file => {
  if (!/\.(jpg|jpeg|png)$/i.test(file)) return;
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '-thumb.jpg'));

  sharp(inputPath)
    .resize(400, 400)
    .jpeg({ quality: 70 })
    .toFile(outputPath)
    .then(() => console.log(`Resized: ${file}`))
    .catch(err => console.error(`Error resizing ${file}:`, err));
});