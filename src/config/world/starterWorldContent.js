/**
 * starterWorldContent.js
 * Canonical lore/content data for the currently materialized Nam Lăng starter chain.
 * This file contains DATA ONLY. It never owns map runtime, map UI or teleport logic.
 */

export const THANH_LINH_PROVINCES = Object.freeze([
  Object.freeze({ name: 'Thanh Châu', theme: 'starter_human', desc: 'Châu khởi đầu, nhân tộc đông đúc, tiểu quốc và gia tộc tu tiên phân bố dày.' }),
  Object.freeze({ name: 'Vân Châu', theme: 'cloud_sword', desc: 'Núi cao phủ mây, kiếm tu và sơn môn trên đỉnh núi phát triển.' }),
  Object.freeze({ name: 'Lạc Châu', theme: 'plains_dynasty', desc: 'Đồng bằng rộng, đại thành và các hoàng triều phàm tục lâu đời.' }),
  Object.freeze({ name: 'Linh Châu', theme: 'alchemy_herbs', desc: 'Linh điền, linh dược và luyện đan phát triển mạnh.' }),
  Object.freeze({ name: 'Cổ Châu', theme: 'ancient_ruins', desc: 'Di tích, cổ mộ và truyền thừa thượng cổ xuất hiện dày đặc.' }),
  Object.freeze({ name: 'Huyền Châu', theme: 'formation_talisman', desc: 'Trận pháp, phù chú và các thế lực nghiên cứu huyền thuật nổi tiếng.' }),
  Object.freeze({ name: 'Thiên Hà Châu', theme: 'river_water', desc: 'Sông lớn và thủy võng trải rộng, thủy hệ tu sĩ cùng thủy vận hưng thịnh.' }),
  Object.freeze({ name: 'Ngọc Châu', theme: 'jade_mining', desc: 'Ngọc thạch, linh khoáng và các phường luyện khí phát triển.' }),
  Object.freeze({ name: 'Nam Hoa Châu', theme: 'commerce_market', desc: 'Phường thị, thương hội và tuyến giao thương liên quốc gia tập trung.' }),
  Object.freeze({ name: 'Bách Thảo Châu', theme: 'herb_valleys', desc: 'Sơn cốc linh dược, Đan Tông và các dược viên quy mô lớn.' }),
  Object.freeze({ name: 'Trấn Yêu Châu', theme: 'beast_frontier', desc: 'Biên cảnh giáp yêu địa, thường xuyên xảy ra thú triều và săn yêu.' }),
  Object.freeze({ name: 'Linh Sơn Châu', theme: 'sect_mountains', desc: 'Sơn mạch dày đặc, tông môn và động phủ tu luyện phân bố rộng.' })
]);

export const THANH_CHAU_PROFILE = Object.freeze({
  politicalEntityCount: 136,
  majorStateCount: 24,
  mediumStateCount: 52,
  smallStateCount: 60,
  desc: 'Một trong 108 Châu của Nam Lăng; gồm nhiều quốc gia, yêu quốc, liên minh thành bang, bộ tộc và lãnh địa tông môn.',
  notablePoliticalPowers: Object.freeze([
    'Đại Ly Quốc', 'Thiên Võ Hoàng Triều', 'Đại Chu Hoàng Triều', 'Vạn Kiếm Quốc',
    'Thanh Hồ Yêu Quốc', 'Cửu Sơn Liên Minh', 'Nam Man Bộ Tộc', 'Thiên Hà Thủy Quốc'
  ]),
  cultivationFactions: Object.freeze([
    'Thanh Huyền Đạo Tông', 'Vạn Kiếm Tông Thanh Châu Phân Tông', 'Thiên Đan Cốc',
    'Bách Linh Ngự Thú Sơn', 'Huyền Phù Môn', 'Vạn Bảo Thương Minh Thanh Châu Tổng Hội'
  ]),
  factionOverlayRule: 'CULTIVATION_FACTIONS_CROSS_POLITICAL_BORDERS'
});

