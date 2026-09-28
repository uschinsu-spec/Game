// YÊU THÚ: CHỈ SỐ CỐ ĐỊNH THEO CẢNH GIỚI YÊU THÚ, KHÔNG SCALE THEO PLAYER
// Quy tắc cân bằng chuẩn:
// - Enemy cảnh giới X mạnh hơn Player nền ở mốc cảnh giới X.
// - Enemy cảnh giới X yếu hơn Player nền ở mốc cảnh giới kế tiếp.
// - Nhất Phẩm quy đổi đặc biệt với Luyện Khí 12 tầng:
//   Sơ Kỳ = Luyện Khí Tầng 3, Trung Kỳ = Tầng 6,
//   Hậu Kỳ = Tầng 9, Đỉnh Phong = Tầng 12.
// - Từ Nhị Phẩm trở lên tương ứng trực tiếp với 4 tiểu cảnh giới của đại cảnh giới Player.
// - Enemy có HP / Damage / DEF riêng cố định theo dữ liệu; không đọc realmIdx/player stats lúc spawn.
export const MONSTER_RANKS = [
  // Phàm Thú
  { id: 'm_0_1', name: 'Tiểu Dã Trư', rank: 'Chưa Tu Luyện (Phàm Thú)', tier: 0, hp: 110, dmg: 6, def: 0, exp: 0, silver: 80, gold: 0, ore: 1, spriteNum: 4 },
  { id: 'm_0_2', name: 'Tiểu Thanh Lang', rank: 'Chưa Tu Luyện (Phàm Thú)', tier: 0, hp: 120, dmg: 7, def: 0, exp: 0, silver: 100, gold: 0, ore: 1, spriteNum: 5 },
  { id: 'm_0_3', name: 'Dã Thố Tinh', rank: 'Chưa Tu Luyện (Phàm Thú)', tier: 0, hp: 105, dmg: 5, def: 0, exp: 0, silver: 60, gold: 0, ore: 1, spriteNum: 1 },
  { id: 'm_0_4', name: 'Dã Trư Đầu Đàn', rank: 'Chưa Tu Luyện (Phàm Thú Đầu Đàn)', tier: 0, hp: 180, dmg: 10, def: 2, exp: 0, silver: 250, gold: 0, ore: 2, spriteNum: 4 },

  // Nhất Phẩm Yêu Thú - Luyện Khí 3 / 6 / 9 / 12
  // Sức mạnh nằm giữa Player mốc tương đương và Player tầng kế tiếp.
  { id: 'm_1_1', name: 'Thanh Lang', rank: 'Nhất Phẩm Sơ Kỳ', tier: 1, hp: 600, dmg: 45, def: 15, exp: 90, silver: 300, gold: 1, ore: 1, spriteNum: 5, realmIdx: 3, equivalentRealm: 'Luyện Khí Tầng 3' },
  { id: 'm_1_2', name: 'Độc Giác Trư', rank: 'Nhất Phẩm Trung Kỳ', tier: 2, hp: 1300, dmg: 84, def: 31, exp: 180, silver: 600, gold: 2, ore: 2, spriteNum: 4, realmIdx: 6, equivalentRealm: 'Luyện Khí Tầng 6' },
  { id: 'm_1_3', name: 'Huyết Tích Ma', rank: 'Nhất Phẩm Hậu Kỳ', tier: 3, hp: 2700, dmg: 150, def: 58, exp: 360, silver: 1000, gold: 3, ore: 2, spriteNum: 9, realmIdx: 9, equivalentRealm: 'Luyện Khí Tầng 9' },
  { id: 'm_1_4', name: 'Huyết Lang Vạn Mộc', rank: 'Nhất Phẩm Đỉnh Phong', tier: 4, hp: 7000, dmg: 420, def: 160, exp: 700, silver: 2500, gold: 5, ore: 3, spriteNum: 7, realmIdx: 12, equivalentRealm: 'Luyện Khí Tầng 12' },

  // Nhị Phẩm Yêu Thú - Trúc Cơ
  // Sơ < Trung < Hậu < Đỉnh; mỗi mốc mạnh hơn Player cùng tiểu cảnh và yếu hơn Player tiểu cảnh kế tiếp.
  { id: 'm_2_1', name: 'Thiết Giáp Tê Ngưu', rank: 'Nhị Phẩm Sơ Kỳ', tier: 5, hp: 19000, dmg: 820, def: 330, exp: 5000, silver: 4000, gold: 10, ore: 3, spriteNum: 12, realmIdx: 13, equivalentRealm: 'Trúc Cơ Sơ Kỳ' },
  { id: 'm_2_2', name: 'Hỏa Dực Quỷ', rank: 'Nhị Phẩm Trung Kỳ', tier: 6, hp: 30000, dmg: 1180, def: 470, exp: 8500, silver: 6000, gold: 15, ore: 4, spriteNum: 8, isRanged: true, realmIdx: 14, equivalentRealm: 'Trúc Cơ Trung Kỳ' },
  { id: 'm_2_3', name: 'Thiết Giáp Kỵ Ma', rank: 'Nhị Phẩm Hậu Kỳ', tier: 7, hp: 47000, dmg: 1720, def: 680, exp: 14000, silver: 9000, gold: 25, ore: 4, spriteNum: 10, realmIdx: 15, equivalentRealm: 'Trúc Cơ Hậu Kỳ' },
  { id: 'm_2_4', name: 'Hỏa Nham Cự Giải', rank: 'Nhị Phẩm Đỉnh Phong', tier: 8, hp: 90000, dmg: 3200, def: 1350, exp: 24000, silver: 15000, gold: 40, ore: 5, spriteNum: 14, realmIdx: 16, equivalentRealm: 'Trúc Cơ Đỉnh Phong' },

  // Tam Phẩm Yêu Thú - Kim Đan
  { id: 'm_3_1', name: 'U Minh Mãng Xà', rank: 'Tam Phẩm Sơ Kỳ', tier: 9, hp: 320000, dmg: 9500, def: 3900, exp: 42000, gold: 80, ore: 6, spriteNum: 13, isRanged: true, realmIdx: 17, equivalentRealm: 'Kim Đan Sơ Kỳ' },
  { id: 'm_3_2', name: 'Đường Lang Yêu', rank: 'Tam Phẩm Trung Kỳ', tier: 10, hp: 520000, dmg: 14500, def: 5900, exp: 68000, gold: 120, ore: 7, spriteNum: 11, realmIdx: 18, equivalentRealm: 'Kim Đan Trung Kỳ' },
  { id: 'm_3_3', name: 'Lục Độc Chu', rank: 'Tam Phẩm Hậu Kỳ', tier: 11, hp: 800000, dmg: 21500, def: 8800, exp: 105000, gold: 180, ore: 8, spriteNum: 6, isRanged: true, realmIdx: 19, equivalentRealm: 'Kim Đan Hậu Kỳ' },
  { id: 'm_3_4', name: 'Độc Nhãn Vu Sư', rank: 'Tam Phẩm Đỉnh Phong', tier: 12, hp: 1800000, dmg: 70000, def: 21000, exp: 180000, gold: 300, ore: 10, spriteNum: 15, isRanged: true, realmIdx: 20, equivalentRealm: 'Kim Đan Đỉnh Phong' },

  // Tứ Phẩm Yêu Thú - Nguyên Anh
  { id: 'm_4_1', name: 'Khô Lâu Binh', rank: 'Tứ Phẩm Sơ Kỳ', tier: 13, hp: 6200000, dmg: 145000, def: 58000, exp: 280000, gold: 500, ore: 12, spriteNum: 2, realmIdx: 21, equivalentRealm: 'Nguyên Anh Sơ Kỳ' },
  { id: 'm_4_2', name: 'Khô Lâu Cung Thủ', rank: 'Tứ Phẩm Trung Kỳ', tier: 14, hp: 10000000, dmg: 220000, def: 88000, exp: 440000, gold: 800, ore: 15, spriteNum: 3, isRanged: true, realmIdx: 22, equivalentRealm: 'Nguyên Anh Trung Kỳ' },
  { id: 'm_4_3', name: 'Goblin Dao Tặc', rank: 'Tứ Phẩm Hậu Kỳ', tier: 15, hp: 16000000, dmg: 340000, def: 132000, exp: 680000, gold: 1200, ore: 18, spriteNum: 1, realmIdx: 23, equivalentRealm: 'Nguyên Anh Hậu Kỳ' },
  { id: 'm_4_4', name: 'Xích Diễm Phi Long', rank: 'Tứ Phẩm Đỉnh Phong', tier: 16, hp: 50000000, dmg: 900000, def: 310000, exp: 1100000, gold: 2000, ore: 22, spriteNum: 16, isRanged: true, realmIdx: 24, equivalentRealm: 'Nguyên Anh Đỉnh Phong' },

  // Ngũ Phẩm Yêu Thú - Hóa Thần
  { id: 'm_5_1', name: 'Thái Cổ Chân Long', rank: 'Ngũ Phẩm Sơ Kỳ', tier: 17, hp: 150000000, dmg: 2400000, def: 900000, exp: 1700000, gold: 3500, ore: 26, spriteNum: 16, isRanged: true, realmIdx: 25, equivalentRealm: 'Hóa Thần Sơ Kỳ' },
  { id: 'm_5_2', name: 'Cửu Tiêu Ma Tôn', rank: 'Ngũ Phẩm Trung Kỳ', tier: 18, hp: 250000000, dmg: 3600000, def: 1320000, exp: 2500000, gold: 5500, ore: 32, spriteNum: 15, isRanged: true, realmIdx: 26, equivalentRealm: 'Hóa Thần Trung Kỳ' },
  { id: 'm_5_3', name: 'Hỗn Độn Cự Thú', rank: 'Ngũ Phẩm Hậu Kỳ', tier: 19, hp: 410000000, dmg: 5500000, def: 2000000, exp: 3800000, gold: 8500, ore: 40, spriteNum: 7, realmIdx: 27, equivalentRealm: 'Hóa Thần Hậu Kỳ' },
  // Cảnh giới cuối hiện tại: không có Player mốc tiếp theo để kẹp trên.
  { id: 'm_5_4', name: 'Chí Tôn Thần Ma Chi Chủ', rank: 'Ngũ Phẩm Đỉnh Phong', tier: 20, hp: 650000000, dmg: 8500000, def: 3000000, exp: 6000000, gold: 15000, ore: 50, spriteNum: 10, realmIdx: 28, equivalentRealm: 'Hóa Thần Đỉnh Phong' }
];
