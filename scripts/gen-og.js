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
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#F5F0E8"/>

  <!-- KBS 로고 (크게) -->
  <image href="data:image/svg+xml;base64,${kbsLogoBase64}" x="300" y="20" width="600" height="130"/>

  <!-- 메인 텍스트 (크게) -->
  <text x="600" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="#2C2C2A">
    열심히 일했는데,
  </text>
  <text x="600" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="#2C2C2A">
    왜 통장엔 없지?
  </text>

  <!-- 서브 텍스트 -->
  <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#5F5E5A">
    소상공인 분들과 함께 합니다.
  </text>

  <!-- 하단 파란 바 -->
  <rect x="0" y="530" width="${WIDTH}" height="100" fill="#2D5A8E"/>
  <text x="600" y="595" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="white">
    pro.genomic.cc
  </text>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(__dirname, '..', 'public', 'og-image.png'))
  .then(() => console.log('og-image.png created'))
  .catch(err => console.error(err));
