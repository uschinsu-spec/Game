/**
 * ============================================================================
 * CULTIVATION ENGINE (HỆ THỐNG TU TIÊN TOÀN DIỆN CHO GAME 2D / 3D)
 * ============================================================================
 * Tệp tổng hợp độc lập (Standalone - Không phụ thuộc thư viện ngoài).
 * Chứa toàn bộ:
 *   1. 29 Cảnh Giới & Chỉ Số Nền (Realms & Base Stats)
 *   2. 8 Hệ Nguyên Tố & Công Pháp Tu Luyện (Elements & Manuals)
 *   3. 4 Bậc Thuần Thục & 45+ Thần Thông Kỹ Năng (Skill Mastery & Skills)
 *   4. Động Cơ Tính Toán Chỉ Số (Stat Calculation: HP, MP, Crit, AtkSpeed, DMG, DEF)
 *   5. Động Cơ Xử Lý Giao Tranh (Combat Resolution, Mitigation, Crowd Control)
 *   6. Hệ Thống Đột Phá, Tu Vi & Tĩnh Tọa (Breakthrough & Meditation)
 * ============================================================================
 */

// ============================================================================
// 1. DỮ LIỆU CẢNH GIỚI (29 BẬC: PHÀM NHÂN -> LUYỆN KHÍ -> HÓA THẦN ĐỈNH PHONG)
// ============================================================================
export const REALMS = [
  { id: 0,  name: 'Phàm Nhân',         major: 'Phàm Nhân', tier: 'Chưa Tu Luyện', expReq: 50,       hp: 100,         manaMax: 100,        spiritualSense: 10,   dmg: 1,       def: 0 },
  
  // Luyện Khí (12 Tầng)
  { id: 1,  name: 'Luyện Khí Tầng 1',  major: 'Luyện Khí', tier: 'Tầng 1',       expReq: 150,      hp: 300,         manaMax: 200,        spiritualSense: 20,   dmg: 25,      def: 8 },
  { id: 2,  name: 'Luyện Khí Tầng 2',  major: 'Luyện Khí', tier: 'Tầng 2',       expReq: 260,      hp: 400,         manaMax: 240,        spiritualSense: 23,   dmg: 32,      def: 10 },
  { id: 3,  name: 'Luyện Khí Tầng 3',  major: 'Luyện Khí', tier: 'Tầng 3',       expReq: 420,      hp: 520,         manaMax: 290,        spiritualSense: 27,   dmg: 40,      def: 13 },
  { id: 4,  name: 'Luyện Khí Tầng 4',  major: 'Luyện Khí', tier: 'Tầng 4',       expReq: 650,      hp: 680,         manaMax: 350,        spiritualSense: 32,   dmg: 50,      def: 17 },
  { id: 5,  name: 'Luyện Khí Tầng 5',  major: 'Luyện Khí', tier: 'Tầng 5',       expReq: 950,      hp: 880,         manaMax: 430,        spiritualSense: 38,   dmg: 62,      def: 22 },
  { id: 6,  name: 'Luyện Khí Tầng 6',  major: 'Luyện Khí', tier: 'Tầng 6',       expReq: 1350,     hp: 1150,        manaMax: 520,        spiritualSense: 45,   dmg: 76,      def: 28 },
  { id: 7,  name: 'Luyện Khí Tầng 7',  major: 'Luyện Khí', tier: 'Tầng 7',       expReq: 1900,     hp: 1480,        manaMax: 630,        spiritualSense: 53,   dmg: 92,      def: 35 },
  { id: 8,  name: 'Luyện Khí Tầng 8',  major: 'Luyện Khí', tier: 'Tầng 8',       expReq: 2600,     hp: 1900,        manaMax: 760,        spiritualSense: 62,   dmg: 112,     def: 43 },
  { id: 9,  name: 'Luyện Khí Tầng 9',  major: 'Luyện Khí', tier: 'Tầng 9',       expReq: 3500,     hp: 2400,        manaMax: 920,        spiritualSense: 72,   dmg: 136,     def: 53 },
  { id: 10, name: 'Luyện Khí Tầng 10', major: 'Luyện Khí', tier: 'Tầng 10',      expReq: 4700,     hp: 3000,        manaMax: 1100,       spiritualSense: 83,   dmg: 164,     def: 64 },
  { id: 11, name: 'Luyện Khí Tầng 11', major: 'Luyện Khí', tier: 'Tầng 11',      expReq: 6200,     hp: 3700,        manaMax: 1300,       spiritualSense: 95,   dmg: 195,     def: 76 },
  { id: 12, name: 'Luyện Khí Tầng 12', major: 'Luyện Khí', tier: 'Tầng 12',      expReq: 8000,     hp: 4500,        manaMax: 1550,       spiritualSense: 110,  dmg: 230,     def: 90, bottleneck: true, pillNeeded: 'Nhất Phẩm Cực Phẩm Trúc Cơ Đan' },

  // Trúc Cơ (Mở khóa cơ chế bay/phi hành)
  { id: 13, name: 'Trúc Cơ Sơ Kỳ',     major: 'Trúc Cơ',   tier: 'Sơ Kỳ',        expReq: 18000,    hp: 15000,       manaMax: 4000,       spiritualSense: 180,  dmg: 700,     def: 280, canFly: true },
  { id: 14, name: 'Trúc Cơ Trung Kỳ',   major: 'Trúc Cơ',   tier: 'Trung Kỳ',     expReq: 36000,    hp: 24000,       manaMax: 6000,       spiritualSense: 240,  dmg: 1000,    def: 400, canFly: true },
  { id: 15, name: 'Trúc Cơ Hậu Kỳ',     major: 'Trúc Cơ',   tier: 'Hậu Kỳ',       expReq: 65000,    hp: 38000,       manaMax: 9000,       spiritualSense: 320,  dmg: 1450,    def: 580, canFly: true },
  { id: 16, name: 'Trúc Cơ Đỉnh Phong', major: 'Trúc Cơ',   tier: 'Đỉnh Phong',   expReq: 110000,   hp: 60000,       manaMax: 14000,      spiritualSense: 420,  dmg: 2100,    def: 850, canFly: true, bottleneck: true, pillNeeded: 'Nhị Phẩm Cực Phẩm Ngưng Đan Đan' },

  // Kim Đan
  { id: 17, name: 'Kim Đan Sơ Kỳ',      major: 'Kim Đan',   tier: 'Sơ Kỳ',        expReq: 220000,   hp: 250000,      manaMax: 50000,      spiritualSense: 650,  dmg: 8000,    def: 3200, canFly: true },
  { id: 18, name: 'Kim Đan Trung Kỳ',   major: 'Kim Đan',   tier: 'Trung Kỳ',     expReq: 380000,   hp: 400000,      manaMax: 80000,      spiritualSense: 850,  dmg: 12000,   def: 4800, canFly: true },
  { id: 19, name: 'Kim Đan Hậu Kỳ',     major: 'Kim Đan',   tier: 'Hậu Kỳ',       expReq: 650000,   hp: 650000,      manaMax: 125000,     spiritualSense: 1100, dmg: 18000,   def: 7200, canFly: true },
  { id: 20, name: 'Kim Đan Đỉnh Phong', major: 'Kim Đan',   tier: 'Đỉnh Phong',   expReq: 1000000,  hp: 1000000,     manaMax: 200000,     spiritualSense: 1400, dmg: 27000,   def: 11000, canFly: true, bottleneck: true, pillNeeded: 'Tam Phẩm Cực Phẩm Hóa Anh Đan' },

  // Nguyên Anh
  { id: 21, name: 'Nguyên Anh Sơ Kỳ',    major: 'Nguyên Anh', tier: 'Sơ Kỳ',      expReq: 2200000,  hp: 5000000,     manaMax: 800000,     spiritualSense: 2000, dmg: 120000,  def: 48000, canFly: true },
  { id: 22, name: 'Nguyên Anh Trung Kỳ',  major: 'Nguyên Anh', tier: 'Trung Kỳ',   expReq: 3800000,  hp: 8000000,     manaMax: 1250000,    spiritualSense: 2600, dmg: 180000,  def: 72000, canFly: true },
  { id: 23, name: 'Nguyên Anh Hậu Kỳ',    major: 'Nguyên Anh', tier: 'Hậu Kỳ',     expReq: 6500000,  hp: 13000000,    manaMax: 2000000,    spiritualSense: 3300, dmg: 280000,  def: 110000, canFly: true },
  { id: 24, name: 'Nguyên Anh Đỉnh Phong',major: 'Nguyên Anh', tier: 'Đỉnh Phong', expReq: 10000000, hp: 20000000,    manaMax: 3200000,    spiritualSense: 4100, dmg: 420000,  def: 165000, canFly: true, bottleneck: true, pillNeeded: 'Tứ Phẩm Cực Phẩm Hóa Thần Đan' },

  // Hóa Thần
  { id: 25, name: 'Hóa Thần Sơ Kỳ',      major: 'Hóa Thần',   tier: 'Sơ Kỳ',      expReq: 22000000, hp: 120000000,   manaMax: 15000000,   spiritualSense: 5000, dmg: 2000000, def: 750000, canFly: true },
  { id: 26, name: 'Hóa Thần Trung Kỳ',    major: 'Hóa Thần',   tier: 'Trung Kỳ',   expReq: 38000000, hp: 200000000,   manaMax: 24000000,   spiritualSense: 5600, dmg: 3000000, def: 1100000, canFly: true },
  { id: 27, name: 'Hóa Thần Hậu Kỳ',      major: 'Hóa Thần',   tier: 'Hậu Kỳ',     expReq: 65000000, hp: 330000000,   manaMax: 38000000,   spiritualSense: 6200, dmg: 4600000, def: 1650000, canFly: true },
  { id: 28, name: 'Hóa Thần Đỉnh Phong',  major: 'Hóa Thần',   tier: 'Đỉnh Phong', expReq: 100000000,hp: 500000000,   manaMax: 60000000,   spiritualSense: 6800, dmg: 7000000, def: 2500000, canFly: true }
];

