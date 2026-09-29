/**
 * mapSystemInvariant.js
 * Runtime + data integrity guard for the ONE authoritative map/world system.
 *
 * Canonical Human Realm contract:
 * - Nam Lăng: 9 Đại Vực / 108 Châu
 * - Đông Huyền: 8 Huyền Vực / 64 Đạo
 * - Tây Mạc: 7 Hoang Vực / 49 Lĩnh
 * - Bắc Minh: 6 Hàn Thiên / 72 Phủ
 * - Trung Vực: 12 Thánh Vực / 144 Châu
 * Runtime remains strictly Maps 0,1,2 inside Nam Lăng.
 */
import {
  ALL_PLAYABLE_MAPS,
  MAP_SYSTEM_VERSION,
  MAP_TEMPLATES,
  HUMAN_REALM_ROOT_ID,
  HUMAN_REALM_WORLD_NODES,
  HUMAN_REALM_DETAIL_VERSION,
  HUMAN_REALM_DETAIL_COUNTS,
  NAM_LANG_ROOT_ID,
  PLAYABLE_REGIONS,
  RUNTIME_MAP_IDS,
  SHARED_WILDERNESS_PANORAMA,
  getMapZones,
  getWorldNode,
  getWorldDetailProfile,
  hasHumanRealmDetailBlueprint
} from './worldRegistry.js?v=20260929-human-realm-detail-v1';
import { TRAVEL_ROUTES } from './travelRoutes.js?v=20260929-single-map-system-v2';

const EXPECTED_RUNTIME_OWNER = 'WorldMapRuntime';
const EXPECTED_UI_OWNER = 'WorldMapHierarchyUI';
const EXPECTED_CONTENT_ZONE_OWNER = 'MapContentZoneRuntime';
const EXPECTED_STREAMING_OWNER = 'MapZoneAssetStreaming';
const EXPECTED_MAP_IDS = Object.freeze([0, 1, 2]);
const EXPECTED_WORLD = Object.freeze({ continents: 5, primaryRegions: 42, territories: 437 });
const EXPECTED_CONTINENTS = Object.freeze({
  south: Object.freeze({ primary: 9, secondary: 108, perPrimary: 12, primaryLabel: 'ĐẠI VỰC', secondaryLabel: 'CHÂU' }),
  east: Object.freeze({ primary: 8, secondary: 64, perPrimary: 8, primaryLabel: 'HUYỀN VỰC', secondaryLabel: 'ĐẠO' }),
  west: Object.freeze({ primary: 7, secondary: 49, perPrimary: 7, primaryLabel: 'HOANG VỰC', secondaryLabel: 'LĨNH' }),
  north: Object.freeze({ primary: 6, secondary: 72, perPrimary: 12, primaryLabel: 'HÀN THIÊN', secondaryLabel: 'PHỦ' }),
  central: Object.freeze({ primary: 12, secondary: 144, perPrimary: 12, primaryLabel: 'THÁNH VỰC', secondaryLabel: 'CHÂU' })
});
const EXPECTED_ACTIVE_FUNCTIONS = Object.freeze({
  switchMap: 'switchMapFromRegistry',
  createWorld: 'createWorldFromRegistry',
  createMapPortals: 'createMapPortalsFromRegistry',
  openMapPanel: 'openHierarchicalWorldMap',
  initBattlefield: 'streamedInitBattlefield',
  getEnemySpawnConfig: 'getEnemySpawnConfigFromUnifiedMap',
  initHerbs: 'streamedInitHerbs',
  initMineralNodes: 'initMineralNodesFromUnifiedZones',
  getNpcSpawnConfig: 'getNpcSpawnConfigFromUnifiedZones'
});

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates];
}

function pushDuplicates(errors, label, values) {
  const duplicates = duplicateValues(values);
  if (duplicates.length) errors.push(`${label} bị trùng: ${duplicates.join(', ')}`);
}

function sameNumberList(a, b) {
  return a.length === b.length && a.every((value, index) => Number(value) === Number(b[index]));
}

function assertActiveFunctions(errors, proto) {
  for (const [method, expectedName] of Object.entries(EXPECTED_ACTIVE_FUNCTIONS)) {
    const fn = proto?.[method];
    if (typeof fn !== 'function') {
      errors.push(`Thiếu active method ${method}().`);
      continue;
    }
    if (fn.name !== expectedName) errors.push(`${method}() đang bị override bởi ${fn.name || '<anonymous>'}; phải là ${expectedName}.`);
  }
}

