/**
 * Verification test for Settlement container vs Playable Location
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

console.log('--- TESTING SETTLEMENT VS PLAYABLE LOCATION ---');

// Mock a Settlement container node
const settlementContainer = {
  id: 'nl.settlement.thanh_van_thon',
  type: 'settlement',
  name: 'Thanh Vân Thôn',
  containerOnly: true,
  runtimePolicy: RUNTIME_POLICIES.NONE
};

const policyContainer = getNodeRuntimePolicy(settlementContainer);
console.log('Settlement Container Policy:', policyContainer, 'resolve:', resolveRuntimeMap(settlementContainer.id));
if (policyContainer !== RUNTIME_POLICIES.NONE) throw new Error('Settlement container policy must be NONE');
if (resolveRuntimeMap(settlementContainer.id) !== null) throw new Error('Settlement container must not resolve to runtime map');

// Playable Location Thanh Van Thon
const thonNode = getWorldNode(STARTER_WORLD_IDS.map0);
const policyThon = getNodeRuntimePolicy(thonNode);
const mapThon = resolveRuntimeMap(thonNode.id);
console.log('Playable Thanh Van Thon Location:', policyThon, 'map:', mapThon?.id);
if (policyThon !== RUNTIME_POLICIES.HUB) throw new Error('Thanh Van Thon Location policy must be HUB');
if (mapThon?.id !== 'map_thanh_van_thon') throw new Error('Thanh Van Thon Location map must be map_thanh_van_thon');

// Playable Location Thanh Van Ngoai Vi
const ngoaiViNode = getWorldNode(STARTER_WORLD_IDS.map1);
const policyNgoaiVi = getNodeRuntimePolicy(ngoaiViNode);
const mapNgoaiVi = resolveRuntimeMap(ngoaiViNode.id);
console.log('Playable Thanh Van Ngoai Vi Location:', policyNgoaiVi, 'map:', mapNgoaiVi?.id);
if (policyNgoaiVi !== RUNTIME_POLICIES.MAP) throw new Error('Thanh Van Ngoai Vi Location policy must be MAP');
if (mapNgoaiVi?.id !== 'map_thanh_van_ngoai_vi') throw new Error('Thanh Van Ngoai Vi Location map must be map_thanh_van_ngoai_vi');

console.log('\n>>> SETTLEMENT VS PLAYABLE LOCATION ASSERTIONS PASSED! <<<');
