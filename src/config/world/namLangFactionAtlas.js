/**
 * namLangFactionAtlas.js
 * DATA-ONLY cultivation faction network for the one Nam Lăng world hierarchy.
 *
 * The existing 9 player-joinable sects in sectsData.js remain canonical gameplay
 * sects. This atlas places their branches across the world and creates local
 * factions for every Châu without introducing another map or faction runtime.
 */
import { SECTS } from '../sectsData.js';

export const FACTION_ATLAS_VERSION = '20260929-nam-lang-faction-atlas-v1';

const REGION_FACTION_THEMES = Object.freeze({
  thanh_linh: Object.freeze({
    alignment: 'chính đạo',
    kinds: ['Đạo Tông', 'Đan Các', 'Phù Môn', 'Kiếm Phái', 'Ngự Thú Sơn Trang', 'Tu Tiên Gia Tộc'],
    suffixes: ['Thanh Huyền Đạo Tông', 'Bách Linh Cốc', 'Huyền Phù Môn', 'Tàng Kiếm Sơn Trang', 'Thiên Đan Các', 'Linh Hạc Thế Gia'],
    doctrines: ['thanh tu đạo pháp và dưỡng khí', 'luyện đan, linh dược và chữa trị', 'phù lục, trận pháp và trấn tà', 'kiếm thuật chính tông', 'ngự thú và linh sủng', 'gia truyền công pháp ổn định'],
    specialties: ['Mộc', 'Kiếm', 'Thổ', 'Kim'],
    resources: ['linh điền', 'dược viên', 'linh thạch hạ phẩm', 'phù chỉ', 'linh mộc'],
    realm: [8, 21]
  }),
  nam_hoang: Object.freeze({
    alignment: 'trung lập / bộ tộc',
    kinds: ['Ngự Thú Tông', 'Độc Môn', 'Vu Điện', 'Thể Tu Bộ Tộc', 'Mộc Linh Cốc', 'Yêu Tu Thế Lực'],
    suffixes: ['Vạn Thú Sơn', 'Thiên Độc Cốc', 'Cổ Vu Điện', 'Man Hoang Thánh Bộ', 'Thần Mộc Cốc', 'Huyết Mãng Yêu Đình'],
    doctrines: ['ngự thú và huyết khế', 'độc thuật và luyện cổ', 'vu văn, đồ đằng và tế pháp', 'thể phách, huyết khí và chiến kỹ', 'mộc pháp và sinh mệnh', 'yêu tu huyết mạch'],
    specialties: ['Mộc', 'Vật Lý', 'Hỏa', 'Thổ'],
    resources: ['yêu đan', 'độc thảo', 'linh thú huyết', 'cổ trùng', 'thần mộc'],
    realm: [10, 22]
  }),
  thuong_hai: Object.freeze({
    alignment: 'trung lập thương minh',
    kinds: ['Thủy Cung', 'Hải Kiếm Phái', 'Thương Minh', 'Long Tộc Chi Nhánh', 'Trận Hải Môn', 'Hải Tu Thế Gia'],
    suffixes: ['Thương Lan Thủy Cung', 'Hải Thiên Kiếm Phái', 'Vạn Hải Thương Minh', 'Thanh Giao Long Cung', 'Trấn Hải Trận Môn', 'Tinh Sa Thế Gia'],
    doctrines: ['thủy pháp và khống chế hải lưu', 'kiếm thuật trên phi chu', 'thương đạo, luyện khí và vận tải', 'giao long huyết mạch', 'trận pháp hải vực', 'hải tu gia truyền'],
    specialties: ['Thủy', 'Phong', 'Kiếm', 'Lôi'],
    resources: ['hải linh châu', 'thủy linh ngọc', 'long lân', 'san hô ngọc', 'tinh sa'],
    realm: [12, 23]
  }),
  van_son: Object.freeze({
    alignment: 'chính đạo luyện khí',
    kinds: ['Luyện Khí Tông', 'Thể Tu Môn', 'Địa Hỏa Cốc', 'Khoáng Minh', 'Khôi Lỗi Môn', 'Luyện Khí Thế Gia'],
    suffixes: ['Thiên Công Tông', 'Bàn Thạch Thể Môn', 'Địa Hỏa Cốc', 'Vạn Khoáng Minh', 'Thiên Cơ Khôi Lỗi Môn', 'Huyền Thiết Thế Gia'],
    doctrines: ['luyện khí và pháp bảo', 'thể tu và hộ thể', 'địa hỏa và dung luyện', 'khai khoáng và thương vận', 'khôi lỗi cơ quan', 'luyện khí gia truyền'],
    specialties: ['Kim', 'Thổ', 'Hỏa', 'Vật Lý'],
    resources: ['huyền thiết', 'canh kim', 'địa hỏa tinh', 'xích đồng', 'linh khoáng'],
    realm: [13, 23]
  }),
  dong_huyen: Object.freeze({
    alignment: 'kiếm đạo chính tông',
    kinds: ['Kiếm Tông', 'Kiếm Các', 'Kiếm Cốc', 'Kiếm Môn', 'Kiếm Lô', 'Kiếm Tu Thế Gia'],
    suffixes: ['Thái Hư Kiếm Tông', 'Tử Tiêu Kiếm Các', 'Vô Cực Kiếm Cốc', 'Thanh Phong Kiếm Môn', 'Thiên Kiếm Lô', 'Bạch Đế Kiếm Gia'],
    doctrines: ['ngự kiếm và kiếm trận', 'lôi kiếm và sát phạt', 'kiếm ý và tâm kiếm', 'phong kiếm và thân pháp', 'đúc kiếm và dưỡng kiếm', 'kiếm đạo gia truyền'],
    specialties: ['Kiếm', 'Kim', 'Phong', 'Lôi'],
    resources: ['kiếm tâm thạch', 'canh kim tinh', 'lôi trúc', 'cổ kiếm mảnh', 'kiếm cương'],
    realm: [14, 25]
  }),
  trung_thien: Object.freeze({
    alignment: 'thánh địa / siêu cấp thế lực',
    kinds: ['Thánh Địa', 'Đạo Cung', 'Tiên Tông', 'Đan Tháp', 'Vạn Pháp Điện', 'Cổ Tộc'],
    suffixes: ['Cửu Thiên Thánh Địa', 'Thái Nhất Đạo Cung', 'Hạo Thiên Tiên Tông', 'Vạn Đan Thánh Tháp', 'Vạn Pháp Thần Điện', 'Tử Vi Cổ Tộc'],
    doctrines: ['đại đạo tổng hợp và thánh pháp', 'âm dương và thái nhất pháp', 'chính thống tiên đạo', 'cao giai đan đạo', 'vạn pháp quy nguyên', 'cổ huyết và tinh tượng'],
    specialties: ['Kiếm', 'Lôi', 'Kim', 'Hỏa', 'Thủy'],
    resources: ['thiên nguyên tinh', 'hóa thần linh dược', 'hư không tinh', 'thánh cấp phù tài', 'tử vi tinh kim'],
    realm: [20, 28]
  }),
  tay_hoang: Object.freeze({
    alignment: 'hỗn hợp chính tà',
    kinds: ['Sa Hải Tông', 'Hỏa Cung', 'Cổ Mộ Phái', 'Thạch Lâm Môn', 'Thương Đội Liên Minh', 'Cổ Tộc'],
    suffixes: ['Vô Tận Sa Tông', 'Xích Nhật Hỏa Cung', 'Cổ Vương Lăng Phái', 'Thiên Thạch Môn', 'Kim Sa Thương Minh', 'Hoang Cổ Thần Tộc'],
    doctrines: ['thổ pháp và sa thuật', 'hỏa pháp và luyện thể', 'cổ mộ truyền thừa', 'thạch trận và phòng ngự', 'thương vận sa hải', 'cổ huyết và thể phách'],
    specialties: ['Hỏa', 'Thổ', 'Kim', 'Phong'],
    resources: ['sa tinh', 'xích viêm thạch', 'cổ ngọc', 'nhật viêm tinh', 'hoang mạc linh dược'],
    realm: [13, 24]
  }),
  bac_han: Object.freeze({
    alignment: 'chính đạo hàn hệ',
    kinds: ['Băng Cung', 'Tuyết Tông', 'Hàn Kiếm Phái', 'Bắc Minh Môn', 'Ngự Thú Cốc', 'Hàn Tộc'],
    suffixes: ['Băng Phách Tiên Cung', 'Thiên Tuyết Tông', 'Hàn Nguyệt Kiếm Phái', 'Bắc Minh Huyền Môn', 'Tuyết Linh Ngự Thú Cốc', 'Cực Hàn Cổ Tộc'],
    doctrines: ['băng pháp và phong ấn', 'tuyết pháp và thân pháp', 'hàn kiếm và kiếm khí', 'huyền thủy và băng vực', 'hàn thú và khế ước', 'hàn mạch huyết truyền'],
    specialties: ['Thủy', 'Kiếm', 'Phong', 'Lôi'],
    resources: ['hàn ngọc', 'băng tâm liên', 'băng tinh thạch', 'bắc minh huyền thủy', 'tuyết phách'],
    realm: [15, 26]
  }),
  huyet_u: Object.freeze({
    alignment: 'ma đạo / âm giới',
    kinds: ['Huyết Tông', 'Quỷ Môn', 'Ma Điện', 'Luyện Thi Phái', 'Cốt Tộc', 'Trấn Ma Thành'],
    suffixes: ['Huyết Hà Ma Tông', 'Cửu U Quỷ Môn', 'Ma Uyên Thần Điện', 'Thiên Thi Luyện Hồn Phái', 'Vạn Cốt Minh Tộc', 'Trấn Ma Thiên Thành'],
    doctrines: ['huyết pháp và đoạt sinh', 'hồn pháp và âm thuật', 'ma công và vực giới', 'luyện thi và ngự hồn', 'cốt pháp và tử khí', 'trấn ma và chiến trận'],
    specialties: ['Hỏa', 'Lôi', 'Vật Lý', 'Thủy'],
    resources: ['huyết tinh', 'âm hồn thạch', 'ma huyết chi', 'u minh linh dịch', 'cửu u cốt ngọc'],
    realm: [20, 28]
  })
});

