/**
 * namLangProvinceAtlas.js
 * Complete DATA-ONLY atlas for all 108 Châu of Nam Lăng.
 *
 * This file does NOT create runtime maps. It enriches the one canonical Nam Lăng
 * hierarchy with deterministic province-level lore/gameplay metadata so every
 * Châu already has named settlements, exploration sites, products and enemy
 * progression before individual locations are materialized as playable maps.
 */

export const PROVINCE_ATLAS_VERSION = '20260929-nam-lang-province-atlas-v1';

const REGION_PROFILES = Object.freeze({
  thanh_linh: Object.freeze({
    label: 'Thanh Linh Vực', climate: 'ôn hòa, sơn thủy và linh điền đan xen',
    citySuffixes: ['Linh Thành', 'Thanh Thành', 'Vân Thành', 'Hà Thành'],
    townSuffixes: ['Thanh Phong Trấn', 'Bạch Thạch Trấn', 'Linh Khê Trấn', 'Vân Mộc Trấn', 'Tụ Linh Phường'],
    villages: ['Thanh Hà Thôn', 'Bạch Vân Thôn', 'Linh Điền Thôn', 'Cổ Mộc Thôn', 'Trúc Khê Thôn'],
    secrets: ['Cổ Tu Động Phủ', 'Thanh Linh Bí Cảnh', 'Vân Mộng Cổ Cốc'],
    forbidden: ['Huyết Vụ Cấm Cốc', 'Táng Kiếm Cổ Địa'],
    products: ['Ngưng Khí Thảo', 'Bạch Linh Chi', 'Thanh Linh Hoa', 'Thanh Linh Mộc', 'Hạ Phẩm Linh Thạch'],
    minerals: ['Thanh Cương Thạch', 'Bạch Ngọc Khoáng', 'Hạ Phẩm Linh Thạch'],
    enemies: ['Thanh Lang', 'Thiết Nha Trư', 'Mộc Linh Yêu', 'Sơn Tặc Tu Sĩ', 'Hắc Giáp Xà'],
    realm: [0, 16], elements: ['Mộc', 'Thổ', 'Kiếm', 'Kim']
  }),
  nam_hoang: Object.freeze({
    label: 'Nam Hoang Vực', climate: 'cổ lâm nóng ẩm, độc chướng và yêu thú dày đặc',
    citySuffixes: ['Man Hoang Thành', 'Ngự Thú Thành', 'Cổ Mộc Thành', 'Độc Vân Thành'],
    townSuffixes: ['Bách Thú Trấn', 'Độc Mộc Trấn', 'Xà Cốc Trấn', 'Man Lâm Trấn', 'Hắc Trạch Trấn'],
    villages: ['Sơn Liệp Trại', 'Mộc Linh Thôn', 'Bách Thú Thôn', 'Độc Tuyền Thôn', 'Cổ Đằng Thôn'],
    secrets: ['Vạn Thú Bí Cảnh', 'Thần Mộc Động Thiên', 'Cổ Vu Tế Đàn'],
    forbidden: ['Vạn Độc Ma Trạch', 'Thú Hoàng Cấm Lâm'],
    products: ['Huyết Linh Chi', 'Thiên Thanh Đằng', 'Độc Long Thảo', 'Yêu Đan', 'Linh Thú Cốt'],
    minerals: ['Mộc Tinh Thạch', 'Huyết Văn Khoáng', 'Độc Ngọc'],
    enemies: ['Xích Mãng Yêu', 'Độc Giáp Ngô Công', 'Man Hoang Cự Viên', 'Huyết Văn Hổ', 'Cổ Mộc Yêu Vương'],
    realm: [4, 20], elements: ['Mộc', 'Vật Lý', 'Hỏa', 'Thổ']
  }),
  thuong_hai: Object.freeze({
    label: 'Thương Hải Vực', climate: 'hải đảo, thủy vực, bão linh khí và thương cảng trải dài',
    citySuffixes: ['Hải Thiên Thành', 'Tinh Cảng Thành', 'Thương Lan Thành', 'Long Hải Thành'],
    townSuffixes: ['Triều Âm Trấn', 'Hải Nguyệt Trấn', 'Tinh Sa Trấn', 'Bích Cảng Trấn', 'Phi Chu Cảng'],
    villages: ['Ngư Linh Thôn', 'San Hô Thôn', 'Hải Phong Thôn', 'Bạch Sa Thôn', 'Tinh Ngư Thôn'],
    secrets: ['Hải Nhãn Bí Cảnh', 'Long Cung Tàn Điện', 'Tinh Hải Động Thiên'],
    forbidden: ['Hắc Triều Cấm Hải', 'Vực Sâu Hải Yêu'],
    products: ['Hải Tâm Châu', 'Băng Tâm Liên', 'Long Lân', 'Tinh Sa', 'Thủy Linh Ngọc'],
    minerals: ['Hải Lam Tinh', 'San Hô Ngọc', 'Thủy Linh Thạch'],
    enemies: ['Hải Xà Yêu', 'Thiết Giáp Giải', 'Hắc Thủy Giao', 'Tinh Hải Yêu Tu', 'Thâm Hải Cự Kình'],
    realm: [7, 21], elements: ['Thủy', 'Phong', 'Lôi', 'Kiếm']
  }),
  van_son: Object.freeze({
    label: 'Vạn Sơn Vực', climate: 'núi cao, mỏ sâu, địa hỏa và linh mạch kim thạch',
    citySuffixes: ['Thiên Công Thành', 'Huyền Thiết Thành', 'Địa Hỏa Thành', 'Vạn Khoáng Thành'],
    townSuffixes: ['Luyện Khí Trấn', 'Hắc Thiết Trấn', 'Kim Nham Trấn', 'Địa Hỏa Trấn', 'Thạch Lâm Trấn'],
    villages: ['Khoáng Phu Thôn', 'Thiết Mộc Thôn', 'Sơn Lô Thôn', 'Long Mạch Thôn', 'Bàn Thạch Thôn'],
    secrets: ['Thiên Công Bí Khố', 'Long Mạch Địa Cung', 'Cổ Luyện Khí Động'],
    forbidden: ['Địa Hỏa Tuyệt Uyên', 'Vạn Nhận Cấm Sơn'],
    products: ['Huyền Thiết', 'Xích Đồng', 'Kim Tinh Khoáng', 'Địa Hỏa Tinh', 'Long Mạch Thạch'],
    minerals: ['Huyền Thiết Khoáng', 'Xích Đồng Khoáng', 'Canh Kim Tinh', 'Địa Hỏa Tinh Thạch'],
    enemies: ['Thạch Giáp Yêu', 'Kim Nham Khôi Lỗi', 'Địa Hỏa Tích', 'Khoáng Mạch Dị Trùng', 'Long Mạch Thạch Linh'],
    realm: [8, 22], elements: ['Kim', 'Thổ', 'Hỏa', 'Vật Lý']
  }),
  dong_huyen: Object.freeze({
    label: 'Đông Huyền Vực', climate: 'kiếm sơn, phong cốc và kiếm ý cổ xưa bao phủ',
    citySuffixes: ['Kiếm Tiên Thành', 'Vạn Kiếm Thành', 'Tử Tiêu Thành', 'Bạch Đế Thành'],
    townSuffixes: ['Tàng Kiếm Trấn', 'Kiếm Lô Trấn', 'Thanh Phong Trấn', 'Vấn Kiếm Trấn', 'Phi Kiếm Phường'],
    villages: ['Kiếm Thạch Thôn', 'Thanh Trúc Thôn', 'Bạch Phong Thôn', 'Cổ Kiếm Thôn', 'Vân Nhai Thôn'],
    secrets: ['Thái Hư Kiếm Mộ', 'Vạn Kiếm Bí Cảnh', 'Kiếm Tâm Động Thiên'],
    forbidden: ['Đoạn Kiếm Cấm Cốc', 'Vô Sinh Kiếm Vực'],
    products: ['Kiếm Tâm Thạch', 'Canh Kim Kiếm Tinh', 'Phong Linh Thảo', 'Tử Tiêu Lôi Trúc', 'Cổ Kiếm Mảnh'],
    minerals: ['Kiếm Cương Tinh', 'Canh Kim Tinh', 'Tử Tiêu Lôi Thạch'],
    enemies: ['Kiếm Linh', 'Phong Nhận Yêu', 'Cổ Kiếm Khôi Lỗi', 'Tà Kiếm Tu', 'Kiếm Ma Tàn Hồn'],
    realm: [10, 24], elements: ['Kiếm', 'Kim', 'Phong', 'Lôi']
  }),
  trung_thien: Object.freeze({
    label: 'Trung Thiên Vực', climate: 'linh khí cực thịnh, đại thành và thánh địa dày đặc',
    citySuffixes: ['Thiên Đô', 'Thánh Thành', 'Cửu Thiên Thành', 'Tử Vi Thành'],
    townSuffixes: ['Vạn Pháp Phường', 'Tiên Hà Trấn', 'Hạo Thiên Trấn', 'Tụ Tiên Phường', 'Đan Khí Thánh Trấn'],
    villages: ['Linh Tuyền Thôn', 'Thiên Điền Thôn', 'Tử Khí Thôn', 'Tiên Mộc Thôn', 'Càn Khôn Thôn'],
    secrets: ['Càn Khôn Bí Cảnh', 'Tử Vi Tinh Cung', 'Cửu Thiên Động Thiên'],
    forbidden: ['Thiên Phạt Cấm Khu', 'Hư Không Tuyệt Vực'],
    products: ['Thiên Nguyên Tinh', 'Tử Khí Linh Dịch', 'Nguyên Anh Linh Quả', 'Hóa Thần Dược Tủy', 'Hư Không Tinh Sa'],
    minerals: ['Thiên Tinh Thạch', 'Tử Vi Tinh Kim', 'Hư Không Tinh'],
    enemies: ['Hộ Sơn Linh Thú', 'Hư Không Dị Thú', 'Cổ Điện Khôi Lỗi', 'Tà Đạo Nguyên Anh', 'Thiên Ngoại Ma Ảnh'],
    realm: [17, 28], elements: ['Kiếm', 'Lôi', 'Kim', 'Thủy', 'Hỏa']
  }),
  tay_hoang: Object.freeze({
    label: 'Tây Hoang Vực', climate: 'đại mạc, cổ thành đổ nát, linh phong và địa hỏa khô cằn',
    citySuffixes: ['Hoang Sa Thành', 'Xích Nhật Thành', 'Cổ Mạc Thành', 'Kim Sa Thành'],
    townSuffixes: ['Ốc Đảo Trấn', 'Thạch Lâm Trấn', 'Xích Sa Trấn', 'Cổ Lộ Trấn', 'Sa Hải Phường'],
    villages: ['Hoàng Sa Thôn', 'Thạch Tuyền Thôn', 'Cổ Tường Thôn', 'Lạc Nhật Thôn', 'Kim Sa Thôn'],
    secrets: ['Cổ Vương Lăng', 'Nhật Viêm Bí Cảnh', 'Sa Hải Tàn Cung'],
    forbidden: ['Vô Tận Sa Hải', 'Xích Nhật Cấm Địa'],
    products: ['Xích Diễm Quả', 'Sa Tinh', 'Cổ Ngọc', 'Nhật Viêm Tinh', 'Hoang Mạc Linh Dịch'],
    minerals: ['Kim Sa Tinh', 'Xích Viêm Thạch', 'Cổ Ngọc Khoáng'],
    enemies: ['Sa Hạt Yêu', 'Xích Viêm Tích', 'Cổ Mộ Âm Binh', 'Hoang Mạc Tà Tu', 'Sa Hải Long Trùng'],
    realm: [8, 23], elements: ['Hỏa', 'Thổ', 'Kim', 'Phong']
  }),
  bac_han: Object.freeze({
    label: 'Bắc Hàn Vực', climate: 'băng nguyên, tuyết sơn, hàn hồ và cực quang linh khí',
    citySuffixes: ['Băng Thành', 'Hàn Nguyệt Thành', 'Tuyết Đô', 'Bắc Minh Thành'],
    townSuffixes: ['Bạch Sương Trấn', 'Hàn Hồ Trấn', 'Tuyết Sơn Trấn', 'Băng Nguyên Trấn', 'Cực Quang Phường'],
    villages: ['Tuyết Mộc Thôn', 'Băng Ngư Thôn', 'Hàn Tuyền Thôn', 'Bạch Lộc Thôn', 'Tuyết Lang Thôn'],
    secrets: ['Bắc Minh Băng Cung', 'Hàn Nguyệt Bí Cảnh', 'Vạn Niên Băng Quật'],
    forbidden: ['Cực Hàn Tuyệt Địa', 'Băng Phách Cấm Hồ'],
    products: ['Hàn Băng Thảo', 'Băng Tâm Liên', 'Hàn Ngọc', 'Tuyết Phách', 'Bắc Minh Huyền Thủy'],
    minerals: ['Hàn Ngọc Khoáng', 'Băng Tinh Thạch', 'Bắc Minh Tinh Thiết'],
    enemies: ['Tuyết Lang Yêu', 'Băng Giáp Hùng', 'Hàn Phách Linh', 'Bắc Minh Yêu Tu', 'Cực Hàn Băng Giao'],
    realm: [12, 25], elements: ['Thủy', 'Phong', 'Kiếm', 'Lôi']
  }),
  huyet_u: Object.freeze({
    label: 'Huyết U Vực', climate: 'âm mạch, cổ chiến trường, huyết vụ và ma khí cực thịnh',
    citySuffixes: ['U Minh Thành', 'Huyết Ngục Thành', 'Ma Uyên Thành', 'Cửu U Thành'],
    townSuffixes: ['Âm Sơn Trấn', 'Táng Hồn Trấn', 'Vạn Cốt Trấn', 'Huyết Sa Trấn', 'Minh Hà Phường'],
    villages: ['Hắc Cốt Thôn', 'Âm Tuyền Thôn', 'Huyết Mộc Thôn', 'Cổ Chiến Thôn', 'Minh Đăng Thôn'],
    secrets: ['Cửu U Ma Điện', 'Táng Hồn Bí Cảnh', 'Cổ Chiến Trường Thâm Tầng'],
    forbidden: ['Ma Uyên Tuyệt Vực', 'Huyết Ngục Cấm Địa'],
    products: ['Huyết Tinh', 'Âm Hồn Thạch', 'Ma Huyết Chi', 'U Minh Linh Dịch', 'Cửu U Cốt Ngọc'],
    minerals: ['Huyết Tinh Khoáng', 'Âm Hồn Thạch', 'Ma Uyên Hắc Kim'],
    enemies: ['Huyết Thi', 'Âm Hồn Tướng', 'Ma Tu', 'Cốt Long', 'Cửu U Ma Tướng'],
    realm: [17, 28], elements: ['Hỏa', 'Lôi', 'Vật Lý', 'Thủy']
  })
});

