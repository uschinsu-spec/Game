/**
 * worldProgress.js
 * Trạng thái khám phá thế giới nhỏ gọn, không lưu từng object của hàng triệu địa danh.
 * Mọi Map ID / World Node ID đều được xác thực bằng worldRegistry duy nhất.
 */
import {
  NAM_LANG_ROOT_ID,
  START_MAP_ID,
  findMapById,
  normalizeMapId,
  getWorldNode,
  getWorldNodeForMap,
  getWorldAncestors
} from '../config/world/worldRegistry.js?v=20260929-single-map-system-v1';

export const WORLD_PROGRESS_SCHEMA = 1;

function uniqueNumbers(values) {
  return [...new Set((values || []).map(Number).filter(Number.isFinite))];
}

function uniqueValidMapIds(values) {
  return uniqueNumbers(values).filter(id => !!findMapById(id));
}

function uniqueStrings(values) {
  return [...new Set((values || []).filter(v => typeof v === 'string' && v.length > 0))];
}

function uniqueValidNodeIds(values) {
  return uniqueStrings(values).filter(id => !!getWorldNode(id));
}

export function createInitialWorldProgress(currentMapId = START_MAP_ID) {
  const validCurrentMapId = normalizeMapId(currentMapId);
  const state = {
    schemaVersion: WORLD_PROGRESS_SCHEMA,
    discoveredNodeIds: [NAM_LANG_ROOT_ID],
    visitedMapIds: [],
    unlockedWaypointMapIds: [],
    defeatedMapBosses: [],
    completedDungeons: [],
    discoveredSecrets: [],
    regionProgress: {},
    currentLocationNodeId: null
  };
  const holder = { worldProgress: state };
  // Luôn giữ điểm hồi hương Map 0 để save cũ không bị mắc kẹt.
  markMapVisited(holder, START_MAP_ID, { unlockWaypoint: true });
  if (validCurrentMapId !== START_MAP_ID) markMapVisited(holder, validCurrentMapId, { unlockWaypoint: true });
  return state;
}

export function ensureWorldProgress(gameStateLike) {
  if (!gameStateLike) return createInitialWorldProgress(START_MAP_ID);

  const currentMapId = normalizeMapId(gameStateLike.currentMapId ?? START_MAP_ID);
  gameStateLike.currentMapId = currentMapId;
  const source = gameStateLike.worldProgress || {};
  const currentNodeId = typeof source.currentLocationNodeId === 'string' && getWorldNode(source.currentLocationNodeId)
    ? source.currentLocationNodeId
    : null;

  const normalized = {
    schemaVersion: WORLD_PROGRESS_SCHEMA,
    discoveredNodeIds: uniqueValidNodeIds(source.discoveredNodeIds),
    visitedMapIds: uniqueValidMapIds(source.visitedMapIds),
    unlockedWaypointMapIds: uniqueValidMapIds(source.unlockedWaypointMapIds),
    defeatedMapBosses: uniqueStrings(source.defeatedMapBosses),
    completedDungeons: uniqueStrings(source.completedDungeons),
    discoveredSecrets: uniqueStrings(source.discoveredSecrets),
    regionProgress: source.regionProgress && typeof source.regionProgress === 'object' ? { ...source.regionProgress } : {},
    currentLocationNodeId: currentNodeId
  };

  gameStateLike.worldProgress = normalized;
  markMapVisited(gameStateLike, START_MAP_ID, { unlockWaypoint: true });
  if (currentMapId !== START_MAP_ID) markMapVisited(gameStateLike, currentMapId, { unlockWaypoint: true });
  return normalized;
}

export function discoverNode(gameStateLike, nodeId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  if (!nodeId || !getWorldNode(nodeId)) return progress;
  const ids = new Set(progress.discoveredNodeIds || []);
  const ancestors = getWorldAncestors(nodeId, true);
  ancestors.forEach(node => ids.add(node.id));
  ids.add(NAM_LANG_ROOT_ID);
  progress.discoveredNodeIds = uniqueValidNodeIds([...ids]);
  return progress;
}

export function markMapVisited(gameStateLike, mapId, opts = {}) {
  if (!gameStateLike) return null;
  const map = findMapById(mapId);
  if (!map) return gameStateLike.worldProgress || null;

  if (!gameStateLike.worldProgress) {
    gameStateLike.worldProgress = {
      schemaVersion: WORLD_PROGRESS_SCHEMA,
      discoveredNodeIds: [NAM_LANG_ROOT_ID],
      visitedMapIds: [],
      unlockedWaypointMapIds: [],
      defeatedMapBosses: [],
      completedDungeons: [],
      discoveredSecrets: [],
      regionProgress: {},
      currentLocationNodeId: null
    };
  }

  const progress = gameStateLike.worldProgress;
  const id = Number(map.id);
  progress.visitedMapIds = uniqueValidMapIds([...(progress.visitedMapIds || []), id]);

  const unlockWaypoint = opts.unlockWaypoint ?? (map.waypointMode === 'auto_on_visit');
  if (unlockWaypoint) {
    progress.unlockedWaypointMapIds = uniqueValidMapIds([...(progress.unlockedWaypointMapIds || []), id]);
  }

  const node = getWorldNodeForMap(id);
  if (node) {
    progress.currentLocationNodeId = node.id;
    discoverNode(gameStateLike, node.id);
  }
  return progress;
}

export function unlockWaypoint(gameStateLike, mapId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  const map = findMapById(mapId);
  if (!map) return progress;
  const id = Number(map.id);
  progress.unlockedWaypointMapIds = uniqueValidMapIds([...(progress.unlockedWaypointMapIds || []), id]);
  markMapVisited(gameStateLike, id, { unlockWaypoint: true });
  return progress;
}

export function hasVisitedMap(gameStateLike, mapId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  const map = findMapById(mapId);
  return !!map && (progress.visitedMapIds || []).includes(Number(map.id));
}

export function hasWaypoint(gameStateLike, mapId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  const map = findMapById(mapId);
  return !!map && (progress.unlockedWaypointMapIds || []).includes(Number(map.id));
}

export function isNodeDiscovered(gameStateLike, nodeId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  return !!getWorldNode(nodeId) && (progress.discoveredNodeIds || []).includes(nodeId);
}
