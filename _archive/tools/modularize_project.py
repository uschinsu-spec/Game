import os

# 1. Tạo các thư mục cần thiết
folders = [
    'H:/GOOGLE DRIVER/GAME/src/config',
    'H:/GOOGLE DRIVER/GAME/src/state',
    'H:/GOOGLE DRIVER/GAME/src/ui',
    'H:/GOOGLE DRIVER/GAME/src/scenes'
]

for f in folders:
    os.makedirs(f, exist_ok=True)

# -------------------------------------------------------------
# 1. CONFIG: realmsData.js
# -------------------------------------------------------------
realmsData = """// CẢNH GIỚI: 20 TẦNG TỪ LUYỆN KHÍ ĐẾN HÓA THẦN (SƠ/TRUNG/HẬU/ĐỈNH)
export const REALMS = [
  // Nhất Giai - Luyện Khí Kỳ
  { id: 0, name: 'Luyện Khí Sơ Kỳ', major: 'Luyện Khí', tier: 'Sơ Kỳ', expReq: 120, hp: 200, dmg: 22, def: 6 },
  { id: 1, name: 'Luyện Khí Trung Kỳ', major: 'Luyện Khí', tier: 'Trung Kỳ', expReq: 350, hp: 320, dmg: 35, def: 10 },
  { id: 2, name: 'Luyện Khí Hậu Kỳ', major: 'Luyện Khí', tier: 'Hậu Kỳ', expReq: 800, hp: 500, dmg: 52, def: 18 },
  { id: 3, name: 'Luyện Khí Đỉnh Phong', major: 'Luyện Khí', tier: 'Đỉnh Phong', expReq: 1800, hp: 750, dmg: 75, def: 28, bottleneck: true, pillNeeded: 'Nhất Phẩm Cực Phẩm Trúc Cơ Đan' },

  // Nhị Giai - Trúc Cơ Kỳ
  { id: 4, name: 'Trúc Cơ Sơ Kỳ', major: 'Trúc Cơ', tier: 'Sơ Kỳ', expReq: 4000, hp: 1300, dmg: 120, def: 50 },
  { id: 5, name: 'Trúc Cơ Trung Kỳ', major: 'Trúc Cơ', tier: 'Trung Kỳ', expReq: 8000, hp: 2000, dmg: 175, def: 75 },
  { id: 6, name: 'Trúc Cơ Hậu Kỳ', major: 'Trúc Cơ', tier: 'Hậu Kỳ', expReq: 14000, hp: 3000, dmg: 250, def: 110 },
  { id: 7, name: 'Trúc Cơ Đỉnh Phong', major: 'Trúc Cơ', tier: 'Đỉnh Phong', expReq: 24000, hp: 4400, dmg: 340, def: 155, bottleneck: true, pillNeeded: 'Nhị Phẩm Cực Phẩm Ngưng Đan Đan' },

  // Tam Giai - Kim Đan Kỳ
  { id: 8, name: 'Kim Đan Sơ Kỳ', major: 'Kim Đan', tier: 'Sơ Kỳ', expReq: 42000, hp: 6500, dmg: 480, def: 220 },
  { id: 9, name: 'Kim Đan Trung Kỳ', major: 'Kim Đan', tier: 'Trung Kỳ', expReq: 72000, hp: 9500, dmg: 660, def: 300 },
  { id: 10, name: 'Kim Đan Hậu Kỳ', major: 'Kim Đan', tier: 'Hậu Kỳ', expReq: 115000, hp: 14000, dmg: 900, def: 410 },
  { id: 11, name: 'Kim Đan Đỉnh Phong', major: 'Kim Đan', tier: 'Đỉnh Phong', expReq: 180000, hp: 20000, dmg: 1250, def: 550, bottleneck: true, pillNeeded: 'Tam Phẩm Cực Phẩm Hóa Anh Đan' },

  // Tứ Giai - Nguyên Anh Kỳ
  { id: 12, name: 'Nguyên Anh Sơ Kỳ', major: 'Nguyên Anh', tier: 'Sơ Kỳ', expReq: 280000, hp: 30000, dmg: 1750, def: 780 },
  { id: 13, name: 'Nguyên Anh Trung Kỳ', major: 'Nguyên Anh', tier: 'Trung Kỳ', expReq: 450000, hp: 44000, dmg: 2400, def: 1080 },
  { id: 14, name: 'Nguyên Anh Hậu Kỳ', major: 'Nguyên Anh', tier: 'Hậu Kỳ', expReq: 720000, hp: 62000, dmg: 3250, def: 1480 },
  { id: 15, name: 'Nguyên Anh Đỉnh Phong', major: 'Nguyên Anh', tier: 'Đỉnh Phong', expReq: 1150000, hp: 88000, dmg: 4300, def: 1980, bottleneck: true, pillNeeded: 'Tứ Phẩm Cực Phẩm Hóa Thần Đan' },

  // Ngũ Giai - Hóa Thần Kỳ
  { id: 16, name: 'Hóa Thần Sơ Kỳ', major: 'Hóa Thần', tier: 'Sơ Kỳ', expReq: 1800000, hp: 130000, dmg: 5800, def: 2700 },
  { id: 17, name: 'Hóa Thần Trung Kỳ', major: 'Hóa Thần', tier: 'Trung Kỳ', expReq: 2800000, hp: 190000, dmg: 7800, def: 3600 },
  { id: 18, name: 'Hóa Thần Hậu Kỳ', major: 'Hóa Thần', tier: 'Hậu Kỳ', expReq: 4500000, hp: 270000, dmg: 10500, def: 4800 },
  { id: 19, name: 'Hóa Thần Đỉnh Phong', major: 'Hóa Thần', tier: 'Đỉnh Phong', expReq: 8000000, hp: 400000, dmg: 15000, def: 6800 }
];
"""
with open('H:/GOOGLE DRIVER/GAME/src/config/realmsData.js', 'w', encoding='utf-8') as f:
    f.write(realmsData)

# -------------------------------------------------------------
# 2. CONFIG: monstersData.js
# -------------------------------------------------------------
monstersData = """// YÊU THÚ 1 ĐẾN 5 PHẨM (SƠ, TRUNG, HẬU, ĐỈNH)
export const MONSTER_RANKS = [
  // Nhất Phẩm
  { id: 'm_1_1', name: 'Thanh Lang', rank: 'Nhất Phẩm Sơ Kỳ', hp: 180, dmg: 16, exp: 25, gold: 10, ore: 1, sprite: 'enemy_wolf' },
  { id: 'm_1_2', name: 'Băng Sương Dơi', rank: 'Nhất Phẩm Trung Kỳ', hp: 320, dmg: 28, exp: 55, gold: 22, ore: 1, sprite: 'enemy_bat' },
  { id: 'm_1_3', name: 'Độc Giác Xà', rank: 'Nhất Phẩm Hậu Kỳ', hp: 550, dmg: 44, exp: 100, gold: 40, ore: 2, sprite: 'enemy_snake' },
  { id: 'm_1_4', name: 'Xích Hỏa Hầu', rank: 'Nhất Phẩm Đỉnh Phong', hp: 850, dmg: 68, exp: 180, gold: 75, ore: 2, isBoss: true, sprite: 'enemy_monkey' },

  // Nhị Phẩm
  { id: 'm_2_1', name: 'Thiết Giáp Ngưu', rank: 'Nhị Phẩm Sơ Kỳ', hp: 1500, dmg: 110, exp: 350, gold: 130, ore: 3, sprite: 'enemy_bull' },
  { id: 'm_2_2', name: 'Băng Lôi Dơi', rank: 'Nhị Phẩm Trung Kỳ', hp: 2400, dmg: 160, exp: 620, gold: 220, ore: 3, sprite: 'enemy_bat' },
  { id: 'm_2_3', name: 'Thổ Địa Long', rank: 'Nhị Phẩm Hậu Kỳ', hp: 3600, dmg: 230, exp: 1050, gold: 360, ore: 4, sprite: 'enemy_dragon' },
  { id: 'm_2_4', name: 'Kim Giác Thú Vương', rank: 'Nhị Phẩm Đỉnh Phong', hp: 5200, dmg: 320, exp: 1800, gold: 580, ore: 5, isBoss: true, sprite: 'enemy_bull' },

  // Tam Phẩm
  { id: 'm_3_1', name: 'U Minh Mãng Xà', rank: 'Tam Phẩm Sơ Kỳ', hp: 8000, dmg: 450, exp: 3200, gold: 950, ore: 6, sprite: 'enemy_snake' },
  { id: 'm_3_2', name: 'Huyết Dực Điêu', rank: 'Tam Phẩm Trung Kỳ', hp: 12000, dmg: 620, exp: 5200, gold: 1500, ore: 7, sprite: 'enemy_bat' },
  { id: 'm_3_3', name: 'Bát Trảo Cự Ma', rank: 'Tam Phẩm Hậu Kỳ', hp: 17500, dmg: 840, exp: 8500, gold: 2300, ore: 8, sprite: 'enemy_octopus' },
  { id: 'm_3_4', name: 'Thái Cổ Cự Hầu Tôn', rank: 'Tam Phẩm Đỉnh Phong', hp: 25000, dmg: 1180, exp: 13500, gold: 3600, ore: 10, isBoss: true, sprite: 'enemy_monkey' },

  // Tứ Phẩm
  { id: 'm_4_1', name: 'Hắc Thủy Huyền Long', rank: 'Tứ Phẩm Sơ Kỳ', hp: 38000, dmg: 1650, exp: 22000, gold: 5500, ore: 12, sprite: 'enemy_dragon' },
  { id: 'm_4_2', name: 'Cửu U Quỷ Vương', rank: 'Tứ Phẩm Trung Kỳ', hp: 55000, dmg: 2250, exp: 34000, gold: 8200, ore: 15, sprite: 'enemy_octopus' },
  { id: 'm_4_3', name: 'Kim Sí Ma Bằng', rank: 'Tứ Phẩm Hậu Kỳ', hp: 78000, dmg: 3050, exp: 52000, gold: 12500, ore: 18, sprite: 'enemy_bat' },
  { id: 'm_4_4', name: 'Hóa Hình Yêu Hoàng', rank: 'Tứ Phẩm Đỉnh Phong', hp: 110000, dmg: 4100, exp: 80000, gold: 18000, ore: 22, isBoss: true, sprite: 'enemy_boss' },

  // Ngũ Phẩm
  { id: 'm_5_1', name: 'Thái Cổ Chân Long', rank: 'Ngũ Phẩm Sơ Kỳ', hp: 160000, dmg: 5500, exp: 125000, gold: 28000, ore: 26, sprite: 'enemy_dragon' },
  { id: 'm_5_2', name: 'Cửu Tiêu Ma Tôn', rank: 'Ngũ Phẩm Trung Kỳ', hp: 240000, dmg: 7400, exp: 190000, gold: 42000, ore: 32, sprite: 'enemy_boss' },
  { id: 'm_5_3', name: 'Hỗn Độn Cự Thú', rank: 'Ngũ Phẩm Hậu Kỳ', hp: 350000, dmg: 9800, exp: 290000, gold: 65000, ore: 40, sprite: 'enemy_octopus' },
  { id: 'm_5_4', name: 'Chí Tôn Thần Ma Chi Chủ', rank: 'Ngũ Phẩm Đỉnh Phong', hp: 520000, dmg: 14000, exp: 450000, gold: 100000, ore: 50, isBoss: true, sprite: 'enemy_boss' }
];
"""
with open('H:/GOOGLE DRIVER/GAME/src/config/monstersData.js', 'w', encoding='utf-8') as f:
    f.write(monstersData)

