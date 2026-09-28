// HỆ THỐNG BẢN ĐỒ DUY NHẤT CỦA GAME
const DEFAULT_FIELD = Object.freeze({ left: 60, right: 2820, top: 350, bottom: 900 });
const DEFAULT_SPAWN = Object.freeze({ x: 350, y: 620 });

const makeMap = (id, name, sub, minRealm, monsterIdxStart, icon, opts = {}) => ({
  id, name, sub, minRealm, monsterIdxStart, icon,
  isPeaceZone: opts.isPeaceZone ?? false,
  noRepeat: opts.noRepeat ?? false,
  worldWidth: opts.worldWidth ?? 2880,
  worldHeight: opts.worldHeight ?? 960,
  field: { ...DEFAULT_FIELD, ...(opts.field || {}) },
  spawn: { ...DEFAULT_SPAWN, ...(opts.spawn || {}) },
  panoramaKey: opts.panoramaKey || `map_panorama_${id}`,
  panoramaAsset: opts.panoramaAsset ?? null,
  panoramaSourceWidth: opts.panoramaSourceWidth ?? 3200,
  panoramaSourceHeight: opts.panoramaSourceHeight ?? 960,
  panoramaTemplateMapId: opts.panoramaTemplateMapId ?? (id === 0 ? null : 0)
});

export const WORLD_REGIONS = [
  {
    id: 'nam_lang',
    name: 'Nam Lăng Đại Lục',
    desc: 'Vùng đất khởi nguyên tu chân giới, núi non trùng điệp, sơn môn san sát.',
    maps: [
      makeMap(0, 'Thanh Vân Thôn', 'Làng Khởi Nguyên & Khu An Toàn (Không Quái)', 0, 0, 'stage_0', {
        isPeaceZone: true, noRepeat: true, worldWidth: 540, worldHeight: 960,
        field: { left: 90, right: 450, top: 180, bottom: 890 },
        panoramaKey: 'map_panorama_0', panoramaAsset: 'environment/IMG_7504.png',
        panoramaSourceWidth: 784, panoramaSourceHeight: 1334, panoramaTemplateMapId: null,
        spawn: { x: 270, y: 840 }
      }),
      makeMap(1, 'Thanh Vân Ngoại Vi', 'Khu Săn Yêu Tân Thủ (Bãi Thú Ngoại Vi)', 0, 0, 'stage_0', {
        isPeaceZone: false, worldWidth: 32000, worldHeight: 960,
        field: { left: 60, right: 31940, top: 350, bottom: 900 },
        panoramaKey: 'map_panorama_1', panoramaAsset: 'environment/valley_panorama.png',
        panoramaSourceWidth: 3200, panoramaSourceHeight: 960, panoramaTemplateMapId: null,
        spawn: { x: 350, y: 620 }
      }),
      makeMap(2, 'Vạn Mộc Sâm Lâm', 'Cổ Mộc Thâm Xứ (Luyện Khí Tầng 7+)', 7, 4, 'stage_1', {
        worldWidth: 32000, worldHeight: 960,
        field: { left: 60, right: 31940, top: 350, bottom: 900 },
        panoramaKey: 'map_panorama_2', panoramaAsset: 'environment/van_moc_sam_lam.png',
        panoramaSourceWidth: 2880, panoramaSourceHeight: 960, panoramaTemplateMapId: null,
        spawn: { x: 350, y: 620 }
      }),
      makeMap(3, 'Huyết Lạc Cấm Địa', 'Nhị Phẩm Cấm Khu (Trúc Cơ)', 13, 8, 'stage_2')
    ]
  },
  {
    id: 'van_tinh_hai',
    name: 'Vạn Tinh Hải Vực',
    desc: 'Đại dương vô tận với hàng vạn tiên đảo và sào huyệt yêu thú ngàn năm.',
    maps: [
      makeMap(4, 'Thiên Tinh Hải Thành', 'Nhị Phẩm Đảo Thành', 14, 12, 'stage_3'),
      makeMap(5, 'Ngoại Hải Săn Yêu', 'Tam Phẩm Hải Uyên (Kim Đan)', 17, 12, 'stage_4'),
      makeMap(6, 'Hư Không Cổ Điện', 'Tam Phẩm Di Tích', 19, 16, 'stage_5')
    ]
  },
  {
    id: 'than_chau',
    name: 'Thần Châu Thánh Địa',
    desc: 'Trung tâm tu tiên phồn hoa cực thịnh, nơi ngự trị của các Thái Cổ Đại Tông.',
    maps: [
      makeMap(7, 'Côn Lôn Tiên Lạc', 'Tứ Phẩm Thánh Sơn (Nguyên Anh)', 21, 16, 'stage_6'),
      makeMap(8, 'Thái Hư Kiếm Cốc', 'Tứ Phẩm Kiếm Trủng', 23, 18, 'stage_7'),
      makeMap(9, 'Hoàng Cực Thần Điện', 'Tứ Phẩm Đế Đô', 24, 18, 'stage_8')
    ]
  },
  {
    id: 'man_hoang',
    name: 'Man Hoang Cổ Vực',
    desc: 'Vùng đất nguyên thủy cấm kỵ, cổ ma tàn tích và linh thú thời thái cổ.',
    maps: [
      makeMap(10, 'U Minh Quỷ Quật', 'Ngũ Phẩm Ma Cảnh (Hóa Thần)', 25, 20, 'stage_9'),
      makeMap(11, 'Thần Ma Cổ Chiến Trường', 'Ngũ Phẩm Cổ Địa', 26, 20, 'stage_10')
    ]
  },
  {
    id: 'thai_hu',
    name: 'Thái Hư Tiên Đạo',
    desc: 'Bí cảnh nối liền Thiên Địa, nơi hội tụ Thiên Kiếp và cánh cổng phi thăng.',
    maps: [
      makeMap(12, 'Cửu Trọng Thiên Đạo', 'Ngũ Phẩm Hóa Thần Cực Hạn', 27, 20, 'stage_10'),
      makeMap(13, 'Phi Thăng Tiên Môn', 'Ngũ Phẩm Đỉnh Phong', 28, 20, 'stage_11')
    ]
  }
];

export const ALL_MAPS = WORLD_REGIONS.flatMap(region => region.maps);
export const START_MAP_ID = 0;
export function getMapById(mapId) {
  return ALL_MAPS.find(map => map.id === mapId) || ALL_MAPS[0];
}
