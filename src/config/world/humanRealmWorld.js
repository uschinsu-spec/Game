/**
 * humanRealmWorld.js
 * =========================================================================
 * TOÀN CÕI NHÂN GIỚI (5 ĐẠI LỤC - 42 VÙNG CẤP CAO - 437 CHÂU/ĐẠO/LĨNH/PHỦ)
 * =========================================================================
 * 
 * Single authoritative geographic hierarchy for the entire Human Realm.
 * Unified architecture: all 5 continents are declared directly here.
 * No external single-continent dependencies.
 */

import { EXPANDED_HUMAN_REALM_REGIONS, EXPANDED_HUMAN_REALM_ATLAS } from './humanRealmExpandedAtlas.js';

export const HUMAN_REALM_ROOT_ID = 'hr';
export const NAM_LANG_ROOT_ID = 'nl';
export const HUMAN_REALM_VERSION = '20260929-human-realm-unified-v5-expanded-5qg';

export const STARTER_WORLD_IDS = Object.freeze({
  greatRegion: 'nl.gr.thanh_linh',
  province: 'nl.prov.thanh_linh.thanh_chau',
  nation: 'nl.nation.thanh_chau.dai_ly',
  commandery: 'nl.commandery.dai_ly.nam_son',
  city: 'nl.city.nam_son.thanh_ha',
  thanhHaHub: 'nl.loc.thanh_ha.thanh_ha_thanh',
  map0: 'nl.loc.thanh_ha.thanh_van_thon',
  map1: 'nl.loc.thanh_ha.thanh_van_ngoai_vi',
  map2: 'nl.loc.thanh_ha.van_moc_sam_lam'
});

export const WORLD_NODE_TYPES = Object.freeze({
  REALM: 'realm',
  CONTINENT: 'continent',
  GREAT_REGION: 'great_region',
  PROVINCE: 'province',
  NATION: 'nation',
  COMMANDERY: 'commandery',
  CITY_TERRITORY: 'city_territory',
  SETTLEMENT: 'settlement',   // Thôn trung gian (có 2 con: hub an toàn + hoang dã ngoại vi)
  LOCATION: 'location'
});

const CONTINENT_STRUCTURES = Object.freeze({
  south: Object.freeze({ primaryLabel: 'Đại Vực', primaryCount: 9, secondaryLabel: 'Châu', secondaryPerPrimary: 12, secondaryCount: 108 }),
  east: Object.freeze({ primaryLabel: 'Huyền Vực', primaryCount: 8, secondaryLabel: 'Đạo', secondaryPerPrimary: 8, secondaryCount: 64 }),
  west: Object.freeze({ primaryLabel: 'Hoang Vực', primaryCount: 7, secondaryLabel: 'Lĩnh', secondaryPerPrimary: 7, secondaryCount: 49 }),
  north: Object.freeze({ primaryLabel: 'Hàn Thiên', primaryCount: 6, secondaryLabel: 'Phủ', secondaryPerPrimary: 12, secondaryCount: 72 }),
  central: Object.freeze({ primaryLabel: 'Thánh Vực', primaryCount: 12, secondaryLabel: 'Châu', secondaryPerPrimary: 12, secondaryCount: 144 })
});

export const HUMAN_REALM_SCALE = Object.freeze({
  continents: 5,
  greatRegions: 42,
  provinces: 437,
  primaryRegions: 42,
  secondLevelTerritories: 437,
  continentStructures: CONTINENT_STRUCTURES,
  nationRangePerProvince: Object.freeze([80, 280]),
  commanderyRangePerNation: Object.freeze([60, 220]),
  cityRangePerCommandery: Object.freeze([50, 200]),
  settlementRangePerCity: Object.freeze([60, 260]),
  materializationRule: 'ALL_TERRITORIES_PLAYABLE'
});

const UNIT_PREFIXES = Object.freeze([
  'Thanh', 'Bạch', 'Tử', 'Huyền', 'Kim', 'Ngọc',
  'Thiên', 'Địa', 'Long', 'Vân', 'Tinh', 'Cổ'
]);
const CITY_SUFFIXES = Object.freeze(['Đại Thành', 'Linh Thành', 'Tiên Thành', 'Huyền Thành']);
const TOWN_SUFFIXES = Object.freeze(['Linh Trấn', 'Cổ Trấn', 'Tụ Linh Phường', 'Sơn Trấn', 'Thương Trấn']);
const VILLAGE_SUFFIXES = Object.freeze(['Linh Thôn', 'Sơn Thôn', 'Cổ Thôn', 'Vân Thôn', 'Thanh Thôn']);
const SECRET_SUFFIXES = Object.freeze(['Bí Cảnh', 'Động Thiên', 'Cổ Địa']);
const FORBIDDEN_SUFFIXES = Object.freeze(['Cấm Địa', 'Tuyệt Vực']);

function freezeNested(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeNested));
  if (value && typeof value === 'object') {
    const out = {};
    Object.entries(value).forEach(([key, child]) => { out[key] = freezeNested(child); });
    return Object.freeze(out);
  }
  return value;
}