// ============================================================================
// 2. 8 HỆ NGUYÊN TỐ & CÔNG PHÁP TU LUYỆN
// ============================================================================
export const ELEMENTS = Object.freeze(['Vật Lý', 'Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ', 'Lôi', 'Phong']);

export const CONG_PHAP_GRADES = {
  'Hoàng Giai': { name: 'Hoàng Giai (Hạ Phẩm)',  maxStage: 'Trúc Cơ',   maxRealmIdx: 16, speed: 2 },
  'Huyền Giai': { name: 'Huyền Giai (Trung Phẩm)',maxStage: 'Kim Đan',   maxRealmIdx: 20, speed: 6 },
  'Địa Giai':   { name: 'Địa Giai (Thượng Phẩm)', maxStage: 'Nguyên Anh', maxRealmIdx: 24, speed: 15 },
  'Thiên Giai': { name: 'Thiên Giai (Cực Phẩm)',  maxStage: 'Hóa Thần',  maxRealmIdx: 28, speed: 35 }
};

export const CONG_PHAP_LIST = [
  { id: 'cp_dan_khi',     name: 'Dẫn Khí Quyết (Nhập Môn)', elem: 'Toàn Hệ', grade: 'Hoàng Giai', speed: 2, bonusHpPct: 5,  bonusDmgPct: 5,  desc: 'Bí kíp dẫn khí cơ bản nhất.' },
  { id: 'cp_kiem_hoang',  name: 'Thanh Nguyên Kiếm Quyết', elem: 'Kim',     grade: 'Hoàng Giai', speed: 3, bonusDmgPct: 10, bonusCritPct: 5, desc: 'Ngưng tụ thanh khí thành kiếm.' },
  { id: 'cp_hoa_hoang',   name: 'Liệt Diễm Chân Quyết',    elem: 'Hỏa',     grade: 'Hoàng Giai', speed: 3, bonusDmgPct: 15, bonusDefPct: 0, desc: 'Luyện hỏa khí tăng sát thương.' },
  { id: 'cp_thuy_hoang',  name: 'Hàn Băng Quyết',          elem: 'Thủy',    grade: 'Hoàng Giai', speed: 2, bonusHpPct: 10,  bonusDefPct: 10, desc: 'Chân khí băng hàn hộ thể.' },
  { id: 'cp_tho_hoang',   name: 'Hậu Thổ Công',            elem: 'Thổ',     grade: 'Hoàng Giai', speed: 2, bonusHpPct: 15,  bonusDefPct: 15, desc: 'Công pháp phòng thủ vững chãi.' },
  { id: 'cp_loi_huyen',   name: 'Thiên Lôi Chính Pháp',    elem: 'Lôi',     grade: 'Huyền Giai', speed: 6, bonusDmgPct: 25, bonusCritPct: 10,desc: 'Lôi đình vạn quân.' },
  { id: 'cp_kiem_dia',    name: 'Vạn Kiếm Quy Tông',       elem: 'Kim',     grade: 'Địa Giai',   speed: 15,bonusDmgPct: 40, bonusCritPct: 15,desc: 'Vạn kiếm tề phát, chém nát hư không.' },
  { id: 'cp_thien_giai',  name: 'Hỗn Độn Thôn Thiên Quyết',elem: 'Toàn Hệ', grade: 'Thiên Giai', speed: 35,bonusHpPct: 50,  bonusDmgPct: 50, desc: 'Thái cổ chí tôn công pháp.' }
];

