/**
 * playableMaps.js
 * Bridges the declarative Master Map Manifest (masterMapManifest.js)
 * into the engine runtime map catalog.
 */
import {
  SPECIAL_MAP_OVERRIDES,
  MASTER_MAP_DEFINITIONS,
  ZONE_TYPES,
  UI_MODES,
  ELEMENT_TYPES,
  MAJOR_PROVINCES,
  CANONICAL_MAP_KEYS,
  getMasterMapById,
  getAllMasterMaps,
  isMapSafeHub,
  getMapUiMode,
  getMapCombatZones
} from './masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';
import { HUMAN_REALM_WORLD_NODES, RUNTIME_POLICIES } from './humanRealmWorld.js?v=20261001-canonical-geography-single-ruler-v2';

export const RUNTIME_MAP_IDS = Object.freeze(MASTER_MAP_DEFINITIONS.map(m => String(m.id)));

export const SHARED_WILDERNESS_PANORAMA = Object.freeze({
  key: 'map_panorama_wilderness_shared',
  asset: 'environment/map_1_thanh_van_ngoai_vi.jpg',
  sourceWidth: 3200,
  sourceHeight: 960,
  worldWidth: 32000,
  worldHeight: 960
});

// Explicit destination index. It stores metadata only; maps are materialized
// lazily by WorldRegistry when the player travels there.
const WORLD_RUNTIME_NODES = Object.freeze(HUMAN_REALM_WORLD_NODES.filter(node => node.playableMapId && node.runtimePolicy !== RUNTIME_POLICIES.NONE));
const WORLD_RUNTIME_NODE_BY_DESTINATION = new Map(WORLD_RUNTIME_NODES.map(node => [String(node.playableMapId), node]));
const WORLD_RUNTIME_NODE_BY_ID = new Map(WORLD_RUNTIME_NODES.map(node => [String(node.id), node]));

export function getDeclaredWorldRuntimeMapDefinition(identifier) {
  const node = WORLD_RUNTIME_NODE_BY_DESTINATION.get(String(identifier)) || WORLD_RUNTIME_NODE_BY_ID.get(String(identifier));
  if (!node) return null;
  const isHub = node.runtimePolicy === RUNTIME_POLICIES.HUB;
  const isDungeon = node.runtimePolicy === RUNTIME_POLICIES.DUNGEON;
  const isCity = node.type === 'city_territory';
  return Object.freeze({
    id: node.playableMapId,
    canonicalKey: node.playableMapId,
    name: node.name,
    subName: node.desc,
    nodeId: node.id,
    geography: Object.freeze({ nodeId: node.id }),
    runtimePolicy: node.runtimePolicy,
    type: isHub ? (isCity ? ZONE_TYPES.SAFE_CITY : ZONE_TYPES.SAFE_VILLAGE) : (isDungeon ? ZONE_TYPES.COMBAT_DUNGEON : ZONE_TYPES.COMBAT_WILDERNESS),
    uiMode: isHub ? (isCity ? UI_MODES.CITY_HUB : UI_MODES.VILLAGE_HUB) : UI_MODES.COMBAT_BATTLEFIELD,
    isPeaceZone: isHub,
    realmRange: node.realmRange || [0, 3],
    access: Object.freeze({ minRealmIdx: Number(node.realmRange?.[0] || 0) }),
    dominantElements: node.elements || []
  });
}

