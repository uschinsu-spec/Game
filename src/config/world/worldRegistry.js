/**
 * worldRegistry.js
 * SINGLE SOURCE OF TRUTH / READ API for the entire map system.
 * Runtime maps + zones + Human Realm hierarchy + access + travel + panorama registry all resolve here.
 * World lore/faction/detail atlases never create runtime maps.
 */
import {
  PLAYABLE_REGIONS,
  ALL_PLAYABLE_MAPS,
  RUNTIME_MAP_IDS,
  SHARED_WILDERNESS_PANORAMA,
  buildRuntimeMap
} from './playableMaps.js?v=20260929-single-map-system-v2';
import { getMasterMapById, findMasterMapById, ZONE_TYPES, UI_MODES } from './masterMapManifest.js?v=20260929-master-map-manifest-v1';
import {
  HUMAN_REALM_ROOT_ID,
  HUMAN_REALM_VERSION,
  HUMAN_REALM_SCALE,
  HUMAN_REALM_CONTINENTS,
  HUMAN_REALM_WORLD_NODES,
  NEW_HUMAN_REALM_CONTINENT_SPECS,
  STARTER_WORLD_IDS,
  NAM_LANG_ROOT_ID,
  NAM_LANG_WORLD_NODES
} from './humanRealmWorld.js?v=20260929-human-realm-v4';
import {
  HUMAN_REALM_DETAIL_VERSION,
  HUMAN_REALM_DETAIL_COUNTS,
  hasHumanRealmDetailBlueprint,
  getHumanRealmDetailProfile,
  getAllHumanRealmDetailProfiles
} from './humanRealmDetailedAtlas.js?v=20260929-human-realm-detail-v1';
import { getTravelRoutesForMap as getRawTravelRoutesForMap, resolveAnchorPoint } from './travelRoutes.js?v=20260929-single-map-system-v2';
import { getMapTemplate, MAP_TEMPLATES, PANORAMA_STANDARD } from './mapTemplates.js?v=20260929-single-map-system-v1';

export const MAP_SYSTEM_VERSION = '20260929-human-realm-detailed-atlas-v5';
export const START_MAP_ID = 0;
export const DEFAULT_ZONE_COUNT = 4;

function slugifyVi(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

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
  HUMAN_REALM_ROOT_ID,
  HUMAN_REALM_VERSION,
  HUMAN_REALM_SCALE,
  HUMAN_REALM_CONTINENTS,
  HUMAN_REALM_WORLD_NODES,
  NEW_HUMAN_REALM_CONTINENT_SPECS,
  HUMAN_REALM_DETAIL_VERSION,
  HUMAN_REALM_DETAIL_COUNTS,
  NAM_LANG_WORLD_NODES,
  NAM_LANG_ROOT_ID,
  STARTER_WORLD_IDS,
  MAP_TEMPLATES,
  PANORAMA_STANDARD,
  getMapTemplate,
  hasHumanRealmDetailBlueprint,
  getHumanRealmDetailProfile,
  getAllHumanRealmDetailProfiles
};

const mapById = new Map(ALL_PLAYABLE_MAPS.map(map => [Number(map.id), map]));
const nodeById = new Map(HUMAN_REALM_WORLD_NODES.map(node => [node.id, node]));
const childrenByParent = new Map();
const zoneCache = new Map();
const enrichedNodeCache = new Map();

for (const node of HUMAN_REALM_WORLD_NODES) {
  const key = node.parentId ?? '__root__';
  if (!childrenByParent.has(key)) childrenByParent.set(key, []);
  childrenByParent.get(key).push(node);
}
const nodeByMapId = new Map(
  HUMAN_REALM_WORLD_NODES
    .filter(node => Number.isInteger(node.playableMapId))
    .map(node => [Number(node.playableMapId), node])
);

function enrichWorldNode(rawNode) {
  if (!rawNode) return null;
  if (enrichedNodeCache.has(rawNode.id)) return enrichedNodeCache.get(rawNode.id);

  let enriched = rawNode;
  const detailedAtlas = getHumanRealmDetailProfile(rawNode.id);
  if (detailedAtlas) {
    enriched = Object.freeze({
      ...enriched,
      detailedAtlasVersion: HUMAN_REALM_DETAIL_VERSION,
      detailedAtlas
    });
  }

  enrichedNodeCache.set(rawNode.id, enriched);
  return enriched;
}

