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
  buildRuntimeMap,
  getDeclaredWorldRuntimeMapDefinition
} from './playableMaps.js?v=20260929-single-map-system-v2';
import {
  getMasterMapById,
  findMasterMapById,
  findSpecialMapOverride,
  getSpecialMapOverride,
  SPECIAL_MAP_OVERRIDES,
  ZONE_TYPES,
  UI_MODES,
  CANONICAL_MAP_KEYS
} from './masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';
import {
  HUMAN_REALM_ROOT_ID,
  HUMAN_REALM_VERSION,
  HUMAN_REALM_SCALE,
  HUMAN_REALM_MAP_DECLARATION,
  HUMAN_REALM_DECLARATION_COUNTS,
  HUMAN_REALM_CONTINENTS,
  HUMAN_REALM_WORLD_NODES,
  NEW_HUMAN_REALM_CONTINENT_SPECS,
  STARTER_WORLD_IDS,
  NAM_LANG_ROOT_ID,
  NAM_LANG_WORLD_NODES,
  RUNTIME_POLICIES
} from './humanRealmWorld.js?v=20261001-canonical-geography-single-ruler-v2';
import {
  HUMAN_REALM_DETAIL_VERSION,
  HUMAN_REALM_DETAIL_COUNTS,
  hasHumanRealmDetailBlueprint,
  getHumanRealmDetailProfile,
  getAllHumanRealmDetailProfiles
} from './humanRealmDetailedAtlas.js?v=20260929-human-realm-detail-v1';
import { getTravelRoutesForMap as getRawTravelRoutesForMap, resolveAnchorPoint } from './travelRoutes.js?v=20260929-single-map-system-v2';
import { getMapTemplate, MAP_TEMPLATES, PANORAMA_STANDARD } from './mapTemplates.js?v=20260929-single-map-system-v1';
import { HUMAN_REALM_FACTION_NETWORK } from '../factions/gameFactionRegistry.js?v=20260930-canonical-geography-v1';

export const MAP_SYSTEM_VERSION = '20260930-human-realm-managed-atlas-v6';
export const START_MAP_ID = CANONICAL_MAP_KEYS.THANH_VAN_THON;
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
  CANONICAL_MAP_KEYS,
  PLAYABLE_REGIONS,
  ALL_PLAYABLE_MAPS,
  RUNTIME_MAP_IDS,
  SHARED_WILDERNESS_PANORAMA,
  HUMAN_REALM_ROOT_ID,
  HUMAN_REALM_VERSION,
  HUMAN_REALM_SCALE,
  HUMAN_REALM_MAP_DECLARATION,
  HUMAN_REALM_DECLARATION_COUNTS,
  HUMAN_REALM_CONTINENTS,
  HUMAN_REALM_WORLD_NODES,
  NEW_HUMAN_REALM_CONTINENT_SPECS,
  HUMAN_REALM_DETAIL_VERSION,
  HUMAN_REALM_DETAIL_COUNTS,
  NAM_LANG_WORLD_NODES,
  NAM_LANG_ROOT_ID,
  STARTER_WORLD_IDS,
  RUNTIME_POLICIES,
  MAP_TEMPLATES,
  PANORAMA_STANDARD,
  SPECIAL_MAP_OVERRIDES,
  findSpecialMapOverride,
  getSpecialMapOverride,
  getMapTemplate,
  hasHumanRealmDetailBlueprint,
  getHumanRealmDetailProfile,
  getAllHumanRealmDetailProfiles
};

/**
 * Phân giải runtimePolicy cho một world node hoặc hierarchy node
 */
