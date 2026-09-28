// CẢNH GIỚI CHUẨN MỚI: PHÀM NHÂN -> LUYỆN KHÍ 1-12 -> TRÚC CƠ -> KIM ĐAN -> NGUYÊN ANH -> HÓA THẦN
// dmg = mốc Damage nền của HỆ ĐANG TU (hệ không tu = 0, do ElementalCombatProgression xử lý)
// def = DEF nền áp dụng cho 8 hệ; DEF hệ đang tu được tăng thêm theo công pháp/thuần thục.
export const REALMS = [
  { id: 0, name: 'Phàm Nhân (Chưa Tu Luyện)', major: 'Phàm Nhân', tier: 'Chưa Tu Luyện', expReq: 50, hp: 100, manaMax: 100, spiritualSense: 10, dmg: 5, def: 0 },

  // Luyện Khí 12 tầng
  { id: 1,  name: 'Luyện Khí Tầng 1',  major: 'Luyện Khí', tier: 'Tầng 1',  expReq: 150,  hp: 300,  manaMax: 200,  spiritualSense: 20,  dmg: 25,  def: 8 },
  { id: 2,  name: 'Luyện Khí Tầng 2',  major: 'Luyện Khí', tier: 'Tầng 2',  expReq: 260,  hp: 400,  manaMax: 240,  spiritualSense: 23,  dmg: 32,  def: 10 },
  { id: 3,  name: 'Luyện Khí Tầng 3',  major: 'Luyện Khí', tier: 'Tầng 3',  expReq: 420,  hp: 520,  manaMax: 290,  spiritualSense: 27,  dmg: 40,  def: 13 },
  { id: 4,  name: 'Luyện Khí Tầng 4',  major: 'Luyện Khí', tier: 'Tầng 4',  expReq: 650,  hp: 680,  manaMax: 350,  spiritualSense: 32,  dmg: 50,  def: 17 },
  { id: 5,  name: 'Luyện Khí Tầng 5',  major: 'Luyện Khí', tier: 'Tầng 5',  expReq: 950,  hp: 880,  manaMax: 430,  spiritualSense: 38,  dmg: 62,  def: 22 },
  { id: 6,  name: 'Luyện Khí Tầng 6',  major: 'Luyện Khí', tier: 'Tầng 6',  expReq: 1350, hp: 1150, manaMax: 520,  spiritualSense: 45,  dmg: 76,  def: 28 },
  { id: 7,  name: 'Luyện Khí Tầng 7',  major: 'Luyện Khí', tier: 'Tầng 7',  expReq: 1900, hp: 1480, manaMax: 630,  spiritualSense: 53,  dmg: 92,  def: 35 },
  { id: 8,  name: 'Luyện Khí Tầng 8',  major: 'Luyện Khí', tier: 'Tầng 8',  expReq: 2600, hp: 1900, manaMax: 760,  spiritualSense: 62,  dmg: 112, def: 43 },
  { id: 9,  name: 'Luyện Khí Tầng 9',  major: 'Luyện Khí', tier: 'Tầng 9',  expReq: 3500, hp: 2400, manaMax: 920,  spiritualSense: 72,  dmg: 136, def: 53 },
  { id: 10, name: 'Luyện Khí Tầng 10', major: 'Luyện Khí', tier: 'Tầng 10', expReq: 4700, hp: 3000, manaMax: 1100, spiritualSense: 83,  dmg: 164, def: 64 },
  { id: 11, name: 'Luyện Khí Tầng 11', major: 'Luyện Khí', tier: 'Tầng 11', expReq: 6200, hp: 3700, manaMax: 1300, spiritualSense: 95,  dmg: 195, def: 76 },
  { id: 12, name: 'Luyện Khí Tầng 12', major: 'Luyện Khí', tier: 'Tầng 12', expReq: 8000, hp: 4500, manaMax: 1550, spiritualSense: 110, dmg: 230, def: 90, bottleneck: true, pillNeeded: 'Nhất Phẩm Cực Phẩm Trúc Cơ Đan' },

  // Trúc Cơ
  { id: 13, name: 'Trúc Cơ Sơ Kỳ',       major: 'Trúc Cơ', tier: 'Sơ Kỳ',    expReq: 18000,  hp: 15000, manaMax: 4000,  spiritualSense: 180, dmg: 700,  def: 280 },
  { id: 14, name: 'Trúc Cơ Trung Kỳ',     major: 'Trúc Cơ', tier: 'Trung Kỳ',  expReq: 36000,  hp: 24000, manaMax: 6000,  spiritualSense: 240, dmg: 1000, def: 400 },
  { id: 15, name: 'Trúc Cơ Hậu Kỳ',       major: 'Trúc Cơ', tier: 'Hậu Kỳ',    expReq: 65000,  hp: 38000, manaMax: 9000,  spiritualSense: 320, dmg: 1450, def: 580 },
  { id: 16, name: 'Trúc Cơ Đỉnh Phong',   major: 'Trúc Cơ', tier: 'Đỉnh Phong', expReq: 110000, hp: 60000, manaMax: 14000, spiritualSense: 420, dmg: 2100, def: 850, bottleneck: true, pillNeeded: 'Nhị Phẩm Cực Phẩm Ngưng Đan Đan' },

  // Kim Đan
  { id: 17, name: 'Kim Đan Sơ Kỳ',        major: 'Kim Đan', tier: 'Sơ Kỳ',    expReq: 220000,  hp: 250000,  manaMax: 50000,  spiritualSense: 650,  dmg: 8000,  def: 3200 },
  { id: 18, name: 'Kim Đan Trung Kỳ',      major: 'Kim Đan', tier: 'Trung Kỳ',  expReq: 380000,  hp: 400000,  manaMax: 80000,  spiritualSense: 850,  dmg: 12000, def: 4800 },
  { id: 19, name: 'Kim Đan Hậu Kỳ',        major: 'Kim Đan', tier: 'Hậu Kỳ',    expReq: 650000,  hp: 650000,  manaMax: 125000, spiritualSense: 1100, dmg: 18000, def: 7200 },
  { id: 20, name: 'Kim Đan Đỉnh Phong',    major: 'Kim Đan', tier: 'Đỉnh Phong', expReq: 1000000, hp: 1000000, manaMax: 200000, spiritualSense: 1400, dmg: 27000, def: 11000, bottleneck: true, pillNeeded: 'Tam Phẩm Cực Phẩm Hóa Anh Đan' },

  // Nguyên Anh
  { id: 21, name: 'Nguyên Anh Sơ Kỳ',      major: 'Nguyên Anh', tier: 'Sơ Kỳ',    expReq: 2200000, hp: 5000000,  manaMax: 800000,  spiritualSense: 2000, dmg: 120000, def: 48000 },
  { id: 22, name: 'Nguyên Anh Trung Kỳ',    major: 'Nguyên Anh', tier: 'Trung Kỳ',  expReq: 3800000, hp: 8000000,  manaMax: 1250000, spiritualSense: 2600, dmg: 180000, def: 72000 },
  { id: 23, name: 'Nguyên Anh Hậu Kỳ',      major: 'Nguyên Anh', tier: 'Hậu Kỳ',    expReq: 6500000, hp: 13000000, manaMax: 2000000, spiritualSense: 3300, dmg: 280000, def: 110000 },
  { id: 24, name: 'Nguyên Anh Đỉnh Phong',  major: 'Nguyên Anh', tier: 'Đỉnh Phong', expReq: 10000000, hp: 20000000, manaMax: 3200000, spiritualSense: 4100, dmg: 420000, def: 165000, bottleneck: true, pillNeeded: 'Tứ Phẩm Cực Phẩm Hóa Thần Đan' },

  // Hóa Thần
  { id: 25, name: 'Hóa Thần Sơ Kỳ',        major: 'Hóa Thần', tier: 'Sơ Kỳ',    expReq: 22000000, hp: 120000000, manaMax: 15000000, spiritualSense: 5000, dmg: 2000000, def: 750000 },
  { id: 26, name: 'Hóa Thần Trung Kỳ',      major: 'Hóa Thần', tier: 'Trung Kỳ',  expReq: 38000000, hp: 200000000, manaMax: 24000000, spiritualSense: 5600, dmg: 3000000, def: 1100000 },
  { id: 27, name: 'Hóa Thần Hậu Kỳ',        major: 'Hóa Thần', tier: 'Hậu Kỳ',    expReq: 65000000, hp: 330000000, manaMax: 38000000, spiritualSense: 6200, dmg: 4600000, def: 1650000 },
  { id: 28, name: 'Hóa Thần Đỉnh Phong',    major: 'Hóa Thần', tier: 'Đỉnh Phong', expReq: 100000000, hp: 500000000, manaMax: 60000000, spiritualSense: 6800, dmg: 7000000, def: 2500000 }
];

export const REALM_START_INDEX = Object.freeze({
  'Phàm Nhân': 0,
  'Luyện Khí': 1,
  'Trúc Cơ': 13,
  'Kim Đan': 17,
  'Nguyên Anh': 21,
  'Hóa Thần': 25
});

export const REALM_PEAK_INDEX = Object.freeze({
  'Phàm Nhân': 0,
  'Luyện Khí': 12,
  'Trúc Cơ': 16,
  'Kim Đan': 20,
  'Nguyên Anh': 24,
  'Hóa Thần': 28
});
