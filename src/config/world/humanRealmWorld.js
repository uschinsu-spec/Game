/**
 * humanRealmWorld.js
 * Canonical high-level hierarchy for NHÂN GIỚI.
 *
 * Structure:
 * Nhân Giới -> 5 Đại Lục -> 9 Đại Vực / continent -> 12 Châu / Đại Vực.
 * Nam Lăng keeps every existing `nl.*` ID so current saves and runtime Maps 0-2 stay stable.
 * The four new continents are DATA ONLY until locations are deliberately materialized.
 */
import { NAM_LANG_WORLD_NODES, NAM_LANG_ROOT_ID } from './namLangWorld.js?v=20260929-single-map-system-v2';

export const HUMAN_REALM_ROOT_ID = 'hr';
export const HUMAN_REALM_VERSION = '20260929-human-realm-five-continents-v1';

export const HUMAN_REALM_SCALE = Object.freeze({
  continents: 5,
  greatRegionsPerContinent: 9,
  provincesPerGreatRegion: 12,
  greatRegions: 45,
  provinces: 540,
  nationRangePerProvince: Object.freeze([80, 280]),
  commanderyRangePerNation: Object.freeze([60, 220]),
  cityRangePerCommandery: Object.freeze([50, 200]),
  settlementRangePerCity: Object.freeze([60, 260]),
  materializationRule: 'ONLY_IMPORTANT_OR_VISITED'
});