export function getNodeRuntimePolicy(node) {
  if (!node) return RUNTIME_POLICIES.NONE;
  if (node.containerOnly === true) return RUNTIME_POLICIES.NONE;
  if (node.runtimePolicy) return node.runtimePolicy;

  if (node.playableMapId != null) {
    if (node.locationKind === 'safe_hub' || node.type === 'settlement' || node.locationKind === 'village' || node.locationKind === 'town') return RUNTIME_POLICIES.HUB;
    if (node.locationKind?.includes('secret') || node.locationKind?.includes('forbidden')) return RUNTIME_POLICIES.DUNGEON;
    return RUNTIME_POLICIES.MAP;
  }

  const type = String(node.type || '').toLowerCase();
  const kind = String(node.locationKind || '').toLowerCase();

  // 1. Navigation Nodes & Pure Container Nodes -> NONE
  if (['realm', 'continent', 'great_region', 'province', 'nation', 'commandery', 'settlement', 'container', 'faction_group'].includes(type)) {
    return RUNTIME_POLICIES.NONE;
  }

  // 2. Playable Hubs (Thành Vực, Thành Thị, Tông Môn Sơn Môn, Tổ Địa Thế Gia, Thôn Trang)
  if (
    type === 'city_territory' ||
    type === 'city' ||
    type === 'safe_city' ||
    type === 'safe_sect' ||
    type === 'safe_clan' ||
    ['safe_hub', 'major_hub', 'town', 'market', 'village'].includes(kind)
  ) {
    return RUNTIME_POLICIES.HUB;
  }

  // 3. Playable Dungeons / Secret Realms / Forbidden Zones
  if (
    type === 'dungeon' ||
    type === 'secret_realm' ||
    type === 'forbidden_zone' ||
    type === 'boss_area' ||
    kind.includes('secret') ||
    kind.includes('forbidden') ||
    kind.includes('dungeon') ||
    kind.includes('boss')
  ) {
    return RUNTIME_POLICIES.DUNGEON;
  }

  // 4. Playable Combat Maps / Wilderness
  if (
    type === 'location' ||
    type === 'wilderness' ||
    kind.includes('wild') ||
    kind === 'field' ||
    kind === 'resource'
  ) {
    return RUNTIME_POLICIES.MAP;
  }

  // 5. Leaf Faction Sơn Môn / Tổ Địa
  if (type === 'sect' || type === 'clan' || type === 'family') {
    return RUNTIME_POLICIES.HUB;
  }

  return RUNTIME_POLICIES.NONE;
}

const mapById = new Map();
for (const map of ALL_PLAYABLE_MAPS) {
  if (map?.id) mapById.set(String(map.id), map);
  if (map?.canonicalKey) mapById.set(map.canonicalKey, map);
  if (map?.key) mapById.set(map.key, map);
}
// Numeric IDs are accepted only by save migration. Runtime indexes contain
// canonical string map IDs exclusively.
const nodeById = new Map(HUMAN_REALM_WORLD_NODES.map(node => [node.id, node]));
const childrenByParent = new Map();
const zoneCache = new Map();
const enrichedNodeCache = new Map();
const controllerAssignmentCache = new Map();
const factionRuntimeDefinitionCache = new Map();

function getDeclaredFactionRuntimeMapDefinition(identifier) {
  const id = String(identifier);
  if (factionRuntimeDefinitionCache.has(id)) return factionRuntimeDefinitionCache.get(id);
  const faction = (HUMAN_REALM_FACTION_NETWORK.getAllCoreFactions?.() || [])
    .find(item => item?.headquarters?.playableMapId === id) || null;
  if (!faction) return null;
  const isClan = faction.archetype === 'CULTIVATION_FAMILY' || faction.archetype === 'ANCIENT_CLAN';
  const definition = Object.freeze({
    id,
    canonicalKey: id,
    name: faction.headquarters?.name || faction.name,
    subName: isClan ? 'Tổ Địa Thế Gia · An Toàn' : 'Sơn Môn Tu Tiên · An Toàn',
    geography: Object.freeze({ nodeId: faction.headquarters?.worldNodeId || faction.homeTerritoryId }),
    runtimePolicy: RUNTIME_POLICIES.HUB,
    type: isClan ? ZONE_TYPES.SAFE_CLAN : ZONE_TYPES.SAFE_SECT,
    uiMode: isClan ? UI_MODES.CLAN_HUB : UI_MODES.SECT_HUB,
    isPeaceZone: true,
    access: Object.freeze({ minRealmIdx: Number(faction.recruitment?.entryRealmMin || 0) })
  });
  factionRuntimeDefinitionCache.set(id, definition);
  return definition;
}

for (const node of HUMAN_REALM_WORLD_NODES) {
  const key = node.parentId ?? '__root__';
  if (!childrenByParent.has(key)) childrenByParent.set(key, []);
  childrenByParent.get(key).push(node);
}
const nodeByMapId = new Map(
  HUMAN_REALM_WORLD_NODES
    .filter(node => node.playableMapId != null)
    .flatMap(node => [
      [String(node.playableMapId), node],
      [node.playableMapId, node]
    ])
);

