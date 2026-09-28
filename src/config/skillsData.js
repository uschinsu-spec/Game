// 4 BẬC THUẦN THỤC KỸ NĂNG GỐC
export const SKILL_MASTERY_TIERS = [
  { idx: 0, name: 'Sơ Nhập',   expReq: 50,     dmgBonus: 0.00, vfxMul: 1.00, color: '#aaddff', badgeBg: 0x224466 },
  { idx: 1, name: 'Tiểu Thành', expReq: 180,    dmgBonus: 0.35, vfxMul: 1.00, color: '#55ff99', badgeBg: 0x116633 },
  { idx: 2, name: 'Đại Thành',  expReq: 450,    dmgBonus: 0.80, vfxMul: 1.00, color: '#ffd700', badgeBg: 0x886611 },
  { idx: 3, name: 'Viên Mãn',   expReq: 999999, dmgBonus: 1.50, vfxMul: 1.00, color: '#ff44dd', badgeBg: 0x881166 }
];

// HỆ THỐNG KỸ NĂNG DUY NHẤT: 5 SKILL KIẾM GỐC
// Không khai báo lại Hỏa/Lôi/Kim/Mộc/Thủy/Thổ/Phong/Vật Lý ở đây.
export const ELEMENTAL_SKILLS = [
  {
    id: 'kiem_1',
    elem: 'Kiếm',
    stage: 'Luyện Khí',
    minRealm: 0,
    name: 'Kim Nhận Thuật',
    cd: 0,
    dmgMul: 1.6,
    icon: 'skill_kiem_1',
    desc: 'Kiếm thuật Luyện Khí. VFX và cách thi triển dùng trực tiếp hệ Kiếm gốc trong CombatMixin.'
  },
  {
    id: 'kiem_2',
    elem: 'Kiếm',
    stage: 'Trúc Cơ',
    minRealm: 4,
    name: 'Bạch Hổ Canh Kim Kiếm',
    cd: 0,
    dmgMul: 2.6,
    icon: 'skill_kiem_2',
    desc: 'Song Kiếm Khí Chữ X chém bạo kích cực mạnh (260% Công) bám đuổi mục tiêu.'
  },
  {
    id: 'kiem_3',
    elem: 'Kiếm',
    stage: 'Kim Đan',
    minRealm: 8,
    name: 'Thập Nhị Thiên Kiếm Trận',
    cd: 6000,
    dmgMul: 4.2,
    isAoE: true,
    icon: 'skill_kiem_3',
    desc: 'Triệu hồi phi kiếm tạo trận đồ cắm đất gây 6 đợt sát thương diện rộng (tổng 420% Công).'
  },
  {
    id: 'kiem_4',
    elem: 'Kiếm',
    stage: 'Nguyên Anh',
    minRealm: 12,
    name: 'Vạn Kiếm Quy Tông',
    cd: 8000,
    dmgMul: 6.5,
    isAoE: true,
    icon: 'skill_kiem_4',
    desc: 'Vạn kiếm xoay quanh rồi đâm xuyên nhiều hướng, quay đầu 3 lần quét sạch kẻ địch (tổng 650% Công).'
  },
  {
    id: 'kiem_5',
    elem: 'Kiếm',
    stage: 'Hóa Thần',
    minRealm: 16,
    name: 'Thái Canh Tru Tiên Trận',
    cd: 11000,
    dmgMul: 9.5,
    isAoE: true,
    icon: 'skill_kiem_5',
    desc: 'Cự kiếm Tru Tiên giáng thế kết hợp lôi trận 5 giây (tổng 950% Công).'
  }
];
