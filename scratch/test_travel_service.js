/**
 * Comprehensive Unit & Integration Test for TravelService
 */
if (typeof window === 'undefined') {
  global.window = {};
}

import {
  travelService,
  TRAVEL_SOURCES,
  TRAVEL_ERROR_CODES
} from '../src/services/travelService.js';

import {
  CANONICAL_MAP_KEYS,
  STARTER_WORLD_IDS
} from '../src/config/world/worldRegistry.js?v=20260930-special-map-overrides-v5-unified';

import { gameState } from '../src/state/gameState.js';
import { ensureCurrencies, addCurrency } from '../src/config/currencyData.js';

console.log('--- TESTING TRAVEL SERVICE ---');

// Mock scene
let switchedTo = null;
let switchSpawn = null;
const mockScene = {
  player: { x: 270, y: 620 },
  time: { now: 1000 },
  closeModal: () => { console.log('[Scene] Modal closed'); },
  switchMap: (mapId, x, y) => {
    console.log(`[Scene] switchMap called -> map: ${mapId}, x: ${x}, y: ${y}`);
    switchedTo = mapId;
    switchSpawn = { x, y };
    gameState.currentMapId = mapId;
  },
  showFloatingText: (x, y, text, color) => {
    console.log(`[Scene] showFloatingText: "${text}" (${color})`);
  }
};

window.__ACTIVE_PHASER_SCENE__ = mockScene;
gameState.currentMapId = CANONICAL_MAP_KEYS.THANH_VAN_THON;
gameState.realmIdx = 1; // Luyện Khí
ensureCurrencies(gameState);

// Test 1: Travel from Thanh Van Thon to Thanh Van Ngoai Vi via NPC
console.log('\n[Test 1] NPC Travel to Ngoai Vi:');
let ok = travelService.travel(CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI, {
  scene: mockScene,
  source: TRAVEL_SOURCES.NPC,
  spawnX: 420,
  spawnY: 620
});
console.log('Result:', ok, 'CurrentMap:', gameState.currentMapId, 'Spawn:', switchSpawn);
if (!ok || gameState.currentMapId !== CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI) {
  throw new Error('Test 1 Failed: NPC travel failed');
}

// Test 2: Travel to same map -> should return ALREADY_HERE
console.log('\n[Test 2] Travel to same map:');
const checkSame = travelService.canTravel(CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI);
console.log('Can travel to same map:', checkSame);
if (checkSame.ok || checkSame.reason !== TRAVEL_ERROR_CODES.ALREADY_HERE) {
  throw new Error('Test 2 Failed: Should block travel to same map');
}

// Test 3: Portal Travel back to Thon
console.log('\n[Test 3] Portal Travel back to Thon:');
ok = travelService.travel(CANONICAL_MAP_KEYS.THANH_VAN_THON, {
  scene: mockScene,
  source: TRAVEL_SOURCES.PORTAL
});
console.log('Result:', ok, 'CurrentMap:', gameState.currentMapId, 'Spawn:', switchSpawn);
if (!ok || gameState.currentMapId !== CANONICAL_MAP_KEYS.THANH_VAN_THON) {
  throw new Error('Test 3 Failed: Portal travel back to thon failed');
}

// Test 4: Realm Restricted Map
console.log('\n[Test 4] High Realm Map Check:');
gameState.realmIdx = 0; // Phàm Nhân
const highMapCheck = travelService.canTravel('nl.cont_secret_1');
console.log('High Realm Check (Phàm Nhân -> Bí Cảnh):', highMapCheck);

// Test 5: Cost Check
console.log('\n[Test 5] Paid Fast Travel with insufficient funds:');
gameState.currencies.low = 5;
const checkCost = travelService.canTravel('nl.cont_wild_1', {
  source: TRAVEL_SOURCES.FAST_TRAVEL,
  skipDiscoveredCheck: true,
  cost: 100,
  costType: 'low'
});
console.log('Cost check (5 / 100):', checkCost);
if (checkCost.ok || checkCost.reason !== TRAVEL_ERROR_CODES.INSUFFICIENT_FUNDS) {
  throw new Error('Test 5 Failed: Cost check failed');
}

// Test 6: Paid Fast Travel with sufficient funds
console.log('\n[Test 6] Paid Fast Travel with sufficient funds:');
addCurrency(gameState, 'low', 500);
ok = travelService.travel('nl.cont_wild_1', {
  scene: mockScene,
  source: TRAVEL_SOURCES.FAST_TRAVEL,
  skipDiscoveredCheck: true,
  cost: 100,
  costType: 'low'
});
console.log('Result:', ok, 'CurrentMap:', gameState.currentMapId, 'Remaining Gold:', gameState.currencies.low);
if (!ok || gameState.currencies.low !== 405) {
  throw new Error('Test 6 Failed: Cost deduction failed');
}

console.log('\n>>> ALL TRAVEL SERVICE UNIT TESTS PASSED WITH 100% SUCCESS! <<<');
