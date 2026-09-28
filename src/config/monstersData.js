// YÊU THÚ: CẤP ĐỘ CHƯA TU LUYỆN (PHÀM THÚ) VÀ NHẤT PHẨM ĐẾN NGŨ PHẨM YÊU THÚ
export const MONSTER_RANKS = [
  // Cấp độ Chưa Tu Luyện (Phàm Thú) - Thanh Vân Thôn Ngoại Vi
  // Chỉ số chuẩn: HP 100, DMG 1 (tương đương Phàm Nhân)
  { id: 'm_0_1', name: 'Tiểu Dã Trư', rank: 'Chưa Tu Luyện (Phàm Thú)', tier: 0, hp: 100, dmg: 1, exp: 0, silver: 80, gold: 0, ore: 1, spriteNum: 4 },
  { id: 'm_0_2', name: 'Tiểu Thanh Lang', rank: 'Chưa Tu Luyện (Phàm Thú)', tier: 0, hp: 100, dmg: 1, exp: 0, silver: 100, gold: 0, ore: 1, spriteNum: 5 },
  { id: 'm_0_3', name: 'Dã Thố Tinh', rank: 'Chưa Tu Luyện (Phàm Thú)', tier: 0, hp: 100, dmg: 1, exp: 0, silver: 60, gold: 0, ore: 1, spriteNum: 1 },
  { id: 'm_0_4', name: 'Dã Trư Đầu Đàn', rank: 'Chưa Tu Luyện (Phàm Thú Đầu Đàn)', tier: 0, hp: 200, dmg: 2, exp: 0, silver: 250, gold: 0, ore: 2, spriteNum: 4 },

  // Cấp độ Nhất Phẩm Yêu Thú - Vạn Mộc Sâm Lâm (Tương đương Luyện Khí Kỳ)
  { id: 'm_1_1', name: 'Thanh Lang', rank: 'Nhất Phẩm Sơ Kỳ', tier: 1, hp: 350, dmg: 15, exp: 35, silver: 300, gold: 1, ore: 1, spriteNum: 5 },
  { id: 'm_1_2', name: 'Độc Giác Trư', rank: 'Nhất Phẩm Trung Kỳ', tier: 2, hp: 700, dmg: 30, exp: 70, silver: 600, gold: 2, ore: 2, spriteNum: 4 },
  { id: 'm_1_3', name: 'Huyết Tích Ma', rank: 'Nhất Phẩm Hậu Kỳ', tier: 3, hp: 1100, dmg: 50, exp: 120, silver: 1000, gold: 3, ore: 2, spriteNum: 9 },
  { id: 'm_1_4', name: 'Huyết Lang Vạn Mộc', rank: 'Nhất Phẩm Đỉnh Phong', tier: 4, hp: 1800, dmg: 75, exp: 250, silver: 2500, gold: 5, ore: 3, spriteNum: 7 },

  // Cấp độ Nhị Phẩm Yêu Thú (Tương đương Trúc Cơ Kỳ)
  { id: 'm_2_1', name: 'Thiết Giáp Tê Ngưu', rank: 'Nhị Phẩm Sơ Kỳ', tier: 5, hp: 2800, dmg: 140, exp: 500, silver: 4000, gold: 10, ore: 3, spriteNum: 12 },
  { id: 'm_2_2', name: 'Hỏa Dực Quỷ', rank: 'Nhị Phẩm Trung Kỳ', tier: 6, hp: 4200, dmg: 200, exp: 850, silver: 6000, gold: 15, ore: 4, spriteNum: 8, isRanged: true },
  { id: 'm_2_3', name: 'Thiết Giáp Kỵ Ma', rank: 'Nhị Phẩm Hậu Kỳ', tier: 7, hp: 6200, dmg: 280, exp: 1400, silver: 9000, gold: 25, ore: 4, spriteNum: 10 },
  { id: 'm_2_4', name: 'Hỏa Nham Cự Giải', rank: 'Nhị Phẩm Đỉnh Phong', tier: 8, hp: 9500, dmg: 400, exp: 2400, silver: 15000, gold: 40, ore: 5, spriteNum: 14 },

  // Cấp độ Tam Phẩm Yêu Thú (Tương đương Kim Đan Kỳ)
  { id: 'm_3_1', name: 'U Minh Mãng Xà', rank: 'Tam Phẩm Sơ Kỳ', tier: 9, hp: 14000, dmg: 560, exp: 4200, gold: 80, ore: 6, spriteNum: 13, isRanged: true },
  { id: 'm_3_2', name: 'Đường Lang Yêu', rank: 'Tam Phẩm Trung Kỳ', tier: 10, hp: 21000, dmg: 780, exp: 6800, gold: 120, ore: 7, spriteNum: 11 },
  { id: 'm_3_3', name: 'Lục Độc Chu', rank: 'Tam Phẩm Hậu Kỳ', tier: 11, hp: 30000, dmg: 1050, exp: 10500, gold: 180, ore: 8, spriteNum: 6, isRanged: true },
  { id: 'm_3_4', name: 'Độc Nhãn Vu Sư', rank: 'Tam Phẩm Đỉnh Phong', tier: 12, hp: 44000, dmg: 1500, exp: 18000, gold: 300, ore: 10, spriteNum: 15, isRanged: true },

  // Cấp độ Tứ Phẩm Yêu Thú (Tương đương Nguyên Anh Kỳ)
  { id: 'm_4_1', name: 'Khô Lâu Binh', rank: 'Tứ Phẩm Sơ Kỳ', tier: 13, hp: 62000, dmg: 2000, exp: 28000, gold: 500, ore: 12, spriteNum: 2 },
  { id: 'm_4_2', name: 'Khô Lâu Cung Thủ', rank: 'Tứ Phẩm Trung Kỳ', tier: 14, hp: 88000, dmg: 2700, exp: 44000, gold: 800, ore: 15, spriteNum: 3, isRanged: true },
  { id: 'm_4_3', name: 'Goblin Dao Tặc', rank: 'Tứ Phẩm Hậu Kỳ', tier: 15, hp: 125000, dmg: 3700, exp: 68000, gold: 1200, ore: 18, spriteNum: 1 },
  { id: 'm_4_4', name: 'Xích Diễm Phi Long', rank: 'Tứ Phẩm Đỉnh Phong', tier: 16, hp: 180000, dmg: 5000, exp: 110000, gold: 2000, ore: 22, spriteNum: 16, isRanged: true },

  // Cấp độ Ngũ Phẩm Yêu Thú (Tương đương Hóa Thần Kỳ)
  { id: 'm_5_1', name: 'Thái Cổ Chân Long', rank: 'Ngũ Phẩm Sơ Kỳ', tier: 17, hp: 260000, dmg: 6800, exp: 170000, gold: 3500, ore: 26, spriteNum: 16, isRanged: true },
  { id: 'm_5_2', name: 'Cửu Tiêu Ma Tôn', rank: 'Ngũ Phẩm Trung Kỳ', tier: 18, hp: 380000, dmg: 9000, exp: 250000, gold: 5500, ore: 32, spriteNum: 15, isRanged: true },
  { id: 'm_5_3', name: 'Hỗn Độn Cự Thú', rank: 'Ngũ Phẩm Hậu Kỳ', tier: 19, hp: 530000, dmg: 12000, exp: 380000, gold: 8500, ore: 40, spriteNum: 7 },
  { id: 'm_5_4', name: 'Chí Tôn Thần Ma Chi Chủ', rank: 'Ngũ Phẩm Đỉnh Phong', tier: 20, hp: 800000, dmg: 18000, exp: 600000, gold: 15000, ore: 50, spriteNum: 10 }
];
