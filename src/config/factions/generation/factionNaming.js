import { FACTION_ARCHETYPES } from '../core/factionConstants.js';

const PREFIXES = Object.freeze({
  south: ['Thanh','Bạch','Huyền','Vân','Thiên','Linh','Cổ','Kim','Trúc','Long'],
  east: ['Thanh Long','Thương Hải','Thiên Kiếm','Lôi Trạch','Vạn Mộc','Linh Phù','Long Uyên','Nhật Thăng'],
  west: ['Xích Sa','Hoang Cổ','Kim Sa','Lạc Nhật','Huyễn Sa','Thạch Lâm','Đại Mạc'],
  north: ['Huyền Băng','Hàn Nguyệt','Bắc Minh','Cực Quang','Tuyết Nguyên','Băng Hải'],
  central: ['Cửu Thiên','Thái Nhất','Tử Vi','Hạo Thiên','Vạn Pháp','Thánh Linh','Tiên Hà','Thiên Nguyên','Hư Không','Đan Thiên','Thần Cơ']
});

const SUFFIX = Object.freeze({
  south: {
    [FACTION_ARCHETYPES.SECT]: ['Tông','Các','Môn','Sơn Trang','Đạo Tông'],
    [FACTION_ARCHETYPES.CULTIVATION_FAMILY]: ['Thế Gia','Tu Tiên Gia','Gia Tộc'],
    [FACTION_ARCHETYPES.DYNASTY]: ['Quốc','Hoàng Triều'],
    [FACTION_ARCHETYPES.MERCHANT_GUILD]: ['Thương Hội','Thương Minh'],
    [FACTION_ARCHETYPES.UNDERWORLD]: ['Hắc Hội','Ám Đường']
  },
  east: {
    [FACTION_ARCHETYPES.SECT]: ['Đạo Viện','Kiếm Các','Huyền Môn','Hải Cung','Lôi Điện'],
    [FACTION_ARCHETYPES.CULTIVATION_FAMILY]: ['Thế Gia','Long Gia','Kiếm Gia'],
    [FACTION_ARCHETYPES.DYNASTY]: ['Hoàng Triều','Hải Quốc'],
    [FACTION_ARCHETYPES.MERCHANT_GUILD]: ['Hải Thương Minh','Thương Hội'],
    [FACTION_ARCHETYPES.UNDERWORLD]: ['Ám Các','Hắc Phường']
  },
  west: {
    [FACTION_ARCHETYPES.SECT]: ['Thần Điện','Sa Tông','Cổ Môn','Hỏa Cung'],
    [FACTION_ARCHETYPES.CULTIVATION_FAMILY]: ['Cổ Tộc','Bộ Tộc','Thế Gia'],
    [FACTION_ARCHETYPES.DYNASTY]: ['Cổ Quốc','Vương Đình'],
    [FACTION_ARCHETYPES.MERCHANT_GUILD]: ['Sa Hải Thương Minh','Thương Đội Liên Minh'],
    [FACTION_ARCHETYPES.UNDERWORLD]: ['Hắc Trại','Ảnh Điện']
  },
  north: {
    [FACTION_ARCHETYPES.SECT]: ['Hàn Cung','Tuyết Tông','Bắc Minh Môn','Hàn Kiếm Phái'],
    [FACTION_ARCHETYPES.CULTIVATION_FAMILY]: ['Hàn Tộc','Cổ Tộc','Thế Gia'],
    [FACTION_ARCHETYPES.DYNASTY]: ['Hoàng Đình','Hàn Quốc'],
    [FACTION_ARCHETYPES.MERCHANT_GUILD]: ['Băng Hải Thương Hội','Hàn Thương Minh'],
    [FACTION_ARCHETYPES.UNDERWORLD]: ['U Băng Hội','Ám Tuyết Đường']
  },
  central: {
    [FACTION_ARCHETYPES.SECT]: ['Thánh Địa','Đạo Cung','Thần Điện','Đại Tông'],
    [FACTION_ARCHETYPES.CULTIVATION_FAMILY]: ['Cổ Tộc','Thế Gia','Thần Tộc'],
    [FACTION_ARCHETYPES.DYNASTY]: ['Thần Triều','Thiên Triều'],
    [FACTION_ARCHETYPES.MERCHANT_GUILD]: ['Thương Minh','Tổng Hội'],
    [FACTION_ARCHETYPES.UNDERWORLD]: ['Hắc Thiên Các','U Minh Hội']
  }
});

export function generatedFactionName(continentKey, archetype, seed = 0) {
  const prefixes = PREFIXES[continentKey] || PREFIXES.south;
  const generic = {
    [FACTION_ARCHETYPES.ANCIENT_CLAN]: ['Cổ Tộc','Thần Tộc'],
    [FACTION_ARCHETYPES.PROFESSION_GUILD]: ['Đan Hội','Khí Hội','Phù Hội','Trận Hội'],
    [FACTION_ARCHETYPES.ACADEMY]: ['Học Cung','Đạo Viện'],
    [FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE]: ['Tán Tu Minh','Tu Sĩ Hội'],
    [FACTION_ARCHETYPES.DEMONIC_FACTION]: ['Ma Điện','Huyết Tông'],
    [FACTION_ARCHETYPES.NON_HUMAN_FACTION]: ['Yêu Đình','Linh Tộc'],
    [FACTION_ARCHETYPES.ADMINISTRATION]: ['Thành Chủ Phủ','Nha Phủ'],
    [FACTION_ARCHETYPES.MILITARY_ORDER]: ['Trấn Vệ Quân','Hộ Thành Doanh'],
    [FACTION_ARCHETYPES.INTELLIGENCE_NETWORK]: ['Thiên Cơ Phân Các','Mật Thám Ty'],
    [FACTION_ARCHETYPES.CITY_STATE]: ['Thành Bang','Thành Phủ']
  };
  const suffixes = SUFFIX[continentKey]?.[archetype] || generic[archetype] || ['Hội','Môn','Minh'];
  return `${prefixes[Math.abs(seed) % prefixes.length]} ${suffixes[Math.abs(seed * 7 + 3) % suffixes.length]}`;
}
