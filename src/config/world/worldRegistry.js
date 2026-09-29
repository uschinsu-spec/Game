/**
 * worldRegistry.js
 * SINGLE SOURCE OF TRUTH / READ API for the entire map system.
 * Runtime maps + zones + Nam Lăng hierarchy + access + travel + panorama registry all resolve here.
 */
import {
  PLAYABLE_REGIONS,
  ALL_PLAYABLE_MAPS,
  RUNTIME_MAP_IDS,
  SHARED_WILDERNESS_PANORAMA
} from './playableMaps.js?v=20260929-single-map-system-v2';
import { NAM_LANG_WORLD_NODES, NAM_LANG_ROOT_ID, STARTER_WORLD_IDS } from './namLangWorld.js?v=20260929-single-map-system-v2';
import { getTravelRoutesForMap as getRawTravelRoutesForMap, resolveAnchorPoint } from './travelRoutes.js?v=20260929-single-map-system-v2';
import { getMapTemplate, MAP_TEMPLATES, PANORAMA_STANDARD } from './mapTemplates.js?v=20260929-single-map-system-v1';

export const MAP_SYSTEM_VERSION = '20260929-single-map-system-v5';
export const START_MAP_ID = 0;
export const DEFAULT_ZONE_COUNT = 4;

// ES modules imported with different query strings become different in-memory modules.
// Fail fast if a future change loads this registry through more than one URL.
const REGISTRY_SINGLETON_KEY = Symbol.for('linh-son-phi-kiem.worldRegistry.singleton');
const existingRegistryInstance = globalThis[REGISTRY_SINGLETON_KEY];
if (existingRegistryInstance && existingRegistryInstance.url !== import.meta.url) {
  throw new Error(
    `[MAP SYSTEM SINGLETON] worldRegistry đang bị nạp bằng nhiều URL: ${existingRegistryInstance.url} | ${import.meta.url}`
  );
}
if (!existingRegistryInstance) {
  globalThis[REGISTRY_SINGLETON_KEY] = Object.freeze({
    url: import.meta.url,
    version: MAP_SYSTEM_VERSION
  });
}

export {
  PLAYABLE_REGIONS,
  ALL_PLAYABLE_MAPS,
  RUNTIME_MAP_IDS,
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
const zoneCache = new Map();

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

/** Strict lookup for validation/access/travel. Never silently redirects. */
export function findMapById(mapId) {
  return mapById.get(Number(mapId)) || null;
}

/** Safe gameplay lookup. Removed/stale save IDs fall back to Map 0. */
export function getMapById(mapId) {
  return findMapById(mapId) || findMapById(START_MAP_ID);
}

export function normalizeMapId(mapId) {
  return findMapById(mapId)?.id ?? START_MAP_ID;
}

/**
 * Authoritative longitudinal zones for gameplay content.
 * Explicit map zones win. Maps without authored zones receive four deterministic
 * generated bands from their playable field. Enemy/herb/NPC systems must use
 * these helpers instead of hard-coded x thresholds.
 */
export function getMapZones(mapId) {
  const map = findMapById(mapId);
  if (!map) return [];
  if (zoneCache.has(map.id)) return zoneCache.get(map.id);

  const fieldLeft = Number(map.field?.left ?? 60);
  const fieldRight = Number(map.field?.right ?? (Number(map.worldWidth || 2880) - 60));
  const authored = Array.isArray(map.zones) ? map.zones : [];
  let zones;

  if (authored.length > 0) {
    zones = authored
      .map((zone, index) => {
        const previousX1 = index > 0 ? Number(authored[index - 1]?.x1) : fieldLeft;
        const x0 = Number.isFinite(Number(zone.x0)) ? Number(zone.x0) : previousX1;
        const x1 = Number.isFinite(Number(zone.x1)) ? Number(zone.x1) : fieldRight;
        return Object.freeze({
          ...zone,
          zoneNumber: index + 1,
          x0: Math.max(fieldLeft, Math.min(fieldRight, x0)),
          x1: Math.max(fieldLeft, Math.min(fieldRight, x1))
        });
      })
      .filter(zone => zone.x1 > zone.x0)
      .sort((a, b) => a.x0 - b.x0);
  } else {
    const span = Math.max(1, fieldRight - fieldLeft);
    zones = Array.from({ length: DEFAULT_ZONE_COUNT }, (_, index) => {
      const x0 = fieldLeft + span * (index / DEFAULT_ZONE_COUNT);
      const x1 = index === DEFAULT_ZONE_COUNT - 1
        ? fieldRight
        : fieldLeft + span * ((index + 1) / DEFAULT_ZONE_COUNT);
      return Object.freeze({
        id: `zone_${index + 1}`,
        name: `Khu Vực ${index + 1}`,
        zoneNumber: index + 1,
        x0: Math.round(x0),
        x1: Math.round(x1),
        generated: true
      });
    });
  }

  const frozen = Object.freeze(zones);
  zoneCache.set(map.id, frozen);
  return frozen;
}

export function getMapZoneAtX(mapId, x) {
  const zones = getMapZones(mapId);
  if (!zones.length) return null;
  const px = Number(x);
  if (!Number.isFinite(px) || px <= zones[0].x0) return zones[0];

  for (let index = 0; index < zones.length; index++) {
    const zone = zones[index];
    if (px >= zone.x0 && px < zone.x1) return zone;
    const next = zones[index + 1];
    if (next && px >= zone.x1 && px < next.x0) {
      const distanceToCurrent = px - zone.x1;
      const distanceToNext = next.x0 - px;
      return distanceToCurrent <= distanceToNext ? zone : next;
    }
  }
  return zones[zones.length - 1];
}

export function getMapZoneNumberAtX(mapId, x) {
  return Number(getMapZoneAtX(mapId, x)?.zoneNumber || 1);
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
  const map = findMapById(mapId);
  return map?.access || null;
}

export function canEnterMap(mapId, state) {
  const map = findMapById(mapId);
  if (!map) return { ok: false, reason: 'MAP_NOT_FOUND', map: null };
  const access = map.access || {};
  const realmIdx = Number(state?.realmIdx || 0);
  if (realmIdx < Number(access.minRealmIdx || 0)) {
    return { ok: false, reason: 'REALM', requiredRealmIdx: Number(access.minRealmIdx || 0), map };
  }
  return { ok: true, reason: null, map };
}

export function getTravelRoutesForMap(mapId) {
  const sourceMap = findMapById(mapId);
  if (!sourceMap) return [];

  return getRawTravelRoutesForMap(sourceMap.id).flatMap(route => {
    const targetMap = findMapById(route.toMapId);
    if (!targetMap) return [];
    const source = resolveAnchorPoint(route.sourceAnchor, sourceMap, { x: 350, y: 620 });
    const target = resolveAnchorPoint(route.targetSpawn, targetMap, targetMap.spawn || { x: 350, y: 620 });
    return [{
      ...route,
      x: source.x,
      y: source.y,
      targetMapId: targetMap.id,
      targetSpawnX: target.x,
      targetSpawnY: target.y
    }];
  });
}

export function resolvePanoramaMap(mapOrId) {
  let map = typeof mapOrId === 'object' && mapOrId
    ? mapOrId
    : (findMapById(mapOrId) || getMapById(START_MAP_ID));
  const visited = new Set();
  while (map && !map.panoramaAsset && map.panoramaTemplateMapId != null && !visited.has(map.id)) {
    visited.add(map.id);
    map = findMapById(map.panoramaTemplateMapId);
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
