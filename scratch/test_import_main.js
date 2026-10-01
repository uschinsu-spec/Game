// scratch/test_import_main.js
// Mock global browser objects needed for top-level evaluation
globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.window.addEventListener = () => {};
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
  Scene: class {},
  Scale: { FIT: 0, CENTER_BOTH: 0 },
  Game: class { constructor(config) { this.config = config; } }
};

try {
  console.log('Attempting to import src/main.js dynamically...');
  await import('../src/main.js');
  console.log('Successfully loaded src/main.js!');
} catch (err) {
  console.error('Error importing main.js:', err);
}
