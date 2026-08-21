import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const assetsDir = path.resolve('dist/assets');
const maxBytes = 500 * 1024;
const javascriptFiles = readdirSync(assetsDir)
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({
    name,
    bytes: statSync(path.join(assetsDir, name)).size,
  }))
  .sort((a, b) => b.bytes - a.bytes);

if (javascriptFiles.length === 0) {
  throw new Error('No production JavaScript bundles found in dist/assets.');
}

const oversized = javascriptFiles.filter(({ bytes }) => bytes > maxBytes);
for (const { name, bytes } of javascriptFiles) {
  console.log(`${name}: ${(bytes / 1024).toFixed(2)} KiB`);
}

if (oversized.length > 0) {
  console.error(`Bundle budget exceeded: ${oversized.map(({ name }) => name).join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`Bundle budget passed: ${javascriptFiles.length} files are each <= 500 KiB.`);
}
