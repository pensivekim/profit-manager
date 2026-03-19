const sharp = require('sharp');
const path = require('path');

function createSvg(size) {
  const fontSize = Math.round(size * 0.3);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="#2D5A8E"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-weight="bold" font-size="${fontSize}" fill="white">경영</text>
</svg>`);
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');

  await sharp(createSvg(192)).png().toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  await sharp(createSvg(512)).png().toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Created icon-512.png');
}

main().catch(console.error);
