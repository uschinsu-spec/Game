/**
 * @deprecated Compatibility-only facade.
 *
 * There is NO map data or map logic in this file.
 * The single source of truth is ./world/worldRegistry.js.
 * New code must import worldRegistry.js directly.
 */
export {
  PLAYABLE_REGIONS as WORLD_REGIONS,
  ALL_PLAYABLE_MAPS as ALL_MAPS,
  SHARED_WILDERNESS_PANORAMA,
  START_MAP_ID,
  getMapById,
  getWorldNode,
  getWorldChildren,
  getWorldAncestors,
  getWorldBreadcrumb,
  getWorldNodeForMap,
  getMapAccess,
  canEnterMap,
  getTravelRoutesForMap,
  resolvePanoramaMap,
  getPanoramaPreloadEntries,
  NAM_LANG_WORLD_NODES,
  NAM_LANG_ROOT_ID,
  STARTER_WORLD_IDS,
  MAP_TEMPLATES,
  PANORAMA_STANDARD,
  getMapTemplate
} from './world/worldRegistry.js?v=20260929-single-map-system-v1';
