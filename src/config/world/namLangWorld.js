/**
 * namLangWorld.js
 * Canonical geographic hierarchy for Nam Lăng Đại Lục.
 *
 * IMPORTANT:
 * - DATA ONLY. No Phaser, teleport, panorama or UI logic lives here.
 * - Huge lore scale is stored as profiles/counts; only important/visited nodes are materialized.
 * - Runtime map authority remains worldRegistry.js + WorldMapRuntime.js.
 */
import {
  THANH_LINH_PROVINCES,
  THANH_CHAU_PROFILE,
  DAI_LY_PROFILE,
  NAM_SON_PROFILE,
  THANH_HA_PROFILE,
  THANH_HA_LOCATION_SPECS,
  STARTER_PROGRESSION
} from './starterWorldContent.js?v=20260929-starter-world-v2';

export const WORLD_NODE_TYPES = Object.freeze({
  CONTINENT: 'continent',
  GREAT_REGION: 'great_region',
  PROVINCE: 'province',
  NATION: 'nation',
  COMMANDERY: 'commandery',
  CITY_TERRITORY: 'city_territory',
  LOCATION: 'location'
});

export const WORLD_SCALE_PROFILE = Object.freeze({
  greatRegions: 9,
  provinces: 108,
  provinceNationRange: Object.freeze([80, 280]),
  nationCommanderyRange: Object.freeze([60, 220]),
  commanderyCityRange: Object.freeze([50, 200]),
  citySettlementRange: Object.freeze([60, 260]),
  materializationRule: 'ONLY_IMPORTANT_OR_VISITED'
});

function slugifyVi(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function freezeNested(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeNested));
  if (value && typeof value === 'object') {
    const out = {};
    Object.entries(value).forEach(([key, child]) => { out[key] = freezeNested(child); });
    return Object.freeze(out);
  }
  return value;
}

function makeNode(id, type, name, parentId, extra = {}) {
  return Object.freeze({ id, type, name, parentId: parentId ?? null, ...freezeNested(extra) });
}

