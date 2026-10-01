// scratch/verify_module_tree.js
import fs from 'fs';
import path from 'path';

const visited = new Set();
const errors = [];

function checkFile(filePath, fromFile = null) {
  // Strip query string if present
  const cleanPath = filePath.split('?')[0];
  const absolutePath = path.resolve(cleanPath);

  if (visited.has(absolutePath)) return;
  visited.add(absolutePath);

  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing file: ${cleanPath} imported from ${fromFile}`);
    return;
  }

  const content = fs.readFileSync(absolutePath, 'utf8');

  // Regex to match ES module imports/exports
  const importRegex = /(?:import|export)\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importSpecifier = match[1];
    
    // Ignore non-relative imports if any
    if (!importSpecifier.startsWith('.') && !importSpecifier.startsWith('/')) {
      continue;
    }

    const dir = path.dirname(absolutePath);
    const resolvedTarget = path.resolve(dir, importSpecifier.split('?')[0]);
    checkFile(resolvedTarget, absolutePath);
  }
}

try {
  console.log('Starting module tree verification from src/main.js...');
  checkFile('src/main.js');
  console.log(`Visited ${visited.size} modules.`);
  if (errors.length > 0) {
    console.error('Found import errors:', errors);
  } else {
    console.log('All module imports resolved cleanly!');
  }
} catch (e) {
  console.error('Error during verification:', e);
}
