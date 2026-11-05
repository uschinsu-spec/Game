import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const assets = [
  { source: 'hero-xianxia.svg', output: 'hero-xianxia.webp' },
  { source: 'monster-void-eye.svg', output: 'monster-void-eye.webp' },
  { source: 'monster-elite.svg', output: 'monster-elite.webp' },
  { source: 'monster-boss.svg', output: 'monster-boss.webp' }
];

const assetDir = path.resolve('src/assets');

for (const asset of assets) {
  const input = path.join(assetDir, asset.source);
  const output = path.join(assetDir, asset.output);
  const svg = await fs.readFile(input);
  await sharp(svg, { density: 192 })
    .webp({ quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(output);
  const { width, height, size } = await sharp(output).metadata();
  console.log(`WebP: ${asset.output} (${width}x${height}, ${Math.round(size / 1024)} KB)`);
}