const GREAT_REGION_SPECS = [
  {
    id: 'thanh_linh', name: 'Thanh Linh Vực',
    desc: 'Nhân tộc đông đúc, sơn thủy ôn hòa, linh điền và thành trấn dày đặc; vùng khởi đầu của người chơi.',
    theme: 'starter_human', provinces: THANH_LINH_PROVINCES.map(p => p.name), provinceMeta: THANH_LINH_PROVINCES
  },
  {
    id: 'nam_hoang', name: 'Nam Hoang Vực',
    desc: 'Man hoang cổ lâm, độc chướng, yêu thú và bộ tộc cổ; địa bàn săn yêu và ngự thú.',
    theme: 'beast_poison',
    provinces: ['Man Châu','Vạn Độc Châu','Yêu Lâm Châu','Xích Mãng Châu','Hắc Trạch Châu','Cổ Thụ Châu','Thiên Thú Châu','Linh Xà Châu','Hoang Mộc Châu','Vạn Trùng Châu','Nam Man Châu','Thần Mộc Châu']
  },
  {
    id: 'thuong_hai', name: 'Thương Hải Vực',
    desc: 'Bờ biển, quần đảo và tuyến thương hải khổng lồ; hải yêu, phi chu và thương hội phát triển.',
    theme: 'ocean_trade',
    provinces: ['Hải Châu','Thiên Tinh Châu','Bích Hải Châu','Vân Hải Châu','Long Đảo Châu','Thương Lan Châu','Hải Nguyệt Châu','Triều Âm Châu','Hắc Thủy Châu','Tinh La Châu','Vạn Đảo Châu','Thiên Nhai Châu']
  },
  {
    id: 'van_son', name: 'Vạn Sơn Vực',
    desc: 'Sơn mạch liên miên, linh khoáng và địa hỏa; trung tâm luyện khí, khai khoáng và pháp bảo.',
    theme: 'mountain_mining',
    provinces: ['Thạch Châu','Thiên Sơn Châu','Cửu Nhạc Châu','Huyền Thiết Châu','Xích Đồng Châu','Kim Nham Châu','Vạn Khoáng Châu','Địa Hỏa Châu','Long Mạch Châu','Thiết Sơn Châu','Cổ Nhạc Châu','Huyền Phong Châu']
  },
  {
    id: 'dong_huyen', name: 'Đông Huyền Vực',
    desc: 'Kiếm tông san sát, kiếm cốc và kiếm mộ trải khắp; thánh địa của kiếm tu Nam Lăng.',
    theme: 'sword_sects',
    provinces: ['Kiếm Châu','Thái Hư Châu','Vạn Kiếm Châu','Thanh Phong Châu','Tử Tiêu Châu','Huyền Kiếm Châu','Linh Kiếm Châu','Cổ Kiếm Châu','Bạch Đế Châu','Thiên Kiếm Châu','Vô Cực Châu','Xích Tiêu Châu']
  },
  {
    id: 'trung_thien', name: 'Trung Thiên Vực',
    desc: 'Trung tâm linh mạch Nam Lăng, đại thành và đại tông môn hội tụ; khu vực quyền lực cao nhất của đại lục.',
    theme: 'central_high_cultivation',
    provinces: ['Trung Châu','Thiên Đô Châu','Thánh Linh Châu','Thần Đô Châu','Cửu Thiên Châu','Thái Nhất Châu','Hạo Thiên Châu','Tử Vi Châu','Vạn Pháp Châu','Tiên Hà Châu','Càn Khôn Châu','Thiên Nguyên Châu']
  },
  {
    id: 'tay_hoang', name: 'Tây Hoang Vực',
    desc: 'Hoang mạc vô tận, di tích cổ và thành bang ốc đảo; nơi chôn vùi nhiều truyền thừa thất lạc.',
    theme: 'desert_ruins',
    provinces: ['Sa Châu','Hoang Châu','Xích Sa Châu','Cổ Mạc Châu','Hắc Sa Châu','Nhật Viêm Châu','Thạch Lâm Châu','Thiên Mạc Châu','Di Tích Châu','Kim Sa Châu','Huyền Sa Châu','Vô Tận Châu']
  },
  {
    id: 'bac_han', name: 'Bắc Hàn Vực',
    desc: 'Băng nguyên, tuyết sơn và hàn hồ; tài nguyên băng hệ quý hiếm nhưng môi trường khắc nghiệt.',
    theme: 'ice_snow',
    provinces: ['Hàn Châu','Tuyết Châu','Băng Châu','Bắc Minh Châu','Huyền Băng Châu','Thiên Tuyết Châu','Cực Hàn Châu','Bạch Sương Châu','Hàn Nguyệt Châu','Băng Nguyên Châu','Tuyết Sơn Châu','Cửu Hàn Châu']
  },
  {
    id: 'huyet_u', name: 'Huyết U Vực',
    desc: 'Cổ chiến trường, ma địa và âm mạch; vùng nguy hiểm cao, tập trung ma tu và đại cấm địa.',
    theme: 'demonic_battlefield',
    provinces: ['Huyết Châu','U Châu','Cửu U Châu','Ma Châu','Minh Châu','Huyết Ngục Châu','Táng Hồn Châu','Quỷ Châu','Vạn Cốt Châu','Âm Sơn Châu','Cổ Chiến Châu','Ma Uyên Châu']
  }
];

export const NAM_LANG_ROOT_ID = 'nl';
export const STARTER_WORLD_IDS = Object.freeze({
  greatRegion: 'nl.gr.thanh_linh',
  province: 'nl.prov.thanh_linh.thanh_chau',
  nation: 'nl.nation.thanh_chau.dai_ly',
  commandery: 'nl.commandery.dai_ly.nam_son',
  city: 'nl.city.nam_son.thanh_ha',
  thanhHaHub: 'nl.loc.thanh_ha.thanh_ha_thanh',
  map0: 'nl.loc.thanh_ha.thanh_van_thon',
  map1: 'nl.loc.thanh_ha.thanh_van_ngoai_vi',
  map2: 'nl.loc.thanh_ha.van_moc_sam_lam',
  map3: 'nl.loc.thanh_ha.huyet_lac_cam_dia'
});

const nodes = [
  makeNode(NAM_LANG_ROOT_ID, WORLD_NODE_TYPES.CONTINENT, 'Nam Lăng Đại Lục', null, {
    desc: 'Đại lục tu tiên khổng lồ gồm 9 Đại Vực và 108 Châu. Chỉ materialize địa điểm quan trọng hoặc đã được tuyến truyện/người chơi chạm tới.',
    counts: { greatRegions: 9, provinces: 108 },
    materializationRule: WORLD_SCALE_PROFILE.materializationRule,
    progression: STARTER_PROGRESSION
  })
];

