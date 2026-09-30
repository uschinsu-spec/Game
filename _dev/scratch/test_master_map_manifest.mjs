import {
  MASTER_MAP_DEFINITIONS,
  MASTER_TERRITORY_MANIFEST,
  CONTINENT_DEFINITIONS,
  ZONE_TYPES,
  UI_MODES,
  ELEMENT_TYPES,
  getMasterMapById,
  getAllTerritories,
  getTerritoriesByContinent,
  getContinentsSummary,
  getWorldScaleStats
} from '../../src/config/world/masterMapManifest.js';

console.log('=== TEST MASTER MAP MANIFEST SYSTEM ===');
const stats = getWorldScaleStats();
console.log('Scale Stats:', stats);

if (stats.continents !== 5) {
  console.error(`FAIL: Expected 5 continents, got ${stats.continents}`);
  process.exit(1);
}

if (stats.totalTerritories !== 437) {
  console.error(`FAIL: Expected 437 territories, got ${stats.totalTerritories}`);
  process.exit(1);
}

const summary = getContinentsSummary();
console.table(summary);

for (const c of summary) {
  if (c.territories !== c.secondaryCount) {
    console.error(`FAIL: Continent ${c.name} expected ${c.secondaryCount} territories, got ${c.territories}`);
    process.exit(1);
  }
}

// Check Map 0, 1, 2
console.log('\n--- Checking Active Runtime Maps ---');
for (const id of [0, 1, 2]) {
  const map = getMasterMapById(id);
  console.log(`Map ${id}: ${map.name} | Type: ${map.type} | UI Mode: ${map.uiMode} | isPeaceZone: ${map.isPeaceZone}`);
  if (!map.name) {
    console.error(`FAIL: Map ${id} missing name`);
    process.exit(1);
  }
}

console.log('\n✅ ALL 5 CONTINENTS AND 437 TERRITORIES VERIFIED SUCCESSFULLY!');
