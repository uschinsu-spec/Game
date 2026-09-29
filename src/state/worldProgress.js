/**
 * worldProgress.js
 * Trạng thái khám phá thế giới nhỏ gọn, không lưu từng object của hàng triệu địa danh.
 */
import {
  NAM_LANG_ROOT_ID,
  START_MAP_ID,
  getWorldNodeForMap,
  getWorldAncestors,
  getMapById
} from '../config/world/worldRegistry.js';

export const WORLD_PROGRESS_SCHEMA = 1;

function uniqueNumbers(values) {
  return [...new Set((values || []).map(Number).filter(Number.isFinite))];
}
function uniqueStrings(values) {
  return [...new Set((values || []).filter(v => typeof v === 'string' && v.length > 0))];
}

export function createInitialWorldProgress(currentMapId = START_MAP_ID) {
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
  markMapVisited({ worldProgress: state }, currentMapId, { unlockWaypoint: true });
  return state;
}

export function ensureWorldProgress(gameStateLike) {
  if (!gameStateLike) return createInitialWorldProgress(START_MAP_ID);
  const currentMapId = Number(gameStateLike.currentMapId ?? START_MAP_ID);
  const source = gameStateLike.worldProgress || {};
  const normalized = {
    schemaVersion: WORLD_PROGRESS_SCHEMA,
    discoveredNodeIds: uniqueStrings(source.discoveredNodeIds),
    visitedMapIds: uniqueNumbers(source.visitedMapIds),
    unlockedWaypointMapIds: uniqueNumbers(source.unlockedWaypointMapIds),
    defeatedMapBosses: uniqueStrings(source.defeatedMapBosses),
    completedDungeons: uniqueStrings(source.completedDungeons),
    discoveredSecrets: uniqueStrings(source.discoveredSecrets),
    regionProgress: source.regionProgress && typeof source.regionProgress === 'object' ? { ...source.regionProgress } : {},
    currentLocationNodeId: typeof source.currentLocationNodeId === 'string' ? source.currentLocationNodeId : null
  };
  gameStateLike.worldProgress = normalized;
  markMapVisited(gameStateLike, currentMapId, { unlockWaypoint: true });
  return normalized;
}

export function discoverNode(gameStateLike, nodeId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  if (!nodeId) return progress;
  const ids = new Set(progress.discoveredNodeIds || []);
  const ancestors = getWorldAncestors(nodeId, true);
  ancestors.forEach(node => ids.add(node.id));
  ids.add(NAM_LANG_ROOT_ID);
  progress.discoveredNodeIds = [...ids];
  return progress;
}

export function markMapVisited(gameStateLike, mapId, opts = {}) {
  if (!gameStateLike) return null;
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
  const id = Number(mapId);
  if (Number.isFinite(id)) {
    progress.visitedMapIds = uniqueNumbers([...(progress.visitedMapIds || []), id]);
    const map = getMapById(id);
    const unlockWaypoint = opts.unlockWaypoint ?? (map?.waypointMode === 'auto_on_visit');
    if (unlockWaypoint) progress.unlockedWaypointMapIds = uniqueNumbers([...(progress.unlockedWaypointMapIds || []), id]);
    const node = getWorldNodeForMap(id);
    if (node) {
      progress.currentLocationNodeId = node.id;
      discoverNode(gameStateLike, node.id);
    }
  }
  return progress;
}

export function unlockWaypoint(gameStateLike, mapId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  const id = Number(mapId);
  progress.unlockedWaypointMapIds = uniqueNumbers([...(progress.unlockedWaypointMapIds || []), id]);
  markMapVisited(gameStateLike, id, { unlockWaypoint: true });
  return progress;
}

export function hasVisitedMap(gameStateLike, mapId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  return (progress.visitedMapIds || []).includes(Number(mapId));
}

export function hasWaypoint(gameStateLike, mapId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  return (progress.unlockedWaypointMapIds || []).includes(Number(mapId));
}

export function isNodeDiscovered(gameStateLike, nodeId) {
  const progress = gameStateLike.worldProgress || ensureWorldProgress(gameStateLike);
  return (progress.discoveredNodeIds || []).includes(nodeId);
}
