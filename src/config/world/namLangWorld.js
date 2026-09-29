/**
 * namLangWorld.js
 * Cây địa lý Nam Lăng Đại Lục ở dạng dữ liệu phẳng, tối ưu cho mobile.
 * Chỉ materialize các nút quan trọng; quy mô hàng trăm quốc/quận/thành được lưu bằng profile sinh dữ liệu.
 */

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

function makeNode(id, type, name, parentId, extra = {}) {
  return Object.freeze({ id, type, name, parentId: parentId ?? null, ...extra });
}

const GREAT_REGION_SPECS = [
  {
    id: 'thanh_linh', name: 'Thanh Linh Vực',
    desc: 'Nhân tộc đông đúc, sơn thủy ôn hòa, linh điền và thành trấn dày đặc; vùng khởi đầu của người chơi.',
    theme: 'starter_human',
    provinces: ['Thanh Châu','Linh Châu','Bạch Hà Châu','Vân Mộng Châu','Thiên Hà Châu','Ngọc Tuyền Châu','Cửu Phong Châu','Lạc Hà Châu','Trường Phong Châu','Minh Khê Châu','Huyền Lâm Châu','An Sơn Châu']
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
  map0: 'nl.loc.thanh_ha.thanh_van_thon',
  map1: 'nl.loc.thanh_ha.thanh_van_ngoai_vi',
  map2: 'nl.loc.thanh_ha.van_moc_sam_lam',
  map3: 'nl.loc.thanh_ha.huyet_lac_cam_dia'
});

const nodes = [
  makeNode(NAM_LANG_ROOT_ID, WORLD_NODE_TYPES.CONTINENT, 'Nam Lăng Đại Lục', null, {
    desc: 'Đại lục tu tiên khổng lồ gồm 9 Đại Vực và 108 Châu. Hệ thống chỉ dựng chi tiết khu vực người chơi thực sự cần.',
    counts: { greatRegions: 9, provinces: 108 }
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
    nodes.push(makeNode(provinceId, WORLD_NODE_TYPES.PROVINCE, provinceName, regionId, {
      desc: `${provinceName} thuộc ${region.name}. Quốc gia, quận, thành và thôn trấn được materialize theo nhu cầu thay vì tạo hàng loạt file map.`,
      provinceIndex: index + 1,
      generationProfile: {
        nations: WORLD_SCALE_PROFILE.provinceNationRange,
        materializedByDefault: provinceId === STARTER_WORLD_IDS.province
      }
    }));
  });
}

const thanhChauNations = [
  ['dai_ly', 'Đại Ly Quốc', true], ['thien_vo', 'Thiên Võ Hoàng Triều', false], ['dai_chu', 'Đại Chu Quốc', false],
  ['van_kiem', 'Vạn Kiếm Quốc', false], ['bac_minh', 'Bắc Minh Quốc', false], ['thanh_ho', 'Thanh Hồ Yêu Quốc', false],
  ['cuu_son', 'Cửu Sơn Liên Minh', false], ['nam_man', 'Nam Man Bộ Tộc', false]
];
for (const [id, name, materialized] of thanhChauNations) {
  nodes.push(makeNode(`nl.nation.thanh_chau.${id}`, WORLD_NODE_TYPES.NATION, name, STARTER_WORLD_IDS.province, {
    desc: materialized ? 'Quốc gia khởi đầu được khai triển chi tiết.' : 'Thế lực lớn đã biết tên; nội dung chi tiết sẽ materialize khi tuyến truyện hoặc người chơi tiến đến.',
    generationProfile: { commanderies: WORLD_SCALE_PROFILE.nationCommanderyRange }, materialized
  }));
}

const daiLyCommanderies = [
  ['nam_son', 'Nam Sơn Quận', true], ['bach_ha', 'Bạch Hà Quận', false], ['van_linh', 'Vạn Linh Quận', false],
  ['thien_phong', 'Thiên Phong Quận', false], ['linh_tuyen', 'Linh Tuyền Quận', false], ['huyen_son', 'Huyền Sơn Quận', false],
  ['lac_van', 'Lạc Vân Quận', false], ['cuu_khe', 'Cửu Khê Quận', false], ['dong_lam', 'Đông Lâm Quận', false]
];
for (const [id, name, materialized] of daiLyCommanderies) {
  nodes.push(makeNode(`nl.commandery.dai_ly.${id}`, WORLD_NODE_TYPES.COMMANDERY, name, STARTER_WORLD_IDS.nation, {
    desc: materialized ? 'Quận khởi đầu, nơi Thanh Hà Thành tọa lạc.' : 'Quận thuộc Đại Ly Quốc; chưa dựng Combat Map cụ thể.',
    generationProfile: { cities: WORLD_SCALE_PROFILE.commanderyCityRange }, materialized
  }));
}

