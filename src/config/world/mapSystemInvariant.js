/**
 * mapSystemInvariant.js
 * Runtime + data integrity guard for the ONE authoritative map system.
 *
 * Fails fast during boot if a future change reintroduces another runtime catalog,
 * another world root, removed Map 3-13, conflicting map owners, invalid travel,
 * or a Nam Lăng hierarchy different from 9 Đại Vực / 108 Châu.
 */
import {
  ALL_PLAYABLE_MAPS,
  MAP_SYSTEM_VERSION,
  MAP_TEMPLATES,
  NAM_LANG_ROOT_ID,
  NAM_LANG_WORLD_NODES,
  PLAYABLE_REGIONS,
  RUNTIME_MAP_IDS,
  SHARED_WILDERNESS_PANORAMA,
  getMapZones,
  getWorldChildren,
  getWorldNode
} from './worldRegistry.js?v=20260929-single-map-system-v1';
import { TRAVEL_ROUTES } from './travelRoutes.js?v=20260929-single-map-system-v2';

const EXPECTED_RUNTIME_OWNER = 'WorldMapRuntime';
const EXPECTED_UI_OWNER = 'WorldMapHierarchyUI';
const EXPECTED_CONTENT_ZONE_OWNER = 'MapContentZoneRuntime';
const EXPECTED_STREAMING_OWNER = 'MapZoneAssetStreaming';
const EXPECTED_MAP_IDS = Object.freeze([0, 1, 2]);
const EXPECTED_ACTIVE_FUNCTIONS = Object.freeze({
  switchMap: 'switchMapFromRegistry',
  createWorld: 'createWorldFromRegistry',
  createMapPortals: 'createMapPortalsFromRegistry',
  openMapPanel: 'openHierarchicalWorldMap',
  initBattlefield: 'streamedInitBattlefield',
  getEnemySpawnConfig: 'getEnemySpawnConfigFromUnifiedMap',
  initHerbs: 'streamedInitHerbs',
  initMineralNodes: 'initMineralNodesFromUnifiedZones',
  getNpcSpawnConfig: 'getNpcSpawnConfigFromUnifiedZones'
});

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates];
}

function pushDuplicates(errors, label, values) {
  const duplicates = duplicateValues(values);
  if (duplicates.length) errors.push(`${label} bị trùng: ${duplicates.join(', ')}`);
}

function sameNumberList(a, b) {
  return a.length === b.length && a.every((value, index) => Number(value) === Number(b[index]));
}

function assertActiveFunctions(errors, proto) {
  for (const [method, expectedName] of Object.entries(EXPECTED_ACTIVE_FUNCTIONS)) {
    const fn = proto?.[method];
    if (typeof fn !== 'function') {
      errors.push(`Thiếu active method ${method}().`);
      continue;
    }
    if (fn.name !== expectedName) {
      errors.push(`${method}() đang bị override bởi ${fn.name || '<anonymous>'}; phải là ${expectedName}.`);
    }
  }
}