export function buildRuntimeMap(def) {
  if (!def) return null;
  const isSafeHub = def.isPeaceZone === true || def.type === ZONE_TYPES.SAFE_VILLAGE || def.type === ZONE_TYPES.SAFE_CITY || def.type === ZONE_TYPES.SAFE_SECT || def.type === ZONE_TYPES.SAFE_CLAN;
  const templateId = isSafeHub
    ? (def.type === ZONE_TYPES.SAFE_CITY ? 'HUB_CITY_01' : (def.type === ZONE_TYPES.SAFE_SECT ? 'HUB_SECT_01' : (def.type === ZONE_TYPES.SAFE_CLAN ? 'HUB_CLAN_01' : 'HUB_VILLAGE_01')))
    : 'FIELD_GRASSLAND_01';

  const isClanHub = def.type === ZONE_TYPES.SAFE_CLAN || def.uiMode === UI_MODES.CLAN_HUB;
  const isSectHub = def.type === ZONE_TYPES.SAFE_SECT || def.uiMode === UI_MODES.SECT_HUB;
  const isCityHub = def.type === ZONE_TYPES.SAFE_CITY || def.uiMode === UI_MODES.CITY_HUB;

  const defaultBgKey = isClanHub
    ? 'bg_clan_hub'
    : (isSectHub ? 'bg_sect_hub' : (isCityHub ? 'bg_city_hub' : (isSafeHub ? 'bg_village_hub' : 'map_panorama_wilderness_shared')));

  const defaultBgPath = isClanHub
    ? 'environment/GIA TOC.webp'
    : (isSectHub ? 'environment/TONG MON.webp' : (isCityHub ? 'environment/THANH THI.webp' : (isSafeHub ? 'environment/THON TRAN.webp' : 'environment/map_1_thanh_van_ngoai_vi.jpg')));

  const defaultSourceWidth = isClanHub ? 848 : (isSectHub ? 848 : (isCityHub ? 941 : (isSafeHub ? 784 : 3200)));
  const defaultSourceHeight = isClanHub ? 1272 : (isSectHub ? 1264 : (isCityHub ? 1672 : (isSafeHub ? 1334 : 960)));

  const assets = def.assets || {
    bgKey: defaultBgKey,
    bgPath: defaultBgPath,
    panoramaKey: defaultBgKey,
    panoramaAsset: defaultBgPath,
    sourceWidth: defaultSourceWidth,
    sourceHeight: defaultSourceHeight,
    worldWidth: isSafeHub ? 540 : 32000,
    worldHeight: 960,
    field: isSafeHub ? { left: 30, right: 510, top: 120, bottom: 840 } : { left: 60, right: 31940, top: 350, bottom: 900 },
    spawn: isSafeHub ? { x: 270, y: 480 } : { x: 350, y: 620 },
    noRepeat: isSafeHub,
    repeatPanorama: !isSafeHub
  };

  const minRealm = def.access?.minRealmIdx ?? def.realmRange?.[0] ?? 0;
  const maxRealm = def.realmRange?.[1] ?? (minRealm + 3);
  const locationNodeId = def.geography?.nodeId ?? def.nodeId ?? null;

  const fieldLeft = assets.field?.left ?? 60;
  const fieldRight = assets.field?.right ?? (assets.worldWidth ? assets.worldWidth - 60 : 31940);
  const span = Math.max(100, (fieldRight - fieldLeft) / 4);

  let zones = def.combatContent?.zones || def.zones || [];
  if (!isSafeHub && (!zones || zones.length === 0)) {
    const dominantElements = def.dominantElements || ['MOC', 'THUY'];
    zones = [
      {
        id: `${def.canonicalKey || def.id}_z1`,
        name: `${def.name} Cửa Ngõ`,
        x0: Math.round(fieldLeft + span * 0),
        x1: Math.round(fieldLeft + span * 1),
        realmRange: [minRealm, Math.min(maxRealm, minRealm + 1)],
        elementAffinities: dominantElements,
        monsterRanks: [`m_${Math.min(4, Math.floor(minRealm / 3))}_1`],
        monsterSprites: [1, 2],
        flyingMonsterSprites: [1],
        herbTiers: [Math.min(7, Math.max(1, Math.floor(minRealm / 3) + 1))],
        oreTiers: [Math.min(5, Math.max(1, Math.floor(minRealm / 3) + 1))],
        densityDistance: 320
      },
      {
        id: `${def.canonicalKey || def.id}_z2`,
        name: `${def.name} Ngoại Vi`,
        x0: Math.round(fieldLeft + span * 1),
        x1: Math.round(fieldLeft + span * 2),
        realmRange: [Math.min(maxRealm, minRealm + 1), Math.min(maxRealm, minRealm + 2)],
        elementAffinities: dominantElements,
        monsterRanks: [`m_${Math.min(4, Math.floor(minRealm / 3))}_2`],
        monsterSprites: [2, 3],
        flyingMonsterSprites: [1, 2],
        herbTiers: [Math.min(7, Math.max(1, Math.floor(minRealm / 3) + 1))],
        oreTiers: [Math.min(5, Math.max(1, Math.floor(minRealm / 3) + 1))],
        densityDistance: 280
      },
      {
        id: `${def.canonicalKey || def.id}_z3`,
        name: `${def.name} Trung Tâm`,
        x0: Math.round(fieldLeft + span * 2),
        x1: Math.round(fieldLeft + span * 3),
        realmRange: [Math.min(maxRealm, minRealm + 2), maxRealm],
        elementAffinities: dominantElements,
        monsterRanks: [`m_${Math.min(4, Math.floor(maxRealm / 3))}_3`],
        monsterSprites: [3, 4],
        flyingMonsterSprites: [2, 3],
        herbTiers: [Math.min(7, Math.max(1, Math.floor(maxRealm / 3) + 1))],
        oreTiers: [Math.min(5, Math.max(1, Math.floor(maxRealm / 3) + 1))],
        densityDistance: 240
      },
      {
        id: `${def.canonicalKey || def.id}_z4`,
        name: `${def.name} Thâm Xứ`,
        x0: Math.round(fieldLeft + span * 3),
        x1: fieldRight,
        realmRange: [maxRealm, maxRealm + 1],
        elementAffinities: dominantElements,
        monsterRanks: [`m_${Math.min(4, Math.floor(maxRealm / 3))}_4`],
        monsterSprites: [4, 5],
        flyingMonsterSprites: [3, 4],
        herbTiers: [Math.min(7, Math.max(1, Math.floor(maxRealm / 3) + 1))],
        oreTiers: [Math.min(5, Math.max(1, Math.floor(maxRealm / 3) + 1))],
        densityDistance: 180
      }
    ];
  }

  return Object.freeze({
    id: def.id,
    canonicalKey: def.canonicalKey || def.key || `map_${def.id}`,
    name: def.name,
    sub: def.subName || def.sub || (def.primaryRegionName ? `${def.primaryRegionName} · ${def.continentName}` : 'Toàn Cõi Nhân Giới'),
    minRealm,
    monsterIdxStart: Math.min(12, minRealm),
    icon: `stage_${Math.min(4, Math.floor(minRealm / 3))}`,
    type: def.type,
    uiMode: def.uiMode || (isSafeHub ? UI_MODES.VILLAGE_HUB : UI_MODES.COMBAT_BATTLEFIELD),
    templateId,
    locationNodeId,
    worldPath: Object.freeze({
      continent: def.geography?.continent ?? def.continentName ?? 'Nhân Giới',
      greatRegion: def.geography?.greatRegion ?? def.primaryRegionName ?? 'Đại Vực',
      province: def.geography?.province ?? def.name ?? 'Châu',
      nation: def.geography?.nation ?? def.name ?? 'Quốc',
      commandery: def.geography?.commandery ?? def.name ?? 'Quận',
      city: def.geography?.city ?? def.settlements?.capital ?? `${def.name} Thành`
    }),
    access: Object.freeze({
      minRealmIdx: minRealm,
      requiresQuestId: def.access?.requiresQuestId ?? null,
      requiresFactionId: def.access?.requiresFactionId ?? null
    }),
    isPeaceZone: def.isPeaceZone ?? isSafeHub,
    noRepeat: assets.noRepeat ?? isSafeHub,
    worldWidth: assets.worldWidth,
    worldHeight: assets.worldHeight,
    field: Object.freeze({ ...assets.field }),
    spawn: Object.freeze({ ...assets.spawn }),
    panoramaKey: assets.panoramaKey,
    panoramaAsset: assets.panoramaAsset,
    panoramaSourceWidth: assets.sourceWidth,
    panoramaSourceHeight: assets.sourceHeight,
    useSharedWildernessPanorama: false,
    waypointMode: 'auto_on_visit',
    zones: Object.freeze(zones.map(z => Object.freeze({ ...z }))),
    combatContent: isSafeHub ? null : Object.freeze({
      zones: Object.freeze(zones.map(z => Object.freeze({ ...z }))),
      resourceSpawns: Object.freeze({
        herbIds: Object.freeze(def.resourceProfile?.products || ['herb_1', 'herb_2', 'herb_3']),
        oreTiers: Object.freeze([1, 2, 3, 4, 5])
      })
    }),
    hubContent: def.hubContent ?? (isSafeHub ? Object.freeze({
      essentialBuildings: Object.freeze([]),
      bgmTrack: assets.bgmTrack || 'bgm_village_peace'
    }) : null),
    runtime: Object.freeze({
      chunkWidth: 1024,
      activeChunkRadius: 1,
      objectPooling: true,
      repeatPanorama: assets.repeatPanorama ?? false
    })
  });
}

export const ALL_PLAYABLE_MAPS = Object.freeze(
  MASTER_MAP_DEFINITIONS.map(buildRuntimeMap)
);

export const PLAYABLE_REGIONS = Object.freeze([
  Object.freeze({
    id: 'nam_lang',
    name: 'Nam Lăng Đại Lục',
    desc: 'Runtime catalog duy nhất kết nối toàn cõi Nam Lăng Đại Lục (5 Châu).',
    maps: ALL_PLAYABLE_MAPS
  })
]);

export {
  ZONE_TYPES,
  UI_MODES,
  ELEMENT_TYPES,
  MAJOR_PROVINCES,
  CANONICAL_MAP_KEYS,
  MASTER_MAP_DEFINITIONS,
  getMasterMapById,
  getAllMasterMaps,
  isMapSafeHub,
  getMapUiMode,
  getMapCombatZones
};