const PROVINCE_PREFIXES = Object.freeze([
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

function baseProvinceName(name) {
  return String(name).replace(/\s*Châu$/u, '');
}

function pick(list, seed) {
  return list[Math.abs(Number(seed) || 0) % list.length];
}

function realmBand(range, regionIndex, provinceIndex) {
  const minBase = Number(range[0]);
  const maxBase = Number(range[1]);
  const spread = Math.max(2, maxBase - minBase);
  const offset = Math.round(((regionIndex * 12 + provinceIndex) / 107) * Math.min(8, spread));
  const minRealmIdx = Math.min(maxBase, minBase + Math.floor(offset * 0.6));
  const maxRealmIdx = Math.min(maxBase, Math.max(minRealmIdx + 2, minRealmIdx + Math.ceil(spread * 0.58)));
  return Object.freeze({ minRealmIdx, maxRealmIdx, bossRealmIdx: Math.min(28, maxRealmIdx + 1) });
}

function namedList(base, suffixes, count, seed) {
  return Object.freeze(Array.from({ length: count }, (_, index) => `${base} ${pick(suffixes, seed + index)}`));
}

function makeFactionProfile(continent, region, provinceName, regionIndex, provinceIndex) {
  const base = baseProvinceName(provinceName);
  const power = realmBand(continent.realmRange, regionIndex, provinceIndex);
  const apex = region.apexSect;
  const localKinds = continent.factionKinds;
  const localSuffixes = continent.factionSuffixes;
  const tiers = ['bá chủ', 'đại tông', 'đại tông', 'trung tông', 'địa phương'];

  const branch = Object.freeze({
    id: `hr_branch_${continent.id}_${region.id}_${slugifyVi(provinceName)}`,
    name: `${apex} · ${provinceName} Phân Tông`,
    parentSectName: apex,
    kind: 'Đại Tông Phân Chi',
    tier: 'xuyên châu',
    alignment: continent.alignment,
    headquarters: `${base} Phân Tông Sơn Môn`,
    specialties: Object.freeze([...region.elements]),
    controlledResources: Object.freeze([pick(continent.products, provinceIndex), pick(continent.minerals, provinceIndex + 1)]),
    power: Object.freeze({
      discipleRealmRange: Object.freeze([Math.max(0, power.minRealmIdx - 3), Math.max(1, power.minRealmIdx + 2)]),
      elderRealmRange: Object.freeze([Math.max(2, power.maxRealmIdx - 3), power.maxRealmIdx]),
      leaderRealmIdx: power.maxRealmIdx,
      ancestorRealmIdx: power.bossRealmIdx
    }),
    status: 'world_data'
  });

  const locals = tiers.map((tier, slot) => {
    const kind = pick(localKinds, provinceIndex + slot);
    const suffix = pick(localSuffixes, regionIndex + provinceIndex + slot);
    return Object.freeze({
      id: `hr_faction_${continent.id}_${region.id}_${slugifyVi(provinceName)}_${slot + 1}`,
      name: `${base} ${suffix}`,
      kind,
      tier,
      alignment: continent.alignment,
      headquarters: `${base} ${kind.includes('Tộc') || kind.includes('Gia') ? 'Tổ Địa' : 'Sơn Môn'}`,
      doctrine: `${region.focus}; chủ tu ${pick(region.elements, slot)}${region.elements.length > 1 ? ` và ${pick(region.elements, slot + 1)}` : ''}.`,
      specialties: Object.freeze([...new Set([pick(region.elements, slot), pick(region.elements, slot + 1)])]),
      controlledResources: Object.freeze([...new Set([pick(continent.products, slot + provinceIndex), pick(continent.minerals, slot + provinceIndex + 1)])]),
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
    provinceName,
    dominantFactionId: locals[0].id,
    factions,
    summary: `${provinceName} có 1 phân tông của ${apex}, 1 thế lực bá chủ, 2 đại tông, 1 trung tông và 1 thế lực địa phương chủ lực.`,
    generationCounts: Object.freeze({
      namedCoreFactions: factions.length,
      majorAndMediumFactions: 18 + ((regionIndex * 7 + provinceIndex * 5) % 37),
      minorSects: 50 + ((regionIndex * 13 + provinceIndex * 11) % 121),
      cultivationFamilies: 45 + ((regionIndex * 17 + provinceIndex * 9) % 151)
    })
  });
}

function makeProvinceNode(continent, region, continentNodeId, regionNodeId, regionIndex, provinceIndex) {
  const provinceName = `${PROVINCE_PREFIXES[provinceIndex]} ${region.provinceRoot} Châu`;
  const base = baseProvinceName(provinceName);
  const seed = regionIndex * 12 + provinceIndex;
  const enemyProfile = realmBand(continent.realmRange, regionIndex, provinceIndex);
  const capital = `${base} ${pick(CITY_SUFFIXES, seed)}`;
  const factionProfile = makeFactionProfile(continent, region, provinceName, regionIndex, provinceIndex);

  return Object.freeze({
    id: `${regionNodeId}.prov.${slugifyVi(provinceName)}`,
    type: 'province',
    name: provinceName,
    parentId: regionNodeId,
    continentId: continent.id,
    regionId: region.id,
    provinceIndex: provinceIndex + 1,
    theme: region.theme,
    desc: `${provinceName} thuộc ${region.name}, ${continent.name}; ${region.desc}`,
    climate: `${continent.climate}; ${region.focus}`,
    capital,
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
    id: 'east', name: 'Đông Huyền Đại Lục', position: 'Đông', alignment: 'chính đạo / hải tu / kiếm tu',
    desc: 'Đại lục phương Đông, nơi hải vực, long mạch, kiếm sơn và lôi trạch giao thoa; thương hải và phi kiếm cực thịnh.',
    climate: 'gió biển, linh vũ, sơn hải và lôi bạo theo mùa', realmRange: [6, 25],
    products: ['Long Linh Thảo', 'Hải Tâm Châu', 'Tử Tiêu Lôi Trúc', 'Thanh Long Mộc', 'Đông Hải Linh Dịch'],
    minerals: ['Hải Lam Tinh', 'Lôi Văn Thạch', 'Long Mạch Ngọc', 'Canh Kim Kiếm Tinh'],
    enemies: ['Hải Giao', 'Lôi Ưng Yêu', 'Kiếm Linh', 'Thanh Long Mộc Yêu', 'Đông Hải Tà Tu'],
    factionKinds: ['Kiếm Tông', 'Thủy Cung', 'Lôi Điện', 'Long Tộc', 'Phù Môn', 'Tu Tiên Gia Tộc'],
    factionSuffixes: ['Thiên Kiếm Tông', 'Thương Hải Cung', 'Cửu Lôi Điện', 'Thanh Long Đạo Viện', 'Đông Huyền Phù Môn', 'Vân Hải Thế Gia'],
    regions: [
      ['thanh_long','Thanh Long Vực','long','Long','thanh long mạch và mộc linh cổ địa',['Mộc','Thủy','Phong'],'Thanh Long Thánh Tông'],
      ['thuong_hai','Thương Hải Vực','ocean','Hải','đại dương, quần đảo và thương cảng tu tiên',['Thủy','Phong','Lôi'],'Thương Hải Tiên Cung'],
      ['thien_kiem','Thiên Kiếm Vực','sword','Kiếm','kiếm sơn, kiếm mộ và phi kiếm truyền thừa',['Kiếm','Kim','Phong'],'Thiên Kiếm Thánh Tông'],
      ['loi_trach','Lôi Trạch Vực','thunder','Lôi','lôi trạch, thiên lôi và yêu thú lôi hệ',['Lôi','Thủy','Kim'],'Cửu Tiêu Lôi Tông'],
      ['van_moc','Vạn Mộc Vực','forest','Mộc','thần mộc, dược cốc và mộc linh sinh cơ',['Mộc','Thổ','Thủy'],'Vạn Mộc Trường Sinh Tông'],
      ['linh_phu','Linh Phù Vực','talisman','Phù','phù đạo, trận pháp và linh văn cổ',['Kim','Mộc','Lôi'],'Thiên Phù Đạo Cung'],
      ['dong_hoang','Đông Hoang Vực','frontier','Hoang','biên hoang, thú triều và cổ tộc phương Đông',['Vật Lý','Mộc','Hỏa'],'Đông Hoang Chiến Tông'],
      ['long_uyen','Long Uyên Vực','dragon','Uyên','long uyên, giao long và thủy phủ cổ',['Thủy','Lôi','Vật Lý'],'Long Uyên Thần Cung'],
      ['nhat_thang','Nhật Thăng Vực','sunrise','Nhật','linh quang nhật xuất, hỏa khí và quang pháp',['Hỏa','Kim','Phong'],'Nhật Thăng Tiên Tông']
    ]
  }),
  freezeNested({
    id: 'west', name: 'Tây Mạc Đại Lục', position: 'Tây', alignment: 'hỗn hợp chính tà / cổ tộc',
    desc: 'Đại lục phương Tây với đại mạc vô tận, cổ quốc vùi cát, địa hỏa, thần điện và truyền thừa tiền cổ.',
    climate: 'khô nóng, sa bạo, chênh lệch nhiệt lớn và địa hỏa mạnh', realmRange: [8, 24],
    products: ['Xích Diễm Quả', 'Sa Tinh', 'Hoang Cổ Linh Dịch', 'Kim Sa Thảo', 'Cổ Ngọc'],
    minerals: ['Xích Viêm Thạch', 'Kim Sa Tinh', 'Hoang Kim Khoáng', 'Cổ Ngọc Tủy'],
    enemies: ['Sa Hải Long Trùng', 'Xích Viêm Tích', 'Cổ Mộ Âm Binh', 'Hoang Mạc Tà Tu', 'Thạch Giáp Cự Nhân'],
    factionKinds: ['Sa Tông', 'Hỏa Cung', 'Cổ Mộ Phái', 'Thể Tu Môn', 'Thương Minh', 'Cổ Tộc'],
    factionSuffixes: ['Vô Tận Sa Tông', 'Xích Nhật Hỏa Cung', 'Cổ Vương Điện', 'Hoang Thần Thể Môn', 'Kim Sa Thương Minh', 'Thái Cổ Thần Tộc'],
    regions: [
      ['dai_mac','Đại Mạc Vực','desert','Mạc','đại mạc vô tận và linh tuyền ốc đảo',['Thổ','Phong','Hỏa'],'Đại Mạc Thiên Tông'],
      ['xich_viem','Xích Viêm Vực','fire','Viêm','hỏa sơn, địa hỏa và luyện thể hỏa pháp',['Hỏa','Thổ','Vật Lý'],'Xích Viêm Thần Cung'],
      ['co_mo','Cổ Mộ Vực','tomb','Mộ','cổ mộ, hoàng lăng và âm linh truyền thừa',['Thổ','Kim','Vật Lý'],'Cổ Vương Thần Điện'],
      ['kim_sa','Kim Sa Vực','gold_sand','Sa','kim sa, thương lộ và linh khoáng hiếm',['Kim','Thổ','Phong'],'Kim Sa Vạn Bảo Tông'],
      ['thach_lam','Thạch Lâm Vực','stone','Thạch','thạch lâm, cự nham và cổ trận địa',['Thổ','Kim','Vật Lý'],'Thiên Thạch Huyền Tông'],
      ['huyen_sa','Huyễn Sa Vực','illusion','Huyễn','ảo sa, mê cảnh và thần hồn pháp môn',['Phong','Hỏa','Thủy'],'Huyễn Sa Đạo Cung'],
      ['hoang_thu','Hoang Thú Vực','beast','Thú','hoang thú, cổ huyết và bộ tộc săn yêu',['Vật Lý','Hỏa','Thổ'],'Hoang Thú Thánh Tông'],
      ['lac_nhat','Lạc Nhật Vực','sunset','Nhật','lạc nhật thần hỏa và cổ thành sa mạc',['Hỏa','Kim','Phong'],'Lạc Nhật Tiên Cung'],
      ['vo_tan','Vô Tận Vực','abyss_desert','Vô','sa hải vô biên, không gian loạn lưu và cấm khu',['Thổ','Phong','Lôi'],'Vô Tận Thần Tông']
    ]
  }),
  freezeNested({
    id: 'north', name: 'Bắc Minh Đại Lục', position: 'Bắc', alignment: 'hàn hệ chính đạo / cổ yêu',
    desc: 'Đại lục phương Bắc bị băng nguyên và Bắc Minh hải bao phủ, nổi tiếng với băng pháp, hàn kiếm và cổ yêu huyết mạch.',
    climate: 'cực hàn, băng tuyết quanh năm, cực quang và hàn triều', realmRange: [10, 26],
    products: ['Băng Tâm Liên', 'Hàn Băng Thảo', 'Bắc Minh Huyền Thủy', 'Tuyết Phách', 'Hàn Long Cốt'],
    minerals: ['Hàn Ngọc', 'Băng Tinh Thạch', 'Bắc Minh Tinh Thiết', 'Cực Quang Linh Tinh'],
    enemies: ['Cực Hàn Băng Giao', 'Tuyết Lang Yêu', 'Băng Giáp Hùng', 'Hàn Phách Linh', 'Bắc Minh Yêu Tu'],
    factionKinds: ['Băng Cung', 'Tuyết Tông', 'Hàn Kiếm Phái', 'Bắc Minh Môn', 'Ngự Thú Cốc', 'Hàn Tộc'],
    factionSuffixes: ['Băng Phách Tiên Cung', 'Thiên Tuyết Tông', 'Hàn Nguyệt Kiếm Phái', 'Bắc Minh Huyền Môn', 'Tuyết Linh Cốc', 'Cực Hàn Cổ Tộc'],
    regions: [
      ['huyen_bang','Huyền Băng Vực','ice','Băng','huyền băng vạn năm và băng linh mạch',['Thủy','Kiếm','Kim'],'Huyền Băng Tiên Cung'],
      ['tuyet_nguyen','Tuyết Nguyên Vực','snowfield','Tuyết','tuyết nguyên, thú triều và băng thảo',['Thủy','Phong','Vật Lý'],'Thiên Tuyết Thánh Tông'],
      ['bac_minh','Bắc Minh Vực','dark_sea','Minh','Bắc Minh hải, huyền thủy và cự yêu biển',['Thủy','Lôi','Vật Lý'],'Bắc Minh Thần Tông'],
      ['han_nguyet','Hàn Nguyệt Vực','moon_ice','Nguyệt','hàn nguyệt linh quang và kiếm tu băng hệ',['Kiếm','Thủy','Phong'],'Hàn Nguyệt Kiếm Tông'],
      ['cuc_quang','Cực Quang Vực','aurora','Quang','cực quang linh khí và lôi băng dị biến',['Lôi','Thủy','Phong'],'Cực Quang Thiên Điện'],
      ['bang_hai','Băng Hải Vực','frozen_ocean','Hải','băng hải, phù băng và cổ long hàn vực',['Thủy','Vật Lý','Lôi'],'Băng Hải Long Cung'],
      ['tuyet_son','Tuyết Sơn Vực','snow_mountain','Sơn','tuyết sơn, hàn động và linh khoáng',['Thổ','Thủy','Kiếm'],'Vạn Tuyết Sơn Tông'],
      ['han_phong','Hàn Phong Vực','cold_wind','Phong','hàn phong, băng nhận và thân pháp cực tốc',['Phong','Thủy','Kiếm'],'Hàn Phong Thần Tông'],
      ['cuu_han','Cửu Hàn Vực','deep_cold','Hàn','cửu tầng hàn vực và cấm địa cực bắc',['Thủy','Lôi','Kim'],'Cửu Hàn Thánh Địa']
    ]
  }),
  freezeNested({
    id: 'central', name: 'Trung Vực Đại Lục', position: 'Trung', alignment: 'thánh địa / siêu cấp thế lực',
    desc: 'Trung tâm của Nhân Giới, linh khí và pháp tắc đậm đặc nhất; tập trung thánh địa, cổ tộc, đại thành và truyền tống liên lục địa.',
    climate: 'linh khí cực thịnh, địa mạch ổn định, nhiều thiên tượng và pháp tắc dị cảnh', realmRange: [17, 28],
    products: ['Thiên Nguyên Tinh', 'Hóa Thần Dược Tủy', 'Nguyên Anh Linh Quả', 'Tử Khí Linh Dịch', 'Hư Không Tinh Sa'],
    minerals: ['Tử Vi Tinh Kim', 'Thiên Tinh Thạch', 'Hư Không Tinh', 'Càn Khôn Ngọc'],
    enemies: ['Hư Không Dị Thú', 'Cổ Điện Khôi Lỗi', 'Tà Đạo Nguyên Anh', 'Thiên Ngoại Ma Ảnh', 'Hộ Sơn Thánh Thú'],
    factionKinds: ['Thánh Địa', 'Đạo Cung', 'Tiên Tông', 'Đan Tháp', 'Vạn Pháp Điện', 'Cổ Tộc'],
    factionSuffixes: ['Cửu Thiên Thánh Địa', 'Thái Nhất Đạo Cung', 'Hạo Thiên Tiên Tông', 'Vạn Đan Thánh Tháp', 'Vạn Pháp Thần Điện', 'Tử Vi Cổ Tộc'],
    regions: [
      ['thien_do','Thiên Đô Vực','capital','Đô','siêu cấp đại thành và trung tâm quyền lực Nhân Giới',['Kim','Lôi','Kiếm'],'Thiên Đô Thánh Địa'],
      ['thai_nhat','Thái Nhất Vực','dao','Nhất','âm dương, thái nhất và đại đạo chính thống',['Thủy','Hỏa','Kim'],'Thái Nhất Đạo Cung'],
      ['can_khon','Càn Khôn Vực','space','Khôn','không gian, trận pháp và càn khôn bí cảnh',['Thổ','Phong','Lôi'],'Càn Khôn Thần Tông'],
      ['tu_vi','Tử Vi Vực','stars','Vi','tinh tượng, tử khí và cổ tộc thiên mệnh',['Kim','Lôi','Thủy'],'Tử Vi Thánh Tộc'],
      ['hao_thien','Hạo Thiên Vực','heaven','Hạo','hạo thiên pháp tắc và chiến điện cổ',['Lôi','Kiếm','Vật Lý'],'Hạo Thiên Tiên Tông'],
      ['van_phap','Vạn Pháp Vực','all_arts','Pháp','vạn pháp, công pháp và đạo thống hội tụ',['Kiếm','Kim','Hỏa','Thủy'],'Vạn Pháp Thần Điện'],
      ['thanh_linh','Thánh Linh Vực','spirit','Linh','thánh linh, linh thú và sinh mệnh linh tuyền',['Mộc','Thủy','Phong'],'Thánh Linh Tiên Cung'],
      ['tien_ha','Tiên Hà Vực','celestial_river','Hà','tiên hà, thiên thủy và phi chu liên vực',['Thủy','Phong','Lôi'],'Tiên Hà Đạo Tông'],
      ['thien_nguyen','Thiên Nguyên Vực','origin','Nguyên','thiên nguyên linh mạch và đạo nguyên cổ địa',['Kim','Thổ','Lôi'],'Thiên Nguyên Thánh Địa']
    ]
  })
]);

function normalizeRegionSpec(raw) {
  const [id, name, theme, provinceRoot, focus, elements, apexSect] = raw;
  return Object.freeze({ id, name, theme, provinceRoot, focus, elements: Object.freeze([...elements]), apexSect, desc: `${focus}; là một trong 9 Đại Vực trọng yếu.` });
}

const normalizedContinents = NEW_CONTINENT_SPECS.map(continent => Object.freeze({
  ...continent,
  regions: Object.freeze(continent.regions.map(normalizeRegionSpec))
}));

export const HUMAN_REALM_CONTINENTS = Object.freeze([
  Object.freeze({
    id: 'south', nodeId: NAM_LANG_ROOT_ID, name: 'Nam Lăng Đại Lục', position: 'Nam', existing: true,
    desc: 'Nam Đại Lục của Nhân Giới; giữ nguyên toàn bộ 9 Đại Vực / 108 Châu và tuyến khởi đầu hiện hữu.'
  }),
  ...normalizedContinents.map(continent => Object.freeze({
    id: continent.id,
    nodeId: `${HUMAN_REALM_ROOT_ID}.continent.${continent.id}`,
    name: continent.name,
    position: continent.position,
    existing: false,
    desc: continent.desc
  }))
]);

const humanRealmNodes = [
  Object.freeze({
    id: HUMAN_REALM_ROOT_ID,
    type: 'realm',
    name: 'Nhân Giới',
    parentId: null,
    desc: 'Hạ giới trung tâm của nhân tộc và vạn tộc, gồm 5 Đại Lục: Đông, Tây, Nam, Bắc và Trung Vực. Mỗi Đại Lục có đúng 9 Đại Vực và 108 Châu.',
    counts: Object.freeze({ continents: 5, greatRegions: 45, provinces: 540 }),
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
      desc: `${node.desc} Đây là Nam Đại Lục của Nhân Giới.`
    }));
  } else {
    humanRealmNodes.push(node);
  }
}

for (const continent of normalizedContinents) {
  const continentNodeId = `${HUMAN_REALM_ROOT_ID}.continent.${continent.id}`;
  humanRealmNodes.push(Object.freeze({
    id: continentNodeId,
    type: 'continent',
    name: continent.name,
    parentId: HUMAN_REALM_ROOT_ID,
    position: continent.position,
    humanRealmContinentId: continent.id,
    desc: continent.desc,
    climate: continent.climate,
    signatureProducts: Object.freeze([...continent.products]),
    signatureMinerals: Object.freeze([...continent.minerals]),
    signatureEnemies: Object.freeze([...continent.enemies]),
    counts: Object.freeze({ greatRegions: 9, provinces: 108 }),
    generationProfile: Object.freeze({ materializedByDefault: false }),
    status: 'world_data'
  }));

  continent.regions.forEach((region, regionIndex) => {
    const regionNodeId = `${continentNodeId}.gr.${region.id}`;
    humanRealmNodes.push(Object.freeze({
      id: regionNodeId,
      type: 'great_region',
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
      counts: Object.freeze({ provinces: 12 }),
      status: 'world_data'
    }));

    for (let provinceIndex = 0; provinceIndex < 12; provinceIndex++) {
      humanRealmNodes.push(makeProvinceNode(continent, region, continentNodeId, regionNodeId, regionIndex, provinceIndex));
    }
  });
}

const continents = humanRealmNodes.filter(node => node.type === 'continent');
const greatRegions = humanRealmNodes.filter(node => node.type === 'great_region');
const provinces = humanRealmNodes.filter(node => node.type === 'province');
if (continents.length !== 5 || greatRegions.length !== 45 || provinces.length !== 540) {
  throw new Error(`[HUMAN REALM] Sai cấu trúc: ${continents.length} Đại Lục / ${greatRegions.length} Đại Vực / ${provinces.length} Châu.`);
}

export const HUMAN_REALM_WORLD_NODES = Object.freeze(humanRealmNodes);
export const NEW_HUMAN_REALM_CONTINENT_SPECS = Object.freeze(normalizedContinents);
