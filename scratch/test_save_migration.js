// scratch/test_save_migration.js
import {
  SAVE_VERSION,
  SAVE_PREFIX,
  exportSaveCode,
  importSaveCode,
  resetToNewGame,
  migrateLegacySaveMapIds
} from '../src/state/saveSystem.js';
import { gameState } from '../src/state/gameState.js';
import { CANONICAL_MAP_KEYS } from '../src/config/world/masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';

// Mock localStorage for Node test environment
const mockStorage = {};
globalThis.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

function base64ToUtf8(str) {
  return Buffer.from(str, 'base64').toString('utf8');
}
function utf8ToBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

console.log('--- TEST SAVE MIGRATION V6 ---');
console.log('SAVE_VERSION:', SAVE_VERSION);
if (SAVE_VERSION !== 6) throw new Error('SAVE_VERSION must be 6!');

// Test 1: Direct migrateLegacySaveMapIds function
const testLegacyData = {
  version: 5,
  currentMapId: 0,
  worldProgress: {
    visitedMapIds: [0, 1, 2, 'map_thanh_van_thon'],
    unlockedWaypointMapIds: [0, 1]
  }
};
migrateLegacySaveMapIds(testLegacyData);
console.log('Test 1 Migrated Data:', JSON.stringify(testLegacyData, null, 2));

if (testLegacyData.currentMapId !== CANONICAL_MAP_KEYS.THANH_VAN_THON) {
  throw new Error(`Expected currentMapId to be ${CANONICAL_MAP_KEYS.THANH_VAN_THON}, got ${testLegacyData.currentMapId}`);
}
if (testLegacyData.worldProgress.visitedMapIds.some(id => typeof id === 'number' || id === '0' || id === '1' || id === '2')) {
  throw new Error('Numeric IDs found in visitedMapIds!');
}
console.log('✓ Test 1 Passed: migrateLegacySaveMapIds successfully converted 0/1/2.');

// Test 2: Full importSaveCode of legacy v5 save code with currentMapId = 1
const legacyPayload = {
  version: 5,
  realmIdx: 2,
  exp: 500,
  currentMapId: 1,
  worldProgress: {
    visitedMapIds: [0, 1],
    unlockedWaypointMapIds: [0, 1]
  },
  inventory: { items: [], pills: {}, talismans: {}, formations: [] }
};
const legacySaveCode = `${SAVE_PREFIX}${utf8ToBase64(JSON.stringify(legacyPayload))}`;
const importResult = importSaveCode(legacySaveCode);
console.log('Test 2 Import Result success:', importResult.success);
console.log('Imported currentMapId:', gameState.currentMapId);
console.log('Imported worldProgress visitedMapIds:', gameState.worldProgress.visitedMapIds);

if (!importResult.success) throw new Error('Import failed: ' + importResult.error);
if (gameState.currentMapId !== CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI) {
  throw new Error(`Expected currentMapId to be ${CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI}, got ${gameState.currentMapId}`);
}
if (gameState.worldProgress.visitedMapIds.includes(0) || gameState.worldProgress.visitedMapIds.includes(1)) {
  throw new Error('Numeric IDs persisted in gameState.worldProgress!');
}
console.log('✓ Test 2 Passed: Full legacy save code imported and upgraded.');

// Test 3: Export Save Code produces V6 and canonical IDs
const exportedCode = exportSaveCode();
const rawExportedJson = JSON.parse(base64ToUtf8(exportedCode.slice(SAVE_PREFIX.length)));
console.log('Test 3 Exported Save Version:', rawExportedJson.version);
console.log('Test 3 Exported currentMapId:', rawExportedJson.currentMapId);
if (rawExportedJson.version !== 6) throw new Error('Exported version must be 6!');
if (typeof rawExportedJson.currentMapId !== 'string') throw new Error('Exported mapId must be string!');
console.log('✓ Test 3 Passed: Save exported with version 6 and canonical string IDs.');

// Test 4: resetToNewGame()
resetToNewGame();
console.log('Test 4 Reset currentMapId:', gameState.currentMapId);
if (gameState.currentMapId !== CANONICAL_MAP_KEYS.THANH_VAN_THON) {
  throw new Error(`Reset game mapId invalid: ${gameState.currentMapId}`);
}
console.log('✓ Test 4 Passed: resetToNewGame initialized cleanly.');

console.log('\n=== ALL SAVE MIGRATION TESTS PASSED ===');
