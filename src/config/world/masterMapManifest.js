/**
 * masterMapManifest.js
 * =========================================================================
 * SPECIAL MAP OVERRIDES — CÁC BẢN ĐỒ CÓ THIẾT KẾ ĐẶC BIỆT / TAY
 * =========================================================================
 *
 * VAI TRÒ MỚI:
 * - Không còn là "toàn bộ map hợp lệ" độc quyền làm giới hạn game.
 * - Đóng vai trò là danh mục SPECIAL MAP OVERRIDES (những map có layout, asset,
 *   tòa nhà, kịch bản hoặc quái vật thiết kế thủ công đặc biệt như:
 *   Thanh Vân Thôn, Thanh Vân Ngoại Vi, Tông môn đặc biệt, Cấm địa đặc biệt,
 *   Event map, Dungeon thiết kế tay).
 * - World node chỉ có thể đi tới runtime map đã khai báo explicit qua
 *   playableMapId. Manifest này không materialize hierarchy node tự động.
 */
import {
  HUMAN_REALM_ROOT_ID,
  STARTER_WORLD_IDS,
  NAM_LANG_ROOT_ID
} from './humanRealmWorld.js?v=20261001-canonical-geography-single-ruler-v2';

export const MAP_MANIFEST_VERSION = '20260930-special-map-overrides-v5-unified';

// -----------------------------------------------------------------------------
// 1. CÁC HẰNG SỐ VÀ ENUM QUY CHUẨN
// -----------------------------------------------------------------------------

export const ZONE_TYPES = Object.freeze({
  SAFE_VILLAGE: 'safe_village',     // Thôn Trấn an toàn (Hub)
  SAFE_CITY: 'safe_city',           // Thành Thị an toàn (Hub)
  SAFE_SECT: 'safe_sect',           // Tông Môn an toàn (Hub)
  SAFE_CLAN: 'safe_clan',           // Gia Tộc an toàn (Hub)
  COMBAT_WILDERNESS: 'combat_wild', // Dã Ngoại chiến đấu
  COMBAT_DUNGEON: 'combat_dungeon'  // Bí Cảnh / Cấm Địa chiến đấu
});

export const UI_MODES = Object.freeze({
  VILLAGE_HUB: 'village_hub',               // Giao diện Hub Thôn Trấn (Interactive image / buildings)
  CITY_HUB: 'city_hub',                     // Giao diện Hub Thành Thị (THANH THI.PNG)
  SECT_HUB: 'sect_hub',                     // Giao diện Hub Tông Môn (TONG MON.PNG)
  CLAN_HUB: 'clan_hub',                     // Giao diện Hub Gia Tộc (GIA TOC.PNG)
  COMBAT_BATTLEFIELD: 'combat_battlefield'  // Giao diện Chiến Trường (Player, Joystick, Kỹ năng, Quái vật)
});

export const ELEMENT_TYPES = Object.freeze({
  KIM: 'KIM',     // Kim (Metal)
  MOC: 'MOC',     // Mộc (Wood)
  THUY: 'THUY',   // Thủy (Water)
  HOA: 'HOA',     // Hỏa (Fire)
  THO: 'THO',     // Thổ (Earth)
  PHONG: 'PHONG', // Phong (Wind)
  LOI: 'LOI',     // Lôi (Lightning)
  LY: 'LY'        // Vật lý / Ngoại công
});

export const CONTINENT_IDS = Object.freeze({
  SOUTH: 'south',     // Nam Lăng Đại Lục
  EAST: 'east',       // Đông Huyền Đại Lục
  WEST: 'west',       // Tây Mạc Đại Lục
  NORTH: 'north',     // Bắc Minh Đại Lục
  CENTRAL: 'central'  // Trung Vực Đại Lục
});

export const CANONICAL_MAP_KEYS = Object.freeze({
  THANH_VAN_THON: 'map_thanh_van_thon',
  THANH_VAN_NGOAI_VI: 'map_thanh_van_ngoai_vi'
});

