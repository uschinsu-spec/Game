// QUẢN LÝ TOÀN BỘ TRẠNG THÁI NGƯỜI CHƠI & DỮ LIỆU TU TIÊN
export const gameState = {
  // Cảnh giới & Tu vi
  realmIdx: 0,
  exp: 0,
  
  // Thuộc tính Tu Tiên
  spiritualSense: 10, // Thần Thức (tăng bạo kích & cảm ứng cơ duyên)
  manaMax: 500,       // Chân Nguyên / Linh Lực
  mana: 500,
  aptitude: 'Ngũ Hành Linh Căn', // Căn Cốt
  
  // Tài nguyên & Tiền tệ (Bạc, Linh Thạch Sơ/Trung/Thượng/Cực Phẩm - Tỷ lệ 1:10000)
  gold: 0, // Linh thạch sơ cấp (đồng bộ với currencies.low)
  currencies: {
    silver: 0,  // Bạc
    low: 0,     // Linh Thạch Sơ Cấp (1 Sơ Cấp = 10,000 Bạc)
    mid: 0,     // Linh Thạch Trung Cấp (1 Trung Cấp = 10,000 Sơ Cấp)
    high: 0,    // Linh Thạch Thượng Phẩm (1 Thượng Phẩm = 10,000 Trung Cấp)
    extreme: 0  // Linh Thạch Cực Phẩm (1 Cực Phẩm = 10,000 Thượng Phẩm)
  },
  herbs: {}, // Kho Linh Thảo đa dạng (Lưu theo từng loại thảo dược: { 'Ngưng Khí Thảo': 5, ... })
  ores: 0,
  materials: {
    beastPelts: 0, // Da Thú
    beastFurs: 0,  // Lông Thú
    beastClaws: 0, // Móng Vuốt
    beastBlood: 0, // Huyết Thú
    beastHorns: 0  // Sừng Thú
  },

  // Hệ Thống Công Pháp Tu Luyện & Dược Lực Đan Dược
  activeCongPhapId: null, // ID công pháp đang tu luyện (null = Chưa học)
  learnedCongPhapIds: [], // Danh sách các công pháp đã học
  isMeditating: false,    // Trạng thái Tĩnh Tọa / Ngồi Thiền tụ khí
  isResting: false,       // Trạng thái Ngồi Dưỡng Sức (hồi HP + MP, dừng di chuyển)
  activePillBuff: null,   // { name, speed, rank, durationLeft, expiresAt } (Dược lực tụ khí)
  claimedStarterGift: false, // Trạng thái đã nhận Quà Tân Thủ từ Trưởng Thôn chưa

  // Tổ Đội 5 Người (Võ Quán)
  party: {
    isFormed: false // true: 4 NPC hiệp khách đi theo hỗ trợ, chia 5 chiến lợi phẩm
  },

  // Tông môn
  sectId: null,       // 'van_kiem_tong', 'liet_diem_cung', ...
  sectRankIdx: 0,     // 0: Ngoại Môn -> 4: Thái Thượng Trưởng Lão
  sectContrib: 0,     // Điểm cống hiến môn phái
  lastSalaryClaim: 0, // Thời gian nhận bổng lộc

  // Trang bị đang mang trên người (6 ô: vũ khí, áo, mũ, giày, bội sức, hộ thuẫn)
  // Khởi đầu Phàm Nhân CHƯA TRANG BỊ ĐỒ NÀO THÌ ĐỂ TRỐNG HẾT
  equipped: {
    weapon: null,
    armor: null,
    helm: null,
    boots: null,
    amulet: null,
    shield: null
  },

  // Túi trữ vật
  inventory: {
    items: [], // Danh sách trang bị / vật phẩm trong túi
    pills: {},
    talismans: {},
    formations: []
  },

  // Bản đồ hiện tại - Map 0 là Thanh Vân Thôn Ngoại Vi
  currentMapId: 0,
  
  // Tôi luyện & Kỹ năng & Độ Thuần Thục (Sơ Nhập -> Tiểu Thành -> Đại Thành -> Viên Mãn)
  gearPlus: 0,
  equippedSkillIds: [], // Khởi đầu Phàm Nhân không có skill
  skillMastery: {}, // skillId -> { tierIdx: 0..3, exp: 0 }
  autoFight: true,
  autoMode: 'farm', // 'farm': Diệt quái quanh vùng | 'march': Vừa đánh vừa tiến tới | 'rush': Chạy thẳng không đánh
  gardenTimer: 0,

  // Thống kê Treo Máy (AFK Stats & Settings)
  afkStats: {
    kills: 0,
    exp: 0,
    gold: 0,
    ores: 0,
    pelts: 0,
    startTime: Date.now()
  },
  afkSettings: {
    autoSkill: true,
    autoFly: true,
    autoBreakthrough: true,
    autoSurvivalDash: true
  }
};
