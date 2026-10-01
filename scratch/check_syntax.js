import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function checkDir(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += checkDir(full);
    } else if (entry.name.endsWith('.js')) {
      execSync(`node --check "${full}"`);
      count++;
    }
  }
  return count;
}

const total = checkDir('src');
console.log(`Successfully checked syntax on ${total} files in src!`);
