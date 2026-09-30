/**
 * playableMaps.js
 * Bridges the declarative Master Map Manifest (masterMapManifest.js)
 * into the engine runtime map catalog.
 */
import {
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
} from './masterMapManifest.js?v=20260929-master-map-manifest-v1';

export const RUNTIME_MAP_IDS = Object.freeze(MASTER_MAP_DEFINITIONS.map(m => Number(m.id)));

export const SHARED_WILDERNESS_PANORAMA = Object.freeze({
  key: 'map_panorama_wilderness_shared',
  asset: 'environment/map_1_thanh_van_ngoai_vi.png',
  sourceWidth: 3200,
  sourceHeight: 960,
  worldWidth: 32000,
  worldHeight: 960
});

export function buildRuntimeMap(def) {
  if (!def) return null;
  const isSafeHub = def.isPeaceZone === true || def.type === ZONE_TYPES.SAFE_VILLAGE || def.type === ZONE_TYPES.SAFE_CITY || def.type === ZONE_TYPES.SAFE_SECT;
  const templateId = isSafeHub
    ? (def.type === ZONE_TYPES.SAFE_CITY ? 'HUB_CITY_01' : (def.type === ZONE_TYPES.SAFE_SECT ? 'HUB_SECT_01' : 'HUB_VILLAGE_01'))
    : 'FIELD_GRASSLAND_01';

  const isSectHub = def.type === ZONE_TYPES.SAFE_SECT || def.uiMode === UI_MODES.SECT_HUB;
  const isCityHub = def.type === ZONE_TYPES.SAFE_CITY || def.uiMode === UI_MODES.CITY_HUB;

  const defaultBgKey = isSectHub
    ? 'bg_sect_hub'
    : (isCityHub ? 'bg_city_hub' : (isSafeHub ? 'bg_village_hub' : 'map_panorama_wilderness_shared'));

  const defaultBgPath = isSectHub
    ? 'environment/TONG MON.PNG'
    : (isCityHub ? 'environment/THANH THI.PNG' : (isSafeHub ? 'environment/THON TRAN.png' : 'environment/map_1_thanh_van_ngoai_vi.png'));

  const defaultSourceWidth = isSectHub ? 848 : (isCityHub ? 941 : (isSafeHub ? 784 : 3200));
  const defaultSourceHeight = isSectHub ? 1264 : (isCityHub ? 1672 : (isSafeHub ? 1334 : 960));

  const assets = def.assets || {
    bgKey: defaultBgKey,
    bgPath: defaultBgPath,
    panoramaKey: defaultBgKey,
    panoramaAsset: defaultBgPath,
    sourceWidth: defaultSourceWidth,
    sourceHeight: defaultSourceHeight,
    worldWidth: isSafeHub ? 540 : 32000,
    worldHeight: 960,
    field: isSafeHub ? { left: 30, right: 510, top: 200, bottom: 900 } : { left: 60, right: 31940, top: 350, bottom: 900 },
    spawn: isSafeHub ? { x: 270, y: 650 } : { x: 350, y: 620 },
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
        realmRange: [maxRealm, def.bossRealmIdx || (maxRealm + 1)],
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