const GLOBAL_SECT_PLACEMENT = Object.freeze({
  van_kiem_tong: Object.freeze({ headquarters: 'Đông Huyền Vực · Vạn Kiếm Châu', influence: ['dong_huyen', 'thanh_linh', 'trung_thien'] }),
  thai_bach_tong: Object.freeze({ headquarters: 'Vạn Sơn Vực · Kim Nham Châu', influence: ['van_son', 'trung_thien', 'thanh_linh'] }),
  liet_diem_cung: Object.freeze({ headquarters: 'Tây Hoang Vực · Nhật Viêm Châu', influence: ['tay_hoang', 'van_son', 'trung_thien'] }),
  bang_phach_cac: Object.freeze({ headquarters: 'Bắc Hàn Vực · Huyền Băng Châu', influence: ['bac_han', 'thuong_hai', 'trung_thien'] }),
  hau_tho_mon: Object.freeze({ headquarters: 'Vạn Sơn Vực · Long Mạch Châu', influence: ['van_son', 'tay_hoang', 'thanh_linh'] }),
  thanh_moc_cac: Object.freeze({ headquarters: 'Thanh Linh Vực · Bách Thảo Châu', influence: ['thanh_linh', 'nam_hoang', 'trung_thien'] }),
  phong_loi_cac: Object.freeze({ headquarters: 'Thương Hải Vực · Thiên Nhai Châu', influence: ['thuong_hai', 'dong_huyen', 'trung_thien'] }),
  cuu_tieu_loi_dien: Object.freeze({ headquarters: 'Trung Thiên Vực · Cửu Thiên Châu', influence: ['trung_thien', 'dong_huyen', 'thuong_hai'] }),
  thanh_the_tong: Object.freeze({ headquarters: 'Nam Hoang Vực · Man Châu', influence: ['nam_hoang', 'tay_hoang', 'van_son'] })
});

