/**
 * masterMapManifest.js
 * =========================================================================
 * MASTER MAP MANIFEST — HỆ THỐNG QUẢN LÝ BẢN ĐỒ TOÀN CÕI NHÂN GIỚI (5 ĐẠI LỤC - 437 CHÂU/ĐẠO/LĨNH/PHỦ)
 * =========================================================================
 * 
 * QUY CHUẨN ĐỒNG NHẤT TOÀN DIỆN:
 * 1. SINGLE AUTHORITATIVE SOURCE OF TRUTH: Toàn bộ bản đồ, khu vực an toàn, khu vực chiến đấu,
 *    asset background, cơ chế hoạt động, quái vật, ngũ hành, tài nguyên, đô thị, bí cảnh và cấm địa
 *    được quy chuẩn hóa và quản lý tập trung tại đây.
 * 2. CHUẨN HÓA ĐỊNH DANH (CANONICAL KEYS): Không còn phụ thuộc vào số thứ tự rời rạc `map 0 1 2`.
 *    Toàn bộ map sử dụng Canonical Key chuẩn hóa:
 *    - `map_thanh_van_thon`     : Thôn Trấn Khởi Nguyên (Safe Village Hub · THON TRAN.png)
 *    - `map_thanh_van_ngoai_vi` : Sơn Đạo Khởi Nguyên (Combat Wilderness)
 *    - `map_van_moc_sam_lam`    : Cổ Lâm Độc Chướng (Combat Wilderness)
 *    - 437 Châu / Đạo / Lĩnh / Phủ: `map_thanh_chau`, `map_van_chau`, `map_lac_chau`...
 * 3. KẾ THỪA TOÀN BỘ 9 NHÓM DỮ LIỆU TỪ ATLAS NHÂN GIỚI (nhan_gioi_437_atlas_chi_tiet.md):
 *    - Bản sắc map & Biome (Primary & Secondary Biome, Địa thế, Visual priority)
 *    - Đô thị & Dân cư (Thủ phủ, Thành thị quan trọng, 5 Trấn, 5 Thôn, Dịch vụ lõi)
 *    - Địa danh khám phá (Cổ Lâm/Dược Cốc, 3 Bí Cảnh, 2 Cấm Địa, Waypoints)
 *    - Tài nguyên & Kinh tế (Sản vật, Khoáng vật, Gather zones, Tài nguyên hiếm)
 *    - Enemy Ecology (Dải cảnh giới realmIdx, Quái thường, Quái tinh anh, Field Boss, Ngũ hành)
 *    - Hazard & Thời tiết (Nguy cơ, Thời tiết thay đổi, Linh lực áp chế, Hiện tượng hiếm)
 *    - Thế lực & Tông môn (Đại tông xuyên vùng, Thế lực lõi địa phương, Xung đột chính)
 *    - Sự kiện & Nhiệm vụ (World events, Quest hooks)
 *    - Blueprint Materialize (Z1 Cửa ngõ -> Z5/Z6 Boss Territory)
 * 4. CỰC KỲ TỐI ƯU & SIÊU NHẸ KHI CHƠI GAME:
 *    - Sử dụng mô hình Schema Generator + O(1) Cached Maps.
 *    - Không nạp dư thừa tài nguyên khi chưa chuyển map.
 */
import {
  HUMAN_REALM_ROOT_ID,
  HUMAN_REALM_CONTINENTS,
  HUMAN_REALM_WORLD_NODES,
  HUMAN_REALM_SCALE,
  STARTER_WORLD_IDS,
  NAM_LANG_ROOT_ID
} from './humanRealmWorld.js?v=20260929-human-realm-v4';
import {
  getHumanRealmDetailProfile,
  HUMAN_REALM_DETAIL_VERSION
} from './humanRealmDetailedAtlas.js?v=20260929-human-realm-detail-v1';

export const MAP_MANIFEST_VERSION = '20260929-master-map-manifest-v4-canonical-unified';

// -----------------------------------------------------------------------------
// 1. CÁC HẰNG SỐ VÀ ENUM QUY CHUẨN
// -----------------------------------------------------------------------------

