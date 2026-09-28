// 4 BẬC THUẦN THỤC KỸ NĂNG GỐC
export const SKILL_MASTERY_TIERS = [
  { idx: 0, name: 'Sơ Nhập',   expReq: 50,     dmgBonus: 0.00, vfxMul: 1.00, color: '#aaddff', badgeBg: 0x224466 },
  { idx: 1, name: 'Tiểu Thành', expReq: 180,    dmgBonus: 0.35, vfxMul: 1.00, color: '#55ff99', badgeBg: 0x116633 },
  { idx: 2, name: 'Đại Thành',  expReq: 450,    dmgBonus: 0.80, vfxMul: 1.00, color: '#ffd700', badgeBg: 0x886611 },
  { idx: 3, name: 'Viên Mãn',   expReq: 999999, dmgBonus: 1.50, vfxMul: 1.00, color: '#ff44dd', badgeBg: 0x881166 }
];

// 9 ĐẠI HỆ THẦN THÔNG (45 KỸ NĂNG TU TIÊN) + PHỔ CÔNG CƠ BẢN
export const ELEMENTAL_SKILLS = [
  // 0. PHỔ CÔNG CƠ BẢN (ĐÁNH THƯỜNG CẬN CHIẾN)
  {
    id: 'basic_attack',
    elem: 'Vật Lý',
    stage: 'Phàm Nhân',
    minRealm: 0,
    name: 'Phổ Thông Công Kích',
    cd: 0,
    dmgMul: 1.0,
    icon: 'xianxia_attack',
    desc: 'Đòn đánh vật lý cận chiến cơ bản, vung kiếm trảm kích trực diện kẻ địch gần nhất, không tốn nội lực.'
  },

  // 1. HỆ KIẾM (KIẾM ĐẠO)
  {
    id: 'kiem_1',
    elem: 'Kiếm',
    stage: 'Luyện Khí',
    minRealm: 0,
    name: 'Kim Nhận Thuật',
    cd: 0,
    dmgMul: 1.6,
    icon: 'skill_kiem_1',
    desc: 'Kiếm thuật Luyện Khí. Bắn kiếm khí sắc bén xé gió bám đuổi mục tiêu.'
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
    desc: 'Vạn kiếm xoay quanh rồi đâm xuyên nhiều hướng quét sạch kẻ địch (tổng 650% Công).'
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
  },

  // 2. HỆ KIM
  { id: 'kim_1', elem: 'Kim', stage: 'Luyện Khí', minRealm: 0, name: 'Kim Quang Tiễn', cd: 2000, dmgMul: 1.6, icon: 'skill_kim_1', desc: 'Phóng ra phi đao kim khí sắc bén xuyên mục tiêu.' },
  { id: 'kim_2', elem: 'Kim', stage: 'Trúc Cơ', minRealm: 4, name: 'Bạch Kim Kiếm Khí', cd: 0, dmgMul: 2.5, icon: 'skill_kim_2', desc: 'Kiếm khí Canh Kim xé gió liên tục, xuyên phá phòng ngự.' },
  { id: 'kim_3', elem: 'Kim', stage: 'Kim Đan', minRealm: 8, name: 'Kim Cương Kiếm Trận', cd: 6000, dmgMul: 3.8, isAoE: true, icon: 'skill_kim_3', desc: '12 thanh kiếm xoay tròn tạo sát thương diện rộng.' },
  { id: 'kim_4', elem: 'Kim', stage: 'Nguyên Anh', minRealm: 12, name: 'Đại Canh Kiếm Khí', cd: 8000, dmgMul: 5.6, isAoE: true, icon: 'skill_kim_4', desc: 'Vạn đạo kim kiếm quy tông chém nát yêu ma.' },
  { id: 'kim_5', elem: 'Kim', stage: 'Hóa Thần', minRealm: 16, name: 'Kim Cương Tru Ma Trận', cd: 11000, dmgMul: 8.5, isAoE: true, icon: 'skill_kim_5', desc: 'Tuyệt đỉnh kiếm trận kim linh hủy diệt thiên địa.' },

  // 3. HỆ HỎA
  { id: 'hoa_1', elem: 'Hỏa', stage: 'Luyện Khí', minRealm: 0, name: 'Hỏa Cầu Thuật', cd: 2200, dmgMul: 1.7, icon: 'skill_hoa_1', desc: 'Bắn cầu lửa thiêu đốt mục tiêu liên tục.' },
  { id: 'hoa_2', elem: 'Hỏa', stage: 'Trúc Cơ', minRealm: 4, name: 'Liệt Diễm Xung Kích', cd: 0, dmgMul: 2.6, icon: 'skill_hoa_2', desc: 'Sóng lửa bộc phá công kích liên tục thiêu đốt kẻ địch.' },
  { id: 'hoa_3', elem: 'Hỏa', stage: 'Kim Đan', minRealm: 8, name: 'Tam Muội Chân Hỏa', cd: 5500, dmgMul: 4.2, icon: 'skill_hoa_3', desc: 'Ngọn lửa tam muội bất diệt thiêu hủy kinh mạch.' },
  { id: 'hoa_4', elem: 'Hỏa', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu Tiêu Thần Hỏa', cd: 8500, dmgMul: 6.0, isAoE: true, icon: 'skill_hoa_4', desc: 'Thần hỏa từ chín tầng trời giáng thế nổ diện rộng.' },
  { id: 'hoa_5', elem: 'Hỏa', stage: 'Hóa Thần', minRealm: 16, name: 'Hỗn Độn Nghiệp Hỏa', cd: 11500, dmgMul: 9.0, isAoE: true, icon: 'skill_hoa_5', desc: 'Nghiệp hỏa thiêu đốt cả thần hồn và thể xác.' },

  // 4. HỆ THỦY
  { id: 'thuy_1', elem: 'Thủy', stage: 'Luyện Khí', minRealm: 0, name: 'Thủy Tiễn Thuật', cd: 2000, dmgMul: 1.5, icon: 'skill_thuy_1', desc: 'Ngưng tụ tên nước băng giá công kích đối phương.' },
  { id: 'thuy_2', elem: 'Thủy', stage: 'Trúc Cơ', minRealm: 4, name: 'Huyền Băng Đao Khí', cd: 0, dmgMul: 2.5, icon: 'skill_thuy_2', desc: 'Lưỡi đao hàn băng xé toạc mục tiêu công kích dồn dập.' },
  { id: 'thuy_3', elem: 'Thủy', stage: 'Kim Đan', minRealm: 8, name: 'Băng Long Xuất Hải', cd: 6000, dmgMul: 3.9, isAoE: true, icon: 'skill_thuy_3', desc: 'Rồng băng gầm thét đóng băng toàn bộ kẻ địch.' },
  { id: 'thuy_4', elem: 'Thủy', stage: 'Nguyên Anh', minRealm: 12, name: 'Hàn Cực Băng Diễm', cd: 8000, dmgMul: 5.5, isAoE: true, icon: 'skill_thuy_4', desc: 'Băng diễm cực hàn đóng băng sinh mệnh tức thời.' },
  { id: 'thuy_5', elem: 'Thủy', stage: 'Hóa Thần', minRealm: 16, name: 'Thiên Địa Băng Phong', cd: 11000, dmgMul: 8.2, isAoE: true, icon: 'skill_thuy_5', desc: 'Đóng băng vạn dặm không gian, tuyệt diệt sinh linh.' },

  // 5. HỆ THỔ
  { id: 'tho_1', elem: 'Thổ', stage: 'Luyện Khí', minRealm: 0, name: 'Địa Xung Ba', cd: 2500, dmgMul: 1.6, icon: 'skill_tho_1', desc: 'Sóng xung kích từ lòng đất làm choáng kẻ địch.' },
  { id: 'tho_2', elem: 'Thổ', stage: 'Trúc Cơ', minRealm: 4, name: 'Địa Nham Liệt Phách', cd: 0, dmgMul: 2.5, icon: 'skill_tho_2', desc: 'Đá tảng nham thạch oanh kích liên hoàn nghiền nát kẻ địch.' },
  { id: 'tho_3', elem: 'Thổ', stage: 'Kim Đan', minRealm: 8, name: 'Địa Long Thôn Thiên', cd: 6200, dmgMul: 4.0, icon: 'skill_tho_3', desc: 'Địa long trồi lên từ lòng đất cắn nuốt mục tiêu.' },
  { id: 'tho_4', elem: 'Thổ', stage: 'Nguyên Anh', minRealm: 12, name: 'Thiên Băng Địa Liệt', cd: 8500, dmgMul: 5.8, isAoE: true, icon: 'skill_tho_4', desc: 'Đất đá sụp đổ tạo sát thương chấn động cực lớn.' },
  { id: 'tho_5', elem: 'Thổ', stage: 'Hóa Thần', minRealm: 16, name: 'Huyền Hoàng Bất Diệt', cd: 12000, dmgMul: 8.0, isAoE: true, icon: 'skill_tho_5', desc: 'Khí Huyền Hoàng bảo hộ bất tử, phản chấn sát thương.' },

  // 6. HỆ MỘC
  { id: 'moc_1', elem: 'Mộc', stage: 'Luyện Khí', minRealm: 0, name: 'Mộc Gai Thứ', cd: 2200, dmgMul: 1.5, icon: 'skill_moc_1', desc: 'Gai nhọn từ mặt đất trói chân và đâm xuyên mục tiêu.' },
  { id: 'moc_2', elem: 'Mộc', stage: 'Trúc Cơ', minRealm: 4, name: 'Thanh Mộc Kiếm Khí', cd: 0, dmgMul: 2.5, icon: 'skill_moc_2', desc: 'Mộc kiếm sắc bén bắn liên tục xuyên thấu sinh linh.' },
  { id: 'moc_3', elem: 'Mộc', stage: 'Kim Đan', minRealm: 8, name: 'Vạn Độc Cổ Đằng', cd: 5800, dmgMul: 3.7, icon: 'skill_moc_3', desc: 'Dây leo cổ thụ mang độc tố cắn nuốt chân nguyên.' },
  { id: 'moc_4', elem: 'Mộc', stage: 'Nguyên Anh', minRealm: 12, name: 'Thanh Mộc Thần Lôi', cd: 8000, dmgMul: 5.4, isAoE: true, icon: 'skill_moc_4', desc: 'Lôi điện mộc linh vừa sát thương vừa hút máu hồi phục.' },
  { id: 'moc_5', elem: 'Mộc', stage: 'Hóa Thần', minRealm: 16, name: 'Vạn Vật Tái Sinh', cd: 11000, dmgMul: 7.8, healPct: 0.6, isAoE: true, icon: 'skill_moc_5', desc: 'Tái sinh vạn vật, hồi phục 60% HP và bùng nổ sát thương.' },

  // 7. HỆ PHONG
  { id: 'phong_1', elem: 'Phong', stage: 'Luyện Khí', minRealm: 0, name: 'Phong Nhẫn Thuật', cd: 1800, dmgMul: 1.5, icon: 'skill_phong_1', desc: 'Lưỡi đao gió sắc lẹm chém đứt không khí.' },
  { id: 'phong_2', elem: 'Phong', stage: 'Trúc Cơ', minRealm: 4, name: 'Cuồng Phong Liệt Trảm', cd: 0, dmgMul: 2.5, icon: 'skill_phong_2', desc: 'Lưỡi đao gió cuồng phong xé toạc không gian tấn công dồn dập.' },
  { id: 'phong_3', elem: 'Phong', stage: 'Kim Đan', minRealm: 8, name: 'Cuồng Phong Liệt Diệt', cd: 6000, dmgMul: 3.9, isAoE: true, icon: 'skill_phong_3', desc: 'Lốc xoáy cuồng phong cuốn phăng toàn bộ kẻ địch.' },
  { id: 'phong_4', elem: 'Phong', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu U Cực Phong', cd: 7800, dmgMul: 5.7, isAoE: true, icon: 'skill_phong_4', desc: 'Gió âm cực hàn cắt nát kinh mạch kẻ địch.' },
  { id: 'phong_5', elem: 'Phong', stage: 'Hóa Thần', minRealm: 16, name: 'Hỗn Độn Thần Phong', cd: 10500, dmgMul: 8.6, isAoE: true, icon: 'skill_phong_5', desc: 'Gió bão hỗn độn xé toạc vết nứt không gian.' },

  // 8. HỆ LÔI
  { id: 'loi_1', elem: 'Lôi', stage: 'Luyện Khí', minRealm: 0, name: 'Dẫn Lôi Thuật', cd: 2200, dmgMul: 1.8, icon: 'skill_loi_1', desc: 'Kêu gọi tia sét giáng xuống làm tê liệt đối phương.' },
  { id: 'loi_2', elem: 'Lôi', stage: 'Trúc Cơ', minRealm: 4, name: 'Thiên Cương Lôi Kích', cd: 0, dmgMul: 2.7, icon: 'skill_loi_2', desc: 'Chùm sét thiên cương oanh tạc liên hoàn giáng xuống mục tiêu.' },
  { id: 'loi_3', elem: 'Lôi', stage: 'Kim Đan', minRealm: 8, name: 'Tịch Tà Thần Lôi', cd: 5500, dmgMul: 4.5, isAoE: true, icon: 'skill_loi_3', desc: 'Sấm sét vàng kim khắc chế ma đạo, sát thương cực lớn.' },
  { id: 'loi_4', elem: 'Lôi', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu Thiên Lôi Ngục', cd: 8000, dmgMul: 6.2, isAoE: true, icon: 'skill_loi_4', desc: 'Lưới sét bao phủ chiến trường oanh tạc liên tục.' },
  { id: 'loi_5', elem: 'Lôi', stage: 'Hóa Thần', minRealm: 16, name: 'Tử Tiêu Diệt Thế Lôi', cd: 11000, dmgMul: 9.2, isAoE: true, icon: 'skill_loi_5', desc: 'Sấm sét tím tối thượng diệt thế lục đạo.' },

  // 9. HỆ VẬT LÝ (THỂ TU / VÕ ĐẠO)
  { id: 'ly_1', elem: 'Vật Lý', stage: 'Luyện Khí', minRealm: 0, name: 'Bá Vương Quyền', cd: 1800, dmgMul: 1.7, icon: 'skill_ly_1', desc: 'Quyền kình vũ bão nện nứt đá, gây bạo kích.' },
  { id: 'ly_2', elem: 'Vật Lý', stage: 'Trúc Cơ', minRealm: 4, name: 'Hám Thiên Phá Sơn Quyền', cd: 0, dmgMul: 2.6, icon: 'skill_ly_2', desc: 'Quyền kình phá sơn nện liên hoàn tạo chấn động cực mạnh.' },
  { id: 'ly_3', elem: 'Vật Lý', stage: 'Kim Đan', minRealm: 8, name: 'Kim Cang Phục Ma Quyền', cd: 5200, dmgMul: 4.1, icon: 'skill_ly_3', desc: 'Đòn đấm kim cang tạo sóng xung kích cực mạnh.' },
  { id: 'ly_4', elem: 'Vật Lý', stage: 'Nguyên Anh', minRealm: 12, name: 'Bất Diệt Chân Thân', cd: 8500, dmgMul: 5.9, isAoE: true, icon: 'skill_ly_4', desc: 'Hóa thân khổng lồ, bùng nổ 100% bạo kích.' },
  { id: 'ly_5', elem: 'Vật Lý', stage: 'Hóa Thần', minRealm: 16, name: 'Phạm Thánh Thần Ma Thể', cd: 11500, dmgMul: 8.8, isAoE: true, icon: 'skill_ly_5', desc: 'Thể tu chí tôn đao thương bất nhập, sát thương cực hạn.' }
];
