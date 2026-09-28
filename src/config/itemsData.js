/**
 * itemsData.js — Hệ Thống Trang Bị & Pháp Bảo Tu Tiên
 * =====================================================
 * type: weapon | armor | helm | boots | amulet | shield | ring | cloak
 * rank: 0=Phàm | 1=Nhất | 2=Nhị | 3=Tam | 4=Tứ | 5=Ngũ
 * grade: 'Hạ Phẩm' | 'Trung Phẩm' | 'Thượng Phẩm' | 'Cực Phẩm'
 * Tổng: 210+ item đầy đủ cho 6 cảnh giới
 */

// ═══════════════════════════════════════════════════
// PHÀM CẤP (rank 0) — Trang bị phàm nhân thông thường
// ═══════════════════════════════════════════════════
export const PHAM_ITEMS = [
  // --- VŨ KHÍ (3) ---
  { id:100, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Thô Sắt Kiếm', type:'weapon', bonusDmg:6, bonusHp:0, bonusDef:0, bonusSpd:0, icon:'icon_w_1', price:30, desc:'Kiếm sắt thô rèn thủ công, lưỡi thô nhưng chắc chắn.' },
  { id:101, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Mộc Côn Phàm', type:'weapon', bonusDmg:5, bonusHp:30, bonusDef:0, bonusSpd:3, icon:'icon_w_2', price:25, desc:'Gậy gỗ cứng được bọc sắt đầu côn, linh hoạt tấn công.' },
  { id:102, rank:0, rankName:'Phàm Cấp', grade:'Trung Phẩm', name:'Đồng Đao Phàm', type:'weapon', bonusDmg:12, bonusHp:0, bonusDef:0, bonusSpd:0, icon:'icon_w_3', price:60, desc:'Đao đồng đúc khuôn, sắc bén hơn sắt thô đáng kể.' },
  // --- GIÁP (3) ---
  { id:103, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Vải Bào Phàm', type:'armor', bonusDmg:0, bonusHp:60, bonusDef:2, bonusSpd:0, icon:'icon_a_1', price:25, desc:'Áo vải thô dệt dày, bảo vệ cơ bản khỏi gió lạnh.' },
  { id:104, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Da Thú Giáp', type:'armor', bonusDmg:0, bonusHp:90, bonusDef:4, bonusSpd:0, icon:'icon_a_2', price:45, desc:'Giáp da dã thú thuộc da thủ công, chắc chắn hơn vải.' },
  { id:105, rank:0, rankName:'Phàm Cấp', grade:'Trung Phẩm', name:'Đồng Phiến Trụ Giáp', type:'armor', bonusDmg:0, bonusHp:150, bonusDef:8, bonusSpd:0, icon:'icon_a_3', price:100, desc:'Giáp đồng ghép phiến, phòng thủ tốt cho lính phàm.' },
  // --- MŨ (2) ---
  { id:106, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Mão Sắt Phàm', type:'helm', bonusDmg:0, bonusHp:30, bonusDef:3, bonusSpd:0, icon:'icon_h_1', price:20, desc:'Mũ sắt đơn giản bảo vệ đầu.' },
  { id:107, rank:0, rankName:'Phàm Cấp', grade:'Trung Phẩm', name:'Đầu Giáp Đồng', type:'helm', bonusDmg:0, bonusHp:60, bonusDef:6, bonusSpd:0, icon:'icon_h_2', price:55, desc:'Mũ giáp đồng đúc liền, bảo vệ toàn bộ đầu mặt.' },
  // --- GIÀY (2) ---
  { id:108, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Giày Da Thô', type:'boots', bonusDmg:0, bonusHp:0, bonusDef:1, bonusSpd:4, icon:'icon_b_1', price:18, desc:'Giày da bò thô, bảo vệ chân khi di chuyển địa hình.' },
  { id:109, rank:0, rankName:'Phàm Cấp', grade:'Trung Phẩm', name:'Hài Đồng Phàm', type:'boots', bonusDmg:0, bonusHp:0, bonusDef:3, bonusSpd:7, icon:'icon_b_2', price:50, desc:'Đế hài đồng mỏng nhẹ, tăng tốc độ di chuyển đáng kể.' },
  // --- TRANG SỨC (2) ---
  { id:110, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Vòng Đồng Phàm', type:'amulet', bonusDmg:3, bonusHp:40, bonusDef:0, bonusSpd:0, icon:'icon_am_1', price:30, desc:'Vòng đồng khắc hoa văn, mang lại chút may mắn nhỏ.' },
  { id:111, rank:0, rankName:'Phàm Cấp', grade:'Trung Phẩm', name:'Bùa Hộ Mệnh Phàm', type:'amulet', bonusDmg:5, bonusHp:80, bonusDef:2, bonusSpd:0, icon:'icon_am_2', price:70, desc:'Bùa khắc chữ bình an của thầy bói phàm nhân, chút linh khí mỏng.' },
  // --- KHIÊN (2) ---
  { id:112, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Khiên Gỗ Phàm', type:'shield', bonusDmg:0, bonusHp:30, bonusDef:5, bonusSpd:0, icon:'icon_sh_1', price:22, desc:'Khiên gỗ cứng bọc da, tuy nhẹ nhưng giảm đòn tốt.' },
  { id:113, rank:0, rankName:'Phàm Cấp', grade:'Trung Phẩm', name:'Khiên Đồng Phàm', type:'shield', bonusDmg:0, bonusHp:60, bonusDef:10, bonusSpd:0, icon:'icon_sh_2', price:65, desc:'Khiên đồng đúc tròn, chặn được cung tên thông thường.' },
  // --- NHẪN (2) ---
  { id:114, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Nhẫn Đồng Trơn', type:'ring', bonusDmg:2, bonusHp:20, bonusDef:0, bonusSpd:0, icon:'icon_r_1', price:15, desc:'Nhẫn đồng đơn giản, không có linh lực nhưng trơn bóng.' },
  { id:115, rank:0, rankName:'Phàm Cấp', grade:'Trung Phẩm', name:'Nhẫn Sắt Khắc Văn', type:'ring', bonusDmg:4, bonusHp:40, bonusDef:1, bonusSpd:0, icon:'icon_r_2', price:40, desc:'Nhẫn sắt khắc hoa văn hình vuông, chứa chút linh tinh nhỏ.' },
  // --- ÁO CHOÀNG (2) ---
  { id:116, rank:0, rankName:'Phàm Cấp', grade:'Hạ Phẩm', name:'Phong Bào Thô Phàm', type:'cloak', bonusDmg:0, bonusHp:40, bonusDef:2, bonusSpd:3, icon:'icon_cl_1', price:20, desc:'Áo choàng vải thô che gió, không có linh lực đặc biệt.' },
  { id:117, rank:0, rankName:'Phàm Cấp', grade:'Trung Phẩm', name:'Áo Choàng Da Thú', type:'cloak', bonusDmg:0, bonusHp:80, bonusDef:4, bonusSpd:5, icon:'icon_cl_2', price:55, desc:'Áo choàng da thú giữ ấm và tăng phản xạ nhẹ.' },
];

// ═══════════════════════════════════════════════════
// NHẤT PHẨM (rank 1) — Pháp Khí Luyện Khí Kỳ
// ═══════════════════════════════════════════════════
export const NHAT_PHAM_ITEMS = [
  // --- VŨ KHÍ (5) ---
  { id:120, rank:1, rankName:'Nhất Phẩm', grade:'Hạ Phẩm', name:'Nguyên Lực Phi Kiếm', type:'weapon', bonusDmg:22, bonusHp:0, bonusDef:0, bonusSpd:5, icon:'icon_w_4', price:280, desc:'Kiếm sơ cấp ngưng tụ linh khí mỏng, có thể điều khiển bay.' },
  { id:121, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Linh Thiết Kiếm', type:'weapon', bonusDmg:42, bonusHp:0, bonusDef:0, bonusSpd:8, icon:'icon_w_5', price:600, desc:'Kiếm linh thiết chứa linh khi sơ cấp, sắc bén hơn sắt thường x5.' },
  { id:122, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Hỏa Tinh Trượng', type:'weapon', bonusDmg:38, bonusHp:50, bonusDef:0, bonusSpd:0, icon:'icon_w_6', price:550, desc:'Trượng pháp nhúng tinh hỏa, tấn công phép hỏa hệ sơ cấp.' },
  { id:123, rank:1, rankName:'Nhất Phẩm', grade:'Thượng Phẩm', name:'Linh Phong Phi Kiếm', type:'weapon', bonusDmg:72, bonusHp:0, bonusDef:0, bonusSpd:15, icon:'icon_w_7', price:1200, desc:'Phi kiếm linh phong sắc bén, tốc độ tấn công vượt trội.' },
  { id:124, rank:1, rankName:'Nhất Phẩm', grade:'Thượng Phẩm', name:'Hàn Ngọc Thương', type:'weapon', bonusDmg:65, bonusHp:0, bonusDef:5, bonusSpd:10, icon:'icon_w_8', price:1100, desc:'Thương ngọc hàn khí, mỗi đòn làm chậm mục tiêu nhẹ.' },
  { id:125, rank:1, rankName:'Nhất Phẩm', grade:'Cực Phẩm', name:'Huyền Thiết Lôi Kiếm', type:'weapon', bonusDmg:120, bonusHp:0, bonusDef:0, bonusSpd:18, icon:'icon_w_9', price:2500, desc:'Kiếm huyền thiết mang lôi khí, cực phẩm Nhất Phẩm uy lực.' },
  // --- GIÁP (5) ---
  { id:126, rank:1, rankName:'Nhất Phẩm', grade:'Hạ Phẩm', name:'Linh Vân Đạo Bào', type:'armor', bonusDmg:0, bonusHp:280, bonusDef:10, bonusSpd:0, icon:'icon_a_4', price:270, desc:'Đạo bào linh vân nhẹ nhàng, tích hợp linh trận bảo vệ.' },
  { id:127, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Linh Thiết Mãnh Giáp', type:'armor', bonusDmg:0, bonusHp:450, bonusDef:20, bonusSpd:0, icon:'icon_a_5', price:580, desc:'Giáp linh thiết rèn theo phép tắc, phòng thủ tốt Luyện Khí.' },
  { id:128, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Hỏa Linh Chân Y', type:'armor', bonusDmg:10, bonusHp:350, bonusDef:12, bonusSpd:0, icon:'icon_a_6', price:500, desc:'Áo linh hỏa chống lửa và tăng thêm công lực hỏa hệ.' },
  { id:129, rank:1, rankName:'Nhất Phẩm', grade:'Thượng Phẩm', name:'Linh Thiết Hộ Thể Giáp', type:'armor', bonusDmg:0, bonusHp:600, bonusDef:28, bonusSpd:0, icon:'icon_a_7', price:1100, desc:'Giáp hộ thể linh thiết ngưng tụ linh trận phòng thủ 360°.' },
  { id:130, rank:1, rankName:'Nhất Phẩm', grade:'Cực Phẩm', name:'Bách Linh Hộ Thể Giáp', type:'armor', bonusDmg:15, bonusHp:800, bonusDef:40, bonusSpd:5, icon:'icon_a_8', price:2400, desc:'Giáp cực phẩm Nhất Phẩm trăm linh hội tụ, công thủ toàn diện.' },
  // --- MŨ (4) ---
  { id:131, rank:1, rankName:'Nhất Phẩm', grade:'Hạ Phẩm', name:'Linh Ngọc Quan', type:'helm', bonusDmg:0, bonusHp:100, bonusDef:14, bonusSpd:0, icon:'icon_h_3', price:240, desc:'Mão ngọc linh khai mở trí tuệ, tăng tốc độ tu luyện nhẹ.' },
  { id:132, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Huyền Thiết Đầu Quan', type:'helm', bonusDmg:0, bonusHp:180, bonusDef:25, bonusSpd:0, icon:'icon_h_4', price:480, desc:'Quan huyền thiết bảo vệ thần thức khỏi tấn công tinh thần.' },
  { id:133, rank:1, rankName:'Nhất Phẩm', grade:'Thượng Phẩm', name:'Tụ Linh Linh Mão', type:'helm', bonusDmg:5, bonusHp:250, bonusDef:32, bonusSpd:0, icon:'icon_h_5', price:950, desc:'Mão tụ linh khi, tăng tốc hấp thụ linh khí thiên nhiên.' },
  { id:134, rank:1, rankName:'Nhất Phẩm', grade:'Cực Phẩm', name:'Linh Phong Đầu Trụ', type:'helm', bonusDmg:0, bonusHp:350, bonusDef:45, bonusSpd:8, icon:'icon_h_6', price:2000, desc:'Đầu trụ linh phong nhẹ nhàng, tốc phản ứng tăng mạnh.' },
  // --- GIÀY (4) ---
  { id:135, rank:1, rankName:'Nhất Phẩm', grade:'Hạ Phẩm', name:'Ngự Phong Hài', type:'boots', bonusDmg:0, bonusHp:0, bonusDef:5, bonusSpd:20, icon:'icon_b_3', price:210, desc:'Hài ngự phong, nhẹ như mây tốc độ di chuyển tăng rõ rệt.' },
  { id:136, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Vân Bộ Linh Hài', type:'boots', bonusDmg:0, bonusHp:80, bonusDef:8, bonusSpd:30, icon:'icon_b_4', price:500, desc:'Hài mây bộ, bước đi nhẹ nhàng như đạp mây.' },
  { id:137, rank:1, rankName:'Nhất Phẩm', grade:'Thượng Phẩm', name:'Tốc Phong Linh Hài', type:'boots', bonusDmg:0, bonusHp:60, bonusDef:12, bonusSpd:45, icon:'icon_b_5', price:1000, desc:'Hài tốc phong, tốc độ đi chuyển gần gấp đôi bình thường.' },
  { id:138, rank:1, rankName:'Nhất Phẩm', grade:'Cực Phẩm', name:'Linh Thiết Trọng Hài', type:'boots', bonusDmg:10, bonusHp:150, bonusDef:20, bonusSpd:55, icon:'icon_b_6', price:2200, desc:'Hài linh thiết kết hợp công thủ và tốc độ, cực phẩm Nhất Phẩm.' },
  // --- TRANG SỨC (4) ---
  { id:139, rank:1, rankName:'Nhất Phẩm', grade:'Hạ Phẩm', name:'Tụ Linh Ngọc Bội', type:'amulet', bonusDmg:35, bonusHp:180, bonusDef:0, bonusSpd:0, icon:'icon_am_3', price:700, desc:'Ngọc bội tụ linh khí, tăng cả công lực và sinh mệnh.' },
  { id:140, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Hỏa Linh Ngọc Bội', type:'amulet', bonusDmg:55, bonusHp:150, bonusDef:0, bonusSpd:0, icon:'icon_am_4', price:950, desc:'Ngọc bội hỏa linh, tăng mạnh tấn công hỏa hệ.' },
  { id:141, rank:1, rankName:'Nhất Phẩm', grade:'Thượng Phẩm', name:'Hàn Băng Linh Ngọc', type:'amulet', bonusDmg:40, bonusHp:280, bonusDef:10, bonusSpd:0, icon:'icon_am_5', price:1400, desc:'Ngọc hàn băng phát tinh quang lạnh lẽo, vừa công vừa thủ.' },
  { id:142, rank:1, rankName:'Nhất Phẩm', grade:'Cực Phẩm', name:'Song Linh Cực Phẩm Bội', type:'amulet', bonusDmg:75, bonusHp:400, bonusDef:15, bonusSpd:0, icon:'icon_am_6', price:2800, desc:'Ngọc bội song linh cực phẩm, tổng hợp sức mạnh mọi hệ.' },
  // --- KHIÊN (4) ---
  { id:143, rank:1, rankName:'Nhất Phẩm', grade:'Hạ Phẩm', name:'Hộ Thể Linh Thuẫn', type:'shield', bonusDmg:0, bonusHp:150, bonusDef:28, bonusSpd:0, icon:'icon_sh_3', price:280, desc:'Thuẫn linh khi hộ thể sơ cấp, phản đòn nhỏ khi bị tấn công.' },
  { id:144, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Thiên Linh Khiên', type:'shield', bonusDmg:0, bonusHp:250, bonusDef:45, bonusSpd:0, icon:'icon_sh_4', price:620, desc:'Khiên linh thiết Nhất Phẩm, cản được hầu hết vũ khí phàm cấp.' },
  { id:145, rank:1, rankName:'Nhất Phẩm', grade:'Thượng Phẩm', name:'Hỏa Linh Hộ Thuẫn', type:'shield', bonusDmg:5, bonusHp:350, bonusDef:60, bonusSpd:0, icon:'icon_sh_5', price:1200, desc:'Thuẫn hỏa linh tạo rào lửa khi phản đòn, gây thêm hỏa thương.' },
  { id:146, rank:1, rankName:'Nhất Phẩm', grade:'Cực Phẩm', name:'Hàn Băng Cực Phẩm Thuẫn', type:'shield', bonusDmg:0, bonusHp:500, bonusDef:80, bonusSpd:0, icon:'icon_sh_6', price:2600, desc:'Thuẫn hàn băng cực phẩm, đóng băng kẻ tấn công khi phản đòn.' },
  // --- NHẪN (3) ---
  { id:147, rank:1, rankName:'Nhất Phẩm', grade:'Hạ Phẩm', name:'Linh Ngọc Nhẫn', type:'ring', bonusDmg:14, bonusHp:70, bonusDef:0, bonusSpd:0, icon:'icon_r_3', price:380, desc:'Nhẫn ngọc linh khi sơ cấp, tăng nhẹ công lực và sinh mệnh.' },
  { id:148, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Tụ Khí Thần Nhẫn', type:'ring', bonusDmg:25, bonusHp:120, bonusDef:5, bonusSpd:0, icon:'icon_r_4', price:750, desc:'Nhẫn tụ khí giúp hấp thụ linh khí nhanh hơn trong tu luyện.' },
  { id:149, rank:1, rankName:'Nhất Phẩm', grade:'Cực Phẩm', name:'Song Hỏa Linh Nhẫn', type:'ring', bonusDmg:50, bonusHp:200, bonusDef:8, bonusSpd:5, icon:'icon_r_5', price:2000, desc:'Đôi nhẫn hỏa linh cực phẩm, đeo cặp thêm hiệu quả cộng hưởng.' },
  // --- ÁO CHOÀNG (3) ---
  { id:150, rank:1, rankName:'Nhất Phẩm', grade:'Hạ Phẩm', name:'Linh Phong Đạo Bào', type:'cloak', bonusDmg:0, bonusHp:180, bonusDef:10, bonusSpd:12, icon:'icon_cl_3', price:320, desc:'Đạo bào linh phong nhẹ nhàng, che linh thân và tăng tốc bộ.' },
  { id:151, rank:1, rankName:'Nhất Phẩm', grade:'Trung Phẩm', name:'Tốc Phong Phong Bào', type:'cloak', bonusDmg:0, bonusHp:250, bonusDef:15, bonusSpd:22, icon:'icon_cl_4', price:680, desc:'Phong bào tốc phong, khi di chuyển toả linh quang mờ ảo.' },
  { id:152, rank:1, rankName:'Nhất Phẩm', grade:'Cực Phẩm', name:'Linh Khí Mạn Y Cực Phẩm', type:'cloak', bonusDmg:10, bonusHp:400, bonusDef:25, bonusSpd:35, icon:'icon_cl_5', price:2200, desc:'Mạn y linh khí cực phẩm, tổng hợp mọi ưu điểm của áo linh.' },
];

// ═══════════════════════════════════════════════════
// NHỊ PHẨM (rank 2) — Pháp Khí Trúc Cơ Kỳ
// ═══════════════════════════════════════════════════
export const NHI_PHAM_ITEMS = [
  // --- VŨ KHÍ (5) ---
  { id:160, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Chân Nguyên Phi Kiếm', type:'weapon', bonusDmg:260, bonusHp:0, bonusDef:0, bonusSpd:25, icon:'icon_w_10', price:3800, desc:'Phi kiếm chân nguyên Trúc Cơ, cắt xé linh khí đối phương.' },
  { id:161, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Thiên Cương Trường Thương', type:'weapon', bonusDmg:240, bonusHp:100, bonusDef:8, bonusSpd:10, icon:'icon_w_11', price:3500, desc:'Thương thiên cương dài 3 trượng, tầm đánh xa đáng kể.' },
  { id:162, rank:2, rankName:'Nhị Phẩm', grade:'Trung Phẩm', name:'Hỏa Diễm Long Kiếm', type:'weapon', bonusDmg:480, bonusHp:0, bonusDef:0, bonusSpd:20, icon:'icon_w_12', price:7500, desc:'Kiếm long hỏa diễm, mỗi nhát chém kèm theo sóng hỏa ảnh.' },
  { id:163, rank:2, rankName:'Nhị Phẩm', grade:'Thượng Phẩm', name:'Hàn Băng Thần Kiếm', type:'weapon', bonusDmg:750, bonusHp:0, bonusDef:10, bonusSpd:35, icon:'icon_w_13', price:13000, desc:'Kiếm hàn băng đóng đông không gian khi chém, đối phương chậm lại.' },
  { id:164, rank:2, rankName:'Nhị Phẩm', grade:'Cực Phẩm', name:'Tích Lôi Băng Ảo Kiếm', type:'weapon', bonusDmg:1400, bonusHp:0, bonusDef:0, bonusSpd:50, icon:'icon_w_14', price:30000, desc:'Kiếm lôi băng đỉnh phong Nhị Phẩm, sấm chớp và băng giá hợp nhất.' },
  // --- GIÁP (5) ---
  { id:165, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Bích Ngọc Linh Giáp', type:'armor', bonusDmg:0, bonusHp:3200, bonusDef:110, bonusSpd:0, icon:'icon_a_9', price:3500, desc:'Giáp ngọc bích tỏa mộc linh khí, bổ trợ khả năng hồi phục.' },
  { id:166, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Thiết Giáp Kim Quang', type:'armor', bonusDmg:20, bonusHp:2800, bonusDef:150, bonusSpd:0, icon:'icon_a_10', price:4000, desc:'Giáp thiết kim quang tỏa sáng, kiên cố như tường thành.' },
  { id:167, rank:2, rankName:'Nhị Phẩm', grade:'Trung Phẩm', name:'Hỏa Diễm Hộ Thể Y', type:'armor', bonusDmg:50, bonusHp:4000, bonusDef:160, bonusSpd:0, icon:'icon_a_11', price:8000, desc:'Áo hộ thể hỏa diễm, tỏa nhiệt khí gây hỏa thương kẻ tiếp cận.' },
  { id:168, rank:2, rankName:'Nhị Phẩm', grade:'Thượng Phẩm', name:'Hàn Băng Trụ Giáp', type:'armor', bonusDmg:0, bonusHp:6500, bonusDef:280, bonusSpd:0, icon:'icon_a_12', price:14000, desc:'Giáp băng trụ đóng đông tấn công vật lý, phòng thủ cực cao.' },
  { id:169, rank:2, rankName:'Nhị Phẩm', grade:'Cực Phẩm', name:'Tinh Kim Linh Trụ Giáp', type:'armor', bonusDmg:80, bonusHp:9000, bonusDef:380, bonusSpd:5, icon:'icon_a_13', price:32000, desc:'Giáp tinh kim trụ cực phẩm Nhị Phẩm, cân bằng hoàn hảo công thủ.' },
  // --- MŨ (4) ---
  { id:170, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Linh Nguyên Kim Quan', type:'helm', bonusDmg:0, bonusHp:800, bonusDef:85, bonusSpd:0, icon:'icon_h_7', price:3200, desc:'Quan kim linh nguyên Trúc Cơ, bảo vệ thần thức khỏi tà xâm.' },
  { id:171, rank:2, rankName:'Nhị Phẩm', grade:'Trung Phẩm', name:'Thiên Lôi Huyền Mão', type:'helm', bonusDmg:15, bonusHp:1200, bonusDef:130, bonusSpd:0, icon:'icon_h_8', price:6500, desc:'Mão huyền lôi, tích lôi khí tăng sát thương lôi hệ.' },
  { id:172, rank:2, rankName:'Nhị Phẩm', grade:'Thượng Phẩm', name:'Ngọc Hỏa Linh Mão', type:'helm', bonusDmg:25, bonusHp:1800, bonusDef:180, bonusSpd:0, icon:'icon_h_9', price:12000, desc:'Mão ngọc hỏa linh tỏa nhiệt, linh thần không bị lạnh đóng.' },
  { id:173, rank:2, rankName:'Nhị Phẩm', grade:'Cực Phẩm', name:'Hàn Băng Tinh Mão', type:'helm', bonusDmg:0, bonusHp:2500, bonusDef:250, bonusSpd:10, icon:'icon_h_10', price:28000, desc:'Mão băng tinh cực phẩm Nhị Phẩm, tâm bình khí tĩnh trăm đòn.' },
  // --- GIÀY (4) ---
  { id:174, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Phong Vân Linh Hài', type:'boots', bonusDmg:0, bonusHp:500, bonusDef:35, bonusSpd:55, icon:'icon_b_7', price:3500, desc:'Hài phong vân tốc độ nhanh, giẫm mây như đất bằng phẳng.' },
  { id:175, rank:2, rankName:'Nhị Phẩm', grade:'Trung Phẩm', name:'Hỏa Linh Tốc Bộ Hài', type:'boots', bonusDmg:20, bonusHp:400, bonusDef:40, bonusSpd:70, icon:'icon_b_8', price:7000, desc:'Hài hỏa linh tốc bộ, phun hỏa khí khi tăng tốc.' },
  { id:176, rank:2, rankName:'Nhị Phẩm', grade:'Thượng Phẩm', name:'Hàn Phong Khinh Phi Hài', type:'boots', bonusDmg:0, bonusHp:600, bonusDef:55, bonusSpd:90, icon:'icon_b_9', price:13000, desc:'Hài hàn phong khinh phi, gần như lơ lửng trên mặt đất.' },
  { id:177, rank:2, rankName:'Nhị Phẩm', grade:'Cực Phẩm', name:'Thiên Cương Trọng Phi Hài', type:'boots', bonusDmg:35, bonusHp:900, bonusDef:80, bonusSpd:110, icon:'icon_b_10', price:30000, desc:'Hài thiên cương cực phẩm, nặng nhưng mỗi bước tỏa uy lực.' },
  // --- TRANG SỨC (4) ---
  { id:178, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Định Thần Ngọc Bội', type:'amulet', bonusDmg:240, bonusHp:1200, bonusDef:0, bonusSpd:0, icon:'icon_am_7', price:8000, desc:'Ngọc bội định thần, chống tấn công tinh thần và tâm ma.' },
  { id:179, rank:2, rankName:'Nhị Phẩm', grade:'Trung Phẩm', name:'Hỏa Linh Thần Bội', type:'amulet', bonusDmg:380, bonusHp:1500, bonusDef:0, bonusSpd:0, icon:'icon_am_8', price:13000, desc:'Ngọc bội hỏa linh thần Nhị Phẩm, tăng cường hỏa hệ chiến đấu.' },
  { id:180, rank:2, rankName:'Nhị Phẩm', grade:'Thượng Phẩm', name:'Hàn Linh Thần Khí Bội', type:'amulet', bonusDmg:300, bonusHp:2200, bonusDef:60, bonusSpd:0, icon:'icon_am_9', price:20000, desc:'Ngọc bội hàn linh, tạo khí trường lạnh làm chậm đối phương.' },
  { id:181, rank:2, rankName:'Nhị Phẩm', grade:'Cực Phẩm', name:'Song Linh Thần Bội Cực Phẩm', type:'amulet', bonusDmg:550, bonusHp:3000, bonusDef:100, bonusSpd:0, icon:'icon_am_10', price:35000, desc:'Ngọc bội song linh cực phẩm Nhị Phẩm, uy lực thiên hạ vô song.' },
  // --- KHIÊN (4) ---
  { id:182, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Chân Long Linh Thuẫn', type:'shield', bonusDmg:0, bonusHp:1800, bonusDef:180, bonusSpd:0, icon:'icon_sh_7', price:4000, desc:'Thuẫn long khí chân nguyên, cản vũ khí Nhất Phẩm như không có.' },
  { id:183, rank:2, rankName:'Nhị Phẩm', grade:'Trung Phẩm', name:'Thiên Cương Linh Khiên', type:'shield', bonusDmg:0, bonusHp:2800, bonusDef:280, bonusSpd:0, icon:'icon_sh_8', price:9000, desc:'Khiên thiên cương Nhị Phẩm, không có vũ khí cùng phẩm nào phá được.' },
  { id:184, rank:2, rankName:'Nhị Phẩm', grade:'Thượng Phẩm', name:'Hỏa Diễm Phản Công Thuẫn', type:'shield', bonusDmg:40, bonusHp:3500, bonusDef:350, bonusSpd:0, icon:'icon_sh_9', price:16000, desc:'Thuẫn hỏa diễm phản công, khi bị đánh bắn ra hỏa cầu phản đòn.' },
  { id:185, rank:2, rankName:'Nhị Phẩm', grade:'Cực Phẩm', name:'Hàn Băng Vạn Thuẫn', type:'shield', bonusDmg:0, bonusHp:5000, bonusDef:480, bonusSpd:0, icon:'icon_sh_10', price:35000, desc:'Thuẫn hàn băng vạn lớp, mỗi đòn bị cản đóng băng kẻ tấn công.' },
  // --- NHẪN (3) ---
  { id:186, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Song Linh Thần Nhẫn', type:'ring', bonusDmg:160, bonusHp:800, bonusDef:20, bonusSpd:0, icon:'icon_r_6', price:6500, desc:'Nhẫn song linh tạo cộng hưởng khi đeo cùng cặp.' },
  { id:187, rank:2, rankName:'Nhị Phẩm', grade:'Trung Phẩm', name:'Hỏa Linh Vương Nhẫn', type:'ring', bonusDmg:280, bonusHp:1200, bonusDef:0, bonusSpd:10, icon:'icon_r_7', price:12000, desc:'Nhẫn vương hỏa linh, tăng hỏa công lên mức đỉnh Nhị Phẩm.' },
  { id:188, rank:2, rankName:'Nhị Phẩm', grade:'Cực Phẩm', name:'Hàn Linh Cực Phẩm Nhẫn', type:'ring', bonusDmg:220, bonusHp:1800, bonusDef:50, bonusSpd:15, icon:'icon_r_8', price:28000, desc:'Nhẫn hàn linh cực phẩm, đóng băng kẻ bị đánh 2 giây.' },
  // --- ÁO CHOÀNG (3) ---
  { id:189, rank:2, rankName:'Nhị Phẩm', grade:'Hạ Phẩm', name:'Tốc Phong Phong Bào Nhị', type:'cloak', bonusDmg:0, bonusHp:1500, bonusDef:70, bonusSpd:45, icon:'icon_cl_6', price:4500, desc:'Phong bào tốc phong Nhị Phẩm, cuộn gió khi di chuyển tốc độ cao.' },
  { id:190, rank:2, rankName:'Nhị Phẩm', grade:'Trung Phẩm', name:'Hỏa Long Mạn Y', type:'cloak', bonusDmg:40, bonusHp:2000, bonusDef:90, bonusSpd:30, icon:'icon_cl_7', price:9500, desc:'Mạn y hỏa long tỏa nhiệt hào quang rực rỡ, kẻ gần bị hỏa thương.' },
  { id:191, rank:2, rankName:'Nhị Phẩm', grade:'Cực Phẩm', name:'Hàn Băng Đạo Bào Cực', type:'cloak', bonusDmg:0, bonusHp:3200, bonusDef:130, bonusSpd:60, icon:'icon_cl_8', price:28000, desc:'Đạo bào hàn băng cực phẩm, băng ảnh che thân đi lại vô hình.' },
];

// ═══════════════════════════════════════════════════
// TAM PHẨM (rank 3) — Pháp Khí Kim Đan Kỳ
// ═══════════════════════════════════════════════════
export const TAM_PHAM_ITEMS = [
  // --- VŨ KHÍ (6) ---
  { id:200, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Kim Đan Linh Kiếm', type:'weapon', bonusDmg:3000, bonusHp:0, bonusDef:0, bonusSpd:65, icon:'icon_w_15', price:40000, desc:'Kiếm linh khí Kim Đan ngưng kết, lưỡi sáng như gương chiếu thần.' },
  { id:201, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Cửu Tiết Linh Tiên', type:'weapon', bonusDmg:2800, bonusHp:200, bonusDef:5, bonusSpd:40, icon:'icon_w_16', price:38000, desc:'Tiên cửu tiết linh khi, cuộn xoáy không khí khi vung.' },
  { id:202, rank:3, rankName:'Tam Phẩm', grade:'Trung Phẩm', name:'Cửu Chuyển Thần Kiếm', type:'weapon', bonusDmg:5500, bonusHp:0, bonusDef:0, bonusSpd:75, icon:'icon_w_17', price:85000, desc:'Kiếm cửu chuyển đạo tâm, mỗi đòn chém 9 lần trong chớp mắt.' },
  { id:203, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Thiên Lôi Bát Quán Kiếm', type:'weapon', bonusDmg:9500, bonusHp:0, bonusDef:0, bonusSpd:95, icon:'icon_w_18', price:160000, desc:'Kiếm bát quán thiên lôi, mỗi da chém kèm lôi hệ bùng nổ.' },
  { id:204, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Xuân Thu Cổ Kiếm Linh', type:'weapon', bonusDmg:8800, bonusHp:500, bonusDef:20, bonusSpd:70, icon:'icon_w_19', price:145000, desc:'Cổ kiếm Xuân Thu chứa đạo tâm kiếm sĩ tiền nhân vĩ đại.' },
  { id:205, rank:3, rankName:'Tam Phẩm', grade:'Cực Phẩm', name:'Tần Vương Đoạt Hồn Kiếm', type:'weapon', bonusDmg:16000, bonusHp:0, bonusDef:0, bonusSpd:110, icon:'icon_w_20', price:320000, desc:'Kiếm cực phẩm Tam Phẩm, mang hồn kiếm đoạt mệnh trăm kẻ thù.' },
  // --- GIÁP (6) ---
  { id:206, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Thiên Cương Kim Giáp', type:'armor', bonusDmg:0, bonusHp:32000, bonusDef:1100, bonusSpd:0, icon:'icon_a_14', price:38000, desc:'Giáp thiên cương kim Kim Đan, cứng vô song không cung tên xuyên.' },
  { id:207, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Lý Kim Mộc Hộ Giáp', type:'armor', bonusDmg:100, bonusHp:28000, bonusDef:900, bonusSpd:0, icon:'icon_a_15', price:35000, desc:'Giáp lý kim mộc kết hợp ngũ hành, cân bằng phòng thủ.' },
  { id:208, rank:3, rankName:'Tam Phẩm', grade:'Trung Phẩm', name:'Hỏa Diễm Trọng Giáp', type:'armor', bonusDmg:200, bonusHp:45000, bonusDef:1600, bonusSpd:0, icon:'icon_a_16', price:80000, desc:'Giáp nặng hỏa diễm, tỏa hỏa khí thiêu đốt mọi tấn công gần.' },
  { id:209, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Hàn Băng Tinh Giáp Kim', type:'armor', bonusDmg:0, bonusHp:65000, bonusDef:2600, bonusSpd:0, icon:'icon_a_17', price:145000, desc:'Giáp tinh băng ngưng kết từ huyền băng vạn năm, lạnh toả khắp nơi.' },
  { id:210, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Ngọc Linh Bảo Giáp', type:'armor', bonusDmg:150, bonusHp:58000, bonusDef:2200, bonusSpd:10, icon:'icon_a_18', price:130000, desc:'Giáp ngọc linh bảo tỏa ánh ngọc hào quang, bảo vệ tâm linh.' },
  { id:211, rank:3, rankName:'Tam Phẩm', grade:'Cực Phẩm', name:'Thiên Cương Bách Linh Giáp', type:'armor', bonusDmg:300, bonusHp:90000, bonusDef:3500, bonusSpd:15, icon:'icon_a_19', price:310000, desc:'Giáp cực phẩm Tam Phẩm trăm linh hội tụ, bất hoại như thiên cương.' },
  // --- MŨ (5) ---
  { id:212, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Tiên Đan Linh Quan', type:'helm', bonusDmg:0, bonusHp:8000, bonusDef:820, bonusSpd:0, icon:'icon_h_11', price:35000, desc:'Quan tiên đan linh khai mở đan điền thứ hai, tu luyện nhanh hơn.' },
  { id:213, rank:3, rankName:'Tam Phẩm', grade:'Trung Phẩm', name:'Hỏa Diễm Kim Mão', type:'helm', bonusDmg:120, bonusHp:12000, bonusDef:1200, bonusSpd:0, icon:'icon_h_12', price:72000, desc:'Mão kim hỏa diễm tỏa ánh lửa, oai hùng dẫn đầu Kim Đan Kỳ.' },
  { id:214, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Hàn Băng Huyền Mão', type:'helm', bonusDmg:0, bonusHp:18000, bonusDef:1800, bonusSpd:0, icon:'icon_h_13', price:130000, desc:'Mão huyền băng đóng đông tấn công tinh thần, tâm chí vững vàng.' },
  { id:215, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Thiên Cương Trọng Trụ', type:'helm', bonusDmg:0, bonusHp:22000, bonusDef:2200, bonusSpd:0, icon:'icon_h_14', price:155000, desc:'Đầu trụ thiên cương nặng ngàn cân, chắn được cả lôi kiếp nhẹ.' },
  { id:216, rank:3, rankName:'Tam Phẩm', grade:'Cực Phẩm', name:'Kim Quang Linh Quan Cực', type:'helm', bonusDmg:200, bonusHp:30000, bonusDef:2800, bonusSpd:20, icon:'icon_h_15', price:300000, desc:'Quan cực phẩm kim quang chiếu sáng, linh thức truyền xa vạn lý.' },
  // --- GIÀY (5) ---
  { id:217, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Điêu Phong Kim Hài', type:'boots', bonusDmg:0, bonusHp:5000, bonusDef:320, bonusSpd:125, icon:'icon_b_11', price:38000, desc:'Hài điêu phong kim, bước mỗi bước tỏa phong khí ngưng tụ.' },
  { id:218, rank:3, rankName:'Tam Phẩm', grade:'Trung Phẩm', name:'Hỏa Linh Tốc Tẩu Hài', type:'boots', bonusDmg:50, bonusHp:6500, bonusDef:400, bonusSpd:155, icon:'icon_b_12', price:75000, desc:'Hài hỏa linh tốc tẩu, phun hỏa khí đẩy người về phía trước.' },
  { id:219, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Hàn Phong Khinh Phi Hài Tam', type:'boots', bonusDmg:0, bonusHp:8500, bonusDef:520, bonusSpd:190, icon:'icon_b_13', price:140000, desc:'Hài hàn phong nhẹ như không trọng lực, tốc độ bước vượt gió.' },
  { id:220, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Kim Đan Thiên Hành Hài', type:'boots', bonusDmg:80, bonusHp:10000, bonusDef:600, bonusSpd:210, icon:'icon_b_14', price:165000, desc:'Hài thiên hành Kim Đan, có thể đạp không trung vài bước liên tiếp.' },
  { id:221, rank:3, rankName:'Tam Phẩm', grade:'Cực Phẩm', name:'Thiên Cương Phi Hành Hài Cực', type:'boots', bonusDmg:120, bonusHp:14000, bonusDef:800, bonusSpd:250, icon:'icon_b_15', price:310000, desc:'Hài cực phẩm thiên cương phi hành, khoảng cách trăm dặm như gần.' },
  // --- TRANG SỨC (5) ---
  { id:222, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Kim Đan Phách Linh Ngọc', type:'amulet', bonusDmg:2200, bonusHp:11000, bonusDef:0, bonusSpd:0, icon:'icon_am_11', price:88000, desc:'Ngọc bội phách linh Kim Đan, tăng mạnh cả sức tấn công lẫn sinh mệnh.' },
  { id:223, rank:3, rankName:'Tam Phẩm', grade:'Trung Phẩm', name:'Hỏa Linh Thần Bội Tam', type:'amulet', bonusDmg:3500, bonusHp:14000, bonusDef:0, bonusSpd:0, icon:'icon_am_12', price:140000, desc:'Ngọc bội hỏa linh thần Tam Phẩm, bùng nổ hỏa công khi chiến đấu.' },
  { id:224, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Hàn Linh Tâm Ngọc Bội', type:'amulet', bonusDmg:2800, bonusHp:20000, bonusDef:200, bonusSpd:0, icon:'icon_am_13', price:200000, desc:'Ngọc bội tâm ngọc hàn linh, tăng mạnh sinh mệnh và phòng thủ.' },
  { id:225, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Cửu Chuyển Thần Bội', type:'amulet', bonusDmg:4000, bonusHp:18000, bonusDef:150, bonusSpd:0, icon:'icon_am_14', price:220000, desc:'Ngọc bội cửu chuyển hội tụ đạo tâm, chiến lực tăng vọt khi nguy cấp.' },
  { id:226, rank:3, rankName:'Tam Phẩm', grade:'Cực Phẩm', name:'Ngũ Hành Cân Bằng Ngọc', type:'amulet', bonusDmg:5500, bonusHp:28000, bonusDef:350, bonusSpd:20, icon:'icon_am_15', price:350000, desc:'Ngọc ngũ hành cân bằng cực phẩm Tam Phẩm, uy lực toàn diện vô song.' },
  // --- KHIÊN (5) ---
  { id:227, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Thiên Cương Linh Thuẫn Tam', type:'shield', bonusDmg:0, bonusHp:14000, bonusDef:1800, bonusSpd:0, icon:'icon_sh_11', price:40000, desc:'Thuẫn linh thiên cương Kim Đan, phá gươm giáo cùng cấp như gỗ mục.' },
  { id:228, rank:3, rankName:'Tam Phẩm', grade:'Trung Phẩm', name:'Hỏa Diễm Phòng Thuẫn Tam', type:'shield', bonusDmg:200, bonusHp:22000, bonusDef:2600, bonusSpd:0, icon:'icon_sh_12', price:82000, desc:'Thuẫn hỏa diễm Kim Đan tạo tường lửa khi phòng thủ, thiêu đốt kẻ tấn công.' },
  { id:229, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Hàn Băng Linh Khiên Tam', type:'shield', bonusDmg:0, bonusHp:32000, bonusDef:3800, bonusSpd:0, icon:'icon_sh_13', price:150000, desc:'Khiên hàn băng tạo khiên băng phụ, chịu hai lớp sát thương.' },
  { id:230, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Kim Quang Bảo Thuẫn', type:'shield', bonusDmg:100, bonusHp:28000, bonusDef:3200, bonusSpd:0, icon:'icon_sh_14', price:135000, desc:'Thuẫn kim quang bảo khí chiếu sáng, phản đòn tạo kim tia sáng.' },
  { id:231, rank:3, rankName:'Tam Phẩm', grade:'Cực Phẩm', name:'Cửu Chuyển Thần Thuẫn Cực', type:'shield', bonusDmg:0, bonusHp:45000, bonusDef:5000, bonusSpd:0, icon:'icon_sh_15', price:310000, desc:'Thuẫn cực phẩm cửu chuyển, 9 lớp linh trận bảo vệ vô xuyên phá.' },
  // --- NHẪN (4) ---
  { id:232, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Kim Đan Linh Nhẫn', type:'ring', bonusDmg:1600, bonusHp:7000, bonusDef:100, bonusSpd:0, icon:'icon_r_9', price:70000, desc:'Nhẫn linh Kim Đan, tăng đồng đều cả công lẫn thủ.' },
  { id:233, rank:3, rankName:'Tam Phẩm', grade:'Trung Phẩm', name:'Hỏa Linh Vương Nhẫn Tam', type:'ring', bonusDmg:2800, bonusHp:10000, bonusDef:0, bonusSpd:20, icon:'icon_r_10', price:120000, desc:'Nhẫn vương hỏa linh, đeo liền lửa thiêu kẻ thù tiếp cận.' },
  { id:234, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Hàn Linh Nhẫn Tam', type:'ring', bonusDmg:2200, bonusHp:14000, bonusDef:200, bonusSpd:0, icon:'icon_r_11', price:190000, desc:'Nhẫn hàn linh đóng đông khí trường, mỗi đòn có cơ hội làm băng.' },
  { id:235, rank:3, rankName:'Tam Phẩm', grade:'Cực Phẩm', name:'Song Tinh Cực Phẩm Nhẫn Tam', type:'ring', bonusDmg:4000, bonusHp:20000, bonusDef:300, bonusSpd:30, icon:'icon_r_12', price:300000, desc:'Nhẫn song tinh cực phẩm Tam Phẩm, đôi nhẫn cộng hưởng phá vỡ giới hạn.' },
  // --- ÁO CHOÀNG (4) ---
  { id:236, rank:3, rankName:'Tam Phẩm', grade:'Hạ Phẩm', name:'Kim Quang Linh Bào', type:'cloak', bonusDmg:0, bonusHp:10000, bonusDef:720, bonusSpd:75, icon:'icon_cl_9', price:42000, desc:'Bào kim quang nhẹ nhàng, tỏa ánh sáng che giấu thân hình.' },
  { id:237, rank:3, rankName:'Tam Phẩm', grade:'Trung Phẩm', name:'Hỏa Diễm Mạn Y Tam', type:'cloak', bonusDmg:200, bonusHp:15000, bonusDef:900, bonusSpd:60, icon:'icon_cl_10', price:90000, desc:'Mạn y hỏa diễm tỏa nhiệt gây thiêu kẻ cận chiến.' },
  { id:238, rank:3, rankName:'Tam Phẩm', grade:'Thượng Phẩm', name:'Hàn Phong Đạo Bào Tam', type:'cloak', bonusDmg:0, bonusHp:22000, bonusDef:1200, bonusSpd:95, icon:'icon_cl_11', price:165000, desc:'Đạo bào hàn phong, tốc độ di chuyển như trận cuồng phong.' },
  { id:239, rank:3, rankName:'Tam Phẩm', grade:'Cực Phẩm', name:'Cửu Chuyển Phong Bào Cực', type:'cloak', bonusDmg:300, bonusHp:30000, bonusDef:1600, bonusSpd:130, icon:'icon_cl_12', price:300000, desc:'Phong bào cửu chuyển cực phẩm, mỗi bước để lại hư ảnh tốc độ.' },
];

// ═══════════════════════════════════════════════════
// TỨ PHẨM (rank 4) — Thần Khí Nguyên Anh Kỳ
// ═══════════════════════════════════════════════════
export const TU_PHAM_ITEMS = [
  // --- VŨ KHÍ (6) ---
  { id:250, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Nguyên Anh Thần Kiếm', type:'weapon', bonusDmg:20000, bonusHp:0, bonusDef:0, bonusSpd:170, icon:'icon_w_21', price:480000, desc:'Kiếm thần Nguyên Anh ngưng tụ nguyên thần, sắc như chém hư không.' },
  { id:251, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Thái Hư Phi Thương', type:'weapon', bonusDmg:18000, bonusHp:500, bonusDef:10, bonusSpd:130, icon:'icon_w_22', price:440000, desc:'Thương thái hư xuyên qua ảo tướng, tầm đánh vô hạn.' },
  { id:252, rank:4, rankName:'Tứ Phẩm', grade:'Trung Phẩm', name:'Thiên Cương Long Kiếm', type:'weapon', bonusDmg:36000, bonusHp:0, bonusDef:0, bonusSpd:190, icon:'icon_w_23', price:950000, desc:'Kiếm long thiên cương cuốn theo bão phong long tức uy áp.' },
  { id:253, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Lôi Hóa Bát Quái Kiếm', type:'weapon', bonusDmg:62000, bonusHp:0, bonusDef:0, bonusSpd:220, icon:'icon_w_24', price:1750000, desc:'Kiếm bát quái lôi hóa, mỗi đòn chém tạo bùng nổ lôi hỏa.' },
  { id:254, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Cổ Ngọc Thần Bảo Kiếm', type:'weapon', bonusDmg:55000, bonusHp:2000, bonusDef:50, bonusSpd:180, icon:'icon_w_25', price:1500000, desc:'Bảo kiếm cổ ngọc thần thức, chứa đựng hồn linh bậc tiên nhân cổ.' },
  { id:255, rank:4, rankName:'Tứ Phẩm', grade:'Cực Phẩm', name:'Thần Lôi Phi Thiên Kiếm', type:'weapon', bonusDmg:105000, bonusHp:0, bonusDef:0, bonusSpd:260, icon:'icon_w_26', price:3400000, desc:'Kiếm phi thiên thần lôi cực phẩm Tứ Phẩm, phá không gian khi chém.' },
  // --- GIÁP (6) ---
  { id:256, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Nguyên Anh Linh Giáp', type:'armor', bonusDmg:0, bonusHp:260000, bonusDef:8500, bonusSpd:0, icon:'icon_a_20', price:460000, desc:'Giáp linh Nguyên Anh tỏa nguyên khí bảo vệ, không khí biến dạng quanh.' },
  { id:257, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Long Khí Hộ Thể Giáp', type:'armor', bonusDmg:500, bonusHp:220000, bonusDef:7000, bonusSpd:0, icon:'icon_a_21', price:420000, desc:'Giáp long khí hộ thể tỏa long uy áp, kẻ thù kiếp sợ khi nhìn.' },
  { id:258, rank:4, rankName:'Tứ Phẩm', grade:'Trung Phẩm', name:'Thái Hư Không Gian Giáp', type:'armor', bonusDmg:0, bonusHp:540000, bonusDef:18000, bonusSpd:0, icon:'icon_a_22', price:1400000, desc:'Giáp thái hư không gian làm lệch hướng tấn công, né vô hình.' },
  { id:259, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hỏa Long Trọng Giáp', type:'armor', bonusDmg:2000, bonusHp:700000, bonusDef:26000, bonusSpd:0, icon:'icon_a_23', price:2200000, desc:'Giáp long hỏa nặng trọng lực, kẻ tấn công nhận lửa phản đòn.' },
  { id:260, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hàn Nguyệt Linh Giáp', type:'armor', bonusDmg:0, bonusHp:620000, bonusDef:22000, bonusSpd:10, icon:'icon_a_24', price:1800000, desc:'Giáp hàn nguyệt linh thư, phòng thủ băng giá không có điểm yếu.' },
  { id:261, rank:4, rankName:'Tứ Phẩm', grade:'Cực Phẩm', name:'Cửu Chuyển Hộ Thể Bảo Giáp', type:'armor', bonusDmg:3000, bonusHp:950000, bonusDef:38000, bonusSpd:20, icon:'icon_a_25', price:4500000, desc:'Giáp bảo hộ cửu chuyển cực phẩm Tứ Phẩm, 9 lớp bất khả xâm.' },
  // --- MŨ (5) ---
  { id:262, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Nguyên Anh Linh Quan', type:'helm', bonusDmg:0, bonusHp:65000, bonusDef:6500, bonusSpd:0, icon:'icon_h_16', price:420000, desc:'Quan linh Nguyên Anh tăng nguyên thần lực, thần thức truyền xa.' },
  { id:263, rank:4, rankName:'Tứ Phẩm', grade:'Trung Phẩm', name:'Thái Hư Huyền Mão', type:'helm', bonusDmg:500, bonusHp:100000, bonusDef:10000, bonusSpd:0, icon:'icon_h_17', price:1000000, desc:'Mão huyền thái hư tỏa không gian khí trường, tâm không lay động.' },
  { id:264, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hỏa Long Kim Mão', type:'helm', bonusDmg:1500, bonusHp:150000, bonusDef:15000, bonusSpd:0, icon:'icon_h_18', price:1800000, desc:'Mão kim hỏa long oai nghiêm rực lửa, linh thần không bị tinh thần tấn công.' },
  { id:265, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hàn Nguyệt Ngọc Quan', type:'helm', bonusDmg:0, bonusHp:180000, bonusDef:18000, bonusSpd:0, icon:'icon_h_19', price:2200000, desc:'Quan ngọc hàn nguyệt ngưng tụ âm linh, thần thức lạnh tĩnh tuyệt đối.' },
  { id:266, rank:4, rankName:'Tứ Phẩm', grade:'Cực Phẩm', name:'Long Khí Thần Trụ Cực', type:'helm', bonusDmg:2000, bonusHp:250000, bonusDef:25000, bonusSpd:20, icon:'icon_h_20', price:4000000, desc:'Đầu trụ long khí cực phẩm, cả trăm yêu thú nhìn vào đều sợ kinh.' },
  // --- GIÀY (5) ---
  { id:267, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Thiên Di Cửu Phong Hài', type:'boots', bonusDmg:0, bonusHp:40000, bonusDef:2500, bonusSpd:350, icon:'icon_b_16', price:720000, desc:'Hài cửu phong thiên di, bước mỗi bước vượt không gian nhỏ.' },
  { id:268, rank:4, rankName:'Tứ Phẩm', grade:'Trung Phẩm', name:'Hỏa Long Tốc Phi Hài', type:'boots', bonusDmg:500, bonusHp:60000, bonusDef:3500, bonusSpd:430, icon:'icon_b_17', price:1400000, desc:'Hài hỏa long tốc phi, đạp hỏa khí bay về phía trước chớp mắt.' },
  { id:269, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hàn Nguyệt Khinh Phi Hài', type:'boots', bonusDmg:0, bonusHp:80000, bonusDef:4500, bonusSpd:520, icon:'icon_b_18', price:2300000, desc:'Hài khinh phi hàn nguyệt lướt trên không như bước đất bằng.' },
  { id:270, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Thái Hư Không Bộ Hài', type:'boots', bonusDmg:0, bonusHp:95000, bonusDef:5000, bonusSpd:620, icon:'icon_b_19', price:2800000, desc:'Hài thái hư không bộ tạo không gian bước chân siêu tốc.' },
  { id:271, rank:4, rankName:'Tứ Phẩm', grade:'Cực Phẩm', name:'Long Khí Trọng Phi Hài Cực', type:'boots', bonusDmg:1000, bonusHp:130000, bonusDef:7000, bonusSpd:750, icon:'icon_b_20', price:5000000, desc:'Hài long khí cực phẩm Tứ Phẩm, tốc độ gần tương đương phi hành.' },
  // --- TRANG SỨC (5) ---
  { id:272, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Long Nguyên Linh Bội', type:'amulet', bonusDmg:16000, bonusHp:80000, bonusDef:0, bonusSpd:0, icon:'icon_am_16', price:1100000, desc:'Ngọc bội long nguyên Nguyên Anh, cộng hưởng long khí chiến lực.' },
  { id:273, rank:4, rankName:'Tứ Phẩm', grade:'Trung Phẩm', name:'Hỏa Long Thần Ngọc Bội', type:'amulet', bonusDmg:28000, bonusHp:120000, bonusDef:0, bonusSpd:0, icon:'icon_am_17', price:2000000, desc:'Ngọc bội hỏa long thần Tứ Phẩm, bùng cháy hỏa linh công lực.' },
  { id:274, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hàn Nguyệt Âm Ngọc Bội', type:'amulet', bonusDmg:22000, bonusHp:180000, bonusDef:2500, bonusSpd:0, icon:'icon_am_18', price:3000000, desc:'Ngọc bội âm ngọc hàn nguyệt Tứ Phẩm, bổ trợ sinh mệnh và ổn định.' },
  { id:275, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Thái Hư Không Gian Bội', type:'amulet', bonusDmg:18000, bonusHp:200000, bonusDef:5000, bonusSpd:0, icon:'icon_am_19', price:3500000, desc:'Ngọc bội không gian thái hư, có thể tàng trữ pháp khí nhỏ bên trong.' },
  { id:276, rank:4, rankName:'Tứ Phẩm', grade:'Cực Phẩm', name:'Cổ Ngọc Thần Bội Cực', type:'amulet', bonusDmg:45000, bonusHp:280000, bonusDef:8000, bonusSpd:20, icon:'icon_am_20', price:7000000, desc:'Ngọc bội cổ thần cực phẩm Tứ Phẩm, chứa hồn linh vị cổ nhân tu tiên.' },
  // --- KHIÊN (5) ---
  { id:277, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Thái Hư Thần Thuẫn', type:'shield', bonusDmg:0, bonusHp:120000, bonusDef:14000, bonusSpd:0, icon:'icon_sh_16', price:1200000, desc:'Thuẫn thần thái hư tạo không gian lệch đòn, né vật lý hiệu quả.' },
  { id:278, rank:4, rankName:'Tứ Phẩm', grade:'Trung Phẩm', name:'Hỏa Long Phòng Thuẫn', type:'shield', bonusDmg:1000, bonusHp:200000, bonusDef:22000, bonusSpd:0, icon:'icon_sh_17', price:2500000, desc:'Thuẫn hỏa long Tứ Phẩm, phản đòn bằng dòng lửa cực nhiệt.' },
  { id:279, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hàn Nguyệt Linh Khiên Tứ', type:'shield', bonusDmg:0, bonusHp:300000, bonusDef:32000, bonusSpd:0, icon:'icon_sh_18', price:4000000, desc:'Khiên hàn nguyệt tạo khiên băng phụ tự phục hồi sau mỗi chiến đấu.' },
  { id:280, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Long Khí Bảo Thuẫn', type:'shield', bonusDmg:500, bonusHp:260000, bonusDef:28000, bonusSpd:0, icon:'icon_sh_19', price:3500000, desc:'Thuẫn long khí bảo vệ tỏa uy áp, kẻ đánh vào sợ hãi lui bước.' },
  { id:281, rank:4, rankName:'Tứ Phẩm', grade:'Cực Phẩm', name:'Cổ Thần Bất Hoại Thuẫn Cực', type:'shield', bonusDmg:0, bonusHp:430000, bonusDef:48000, bonusSpd:0, icon:'icon_sh_20', price:7500000, desc:'Thuẫn cực phẩm cổ thần bất hoại, không có vũ khí Tứ Phẩm nào phá được.' },
  // --- NHẪN (4) ---
  { id:282, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Long Nguyên Song Nhẫn', type:'ring', bonusDmg:12000, bonusHp:55000, bonusDef:800, bonusSpd:0, icon:'icon_r_13', price:900000, desc:'Đôi nhẫn long nguyên Nguyên Anh, đeo cặp kích hoạt long linh cộng hưởng.' },
  { id:283, rank:4, rankName:'Tứ Phẩm', grade:'Trung Phẩm', name:'Hỏa Long Vương Nhẫn Tứ', type:'ring', bonusDmg:22000, bonusHp:80000, bonusDef:0, bonusSpd:20, icon:'icon_r_14', price:1900000, desc:'Nhẫn vương hỏa long, thiêu cháy khắp nơi khi kích hoạt.' },
  { id:284, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hàn Nguyệt Linh Nhẫn Tứ', type:'ring', bonusDmg:18000, bonusHp:110000, bonusDef:1500, bonusSpd:0, icon:'icon_r_15', price:3000000, desc:'Nhẫn linh hàn nguyệt đóng băng khí trường, kẻ gần chịu hàn thương.' },
  { id:285, rank:4, rankName:'Tứ Phẩm', grade:'Cực Phẩm', name:'Long Nguyên Cực Phẩm Nhẫn', type:'ring', bonusDmg:38000, bonusHp:160000, bonusDef:2500, bonusSpd:30, icon:'icon_r_16', price:6500000, desc:'Nhẫn long nguyên cực phẩm Tứ Phẩm, hội tụ long khí uy áp tuyệt đỉnh.' },
  // --- ÁO CHOÀNG (4) ---
  { id:286, rank:4, rankName:'Tứ Phẩm', grade:'Hạ Phẩm', name:'Nguyên Anh Thần Phong Bào', type:'cloak', bonusDmg:0, bonusHp:80000, bonusDef:5000, bonusSpd:220, icon:'icon_cl_13', price:480000, desc:'Phong bào thần khí Nguyên Anh, khi di chuyển tỏa nguyên linh bảo hộ.' },
  { id:287, rank:4, rankName:'Tứ Phẩm', grade:'Trung Phẩm', name:'Hỏa Long Mạn Y Tứ', type:'cloak', bonusDmg:800, bonusHp:130000, bonusDef:7000, bonusSpd:280, icon:'icon_cl_14', price:1200000, desc:'Mạn y hỏa long Nguyên Anh, tốc độ và hỏa lực cùng lúc cực mạnh.' },
  { id:288, rank:4, rankName:'Tứ Phẩm', grade:'Thượng Phẩm', name:'Hàn Nguyệt Khinh Y', type:'cloak', bonusDmg:0, bonusHp:200000, bonusDef:9500, bonusSpd:380, icon:'icon_cl_15', price:2400000, desc:'Khinh y hàn nguyệt, tốc độ gần như tàng hình dưới ánh trăng.' },
  { id:289, rank:4, rankName:'Tứ Phẩm', grade:'Cực Phẩm', name:'Thái Hư Vô Tướng Phong Bào', type:'cloak', bonusDmg:1500, bonusHp:300000, bonusDef:14000, bonusSpd:500, icon:'icon_cl_16', price:6000000, desc:'Phong bào vô tướng thái hư cực phẩm, hoàn toàn biến mất khi di chuyển.' },
];

// ═══════════════════════════════════════════════════
// NGŨ PHẨM (rank 5) — Chí Bảo Hóa Thần Kỳ
// ═══════════════════════════════════════════════════
export const NGU_PHAM_ITEMS = [
  // --- VŨ KHÍ (7) ---
  { id:300, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hóa Thần Chân Kiếm', type:'weapon', bonusDmg:150000, bonusHp:0, bonusDef:0, bonusSpd:480, icon:'icon_w_27', price:7500000, desc:'Kiếm chân nguyên Hóa Thần, chém không khí thành tướng kiếm trăm thước.' },
  { id:301, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Càn Khôn Pháp Trượng', type:'weapon', bonusDmg:140000, bonusHp:2000, bonusDef:0, bonusSpd:350, icon:'icon_w_28', price:7000000, desc:'Pháp trượng càn khôn đại đạo, mỗi đòn kéo theo sức mạnh thiên địa.' },
  { id:302, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hỗn Độn Thiên Thương', type:'weapon', bonusDmg:135000, bonusHp:3000, bonusDef:8000, bonusSpd:300, icon:'icon_w_29', price:6800000, desc:'Thương hỗn độn thái sơ, xuyên phá mọi lá chắn và phòng thủ hư ảo.' },
  { id:303, rank:5, rankName:'Ngũ Phẩm', grade:'Trung Phẩm', name:'Khai Thiên Linh Kiếm', type:'weapon', bonusDmg:260000, bonusHp:0, bonusDef:0, bonusSpd:550, icon:'icon_w_30', price:14000000, desc:'Kiếm khai thiên lưỡng phân, chém qua không gian tạo vết thương vĩnh viễn.' },
  { id:304, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Hỗn Độn Bát Cực Kiếm', type:'weapon', bonusDmg:420000, bonusHp:0, bonusDef:0, bonusSpd:650, icon:'icon_w_31', price:26000000, desc:'Kiếm hỗn độn bát cực, mỗi đòn chém tạo ra tám hư kiếm phụ cùng tấn công.' },
  { id:305, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Nhật Nguyệt Âm Dương Kiếm', type:'weapon', bonusDmg:390000, bonusHp:5000, bonusDef:0, bonusSpd:600, icon:'icon_w_32', price:23000000, desc:'Kiếm nhật nguyệt âm dương hội tụ, chứa đại đạo cân bằng vũ trụ.' },
  { id:306, rank:5, rankName:'Ngũ Phẩm', grade:'Cực Phẩm', name:'Tạo Hóa Chân Linh Bảo Kiếm', type:'weapon', bonusDmg:720000, bonusHp:0, bonusDef:0, bonusSpd:750, icon:'icon_w_33', price:58000000, desc:'Linh bảo kiếm tạo hóa cực phẩm Ngũ Phẩm, chứa đại đạo vũ trụ tuyệt đỉnh.' },
  // --- GIÁP (7) ---
  { id:307, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hóa Thần Huyền Giáp', type:'armor', bonusDmg:0, bonusHp:2300000, bonusDef:72000, bonusSpd:0, icon:'icon_a_26', price:7000000, desc:'Giáp huyền thần Hóa Thần, đóng hào quang thần linh bất khả xâm phạm.' },
  { id:308, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Càn Khôn Đại Bảo Giáp', type:'armor', bonusDmg:500, bonusHp:2000000, bonusDef:65000, bonusSpd:0, icon:'icon_a_27', price:6500000, desc:'Giáp bảo càn khôn đại đạo, chứa đựng không gian nhỏ bên trong.' },
  { id:309, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hỗn Nguyên Linh Giáp', type:'armor', bonusDmg:0, bonusHp:1800000, bonusDef:58000, bonusSpd:0, icon:'icon_a_28', price:6000000, desc:'Giáp linh hỗn nguyên tái tạo thân thể nếu bị thương gần chết.' },
  { id:310, rank:5, rankName:'Ngũ Phẩm', grade:'Trung Phẩm', name:'Khai Thiên Thần Trụ Giáp', type:'armor', bonusDmg:2000, bonusHp:4500000, bonusDef:140000, bonusSpd:0, icon:'icon_a_29', price:18000000, desc:'Giáp thần trụ khai thiên, mỗi chiêu phòng thủ tỏa thiên địa uy áp.' },
  { id:311, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Vô Cực Linh Giáp', type:'armor', bonusDmg:0, bonusHp:7000000, bonusDef:220000, bonusSpd:0, icon:'icon_a_30', price:32000000, desc:'Giáp vô cực linh khí siêu việt, không có chiêu nào vượt qua nổi.' },
  { id:312, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Tạo Hóa Bảo Giáp', type:'armor', bonusDmg:3000, bonusHp:6500000, bonusDef:200000, bonusSpd:10, icon:'icon_a_31', price:29000000, desc:'Giáp bảo tạo hóa, mỗi giây hồi phục HP nhờ linh khí thiên địa vô tận.' },
  { id:313, rank:5, rankName:'Ngũ Phẩm', grade:'Cực Phẩm', name:'Hỗn Độn Vô Tướng Thần Giáp', type:'armor', bonusDmg:5000, bonusHp:10000000, bonusDef:320000, bonusSpd:20, icon:'icon_a_32', price:58000000, desc:'Thần giáp cực phẩm Ngũ Phẩm hỗn độn vô tướng, mọi tấn công đều vô nghĩa.' },
  // --- MŨ (6) ---
  { id:314, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hóa Thần Thần Quan', type:'helm', bonusDmg:0, bonusHp:500000, bonusDef:55000, bonusSpd:0, icon:'icon_h_21', price:6500000, desc:'Quan thần Hóa Thần khai mở toàn bộ linh thức, thần thông không giới hạn.' },
  { id:315, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Càn Khôn Linh Đỉnh', type:'helm', bonusDmg:1000, bonusHp:600000, bonusDef:62000, bonusSpd:0, icon:'icon_h_22', price:7000000, desc:'Đỉnh linh càn khôn tổng hợp đại đạo, linh thức truyền đi vạn dặm.' },
  { id:316, rank:5, rankName:'Ngũ Phẩm', grade:'Trung Phẩm', name:'Khai Thiên Vô Tướng Mão', type:'helm', bonusDmg:2500, bonusHp:900000, bonusDef:95000, bonusSpd:0, icon:'icon_h_23', price:16000000, desc:'Mão vô tướng khai thiên, tâm linh tỏa ra thu nạp đại đạo thiên nhiên.' },
  { id:317, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Hỗn Độn Tư Duy Mão', type:'helm', bonusDmg:0, bonusHp:1400000, bonusDef:145000, bonusSpd:0, icon:'icon_h_24', price:30000000, desc:'Mão hỗn độn, suy nghĩ vượt không gian thời gian hiểu được mọi pháp tắc.' },
  { id:318, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Vô Cực Thần Trụ', type:'helm', bonusDmg:0, bonusHp:1600000, bonusDef:165000, bonusSpd:0, icon:'icon_h_25', price:34000000, desc:'Đầu trụ vô cực chắn thiên đạo uy lực, không có tinh thần tấn công nào xuyên phá.' },
  { id:319, rank:5, rankName:'Ngũ Phẩm', grade:'Cực Phẩm', name:'Tạo Hóa Chân Thánh Quan', type:'helm', bonusDmg:5000, bonusHp:2500000, bonusDef:250000, bonusSpd:30, icon:'icon_h_26', price:58000000, desc:'Quan chân thánh tạo hóa cực phẩm, linh thức câu thông đại đạo thiên địa.' },
  // --- GIÀY (6) ---
  { id:320, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Phi Thiên Linh Hài Ngũ', type:'boots', bonusDmg:0, bonusHp:350000, bonusDef:18000, bonusSpd:900, icon:'icon_b_21', price:6800000, desc:'Hài phi thiên thần linh, bước một bước vượt qua khoảng cách vạn lý.' },
  { id:321, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hỗn Nguyên Không Bộ', type:'boots', bonusDmg:0, bonusHp:300000, bonusDef:15000, bonusSpd:850, icon:'icon_b_22', price:6200000, desc:'Không bộ hỗn nguyên, di chuyển trong hỗn độn hư không không để lại dấu vết.' },
  { id:322, rank:5, rankName:'Ngũ Phẩm', grade:'Trung Phẩm', name:'Khai Thiên Phi Hành Hài', type:'boots', bonusDmg:0, bonusHp:600000, bonusDef:30000, bonusSpd:1100, icon:'icon_b_23', price:15000000, desc:'Hài phi hành khai thiên, vận tốc gần bằng ánh sáng trong địa giới.' },
  { id:323, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Vô Cực Linh Hài Thần', type:'boots', bonusDmg:0, bonusHp:900000, bonusDef:45000, bonusSpd:1400, icon:'icon_b_24', price:28000000, desc:'Hài thần vô cực, cảm nhận hư không và di chuyển trong cả hai chiều không gian.' },
  { id:324, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Tạo Hóa Thiên Hành Hài', type:'boots', bonusDmg:1000, bonusHp:850000, bonusDef:42000, bonusSpd:1300, icon:'icon_b_25', price:26000000, desc:'Hài thiên hành tạo hóa, mỗi bước để lại vết tích thiên đạo trên đất.' },
  { id:325, rank:5, rankName:'Ngũ Phẩm', grade:'Cực Phẩm', name:'Hỗn Độn Thiên Địa Phi Hài Cực', type:'boots', bonusDmg:2000, bonusHp:1500000, bonusDef:75000, bonusSpd:1800, icon:'icon_b_26', price:58000000, desc:'Hài cực phẩm hỗn độn thiên địa, tốc độ vượt giới hạn mọi cảnh giới tu tiên.' },
  // --- TRANG SỨC (6) ---
  { id:326, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hóa Thần Chân Ngọc Bội', type:'amulet', bonusDmg:120000, bonusHp:600000, bonusDef:0, bonusSpd:0, icon:'icon_am_21', price:8000000, desc:'Ngọc bội chân nguyên Hóa Thần, chiến lực bùng phát khi sinh tử ranh giới.' },
  { id:327, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Càn Khôn Đại Bảo Ngọc', type:'amulet', bonusDmg:100000, bonusHp:700000, bonusDef:3000, bonusSpd:0, icon:'icon_am_22', price:8500000, desc:'Ngọc đại bảo càn khôn, chứa đựng không gian tiểu thế giới bên trong.' },
  { id:328, rank:5, rankName:'Ngũ Phẩm', grade:'Trung Phẩm', name:'Hỗn Độn Linh Ngọc Bội', type:'amulet', bonusDmg:200000, bonusHp:1100000, bonusDef:0, bonusSpd:0, icon:'icon_am_23', price:20000000, desc:'Ngọc bội hỗn độn linh khi Ngũ Phẩm, uy lực nghịch thiên tạo hóa.' },
  { id:329, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Vô Cực Thiên Ngọc Bội', type:'amulet', bonusDmg:320000, bonusHp:1600000, bonusDef:5000, bonusSpd:0, icon:'icon_am_24', price:35000000, desc:'Ngọc bội thiên đạo vô cực, câu thông đại đạo tăng vô hạn chiến lực.' },
  { id:330, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Nhật Nguyệt Tinh Hoa Ngọc', type:'amulet', bonusDmg:280000, bonusHp:1800000, bonusDef:8000, bonusSpd:0, icon:'icon_am_25', price:32000000, desc:'Ngọc hội tụ tinh hoa nhật nguyệt triệu năm, hoàn thiện âm dương cân bằng.' },
  { id:331, rank:5, rankName:'Ngũ Phẩm', grade:'Cực Phẩm', name:'Tạo Hóa Vũ Trụ Ngọc Cực', type:'amulet', bonusDmg:550000, bonusHp:2800000, bonusDef:12000, bonusSpd:30, icon:'icon_am_26', price:58000000, desc:'Ngọc bội cực phẩm tạo hóa vũ trụ, đỉnh cao tuyệt đối của tu tiên giới.' },
  // --- KHIÊN (6) ---
  { id:332, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hóa Thần Bảo Thuẫn', type:'shield', bonusDmg:0, bonusHp:1000000, bonusDef:110000, bonusSpd:0, icon:'icon_sh_21', price:7500000, desc:'Thuẫn bảo Hóa Thần, phản đòn bằng thần lực tiêu diệt kẻ tấn công.' },
  { id:333, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Càn Khôn Vũ Trụ Khiên', type:'shield', bonusDmg:0, bonusHp:900000, bonusDef:98000, bonusSpd:0, icon:'icon_sh_22', price:7000000, desc:'Khiên vũ trụ càn khôn bẻ cong không gian lệch tấn công.' },
  { id:334, rank:5, rankName:'Ngũ Phẩm', grade:'Trung Phẩm', name:'Khai Thiên Bất Hoại Thuẫn', type:'shield', bonusDmg:0, bonusHp:1900000, bonusDef:200000, bonusSpd:0, icon:'icon_sh_23', price:18000000, desc:'Thuẫn khai thiên bất hoại, không có vũ khí Ngũ Phẩm nào xuyên thủng được.' },
  { id:335, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Hỗn Độn Vạn Thuẫn Ngũ', type:'shield', bonusDmg:0, bonusHp:3000000, bonusDef:320000, bonusSpd:0, icon:'icon_sh_24', price:35000000, desc:'Thuẫn hỗn độn vạn lớp, mỗi lần cản đòn tạo ra phản lực hủy diệt.' },
  { id:336, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Vô Cực Linh Thuẫn', type:'shield', bonusDmg:1000, bonusHp:2800000, bonusDef:300000, bonusSpd:0, icon:'icon_sh_25', price:32000000, desc:'Thuẫn linh vô cực, bảo vệ hoàn toàn kể cả tấn công tinh thần và pháp thuật.' },
  { id:337, rank:5, rankName:'Ngũ Phẩm', grade:'Cực Phẩm', name:'Tạo Hóa Thiên Địa Thuẫn Cực', type:'shield', bonusDmg:0, bonusHp:5000000, bonusDef:520000, bonusSpd:0, icon:'icon_sh_26', price:58000000, desc:'Thuẫn cực phẩm tạo hóa thiên địa, tổng hợp mọi sức mạnh phòng thủ vũ trụ.' },
  // --- NHẪN (5) ---
  { id:338, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hóa Thần Chân Nhẫn', type:'ring', bonusDmg:90000, bonusHp:450000, bonusDef:5000, bonusSpd:0, icon:'icon_r_17', price:7200000, desc:'Nhẫn chân Hóa Thần, khi chiến đấu kích hoạt hóa thần tướng linh.' },
  { id:339, rank:5, rankName:'Ngũ Phẩm', grade:'Trung Phẩm', name:'Khai Thiên Song Nhẫn', type:'ring', bonusDmg:160000, bonusHp:800000, bonusDef:0, bonusSpd:30, icon:'icon_r_18', price:15000000, desc:'Đôi nhẫn khai thiên, đeo cặp tạo thiên địa cộng hưởng tăng bội sức mạnh.' },
  { id:340, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Hỗn Độn Thần Nhẫn', type:'ring', bonusDmg:280000, bonusHp:1200000, bonusDef:3000, bonusSpd:0, icon:'icon_r_19', price:30000000, desc:'Nhẫn thần hỗn độn, kích hoạt tạo ra hư ảnh phân thân tấn công.' },
  { id:341, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Vô Cực Linh Nhẫn', type:'ring', bonusDmg:250000, bonusHp:1400000, bonusDef:5000, bonusSpd:20, icon:'icon_r_20', price:28000000, desc:'Nhẫn linh vô cực Hóa Thần, không giới hạn sức mạnh khi chiến đấu lâu.' },
  { id:342, rank:5, rankName:'Ngũ Phẩm', grade:'Cực Phẩm', name:'Tạo Hóa Song Linh Nhẫn Cực', type:'ring', bonusDmg:480000, bonusHp:2200000, bonusDef:8000, bonusSpd:40, icon:'icon_r_21', price:58000000, desc:'Đôi nhẫn song linh cực phẩm tạo hóa, hội tụ mọi đại đạo nguyên lý vũ trụ.' },
  // --- ÁO CHOÀNG (5) ---
  { id:343, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Hóa Thần Phi Thăng Phong Bào', type:'cloak', bonusDmg:0, bonusHp:650000, bonusDef:38000, bonusSpd:600, icon:'icon_cl_17', price:7000000, desc:'Phong bào phi thăng Hóa Thần, chuẩn bị cho hành trình lên tiên giới.' },
  { id:344, rank:5, rankName:'Ngũ Phẩm', grade:'Hạ Phẩm', name:'Càn Khôn Mạn Y Ngũ', type:'cloak', bonusDmg:500, bonusHp:600000, bonusDef:35000, bonusSpd:550, icon:'icon_cl_18', price:6500000, desc:'Mạn y càn khôn tỏa hào quang thiên địa, uy phong khi xuất hiện.' },
  { id:345, rank:5, rankName:'Ngũ Phẩm', grade:'Trung Phẩm', name:'Khai Thiên Đạo Bào Thần', type:'cloak', bonusDmg:2000, bonusHp:1200000, bonusDef:70000, bonusSpd:800, icon:'icon_cl_19', price:15000000, desc:'Đạo bào thần khai thiên, ẩn mình vào hư không khi cần di chuyển.' },
  { id:346, rank:5, rankName:'Ngũ Phẩm', grade:'Thượng Phẩm', name:'Hỗn Độn Vô Hình Phong Bào', type:'cloak', bonusDmg:0, bonusHp:2000000, bonusDef:110000, bonusSpd:1100, icon:'icon_cl_20', price:30000000, desc:'Phong bào vô hình hỗn độn, tàng hình hoàn toàn kể cả linh thức quét.' },
  { id:347, rank:5, rankName:'Ngũ Phẩm', grade:'Cực Phẩm', name:'Tạo Hóa Vũ Trụ Phong Bào Cực', type:'cloak', bonusDmg:4000, bonusHp:3500000, bonusDef:180000, bonusSpd:1500, icon:'icon_cl_21', price:58000000, desc:'Phong bào cực phẩm tạo hóa vũ trụ, đỉnh cao tuyệt đối của mọi pháp phục.' },
];

// Toàn bộ items
export const ALL_ITEMS = [
  ...PHAM_ITEMS,
  ...NHAT_PHAM_ITEMS,
  ...NHI_PHAM_ITEMS,
  ...TAM_PHAM_ITEMS,
  ...TU_PHAM_ITEMS,
  ...NGU_PHAM_ITEMS
];

// Tương thích ngược với INITIAL_ITEMS cũ (lấy 6 item Nhất Phẩm đầu)
export const INITIAL_ITEMS = [
  NHAT_PHAM_ITEMS.find(i => i.type === 'weapon'),
  NHAT_PHAM_ITEMS.find(i => i.type === 'armor'),
  NHAT_PHAM_ITEMS.find(i => i.type === 'helm'),
  NHAT_PHAM_ITEMS.find(i => i.type === 'boots'),
  NHAT_PHAM_ITEMS.find(i => i.type === 'amulet'),
  NHAT_PHAM_ITEMS.find(i => i.type === 'shield'),
].filter(Boolean).map((item, idx) => ({ ...item, id: idx }));

// Helper functions
export function getItemById(id) { return ALL_ITEMS.find(i => i.id === id) || null; }
export function getItemsByRank(rank) { return ALL_ITEMS.filter(i => i.rank === rank); }
export function getItemsByType(type) { return ALL_ITEMS.filter(i => i.type === type); }
export function getItemsByRankAndType(rank, type) { return ALL_ITEMS.filter(i => i.rank === rank && i.type === type); }

/** Tính chỉ số tổng (dùng để so sánh sức mạnh) */
export function getItemPower(item) {
  if (!item) return 0;
  return (item.bonusDmg || 0) + (item.bonusHp || 0) / 10 +
         (item.bonusDef || 0) * 3 + (item.bonusSpd || 0) * 2;
}

/** Lấy item mạnh nhất theo type và rank */
export function getBestItemByTypeAndRank(type, rank) {
  const items = getItemsByRankAndType(rank, type);
  if (!items.length) return null;
  return items.reduce((best, cur) => getItemPower(cur) > getItemPower(best) ? cur : best, items[0]);
}

/** Đếm số lượng item theo rank */
export function countItemsByRank(rank) { return ALL_ITEMS.filter(i => i.rank === rank).length; }

/** Lấy tất cả type slot có trong game */
export const EQUIPMENT_SLOTS = ['weapon','armor','helm','boots','amulet','shield','ring','cloak'];

/** Lấy color theo rank cho UI */
export const RANK_COLORS = {
  0: '#9ca3af', 1: '#60a5fa', 2: '#4ade80',
  3: '#facc15', 4: '#f97316', 5: '#f43f5e'
};
export const GRADE_COLORS = {
  'Hạ Phẩm': '#94a3b8', 'Trung Phẩm': '#4ade80',
  'Thượng Phẩm': '#60a5fa', 'Cực Phẩm': '#f43f5e'
};
