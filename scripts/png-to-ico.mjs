/**
 * PNG-to-ICO converter using only Node.js built-ins.
 * Creates an ICO file embedding multiple PNG images.
 * 
 * Usage: node scripts/png-to-ico.mjs <output.ico> <input1.png> [input2.png ...]
 */
import { readFileSync, writeFileSync } from 'fs';

const [,, outputIco, ...inputPngs] = process.argv;

if (!outputIco || inputPngs.length === 0) {
  console.error('Usage: node png-to-ico.mjs <output.ico> <input1.png> [input2.png ...]');
  process.exit(1);
}

const images = inputPngs.map(f => {
  const data = readFileSync(f);
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  console.log(`  ${f}: ${width}x${height}, ${data.length} bytes`);
  return { data, width, height };
});

const numImages = images.length;
const headerSize = 6;
const entrySize = 16;
const entriesSize = entrySize * numImages;

// ICONDIR header
const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0);          // Reserved
header.writeUInt16LE(1, 2);          // Type: 1 = ICO
header.writeUInt16LE(numImages, 4);  // Number of images

// Build entries and compute offsets
let dataOffset = headerSize + entriesSize;
const entries = [];

for (const img of images) {
  const entry = Buffer.alloc(entrySize);
  entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
  entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
  entry.writeUInt8(0, 2);              // Color palette
  entry.writeUInt8(0, 3);              // Reserved
  entry.writeUInt16LE(1, 4);           // Color planes
  entry.writeUInt16LE(32, 6);          // Bits per pixel
  entry.writeUInt32LE(img.data.length, 8);
  entry.writeUInt32LE(dataOffset, 12);
  entries.push(entry);
  dataOffset += img.data.length;
}

const ico = Buffer.concat([header, ...entries, ...images.map(i => i.data)]);
writeFileSync(outputIco, ico);
console.log(`Created ICO: ${outputIco} (${ico.length} bytes, ${numImages} image(s))`);