function slugifyVi(value) {
  return String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function stripUnitSuffix(value, unitLabel) {
  const suffix = ` ${unitLabel}`;
  return String(value).endsWith(suffix) ? String(value).slice(0, -suffix.length) : String(value);
}

function pick(list, seed) {
  return list[Math.abs(Number(seed) || 0) % list.length];
}

function realmBand(continent, regionIndex, unitIndex) {
  const [minBase, maxBase] = continent.realmRange;
  const total = Math.max(1, continent.regions.length * continent.secondaryPerPrimary - 1);
  const ordinal = regionIndex * continent.secondaryPerPrimary + unitIndex;
  const spread = Math.max(2, maxBase - minBase);
  const offset = Math.round((ordinal / total) * Math.min(8, spread));
  const minRealmIdx = Math.min(maxBase, minBase + Math.floor(offset * 0.6));
  const maxRealmIdx = Math.min(maxBase, Math.max(minRealmIdx + 2, minRealmIdx + Math.ceil(spread * 0.58)));
  return Object.freeze({ minRealmIdx, maxRealmIdx, bossRealmIdx: Math.min(28, maxRealmIdx + 1) });
}

function namedList(base, suffixes, count, seed) {
  return Object.freeze(Array.from({ length: count }, (_, index) => `${base} ${pick(suffixes, seed + index)}`));
}


function makeTerritoryNode(continent, region, regionNodeId, regionIndex, territoryIndex) {
  const seed = regionIndex * 37 + territoryIndex * 19;
  const prefix = pick(UNIT_PREFIXES, seed);
  const territoryName = region.namedTerritories?.[territoryIndex] || `${prefix} ${region.shortTheme} ${continent.secondaryLabel}`;
  const base = stripUnitSuffix(territoryName, continent.secondaryLabel);
  const isSouth = continent.id === 'south';
  const rawSlug = slugifyVi(territoryName);
  const territoryNodeId = isSouth
    ? `nl.prov.${region.id}.${rawSlug}`
    : `${regionNodeId}.unit.${rawSlug}`;
  const enemyProfile = realmBand(continent, regionIndex, territoryIndex);

  return Object.freeze({
    id: territoryNodeId,
    type: 'province',
    name: territoryName,
    parentId: regionNodeId,
    continentId: continent.id,
    regionId: region.id,
    regionName: region.name,
    displayTypeLabel: continent.secondaryLabel.toUpperCase(),
    theme: `${region.theme}_${territoryIndex + 1}`,
    desc: `${territoryName} thuộc ${region.name}, ${continent.name}; ${region.focus}; là một ${continent.secondaryLabel} trọng yếu của đại lục.`,
    climate: continent.climate,
    capital: `${base} Đại Thành`,
    notableCities: namedList(base, CITY_SUFFIXES, 4, seed + 1),
    notableTowns: namedList(base, TOWN_SUFFIXES, 5, seed + 2),
    notableVillages: namedList(base, VILLAGE_SUFFIXES, 5, seed + 3),
    secretRealms: namedList(base, SECRET_SUFFIXES, 3, seed + 4),
    forbiddenZones: namedList(base, FORBIDDEN_SUFFIXES, 2, seed + 5),
    products: Object.freeze([...continent.products]),
    minerals: Object.freeze([...continent.minerals]),
    enemyProfile: Object.freeze({
      ...enemyProfile,
      commonEnemies: Object.freeze([...continent.enemies]),
      eliteEnemy: `${base} ${pick(continent.enemies, seed + 2)} Tinh Anh`,
      fieldBoss: `${base} ${pick(continent.enemies, seed + 4)} Vương`,
      dominantElements: Object.freeze([...region.elements])
    }),
    generationProfile: Object.freeze({
      nations: HUMAN_REALM_SCALE.nationRangePerProvince,
      materializedByDefault: true
    }),
    provinceGenerationCounts: Object.freeze({
      cities: 90 + ((seed * 13) % 141),
      towns: 320 + ((seed * 31) % 781),
      villages: 2500 + ((seed * 211) % 6501),
      secretRealms: 15 + ((seed * 7) % 56),
      forbiddenZones: 6 + ((seed * 3) % 21),
    }),
    materialized: true,
    status: 'playable'
  });
}

const ALL_CONTINENT_SPECS = Object.freeze([
  freezeNested({
    id: 'south', name: 'Nam Lăng Đại Lục', position: 'Nam',
    primaryLabel: 'Đại Vực', secondaryLabel: 'Châu', secondaryPerPrimary: 12,
    alignment: 'chính đạo / tu chân thế gia', realmRange: [0, 20],
    desc: 'Nam Đại Lục của Nhân Giới, non xanh nước biếc, đất đai trù phú, nhân tộc hưng thịnh và là vùng đất khởi đầu.',
    climate: 'ôn hòa, sơn thủy hữu tình, linh vũ điều hòa',
    products: ['Thanh Linh Thảo', 'Linh Cốc', 'Tử Vân Chi', 'Bích Ngọc Đào', 'Thanh Linh Mộc'],
    minerals: ['Linh Thạch', 'Thanh Đồng', 'Bạch Ngọc', 'Huyền Thiết'],
    enemies: ['Dã Thú', 'Yêu Lang', 'Thổ Trăn', 'Thanh Mãng', 'Hắc Hùng'],
    regions: [
      ['thanh_linh','Thanh Linh Vực','starter','Linh','sơn thủy ôn hòa, linh điền và thành trấn dày đặc; vùng khởi nguyên',['Mộc','Thủy'],
        ['Thanh Châu','Lạc Châu','Vân Châu','Bình Châu','Hòa Châu','An Châu','Định Châu','Ninh Châu','Thái Châu','Khang Châu','Thuận Châu','Vĩnh Châu']],
      ['nam_hoang','Nam Hoang Vực','beast','Hoang','cổ lâm, độc chướng, yêu thú và bộ tộc cổ',['Mộc','Thổ'],
        ['Man Châu','Vạn Độc Châu','Yêu Lâm Châu','Xích Mãng Châu','Hắc Trạch Châu','Cổ Thụ Châu','Thiên Thú Châu','Linh Xà Châu','Hoang Mộc Châu','Vạn Trùng Châu','Nam Man Châu','Thần Mộc Châu']],
      ['thuong_hai','Thương Hải Vực','ocean','Hải','bờ biển, quần đảo và tuyến thương hải',['Thủy','Phong'],
        ['Hải Châu','Thiên Tinh Châu','Bích Hải Châu','Vân Hải Châu','Long Đảo Châu','Thương Lan Châu','Hải Nguyệt Châu','Triều Âm Châu','Hắc Thủy Châu','Tinh La Châu','Vạn Đảo Châu','Thiên Nhai Châu']],
      ['van_son','Vạn Sơn Vực','mountain','Sơn','sơn mạch liên miên, linh khoáng và địa hỏa',['Thổ','Kim','Hỏa'],
        ['Thạch Châu','Thiên Sơn Châu','Cửu Nhạc Châu','Huyền Thiết Châu','Xích Đồng Châu','Kim Nham Châu','Vạn Khoáng Châu','Địa Hỏa Châu','Long Mạch Châu','Thiết Sơn Châu','Cổ Nhạc Châu','Huyền Phong Châu']],
      ['dong_huyen','Đông Huyền Vực','sword','Kiếm','kiếm tông san sát, kiếm cốc và kiếm mộ',['Kiếm','Kim','Phong'],
        ['Kiếm Châu','Thái Hư Châu','Vạn Kiếm Châu','Thanh Phong Châu','Tử Tiêu Châu','Huyền Kiếm Châu','Linh Kiếm Châu','Cổ Kiếm Châu','Bạch Đế Châu','Thiên Kiếm Châu','Vô Cực Châu','Xích Tiêu Châu']],
      ['trung_thien','Trung Thiên Vực','central','Thiên','trung tâm linh mạch Nam Lăng, đại thành hội tụ',['Kim','Thủy','Hỏa','Thổ','Mộc'],
        ['Trung Châu','Thiên Đô Châu','Thánh Linh Châu','Thần Đô Châu','Cửu Thiên Châu','Thái Nhất Châu','Hạo Thiên Châu','Tử Vi Châu','Vạn Pháp Châu','Tiên Hà Châu','Càn Khôn Châu','Thiên Nguyên Châu']],
      ['tay_hoang','Tây Hoang Vực','desert','Mạc','hoang mạc vô tận, di tích cổ và thành bang ốc đảo',['Thổ','Hỏa'],
        ['Sa Châu','Hoang Châu','Xích Sa Châu','Cổ Mạc Châu','Hắc Sa Châu','Nhật Viêm Châu','Thạch Lâm Châu','Thiên Mạc Châu','Di Tích Châu','Kim Sa Châu','Huyền Sa Châu','Vô Tận Châu']],
      ['bac_han','Bắc Hàn Vực','ice','Hàn','băng nguyên, tuyết sơn và hàn hồ',['Băng','Thủy'],
        ['Hàn Châu','Tuyết Châu','Băng Châu','Bắc Minh Châu','Huyền Băng Châu','Thiên Tuyết Châu','Cực Hàn Châu','Bạch Sương Châu','Hàn Nguyệt Châu','Băng Nguyên Châu','Tuyết Sơn Châu','Cửu Hàn Châu']],
      ['huyet_u','Huyết U Vực','demonic','Huyết','cổ chiến trường, ma địa và âm mạch',['Hỏa','Lôi','Vật Lý'],
        ['Huyết Châu','U Châu','Cửu U Châu','Ma Châu','Minh Châu','Huyết Ngục Châu','Táng Hồn Châu','Quỷ Châu','Vạn Cốt Châu','Âm Sơn Châu','Cổ Chiến Châu','Ma Uyên Châu']]
    ]
  }),
  freezeNested({
    id: 'east', name: 'Đông Huyền Đại Lục', position: 'Đông',
    primaryLabel: 'Huyền Vực', secondaryLabel: 'Đạo', secondaryPerPrimary: 8,
    alignment: 'chính đạo / hải tu / kiếm tu', realmRange: [6, 25],
    desc: 'Phương Đông chia thành tám Huyền Vực do các đạo thống lớn, hoàng triều tu chân và thế gia cổ kiểm soát; dưới mỗi Huyền Vực là tám Đạo, thiên về sơn hải, long mạch và truyền thừa chuyên môn.',
    climate: 'gió biển, linh vũ, sơn hải và lôi bạo theo mùa',
    products: ['Long Linh Thảo', 'Hải Tâm Châu', 'Tử Tiêu Lôi Trúc', 'Thanh Long Mộc', 'Đông Hải Linh Dịch'],
    minerals: ['Hải Lam Tinh', 'Lôi Văn Thạch', 'Long Mạch Ngọc', 'Canh Kim Kiếm Tinh'],
    enemies: ['Hải Giao', 'Lôi Ưng Yêu', 'Kiếm Linh', 'Thanh Long Mộc Yêu', 'Đông Hải Tà Tu'],
    regions: [
      ['thanh_long','Thanh Long Huyền Vực','long','Long','thanh long mạch và mộc linh cổ địa',['Mộc','Thủy','Phong']],
      ['thuong_hai','Thương Hải Huyền Vực','ocean','Hải','đại dương, quần đảo và thương cảng tu tiên',['Thủy','Phong','Lôi']],
      ['thien_kiem','Thiên Kiếm Huyền Vực','sword','Kiếm','kiếm sơn, kiếm mộ và phi kiếm truyền thừa',['Kiếm','Kim','Phong']],
      ['loi_trach','Lôi Trạch Huyền Vực','thunder','Lôi','lôi trạch, thiên lôi và yêu thú lôi hệ',['Lôi','Thủy','Kim']],
      ['van_moc','Vạn Mộc Huyền Vực','forest','Mộc','thần mộc, dược cốc và mộc linh sinh cơ',['Mộc','Thổ','Thủy']],
      ['linh_phu','Linh Phù Huyền Vực','talisman','Phù','phù đạo, trận pháp và linh văn cổ',['Kim','Mộc','Lôi']],
      ['long_uyen','Long Uyên Huyền Vực','dragon','Uyên','long uyên, giao long và thủy phủ cổ',['Thủy','Lôi','Vật Lý']],
      ['tinh_la','Tinh La Huyền Vực','star','Tinh','hòn đảo linh trận, chiêm tinh và phong thủy',['Phong','Thủy','Lôi']]
    ]
  }),
  freezeNested({
    id: 'west', name: 'Tây Mạc Đại Lục', position: 'Tây',
    primaryLabel: 'Hoang Vực', secondaryLabel: 'Lĩnh', secondaryPerPrimary: 7,
    alignment: 'cổ quốc / ma đạo / thể tu / sa tộc', realmRange: [8, 26],
    desc: 'Phương Tây là sa mạc, thạch lâm và hỏa diệm liên miên; bảy Hoang Vực chia thành bốn mươi chín Lĩnh, do cổ quốc, thần điện và các liên minh bộ tộc phân chia quyền lực.',
    climate: 'nhiệt phong, sa bạo, địa hỏa và biến thiên ngày đêm cực đoan',
    products: ['Xích Viêm Tham', 'Sa Mạc Linh Chi', 'Địa Hỏa Thạch Nhũ', 'Cổ Mạc Thần Sa', 'Thiên Canh Huyễn Thảo'],
    minerals: ['Xích Sa Kim', 'Hỏa Tinh Ngọc', 'Hắc Diệu Thạch', 'Cổ Thần Toái Thiết'],
    enemies: ['Sa Trùng Vương', 'Địa Hỏa Ma Thú', 'Cổ Mộ Thi Tướng', 'Hoang Mạc Thể Tu', 'Tây Hoang Sa Tặc'],
    regions: [
      ['xich_viem','Xích Viêm Hoang Vực','fire','Viêm','hỏa sơn, dung nham và địa hỏa quặng mỏ',['Hỏa','Thổ']],
      ['sa_hai','Sa Hải Hoang Vực','desert','Sa','sa mạc mênh mông, ốc đảo và di tích cổ',['Thổ','Phong']],
      ['thach_lam','Thạch Lâm Hoang Vực','stone','Thạch','thạch phong kỳ dị, khoáng mạch và sơn động',['Thổ','Kim']],
      ['co_than','Cổ Thần Hoang Vực','ancient','Thần','thần điện sụp đổ, cổ chiến trường và truyền thừa thần ma',['Vật Lý','Hỏa','Kim']],
      ['huyen_sa','Huyễn Sa Hoang Vực','mirage','Huyễn','huyễn cảnh, sa bão và âm dương đảo lộn',['Phong','Thổ','Thủy']],
      ['hoang_kim','Hoàng Kim Hoang Vực','gold','Kim','hoàng kim cổ mỏ, sa kim và thương minh',['Kim','Thổ']],
      ['diet_tuyet','Diệt Tuyệt Hoang Vực','ruin','Tuyệt','khu cấm địa tuyệt phong, phong bạo và tuyệt cảnh',['Phong','Hỏa','Lôi']]
    ]
  }),
  freezeNested({
    id: 'north', name: 'Bắc Minh Đại Lục', position: 'Bắc',
    primaryLabel: 'Hàn Thiên', secondaryLabel: 'Phủ', secondaryPerPrimary: 12,
    alignment: 'băng tu / phù tu / âm dương / cổ tông', realmRange: [10, 27],
    desc: 'Phương Bắc là hàn thiên băng vực khắc nghiệt; sáu Hàn Thiên chia thành bảy mươi hai Phủ, do hàn cung, cổ phủ và các tộc trưởng băng nguyên nắm giữ.',
    climate: 'cực hàn, băng tuyết quanh năm, cực quang và hàn triều',
    products: ['Băng Tâm Liên', 'Hàn Băng Thảo', 'Bắc Minh Huyền Thủy', 'Tuyết Phách', 'Băng Tằm Ti'],
    minerals: ['Huyền Băng Thạch', 'Bắc Minh Hàn Thiết', 'Cực Quang Tinh', 'Thiên Tuyết Thạch'],
    enemies: ['Băng Tinh Yêu', 'Hàn Băng Cự Hùng', 'Tuyết Điêu Yêu', 'Bắc Minh Giao Long', 'Hàn Dạ Tà Tu'],
    regions: [
      ['cuc_han','Cực Hàn Hàn Thiên','polar','Cực','băng nguyên vĩnh cửu, cực quang và hàn mạch sâu',['Băng','Thủy']],
      ['tuyet_son','Tuyết Sơn Hàn Thiên','mountain','Tuyết','núi tuyết trùng điệp, băng động và cổ động thiên',['Băng','Phong','Kim']],
      ['han_nguyet','Hàn Nguyệt Hàn Thiên','moon','Nguyệt','hàn nguyệt linh quang và kiếm tu băng hệ',['Băng','Kiếm','Thủy']],
      ['bac_minh_hai','Bắc Minh Hải Hàn Thiên','sea','Hải','hải vực băng giá, giao long và hàn thủy quái',['Thủy','Băng','Lôi']],
      ['huyen_bang','Huyền Băng Hàn Thiên','ice','Băng','huyền băng ngàn năm, luyện thể và băng hồn trận',['Băng','Thổ','Vật Lý']],
      ['phong_tuyet','Phong Tuyết Hàn Thiên','blizzard','Phong','bão tuyết liên miên, phi chu hành trình hiểm trở',['Phong','Băng']]
    ]
  }),
  freezeNested({
    id: 'central', name: 'Trung Vực Đại Lục', position: 'Trung',
    primaryLabel: 'Thánh Vực', secondaryLabel: 'Châu', secondaryPerPrimary: 12,
    alignment: 'thánh địa / hoàng triều / vạn pháp / trung tâm thế giới', realmRange: [12, 28],
    desc: 'Trung tâm của toàn cõi Nhân Giới; mười hai Thánh Vực chia thành một trăm bốn mươi bốn Châu, nơi hội tụ linh mạch mạnh nhất, thánh tông tối cao và hoàng triều thống nhất.',
    climate: 'linh khí nồng đậm thành sương, thiên địa hài hòa, tử khí đông lai',
    products: ['Thần Long Thảo', 'Cửu Khiếu Đan Tâm Hoa', 'Thái Cổ Thần Mộc', 'Thiên Đô Linh Quả', 'Thánh Linh Chi'],
    minerals: ['Thần Khí Thạch', 'Hỗn Độn Tinh', 'Thiên Đô Thần Thiết', 'Thánh Linh Tinh'],
    enemies: ['Thánh Địa Chấp Pháp', 'Linh Thú Thượng Cổ', 'Thiên Đình Cổ Tướng', 'Hoàng Triều Long Vệ', 'Vạn Pháp Yêu Vương'],
    regions: [
      ['thanh_linh','Thánh Linh Thánh Vực','saint','Thánh','thánh linh mạch khởi nguyên, thánh điện tối cao',['Kim','Mộc','Thủy','Hỏa','Thổ']],
      ['thien_do','Thiên Đô Thánh Vực','capital','Đô','đế đô vĩ đại, hoàng triều tu chân và hoàng quyền',['Kim','Lôi','Vật Lý']],
      ['van_phap','Vạn Pháp Thánh Vực','dharma','Pháp','vạn đạo quy tông, thư viện tu chân và truyền thừa cổ',['Kim','Mộc','Thủy','Hỏa','Thổ']],
      ['thai_huyen','Thái Huyền Thánh Vực','huyen','Huyền','thái huyền linh cảnh, bế quan và độ kiếp thánh địa',['Phong','Lôi','Thủy']],
      ['dan_dao','Đan Đạo Thánh Vực','alchemy','Đan','dược điền vạn dặm, đan hương ngút trời và luyện đan sư hội tụ',['Mộc','Hỏa']],
      ['khi_gioi','Khí Giới Thánh Vực','forge','Khí','lò luyện khí khổng lồ, thần binh xuất thế và quặng tinh',['Kim','Hỏa','Thổ']],
      ['tran_phap','Trận Pháp Thánh Vực','array','Trận','đại trận hộ giới, truyền tống trận liên lục địa và trận sư',['Kim','Thủy','Thổ']],
      ['am_duong','Âm Dương Thánh Vực','yin_yang','Dương','âm dương giao hòa, thái cực đồ và thần thông lưỡng cực',['Hỏa','Thủy','Phong']],
      ['tu_la','Tu La Thánh Vực','asura','Sát','đấu trường tu sĩ, sát lục đạo và quân đoàn viễn chinh',['Vật Lý','Hỏa','Lôi']],
      ['ngu_hanh','Ngũ Hành Thánh Vực','elements','Hành','ngũ hành linh châu, cân bằng ngũ khí và linh tuyền',['Kim','Mộc','Thủy','Hỏa','Thổ']],
      ['thien_co','Thiên Cơ Thánh Vực','mystery','Cơ','chiêm bái thiên đạo, bói toán, thiên cơ lâu',['Phong','Lôi']],
      ['hon_don','Hỗn Độn Thánh Vực','chaos','Độn','vùng biên giới hỗn nguyên, linh khí thái cổ chưa khai',['Kim','Mộc','Thủy','Hỏa','Thổ','Lôi','Phong']]
    ]
  })
]);

const normalizedContinents = ALL_CONTINENT_SPECS.map(continent => Object.freeze({
  ...continent,
  regions: Object.freeze(continent.regions.map(([id, name, theme, shortTheme, focus, elements, namedTerritories]) => Object.freeze({
    id, name, theme, shortTheme, focus, elements: Object.freeze([...elements]),
    namedTerritories: namedTerritories ? Object.freeze([...namedTerritories]) : null
  })))
}));

export const HUMAN_REALM_CONTINENTS = Object.freeze(
  normalizedContinents.map(continent => Object.freeze({
    id: continent.id,
    nodeId: continent.id === 'south' ? NAM_LANG_ROOT_ID : `${HUMAN_REALM_ROOT_ID}.continent.${continent.id}`,
    name: continent.name,
    position: continent.position,
    primaryLabel: continent.primaryLabel,
    secondaryLabel: continent.secondaryLabel,
    primaryCount: continent.regions.length,
    secondaryCount: continent.regions.length * continent.secondaryPerPrimary,
    desc: continent.desc
  }))
);

const humanRealmNodes = [
  Object.freeze({
    id: HUMAN_REALM_ROOT_ID,
    type: 'realm',
    displayTypeLabel: 'NHÂN GIỚI',
    name: 'Nhân Giới',
    parentId: null,
    desc: 'Nhân Giới gồm 5 Đại Lục: Nam Lăng (9 Đại Vực / 108 Châu), Đông Huyền (8 Huyền Vực / 64 Đạo), Tây Mạc (7 Hoang Vực / 49 Lĩnh), Bắc Minh (6 Hàn Thiên / 72 Phủ), Trung Vực (12 Thánh Vực / 144 Châu).',
    structureSummary: 'Nam: 9 Đại Vực → 108 Châu • Đông: 8 Huyền Vực → 64 Đạo • Tây: 7 Hoang Vực → 49 Lĩnh • Bắc: 6 Hàn Thiên → 72 Phủ • Trung: 12 Thánh Vực → 144 Châu',
    counts: Object.freeze({ continents: 5, primaryRegions: 42, territories: 437 }),
    materializationRule: HUMAN_REALM_SCALE.materializationRule,
    status: 'canonical_world_root'
  })
];

for (const continent of normalizedContinents) {
  const isSouth = continent.id === 'south';
  const continentNodeId = isSouth ? NAM_LANG_ROOT_ID : `${HUMAN_REALM_ROOT_ID}.continent.${continent.id}`;
  const territoryCount = continent.regions.length * continent.secondaryPerPrimary;

  humanRealmNodes.push(Object.freeze({
    id: continentNodeId,
    type: 'continent',
    name: continent.name,
    parentId: HUMAN_REALM_ROOT_ID,
    position: continent.position,
    humanRealmContinentId: continent.id,
    primaryRegionLabel: continent.primaryLabel.toUpperCase(),
    secondaryRegionLabel: continent.secondaryLabel.toUpperCase(),
    structureSummary: `${continent.regions.length} ${continent.primaryLabel} → ${territoryCount} ${continent.secondaryLabel}`,
    desc: continent.desc,
    climate: continent.climate,
    signatureProducts: Object.freeze([...continent.products]),
    signatureMinerals: Object.freeze([...continent.minerals]),
    signatureEnemies: Object.freeze([...continent.enemies]),
    counts: Object.freeze({ primaryRegions: continent.regions.length, territories: territoryCount }),
    generationProfile: Object.freeze({ materializedByDefault: true }),
    status: 'playable'
  }));

  continent.regions.forEach((region, regionIndex) => {
    const regionNodeId = isSouth ? `nl.gr.${region.id}` : `${continentNodeId}.gr.${region.id}`;
    humanRealmNodes.push(Object.freeze({
      id: regionNodeId,
      type: 'great_region',
      displayTypeLabel: continent.primaryLabel.toUpperCase(),
      name: region.name,
      parentId: continentNodeId,
      continentId: continent.id,
      regionId: region.id,
      regionIndex: regionIndex + 1,
      theme: region.theme,
      desc: region.focus,
      climate: `${continent.climate}; ${region.focus}`,
      signatureProducts: Object.freeze([...continent.products]),
      signatureMinerals: Object.freeze([...continent.minerals]),
      signatureEnemies: Object.freeze([...continent.enemies]),
      dominantElements: Object.freeze([...region.elements]),
      subdivisionLabel: continent.secondaryLabel,
      counts: Object.freeze({ subdivisions: continent.secondaryPerPrimary }),
      status: 'playable'
    }));

    // Hoang Dã & Bí Cảnh cấp Đại Vực (4 Hoang Dã + 2 Bí Cảnh)
    const regionEntry = Array.isArray(EXPANDED_HUMAN_REALM_REGIONS)
      ? EXPANDED_HUMAN_REALM_REGIONS.find(r => r.name === region.name)
      : null;

    if (regionEntry) {
      (regionEntry.wilds || []).forEach((wName, wIdx) => {
        humanRealmNodes.push(Object.freeze({
          id: `${regionNodeId}.reg_wild.${slugifyVi(wName)}_${wIdx}`,
          type: 'location',
          name: wName,
          parentId: regionNodeId,
          desc: `${wName} là vùng hoang dã cấp đại vực bao la tại ${region.name}, yêu khí ngập trời và linh bảo ẩn tàng.`,
          locationKind: 'field',
          status: 'playable'
        }));
      });

      (regionEntry.secretRealms || []).forEach((sName, sIdx) => {
        humanRealmNodes.push(Object.freeze({
          id: `${regionNodeId}.reg_secret.${slugifyVi(sName)}_${sIdx}`,
          type: 'location',
          name: sName,
          parentId: regionNodeId,
          desc: `${sName} là bí cảnh cấp đại vực thượng cổ tại ${region.name}, chứa đựng cơ duyên phi thăng to lớn.`,
          locationKind: 'secret_realm',
          status: 'playable'
        }));
      });
    }

    for (let territoryIndex = 0; territoryIndex < continent.secondaryPerPrimary; territoryIndex++) {
      humanRealmNodes.push(makeTerritoryNode(continent, region, regionNodeId, regionIndex, territoryIndex));
    }
  });
}

// -----------------------------------------------------------------------------
// 5. HỆ THỐNG PHÂN CẤP ĐA TẦNG CHI TIẾT (QUỐC GIA · QUẬN · THÀNH VỰC · ĐỊA ĐIỂM)
// -----------------------------------------------------------------------------

const NATION_TYPES = ['Hoàng Triều', 'Cổ Quốc', 'Vương Triều', 'Đế Quốc', 'Thương Minh', 'Thành Bang'];
const CMD_PREFIXES = ['Nam Sơn', 'Bắc Lăng', 'Đông Giao', 'Tây Phủ', 'Trung Linh', 'Vân Sơn', 'Hà Tây', 'Thanh Phong', 'Bích Hải', 'Long Mạch'];
const CITY_KINDS = ['Thành Vực', 'Phủ Thành', 'Thương Trấn', 'Cổ Thành', 'Linh Cốc', 'Sơn Mạch'];

function generateProvinceSubnodes(territoryNode, atlasMap) {
  const subnodes = [];
  const territoryId = territoryNode.id;
  const territoryName = territoryNode.name;

  // Lookup chính xác theo tên châu từ Map đã được pre-build
  const atlasEntry = atlasMap.get(territoryName);
  const isThanhChau = territoryId === 'nl.prov.thanh_linh.thanh_chau';

  if (atlasEntry) {
    // ═══════════════════════════════════════════════════════
    // CẤP CHÂU: Hoang Dã & Bí Cảnh trực thuộc Châu
    // ═══════════════════════════════════════════════════════
    (atlasEntry.wilds || []).forEach((wName, wIdx) => {
      subnodes.push(Object.freeze({
        id: `${territoryId}.prov_wild.${slugifyVi(wName)}_${wIdx}`,
        type: 'location',
        name: wName,
        parentId: territoryId,
        desc: `${wName} là vùng hoang dã cấp châu rộng lớn thuộc ${territoryName}, nguy hiểm và linh bảo dồi dào.`,
        locationKind: 'field',
        status: 'playable'
      }));
    });

    (atlasEntry.secretRealms || []).forEach((sName, sIdx) => {
      subnodes.push(Object.freeze({
        id: `${territoryId}.prov_secret.${slugifyVi(sName)}_${sIdx}`,
        type: 'location',
        name: sName,
        parentId: territoryId,
        desc: `${sName} là bí cảnh cấp châu thượng cổ thuộc ${territoryName}, chứa đựng cơ duyên phi phàm.`,
        locationKind: 'secret_realm',
        status: 'playable'
      }));
    });
  }

  if (atlasEntry && Array.isArray(atlasEntry.nations)) {
    atlasEntry.nations.forEach((nat, natIdx) => {
      const nationSlug = slugifyVi(nat.name);
      const isDaiLy = isThanhChau && natIdx === 0;
      const nationId = isDaiLy ? STARTER_WORLD_IDS.nation : `${territoryId}.nation.${nationSlug}_${natIdx}`;

      subnodes.push(Object.freeze({
        id: nationId,
        type: 'nation',
        name: nat.name,
        parentId: territoryId,
        desc: `${nat.name} thuộc ${territoryName}, quốc gia tu tiên với 5 đại thành trì và hàng vạn dặm linh địa.`,
        status: 'playable'
      }));

      // ═══════════════════════════════════════════════════════
      // CẤP QUỐC GIA: Hoang Dã & Bí Cảnh trực thuộc Quốc Gia
      // ═══════════════════════════════════════════════════════
      (nat.wilds || []).forEach((wName, wIdx) => {
        subnodes.push(Object.freeze({
          id: `${nationId}.nat_wild.${slugifyVi(wName)}_${wIdx}`,
          type: 'location',
          name: wName,
          parentId: nationId,
          desc: `${wName} là vùng biên hoang cấp quốc gia thuộc ${nat.name}, yêu thú hoành hành và khoáng mạch ẩn tàng.`,
          locationKind: 'field',
          status: 'playable'
        }));
      });

      (nat.secretRealms || []).forEach((sName, sIdx) => {
        subnodes.push(Object.freeze({
          id: `${nationId}.nat_secret.${slugifyVi(sName)}_${sIdx}`,
          type: 'location',
          name: sName,
          parentId: nationId,
          desc: `${sName} là bí cảnh cấp quốc gia thuộc ${nat.name}, ẩn chứa bảo khố hoàng gia và cổ truyền thừa.`,
          locationKind: 'secret_realm',
          status: 'playable'
        }));
      });

      // 5 Thành per Quốc Gia
      (nat.cities || []).forEach((city, cityIdx) => {
        const citySlug = slugifyVi(city.name);
        const cityId = `${nationId}.city.${citySlug}_${cityIdx}`;
        const isStarterCity = isDaiLy && city.name.includes('Nam Sơn');

        subnodes.push(Object.freeze({
          id: cityId,
          type: 'city_territory',
          name: city.name,
          parentId: nationId,
          desc: `${city.name} là đại thành trì trung tâm thuộc ${nat.name}, giao thương sầm uất và tụ tập tu sĩ bốn phương.`,
          locationKind: 'major_hub',
          status: 'playable'
        }));

        // ═══════════════════════════════════════════════════════════════════
        // Thôn[i] ↔ Hoang Dã[i]: ghép cặp 1-1
        // Mỗi thôn là node SETTLEMENT trung gian, chứa 2 con:
        //   - hub an toàn (same name as village)
        //   - hoang dã ngoại vi (wilds[i])
        // UI sẽ hiển thị: click Thôn → thấy THÔN + NGOẠI VI
        // ═══════════════════════════════════════════════════════════════════
        const villages = city.villages || [];
        const wilds    = city.wilds    || [];

        villages.forEach((vName, vIdx) => {
          const isStarterVillage = isStarterCity && vName === 'Thanh Vân Thôn';
          // Settlement zone (intermediate node – hiển thị tên thôn, có con)
          const zoneId = isStarterVillage
            ? `nl.settlement.nam_son.thanh_van_thon`
            : `${cityId}.settle.${slugifyVi(vName)}_${vIdx}`;

          subnodes.push(Object.freeze({
            id: zoneId,
            type: 'settlement',
            name: vName,
            parentId: cityId,
            desc: `${vName} là khu định cư thuộc ${city.name}. Ấn vào để xem khu an toàn và vùng dã ngoại xung quanh.`,
            status: 'playable'
          }));

          // Con 1: Safe hub – khu an toàn
          const hubId = isStarterVillage
            ? STARTER_WORLD_IDS.map0
            : `${zoneId}.hub`;
          subnodes.push(Object.freeze({
            id: hubId,
            type: 'location',
            name: vName,
            parentId: zoneId,
            desc: `${vName} – khu an toàn trong thôn, có cửa hàng, lò rèn và điểm truyền tống.`,
            playableMapId: isStarterVillage ? 0 : undefined,
            locationKind: 'safe_hub',
            status: 'playable'
          }));

          // Con 2: Hoang dã ngoại vi ghép cặp với thôn này
          const pairedWild = wilds[vIdx];
          if (pairedWild) {
            const isStarterOuter  = isStarterCity && pairedWild === 'Thanh Vân Ngoại Vi';
            const isStarterForest = isStarterCity && pairedWild === 'Vạn Mộc Sâm Lâm';
            const wildId = isStarterOuter  ? STARTER_WORLD_IDS.map1
                         : isStarterForest ? STARTER_WORLD_IDS.map2
                         : `${zoneId}.wild`;
            subnodes.push(Object.freeze({
              id: wildId,
              type: 'location',
              name: pairedWild,
              parentId: zoneId,
              desc: `${pairedWild} – vùng hoang dã ngoại vi ${vName}, nơi yêu thú sinh sống và sản sinh linh thảo.`,
              playableMapId: isStarterOuter ? 1 : (isStarterForest ? 2 : undefined),
              locationKind: 'field',
              status: 'playable'
            }));
          }
        });

        // Hoang dã thừa (nếu wilds.length > villages.length) → trực thuộc thành
        wilds.slice(villages.length).forEach((wName, wIdx) => {
          subnodes.push(Object.freeze({
            id: `${cityId}.extra_wild.${slugifyVi(wName)}_${wIdx}`,
            type: 'location',
            name: wName,
            parentId: cityId,
            desc: `${wName} – vùng hoang dã thuộc ${city.name}.`,
            locationKind: 'field',
            status: 'playable'
          }));
        });

        // Bí Cảnh → trực thuộc thành (không ghép cặp)
        (city.secretRealms || []).forEach((sName, sIdx) => {
          subnodes.push(Object.freeze({
            id: `${cityId}.secret.${slugifyVi(sName)}_${sIdx}`,
            type: 'location',
            name: sName,
            parentId: cityId,
            desc: `${sName} thuộc ${city.name}, bí cảnh chứa nhiều cơ duyên ngàn năm và bảo vật hiếm.`,
            locationKind: 'secret_realm',
            status: 'playable'
          }));
        });
      });
    });
  }

  return subnodes;
}

// Pre-build Map từ tên châu -> atlas entry để tìm O(1)
const _atlasMap = new Map(
  (Array.isArray(EXPANDED_HUMAN_REALM_ATLAS) ? EXPANDED_HUMAN_REALM_ATLAS : []).map(e => [e.name, e])
);

// Khởi tạo toàn bộ cây phân cấp con cho tất cả 437 Châu / Đạo / Lĩnh / Phủ
const allProvinceSubnodes = [];
const provinceNodes = humanRealmNodes.filter(node => node.type === 'province');
provinceNodes.forEach((province) => {
  allProvinceSubnodes.push(...generateProvinceSubnodes(province, _atlasMap));
});
humanRealmNodes.push(...allProvinceSubnodes);

const continents = humanRealmNodes.filter(node => node.type === 'continent');
const primaryRegions = humanRealmNodes.filter(node => node.type === 'great_region');
const territories = humanRealmNodes.filter(node => node.type === 'province');
if (continents.length !== 5 || primaryRegions.length !== 42 || territories.length !== 437) {
  throw new Error(`[HUMAN REALM] Sai cấu trúc: ${continents.length} Đại Lục / ${primaryRegions.length} vùng cấp cao / ${territories.length} đơn vị cấp hai.`);
}

export const HUMAN_REALM_WORLD_NODES = Object.freeze(humanRealmNodes);
export const NAM_LANG_WORLD_NODES = HUMAN_REALM_WORLD_NODES;
export const NEW_HUMAN_REALM_CONTINENT_SPECS = normalizedContinents;