# -------------------------------------------------------------
# 3. CONFIG: stagesData.js
# -------------------------------------------------------------
stagesData = """// 12 TIÊN VỰC & BÍ CẢNH
export const STAGES = [
  { id: 0, name: 'Thanh Vân Môn', sub: 'Nhất Phẩm Bí Cảnh', minRealm: 0, monsterIdxStart: 0, icon: 'stage_0' },
  { id: 1, name: 'Vạn Yêu Ngoại Vi', sub: 'Nhất Phẩm Thâm Xứ', minRealm: 2, monsterIdxStart: 2, icon: 'stage_1' },
  { id: 2, name: 'Huyền Băng Động', sub: 'Nhị Phẩm Sơ Cảnh', minRealm: 4, monsterIdxStart: 4, icon: 'stage_2' },
  { id: 3, name: 'Xích Diễm Ma Quật', sub: 'Nhị Phẩm Đỉnh Phong', minRealm: 6, monsterIdxStart: 6, icon: 'stage_3' },
  { id: 4, name: 'Thái Cổ Phế Tích', sub: 'Tam Phẩm Bí Cảnh', minRealm: 8, monsterIdxStart: 8, icon: 'stage_4' },
  { id: 5, name: 'Đông Hải Long Uyên', sub: 'Tam Phẩm Thâm Uyên', minRealm: 10, monsterIdxStart: 10, icon: 'stage_5' },
  { id: 6, name: 'U Minh Quỷ Vực', sub: 'Tứ Phẩm Ma Cảnh', minRealm: 12, monsterIdxStart: 12, icon: 'stage_6' },
  { id: 7, name: 'Côn Lôn Tiên Lạc', sub: 'Tứ Phẩm Tuyệt Cảnh', minRealm: 14, monsterIdxStart: 14, icon: 'stage_7' },
  { id: 8, name: 'Hư Không Liệt Phùng', sub: 'Ngũ Phẩm Sơ Giới', minRealm: 16, monsterIdxStart: 16, icon: 'stage_8' },
  { id: 9, name: 'Cửu Trọng Thiên Đạo', sub: 'Ngũ Phẩm Trung Giới', minRealm: 17, monsterIdxStart: 17, icon: 'stage_9' },
  { id: 10, name: 'Thần Ma Cổ Chiến', sub: 'Ngũ Phẩm Hậu Giới', minRealm: 18, monsterIdxStart: 18, icon: 'stage_10' },
  { id: 11, name: 'Hóa Thần Tiên Môn', sub: 'Ngũ Phẩm Đỉnh Phong', minRealm: 19, monsterIdxStart: 18, icon: 'stage_11' }
];
"""
with open('H:/GOOGLE DRIVER/GAME/src/config/stagesData.js', 'w', encoding='utf-8') as f:
    f.write(stagesData)