export const MAJOR_PROVINCES = Object.freeze({
  THANH_CHAU: Object.freeze({
    id: 'thanh_chau',
    name: 'Thanh Châu',
    greatRegion: 'Thanh Linh Vực',
    theme: 'Sơn thủy hữu tình, linh điền trù phú, vùng đất khởi nguyên',
    primaryElements: [ELEMENT_TYPES.MOC, ELEMENT_TYPES.THUY]
  }),
  MAN_CHAU: Object.freeze({
    id: 'man_chau',
    name: 'Man Châu',
    greatRegion: 'Nam Hoang Vực',
    theme: 'Cổ lâm độc chướng, vạn thú hoang dã, ngự thú và thảo mộc nghìn năm',
    primaryElements: [ELEMENT_TYPES.MOC, ELEMENT_TYPES.THO]
  }),
  THACH_CHAU: Object.freeze({
    id: 'thach_chau',
    name: 'Thạch Châu',
    greatRegion: 'Vạn Sơn Vực',
    theme: 'Sơn mạch trùng điệp, linh khoáng dồi dào, địa hỏa luyện khí',
    primaryElements: [ELEMENT_TYPES.THO, ELEMENT_TYPES.KIM, ELEMENT_TYPES.HOA]
  }),
  KIEM_CHAU: Object.freeze({
    id: 'kiem_chau',
    name: 'Kiếm Châu',
    greatRegion: 'Đông Huyền Vực',
    theme: 'Kiếm tông san sát, kiếm ý ngập tràn, thánh địa kiếm tu',
    primaryElements: [ELEMENT_TYPES.KIM, ELEMENT_TYPES.PHONG, ELEMENT_TYPES.LOI]
  }),
  TRUNG_CHAU: Object.freeze({
    id: 'trung_chau',
    name: 'Trung Châu',
    greatRegion: 'Trung Thiên Vực',
    theme: 'Trung tâm linh mạch toàn đại lục, thiên đô và cự đại tông môn',
    primaryElements: [ELEMENT_TYPES.LOI, ELEMENT_TYPES.HOA, ELEMENT_TYPES.KIM]
  })
});

// -----------------------------------------------------------------------------
// 2. DANH MỤC 5 ĐẠI LỤC TOÀN CÕI NHÂN GIỚI
// -----------------------------------------------------------------------------