function validateDetailSample(errors, node) {
  const detail = getWorldDetailProfile(node.id);
  if (!detail) {
    errors.push(`${node.name} thiếu detailed atlas profile.`);
    return;
  }
  if (detail.version !== HUMAN_REALM_DETAIL_VERSION) errors.push(`${node.name} dùng detailed atlas version không khớp.`);

  if (node.type === 'continent') {
    if (!detail.identity || !detail.macroBiomes?.length || !detail.travel || !detail.politics) {
      errors.push(`${node.name} thiếu identity/macroBiomes/travel/politics.`);
    }
  } else if (node.type === 'great_region') {
    if (!detail.identity || !detail.biomes?.length || !detail.combat || !detail.exploration || !detail.resources) {
      errors.push(`${node.name} thiếu identity/biomes/combat/exploration/resources.`);
    }
  } else if (node.type === 'province') {
    if (!detail.mapIdentity || !detail.landmarks?.length || !detail.settlements || !detail.routes ||
        !detail.resourceProfile || !detail.enemyEcology || !detail.dungeonProfile ||
        !detail.hazards?.length || !detail.events?.length || !detail.questHooks?.length ||
        !detail.materializationBlueprint) {
      errors.push(`${node.name} thiếu cấu trúc detailed map blueprint.`);
    }
  } else if (node.playableMapId != null) {
    if (detail.runtimeIntent?.status !== 'materialized_runtime_map') errors.push(`${node.name} thiếu runtimeIntent cho playable map.`);
  }
}

