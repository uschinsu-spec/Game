/**
 * humanRealmWorld.js
 * Canonical high-level hierarchy for NHÂN GIỚI.
 *
 * IMPORTANT:
 * - Nam Lăng keeps its existing `nl.*` IDs and remains 9 Đại Vực / 108 Châu.
 * - The other four continents intentionally use different territorial systems.
 * - These nodes are WORLD DATA only. Runtime maps remain controlled only by playableMaps.js.
 */
import { NAM_LANG_WORLD_NODES, NAM_LANG_ROOT_ID } from './namLangWorld.js?v=20260929-single-map-system-v2';

export const HUMAN_REALM_ROOT_ID = 'hr';
export const HUMAN_REALM_VERSION = '20260929-human-realm-distinct-continents-v2';

const CONTINENT_STRUCTURES = Object.freeze({
  south: Object.freeze({ primaryLabel: 'Đại Vực', primaryCount: 9, secondaryLabel: 'Châu', secondaryPerPrimary: 12, secondaryCount: 108 }),
  east: Object.freeze({ primaryLabel: 'Tiên Vực', primaryCount: 8, secondaryLabel: 'Đạo', secondaryPerPrimary: 8, secondaryCount: 64 }),
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
  materializationRule: 'ONLY_IMPORTANT_OR_VISITED'
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

function makeFactionProfile(continent, region, territoryName, regionIndex, territoryIndex) {
  const base = stripUnitSuffix(territoryName, continent.secondaryLabel);
  const power = realmBand(continent, regionIndex, territoryIndex);
  const tiers = ['bá chủ', 'đại tông', 'đại tông', 'trung tông', 'địa phương'];

  const branch = Object.freeze({
    id: `hr_branch_${continent.id}_${region.id}_${slugifyVi(territoryName)}`,
    name: `${region.apexSect} · ${territoryName} Phân Tông`,
    parentSectName: region.apexSect,
    kind: 'Đại Tông Phân Chi',
    tier: 'xuyên vùng',
    alignment: continent.alignment,
    headquarters: `${base} Phân Tông Sơn Môn`,
    specialties: Object.freeze([...region.elements]),
    controlledResources: Object.freeze([
      pick(continent.products, territoryIndex),
      pick(continent.minerals, territoryIndex + 1)
    ]),
    power: Object.freeze({
      discipleRealmRange: Object.freeze([Math.max(0, power.minRealmIdx - 3), Math.max(1, power.minRealmIdx + 2)]),
      elderRealmRange: Object.freeze([Math.max(2, power.maxRealmIdx - 3), power.maxRealmIdx]),
      leaderRealmIdx: power.maxRealmIdx,
      ancestorRealmIdx: power.bossRealmIdx
    }),
    status: 'world_data'
  });

  const locals = tiers.map((tier, slot) => {
    const kind = pick(continent.factionKinds, territoryIndex + slot);
    const suffix = pick(continent.factionSuffixes, regionIndex + territoryIndex + slot);
    return Object.freeze({
      id: `hr_faction_${continent.id}_${region.id}_${slugifyVi(territoryName)}_${slot + 1}`,
      name: `${base} ${suffix}`,
      kind,
      tier,
      alignment: continent.alignment,
      headquarters: `${base} ${kind.includes('Tộc') || kind.includes('Gia') ? 'Tổ Địa' : 'Sơn Môn'}`,
      doctrine: `${region.focus}; chủ tu ${pick(region.elements, slot)}${region.elements.length > 1 ? ` và ${pick(region.elements, slot + 1)}` : ''}.`,
      specialties: Object.freeze([...new Set([pick(region.elements, slot), pick(region.elements, slot + 1)])]),
      controlledResources: Object.freeze([...new Set([
        pick(continent.products, slot + territoryIndex),
        pick(continent.minerals, slot + territoryIndex + 1)
      ])]),
      power: Object.freeze({
        discipleRealmRange: Object.freeze([Math.max(0, power.minRealmIdx - 4), Math.max(1, power.minRealmIdx + 1)]),
        elderRealmRange: Object.freeze([Math.max(2, power.maxRealmIdx - 4), Math.max(3, power.maxRealmIdx - 1)]),
        leaderRealmIdx: Math.min(28, tier === 'bá chủ' ? power.maxRealmIdx + 1 : power.maxRealmIdx),
        ancestorRealmIdx: Math.min(28, tier === 'bá chủ' ? power.bossRealmIdx + 1 : power.bossRealmIdx)
      }),
      status: 'world_data'
    });
  });

  const factions = Object.freeze([branch, ...locals]);
  return Object.freeze({
    atlasVersion: HUMAN_REALM_VERSION,
    territoryName,
    dominantFactionId: locals[0].id,
    factions,
    summary: `${territoryName} có 1 phân tông của ${region.apexSect}, 1 thế lực bá chủ, 2 đại tông, 1 trung tông và 1 thế lực địa phương chủ lực.`,
    generationCounts: Object.freeze({
      namedCoreFactions: factions.length,
      majorAndMediumFactions: 18 + ((regionIndex * 7 + territoryIndex * 5) % 37),
      minorSects: 50 + ((regionIndex * 13 + territoryIndex * 11) % 121),
      cultivationFamilies: 45 + ((regionIndex * 17 + territoryIndex * 9) % 151)
    })
  });
}

function makeTerritoryNode(continent, region, regionNodeId, regionIndex, territoryIndex) {
  const territoryName = `${UNIT_PREFIXES[territoryIndex]} ${region.territoryRoot} ${continent.secondaryLabel}`;
  const base = stripUnitSuffix(territoryName, continent.secondaryLabel);
  const seed = regionIndex * continent.secondaryPerPrimary + territoryIndex;
  const enemyProfile = realmBand(continent, regionIndex, territoryIndex);
  const factionProfile = makeFactionProfile(continent, region, territoryName, regionIndex, territoryIndex);

  return Object.freeze({
    id: `${regionNodeId}.unit.${slugifyVi(territoryName)}`,
    type: 'province',
    displayTypeLabel: continent.secondaryLabel.toUpperCase(),
    name: territoryName,
    parentId: regionNodeId,
    continentId: continent.id,
    regionId: region.id,
    provinceIndex: territoryIndex + 1,
    territoryIndex: territoryIndex + 1,
    theme: region.theme,
    desc: `${territoryName} thuộc ${region.name}, ${continent.name}; ${region.desc}`,
    climate: `${continent.climate}; ${region.focus}`,
    capital: `${base} ${pick(CITY_SUFFIXES, seed)}`,
    notableCities: namedList(base, CITY_SUFFIXES, 3, seed + 1),
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
    cultivationFactions: Object.freeze(factionProfile.factions.map(faction => faction.name)),
    factionProfile,
    generationProfile: Object.freeze({
      nations: HUMAN_REALM_SCALE.nationRangePerProvince,
      materializedByDefault: false
    }),
    provinceGenerationCounts: Object.freeze({
      cities: 90 + ((seed * 13) % 141),
      towns: 320 + ((seed * 31) % 781),
      villages: 2500 + ((seed * 211) % 6501),
      secretRealms: 15 + ((seed * 7) % 56),
      forbiddenZones: 6 + ((seed * 3) % 21),
      sectsAndFamilies: 110 + ((seed * 17) % 211)
    }),
    materialized: false,
    status: 'world_data'
  });
}

const NEW_CONTINENT_SPECS = Object.freeze([
  freezeNested({
    id: 'east', name: 'Đông Huyền Đại Lục', position: 'Đông',
    primaryLabel: 'Tiên Vực', secondaryLabel: 'Đạo', secondaryPerPrimary: 8,
    alignment: 'chính đạo / hải tu / kiếm tu', realmRange: [6, 25],
    desc: 'Phương Đông chia thành các Tiên Vực do đạo thống lớn quản lĩnh; dưới mỗi Tiên Vực là các Đạo, thiên về sơn hải, long mạch và truyền thừa chuyên môn.',
    climate: 'gió biển, linh vũ, sơn hải và lôi bạo theo mùa',
    products: ['Long Linh Thảo', 'Hải Tâm Châu', 'Tử Tiêu Lôi Trúc', 'Thanh Long Mộc', 'Đông Hải Linh Dịch'],
    minerals: ['Hải Lam Tinh', 'Lôi Văn Thạch', 'Long Mạch Ngọc', 'Canh Kim Kiếm Tinh'],
    enemies: ['Hải Giao', 'Lôi Ưng Yêu', 'Kiếm Linh', 'Thanh Long Mộc Yêu', 'Đông Hải Tà Tu'],
    factionKinds: ['Kiếm Tông', 'Thủy Cung', 'Lôi Điện', 'Long Tộc', 'Phù Môn', 'Tu Tiên Gia Tộc'],
    factionSuffixes: ['Thiên Kiếm Tông', 'Thương Hải Cung', 'Cửu Lôi Điện', 'Thanh Long Đạo Viện', 'Đông Huyền Phù Môn', 'Vân Hải Thế Gia'],
    regions: [
      ['thanh_long','Thanh Long Tiên Vực','long','Long','thanh long mạch và mộc linh cổ địa',['Mộc','Thủy','Phong'],'Thanh Long Thánh Tông'],
      ['thuong_hai','Thương Hải Tiên Vực','ocean','Hải','đại dương, quần đảo và thương cảng tu tiên',['Thủy','Phong','Lôi'],'Thương Hải Tiên Cung'],
      ['thien_kiem','Thiên Kiếm Tiên Vực','sword','Kiếm','kiếm sơn, kiếm mộ và phi kiếm truyền thừa',['Kiếm','Kim','Phong'],'Thiên Kiếm Thánh Tông'],
      ['loi_trach','Lôi Trạch Tiên Vực','thunder','Lôi','lôi trạch, thiên lôi và yêu thú lôi hệ',['Lôi','Thủy','Kim'],'Cửu Tiêu Lôi Tông'],
      ['van_moc','Vạn Mộc Tiên Vực','forest','Mộc','thần mộc, dược cốc và mộc linh sinh cơ',['Mộc','Thổ','Thủy'],'Vạn Mộc Trường Sinh Tông'],
      ['linh_phu','Linh Phù Tiên Vực','talisman','Phù','phù đạo, trận pháp và linh văn cổ',['Kim','Mộc','Lôi'],'Thiên Phù Đạo Cung'],
      ['long_uyen','Long Uyên Tiên Vực','dragon','Uyên','long uyên, giao long và thủy phủ cổ',['Thủy','Lôi','Vật Lý'],'Long Uyên Thần Cung'],
      ['nhat_thang','Nhật Thăng Tiên Vực','sunrise','Nhật','linh quang nhật xuất, hỏa khí và quang pháp',['Hỏa','Kim','Phong'],'Nhật Thăng Tiên Tông']
    ]
  }),
  freezeNested({
    id: 'west', name: 'Tây Mạc Đại Lục', position: 'Tây',
    primaryLabel: 'Hoang Vực', secondaryLabel: 'Lĩnh', secondaryPerPrimary: 7,
    alignment: 'hỗn hợp chính tà / cổ tộc', realmRange: [8, 24],
    desc: 'Tây Mạc không chia Châu; bảy Hoang Vực được ngăn bởi sa hải và tuyệt địa, mỗi Hoang Vực lại chia thành bảy Lĩnh do cổ quốc, thần điện hoặc bộ tộc tranh quyền.',
    climate: 'khô nóng, sa bạo, chênh lệch nhiệt lớn và địa hỏa mạnh',
    products: ['Xích Diễm Quả', 'Sa Tinh', 'Hoang Cổ Linh Dịch', 'Kim Sa Thảo', 'Cổ Ngọc'],
    minerals: ['Xích Viêm Thạch', 'Kim Sa Tinh', 'Hoang Kim Khoáng', 'Cổ Ngọc Tủy'],
    enemies: ['Sa Hải Long Trùng', 'Xích Viêm Tích', 'Cổ Mộ Âm Binh', 'Hoang Mạc Tà Tu', 'Thạch Giáp Cự Nhân'],
    factionKinds: ['Sa Tông', 'Hỏa Cung', 'Cổ Mộ Phái', 'Thể Tu Môn', 'Thương Minh', 'Cổ Tộc'],
    factionSuffixes: ['Vô Tận Sa Tông', 'Xích Nhật Hỏa Cung', 'Cổ Vương Điện', 'Hoang Thần Thể Môn', 'Kim Sa Thương Minh', 'Thái Cổ Thần Tộc'],
    regions: [
      ['dai_mac','Đại Mạc Hoang Vực','desert','Mạc','đại mạc vô tận và linh tuyền ốc đảo',['Thổ','Phong','Hỏa'],'Đại Mạc Thiên Tông'],
      ['xich_viem','Xích Viêm Hoang Vực','fire','Viêm','hỏa sơn, địa hỏa và luyện thể hỏa pháp',['Hỏa','Thổ','Vật Lý'],'Xích Viêm Thần Cung'],
      ['co_mo','Cổ Mộ Hoang Vực','tomb','Mộ','cổ mộ, hoàng lăng và âm linh truyền thừa',['Thổ','Kim','Vật Lý'],'Cổ Vương Thần Điện'],
      ['kim_sa','Kim Sa Hoang Vực','gold_sand','Sa','kim sa, thương lộ và linh khoáng hiếm',['Kim','Thổ','Phong'],'Kim Sa Vạn Bảo Tông'],
      ['thach_lam','Thạch Lâm Hoang Vực','stone','Thạch','thạch lâm, cự nham và cổ trận địa',['Thổ','Kim','Vật Lý'],'Thiên Thạch Huyền Tông'],
      ['huyen_sa','Huyễn Sa Hoang Vực','illusion','Huyễn','ảo sa, mê cảnh và thần hồn pháp môn',['Phong','Hỏa','Thủy'],'Huyễn Sa Đạo Cung'],
      ['lac_nhat','Lạc Nhật Hoang Vực','sunset','Nhật','lạc nhật thần hỏa và cổ thành sa mạc',['Hỏa','Kim','Phong'],'Lạc Nhật Tiên Cung']
    ]
  }),
  freezeNested({
    id: 'north', name: 'Bắc Minh Đại Lục', position: 'Bắc',
    primaryLabel: 'Hàn Thiên', secondaryLabel: 'Phủ', secondaryPerPrimary: 12,
    alignment: 'hàn hệ chính đạo / cổ yêu', realmRange: [10, 26],
    desc: 'Bắc Minh lấy sáu tầng Hàn Thiên làm đại khu vực. Mỗi Hàn Thiên gồm mười hai Phủ bám theo băng mạch, hàn hồ và Bắc Minh hải.',
    climate: 'cực hàn, băng tuyết quanh năm, cực quang và hàn triều',
    products: ['Băng Tâm Liên', 'Hàn Băng Thảo', 'Bắc Minh Huyền Thủy', 'Tuyết Phách', 'Hàn Long Cốt'],
    minerals: ['Hàn Ngọc', 'Băng Tinh Thạch', 'Bắc Minh Tinh Thiết', 'Cực Quang Linh Tinh'],
    enemies: ['Cực Hàn Băng Giao', 'Tuyết Lang Yêu', 'Băng Giáp Hùng', 'Hàn Phách Linh', 'Bắc Minh Yêu Tu'],
    factionKinds: ['Băng Cung', 'Tuyết Tông', 'Hàn Kiếm Phái', 'Bắc Minh Môn', 'Ngự Thú Cốc', 'Hàn Tộc'],
    factionSuffixes: ['Băng Phách Tiên Cung', 'Thiên Tuyết Tông', 'Hàn Nguyệt Kiếm Phái', 'Bắc Minh Huyền Môn', 'Tuyết Linh Cốc', 'Cực Hàn Cổ Tộc'],
    regions: [
      ['huyen_bang','Huyền Băng Hàn Thiên','ice','Băng','huyền băng vạn năm và băng linh mạch',['Thủy','Kiếm','Kim'],'Huyền Băng Tiên Cung'],
      ['tuyet_nguyen','Tuyết Nguyên Hàn Thiên','snowfield','Tuyết','tuyết nguyên, thú triều và băng thảo',['Thủy','Phong','Vật Lý'],'Thiên Tuyết Thánh Tông'],
      ['bac_minh','Bắc Minh Hàn Thiên','dark_sea','Minh','Bắc Minh hải, huyền thủy và cự yêu biển',['Thủy','Lôi','Vật Lý'],'Bắc Minh Thần Tông'],
      ['han_nguyet','Hàn Nguyệt Hàn Thiên','moon_ice','Nguyệt','hàn nguyệt linh quang và kiếm tu băng hệ',['Kiếm','Thủy','Phong'],'Hàn Nguyệt Kiếm Tông'],
      ['cuc_quang','Cực Quang Hàn Thiên','aurora','Quang','cực quang linh khí và lôi băng dị biến',['Lôi','Thủy','Phong'],'Cực Quang Thiên Điện'],
      ['bang_hai','Băng Hải Hàn Thiên','frozen_ocean','Hải','băng hải, phù băng và cổ long hàn vực',['Thủy','Vật Lý','Lôi'],'Băng Hải Long Cung']
    ]
  }),
  freezeNested({
    id: 'central', name: 'Trung Vực Đại Lục', position: 'Trung',
    primaryLabel: 'Thánh Vực', secondaryLabel: 'Châu', secondaryPerPrimary: 12,
    alignment: 'thánh địa / siêu cấp thế lực', realmRange: [17, 28],
    desc: 'Trung Vực có mật độ linh mạch cao nhất Nhân Giới nên được chia thành mười hai Thánh Vực. Mỗi Thánh Vực có mười hai Châu lớn, quyền lực tập trung trong thánh địa và cổ tộc.',
    climate: 'linh khí cực thịnh, địa mạch ổn định, nhiều thiên tượng và pháp tắc dị cảnh',
    products: ['Thiên Nguyên Tinh', 'Hóa Thần Dược Tủy', 'Nguyên Anh Linh Quả', 'Tử Khí Linh Dịch', 'Hư Không Tinh Sa'],
    minerals: ['Tử Vi Tinh Kim', 'Thiên Tinh Thạch', 'Hư Không Tinh', 'Càn Khôn Ngọc'],
    enemies: ['Hư Không Dị Thú', 'Cổ Điện Khôi Lỗi', 'Tà Đạo Nguyên Anh', 'Thiên Ngoại Ma Ảnh', 'Hộ Sơn Thánh Thú'],
    factionKinds: ['Thánh Địa', 'Đạo Cung', 'Tiên Tông', 'Đan Tháp', 'Vạn Pháp Điện', 'Cổ Tộc'],
    factionSuffixes: ['Cửu Thiên Thánh Địa', 'Thái Nhất Đạo Cung', 'Hạo Thiên Tiên Tông', 'Vạn Đan Thánh Tháp', 'Vạn Pháp Thần Điện', 'Tử Vi Cổ Tộc'],
    regions: [
      ['thien_do','Thiên Đô Thánh Vực','capital','Đô','siêu cấp đại thành và trung tâm quyền lực Nhân Giới',['Kim','Lôi','Kiếm'],'Thiên Đô Thánh Địa'],
      ['thai_nhat','Thái Nhất Thánh Vực','dao','Nhất','âm dương, thái nhất và đại đạo chính thống',['Thủy','Hỏa','Kim'],'Thái Nhất Đạo Cung'],
      ['can_khon','Càn Khôn Thánh Vực','space','Khôn','không gian, trận pháp và càn khôn bí cảnh',['Thổ','Phong','Lôi'],'Càn Khôn Thần Tông'],
      ['tu_vi','Tử Vi Thánh Vực','stars','Vi','tinh tượng, tử khí và cổ tộc thiên mệnh',['Kim','Lôi','Thủy'],'Tử Vi Thánh Tộc'],
      ['hao_thien','Hạo Thiên Thánh Vực','heaven','Hạo','hạo thiên pháp tắc và chiến điện cổ',['Lôi','Kiếm','Vật Lý'],'Hạo Thiên Tiên Tông'],
      ['van_phap','Vạn Pháp Thánh Vực','all_arts','Pháp','vạn pháp, công pháp và đạo thống hội tụ',['Kiếm','Kim','Hỏa','Thủy'],'Vạn Pháp Thần Điện'],
      ['thanh_linh','Thánh Linh Thánh Vực','spirit','Linh','thánh linh, linh thú và sinh mệnh linh tuyền',['Mộc','Thủy','Phong'],'Thánh Linh Tiên Cung'],
      ['tien_ha','Tiên Hà Thánh Vực','celestial_river','Hà','tiên hà, thiên thủy và phi chu liên vực',['Thủy','Phong','Lôi'],'Tiên Hà Đạo Tông'],
      ['thien_nguyen','Thiên Nguyên Thánh Vực','origin','Nguyên','thiên nguyên linh mạch và đạo nguyên cổ địa',['Kim','Thổ','Lôi'],'Thiên Nguyên Thánh Địa'],
      ['hu_khong','Hư Không Thánh Vực','void','Không','hư không khe nứt, không gian pháp và truyền tống cổ',['Phong','Lôi','Kim'],'Hư Không Đạo Cung'],
      ['dan_thien','Đan Thiên Thánh Vực','alchemy','Đan','đan đạo tối thượng, thần dược và thiên hỏa luyện đan',['Hỏa','Mộc','Thủy'],'Đan Thiên Thánh Tháp'],
      ['than_co','Thần Cơ Thánh Vực','mechanism','Cơ','khôi lỗi, trận khí, thiên cơ và luyện khí tinh vi',['Kim','Thổ','Lôi'],'Thần Cơ Tiên Tông']
    ]
  })
]);

function normalizeRegionSpec(raw) {
  const [id, name, theme, territoryRoot, focus, elements, apexSect] = raw;
  return Object.freeze({
    id, name, theme, territoryRoot, focus,
    elements: Object.freeze([...elements]), apexSect,
    desc: `${focus}; là một ${name.split(' ').slice(-2).join(' ')} trọng yếu của đại lục.`
  });
}

const normalizedContinents = Object.freeze(NEW_CONTINENT_SPECS.map(continent => {
  const regions = Object.freeze(continent.regions.map(normalizeRegionSpec));
  const structure = CONTINENT_STRUCTURES[continent.id];
  if (!structure || regions.length !== structure.primaryCount || continent.secondaryPerPrimary !== structure.secondaryPerPrimary) {
    throw new Error(`[HUMAN REALM] Sai cấu trúc ${continent.name}.`);
  }
  return Object.freeze({ ...continent, regions });
}));

export const HUMAN_REALM_CONTINENTS = Object.freeze([
  Object.freeze({
    id: 'south', nodeId: NAM_LANG_ROOT_ID, name: 'Nam Lăng Đại Lục', position: 'Nam', existing: true,
    primaryLabel: 'Đại Vực', secondaryLabel: 'Châu', primaryCount: 9, secondaryCount: 108,
    desc: 'Nam Đại Lục của Nhân Giới; giữ nguyên toàn bộ 9 Đại Vực / 108 Châu và tuyến khởi đầu hiện hữu.'
  }),
  ...normalizedContinents.map(continent => Object.freeze({
    id: continent.id,
    nodeId: `${HUMAN_REALM_ROOT_ID}.continent.${continent.id}`,
    name: continent.name,
    position: continent.position,
    existing: false,
    primaryLabel: continent.primaryLabel,
    secondaryLabel: continent.secondaryLabel,
    primaryCount: continent.regions.length,
    secondaryCount: continent.regions.length * continent.secondaryPerPrimary,
    desc: continent.desc
  }))
]);

const humanRealmNodes = [
  Object.freeze({
    id: HUMAN_REALM_ROOT_ID,
    type: 'realm',
    displayTypeLabel: 'NHÂN GIỚI',
    name: 'Nhân Giới',
    parentId: null,
    desc: 'Nhân Giới gồm 5 Đại Lục nhưng mỗi Đại Lục có chế độ phân chia riêng: Nam Lăng 9 Đại Vực/108 Châu; Đông Huyền 8 Tiên Vực/64 Đạo; Tây Mạc 7 Hoang Vực/49 Lĩnh; Bắc Minh 6 Hàn Thiên/72 Phủ; Trung Vực 12 Thánh Vực/144 Châu.',
    structureSummary: 'Nam: 9 Đại Vực → 108 Châu • Đông: 8 Tiên Vực → 64 Đạo • Tây: 7 Hoang Vực → 49 Lĩnh • Bắc: 6 Hàn Thiên → 72 Phủ • Trung: 12 Thánh Vực → 144 Châu',
    counts: Object.freeze({ continents: 5, primaryRegions: 42, territories: 437 }),
    materializationRule: HUMAN_REALM_SCALE.materializationRule,
    status: 'canonical_world_root'
  })
];

for (const node of NAM_LANG_WORLD_NODES) {
  if (node.id === NAM_LANG_ROOT_ID) {
    humanRealmNodes.push(Object.freeze({
      ...node,
      parentId: HUMAN_REALM_ROOT_ID,
      position: 'Nam',
      humanRealmContinentId: 'south',
      primaryRegionLabel: 'ĐẠI VỰC',
      secondaryRegionLabel: 'CHÂU',
      structureSummary: '9 Đại Vực → 108 Châu',
      desc: `${node.desc} Đây là Nam Đại Lục của Nhân Giới và giữ nguyên mô hình 9 Đại Vực / 108 Châu.`
    }));
  } else {
    humanRealmNodes.push(node);
  }
}

for (const continent of normalizedContinents) {
  const continentNodeId = `${HUMAN_REALM_ROOT_ID}.continent.${continent.id}`;
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
    generationProfile: Object.freeze({ materializedByDefault: false }),
    status: 'world_data'
  }));

  continent.regions.forEach((region, regionIndex) => {
    const regionNodeId = `${continentNodeId}.gr.${region.id}`;
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
      desc: region.desc,
      climate: `${continent.climate}; ${region.focus}`,
      signatureProducts: Object.freeze([...continent.products]),
      signatureMinerals: Object.freeze([...continent.minerals]),
      signatureEnemies: Object.freeze([...continent.enemies]),
      dominantElements: Object.freeze([...region.elements]),
      apexSect: region.apexSect,
      subdivisionLabel: continent.secondaryLabel,
      counts: Object.freeze({ subdivisions: continent.secondaryPerPrimary }),
      status: 'world_data'
    }));

    for (let territoryIndex = 0; territoryIndex < continent.secondaryPerPrimary; territoryIndex++) {
      humanRealmNodes.push(makeTerritoryNode(continent, region, regionNodeId, regionIndex, territoryIndex));
    }
  });
}

