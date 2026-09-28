import { gameState } from '../../state/gameState.js';
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { REALMS } from '../../config/realmsData.js';

export const SINO_VIET_NAMES = [
  'Lý Tiêu Dao', 'Hàn Lập', 'Lâm Động', 'Tiêu Viêm', 'Trương Tiểu Phàm',
  'Mộ Dung Phục', 'Diệp Thần', 'Lục Tuyết Kỳ', 'Sở Phong', 'Vương Lâm',
  'Tần Vũ', 'Thạch Hạo', 'Bạch Tiểu Thuần', 'Cố Trường Ca', 'Mạnh Hạo',
  'Lý Thất Dạ', 'Trần Bình An', 'Tô Minh', 'Kỷ Ninh', 'Đường Tam',
  'Lục Thanh Sơn', 'Hứa Thanh', 'Tiêu Thần', 'Lâm Phong', 'Phương Hàn',
  'Quân Tiêu Dao', 'Nhiếp Phong', 'Bộ Kinh Vân', 'Đoàn Dự', 'Hư Trúc',
  'Kiều Phong', 'Lệnh Hồ Xung', 'Dương Quá', 'Quách Tĩnh', 'Trương Vô Kỵ',
  'Phong Bất Bình', 'Diệp Cô Thành', 'Tây Môn Xuy Tuyết', 'Sở Lưu Hương', 'Lục Tiểu Phụng'
];

export const PARTY_MEMBERS_DEF = [
  { modelType: 'dai_han', name: 'Nhiếp Phong',   tint: 0xbbe1fa, offsetX: -48, offsetY: -26, title: '⚔️ Lam Đao' },
  { modelType: 'tho_san', name: 'Bộ Kinh Vân',   tint: 0xfecaca, offsetX: -48, offsetY:  26, title: '🪓 Xích Rìu' },
  { modelType: 'dai_han', name: 'Tiêu Phong',    tint: 0xbbf7d0, offsetX: -84, offsetY: -16, title: '⚔️ Bích Đao' },
  { modelType: 'tho_san', name: 'Đoàn Dự',       tint: 0xf3e8ff, offsetX: -84, offsetY:  16, title: '🪓 Tử Rìu' }
];

export const OUTFIT_COLOR_PALETTES = [
  { name: 'Lam Y (Thiên Lam)',        tint: 0xbae6fd, titleColor: '#bae6fd', vfxColor: 0x38bdf8 },
  { name: 'Bích Kiếm (Thanh Y)',     tint: 0xbbf7d0, titleColor: '#86efac', vfxColor: 0x4ade80 },
  { name: 'Hồng Sa (Chu Xích)',      tint: 0xfecdd3, titleColor: '#fda4af', vfxColor: 0xf43f5e },
  { name: 'Tử Hà (Đạo Tử)',          tint: 0xf3e8ff, titleColor: '#e9d5ff', vfxColor: 0xc084fc },
  { name: 'Hoàng Kim (Kim Bào)',     tint: 0xfef08a, titleColor: '#fef08a', vfxColor: 0xfacc15 },
  { name: 'Băng Tinh (Hải Lam)',     tint: 0xcffafe, titleColor: '#a5f3fc', vfxColor: 0x22d3ee },
  { name: 'Xích Viêm (Hỏa Bào)',     tint: 0xffedd5, titleColor: '#fed7aa', vfxColor: 0xfb923c },
  { name: 'Bạch Ngân (Nguyên Thủy)', tint: 0xffffff, titleColor: '#ffffff', vfxColor: 0xffffff },
  { name: 'Ngọc Bích (Lục Sa)',      tint: 0xd1fae5, titleColor: '#a7f3d0', vfxColor: 0x34d399 },
  { name: 'Hổ Phách (Hoàng Sa)',     tint: 0xfef3c7, titleColor: '#fde68a', vfxColor: 0xfbbf24 }
];

export const NPC_ELEMENTS = [
  { elem: 'Kiếm',   eKey: 'kim',   isSword: true,  title: 'Kiếm Tu', color: '#99eeff', tint: 0xbbe1fa, baseRange: 260 },
  { elem: 'Kim',    eKey: 'kim',   isSword: false, title: 'Kim Tu',  color: '#fde047', tint: 0xfef08a, baseRange: 260 },
  { elem: 'Mộc',    eKey: 'moc',   isSword: false, title: 'Mộc Tu',  color: '#4ade80', tint: 0xd1fae5, baseRange: 250 },
  { elem: 'Thủy',   eKey: 'thuy',  isSword: false, title: 'Thủy Tu', color: '#38bdf8', tint: 0xcffafe, baseRange: 260 },
  { elem: 'Hỏa',    eKey: 'hoa',   isSword: false, title: 'Hỏa Tu',  color: '#fb923c', tint: 0xffedd5, baseRange: 260 },
  { elem: 'Thổ',    eKey: 'tho',   isSword: false, title: 'Thổ Tu',  color: '#facc15', tint: 0xfef3c7, baseRange: 240 },
  { elem: 'Phong',  eKey: 'phong', isSword: false, title: 'Phong Tu',color: '#2dd4bf', tint: 0xccfbf1, baseRange: 260 },
  { elem: 'Lôi',    eKey: 'loi',   isSword: false, title: 'Lôi Tu',  color: '#c084fc', tint: 0xf3e8ff, baseRange: 260 },
  { elem: 'Vật Lý', eKey: 'ly',    isMelee: true,  title: 'Thể Tu',  color: '#f43f5e', tint: 0xfecdd3, baseRange: 90 }
];

