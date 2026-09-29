/**
 * playableMaps.js
 * ONE runtime map catalog for the whole game.
 *
 * Geographic/lore scale lives in namLangWorld.js. Runtime maps are only the
 * locations that actually have a Phaser scene representation. There is no
 * second "region map system" here: every runtime map belongs to the single
 * Nam Lăng runtime catalog.
 *
 * Panorama rules:
 * - Map 0 Thanh Vân Thôn, Map 1 Thanh Vân Ngoại Vi, Map 2 Vạn Mộc Sâm Lâm keep custom panoramas.
 * - Cities / sects / safe hubs never use the shared wilderness panorama.
 * - Normal wilderness/combat maps reuse one shared panorama through TileSprite.
 * - Map IDs 4..13 are retained only for old-save compatibility and are hidden
 *   from the canonical Nam Lăng hierarchy until they are rematerialized there.
 */
import { getMapTemplate } from './mapTemplates.js?v=20260929-single-map-system-v1';
import { STARTER_WORLD_IDS } from './namLangWorld.js?v=20260929-single-map-system-v1';

const DEFAULT_FIELD = Object.freeze({ left: 60, right: 2820, top: 350, bottom: 900 });
const DEFAULT_SPAWN = Object.freeze({ x: 350, y: 620 });

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
    legacyCompatibility: opts.legacyCompatibility === true,
    worldHidden: opts.worldHidden === true,
    legacyOrigin: opts.legacyOrigin ?? null,
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

const STARTER_RUNTIME_MAPS = [
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
  }),
  makeMap(3, 'Huyết Lạc Cấm Địa', 'Cấm địa cấp địa phương (Trúc Cơ+)', 13, 8, 'stage_2', {
    templateId: 'FIELD_DARKLAND_01', locationNodeId: STARTER_WORLD_IDS.map3, worldPath: STARTER_PATH,
    spawn: { x: 350, y: 620 }, waypointMode: 'auto_on_visit',
    zones: [
      { id: 'blood_mist', name: 'Huyết Vụ Hoang Nguyên', x0: 650, x1: 8000, realmRange: [13, 13] },
      { id: 'bones', name: 'Bạch Cốt Lâm', x0: 8000, x1: 16000, realmRange: [14, 14] },
      { id: 'blood_demon', name: 'Huyết Ma Cốc', x0: 16000, x1: 24000, realmRange: [15, 15] },
      { id: 'deep', name: 'Huyết Lạc Thâm Uyên', x0: 24000, x1: 31940, realmRange: [16, 16] }
    ]
  })
];

// These IDs existed before the Nam Lăng hierarchy redesign. They remain valid so
// old saves/admin tools do not break, but they are NOT a second geography tree.
// They have no locationNodeId and are hidden from the canonical world map.
const LEGACY_COMPATIBILITY_MAPS = [
  makeMap(4, 'Thiên Tinh Hải Thành', 'Legacy Compatibility Hub', 14, 12, 'stage_3', {
    templateId: 'HUB_CITY_LARGE_01', isPeaceZone: true, panoramaTemplateMapId: 0,
    legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Vạn Tinh Hải Vực'
  }),
  makeMap(5, 'Ngoại Hải Săn Yêu', 'Legacy Compatibility Field', 17, 12, 'stage_4', {
    templateId: 'FIELD_COAST_01', legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Vạn Tinh Hải Vực'
  }),
  makeMap(6, 'Hư Không Cổ Điện', 'Legacy Compatibility Dungeon', 19, 16, 'stage_5', {
    templateId: 'DUNGEON_RUINS_01', legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Vạn Tinh Hải Vực'
  }),
  makeMap(7, 'Côn Lôn Tiên Lạc', 'Legacy Compatibility Field', 21, 16, 'stage_6', {
    templateId: 'FIELD_IMMORTAL_01', legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Thần Châu Thánh Địa'
  }),
  makeMap(8, 'Thái Hư Kiếm Cốc', 'Legacy Compatibility Field', 23, 18, 'stage_7', {
    templateId: 'FIELD_VALLEY_01', legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Thần Châu Thánh Địa'
  }),
  makeMap(9, 'Hoàng Cực Thần Điện', 'Legacy Compatibility Hub', 24, 18, 'stage_8', {
    templateId: 'HUB_CAPITAL_01', isPeaceZone: true, panoramaTemplateMapId: 0,
    legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Thần Châu Thánh Địa'
  }),
  makeMap(10, 'U Minh Quỷ Quật', 'Legacy Compatibility Dungeon', 25, 20, 'stage_9', {
    templateId: 'DUNGEON_ABYSS_01', legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Man Hoang Cổ Vực'
  }),
  makeMap(11, 'Thần Ma Cổ Chiến Trường', 'Legacy Compatibility Field', 26, 20, 'stage_10', {
    templateId: 'FIELD_BATTLEFIELD_01', legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Man Hoang Cổ Vực'
  }),
  makeMap(12, 'Cửu Trọng Thiên Đạo', 'Legacy Compatibility Field', 27, 20, 'stage_10', {
    templateId: 'FIELD_IMMORTAL_01', legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Thái Hư Tiên Đạo'
  }),
  makeMap(13, 'Phi Thăng Tiên Môn', 'Legacy Compatibility Dungeon', 28, 20, 'stage_11', {
    templateId: 'DUNGEON_SECRET_REALM_01', legacyCompatibility: true, worldHidden: true, legacyOrigin: 'Thái Hư Tiên Đạo'
  })
];

export const ALL_PLAYABLE_MAPS = Object.freeze([
  ...STARTER_RUNTIME_MAPS,
  ...LEGACY_COMPATIBILITY_MAPS
]);

// Compatibility export name retained for old code. It now exposes exactly ONE
// runtime catalog, matching the canonical Nam Lăng world tree.
export const PLAYABLE_REGIONS = Object.freeze([
  Object.freeze({
    id: 'nam_lang',
    name: 'Nam Lăng Đại Lục',
    desc: 'Runtime catalog duy nhất. Geography thật được quản lý bởi namLangWorld.js.',
    maps: ALL_PLAYABLE_MAPS
  })
]);
