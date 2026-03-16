import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

function makeSvg(size, maskable = false) {
  const pad = maskable ? Math.round(size * 0.15) : Math.round(size * 0.1);
  const inner = size - pad * 2;
  const rx = maskable ? 0 : size * 0.2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#0f172a"/>
  <g transform="translate(${pad},${pad})">
    <svg width="${inner}" height="${inner}" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" stroke-width="6"/>
      <circle cx="50" cy="50" r="10" fill="#06b6d4"/>
      <line x1="50" y1="12" x2="50" y2="30" stroke="#06b6d4" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="70" x2="50" y2="88" stroke="#06b6d4" stroke-width="4" stroke-linecap="round"/>
      <line x1="12" y1="50" x2="30" y2="50" stroke="#06b6d4" stroke-width="4" stroke-linecap="round"/>
      <line x1="70" y1="50" x2="88" y2="50" stroke="#06b6d4" stroke-width="4" stroke-linecap="round"/>
      <line x1="23" y1="23" x2="36" y2="36" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
      <line x1="64" y1="64" x2="77" y2="77" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
      <line x1="77" y1="23" x2="64" y2="36" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
      <line x1="23" y1="77" x2="36" y2="64" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
    </svg>
  </g>
</svg>`;
}

async function generate() {
  for (const size of sizes) {
    await sharp(Buffer.from(makeSvg(size)))
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`icon-${size}x${size}.png`);
  }
  for (const size of maskableSizes) {
    await sharp(Buffer.from(makeSvg(size, true)))
      .png()
      .toFile(`public/icons/maskable-icon-${size}x${size}.png`);
    console.log(`maskable-icon-${size}x${size}.png`);
  }
  console.log('Done.');
}

generate().catch(console.error);