// ============================================================================
// 3. BẬC THUẦN THỤC & DANH MỤC THẦN THÔNG KỸ NĂNG (45+ SKILLS)
// ============================================================================
export const SKILL_MASTERY_TIERS = [
  { idx: 0, name: 'Sơ Nhập',   expReq: 50,     dmgBonus: 0.00, vfxMul: 1.00, color: '#aaddff' },
  { idx: 1, name: 'Tiểu Thành', expReq: 180,    dmgBonus: 0.35, vfxMul: 1.15, color: '#55ff99' },
  { idx: 2, name: 'Đại Thành',  expReq: 450,    dmgBonus: 0.80, vfxMul: 1.35, color: '#ffd700' },
  { idx: 3, name: 'Viên Mãn',   expReq: 999999, dmgBonus: 1.50, vfxMul: 1.55, color: '#ff44dd' }
];

export const SKILLS = [
  // 0. Đòn đánh thường
  { id: 'basic_attack', elem: 'Vật Lý', tier: 0, minRealm: 0, name: 'Phổ Thông Công Kích', cd: 0, dmgMul: 1.0, type: 'melee', desc: 'Đòn đánh vật lý cơ bản.' },

  // 1. Hệ Kiếm / Kim
  { id: 'kiem_1', elem: 'Kim', tier: 1, minRealm: 1,  name: 'Ngự Kiếm Thuật',        cd: 2.0, dmgMul: 1.6, type: 'projectile', desc: 'Phóng phi kiếm tấn công mục tiêu từ xa.' },
  { id: 'kiem_2', elem: 'Kim', tier: 2, minRealm: 13, name: 'Thanh Phong Kiếm Khí',  cd: 3.5, dmgMul: 2.4, type: 'projectile', desc: 'Kiếm khí sắc bén xuyên phá kẻ địch.' },
  { id: 'kiem_3', elem: 'Kim', tier: 3, minRealm: 17, name: 'Vạn Kiếm Quy Tông',     cd: 6.0, dmgMul: 3.8, type: 'aoe',        radius: 180, desc: 'Triệu hồi vạn đạo kiếm quang quét sạch chiến trường.' },
  { id: 'kiem_4', elem: 'Kim', tier: 4, minRealm: 21, name: 'Thiên Kiếm Trảm Ma',    cd: 8.5, dmgMul: 5.6, type: 'aoe',        radius: 220, desc: 'Cự kiếm khổng lồ từ trời chém xuống.' },
  { id: 'kiem_5', elem: 'Kim', tier: 5, minRealm: 25, name: 'Tru Tiên Kiếm Trận',    cd: 12.0,dmgMul: 8.5, type: 'aoe',        radius: 280, desc: 'Trận kiếm tuyệt thế trảm diệt sinh linh.' },

  // 2. Hệ Hỏa
  { id: 'hoa_1', elem: 'Hỏa', tier: 1, minRealm: 1,  name: 'Hỏa Cầu Thuật',         cd: 2.0, dmgMul: 1.8, type: 'projectile', desc: 'Quả cầu lửa nổ tung gây thiêu đốt.' },
  { id: 'hoa_2', elem: 'Hỏa', tier: 2, minRealm: 13, name: 'Liệt Diễm Xung Thiên',  cd: 3.8, dmgMul: 2.6, type: 'aoe',        radius: 150, desc: 'Cột lửa bùng nổ hất tung mục tiêu.' },
  { id: 'hoa_3', elem: 'Hỏa', tier: 3, minRealm: 17, name: 'Viêm Long Xuất Thế',    cd: 6.5, dmgMul: 4.2, type: 'projectile', homing: true, desc: 'Hỏa long gầm thét đuổi theo địch thủ.' },
  { id: 'hoa_4', elem: 'Hỏa', tier: 4, minRealm: 21, name: 'Bát Hoang Hỏa Diễm',    cd: 9.0, dmgMul: 6.0, type: 'aoe',        radius: 240, desc: 'Biển lửa Bát Hoang thiêu rụi vạn vật.' },
  { id: 'hoa_5', elem: 'Hỏa', tier: 5, minRealm: 25, name: 'Tam Muội Chân Hỏa',     cd: 12.0,dmgMul: 9.0, type: 'aoe',        radius: 300, desc: 'Thần hỏa bất diệt, không gì không cháy.' },

  // 3. Hệ Thủy / Băng
  { id: 'thuy_1', elem: 'Thủy', tier: 1, minRealm: 1,  name: 'Băng Trùy Thuật',      cd: 2.2, dmgMul: 1.5, type: 'projectile', effect: 'slow', desc: 'Gai băng sắc nhọn làm chậm mục tiêu.' },
  { id: 'thuy_2', elem: 'Thủy', tier: 2, minRealm: 13, name: 'Băng Phách Thần Quang',cd: 4.0, dmgMul: 2.3, type: 'projectile', effect: 'stun', desc: 'Tia sáng cực hàn đóng băng mục tiêu.' },
  { id: 'thuy_3', elem: 'Thủy', tier: 3, minRealm: 17, name: 'Băng Long Xuất Hải',   cd: 6.0, dmgMul: 3.9, type: 'aoe',        radius: 190, effect: 'slow', desc: 'Rồng băng gầm thét đóng băng diện rộng.' },
  { id: 'thuy_4', elem: 'Thủy', tier: 4, minRealm: 21, name: 'Hàn Cực Băng Diễm',    cd: 8.0, dmgMul: 5.5, type: 'aoe',        radius: 220, effect: 'stun', desc: 'Băng diễm cực hàn đóng băng sinh mệnh tức thời.' },
  { id: 'thuy_5', elem: 'Thủy', tier: 5, minRealm: 25, name: 'Thiên Địa Băng Phong', cd: 11.0,dmgMul: 8.2, type: 'aoe',        radius: 320, effect: 'stun', desc: 'Đóng băng vạn dặm không gian, tuyệt diệt sinh linh.' },

  // 4. Hệ Thổ
  { id: 'tho_1', elem: 'Thổ', tier: 1, minRealm: 1,  name: 'Địa Xung Ba',           cd: 2.5, dmgMul: 1.6, type: 'aoe',        radius: 120, effect: 'stun', desc: 'Sóng xung kích từ lòng đất làm choáng.' },
  { id: 'tho_2', elem: 'Thổ', tier: 2, minRealm: 13, name: 'Địa Nham Liệt Phách',   cd: 4.0, dmgMul: 2.5, type: 'projectile', desc: 'Đá tảng oanh kích nghiền nát kẻ địch.' },
  { id: 'tho_3', elem: 'Thổ', tier: 3, minRealm: 17, name: 'Địa Long Thôn Thiên',   cd: 6.2, dmgMul: 4.0, type: 'projectile', desc: 'Địa long trồi lên cắn nuốt mục tiêu.' },
  { id: 'tho_4', elem: 'Thổ', tier: 4, minRealm: 21, name: 'Thiên Băng Địa Liệt',   cd: 8.5, dmgMul: 5.8, type: 'aoe',        radius: 240, desc: 'Đất đá sụp đổ tạo sát thương chấn động cực lớn.' },
  { id: 'tho_5', elem: 'Thổ', tier: 5, minRealm: 25, name: 'Huyền Hoàng Bất Diệt',  cd: 12.0,dmgMul: 8.0, type: 'buff',       duration: 8, desc: 'Khí Huyền Hoàng bảo hộ bất tử, phản chấn sát thương.' },

  // 5. Hệ Mộc
  { id: 'moc_1', elem: 'Mộc', tier: 1, minRealm: 1,  name: 'Mộc Gai Thuật',         cd: 2.2, dmgMul: 1.5, type: 'aoe',        radius: 120, effect: 'slow', desc: 'Gai trói chân và đâm xuyên mục tiêu.' },
  { id: 'moc_2', elem: 'Mộc', tier: 2, minRealm: 13, name: 'Thanh Mộc Kiếm Khí',   cd: 3.5, dmgMul: 2.5, type: 'projectile', desc: 'Mộc kiếm sắc bén bắn liên tục.' },
  { id: 'moc_3', elem: 'Mộc', tier: 3, minRealm: 17, name: 'Vạn Độc Cổ Đằng',      cd: 5.8, dmgMul: 3.7, type: 'projectile', desc: 'Dây leo cổ thụ mang độc tố cắn nuốt chân nguyên.' },
  { id: 'moc_4', elem: 'Mộc', tier: 4, minRealm: 21, name: 'Thanh Mộc Thần Lôi',    cd: 8.0, dmgMul: 5.4, type: 'aoe',        radius: 200, healPct: 0.25, desc: 'Lôi điện mộc linh vừa sát thương vừa hút máu hồi phục.' },
  { id: 'moc_5', elem: 'Mộc', tier: 5, minRealm: 25, name: 'Vạn Vật Tái Sinh',      cd: 11.0,dmgMul: 7.8, type: 'heal',       healPct: 0.60, radius: 260, desc: 'Hồi phục 60% HP và bùng nổ sát thương diện rộng.' },

  // 6. Hệ Phong
  { id: 'phong_1', elem: 'Phong', tier: 1, minRealm: 1,  name: 'Phong Nhận Thuật',    cd: 1.8, dmgMul: 1.5, type: 'projectile', desc: 'Lưỡi dao gió sắc lẹm chém đứt không khí.' },
  { id: 'phong_2', elem: 'Phong', tier: 2, minRealm: 13, name: 'Cuồng Phong Liệt Trảm',cd: 3.2, dmgMul: 2.5, type: 'projectile', desc: 'Lưỡi dao gió cuồng phong xé toạc không gian.' },
  { id: 'phong_3', elem: 'Phong', tier: 3, minRealm: 17, name: 'Cuồng Phong Liệt Diệt',cd: 6.0, dmgMul: 3.9, type: 'aoe',        radius: 200, desc: 'Lốc xoáy cuồng phong cuốn phăng kẻ địch.' },
  { id: 'phong_4', elem: 'Phong', tier: 4, minRealm: 21, name: 'Cửu U Cực Phong',    cd: 7.8, dmgMul: 5.7, type: 'aoe',        radius: 240, desc: 'Gió âm cực hàn cắt nát kinh mạch kẻ địch.' },
  { id: 'phong_5', elem: 'Phong', tier: 5, minRealm: 25, name: 'Hỗn Độn Thần Phong', cd: 10.5,dmgMul: 8.6, type: 'aoe',        radius: 300, desc: 'Gió bão hỗn độn xé toạc vỡ nát không gian.' },

  // 7. Hệ Lôi
  { id: 'loi_1', elem: 'Lôi', tier: 1, minRealm: 1,  name: 'Dẫn Lôi Thuật',         cd: 2.2, dmgMul: 1.8, type: 'projectile', effect: 'stun', desc: 'Sét giáng xuống làm tê liệt đối phương.' },
  { id: 'loi_2', elem: 'Lôi', tier: 2, minRealm: 13, name: 'Thiên Cương Lôi Kích',  cd: 3.8, dmgMul: 2.7, type: 'projectile', desc: 'Chùm sét thiên cương oanh tạc liên hoàn.' },
  { id: 'loi_3', elem: 'Lôi', tier: 3, minRealm: 17, name: 'Tịch Tà Thần Lôi',      cd: 5.5, dmgMul: 4.5, type: 'aoe',        radius: 210, desc: 'Sấm sét vàng kim khắc chế ma đạo, sát thương cực lớn.' },
  { id: 'loi_4', elem: 'Lôi', tier: 4, minRealm: 21, name: 'Cửu Thiên Lôi Ngục',    cd: 8.0, dmgMul: 6.2, type: 'aoe',        radius: 260, effect: 'stun', desc: 'Lưới sét bao phủ chiến trường oanh tạc liên tục.' },
  { id: 'loi_5', elem: 'Lôi', tier: 5, minRealm: 25, name: 'Tử Tiêu Diệt Thế Lôi',  cd: 11.0,dmgMul: 9.2, type: 'aoe',        radius: 340, desc: 'Sấm sét tím tối thượng diệt thế diệt đạo.' },

  // 8. Hệ Vật Lý (Thể Tu / Võ Đạo)
  { id: 'ly_1', elem: 'Vật Lý', tier: 1, minRealm: 1,  name: 'Bá Vương Quyền',       cd: 1.8, dmgMul: 1.7, type: 'melee', desc: 'Quyền kình vũ bão nện nát đá, dễ bạo kích.' },
  { id: 'ly_2', elem: 'Vật Lý', tier: 2, minRealm: 13, name: 'Hám Thiên Phá Sơn Quyền',cd: 3.2, dmgMul: 2.6, type: 'melee', desc: 'Quyền kình phá sơn nện liên hoàn tạo chấn động cực mạnh.' },
  { id: 'ly_3', elem: 'Vật Lý', tier: 3, minRealm: 17, name: 'Kim Cang Phục Ma Quyền',cd: 5.2, dmgMul: 4.1, type: 'aoe',        radius: 160, desc: 'Đòn đấm kim cang tạo sóng xung kích cực mạnh.' },
  { id: 'ly_4', elem: 'Vật Lý', tier: 4, minRealm: 21, name: 'Bất Diệt Chân Thân',   cd: 8.5, dmgMul: 5.9, type: 'buff',       duration: 10, desc: 'Hóa thân khổng lồ, bùng nổ 100% bạo kích.' },
  { id: 'ly_5', elem: 'Vật Lý', tier: 5, minRealm: 25, name: 'Phạm Thánh Thần Ma Thể',cd: 11.5,dmgMul: 8.8, type: 'aoe',        radius: 280, desc: 'Thể tu chí tôn đao thương bất nhập, sát thương cực hạn.' }
];

