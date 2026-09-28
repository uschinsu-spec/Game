// BÁCH NGHỆ TU TIÊN: ĐAN DƯỢC • PHÙ LỤC • TRẬN PHÁP (1~5 PHẨM)

export const CRAFTING_SYSTEM = {
  pills: [
    // --- PHÀM CẤP (Đại Phuóc, cho Phàm Nhân chưa tu luyện) ---
    {
      id: 'pill_0_basic',
      icon: 'pill_icon_pill_0_basic',
      rank: 'Phàm Cấp',
      pillRank: 0,
      grade: 'Hạ Phẩm',
      type: 'heal',
      healHp: 80,
      name: 'Phàm Cấp Hạ Phẩm Phúc Nguyên Tán',
      recipeHerbs: [
        { name: 'Dã Thảo', count: 2 },
        { name: 'Bồ Công Anh', count: 1 }
      ],
      costOres: 0,
      costGold: 2,
      desc: 'Hồi phục 80 HP. Thuốc phàm pha chế từ dã thảo, dùng được cho cả phàm nhân.'
    },
    {
      id: 'pill_0_stamina',
      icon: 'pill_icon_pill_0_stamina',
      rank: 'Phàm Cấp',
      pillRank: 0,
      grade: 'Trung Phẩm',
      type: 'heal',
      healHp: 150,
      name: 'Phàm Cấp Trung Phẩm Dưỡng Sinh Tán',
      recipeHerbs: [
        { name: 'Trần Bì Thảo', count: 3 },
        { name: 'Khổ Sâm Lá', count: 2 },
        { name: 'Gừng Rừng', count: 1 }
      ],
      costOres: 0,
      costGold: 5,
      desc: 'Hồi phục 150 HP và giải độc phàm. Thuốc dưỡng sinh phàm cấp tốt nhất.'
    },
    {
      id: 'pill_0_enter',
      icon: 'pill_icon_pill_0_enter',
      rank: 'Phàm Cấp',
      pillRank: 0,
      grade: 'Thượng Phẩm',
      type: 'cultivation',
      speedBuff: 1,
      durationSec: 60,
      name: 'Phàm Cấp Thượng Phẩm Dẫn Khí Tán',
      recipeHerbs: [
        { name: 'Cúc Dại', count: 4 },
        { name: 'Dã Thảo', count: 3 },
        { name: 'Gừng Rừng', count: 2 }
      ],
      costOres: 0,
      costGold: 10,
      desc: 'Tăng tốc độ tu luyện +1 Tu Vi/s trong 60s. Thuốc dẫn khí nhập môn đầu tiên.'
    },

    // --- NHẤT PHẨM (Luyện Khí Kỳ, Rank 1) ---
    {
      id: 'pill_1_hp',
      icon: 'pill_icon_pill_1_hp',
      rank: 'Nhất Phẩm',
      pillRank: 1,
      grade: 'Hạ Phẩm',
      type: 'heal',
      healHp: 300,
      name: 'Nhất Phẩm Hạ Phẩm Bổ Huyết Đan',
      recipeHerbs: [
        { name: 'Huyết Căn Thảo', count: 2 },
        { name: 'Địa Hoàng Thảo', count: 1 },
        { name: 'Ngưng Khí Thảo', count: 1 }
      ],
      costOres: 0,
      costGold: 20,
      desc: 'Hồi phục 300 HP lập tức. Thích hợp Luyện Khí Kỳ.'
    },
    {
      id: 'pill_1_tu_khi',
      icon: 'pill_icon_pill_1_tu_khi',
      rank: 'Nhất Phẩm',
      pillRank: 1,
      grade: 'Trung Phẩm',
      type: 'cultivation',
      speedBuff: 5,
      durationSec: 180,
      name: 'Nhất Phẩm Trung Phẩm Tụ Khí Đan',
      recipeHerbs: [
        { name: 'Tụ Linh Diệp', count: 2 },
        { name: 'Ngưng Khí Thảo', count: 2 },
        { name: 'Thanh Linh Hoa', count: 1 }
      ],
      costOres: 0,
      costGold: 40,
      desc: 'Tăng tốc độ tụ khí +5 Tu Vi/s trong 180s (3 phút). Chuẩn Luyện Khí Kỳ.'
    },
    {
      id: 'pill_1_boi_nguyen',
      icon: 'pill_icon_pill_1_boi_nguyen',
      rank: 'Nhất Phẩm',
      pillRank: 1,
      grade: 'Thượng Phẩm',
      type: 'cultivation',
      speedBuff: 15,
      durationSec: 180,
      name: 'Nhất Phẩm Thượng Phẩm Bồi Nguyên Đan',
      recipeHerbs: [
        { name: 'Bạch Linh Chi', count: 3 },
        { name: 'Kim Ti Đằng', count: 2 },
        { name: 'Hàn Băng Thảo', count: 2 }
      ],
      costOres: 1,
      costGold: 80,
      desc: 'Tăng tốc độ tụ khí +15 Tu Vi/s trong 180s (3 phút). Chuẩn Luyện Khí Kỳ.'
    },
    {
      id: 'pill_1_truc_co',
      icon: 'pill_icon_pill_1_truc_co',
      rank: 'Nhất Phẩm',
      pillRank: 1,
      grade: 'Cực Phẩm',
      type: 'breakthrough',
      name: 'Nhất Phẩm Cực Phẩm Trúc Cơ Đan',
      recipeHerbs: [
        { name: 'Trúc Cơ Mộc', count: 3 },
        { name: 'Hỏa Diễm Hoa', count: 3 },
        { name: 'Tụ Linh Diệp', count: 4 }
      ],
      costOres: 3,
      costGold: 200,
      desc: 'Đan dược phá vỡ bình cảnh Luyện Khí Đỉnh Phong ➔ Trúc Cơ Sơ Kỳ.'
    },

    // --- NHỊ PHẨM (Trúc Cơ Kỳ, Rank 2) ---
    {
      id: 'pill_2_hp',
      icon: 'pill_icon_pill_2_hp',
      rank: 'Nhị Phẩm',
      pillRank: 2,
      grade: 'Hạ Phẩm',
      type: 'heal',
      healHp: 1500,
      name: 'Nhị Phẩm Hạ Phẩm Tẩy Tủy Đan',
      recipeHerbs: [
        { name: 'Tẩy Tủy Hoa', count: 3 },
        { name: 'Bích Ngọc Trúc', count: 2 },
        { name: 'Huyền Sâm', count: 2 }
      ],
      costOres: 2,
      costGold: 150,
      desc: 'Hồi phục 1500 HP lập tức. Thích hợp Trúc Cơ Kỳ.'
    },
    {
      id: 'pill_2_chan_nguyen',
      icon: 'pill_icon_pill_2_chan_nguyen',
      rank: 'Nhị Phẩm',
      pillRank: 2,
      grade: 'Trung Phẩm',
      type: 'cultivation',
      speedBuff: 45,
      durationSec: 180,
      name: 'Nhị Phẩm Trung Phẩm Chân Nguyên Đan',
      recipeHerbs: [
        { name: 'Tử Vân Thảo', count: 4 },
        { name: 'Phong Linh Thảo', count: 3 },
        { name: 'Tẩy Tủy Hoa', count: 2 }
      ],
      costOres: 4,
      costGold: 300,
      desc: 'Tăng tốc độ tụ khí +45 Tu Vi/s trong 180s. Chuẩn Trúc Cơ Kỳ.'
    },
    {
      id: 'pill_2_dinh_than',
      icon: 'pill_icon_pill_2_dinh_than',
      rank: 'Nhị Phẩm',
      pillRank: 2,
      grade: 'Thượng Phẩm',
      type: 'cultivation',
      speedBuff: 120,
      durationSec: 180,
      name: 'Nhị Phẩm Thượng Phẩm Định Thần Đan',
      recipeHerbs: [
        { name: 'Định Thần Quả', count: 4 },
        { name: 'Huyết Linh Chi', count: 3 },
        { name: 'Thiên Thanh Đằng', count: 3 }
      ],
      costOres: 8,
      costGold: 600,
      desc: 'Tăng tốc độ tụ khí +120 Tu Vi/s trong 180s. Chuẩn Trúc Cơ Kỳ.'
    },
    {
      id: 'pill_2_ngung_dan',
      icon: 'pill_icon_pill_2_ngung_dan',
      rank: 'Nhị Phẩm',
      pillRank: 2,
      grade: 'Cực Phẩm',
      type: 'breakthrough',
      name: 'Nhị Phẩm Cực Phẩm Ngưng Đan Đan',
      recipeHerbs: [
        { name: 'Kim Đan Thụ Bì', count: 5 },
        { name: 'Xích Diễm Quả', count: 4 },
        { name: 'Huyền Sâm', count: 4 }
      ],
      costOres: 15,
      costGold: 1200,
      desc: 'Đan dược phá vỡ bình cảnh Trúc Cơ Đỉnh Phong ➔ Kim Đan Sơ Kỳ.'
    },

    // --- TAM PHẨM (Kim Đan Kỳ, Rank 3) ---
    {
      id: 'pill_3_hp',
      icon: 'pill_icon_pill_3_hp',
      rank: 'Tam Phẩm',
      pillRank: 3,
      grade: 'Hạ Phẩm',
      type: 'heal',
      healHp: 6000,
      name: 'Tam Phẩm Hạ Phẩm Cố Kim Đan',
      recipeHerbs: [
        { name: 'Hóa Cốt Thảo', count: 5 },
        { name: 'U Minh Sâm', count: 4 },
        { name: 'Cửu Diệp Chi', count: 4 }
      ],
      costOres: 10,
      costGold: 800,
      desc: 'Hồi phục 6000 HP lập tức. Thích hợp Kim Đan Kỳ.'
    },
    {
      id: 'pill_3_linh_phach',
      icon: 'pill_icon_pill_3_linh_phach',
      rank: 'Tam Phẩm',
      pillRank: 3,
      grade: 'Trung Phẩm',
      type: 'cultivation',
      speedBuff: 350,
      durationSec: 180,
      name: 'Tam Phẩm Trung Phẩm Linh Phách Đan',
      recipeHerbs: [
        { name: 'Cửu Diệp Chi', count: 6 },
        { name: 'Thái Dương Chi', count: 5 },
        { name: 'Thiên Lôi Mộc', count: 4 }
      ],
      costOres: 20,
      costGold: 1600,
      desc: 'Tăng tốc độ tụ khí +350 Tu Vi/s trong 180s. Chuẩn Kim Đan Kỳ.'
    },
    {
      id: 'pill_3_cuu_chuyen',
      icon: 'pill_icon_pill_3_cuu_chuyen',
      rank: 'Tam Phẩm',
      pillRank: 3,
      grade: 'Thượng Phẩm',
      type: 'cultivation',
      speedBuff: 900,
      durationSec: 180,
      name: 'Tam Phẩm Thượng Phẩm Cửu Chuyển Kim Đan',
      recipeHerbs: [
        { name: 'Cửu Chuyển Linh Hoa', count: 8 },
        { name: 'Thái Âm Thảo', count: 6 },
        { name: 'Băng Phách Liên', count: 5 }
      ],
      costOres: 35,
      costGold: 3500,
      desc: 'Tăng tốc độ tụ khí +900 Tu Vi/s trong 180s. Chuẩn Kim Đan Kỳ.'
    },
    {
      id: 'pill_3_hoa_anh',
      icon: 'pill_icon_pill_3_hoa_anh',
      rank: 'Tam Phẩm',
      pillRank: 3,
      grade: 'Cực Phẩm',
      type: 'breakthrough',
      name: 'Tam Phẩm Cực Phẩm Hóa Anh Đan',
      recipeHerbs: [
        { name: 'Hóa Anh Đằng', count: 8 },
        { name: 'Kim Quang Thảo', count: 7 },
        { name: 'Thiên Lôi Mộc', count: 6 }
      ],
      costOres: 60,
      costGold: 7000,
      desc: 'Đan dược phá vỡ bình cảnh Kim Đan Đỉnh Phong ➔ Nguyên Anh Sơ Kỳ.'
    },

    // --- TỨ PHẨM (Nguyên Anh Kỳ, Rank 4) ---
    {
      id: 'pill_4_hp',
      icon: 'pill_icon_pill_4_hp',
      rank: 'Tứ Phẩm',
      pillRank: 4,
      grade: 'Hạ Phẩm',
      type: 'heal',
      healHp: 25000,
      name: 'Tứ Phẩm Hạ Phẩm Cố Bản Đan',
      recipeHerbs: [
        { name: 'Cố Bản Thần Thảo', count: 10 },
        { name: 'Vạn Niên Huyết Sâm', count: 8 },
        { name: 'Cửu U Linh Diệp', count: 6 }
      ],
      costOres: 40,
      costGold: 4000,
      desc: 'Hồi phục 25.000 HP lập tức. Thích hợp Nguyên Anh Kỳ.'
    },
    {
      id: 'pill_4_hon_nguyen',
      icon: 'pill_icon_pill_4_hon_nguyen',
      rank: 'Tứ Phẩm',
      pillRank: 4,
      grade: 'Trung Phẩm',
      type: 'cultivation',
      speedBuff: 2200,
      durationSec: 180,
      name: 'Tứ Phẩm Trung Phẩm Hồn Nguyên Đan',
      recipeHerbs: [
        { name: 'Hồn Nguyên Quả', count: 12 },
        { name: 'Thiên Cương Chi', count: 10 },
        { name: 'Ngũ Sắc Linh Đằng', count: 8 }
      ],
      costOres: 80,
      costGold: 8500,
      desc: 'Tăng tốc độ tụ khí +2200 Tu Vi/s trong 180s. Chuẩn Nguyên Anh Kỳ.'
    },
    {
      id: 'pill_4_thien_cuong',
      icon: 'pill_icon_pill_4_thien_cuong',
      rank: 'Tứ Phẩm',
      pillRank: 4,
      grade: 'Thượng Phẩm',
      type: 'cultivation',
      speedBuff: 5500,
      durationSec: 180,
      name: 'Tứ Phẩm Thượng Phẩm Thiên Cương Đan',
      recipeHerbs: [
        { name: 'Thiên Cương Chi', count: 15 },
        { name: 'Chân Long Thảo', count: 12 },
        { name: 'Tịnh Thế Liên Hoa', count: 10 }
      ],
      costOres: 140,
      costGold: 18000,
      desc: 'Tăng tốc độ tụ khí +5500 Tu Vi/s trong 180s. Chuẩn Nguyên Anh Kỳ.'
    },
    {
      id: 'pill_4_hoa_than',
      icon: 'pill_icon_pill_4_hoa_than',
      rank: 'Tứ Phẩm',
      pillRank: 4,
      grade: 'Cực Phẩm',
      type: 'breakthrough',
      name: 'Tứ Phẩm Cực Phẩm Hóa Thần Đan',
      recipeHerbs: [
        { name: 'Hóa Thần Mộc', count: 18 },
        { name: 'Thiên Ma Thảo', count: 14 },
        { name: 'Hồn Nguyên Quả', count: 12 }
      ],
      costOres: 250,
      costGold: 40000,
      desc: 'Đan dược phá vỡ bình cảnh Nguyên Anh Đỉnh Phong ➔ Hóa Thần Sơ Kỳ.'
    },

    // --- NGŨ PHẨM (Hóa Thần Kỳ, Rank 5) ---
    {
      id: 'pill_5_hp',
      icon: 'pill_icon_pill_5_hp',
      rank: 'Ngũ Phẩm',
      pillRank: 5,
      grade: 'Hạ Phẩm',
      type: 'heal',
      healHp: 100000,
      name: 'Ngũ Phẩm Hạ Phẩm Càn Khôn Đan',
      recipeHerbs: [
        { name: 'Càn Khôn Thần Hoa', count: 20 },
        { name: 'Hư Không Đằng', count: 15 },
        { name: 'Thái Sơ Thần Quả', count: 12 }
      ],
      costOres: 200,
      costGold: 30000,
      desc: 'Hồi phục 100.000 HP lập tức. Thích hợp Hóa Thần Kỳ.'
    },
    {
      id: 'pill_5_tao_hoa',
      icon: 'pill_icon_pill_5_tao_hoa',
      rank: 'Ngũ Phẩm',
      pillRank: 5,
      grade: 'Trung Phẩm',
      type: 'cultivation',
      speedBuff: 12000,
      durationSec: 180,
      name: 'Ngũ Phẩm Trung Phẩm Tạo Hóa Đan',
      recipeHerbs: [
        { name: 'Tạo Hóa Chi', count: 22 },
        { name: 'Khai Thiên Thảo', count: 18 },
        { name: 'Hỗn Độn Linh Diệp', count: 15 }
      ],
      costOres: 350,
      costGold: 65000,
      desc: 'Tăng tốc độ tụ khí +12.000 Tu Vi/s trong 180s. Chuẩn Hóa Thần Kỳ.'
    },
    {
      id: 'pill_5_thai_co',
      icon: 'pill_icon_pill_5_thai_co',
      rank: 'Ngũ Phẩm',
      pillRank: 5,
      grade: 'Thượng Phẩm',
      type: 'cultivation',
      speedBuff: 30000,
      durationSec: 180,
      name: 'Ngũ Phẩm Thượng Phẩm Thái Cổ Đan',
      recipeHerbs: [
        { name: 'Thái Sơ Thần Quả', count: 25 },
        { name: 'Nhật Nguyệt Tinh Hoa Thảo', count: 20 },
        { name: 'Độ Kiếp Thần Mộc', count: 18 }
      ],
      costOres: 600,
      costGold: 130000,
      desc: 'Tăng tốc độ tụ khí +30.000 Tu Vi/s trong 180s. Chuẩn Hóa Thần Kỳ.'
    },
    {
      id: 'pill_5_hon_don',
      icon: 'pill_icon_pill_5_hon_don',
      rank: 'Ngũ Phẩm',
      pillRank: 5,
      grade: 'Cực Phẩm',
      type: 'cultivation',
      speedBuff: 75000,
      durationSec: 180,
      name: 'Ngũ Phẩm Cực Phẩm Hỗn Độn Tiên Đan',
      recipeHerbs: [
        { name: 'Phượng Hoàng Huyết Chi', count: 30 },
        { name: 'Vạn Kiếp Bất Diệt Liên', count: 25 },
        { name: 'Hỗn Độn Linh Diệp', count: 22 }
      ],
      costOres: 1000,
      costGold: 300000,
      desc: 'Tăng tốc độ tụ khí +75.000 Tu Vi/s trong 180s. Nghịch thiên tạo hóa.'
    }
  ],
  talismans: [
    // ===== PHÀM CẤP PHÙ =====
    { id:'talisman_0_atk', rank:'Phàm Cấp', pillRank:0, grade:'Hạ Phẩm',
      icon: 'talisman_icon_talisman_0_atk',
      name:'Phàm Cấp Hạ Phẩm Trừ Tà Phù',
      recipeHerbs:[{name:'Dã Thảo',count:2},{name:'Cúc Dại',count:1}],
      costOres:0, costGold:3, type:'talisman', dmg:80,
      desc:'Gây 80 Sát Thương. Phù vẽ bằng mực bình thường, dùng được cho cả phàm nhân.' },
    { id:'talisman_0_heal', rank:'Phàm Cấp', pillRank:0, grade:'Trung Phẩm',
      icon: 'talisman_icon_talisman_0_heal',
      name:'Phàm Cấp Trung Phẩm Cầm Máu Phù',
      recipeHerbs:[{name:'Khổ Sâm Lá',count:3},{name:'Gừng Rừng',count:2}],
      costOres:0, costGold:6, type:'talisman_heal', healHp:120,
      desc:'Hồi phục 120 HP tức thì. Phù cầm máu cấp cứu khẩn cấp phàm nhân.' },
    { id:'talisman_0_slow', rank:'Phàm Cấp', pillRank:0, grade:'Thượng Phẩm',
      icon: 'talisman_icon_talisman_0_slow',
      name:'Phàm Cấp Thượng Phẩm Cương Tiết Phù',
      recipeHerbs:[{name:'Trần Bì Thảo',count:4},{name:'Bồ Công Anh',count:3}],
      costOres:0, costGold:12, type:'talisman_cc', slowPct:30, durationSec:5,
      desc:'Làm chậm mục tiêu 30% trong 5s. Phù kìm hãm bước chân tương đối.' },
    { id:'talisman_0_aoe', rank:'Phàm Cấp', pillRank:0, grade:'Cực Phẩm',
      icon: 'talisman_icon_talisman_0_aoe',
      name:'Phàm Cấp Cực Phẩm Tiểu Hỏa Cầu Phù',
      recipeHerbs:[{name:'Gừng Rừng',count:5},{name:'Dã Thảo',count:4},{name:'Cúc Dại',count:3}],
      costOres:1, costGold:20, type:'talisman', dmg:200, aoe:true,
      desc:'Gây 200 Sát Thương Hỏa AoE. Cực phẩm phàm cấp, liều tối đa trước khi nhập môn.' },
    // ===== NHẤT PHẨM PHÙ =====
    { id:'talisman_1_atk', rank:'Nhất Phẩm', pillRank:1, grade:'Hạ Phẩm',
      icon: 'talisman_icon_talisman_1_atk',
      name:'Nhất Phẩm Hạ Phẩm Hỏa Cầu Phù',
      recipeHerbs:[{name:'Hỏa Diễm Hoa',count:2},{name:'Kim Ti Đằng',count:1},{name:'Ngưng Khí Thảo',count:1}],
      costOres:1, costGold:25, type:'talisman', dmg:350,
      desc:'Gây 350 Sát Thương Hỏa' },
    { id:'talisman_1_heal', rank:'Nhất Phẩm', pillRank:1, grade:'Trung Phẩm',
      icon: 'talisman_icon_talisman_1_heal',
      name:'Nhất Phẩm Trung Phẩm Hồi Linh Phù',
      recipeHerbs:[{name:'Huyết Căn Thảo',count:3},{name:'Bạch Linh Chi',count:2},{name:'Ngưng Khí Thảo',count:2}],
      costOres:2, costGold:50, type:'talisman_heal', healHp:600,
      desc:'Hồi phục 600 HP tức thì. Phù hồi linh cấp sơ.' },
    { id:'talisman_1_slow', rank:'Nhất Phẩm', pillRank:1, grade:'Thượng Phẩm',
      icon: 'talisman_icon_talisman_1_slow',
      name:'Nhất Phẩm Thượng Phẩm Phong Tỏa Phù',
      recipeHerbs:[{name:'Hàn Băng Thảo',count:3},{name:'Thanh Linh Hoa',count:2},{name:'Tụ Linh Diệp',count:2}],
      costOres:3, costGold:80, type:'talisman_cc', slowPct:50, durationSec:3,
      desc:'Làm căng băng đối phương 50% tốc độ 3s. Phù phong tỏa hối đối phương.' },
    { id:'talisman_1_aoe', rank:'Nhất Phẩm', pillRank:1, grade:'Cực Phẩm',
      icon: 'talisman_icon_talisman_1_aoe',
      name:'Nhất Phẩm Cực Phẩm Phù Lôi Bạo',
      recipeHerbs:[{name:'Trúc Cơ Mộc',count:4},{name:'Hỏa Diễm Hoa',count:3},{name:'Kim Ti Đằng',count:3}],
      costOres:5, costGold:200, type:'talisman', dmg:1800, aoe:true,
      desc:'AoE 1,800 Lôi Khí Sát Thương xung quanh.' },
    // ===== NHỊ PHẨM PHÙ =====
    { id:'talisman_2_atk', rank:'Nhị Phẩm', pillRank:2, grade:'Hạ Phẩm',
      icon: 'talisman_icon_talisman_2_atk',
      name:'Nhị Phẩm Hạ Phẩm Thiên Cương Kiếm Phù',
      recipeHerbs:[{name:'Phong Linh Thảo',count:5},{name:'Tử Vân Thảo',count:4},{name:'Bích Ngọc Trúc',count:3}],
      costOres:12, costGold:800, type:'talisman', dmg:4500,
      desc:'Gây 4,500 Kiếm Khí Sát Thương đơn mục tiêu.' },
    { id:'talisman_2_heal', rank:'Nhị Phẩm', pillRank:2, grade:'Trung Phẩm',
      icon: 'talisman_icon_talisman_2_heal',
      name:'Nhị Phẩm Trung Phẩm Sinh Mệnh Phù',
      recipeHerbs:[{name:'Huyết Linh Chi',count:5},{name:'Tẩy Tủy Hoa',count:4},{name:'Huyền Sâm',count:3}],
      costOres:15, costGold:1200, type:'talisman_heal', healHp:3000,
      desc:'Hồi phục 3,000 HP tức thì. Phù sinh mệnh Trúc Cơ Kỳ.' },
    { id:'talisman_2_stun', rank:'Nhị Phẩm', pillRank:2, grade:'Thượng Phẩm',
      icon: 'talisman_icon_talisman_2_stun',
      name:'Nhị Phẩm Thượng Phẩm Phong Tỏa Linh Phù',
      recipeHerbs:[{name:'Định Thần Quả',count:6},{name:'Thiên Thanh Đằng',count:5},{name:'Tử Vân Thảo',count:4}],
      costOres:20, costGold:2000, type:'talisman_cc', stunSec:2,
      desc:'Phong tỏa mục tiêu 2 giây (stun). Kiểm soát quan trọng Trúc Cơ Kỳ.' },
    { id:'talisman_2_aoe', rank:'Nhị Phẩm', pillRank:2, grade:'Cực Phẩm',
      icon: 'talisman_icon_talisman_2_aoe',
      name:'Nhị Phẩm Cực Phẩm Thiên Cương Lôi Phù',
      recipeHerbs:[{name:'Phong Linh Thảo',count:8},{name:'Tử Vân Thảo',count:6},{name:'Xích Diễm Quả',count:5}],
      costOres:18, costGold:1500, type:'talisman', dmg:7500, aoe:true,
      desc:'AoE 7,500 Thiên Lôi Sát Thương' },
    // ===== TAM PHẨM PHÙ =====
    { id:'talisman_3_atk', rank:'Tam Phẩm', pillRank:3, grade:'Hạ Phẩm',
      icon: 'talisman_icon_talisman_3_atk',
      name:'Tam Phẩm Hạ Phẩm Kim Đan Phi Kiếm Phù',
      recipeHerbs:[{name:'Cửu Diệp Chi',count:8},{name:'Hóa Cốt Thảo',count:6},{name:'Thiên Lôi Mộc',count:5}],
      costOres:45, costGold:5000, type:'talisman', dmg:18000,
      desc:'Gây 18,000 Kiếm Khí Sát Thương cực mạnh.' },
    { id:'talisman_3_heal', rank:'Tam Phẩm', pillRank:3, grade:'Trung Phẩm',
      icon: 'talisman_icon_talisman_3_heal',
      name:'Tam Phẩm Trung Phẩm Kim Đan Hồi Linh Phù',
      recipeHerbs:[{name:'U Minh Sâm',count:8},{name:'Thái Dương Chi',count:6},{name:'Hóa Cốt Thảo',count:5}],
      costOres:55, costGold:7000, type:'talisman_heal', healHp:12000,
      desc:'Hồi phục 12,000 HP tức thì. Phù hồi linh Kim Đan Kỳ.' },
    { id:'talisman_3_freeze', rank:'Tam Phẩm', pillRank:3, grade:'Thượng Phẩm',
      icon: 'talisman_icon_talisman_3_freeze',
      name:'Tam Phẩm Thượng Phẩm Phong Tỏa Thiên Phù',
      recipeHerbs:[{name:'Băng Phách Liên',count:8},{name:'Thái Âm Thảo',count:7},{name:'Cửu Chuyển Linh Hoa',count:5}],
      costOres:70, costGold:10000, type:'talisman_cc', freezeSec:3, aoe:true,
      desc:'Phong tỏa AoE (băng) trong 3 giây. Kiểm soát diện rộng Kim Đan Kỳ.' },
    { id:'talisman_3_aoe', rank:'Tam Phẩm', pillRank:3, grade:'Cực Phẩm',
      icon: 'talisman_icon_talisman_3_aoe',
      name:'Tam Phẩm Cực Phẩm Vạn Kiếm Tru Ma Phù',
      recipeHerbs:[{name:'Thiên Lôi Mộc',count:12},{name:'Cửu Diệp Chi',count:10},{name:'Kim Quang Thảo',count:8}],
      costOres:70, costGold:8500, type:'talisman', dmg:32000, aoe:true,
      desc:'AoE 32,000 Kiếm Khí Sát Thương' },
    // ===== TỨ PHẨM PHÙ =====
    { id:'talisman_4_atk', rank:'Tứ Phẩm', pillRank:4, grade:'Hạ Phẩm',
      icon: 'talisman_icon_talisman_4_atk',
      name:'Tứ Phẩm Hạ Phẩm Nguyên Anh Thần Kiếm Phù',
      recipeHerbs:[{name:'Hồn Nguyên Quả',count:15},{name:'Cố Bản Thần Thảo',count:12},{name:'Vạn Niên Huyết Sâm',count:10}],
      costOres:180, costGold:25000, type:'talisman', dmg:90000,
      desc:'Gây 90,000 Thần Kiếm Sát Thương hướng đạo mục tiêu.' },
    { id:'talisman_4_heal', rank:'Tứ Phẩm', pillRank:4, grade:'Trung Phẩm',
      icon: 'talisman_icon_talisman_4_heal',
      name:'Tứ Phẩm Trung Phẩm Nguyên Anh Hồi Sinh Phù',
      recipeHerbs:[{name:'Cố Bản Thần Thảo',count:15},{name:'Tịnh Thế Liên Hoa',count:12},{name:'Cửu U Linh Diệp',count:10}],
      costOres:200, costGold:35000, type:'talisman_heal', healHp:50000,
      desc:'Hồi phục 50,000 HP tức thì. Phù hồi sinh Nguyên Anh Kỳ.' },
    { id:'talisman_4_cc', rank:'Tứ Phẩm', pillRank:4, grade:'Thượng Phẩm',
      icon: 'talisman_icon_talisman_4_cc',
      name:'Tứ Phẩm Thượng Phẩm Phong Tỏa Thái Hư Phù',
      recipeHerbs:[{name:'Thiên Ma Thảo',count:20},{name:'Ngũ Sắc Linh Đằng',count:16},{name:'Chân Long Thảo',count:14}],
      costOres:280, costGold:60000, type:'talisman_cc', stunSec:5, aoe:true,
      desc:'AoE Phong Tỏa 5 giây. Kiểm soát toàn diện Nguyên Anh Kỳ.' },
    { id:'talisman_4_aoe', rank:'Tứ Phẩm', pillRank:4, grade:'Cực Phẩm',
      icon: 'talisman_icon_talisman_4_aoe',
      name:'Tứ Phẩm Cực Phẩm Diệt Ma Thần Lôi Phù',
      recipeHerbs:[{name:'Thiên Cương Chi',count:25},{name:'Chân Long Thảo',count:20},{name:'Thiên Ma Thảo',count:18}],
      costOres:280, costGold:48000, type:'talisman', dmg:130000, aoe:true,
      desc:'AoE 130,000 Sát Thương' },
    // ===== NGŨ PHẨM PHÙ =====
    { id:'talisman_5_atk', rank:'Ngũ Phẩm', pillRank:5, grade:'Hạ Phẩm',
      icon: 'talisman_icon_talisman_5_atk',
      name:'Ngũ Phẩm Hạ Phẩm Hóa Thần Thái Hư Phù',
      recipeHerbs:[{name:'Càn Khôn Thần Hoa',count:25},{name:'Tạo Hóa Chi',count:20},{name:'Hư Không Đằng',count:18}],
      costOres:700, costGold:200000, type:'talisman', dmg:280000,
      desc:'Gây 280,000 Sát Thương Hóa Thần hướng đạo.' },
    { id:'talisman_5_heal', rank:'Ngũ Phẩm', pillRank:5, grade:'Trung Phẩm',
      icon: 'talisman_icon_talisman_5_heal',
      name:'Ngũ Phẩm Trung Phẩm Hóa Thần Hồi Nguyên Phù',
      recipeHerbs:[{name:'Độ Kiếp Thần Mộc',count:28},{name:'Vạn Kiếp Bất Diệt Liên',count:22},{name:'Hỗn Độn Linh Diệp',count:18}],
      costOres:900, costGold:280000, type:'talisman_heal', healHp:200000,
      desc:'Hồi phục 200,000 HP tức thì. Phù hồi nguyên Hóa Thần Kỳ.' },
    { id:'talisman_5_freeze', rank:'Ngũ Phẩm', pillRank:5, grade:'Thượng Phẩm',
      icon: 'talisman_icon_talisman_5_freeze',
      name:'Ngũ Phẩm Thượng Phẩm Càn Khôn Phong Tỏa Phù',
      recipeHerbs:[{name:'Nhật Nguyệt Tinh Hoa Thảo',count:30},{name:'Tạo Hóa Chi',count:25},{name:'Phượng Hoàng Huyết Chi',count:20}],
      costOres:1100, costGold:400000, type:'talisman_cc', freezeSec:8, aoe:true,
      desc:'Càn Khôn phong tỏa AoE 8 giây. Kiểm soát tuyệt đỉnh Hóa Thần Kỳ.' },
    { id:'talisman_5_aoe', rank:'Ngũ Phẩm', pillRank:5, grade:'Cực Phẩm',
      icon: 'talisman_icon_talisman_5_aoe',
      name:'Ngũ Phẩm Cực Phẩm Cửu Thiên Tru Tiên Phù',
      recipeHerbs:[{name:'Khai Thiên Thảo',count:40},{name:'Hư Không Đằng',count:35},{name:'Phượng Hoàng Huyết Chi',count:30}],
      costOres:1200, costGold:350000, type:'talisman', dmg:550000, aoe:true,
      desc:'AoE 550,000 Sát Thương' }
  ],
  formations: [
    {
      rank: 'Phàm Cấp',
      grade: 'Hạ Phẩm',
      name: 'Phàm Cấp Hạ Phẩm Hộ Thể Tiểu Trận',
      recipeHerbs: [
        { name: 'Dã Thảo', count: 4 },
        { name: 'Trần Bì Thảo', count: 3 }
      ],
      costOres: 2,
      costGold: 30,
      bonusDmg: 5,
      bonusHp: 60,
      bonusDef: 4,
      desc: '+5 Dmg, +60 HP, +4 Def. Trận pháp đơn giản nhất cho phàm nhân.'
    },
    {
      rank: 'Phàm Cấp',
      grade: 'Trung Phẩm',
      name: 'Phàm Cấp Trung Phẩm Tụ Lực Trận',
      recipeHerbs: [
        { name: 'Khổ Sâm Lá', count: 5 },
        { name: 'Bồ Công Anh', count: 4 },
        { name: 'Gừng Rừng', count: 3 }
      ],
      costOres: 4,
      costGold: 80,
      bonusDmg: 10,
      bonusHp: 120,
      bonusDef: 8,
      desc: '+10 Dmg, +120 HP, +8 Def. Trận tụ lực phàm nhân trung cấp.'
    },
    {
      rank: 'Nhất Phẩm',
      grade: 'Cực Phẩm',
      name: 'Nhất Phẩm Cực Phẩm Bách Linh Trận',
      recipeHerbs: [
        { name: 'Tụ Linh Diệp', count: 6 },
        { name: 'Bạch Linh Chi', count: 5 },
        { name: 'Kim Ti Đằng', count: 4 }
      ],

      costOres: 15,
      costGold: 500,
      bonusDmg: 40,
      bonusHp: 500,
      bonusDef: 35,
      desc: '+40 Dmg, +500 HP, +35 Def'
    },
    {
      rank: 'Nhị Phẩm',
      grade: 'Cực Phẩm',
      name: 'Nhị Phẩm Cực Phẩm Ngũ Hành Trận',
      recipeHerbs: [
        { name: 'Bích Ngọc Trúc', count: 15 },
        { name: 'Tử Vân Thảo', count: 12 },
        { name: 'Huyền Sâm', count: 10 }
      ],
      costOres: 60,
      costGold: 3500,
      bonusDmg: 250,
      bonusHp: 2800,
      bonusDef: 140,
      desc: '+250 Dmg, +2800 HP, +140 Def'
    },
    {
      rank: 'Tam Phẩm',
      grade: 'Cực Phẩm',
      name: 'Tam Phẩm Cực Phẩm Cửu Cung Trận',
      recipeHerbs: [
        { name: 'Cửu Diệp Chi', count: 25 },
        { name: 'Cửu Chuyển Linh Hoa', count: 20 },
        { name: 'Băng Phách Liên', count: 18 }
      ],
      costOres: 180,
      costGold: 20000,
      bonusDmg: 1500,
      bonusHp: 16000,
      bonusDef: 550,
      desc: '+1500 Dmg, +16k HP, +550 Def'
    },
    {
      rank: 'Tứ Phẩm',
      grade: 'Cực Phẩm',
      name: 'Tứ Phẩm Cực Phẩm Thái Hư Trận',
      recipeHerbs: [
        { name: 'Hồn Nguyên Quả', count: 45 },
        { name: 'Ngũ Sắc Linh Đằng', count: 40 },
        { name: 'Tịnh Thế Liên Hoa', count: 35 }
      ],
      costOres: 750,
      costGold: 120000,
      bonusDmg: 8000,
      bonusHp: 90000,
      bonusDef: 2200,
      desc: '+8000 Dmg, +90k HP, +2200 Def'
    },
    {
      rank: 'Ngũ Phẩm',
      grade: 'Cực Phẩm',
      name: 'Ngũ Phẩm Cực Phẩm Khai Thiên Trận',
      recipeHerbs: [
        { name: 'Khai Thiên Thảo', count: 80 },
        { name: 'Tạo Hóa Chi', count: 70 },
        { name: 'Hỗn Độn Linh Diệp', count: 60 }
      ],
      costOres: 3500,
      costGold: 800000,
      bonusDmg: 50000,
      bonusHp: 600000,
      bonusDef: 10000,
      desc: '+50k Dmg, +600k HP, +10k Def'
    }
  ]
};