export const DAI_LY_PROFILE = Object.freeze({
  commanderyCount: 108,
  tier: 'mid_state',
  capital: 'Đại Ly Hoàng Thành',
  strategicRegions: Object.freeze([
    'Trung Kinh', 'Nam Sơn', 'Bắc Hà', 'Đông Lâm', 'Tây Nguyên', 'Thanh Giang', 'Vạn Phong', 'Hắc Sơn', 'Linh Hồ'
  ]),
  powerScale: Object.freeze([
    'Phàm Nhân: tuyệt đại đa số dân cư',
    'Luyện Khí: phổ biến trong gia tộc tu tiên nhỏ',
    'Trúc Cơ: cao thủ địa phương',
    'Kim Đan: trưởng lão/bá chủ một vùng',
    'Nguyên Anh: cường giả cấp quốc gia',
    'Hóa Thần: gần như truyền thuyết trong Đại Ly'
  ])
});

export const NAM_SON_PROFILE = Object.freeze({
  cityCount: 132,
  minimumTownCount: 2000,
  minimumVillageCount: 20000,
  materializedLocationTarget: Object.freeze([30, 50]),
  capital: 'Nam Sơn Quận Thành',
  desc: 'Quận biên giới phía nam Đại Ly, có hàng nghìn sơn mạch, rừng, mỏ và địa điểm tu luyện nhưng chỉ materialize điểm quan trọng.',
  capitalServices: Object.freeze([
    'Quận Thủ Phủ', 'Tu Tiên Phường Thị', 'Đấu Giá Hội', 'Luyện Đan Sư Công Hội',
    'Luyện Khí Sư Công Hội', 'Phù Sư Công Hội', 'Trận Pháp Sư Công Hội', 'Ngự Thú Các',
    'Tàng Kinh Các', 'Truyền Tống Điện', 'Phi Chu Bến', 'Linh Thú Dịch Trạm',
    'Đấu Pháp Đài', 'Nhiệm Vụ Điện', 'Thương Hội', 'Tửu Lâu', 'Khách Điếm',
    'Chợ Đen', 'Khu Tông Môn Tuyển Đệ Tử'
  ])
});

export const THANH_HA_PROFILE = Object.freeze({
  villages: 126,
  towns: 18,
  mountainRanges: 7,
  largeForests: 4,
  miningZones: 3,
  spiritLakes: 2,
  cultivationFamilies: 11,
  minorSects: 6,
  smallSecretRealms: 14,
  localForbiddenZones: 5,
  materializedLocationTarget: Object.freeze([20, 30]),
  desc: 'Một Thành Vực hành chính rộng lớn; Thanh Hà Thành là đô thị trung tâm còn Thanh Vân chỉ là một thôn ở vùng phụ cận.'
});

export const THANH_HA_HUB_SERVICES = Object.freeze([
  'Đấu Giá Các', 'Đan Các', 'Khí Các', 'Tông Môn Điện', 'Gia Tộc Điện',
  'Truyền Tống Điện', 'Nhiệm Vụ Điện', 'Bến Phi Chu', 'Phường Thị', 'Khách Điếm'
]);

export const STARTER_PROGRESSION = Object.freeze([
  'Thanh Vân Thôn', 'Thanh Vân Ngoại Vi', 'Vạn Mộc Sâm Lâm',
  'Thanh Hà Thành', 'Nam Sơn Quận', 'Đại Ly Quốc', 'Thanh Châu', 'Thanh Linh Vực', 'Nam Lăng Đại Lục'
]);