// ============================================================================
// 4. ENGINE TÍNH TOÁN CHỈ SỐ & GIAO TRANH (STAT & COMBAT ENGINE)
// ============================================================================
export class CultivationEngine {
  /**
   * Tạo một nhân vật mới với dữ liệu khởi tạo chuẩn
   */
  static createCharacter(name = 'Đạo Hữu', options = {}) {
    return {
      name,
      realmIdx: options.realmIdx || 0,
      exp: options.exp || 0,
      spiritualSenseBonus: options.spiritualSenseBonus || 0,
      activeCongPhapId: options.activeCongPhapId || 'cp_dan_khi',
      congPhapMastery: options.congPhapMastery ?? 0.35, // 0.0 -> 1.0
      equippedGear: options.equippedGear || {}, // { hp: 0, dmg: 0, def: 0, critRate: 0, critDamage: 0, attackSpeed: 0, elementDamage: 0 }
      skillMastery: options.skillMastery || {}, // skillId -> tierIdx (0..3)
      isMeditating: false,
      hp: 100,
      mp: 100
    };
  }

  // --- CÁC HÀM TÍNH TOÁN CHỈ SỐ ---

  static getRealm(char) {
    const idx = Math.max(0, Math.min(REALMS.length - 1, Number(char.realmIdx) || 0));
    return REALMS[idx];
  }