for (const region of GREAT_REGION_SPECS) {
  const regionId = `nl.gr.${region.id}`;
  nodes.push(makeNode(regionId, WORLD_NODE_TYPES.GREAT_REGION, region.name, NAM_LANG_ROOT_ID, {
    desc: region.desc,
    theme: region.theme,
    counts: { provinces: 12 }
  }));

  region.provinces.forEach((provinceName, index) => {
    const provinceId = `nl.prov.${region.id}.${slugifyVi(provinceName)}`;
    const meta = region.provinceMeta?.[index] || null;
    const isThanhChau = provinceId === STARTER_WORLD_IDS.province;
    nodes.push(makeNode(provinceId, WORLD_NODE_TYPES.PROVINCE, provinceName, regionId, {
      desc: isThanhChau ? THANH_CHAU_PROFILE.desc : (meta?.desc || `${provinceName} thuộc ${region.name}. Nội dung con materialize theo nhu cầu.`),
      theme: meta?.theme || region.theme,
      provinceIndex: index + 1,
      generationProfile: {
        nations: isThanhChau ? THANH_CHAU_PROFILE.politicalEntityCount : WORLD_SCALE_PROFILE.provinceNationRange,
        materializedByDefault: isThanhChau
      },
      ...(isThanhChau ? {
        counts: {
          politicalEntities: THANH_CHAU_PROFILE.politicalEntityCount,
          majorStates: THANH_CHAU_PROFILE.majorStateCount,
          mediumStates: THANH_CHAU_PROFILE.mediumStateCount,
          smallStates: THANH_CHAU_PROFILE.smallStateCount
        },
        notablePowers: THANH_CHAU_PROFILE.notablePoliticalPowers,
        cultivationFactions: THANH_CHAU_PROFILE.cultivationFactions,
        factionOverlayRule: THANH_CHAU_PROFILE.factionOverlayRule
      } : {})
    }));
  });
}

// Named Thanh Châu powers are materialized as data nodes; the remaining entities stay in the generation profile.
const thanhChauNations = [
  ['dai_ly', 'Đại Ly Quốc', true, 'nation'],
  ['thien_vo', 'Thiên Võ Hoàng Triều', false, 'dynasty'],
  ['dai_chu', 'Đại Chu Hoàng Triều', false, 'dynasty'],
  ['van_kiem', 'Vạn Kiếm Quốc', false, 'sect_state'],
  ['thanh_ho', 'Thanh Hồ Yêu Quốc', false, 'demon_state'],
  ['cuu_son', 'Cửu Sơn Liên Minh', false, 'city_alliance'],
  ['nam_man', 'Nam Man Bộ Tộc', false, 'tribal_union'],
  ['thien_ha', 'Thiên Hà Thủy Quốc', false, 'water_state']
];
for (const [id, name, materialized, governmentType] of thanhChauNations) {
  const isDaiLy = id === 'dai_ly';
  nodes.push(makeNode(`nl.nation.thanh_chau.${id}`, WORLD_NODE_TYPES.NATION, name, STARTER_WORLD_IDS.province, {
    desc: isDaiLy
      ? 'Quốc gia hạng trung ở phía nam Thanh Châu và là quốc gia khởi đầu của người chơi.'
      : 'Thế lực lớn đã biết tên; lãnh thổ chi tiết sẽ materialize khi tuyến truyện hoặc người chơi tiến đến.',
    governmentType,
    generationProfile: { commanderies: isDaiLy ? DAI_LY_PROFILE.commanderyCount : WORLD_SCALE_PROFILE.nationCommanderyRange },
    materialized,
    ...(isDaiLy ? {
      counts: { commanderies: DAI_LY_PROFILE.commanderyCount },
      capital: DAI_LY_PROFILE.capital,
      strategicRegions: DAI_LY_PROFILE.strategicRegions,
      powerScale: DAI_LY_PROFILE.powerScale
    } : {})
  }));
}