function baseName(provinceName) {
  return String(provinceName).replace(/\s*Châu$/u, '');
}

function pick(list, seed) {
  return list[Math.abs(Number(seed) || 0) % list.length];
}

function realmBand([regionMin, regionMax], provinceIndex) {
  const span = Math.max(1, regionMax - regionMin);
  const offset = Math.round((provinceIndex / 11) * Math.min(8, span));
  const min = Math.min(regionMax, regionMin + Math.floor(offset * 0.55));
  const max = Math.min(regionMax, Math.max(min + 2, min + Math.ceil(span * 0.58)));
  return Object.freeze({ minRealmIdx: min, maxRealmIdx: max, bossRealmIdx: Math.min(28, max + 1) });
}

function namedList(base, source, count, seed, separator = ' · ') {
  const result = [];
  for (let i = 0; i < count; i++) result.push(`${base}${separator}${pick(source, seed + i)}`);
  return Object.freeze(result);
}

export function getProvinceAtlasProfile(regionId, provinceName, provinceIndex = 0) {
  const profile = REGION_PROFILES[regionId] || REGION_PROFILES.thanh_linh;
  const base = baseName(provinceName);
  const seed = Number(provinceIndex) || 0;
  const enemyBand = realmBand(profile.realm, seed);

  const capital = `${base} ${pick(profile.citySuffixes, seed)}`;
  const cities = namedList(base, profile.citySuffixes, 3, seed + 1);
  const towns = namedList(base, profile.townSuffixes, 5, seed + 2);
  const villages = namedList(base, profile.villages, 5, seed + 3);
  const secretRealms = namedList(base, profile.secrets, 3, seed + 4);
  const forbiddenZones = namedList(base, profile.forbidden, 2, seed + 5);

  return Object.freeze({
    atlasVersion: PROVINCE_ATLAS_VERSION,
    regionId,
    provinceName,
    climate: profile.climate,
    desc: `${provinceName} thuộc ${profile.label}; địa thế ${profile.climate}. Trung tâm là ${capital}, xung quanh phân bố thành trấn, linh địa, bí cảnh và vùng nguy hiểm đặc trưng của ${profile.label}.`,
    capital,
    notableCities: cities,
    notableTowns: towns,
    notableVillages: villages,
    secretRealms,
    forbiddenZones,
    products: Object.freeze([...profile.products]),
    minerals: Object.freeze([...profile.minerals]),
    enemyProfile: Object.freeze({
      ...enemyBand,
      commonEnemies: Object.freeze([...profile.enemies]),
      eliteEnemy: `${base} ${pick(profile.enemies, seed + 2)} Tinh Anh`,
      fieldBoss: `${base} ${pick(profile.enemies, seed + 4)} Vương`,
      dominantElements: Object.freeze([...profile.elements])
    }),
    generationCounts: Object.freeze({
      cities: 80 + ((seed * 13) % 121),
      towns: 280 + ((seed * 37) % 721),
      villages: 2200 + ((seed * 211) % 5801),
      secretRealms: 12 + ((seed * 7) % 49),
      forbiddenZones: 5 + ((seed * 3) % 18),
      sectsAndFamilies: 90 + ((seed * 17) % 181)
    })
  });
}

export function getRegionAtlasProfile(regionId) {
  return REGION_PROFILES[regionId] || null;
}

export const NAM_LANG_REGION_ATLAS = REGION_PROFILES;