  static getCongPhap(char) {
    return CONG_PHAP_LIST.find(cp => cp.id === char.activeCongPhapId) || CONG_PHAP_LIST[0];
  }

  static calcMaxHp(char) {
    const realm = this.getRealm(char);
    const gear = char.equippedGear || {};
    const cp = this.getCongPhap(char);
    let hp = realm.hp + (Number(gear.hp) || 0);
    if (gear.hpPct) hp *= (1 + Number(gear.hpPct) / 100);
    if (cp && cp.bonusHpPct) hp *= (1 + Number(cp.bonusHpPct) / 100);
    return Math.floor(hp);
  }

  static calcMaxMp(char) {
    const realm = this.getRealm(char);
    const gear = char.equippedGear || {};
    const cp = this.getCongPhap(char);
    let mp = realm.manaMax + (Number(gear.mp) || 0);
    if (gear.mpPct) mp *= (1 + Number(gear.mpPct) / 100);
    if (cp && cp.bonusMpPct) mp *= (1 + Number(cp.bonusMpPct) / 100);
    return Math.floor(mp);
  }

  static calcSpiritualSense(char) {
    const realm = this.getRealm(char);
    const gear = char.equippedGear || {};
    const baseSense = Math.max(1, Number(realm.spiritualSense) || 10);
    const cap = baseSense; // Cap bonus vĩnh viễn tối đa = 100% base
    const permBonus = Math.min(Math.max(0, Number(char.spiritualSenseBonus) || 0), cap);
    const gearSense = Math.floor(Number(gear.spiritualSense) || 0);
    return Math.max(1, baseSense + permBonus + gearSense);
  }