export const CONTINENT_DEFINITIONS = Object.freeze({
  [CONTINENT_IDS.SOUTH]: Object.freeze({
    id: 'south',
    nodeId: NAM_LANG_ROOT_ID,
    name: 'Nam Lăng Đại Lục',
    position: 'Nam',
    primaryLabel: 'Đại Vực',
    secondaryLabel: 'Châu',
    primaryCount: 9,
    secondaryCount: 108,
    theme: 'Sơn thủy ôn hòa, linh điền trù phú, nhân tộc hưng thịnh, cái nôi tu tiên',
    primaryElements: Object.freeze([ELEMENT_TYPES.MOC, ELEMENT_TYPES.THUY, ELEMENT_TYPES.THO]),
    bgmKey: 'bgm_south_nam_lang',
    ambientTheme: 'starter_human_temperate',
    desc: 'Nam Đại Lục của Nhân Giới gồm 9 Đại Vực và 108 Châu; văn minh nổi bật bởi phường thị ven sông, linh điền trù phú và đại giang.'
  }),
  [CONTINENT_IDS.EAST]: Object.freeze({
    id: 'east',
    nodeId: `${HUMAN_REALM_ROOT_ID}.continent.east`,
    name: 'Đông Huyền Đại Lục',
    position: 'Đông',
    primaryLabel: 'Huyền Vực',
    secondaryLabel: 'Đạo',
    primaryCount: 8,
    secondaryCount: 64,
    theme: 'Sơn hải bao la, long mạch cuồn cuộn, lôi bạo và thánh địa kiếm tu',
    primaryElements: Object.freeze([ELEMENT_TYPES.KIM, ELEMENT_TYPES.LOI, ELEMENT_TYPES.PHONG, ELEMENT_TYPES.THUY]),
    bgmKey: 'bgm_east_dong_huyen',
    ambientTheme: 'ocean_sword_thunder',
    desc: 'Đông Huyền Đại Lục gồm 8 Huyền Vực và 64 Đạo; kiểm soát bởi các đạo thống cổ, hải tộc, long duệ và kiếm tông.'
  }),
  [CONTINENT_IDS.WEST]: Object.freeze({
    id: 'west',
    nodeId: `${HUMAN_REALM_ROOT_ID}.continent.west`,
    name: 'Tây Mạc Đại Lục',
    position: 'Tây',
    primaryLabel: 'Hoang Vực',
    secondaryLabel: 'Lĩnh',
    primaryCount: 7,
    secondaryCount: 49,
    theme: 'Sa hải vô tận, địa hỏa sôi trào, cổ mộ hoàng lăng và thể tu viễn cổ',
    primaryElements: Object.freeze([ELEMENT_TYPES.THO, ELEMENT_TYPES.HOA, ELEMENT_TYPES.KIM]),
    bgmKey: 'bgm_west_tay_mac',
    ambientTheme: 'desert_ancient_tomb',
    desc: 'Tây Mạc Đại Lục gồm 7 Hoang Vực và 49 Lĩnh; ngăn cách bởi sa hải và tuyệt địa, nơi ngự trị của cổ quốc, thần điện và thể tu.'
  }),
  [CONTINENT_IDS.NORTH]: Object.freeze({
    id: 'north',
    nodeId: `${HUMAN_REALM_ROOT_ID}.continent.north`,
    name: 'Bắc Minh Đại Lục',
    position: 'Bắc',
    primaryLabel: 'Hàn Thiên',
    secondaryLabel: 'Phủ',
    primaryCount: 6,
    secondaryCount: 72,
    theme: 'Cực hàn băng phách, tuyết nguyên vô tận, cực quang và cự yêu Bắc Minh',
    primaryElements: Object.freeze([ELEMENT_TYPES.THUY, ELEMENT_TYPES.PHONG, ELEMENT_TYPES.LOI]),
    bgmKey: 'bgm_north_bac_minh',
    ambientTheme: 'frozen_arctic_dark_sea',
    desc: 'Bắc Minh Đại Lục gồm 6 tầng Hàn Thiên và 72 Phủ bám theo băng mạch vạn năm, hàn hồ và Bắc Minh hải.'
  }),
  [CONTINENT_IDS.CENTRAL]: Object.freeze({
    id: 'central',
    nodeId: `${HUMAN_REALM_ROOT_ID}.continent.central`,
    name: 'Trung Vực Đại Lục',
    position: 'Trung',
    primaryLabel: 'Thánh Vực',
    secondaryLabel: 'Châu',
    primaryCount: 12,
    secondaryCount: 144,
    theme: 'Linh mạch tối thượng, thiên đô tráng lệ, thánh địa cổ tộc và hư không bí cảnh',
    primaryElements: Object.freeze([ELEMENT_TYPES.LOI, ELEMENT_TYPES.HOA, ELEMENT_TYPES.KIM, ELEMENT_TYPES.THO]),
    bgmKey: 'bgm_central_trung_vuc',
    ambientTheme: 'holy_capital_heaven_realm',
    desc: 'Trung Vực Đại Lục gồm 12 Thánh Vực và 144 Châu; trung tâm linh khí và quyền lực tối thượng của toàn cõi Nhân Giới.'
  })
});

// -----------------------------------------------------------------------------
// 3. DANH MỤC SPECIAL MAP OVERRIDES (CÁC MAP THIẾT KẾ ĐẶC BIỆT)
// -----------------------------------------------------------------------------

