/**
 * playableMaps.js
 * THE ONLY runtime map catalog for the whole game.
 *
 * Geographic/lore scale lives in namLangWorld.js. Runtime maps are only the
 * locations that actually have a scene representation. There is no legacy,
 * parallel or compatibility runtime catalog.
 *
 * Current runtime contract is intentionally strict:
 * - Map 0: Thanh Vân Thôn
 * - Map 1: Thanh Vân Ngoại Vi
 * - Map 2: Vạn Mộc Sâm Lâm
 *
 * New locations in the 9 Đại Vực / 108 Châu hierarchy stay as world data until
 * they are deliberately materialized into this single catalog.
 */
import { getMapTemplate } from './mapTemplates.js?v=20260929-single-map-system-v1';
import { STARTER_WORLD_IDS } from './namLangWorld.js?v=20260929-single-map-system-v1';

const DEFAULT_FIELD = Object.freeze({ left: 60, right: 2820, top: 350, bottom: 900 });
const DEFAULT_SPAWN = Object.freeze({ x: 350, y: 620 });

export const RUNTIME_MAP_IDS = Object.freeze([0, 1, 2]);

// Kept as a reusable asset definition for future maps. It is not a second map
// system and does not create a runtime map by itself.
export const SHARED_WILDERNESS_PANORAMA = Object.freeze({
  key: 'map_panorama_wilderness_shared',
  asset: 'environment/map_shared_wilderness_panorama.png',
  sourceWidth: 3200,
  sourceHeight: 960,
  worldWidth: 32000,
  worldHeight: 960
});

function makeMap(id, name, sub, minRealm, monsterIdxStart, icon, opts = {}) {
  const templateId = opts.templateId || 'FIELD_GRASSLAND_01';
  const template = getMapTemplate(templateId);
  const isSafeHub = template.type === 'hub' || opts.isPeaceZone === true;
  const hasCustomPanorama = opts.panoramaAsset != null || opts.panoramaTemplateMapId != null;
  const useSharedWildernessPanorama = opts.useSharedWildernessPanorama ?? (!isSafeHub && !hasCustomPanorama);
  const noRepeat = opts.noRepeat ?? (useSharedWildernessPanorama ? false : template.type === 'hub');

  const worldWidth = opts.worldWidth ?? (useSharedWildernessPanorama
    ? SHARED_WILDERNESS_PANORAMA.worldWidth
    : (template.worldWidth ?? 2880));
  const worldHeight = opts.worldHeight ?? (useSharedWildernessPanorama
    ? SHARED_WILDERNESS_PANORAMA.worldHeight
    : (template.worldHeight ?? 960));

  const field = {
    ...DEFAULT_FIELD,
    right: worldWidth - 60,
    bottom: Math.min(900, worldHeight - 60),
    ...(opts.field || {})
  };
  const access = Object.freeze({
    minRealmIdx: opts.access?.minRealmIdx ?? minRealm ?? 0,
    requiresQuestId: opts.access?.requiresQuestId ?? null,
    requiresFactionId: opts.access?.requiresFactionId ?? null
  });

  return Object.freeze({
    id, name, sub,
    minRealm: access.minRealmIdx,
    monsterIdxStart,
    icon,
    templateId,
    locationNodeId: opts.locationNodeId ?? null,
    worldPath: opts.worldPath ?? null,
    access,
    isPeaceZone: opts.isPeaceZone ?? false,
    noRepeat,
    worldWidth,
    worldHeight,
    field: Object.freeze(field),
    spawn: Object.freeze({ ...DEFAULT_SPAWN, ...(opts.spawn || {}) }),
    panoramaKey: useSharedWildernessPanorama
      ? SHARED_WILDERNESS_PANORAMA.key
      : (opts.panoramaKey || `map_panorama_${id}`),
    panoramaAsset: useSharedWildernessPanorama
      ? SHARED_WILDERNESS_PANORAMA.asset
      : (opts.panoramaAsset ?? null),
    panoramaSourceWidth: useSharedWildernessPanorama
      ? SHARED_WILDERNESS_PANORAMA.sourceWidth
      : (opts.panoramaSourceWidth ?? 3200),
    panoramaSourceHeight: useSharedWildernessPanorama
      ? SHARED_WILDERNESS_PANORAMA.sourceHeight
      : (opts.panoramaSourceHeight ?? 960),
    panoramaTemplateMapId: useSharedWildernessPanorama ? null : (opts.panoramaTemplateMapId ?? null),
    useSharedWildernessPanorama,
    waypointMode: opts.waypointMode || 'auto_on_visit',
    zones: Object.freeze((opts.zones || []).map(zone => Object.freeze({ ...zone }))),
    runtime: Object.freeze({
      chunkWidth: opts.chunkWidth ?? template.runtime?.chunkWidth ?? 1024,
      activeChunkRadius: opts.activeChunkRadius ?? template.runtime?.activeChunkRadius ?? 1,
      objectPooling: opts.objectPooling ?? template.runtime?.objectPooling ?? true,
      repeatPanorama: !noRepeat && (useSharedWildernessPanorama || template.visual?.repeatPanorama === true)
    })
  });
}

