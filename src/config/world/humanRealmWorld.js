/**
 * humanRealmWorld.js
 * =========================================================================
 * CẤU TRÚC BẢN ĐỒ TOÀN CÕI NHÂN GIỚI (5 ĐẠI LỤC CHUẨN ĐỒNG NHẤT 5x5x5x5)
 * =========================================================================
 * - 5 Đại Lục: Nam Lăng (Nam), Đông Huyền (Đông), Tây Mạc (Tây), Bắc Minh (Bắc), Trung Vực (Trung).
 * - Mỗi Đại Lục gồm: 5 Vực (Bắc, Tây, Trung, Đông, Nam) + 5 Hoang Dã + 2 Bí Cảnh (Trên & Dưới).
 * - Mỗi Vực gồm: 5 Châu (Bắc, Tây, Trung, Đông, Nam) + 5 Hoang Dã + 2 Bí Cảnh (Trên & Dưới).
 * - Mỗi Châu gồm: 5 Quốc Gia (Bắc, Tây, Trung, Đông, Nam) + 5 Hoang Dã + 2 Bí Cảnh (Trên & Dưới).
 * - Mỗi Quốc Gia gồm: 5 Thành Thị (Bắc, Tây, Trung, Đông, Nam) + 5 Hoang Dã + 2 Bí Cảnh (Trên & Dưới).
 * - Mỗi Vực, Châu, Quốc Gia, Thành Thị đều có 1 Tông Môn hoặc 1 Thế Gia thống lĩnh/nắm giữ.
 * - Điểm khởi đầu duy nhất: Thanh Vân Thôn (Khởi Nguyên) & Thanh Vân Ngoại Vi (Đại Ly Quốc -> Thanh Vân Thành).
 */

export const HUMAN_REALM_ROOT_ID = 'hr';
export const NAM_LANG_ROOT_ID = 'nl';
export const HUMAN_REALM_VERSION = '20261001-canonical-geography-single-ruler-v2';

export const STARTER_WORLD_IDS = Object.freeze({
  greatRegion: 'nl.gr.thanh_linh',
  province: 'nl.prov.thanh_linh.thanh_chau',
  nation: 'nl.nation.thanh_chau.dai_ly',
  city: 'nl.city.dai_ly.thanh_van_thanh',
  commandery: 'nl.city.dai_ly.thanh_van_thanh',
  thanhHaHub: 'nl.loc.thanh_ha.thanh_van_thon',
  map0: 'nl.loc.thanh_ha.thanh_van_thon',
  map1: 'nl.loc.thanh_ha.thanh_van_ngoai_vi',
  thon: 'nl.loc.thanh_ha.thanh_van_thon',
  ngoaiVi: 'nl.loc.thanh_ha.thanh_van_ngoai_vi'
});

export const WORLD_NODE_TYPES = Object.freeze({
  REALM: 'realm',
  CONTINENT: 'continent',
  GREAT_REGION: 'great_region',
  REGION: 'region',
  PROVINCE: 'province',
  NATION: 'nation',
  CITY: 'city_territory',
  LOCATION: 'location'
});

export const HUMAN_REALM_SCALE = Object.freeze({
  realms: 1,
  continents: 5,
  regionsPerContinent: 5,
  // UI keeps its five Đại Lục cards. Canonically each card is a Đại Vực
  // and its five existing Vực remain the direct administrative children.
  greatRegions: 5,
  regions: 25,
  regionsPerGreatRegion: 5,
  provincesPerRegion: 5,
  provinces: 125,
  nationsPerProvince: 5,
  nations: 625,
  citiesPerNation: 5,
  cities: 3125,
  wildsPerContinent: 5,
  secretsPerContinent: 2,
  wildsPerRegion: 5,
  secretsPerRegion: 2,
  wildsPerProvince: 5,
  secretsPerProvince: 2,
  wildsPerNation: 5,
  secretsPerNation: 2
});

export const DIRECTIONS_5 = Object.freeze(['Bắc', 'Tây', 'Trung', 'Đông', 'Nam']);

