// 9 ĐẠI TÔNG MÔN TU TIÊN THEO 9 HỆ THẦN THÔNG
export const SECTS = [
  {
    id: 'van_kiem_tong',
    elem: 'Kiếm',
    name: 'Vạn Kiếm Tông',
    title: 'Kiếm Đạo Chí Tôn',
    desc: 'Chuyên tu Kiếm Khí Ngự Kiếm, lấy kiếm nhập đạo, vạn kiếm quy tông sát phạt vô song.',
    buffDesc: '+15% Sát Thương Kiếm Thuật, +5% Bạo Kích',
    bonusDmgMul: 1.15,
    critBonus: 5,
    icon: 'skill_0'
  },
  {
    id: 'thai_bach_tong',
    elem: 'Kim',
    name: 'Thái Bạch Kim Tông',
    title: 'Canh Kim Linh Pháp',
    desc: 'Tu luyện Kim Cương Hộ Thể, ngưng tụ kim linh chi khí hóa tiễn phá hủy vạn pháp.',
    buffDesc: '+15% Sát Thương Hệ Kim, +10% Giáp Hộ Thể',
    bonusDmgMul: 1.15,
    defBonus: 10,
    icon: 'skill_2'
  },
  {
    id: 'liet_diem_cung',
    elem: 'Hỏa',
    name: 'Liệt Diễm Thần Cung',
    title: 'Hỏa Pháp Phần Thiên',
    desc: 'Thuần thục ngự hỏa chi thuật, chân hỏa thiêu rụi kinh mạch đối phương.',
    buffDesc: '+15% Sát Thương Hệ Hỏa, Thiêu đốt giảm 10% Giáp',
    bonusDmgMul: 1.15,
    burnBonus: 10,
    icon: 'skill_3'
  },
  {
    id: 'bang_phach_cac',
    elem: 'Thủy',
    name: 'Băng Phách Tiên Các',
    title: 'Băng Tuyết U Hàn',
    desc: 'Hấp thu hàn khí cửu u, đóng băng vạn dặm và phòng ngự hàn băng tuyệt đỉnh.',
    buffDesc: '+15% Sát Thương Hệ Thủy, +10% Hộ Thể Chân Khí',
    bonusDmgMul: 1.15,
    defBonus: 10,
    icon: 'skill_4'
  },
  {
    id: 'hau_tho_mon',
    elem: 'Thổ',
    name: 'Hậu Thổ Huyền Tông',
    title: 'Bàn Thạch Bất Diệt',
    desc: 'Hợp nhất với đại địa, khí tức trầm ổn, phòng ngự vững chắc không thể phá vỡ.',
    buffDesc: '+25% Sinh Mệnh Tối Đa, +20% Giáp Hộ Thể',
    hpBonus: 25,
    defBonus: 20,
    icon: 'skill_8'
  },
  {
    id: 'thanh_moc_cac',
    elem: 'Mộc',
    name: 'Thanh Mộc Dược Các',
    title: 'Trường Sinh Linh Dược',
    desc: 'Nắm giữ bí quyết Luyện Đan và Thảo Mộc sinh linh, tự hồi phục liên tục.',
    buffDesc: '+20% Hiệu Quả Đan Dược & Hồi Máu, +30% Linh Thảo Dược Điền',
    healBonus: 20,
    herbBonus: 30,
    icon: 'skill_7'
  },
  {
    id: 'phong_loi_cac',
    elem: 'Phong',
    name: 'Thiên Phong Thần Tông',
    title: 'Ngự Phong Thần Hành',
    desc: 'Thân pháp phiêu dật như gió bão, thoắt ẩn thoắt hiện né tránh đòn đánh.',
    buffDesc: '+25% Tốc Độ Xuất Chiêu, +15% Tỷ Lệ Né Tránh',
    spdBonus: 25,
    dodgeBonus: 15,
    icon: 'skill_5'
  },
  {
    id: 'cuu_tieu_loi_dien',
    elem: 'Lôi',
    name: 'Cửu Tiêu Lôi Điện',
    title: 'Thiên Kiếp Thần Lôi',
    desc: 'Chưởng quản sấm sét thiên kiếp, Tịch Tà Thần Lôi khắc chế vạn ma tà đạo.',
    buffDesc: '+20% Sát Thương Hệ Lôi, Sét giáng gây tê liệt',
    bonusDmgMul: 1.20,
    paralyzeBonus: 10,
    icon: 'skill_1'
  },
  {
    id: 'thanh_the_tong',
    elem: 'Vật Lý',
    name: 'Cửu Chuyển Thánh Thể Tông',
    title: 'Nhục Thân Thành Thánh',
    desc: 'Thể tu chí tôn, tôi luyện nhục thân đao thương bất nhập, dời non lấp biển.',
    buffDesc: '+20% Công Kích Vật Lý, +15% Kháng Sát Thương',
    bonusDmgMul: 1.20,
    dmgReduct: 15,
    icon: 'skill_9'
  }
];

export const SECT_RANKS = [
  { id: 0, name: 'Đệ Tử Ngoại Môn', salaryGold: 100, salaryHerb: 5, salaryOre: 2, reqContrib: 0 },
  { id: 1, name: 'Đệ Tử Nội Môn', salaryGold: 300, salaryHerb: 15, salaryOre: 6, reqContrib: 200 },
  { id: 2, name: 'Đệ Tử Chân Truyền', salaryGold: 800, salaryHerb: 35, salaryOre: 15, reqContrib: 600 },
  { id: 3, name: 'Chấp Sự Trưởng Lão', salaryGold: 2000, salaryHerb: 80, salaryOre: 35, reqContrib: 1500 },
  { id: 4, name: 'Thái Thượng Trưởng Lão', salaryGold: 5000, salaryHerb: 200, salaryOre: 80, reqContrib: 3500 }
];