  /**
   * Tỷ lệ bạo kích (Crit Rate: 0.0 -> 0.75)
   */
  static calcCritRate(char) {
    const sense = this.calcSpiritualSense(char);
    const gear = char.equippedGear || {};
    // Diminishing returns: high realms continue to gain crit without hitting the cap at Trúc Cơ.
    const senseCrit = 0.12 + 0.42 * Math.log1p(Math.max(0, sense) / 20) / Math.log1p(6800 / 20);
    const gearCrit = (Number(gear.critRate) || 0) / 100;
    const cp = this.getCongPhap(char);
    return Math.max(0, Math.min(0.75, senseCrit + gearCrit + (Number(cp.bonusCritPct) || 0) / 100));
  }

  /**
   * Hệ số sát thương bạo kích (Crit Damage Multiplier)
   */
  static calcCritDamageMultiplier(char) {
    const gear = char.equippedGear || {};
    return 1.85 + (Number(gear.critDamage) || 0) / 100;
  }

  /**
   * Tốc độ ra đòn (Attack Interval ms): Đường cong Logarithm
   * 20 Thần thức = 650ms; 5700 Thần thức = 320ms; Cực hạn = 250ms
   */
  static calcAttackInterval(char) {
    const sense = Math.max(1, this.calcSpiritualSense(char));
    const BASE_SENSE = 20, PEAK_SENSE = 5700;
    const BASE_INT = 650, PEAK_INT = 320, MIN_INT = 250, MAX_INT = 800;

    let interval;
    if (sense <= BASE_SENSE) {
      interval = BASE_INT * (BASE_SENSE / sense);
    } else {
      const progress = Math.log(sense / BASE_SENSE) / Math.log(PEAK_SENSE / BASE_SENSE);
      interval = BASE_INT - (BASE_INT - PEAK_INT) * progress;
    }
    const bonus = Number(char.equippedGear?.attackSpeed) || 0;
    interval /= Math.max(0.2, 1 + bonus / 100);
    return Math.max(MIN_INT, Math.min(MAX_INT, Math.round(interval)));
  }