const continents = humanRealmNodes.filter(node => node.type === 'continent');
const primaryRegions = humanRealmNodes.filter(node => node.type === 'great_region');
const territories = humanRealmNodes.filter(node => node.type === 'province');
if (continents.length !== 5 || primaryRegions.length !== 42 || territories.length !== 437) {
  throw new Error(`[HUMAN REALM] Sai cấu trúc: ${continents.length} Đại Lục / ${primaryRegions.length} vùng cấp cao / ${territories.length} đơn vị cấp hai.`);
}

for (const profile of HUMAN_REALM_CONTINENTS) {
  const continentNode = humanRealmNodes.find(node => node.id === profile.nodeId);
  const regions = humanRealmNodes.filter(node => node.parentId === profile.nodeId && node.type === 'great_region');
  const territoryCount = regions.reduce((sum, region) => sum + humanRealmNodes.filter(node => node.parentId === region.id && node.type === 'province').length, 0);
  if (!continentNode || regions.length !== profile.primaryCount || territoryCount !== profile.secondaryCount) {
    throw new Error(`[HUMAN REALM] ${profile.name} sai cấu trúc ${profile.primaryCount}/${profile.secondaryCount}.`);
  }
}

export const HUMAN_REALM_WORLD_NODES = Object.freeze(humanRealmNodes);
export const NEW_HUMAN_REALM_CONTINENT_SPECS = normalizedContinents;
