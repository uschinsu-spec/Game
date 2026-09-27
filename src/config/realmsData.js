// CẢNH GIỚI: 21 TẦNG TỪ PHÀM NHÂN (CHƯA TU LUYỆN) ĐẾN HÓA THẦN ĐỈNH PHONG
// Mỗi cấp cảnh giới gia tăng toàn diện: Khí Huyết (HP), Pháp Lực (MP), Thần Thức (Tốc Đánh), Sát Thương (Công) và Hộ Thể (Giáp Toàn Hệ)
export const REALMS = [
  // Cảnh giới Khởi Đầu - Phàm Nhân (Chưa Tu Luyện)
  { id: 0, name: 'Phàm Nhân (Chưa Tu Luyện)', major: 'Phàm Nhân', tier: 'Chưa Tu Luyện', expReq: 50, hp: 100, manaMax: 100, spiritualSense: 10, dmg: 1, def: 0 },

  // Nhất Giai - Luyện Khí Kỳ (Tương ứng Yêu Thú Nhất Phẩm)
  { id: 1, name: 'Luyện Khí Sơ Kỳ', major: 'Luyện Khí', tier: 'Sơ Kỳ', expReq: 150, hp: 300, manaMax: 200, spiritualSense: 20, dmg: 25, def: 8 },
  { id: 2, name: 'Luyện Khí Trung Kỳ', major: 'Luyện Khí', tier: 'Trung Kỳ', expReq: 400, hp: 600, manaMax: 300, spiritualSense: 30, dmg: 50, def: 16 },
  { id: 3, name: 'Luyện Khí Hậu Kỳ', major: 'Luyện Khí', tier: 'Hậu Kỳ', expReq: 900, hp: 1000, manaMax: 400, spiritualSense: 40, dmg: 80, def: 28 },
  { id: 4, name: 'Luyện Khí Đỉnh Phong', major: 'Luyện Khí', tier: 'Đỉnh Phong', expReq: 2000, hp: 1500, manaMax: 500, spiritualSense: 50, dmg: 120, def: 45, bottleneck: true, pillNeeded: 'Nhất Phẩm Cực Phẩm Trúc Cơ Đan' },

  // Nhị Giai - Trúc Cơ Kỳ (Tương ứng Yêu Thú Nhị Phẩm)
  { id: 5, name: 'Trúc Cơ Sơ Kỳ', major: 'Trúc Cơ', tier: 'Sơ Kỳ', expReq: 4500, hp: 2500, manaMax: 800, spiritualSense: 70, dmg: 180, def: 75 },
  { id: 6, name: 'Trúc Cơ Trung Kỳ', major: 'Trúc Cơ', tier: 'Trung Kỳ', expReq: 9000, hp: 3800, manaMax: 1100, spiritualSense: 90, dmg: 260, def: 110 },
  { id: 7, name: 'Trúc Cơ Hậu Kỳ', major: 'Trúc Cơ', tier: 'Hậu Kỳ', expReq: 16000, hp: 5500, manaMax: 1500, spiritualSense: 115, dmg: 360, def: 160 },
  { id: 8, name: 'Trúc Cơ Đỉnh Phong', major: 'Trúc Cơ', tier: 'Đỉnh Phong', expReq: 28000, hp: 8000, manaMax: 2000, spiritualSense: 140, dmg: 500, def: 230, bottleneck: true, pillNeeded: 'Nhị Phẩm Cực Phẩm Ngưng Đan Đan' },

  // Tam Giai - Kim Đan Kỳ (Tương ứng Yêu Thú Tam Phẩm)
  { id: 9, name: 'Kim Đan Sơ Kỳ', major: 'Kim Đan', tier: 'Sơ Kỳ', expReq: 48000, hp: 12000, manaMax: 3000, spiritualSense: 180, dmg: 700, def: 320 },
  { id: 10, name: 'Kim Đan Trung Kỳ', major: 'Kim Đan', tier: 'Trung Kỳ', expReq: 85000, hp: 18000, manaMax: 4000, spiritualSense: 220, dmg: 980, def: 440 },
  { id: 11, name: 'Kim Đan Hậu Kỳ', major: 'Kim Đan', tier: 'Hậu Kỳ', expReq: 140000, hp: 26000, manaMax: 5200, spiritualSense: 270, dmg: 1350, def: 600 },
  { id: 12, name: 'Kim Đan Đỉnh Phong', major: 'Kim Đan', tier: 'Đỉnh Phong', expReq: 220000, hp: 38000, manaMax: 6500, spiritualSense: 320, dmg: 1850, def: 800, bottleneck: true, pillNeeded: 'Tam Phẩm Cực Phẩm Hóa Anh Đan' },

  // Tứ Giai - Nguyên Anh Kỳ (Tương ứng Yêu Thú Tứ Phẩm)
  { id: 13, name: 'Nguyên Anh Sơ Kỳ', major: 'Nguyên Anh', tier: 'Sơ Kỳ', expReq: 350000, hp: 55000, manaMax: 10000, spiritualSense: 400, dmg: 2500, def: 1100 },
  { id: 14, name: 'Nguyên Anh Trung Kỳ', major: 'Nguyên Anh', tier: 'Trung Kỳ', expReq: 560000, hp: 80000, manaMax: 14000, spiritualSense: 500, dmg: 3400, def: 1500 },
  { id: 15, name: 'Nguyên Anh Hậu Kỳ', major: 'Nguyên Anh', tier: 'Hậu Kỳ', expReq: 900000, hp: 115000, manaMax: 19000, spiritualSense: 620, dmg: 4600, def: 2000 },
  { id: 16, name: 'Nguyên Anh Đỉnh Phong', major: 'Nguyên Anh', tier: 'Đỉnh Phong', expReq: 1450000, hp: 160000, manaMax: 25000, spiritualSense: 750, dmg: 6200, def: 2700, bottleneck: true, pillNeeded: 'Tứ Phẩm Cực Phẩm Hóa Thần Đan' },

  // Ngũ Giai - Hóa Thần Kỳ (Tương ứng Yêu Thú Ngũ Phẩm)
  { id: 17, name: 'Hóa Thần Sơ Kỳ', major: 'Hóa Thần', tier: 'Sơ Kỳ', expReq: 2200000, hp: 230000, manaMax: 40000, spiritualSense: 900, dmg: 8200, def: 3600 },
  { id: 18, name: 'Hóa Thần Trung Kỳ', major: 'Hóa Thần', tier: 'Trung Kỳ', expReq: 3500000, hp: 330000, manaMax: 55000, spiritualSense: 1150, dmg: 11000, def: 4800 },
  { id: 19, name: 'Hóa Thần Hậu Kỳ', major: 'Hóa Thần', tier: 'Hậu Kỳ', expReq: 5600000, hp: 460000, manaMax: 75000, spiritualSense: 1450, dmg: 15000, def: 6400 },
  { id: 20, name: 'Hóa Thần Đỉnh Phong', major: 'Hóa Thần', tier: 'Đỉnh Phong', expReq: 10000000, hp: 650000, manaMax: 100000, spiritualSense: 1800, dmg: 21000, def: 8800 }
];