export const SPECIAL_MAP_OVERRIDES = Object.freeze([
  // ---------------------------------------------------------------------------
  // map_thanh_van_thon: THANH VÂN THÔN (KHỞI NGUYÊN HUB - AN TOÀN)
  // ---------------------------------------------------------------------------
  Object.freeze({
    id: CANONICAL_MAP_KEYS.THANH_VAN_THON,
    canonicalKey: CANONICAL_MAP_KEYS.THANH_VAN_THON,
    key: CANONICAL_MAP_KEYS.THANH_VAN_THON,
    name: 'Thanh Vân Thôn',
    subName: 'Thôn Trấn Khởi Nguyên · An Toàn Tuyệt Đối',
    type: ZONE_TYPES.SAFE_VILLAGE,
    uiMode: UI_MODES.VILLAGE_HUB,
    isPeaceZone: true,
    
    geography: Object.freeze({
      continentId: CONTINENT_IDS.SOUTH,
      continent: 'Nam Lăng Đại Lục',
      greatRegion: 'Thanh Linh Vực',
      province: 'Thanh Châu',
      nation: 'Đại Ly Quốc',
      commandery: 'Nam Sơn Quận',
      city: 'Thanh Hà Thành Vực',
      location: 'Thanh Vân Thôn',
      nodeId: STARTER_WORLD_IDS.map0
    }),

    dimensions: Object.freeze({
      width: 540,
      height: 960,
      baseGroundY: 820
    }),

    assets: Object.freeze({
      bgKey: 'bg_village_hub',
      bgPath: 'environment/THON TRAN.webp',
      panoramaKey: 'bg_village_hub',
      panoramaAsset: 'environment/THON TRAN.webp',
      sourceWidth: 784,
      sourceHeight: 1334,
      worldWidth: 540,
      worldHeight: 960,
      bgmKey: 'bgm_village_peace',
      noRepeat: true,
      repeatPanorama: false,
      field: Object.freeze({ left: 30, right: 510, top: 120, bottom: 840 }),
      spawn: Object.freeze({ x: 270, y: 480 })
    }),

    access: Object.freeze({
      minRealmIdx: 0,
      minRealmName: 'Phàm Nhân',
      requiresQuestId: null,
          }),

    hubContent: Object.freeze({
      essentialBuildings: Object.freeze([
        Object.freeze({ id: 'truong_thon', name: 'Phủ Trưởng Thôn', x: 270, y: 130, hitRadius: 55, role: 'village_chief', func: 'Nhiệm Vụ Khởi Đầu' }),
        Object.freeze({ id: 'thuong_hoi', name: 'Thương Hội', x: 397, y: 257, hitRadius: 55, role: 'market', func: 'Giao Dịch, Phù Lục & Đổi Tiền' }),
        Object.freeze({ id: 'tho_ren', name: 'Tiệm Thợ Rèn', x: 117, y: 322, hitRadius: 55, role: 'blacksmith', func: 'Cường Hóa & Rèn Đúc Trang Bị' }),
        Object.freeze({ id: 'duoc_diem', name: 'Dược Điếm', x: 418, y: 495, hitRadius: 55, role: 'clinic', func: 'Luyện Đan & Dược Liệu' }),
        Object.freeze({ id: 'vo_quan', name: 'Võ Quán', x: 157, y: 640, hitRadius: 55, role: 'martial_hall', func: 'Diễn Võ & Công Pháp Cơ Bản' }),
        Object.freeze({ id: 've_si_cong', name: 'Cổng Xuất Thôn', x: 270, y: 735, hitRadius: 60, role: 'portal_exit', func: 'Rời Thôn Ra Dã Ngoại' })
      ]),
      bgmTrack: 'bgm_village_peace'
    }),

    combatContent: null
  }),

  // ---------------------------------------------------------------------------
  // map_thanh_van_ngoai_vi: THANH VÂN NGOẠI VI (DÃ NGOẠI KHỞI ĐẦU)
  // ---------------------------------------------------------------------------
  Object.freeze({
    id: CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI,
    canonicalKey: CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI,
    key: CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI,
    name: 'Thanh Vân Ngoại Vi',
    subName: 'Sơn Đạo Khởi Nguyên · Săn Quái & Thu Thập',
    type: ZONE_TYPES.COMBAT_WILDERNESS,
    uiMode: UI_MODES.COMBAT_BATTLEFIELD,
    isPeaceZone: false,

    geography: Object.freeze({
      continentId: CONTINENT_IDS.SOUTH,
      continent: 'Nam Lăng Đại Lục',
      greatRegion: 'Thanh Linh Vực',
      province: 'Thanh Châu',
      nation: 'Đại Ly Quốc',
      commandery: 'Nam Sơn Quận',
      city: 'Thanh Hà Thành Vực',
      location: 'Thanh Vân Ngoại Vi',
      nodeId: STARTER_WORLD_IDS.map1
    }),

    dimensions: Object.freeze({
      width: 3584,
      height: 3584,
      baseGroundY: 3584
    }),

    assets: Object.freeze({
      bgKey: 'map_panorama_wilderness_shared',
      bgPath: 'environment/map_1_thanh_van_ngoai_vi.jpg',
      panoramaKey: 'map_panorama_wilderness_shared',
      panoramaAsset: 'environment/map_1_thanh_van_ngoai_vi.jpg',
      sourceWidth: 3584,
      sourceHeight: 3584,
      worldWidth: 3584,
      worldHeight: 3584,
      bgmKey: 'bgm_wilderness_combat',
      noRepeat: true,
      repeatPanorama: false,
      isIsometric: true,
      field: Object.freeze({ left: 120, right: 3464, top: 120, bottom: 3464 }),
      spawn: Object.freeze({ x: 1792, y: 1792 })
    }),

    access: Object.freeze({
      minRealmIdx: 0,
      minRealmName: 'Phàm Nhân',
      requiresQuestId: null,
          }),

    hubContent: null,

    combatContent: Object.freeze({
      zones: Object.freeze([
        Object.freeze({
          id: 'meadow',
          name: 'Thanh Thảo Nguyên',
          x0: 650,
          x1: 8000,
          realmRange: Object.freeze([0, 1]),
          elementAffinities: Object.freeze([ELEMENT_TYPES.MOC, ELEMENT_TYPES.THO]),
          monsterRanks: Object.freeze(['m_0_1', 'm_0_2']),
          monsterSprites: Object.freeze([1, 2]),
          flyingMonsterSprites: Object.freeze([1]),
          herbTiers: Object.freeze([1]),
          oreTiers: Object.freeze([1]),
          densityDistance: 350
        }),
        Object.freeze({
          id: 'foothills',
          name: 'Linh Khê Sơn Cước',
          x0: 8000,
          x1: 16000,
          realmRange: Object.freeze([1, 2]),
          elementAffinities: Object.freeze([ELEMENT_TYPES.THUY, ELEMENT_TYPES.MOC]),
          monsterRanks: Object.freeze(['m_0_2', 'm_0_3']),
          monsterSprites: Object.freeze([2, 3]),
          flyingMonsterSprites: Object.freeze([1, 2]),
          herbTiers: Object.freeze([1, 2]),
          oreTiers: Object.freeze([1, 2]),
          densityDistance: 300
        }),
        Object.freeze({
          id: 'deep_forest',
          name: 'Hắc Mộc U Lâm',
          x0: 16000,
          x1: 24000,
          realmRange: Object.freeze([2, 3]),
          elementAffinities: Object.freeze([ELEMENT_TYPES.MOC, ELEMENT_TYPES.HOA]),
          monsterRanks: Object.freeze(['m_0_3', 'm_0_4']),
          monsterSprites: Object.freeze([3, 4]),
          flyingMonsterSprites: Object.freeze([2, 3]),
          herbTiers: Object.freeze([2, 3]),
          oreTiers: Object.freeze([2, 3]),
          densityDistance: 250
        }),
        Object.freeze({
          id: 'outpost',
          name: 'Tiền Tiêu Cổ Tích',
          x0: 24000,
          x1: 31940,
          realmRange: Object.freeze([3, 3]),
          elementAffinities: Object.freeze([ELEMENT_TYPES.KIM, ELEMENT_TYPES.LOI]),
          monsterRanks: Object.freeze(['m_0_4', 'm_1_1']),
          monsterSprites: Object.freeze([4, 5]),
          flyingMonsterSprites: Object.freeze([3, 4]),
          herbTiers: Object.freeze([3]),
          oreTiers: Object.freeze([3]),
          densityDistance: 200
        })
      ]),
      resourceSpawns: Object.freeze({
        herbIds: Object.freeze(['herb_1', 'herb_2', 'herb_3', 'herb_4']),
        oreTiers: Object.freeze([1, 2, 3])
      })
    })
  }),

]);

