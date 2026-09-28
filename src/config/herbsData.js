/**
 * herbsData.js
 * Hệ thống 50 Loại Linh Thảo Tu Tiên (5 Phẩm Cấp x 10 Loại Linh Thảo)
 * Mỗi linh thảo đều có tên gọi, phẩm cấp, icon/emoji, mô tả công dụng, và giá trị riêng biệt.
 */

export const ALL_HERBS = [
  // =========================================================================
  // PHẨM 0: PHÀM CẤP THẢO DƯỢC (Phàm Nhân - 6 Loại Cơ Bản)
  // Thảo dược thông thường mọc ở rừng rậm, chưa ngưng tụ linh khí.
  // Dùng để pha thuốc phàm, bán cho lữ khách hoặc làm vật liệu sơ cấp.
  // =========================================================================
  {
    id: 'herb_0_1',
    rank: 0,
    rankName: 'Phàm Cấp',
    name: 'Dã Thảo',
    emoji: '🌱',
    icon: 'herb_icon_herb_0_1',
    color: '#86efac',
    price: 3,
    desc: 'Cỏ hoang dã mọc khắp nơi. Chứa ít nước cây có thể cầm máu vết thương nhẹ của phàm nhân.'
  },
  {
    id: 'herb_0_2',
    rank: 0,
    rankName: 'Phàm Cấp',
    name: 'Khổ Sâm Lá',
    emoji: '🍃',
    icon: 'herb_icon_herb_0_2',
    color: '#a3e635',
    price: 5,
    desc: 'Lá cây khổ sâm đắng, thường dùng giải nhiệt và chữa cảm mạo thông thường.'
  },
  {
    id: 'herb_0_3',
    rank: 0,
    rankName: 'Phàm Cấp',
    name: 'Bồ Công Anh',
    emoji: '🌼',
    icon: 'herb_icon_herb_0_3',
    color: '#fde047',
    price: 4,
    desc: 'Hoa vàng nhỏ mọc ven đường, tác dụng giải độc phàm và tiêu sưng tấy.'
  },
  {
    id: 'herb_0_4',
    rank: 0,
    rankName: 'Phàm Cấp',
    name: 'Trần Bì Thảo',
    emoji: '🌾',
    icon: 'herb_icon_herb_0_4',
    color: '#ca8a04',
    price: 6,
    desc: 'Vỏ cây phơi khô, dùng nấu thuốc tiêu thực và tăng khí lực phàm nhân.'
  },
  {
    id: 'herb_0_5',
    rank: 0,
    rankName: 'Phàm Cấp',
    name: 'Cúc Dại',
    emoji: '💐',
    icon: 'herb_icon_herb_0_5',
    color: '#e0e7ff',
    price: 5,
    desc: 'Hoa cúc trắng mọc hoang, làm trà giải khát và nhẹ đầu mắt mờ phàm nhân.'
  },
  {
    id: 'herb_0_6',
    rank: 0,
    rankName: 'Phàm Cấp',
    name: 'Gừng Rừng',
    emoji: '🥬',
    icon: 'herb_icon_herb_0_6',
    color: '#65a30d',
    price: 8,
    desc: 'Củ gừng rừng cay nồng, trị phong hàn và tăng sức chịu đựng thời tiết khắc nghiệt.'
  },

  // =========================================================================
  // PHẨM 1: NHẤT PHẨM LINH THẢO (Luyện Khí Kỳ - 10 Loại)
  // =========================================================================
  {
    id: 'herb_1_1',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Ngưng Khí Thảo',
    emoji: '🌿',
    icon: 'herb_icon_herb_1_1',
    color: '#86efac',
    price: 30,
    desc: 'Tụ tập thiên địa linh khí sơ cấp, dược liệu căn bản luyện đan Luyện Khí.'
  },
  {
    id: 'herb_1_2',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Địa Hoàng Thảo',
    emoji: '🌱',
    icon: 'herb_icon_herb_1_2',
    color: '#a3e635',
    price: 35,
    desc: 'Hấp thu thổ linh khí sâu trong lòng đất, bổ huyết tráng thể kiện cốt.'
  },
  {
    id: 'herb_1_3',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Bạch Linh Chi',
    emoji: '🍄',
    icon: 'herb_icon_herb_1_3',
    color: '#e2e8f0',
    price: 45,
    desc: 'Nấm linh chi trắng trăm năm, tăng cường độ dẻo dai của kinh mạch sơ khởi.'
  },
  {
    id: 'herb_1_4',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Thanh Linh Hoa',
    emoji: '🌸',
    icon: 'herb_icon_herb_1_4',
    color: '#6ee7b7',
    price: 40,
    desc: 'Hoa xanh biếc thanh khiết, bài trừ độc tố và cặn bã trong đan điền.'
  },
  {
    id: 'herb_1_5',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Huyết Căn Thảo',
    emoji: '🥀',
    icon: 'herb_icon_herb_1_5',
    color: '#f87171',
    price: 35,
    desc: 'Rễ đỏ như máu, chủ trị điều hòa khí huyết và hồi phục sinh lực thần tốc.'
  },
  {
    id: 'herb_1_6',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Tụ Linh Diệp',
    emoji: '🍃',
    icon: 'herb_icon_herb_1_6',
    color: '#4ade80',
    price: 50,
    desc: 'Lá cây thu hút linh khí mỏng manh, vị thuốc cốt lõi của Tụ Khí Đan.'
  },
  {
    id: 'herb_1_7',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Kim Ti Đằng',
    emoji: '🌾',
    icon: 'herb_icon_herb_1_7',
    color: '#fde047',
    price: 55,
    desc: 'Dây leo ánh kim dẻo dai, củng cố căn cơ tu vi vững chắc không lay chuyển.'
  },
  {
    id: 'herb_1_8',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Hàn Băng Thảo',
    emoji: '❄️',
    icon: 'herb_icon_herb_1_8',
    color: '#67e8f9',
    price: 60,
    desc: 'Linh thảo hàn tính ven suối lạnh, áp chế tâm hỏa khi đả tọa bế quan.'
  },
  {
    id: 'herb_1_9',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Hỏa Diễm Hoa',
    emoji: '🔥',
    icon: 'herb_icon_herb_1_9',
    color: '#fb923c',
    price: 65,
    desc: 'Bông hoa hấp thu linh hỏa nhật nguyệt, kích thích đan điền khai mở.'
  },
  {
    id: 'herb_1_10',
    rank: 1,
    rankName: 'Nhất Phẩm',
    name: 'Trúc Cơ Mộc',
    emoji: '🪵',
    icon: 'herb_icon_herb_1_10',
    color: '#ca8a04',
    price: 80,
    desc: 'Gỗ linh mộc quý hiếm, thành phần then chốt luyện chế Trúc Cơ Đan.'
  },

  // =========================================================================
  // PHẨM 2: NHỊ PHẨM LINH THẢO (Trúc Cơ Kỳ - 10 Loại)
  // =========================================================================
  {
    id: 'herb_2_1',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Tẩy Tủy Hoa',
    emoji: '🌺',
    icon: 'herb_icon_herb_2_1',
    color: '#f472b6',
    price: 120,
    desc: 'Thảo dược kỳ diệu tẩy rửa tủy hải, tẩy sạch phàm thai tiến nhập Trúc Cơ.'
  },
  {
    id: 'herb_2_2',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Tử Vân Thảo',
    emoji: '💜',
    icon: 'herb_icon_herb_2_2',
    color: '#c084fc',
    price: 130,
    desc: 'Linh thảo phủ mây tím ráng chiều, hỗ trợ ngưng luyện Chân Nguyên tinh thuần.'
  },
  {
    id: 'herb_2_3',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Huyền Sâm',
    emoji: '🥔',
    icon: 'herb_icon_herb_2_3',
    color: '#94a3b8',
    price: 150,
    desc: 'Củ sâm đen ngàn năm hấp thu âm dương linh khí, đại bổ chân khí kinh mạch.'
  },
  {
    id: 'herb_2_4',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Định Thần Quả',
    emoji: '🍇',
    icon: 'herb_icon_herb_2_4',
    color: '#a855f7',
    price: 160,
    desc: 'Trái cây tỏa hương thanh nhã, định tâm an thần chống tà ma xâm lấn.'
  },
  {
    id: 'herb_2_5',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Bích Ngọc Trúc',
    emoji: '🎋',
    icon: 'herb_icon_herb_2_5',
    color: '#2dd4bf',
    price: 180,
    desc: 'Đốt trúc ngọc bích trăm năm, làm tăng độ dẻo dai và dung lượng đan điền.'
  },
  {
    id: 'herb_2_6',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Huyết Linh Chi',
    emoji: '🍄',
    icon: 'herb_icon_herb_2_6',
    color: '#ef4444',
    price: 200,
    desc: 'Linh chi hấp thu tinh huyết yêu thú, dùng luyện thần dược hồi phục.'
  },
  {
    id: 'herb_2_7',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Phong Linh Thảo',
    emoji: '🌪️',
    icon: 'herb_icon_herb_2_7',
    color: '#38bdf8',
    price: 220,
    desc: 'Thảo dược đón ngọn cuồng phong ngưng tụ phong khí, gia tốc chu thiên vận chuyển.'
  },
  {
    id: 'herb_2_8',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Xích Diễm Quả',
    emoji: '🍎',
    icon: 'herb_icon_herb_2_8',
    color: '#f97316',
    price: 240,
    desc: 'Quả rực lửa vùng hỏa diệm sơn cổ, dung luyện đan dược Trúc Cơ Đỉnh Phong.'
  },
  {
    id: 'herb_2_9',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Thiên Thanh Đằng',
    emoji: '🌿',
    icon: 'herb_icon_herb_2_9',
    color: '#0ea5e9',
    price: 260,
    desc: 'Dây leo xanh ngọc bích, dẫn dắt linh lưu thông suốt lục phủ ngũ tạng.'
  },
  {
    id: 'herb_2_10',
    rank: 2,
    rankName: 'Nhị Phẩm',
    name: 'Kim Đan Thụ Bì',
    emoji: '🌳',
    icon: 'herb_icon_herb_2_10',
    color: '#eab308',
    price: 300,
    desc: 'Vỏ linh thụ ngàn năm, nguyên liệu đắt giá luyện chế Ngưng Đan Đan.'
  },

  // =========================================================================
  // PHẨM 3: TAM PHẨM LINH THẢO (Kim Đan Kỳ - 10 Loại)
  // =========================================================================
  {
    id: 'herb_3_1',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Cửu Diệp Chi',
    emoji: '🌿',
    icon: 'herb_icon_herb_3_1',
    color: '#10b981',
    price: 600,
    desc: 'Linh chi 9 lá ngàn năm, bồi bổ đan hỏa ngưng kết Kim Đan bất hoại.'
  },
  {
    id: 'herb_3_2',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Hóa Cốt Thảo',
    emoji: '🌾',
    icon: 'herb_icon_herb_3_2',
    color: '#facc15',
    price: 650,
    desc: 'Biến đổi phàm cốt thành tiên cốt kim đan, tăng cường phòng ngự thân thể.'
  },
  {
    id: 'herb_3_3',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Cửu Chuyển Linh Hoa',
    emoji: '✨',
    icon: 'herb_icon_herb_3_3',
    color: '#ec4899',
    price: 750,
    desc: 'Hoa nở chín cánh rực rỡ tương ứng cửu chuyển đan đạo huyền diệu.'
  },
  {
    id: 'herb_3_4',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'U Minh Sâm',
    emoji: '🍠',
    icon: 'herb_icon_herb_3_4',
    color: '#64748b',
    price: 800,
    desc: 'Nhân sâm sinh trưởng nơi địa mạch thâm sâu, ngưng tụ hồn lực Kim Đan.'
  },
  {
    id: 'herb_3_5',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Thiên Lôi Mộc',
    emoji: '⚡',
    icon: 'herb_icon_herb_3_5',
    color: '#38bdf8',
    price: 900,
    desc: 'Linh mộc chịu lôi kiếp bất diệt, giúp rèn luyện kim đan cứng rắn như thần thiết.'
  },
  {
    id: 'herb_3_6',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Thái Dương Chi',
    emoji: '☀️',
    icon: 'herb_icon_herb_3_6',
    color: '#f59e0b',
    price: 1000,
    desc: 'Nấm linh chi hấp thu thái dương chân hỏa, tăng tốc độ luyện hóa chân nguyên.'
  },
  {
    id: 'herb_3_7',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Thái Âm Thảo',
    emoji: '🌙',
    icon: 'herb_icon_herb_3_7',
    color: '#818cf8',
    price: 1050,
    desc: 'Thảo mộc thu nhận tinh hoa thái âm ban đêm, điều hòa âm dương kim đan.'
  },
  {
    id: 'herb_3_8',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Hóa Anh Đằng',
    emoji: '🌱',
    icon: 'herb_icon_herb_3_8',
    color: '#34d399',
    price: 1200,
    desc: 'Dây leo thần bí ngưng tụ anh khí, vật phẩm then chốt để phá đan hóa anh.'
  },
  {
    id: 'herb_3_9',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Băng Phách Liên',
    emoji: '🪷',
    icon: 'herb_icon_herb_3_9',
    color: '#06b6d4',
    price: 1300,
    desc: 'Hoa sen ngưng đọng từ vạn năm huyền băng, bảo hộ thần thức khi phá cảnh.'
  },
  {
    id: 'herb_3_10',
    rank: 3,
    rankName: 'Tam Phẩm',
    name: 'Kim Quang Thảo',
    emoji: '🌟',
    icon: 'herb_icon_herb_3_10',
    color: '#fde047',
    price: 1500,
    desc: 'Cỏ phát quang rực rỡ, gia tăng xác suất luyện thành đan dược Cực Phẩm.'
  },

  // =========================================================================
  // PHẨM 4: TỨ PHẨM LINH THẢO (Nguyên Anh Kỳ - 10 Loại)
  // =========================================================================
  {
    id: 'herb_4_1',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Hồn Nguyên Quả',
    emoji: '🔮',
    icon: 'herb_icon_herb_4_1',
    color: '#8b5cf6',
    price: 3000,
    desc: 'Quả thần nuôi dưỡng Nguyên Anh, ngưng tụ anh hồn trường tồn bất diệt.'
  },
  {
    id: 'herb_4_2',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Cố Bản Thần Thảo',
    emoji: '🌿',
    icon: 'herb_icon_herb_4_2',
    color: '#10b981',
    price: 3300,
    desc: 'Gia cố bản nguyên thần hồn, hồi phục mọi tổn thương kinh mạch chí mạng.'
  },
  {
    id: 'herb_4_3',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Thiên Cương Chi',
    emoji: '🍄',
    icon: 'herb_icon_herb_4_3',
    color: '#e11d48',
    price: 3600,
    desc: 'Linh chi thiên cương đón nhận cương phong cửu thiên, dược lực bàng bạc.'
  },
  {
    id: 'herb_4_4',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Hóa Thần Mộc',
    emoji: '🪵',
    icon: 'herb_icon_herb_4_4',
    color: '#d97706',
    price: 4000,
    desc: 'Thần mộc vạn năm chứng kiến đại đạo, chìa khóa tiến nhập Hóa Thần cảnh.'
  },
  {
    id: 'herb_4_5',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Vạn Niên Huyết Sâm',
    emoji: '🥔',
    icon: 'herb_icon_herb_4_5',
    color: '#b91c1c',
    price: 4500,
    desc: 'Huyết sâm vạn năm đã có linh trí, tẩm bổ sinh mệnh lực vô cùng vô tận.'
  },
  {
    id: 'herb_4_6',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Cửu U Linh Diệp',
    emoji: '🍃',
    icon: 'herb_icon_herb_4_6',
    color: '#475569',
    price: 5000,
    desc: 'Lá cây từ vực sâu cửu u, cô đọng thần thức Nguyên Anh kỳ uy áp thiên địa.'
  },
  {
    id: 'herb_4_7',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Tịnh Thế Liên Hoa',
    emoji: '🪷',
    icon: 'herb_icon_herb_4_7',
    color: '#f8fafc',
    price: 5500,
    desc: 'Sen trắng thanh lọc nghiệp chướng và tâm ma đại kiếp của đại tu sĩ.'
  },
  {
    id: 'herb_4_8',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Ngũ Sắc Linh Đằng',
    emoji: '🌈',
    icon: 'herb_icon_herb_4_8',
    color: '#06b6d4',
    price: 6000,
    desc: 'Dây leo ngũ hành hòa quyện, đại thành quy nguyên vạn vật.'
  },
  {
    id: 'herb_4_9',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Thiên Ma Thảo',
    emoji: '🥀',
    icon: 'herb_icon_herb_4_9',
    color: '#701a75',
    price: 6500,
    desc: 'Thảo dược cực hiếm sinh trưởng tại cổ ma uyên, kích phát tiềm năng đột phá.'
  },
  {
    id: 'herb_4_10',
    rank: 4,
    rankName: 'Tứ Phẩm',
    name: 'Chân Long Thảo',
    emoji: '🐉',
    icon: 'herb_icon_herb_4_10',
    color: '#f59e0b',
    price: 7500,
    desc: 'Cỏ hấp thu long tức thượng cổ, rèn đúc long cốt và thần hồn vô song.'
  },

  // =========================================================================
  // PHẨM 5: NGŨ PHẨM LINH THẢO (Hóa Thần Kỳ - 10 Loại)
  // =========================================================================
  {
    id: 'herb_5_1',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Càn Khôn Thần Hoa',
    emoji: '🌌',
    icon: 'herb_icon_herb_5_1',
    color: '#6366f1',
    price: 15000,
    desc: 'Hoa nở chứa càn khôn đại đạo, hồi phục toàn bộ linh lực và mọi thương tổn.'
  },
  {
    id: 'herb_5_2',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Tạo Hóa Chi',
    emoji: '🍄',
    icon: 'herb_icon_herb_5_2',
    color: '#ec4899',
    price: 18000,
    desc: 'Linh chi đoạt thiên địa tạo hóa, giúp thần thức câu thông thiên địa quy tắc.'
  },
  {
    id: 'herb_5_3',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Hư Không Đằng',
    emoji: '🌀',
    icon: 'herb_icon_herb_5_3',
    color: '#8b5cf6',
    price: 20000,
    desc: 'Dây leo đâm xuyên qua hư không, gia tăng tốc độ cảm ngộ không gian pháp tắc.'
  },
  {
    id: 'herb_5_4',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Khai Thiên Thảo',
    emoji: '⚡',
    icon: 'herb_icon_herb_5_4',
    color: '#eab308',
    price: 25000,
    desc: 'Cỏ mang khí tức khai thiên lập địa, then chốt đột phá Hóa Thần Đỉnh Phong.'
  },
  {
    id: 'herb_5_5',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Độ Kiếp Thần Mộc',
    emoji: '🌳',
    icon: 'herb_icon_herb_5_5',
    color: '#22c55e',
    price: 30000,
    desc: 'Gỗ thiêng hộ mệnh khi đối diện phi thăng lôi kiếp chín tầng trời.'
  },
  {
    id: 'herb_5_6',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Vạn Kiếp Bất Diệt Liên',
    emoji: '🪷',
    icon: 'herb_icon_herb_5_6',
    color: '#f43f5e',
    price: 35000,
    desc: 'Sen thần trải qua vạn kiếp bất diệt, bảo hộ đạo tâm bất hoại trước đại đạo.'
  },
  {
    id: 'herb_5_7',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Thái Sơ Thần Quả',
    emoji: '🍎',
    icon: 'herb_icon_herb_5_7',
    color: '#f97316',
    price: 40000,
    desc: 'Quả thần từ thời hỗn mang thái sơ, ban phát tiên đạo chân nguyên vô tận.'
  },
  {
    id: 'herb_5_8',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Hỗn Độn Linh Diệp',
    emoji: '🍂',
    icon: 'herb_icon_herb_5_8',
    color: '#a855f7',
    price: 45000,
    desc: 'Lá cây ngưng tụ từ hỗn độn sơ khai, ngưng luyện thần thức hóa thần cực hạn.'
  },
  {
    id: 'herb_5_9',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Nhật Nguyệt Tinh Hoa Thảo',
    emoji: '⭐',
    icon: 'herb_icon_herb_5_9',
    color: '#fbbf24',
    price: 50000,
    desc: 'Hấp thu tinh tú nhật nguyệt triệu năm, dược lực kinh thiên động địa dị tượng.'
  },
  {
    id: 'herb_5_10',
    rank: 5,
    rankName: 'Ngũ Phẩm',
    name: 'Phượng Hoàng Huyết Chi',
    emoji: '🪶',
    icon: 'herb_icon_herb_5_10',
    color: '#dc2626',
    price: 60000,
    desc: 'Nấm linh chi tẩm huyết phượng hoàng niết bàn, cải tử hoàn sinh nghịch thiên.'
  },

  // =========================================================================
  // BỔ SUNG: PHÀM CẤP (4 loại thêm — tổng 10 phàm thảo)
  // =========================================================================
  { id:'herb_0_7', rank:0, rankName:'Phàm Cấp', name:'Cúc Dại Vàng', emoji:'🌻', icon: 'herb_icon_herb_0_7', color:'#fbbf24', price:4, desc:'Hoa cúc dại màu vàng sáng, phàm nhân uống trà cúc giải nhiệt và sáng mắt.' },
  { id:'herb_0_8', rank:0, rankName:'Phàm Cấp', name:'Gừng Rừng', emoji:'🫚', icon: 'herb_icon_herb_0_8', color:'#d97706', price:5, desc:'Củ gừng hoang mọc sâu trong rừng, vị cay nồng ấm bụng và đuổi hàn khí phàm cấp.' },
  { id:'herb_0_9', rank:0, rankName:'Phàm Cấp', name:'Tâm Diệp Thảo', emoji:'💚', icon: 'herb_icon_herb_0_9', color:'#16a34a', price:6, desc:'Lá hình trái tim màu xanh đậm, cầm máu vết thương ngoài da của phàm nhân rất tốt.' },
  { id:'herb_0_10', rank:0, rankName:'Phàm Cấp', name:'Ngưu Tất Căn', emoji:'🌿', icon: 'herb_icon_herb_0_10', color:'#65a30d', price:7, desc:'Rễ cây ngưu tất dùng làm thuốc thấp khớp phàm, cũng là dược liệu cơ bản nhất.' },

  // =========================================================================
  // BỔ SUNG: NHẤT PHẨM (5 loại thêm — tổng 15 thảo Nhất Phẩm)
  // =========================================================================
  { id:'herb_1_11', rank:1, rankName:'Nhất Phẩm', name:'Thanh Linh Chi', emoji:'🍀', icon: 'herb_icon_herb_1_11', color:'#34d399', price:180, desc:'Linh chi xanh biếc mọc trên đá linh mạch, tăng cường linh căn và tốc độ dẫn khí.' },
  { id:'herb_1_12', rank:1, rankName:'Nhất Phẩm', name:'Hỏa Diệp Thảo', emoji:'🔥', icon: 'herb_icon_herb_1_12', color:'#f97316', price:155, desc:'Lá đỏ rực chứa hỏa khí nhẹ, nguyên liệu phổ biến cho đan dược hỏa hệ Nhất Phẩm.' },
  { id:'herb_1_13', rank:1, rankName:'Nhất Phẩm', name:'Hàn Thủy Căn', emoji:'🧊', icon: 'herb_icon_herb_1_13', color:'#7dd3fc', price:170, desc:'Rễ cây sinh trưởng dưới suối lạnh băng giá, chứa hàn khí đặc biệt hữu dụng.' },
  { id:'herb_1_14', rank:1, rankName:'Nhất Phẩm', name:'Linh Nha Thảo', emoji:'🌱', icon: 'herb_icon_herb_1_14', color:'#86efac', price:200, desc:'Mầm non của cây linh thảo Nhất Phẩm, cực kỳ mềm mại nhưng linh lực phong phú.' },
  { id:'herb_1_15', rank:1, rankName:'Nhất Phẩm', name:'Vũ Lộ Hoa', emoji:'🌺', icon: 'herb_icon_herb_1_15', color:'#e879f9', price:220, desc:'Hoa nở khi có sương mai tinh khiết, hấp thụ thiên địa linh khí vào mỗi sáng sớm.' },

  // =========================================================================
  // BỔ SUNG: NHỊ PHẨM (5 loại thêm — tổng 15 thảo Nhị Phẩm)
  // =========================================================================
  { id:'herb_2_11', rank:2, rankName:'Nhị Phẩm', name:'Song Linh Diệp', emoji:'🍂', icon: 'herb_icon_herb_2_11', color:'#f59e0b', price:1100, desc:'Lá kép song sinh luôn mọc thành đôi, ngưng tụ gấp đôi linh khí linh mạch Trúc Cơ.' },
  { id:'herb_2_12', rank:2, rankName:'Nhị Phẩm', name:'Thiên Hà Chi', emoji:'🌊', icon: 'herb_icon_herb_2_12', color:'#38bdf8', price:1300, desc:'Cành xanh ngọc mọc gần nguồn linh thủy, cực quý cho đan dược thủy hệ Nhị Phẩm.' },
  { id:'herb_2_13', rank:2, rankName:'Nhị Phẩm', name:'Tử Điện Hoa', emoji:'⚡', icon: 'herb_icon_herb_2_13', color:'#a78bfa', price:1500, desc:'Hoa màu tím điện cuốn lôi khí xung quanh, nguyên liệu lôi hệ quan trọng bậc nhất.' },
  { id:'herb_2_14', rank:2, rankName:'Nhị Phẩm', name:'Kim Tiền Thảo', emoji:'💰', icon: 'herb_icon_herb_2_14', color:'#facc15', price:1200, desc:'Lá vàng hình đồng tiền, dùng để tăng hiệu quả chế luyện đan dược Trúc Cơ.' },
  { id:'herb_2_15', rank:2, rankName:'Nhị Phẩm', name:'Ngũ Sắc Linh Căn', emoji:'🌈', icon: 'herb_icon_herb_2_15', color:'#ec4899', price:1800, desc:'Rễ ngũ sắc ngưng tụ khí ngũ hành, nền tảng cho đan dược cân bằng nguyên tố.' },

  // =========================================================================
  // BỔ SUNG: TAM PHẨM (5 loại thêm — tổng 15 thảo Tam Phẩm)
  // =========================================================================
  { id:'herb_3_11', rank:3, rankName:'Tam Phẩm', name:'Cửu Khúc Linh Căn', emoji:'🐉', icon: 'herb_icon_herb_3_11', color:'#f59e0b', price:9000, desc:'Rễ cong chín khúc như rồng cuộn, mỗi khúc lưu trữ tinh lực khác nhau cực kỳ phức tạp.' },
  { id:'herb_3_12', rank:3, rankName:'Tam Phẩm', name:'Thái Âm Linh Diệp', emoji:'🌑', icon: 'herb_icon_herb_3_12', color:'#1e293b', price:11000, desc:'Lá đen huyền bí hút âm linh khí cực mạnh, phục vụ luyện đan âm hệ Kim Đan.' },
  { id:'herb_3_13', rank:3, rankName:'Tam Phẩm', name:'Thái Dương Hoa Cầu', emoji:'☀️', icon: 'herb_icon_herb_3_13', color:'#fb923c', price:12000, desc:'Hoa hình cầu tỏa nhiệt dương quang, đối lập hoàn hảo với Thái Âm Linh Diệp.' },
  { id:'herb_3_14', rank:3, rankName:'Tam Phẩm', name:'Vạn Linh Mộc Chất', emoji:'🌳', icon: 'herb_icon_herb_3_14', color:'#22c55e', price:14000, desc:'Tinh chất gỗ cây thiên niên tuổi Kim Đan, phục hồi sinh mệnh và tăng mộc linh khí.' },
  { id:'herb_3_15', rank:3, rankName:'Tam Phẩm', name:'Thiên Lôi Tâm Quả', emoji:'🫀', icon: 'herb_icon_herb_3_15', color:'#8b5cf6', price:16000, desc:'Quả đỏ nứt tia sét hình trái tim, ngưng tụ lôi khí thiên nhiên mãnh liệt nhất Tam Phẩm.' },

  // =========================================================================
  // BỔ SUNG: TỨ PHẨM (5 loại thêm — tổng 15 thảo Tứ Phẩm)
  // =========================================================================
  { id:'herb_4_11', rank:4, rankName:'Tứ Phẩm', name:'Long Uyên Thảo', emoji:'🐲', icon: 'herb_icon_herb_4_11', color:'#16a34a', price:45000, desc:'Thảo dược mọc đáy vực long uyên, ngưng tụ long khí lâu đời vô cùng thuần khiết.' },
  { id:'herb_4_12', rank:4, rankName:'Tứ Phẩm', name:'Cửu U Linh Diệp', emoji:'🌒', icon: 'herb_icon_herb_4_12', color:'#1e40af', price:55000, desc:'Lá tối chín tầng âm khí, Nguyên Anh Kỳ mới có thể tiếp xúc không bị âm khí xâm thực.' },
  { id:'herb_4_13', rank:4, rankName:'Tứ Phẩm', name:'Tịnh Thế Liên Hoa', emoji:'🪷', icon: 'herb_icon_herb_4_13', color:'#f9a8d4', price:60000, desc:'Hoa sen tịnh hóa khí trường, thanh tẩy tạp khí trong kinh mạch Nguyên Anh Kỳ.' },
  { id:'herb_4_14', rank:4, rankName:'Tứ Phẩm', name:'Vạn Niên Huyết Sâm', emoji:'🩸', icon: 'herb_icon_herb_4_14', color:'#dc2626', price:70000, desc:'Sâm vạn năm tuổi đỏ như huyết, uống vào tăng bùng sinh mệnh lực đột biến.' },
  { id:'herb_4_15', rank:4, rankName:'Tứ Phẩm', name:'Cố Bản Thần Thảo', emoji:'🌵', icon: 'herb_icon_herb_4_15', color:'#84cc16', price:80000, desc:'Thảo thần gốc rễ sâu nhất thiên địa, củng cố căn bản tu tiên vĩnh viễn không lay chuyển.' },

  // =========================================================================
  // BỔ SUNG: NGŨ PHẨM (5 loại thêm — tổng 15 thảo Ngũ Phẩm)
  // =========================================================================
  { id:'herb_5_11', rank:5, rankName:'Ngũ Phẩm', name:'Càn Khôn Thần Hoa', emoji:'🌸', icon: 'herb_icon_herb_5_11', color:'#f0abfc', price:150000, desc:'Hoa thần càn khôn nở giữa hư không, hội tụ thiên địa đại đạo khai thiên tịch địa.' },
  { id:'herb_5_12', rank:5, rankName:'Ngũ Phẩm', name:'Tạo Hóa Chi Mộc', emoji:'🌲', icon: 'herb_icon_herb_5_12', color:'#15803d', price:180000, desc:'Cành cây tạo hóa từ nguồn gốc vũ trụ, chứa bí mật sáng thế chỉ Hóa Thần mới hiểu.' },
  { id:'herb_5_13', rank:5, rankName:'Ngũ Phẩm', name:'Độ Kiếp Liên Tâm', emoji:'⚛️', icon: 'herb_icon_herb_5_13', color:'#0284c7', price:200000, desc:'Tim sen vượt kiếp nạn siêu việt, giúp Hóa Thần vượt thiên kiếp mà không bị thương.' },
  { id:'herb_5_14', rank:5, rankName:'Ngũ Phẩm', name:'Hỗn Độn Linh Quả', emoji:'🌑', icon: 'herb_icon_herb_5_14', color:'#0f172a', price:250000, desc:'Quả tối hỗn độn thái sơ từ trước khi vũ trụ hình thành, chứa đựng mọi đại đạo.' },
  { id:'herb_5_15', rank:5, rankName:'Ngũ Phẩm', name:'Nhật Nguyệt Tinh Hoa Thảo', emoji:'🌠', icon: 'herb_icon_herb_5_15', color:'#c026d3', price:320000, desc:'Tinh hoa nhật nguyệt tích lũy triệu năm thành thảo, tuyệt đỉnh linh dược tu tiên giới.' }
];


/**
 * Tìm linh thảo theo tên hoặc ID
 */
export function getHerbByName(name) {
  return ALL_HERBS.find(h => h.name === name) || null;
}

export function getHerbById(id) {
  return ALL_HERBS.find(h => h.id === id) || null;
}

/**
 * Lấy danh sách 10 loại linh thảo theo phẩm cấp (1..5)
 */
export function getHerbsByRank(rank) {
  return ALL_HERBS.filter(h => h.rank === rank);
}