/**
 * Kiểm tra xem người chơi có đủ nguyên liệu để luyện đan / phù / trận không
 */
export function canCraftRecipe(item, state) {
  if (!item || !state) return false;

  // 1. Kiểm tra 3 loại linh thảo
  if (Array.isArray(item.recipeHerbs)) {
    const herbsMap = state.herbs || {};
    for (const req of item.recipeHerbs) {
      const owned = (typeof herbsMap === 'object') ? (herbsMap[req.name] || 0) : 0;
      if (owned < req.count) return false;
    }
  } else if (item.costHerbs) {
    // Fallback nếu item cũ
    const totalHerbs = (typeof state.herbs === 'number') ? state.herbs : Object.values(state.herbs || {}).reduce((a, b) => a + b, 0);
    if (totalHerbs < item.costHerbs) return false;
  }

  // 2. Kiểm tra Khoáng Thạch
  if ((item.costOres || 0) > (state.ores || 0)) return false;

  // 3. Kiểm tra Linh Thạch / Tiền
  const gold = state.gold ?? (state.currencies?.low ?? 0);
  if ((item.costGold || 0) > gold) return false;

  return true;
}

/**
 * Trừ nguyên liệu khi luyện đan / phù / trận
 */
export function deductCraftMaterials(item, state) {
  if (!item || !state) return false;

  // 1. Trừ 3 loại linh thảo
  if (Array.isArray(item.recipeHerbs)) {
    if (typeof state.herbs !== 'object' || state.herbs === null) state.herbs = {};
    for (const req of item.recipeHerbs) {
      state.herbs[req.name] = Math.max(0, (state.herbs[req.name] || 0) - req.count);
    }
  } else if (item.costHerbs) {
    if (typeof state.herbs === 'number') state.herbs = Math.max(0, state.herbs - item.costHerbs);
  }

  // 2. Trừ khoáng thạch
  if (item.costOres) {
    state.ores = Math.max(0, (state.ores || 0) - item.costOres);
  }

  // 3. Trừ Linh Thạch / Tiền
  if (item.costGold) {
    if (state.gold !== undefined) state.gold = Math.max(0, state.gold - item.costGold);
    if (state.currencies?.low !== undefined) state.currencies.low = Math.max(0, state.currencies.low - item.costGold);
  }

  return true;
}