  /**
   * Sát thương Nguyên Tố theo hệ
   */
  static calcElementalDamage(char, elem = 'Vật Lý') {
    const realm = this.getRealm(char);
    const gear = char.equippedGear || {};
    const cp = this.getCongPhap(char);
    let baseDmg = realm.dmg + (Number(gear.dmg) || 0);
    if (gear.dmgPct) baseDmg *= (1 + Number(gear.dmgPct) / 100);

    // Nếu công pháp trùng hệ hoặc toàn hệ: nhận buff khuếch đại cực mạnh
    const cpElem = cp?.elem === 'Kiếm' ? 'Kim' : cp?.elem;
    const targetElem = elem === 'Kiếm' ? 'Kim' : elem;

    if (cp && (cpElem === targetElem || cpElem === 'Toàn Hệ')) {
      const mastery = Math.max(0, Math.min(1, Number(char.congPhapMastery) || 0.35));
      const masteryPct = 35 + Math.round(mastery * 145); // 35% -> 180%
      const cpBonusPct = Number(cp.bonusDmgPct) || 0;
      const gearElemPct = Number(gear.elementDamage) || 0;
      return Math.max(1, Math.floor(baseDmg * (1 + (masteryPct + cpBonusPct) / 100) * (1 + gearElemPct / 100)));
    }
    // Specialized manuals still contribute a modest martial foundation to off-element hits.
    const mastery = Math.max(0, Math.min(1, Number(char.congPhapMastery) || 0));
    return Math.max(1, Math.floor(baseDmg * (1 + (15 + mastery * 40) / 100)));
  }

  /**
   * Phòng ngự Nguyên Tố theo hệ
   */
  static calcElementalDefense(char, elem = 'Vật Lý') {
    const realm = this.getRealm(char);
    const gear = char.equippedGear || {};
    const cp = this.getCongPhap(char);
    let baseDef = realm.def + (Number(gear.def) || 0);
    if (gear.defPct) baseDef *= (1 + Number(gear.defPct) / 100);

    const cpElem = cp?.elem === 'Kiếm' ? 'Kim' : cp?.elem;
    const targetElem = elem === 'Kiếm' ? 'Kim' : elem;

    const mastery = Math.max(0, Math.min(1, Number(char.congPhapMastery) || 0));
    const globalDefense = 1 + (Number(cp?.bonusDefPct) || 0) / 100 + mastery * 0.35;
    const matching = cp && (cpElem === targetElem || cpElem === 'Toàn Hệ');
    const affinityDefense = matching ? 1 + 0.25 + mastery * 0.60 : 1;
    return Math.max(0, Math.floor(baseDef * globalDefense * affinityDefense));
  }

  // --- GIAO TRANH & SÁT THƯƠNG ---

  /** MP cost is a share of the actor's maximum MP, not a flat point at every realm. */
  static calcSkillMpCost(char, skill) {
    const tier = Math.max(0, Math.min(5, skill?.tier || 0));
    const shares = [0, 0.015, 0.025, 0.035, 0.05, 0.07];
    return tier ? Math.max(1, Math.ceil(this.calcMaxMp(char) * shares[tier])) : 0;
  }

  static calcMeditationRate(char) {
    const manual = this.getCongPhap(char);
    const realm = this.getRealm(char);
    const base = manual.speed * 3;
    const realmScaling = realm.expReq / (2400 + realm.id * 100) * Math.sqrt(manual.speed / 2);
    return Math.max(base, Math.ceil(realmScaling));
  }

