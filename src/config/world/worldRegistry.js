/**
 * worldRegistry.js
 * SINGLE SOURCE OF TRUTH / READ API for the entire map system.
 * Runtime maps + zones + Human Realm hierarchy + access + travel + panorama registry all resolve here.
 * World lore/faction atlases never create runtime maps.
 */
import {
  PLAYABLE_REGIONS,
  ALL_PLAYABLE_MAPS,
  RUNTIME_MAP_IDS,
  SHARED_WILDERNESS_PANORAMA
} from './playableMaps.js?v=20260929-single-map-system-v2';
import { NAM_LANG_WORLD_NODES, NAM_LANG_ROOT_ID, STARTER_WORLD_IDS } from './namLangWorld.js?v=20260929-single-map-system-v2';
import {
  HUMAN_REALM_ROOT_ID,
  HUMAN_REALM_VERSION,
  HUMAN_REALM_SCALE,
  HUMAN_REALM_CONTINENTS,
  HUMAN_REALM_WORLD_NODES,
  NEW_HUMAN_REALM_CONTINENT_SPECS
} from './humanRealmWorld.js?v=20260929-human-realm-v1';
import { getTravelRoutesForMap as getRawTravelRoutesForMap, resolveAnchorPoint } from './travelRoutes.js?v=20260929-single-map-system-v2';
import { getMapTemplate, MAP_TEMPLATES, PANORAMA_STANDARD } from './mapTemplates.js?v=20260929-single-map-system-v1';
import {
  NAM_LANG_REGION_ATLAS,
  PROVINCE_ATLAS_VERSION,
  getProvinceAtlasProfile,
  getRegionAtlasProfile
} from './namLangProvinceAtlas.js?v=20260929-atlas-v1';
import {
  FACTION_ATLAS_VERSION,
  TRANSCONTINENTAL_SECTS,
  getProvinceFactionProfile
} from './namLangFactionAtlas.js?v=20260929-atlas-v1';

export const MAP_SYSTEM_VERSION = '20260929-human-realm-five-continents-v1';
export const START_MAP_ID = 0;
export const DEFAULT_ZONE_COUNT = 4;

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
  NAM_LANG_WORLD_NODES,
  NAM_LANG_ROOT_ID,
  STARTER_WORLD_IDS,
  MAP_TEMPLATES,
  PANORAMA_STANDARD,
  NAM_LANG_REGION_ATLAS,
  PROVINCE_ATLAS_VERSION,
  FACTION_ATLAS_VERSION,
  TRANSCONTINENTAL_SECTS,
  getMapTemplate,
  getProvinceAtlasProfile,
  getProvinceFactionProfile,
  getRegionAtlasProfile
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

function namLangRegionIdFromNode(node) {
  if (!node) return null;
  if (node.type === 'great_region' && String(node.id).startsWith('nl.gr.')) return String(node.id).split('.')[2] || null;
  if (node.type === 'province' && String(node.parentId || '').startsWith('nl.gr.')) return String(node.parentId).split('.')[2] || null;
  return null;
}

function enrichWorldNode(rawNode) {
  if (!rawNode) return null;
  if (enrichedNodeCache.has(rawNode.id)) return enrichedNodeCache.get(rawNode.id);

  // Four new continents are born with complete province/faction metadata in humanRealmWorld.js.
  // Only legacy-stable Nam Lăng nodes need the existing Nam Lăng atlas overlay here.
  let enriched = rawNode;
  const regionId = namLangRegionIdFromNode(rawNode);

  if (rawNode.type === 'great_region' && regionId) {
    const regionAtlas = getRegionAtlasProfile(regionId);
    const regionalSects = TRANSCONTINENTAL_SECTS.filter(sect => sect.influenceRegions.includes(regionId));
    if (regionAtlas) {
      enriched = Object.freeze({
        ...rawNode,
        atlasVersion: PROVINCE_ATLAS_VERSION,
        climate: regionAtlas.climate,
        signatureProducts: Object.freeze([...regionAtlas.products]),
        signatureMinerals: Object.freeze([...regionAtlas.minerals]),
        signatureEnemies: Object.freeze([...regionAtlas.enemies]),
        dominantElements: Object.freeze([...regionAtlas.elements]),
        transcontinentalSects: Object.freeze(regionalSects.map(sect => Object.freeze({
          id: sect.id,
          name: sect.name,
          elem: sect.elem,
          headquarters: sect.headquarters
        })))
      });
    }
  } else if (rawNode.type === 'province' && regionId) {
    const provinceSiblings = (childrenByParent.get(rawNode.parentId) || []).filter(node => node.type === 'province');
    const provinceIndex = Math.max(0, provinceSiblings.findIndex(node => node.id === rawNode.id));
    const atlas = getProvinceAtlasProfile(regionId, rawNode.name, provinceIndex);
    const factions = getProvinceFactionProfile(regionId, rawNode.name, provinceIndex);
    const factionNames = factions.factions.map(faction => faction.name);
    const cultivationFactions = Object.freeze([...new Set([
      ...(rawNode.cultivationFactions || []),
      ...factionNames
    ])]);

    enriched = Object.freeze({
      ...rawNode,
      desc: rawNode.id === STARTER_WORLD_IDS.province ? `${rawNode.desc}\n${atlas.desc}` : atlas.desc,
      atlasVersion: atlas.atlasVersion,
      factionAtlasVersion: factions.atlasVersion,
      climate: atlas.climate,
      capital: rawNode.capital || atlas.capital,
      notableCities: atlas.notableCities,
      notableTowns: atlas.notableTowns,
      notableVillages: atlas.notableVillages,
      secretRealms: atlas.secretRealms,
      forbiddenZones: atlas.forbiddenZones,
      products: atlas.products,
      minerals: atlas.minerals,
      enemyProfile: atlas.enemyProfile,
      provinceGenerationCounts: atlas.generationCounts,
      cultivationFactions,
      factionProfile: factions
    });
  }

  enrichedNodeCache.set(rawNode.id, enriched);
  return enriched;
}

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

/** Canonical world read: every node in Nhân Giới resolves here. */
export function getWorldNode(nodeId) {
  return enrichWorldNode(nodeById.get(nodeId) || null);
}

export function getWorldChildren(parentId) {
  return (childrenByParent.get(parentId ?? '__root__') || []).map(enrichWorldNode);
}

export function getAllWorldNodes() {
  return HUMAN_REALM_WORLD_NODES.map(enrichWorldNode);
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