export const MAP_NPC_PROGRESSIONS = {
  // Map 1: Thanh Vân Ngoại Vi (Phàm Nhân -> Luyện Khí Tầng 3)
  1: [
    { zone: 1, maxX: 4200,   realmIdx: 0,  masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 2, maxX: 12200,  realmIdx: 1,  masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 3, maxX: 22200,  realmIdx: 2,  masteryName: 'Tiểu Thành', masteryBonus: 0.15, vfxMul: 1.10, masteryColor: '#55ff99' },
    { zone: 4, maxX: 999999, realmIdx: 3,  masteryName: 'Đại Thành',  masteryBonus: 0.35, vfxMul: 1.20, masteryColor: '#ffd700' }
  ],
  // Map 2: Vạn Mộc Sâm Lâm (Luyện Khí Tầng 3 -> Tầng 12)
  2: [
    { zone: 1, maxX: 4200,   realmIdx: 3,  masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 2, maxX: 12200,  realmIdx: 6,  masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' },
    { zone: 3, maxX: 22200,  realmIdx: 9,  masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 4, maxX: 999999, realmIdx: 12, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ],
  // Map 3: Huyết Lạc Cấm Địa (Trúc Cơ Sơ Kỳ -> Đỉnh Phong)
  3: [
    { zone: 1, maxX: 4200,   realmIdx: 13, masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 2, maxX: 12200,  realmIdx: 14, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' },
    { zone: 3, maxX: 22200,  realmIdx: 15, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 4, maxX: 999999, realmIdx: 16, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ],
  // Map 4: Thiên Tinh Hải Thành (Trúc Cơ Hậu Kỳ -> Kim Đan Sơ Kỳ)
  4: [
    { zone: 1, maxX: 4200,   realmIdx: 15, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 2, maxX: 12200,  realmIdx: 16, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 3, maxX: 22200,  realmIdx: 17, masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 4, maxX: 999999, realmIdx: 17, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' }
  ],
  // Map 5: Ngoại Hải Săn Yêu (Kim Đan Sơ Kỳ -> Đỉnh Phong)
  5: [
    { zone: 1, maxX: 4200,   realmIdx: 17, masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 2, maxX: 12200,  realmIdx: 18, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' },
    { zone: 3, maxX: 22200,  realmIdx: 19, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 4, maxX: 999999, realmIdx: 20, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ],
  // Map 6: Hư Không Cổ Điện (Kim Đan Hậu Kỳ -> Nguyên Anh Sơ Kỳ)
  6: [
    { zone: 1, maxX: 4200,   realmIdx: 19, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 2, maxX: 12200,  realmIdx: 20, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 3, maxX: 22200,  realmIdx: 21, masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 4, maxX: 999999, realmIdx: 21, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' }
  ],
  // Map 7: Côn Lôn Tiên Lạc (Nguyên Anh Sơ Kỳ -> Đỉnh Phong)
  7: [
    { zone: 1, maxX: 4200,   realmIdx: 21, masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 2, maxX: 12200,  realmIdx: 22, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' },
    { zone: 3, maxX: 22200,  realmIdx: 23, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 4, maxX: 999999, realmIdx: 24, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ],
  // Map 8: Thái Hư Kiếm Cốc (Nguyên Anh Trung Kỳ -> Đỉnh Phong)
  8: [
    { zone: 1, maxX: 4200,   realmIdx: 22, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' },
    { zone: 2, maxX: 12200,  realmIdx: 23, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 3, maxX: 22200,  realmIdx: 24, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 4, maxX: 999999, realmIdx: 24, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ],
  // Map 9: Hoàng Cực Thần Điện (Nguyên Anh Đỉnh Phong -> Hóa Thần Sơ Kỳ)
  9: [
    { zone: 1, maxX: 4200,   realmIdx: 23, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 2, maxX: 12200,  realmIdx: 24, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 3, maxX: 22200,  realmIdx: 25, masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 4, maxX: 999999, realmIdx: 25, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' }
  ],
  // Map 10: U Minh Quỷ Quật (Hóa Thần Sơ Kỳ -> Đỉnh Phong)
  10: [
    { zone: 1, maxX: 4200,   realmIdx: 25, masteryName: 'Sơ Nhập',   masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' },
    { zone: 2, maxX: 12200,  realmIdx: 26, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' },
    { zone: 3, maxX: 22200,  realmIdx: 27, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 4, maxX: 999999, realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ],
  // Map 11: Thần Ma Cổ Chiến Trường (Hóa Thần Trung Kỳ -> Đỉnh Phong)
  11: [
    { zone: 1, maxX: 4200,   realmIdx: 26, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' },
    { zone: 2, maxX: 12200,  realmIdx: 27, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 3, maxX: 22200,  realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 4, maxX: 999999, realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ],
  // Map 12: Cửu Trọng Thiên Đạo
  12: [
    { zone: 1, maxX: 4200,   realmIdx: 27, masteryName: 'Đại Thành',  masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' },
    { zone: 2, maxX: 12200,  realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 3, maxX: 22200,  realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 4, maxX: 999999, realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ],
  // Map 13: Phi Thăng Tiên Môn
  13: [
    { zone: 1, maxX: 4200,   realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 2, maxX: 12200,  realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 3, maxX: 22200,  realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' },
    { zone: 4, maxX: 999999, realmIdx: 28, masteryName: 'Viên Mãn',   masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' }
  ]
};

export const FellowNpcMixin = {

  getRandomSinoVietName(excludeName = '') {
    const available = SINO_VIET_NAMES.filter(n => n !== excludeName);
    return Phaser.Utils.Array.GetRandom(available) || 'Vô Danh Tu Sĩ';
  },

  getRandomOutfit() {
    return Phaser.Utils.Array.GetRandom(OUTFIT_COLOR_PALETTES);
  },

  getNpcElement(elementIdx = -1) {
    if (elementIdx >= 0 && elementIdx < NPC_ELEMENTS.length) {
      return NPC_ELEMENTS[elementIdx];
    }
    return Phaser.Utils.Array.GetRandom(NPC_ELEMENTS);
  },

  getNpcSpawnConfig(mapId, homeX, elementIdx = -1) {
    const elemCfg = this.getNpcElement(elementIdx);
    const mapNum = Number(mapId) || 1;
    const zones = MAP_NPC_PROGRESSIONS[mapNum] || MAP_NPC_PROGRESSIONS[1];
    const zoneCfg = zones.find(z => homeX < z.maxX) || zones[zones.length - 1];

    const realmIdx = Math.max(0, Math.min(REALMS.length - 1, zoneCfg.realmIdx ?? 0));
    const realmData = REALMS[realmIdx] || REALMS[0];

    // Cảnh Giới -> Skill Tier & Trạng thái Bay (Khớp chính xác Player)
    let tierLevel = 1;
    let isFlying = false;

    if (realmIdx === 0) {
      tierLevel = 1;
      isFlying = false;
    } else if (realmIdx >= 1 && realmIdx <= 12) {
      tierLevel = 1;
      isFlying = false;
    } else if (realmIdx >= 13 && realmIdx <= 16) {
      tierLevel = 2;
      isFlying = true;
    } else if (realmIdx >= 17 && realmIdx <= 20) {
      tierLevel = 3;
      isFlying = true;
    } else if (realmIdx >= 21 && realmIdx <= 24) {
      tierLevel = 4;
      isFlying = true;
    } else if (realmIdx >= 25) {
      tierLevel = 5;
      isFlying = true;
    }

    const skillPrefix = elemCfg.isSword ? 'kiem' : elemCfg.eKey;
    const skillId = `${skillPrefix}_${tierLevel}`;
    const skillDef = ELEMENTAL_SKILLS.find(s => s.id === skillId) || ELEMENTAL_SKILLS.find(s => s.id === `${skillPrefix}_1`) || ELEMENTAL_SKILLS[0];

    // Dùng CHÍNH XÁC chỉ số từ REALMS của Player
    const maxHp = realmData.hp;
    const baseDmg = realmData.dmg;
    const baseDef = realmData.def;

    const titlePrefix = `[${realmData.name} · ${elemCfg.title}]`;

    return {
      mapId: mapNum,
      zone: zoneCfg.zone,
      realmIdx,
      realmMajor: realmData.major,
      stageLabel: realmData.name,
      tierLevel,
      isFlying,
      masteryName: zoneCfg.masteryName,
      masteryBonus: zoneCfg.masteryBonus,
      vfxMul: zoneCfg.vfxMul,
      masteryColor: zoneCfg.masteryColor,
      elem: elemCfg.elem,
      elemTitle: elemCfg.title,
      elemColor: elemCfg.color,
      eKey: elemCfg.eKey,
      isSword: elemCfg.isSword || false,
      isMelee: elemCfg.isMelee || false,
      skillId: skillDef.id,
      skillName: skillDef.name,
      dmgMul: skillDef.dmgMul || 1.6,
      atkInterval: skillDef.cd > 0 ? skillDef.cd : 2000,
      attackRange: elemCfg.baseRange || 240,
      maxHp,
      dmg: baseDmg,
      def: baseDef,
      manaMax: realmData.manaMax,
      spiritualSense: realmData.spiritualSense,
      tint: elemCfg.tint,
      titlePrefix,
      titleColor: elemCfg.color
    };
  },

  // =========================================================================
  // 1. WILD ROAMING FELLOW NPCS (NPC TÁN TU NGOÀI MAP)
  // =========================================================================
  initFellowNpcs() {
    if (this.fellowNpcs) {
      this.fellowNpcs.forEach(npc => {
        if (npc.sprite) npc.sprite.destroy();
        if (npc.shadow) npc.shadow.destroy();
        if (npc.nameTag) npc.nameTag.destroy();
        if (npc.hpBg) npc.hpBg.destroy();
        if (npc.hpBar) npc.hpBar.destroy();
        if (npc.flyingSword) npc.flyingSword.destroy();
      });
    }
    this.fellowNpcs = [];

    // Khởi tạo luôn Party Followers nếu đang có tổ đội
    this.initPartyFollowers();

    const curMapId = gameState.currentMapId ?? 0;
    const map = (this.currentMap && this.currentMap.id === curMapId) ? this.currentMap : (this.getMapById ? this.getMapById(curMapId) : null);
    
    // Trong thôn (khu an toàn map 0) không sinh NPC hoang dã
    if (!map || map.isPeaceZone || curMapId === 0) {
      return;
    }

    const totalW = this.worldW || 32000;
    const spawnXCoords = [];

    // Spawn đều đặn dọc map, bắt đầu từ gần vị trí vào cổng (x = 550)
    for (let x = 550; x < totalW - 600; x += Phaser.Math.Between(750, 1150)) {
      spawnXCoords.push(x);
    }

    spawnXCoords.forEach((x, idx) => {
      const y = Phaser.Math.Between(this.field.top + 40, this.field.bottom - 40);
      const cfg = this.getNpcSpawnConfig(curMapId, x, idx % NPC_ELEMENTS.length);
      let modelType;
      if (cfg.isFlying) {
        const flyId = (idx % 20) + 1;
        modelType = `npc_fly_${flyId}`;
      } else {
        modelType = (idx % 2 === 0) ? 'dai_han' : 'tho_san';
      }
      this.spawnOneFellowNpc(x, y, modelType, idx % NPC_ELEMENTS.length);
    });
  },

  spawnOneFellowNpc(homeX, homeY, modelType = null, elementIdx = -1) {
    const curMapId = gameState.currentMapId ?? 0;
    const name = this.getRandomSinoVietName();
    const cfg = this.getNpcSpawnConfig(curMapId, homeX, elementIdx);
    
    if (!modelType || (cfg.isFlying && !modelType.startsWith('npc_fly_'))) {
      if (cfg.isFlying) {
        const flyId = Phaser.Math.Between(1, 20);
        modelType = `npc_fly_${flyId}`;
      } else {
        modelType = (Math.random() < 0.5) ? 'dai_han' : 'tho_san';
      }
    }

    const initialAnim = cfg.isFlying ? `${modelType}_fly` : `${modelType}_idle`;
    const initialTexture = cfg.isFlying ? `${modelType}_fly_1` : `${modelType}_idle_1`;

    const sprite = this.physics.add.sprite(homeX, homeY, initialTexture)
      .setScale(0.72)
      .setTint(cfg.tint)
      .setDepth(Math.floor(homeY) + (cfg.isFlying ? 10 : 0));
    sprite.setCollideWorldBounds(true);
    sprite.body.setSize(44, 70).setOffset(42, 40);
    if (this.anims.exists(initialAnim)) sprite.play(initialAnim);

    const shadow = this.add.ellipse(homeX, homeY + (cfg.isFlying ? 22 : 30), cfg.isFlying ? 30 : 36, cfg.isFlying ? 10 : 12, 0x000000, cfg.isFlying ? 0.35 : 0.4).setDepth(Math.floor(homeY) - 1);
    
    // Phi Kiếm ngự dưới chân NPC nếu là cảnh giới Trúc Cơ trở lên
    let flyingSword = null;
    if (cfg.isFlying && this.textures.exists('flying_sword')) {
      flyingSword = this.add.image(homeX, homeY + 4, 'flying_sword')
        .setScale(0.60)
        .setDepth(Math.floor(homeY) + 9)
        .setTint(cfg.tint);
    }

    const nameTag = this.add.text(homeX, homeY - 48, `${cfg.titlePrefix} ${name}`, {
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontSize: '8.5px',
      fontStyle: 'bold',
      color: cfg.titleColor || '#7dd3fc',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(Math.floor(homeY) + 3);

    const barW = 34;
    const hpBg = this.add.rectangle(homeX, homeY - 37, barW, 3, 0x111111, 0.8).setDepth(Math.floor(homeY) + 1);
    const hpBar = this.add.rectangle(homeX - barW / 2, homeY - 37, barW, 3, 0x34d399)
      .setOrigin(0, 0.5).setDepth(Math.floor(homeY) + 2);

    const playerX = this.player ? this.player.x : 350;
    const isNear = Math.abs(homeX - playerX) <= 950;
    sprite.setVisible(isNear);
    if (sprite.body) sprite.body.enable = isNear;
    shadow.setVisible(isNear);
    nameTag.setVisible(isNear);
    hpBg.setVisible(isNear);
    hpBar.setVisible(isNear);

    const npcData = {
      sprite,
      shadow,
      nameTag,
      hpBg,
      hpBar,
      barW,
      name,
      modelType,
      elementIdx,
      homeX,
      homeY,
      // Realm & Elemental configuration
      isVanMoc: cfg.isVanMoc,
      zone: cfg.zone,
      realmTier: cfg.realmTier,
      realmName: cfg.realmName,
      stageLabel: cfg.stageLabel,
      masteryName: cfg.masteryName,
      masteryBonus: cfg.masteryBonus,
      vfxMul: cfg.vfxMul,
      masteryColor: cfg.masteryColor,
      elem: cfg.elem,
      elemTitle: cfg.elemTitle,
      elemColor: cfg.elemColor,
      eKey: cfg.eKey,
      isSword: cfg.isSword,
      isMelee: cfg.isMelee,
      skillId: cfg.skillId,
      skillName: cfg.skillName,
      dmgMul: cfg.dmgMul,
      titlePrefix: cfg.titlePrefix,
      tint: cfg.tint,
      hp: cfg.maxHp,
      maxHp: cfg.maxHp,
      dmg: cfg.dmg,
      def: cfg.def,
      speed: Phaser.Math.Between(120, 145),
      searchRange: 520,
      attackRange: cfg.attackRange || 240,
      atkInterval: cfg.atkInterval || 2000,
      lastAttack: 0,
      attackUntil: 0,
      targetEnemy: null,
      isDead: false,
      respawnTime: 0,
      isFlying: cfg.isFlying,
      flyingSword
    };

    this.fellowNpcs.push(npcData);
    return npcData;
  },

  // =========================================================================
  // 2. PARTY FOLLOWER NPCS (4 HIỆP KHÁCH TỔ ĐỘI THEO SAU PLAYER)
  // =========================================================================
  destroyPartyFollowers() {
    if (this.partyFollowers) {
      this.partyFollowers.forEach(f => {
        if (f.sprite) f.sprite.destroy();
        if (f.shadow) f.shadow.destroy();
        if (f.nameTag) f.nameTag.destroy();
        if (f.hpBg) f.hpBg.destroy();
        if (f.hpBar) f.hpBar.destroy();
      });
    }
    this.partyFollowers = [];
  },

  initPartyFollowers() {
    this.destroyPartyFollowers();
    if (!gameState || !gameState.party || !gameState.party.isFormed) return;

    const curMapId = gameState.currentMapId ?? 0;
    const map = (this.currentMap && this.currentMap.id === curMapId) ? this.currentMap : (this.getMapById ? this.getMapById(curMapId) : null);
    
    // Trong thôn (khu an toàn map 0) không xuất hiện, ra ngoài thôn sẽ tự động bám theo bảo vệ Player
    if (!map || map.isPeaceZone || curMapId === 0) return;

    const px = this.player ? this.player.x : 350;
    const py = this.player ? this.player.y : 600;

    this.partyFollowers = PARTY_MEMBERS_DEF.map((def, idx) => {
      const sx = px + def.offsetX;
      const sy = py + def.offsetY;

      const sprite = this.physics.add.sprite(sx, sy, `${def.modelType}_idle_1`)
        .setScale(0.72)
        .setTint(def.tint)
        .setDepth(Math.floor(sy));
      sprite.setCollideWorldBounds(true);
      sprite.body.setSize(44, 70).setOffset(42, 40);

      const animKey = `${def.modelType}_idle`;
      if (this.anims.exists(animKey)) sprite.play(animKey);

      const shadow = this.add.ellipse(sx, sy + 30, 36, 12, 0x000000, 0.45).setDepth(Math.floor(sy) - 1);

      const nameTag = this.add.text(sx, sy - 48, `[Tổ Đội] ${def.title} · ${def.name}`, {
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontSize: '8.5px',
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2.2
      }).setOrigin(0.5).setDepth(Math.floor(sy) + 3);

      const barW = 34;
      const hpBg = this.add.rectangle(sx, sy - 37, barW, 3, 0x111111, 0.85).setDepth(Math.floor(sy) + 1);
      const hpBar = this.add.rectangle(sx - barW / 2, sy - 37, barW, 3, 0x34d399)
        .setOrigin(0, 0.5).setDepth(Math.floor(sy) + 2);

      const pRealmIdx = Math.max(0, Math.min(REALMS.length - 1, gameState.realmIdx ?? 0));
      const pRealm = REALMS[pRealmIdx] || REALMS[0];
      const followerHp = Math.max(100, Math.floor(pRealm.hp * 0.9));
      const followerDmg = Math.max(5, Math.floor(pRealm.dmg * 0.85));
      const followerDef = Math.floor((pRealm.def || 0) * 0.85);

      return {
        sprite,
        shadow,
        nameTag,
        hpBg,
        hpBar,
        barW,
        name: def.name,
        modelType: def.modelType,
        tint: def.tint,
        title: def.title,
        offsetX: def.offsetX,
        offsetY: def.offsetY,
        hp: followerHp,
        maxHp: followerHp,
        dmg: followerDmg,
        def: followerDef,
        speed: 155,
        attackRange: 75,
        atkInterval: Phaser.Math.Between(550, 800),
        lastAttack: 0,
        attackUntil: 0,
        targetEnemy: null,
        isDead: false,
        respawnTime: 0
      };
    });
  },

  updatePartyFollowers(time, delta) {
    if (!this.partyFollowers || this.partyFollowers.length === 0 || !this.player || !this.player.active) return;

    const px = this.player.x;
    const py = this.player.y;

    for (let i = 0; i < this.partyFollowers.length; i++) {
      const f = this.partyFollowers[i];
      if (!f || !f.sprite) continue;

      const sx = f.sprite.x;
      const sy = f.sprite.y;
      const pScale = 0.72 * this.perspective(sy);

      f.sprite.setScale(pScale).setDepth(Math.floor(sy));
      f.shadow.setPosition(sx, sy + 30 * pScale).setScale(pScale).setDepth(Math.floor(sy) - 1);
      f.nameTag.setPosition(sx, sy - 48).setDepth(Math.floor(sy) + 3);
      f.hpBg.setPosition(sx, sy - 37).setDepth(Math.floor(sy) + 1);
      f.hpBar.setPosition(sx - f.barW / 2, sy - 37).setDepth(Math.floor(sy) + 2);

      // Xử lý hồi sinh
      if (f.isDead) {
        if (time >= f.respawnTime) {
          f.isDead = false;
          f.hp = f.maxHp;
          if (f.hpBar) {
            f.hpBar.width = f.barW;
            f.hpBar.setVisible(true);
          }
          if (f.hpBg) f.hpBg.setVisible(true);
          f.sprite.setPosition(px + f.offsetX, py + f.offsetY)
            .setVelocity(0, 0)
            .clearTint()
            .setTint(f.tint)
            .setAlpha(1);
          f.sprite.play(`${f.modelType}_idle`, true);
          this.spawnVfx(f.sprite.x, f.sprite.y, 0, 0.6, { tint: f.tint, duration: 250 });
          this.showFloatingText(f.sprite.x, f.sprite.y - 45, `[Tổ Đội · ${f.name}] Trợ Chiến!`, '#ffd700', '10px');
        }
        continue;
      }

      // 1. Quét tìm quái xung quanh Player (bán kính 380px)
      let target = f.targetEnemy;
      if (!target || !target.active || target.isDead || Phaser.Math.Distance.Between(px, py, target.x, target.y) > 420) {
        target = this.findNearestEnemyForNpc(px, py, 380);
        f.targetEnemy = target;
      }

      // Tính lực tách giãn khoảng cách (Separation Repulsion) để các Hiệp Khách KHÔNG CHỒNG LÊN NHAU
      let pushVx = 0, pushVy = 0;
      for (let j = 0; j < this.partyFollowers.length; j++) {
        if (i === j) continue;
        const other = this.partyFollowers[j];
        if (!other || !other.sprite || other.isDead) continue;
        const d = Phaser.Math.Distance.Between(sx, sy, other.sprite.x, other.sprite.y);
        if (d > 0 && d < 44) {
          const pFactor = (44 - d) / 44;
          pushVx += ((sx - other.sprite.x) / d) * 75 * pFactor;
          pushVy += ((sy - other.sprite.y) / d) * 75 * pFactor;
        }
      }
      const distToP = Phaser.Math.Distance.Between(sx, sy, px, py);
      if (distToP > 0 && distToP < 34) {
        pushVx += ((sx - px) / distToP) * 55;
        pushVy += ((sy - py) / distToP) * 55;
      }

      // 2. Hành vi: Hỗ trợ đánh quái hoặc bám theo Player
      if (target && target.active && !target.isDead) {
        // Tọa độ tiếp cận quái theo 4 hướng khác nhau để 4 Hiệp Khách vây quanh quái, không tụ thành 1 điểm
        const attackOffsets = [
          { x: -45, y: -20 },
          { x: 45, y: -20 },
          { x: -45, y: 20 },
          { x: 45, y: 20 }
        ];
        const off = attackOffsets[i % attackOffsets.length];
        const targetApproachX = target.x + off.x;
        const targetApproachY = target.y + off.y;
        const distToEnemy = Phaser.Math.Distance.Between(sx, sy, target.x, target.y);

        if (distToEnemy > f.attackRange) {
          if (time >= f.attackUntil) {
            const angle = Phaser.Math.Angle.Between(sx, sy, targetApproachX, targetApproachY);
            const vx = Math.cos(angle) * f.speed + pushVx;
            const vy = Math.sin(angle) * f.speed + pushVy;
            f.sprite.setVelocity(vx, vy);
            f.sprite.setFlipX(vx < 0);
            f.sprite.play(`${f.modelType}_run`, true);
          }
        } else {
          // Vào tầm đánh quái
          f.sprite.setVelocity(pushVx * 0.5, pushVy * 0.5);
          f.sprite.setFlipX(target.x < sx);

          if (time >= f.lastAttack + f.atkInterval && time >= f.attackUntil) {
            f.lastAttack = time;
            f.attackUntil = time + 360;
            f.sprite.play(`${f.modelType}_attack`, true);

            this.time.delayedCall(160, () => {
              if (target && target.active && !target.isDead && f && !f.isDead) {
                const isCrit = Math.random() < 0.2;
                let dmg = f.dmg || 3;
                if (isCrit) dmg = Math.floor(dmg * 1.85);
                this.damageEnemy(target, dmg, isCrit, {
                  type: 'party_npc',
                  name: f.name,
                  title: f.title || 'Hiệp Khách',
                  ref: f
                });
                this.spawnVfx(target.x, target.y, 0, 0.45, { tint: f.tint, duration: 180 });

                if (target.isDead || target.hp <= 0) {
                  f.targetEnemy = null;
                }
              }
            });
          }
        }
      } else {
        // Không có quái -> Bám theo vị trí đội hình quanh Player
        const formX = px + f.offsetX;
        const formY = py + f.offsetY;
        const distToForm = Phaser.Math.Distance.Between(sx, sy, formX, formY);

        if (distToForm > 28 || Math.abs(pushVx) > 5 || Math.abs(pushVy) > 5) {
          if (time >= f.attackUntil) {
            const angle = Phaser.Math.Angle.Between(sx, sy, formX, formY);
            const moveSpeed = distToForm > 180 ? f.speed * 1.35 : f.speed;
            const vx = Math.cos(angle) * moveSpeed + pushVx;
            const vy = Math.sin(angle) * moveSpeed + pushVy;
            f.sprite.setVelocity(vx, vy);
            f.sprite.setFlipX(vx < 0);
            f.sprite.play(`${f.modelType}_run`, true);
          }
        } else {
          f.sprite.setVelocity(0, 0);
          if (time >= f.attackUntil) {
            f.sprite.play(`${f.modelType}_idle`, true);
            // Hồi HP khi đứng yên (1.5% maxHp/s)
            if (f.hp < f.maxHp) {
              f.hp = Math.min(f.maxHp, f.hp + Math.max(1, Math.floor(f.maxHp * 0.015)));
              const ratio = Math.max(0, f.hp / f.maxHp);
              if (f.hpBar) f.hpBar.width = ratio * f.barW;
            }
          }
        }
      }
    }
  },

  takePartyFollowerDamage(follower, rawDmg = 15) {
    if (!follower || follower.isDead) return;
    const dmg = Math.max(1, Math.floor(rawDmg));
    follower.hp = Math.max(0, follower.hp - dmg);

    const ratio = Math.max(0, follower.hp / follower.maxHp);
    if (follower.hpBar) follower.hpBar.width = ratio * follower.barW;

    this.showFloatingText(follower.sprite.x, follower.sprite.y - 30, `-${dmg}`, '#ff8888', '10px');

    if (follower.hp <= 0) {
      follower.isDead = true;
      follower.targetEnemy = null;
      follower.respawnTime = this.time.now + 7000;
      follower.sprite.setVelocity(0, 0).setAlpha(0.3);
      if (follower.hpBar) follower.hpBar.setVisible(false);
      if (follower.hpBg) follower.hpBg.setVisible(false);
      this.showFloatingText(follower.sprite.x, follower.sprite.y - 45, `[Tổ Đội · ${follower.name}] Tạm Lui!`, '#fca5a5', '10px');
    }
  },

  // =========================================================================
  // 3. MAIN UPDATE LOOP CHO TOÀN BỘ FELLOW & PARTY NPCS
  // =========================================================================
  updateFellowNpcs(time, delta) {
    // Cập nhật Party Followers (nếu có)
    this.updatePartyFollowers(time, delta);

    // Cập nhật Wild Fellow NPCs
    if (!this.fellowNpcs || this.fellowNpcs.length === 0 || !this.player || !this.player.active) return;

    const CULL_RANGE_X = 950;
    const playerX = this.player.x;

    for (let i = 0; i < this.fellowNpcs.length; i++) {
      const npc = this.fellowNpcs[i];
      if (!npc || !npc.sprite) continue;

      const distToPlayerX = Math.abs(npc.sprite.x - playerX);

      // 1. Proximity Culling: Ẩn và dừng xử lý khi ở xa (>950px)
      if (distToPlayerX > CULL_RANGE_X) {
        if (npc.sprite.visible) {
          npc.sprite.setVisible(false);
          if (npc.sprite.body) {
            npc.sprite.body.enable = false;
            npc.sprite.setVelocity(0, 0);
          }
          npc.shadow.setVisible(false);
          npc.nameTag.setVisible(false);
          npc.hpBg.setVisible(false);
          npc.hpBar.setVisible(false);
          if (npc.flyingSword) npc.flyingSword.setVisible(false);
        }
        continue;
      }

      // Khi lại gần, bật hiển thị lại
      if (!npc.sprite.visible && !npc.isDead) {
        npc.sprite.setVisible(true);
        if (npc.sprite.body) npc.sprite.body.enable = true;
        npc.shadow.setVisible(true);
        npc.nameTag.setVisible(true);
        npc.hpBg.setVisible(true);
        npc.hpBar.setVisible(true);
        if (npc.flyingSword) npc.flyingSword.setVisible(true);
      }

      // Cập nhật vị trí UI & Phi Kiếm đi theo sprite
      const sx = npc.sprite.x;
      const sy = npc.sprite.y;
      const pScale = 0.72 * this.perspective(sy);
      
      if (npc.isFlying) {
        // 1. Bay lượn bồng bềnh trên không trung
        const hoverOffset = Math.sin(time * 0.0035 + (npc.homeX || 0)) * 6;
        // Origin 0.78 đưa thân ảnh NPC bay cao hẳn lên trời so với bóng mặt đất
        npc.sprite.setOrigin(0.5, 0.78);
        npc.sprite.setScale(pScale).setDepth(Math.floor(sy) + 10);
        
        // Nghiêng nhẹ phi hành theo hướng di chuyển (Bank Tilt)
        const vx = npc.sprite.body ? npc.sprite.body.velocity.x : 0;
        const targetTilt = Phaser.Math.Clamp(vx * 0.0007, -0.15, 0.15);
        npc.sprite.rotation = Phaser.Math.Linear(npc.sprite.rotation || 0, targetTilt, 0.12);
        
        // Bóng đổ nằm trên mặt đất, kích thước thu nhỏ & mờ nhẹ
        const shadowScale = pScale * (0.75 + 0.03 * Math.sin(time * 0.0035));
        npc.shadow.setPosition(sx, sy + 22 * pScale)
          .setScale(shadowScale, shadowScale * 0.45)
          .setAlpha(0.32)
          .setDepth(Math.floor(sy) - 1);

        // Phi Kiếm ngự ngay dưới bàn chân đang lơ lửng
        if (npc.flyingSword) {
          const swordY = sy - 18 * pScale + hoverOffset;
          npc.flyingSword.setPosition(sx, swordY)
            .setScale(0.60 * pScale)
            .setRotation(npc.sprite.rotation)
            .setFlipX(npc.sprite.flipX)
            .setDepth(Math.floor(sy) + 9)
            .setVisible(true);
        }

        // Tên & Thanh máu ở phía trên đầu nhân vật bay
        const uiY = sy - 84 * pScale + hoverOffset;
        npc.nameTag.setPosition(sx, uiY - 14).setDepth(Math.floor(sy) + 15);
        npc.hpBg.setPosition(sx, uiY).setDepth(Math.floor(sy) + 12);
        npc.hpBar.setPosition(sx - npc.barW / 2, uiY).setDepth(Math.floor(sy) + 13);
      } else {
        npc.sprite.setOrigin(0.5, 0.5);
        npc.sprite.rotation = 0;
        npc.sprite.setScale(pScale).setDepth(Math.floor(sy));
        npc.shadow.setPosition(sx, sy + 30 * pScale).setScale(pScale, pScale * 0.33).setAlpha(0.4).setDepth(Math.floor(sy) - 1);
        npc.nameTag.setPosition(sx, sy - 48).setDepth(Math.floor(sy) + 3);
        npc.hpBg.setPosition(sx, sy - 37).setDepth(Math.floor(sy) + 1);
        npc.hpBar.setPosition(sx - npc.barW / 2, sy - 37).setDepth(Math.floor(sy) + 2);
        if (npc.flyingSword) npc.flyingSword.setVisible(false);
      }

      // 2. Xử lý Hồi Sinh khi Chết
      if (npc.isDead) {
        if (time >= npc.respawnTime) {
          this.respawnFellowNpc(npc);
        }
        continue;
      }

      // 3. AI Tự Động Quét Tìm Quái Vật
      let target = npc.targetEnemy;
      if (!target || !target.active || target.isDead || Math.abs(target.x - sx) > npc.searchRange) {
        target = this.findNearestEnemyForNpc(sx, sy, npc.searchRange);
        npc.targetEnemy = target;
      }

      // Tính lực tách giãn (Separation) giữa các Tán Tu để không đứng đè lên nhau
      let wildPushVx = 0, wildPushVy = 0;
      for (let j = 0; j < this.fellowNpcs.length; j++) {
        if (i === j) continue;
        const otherNpc = this.fellowNpcs[j];
        if (!otherNpc || !otherNpc.sprite || otherNpc.isDead || !otherNpc.sprite.visible) continue;
        const d = Phaser.Math.Distance.Between(sx, sy, otherNpc.sprite.x, otherNpc.sprite.y);
        if (d > 0 && d < 48) {
          const factor = (48 - d) / 48;
          wildPushVx += ((sx - otherNpc.sprite.x) / d) * 70 * factor;
          wildPushVy += ((sy - otherNpc.sprite.y) / d) * 70 * factor;
        }
      }

      // 4. Di chuyển & Tấn công Mục tiêu
      if (target && target.active && !target.isDead) {
        const dist = Phaser.Math.Distance.Between(sx, sy, target.x, target.y);

        if (dist > npc.attackRange) {
          if (time >= npc.attackUntil) {
            const angle = Phaser.Math.Angle.Between(sx, sy, target.x, target.y);
            const vx = Math.cos(angle) * npc.speed + wildPushVx;
            const vy = Math.sin(angle) * npc.speed + wildPushVy;
            npc.sprite.setVelocity(vx, vy);
            npc.sprite.setFlipX(vx < 0);
            const moveAnim = npc.isFlying ? `${npc.modelType}_fly` : `${npc.modelType}_run`;
            npc.sprite.play(moveAnim, true);
          }
        } else {
          npc.sprite.setVelocity(wildPushVx * 0.4, wildPushVy * 0.4);
          npc.sprite.setFlipX(target.x < sx);

          if (time >= npc.lastAttack + npc.atkInterval && time >= npc.attackUntil) {
            npc.lastAttack = time;
            this.castFellowNpcElementalSkill(npc, target);
          }
        }
      } else {
        npc.sprite.setVelocity(wildPushVx * 0.5, wildPushVy * 0.5);
        if (time >= npc.attackUntil) {
          const idleAnim = npc.isFlying ? `${npc.modelType}_fly` : `${npc.modelType}_idle`;
          npc.sprite.play(idleAnim, true);
          // Hồi HP tự động khi không chiến đấu (2% maxHp/s ≈ mỗi frame 60fps ~= 0.033% mọi 16ms)
          if (npc.hp < npc.maxHp) {
            npc.hp = Math.min(npc.maxHp, npc.hp + Math.max(1, Math.floor(npc.maxHp * 0.02)));
            const ratio = Math.max(0, npc.hp / npc.maxHp);
            if (npc.hpBar) npc.hpBar.width = ratio * npc.barW;
          }
        }
      }
    }
  },

  // =========================================================================
  // 4. THI TRIỂN PHÁP THUẬT / KỸ NĂNG 9 HỆ (TIER 1 - 5) CHO NPC
  // =========================================================================
  // 4. THI TRIỂN PHÁP THUẬT / KỸ NĂNG COMBO (1 - 5 CHIÊU LIÊN HOÀN THEO CẢNH GIỚI)
  // =========================================================================
  castFellowNpcElementalSkill(npc, target) {
    if (!npc || npc.isDead || !target || !target.active || target.isDead) return;

    npc.sprite.setFlipX(target.x < npc.sprite.x);
    npc.sprite.play(`${npc.modelType}_attack`, true);

    const tierLevel = Math.max(1, Math.min(5, npc.tierLevel || 1));
    const vfxMul = npc.vfxMul || 1.0;
    const masteryColor = npc.masteryColor || npc.elemColor || '#7dd3fc';

    // Thời gian duy trì thế công kích theo số lượng combo (1 -> 5 chiêu)
    const comboDurations = [0, 420, 680, 950, 1250, 1600];
    npc.attackUntil = this.time.now + (comboDurations[tierLevel] || 500);

    // Tên chuỗi combo theo cảnh giới
    const comboTitles = [
      '',
      `[${npc.elem} • Sơ Khởi]`,
      `[Trúc Cơ • Song Trảm Combo]`,
      `[Kim Đan • Tam Liên Combo]`,
      `[Nguyên Anh • Tứ Tuyệt Combo]`,
      `[Hóa Thần • Ngũ Thần Đại Combo]`
    ];

    this.showFloatingText(
      npc.sprite.x,
      npc.sprite.y - 52,
      `${comboTitles[tierLevel]} ${npc.skillName}!`,
      masteryColor,
      '10px'
    );

    const baseCalculatedDmg = Math.max(1, Math.floor(npc.dmg * (npc.dmgMul || 1.6) * (1 + (npc.masteryBonus || 0))));

    // 1. THỂ TU: Combo cận chiến 1 -> 5 quyền cước liên hoàn
    if (npc.isMelee) {
      this.executeNpcMeleeCombo(npc, target, tierLevel, baseCalculatedDmg, vfxMul);
      return;
    }

    // 2. PHÁP TU / KIẾM TU: Chuỗi Combo Pháp Thuật 1 -> 5 Chiêu
    // Tier 1: 1 Chiêu (Đạn Đạo Sơ Giai)
    if (tierLevel === 1) {
      this.executeNpcSkillTier1(npc, target, baseCalculatedDmg, vfxMul);
    }
    // Tier 2 (Trúc Cơ): Combo 2 Chiêu (Tier 1 -> Tier 2)
    else if (tierLevel === 2) {
      this.executeNpcSkillTier1(npc, target, Math.floor(baseCalculatedDmg * 0.60), vfxMul);
      this.time.delayedCall(200, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier2(npc, target, Math.floor(baseCalculatedDmg * 0.85), vfxMul);
      });
    }
    // Tier 3 (Kim Đan): Combo 3 Chiêu (Tier 1 -> Tier 2 -> Tier 3 Trận Pháp)
    else if (tierLevel === 3) {
      this.executeNpcSkillTier1(npc, target, Math.floor(baseCalculatedDmg * 0.45), vfxMul);
      this.time.delayedCall(180, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier2(npc, target, Math.floor(baseCalculatedDmg * 0.65), vfxMul);
      });
      this.time.delayedCall(380, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier3(npc, target, Math.floor(baseCalculatedDmg * 0.95), vfxMul);
      });
    }
    // Tier 4 (Nguyên Anh): Combo 4 Chiêu (Tier 1 -> Tier 2 -> Tier 3 -> Tier 4 Vạn Kiếm / Hỗn Độn Đạn Mạc)
    else if (tierLevel === 4) {
      this.executeNpcSkillTier1(npc, target, Math.floor(baseCalculatedDmg * 0.40), vfxMul);
      this.time.delayedCall(160, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier2(npc, target, Math.floor(baseCalculatedDmg * 0.55), vfxMul);
      });
      this.time.delayedCall(340, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier3(npc, target, Math.floor(baseCalculatedDmg * 0.75), vfxMul);
      });
      this.time.delayedCall(560, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier4(npc, target, Math.floor(baseCalculatedDmg * 1.15), vfxMul);
      });
    }
    // Tier 5 (Hóa Thần & Phi Thăng): Combo 5 Chiêu Toàn Khai (Tier 1 -> Tier 2 -> Tier 3 -> Tier 4 -> Tier 5 Diệt Thế Thần Kiếm)
    else if (tierLevel >= 5) {
      this.executeNpcSkillTier1(npc, target, Math.floor(baseCalculatedDmg * 0.35), vfxMul);
      this.time.delayedCall(150, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier2(npc, target, Math.floor(baseCalculatedDmg * 0.45), vfxMul);
      });
      this.time.delayedCall(320, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier3(npc, target, Math.floor(baseCalculatedDmg * 0.65), vfxMul);
      });
      this.time.delayedCall(520, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier4(npc, target, Math.floor(baseCalculatedDmg * 0.90), vfxMul);
      });
      this.time.delayedCall(760, () => {
        if (!npc || npc.isDead) return;
        this.executeNpcSkillTier5(npc, target, Math.floor(baseCalculatedDmg * 1.65), vfxMul);
      });
    }
  },

  // Combo Cận Chiến (Thể Tu)
  executeNpcMeleeCombo(npc, target, comboCount = 1, baseCalculatedDmg = 100, vfxMul = 1.0) {
    const eKey = npc.eKey || 'ly';
    const hitInterval = 140;

    for (let hit = 1; hit <= comboCount; hit++) {
      this.time.delayedCall(hit * hitInterval, () => {
        if (!npc || npc.isDead) return;
        const curTarget = (target && target.active && !target.isDead) ? target : this.findNearestEnemyForNpc(npc.sprite.x, npc.sprite.y, 160);
        if (!curTarget) return;

        const isLastHit = (hit === comboCount);
        const isCrit = Math.random() < (0.20 + hit * 0.04);
        const dmgRatio = 0.5 + (hit / comboCount) * 0.8;
        let finalDmg = Math.max(1, Math.floor(baseCalculatedDmg * dmgRatio));
        if (isCrit) finalDmg = Math.floor(finalDmg * 1.85);

        this.damageEnemy(curTarget, finalDmg, isCrit, {
          type: 'wild_npc',
          name: npc.name,
          title: npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`,
          ref: npc
        });

        const impactKey = this.textures.exists(`vfx_${eKey}_impact`)
          ? `vfx_${eKey}_impact`
          : (this.textures.exists(`vfx_${eKey}_1_7`) ? `vfx_${eKey}_1_7` : 'vfx_impact_frame7');

        if (this.textures.exists(impactKey)) {
          const imp = this.add.sprite(curTarget.x, curTarget.y - 15, impactKey)
            .setDepth(Math.floor(curTarget.y) + 55)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale((0.75 + hit * 0.15) * vfxMul);
          this.tweens.add({
            targets: imp,
            scaleX: (1.2 + hit * 0.2) * vfxMul,
            scaleY: (1.2 + hit * 0.2) * vfxMul,
            alpha: 0,
            duration: 200,
            onComplete: () => imp.destroy()
          });
        }
        this.spawnVfx(curTarget.x, curTarget.y - 15, 0, (0.5 + hit * 0.12) * vfxMul, { tint: 0xf43f5e, duration: 180 });

        if (isLastHit && comboCount >= 4 && this.cameras?.main) {
          const distToP = Phaser.Math.Distance.Between(curTarget.x, curTarget.y, this.player?.x || 0, this.player?.y || 0);
          if (distToP <= 450) this.cameras.main.shake(180, 0.008);
        }
      });
    }
  },

  // Chiêu 1: Đạn Đạo Phóng Thẳng Sơ Cấp
  executeNpcSkillTier1(npc, target, calculatedDmg = 100, vfxMul = 1.0) {
    if (!npc || npc.isDead) return;
    const curTarget = (target && target.active && !target.isDead) ? target : this.findNearestEnemyForNpc(npc.sprite.x, npc.sprite.y, 450);
    const tx = curTarget ? curTarget.x : npc.sprite.x + (npc.sprite.flipX ? -200 : 200);
    const ty = curTarget ? curTarget.y : npc.sprite.y;
    const eKey = npc.eKey || 'kim';

    const projKey = this.textures.exists(`vfx_${eKey}_1_0`)
      ? `vfx_${eKey}_1_0`
      : (this.textures.exists(`vfx_${eKey}_1`)
        ? `vfx_${eKey}_1`
        : (npc.isSword ? 'vfx_kim_1_0' : 'vfx_hoa_1'));

    const startX = npc.sprite.x;
    const startY = npc.sprite.y - 15;

    const proj = this.add.sprite(startX, startY, projKey)
      .setDepth(Math.floor(npc.sprite.y) + 50)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.65 * vfxMul);

    if (this.anims.exists(`anim_vfx_${eKey}_1`)) {
      proj.play(`anim_vfx_${eKey}_1`);
    }

    const angle = Phaser.Math.Angle.Between(startX, startY, tx, ty - 15);
    proj.setRotation(angle);

    const dist = Phaser.Math.Distance.Between(startX, startY, tx, ty - 15);
    const dur = Math.max(80, Math.round((dist / 380) * 1000));

    this.tweens.add({
      targets: proj,
      x: tx,
      y: ty - 15,
      duration: dur,
      ease: 'Linear',
      onComplete: () => {
        proj.destroy();

        const impactKey = this.textures.exists(`vfx_${eKey}_1_7`)
          ? `vfx_${eKey}_1_7`
          : (this.textures.exists(`vfx_${eKey}_impact`)
            ? `vfx_${eKey}_impact`
            : 'vfx_impact_frame7');

        if (this.textures.exists(impactKey)) {
          const imp = this.add.sprite(tx, ty - 15, impactKey)
            .setDepth(Math.floor(ty) + 55)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(0.85 * vfxMul);
          this.tweens.add({
            targets: imp,
            scaleX: 1.3 * vfxMul,
            scaleY: 1.3 * vfxMul,
            alpha: 0,
            duration: 200,
            onComplete: () => imp.destroy()
          });
        }

        if (curTarget && curTarget.active && !curTarget.isDead) {
          const isCrit = Math.random() < 0.18;
          let finalDmg = isCrit ? Math.floor(calculatedDmg * 1.85) : calculatedDmg;

          this.damageEnemy(curTarget, finalDmg, isCrit, {
            type: 'wild_npc',
            name: npc.name,
            title: npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`,
            ref: npc
          });

          const tintColor = Phaser.Display.Color.HexStringToColor(npc.elemColor || '#ffd700').color;
          this.spawnVfx(tx, ty - 15, 0, 0.5 * vfxMul, { tint: tintColor, duration: 180 });
        }
      }
    });
  },

  // Chiêu 2: Khí Kình / Phi Đao Trúc Cơ Cao Tốc
  executeNpcSkillTier2(npc, target, calculatedDmg = 120, vfxMul = 1.0) {
    if (!npc || npc.isDead) return;
    const curTarget = (target && target.active && !target.isDead) ? target : this.findNearestEnemyForNpc(npc.sprite.x, npc.sprite.y, 450);
    const tx = curTarget ? curTarget.x : npc.sprite.x + (npc.sprite.flipX ? -220 : 220);
    const ty = curTarget ? curTarget.y : npc.sprite.y;
    const eKey = npc.eKey || 'kim';

    const projKey = this.textures.exists(`vfx_${eKey}_2`)
      ? `vfx_${eKey}_2`
      : (this.textures.exists(`vfx_${eKey}_1_0`) ? `vfx_${eKey}_1_0` : 'vfx_kim_1_0');

    const startX = npc.sprite.x;
    const startY = npc.sprite.y - 18;

    const proj = this.add.sprite(startX, startY, projKey)
      .setDepth(Math.floor(npc.sprite.y) + 52)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.85 * vfxMul);

    const angle = Phaser.Math.Angle.Between(startX, startY, tx, ty - 15);
    proj.setRotation(angle);

    const dist = Phaser.Math.Distance.Between(startX, startY, tx, ty - 15);
    const dur = Math.max(70, Math.round((dist / 460) * 1000));

    this.tweens.add({
      targets: proj,
      x: tx,
      y: ty - 15,
      duration: dur,
      ease: 'Quad.easeIn',
      onComplete: () => {
        proj.destroy();

        if (curTarget && curTarget.active && !curTarget.isDead) {
          const isCrit = Math.random() < 0.22;
          let finalDmg = isCrit ? Math.floor(calculatedDmg * 1.85) : calculatedDmg;

          this.damageEnemy(curTarget, finalDmg, isCrit, {
            type: 'wild_npc',
            name: npc.name,
            title: npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`,
            ref: npc
          });

          const tintColor = Phaser.Display.Color.HexStringToColor(npc.elemColor || '#ffd700').color;
          this.spawnVfx(tx, ty - 15, 0, 0.7 * vfxMul, { tint: tintColor, duration: 200 });
        }
      }
    });
  },

  // Chiêu 3: Đại Trận Pháp Nguyên Tố (Kim Đan)
  executeNpcSkillTier3(npc, target, calculatedDmg = 150, vfxMul = 1.0) {
    if (!npc || npc.isDead) return;
    const curTarget = (target && target.active && !target.isDead) ? target : this.findNearestEnemyForNpc(npc.sprite.x, npc.sprite.y, 450);
    const tx = curTarget ? curTarget.x : npc.sprite.x + (npc.sprite.flipX ? -200 : 200);
    const ty = curTarget ? curTarget.y : npc.sprite.y;
    const eKey = npc.eKey || 'kim';

    const arrayKey = this.textures.exists(`vfx_${eKey}_3`) ? `vfx_${eKey}_3` : 'vfx_kim_3_0';
    const arrayImg = this.add.image(tx, ty, arrayKey)
      .setDepth(Math.floor(ty) - 5)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.2 * vfxMul)
      .setAlpha(0.2);

    this.tweens.add({
      targets: arrayImg,
      alpha: 0.9,
      scaleX: 1.5 * vfxMul,
      scaleY: 1.5 * vfxMul,
      duration: 380,
      yoyo: true,
      repeat: 2,
      onComplete: () => arrayImg.destroy()
    });

    for (let tick = 0; tick < 3; tick++) {
      this.time.delayedCall(tick * 260, () => {
        if (!this.enemies) return;
        const isCrit = Math.random() < 0.20;
        const tickDmg = Math.max(1, Math.floor(calculatedDmg / 3));
        this.enemies.forEach(e => {
          if (!e || !e.active || e.isDead) return;
          if (Phaser.Math.Distance.Between(e.x, e.y, tx, ty) <= 160) {
            this.damageEnemy(e, tickDmg, isCrit && tick === 0, {
              type: 'wild_npc',
              name: npc.name,
              title: npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`,
              ref: npc
            });
            this.spawnVfx(e.x, e.y - 15, 0, 0.6 * vfxMul, { duration: 180 });
          }
        });
      });
    }
  },

  // Chiêu 4: Hỗn Độn Đạn Mạc / Vạn Kiếm Quy Tông (Nguyên Anh)
  executeNpcSkillTier4(npc, target, calculatedDmg = 200, vfxMul = 1.0) {
    if (!npc || npc.isDead) return;
    const curTarget = (target && target.active && !target.isDead) ? target : this.findNearestEnemyForNpc(npc.sprite.x, npc.sprite.y, 450);
    const tx = curTarget ? curTarget.x : npc.sprite.x + (npc.sprite.flipX ? -200 : 200);
    const ty = curTarget ? curTarget.y : npc.sprite.y;
    const eKey = npc.eKey || 'kim';

    const swarmKey = this.textures.exists(`vfx_${eKey}_4`) ? `vfx_${eKey}_4` : (this.textures.exists(`vfx_${eKey}_1`) ? `vfx_${eKey}_1` : 'vfx_kim_1_0');
    for (let i = 0; i < 6; i++) {
      const angle = (i * 2 * Math.PI) / 6;
      const sx = tx + Math.cos(angle) * 120;
      const sy = ty + Math.sin(angle) * 75 - 170;
      this.time.delayedCall(i * 45, () => {
        const missile = this.add.sprite(sx, sy, swarmKey)
          .setDepth(Math.floor(ty) + 40)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(0.75 * vfxMul);
        this.tweens.add({
          targets: missile,
          x: tx + Phaser.Math.Between(-35, 35),
          y: ty + Phaser.Math.Between(-20, 20),
          duration: 240,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            missile.destroy();
            this.spawnVfx(missile.x, missile.y, 0, 0.5 * vfxMul, { duration: 150 });
          }
        });
      });
    }

    this.time.delayedCall(340, () => {
      if (!this.enemies) return;
      const isCrit = Math.random() < 0.25;
      const finalDmg = isCrit ? Math.floor(calculatedDmg * 1.85) : calculatedDmg;
      this.enemies.forEach(e => {
        if (!e || !e.active || e.isDead) return;
        if (Phaser.Math.Distance.Between(e.x, e.y, tx, ty) <= 180) {
          this.damageEnemy(e, finalDmg, isCrit, {
            type: 'wild_npc',
            name: npc.name,
            title: npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`,
            ref: npc
          });
        }
      });
    });
  },

  // Chiêu 5: Diệt Thế Thần Kiếm / Cự Thạch / Nghiệp Hỏa Giáng Trần (Hóa Thần)
  executeNpcSkillTier5(npc, target, calculatedDmg = 300, vfxMul = 1.0) {
    if (!npc || npc.isDead) return;
    const curTarget = (target && target.active && !target.isDead) ? target : this.findNearestEnemyForNpc(npc.sprite.x, npc.sprite.y, 450);
    const tx = curTarget ? curTarget.x : npc.sprite.x + (npc.sprite.flipX ? -200 : 200);
    const ty = curTarget ? curTarget.y : npc.sprite.y;
    const eKey = npc.eKey || 'kim';

    const colossusKey = this.textures.exists(`vfx_${eKey}_5`) ? `vfx_${eKey}_5` : (this.textures.exists('vfx_giant_tru_tien_sword') ? 'vfx_giant_tru_tien_sword' : 'vfx_kim_1_0');
    const giant = this.add.sprite(tx, ty - 350, colossusKey)
      .setDepth(Math.floor(ty) + 80)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.25 * vfxMul);

    this.tweens.add({
      targets: giant,
      y: ty - 15,
      duration: 340,
      ease: 'Quad.easeIn',
      onComplete: () => {
        giant.destroy();
        const distToPlayer = Phaser.Math.Distance.Between(tx, ty, this.player?.x || 0, this.player?.y || 0);
        if (distToPlayer <= 550 && this.cameras?.main) {
          this.cameras.main.shake(260, 0.012);
        }

        const shockKey = this.textures.exists(`vfx_${eKey}_shockwave`) ? `vfx_${eKey}_shockwave` : 'vfx_tru_tien_shockwave';
        if (this.textures.exists(shockKey)) {
          const shock = this.add.image(tx, ty, shockKey)
            .setDepth(Math.floor(ty) + 40)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(0.5);
          this.tweens.add({
            targets: shock,
            scaleX: 2.4 * vfxMul,
            scaleY: 2.4 * vfxMul,
            alpha: 0,
            duration: 400,
            onComplete: () => shock.destroy()
          });
        }

        if (this.enemies) {
          const isCrit = Math.random() < 0.28;
          const finalDmg = isCrit ? Math.floor(calculatedDmg * 1.85) : calculatedDmg;
          this.enemies.forEach(e => {
            if (!e || !e.active || e.isDead) return;
            if (Phaser.Math.Distance.Between(e.x, e.y, tx, ty) <= 240) {
              this.damageEnemy(e, finalDmg, isCrit, {
                type: 'wild_npc',
                name: npc.name,
                title: npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`,
                ref: npc
              });
              this.spawnVfx(e.x, e.y - 15, 0, 0.9 * vfxMul, { duration: 240 });
            }
          });
        }
      }
    });
  },

  findNearestEnemyForNpc(x, y, maxDist = 550) {
    if (!this.enemies || this.enemies.length === 0) return null;
    let nearest = null;
    let minDist = maxDist;

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e || !e.active || e.isDead) continue;
      const d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    }
    return nearest;
  },

  takeFellowNpcDamage(npc, rawDmg = 15) {
    if (!npc || npc.isDead) return;
    const defMitigation = (npc.def || 0) * 0.4;
    const dmg = Math.max(1, Math.floor(rawDmg - defMitigation));
    npc.hp = Math.max(0, npc.hp - dmg);

    const ratio = Math.max(0, npc.hp / npc.maxHp);
    if (npc.hpBar) npc.hpBar.width = ratio * npc.barW;

    this.showFloatingText(npc.sprite.x, npc.sprite.y - 30, `-${dmg}`, '#ff8888', '11px');

    if (npc.hp <= 0) {
      this.killFellowNpc(npc);
    }
  },

  killFellowNpc(npc) {
    if (!npc || npc.isDead) return;
    npc.isDead = true;
    npc.targetEnemy = null;
    npc.respawnTime = this.time.now + 6000;

    npc.sprite.setVelocity(0, 0);
    npc.sprite.setTint(0x666666).setAlpha(0.35);
    if (npc.hpBar) npc.hpBar.setVisible(false);
    if (npc.hpBg) npc.hpBg.setVisible(false);
    if (npc.flyingSword) npc.flyingSword.setVisible(false);

    this.showFloatingText(npc.sprite.x, npc.sprite.y - 45, `[${npc.name}] Bại Trận!`, '#fca5a5', '11px');
    this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.5, { tint: 0x94a3b8, duration: 250 });
  },

  respawnFellowNpc(npc) {
    if (!npc || !npc.sprite) return;
    npc.isDead = false;
    npc.name = this.getRandomSinoVietName(npc.name);
    
    const curMapId = gameState.currentMapId ?? 0;
    const cfg = this.getNpcSpawnConfig(curMapId, npc.homeX, npc.elementIdx);

    npc.isVanMoc = cfg.isVanMoc;
    npc.zone = cfg.zone;
    npc.realmTier = cfg.realmTier;
    npc.realmName = cfg.realmName;
    npc.stageLabel = cfg.stageLabel;
    npc.masteryName = cfg.masteryName;
    npc.masteryBonus = cfg.masteryBonus;
    npc.vfxMul = cfg.vfxMul;
    npc.masteryColor = cfg.masteryColor;
    npc.elem = cfg.elem;
    npc.elemTitle = cfg.elemTitle;
    npc.elemColor = cfg.elemColor;
    npc.eKey = cfg.eKey;
    npc.isSword = cfg.isSword;
    npc.isMelee = cfg.isMelee;
    npc.skillId = cfg.skillId;
    npc.skillName = cfg.skillName;
    npc.dmgMul = cfg.dmgMul;
    npc.titlePrefix = cfg.titlePrefix;
    npc.tint = cfg.tint;
    npc.maxHp = cfg.maxHp;
    npc.hp = cfg.maxHp;
    npc.dmg = cfg.dmg;
    npc.def = cfg.def;
    npc.attackRange = cfg.attackRange || 240;
    npc.atkInterval = cfg.atkInterval || 2000;

    npc.nameTag.setText(`${cfg.titlePrefix} ${npc.name}`);
    npc.nameTag.setColor(cfg.titleColor || '#7dd3fc');

    if (npc.hpBar) {
      npc.hpBar.width = npc.barW;
      npc.hpBar.setVisible(true);
    }
    if (npc.hpBg) npc.hpBg.setVisible(true);

    npc.sprite.setPosition(npc.homeX + Phaser.Math.Between(-20, 20), npc.homeY + Phaser.Math.Between(-15, 15))
      .setVelocity(0, 0)
      .clearTint()
      .setTint(npc.tint)
      .setAlpha(1);

    npc.isFlying = cfg.isFlying;
    if (cfg.isFlying && !npc.modelType.startsWith('npc_fly_')) {
      const flyId = Phaser.Math.Between(1, 20);
      npc.modelType = `npc_fly_${flyId}`;
    } else if (!cfg.isFlying && npc.modelType.startsWith('npc_fly_')) {
      npc.modelType = (Math.random() < 0.5) ? 'dai_han' : 'tho_san';
    }

    if (npc.flyingSword) {
      npc.flyingSword.setTint(cfg.tint).setVisible(cfg.isFlying);
    } else if (cfg.isFlying && this.textures.exists('flying_sword')) {
      npc.flyingSword = this.add.image(npc.homeX, npc.homeY + 4, 'flying_sword').setScale(0.60).setDepth(Math.floor(npc.homeY) + 9).setTint(cfg.tint);
    }
    const respawnAnim = cfg.isFlying ? `${npc.modelType}_fly` : `${npc.modelType}_idle`;
    npc.sprite.play(respawnAnim, true);
    this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.6, { tint: cfg.tint || 0x38bdf8, duration: 300 });
    this.showFloatingText(npc.sprite.x, npc.sprite.y - 50, `[${npc.name}] Tái Sinh!`, cfg.titleColor || '#67e8f9', '11px');
  }
};