  /**
   * Tính sát thương của một chiêu thức
   */
  static calcSkillDamage(char, skillId) {
    const skill = SKILLS.find(s => s.id === skillId) || SKILLS[0];
    const elemDmg = this.calcElementalDamage(char, skill.elem);
    const tierIdx = char.skillMastery?.[skillId] || 0;
    const masteryTier = SKILL_MASTERY_TIERS[tierIdx] || SKILL_MASTERY_TIERS[0];
    const damage = Math.max(1, Math.floor(elemDmg * (skill.dmgMul || 1.0) * (1 + masteryTier.dmgBonus)));
    return { skill, damage, masteryTier };
  }

  /**
   * Thực hiện đòn tấn công giữa Attacker và Defender
   */
  static resolveCombat(attacker, defender, skillId = 'basic_attack') {
    const { skill, damage: rawSkillDmg } = this.calcSkillDamage(attacker, skillId);
    
    // Kiểm tra Bạo Kích
    const critRate = this.calcCritRate(attacker);
    const isCrit = (attacker.buffTime>0&&attacker.buffId==='ly_4') || Math.random() < critRate;
    const critMul = isCrit ? this.calcCritDamageMultiplier(attacker) : 1.0;
    const finalRawDmg = Math.floor(rawSkillDmg * critMul);

    // Tính Phòng Ngự của Defender theo đúng Hệ của Skill
    const def = typeof defender.calcElementalDefense === 'function'
      ? defender.calcElementalDefense(skill.elem)
      : (defender.def || 0);

    // Công thức trừ thủ phẳng (luôn giữ tối thiểu 1 sát thương)
    const finalDamage = Math.max(1, finalRawDmg - def);

    // Report healing; the cast applies it once, regardless of targets hit.
    const healAmount = Math.floor(this.calcMaxHp(attacker) * (skill.healPct || 0));

    return {
      skill,
      rawDamage: finalRawDmg,
      targetDef: def,
      damage: finalDamage,
      isCrit,
      status: skill.effect || null, // 'stun' | 'slow'
      healAmount
    };
  }

  // --- TU VI, ĐỘT PHÁ & TĨNH TỌA ---

  /**
   * Tĩnh tọa hấp thụ tu vi mỗi giây (Meditation Tick)
   */
  static meditateTick(char, deltaSeconds = 1) {
    if (!char.isMeditating) return 0;
    const speed = this.calcMeditationRate(char); // Tu vi chỉ từ tĩnh tọa hoặc đan tu vi
    const expGain = Math.floor(speed * deltaSeconds);
    char.exp = (char.exp || 0) + expGain;
    return expGain;
  }

  /**
   * Thêm tu vi và kiểm tra điều kiện Đột Phá
   */
  static addExp(char, amount) {
    char.exp = (char.exp || 0) + Math.max(0, amount);
    const realm = this.getRealm(char);
    return {
      currentExp: char.exp,
      expReq: realm.expReq,
      canBreakthrough: char.exp >= realm.expReq
    };
  }

  /**
   * Đột phá Cảnh Giới
   */
  static breakthrough(char, providedPill = null) {
    const realm = this.getRealm(char);
    if (char.exp < realm.expReq) {
      return { success: false, reason: `Chưa đủ tu vi! Cần ${realm.expReq}, hiện có ${char.exp}.` };
    }
    if (realm.bottleneck) {
      if (providedPill !== realm.pillNeeded) {
        return { success: false, reason: `Gặp bình cảnh đại cảnh giới! Cần đan dược: [${realm.pillNeeded}].` };
      }
    }
    if (char.realmIdx >= REALMS.length - 1) {
      return { success: false, reason: 'Đã đạt đỉnh cao Hóa Thần Đỉnh Phong, không thể đột phá thêm!' };
    }

    // Đột phá thành công
    char.realmIdx += 1;
    char.exp -= realm.expReq;
    char.hp = this.calcMaxHp(char);
    char.mp = this.calcMaxMp(char);
    const newRealm = this.getRealm(char);
    return { success: true, newRealm, message: `Chúc mừng đạo hữu đột phá thành công lên [${newRealm.name}]!` };
  }
}

// ============================================================================
// VÍ DỤ SỬ DỤNG NHANH (QUICK DEMO & TEST)
// ============================================================================
/*
const player = CultivationEngine.createCharacter('Hàn Lập', { realmIdx: 1 });
const wolf = { name: 'Yêu Lang', def: 15, hp: 300 };

console.log('--- KHỞI TẠO ---');
console.log('Tên:', player.name, '| Cảnh giới:', CultivationEngine.getRealm(player).name);
console.log('Max HP:', CultivationEngine.calcMaxHp(player));
console.log('Tốc độ đánh:', CultivationEngine.calcAttackInterval(player), 'ms/đòn');

console.log('\n--- XUẤT CHIÊU KIẾM_1 (Ngự Kiếm Thuật) ---');
const hit = CultivationEngine.resolveCombat(player, wolf, 'kiem_1');
console.log(`Gây ${hit.damage} sát thương (Crit: ${hit.isCrit}) vào ${wolf.name}`);
*/