// World nodes known/materialized in the Thanh Hà territory.
// Only Map 0-2 carry playableMapId. Every other location is world data only and
// cannot enter the runtime until it is deliberately added to playableMaps.js.
export const THANH_HA_LOCATION_SPECS = Object.freeze([
  Object.freeze({ slug: 'thanh_van_thon', name: 'Thanh Vân Thôn', playableMapId: 0, kind: 'safe_hub', status: 'playable', desc: 'Thôn khởi đầu và khu an toàn; dân cư sống bằng hái thuốc, săn thú, khai thác gỗ và vận chuyển.' }),
  Object.freeze({ slug: 'thanh_van_ngoai_vi', name: 'Thanh Vân Ngoại Vi', playableMapId: 1, kind: 'field', status: 'playable', desc: 'Ngoại vi rộng 32.000px, khu săn yêu và luyện cấp đầu tiên.' }),
  Object.freeze({ slug: 'van_moc_sam_lam', name: 'Vạn Mộc Sâm Lâm', playableMapId: 2, kind: 'field', status: 'playable', desc: 'Cổ lâm địa phương nhiều tầng nguy hiểm, linh thảo và yêu thú; không phải đại lâm cấp đại lục.' }),
  Object.freeze({ slug: 'thanh_ha_thanh', name: 'Thanh Hà Thành', kind: 'major_hub', status: 'planned', desc: 'Hub cấp Thành thứ hai; mở gameplay thương hội, đấu giá, tông môn, gia tộc, truyền tống và phi chu.', services: THANH_HA_HUB_SERVICES, unlockHint: 'Sau khi hoàn tất tuyến Vạn Mộc Sâm Lâm và nhận Thanh Hà Thành Lệnh.' }),
  Object.freeze({ slug: 'thanh_phong_tran', name: 'Thanh Phong Trấn', kind: 'town', status: 'planned', desc: 'Trấn cửa ngõ phía đông Thanh Hà, trung chuyển hàng hóa và tán tu.' }),
  Object.freeze({ slug: 'bach_thach_tran', name: 'Bạch Thạch Trấn', kind: 'town', status: 'planned', desc: 'Trấn đá trắng, gần các mỏ khoáng cấp thấp.' }),
  Object.freeze({ slug: 'hac_son_tran', name: 'Hắc Sơn Trấn', kind: 'town', status: 'planned', desc: 'Trấn khai khoáng dưới chân Hắc Sơn.' }),
  Object.freeze({ slug: 'linh_duoc_coc', name: 'Linh Dược Cốc', kind: 'resource', status: 'planned', desc: 'Thung lũng linh thảo địa phương, phù hợp nhiệm vụ thu thập và luyện đan.' }),
  Object.freeze({ slug: 'hac_thach_khoang_dong', name: 'Hắc Thạch Khoáng Động', kind: 'dungeon', status: 'planned', desc: 'Khoáng động nhiều tầng với khoáng thạch, yêu trùng và tinh anh.' }),
  Object.freeze({ slug: 'linh_thu_son', name: 'Linh Thú Sơn', kind: 'field', status: 'planned', desc: 'Sơn địa sinh sống của linh thú, phù hợp săn bắt và ngự thú.' }),
  Object.freeze({ slug: 'thien_ha_ho', name: 'Thiên Hà Hồ', kind: 'lake', status: 'planned', desc: 'Linh hồ lớn trong Thành Vực; thủy hệ tài nguyên và yêu thú xuất hiện theo thời tiết.' }),
  Object.freeze({ slug: 'co_tu_dong_phu', name: 'Cổ Tu Động Phủ', kind: 'secret', status: 'planned', desc: 'Động phủ cổ mở bằng sự kiện hoặc manh mối, không hiện hoàn toàn từ đầu.' }),
  Object.freeze({ slug: 'huyet_ma_dong', name: 'Huyết Ma Động', kind: 'dungeon', status: 'planned', desc: 'Ma khí tụ trong động sâu, dùng cho tuyến nhiệm vụ nguy hiểm cấp Thành Vực.' }),
  Object.freeze({ slug: 'co_truyen_tong_tran', name: 'Cổ Truyền Tống Trận', kind: 'travel', status: 'planned', desc: 'Trận pháp giao thông cổ, về sau kết nối tuyến xa trong Nam Sơn.' }),
  Object.freeze({ slug: 'bach_van_son', name: 'Bạch Vân Sơn', kind: 'mountain', status: 'planned', desc: 'Sơn mạch mây trắng có động phủ nhỏ và điểm hái dược.' }),
  Object.freeze({ slug: 'thanh_truc_lam', name: 'Thanh Trúc Lâm', kind: 'field', status: 'planned', desc: 'Rừng trúc nhẹ, thích hợp tài nguyên Mộc hệ và nhiệm vụ sơ cấp.' }),
  Object.freeze({ slug: 'lac_ha_binh_nguyen', name: 'Lạc Hà Bình Nguyên', kind: 'field', status: 'planned', desc: 'Đồng bằng rộng giữa các thôn trấn, có thương đội và sơn tặc.' }),
  Object.freeze({ slug: 'hoa_van_coc', name: 'Hỏa Vân Cốc', kind: 'valley', status: 'planned', desc: 'Cốc địa hỏa yếu, có khoáng Hỏa hệ và quái biến dị.' }),
  Object.freeze({ slug: 'ngan_tuyen_ho', name: 'Ngân Tuyền Hồ', kind: 'lake', status: 'planned', desc: 'Hồ nhỏ có linh tuyền, nguồn nguyên liệu thủy hệ.' }),
  Object.freeze({ slug: 'song_phong_son', name: 'Song Phong Sơn', kind: 'mountain', status: 'planned', desc: 'Hai đỉnh núi tạo tuyến đường tắt và điểm phục kích.' }),
  Object.freeze({ slug: 'moc_linh_bi_canh', name: 'Mộc Linh Bí Cảnh', kind: 'secret_realm', status: 'planned', desc: 'Bí cảnh nhỏ mở theo chu kỳ, dùng template tái sử dụng với seed riêng.' }),
  Object.freeze({ slug: 'thanh_ha_phuong_thi', name: 'Thanh Hà Phường Thị', kind: 'market', status: 'planned', desc: 'Phường thị tán tu ngoài thành, giao dịch nguyên liệu và vật phẩm.' }),
  Object.freeze({ slug: 'bach_thao_vien', name: 'Bách Thảo Viện', kind: 'resource', status: 'planned', desc: 'Dược viên do thế lực địa phương quản lý.' }),
  Object.freeze({ slug: 'linh_thach_mo_dong', name: 'Linh Thạch Mỏ Đông', kind: 'mine', status: 'planned', desc: 'Mỏ linh thạch nhỏ phía đông Thành Vực.' }),
  Object.freeze({ slug: 'vo_danh_co_mo', name: 'Vô Danh Cổ Mộ', kind: 'tomb', status: 'planned', desc: 'Cổ mộ chưa rõ chủ nhân, thiên về khám phá và cơ quan.' }),
  Object.freeze({ slug: 'tan_tu_doanh_dia', name: 'Tán Tu Doanh Địa', kind: 'camp', status: 'planned', desc: 'Điểm tụ tập tán tu, nhận nhiệm vụ và trao đổi tin đồn.' }),
  Object.freeze({ slug: 'thanh_ha_tuan_tra_dai', name: 'Thanh Hà Tuần Tra Đài', kind: 'outpost', status: 'planned', desc: 'Tiền đồn của Thanh Hà, kiểm soát đường vào các khu nguy hiểm.' }),
  Object.freeze({ slug: 'hac_phong_trai', name: 'Hắc Phong Trại', kind: 'enemy_camp', status: 'planned', desc: 'Sơn trại địch cấp địa phương, thích hợp chuỗi truy nã.' }),
  Object.freeze({ slug: 'nam_son_co_dao', name: 'Nam Sơn Cổ Đạo', kind: 'travel', status: 'planned', desc: 'Cổ đạo dẫn ra khỏi Thanh Hà Thành Vực và tiến sâu vào Nam Sơn Quận.' })
]);

export const STARTER_WORLD_CONTENT_VERSION = '20260929-starter-world-v3';
