// 4 BẬC CẢNH GIỚI THUẦN THỤC KỸ NĂNG (MASTERY TIERS - TĂNG LỰC ĐÁNH & SÁT THƯƠNG)
export const SKILL_MASTERY_TIERS = [
  { idx: 0, name: 'Sơ Nhập',   expReq: 50,     dmgBonus: 0.00, vfxMul: 0.65, color: '#aaddff', badgeBg: 0x224466 },
  { idx: 1, name: 'Tiểu Thành', expReq: 180,    dmgBonus: 0.35, vfxMul: 0.82, color: '#55ff99', badgeBg: 0x116633 },
  { idx: 2, name: 'Đại Thành',  expReq: 450,    dmgBonus: 0.80, vfxMul: 1.00, color: '#ffd700', badgeBg: 0x886611 },
  { idx: 3, name: 'Viên Mãn',   expReq: 999999, dmgBonus: 1.50, vfxMul: 1.20, color: '#ff44dd', badgeBg: 0x881166 }
];

// 9 ĐẠI HỆ THẦN THÔNG TU TIÊN (45 THẦN THÔNG)
export const ELEMENTAL_SKILLS = [
  // 1. HỆ KIẾM (KIẾM THUẬT / KIẾM ĐẠO)
  { id: 'kiem_1', elem: 'Kiếm', stage: 'Luyện Khí', minRealm: 0, name: 'Kim Nhận Thuật', cd: 0, dmgMul: 1.6, icon: 'skill_kiem_1', desc: 'Không hồi chiêu. Số phi kiếm tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'kiem_2', elem: 'Kiếm', stage: 'Trúc Cơ', minRealm: 4, name: 'Bạch Hổ Canh Kim Kiếm', cd: 0, dmgMul: 2.6, icon: 'skill_kiem_2', desc: 'Không hồi chiêu. Song Kiếm Khí Chữ X chém bạo kích cực mạnh (260% Công) bám đuổi mục tiêu.' },
  { id: 'kiem_3', elem: 'Kiếm', stage: 'Kim Đan', minRealm: 8, name: 'Thập Nhị Thiên Kiếm Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_kiem_3', desc: 'Triệu hồi 6-12 phi kiếm tạo trận đồ cắm đất gây 6 đợt sát thương diện rộng (tổng 420% Công).' },
  { id: 'kiem_4', elem: 'Kiếm', stage: 'Nguyên Anh', minRealm: 12, name: 'Vạn Kiếm Quy Tông', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_kiem_4', desc: 'Xoay quanh đỉnh đầu rồi đâm xuyên 8 hướng, quay đầu 3 lần quét sạch kẻ địch (tổng 650% Công).' },
  { id: 'kiem_5', elem: 'Kiếm', stage: 'Hóa Thần', minRealm: 16, name: 'Thái Canh Tru Tiên Trận', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_kiem_5', desc: 'Tuyệt đỉnh cự kiếm Tru Tiên giáng thế chấn động kết hợp lôi trận 5s (tổng 950% Công, bán kính tới 600px).' },

  // 2. HỆ HỎA (HỎA DIỄM / CHÂN HỎA)
  { id: 'hoa_1', elem: 'Hỏa', stage: 'Luyện Khí', minRealm: 0, name: 'Hỏa Cầu Thuật', cd: 0, dmgMul: 1.6, icon: 'skill_hoa_1', desc: 'Số hỏa cầu tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'hoa_2', elem: 'Hỏa', stage: 'Trúc Cơ', minRealm: 4, name: 'Liệt Diễm Phần Thiên', cd: 0, dmgMul: 2.6, icon: 'skill_hoa_2', desc: 'Song Hỏa Long Khí chém nổ bạo kích diện rộng cực mạnh (260% Công).' },
  { id: 'hoa_3', elem: 'Hỏa', stage: 'Kim Đan', minRealm: 8, name: 'Tam Muội Chân Hỏa Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_hoa_3', desc: 'Trận đồ Chân Hỏa cắm đất bùng cháy 6 đợt thiêu rụi kinh mạch (420% Công).' },
  { id: 'hoa_4', elem: 'Hỏa', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu Tiêu Thần Hỏa', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_hoa_4', desc: 'Bầy Hỏa Phụng xoay đỉnh đầu rồi lao xuống đâm xuyên 8 hướng 3 lần (650% Công).' },
  { id: 'hoa_5', elem: 'Hỏa', stage: 'Hóa Thần', minRealm: 16, name: 'Hỗn Độn Nghiệp Hỏa', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_hoa_5', desc: 'Cự Hỏa Liên giáng thế nổ 40% + Biển Lửa Nghiệp Hỏa 10 nhịp 5s 60% (tổng 950% Công).' },

  // 3. HỆ LÔI (LÔI ĐIỆN / THẦN LÔI)
  { id: 'loi_1', elem: 'Lôi', stage: 'Luyện Khí', minRealm: 0, name: 'Dẫn Lôi Thuật', cd: 0, dmgMul: 1.6, icon: 'skill_loi_1', desc: 'Số lôi cầu tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'loi_2', elem: 'Lôi', stage: 'Trúc Cơ', minRealm: 4, name: 'Thiên Cương Lôi Kích', cd: 0, dmgMul: 2.6, icon: 'skill_loi_2', desc: 'Chùm sét Thiên Cương chữ X oanh tạc thẳng vào mục tiêu bạo kích (260% Công).' },
  { id: 'loi_3', elem: 'Lôi', stage: 'Kim Đan', minRealm: 8, name: 'Tịch Tà Thần Lôi Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_loi_3', desc: 'Trận đồ Thần Lôi cắm đất giật sét 6 đợt liên hoàn (420% Công).' },
  { id: 'loi_4', elem: 'Lôi', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu Thiên Lôi Ngục', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_loi_4', desc: 'Rồng sét xoay đỉnh đầu rồi oanh tạc 8 hướng 3 lượt quét sạch chiến trường (650% Công).' },
  { id: 'loi_5', elem: 'Lôi', stage: 'Hóa Thần', minRealm: 16, name: 'Tử Tiêu Diệt Thế Lôi', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_loi_5', desc: 'Cột sét tím Tử Tiêu giáng thế chấn động nổ 40% + Lôi Ngục 10 nhịp 5s 60% (950% Công).' },

  // 4. HỆ KIM (KIM LINH PHÁP THUẬT)
  { id: 'kim_1', elem: 'Kim', stage: 'Luyện Khí', minRealm: 0, name: 'Kim Tiễn Quyết', cd: 0, dmgMul: 1.6, icon: 'skill_kim_1', desc: 'Số kim tiễn tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'kim_2', elem: 'Kim', stage: 'Trúc Cơ', minRealm: 4, name: 'Kim Chung Phá Giáp', cd: 0, dmgMul: 2.6, icon: 'skill_kim_2', desc: 'Song Kim Kích chém chéo bạo kích cực mạnh làm vỡ giáp kẻ địch (260% Công).' },
  { id: 'kim_3', elem: 'Kim', stage: 'Kim Đan', minRealm: 8, name: 'Kim Tỏa Trảm Ma Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_kim_3', desc: 'Trận đồ Xích Kim Linh cắm đất tỏa kiếm khí 6 đợt liên hoàn (420% Công).' },
  { id: 'kim_4', elem: 'Kim', stage: 'Nguyên Anh', minRealm: 12, name: 'Thiên Kim Lạc Ba', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_kim_4', desc: 'Mưa kim châm xoay vòng rồi đâm xuyên 8 hướng 3 lượt (650% Công).' },
  { id: 'kim_5', elem: 'Kim', stage: 'Hóa Thần', minRealm: 16, name: 'Càn Khôn Kim Quang Diệt', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_kim_5', desc: 'Bảo tháp Kim Linh Càn Khôn giáng thế chấn động kết hợp thần quang 5s (950% Công).' },

  // 5. HỆ THỦY (BĂNG HÀN / THỦY LINH)
  { id: 'thuy_1', elem: 'Thủy', stage: 'Luyện Khí', minRealm: 0, name: 'Thủy Tiễn Thuật', cd: 0, dmgMul: 1.6, icon: 'skill_thuy_1', desc: 'Số băng tiễn tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'thuy_2', elem: 'Thủy', stage: 'Trúc Cơ', minRealm: 4, name: 'Huyền Băng Đao Pháp', cd: 0, dmgMul: 2.6, icon: 'skill_thuy_2', desc: 'Song đao hàn băng chém bạo kích cực đại (260% Công).' },
  { id: 'thuy_3', elem: 'Thủy', stage: 'Kim Đan', minRealm: 8, name: 'Băng Long Xuất Hải Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_thuy_3', desc: 'Trận đồ Băng Long cắm đất tạo sóng hàn băng 6 đợt (420% Công).' },
  { id: 'thuy_4', elem: 'Thủy', stage: 'Nguyên Anh', minRealm: 12, name: 'Hàn Cực Băng Diễm', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_thuy_4', desc: 'Băng Vũ xoay quanh đầu rồi đâm xuyên 8 hướng 3 lượt đóng băng kẻ địch (650% Công).' },
  { id: 'thuy_5', elem: 'Thủy', stage: 'Hóa Thần', minRealm: 16, name: 'Thiên Địa Băng Phong', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_thuy_5', desc: 'Cực Băng Thần Sơn giáng thế nổ 40% + Băng Phong vạn dặm 10 nhịp 5s 60% (950% Công).' },

  // 6. HỆ PHONG (CUỒNG PHONG / PHONG THUẬT)
  { id: 'phong_1', elem: 'Phong', stage: 'Luyện Khí', minRealm: 0, name: 'Phong Nhẫn Thuật', cd: 0, dmgMul: 1.6, icon: 'skill_phong_1', desc: 'Số phong nhận tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'phong_2', elem: 'Phong', stage: 'Trúc Cơ', minRealm: 4, name: 'Phong Lôi Ảo Ảnh', cd: 0, dmgMul: 2.6, icon: 'skill_phong_2', desc: 'Song đao Cuồng Phong chém bạo kích cực nhanh (260% Công).' },
  { id: 'phong_3', elem: 'Phong', stage: 'Kim Đan', minRealm: 8, name: 'Cuồng Phong Liệt Diệt Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_phong_3', desc: 'Trận đồ Cuồng Phong cắm đất tạo lốc xoáy 6 đợt quét sạch chiến trường (420% Công).' },
  { id: 'phong_4', elem: 'Phong', stage: 'Nguyên Anh', minRealm: 12, name: 'Cửu U Cực Phong', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_phong_4', desc: 'Gió âm cực hàn xoay đỉnh đầu rồi đâm xuyên 8 hướng 3 lượt (650% Công).' },
  { id: 'phong_5', elem: 'Phong', stage: 'Hóa Thần', minRealm: 16, name: 'Hỗn Độn Thần Phong', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_phong_5', desc: 'Hỗn Độn Thần Phong giáng thế chấn động kết hợp phong bạo 5s (950% Công).' },

  // 7. HỆ MỘC (SINH MỆNH / ĐỘC MỘC)
  { id: 'moc_1', elem: 'Mộc', stage: 'Luyện Khí', minRealm: 0, name: 'Thanh Mộc Tiễn', cd: 0, dmgMul: 1.6, icon: 'skill_moc_1', desc: 'Số mộc tiễn tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'moc_2', elem: 'Mộc', stage: 'Trúc Cơ', minRealm: 4, name: 'Mộc Long Trói Buộc', cd: 0, dmgMul: 2.6, icon: 'skill_moc_2', desc: 'Mộc Long quấn siết mục tiêu, gây 260% Công.' },
  { id: 'moc_3', elem: 'Mộc', stage: 'Kim Đan', minRealm: 8, name: 'Vạn Mộc Sinh Linh Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_moc_3', desc: 'Trận đồ Mộc Linh cắm đất gây 6 đợt sát thương diện rộng (420% Công).' },
  { id: 'moc_4', elem: 'Mộc', stage: 'Nguyên Anh', minRealm: 12, name: 'Thanh Đế Mộc Linh', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_moc_4', desc: 'Mộc Linh xoay quanh mục tiêu rồi đâm xuyên nhiều hướng (650% Công).' },
  { id: 'moc_5', elem: 'Mộc', stage: 'Hóa Thần', minRealm: 16, name: 'Kiến Mộc Thông Thiên', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_moc_5', desc: 'Thần Mộc giáng thế kết hợp Mộc Linh phong bạo 5s (950% Công).' },

  // 8. HỆ THỔ (ĐẠI ĐỊA / NÚI ĐÁ)
  { id: 'tho_1', elem: 'Thổ', stage: 'Luyện Khí', minRealm: 0, name: 'Thổ Linh Đạn', cd: 0, dmgMul: 1.6, icon: 'skill_tho_1', desc: 'Số thổ linh đạn tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'tho_2', elem: 'Thổ', stage: 'Trúc Cơ', minRealm: 4, name: 'Địa Liệt Trảm', cd: 0, dmgMul: 2.6, icon: 'skill_tho_2', desc: 'Địa khí chém nứt mặt đất gây 260% Công.' },
  { id: 'tho_3', elem: 'Thổ', stage: 'Kim Đan', minRealm: 8, name: 'Hậu Thổ Trấn Ma Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_tho_3', desc: 'Trận đồ Hậu Thổ gây 6 đợt sát thương diện rộng (420% Công).' },
  { id: 'tho_4', elem: 'Thổ', stage: 'Nguyên Anh', minRealm: 12, name: 'Thái Sơn Áp Đỉnh', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_tho_4', desc: 'Thổ Linh quét nhiều hướng quanh mục tiêu (650% Công).' },
  { id: 'tho_5', elem: 'Thổ', stage: 'Hóa Thần', minRealm: 16, name: 'Địa Mạch Thiên Băng', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_tho_5', desc: 'Địa mạch bùng nổ kết hợp thổ bạo 5s (950% Công).' },

  // 9. HỆ VẬT LÝ (THỂ TU)
  { id: 'ly_1', elem: 'Vật Lý', stage: 'Luyện Khí', minRealm: 0, name: 'Phá Sơn Quyền', cd: 0, dmgMul: 1.6, icon: 'skill_ly_1', desc: 'Số quyền kình tăng theo thuần thục: Sơ Nhập 1 • Tiểu Thành 2 • Đại Thành 4 • Viên Mãn 6; tổng sát thương giữ theo hệ số kỹ năng.' },
  { id: 'ly_2', elem: 'Vật Lý', stage: 'Trúc Cơ', minRealm: 4, name: 'Băng Sơn Kích', cd: 0, dmgMul: 2.6, icon: 'skill_ly_2', desc: 'Quyền kình bạo phát gây 260% Công.' },
  { id: 'ly_3', elem: 'Vật Lý', stage: 'Kim Đan', minRealm: 8, name: 'Kim Cương Phục Ma Trận', cd: 6000, dmgMul: 4.2, isAoE: true, icon: 'skill_ly_3', desc: 'Trận đồ Thể Tu gây 6 đợt sát thương diện rộng (420% Công).' },
  { id: 'ly_4', elem: 'Vật Lý', stage: 'Nguyên Anh', minRealm: 12, name: 'Bá Thể Liên Hoàn', cd: 8000, dmgMul: 6.5, isAoE: true, icon: 'skill_ly_4', desc: 'Liên hoàn quyền ảnh xuyên nhiều hướng quanh mục tiêu (650% Công).' },
  { id: 'ly_5', elem: 'Vật Lý', stage: 'Hóa Thần', minRealm: 16, name: 'Bất Diệt Thần Thể', cd: 11000, dmgMul: 9.5, isAoE: true, icon: 'skill_ly_5', desc: 'Thần thể giáng thế kết hợp chấn động 5s (950% Công).' }
];