export function findMapById(mapId) {
  if (mapId === null || mapId === undefined) return null;
  const num = Number(mapId);
  if (Number.isInteger(num) && mapById.has(num)) return mapById.get(num);
  if (mapById.has(mapId)) return mapById.get(mapId);

  // Tra cứu theo Master Map Manifest (Territory / Canonical key / Node ID)
  const masterDef = findMasterMapById(mapId);
  if (masterDef) {
    if (mapById.has(masterDef.id)) return mapById.get(masterDef.id);
    if (masterDef.canonicalKey && mapById.has(masterDef.canonicalKey)) return mapById.get(masterDef.canonicalKey);
    const runtimeMap = buildRuntimeMap(masterDef);
    if (runtimeMap) {
      if (runtimeMap.id != null) mapById.set(runtimeMap.id, runtimeMap);
      if (runtimeMap.canonicalKey) mapById.set(runtimeMap.canonicalKey, runtimeMap);
      if (runtimeMap.locationNodeId) mapById.set(runtimeMap.locationNodeId, runtimeMap);
      if (runtimeMap.name) mapById.set(runtimeMap.name, runtimeMap);
      return runtimeMap;
    }
  }

  // Tra cứu theo Node ID trong Human Realm (hoặc kế thừa từ Châu / Đơn vị cấp trên)
  const curr = nodeById.get(mapId);
  if (curr) {
    if (curr.type === 'clan' || curr.type === 'guild') return null;

    if (curr.playableMapId != null) {
      const pMap = mapById.get(Number(curr.playableMapId)) || findMapById(curr.playableMapId);
      if (pMap) return pMap;
    }

    const isSect = curr.type === 'sect' || curr.type === 'peak' || curr.type === 'hall';
    const isCity = curr.type === 'city_territory' || curr.locationKind === 'major_hub';
    const isVillage = curr.locationKind === 'safe_hub' || curr.locationKind === 'town';
    const isHub = isSect || isCity || isVillage;

    let ancestor = curr;
    let parentMaster = null;
    while (ancestor && !parentMaster) {
      parentMaster = findMasterMapById(ancestor.id) || findMasterMapById(ancestor.name);
      ancestor = ancestor.parentId ? nodeById.get(ancestor.parentId) : null;
    }

    const minRealm = curr.enemyProfile?.minRealmIdx ?? parentMaster?.minRealm ?? 0;
    const maxRealm = curr.enemyProfile?.maxRealmIdx ?? parentMaster?.maxRealm ?? (minRealm + 3);

    const zoneType = isSect ? ZONE_TYPES.SAFE_SECT : (isCity ? ZONE_TYPES.SAFE_CITY : (isVillage ? ZONE_TYPES.SAFE_VILLAGE : ZONE_TYPES.COMBAT_WILDERNESS));
    const uiMode = isSect ? UI_MODES.SECT_HUB : (isCity ? UI_MODES.CITY_HUB : (isVillage ? UI_MODES.VILLAGE_HUB : UI_MODES.COMBAT_BATTLEFIELD));

    const runtimeMap = buildRuntimeMap({
      id: curr.id,
      canonicalKey: `map_${slugifyVi(curr.name)}`,
      name: curr.name,
      subName: curr.desc,
      type: zoneType,
      uiMode: uiMode,
      isPeaceZone: isHub,
      realmRange: [minRealm, maxRealm],
      bossRealmIdx: maxRealm + 1,
      geography: { nodeId: curr.id, continent: curr.continentId, province: curr.name }
    });

    if (runtimeMap) {
      mapById.set(curr.id, runtimeMap);
      return runtimeMap;
    }
  }

  return null;
}

export function getMapById(mapId) {
  return findMapById(mapId) || findMapById(START_MAP_ID);
}

export function normalizeMapId(mapId) {
  return findMapById(mapId)?.id ?? START_MAP_ID;
}

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
  return enrichWorldNode(nodeById.get(nodeId) || null);
}

export function getWorldChildren(parentId) {
  return (childrenByParent.get(parentId ?? '__root__') || []).map(enrichWorldNode);
}

export function getAllWorldNodes() {
  return HUMAN_REALM_WORLD_NODES.map(enrichWorldNode);
}

export function getWorldDetailProfile(nodeId) {
  return getHumanRealmDetailProfile(nodeId);
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
  return enrichWorldNode(nodeByMapId.get(Number(mapId)) || null);
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
