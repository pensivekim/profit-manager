const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 630;

const kbsLogoPath = path.join(__dirname, '..', 'public', 'kbs-logo.svg');
const kbsLogoSvg = fs.readFileSync(kbsLogoPath, 'utf8');
const kbsLogoBase64 = Buffer.from(kbsLogoSvg).toString('base64');

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- 상단 절반: 흰색 배경 + 로고 크게 -->
  <rect width="${WIDTH}" height="320" fill="#FFFFFF"/>
  <image href="data:image/svg+xml;base64,${kbsLogoBase64}" x="150" y="60" width="900" height="200"/>

  <!-- 하단 절반: 파란 배경 + 텍스트 -->
  <rect y="320" width="${WIDTH}" height="310" fill="#2D5A8E"/>
  <text x="600" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">
    열심히 일했는데, 왜 통장엔 없지?
  </text>
  <text x="600" y="530" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" fill="rgba(255,255,255,0.8)">
    소상공인 분들과 함께 합니다
  </text>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(__dirname, '..', 'public', 'og-image.png'))
  .then(() => console.log('og-image.png created'))
  .catch(err => console.error(err));