// A small named subset is shown; the canonical count remains exactly 108 commanderies.
const daiLyCommanderies = [
  ['nam_son', 'Nam Sơn Quận', true], ['bac_ha', 'Bắc Hà Quận', false], ['dong_lam', 'Đông Lâm Quận', false],
  ['tay_nguyen', 'Tây Nguyên Quận', false], ['thanh_giang', 'Thanh Giang Quận', false], ['van_phong', 'Vạn Phong Quận', false],
  ['hac_son', 'Hắc Sơn Quận', false], ['linh_ho', 'Linh Hồ Quận', false], ['trung_kinh', 'Trung Kinh Trực Lệ', false]
];
for (const [id, name, materialized] of daiLyCommanderies) {
  const isNamSon = id === 'nam_son';
  nodes.push(makeNode(`nl.commandery.dai_ly.${id}`, WORLD_NODE_TYPES.COMMANDERY, name, STARTER_WORLD_IDS.nation, {
    desc: isNamSon ? NAM_SON_PROFILE.desc : 'Đơn vị hành chính thuộc Đại Ly Quốc; chưa dựng Combat Map cụ thể.',
    generationProfile: { cities: isNamSon ? NAM_SON_PROFILE.cityCount : WORLD_SCALE_PROFILE.commanderyCityRange },
    materialized,
    ...(isNamSon ? {
      counts: { cities: NAM_SON_PROFILE.cityCount, townsAtLeast: NAM_SON_PROFILE.minimumTownCount, villagesAtLeast: NAM_SON_PROFILE.minimumVillageCount },
      capital: NAM_SON_PROFILE.capital,
      materializedLocationTarget: NAM_SON_PROFILE.materializedLocationTarget,
      capitalServices: NAM_SON_PROFILE.capitalServices
    } : {})
  }));
}

// Named city-territories are a browseable subset of Nam Sơn's 132 major thành/phủ.
const namSonCities = [
  ['thanh_ha', 'Thanh Hà Thành Vực', true], ['bach_ngoc', 'Bạch Ngọc Thành Vực', false], ['linh_son', 'Linh Sơn Thành Vực', false],
  ['van_thuy', 'Vân Thủy Thành Vực', false], ['huyen_moc', 'Huyền Mộc Thành Vực', false], ['xich_phong', 'Xích Phong Thành Vực', false],
  ['cuu_truc', 'Cửu Trúc Thành Vực', false], ['thien_uyen', 'Thiên Uyên Thành Vực', false], ['lac_ha', 'Lạc Hà Thành Vực', false]
];
for (const [id, name, materialized] of namSonCities) {
  const isThanhHa = id === 'thanh_ha';
  nodes.push(makeNode(`nl.city.nam_son.${id}`, WORLD_NODE_TYPES.CITY_TERRITORY, name, STARTER_WORLD_IDS.commandery, {
    desc: isThanhHa ? THANH_HA_PROFILE.desc : 'Thành Vực thuộc Nam Sơn Quận; chi tiết sẽ materialize theo tuyến khám phá.',
    generationProfile: { settlements: isThanhHa ? THANH_HA_PROFILE.villages + THANH_HA_PROFILE.towns : WORLD_SCALE_PROFILE.citySettlementRange },
    materialized,
    ...(isThanhHa ? {
      counts: {
        villages: THANH_HA_PROFILE.villages,
        towns: THANH_HA_PROFILE.towns,
        mountainRanges: THANH_HA_PROFILE.mountainRanges,
        largeForests: THANH_HA_PROFILE.largeForests,
        miningZones: THANH_HA_PROFILE.miningZones,
        spiritLakes: THANH_HA_PROFILE.spiritLakes,
        cultivationFamilies: THANH_HA_PROFILE.cultivationFamilies,
        minorSects: THANH_HA_PROFILE.minorSects,
        smallSecretRealms: THANH_HA_PROFILE.smallSecretRealms,
        localForbiddenZones: THANH_HA_PROFILE.localForbiddenZones
      },
      materializedLocationTarget: THANH_HA_PROFILE.materializedLocationTarget
    } : {})
  }));
}

for (const spec of THANH_HA_LOCATION_SPECS) {
  const id = `nl.loc.thanh_ha.${spec.slug}`;
  nodes.push(makeNode(id, WORLD_NODE_TYPES.LOCATION, spec.name, STARTER_WORLD_IDS.city, {
    desc: spec.desc,
    playableMapId: Number.isInteger(spec.playableMapId) ? spec.playableMapId : null,
    locationKind: spec.kind,
    status: spec.status,
    materialized: Number.isInteger(spec.playableMapId),
    services: spec.services || null,
    unlockHint: spec.unlockHint || null
  }));
}

export const NAM_LANG_WORLD_NODES = Object.freeze(nodes);
export const GREAT_REGION_DEFS = Object.freeze(
  GREAT_REGION_SPECS.map(region => Object.freeze({ ...region, provinces: Object.freeze([...region.provinces]) }))
);
