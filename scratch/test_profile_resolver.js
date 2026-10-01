import { resolveMapDensityLevel, getMineralProfile, getHerbProfile, getEnemyProfile, DENSITY_PROFILES } from '../src/scenes/mixins/MapContentZoneRuntime.js';
import { getMapById, CANONICAL_MAP_KEYS } from '../src/config/world/worldRegistry.js';

const thon = getMapById(CANONICAL_MAP_KEYS.THANH_VAN_THON);
const ngoaiVi = getMapById(CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI);

console.log('Density Ngoại Vi:', resolveMapDensityLevel(ngoaiVi));
console.log('Mineral Profile Ngoại Vi:', getMineralProfile(ngoaiVi));
console.log('Herb Profile Ngoại Vi:', getHerbProfile(ngoaiVi));
console.log('Enemy Profile Ngoại Vi:', getEnemyProfile(ngoaiVi));

const deepDungeon = { id: 'dungeon_test', locationKind: 'forbidden_zone', realmRange: [16, 20] };
console.log('Density Deep Dungeon:', resolveMapDensityLevel(deepDungeon));
console.log('Mineral Profile Deep Dungeon:', getMineralProfile(deepDungeon));

console.log('TEST PROFILE RESOLVER PASSED!');