/**
 * Quy đổi Cảnh Giới sang Phẩm Cấp Đan Dược tương ứng (0..5)
 * Realm 0: Phàm Nhân = 0 (Phàm Cấp đan dược)
 * Realm 1..4: Luyện Khí = 1 (Nhất Phẩm)
 * Realm 5..8: Trúc Cơ = 2 (Nhị Phẩm)
 * Realm 9..12: Kim Đan = 3 (Tam Phẩm)
 * Realm 13..16: Nguyên Anh = 4 (Tứ Phẩm)
 * Realm 17..20: Hóa Thần = 5 (Ngũ Phẩm)
 */
export function getPlayerPillRank(realmIdx) {
  if (!realmIdx || realmIdx <= 0) return 0; // Phàm Nhân = rank 0
  return Math.min(5, Math.floor((realmIdx - 1) / 4) + 1);
}

/**
 * Tính toán hiệu quả khi nuốt đan dược / phù lục:
 * 0. Phàm Cấp đan dược (pillRank=0): Cả phàm nhân lẫn tu sĩ đều dùng được (heal/talisman).
 * 1. Đan dược cấp cao hơn cảnh giới (pillRank > playerRank): KHÔNG THỂ DÙNG.
 * 2. Đan dược bằng cấp cảnh giới (pillRank === playerRank): HIỆU QUẢ 100%.
 * 3. Đan dược thấp hơn cảnh giới (pillRank < playerRank): HIỆU QUẢ GIẢM MẠNH (giảm 80% mỗi bậc).
 * Đặc biệt: heal, breakthrough, talisman luôn dùng được (không giới hạn cảnh giới).
 */