const namSonCities = [
  ['thanh_ha', 'Thanh Hà Thành Vực', true], ['bach_ngoc', 'Bạch Ngọc Thành Vực', false], ['linh_son', 'Linh Sơn Thành Vực', false],
  ['van_thuy', 'Vân Thủy Thành Vực', false], ['huyen_moc', 'Huyền Mộc Thành Vực', false], ['xich_phong', 'Xích Phong Thành Vực', false],
  ['cuu_truc', 'Cửu Trúc Thành Vực', false], ['thien_uyen', 'Thiên Uyên Thành Vực', false], ['lac_ha', 'Lạc Hà Thành Vực', false]
];
for (const [id, name, materialized] of namSonCities) {
  nodes.push(makeNode(`nl.city.nam_son.${id}`, WORLD_NODE_TYPES.CITY_TERRITORY, name, STARTER_WORLD_IDS.commandery, {
    desc: materialized ? 'Lãnh thổ thành quản lý Thanh Vân Thôn và nhiều khu vực phụ cận.' : 'Thành vực thuộc Nam Sơn Quận; chưa dựng chi tiết.',
    generationProfile: { settlements: WORLD_SCALE_PROFILE.citySettlementRange }, materialized
  }));
}

const thanhHaLocations = [
  [STARTER_WORLD_IDS.map0, 'Thanh Vân Thôn', 0, 'safe_hub', 'Thôn khởi đầu và khu an toàn.'],
  [STARTER_WORLD_IDS.map1, 'Thanh Vân Ngoại Vi', 1, 'field', 'Ngoại vi rộng lớn quanh thôn, khu săn yêu đầu tiên.'],
  [STARTER_WORLD_IDS.map2, 'Vạn Mộc Sâm Lâm', 2, 'field', 'Cổ lâm nhiều tầng nguy hiểm và linh dược.'],
  [STARTER_WORLD_IDS.map3, 'Huyết Lạc Cấm Địa', 3, 'dungeon_field', 'Cấm địa cấp địa phương, không đại diện cho đại cấm địa Nam Lăng.'],
  ['nl.loc.thanh_ha.thanh_ha_thanh', 'Thanh Hà Thành', null, 'major_hub', 'Hub cấp Thành, trung tâm thương mại và giao thông của Thanh Hà Thành Vực.'],
  ['nl.loc.thanh_ha.bach_ha_tran', 'Bạch Hà Trấn', null, 'town', 'Trấn ven sông thuộc Thanh Hà Thành Vực.'],
  ['nl.loc.thanh_ha.thanh_moc_tran', 'Thanh Mộc Trấn', null, 'town', 'Trấn gần vùng rừng và linh mộc.'],
  ['nl.loc.thanh_ha.hac_son_tran', 'Hắc Sơn Trấn', null, 'town', 'Trấn khai khoáng dưới chân Hắc Sơn.'],
  ['nl.loc.thanh_ha.linh_duoc_coc', 'Linh Dược Cốc', null, 'resource', 'Khu thu thập linh thảo địa phương.'],
  ['nl.loc.thanh_ha.hac_thach_mo', 'Hắc Thạch Khoáng Động', null, 'dungeon', 'Khoáng động cấp thấp và trung.'],
  ['nl.loc.thanh_ha.co_tu_dong_phu', 'Cổ Tu Động Phủ', null, 'secret', 'Động phủ bí mật có thể mở theo sự kiện.'],
  ['nl.loc.thanh_ha.co_truyen_tong', 'Cổ Truyền Tống Trận', null, 'travel', 'Điểm giao thông cổ đại, dùng cho tuyến mở rộng sau này.']
];
for (const [id, name, playableMapId, locationKind, desc] of thanhHaLocations) {
  nodes.push(makeNode(id, WORLD_NODE_TYPES.LOCATION, name, STARTER_WORLD_IDS.city, {
    desc, playableMapId, locationKind, materialized: playableMapId != null, status: playableMapId != null ? 'playable' : 'planned'
  }));
}

export const NAM_LANG_WORLD_NODES = Object.freeze(nodes);
export const GREAT_REGION_DEFS = Object.freeze(GREAT_REGION_SPECS.map(region => Object.freeze({ ...region, provinces: Object.freeze([...region.provinces]) })));