export const MASTER_MAP_DEFINITIONS = SPECIAL_MAP_OVERRIDES;
export const MASTER_TERRITORY_MANIFEST = Object.freeze([]);

// Territory lookup APIs remain available while the hierarchy is supplied by
// worldRegistry.  Initialising these indexes prevents a ReferenceError in any
// legacy caller that asks for territory metadata before a hierarchy adapter
// supplies entries.
const territoryByIdMap = new Map();
const territoryByCanonicalKeyMap = new Map();
const territoryByNodeIdMap = new Map();
const territoriesByContinentMap = new Map();
const territoriesByRegionMap = new Map();

// -----------------------------------------------------------------------------
// 4. LOOKUP O(1) CHO CÁC SPECIAL MAP OVERRIDES
// -----------------------------------------------------------------------------

const specialOverrideByIdMap = new Map();
const specialOverrideByCanonicalKeyMap = new Map();
const specialOverrideByNodeIdMap = new Map();

for (const m of SPECIAL_MAP_OVERRIDES) {
  specialOverrideByIdMap.set(String(m.id), m);
  specialOverrideByCanonicalKeyMap.set(m.canonicalKey, m);
  if (m.key) specialOverrideByCanonicalKeyMap.set(m.key, m);
  if (m.geography?.nodeId) specialOverrideByNodeIdMap.set(m.geography.nodeId, m);
}