export function assertSingleMapSystem(MainGameScene) {
  const errors = [];
  const proto = MainGameScene?.prototype;

  if (!proto) {
    errors.push('Không tìm thấy MainGameScene.prototype.');
  } else {
    if (proto.__mapRuntimeOwner !== EXPECTED_RUNTIME_OWNER) errors.push(`Map runtime owner phải là ${EXPECTED_RUNTIME_OWNER}, hiện tại: ${String(proto.__mapRuntimeOwner)}`);
    if (proto.__worldMapUiOwner !== EXPECTED_UI_OWNER) errors.push(`World-map UI owner phải là ${EXPECTED_UI_OWNER}, hiện tại: ${String(proto.__worldMapUiOwner)}`);
    if (proto.__mapContentZoneOwner !== EXPECTED_CONTENT_ZONE_OWNER) errors.push(`Map content-zone owner phải là ${EXPECTED_CONTENT_ZONE_OWNER}, hiện tại: ${String(proto.__mapContentZoneOwner)}`);
    if (proto.__mapZoneAssetStreamingOwner !== EXPECTED_STREAMING_OWNER) errors.push(`Map zone-streaming owner phải là ${EXPECTED_STREAMING_OWNER}, hiện tại: ${String(proto.__mapZoneAssetStreamingOwner)}`);
    assertActiveFunctions(errors, proto);
  }

  if (PLAYABLE_REGIONS.length !== 1 || PLAYABLE_REGIONS[0]?.id !== 'nam_lang') errors.push(`Runtime catalog phải chỉ có 1 catalog nam_lang; hiện có ${PLAYABLE_REGIONS.length}.`);
  if (PLAYABLE_REGIONS[0]?.maps !== ALL_PLAYABLE_MAPS) errors.push('PLAYABLE_REGIONS[0].maps phải dùng trực tiếp ALL_PLAYABLE_MAPS, không được tạo catalog song song.');
  if (!sameNumberList(RUNTIME_MAP_IDS, EXPECTED_MAP_IDS)) errors.push(`RUNTIME_MAP_IDS phải chính xác là [0,1,2], hiện tại: [${RUNTIME_MAP_IDS.join(',')}].`);

  const mapIds = ALL_PLAYABLE_MAPS.map(map => Number(map.id));
  pushDuplicates(errors, 'Map ID', mapIds);
  if (!sameNumberList(mapIds, EXPECTED_MAP_IDS)) errors.push(`ALL_PLAYABLE_MAPS phải chỉ có [0,1,2], hiện tại: [${mapIds.join(',')}].`);

  const mapById = new Map(ALL_PLAYABLE_MAPS.map(map => [Number(map.id), map]));
  for (const map of ALL_PLAYABLE_MAPS) {
    if (!Number.isInteger(Number(map.id))) errors.push(`Map có ID không hợp lệ: ${String(map.id)}`);
    if (!map.name) errors.push(`Map ${map.id} thiếu name.`);
    if (!MAP_TEMPLATES[map.templateId]) errors.push(`Map ${map.id} dùng template không tồn tại: ${String(map.templateId)}`);
    if (!(Number(map.worldWidth) > 0) || !(Number(map.worldHeight) > 0)) errors.push(`Map ${map.id} có kích thước world không hợp lệ.`);
    if (!map.locationNodeId) errors.push(`Map ${map.id} bắt buộc phải có canonical locationNodeId.`);
    else if (!getWorldNode(map.locationNodeId)) errors.push(`Map ${map.id} trỏ locationNodeId không tồn tại: ${map.locationNodeId}`);

    for (const forbiddenField of ['legacyCompatibility', 'worldHidden', 'legacyOrigin']) {
      if (forbiddenField in map) errors.push(`Map ${map.id} còn field legacy "${forbiddenField}".`);
    }

    const template = MAP_TEMPLATES[map.templateId];
    const isSafeHub = map.isPeaceZone === true || template?.type === 'hub';
    if (isSafeHub && map.useSharedWildernessPanorama) errors.push(`Safe hub map ${map.id} không được dùng shared wilderness panorama.`);
    if (EXPECTED_MAP_IDS.includes(Number(map.id)) && map.useSharedWildernessPanorama) errors.push(`Map ${map.id} phải giữ panorama riêng, không được dùng shared wilderness panorama.`);
    if (map.useSharedWildernessPanorama && (map.panoramaKey !== SHARED_WILDERNESS_PANORAMA.key || map.panoramaAsset !== SHARED_WILDERNESS_PANORAMA.asset)) {
      errors.push(`Map ${map.id} khai báo shared panorama nhưng key/asset không khớp registry chung.`);
    }

    const zones = getMapZones(map.id);
    if (!map.isPeaceZone && zones.length === 0) errors.push(`Map ${map.id} không có zone geometry.`);
    let previousX1 = null;
    for (const zone of zones) {
      if (!(Number(zone.x1) > Number(zone.x0))) errors.push(`Map ${map.id} zone ${zone.id || zone.zoneNumber} có x0/x1 không hợp lệ.`);
      if (previousX1 != null && Number(zone.x0) < previousX1) errors.push(`Map ${map.id} có zone geometry chồng lấn tại ${zone.id || zone.zoneNumber}.`);
      previousX1 = Number(zone.x1);
    }
  }

  const nodeIds = HUMAN_REALM_WORLD_NODES.map(node => node.id);
  pushDuplicates(errors, 'World node ID', nodeIds);
  const nodeIdSet = new Set(nodeIds);
  const worldRoots = HUMAN_REALM_WORLD_NODES.filter(node => node.parentId == null);
  if (worldRoots.length !== 1 || worldRoots[0]?.id !== HUMAN_REALM_ROOT_ID) {
    errors.push(`World hierarchy phải có đúng 1 root ${HUMAN_REALM_ROOT_ID}; hiện có ${worldRoots.map(node => node.id).join(', ') || '0 root'}.`);
  }

  const rawChildrenByParent = new Map();
  for (const node of HUMAN_REALM_WORLD_NODES) {
    const key = node.parentId ?? '__root__';
    if (!rawChildrenByParent.has(key)) rawChildrenByParent.set(key, []);
    rawChildrenByParent.get(key).push(node);
  }
  const rawChildren = parentId => rawChildrenByParent.get(parentId) || [];

  const continents = HUMAN_REALM_WORLD_NODES.filter(node => node.type === 'continent');
  const primaryRegions = HUMAN_REALM_WORLD_NODES.filter(node => node.type === 'great_region');
  const territories = HUMAN_REALM_WORLD_NODES.filter(node => node.type === 'province');
  const rootContinents = rawChildren(HUMAN_REALM_ROOT_ID).filter(node => node.type === 'continent');

  if (continents.length !== EXPECTED_WORLD.continents || rootContinents.length !== EXPECTED_WORLD.continents) errors.push(`Nhân Giới phải có đúng 5 Đại Lục; hiện có ${continents.length} (${rootContinents.length} node trực tiếp).`);
  if (primaryRegions.length !== EXPECTED_WORLD.primaryRegions) errors.push(`Nhân Giới phải có đúng 42 vùng cấp cao; hiện có ${primaryRegions.length}.`);
  if (territories.length !== EXPECTED_WORLD.territories) errors.push(`Nhân Giới phải có đúng 437 đơn vị cấp hai; hiện có ${territories.length}.`);

  const continentIds = new Set(continents.map(node => node.id));
  if (!continentIds.has(NAM_LANG_ROOT_ID)) errors.push('Nam Lăng Đại Lục phải tồn tại như Nam Đại Lục của Nhân Giới.');

  for (const continent of continents) {
    if (continent.parentId !== HUMAN_REALM_ROOT_ID) errors.push(`${continent.name} phải trực thuộc Nhân Giới.`);
    const key = continent.humanRealmContinentId;
    const expected = EXPECTED_CONTINENTS[key];
    if (!expected) {
      errors.push(`${continent.name} thiếu cấu trúc canonical.`);
      continue;
    }

    const regions = rawChildren(continent.id).filter(node => node.type === 'great_region');
    const territoryCount = regions.reduce((sum, region) => sum + rawChildren(region.id).filter(node => node.type === 'province').length, 0);
    if (regions.length !== expected.primary) errors.push(`${continent.name} phải có đúng ${expected.primary} ${expected.primaryLabel}, hiện có ${regions.length}.`);
    if (territoryCount !== expected.secondary) errors.push(`${continent.name} phải có đúng ${expected.secondary} ${expected.secondaryLabel}, hiện có ${territoryCount}.`);

    for (const region of regions) {
      const children = rawChildren(region.id).filter(node => node.type === 'province');
      if (children.length !== expected.perPrimary) errors.push(`${region.name} phải có đúng ${expected.perPrimary} ${expected.secondaryLabel}, hiện có ${children.length}.`);
      if (key !== 'south' && region.displayTypeLabel !== expected.primaryLabel) errors.push(`${region.name} phải hiển thị cấp ${expected.primaryLabel}.`);
      if (key !== 'south') {
        for (const child of children) {
          if (child.displayTypeLabel !== expected.secondaryLabel) errors.push(`${child.name} phải hiển thị cấp ${expected.secondaryLabel}.`);
        }
      }
    }
  }

  for (const node of HUMAN_REALM_WORLD_NODES) {
    if (node.parentId && !nodeIdSet.has(node.parentId)) errors.push(`World node ${node.id} có parent không tồn tại: ${node.parentId}`);
    if (!hasHumanRealmDetailBlueprint(node.id)) errors.push(`World node ${node.id} không có detailed-atlas blueprint.`);
  }

  if (HUMAN_REALM_DETAIL_COUNTS.totalNodes !== HUMAN_REALM_WORLD_NODES.length) errors.push('Detailed atlas totalNodes không khớp world nodes.');
  if (HUMAN_REALM_DETAIL_COUNTS.continents !== EXPECTED_WORLD.continents) errors.push('Detailed atlas thiếu Đại Lục.');
  if (HUMAN_REALM_DETAIL_COUNTS.primaryRegions !== EXPECTED_WORLD.primaryRegions) errors.push('Detailed atlas thiếu vùng cấp cao.');
  if (HUMAN_REALM_DETAIL_COUNTS.secondLevelTerritories !== EXPECTED_WORLD.territories) errors.push('Detailed atlas thiếu đơn vị cấp hai.');

  // Validate all 5 continents + all 42 primary regions, plus one territory per primary region.
  // This proves every generator branch while keeping mobile boot from materializing all 437 detail objects.
  continents.forEach(node => validateDetailSample(errors, node));
  primaryRegions.forEach(node => validateDetailSample(errors, node));
  for (const region of primaryRegions) {
    const sampleTerritory = rawChildren(region.id).find(node => node.type === 'province');
    if (sampleTerritory) validateDetailSample(errors, sampleTerritory);
  }

  const playableNodes = HUMAN_REALM_WORLD_NODES.filter(node => node.playableMapId != null);
  const playableNodeMapIds = playableNodes.map(node => Number(node.playableMapId));
  pushDuplicates(errors, 'playableMapId của world node', playableNodeMapIds);
  if (!sameNumberList([...playableNodeMapIds].sort((a, b) => a - b), EXPECTED_MAP_IDS)) errors.push(`World node playable phải chỉ trỏ [0,1,2], hiện tại: [${playableNodeMapIds.join(',')}].`);
  for (const node of playableNodes) {
    const map = mapById.get(Number(node.playableMapId));
    if (!map) errors.push(`World node ${node.id} trỏ playableMapId không tồn tại: ${node.playableMapId}`);
    else if (map.locationNodeId !== node.id) errors.push(`Liên kết map/node không đối xứng: map ${map.id} -> ${map.locationNodeId}, node ${node.id} -> ${node.playableMapId}`);
    validateDetailSample(errors, node);
  }

  const linkedLocationIds = ALL_PLAYABLE_MAPS.map(map => map.locationNodeId);
  pushDuplicates(errors, 'locationNodeId của playable map', linkedLocationIds);
  for (const map of ALL_PLAYABLE_MAPS) {
    const node = getWorldNode(map.locationNodeId);
    if (node && Number(node.playableMapId) !== Number(map.id)) errors.push(`Map ${map.id} -> ${map.locationNodeId} nhưng world node không trỏ ngược đúng map.`);
  }

  pushDuplicates(errors, 'Travel route ID', TRAVEL_ROUTES.map(route => route.id));
  for (const route of TRAVEL_ROUTES) {
    const source = mapById.get(Number(route.fromMapId));
    const target = mapById.get(Number(route.toMapId));
    if (!source) errors.push(`Route ${route.id} có fromMapId không tồn tại: ${route.fromMapId}`);
    if (!target) errors.push(`Route ${route.id} có toMapId không tồn tại: ${route.toMapId}`);
    if (!EXPECTED_MAP_IDS.includes(Number(route.fromMapId)) || !EXPECTED_MAP_IDS.includes(Number(route.toMapId))) errors.push(`Route ${route.id} tham chiếu map ngoài [0,1,2].`);
    if ('minRealm' in route || 'minRealmIdx' in route || 'requiresQuestId' in route || 'requiresFactionId' in route) errors.push(`Route ${route.id} đang chứa access rule riêng; phải lấy access từ destination map.`);
  }

  const panoramaAssetByKey = new Map();
  for (const map of ALL_PLAYABLE_MAPS) {
    if (!map.panoramaKey || !map.panoramaAsset) continue;
    const previous = panoramaAssetByKey.get(map.panoramaKey);
    if (previous && previous !== map.panoramaAsset) errors.push(`Panorama key ${map.panoramaKey} trỏ nhiều asset: ${previous} | ${map.panoramaAsset}`);
    else panoramaAssetByKey.set(map.panoramaKey, map.panoramaAsset);
  }

  if (errors.length) throw new Error(`[MAP SYSTEM INVARIANT] Phát hiện ${errors.length} lỗi:\n- ${errors.join('\n- ')}`);

  return Object.freeze({
    ok: true,
    version: MAP_SYSTEM_VERSION,
    detailedAtlasVersion: HUMAN_REALM_DETAIL_VERSION,
    runtimeOwner: EXPECTED_RUNTIME_OWNER,
    uiOwner: EXPECTED_UI_OWNER,
    contentZoneOwner: EXPECTED_CONTENT_ZONE_OWNER,
    streamingOwner: EXPECTED_STREAMING_OWNER,
    runtimeCatalogCount: PLAYABLE_REGIONS.length,
    playableMapIds: Object.freeze([...mapIds]),
    playableMapCount: ALL_PLAYABLE_MAPS.length,
    worldRootCount: worldRoots.length,
    worldNodeCount: HUMAN_REALM_WORLD_NODES.length,
    continentCount: continents.length,
    primaryRegionCount: primaryRegions.length,
    territoryCount: territories.length,
    detailedBlueprintCount: HUMAN_REALM_DETAIL_COUNTS.totalNodes,
    playableWorldNodeCount: playableNodes.length,
    travelRouteCount: TRAVEL_ROUTES.length
  });
}
