/**
 * regionsData.js
 * Compatibility facade. Code cũ tiếp tục import WORLD_REGIONS / ALL_MAPS / getMapById,
 * còn dữ liệu thế giới lớn nằm trong src/config/world/*.
 */
export {
  PLAYABLE_REGIONS as WORLD_REGIONS,
  ALL_PLAYABLE_MAPS as ALL_MAPS,
  SHARED_WILDERNESS_PANORAMA
} from './world/playableMaps.js?v=20260929-shared-panorama-v1';
export {
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
} from './world/worldRegistry.js?v=20260929-shared-panorama-v1';