function slugifyVi(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

const CONTINENT_BLUEPRINTS = [
  {
    id: 'south',
    nodeId: 'nl',
    name: 'Nam Lăng Đại Lục',
    position: 'Nam',
    element: 'Mộc',
    elements: ['Mộc', 'Thủy'],
    realmRange: [0, 20],
    desc: 'Nam Đại Lục của Nhân Giới, non xanh nước biếc, linh điền trù phú, nhân tộc hưng thịnh và là nơi khởi nguyên.',
    regions: [
      {
        slug: 'thanh_linh', name: 'Thanh Linh Vực', direction: 'Bắc', icon: '🍃', elements: ['Mộc', 'Thủy'],
        ruler: { name: 'Thanh Huyền Đạo Tông', type: 'Tông Môn' },
        provinces: ['Thanh Châu', 'Lạc Châu', 'Vân Châu', 'Bình Châu', 'An Châu']
      },
      {
        slug: 'nam_hoang', name: 'Nam Hoang Vực', direction: 'Tây', icon: '🌿', elements: ['Mộc', 'Thổ'],
        ruler: { name: 'Vạn Độc Cổ Tộc', type: 'Thế Gia' },
        provinces: ['Man Châu', 'Vạn Độc Châu', 'Yêu Lâm Châu', 'Cổ Thụ Châu', 'Thiên Thú Châu']
      },
      {
        slug: 'van_son', name: 'Vạn Sơn Vực', direction: 'Trung', icon: '⛰️', elements: ['Thổ', 'Kim', 'Hỏa'],
        ruler: { name: 'Thạch Hoàng Gia', type: 'Thế Gia' },
        provinces: ['Thạch Châu', 'Linh Khoáng Châu', 'Địa Hỏa Châu', 'Cửu Phong Châu', 'Trùng Điệp Châu']
      },
      {
        slug: 'thuong_hai', name: 'Thương Hải Vực', direction: 'Đông', icon: '🌊', elements: ['Thủy', 'Phong'],
        ruler: { name: 'Hải Thần Cung', type: 'Tông Môn' },
        provinces: ['Hải Châu', 'Thiên Tinh Châu', 'Bích Hải Châu', 'Long Đảo Châu', 'Vạn Đảo Châu']
      },
      {
        slug: 'bach_duoc', name: 'Bách Dược Vực', direction: 'Nam', icon: '🌸', elements: ['Mộc', 'Thủy'],
        ruler: { name: 'Dược Vương Tiên Cốc', type: 'Tông Môn' },
        provinces: ['Dược Châu', 'Linh Thảo Châu', 'Đan Đỉnh Châu', 'Hồi Xuân Châu', 'Bách Thảo Châu']
      }
    ]
  },
  {
    id: 'east',
    nodeId: 'dh',
    name: 'Đông Huyền Đại Lục',
    position: 'Đông',
    element: 'Kim',
    elements: ['Kim', 'Lôi', 'Phong'],
    realmRange: [5, 25],
    desc: 'Đông Đại Lục ngập tràn kiếm ý sắc bén và lôi bạo cửu thiên, thánh địa của kiếm tu và đạo môn chính thống.',
    regions: [
      {
        slug: 'dong_huyen', name: 'Đông Huyền Vực', direction: 'Bắc', icon: '⚔️', elements: ['Kim', 'Lôi'],
        ruler: { name: 'Vạn Kiếm Tiên Các', type: 'Tông Môn' },
        provinces: ['Kiếm Châu', 'Lôi Châu', 'Phong Châu', 'Thần Kiếm Châu', 'Cửu Tiêu Châu']
      },
      {
        slug: 'kiem_y', name: 'Kiếm Ý Vực', direction: 'Tây', icon: '🗡️', elements: ['Kim', 'Phong'],
        ruler: { name: 'Độc Cô Danh Gia', type: 'Thế Gia' },
        provinces: ['Huyền Kiếm Châu', 'Vô Cực Châu', 'Thiên Nhận Châu', 'Kiếm Tâm Châu', 'Bạt Kiếm Châu']
      },
      {
        slug: 'tinh_la', name: 'Tinh La Vực', direction: 'Trung', icon: '✨', elements: ['Phong', 'Lôi'],
        ruler: { name: 'Tinh Thần Cổ Các', type: 'Tông Môn' },
        provinces: ['Tinh Châu', 'Chiêm Tinh Châu', 'Linh Trận Châu', 'Thiên Cơ Châu', 'Vạn Tinh Châu']
      },
      {
        slug: 'loi_trach', name: 'Lôi Trạch Vực', direction: 'Đông', icon: '⚡', elements: ['Lôi', 'Thủy'],
        ruler: { name: 'Thiên Lôi Thần Điện', type: 'Tông Môn' },
        provinces: ['Thiên Lôi Châu', 'Tử Lôi Châu', 'Lôi Đình Châu', 'Điện Quang Châu', 'Chấn Lôi Châu']
      },
      {
        slug: 'long_uyen', name: 'Long Uyên Vực', direction: 'Nam', icon: '🐉', elements: ['Thủy', 'Lôi'],
        ruler: { name: 'Cơ Thị Hoàng Tộc', type: 'Thế Gia' },
        provinces: ['Long Châu', 'Giao Long Châu', 'Hải Uyên Châu', 'Long Tê Châu', 'Thanh Long Châu']
      }
    ]
  },
  {
    id: 'west',
    nodeId: 'tm',
    name: 'Tây Mạc Đại Lục',
    position: 'Tây',
    element: 'Thổ',
    elements: ['Thổ', 'Hỏa', 'Kim'],
    realmRange: [8, 26],
    desc: 'Tây Đại Lục là sa mạc vô tận, thạch lâm hiểm trở và địa hỏa quặng mỏ dồi dào, nơi ngự trị của các bộ tộc cổ và thể tu.',
    regions: [
      {
        slug: 'xich_viem', name: 'Xích Viêm Vực', direction: 'Bắc', icon: '🔥', elements: ['Hỏa', 'Thổ'],
        ruler: { name: 'Xích Hỏa Ma Tông', type: 'Tông Môn' },
        provinces: ['Hỏa Châu', 'Viêm Châu', 'Địa Hỏa Châu', 'Dung Nham Châu', 'Xích Sa Châu']
      },
      {
        slug: 'sa_hai', name: 'Sa Hải Vực', direction: 'Tây', icon: '🏜️', elements: ['Thổ', 'Phong'],
        ruler: { name: 'Âu Dương Thế Tộc', type: 'Thế Gia' },
        provinces: ['Sa Châu', 'Đại Mạc Châu', 'Ốc Đảo Châu', 'Kim Sa Châu', 'Phong Sa Châu']
      },
      {
        slug: 'co_than', name: 'Cổ Thần Vực', direction: 'Trung', icon: '🏛️', elements: ['Hỏa', 'Kim'],
        ruler: { name: 'Thượng Cổ Thần Điện', type: 'Tông Môn' },
        provinces: ['Thần Mộ Châu', 'Cổ Di Châu', 'Thần Điện Châu', 'Thượng Cổ Châu', 'Chiến Địa Châu']
      },
      {
        slug: 'thach_lam', name: 'Thạch Lâm Vực', direction: 'Đông', icon: '🪨', elements: ['Thổ', 'Kim'],
        ruler: { name: 'Lâm Thị Thế Gia', type: 'Thế Gia' },
        provinces: ['Nham Châu', 'Thạch Cương Châu', 'Cổ Nham Châu', 'Thạch Bích Châu', 'Thiên Nham Châu']
      },
      {
        slug: 'hoang_kim', name: 'Hoàng Kim Vực', direction: 'Nam', icon: '👑', elements: ['Kim', 'Thổ'],
        ruler: { name: 'Kim Cương Đạo Tông', type: 'Tông Môn' },
        provinces: ['Kim Châu', 'Linh Kim Châu', 'Hoàng Kim Châu', 'Bảo Tạng Châu', 'Bạch Kim Châu']
      }
    ]
  },
  {
    id: 'north',
    nodeId: 'bm',
    name: 'Bắc Minh Đại Lục',
    position: 'Bắc',
    element: 'Thủy',
    elements: ['Băng', 'Thủy', 'Phong'],
    realmRange: [10, 27],
    desc: 'Bắc Đại Lục quanh năm băng tuyết bao phủ, cực quang rực rỡ và hàn mạch sâu thẳm.',
    regions: [
      {
        slug: 'cuc_han', name: 'Cực Hàn Vực', direction: 'Bắc', icon: '❄️', elements: ['Băng', 'Thủy'],
        ruler: { name: 'Huyền Băng Thần Cung', type: 'Tông Môn' },
        provinces: ['Băng Châu', 'Tuyết Châu', 'Hàn Châu', 'Cực Quang Châu', 'Băng Nguyên Châu']
      },
      {
        slug: 'tuyet_son', name: 'Tuyết Sơn Vực', direction: 'Tây', icon: '🏔️', elements: ['Băng', 'Phong'],
        ruler: { name: 'Tuyết Sơn Cổ Tộc', type: 'Thế Gia' },
        provinces: ['Bạch Tuyết Châu', 'Thiên Sơn Châu', 'Hàn Phong Châu', 'Ngọc Tuyết Châu', 'Vạn Tuyết Châu']
      },
      {
        slug: 'han_nguyet', name: 'Hàn Nguyệt Vực', direction: 'Trung', icon: '🌙', elements: ['Băng', 'Thủy'],
        ruler: { name: 'Nguyệt Cung Thần Phái', type: 'Tông Môn' },
        provinces: ['Nguyệt Châu', 'Hàn Nguyệt Châu', 'Băng Tâm Châu', 'Nguyệt Quang Châu', 'Minh Nguyệt Châu']
      },
      {
        slug: 'bac_minh_hai', name: 'Bắc Minh Hải Vực', direction: 'Đông', icon: '🧊', elements: ['Thủy', 'Băng'],
        ruler: { name: 'Bắc Minh Kiếm Phái', type: 'Tông Môn' },
        provinces: ['Minh Châu', 'Bắc Hải Châu', 'Băng Hải Châu', 'Hàn Thủy Châu', 'Huyền Hải Châu']
      },
      {
        slug: 'huyen_bang', name: 'Huyền Băng Vực', direction: 'Nam', icon: '💎', elements: ['Băng', 'Thổ'],
        ruler: { name: 'Mộ Dung Thế Gia', type: 'Thế Gia' },
        provinces: ['Huyền Băng Châu', 'Thiên Băng Châu', 'Cổ Băng Châu', 'Băng Tinh Châu', 'Linh Băng Châu']
      }
    ]
  },
  {
    id: 'central',
    nodeId: 'tv',
    name: 'Trung Vực Đại Lục',
    position: 'Trung',
    element: 'Lôi',
    elements: ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'],
    realmRange: [12, 30],
    desc: 'Trung tâm của Nhân Giới, nơi quy tụ đại đạo linh mạch hoàn chỉnh nhất, hoàng triều đế đô và cửu thiên thánh địa.',
    regions: [
      {
        slug: 'thanh_vuc', name: 'Thánh Vực', direction: 'Bắc', icon: '🌟', elements: ['Kim', 'Lôi'],
        ruler: { name: 'Trung Ương Thánh Địa', type: 'Tông Môn' },
        provinces: ['Thánh Châu', 'Thiên Đô Châu', 'Hoàng Đô Châu', 'Đế Châu', 'Trung Châu']
      },
      {
        slug: 'thien_do', name: 'Thiên Đô Vực', direction: 'Tây', icon: '🏯', elements: ['Thổ', 'Kim'],
        ruler: { name: 'Thiên Đô Cổ Tộc', type: 'Thế Gia' },
        provinces: ['Thiên Châu', 'Vương Triều Châu', 'Thái Bình Châu', 'Thịnh Thế Châu', 'Vĩnh An Châu']
      },
      {
        slug: 'hon_don', name: 'Hỗn Độn Vực', direction: 'Trung', icon: '🌌', elements: ['Hỗn Độn'],
        ruler: { name: 'Hỗn Độn Đạo Tông', type: 'Tông Môn' },
        provinces: ['Hỗn Độn Châu', 'Thái Sơ Châu', 'Huyền Nguyên Châu', 'Vô Cực Châu', 'Nguyên Thủy Châu']
      },
      {
        slug: 'van_phap', name: 'Vạn Pháp Vực', direction: 'Đông', icon: '📜', elements: ['Mộc', 'Hỏa'],
        ruler: { name: 'Vạn Pháp Đạo Tông', type: 'Tông Môn' },
        provinces: ['Pháp Châu', 'Đạo Đức Châu', 'Thông Thiên Châu', 'Vạn Đạo Châu', 'Quy Nhất Châu']
      },
      {
        slug: 'hoang_trieu', name: 'Hoàng Triều Vực', direction: 'Nam', icon: '🛡️', elements: ['Kim', 'Thổ'],
        ruler: { name: 'Đại Càn Hoàng Tộc', type: 'Thế Gia' },
        provinces: ['Long Mạch Châu', 'Càn Khôn Châu', 'Bảo Đỉnh Châu', 'Chính Thống Châu', 'Thiên Triều Châu']
      }
    ]
  }
];

const NATION_NAMES_POOL = [
  'Đại Ly Quốc', 'Đại Tề Quốc', 'Đại Càn Quốc', 'Đại Sở Quốc', 'Đại Chu Quốc',
  'Linh Nguyệt Quốc', 'Thần Vũ Quốc', 'Thiên Diệu Quốc', 'Bắc Hàn Quốc', 'Thanh Long Quốc',
  'Xích Hỏa Quốc', 'Kim Cương Quốc', 'Tử Tiêu Quốc', 'Bạch Hổ Quốc', 'Huyền Vũ Quốc',
  'Cổ Phong Quốc', 'Đông Nhạc Quốc', 'Nam Cương Quốc', 'Tây Hoang Quốc', 'Trung Đô Quốc',
  'Vạn Diệp Quốc', 'Bích Ba Quốc', 'Lôi Đình Quốc', 'Thương Mang Quốc', 'Minh Hà Quốc'
];

const CITY_NAMES_POOL = [
  'Thanh Vân Thành', 'Kim Lăng Thành', 'Lạc Dương Thành', 'Thần Đô Thành', 'Vân Mộng Thành',
  'Bạch Hà Thành', 'Phong Sa Thành', 'Hàn Băng Thành', 'Thiên Kiếm Thành', 'Dược Vương Thành',
  'Lôi Quang Thành', 'Hải Uyên Thành', 'Xích Hỏa Thành', 'Vạn Thú Thành', 'Hoàng Kim Thành',
  'Thái Bình Thành', 'Vĩnh An Thành', 'Thiên Cơ Thành', 'Huyền Vũ Thành', 'Linh Khê Thành',
  'An Bình Thành', 'Đông Nhạc Thành', 'Trường An Thành', 'Bích Hải Thành', 'Cửu Tiêu Thành'
];

const WILD_NAMES_POOL = [
  'Cổ Mộc U Lâm', 'Hoang Sơn Hiểm Cốc', 'Linh Xà Đầm Lầy', 'Hắc Thạch Hoang Nguyên', 'Xích Phong Hẻm Núi',
  'Vạn Thú Sơn Lĩnh', 'Thiên Băng Tuyệt Cốc', 'Dung Nham Liệt Cốc', 'U Minh Đầm Lầy', 'Lạc Hồn Sơn Mạch',
  'Vân Vụ Cổ Lộ', 'Bách Thảo Hoang Sơn', 'Cửu Khúc Linh Hà', 'Thần Mộc Cổ Lĩnh', 'Hoàng Sa Hoang Mạc'
];

const SECRET_NAMES_POOL = [
  'Thượng Cổ Di Tích', 'Linh Động Thiên Phủ', 'Hư Không Phù Đảo', 'Thiên Ma Cổ Mộ', 'Chân Tiên Bí Cảnh',
  'Địa Hỏa Thần Quật', 'Huyền Băng Thần Động', 'Thái Sơ Huyễn Cảnh', 'Càn Khôn Bí Cảnh', 'Cửu Long Linh Quật'
];

export const RUNTIME_POLICIES = Object.freeze({
  NONE: 'NONE',
  MAP: 'MAP',
  HUB: 'HUB',
  DUNGEON: 'DUNGEON'
});

function buildAllNodes() {
  const nodes = [];

  // 1. Root Node: Nhân Giới (Navigation Node)
  nodes.push(Object.freeze({
    id: HUMAN_REALM_ROOT_ID,
    type: 'realm',
    name: 'Nhân Giới',
    parentId: null,
    desc: 'Cõi phàm trần tu tiên rộng lớn vô bờ bến với 5 Đại Lục hùng vĩ.',
    runtimePolicy: RUNTIME_POLICIES.NONE,
    status: 'playable'
  }));

  let globalSeed = 7;

  // 2. Duyệt 5 Đại Lục (Navigation Nodes)
  CONTINENT_BLUEPRINTS.forEach((cont, contIdx) => {
    const contId = cont.nodeId;
    nodes.push(Object.freeze({
      id: contId,
      type: 'continent',
      displayTypeLabel: 'ĐẠI LỤC',
      continentKey: cont.id,
      humanRealmContinentId: cont.id,
      name: cont.name,
      direction: cont.position,
      parentId: HUMAN_REALM_ROOT_ID,
      desc: cont.desc,
      elements: Object.freeze([...cont.elements]),
      realmRange: Object.freeze([...cont.realmRange]),
      runtimePolicy: RUNTIME_POLICIES.NONE,
      status: 'playable',
      // The visual map calls this a Đại Lục. In the administrative tree it
      // owns the five Vực and therefore fulfils the Đại Vực contract.
      canonicalType: 'great_region'
    }));

    // 5 Hoang Dã Đại Lục (Playable Map Nodes)
    for (let w = 0; w < 5; w++) {
      globalSeed = (globalSeed * 31 + w + 1) >>> 0;
      const wName = WILD_NAMES_POOL[(globalSeed + w) % WILD_NAMES_POOL.length];
      const dir = DIRECTIONS_5[w];
      nodes.push(Object.freeze({
        id: contId + '.cont_wild_' + (w + 1),
        type: 'location',
        displayTypeLabel: 'HOANG DÃ',
        name: wName,
        direction: dir,
        parentId: contId,
        desc: 'Hiểm trở vô biên, ẩn chứa nhiều kỳ trân dị bảo, yêu thú và dược liệu quý hiếm.',
        locationKind: 'continent_wild',
        runtimePolicy: RUNTIME_POLICIES.MAP,
        status: 'playable'
      }));
    }

    // 2 Bí Cảnh Đại Lục (Trên & Dưới) (Playable Dungeon Nodes)
    for (let s = 0; s < 2; s++) {
      globalSeed = (globalSeed * 37 + s + 1) >>> 0;
      const sName = SECRET_NAMES_POOL[(globalSeed + s) % SECRET_NAMES_POOL.length];
      const sPos = s === 0 ? 'Trên' : 'Dưới';
      nodes.push(Object.freeze({
        id: contId + '.cont_secret_' + (s + 1),
        type: 'location',
        displayTypeLabel: 'BÍ CẢNH',
        name: sName,
        direction: sPos,
        parentId: contId,
        desc: 'Ẩn giấu truyền thừa đạo hạnh vô thượng, kỳ ngộ tạo hóa và cơ duyên ngàn năm.',
        locationKind: 'continent_secret',
        runtimePolicy: RUNTIME_POLICIES.DUNGEON,
        status: 'playable'
      }));
    }

    // 3. Duyệt 5 Vực (Regions) (Navigation Nodes)
    cont.regions.forEach((reg, regIdx) => {
      const regId = contId + '.gr.' + reg.slug;
      const regDir = reg.direction || DIRECTIONS_5[regIdx];
      nodes.push(Object.freeze({
        id: regId,
        type: 'region',
        displayTypeLabel: 'VỰC',
        name: reg.name,
        direction: regDir,
        continentId: contId,
        parentId: contId,
        desc: 'Phong thủy bảo địa, linh khí cửu tiêu dồi dào, hội tụ nhiều tông môn và thế gia uy chấn.',
        elements: Object.freeze([...reg.elements]),
        ruler: Object.freeze({ ...reg.ruler }),
        runtimePolicy: RUNTIME_POLICIES.NONE,
        status: 'playable',
      }));

      // 5 Hoang Dã Vực (Playable Map Nodes)
      for (let w = 0; w < 5; w++) {
        globalSeed = (globalSeed * 31 + w + 1) >>> 0;
        const wName = WILD_NAMES_POOL[(globalSeed + w + regIdx * 3) % WILD_NAMES_POOL.length];
        const dir = DIRECTIONS_5[w];
        nodes.push(Object.freeze({
          id: regId + '.reg_wild_' + (w + 1),
          type: 'location',
          displayTypeLabel: 'HOANG DÃ',
          name: wName,
          direction: dir,
          parentId: regId,
          desc: 'Nguyên sinh hiểm trở, nơi cư ngụ của nhiều yêu thú và kỳ hoa dị thảo.',
          locationKind: 'region_wild',
          runtimePolicy: RUNTIME_POLICIES.MAP,
          status: 'playable'
        }));
      }

      // 2 Bí Cảnh Vực (Trên & Dưới) (Playable Dungeon Nodes)
      for (let s = 0; s < 2; s++) {
        globalSeed = (globalSeed * 37 + s + 1) >>> 0;
        const sName = SECRET_NAMES_POOL[(globalSeed + s + regIdx * 3) % SECRET_NAMES_POOL.length];
        const sPos = s === 0 ? 'Trên' : 'Dưới';
        nodes.push(Object.freeze({
          id: regId + '.reg_secret_' + (s + 1),
          type: 'location',
          displayTypeLabel: 'BÍ CẢNH',
          name: sName,
          direction: sPos,
          parentId: regId,
          desc: 'Lưu giữ truyền thừa đại đạo, linh đan pháp bảo cùng nhiều cơ duyên cổ xưa.',
          locationKind: 'region_secret',
          runtimePolicy: RUNTIME_POLICIES.DUNGEON,
          status: 'playable'
        }));
      }

      // 4. Duyệt 5 Châu (Provinces) (Navigation Nodes)
      reg.provinces.forEach((provName, provIdx) => {
        const provSlug = slugifyVi(provName);
        const isStarterProv = cont.id === 'south' && reg.slug === 'thanh_linh' && provName === 'Thanh Châu';
        const provId = isStarterProv ? STARTER_WORLD_IDS.province : (regId + '.prov.' + provSlug);
        const provDir = DIRECTIONS_5[provIdx];
        nodes.push(Object.freeze({
          id: provId,
          type: 'province',
          displayTypeLabel: 'CHÂU',
          name: provName,
          direction: provDir,
          parentId: regId,
          desc: 'Quy tụ vô số linh điền màu mỡ, phường thị sầm uất và các tiên gia môn phái.',
          elements: Object.freeze([...reg.elements]),
          runtimePolicy: RUNTIME_POLICIES.NONE,
          status: 'playable'
        }));

        // 5 Hoang Dã Châu (Playable Map Nodes)
        for (let w = 0; w < 5; w++) {
          globalSeed = (globalSeed * 31 + w + 1) >>> 0;
          const wName = WILD_NAMES_POOL[(globalSeed + w + provIdx * 5) % WILD_NAMES_POOL.length];
          const dir = DIRECTIONS_5[w];
          nodes.push(Object.freeze({
            id: provId + '.prov_wild_' + (w + 1),
            type: 'location',
            displayTypeLabel: 'HOANG DÃ',
            name: wName,
            direction: dir,
            parentId: provId,
            desc: 'Địa thế hoang sơ, thích hợp rèn luyện tu vi, săn bắt yêu thú và thu thập linh tài.',
            locationKind: 'prov_wild',
            runtimePolicy: RUNTIME_POLICIES.MAP,
            status: 'playable'
          }));
        }

        // 2 Bí Cảnh Châu (Trên & Dưới) (Playable Dungeon Nodes)
        for (let s = 0; s < 2; s++) {
          globalSeed = (globalSeed * 37 + s + 1) >>> 0;
          const sName = SECRET_NAMES_POOL[(globalSeed + s + provIdx * 5) % SECRET_NAMES_POOL.length];
          const sPos = s === 0 ? 'Trên' : 'Dưới';
          nodes.push(Object.freeze({
            id: provId + '.prov_secret_' + (s + 1),
            type: 'location',
            displayTypeLabel: 'BÍ CẢNH',
            name: sName,
            direction: sPos,
            parentId: provId,
            desc: 'Ẩn dật giữa đất trời, phong ấn nhiều tàn tích và đạo bảo thượng cổ.',
            locationKind: 'prov_secret',
            runtimePolicy: RUNTIME_POLICIES.DUNGEON,
            status: 'playable'
          }));
        }

        // 5. Duyệt 5 Quốc Gia (Nations) (Navigation Nodes)
        for (let n = 0; n < 5; n++) {
          const isStarterNation = isStarterProv && n === 0;
          const natName = isStarterNation ? 'Đại Ly Quốc' : NATION_NAMES_POOL[(provIdx * 5 + n + contIdx * 7) % NATION_NAMES_POOL.length];
          const natId = isStarterNation ? STARTER_WORLD_IDS.nation : (provId + '.nat.' + slugifyVi(natName) + '_' + (n + 1));
          const natDir = DIRECTIONS_5[n];
          nodes.push(Object.freeze({
            id: natId,
            type: 'nation',
            displayTypeLabel: 'QUỐC GIA',
            name: natName,
            direction: natDir,
            parentId: provId,
            desc: 'Nhân kiệt địa linh, phồn hoa đô hội, nơi hội tụ đạo hữu bốn phương.',
            runtimePolicy: RUNTIME_POLICIES.NONE,
            status: 'playable'
          }));

          // 5 Hoang Dã Quốc Gia (Playable Map Nodes)
          for (let w = 0; w < 5; w++) {
            globalSeed = (globalSeed * 31 + w + 1) >>> 0;
            const natWildName = WILD_NAMES_POOL[(globalSeed + n * 5 + w) % WILD_NAMES_POOL.length];
            const dir = DIRECTIONS_5[w];
            nodes.push(Object.freeze({
              id: natId + '.nat_wild_' + (w + 1),
              type: 'location',
              displayTypeLabel: 'HOANG DÃ',
              name: natWildName,
              direction: dir,
              parentId: natId,
              desc: 'Sơn lâm hiểm trở, nơi ẩn náu của yêu thú hung dữ và quặng khoáng phong phú.',
              locationKind: 'nat_wild',
              runtimePolicy: RUNTIME_POLICIES.MAP,
              status: 'playable'
            }));
          }

          // 2 Bí Cảnh Quốc Gia (Trên & Dưới) (Playable Dungeon Nodes)
          for (let s = 0; s < 2; s++) {
            globalSeed = (globalSeed * 37 + s + 1) >>> 0;
            const natSecretName = SECRET_NAMES_POOL[(globalSeed + n * 5 + s) % SECRET_NAMES_POOL.length];
            const sPos = s === 0 ? 'Trên' : 'Dưới';
            nodes.push(Object.freeze({
              id: natId + '.nat_secret_' + (s + 1),
              type: 'location',
              displayTypeLabel: 'BÍ CẢNH',
              name: natSecretName,
              direction: sPos,
              parentId: natId,
              desc: 'Lưu giữ cơ duyên truyền thừa và linh bảo của các tiền bối khai quốc.',
              locationKind: 'nat_secret',
              runtimePolicy: RUNTIME_POLICIES.DUNGEON,
              status: 'playable'
            }));
          }

          // 6. Duyệt 5 Thành Thị cho mỗi Quốc Gia (Nations -> Cities) (Playable Safe Hub Nodes)
          for (let c = 0; c < 5; c++) {
            const isStarterCity = isStarterNation && c === 0;
            const cityName = isStarterCity ? 'Thanh Vân Thành' : CITY_NAMES_POOL[(provIdx * 10 + n * 5 + c) % CITY_NAMES_POOL.length];
            const cityId = isStarterCity ? STARTER_WORLD_IDS.city : (natId + '.city.' + slugifyVi(cityName) + '_' + (c + 1));
            const cityDir = DIRECTIONS_5[c];
          nodes.push(Object.freeze({
              id: cityId,
              type: 'city_territory',
              displayTypeLabel: 'THÀNH THỊ',
              name: cityName,
              direction: cityDir,
              parentId: natId,
              desc: 'Phồn hoa đô hội, quy tụ nhiều thương các đan dược, pháp bảo và trạm dịch chuyển.',
              runtimePolicy: RUNTIME_POLICIES.HUB,
              status: 'playable'
            }));

            // Nếu là Thành khởi nguyên (Thanh Vân Thành thuộc Đại Ly Quốc): Chứa Thanh Vân Thôn & Thanh Vân Ngoại Vi
            if (isStarterCity) {
              // Thanh Vân Thôn (Khởi nguyên Safe Hub)
              nodes.push(Object.freeze({
                id: STARTER_WORLD_IDS.map0,
                type: 'location',
                displayTypeLabel: 'THÔN',
                name: 'Thanh Vân Thôn',
                direction: 'Tây',
                parentId: cityId,
                desc: 'Thôn trang thanh bình, nơi bắt đầu bước chân đầu tiên trên con đường tu tiên.',
                playableMapId: 'map_thanh_van_thon',
                locationKind: 'safe_hub',
                runtimePolicy: RUNTIME_POLICIES.HUB,
                status: 'playable'
              }));

              // Thanh Vân Ngoại Vi (Khởi nguyên Combat Wilderness)
              nodes.push(Object.freeze({
                id: STARTER_WORLD_IDS.map1,
                type: 'location',
                displayTypeLabel: 'HOANG DÃ',
                name: 'Thanh Vân Ngoại Vi',
                direction: 'Đông',
                parentId: cityId,
                desc: 'Sơn đạo tĩnh mịch, nơi rèn luyện bản lĩnh, săn quái, hái thuốc và khai khoáng.',
                playableMapId: 'map_thanh_van_ngoai_vi',
                locationKind: 'field',
                runtimePolicy: RUNTIME_POLICIES.MAP,
                status: 'playable'
              }));
            }
          }
        }
      });
    });
  });

  // Every gameplay node declares its destination up front. Navigation nodes
  // remain map-less; the resolver never infers a runtime map from node.id.
  return Object.freeze(nodes.map(node => {
    if (node.runtimePolicy === RUNTIME_POLICIES.NONE || node.playableMapId) return node;
    return Object.freeze({
      ...node,
      playableMapId: `map_world_${String(node.id).replace(/[^a-zA-Z0-9_]+/g, '_')}`
    });
  }));
}

export const HUMAN_REALM_WORLD_NODES = buildAllNodes();
export const HUMAN_REALM_CONTINENTS = Object.freeze(HUMAN_REALM_WORLD_NODES.filter(n => n.type === 'continent'));
export const NEW_HUMAN_REALM_CONTINENT_SPECS = Object.freeze(CONTINENT_BLUEPRINTS);
export const NAM_LANG_WORLD_NODES = Object.freeze(HUMAN_REALM_WORLD_NODES.filter(n => n.id === 'nl' || n.id.startsWith('nl.')));
export const HUMAN_REALM_DECLARATION_COUNTS = HUMAN_REALM_SCALE;
export const HUMAN_REALM_MAP_DECLARATION = Object.freeze({ scale: HUMAN_REALM_SCALE });
