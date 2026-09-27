/**
 * congPhapData.js
 * Hệ Thống Công Pháp Tu Luyện (Cultivation Manuals & Techniques)
 * 
 * Chia làm 4 Phẩm Cấp:
 *  1. Hoàng Giai (Hạ Phẩm)  : Bày bán tại Thôn Dã / Thương Hội, giá 10.000 Lượng Bạc.
 *  2. Huyền Giai (Trung Phẩm): Tàng Kinh Các Môn Phái (Kim Đan)
 *  3. Địa Giai (Thượng Phẩm) : Bí Điển Trấn Phái / Cấm Địa (Nguyên Anh)
 *  4. Thiên Giai (Cực Phẩm)  : Thái Cổ Bí Điển / Hóa Thần Tông Chủ
 */

export const CONG_PHAP_GRADES = {
  'Hoàng Giai': { name: 'Hoàng Giai (Hạ Phẩm)', maxStage: 'Trúc Cơ', maxRealmIdx: 8, color: '#aaddff', colorHex: 0x38bdf8, speed: 2, icon: '📜' },
  'Huyền Giai': { name: 'Huyền Giai (Trung Phẩm)', maxStage: 'Kim Đan', maxRealmIdx: 12, color: '#55ff99', colorHex: 0x4ade80, speed: 6, icon: '📘' },
  'Địa Giai':   { name: 'Địa Giai (Thượng Phẩm)', maxStage: 'Nguyên Anh', maxRealmIdx: 16, color: '#ffd700', colorHex: 0xfacc15, speed: 15, icon: '📙' },
  'Thiên Giai': { name: 'Thiên Giai (Cực Phẩm)', maxStage: 'Hóa Thần', maxRealmIdx: 20, color: '#ff44dd', colorHex: 0xf43f5e, speed: 35, icon: '📕' },
  HOANG: { name: 'Hoàng Giai (Hạ Phẩm)', maxStage: 'Trúc Cơ', maxRealmIdx: 8, color: '#aaddff', colorHex: 0x38bdf8, speed: 2, icon: '📜' },
  HUYEN: { name: 'Huyền Giai (Trung Phẩm)', maxStage: 'Kim Đan', maxRealmIdx: 12, color: '#55ff99', colorHex: 0x4ade80, speed: 6, icon: '📘' },
  DIA:   { name: 'Địa Giai (Thượng Phẩm)', maxStage: 'Nguyên Anh', maxRealmIdx: 16, color: '#ffd700', colorHex: 0xfacc15, speed: 15, icon: '📙' },
  THIEN: { name: 'Thiên Giai (Cực Phẩm)', maxStage: 'Hóa Thần', maxRealmIdx: 20, color: '#ff44dd', colorHex: 0xf43f5e, speed: 35, icon: '📕' }
};