# -------------------------------------------------------------
# 4. CONFIG: skillsData.js
# -------------------------------------------------------------
skillsData = """// 8 ĐẠI HỆ NGUYÊN TỐ (40 THẦN THÔNG TU TIÊN)
export const ELEMENTAL_SKILLS = [
  // A. HỆ KIM
  { id: 'kim_1', elem: 'Kim', stage: 'Luyện Khí', minRealm: 0, name: 'Kim Nhận Thuật', cd: 2000, dmgMul: 1.6, icon: 'skill_0', desc: 'Phóng ra phi đao kim khí sắc bén xuyên mục tiêu.' },
  { id: 'kim_2', elem: 'Kim', stage: 'Trúc Cơ', minRealm: 4, name: 'Bạch Hổ Canh Kim Kiếm', cd: 3500, dmgMul: 2.4, icon: 'skill_0', desc: 'Kiếm khí Canh Kim xé gió, bỏ qua 30% phòng ngự.' },
  { id: 'kim_3', elem: 'Kim', stage: 'Kim Đan', minRealm: 8, name: 'Thập Nhị Thiên Kiếm Trận', cd: 6000, dmgMul: 3.8, isAoE: true, icon: 'skill_2', desc: '12 thanh kiếm xoay tròn tạo sát thương diện rộng.' },
  { id: 'kim_4', elem: 'Kim', stage: 'Nguyên Anh', minRealm: 12, name: 'Đại Canh Kiếm Khí', cd: 8000, dmgMul: 5.6, isAoE: true, icon: 'skill_6', desc: 'Vạn đạo kim kiếm quy tông chém nát yêu ma.' },
  { id: 'kim_5', elem: 'Kim', stage: 'Hóa Thần', minRealm: 16, name: 'Thái Canh Tru Tiên Trận', cd: 11000, dmgMul: 8.5, isAoE: true, icon: 'skill_6', desc: 'Tuyệt đỉnh kiếm trận kim linh hủy diệt thiên địa.' },

  // B. HỆ HỎA
  { id: 'hoa_1', elem: 'Hỏa', stage: 'Luyện Khí', minRealm: 0, name: 'Hỏa Cầu Thuật', cd: 2200, dmgMul: 1.7, icon: 'skill_3', desc: 'Bắn cầu lửa thiêu đốt mục tiêu liên tục.' },
  { id: 'hoa_2', elem: 'Hỏa', stage: 'Trúc Cơ', minRealm: 4, name: 'Liệt Diễm Phần Thiên', cd: 4000, dmgMul: 2.6, isAoE: true, icon: 'skill_3', desc: 'Biển lửa bùng cháy thiêu rụi đội hình địch.' },
  { id: 'hoa_3', elem: 'Hỏa', stage: 'Kim Đan', minRealm: 8, name: 'Tam Muội Chân Hỏa', cd: 5500, dmgMul: 4.2, icon: 'skill_3', desc: 'Ngọn lửa tam muội bất diệt thiêu hủy kinh mạch.' },
  { id: 'hoa_4', elem: 'Hỏa', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu Tiêu Thần Hỏa', cd: 8500, dmgMul: 6.0, isAoE: true, icon: 'skill_3', desc: 'Thần hỏa từ chín tầng trời giáng thế nổ diện rộng.' },
  { id: 'hoa_5', elem: 'Hỏa', stage: 'Hóa Thần', minRealm: 16, name: 'Hỗn Độn Nghiệp Hỏa', cd: 11500, dmgMul: 9.0, isAoE: true, icon: 'skill_3', desc: 'Nghiệp hỏa thiêu đốt cả thần hồn và thể xác.' },

  // C. HỆ THỦY
  { id: 'thuy_1', elem: 'Thủy', stage: 'Luyện Khí', minRealm: 0, name: 'Thủy Tiễn Thuật', cd: 2000, dmgMul: 1.5, icon: 'skill_4', desc: 'Ngưng tụ tên nước băng giá công kích đối phương.' },
  { id: 'thuy_2', elem: 'Thủy', stage: 'Trúc Cơ', minRealm: 4, name: 'Huyền Băng Đao Pháp', cd: 3800, dmgMul: 2.3, icon: 'skill_4', desc: 'Chém ra lưỡi đao hàn băng làm chậm mục tiêu.' },
  { id: 'thuy_3', elem: 'Thủy', stage: 'Kim Đan', minRealm: 8, name: 'Băng Long Xuất Hải', cd: 6000, dmgMul: 3.9, isAoE: true, icon: 'skill_4', desc: 'Rồng băng gầm thét đóng băng toàn bộ kẻ địch.' },
  { id: 'thuy_4', elem: 'Thủy', stage: 'Nguyên Anh', minRealm: 12, name: 'Hàn Cực Băng Diễm', cd: 8000, dmgMul: 5.5, isAoE: true, icon: 'skill_4', desc: 'Băng diễm cực hàn đóng băng sinh mệnh tức thời.' },
  { id: 'thuy_5', elem: 'Thủy', stage: 'Hóa Thần', minRealm: 16, name: 'Thiên Địa Băng Phong', cd: 11000, dmgMul: 8.2, isAoE: true, icon: 'skill_4', desc: 'Đóng băng vạn dặm không gian, tuyệt diệt sinh linh.' },

  // D. HỆ THỔ
  { id: 'tho_1', elem: 'Thổ', stage: 'Luyện Khí', minRealm: 0, name: 'Địa Xung Ba', cd: 2500, dmgMul: 1.6, icon: 'skill_8', desc: 'Sóng xung kích từ lòng đất làm choáng kẻ địch.' },
  { id: 'tho_2', elem: 'Thổ', stage: 'Trúc Cơ', minRealm: 4, name: 'Hộ Thể Thạch Giáp', cd: 7000, dmgMul: 1.2, shield: 1200, icon: 'skill_8', desc: 'Tạo giáp đá hộ thân giảm 40% sát thương.' },
  { id: 'tho_3', elem: 'Thổ', stage: 'Kim Đan', minRealm: 8, name: 'Địa Long Thôn Thiên', cd: 6200, dmgMul: 4.0, icon: 'skill_8', desc: 'Địa long trồi lên từ lòng đất cắn nuốt mục tiêu.' },
  { id: 'tho_4', elem: 'Thổ', stage: 'Nguyên Anh', minRealm: 12, name: 'Thiên Băng Địa Liệt', cd: 8500, dmgMul: 5.8, isAoE: true, icon: 'skill_8', desc: 'Đất đá sụp đổ tạo sát thương chấn động cực lớn.' },
  { id: 'tho_5', elem: 'Thổ', stage: 'Hóa Thần', minRealm: 16, name: 'Huyền Hoàng Bất Diệt', cd: 12000, dmgMul: 8.0, isAoE: true, icon: 'skill_8', desc: 'Khí Huyền Hoàng bảo hộ bất tử, phản chấn sát thương.' },

  // E. HỆ MỘC
  { id: 'moc_1', elem: 'Mộc', stage: 'Luyện Khí', minRealm: 0, name: 'Mộc Gai Thứ', cd: 2200, dmgMul: 1.5, icon: 'skill_7', desc: 'Gai nhọn từ mặt đất trói chân và đâm xuyên mục tiêu.' },
  { id: 'moc_2', elem: 'Mộc', stage: 'Trúc Cơ', minRealm: 4, name: 'Bách Thảo Hộ Nguyên', cd: 6500, dmgMul: 1.0, healPct: 0.3, icon: 'skill_7', desc: 'Hút linh khí thảo mộc hồi phục 30% HP tối đa.' },
  { id: 'moc_3', elem: 'Mộc', stage: 'Kim Đan', minRealm: 8, name: 'Vạn Độc Cổ Đằng', cd: 5800, dmgMul: 3.7, icon: 'skill_7', desc: 'Dây leo cổ thụ mang độc tố cắn nuốt chân nguyên.' },
  { id: 'moc_4', elem: 'Mộc', stage: 'Nguyên Anh', minRealm: 12, name: 'Thanh Mộc Thần Lôi', cd: 8000, dmgMul: 5.4, isAoE: true, icon: 'skill_7', desc: 'Lôi điện mộc linh vừa sát thương vừa hút máu hồi phục.' },
  { id: 'moc_5', elem: 'Mộc', stage: 'Hóa Thần', minRealm: 16, name: 'Vạn Vật Tái Sinh', cd: 11000, dmgMul: 7.8, healPct: 0.6, isAoE: true, icon: 'skill_7', desc: 'Tái sinh vạn vật, hồi phục 60% HP và bùng nổ sát thương.' },

  // F. HỆ PHONG
  { id: 'phong_1', elem: 'Phong', stage: 'Luyện Khí', minRealm: 0, name: 'Phong Nhẫn Thuật', cd: 1800, dmgMul: 1.5, icon: 'skill_5', desc: 'Lưỡi đao gió sắc lẹm chém đứt không khí.' },
  { id: 'phong_2', elem: 'Phong', stage: 'Trúc Cơ', minRealm: 4, name: 'Phong Lôi Ảo Ảnh', cd: 5000, dmgMul: 1.0, spdBuff: 0.8, icon: 'skill_5', desc: 'Thân pháp lướt gió tăng 80% tốc độ di chuyển và né đòn.' },
  { id: 'phong_3', elem: 'Phong', stage: 'Kim Đan', minRealm: 8, name: 'Cuồng Phong Liệt Diệt', cd: 6000, dmgMul: 3.9, isAoE: true, icon: 'skill_5', desc: 'Lốc xoáy cuồng phong cuốn phăng toàn bộ kẻ địch.' },
  { id: 'phong_4', elem: 'Phong', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu U Cực Phong', cd: 7800, dmgMul: 5.7, isAoE: true, icon: 'skill_5', desc: 'Gió âm cực hàn cắt nát kinh mạch kẻ địch.' },
  { id: 'phong_5', elem: 'Phong', stage: 'Hóa Thần', minRealm: 16, name: 'Hỗn Độn Thần Phong', cd: 10500, dmgMul: 8.6, isAoE: true, icon: 'skill_5', desc: 'Gió bão hỗn độn xé toạc vết nứt không gian.' },

  // G. HỆ LÔI
  { id: 'loi_1', elem: 'Lôi', stage: 'Luyện Khí', minRealm: 0, name: 'Dẫn Lôi Thuật', cd: 2200, dmgMul: 1.8, icon: 'skill_1', desc: 'Kêu gọi tia sét giáng xuống làm tê liệt đối phương.' },
  { id: 'loi_2', elem: 'Lôi', stage: 'Trúc Cơ', minRealm: 4, name: 'Thiên Cương Lôi Kích', cd: 3800, dmgMul: 2.7, icon: 'skill_1', desc: 'Chùm sét thiên cương oanh tạc thẳng vào mục tiêu.' },
  { id: 'loi_3', elem: 'Lôi', stage: 'Kim Đan', minRealm: 8, name: 'Tịch Tà Thần Lôi', cd: 5500, dmgMul: 4.5, isAoE: true, icon: 'skill_1', desc: 'Sấm sét vàng kim khắc chế ma đạo, sát thương cực lớn.' },
  { id: 'loi_4', elem: 'Lôi', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu Thiên Lôi Ngục', cd: 8000, dmgMul: 6.2, isAoE: true, icon: 'skill_1', desc: 'Lưới sét bao phủ chiến trường oanh tạc liên tục.' },
  { id: 'loi_5', elem: 'Lôi', stage: 'Hóa Thần', minRealm: 16, name: 'Tử Tiêu Diệt Thế Lôi', cd: 11000, dmgMul: 9.2, isAoE: true, icon: 'skill_1', desc: 'Sấm sét tím tối thượng diệt thế lục đạo.' },

  // H. HỆ VẬT LÝ (THỂ TU / VÕ ĐẠO)
  { id: 'ly_1', elem: 'Vật Lý', stage: 'Luyện Khí', minRealm: 0, name: 'Bá Vương Quyền', cd: 1800, dmgMul: 1.7, icon: 'skill_9', desc: 'Quyền kình vũ bão nện nứt đá, gây bạo kích.' },
  { id: 'ly_2', elem: 'Vật Lý', stage: 'Trúc Cơ', minRealm: 4, name: 'Thiết Bố Sam', cd: 6000, dmgMul: 1.0, icon: 'skill_8', desc: 'Da đồng xương sắt, giảm 50% sát thương nhận vào.' },
  { id: 'ly_3', elem: 'Vật Lý', stage: 'Kim Đan', minRealm: 8, name: 'Kim Cang Phục Ma Quyền', cd: 5200, dmgMul: 4.1, icon: 'skill_9', desc: 'Đòn đấm kim cang tạo sóng xung kích cực mạnh.' },
  { id: 'ly_4', elem: 'Vật Lý', stage: 'Nguyên Anh', minRealm: 12, name: 'Bất Diệt Chân Thân', cd: 8500, dmgMul: 5.9, isAoE: true, icon: 'skill_9', desc: 'Hóa thân khổng lồ, bùng nổ 100% bạo kích.' },
  { id: 'ly_5', elem: 'Vật Lý', stage: 'Hóa Thần', minRealm: 16, name: 'Phạm Thánh Thần Ma Thể', cd: 11500, dmgMul: 8.8, isAoE: true, icon: 'skill_9', desc: 'Thể tu chí tôn đao thương bất nhập, sát thương cực hạn.' }
];
"""
with open('H:/GOOGLE DRIVER/GAME/src/config/skillsData.js', 'w', encoding='utf-8') as f:
    f.write(skillsData)

