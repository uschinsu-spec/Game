/**
 * worldRegistry.js
 * SINGLE SOURCE OF TRUTH / READ API for the entire map system.
 * Runtime maps + Nam Lăng hierarchy + access + travel + panorama registry all resolve here.
 */
import {
  PLAYABLE_REGIONS,
  ALL_PLAYABLE_MAPS,
  SHARED_WILDERNESS_PANORAMA
} from './playableMaps.js?v=20260929-single-map-system-v1';
import { NAM_LANG_WORLD_NODES, NAM_LANG_ROOT_ID, STARTER_WORLD_IDS } from './namLangWorld.js?v=20260929-single-map-system-v1';
import { getTravelRoutesForMap as getRawTravelRoutesForMap, resolveAnchorPoint } from './travelRoutes.js?v=20260929-single-map-system-v1';
import { getMapTemplate, MAP_TEMPLATES, PANORAMA_STANDARD } from './mapTemplates.js?v=20260929-single-map-system-v1';

export const START_MAP_ID = 0;
export {
  PLAYABLE_REGIONS,
  ALL_PLAYABLE_MAPS,
  SHARED_WILDERNESS_PANORAMA,
  NAM_LANG_WORLD_NODES,
  NAM_LANG_ROOT_ID,
  STARTER_WORLD_IDS,
  MAP_TEMPLATES,
  PANORAMA_STANDARD,
  getMapTemplate
};

const mapById = new Map(ALL_PLAYABLE_MAPS.map(map => [Number(map.id), map]));
const nodeById = new Map(NAM_LANG_WORLD_NODES.map(node => [node.id, node]));
const childrenByParent = new Map();
for (const node of NAM_LANG_WORLD_NODES) {
  const key = node.parentId ?? '__root__';
  if (!childrenByParent.has(key)) childrenByParent.set(key, []);
  childrenByParent.get(key).push(node);
}
const nodeByMapId = new Map(
  NAM_LANG_WORLD_NODES
    .filter(node => Number.isInteger(node.playableMapId))
    .map(node => [Number(node.playableMapId), node])
);

export function getMapById(mapId) {
  return mapById.get(Number(mapId)) || mapById.get(START_MAP_ID);
}

export function getWorldNode(nodeId) {
  return nodeById.get(nodeId) || null;
}

export function getWorldChildren(parentId) {
  return [...(childrenByParent.get(parentId ?? '__root__') || [])];
}

export function getWorldAncestors(nodeId, includeSelf = false) {
  const chain = [];
  let node = getWorldNode(nodeId);
  if (includeSelf && node) chain.push(node);
  while (node?.parentId) {
    node = getWorldNode(node.parentId);
    if (!node) break;
    chain.push(node);
  }
  return chain.reverse();
}

export function getWorldBreadcrumb(nodeId) {
  const node = getWorldNode(nodeId);
  if (!node) return [];
  return [...getWorldAncestors(nodeId, false), node];
}

export function getWorldNodeForMap(mapId) {
  return nodeByMapId.get(Number(mapId)) || null;
}

export function getMapAccess(mapId) {
  return getMapById(mapId)?.access || { minRealmIdx: 0, requiresQuestId: null, requiresFactionId: null };
}

export function canEnterMap(mapId, state) {
  const map = getMapById(mapId);
  if (!map) return { ok: false, reason: 'MAP_NOT_FOUND' };
  const access = map.access || {};
  const realmIdx = Number(state?.realmIdx || 0);
  if (realmIdx < Number(access.minRealmIdx || 0)) {
    return { ok: false, reason: 'REALM', requiredRealmIdx: Number(access.minRealmIdx || 0), map };
  }
  return { ok: true, reason: null, map };
}

export function getTravelRoutesForMap(mapId) {
  const sourceMap = getMapById(mapId);
  return getRawTravelRoutesForMap(mapId).map(route => {
    const targetMap = getMapById(route.toMapId);
    const source = resolveAnchorPoint(route.sourceAnchor, sourceMap, { x: 350, y: 620 });
    const target = resolveAnchorPoint(route.targetSpawn, targetMap, targetMap?.spawn || { x: 350, y: 620 });
    return {
      ...route,
      x: source.x,
      y: source.y,
      targetMapId: route.toMapId,
      targetSpawnX: target.x,
      targetSpawnY: target.y,
      minRealm: Number(targetMap?.access?.minRealmIdx || 0)
    };
  });
}

export function resolvePanoramaMap(mapOrId) {
  let map = typeof mapOrId === 'object' ? mapOrId : getMapById(mapOrId);
  const visited = new Set();
  while (map && !map.panoramaAsset && map.panoramaTemplateMapId != null && !visited.has(map.id)) {
    visited.add(map.id);
    map = getMapById(map.panoramaTemplateMapId);
  }
  return map || getMapById(START_MAP_ID);
}

export function getPanoramaPreloadEntries() {
  const unique = new Map();
  for (const map of ALL_PLAYABLE_MAPS) {
    if (map.panoramaAsset && !unique.has(map.panoramaKey)) unique.set(map.panoramaKey, map.panoramaAsset);
  }
  return [...unique.entries()].map(([key, asset]) => ({ key, asset }));
}
