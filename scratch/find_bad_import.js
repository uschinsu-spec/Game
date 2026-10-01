// scratch/find_bad_import.js
import fs from 'fs';
import path from 'path';

globalThis.window = globalThis;
globalThis.document = {
  getElementById: () => null,
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }),
  head: { appendChild: () => {} },
  body: { appendChild: () => {} }
};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
globalThis.Phaser = {
  AUTO: 0,
  Scale: { FIT: 0, CENTER_BOTH: 0 },
  Game: class { constructor(config) { this.config = config; } }
};

function getAllJsFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllJsFiles(full));
    } else if (entry.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

const files = getAllJsFiles('src');
console.log(`Testing import on ${files.length} files...`);

for (const file of files) {
  const relativePath = './' + path.relative('scratch', file).replace(/\\/g, '/');
  try {
    await import(relativePath);
  } catch (err) {
    console.error(`FAILED ON FILE: ${file}`);
    console.error(err);
  }
}