export function assertSingleMapSystem(MainGameScene) {
  const errors = [];
  const proto = MainGameScene?.prototype;

  // 1) Exactly one active runtime owner + one UI owner + one content-zone owner + one streaming owner.
  if (!proto) {
    errors.push('Không tìm thấy MainGameScene.prototype.');
  } else {
    if (proto.__mapRuntimeOwner !== EXPECTED_RUNTIME_OWNER) {
      errors.push(`Map runtime owner phải là ${EXPECTED_RUNTIME_OWNER}, hiện tại: ${String(proto.__mapRuntimeOwner)}`);
    }
    if (proto.__worldMapUiOwner !== EXPECTED_UI_OWNER) {
      errors.push(`World-map UI owner phải là ${EXPECTED_UI_OWNER}, hiện tại: ${String(proto.__worldMapUiOwner)}`);
    }
    if (proto.__mapContentZoneOwner !== EXPECTED_CONTENT_ZONE_OWNER) {
      errors.push(`Map content-zone owner phải là ${EXPECTED_CONTENT_ZONE_OWNER}, hiện tại: ${String(proto.__mapContentZoneOwner)}`);
    }
    if (proto.__mapZoneAssetStreamingOwner !== EXPECTED_STREAMING_OWNER) {
      errors.push(`Map zone-streaming owner phải là ${EXPECTED_STREAMING_OWNER}, hiện tại: ${String(proto.__mapZoneAssetStreamingOwner)}`);
    }
    assertActiveFunctions(errors, proto);
  }

  // 2) Exactly ONE runtime catalog and exactly Map IDs 0,1,2.
  if (PLAYABLE_REGIONS.length !== 1 || PLAYABLE_REGIONS[0]?.id !== 'nam_lang') {
    errors.push(`Runtime catalog phải chỉ có 1 root nam_lang; hiện có ${PLAYABLE_REGIONS.length}.`);
  }
  if (PLAYABLE_REGIONS[0]?.maps !== ALL_PLAYABLE_MAPS) {
    errors.push('PLAYABLE_REGIONS[0].maps phải dùng trực tiếp ALL_PLAYABLE_MAPS, không được tạo catalog song song.');
  }
  if (!sameNumberList(RUNTIME_MAP_IDS, EXPECTED_MAP_IDS)) {
    errors.push(`RUNTIME_MAP_IDS phải chính xác là [0,1,2], hiện tại: [${RUNTIME_MAP_IDS.join(',')}].`);
  }

  const mapIds = ALL_PLAYABLE_MAPS.map(map => Number(map.id));
  pushDuplicates(errors, 'Map ID', mapIds);
  if (!sameNumberList(mapIds, EXPECTED_MAP_IDS)) {
    errors.push(`ALL_PLAYABLE_MAPS phải chỉ có [0,1,2], hiện tại: [${mapIds.join(',')}].`);
  }

  const mapById = new Map(ALL_PLAYABLE_MAPS.map(map => [Number(map.id), map]));
  for (const map of ALL_PLAYABLE_MAPS) {
    if (!Number.isInteger(Number(map.id))) errors.push(`Map có ID không hợp lệ: ${String(map.id)}`);
    if (!map.name) errors.push(`Map ${map.id} thiếu name.`);
    if (!MAP_TEMPLATES[map.templateId]) errors.push(`Map ${map.id} dùng template không tồn tại: ${String(map.templateId)}`);
    if (!(Number(map.worldWidth) > 0) || !(Number(map.worldHeight) > 0)) {
      errors.push(`Map ${map.id} có kích thước world không hợp lệ.`);
    }
    if (!map.locationNodeId) {
      errors.push(`Map ${map.id} bắt buộc phải có canonical locationNodeId.`);
    } else if (!getWorldNode(map.locationNodeId)) {
      errors.push(`Map ${map.id} trỏ locationNodeId không tồn tại: ${map.locationNodeId}`);
    }

    // Compatibility/hidden runtime maps are forbidden. Removed IDs must stay removed.
    for (const forbiddenField of ['legacyCompatibility', 'worldHidden', 'legacyOrigin']) {
      if (forbiddenField in map) {
        errors.push(`Map ${map.id} còn field legacy "${forbiddenField}"; hệ thống hiện không cho phép runtime compatibility map.`);
      }
    }

    const template = MAP_TEMPLATES[map.templateId];
    const isSafeHub = map.isPeaceZone === true || template?.type === 'hub';
    if (isSafeHub && map.useSharedWildernessPanorama) {
      errors.push(`Safe hub map ${map.id} không được dùng shared wilderness panorama.`);
    }
    if (EXPECTED_MAP_IDS.includes(Number(map.id)) && map.useSharedWildernessPanorama) {
      errors.push(`Map ${map.id} phải giữ panorama riêng, không được dùng shared wilderness panorama.`);
    }
    if (map.useSharedWildernessPanorama) {
      if (map.panoramaKey !== SHARED_WILDERNESS_PANORAMA.key || map.panoramaAsset !== SHARED_WILDERNESS_PANORAMA.asset) {
        errors.push(`Map ${map.id} khai báo shared panorama nhưng key/asset không khớp registry chung.`);
      }
    }

    const zones = getMapZones(map.id);
    if (!map.isPeaceZone && zones.length === 0) errors.push(`Map ${map.id} không có zone geometry.`);
    let previousX1 = null;
    for (const zone of zones) {
      if (!(Number(zone.x1) > Number(zone.x0))) {
        errors.push(`Map ${map.id} zone ${zone.id || zone.zoneNumber} có x0/x1 không hợp lệ.`);
      }
      if (previousX1 != null && Number(zone.x0) < previousX1) {
        errors.push(`Map ${map.id} có zone geometry chồng lấn tại ${zone.id || zone.zoneNumber}.`);
      }
      previousX1 = Number(zone.x1);
    }
  }

  // 3) Exactly ONE Nam Lăng hierarchy: one root, 9 Đại Vực, 108 Châu.
  const nodeIds = NAM_LANG_WORLD_NODES.map(node => node.id);
  pushDuplicates(errors, 'World node ID', nodeIds);
  const nodeIdSet = new Set(nodeIds);
  const worldRoots = NAM_LANG_WORLD_NODES.filter(node => node.parentId == null);
  if (worldRoots.length !== 1 || worldRoots[0]?.id !== NAM_LANG_ROOT_ID) {
    errors.push(`World hierarchy phải có đúng 1 root ${NAM_LANG_ROOT_ID}; hiện có ${worldRoots.map(node => node.id).join(', ') || '0 root'}.`);
  }
  for (const node of NAM_LANG_WORLD_NODES) {
    if (node.id !== NAM_LANG_ROOT_ID && !String(node.id).startsWith(`${NAM_LANG_ROOT_ID}.`)) {
      errors.push(`World node ngoài Nam Lăng bị cấm: ${node.id}.`);
    }
  }

  const greatRegions = NAM_LANG_WORLD_NODES.filter(node => node.type === 'great_region');
  const provinces = NAM_LANG_WORLD_NODES.filter(node => node.type === 'province');
  const rootChildren = getWorldChildren(NAM_LANG_ROOT_ID).filter(node => node.type === 'great_region');
  if (greatRegions.length !== 9 || rootChildren.length !== 9) {
    errors.push(`Nam Lăng phải có đúng 9 Đại Vực, hiện có ${greatRegions.length} (${rootChildren.length} node trực tiếp).`);
  }
  if (provinces.length !== 108) errors.push(`Nam Lăng phải có đúng 108 Châu, hiện có ${provinces.length}.`);
  for (const region of greatRegions) {
    const provinceChildren = getWorldChildren(region.id).filter(node => node.type === 'province');
    if (provinceChildren.length !== 12) {
      errors.push(`${region.name} phải có đúng 12 Châu, hiện có ${provinceChildren.length}.`);
    }
  }

  const playableNodes = NAM_LANG_WORLD_NODES.filter(node => node.playableMapId != null);
  const playableNodeMapIds = playableNodes.map(node => Number(node.playableMapId));
  pushDuplicates(errors, 'playableMapId của world node', playableNodeMapIds);
  if (!sameNumberList([...playableNodeMapIds].sort((a, b) => a - b), EXPECTED_MAP_IDS)) {
    errors.push(`World node playable phải chỉ trỏ [0,1,2], hiện tại: [${playableNodeMapIds.join(',')}].`);
  }

  for (const node of NAM_LANG_WORLD_NODES) {
    if (node.parentId && !nodeIdSet.has(node.parentId)) {
      errors.push(`World node ${node.id} có parent không tồn tại: ${node.parentId}`);
    }
    if (node.playableMapId != null) {
      const map = mapById.get(Number(node.playableMapId));
      if (!map) {
        errors.push(`World node ${node.id} trỏ playableMapId không tồn tại: ${node.playableMapId}`);
      } else if (map.locationNodeId !== node.id) {
        errors.push(`Liên kết map/node không đối xứng: map ${map.id} -> ${map.locationNodeId}, node ${node.id} -> ${node.playableMapId}`);
      }
    }
  }

  const linkedLocationIds = ALL_PLAYABLE_MAPS.map(map => map.locationNodeId);
  pushDuplicates(errors, 'locationNodeId của playable map', linkedLocationIds);
  for (const map of ALL_PLAYABLE_MAPS) {
    const node = getWorldNode(map.locationNodeId);
    if (node && Number(node.playableMapId) !== Number(map.id)) {
      errors.push(`Map ${map.id} -> ${map.locationNodeId} nhưng world node không trỏ ngược đúng map.`);
    }
  }

  // 4) Travel graph may only connect the three canonical runtime maps.
  pushDuplicates(errors, 'Travel route ID', TRAVEL_ROUTES.map(route => route.id));
  for (const route of TRAVEL_ROUTES) {
    const source = mapById.get(Number(route.fromMapId));
    const target = mapById.get(Number(route.toMapId));
    if (!source) errors.push(`Route ${route.id} có fromMapId không tồn tại: ${route.fromMapId}`);
    if (!target) errors.push(`Route ${route.id} có toMapId không tồn tại: ${route.toMapId}`);
    if (!EXPECTED_MAP_IDS.includes(Number(route.fromMapId)) || !EXPECTED_MAP_IDS.includes(Number(route.toMapId))) {
      errors.push(`Route ${route.id} tham chiếu map ngoài [0,1,2].`);
    }
    if ('minRealm' in route || 'minRealmIdx' in route || 'requiresQuestId' in route || 'requiresFactionId' in route) {
      errors.push(`Route ${route.id} đang chứa access rule riêng; phải lấy access từ destination map.`);
    }
  }

  // 5) A panorama key may be reused only when it resolves to the exact same asset.
  const panoramaAssetByKey = new Map();
  for (const map of ALL_PLAYABLE_MAPS) {
    if (!map.panoramaKey || !map.panoramaAsset) continue;
    const previous = panoramaAssetByKey.get(map.panoramaKey);
    if (previous && previous !== map.panoramaAsset) {
      errors.push(`Panorama key ${map.panoramaKey} trỏ nhiều asset: ${previous} | ${map.panoramaAsset}`);
    } else {
      panoramaAssetByKey.set(map.panoramaKey, map.panoramaAsset);
    }
  }

  if (errors.length) {
    throw new Error(`[MAP SYSTEM INVARIANT] Phát hiện ${errors.length} lỗi:\n- ${errors.join('\n- ')}`);
  }

  return Object.freeze({
    ok: true,
    version: MAP_SYSTEM_VERSION,
    runtimeOwner: EXPECTED_RUNTIME_OWNER,
    uiOwner: EXPECTED_UI_OWNER,
    contentZoneOwner: EXPECTED_CONTENT_ZONE_OWNER,
    streamingOwner: EXPECTED_STREAMING_OWNER,
    runtimeCatalogCount: PLAYABLE_REGIONS.length,
    playableMapIds: Object.freeze([...mapIds]),
    playableMapCount: ALL_PLAYABLE_MAPS.length,
    worldRootCount: worldRoots.length,
    worldNodeCount: NAM_LANG_WORLD_NODES.length,
    greatRegionCount: greatRegions.length,
    provinceCount: provinces.length,
    playableWorldNodeCount: playableNodes.length,
    travelRouteCount: TRAVEL_ROUTES.length
  });
}
