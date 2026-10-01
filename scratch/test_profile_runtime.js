/**
 * Verification test for Runtime Policies and Special Map Overrides
 */
import {
  resolveRuntimeMap,
  getMapById,
  findMapById,
  getWorldNode,
  getNodeRuntimePolicy,
  RUNTIME_POLICIES,
  CANONICAL_MAP_KEYS,
  STARTER_WORLD_IDS
} from '../src/config/world/worldRegistry.js?v=20260930-special-map-overrides-v5-unified';

console.log('--- TESTING RUNTIME POLICIES ---');

// 1. Navigation Nodes
const realmNode = getWorldNode('hr');
console.log('Realm policy:', getNodeRuntimePolicy(realmNode), 'resolveRuntimeMap:', resolveRuntimeMap('hr'));

const continentNode = getWorldNode('nl');
console.log('Continent policy:', getNodeRuntimePolicy(continentNode), 'resolveRuntimeMap:', resolveRuntimeMap('nl'));

const greatRegionNode = getWorldNode(STARTER_WORLD_IDS.greatRegion);
console.log('Great Region policy:', getNodeRuntimePolicy(greatRegionNode), 'resolveRuntimeMap:', resolveRuntimeMap(STARTER_WORLD_IDS.greatRegion));

const provinceNode = getWorldNode(STARTER_WORLD_IDS.province);
console.log('Province policy:', getNodeRuntimePolicy(provinceNode), 'resolveRuntimeMap:', resolveRuntimeMap(STARTER_WORLD_IDS.province));

const nationNode = getWorldNode(STARTER_WORLD_IDS.nation);
console.log('Nation policy:', getNodeRuntimePolicy(nationNode), 'resolveRuntimeMap:', resolveRuntimeMap(STARTER_WORLD_IDS.nation));

// 2. Playable Nodes
const starterVillage = getWorldNode(STARTER_WORLD_IDS.map0);
console.log('Starter Village policy:', getNodeRuntimePolicy(starterVillage), 'resolveRuntimeMap:', resolveRuntimeMap(STARTER_WORLD_IDS.map0)?.id);

const starterOutskirt = getWorldNode(STARTER_WORLD_IDS.map1);
console.log('Starter Outskirt policy:', getNodeRuntimePolicy(starterOutskirt), 'resolveRuntimeMap:', resolveRuntimeMap(STARTER_WORLD_IDS.map1)?.id);

const starterCity = getWorldNode(STARTER_WORLD_IDS.city);
console.log('Starter City policy:', getNodeRuntimePolicy(starterCity), 'resolveRuntimeMap:', resolveRuntimeMap(STARTER_WORLD_IDS.city)?.id);

const wildNode = getWorldNode('nl.cont_wild_1');
console.log('Wilderness policy:', getNodeRuntimePolicy(wildNode), 'resolveRuntimeMap:', resolveRuntimeMap('nl.cont_wild_1')?.id);

const secretNode = getWorldNode('nl.cont_secret_1');
console.log('Secret Realm policy:', getNodeRuntimePolicy(secretNode), 'resolveRuntimeMap:', resolveRuntimeMap('nl.cont_secret_1')?.id);

console.log('\n--- ASSERTIONS ---');
if (getNodeRuntimePolicy(realmNode) !== RUNTIME_POLICIES.NONE) throw new Error('Realm policy should be NONE');
if (getNodeRuntimePolicy(continentNode) !== RUNTIME_POLICIES.NONE) throw new Error('Continent policy should be NONE');
if (getNodeRuntimePolicy(provinceNode) !== RUNTIME_POLICIES.NONE) throw new Error('Province policy should be NONE');
if (getNodeRuntimePolicy(nationNode) !== RUNTIME_POLICIES.NONE) throw new Error('Nation policy should be NONE');
if (resolveRuntimeMap('nl') !== null) throw new Error('Continent should not resolve to runtime map');
if (resolveRuntimeMap(STARTER_WORLD_IDS.province) !== null) throw new Error('Province should not resolve to runtime map');
if (resolveRuntimeMap(STARTER_WORLD_IDS.nation) !== null) throw new Error('Nation should not resolve to runtime map');

if (getNodeRuntimePolicy(starterVillage) !== RUNTIME_POLICIES.HUB) throw new Error('Starter village should be HUB');
if (getNodeRuntimePolicy(starterCity) !== RUNTIME_POLICIES.HUB) throw new Error('Starter city should be HUB');
if (getNodeRuntimePolicy(wildNode) !== RUNTIME_POLICIES.MAP) throw new Error('Wilderness should be MAP');
if (getNodeRuntimePolicy(secretNode) !== RUNTIME_POLICIES.DUNGEON) throw new Error('Secret realm should be DUNGEON');
if (!resolveRuntimeMap('nl.cont_wild_1')) throw new Error('Wilderness should resolve to runtime map');
if (!resolveRuntimeMap(STARTER_WORLD_IDS.city)) throw new Error('City should resolve to runtime map');

console.log('>>> ALL RUNTIME POLICY ASSERTIONS PASSED PERFECTLY! <<<');