export const ZONE_TYPES = Object.freeze({
  SAFE_VILLAGE: 'safe_village',     // Thôn Trấn an toàn (Hub)
  SAFE_CITY: 'safe_city',           // Thành Thị an toàn (Hub)
  SAFE_SECT: 'safe_sect',           // Tông Môn an toàn (Hub)
  COMBAT_WILDERNESS: 'combat_wild', // Dã Ngoại chiến đấu
  COMBAT_DUNGEON: 'combat_dungeon'  // Bí Cảnh / Cấm Địa chiến đấu
});

export const UI_MODES = Object.freeze({
  VILLAGE_HUB: 'village_hub',               // Giao diện Hub Thôn Trấn (Interactive image / buildings)
  CITY_HUB: 'city_hub',                     // Giao diện Hub Thành Thị (THANH THI.PNG)
  SECT_HUB: 'sect_hub',                     // Giao diện Hub Tông Môn (TONG MON.PNG)
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
  THANH_VAN_NGOAI_VI: 'map_thanh_van_ngoai_vi',
  VAN_MOC_SAM_LAM: 'map_van_moc_sam_lam'
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
// 3. QUY TRÌNH RESOLVE ASSET & PHÂN LOẠI KHU VỰC
// -----------------------------------------------------------------------------

function classifyTerritoryZoneType(node, index) {
  if (node.id === STARTER_WORLD_IDS.province) return ZONE_TYPES.SAFE_VILLAGE;
  const mod = index % 5;
  if (mod === 0) return ZONE_TYPES.SAFE_CITY;         // Thành Thị trung tâm (Hub lớn)
  if (mod === 1) return ZONE_TYPES.SAFE_SECT;         // Tông Môn / Sơn môn thánh địa
  if (mod === 2 || mod === 3) return ZONE_TYPES.COMBAT_WILDERNESS; // Dã ngoại săn quái
  return ZONE_TYPES.COMBAT_DUNGEON;                  // Bí cảnh / Hang động / Cấm địa
}

function classifyTerritoryUiMode(zoneType) {
  switch (zoneType) {
    case ZONE_TYPES.SAFE_VILLAGE: return UI_MODES.VILLAGE_HUB;
    case ZONE_TYPES.SAFE_CITY: return UI_MODES.CITY_HUB;
    case ZONE_TYPES.SAFE_SECT: return UI_MODES.SECT_HUB;
    default: return UI_MODES.COMBAT_BATTLEFIELD;
  }
}

function resolveAssetProfile(continentId, zoneType, theme) {
  const isHub = zoneType === ZONE_TYPES.SAFE_VILLAGE || zoneType === ZONE_TYPES.SAFE_CITY || zoneType === ZONE_TYPES.SAFE_SECT;
  let bgKey = 'map_panorama_wilderness_shared';
  let bgPath = 'environment/map_1_thanh_van_ngoai_vi.png';
  let sourceWidth = 3200;
  let sourceHeight = 960;

  if (zoneType === ZONE_TYPES.SAFE_VILLAGE) {
    bgKey = 'bg_village_hub';
    bgPath = 'environment/THON TRAN.png';
    sourceWidth = 784;
    sourceHeight = 1334;
  } else if (zoneType === ZONE_TYPES.SAFE_CITY) {
    bgKey = 'bg_city_hub';
    bgPath = 'environment/THANH THI.PNG';
    sourceWidth = 941;
    sourceHeight = 1672;
  } else if (zoneType === ZONE_TYPES.SAFE_SECT) {
    bgKey = 'bg_sect_hub';
    bgPath = 'environment/TONG MON.PNG';
    sourceWidth = 848;
    sourceHeight = 1264;
  }

  return Object.freeze({
    bgKey,
    bgPath,
    panoramaKey: bgKey,
    panoramaAsset: bgPath,
    sourceWidth,
    sourceHeight,
    worldWidth: isHub ? 540 : 32000,
    worldHeight: 960,
    tilesetTheme: theme || 'temperate_grassland',
    bgmTrack: CONTINENT_DEFINITIONS[continentId]?.bgmKey || 'bgm_south_nam_lang',
    noRepeat: isHub,
    repeatPanorama: !isHub
  });
}

function slugifyVi(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// -----------------------------------------------------------------------------
// 4. DANH MỤC TOÀN BỘ 437 CHÂU · ĐẠO · LĨNH · PHỦ (NHÂN GIỚI ATLAS MANIFEST)
// -----------------------------------------------------------------------------

function buildTerritoryManifest() {
  const territories = [];
  const provinceNodes = HUMAN_REALM_WORLD_NODES.filter(node => node.type === 'province');
  const seenKeys = new Map();

  provinceNodes.forEach((node, index) => {
    const continentId = node.continentId || (node.id.startsWith('nl.') ? 'south' : 'south');
    const continentDef = CONTINENT_DEFINITIONS[continentId] || CONTINENT_DEFINITIONS.south;
    const detailProfile = getHumanRealmDetailProfile(node.id);
    const zoneType = classifyTerritoryZoneType(node, index);
    const uiMode = classifyTerritoryUiMode(zoneType);
    const isPeaceZone = zoneType === ZONE_TYPES.SAFE_VILLAGE || zoneType === ZONE_TYPES.SAFE_CITY || zoneType === ZONE_TYPES.SAFE_SECT;
    const assets = resolveAssetProfile(continentId, zoneType, node.theme);

    const minRealm = node.enemyProfile?.minRealmIdx ?? (continentId === 'south' ? 0 : 6);
    const maxRealm = node.enemyProfile?.maxRealmIdx ?? (minRealm + 3);
    const bossRealm = node.enemyProfile?.bossRealmIdx ?? (maxRealm + 1);

    const rawSlug = slugifyVi(node.name);
    let canonicalKey = `map_${rawSlug}`;
    if (seenKeys.has(canonicalKey)) {
      const count = seenKeys.get(canonicalKey) + 1;
      seenKeys.set(canonicalKey, count);
      canonicalKey = `map_${rawSlug}_${count}`;
    } else {
      seenKeys.set(canonicalKey, 1);
    }

    const runtimeMapId = 3 + index;
    const manifestEntry = Object.freeze({
      id: runtimeMapId,
      canonicalKey,
      key: canonicalKey,
      nodeId: node.id,
      name: node.name,
      displayTypeLabel: node.displayTypeLabel || continentDef.secondaryLabel.toUpperCase(),
      unitType: continentDef.secondaryLabel,
      continentId,
      continentName: continentDef.name,
      primaryRegionId: node.regionId || node.parentId,
      primaryRegionName: node.regionName || node.parentId,
      
      // 1. Phân loại & Chế độ hoạt động
      type: zoneType,
      uiMode,
      isPeaceZone,
      
      // 2. Cảnh giới & Ngũ Hành
      realmRange: Object.freeze([minRealm, maxRealm]),
      bossRealmIdx: bossRealm,
      dominantElements: Object.freeze(node.enemyProfile?.dominantElements || [...continentDef.primaryElements]),
      
      // 3. Asset & Visual
      assets,
      
      // 4. Bản sắc map & Biome
      biome: Object.freeze({
        primary: detailProfile?.identity?.primaryBiome || 'sơn lâm',
        secondary: detailProfile?.identity?.secondaryBiome || 'linh điền',
        terrain: detailProfile?.identity?.terrain || 'thung lũng linh mạch',
        visualPriority: detailProfile?.identity?.visualPriority || 'thôn trấn quanh linh điền'
      }),

      // 5. Đô thị & Dân cư
      settlements: Object.freeze({
        capital: node.capital || detailProfile?.settlements?.capital || `${node.name} Thành`,
        notableCities: Object.freeze(node.notableCities || detailProfile?.settlements?.cities || []),
        notableTowns: Object.freeze(node.notableTowns || detailProfile?.settlements?.towns || []),
        notableVillages: Object.freeze(node.notableVillages || detailProfile?.settlements?.villages || []),
        coreServices: Object.freeze(detailProfile?.settlements?.services || ['phường thị', 'đan dược', 'luyện khí', 'truyền tống'])
      }),

      // 6. Địa danh khám phá
      exploration: Object.freeze({
        landmarks: Object.freeze(detailProfile?.exploration?.landmarks || [`${node.name} Cổ Lâm`, `${node.name} Dược Cốc`]),
        secretRealms: Object.freeze(node.secretRealms || detailProfile?.exploration?.secretRealms || []),
        forbiddenZones: Object.freeze(node.forbiddenZones || detailProfile?.exploration?.forbiddenZones || []),
        mainWaypoint: node.capital || `${node.name} Thành`
      }),

      // 7. Tài nguyên & Kinh tế
      resourceProfile: Object.freeze({
        products: Object.freeze(node.products || detailProfile?.resources?.products || []),
        minerals: Object.freeze(node.minerals || detailProfile?.resources?.minerals || []),
        rareResource: detailProfile?.resources?.rareProduct || node.products?.[0] || 'Linh Dược',
        gatherZones: Object.freeze(detailProfile?.resources?.gatherZones || ['dược khu', 'khoáng khu'])
      }),

      // 8. Kẻ địch & Sinh thái (Enemy Ecology)
      enemyProfile: Object.freeze({
        commonEnemies: Object.freeze(node.enemyProfile?.commonEnemies || detailProfile?.combat?.commonEnemies || ['Dã Thú', 'Yêu Lang']),
        eliteEnemy: node.enemyProfile?.eliteEnemy || detailProfile?.combat?.eliteEnemy || `${node.name} Tinh Anh`,
        fieldBoss: node.enemyProfile?.fieldBoss || detailProfile?.combat?.fieldBoss || `${node.name} Lãnh Chúa`,
        spawnDensity: isPeaceZone ? 0 : (300 - Math.min(150, minRealm * 5))
      }),

      // 9. Hazard & Thời tiết
      hazardAndWeather: Object.freeze({
        hazards: Object.freeze(detailProfile?.hazards?.environmental || ['thú triều', 'sơn tặc tu sĩ']),
        weather: Object.freeze(detailProfile?.hazards?.weather || ['linh vũ', 'sương núi']),
        suppressionThreshold: minRealm,
        rarePhenomenon: detailProfile?.hazards?.rarePhenomenon || 'linh vũ'
      }),

      // 10. Thế lực (Đang để trống để thiết kế mới)
      factionProfile: Object.freeze({
        dominantFaction: null,
        localFactions: Object.freeze([]),
        coreConflict: null
      }),

      // 11. Sự kiện & Nhiệm vụ
      eventsAndQuests: Object.freeze({
        worldEvents: Object.freeze(detailProfile?.events?.worldEvents || ['linh dược thành thục', 'yêu thú công thành']),
        questHooks: Object.freeze(detailProfile?.events?.questHooks || ['trấn áp yêu thú', 'thu thập linh dược'])
      }),

      // 12. Blueprint Materialize Zones (Z1 - Z6)
      blueprintZones: Object.freeze(detailProfile?.blueprint?.zones || []),
      
      // Trạng thái Materialized trong Game runtime
      materializedPlayableMapId: node.id === STARTER_WORLD_IDS.province ? 0 : null
    });

    territories.push(manifestEntry);
  });

  return Object.freeze(territories);
}

export const MASTER_TERRITORY_MANIFEST = buildTerritoryManifest();

// -----------------------------------------------------------------------------
// 5. RUNTIME PLAYABLE MAPS (CANONICAL MAP IDENTIFIERS)
// -----------------------------------------------------------------------------

export const MASTER_MAP_DEFINITIONS = Object.freeze([
  // ---------------------------------------------------------------------------
  // MAP 0 / map_thanh_van_thon: THANH VÂN THÔN (KHỞI NGUYÊN HUB - AN TOÀN)
  // ---------------------------------------------------------------------------
  Object.freeze({
    id: 0,
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
      bgPath: 'environment/THON TRAN.png',
      panoramaKey: 'bg_village_hub',
      panoramaAsset: 'environment/THON TRAN.png',
      sourceWidth: 784,
      sourceHeight: 1334,
      worldWidth: 540,
      worldHeight: 960,
      bgmKey: 'bgm_village_peace',
      noRepeat: true,
      repeatPanorama: false,
      field: Object.freeze({ left: 30, right: 510, top: 200, bottom: 900 }),
      spawn: Object.freeze({ x: 270, y: 650 })
    }),

    access: Object.freeze({
      minRealmIdx: 0,
      minRealmName: 'Phàm Nhân',
      requiresQuestId: null,
          }),

    hubContent: Object.freeze({
      essentialBuildings: Object.freeze([
        Object.freeze({ id: 'truong_thon', name: 'Phủ Trưởng Thôn', x: 270, y: 110, hitRadius: 85, role: 'village_chief', func: 'Nhiệm Vụ Khởi Đầu' }),
        Object.freeze({ id: 'duoc_diem', name: 'Y Quán', x: 120, y: 240, hitRadius: 75, role: 'clinic', func: 'Hồi Phục & Mua Đan Dược' }),
        Object.freeze({ id: 'nong_phu', name: 'Tiệm Tạp Hóa', x: 420, y: 240, hitRadius: 75, role: 'general_store', func: 'Bán Phù Lục & Vật Phẩm' }),
        Object.freeze({ id: 'tho_ren', name: 'Tiệm Rèn', x: 120, y: 410, hitRadius: 75, role: 'blacksmith', func: 'Cường Hóa & Rèn Đúc' }),
        Object.freeze({ id: 'vo_quan', name: 'Võ Quán', x: 420, y: 410, hitRadius: 75, role: 'martial_hall', func: 'Luyện Công & Tẩy Điểm' }),
        Object.freeze({ id: 'thuong_hoi', name: 'Chợ Phiên', x: 270, y: 520, hitRadius: 85, role: 'market', func: 'Giao Dịch & Gian Hàng' }),
        Object.freeze({ id: 'tuu_lau', name: 'Bảng Nhiệm Vụ', x: 120, y: 660, hitRadius: 75, role: 'quest_board', func: 'Treo Thưởng & Trừ Yêu' }),
        Object.freeze({ id: 'hoi_quan', name: 'Hội Quán', x: 420, y: 660, hitRadius: 75, role: 'guild_hall', func: 'Giao Lưu & Luận Bàn' }),
        Object.freeze({ id: 've_si_cong', name: 'Cổng Xuất Thôn', x: 270, y: 825, hitRadius: 90, role: 'portal_exit', func: 'Tiến Ra Ngoại Vi' })
      ]),
      bgmTrack: 'bgm_village_peace'
    }),

    combatContent: null
  }),

  // ---------------------------------------------------------------------------
  // MAP 1 / map_thanh_van_ngoai_vi: THANH VÂN NGOẠI VI (DÃ NGOẠI KHỞI ĐẦU)
  // ---------------------------------------------------------------------------
  Object.freeze({
    id: 1,
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
      width: 32000,
      height: 960,
      baseGroundY: 820
    }),

    assets: Object.freeze({
      bgKey: 'map_panorama_wilderness_shared',
      bgPath: 'environment/map_1_thanh_van_ngoai_vi.png',
      panoramaKey: 'map_panorama_wilderness_shared',
      panoramaAsset: 'environment/map_1_thanh_van_ngoai_vi.png',
      sourceWidth: 3200,
      sourceHeight: 960,
      worldWidth: 32000,
      worldHeight: 960,
      bgmKey: 'bgm_wilderness_combat',
      noRepeat: false,
      repeatPanorama: true,
      field: Object.freeze({ left: 60, right: 31940, top: 350, bottom: 900 }),
      spawn: Object.freeze({ x: 350, y: 620 })
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

  // ---------------------------------------------------------------------------
  // MAP 2 / map_van_moc_sam_lam: VẠN MỘC SÂM LÂM (DÃ NGOẠI TRUNG CẤP)
  // ---------------------------------------------------------------------------
  Object.freeze({
    id: 2,
    canonicalKey: CANONICAL_MAP_KEYS.VAN_MOC_SAM_LAM,
    key: CANONICAL_MAP_KEYS.VAN_MOC_SAM_LAM,
    name: 'Vạn Mộc Sâm Lâm',
    subName: 'Cổ Lâm Độc Chướng · Dã Ngoại Trung Cấp',
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
      location: 'Vạn Mộc Sâm Lâm',
      nodeId: STARTER_WORLD_IDS.map2
    }),

    dimensions: Object.freeze({
      width: 32000,
      height: 960,
      baseGroundY: 820
    }),

    assets: Object.freeze({
      bgKey: 'map_panorama_wilderness_shared',
      bgPath: 'environment/map_1_thanh_van_ngoai_vi.png',
      panoramaKey: 'map_panorama_wilderness_shared',
      panoramaAsset: 'environment/map_1_thanh_van_ngoai_vi.png',
      sourceWidth: 3200,
      sourceHeight: 960,
      worldWidth: 32000,
      worldHeight: 960,
      bgmKey: 'bgm_wilderness_combat',
      noRepeat: false,
      repeatPanorama: true,
      field: Object.freeze({ left: 60, right: 31940, top: 350, bottom: 900 }),
      spawn: Object.freeze({ x: 350, y: 620 })
    }),

    access: Object.freeze({
      minRealmIdx: 3,
      minRealmName: 'Luyện Khí Tầng 3',
      requiresQuestId: null,
          }),

    hubContent: null,

    combatContent: Object.freeze({
      zones: Object.freeze([
        Object.freeze({
          id: 'outer',
          name: 'Vạn Mộc Ngoại Lâm',
          x0: 650,
          x1: 8000,
          realmRange: Object.freeze([3, 5]),
          elementAffinities: Object.freeze([ELEMENT_TYPES.MOC, ELEMENT_TYPES.THUY]),
          monsterRanks: Object.freeze(['m_1_1', 'm_1_2']),
          monsterSprites: Object.freeze([5, 4]),
          flyingMonsterSprites: Object.freeze([1, 2, 3]),
          herbTiers: Object.freeze([2, 3, 4]),
          oreTiers: Object.freeze([2, 3]),
          densityDistance: 320
        }),
        Object.freeze({
          id: 'jade_leaf',
          name: 'Bích Diệp Lâm',
          x0: 8000,
          x1: 16000,
          realmRange: Object.freeze([6, 8]),
          elementAffinities: Object.freeze([ELEMENT_TYPES.MOC, ELEMENT_TYPES.PHONG]),
          monsterRanks: Object.freeze(['m_1_2', 'm_1_3']),
          monsterSprites: Object.freeze([4, 9]),
          flyingMonsterSprites: Object.freeze([3, 4, 5]),
          herbTiers: Object.freeze([3, 4, 5]),
          oreTiers: Object.freeze([3, 4]),
          densityDistance: 260
        }),
        Object.freeze({
          id: 'ancient',
          name: 'Thiên Niên Cổ Lâm',
          x0: 16000,
          x1: 24000,
          realmRange: Object.freeze([9, 11]),
          elementAffinities: Object.freeze([ELEMENT_TYPES.MOC, ELEMENT_TYPES.LOI]),
          monsterRanks: Object.freeze(['m_1_3', 'm_1_4']),
          monsterSprites: Object.freeze([9, 7]),
          flyingMonsterSprites: Object.freeze([5, 6, 7]),
          herbTiers: Object.freeze([4, 5, 6]),
          oreTiers: Object.freeze([4, 5]),
          densityDistance: 200
        }),
        Object.freeze({
          id: 'abyss',
          name: 'Vạn Mộc Thâm Uyên',
          x0: 24000,
          x1: 31940,
          realmRange: Object.freeze([12, 12]),
          elementAffinities: Object.freeze([ELEMENT_TYPES.MOC, ELEMENT_TYPES.HOA]),
          monsterRanks: Object.freeze(['m_1_4', 'm_2_1']),
          monsterSprites: Object.freeze([7, 12]),
          flyingMonsterSprites: Object.freeze([7, 8, 9]),
          herbTiers: Object.freeze([5, 6, 7]),
          oreTiers: Object.freeze([5]),
          densityDistance: 150
        })
      ]),
      resourceSpawns: Object.freeze({
        herbIds: Object.freeze(['herb_3', 'herb_4', 'herb_5', 'herb_6', 'herb_7']),
        oreTiers: Object.freeze([3, 4, 5])
      })
    })
  })
]);

// -----------------------------------------------------------------------------
// 6. CACHED MAPS VÀ TIỆN ÍCH TRUY XUẤT NHANH O(1)
// -----------------------------------------------------------------------------

const mapByIdMap = new Map();
const mapByCanonicalKeyMap = new Map();
const mapByNodeIdMap = new Map();

for (const m of MASTER_MAP_DEFINITIONS) {
  mapByIdMap.set(Number(m.id), m);
  mapByCanonicalKeyMap.set(m.canonicalKey, m);
  if (m.key) mapByCanonicalKeyMap.set(m.key, m);
  if (m.geography?.nodeId) mapByNodeIdMap.set(m.geography.nodeId, m);
}

const territoryByNodeIdMap = new Map(MASTER_TERRITORY_MANIFEST.map(t => [t.nodeId, t]));
const territoryByIdMap = new Map(MASTER_TERRITORY_MANIFEST.map(t => [t.id, t]));
const territoryByCanonicalKeyMap = new Map(MASTER_TERRITORY_MANIFEST.map(t => [t.canonicalKey, t]));

const territoriesByContinentMap = new Map();
const territoriesByRegionMap = new Map();

for (const t of MASTER_TERRITORY_MANIFEST) {
  if (!territoriesByContinentMap.has(t.continentId)) territoriesByContinentMap.set(t.continentId, []);
  territoriesByContinentMap.get(t.continentId).push(t);

  if (!territoriesByRegionMap.has(t.primaryRegionId)) territoriesByRegionMap.set(t.primaryRegionId, []);
  territoriesByRegionMap.get(t.primaryRegionId).push(t);
}

export function findMasterMapById(identifier) {
  if (identifier === undefined || identifier === null) return null;
  
  if (typeof identifier === 'number') {
    return mapByIdMap.get(identifier) || territoryByIdMap.get(identifier) || null;
  }
  
  const str = String(identifier).trim();
  if (territoryByNodeIdMap.has(str)) return territoryByNodeIdMap.get(str);
  if (mapByNodeIdMap.has(str)) return mapByNodeIdMap.get(str);
  if (territoryByCanonicalKeyMap.has(str)) return territoryByCanonicalKeyMap.get(str);
  if (mapByCanonicalKeyMap.has(str)) return mapByCanonicalKeyMap.get(str);
  
  const parsedNum = Number(str);
  if (!isNaN(parsedNum)) {
    if (mapByIdMap.has(parsedNum)) return mapByIdMap.get(parsedNum);
    if (territoryByIdMap.has(parsedNum)) return territoryByIdMap.get(parsedNum);
  }

  return null;
}

/**
 * Tra cứu Map Runtime bằng bất kỳ định danh nào (Số, Key chuẩn, hoặc Node ID).
 */
export function getMasterMapById(identifier) {
  return findMasterMapById(identifier) || MASTER_MAP_DEFINITIONS[0];
}

export function getAllMasterMaps() {
  return MASTER_MAP_DEFINITIONS;
}

export function isMapSafeHub(mapIdentifier) {
  const map = getMasterMapById(mapIdentifier);
  return map.isPeaceZone === true || map.type === ZONE_TYPES.SAFE_VILLAGE || map.type === ZONE_TYPES.SAFE_CITY || map.type === ZONE_TYPES.SAFE_SECT;
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