function slugifyVi(value) {
  return String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function baseName(provinceName) {
  return String(provinceName).replace(/\s*Châu$/u, '');
}

function pick(list, seed) {
  return list[Math.abs(Number(seed) || 0) % list.length];
}

function factionPower(profile, provinceIndex, tierOffset = 0) {
  const min = profile.realm[0];
  const max = profile.realm[1];
  const step = Math.round((Number(provinceIndex) || 0) / 11 * Math.max(0, max - min));
  const leader = Math.min(28, Math.max(min, min + Math.floor(step * 0.55) + tierOffset));
  return Object.freeze({
    discipleRealmRange: Object.freeze([Math.max(0, leader - 12), Math.max(1, leader - 5)]),
    coreDiscipleRealmRange: Object.freeze([Math.max(1, leader - 7), Math.max(2, leader - 3)]),
    elderRealmRange: Object.freeze([Math.max(2, leader - 3), Math.max(3, leader - 1)]),
    leaderRealmIdx: leader,
    ancestorRealmIdx: Math.min(28, leader + 1)
  });
}

function makeLocalFaction(regionId, provinceName, provinceIndex, slot, tier) {
  const profile = REGION_FACTION_THEMES[regionId] || REGION_FACTION_THEMES.thanh_linh;
  const base = baseName(provinceName);
  const suffix = pick(profile.suffixes, provinceIndex + slot);
  const kind = pick(profile.kinds, provinceIndex + slot);
  const doctrine = pick(profile.doctrines, provinceIndex + slot);
  const specialtyA = pick(profile.specialties, slot + provinceIndex);
  const specialtyB = pick(profile.specialties, slot + provinceIndex + 1);
  const resourceA = pick(profile.resources, slot + provinceIndex);
  const resourceB = pick(profile.resources, slot + provinceIndex + 2);
  const tierOffset = tier === 'bá chủ' ? 2 : tier === 'đại tông' ? 1 : 0;

  return Object.freeze({
    id: `nl_faction_${regionId}_${slugifyVi(provinceName)}_${slot + 1}`,
    name: `${base} ${suffix}`,
    kind,
    tier,
    alignment: profile.alignment,
    headquarters: `${base} ${kind === 'Tu Tiên Gia Tộc' || kind.includes('Tộc') || kind.includes('Thế Gia') ? 'Tổ Địa' : 'Sơn Môn'}`,
    doctrine: `${doctrine}; lấy ${specialtyA}${specialtyB !== specialtyA ? ` và ${specialtyB}` : ''} làm sở trường.`,
    specialties: Object.freeze([...new Set([specialtyA, specialtyB])]),
    controlledResources: Object.freeze([...new Set([resourceA, resourceB])]),
    power: factionPower(profile, provinceIndex, tierOffset),
    recruitment: tier === 'bá chủ'
      ? 'Tuyển chọn nghiêm ngặt; ưu tiên thiên tài linh căn, truyền nhân và người có chiến công cấp Châu.'
      : tier === 'đại tông'
        ? 'Mở sơn môn định kỳ; có ngoại môn, nội môn, chân truyền và trưởng lão viện.'
        : 'Tuyển đệ tử tại thành trấn địa phương, gia tộc phụ thuộc và phường thị.',
    status: 'world_data'
  });
}

function globalSectBranch(regionId, provinceName, provinceIndex) {
  const candidates = SECTS.filter(sect => GLOBAL_SECT_PLACEMENT[sect.id]?.influence?.includes(regionId));
  const pool = candidates.length ? candidates : SECTS;
  const sect = pool[(Number(provinceIndex) || 0) % pool.length];
  const placement = GLOBAL_SECT_PLACEMENT[sect.id] || {};
  return Object.freeze({
    id: `nl_branch_${sect.id}_${slugifyVi(provinceName)}`,
    parentSectId: sect.id,
    name: `${sect.name} · ${provinceName} Phân Tông`,
    kind: 'Đại Tông Phân Chi',
    tier: 'xuyên châu',
    alignment: 'theo tổng tông',
    headquarters: `${provinceName} Phân Tông Sơn Môn`,
    doctrine: sect.desc,
    specialties: Object.freeze([sect.elem]),
    controlledResources: Object.freeze([]),
    power: factionPower(REGION_FACTION_THEMES[regionId] || REGION_FACTION_THEMES.thanh_linh, provinceIndex, 1),
    recruitment: 'Tuân theo quy chế của tổng tông; đệ tử xuất sắc có thể được điều về tổng sơn môn.',
    parentHeadquarters: placement.headquarters || null,
    status: 'world_data'
  });
}

export const TRANSCONTINENTAL_SECTS = Object.freeze(SECTS.map(sect => Object.freeze({
  ...sect,
  scope: 'transcontinental',
  headquarters: GLOBAL_SECT_PLACEMENT[sect.id]?.headquarters || null,
  influenceRegions: Object.freeze([...(GLOBAL_SECT_PLACEMENT[sect.id]?.influence || [])])
})));

export function getProvinceFactionProfile(regionId, provinceName, provinceIndex = 0) {
  const localFactions = Object.freeze([
    makeLocalFaction(regionId, provinceName, provinceIndex, 0, 'bá chủ'),
    makeLocalFaction(regionId, provinceName, provinceIndex, 1, 'đại tông'),
    makeLocalFaction(regionId, provinceName, provinceIndex, 2, 'đại tông'),
    makeLocalFaction(regionId, provinceName, provinceIndex, 3, 'trung tông'),
    makeLocalFaction(regionId, provinceName, provinceIndex, 4, 'địa phương')
  ]);
  const branch = globalSectBranch(regionId, provinceName, provinceIndex);
  const all = Object.freeze([branch, ...localFactions]);

  return Object.freeze({
    atlasVersion: FACTION_ATLAS_VERSION,
    provinceName,
    regionId,
    transregionalBranch: branch,
    factions: all,
    dominantFactionId: localFactions[0].id,
    summary: `${provinceName} có 1 phân tông của đại tông xuyên châu, 1 thế lực bá chủ địa phương, 2 đại tông, 1 trung tông và 1 môn phái/gia tộc chủ lực được định danh; các tiểu phái khác được materialize theo gameplay.`,
    generationCounts: Object.freeze({
      namedCoreFactions: all.length,
      majorAndMediumFactions: 12 + ((Number(provinceIndex) || 0) * 5 % 29),
      minorSects: 40 + ((Number(provinceIndex) || 0) * 11 % 91),
      cultivationFamilies: 35 + ((Number(provinceIndex) || 0) * 13 % 121)
    })
  });
}
