/**
 * mapSystemInvariant.js
 * Runtime + data integrity guard for the ONE authoritative map system.
 *
 * This intentionally fails fast during boot if a future change reintroduces
 * a second map runtime/UI owner or creates conflicting world data.
 */
import {
  ALL_PLAYABLE_MAPS,
  MAP_TEMPLATES,
  NAM_LANG_WORLD_NODES,
  getWorldNode
} from './worldRegistry.js?v=20260929-single-map-system-v1';
import { TRAVEL_ROUTES } from './travelRoutes.js?v=20260929-single-map-system-v1';

const EXPECTED_RUNTIME_OWNER = 'WorldMapRuntime';
const EXPECTED_UI_OWNER = 'WorldMapHierarchyUI';

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

export function assertSingleMapSystem(MainGameScene) {
  const errors = [];
  const proto = MainGameScene?.prototype;

  // 1) Exactly one active runtime owner + one active world-map UI owner.
  if (!proto) {
    errors.push('Không tìm thấy MainGameScene.prototype.');
  } else {
    if (proto.__mapRuntimeOwner !== EXPECTED_RUNTIME_OWNER) {
      errors.push(`Map runtime owner phải là ${EXPECTED_RUNTIME_OWNER}, hiện tại: ${String(proto.__mapRuntimeOwner)}`);
    }
    if (proto.__worldMapUiOwner !== EXPECTED_UI_OWNER) {
      errors.push(`World-map UI owner phải là ${EXPECTED_UI_OWNER}, hiện tại: ${String(proto.__worldMapUiOwner)}`);
    }
    if (typeof proto.switchMap !== 'function') errors.push('Thiếu switchMap() từ WorldMapRuntime.');
    if (typeof proto.createWorld !== 'function') errors.push('Thiếu createWorld() từ WorldMapRuntime.');
    if (typeof proto.createMapPortals !== 'function') errors.push('Thiếu createMapPortals() từ WorldMapRuntime.');
    if (typeof proto.openMapPanel !== 'function') errors.push('Thiếu openMapPanel() từ WorldMapHierarchyUI.');
  }

  // 2) Runtime map catalog integrity.
  const mapIds = ALL_PLAYABLE_MAPS.map(map => Number(map.id));
  pushDuplicates(errors, 'Map ID', mapIds);

  const mapById = new Map(ALL_PLAYABLE_MAPS.map(map => [Number(map.id), map]));
  for (const map of ALL_PLAYABLE_MAPS) {
    if (!Number.isInteger(Number(map.id))) errors.push(`Map có ID không hợp lệ: ${String(map.id)}`);
    if (!map.name) errors.push(`Map ${map.id} thiếu name.`);
    if (!MAP_TEMPLATES[map.templateId]) errors.push(`Map ${map.id} dùng template không tồn tại: ${String(map.templateId)}`);
    if (!(Number(map.worldWidth) > 0) || !(Number(map.worldHeight) > 0)) {
      errors.push(`Map ${map.id} có kích thước world không hợp lệ.`);
    }
    if (map.locationNodeId && !getWorldNode(map.locationNodeId)) {
      errors.push(`Map ${map.id} trỏ locationNodeId không tồn tại: ${map.locationNodeId}`);
    }
  }

  // 3) Hierarchy integrity and reciprocal playable-map links.
  const nodeIds = NAM_LANG_WORLD_NODES.map(node => node.id);
  pushDuplicates(errors, 'World node ID', nodeIds);
  const nodeIdSet = new Set(nodeIds);

  for (const node of NAM_LANG_WORLD_NODES) {
    if (node.parentId && !nodeIdSet.has(node.parentId)) {
      errors.push(`World node ${node.id} có parent không tồn tại: ${node.parentId}`);
    }
    if (node.playableMapId != null) {
      const map = mapById.get(Number(node.playableMapId));
      if (!map) {
        errors.push(`World node ${node.id} trỏ playableMapId không tồn tại: ${node.playableMapId}`);
      } else if (map.locationNodeId && map.locationNodeId !== node.id) {
        errors.push(`Liên kết map/node không đối xứng: map ${map.id} -> ${map.locationNodeId}, node ${node.id} -> ${node.playableMapId}`);
      }
    }
  }

  const linkedLocationIds = ALL_PLAYABLE_MAPS
    .filter(map => map.locationNodeId)
    .map(map => map.locationNodeId);
  pushDuplicates(errors, 'locationNodeId của playable map', linkedLocationIds);

  // 4) Travel graph integrity. Access requirements live on destination maps,
  // not duplicated inside routes.
  pushDuplicates(errors, 'Travel route ID', TRAVEL_ROUTES.map(route => route.id));
  for (const route of TRAVEL_ROUTES) {
    if (!mapById.has(Number(route.fromMapId))) {
      errors.push(`Route ${route.id} có fromMapId không tồn tại: ${route.fromMapId}`);
    }
    if (!mapById.has(Number(route.toMapId))) {
      errors.push(`Route ${route.id} có toMapId không tồn tại: ${route.toMapId}`);
    }
    if ('minRealm' in route || 'minRealmIdx' in route || 'requiresQuestId' in route || 'requiresFactionId' in route) {
      errors.push(`Route ${route.id} đang chứa access rule riêng; phải lấy access từ destination map.`);
    }
  }

  // 5) A panorama key may be reused only when it resolves to the same asset.
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
    runtimeOwner: EXPECTED_RUNTIME_OWNER,
    uiOwner: EXPECTED_UI_OWNER,
    playableMapCount: ALL_PLAYABLE_MAPS.length,
    worldNodeCount: NAM_LANG_WORLD_NODES.length,
    travelRouteCount: TRAVEL_ROUTES.length
  });
}
