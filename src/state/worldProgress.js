/**
 * worldProgress.js
 * Trạng thái khám phá thế giới nhỏ gọn, không lưu từng object của hàng triệu địa danh.
 * Mọi Map ID / World Node ID đều được xác thực bằng worldRegistry duy nhất.
 */
import {
  HUMAN_REALM_ROOT_ID,
  START_MAP_ID,
  findMapById,
  normalizeMapId,
  getWorldNode,
  getWorldNodeForMap,
  getWorldAncestors
} from '../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';

export const WORLD_PROGRESS_SCHEMA = 1;

function sameId(a, b) {
  return String(a) === String(b);
}

function uniqueValidMapIds(values) {
  const out = [];
  const seen = new Set();
  for (const value of values || []) {
    const map = findMapById(value);
    if (!map) continue;
    const id = map.id;
    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(id);
  }
  return out;
}

function uniqueStrings(values) {
  return [...new Set((values || []).filter(v => typeof v === 'string' && v.length > 0))];
}

function uniqueValidNodeIds(values) {
  return uniqueStrings(values).filter(id => !!getWorldNode(id));
}

function containsMapId(values, mapId) {
  return (values || []).some(value => sameId(value, mapId));
}

export function createInitialWorldProgress(currentMapId = START_MAP_ID) {
  const validCurrentMapId = normalizeMapId(currentMapId);
  const state = {
    schemaVersion: WORLD_PROGRESS_SCHEMA,
    discoveredNodeIds: [HUMAN_REALM_ROOT_ID],
    visitedMapIds: [],
    unlockedWaypointMapIds: [],

    completedDungeons: [],
    discoveredSecrets: [],
    regionProgress: {},
    currentLocationNodeId: null
  };
  const holder = { worldProgress: state };
  markMapVisited(holder, START_MAP_ID, { unlockWaypoint: true });
  if (!sameId(validCurrentMapId, START_MAP_ID)) markMapVisited(holder, validCurrentMapId, { unlockWaypoint: true });
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
    discoveredNodeIds: uniqueValidNodeIds([HUMAN_REALM_ROOT_ID, ...(source.discoveredNodeIds || [])]),
    visitedMapIds: uniqueValidMapIds(source.visitedMapIds),
    unlockedWaypointMapIds: uniqueValidMapIds(source.unlockedWaypointMapIds),

    completedDungeons: uniqueStrings(source.completedDungeons),
    discoveredSecrets: uniqueStrings(source.discoveredSecrets),
    regionProgress: source.regionProgress && typeof source.regionProgress === 'object' ? { ...source.regionProgress } : {},
    currentLocationNodeId: currentNodeId
  };

  gameStateLike.worldProgress = normalized;
  markMapVisited(gameStateLike, START_MAP_ID, { unlockWaypoint: true });
  if (!sameId(currentMapId, START_MAP_ID)) markMapVisited(gameStateLike, currentMapId, { unlockWaypoint: true });
  return normalized;
}

export function discoverNode(gameStateLike, nodeId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  if (!nodeId || !getWorldNode(nodeId)) return progress;
  const ids = new Set(progress.discoveredNodeIds || []);
  const ancestors = getWorldAncestors(nodeId, true);
  ancestors.forEach(node => ids.add(node.id));
  ids.add(HUMAN_REALM_ROOT_ID);
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
      discoveredNodeIds: [HUMAN_REALM_ROOT_ID],
      visitedMapIds: [],
      unlockedWaypointMapIds: [],

      completedDungeons: [],
      discoveredSecrets: [],
      regionProgress: {},
      currentLocationNodeId: null
    };
  }

  const progress = gameStateLike.worldProgress;
  const id = map.id;
  progress.visitedMapIds = uniqueValidMapIds([...(progress.visitedMapIds || []), id]);

  const unlockWaypoint = opts.unlockWaypoint ?? (map.waypointMode === 'auto_on_visit');
  if (unlockWaypoint) {
    progress.unlockedWaypointMapIds = uniqueValidMapIds([...(progress.unlockedWaypointMapIds || []), id]);
  }

  const node = getWorldNodeForMap(id)
    || (map.locationNodeId ? getWorldNode(map.locationNodeId) : null)
    || (map.geography?.nodeId ? getWorldNode(map.geography.nodeId) : null);
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
  const id = map.id;
  progress.unlockedWaypointMapIds = uniqueValidMapIds([...(progress.unlockedWaypointMapIds || []), id]);
  markMapVisited(gameStateLike, id, { unlockWaypoint: true });
  return progress;
}

export function hasVisitedMap(gameStateLike, mapId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  const map = findMapById(mapId);
  return !!map && containsMapId(progress.visitedMapIds, map.id);
}

export function hasWaypoint(gameStateLike, mapId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  const map = findMapById(mapId);
  return !!map && containsMapId(progress.unlockedWaypointMapIds, map.id);
}

export function isNodeDiscovered(gameStateLike, nodeId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  return !!getWorldNode(nodeId) && (progress.discoveredNodeIds || []).includes(nodeId);
}