export const CONG_PHAP_LIST = [
  // =========================================================================
  // 0. CÔNG PHÁP NHẬP MÔN (TOÀN HỆ) - BÁN TẠI THÔN (10.000 LƯỢNG BẠC)
  // =========================================================================
  {
    id: 'cp_dan_khi',
    name: 'Dẫn Khí Quyết (Nhập Môn)',
    elem: 'Toàn Hệ',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 2,
    costSilver: 10000,
    villageAvailable: true,
    bonusHpPct: 5,
    bonusDmgPct: 5,
    desc: 'Bí kíp dẫn khí nhập thể cơ bản nhất của phàm nhân thôn dã. Hấp thu thiên địa linh khí, tu luyện tối đa đến Trúc Cơ.'
  },

  // =========================================================================
  // 1. HỆ KIẾM (KIẾM ĐẠO)
  // =========================================================================
  {
    id: 'cp_kiem_hoang',
    name: 'Thanh Nguyên Kiếm Quyết',
    elem: 'Kiếm',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 3,
    costSilver: 10000,
    villageAvailable: true,
    bonusDmgPct: 10,
    bonusCritPct: 5,
    desc: 'Kiếm quyết Thanh Vân Môn lưu truyền tại thôn, ngưng tụ thanh khí thành kiếm mang sắc bén.'
  },
  {
    id: 'cp_kiem_huyen',
    name: 'Thuần Dương Kiếm Điển',
    elem: 'Kiếm',
    grade: 'Huyền Giai',
    maxStage: 'Kim Đan',
    maxRealmIdx: 12,
    speed: 8,
    costGold: 300,
    sectReq: 'van_kiem_tong',
    villageAvailable: false,
    bonusDmgPct: 22,
    bonusCritPct: 10,
    desc: 'Bí điển Vạn Kiếm Tông dung hợp chân dương chi khí vào kiếm thai. Cần gia nhập Vạn Kiếm Tông.'
  },
  {
    id: 'cp_kiem_dia',
    name: 'Thái Canh Kiếm Trận Kinh',
    elem: 'Kiếm',
    grade: 'Địa Giai',
    maxStage: 'Nguyên Anh',
    maxRealmIdx: 16,
    speed: 18,
    costGold: 1200,
    sectReq: 'van_kiem_tong',
    villageAvailable: false,
    bonusDmgPct: 40,
    bonusCritPct: 18,
    desc: 'Tâm pháp ngưng tụ Canh Kim Kiếm Khí thành trận đồ bất diệt chấn động thiên địa.'
  },
  {
    id: 'cp_kiem_thien',
    name: 'Vạn Kiếm Quy Tông Thần Điển',
    elem: 'Kiếm',
    grade: 'Thiên Giai',
    maxStage: 'Hóa Thần',
    maxRealmIdx: 20,
    speed: 40,
    costGold: 5000,
    sectReq: 'van_kiem_tong',
    villageAvailable: false,
    bonusDmgPct: 75,
    bonusCritPct: 30,
    desc: 'Tuyệt thế kiếm điển Thái Cổ, vạn kiếm triều bái, lấy thân làm kiếm phá vỡ hư không.'
  },

  // =========================================================================
  // 2. HỆ HỎA (HỎA DIỄM)
  // =========================================================================
  {
    id: 'cp_hoa_hoang',
    name: 'Liệt Diễm Tâm Kinh',
    elem: 'Hỏa',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 3,
    costSilver: 10000,
    villageAvailable: true,
    bonusDmgPct: 12,
    desc: 'Luyện khí tâm pháp lấy hỏa linh dưỡng khí, đòn đánh kèm hiệu ứng thiêu đốt rực lửa.'
  },
  {
    id: 'cp_hoa_huyen',
    name: 'Cửu Chuyển Liệt Hỏa Kinh',
    elem: 'Hỏa',
    grade: 'Huyền Giai',
    maxStage: 'Kim Đan',
    maxRealmIdx: 12,
    speed: 8,
    costGold: 300,
    sectReq: 'liet_diem_cung',
    villageAvailable: false,
    bonusDmgPct: 25,
    desc: 'Tâm pháp Liệt Diễm Cung rèn luyện chân hỏa qua chín lần chuyển hóa. Cần gia nhập Liệt Diễm Cung.'
  },
  {
    id: 'cp_hoa_dia',
    name: 'Tam Muội Chân Hỏa Điển',
    elem: 'Hỏa',
    grade: 'Địa Giai',
    maxStage: 'Nguyên Anh',
    maxRealmIdx: 16,
    speed: 18,
    costGold: 1200,
    sectReq: 'liet_diem_cung',
    villageAvailable: false,
    bonusDmgPct: 45,
    desc: 'Luyện ra Tam Muội Thần Hỏa từ tâm-thận-khí, thiêu rụi vạn vật cấm kỵ.'
  },
  {
    id: 'cp_hoa_thien',
    name: 'Hỗn Độn Nghiệp Hỏa Thần Điển',
    elem: 'Hỏa',
    grade: 'Thiên Giai',
    maxStage: 'Hóa Thần',
    maxRealmIdx: 20,
    speed: 40,
    costGold: 5000,
    sectReq: 'liet_diem_cung',
    villageAvailable: false,
    bonusDmgPct: 80,
    desc: 'Ngọn lửa Hỗn Độn sơ khai thiêu đốt nghiệp chướng luân hồi thiên địa.'
  },

  // =========================================================================
  // 3. HỆ LÔI (THẦN LÔI)
  // =========================================================================
  {
    id: 'cp_loi_hoang',
    name: 'Lôi Minh Quyết',
    elem: 'Lôi',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 3,
    costSilver: 10000,
    villageAvailable: true,
    bonusCritPct: 8,
    desc: 'Lấy tiếng sấm trời khai mở kinh mạch, gia tăng bạo kích và tốc độ xuất chiêu.'
  },
  {
    id: 'cp_loi_huyen',
    name: 'Thiên Cương Lôi Quyết',
    elem: 'Lôi',
    grade: 'Huyền Giai',
    maxStage: 'Kim Đan',
    maxRealmIdx: 12,
    speed: 8,
    costGold: 300,
    sectReq: 'cuu_thien_loi_dien',
    villageAvailable: false,
    bonusDmgPct: 20,
    bonusCritPct: 12,
    desc: 'Dẫn Thiên Cương Lôi Đình rèn luyện đan điền. Cần gia nhập Cửu Thiên Lôi Điện.'
  },
  {
    id: 'cp_loi_dia',
    name: 'Tịch Tà Thần Lôi Bí Điển',
    elem: 'Lôi',
    grade: 'Địa Giai',
    maxStage: 'Nguyên Anh',
    maxRealmIdx: 16,
    speed: 18,
    costGold: 1200,
    sectReq: 'cuu_thien_loi_dien',
    villageAvailable: false,
    bonusDmgPct: 38,
    bonusCritPct: 20,
    desc: 'Thần lôi màu vàng kim chuyên khắc chế ma đạo và yêu tà bát phương.'
  },
  {
    id: 'cp_loi_thien',
    name: 'Tử Tiêu Diệt Thế Lôi Thần Kinh',
    elem: 'Lôi',
    grade: 'Thiên Giai',
    maxStage: 'Hóa Thần',
    maxRealmIdx: 20,
    speed: 40,
    costGold: 5000,
    sectReq: 'cuu_thien_loi_dien',
    villageAvailable: false,
    bonusDmgPct: 70,
    bonusCritPct: 35,
    desc: 'Tử Tiêu Thần Lôi khai thiên tịch địa, uy lực vô song chấn nhiếp quần hùng.'
  },

  // =========================================================================
  // 4. HỆ THỦY (BĂNG HÀN)
  // =========================================================================
  {
    id: 'cp_thuy_hoang',
    name: 'Thanh Lưu Kinh',
    elem: 'Thủy',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 3,
    costSilver: 10000,
    villageAvailable: true,
    bonusHpPct: 12,
    desc: 'Linh lực êm dịu như dòng suối trong vắt, tăng cường khí huyết sinh mệnh.'
  },
  {
    id: 'cp_thuy_huyen',
    name: 'Huyền Minh Băng Tâm Quyết',
    elem: 'Thủy',
    grade: 'Huyền Giai',
    maxStage: 'Kim Đan',
    maxRealmIdx: 12,
    speed: 8,
    costGold: 300,
    sectReq: 'huyen_bang_cung',
    villageAvailable: false,
    bonusHpPct: 25,
    bonusDefPct: 15,
    desc: 'Tâm cảnh tĩnh lặng như băng hàn vạn trượng. Cần gia nhập Huyền Băng Cung.'
  },
  {
    id: 'cp_thuy_dia',
    name: 'Bắc Minh Chân Khí Điển',
    elem: 'Thủy',
    grade: 'Địa Giai',
    maxStage: 'Nguyên Anh',
    maxRealmIdx: 16,
    speed: 18,
    costGold: 1200,
    sectReq: 'huyen_bang_cung',
    villageAvailable: false,
    bonusHpPct: 45,
    bonusDmgPct: 30,
    desc: 'Dung hợp hàn khí biển Bắc Cực, linh lực dồi dào bất tận.'
  },
  {
    id: 'cp_thuy_thien',
    name: 'Hỗn Độn Băng Hoàng Thần Điển',
    elem: 'Thủy',
    grade: 'Thiên Giai',
    maxStage: 'Hóa Thần',
    maxRealmIdx: 20,
    speed: 40,
    costGold: 5000,
    sectReq: 'huyen_bang_cung',
    villageAvailable: false,
    bonusHpPct: 80,
    bonusDmgPct: 60,
    desc: 'Băng Hoàng Thái Cổ Niết Bàn, sinh mệnh vô tận băng phong vạn lý.'
  },

  // =========================================================================
  // 5. HỆ MỘC (TRƯỜNG SINH)
  // =========================================================================
  {
    id: 'cp_moc_hoang',
    name: 'Trường Sinh Thảo Quyết',
    elem: 'Mộc',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 3,
    costSilver: 10000,
    villageAvailable: true,
    bonusHpPct: 15,
    desc: 'Dưỡng sinh đả tọa hấp thu mộc khí của linh thảo hoa cỏ ngàn năm.'
  },
  {
    id: 'cp_moc_huyen',
    name: 'Bách Thảo Hộ Mệnh Kinh',
    elem: 'Mộc',
    grade: 'Huyền Giai',
    maxStage: 'Kim Đan',
    maxRealmIdx: 12,
    speed: 8,
    costGold: 300,
    sectReq: 'thanh_moc_cac',
    villageAvailable: false,
    bonusHpPct: 30,
    bonusDefPct: 15,
    desc: 'Tâm pháp Thanh Mộc Các dưỡng khí điều hòa. Cần gia nhập Thanh Mộc Các.'
  },
  {
    id: 'cp_moc_dia',
    name: 'Thanh Đế Trường Sinh Điển',
    elem: 'Mộc',
    grade: 'Địa Giai',
    maxStage: 'Nguyên Anh',
    maxRealmIdx: 16,
    speed: 18,
    costGold: 1200,
    sectReq: 'thanh_moc_cac',
    villageAvailable: false,
    bonusHpPct: 55,
    bonusDefPct: 30,
    desc: 'Kế thừa ý chí Thanh Đế, thân thể hóa mộc linh vạn kiếp bất diệt.'
  },
  {
    id: 'cp_moc_thien',
    name: 'Vạn Mộc Hồi Xuân Thần Điển',
    elem: 'Mộc',
    grade: 'Thiên Giai',
    maxStage: 'Hóa Thần',
    maxRealmIdx: 20,
    speed: 40,
    costGold: 5000,
    sectReq: 'thanh_moc_cac',
    villageAvailable: false,
    bonusHpPct: 90,
    bonusDefPct: 50,
    desc: 'Sinh cơ dồi dào hồi sinh vạn vật, đệ nhất thần điển hệ Mộc.'
  },

  // =========================================================================
  // 6. HỆ KIM (KIM LINH)
  // =========================================================================
  {
    id: 'cp_kim_hoang',
    name: 'Kim Cương Quyết',
    elem: 'Kim',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 3,
    costSilver: 10000,
    villageAvailable: true,
    bonusDefPct: 15,
    desc: 'Luyện thể cứng rắn như sắt thép kim loại, đao kiếm khó thương.'
  },
  {
    id: 'cp_kim_huyen',
    name: 'Bạch Hổ Canh Kim Quyết',
    elem: 'Kim',
    grade: 'Huyền Giai',
    maxStage: 'Kim Đan',
    maxRealmIdx: 12,
    speed: 8,
    costGold: 300,
    sectReq: 'kim_quang_tong',
    villageAvailable: false,
    bonusDmgPct: 25,
    bonusDefPct: 20,
    desc: 'Canh Kim Sát Khí của Thần Thú Bạch Hổ xé toạc phòng ngự. Cần gia nhập Kim Quang Tông.'
  },
  {
    id: 'cp_kim_dia',
    name: 'Thái Ất Chân Kim Điển',
    elem: 'Kim',
    grade: 'Địa Giai',
    maxStage: 'Nguyên Anh',
    maxRealmIdx: 16,
    speed: 18,
    costGold: 1200,
    sectReq: 'kim_quang_tong',
    villageAvailable: false,
    bonusDmgPct: 42,
    bonusDefPct: 35,
    desc: 'Khí Thái Ất ngưng tụ kim quang hộ thể đao thương bất nhập.'
  },
  {
    id: 'cp_kim_thien',
    name: 'Càn Khôn Bất Diệt Kim Thân',
    elem: 'Kim',
    grade: 'Thiên Giai',
    maxStage: 'Hóa Thần',
    maxRealmIdx: 20,
    speed: 40,
    costGold: 5000,
    sectReq: 'kim_quang_tong',
    villageAvailable: false,
    bonusDmgPct: 75,
    bonusDefPct: 65,
    desc: 'Kim thân bất hoại vĩnh viễn trường tồn trong thiên địa huyền hoàng.'
  },

  // =========================================================================
  // 7. HỆ PHONG (PHONG THẦN)
  // =========================================================================
  {
    id: 'cp_phong_hoang',
    name: 'Tật Phong Quyết',
    elem: 'Phong',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 3,
    costSilver: 10000,
    villageAvailable: true,
    bonusCritPct: 6,
    desc: 'Hấp thu phong linh nhanh nhẹn như gió thoảng lướt qua lá ngô đồng.'
  },
  {
    id: 'cp_phong_huyen',
    name: 'Ngự Phong Tiên Quyết',
    elem: 'Phong',
    grade: 'Huyền Giai',
    maxStage: 'Kim Đan',
    maxRealmIdx: 12,
    speed: 8,
    costGold: 300,
    sectReq: 'phong_van_tong',
    villageAvailable: false,
    bonusDmgPct: 22,
    bonusCritPct: 12,
    desc: 'Tâm pháp cưỡi gió du ngoạn cửu tiêu. Cần gia nhập Phong Vân Tông.'
  },
  {
    id: 'cp_phong_dia',
    name: 'Hỗn Nguyên Phong Thần Quyết',
    elem: 'Phong',
    grade: 'Địa Giai',
    maxStage: 'Nguyên Anh',
    maxRealmIdx: 16,
    speed: 18,
    costGold: 1200,
    sectReq: 'phong_van_tong',
    villageAvailable: false,
    bonusDmgPct: 40,
    bonusCritPct: 22,
    desc: 'Phong thần cuồng bạo xé rách không gian chiến trường.'
  },
  {
    id: 'cp_phong_thien',
    name: 'Thái Hư Hỗn Độn Phong Thần Kinh',
    elem: 'Phong',
    grade: 'Thiên Giai',
    maxStage: 'Hóa Thần',
    maxRealmIdx: 20,
    speed: 40,
    costGold: 5000,
    sectReq: 'phong_van_tong',
    villageAvailable: false,
    bonusDmgPct: 75,
    bonusCritPct: 35,
    desc: 'Cơn bão Thái Hư hỗn mang khai thiên lập địa bát ngát.'
  },

  // =========================================================================
  // 8. HỆ THỔ (ĐẠI ĐỊA)
  // =========================================================================
  {
    id: 'cp_tho_hoang',
    name: 'Hậu Thổ Công',
    elem: 'Thổ',
    grade: 'Hoàng Giai',
    maxStage: 'Trúc Cơ',
    maxRealmIdx: 8,
    speed: 3,
    costSilver: 10000,
    villageAvailable: true,
    bonusHpPct: 10,
    bonusDefPct: 15,
    desc: 'Tâm pháp mượn thổ linh đại địa gia tăng thể phách và phòng ngự dày dặn.'
  },
  {
    id: 'cp_tho_huyen',
    name: 'Cửu Địa Trọng Lực Điển',
    elem: 'Thổ',
    grade: 'Huyền Giai',
    maxStage: 'Kim Đan',
    maxRealmIdx: 12,
    speed: 8,
    costGold: 300,
    sectReq: 'van_dia_tong',
    villageAvailable: false,
    bonusHpPct: 25,
    bonusDefPct: 25,
    desc: 'Mượn trọng lực lòng đất trấn áp kẻ địch. Cần gia nhập Vạn Địa Tông.'
  },
  {
    id: 'cp_tho_dia',
    name: 'Bàn Cổ Khai Thiên Công',
    elem: 'Thổ',
    grade: 'Địa Giai',
    maxStage: 'Nguyên Anh',
    maxRealmIdx: 16,
    speed: 18,
    costGold: 1200,
    sectReq: 'van_dia_tong',
    villageAvailable: false,
    bonusHpPct: 50,
    bonusDefPct: 40,
    desc: 'Uy lực khai sơn phá thạch dời non lấp bể hùng vĩ.'
  },
  {
    id: 'cp_tho_thien',
    name: 'Huyền Hoàng Bất Tử Thần Công',
    elem: 'Thổ',
    grade: 'Thiên Giai',
    maxStage: 'Hóa Thần',
    maxRealmIdx: 20,
    speed: 40,
    costGold: 5000,
    sectReq: 'van_dia_tong',
    villageAvailable: false,
    bonusHpPct: 90,
    bonusDefPct: 70,
    desc: 'Khí Huyền Hoàng đại địa bất tử bất diệt trường tồn với trời đất.'
  }
];

export function getCongPhapById(id) {
  return CONG_PHAP_LIST.find(cp => cp.id === id) || null;
}