# -------------------------------------------------------------
# 5. CONFIG: craftingData.js
# -------------------------------------------------------------
craftingData = """// BÁCH NGHỆ TU TIÊN: ĐAN DƯỢC • PHÙ LỤC • TRẬN PHÁP (1~5 PHẨM)
export const CRAFTING_SYSTEM = {
  pills: [
    { rank: 'Nhất Phẩm', grade: 'Hạ Phẩm', name: 'Nhất Phẩm Hạ Phẩm Bổ Huyết Đan', costHerbs: 2, costOres: 0, costGold: 20, desc: 'Hồi 300 HP' },
    { rank: 'Nhất Phẩm', grade: 'Trung Phẩm', name: 'Nhất Phẩm Trung Phẩm Tụ Khí Đan', costHerbs: 4, costOres: 0, costGold: 40, desc: 'Tăng 250 Tu Vi tức thì' },
    { rank: 'Nhất Phẩm', grade: 'Thượng Phẩm', name: 'Nhất Phẩm Thượng Phẩm Bồi Nguyên Đan', costHerbs: 8, costOres: 1, costGold: 80, desc: 'Tăng 800 Tu Vi' },
    { rank: 'Nhất Phẩm', grade: 'Cực Phẩm', name: 'Nhất Phẩm Cực Phẩm Trúc Cơ Đan', costHerbs: 15, costOres: 3, costGold: 200, desc: 'Phá vỡ bình cảnh Luyện Khí ➔ Trúc Cơ' },

    { rank: 'Nhị Phẩm', grade: 'Hạ Phẩm', name: 'Nhị Phẩm Hạ Phẩm Tẩy Tủy Đan', costHerbs: 10, costOres: 2, costGold: 150, desc: 'Hồi 1500 HP' },
    { rank: 'Nhị Phẩm', grade: 'Trung Phẩm', name: 'Nhị Phẩm Trung Phẩm Chân Nguyên Đan', costHerbs: 18, costOres: 4, costGold: 300, desc: 'Tăng 2500 Tu Vi' },
    { rank: 'Nhị Phẩm', grade: 'Thượng Phẩm', name: 'Nhị Phẩm Thượng Phẩm Định Thần Đan', costHerbs: 30, costOres: 8, costGold: 600, desc: 'Tăng 6000 Tu Vi' },
    { rank: 'Nhị Phẩm', grade: 'Cực Phẩm', name: 'Nhị Phẩm Cực Phẩm Ngưng Đan Đan', costHerbs: 50, costOres: 15, costGold: 1200, desc: 'Ngưng kết Kim Đan, Trúc Cơ ➔ Kim Đan' },

    { rank: 'Tam Phẩm', grade: 'Hạ Phẩm', name: 'Tam Phẩm Hạ Phẩm Cố Kim Đan', costHerbs: 40, costOres: 10, costGold: 800, desc: 'Hồi 6000 HP' },
    { rank: 'Tam Phẩm', grade: 'Trung Phẩm', name: 'Tam Phẩm Trung Phẩm Linh Phách Đan', costHerbs: 70, costOres: 20, costGold: 1600, desc: 'Tăng 15,000 Tu Vi' },
    { rank: 'Tam Phẩm', grade: 'Thượng Phẩm', name: 'Tam Phẩm Thượng Phẩm Cửu Chuyển Kim Đan', costHerbs: 120, costOres: 35, costGold: 3500, desc: 'Tăng 40,000 Tu Vi' },
    { rank: 'Tam Phẩm', grade: 'Cực Phẩm', name: 'Tam Phẩm Cực Phẩm Hóa Anh Đan', costHerbs: 200, costOres: 60, costGold: 7000, desc: 'Ngưng sinh Nguyên Anh, Kim Đan ➔ Nguyên Anh' },

    { rank: 'Tứ Phẩm', grade: 'Hạ Phẩm', name: 'Tứ Phẩm Hạ Phẩm Cố Bản Đan', costHerbs: 150, costOres: 40, costGold: 4000, desc: 'Hồi 25,000 HP' },
    { rank: 'Tứ Phẩm', grade: 'Trung Phẩm', name: 'Tứ Phẩm Trung Phẩm Hồn Nguyên Đan', costHerbs: 260, costOres: 80, costGold: 8500, desc: 'Tăng 90,000 Tu Vi' },
    { rank: 'Tứ Phẩm', grade: 'Thượng Phẩm', name: 'Tứ Phẩm Thượng Phẩm Thiên Cương Đan', costHerbs: 450, costOres: 140, costGold: 18000, desc: 'Tăng 220,000 Tu Vi' },
    { rank: 'Tứ Phẩm', grade: 'Cực Phẩm', name: 'Tứ Phẩm Cực Phẩm Hóa Thần Đan', costHerbs: 800, costOres: 250, costGold: 40000, desc: 'Đột phá Hóa Thần, Nguyên Anh ➔ Hóa Thần' },

    { rank: 'Ngũ Phẩm', grade: 'Hạ Phẩm', name: 'Ngũ Phẩm Hạ Phẩm Càn Khôn Đan', costHerbs: 600, costOres: 200, costGold: 30000, desc: 'Hồi 100,000 HP' },
    { rank: 'Ngũ Phẩm', grade: 'Trung Phẩm', name: 'Ngũ Phẩm Trung Phẩm Tạo Hóa Đan', costHerbs: 1000, costOres: 350, costGold: 65000, desc: 'Tăng 500,000 Tu Vi' },
    { rank: 'Ngũ Phẩm', grade: 'Thượng Phẩm', name: 'Ngũ Phẩm Thượng Phẩm Thái Cổ Đan', costHerbs: 1800, costOres: 600, costGold: 130000, desc: 'Tăng 1,200,000 Tu Vi' },
    { rank: 'Ngũ Phẩm', grade: 'Cực Phẩm', name: 'Ngũ Phẩm Cực Phẩm Hỗn Độn Tiên Đan', costHerbs: 3000, costOres: 1000, costGold: 300000, desc: 'Tăng 3,000,000 Tu Vi' }
  ],
  talismans: [
    { rank: 'Nhất Phẩm', grade: 'Hạ Phẩm', name: 'Nhất Phẩm Hạ Phẩm Hỏa Cầu Phù', costHerbs: 2, costOres: 1, costGold: 25, desc: 'Gây 350 Sát Thương Hỏa' },
    { rank: 'Nhị Phẩm', grade: 'Cực Phẩm', name: 'Nhị Phẩm Cực Phẩm Thiên Cương Lôi Phù', costHerbs: 60, costOres: 18, costGold: 1500, desc: 'AoE 7500 Thiên Lôi Sát Thương' },
    { rank: 'Tam Phẩm', grade: 'Cực Phẩm', name: 'Tam Phẩm Cực Phẩm Vạn Kiếm Tru Ma Phù', costHerbs: 240, costOres: 70, costGold: 8500, desc: 'AoE 32,000 Kiếm Khí Sát Thương' },
    { rank: 'Tứ Phẩm', grade: 'Cực Phẩm', name: 'Tứ Phẩm Cực Phẩm Diệt Ma Thần Lôi Phù', costHerbs: 900, costOres: 280, costGold: 48000, desc: 'AoE 130,000 Sát Thương' },
    { rank: 'Ngũ Phẩm', grade: 'Cực Phẩm', name: 'Ngũ Phẩm Cực Phẩm Cửu Thiên Tru Tiên Phù', costHerbs: 3500, costOres: 1200, costGold: 350000, desc: 'AoE 550,000 Sát Thương' }
  ],
  formations: [
    { rank: 'Nhất Phẩm', grade: 'Cực Phẩm', name: 'Nhất Phẩm Cực Phẩm Bách Linh Trận', costHerbs: 40, costOres: 15, costGold: 500, bonusDmg: 40, bonusHp: 500, bonusDef: 35, desc: '+40 Dmg, +500 HP, +35 Def' },
    { rank: 'Nhị Phẩm', grade: 'Cực Phẩm', name: 'Nhị Phẩm Cực Phẩm Ngũ Hành Trận', costHerbs: 200, costOres: 60, costGold: 3500, bonusDmg: 250, bonusHp: 2800, bonusDef: 140, desc: '+250 Dmg, +2800 HP, +140 Def' },
    { rank: 'Tam Phẩm', grade: 'Cực Phẩm', name: 'Tam Phẩm Cực Phẩm Cửu Cung Trận', costHerbs: 600, costOres: 180, costGold: 20000, bonusDmg: 1500, bonusHp: 16000, bonusDef: 550, desc: '+1500 Dmg, +16k HP, +550 Def' },
    { rank: 'Tứ Phẩm', grade: 'Cực Phẩm', name: 'Tứ Phẩm Cực Phẩm Thái Hư Trận', costHerbs: 2400, costOres: 750, costGold: 120000, bonusDmg: 8000, bonusHp: 90000, bonusDef: 2200, desc: '+8000 Dmg, +90k HP, +2200 Def' },
    { rank: 'Ngũ Phẩm', grade: 'Cực Phẩm', name: 'Ngũ Phẩm Cực Phẩm Khai Thiên Trận', costHerbs: 9900, costOres: 3500, costGold: 800000, bonusDmg: 50000, bonusHp: 600000, bonusDef: 10000, desc: '+50k Dmg, +600k HP, +10k Def' }
  ]
};
"""
with open('H:/GOOGLE DRIVER/GAME/src/config/craftingData.js', 'w', encoding='utf-8') as f:
    f.write(craftingData)

# -------------------------------------------------------------
# 6. CONFIG: itemsData.js
# -------------------------------------------------------------
itemsData = """// TRANG BỊ & PHÁP BẢO
export const INITIAL_ITEMS = [
  { id: 0, name: 'Huyền Thiết Kiếm', type: 'weapon', bonusDmg: 25, icon: 'item_0' },
  { id: 1, name: 'Thanh Vân Đạo Bào', type: 'armor', bonusHp: 300, icon: 'item_1' },
  { id: 2, name: 'Bát Quái Đạo Quán', type: 'helm', bonusDef: 15, icon: 'item_2' },
  { id: 3, name: 'Ngự Phong Hài', type: 'boots', bonusSpd: 20, icon: 'item_3' },
  { id: 4, name: 'Tụ Linh Ngọc Bội', type: 'amulet', bonusDmg: 40, bonusHp: 200, icon: 'item_4' },
  { id: 5, name: 'Hộ Thể Linh Thuẫn', type: 'shield', bonusDef: 30, icon: 'item_5' }
];
"""
with open('H:/GOOGLE DRIVER/GAME/src/config/itemsData.js', 'w', encoding='utf-8') as f:
    f.write(itemsData)

# -------------------------------------------------------------
# 7. STATE: gameState.js
# -------------------------------------------------------------
gameStateCode = """// QUẢN LÝ TOÀN BỘ TRẠNG THÁI NGƯỜI CHƠI & DỮ LIỆU GAME
export const gameState = {
  realmIdx: 0,
  exp: 0,
  gold: 300,
  herbs: 20,
  ores: 10,
  inventory: {
    pills: {},
    talismans: {},
    formations: []
  },
  currentStageId: 0,
  gearPlus: 0,
  equippedSkillIds: ['kim_1', 'hoa_1', 'loi_1', 'ly_1'], // 4 slots kỹ năng
  autoFight: true,
  gardenTimer: 0
};
"""
with open('H:/GOOGLE DRIVER/GAME/src/state/gameState.js', 'w', encoding='utf-8') as f:
    f.write(gameStateCode)