export function findSpecialMapOverride(identifier) {
  if (identifier === undefined || identifier === null) return null;

  const str = String(identifier).trim();
  // 1. Tra theo canonical string key
  if (specialOverrideByIdMap.has(str)) return specialOverrideByIdMap.get(str);
  // 2. Tra theo node ID (world hierarchy)
  if (specialOverrideByNodeIdMap.has(str)) return specialOverrideByNodeIdMap.get(str);
  // 3. Tra theo canonical key alias
  if (specialOverrideByCanonicalKeyMap.has(str)) return specialOverrideByCanonicalKeyMap.get(str);

  return null;
}

export function getSpecialMapOverride(identifier) {
  return findSpecialMapOverride(identifier) || SPECIAL_MAP_OVERRIDES[0];
}

export function findMasterMapById(identifier) {
  return findSpecialMapOverride(identifier);
}

export function getMasterMapById(identifier) {
  return getSpecialMapOverride(identifier);
}

export function getAllMasterMaps() {
  return SPECIAL_MAP_OVERRIDES;
}

export function isMapSafeHub(mapIdentifier) {
  const map = getMasterMapById(mapIdentifier);
  return map.isPeaceZone === true || map.type === ZONE_TYPES.SAFE_VILLAGE || map.type === ZONE_TYPES.SAFE_CITY || map.type === ZONE_TYPES.SAFE_SECT || map.type === ZONE_TYPES.SAFE_CLAN;
}

export function getMapUiMode(mapIdentifier) {
  const map = getMasterMapById(mapIdentifier);
  return map.uiMode || (map.isPeaceZone ? UI_MODES.VILLAGE_HUB : UI_MODES.COMBAT_BATTLEFIELD);
}

export function getMapCombatZones(mapIdentifier) {
  const map = getMasterMapById(mapIdentifier);
  return map?.combatContent?.zones || [];
}

export function getAllTerritories() {
  return MASTER_TERRITORY_MANIFEST;
}

export function getTerritoryById(id) {
  return territoryByIdMap.get(id) || territoryByCanonicalKeyMap.get(id) || null;
}

export function getTerritoryByNodeId(nodeId) {
  return territoryByNodeIdMap.get(nodeId) || null;
}

export function getTerritoriesByContinent(continentId) {
  return territoriesByContinentMap.get(continentId) || [];
}

export function getTerritoriesByRegion(regionId) {
  return territoriesByRegionMap.get(regionId) || [];
}

export function getContinentsSummary() {
  return Object.values(CONTINENT_DEFINITIONS).map(c => ({
    id: c.id,
    name: c.name,
    position: c.position,
    primaryLabel: c.primaryLabel,
    secondaryLabel: c.secondaryLabel,
    primaryCount: c.primaryCount,
    secondaryCount: c.secondaryCount,
    territories: getTerritoriesByContinent(c.id).length
  }));
}

export function getWorldScaleStats() {
  return {
    continents: Object.keys(CONTINENT_DEFINITIONS).length,
    totalTerritories: MASTER_TERRITORY_MANIFEST.length,
    activeRuntimeMaps: MASTER_MAP_DEFINITIONS.length,
    safeHubsCount: MASTER_TERRITORY_MANIFEST.filter(t => t.isPeaceZone).length,
    combatWildernessCount: MASTER_TERRITORY_MANIFEST.filter(t => t.type === ZONE_TYPES.COMBAT_WILDERNESS).length,
    combatDungeonCount: MASTER_TERRITORY_MANIFEST.filter(t => t.type === ZONE_TYPES.COMBAT_DUNGEON).length
  };
}