function enrichWorldNode(rawNode) {
  if (!rawNode) return null;
  if (enrichedNodeCache.has(rawNode.id)) return enrichedNodeCache.get(rawNode.id);

  const controllerFactionId = getTerritoryController(rawNode.id);
  const controllerFaction = controllerFactionId ? HUMAN_REALM_FACTION_NETWORK.getFaction(controllerFactionId) : null;
  let enriched = controllerFaction ? Object.freeze({
    ...rawNode,
    controllerFactionId,
    // Compatibility data for the unchanged map and faction UI. The record is
    // a projection of Faction V5, never a geography-owned faction definition.
    rulerFaction: Object.freeze({
      id: controllerFaction.id,
      name: controllerFaction.name,
      archetype: controllerFaction.archetype,
      type: controllerFaction.archetype === 'SECT' ? 'Tông Môn' : 'Thế Gia',
      rankLabel: controllerFaction.meta?.rankLabel || 'Thế Lực Quản Lý',
      duty: 'Quản Lý Chính'
    })
  }) : rawNode;
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

function cacheRuntimeMap(runtimeMap, aliasKey = null) {
  if (!runtimeMap) return;
  if (runtimeMap.id != null) mapById.set(String(runtimeMap.id), runtimeMap);
  if (runtimeMap.canonicalKey) mapById.set(runtimeMap.canonicalKey, runtimeMap);
  if (runtimeMap.locationNodeId) mapById.set(runtimeMap.locationNodeId, runtimeMap);
  if (runtimeMap.name) mapById.set(runtimeMap.name, runtimeMap);
  if (aliasKey) mapById.set(String(aliasKey), runtimeMap);
}

/**
 * UNIFIED RUNTIME MAP RESOLVER
 * =========================================================================
 * Pipeline duy nhất phân giải map runtime đã được khai báo:
 * 1. Validate canonical string ID
 * 2. Kiểm tra Cache O(1)
 * 3. Kiểm tra Special Map Overrides (masterMapManifest: Thanh Vân Thôn, Ngoại Vi, Boss Arena...)
 * 4. Theo liên kết playableMapId đã khai báo của world node
 * 5. Không tự tạo map từ hierarchy node hoặc faction ID
 * =========================================================================
 */
export function resolveRuntimeMap(identifier) {
  if (identifier === null || identifier === undefined) return null;
  const strId = String(identifier).trim();
  if (!strId) return null;

  // Fast cache hit
  if (mapById.has(strId)) return mapById.get(strId);
  if (mapById.has(identifier)) return mapById.get(identifier);

  // 2. Kiểm tra Special Map Overrides (masterMapManifest.js)
  const specialOverride = findSpecialMapOverride(strId) || findSpecialMapOverride(identifier);
  if (specialOverride) {
    const runtimeMap = buildRuntimeMap(specialOverride);
    if (runtimeMap) {
      cacheRuntimeMap(runtimeMap, strId);
      return runtimeMap;
    }
  }

  // Explicit gameplay destinations are lazily materialized from the canonical
  // declaration index. This never applies to hierarchy navigation nodes.
  const declared = getDeclaredWorldRuntimeMapDefinition(strId);
  if (declared) {
    const runtimeMap = buildRuntimeMap(declared);
    if (runtimeMap) {
      cacheRuntimeMap(runtimeMap, strId);
      return runtimeMap;
    }
  }

  const factionDeclared = getDeclaredFactionRuntimeMapDefinition(strId);
  if (factionDeclared) {
    const runtimeMap = buildRuntimeMap(factionDeclared);
    if (runtimeMap) {
      cacheRuntimeMap(runtimeMap, strId);
      return runtimeMap;
    }
  }

  // 3. Tra cứu World Node trong Human Realm hierarchy
  let curr = nodeById.get(strId) || nodeByMapId.get(strId);
  if (!curr) {
    curr = HUMAN_REALM_WORLD_NODES.find(n => n.id === strId || n.name === strId || `map_${slugifyVi(n.name)}` === strId);
  }

  if (curr?.playableMapId != null && curr.playableMapId !== strId) {
    // A hierarchy node can only resolve to a map it explicitly declares.
    // No node is converted into a runtime map just because it has an ID.
    return resolveRuntimeMap(curr.playableMapId);
  }

  return null;
}

export function findMapById(mapId) {
  return resolveRuntimeMap(mapId);
}

export function hasDeclaredRuntimeDestination(identifier) {
  if (identifier === null || identifier === undefined) return false;
  const id = String(identifier);
  return mapById.has(id) || Boolean(findSpecialMapOverride(id) || getDeclaredWorldRuntimeMapDefinition(id) || getDeclaredFactionRuntimeMapDefinition(id));
}

export function getMapById(mapId) {
  return resolveRuntimeMap(mapId) || resolveRuntimeMap(START_MAP_ID);
}

export function normalizeMapId(mapId) {
  return resolveRuntimeMap(mapId)?.id ?? START_MAP_ID;
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

/**
 * Canonical administrative type. The rendered map retains its historic node
 * types (continent/great_region) so marker layout and drill-down stay intact.
 */
export function getCanonicalNodeType(nodeOrId) {
  // Keep this lookup raw: enrichment itself consults controller assignments.
  const node = typeof nodeOrId === 'string' ? nodeById.get(nodeOrId) : nodeOrId;
  return node?.canonicalType || node?.type || null;
}

function rawDirectByKind(parentId, predicate) {
  return (childrenByParent.get(parentId ?? '__root__') || []).filter(predicate);
}

function directByKind(parentId, predicate) {
  return Object.freeze(rawDirectByKind(parentId, predicate).map(enrichWorldNode));
}

export function getDirectTerritories(parentId) {
  const parentType = getCanonicalNodeType(parentId);
  const childType = parentType === 'great_region' ? 'region'
    : parentType === 'region' ? 'province'
      : parentType === 'province' ? 'nation'
        : parentType === 'nation' ? 'city_territory' : null;
  return childType ? directByKind(parentId, node => getCanonicalNodeType(node) === childType) : Object.freeze([]);
}

export function getDirectWildernesses(parentId) {
  return directByKind(parentId, node => String(node.locationKind || '').includes('wild') || node.locationKind === 'field');
}

export function getDirectSecretRealms(parentId) {
  return directByKind(parentId, node => String(node.locationKind || '').includes('secret'));
}

/**
 * Stable controller edges. Faction IDs are resolved by the V5 owner supplied
 * by the overlay/integration layer; geography never creates faction records.
 */
export function getControllerAssignments(parentId, { resolveFactionId } = {}) {
  if (!resolveFactionId && controllerAssignmentCache.has(parentId)) return controllerAssignmentCache.get(parentId);
  const parentType = getCanonicalNodeType(parentId);
  const childType = parentType === 'great_region' ? 'region'
    : parentType === 'region' ? 'province'
      : parentType === 'province' ? 'nation'
        : parentType === 'nation' ? 'city_territory' : null;
  const children = childType
    ? rawDirectByKind(parentId, node => getCanonicalNodeType(node) === childType)
    : [];
  const eligible = (HUMAN_REALM_FACTION_NETWORK.getAllCoreFactions?.() || [])
    .filter(faction => faction?.archetype === 'SECT' || faction?.archetype === 'CULTIVATION_FAMILY' || faction?.archetype === 'ANCIENT_CLAN')
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const used = new Set();
  const assignments = Object.freeze(children.map((child, index) => {
    const local = (HUMAN_REALM_FACTION_NETWORK.getFactionsForJurisdiction?.(child.id, { limit: 32 }) || [])
      .filter(faction => eligible.includes(faction))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const factionId = typeof resolveFactionId === 'function'
      ? resolveFactionId(child, index, children)
      : [...local, ...eligible].find(faction => !used.has(faction.id))?.id || null;
    if (factionId) used.add(factionId);
    return Object.freeze({
    parentId,
    controlledNodeId: child.id,
    controllerFactionId: factionId
    });
  }));
  if (!resolveFactionId) controllerAssignmentCache.set(parentId, assignments);
  return assignments;
}

export function getTerritoryController(nodeId, options = {}) {
  // Raw lookup avoids re-entering enrichWorldNode while resolving its owner.
  const node = nodeById.get(nodeId);
  if (!node?.parentId) return null;
  return getControllerAssignments(node.parentId, options)
    .find(assignment => assignment.controlledNodeId === node.id)?.controllerFactionId || null;
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
  if (mapId === null || mapId === undefined) return null;
  return enrichWorldNode(nodeByMapId.get(String(mapId)) || nodeByMapId.get(mapId) || null);
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