const STARTER_PATH = Object.freeze({
  continent: 'Nam Lăng Đại Lục',
  greatRegion: 'Thanh Linh Vực',
  province: 'Thanh Châu',
  nation: 'Đại Ly Quốc',
  commandery: 'Nam Sơn Quận',
  city: 'Thanh Hà Thành Vực'
});

export const ALL_PLAYABLE_MAPS = Object.freeze([
  makeMap(0, 'Thanh Vân Thôn', 'Thôn Khởi Nguyên & Khu An Toàn', 0, 0, 'stage_0', {
    templateId: 'HUB_VILLAGE_01', locationNodeId: STARTER_WORLD_IDS.map0, worldPath: STARTER_PATH,
    isPeaceZone: true, noRepeat: true, worldWidth: 540, worldHeight: 960,
    field: { left: 90, right: 450, top: 180, bottom: 890 },
    panoramaKey: 'map_panorama_0', panoramaAsset: 'environment/map_0_thanh_van_thon.png',
    panoramaSourceWidth: 784, panoramaSourceHeight: 1334,
    spawn: { x: 270, y: 840 }, waypointMode: 'auto_on_visit'
  }),
  makeMap(1, 'Thanh Vân Ngoại Vi', 'Bãi săn yêu quanh Thanh Vân Thôn', 0, 0, 'stage_0', {
    templateId: 'FIELD_GRASSLAND_01', locationNodeId: STARTER_WORLD_IDS.map1, worldPath: STARTER_PATH,
    worldWidth: 32000, worldHeight: 960,
    field: { left: 60, right: 31940, top: 350, bottom: 900 },
    panoramaKey: 'map_panorama_1', panoramaAsset: 'environment/map_1_thanh_van_ngoai_vi.png',
    panoramaSourceWidth: 3200, panoramaSourceHeight: 960,
    spawn: { x: 350, y: 620 }, waypointMode: 'auto_on_visit',
    zones: [
      { id: 'plain', name: 'Thanh Vân Bình Nguyên', x0: 650, x1: 4000, realmRange: [0, 1] },
      { id: 'wolf_mountain', name: 'Thanh Lang Sơn', x0: 4200, x1: 12000, realmRange: [1, 1] },
      { id: 'black_stone', name: 'Hắc Thạch Cốc', x0: 12200, x1: 22000, realmRange: [2, 2] },
      { id: 'ancient_road', name: 'Vạn Mộc Cổ Đạo', x0: 22200, x1: 31940, realmRange: [3, 3] }
    ]
  }),
  makeMap(2, 'Vạn Mộc Sâm Lâm', 'Cổ Mộc Thâm Xứ (Luyện Khí Tầng 3+)', 3, 4, 'stage_1', {
    templateId: 'FIELD_ANCIENT_FOREST_01', locationNodeId: STARTER_WORLD_IDS.map2, worldPath: STARTER_PATH,
    worldWidth: 32000, worldHeight: 960,
    field: { left: 60, right: 31940, top: 350, bottom: 900 },
    panoramaKey: 'map_panorama_2', panoramaAsset: 'environment/map_2_van_moc_sam_lam.png',
    panoramaSourceWidth: 2880, panoramaSourceHeight: 960,
    spawn: { x: 350, y: 620 }, waypointMode: 'auto_on_visit',
    zones: [
      { id: 'outer', name: 'Vạn Mộc Ngoại Lâm', x0: 650, x1: 8000, realmRange: [3, 5] },
      { id: 'jade_leaf', name: 'Bích Diệp Lâm', x0: 8000, x1: 16000, realmRange: [6, 8] },
      { id: 'ancient', name: 'Thiên Niên Cổ Lâm', x0: 16000, x1: 24000, realmRange: [9, 11] },
      { id: 'abyss', name: 'Vạn Mộc Thâm Uyên', x0: 24000, x1: 31940, realmRange: [12, 12] }
    ]
  })
]);

export const PLAYABLE_REGIONS = Object.freeze([
  Object.freeze({
    id: 'nam_lang',
    name: 'Nam Lăng Đại Lục',
    desc: 'Runtime catalog duy nhất; cây địa lý 9 Đại Vực / 108 Châu được quản lý bởi namLangWorld.js.',
    maps: ALL_PLAYABLE_MAPS
  })
]);