export function calculatePillEfficiency(pill, realmIdx) {
  const playerRank = getPlayerPillRank(realmIdx);

  // Hồi máu, phá cảnh, phù lục — ai dùng cũng được
  if (pill.type === 'heal' || pill.type === 'breakthrough' ||
      pill.type === 'talisman' || pill.type === 'talisman_heal' || pill.type === 'talisman_cc') {
    return { canUse: true, efficiency: 1.0, effectiveSpeed: 0, message: '' };
  }

  // Phàm Cấp đan dược tu vi (pillRank=0) — phàm nhân dùng được, hiệu quả 100%
  if (pill.pillRank === 0) {
    return {
      canUse: true,
      efficiency: 1.0,
      effectiveSpeed: pill.speedBuff || 0,
      message: `Phàm Cấp dẫn khí tán, tốc độ dẫn khí nhỏ (+${pill.speedBuff || 0} Tu Vi/s trong ${pill.durationSec}s)`
    };
  }

  // Tu sĩ dùng đan dược tu vi cấp cao hơn cảnh giới
  if (pill.pillRank > playerRank) {
    return {
      canUse: false,
      reason: `Cảnh giới chưa đủ! Kinh mạch không thể gánh chịu dược lực bạo liệt của [${pill.rank}] đan dược (Có nguy cơ bạo thể)!`
    };
  }

  // Đúng cấp
  if (pill.pillRank === playerRank) {
    return {
      canUse: true,
      efficiency: 1.0,
      effectiveSpeed: pill.speedBuff,
      message: `Dược lực tương thích hoàn mỹ (+${pill.speedBuff} Tu Vi/s trong ${pill.durationSec}s)`
    };
  }

  // Thấp hơn cấp — hiệu quả giảm mạnh
  const diff = playerRank - pill.pillRank;
  const eff = Math.pow(0.2, diff); // Giảm 80% mỗi bậc: diff 1 = 20%, diff 2 = 4%, diff 3 = 0.8%
  const effectiveSpeed = Math.max(1, Math.floor(pill.speedBuff * eff));

  return {
    canUse: true,
    efficiency: eff,
    effectiveSpeed,
    message: `Đan dược thấp hơn cảnh giới: Dược lực suy giảm còn ${(eff * 100).toFixed(1)}% (+${effectiveSpeed} Tu Vi/s trong ${pill.durationSec}s)`
  };
}
