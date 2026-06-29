const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'partzyy', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1x1 pixel transparent PNG in base64
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');

const files = ['favicon.png', 'icon.png', 'splash.png', 'adaptive-icon.png'];

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, buffer);
  console.log(`Successfully wrote ${file}`);
});