# -------------------------------------------------------------
# 8. SCENE: MainScene.js
# -------------------------------------------------------------
mainSceneCode = """import { REALMS } from '../config/realmsData.js';
import { MONSTER_RANKS } from '../config/monstersData.js';
import { STAGES } from '../config/stagesData.js';
import { ELEMENTAL_SKILLS } from '../config/skillsData.js';
import { CRAFTING_SYSTEM } from '../config/craftingData.js';
import { INITIAL_ITEMS } from '../config/itemsData.js';
import { gameState } from '../state/gameState.js';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

export class MainGameScene extends Phaser.Scene {
  constructor() {
    super('MainGameScene');
  }

  preload() {
    // Icons Skills
    for (let i = 0; i < 10; i++) {
      this.load.image(`skill_${i}`, `assets/icons/skills/skill_${i}.png`);
    }

    // Icons Items
    for (let i = 0; i < 18; i++) {
      this.load.image(`item_${i}`, `assets/icons/items/item_${i}.png`);
    }

    // Icons Stages
    for (let i = 0; i < 12; i++) {
      this.load.image(`stage_${i}`, `assets/icons/stages/stage_${i}.png`);
    }

    // UI Icons
    const uiIcons = ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest'];
    uiIcons.forEach(icon => {
      this.load.image(`ui_${icon}`, `assets/icons/ui/${icon}.png`);
    });

    // Sprites
    this.load.image('player_avatar', 'assets/sprites/player/player_avatar.png');
    this.load.image('player_idle', 'assets/sprites/player/player_idle_0.png');
    this.load.image('enemy_boss', 'assets/sprites/enemies/enemy_boss.png');
    this.load.image('enemy_wolf', 'assets/sprites/enemies/enemy_wolf.png');
    this.load.image('enemy_bat', 'assets/sprites/enemies/enemy_bat.png');
    this.load.image('enemy_snake', 'assets/sprites/enemies/enemy_snake.png');
    this.load.image('enemy_monkey', 'assets/sprites/enemies/enemy_monkey.png');
    this.load.image('enemy_bull', 'assets/sprites/enemies/enemy_bull.png');
    this.load.image('enemy_dragon', 'assets/sprites/enemies/enemy_dragon.png');
    this.load.image('enemy_octopus', 'assets/sprites/enemies/enemy_octopus.png');
    this.load.image('map_bg', 'assets/maps/map_background.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#090e18');

    this.bg = this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, 'map_bg')
      .setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT - 60)
      .setAlpha(0.4);

    this.createAuraParticles();

    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerHp = this.playerHpMax;
    this.playerDmg = this.calcPlayerDmg();

    // Player Sprite
    this.playerSprite = this.add.image(280, 270, 'player_idle')
      .setScale(0.9)
      .setOrigin(0.5, 0.8);
    
    this.tweens.add({
      targets: this.playerSprite,
      y: 262,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.playerNameText = this.add.text(280, 178, 'Tiên Hữu', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.playerRealmTag = this.add.text(280, 200, REALMS[gameState.realmIdx].name, {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#88ddff',
      backgroundColor: '#0a1a2fdd',
      padding: { x: 8, y: 3 }
    }).setOrigin(0.5);

    this.playerHpBg = this.add.rectangle(280, 220, 130, 8, 0x222222).setOrigin(0.5);
    this.playerHpBar = this.add.rectangle(280 - 65, 220, 130, 8, 0x00ee66).setOrigin(0, 0.5);

    this.enemies = [];
    this.skillCooldowns = {};

    this.spawnEnemies();

    this.createTopHUD();
    this.createBottomNav();
    this.createSkillBar();

    this.modalLayer = this.add.container(0, 0).setDepth(200);

    this.time.addEvent({
      delay: 1000,
      callback: this.onSecondTick,
      callbackScope: this,
      loop: true
    });
  }

  calcPlayerMaxHp() {
    const realm = REALMS[gameState.realmIdx];
    let hp = realm.hp + gameState.gearPlus * 150;
    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusHp) hp += fObj.bonusHp;
    });
    return hp;
  }

  calcPlayerDmg() {
    const realm = REALMS[gameState.realmIdx];
    let dmg = realm.dmg + gameState.gearPlus * 25;
    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusDmg) dmg += fObj.bonusDmg;
    });
    return dmg;
  }

  calcPlayerDef() {
    const realm = REALMS[gameState.realmIdx];
    let def = realm.def + gameState.gearPlus * 10;
    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusDef) def += fObj.bonusDef;
    });
    return def;
  }

  createAuraParticles() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x88ccff, 0.6);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('aura_dot', 8, 8);
    graphics.destroy();

    this.auraEmitter = this.add.particles(280, 270, 'aura_dot', {
      speed: { min: 20, max: 50 },
      angle: { min: 220, max: 320 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1200,
      frequency: 200
    });
  }

  // TOP HUD
  createTopHUD() {
    this.topHudContainer = this.add.container(0, 0).setDepth(100);

    const topBarBg = this.add.rectangle(CANVAS_WIDTH / 2, 28, CANVAS_WIDTH - 24, 46, 0x090f1d, 0.92)
      .setStrokeStyle(1.5, 0x2a3e5c);
    this.topHudContainer.add(topBarBg);

    const avatar = this.add.image(36, 28, 'player_avatar').setDisplaySize(38, 38);
    this.topHudContainer.add(avatar);

    this.hudRealmText = this.add.text(64, 16, REALMS[gameState.realmIdx].name, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffdd66'
    });
    this.topHudContainer.add(this.hudRealmText);

    this.hudExpBg = this.add.rectangle(130, 36, 130, 8, 0x1a2638).setOrigin(0.5);
    this.hudExpBar = this.add.rectangle(65, 36, 0, 8, 0x33bbff).setOrigin(0, 0.5);
    this.topHudContainer.add([this.hudExpBg, this.hudExpBar]);

    this.hudExpText = this.add.text(202, 32, '0%', {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      color: '#aaddee'
    });
    this.topHudContainer.add(this.hudExpText);

    const goldIcon = this.add.image(285, 28, 'ui_gold').setDisplaySize(20, 20);
    this.hudGoldText = this.add.text(300, 20, `${gameState.gold} L.Thạch`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#ffcc00'
    });
    this.topHudContainer.add([goldIcon, this.hudGoldText]);

    const herbIcon = this.add.image(420, 28, 'item_6').setDisplaySize(20, 20);
    this.hudHerbText = this.add.text(435, 20, `Thảo: ${gameState.herbs}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#88ee88'
    });

    const oreIcon = this.add.image(530, 28, 'item_8').setDisplaySize(20, 20);
    this.hudOreText = this.add.text(545, 20, `Khoáng: ${gameState.ores}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#66ccff'
    });
    this.topHudContainer.add([herbIcon, this.hudHerbText, oreIcon, this.hudOreText]);

    const stage = STAGES[gameState.currentStageId];
    this.hudStageText = this.add.text(CANVAS_WIDTH - 30, 20, `📍 ${stage.name} (${stage.sub})`, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#aaddff'
    }).setOrigin(1, 0);
    this.topHudContainer.add(this.hudStageText);

    this.updateHUD();
  }

  updateHUD() {
    const realm = REALMS[gameState.realmIdx];
    const nextReq = realm.expReq;
    const pct = Math.min(100, Math.floor((gameState.exp / nextReq) * 100));

    this.hudRealmText.setText(realm.name);
    this.playerRealmTag.setText(realm.name);
    this.hudExpBar.width = (pct / 100) * 130;
    this.hudExpText.setText(`${pct}%`);
    this.hudGoldText.setText(`${gameState.gold} L.Thạch`);
    this.hudHerbText.setText(`Thảo: ${gameState.herbs}`);
    this.hudOreText.setText(`Khoáng: ${gameState.ores}`);
    
    const stage = STAGES[gameState.currentStageId];
    this.hudStageText.setText(`📍 ${stage.name} (${stage.sub})`);

    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerDmg = this.calcPlayerDmg();
    const hpRatio = Math.max(0, this.playerHp / this.playerHpMax);
    this.playerHpBar.width = hpRatio * 130;
  }

  // BOTTOM NAVIGATION
  createBottomNav() {
    this.bottomNavContainer = this.add.container(0, 0).setDepth(100);

    const navBg = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 32, CANVAS_WIDTH - 24, 52, 0x070c16, 0.95)
      .setStrokeStyle(1.5, 0x22354d);
    this.bottomNavContainer.add(navBg);

    const navItems = [
      { key: 'bag', label: 'HÀNH TRANG', icon: 'ui_bag', action: () => this.openGearPanel() },
      { key: 'realm', label: 'CẢNH GIỚI', icon: 'ui_realm', action: () => this.openRealmPanel() },
      { key: 'craft', label: 'BÁCH NGHỆ', icon: 'item_7', action: () => this.openCraftingPanel('pills') },
      { key: 'skills', label: 'CÔNG PHÁP', icon: 'ui_skills', action: () => this.openSkillPanel('Kim') },
      { key: 'auto', label: 'TỰ ĐỘNG', icon: 'ui_auto', action: () => this.toggleAutoFight() },
      { key: 'map', label: 'BẢN ĐỒ', icon: 'ui_map', action: () => this.openMapPanel() }
    ];

    const startX = 100;
    const gap = 150;

    navItems.forEach((btn, idx) => {
      const x = startX + idx * gap;
      const y = CANVAS_HEIGHT - 32;

      const itemContainer = this.add.container(x, y);

      const btnBox = this.add.rectangle(0, 0, 126, 42, 0x111e30, 0.8)
        .setStrokeStyle(1, 0x2a4466)
        .setInteractive({ useHandCursor: true });

      const iconImg = this.add.image(-40, 0, btn.icon).setDisplaySize(24, 24);

      const labelTxt = this.add.text(6, 0, btn.label, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#d4e6ff'
      }).setOrigin(0.5);

      if (btn.key === 'auto') {
        this.autoBtnBg = btnBox;
        this.autoBtnLabel = labelTxt;
        this.updateAutoBtnVisual();
      }

      btnBox.on('pointerover', () => {
        btnBox.setFillStyle(0x1a3355, 0.95);
        btnBox.setStrokeStyle(1.5, 0x4488ff);
      });

      btnBox.on('pointerout', () => {
        if (btn.key === 'auto' && gameState.autoFight) {
          btnBox.setFillStyle(0x1a4028, 0.95);
          btnBox.setStrokeStyle(1.5, 0x33cc66);
        } else {
          btnBox.setFillStyle(0x111e30, 0.8);
          btnBox.setStrokeStyle(1, 0x2a4466);
        }
      });

      btnBox.on('pointerdown', btn.action);

      itemContainer.add([btnBox, iconImg, labelTxt]);
      this.bottomNavContainer.add(itemContainer);
    });
  }

  updateAutoBtnVisual() {
    if (gameState.autoFight) {
      this.autoBtnBg.setFillStyle(0x1a4028, 0.95);
      this.autoBtnBg.setStrokeStyle(1.5, 0x33cc66);
      this.autoBtnLabel.setColor('#66ff88');
      this.autoBtnLabel.setText('ĐANG TREO');
    } else {
      this.autoBtnBg.setFillStyle(0x111e30, 0.8);
      this.autoBtnBg.setStrokeStyle(1, 0x2a4466);
      this.autoBtnLabel.setColor('#d4e6ff');
      this.autoBtnLabel.setText('THỦ CÔNG');
    }
  }

  toggleAutoFight() {
    gameState.autoFight = !gameState.autoFight;
    this.updateAutoBtnVisual();
    this.showFloatingText(280, 160, gameState.autoFight ? 'ĐÃ BẬT TỰ ĐỘNG TU LUYỆN' : 'CHUYỂN SANG ĐIỀU KHIỂN TAY', '#66ffaa');
  }

  // 4 SLOTS SKILL BAR
  createSkillBar() {
    if (this.skillBarContainer) this.skillBarContainer.destroy();
    this.skillBarContainer = this.add.container(0, 0).setDepth(100);

    const startX = 370;
    const y = CANVAS_HEIGHT - 80;
    const gap = 58;

    this.skillSlots = [];

    for (let i = 0; i < 4; i++) {
      const x = startX + i * gap;
      const skillId = gameState.equippedSkillIds[i];
      const slotContainer = this.add.container(x, y);

      const slotBg = this.add.rectangle(0, 0, 48, 48, 0x111a28, 0.9)
        .setStrokeStyle(1.5, 0x335577)
        .setInteractive({ useHandCursor: true });

      let icon = null;
      let cdOverlay = null;

      if (skillId) {
        const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
        if (skill) {
          icon = this.add.image(0, 0, skill.icon).setDisplaySize(40, 40);

          cdOverlay = this.add.rectangle(0, 0, 48, 48, 0x000000, 0.65).setVisible(false);
          const cdText = this.add.text(0, 0, '', {
            fontSize: '12px',
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
          }).setOrigin(0.5);

          slotBg.on('pointerdown', () => this.castSkill(skill.id));

          slotContainer.add([slotBg, icon, cdOverlay, cdText]);
          this.skillSlots.push({ container: slotContainer, skillId: skill.id, cdOverlay, cdText, slotBg });
        }
      } else {
        const lockText = this.add.text(0, 0, '+', { fontSize: '20px', color: '#556677' }).setOrigin(0.5);
        slotContainer.add([slotBg, lockText]);
        this.skillSlots.push({ container: slotContainer, skillId: null });
      }

      this.skillBarContainer.add(slotContainer);
    }
  }

  // SPAWN MONSTERS
  spawnEnemies() {
    const stage = STAGES[gameState.currentStageId];
    const enemyCount = 3;

    for (let i = 0; i < enemyCount; i++) {
      const isBoss = (i === 1);
      const mIdx = Math.min(MONSTER_RANKS.length - 1, stage.monsterIdxStart + (isBoss ? 1 : (i % 2)));
      const monsterData = MONSTER_RANKS[mIdx];

      const x = 540 + i * 140;
      const y = 260 + (i % 2) * 35;

      const sprite = this.add.image(x, y, this.textures.exists(monsterData.sprite) ? monsterData.sprite : 'enemy_wolf')
        .setScale(isBoss ? 0.95 : 0.75)
        .setOrigin(0.5, 0.8);

      const maxHp = monsterData.hp;
      const enemyObj = {
        data: monsterData,
        sprite: sprite,
        name: monsterData.name,
        rank: monsterData.rank,
        hp: maxHp,
        maxHp: maxHp,
        dmg: monsterData.dmg,
        isBoss: isBoss,
        hpBg: this.add.rectangle(x, y - 65, 85, 6, 0x222222).setOrigin(0.5),
        hpBar: this.add.rectangle(x - 42, y - 65, 85, 6, isBoss ? 0xff2244 : 0xee5533).setOrigin(0, 0.5),
        nameText: this.add.text(x, y - 76, `${isBoss ? '👑 ' : ''}${monsterData.name} (${monsterData.rank})`, {
          fontSize: '10px',
          fontFamily: 'sans-serif',
          fontStyle: 'bold',
          color: isBoss ? '#ff4466' : '#ffd700',
          stroke: '#000',
          strokeThickness: 2
        }).setOrigin(0.5),
        atkTimer: 1000 + Math.random() * 800
      };

      this.enemies.push(enemyObj);

      this.tweens.add({
        targets: sprite,
        y: y - 8,
        duration: 1200 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  onSecondTick() {
    gameState.gardenTimer++;
    if (gameState.gardenTimer >= 10) {
      gameState.gardenTimer = 0;
      gameState.herbs += 3;
      this.updateHUD();
    }

    const passiveExp = Math.floor(12 * (1 + gameState.realmIdx * 1.2));
    this.gainExp(passiveExp, false);

    if (gameState.autoFight && this.enemies.length > 0) {
      let casted = false;
      for (let i = 0; i < gameState.equippedSkillIds.length; i++) {
        const sId = gameState.equippedSkillIds[i];
        if (sId && (!this.skillCooldowns[sId] || this.skillCooldowns[sId] <= 0)) {
          this.castSkill(sId);
          casted = true;
          break;
        }
      }
      if (!casted) {
        this.playerNormalAttack();
      }
    }

    this.enemies.forEach(enemy => {
      enemy.atkTimer -= 1000;
      if (enemy.atkTimer <= 0) {
        enemy.atkTimer = 2200 + Math.random() * 1000;
        this.enemyAttack(enemy);
      }
    });

    Object.keys(this.skillCooldowns).forEach(k => {
      if (this.skillCooldowns[k] > 0) this.skillCooldowns[k] -= 1000;
    });
    this.updateSkillCooldownUI();
  }

  updateSkillCooldownUI() {
    this.skillSlots.forEach(slot => {
      if (slot && slot.skillId && slot.cdOverlay) {
        const cdLeft = this.skillCooldowns[slot.skillId] || 0;
        if (cdLeft > 0) {
          slot.cdOverlay.setVisible(true);
          slot.cdText.setText(`${Math.ceil(cdLeft / 1000)}s`);
        } else {
          slot.cdOverlay.setVisible(false);
          slot.cdText.setText('');
        }
      }
    });
  }

  playerNormalAttack() {
    if (this.enemies.length === 0) return;
    const target = this.enemies[0];

    const slash = this.add.rectangle(target.sprite.x, target.sprite.y - 20, 60, 6, 0x88ddff)
      .setRotation(Phaser.Math.DegToRad(45))
      .setDepth(150);

    this.tweens.add({
      targets: slash,
      scaleX: 1.5,
      alpha: 0,
      duration: 250,
      onComplete: () => slash.destroy()
    });

    const isCrit = Math.random() < 0.2;
    let dmg = this.playerDmg;
    if (isCrit) dmg = Math.floor(dmg * 1.8);

    this.damageEnemy(target, dmg, isCrit);
  }

  castSkill(skillId) {
    if (this.skillCooldowns[skillId] > 0) return;
    const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    this.skillCooldowns[skillId] = skill.cd;
    this.updateSkillCooldownUI();

    const elemColors = {
      'Kim': '#ffd700',
      'Hỏa': '#ff4422',
      'Thủy': '#44aaff',
      'Thổ': '#aa8844',
      'Mộc': '#44dd66',
      'Phong': '#66ffcc',
      'Lôi': '#ffee33',
      'Vật Lý': '#ff88aa'
    };

    const baseDmg = Math.floor(this.playerDmg * skill.dmgMul);
    if (skill.isAoE) {
      this.enemies.slice().forEach(target => {
        this.damageEnemy(target, baseDmg, true);
      });
      this.showFloatingText(280, 160, `💥 [${skill.elem}] ${skill.name}!`, elemColors[skill.elem] || '#ffd700');
    } else if (this.enemies.length > 0) {
      this.damageEnemy(this.enemies[0], baseDmg, true);
      this.showFloatingText(280, 160, `⚡ [${skill.elem}] ${skill.name}!`, elemColors[skill.elem] || '#ffd700');
    }
  }

  damageEnemy(enemy, dmg, isCrit) {
    enemy.hp -= dmg;
    this.showFloatingText(enemy.sprite.x, enemy.sprite.y - 40, `-${dmg}`, isCrit ? '#ff3344' : '#ffffff', isCrit ? '17px' : '13px');

    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    enemy.hpBar.width = ratio * 85;

    enemy.sprite.setTint(0xff5555);
    this.time.delayedCall(120, () => enemy.sprite.clearTint());

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy) {
    const data = enemy.data;
    this.gainExp(data.exp, true);
    gameState.gold += data.gold;
    gameState.ores += data.ore;

    this.showFloatingText(enemy.sprite.x, enemy.sprite.y - 20, `+${data.exp} Tu Vi  +${data.gold} L.Thạch  +${data.ore} Khoáng`, '#ffdd44');

    enemy.sprite.destroy();
    enemy.hpBg.destroy();
    enemy.hpBar.destroy();
    enemy.nameText.destroy();

    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) this.enemies.splice(idx, 1);

    this.updateHUD();

    if (this.enemies.length === 0) {
      this.time.delayedCall(1000, () => this.spawnEnemies());
    }
  }

  enemyAttack(enemy) {
    if (this.playerHp <= 0) return;
    const def = this.calcPlayerDef();
    const dmg = Math.max(1, enemy.dmg - def);
    this.playerHp = Math.max(0, this.playerHp - dmg);

    this.showFloatingText(280, 240, `-${dmg}`, '#ff7777');
    this.updateHUD();

    this.playerSprite.setTint(0xff6666);
    this.time.delayedCall(120, () => this.playerSprite.clearTint());
  }

  gainExp(amt, showVisual = false) {
    const realm = REALMS[gameState.realmIdx];
    gameState.exp += amt;

    if (gameState.exp >= realm.expReq) {
      if (realm.bottleneck) {
        gameState.exp = realm.expReq;
      } else {
        if (gameState.realmIdx < REALMS.length - 1) {
          gameState.realmIdx++;
          gameState.exp = 0;
          this.playerHp = this.calcPlayerMaxHp();
          this.showFloatingText(280, 140, `🎉 ĐỘT PHÁ: ${REALMS[gameState.realmIdx].name}!`, '#ffff44', '20px');
        }
      }
    }
    this.updateHUD();
  }

  showFloatingText(x, y, text, color = '#ffffff', fontSize = '13px') {
    const txt = this.add.text(x, y, text, {
      fontSize: fontSize,
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(180);

    this.tweens.add({
      targets: txt,
      y: y - 45,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  // MODAL CÔNG PHÁP
  openSkillPanel(activeElem = 'Kim') {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -200, '📜 TÀNG KINH CÁC: 8 ĐẠI HỆ NGUYÊN TỐ & 40 THẦN THÔNG', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(360, -200, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const elements = ['Kim', 'Hỏa', 'Thủy', 'Thổ', 'Mộc', 'Phong', 'Lôi', 'Vật Lý'];
    elements.forEach((elem, idx) => {
      const ex = -315 + idx * 90;
      const isAct = (elem === activeElem);

      const elemBg = this.add.rectangle(ex, -160, 84, 30, isAct ? 0x224870 : 0x111e30)
        .setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466)
        .setInteractive({ useHandCursor: true });

      const elemTxt = this.add.text(ex, -160, elem, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isAct ? '#ffffff' : '#88aacc'
      }).setOrigin(0.5);

      elemBg.on('pointerdown', () => this.openSkillPanel(elem));
      panel.add([elemBg, elemTxt]);
    });

    const skillsOfElem = ELEMENTAL_SKILLS.filter(s => s.elem === activeElem);

    skillsOfElem.forEach((skill, idx) => {
      const sy = -105 + idx * 62;
      const isUnlocked = (gameState.realmIdx >= skill.minRealm);
      const isEquipped = gameState.equippedSkillIds.includes(skill.id);

      const cardBg = this.add.rectangle(0, sy, 730, 54, isEquipped ? 0x182c44 : 0x111c2a)
        .setStrokeStyle(1.5, isEquipped ? 0x44ff88 : (isUnlocked ? 0x336699 : 0x333333));

      const icon = this.add.image(-320, sy, skill.icon).setDisplaySize(42, 42);
      if (!isUnlocked) icon.setTint(0x555555);

      const sStage = this.add.text(-280, sy - 14, `[${skill.stage}]`, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ffaa00'
      });

      const sName = this.add.text(-190, sy - 14, skill.name, {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isUnlocked ? '#ffffff' : '#778899'
      });

      const sDesc = this.add.text(-280, sy + 6, `${skill.desc} (Hồi: ${skill.cd / 1000}s, x${skill.dmgMul} Sát Thương${skill.isAoE ? ' AoE' : ''})`, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#88bbdd'
      });

      if (isUnlocked) {
        const btnBg = this.add.rectangle(300, sy, 76, 30, isEquipped ? 0x335533 : 0x1a3a5a)
          .setStrokeStyle(1, isEquipped ? 0x55aa55 : 0x3377bb)
          .setInteractive({ useHandCursor: true });
        const btnTxt = this.add.text(300, sy, isEquipped ? 'Gỡ' : 'Lắp', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#fff'
        }).setOrigin(0.5);

        btnBg.on('pointerdown', () => {
          if (isEquipped) {
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
          } else {
            if (gameState.equippedSkillIds.length < 4) {
              gameState.equippedSkillIds.push(skill.id);
            } else {
              this.showFloatingText(CANVAS_WIDTH / 2, 120, 'Tối đa gắn 4 Thần Thông!', '#ff5555');
              return;
            }
          }
          this.createSkillBar();
          this.openSkillPanel(activeElem);
        });

        panel.add([btnBg, btnTxt]);
      } else {
        const reqTxt = this.add.text(300, sy, `Yêu cầu: ${skill.stage}`, {
          fontSize: '10px',
          fontFamily: 'sans-serif',
          color: '#ff6666'
        }).setOrigin(0.5);
        panel.add(reqTxt);
      }

      panel.add([cardBg, icon, sStage, sName, sDesc]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // MODAL BÁCH NGHỆ
  openCraftingPanel(currentTab = 'pills') {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -200, '🏮 BÁCH NGHỆ TU TIÊN: ĐAN DƯỢC • PHÙ LỤC • TRẬN PHÁP', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(360, -200, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const tabs = [
      { key: 'pills', label: '💊 ĐAN DƯỢC (1~5 Phẩm)' },
      { key: 'talismans', label: '📜 PHÙ LỤC (1~5 Phẩm)' },
      { key: 'formations', label: '🌌 TRẬN PHÁP (1~5 Phẩm)' }
    ];

    tabs.forEach((tb, idx) => {
      const tx = -240 + idx * 240;
      const isAct = (tb.key === currentTab);

      const tabBg = this.add.rectangle(tx, -165, 220, 32, isAct ? 0x224870 : 0x111e30)
        .setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466)
        .setInteractive({ useHandCursor: true });

      const tabTxt = this.add.text(tx, -165, tb.label, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isAct ? '#ffffff' : '#88aacc'
      }).setOrigin(0.5);

      tabBg.on('pointerdown', () => this.openCraftingPanel(tb.key));
      panel.add([tabBg, tabTxt]);
    });

    const recipeList = CRAFTING_SYSTEM[currentTab] || [];

    recipeList.slice(0, 5).forEach((item, idx) => {
      const iy = -105 + idx * 58;

      const itemBox = this.add.rectangle(0, iy, 740, 50, 0x122035)
        .setStrokeStyle(1.5, item.grade === 'Cực Phẩm' ? 0xffaa00 : (item.grade === 'Thượng Phẩm' ? 0xcc44cc : (item.grade === 'Trung Phẩm' ? 0x3399ff : 0x44aa44)));

      const gradeColor = (item.grade === 'Cực Phẩm') ? '#ffaa00' : (item.grade === 'Thượng Phẩm' ? '#ff77ff' : (item.grade === 'Trung Phẩm' ? '#66ccff' : '#66ff66'));
      const gradeBadge = this.add.text(-350, iy - 14, `[${item.rank} • ${item.grade}]`, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: gradeColor
      });

      const iName = this.add.text(-220, iy - 14, item.name, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ffffff'
      });

      const iDesc = this.add.text(-350, iy + 6, `${item.desc} | Chi phí: ${item.costHerbs} Thảo, ${item.costOres || 0} Khoáng, ${item.costGold} L.Thạch`, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#88bbdd'
      });

      const canCraft = (gameState.herbs >= item.costHerbs && gameState.ores >= (item.costOres || 0) && gameState.gold >= item.costGold);
      const actionBtn = this.add.rectangle(310, iy, 90, 32, canCraft ? 0x884400 : 0x223344)
        .setStrokeStyle(1.5, canCraft ? 0xffaa00 : 0x445566)
        .setInteractive({ useHandCursor: canCraft });

      const btnLabel = currentTab === 'formations' ? (gameState.inventory.formations.includes(item.name) ? 'Đã Có' : 'Bố Trí') : 'Luyện Chế';
      const actionTxt = this.add.text(310, iy, btnLabel, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: canCraft ? '#ffffff' : '#778899'
      }).setOrigin(0.5);

      actionBtn.on('pointerdown', () => {
        if (!canCraft) {
          this.showFloatingText(CANVAS_WIDTH / 2, 120, 'Không đủ nguyên liệu hoặc Linh Thạch!', '#ff5555');
          return;
        }

        gameState.herbs -= item.costHerbs;
        gameState.ores -= (item.costOres || 0);
        gameState.gold -= item.costGold;

        if (currentTab === 'pills') {
          gameState.inventory.pills[item.name] = (gameState.inventory.pills[item.name] || 0) + 1;
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `🔥 Luyện thành công 1 viên [${item.name}]!`, '#ffd700');
        } else if (currentTab === 'talismans') {
          gameState.inventory.talismans[item.name] = (gameState.inventory.talismans[item.name] || 0) + 1;
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `📜 Vẽ thành công 1 tấm [${item.name}]!`, '#66ffcc');
        } else if (currentTab === 'formations') {
          if (!gameState.inventory.formations.includes(item.name)) {
            gameState.inventory.formations.push(item.name);
          }
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `🌌 Bố trí thành công [${item.name}]!`, '#ffd700');
        }

        this.updateHUD();
        this.openCraftingPanel(currentTab);
      });

      panel.add([itemBox, gradeBadge, iName, iDesc, actionBtn, actionTxt]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // MODAL CẢNH GIỚI
  openRealmPanel() {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 680, 420, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -180, '🧘 CẢNH GIỚI TU CHÂN: LUYỆN KHÍ ➔ HÓA THẦN', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(315, -180, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const currentRealm = REALMS[gameState.realmIdx];

    const realmIcon = this.add.image(0, -100, 'ui_realm').setDisplaySize(64, 64);

    const realmName = this.add.text(0, -45, `${currentRealm.major} Kỳ • ${currentRealm.tier}`, {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#66ccff'
    }).setOrigin(0.5);

    const statsInfo = this.add.text(0, 15,
      `❤️ Sinh Mệnh Tối Đa: ${this.calcPlayerMaxHp()}\n` +
      `⚔️ Công Kích Cơ Bản: ${this.calcPlayerDmg()}\n` +
      `🛡️ Phòng Ngự Hộ Thể: ${this.calcPlayerDef()}\n` +
      `✨ Tu Vi Tích Lũy: ${gameState.exp} / ${currentRealm.expReq}`, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      align: 'center',
      color: '#d4e6ff',
      lineSpacing: 6
    }).setOrigin(0.5);

    let btnText = 'TỰ ĐỘNG HẤP THU LINH KHÍ';
    let canBreak = false;
    let requiredPill = null;

    if (gameState.exp >= currentRealm.expReq) {
      if (currentRealm.bottleneck) {
        requiredPill = currentRealm.pillNeeded;
        btnText = `CẮN [${requiredPill}] ĐỂ ĐỘT PHÁ`;
        canBreak = (gameState.inventory.pills[requiredPill] > 0);
      } else {
        btnText = 'LẬP TỨC ĐỘT PHÁ';
        canBreak = true;
      }
    }

    const breakBtn = this.add.rectangle(0, 125, 380, 44, canBreak ? 0x226633 : 0x223344)
      .setStrokeStyle(1.5, canBreak ? 0x44ff88 : 0x556677)
      .setInteractive({ useHandCursor: canBreak });

    const breakBtnTxt = this.add.text(0, 125, btnText, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: canBreak ? '#ffffff' : '#8899aa'
    }).setOrigin(0.5);

    breakBtn.on('pointerdown', () => {
      if (!canBreak) {
        if (requiredPill && !gameState.inventory.pills[requiredPill]) {
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `Cần luyện chế [${requiredPill}] tại mục Bách Nghệ!`, '#ff5555');
        }
        return;
      }

      if (requiredPill) {
        gameState.inventory.pills[requiredPill]--;
      }

      if (gameState.realmIdx < REALMS.length - 1) {
        gameState.realmIdx++;
        gameState.exp = 0;
        this.playerHp = this.calcPlayerMaxHp();
        this.updateHUD();
        this.openRealmPanel();
        this.showFloatingText(CANVAS_WIDTH / 2, 100, `🎉 ĐỘT PHÁ THÀNH CÔNG: ${REALMS[gameState.realmIdx].name}!`, '#ffd700', '20px');
      }
    });

    panel.add([bg, title, closeBtn, realmIcon, realmName, statsInfo, breakBtn, breakBtnTxt]);
    this.modalLayer.add([overlay, panel]);
  }

  // MODAL HÀNH TRANG
  openGearPanel() {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 720, 420, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -180, '🎒 HÀNH TRANG & TÔI LUYỆN PHÁP BẢO', {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(330, -180, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    INITIAL_ITEMS.slice(0, 6).forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const ix = -225 + col * 110;
      const iy = -80 + row * 80;

      const slotBg = this.add.rectangle(ix, iy, 76, 64, 0x16263e)
        .setStrokeStyle(1, 0x335577);
      const icon = this.add.image(ix, iy - 8, item.icon).setDisplaySize(38, 38);
      const lbl = this.add.text(ix, iy + 18, `+${gameState.gearPlus}`, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ffcc00'
      }).setOrigin(0.5);

      panel.add([slotBg, icon, lbl]);
    });

    const forgeBox = this.add.rectangle(170, 0, 310, 310, 0x111e33, 0.9)
      .setStrokeStyle(1.5, 0x336699);

    const forgeTitle = this.add.text(170, -135, '🔨 Luyện Khí Các (Tôi Luyện)', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ff9944'
    }).setOrigin(0.5);

    const forgeDesc = this.add.text(170, -30,
      `Cấp Tôi Luyện: +${gameState.gearPlus}\n` +
      `Khoáng Thạch: ${gameState.ores} viên\n` +
      `Chi phí: 3 Khoáng Thạch + 50 L.Thạch\n\n` +
      `Hiệu quả mỗi cấp:\n` +
      `⚔️ +25 Công Kích\n` +
      `❤️ +150 Sinh Mệnh\n` +
      `🛡️ +10 Phòng Ngự`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      align: 'center',
      color: '#cceeff',
      lineSpacing: 5
    }).setOrigin(0.5);

    const forgeBtn = this.add.rectangle(170, 95, 230, 38, 0x884400)
      .setStrokeStyle(1.5, 0xffaa00)
      .setInteractive({ useHandCursor: true });
    const forgeBtnTxt = this.add.text(170, 95, '🔨 Tôi Luyện Pháp Bảo (+1)', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    forgeBtn.on('pointerdown', () => {
      if (gameState.ores >= 3 && gameState.gold >= 50) {
        gameState.ores -= 3;
        gameState.gold -= 50;
        gameState.gearPlus += 1;
        this.updateHUD();
        this.openGearPanel();
        this.showFloatingText(CANVAS_WIDTH / 2, 120, `✨ Tôi Luyện Thành Công: Pháp Bảo +${gameState.gearPlus}!`, '#ffd700');
      } else {
        this.showFloatingText(CANVAS_WIDTH / 2, 120, 'Không đủ Khoáng Thạch hoặc Linh Thạch!', '#ff5555');
      }
    });

    panel.add([bg, title, closeBtn, forgeBox, forgeTitle, forgeDesc, forgeBtn, forgeBtnTxt]);
    this.modalLayer.add([overlay, panel]);
  }

  // MODAL BẢN ĐỒ
  openMapPanel() {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 760, 440, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -190, '🗺️ TIÊN VỰC THẾ GIỚI - 12 BÍ CẢNH YÊU THÚ 1~5 PHẨM', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffdd66'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(350, -190, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    STAGES.forEach((stg, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const sx = -270 + col * 180;
      const sy = -115 + row * 105;

      const isCurrent = (stg.id === gameState.currentStageId);
      const isUnlocked = (gameState.realmIdx >= stg.minRealm);

      const cardBg = this.add.rectangle(sx, sy, 164, 90, isCurrent ? 0x1d3855 : 0x111c2b)
        .setStrokeStyle(1.5, isCurrent ? 0x44ff88 : (isUnlocked ? 0x336699 : 0x333333))
        .setInteractive({ useHandCursor: isUnlocked });

      const icon = this.add.image(sx - 52, sy - 8, stg.icon).setDisplaySize(42, 42);
      if (!isUnlocked) icon.setTint(0x555555);

      const sName = this.add.text(sx - 20, sy - 28, stg.name, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isUnlocked ? '#ffd700' : '#778899'
      });

      const sSub = this.add.text(sx - 20, sy - 12, stg.sub, {
        fontSize: '9px',
        fontFamily: 'sans-serif',
        color: '#99bbdd'
      });

      const statusTxt = this.add.text(sx, sy + 30, isCurrent ? '📍 ĐANG Ở ĐÂY' : (isUnlocked ? 'TIẾN VÀO' : `Yêu cầu: ${REALMS[stg.minRealm].name}`), {
        fontSize: '9px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isCurrent ? '#44ff88' : (isUnlocked ? '#66ccff' : '#ff6666')
      }).setOrigin(0.5);

      cardBg.on('pointerdown', () => {
        if (!isUnlocked) {
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `Cảnh giới chưa đủ để vào ${stg.name}!`, '#ff5555');
          return;
        }
        gameState.currentStageId = stg.id;
        this.updateHUD();
        this.closeModal();
        this.enemies.forEach(e => {
          e.sprite.destroy();
          e.hpBg.destroy();
          e.hpBar.destroy();
          e.nameText.destroy();
        });
        this.enemies = [];
        this.spawnEnemies();
        this.showFloatingText(CANVAS_WIDTH / 2, 120, `🚀 Đã tiến vào: ${stg.name}!`, '#66ffcc');
      });

      panel.add([cardBg, icon, sName, sSub, statusTxt]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  closeModal() {
    this.modalLayer.removeAll(true);
  }
}
"""
with open('H:/GOOGLE DRIVER/GAME/src/scenes/MainScene.js', 'w', encoding='utf-8') as f:
    f.write(mainSceneCode)

# -------------------------------------------------------------
# 9. ENTRY POINT: main.js
# -------------------------------------------------------------
mainJs = """import { MainGameScene, CANVAS_WIDTH, CANVAS_HEIGHT } from './scenes/MainScene.js';

const config = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  parent: 'game',
  scene: [MainGameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

window.onload = () => {
  new Phaser.Game(config);
};
"""
with open('H:/GOOGLE DRIVER/GAME/src/main.js', 'w', encoding='utf-8') as f:
    f.write(mainJs)

print("Modularization completed successfully!")
