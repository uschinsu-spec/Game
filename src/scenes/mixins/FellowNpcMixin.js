import { gameState } from '../../state/gameState.js';
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { REALMS } from '../../config/realmsData.js';
import { getNpcZoneConfig } from '../../config/world/mapNpcProgressions.js?v=20260930-dynamic-npc-progression-v6';
import { CANONICAL_MAP_KEYS } from '../../config/world/masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';
import { getMapById } from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';

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
  { modelType: 'npc_1', name: 'Nhiếp Phong',   tint: 0xbbe1fa, offsetX: -48, offsetY: -26, title: '⚔️ Phong Kiếm', elem: 'Phong', eKey: 'phong', isSword: true },
  { modelType: 'npc_2', name: 'Bộ Kinh Vân',   tint: 0xfecaca, offsetX: -48, offsetY:  26, title: '⚔️ Vân Kiếm',   elem: 'Thủy',  eKey: 'thuy',  isSword: true },
  { modelType: 'npc_1', name: 'Tiêu Phong',    tint: 0xbbf7d0, offsetX: -84, offsetY: -16, title: '⚔️ Bích Kiếm',  elem: 'Mộc',   eKey: 'moc',   isSword: false },
  { modelType: 'npc_2', name: 'Đoàn Dự',       tint: 0xf3e8ff, offsetX: -84, offsetY:  16, title: '⚔️ Tử Kiếm',    elem: 'Lôi',   eKey: 'loi',   isSword: false }
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

  calcNpcAtkInterval(spiritualSense) {
    const sense = Math.max(1, spiritualSense || 10);
    const BASE_SENSE = 20;
    const HUA_SHEN_PEAK_SENSE = 5700;
    const BASE_INTERVAL = 2000;
    const HUA_SHEN_PEAK_INTERVAL = 500;
    const MIN_INTERVAL = 450;
    const MAX_INTERVAL = 2600;

    if (sense <= BASE_SENSE) {
      const lowSenseInterval = Math.round(BASE_INTERVAL * (BASE_SENSE / sense));
      return Math.max(BASE_INTERVAL, Math.min(MAX_INTERVAL, lowSenseInterval));
    }

    const progress = Math.log(sense / BASE_SENSE) / Math.log(HUA_SHEN_PEAK_SENSE / BASE_SENSE);
    const interval = Math.round(
      BASE_INTERVAL - (BASE_INTERVAL - HUA_SHEN_PEAK_INTERVAL) * progress
    );
    return Math.max(MIN_INTERVAL, Math.min(MAX_INTERVAL, interval));
  },

  getNpcConfigFromRealm(realmIdx = 0, elemDef = null) {
    const rIdx = Math.max(0, Math.min(REALMS.length - 1, Number(realmIdx) || 0));
    const realmData = REALMS[rIdx] || REALMS[0];
    const sense = realmData.spiritualSense || 10;
    const atkInterval = this.calcNpcAtkInterval(sense);
    const isFlying = rIdx >= 13; // Trúc Cơ trở lên bay bằng phi kiếm (khớp Player)

    let tierLevel = 1;
    if (rIdx >= 25) tierLevel = 5;       // Hóa Thần
    else if (rIdx >= 21) tierLevel = 4;  // Nguyên Anh
    else if (rIdx >= 17) tierLevel = 3;  // Kim Đan
    else if (rIdx >= 13) tierLevel = 2;  // Trúc Cơ
    else tierLevel = 1;                  // Luyện Khí & Phàm Nhân

    const isMortal = rIdx === 0;
    const elem = isMortal ? 'Vật Lý' : (elemDef?.elem || 'Kiếm');
    const eKey = isMortal ? 'ly' : (elemDef?.eKey || 'kim');
    const isSword = isMortal ? true : (elemDef?.isSword ?? true);
    const isMelee = isMortal ? true : (elemDef?.isMelee ?? false);

    const skillPrefix = isSword ? 'kiem' : eKey;
    const skillId = `${skillPrefix}_${tierLevel}`;
    const skillDef = ELEMENTAL_SKILLS.find(s => s.id === skillId) || ELEMENTAL_SKILLS.find(s => s.id === `${skillPrefix}_1`) || ELEMENTAL_SKILLS[0];

    return {
      realmIdx: rIdx,
      realmData,
      realmMajor: realmData.major,
      realmTier: realmData.tier,
      stageLabel: realmData.name,
      hp: realmData.hp,
      maxHp: realmData.hp,
      dmg: realmData.dmg,
      def: realmData.def,
      manaMax: realmData.manaMax,
      spiritualSense: sense,
      atkInterval,
      isFlying,
      tierLevel,
      elem,
      eKey,
      isSword,
      isMelee,
      isMortal,
      skillId: skillDef.id,
      skillName: isMortal ? 'Trảm Kích' : skillDef.name,
      dmgMul: isMortal ? 1.0 : (skillDef.dmgMul || 1.6),
      attackRange: isMelee ? 110 : (elemDef?.baseRange || 240)
    };
  },

  getNpcSpawnConfig(mapId, homeX, elementIdx = -1) {
    const elemCfg = this.getNpcElement(elementIdx);
    const map = (this.currentMap && this.currentMap.id === mapId) ? this.currentMap : (this.getMapById ? this.getMapById(mapId) : null);
    const zoneNumber = this.getMapZoneNumberAtX ? this.getMapZoneNumberAtX(mapId, homeX) : 1;
    const zoneCfg = getNpcZoneConfig(map || mapId, zoneNumber);

    const stats = this.getNpcConfigFromRealm(zoneCfg.realmIdx ?? 0, elemCfg);
    return {
      ...stats,
      mapId,
      zone: zoneCfg.zone,
      masteryName: stats.isMortal ? '' : zoneCfg.masteryName,
      masteryBonus: stats.isMortal ? 0 : zoneCfg.masteryBonus,
      vfxMul: stats.isMortal ? 0.8 : zoneCfg.vfxMul,
      masteryColor: stats.isMortal ? '#f1f5f9' : zoneCfg.masteryColor,
      titleColor: stats.isMortal ? '#f1f5f9' : (elemCfg.color || '#7dd3fc'),
      elemTitle: stats.isMortal ? (elemCfg.isSword ? 'Kiếm Sĩ' : 'Võ Giả') : elemCfg.title,
      tint: 0xffffff,
      titlePrefix: ''
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

    const curMapId = gameState.currentMapId ?? CANONICAL_MAP_KEYS.THANH_VAN_THON;
    const map = this.currentMap || getMapById(curMapId);
    
    // Trong khu an toàn không sinh NPC hoang dã
    if (!map || map.isPeaceZone || curMapId === CANONICAL_MAP_KEYS.THANH_VAN_THON) {
      return;
    }

    const makeNpcAnim = (prefix, tex) => {
      const defs = [
        ['idle', 0, 3, 6, -1],
        ['run', 4, 7, 8, -1],
        ['attack', 8, 25, 18, 0],
        ['fly', 26, 39, 10, -1]
      ];
      defs.forEach(([action, start, end, rate, rep]) => {
        const key = `${prefix}_${action}`;
        if (this.textures.exists(tex)) {
          if (this.anims.exists(key)) this.anims.remove(key);
          this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(tex, { start, end }),
            frameRate: rate,
            repeat: rep
          });
        }
      });
    };
    makeNpcAnim('npc_1', 'npc_1');
    makeNpcAnim('npc_warrior', 'npc_1');
    makeNpcAnim('npc_2', 'npc_2');
    makeNpcAnim('dai_han', 'npc_1');
    makeNpcAnim('tho_san', 'npc_2');

    const totalW = this.worldW || 32000;

    if ((this.worldH || 0) > 1500) {
      // 2.5D Isometric Map (e.g. Thanh Vân Ngoại Vi 3584x3584)
      const stepX = 520;
      const stepY = 520;
      let idx = 0;
      for (let x = this.field.left + 240; x <= this.field.right - 240; x += stepX) {
        for (let y = this.field.top + 240; y <= this.field.bottom - 240; y += stepY) {
          const jx = Phaser.Math.Clamp(x + Phaser.Math.Between(-60, 60), this.field.left + 80, this.field.right - 80);
          const jy = Phaser.Math.Clamp(y + Phaser.Math.Between(-60, 60), this.field.top + 80, this.field.bottom - 80);
          const mType = (idx % 2 === 0) ? 'npc_1' : 'npc_2';
          this.spawnOneFellowNpc(jx, jy, mType, idx % NPC_ELEMENTS.length);
          idx++;
        }
      }
      return;
    }

    const spawnXCoords = [];

    // Spawn đều đặn dọc map, bắt đầu từ gần vị trí vào cổng (x = 550)
    for (let x = 550; x < totalW - 600; x += Phaser.Math.Between(750, 1150)) {
      spawnXCoords.push(x);
    }

    spawnXCoords.forEach((x, idx) => {
      const y = Phaser.Math.Between(this.field.top + 40, this.field.bottom - 40);
      const cfg = this.getNpcSpawnConfig(curMapId, x, idx % NPC_ELEMENTS.length);
      const modelType = (idx % 2 === 0) ? 'npc_1' : 'npc_2';
      this.spawnOneFellowNpc(x, y, modelType, idx % NPC_ELEMENTS.length);
    });
  },

  spawnOneFellowNpc(homeX, homeY, modelType = null, elementIdx = -1) {
    const curMapId = gameState.currentMapId ?? 0;
    const name = this.getRandomSinoVietName();
    const cfg = this.getNpcSpawnConfig(curMapId, homeX, elementIdx);
    
    if (!modelType || modelType === 'dai_han' || modelType === 'npc_1' || modelType === 'npc_warrior') {
      modelType = 'npc_1';
    } else if (modelType === 'tho_san' || modelType === 'npc_2') {
      modelType = 'npc_2';
    } else {
      modelType = 'npc_1';
    }
    const initialAnim = cfg.isFlying ? `${modelType}_fly` : `${modelType}_idle`;
    const initialTexture = modelType;

    const sprite = this.physics.add.sprite(homeX, homeY, initialTexture, 0)
      .setScale(0.62)
      .setDepth(Math.floor(homeY) + (cfg.isFlying ? 10 : 0));
    sprite.setCollideWorldBounds(true);
    sprite.body.setSize(45, 68).setOffset(74, 90);
    if (this.anims.exists(initialAnim)) sprite.play(initialAnim);

    const shadow = this.add.ellipse(homeX, homeY + (cfg.isFlying ? 20 : 26), cfg.isFlying ? 28 : 32, cfg.isFlying ? 9 : 11, 0x000000, cfg.isFlying ? 0.35 : 0.45).setDepth(Math.floor(homeY) - 1);
    
    // Phi Kiếm ngự dưới chân NPC nếu là cảnh giới Trúc Cơ trở lên
    let flyingSword = null;
    if (cfg.isFlying && this.textures.exists('flying_sword')) {
      flyingSword = this.add.image(homeX, homeY + 4, 'flying_sword')
        .setScale(0.60)
        .setDepth(Math.floor(homeY) + 9)
        .setTint(cfg.tint);
    }

    const nameTag = this.add.text(homeX, homeY - 48, name, {
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: cfg.titleColor || '#7dd3fc',
      stroke: '#000000',
      strokeThickness: 2.2
    }).setOrigin(0.5).setDepth(Math.floor(homeY) + 3);

    const barW = 34;
    const hpBg = this.add.rectangle(homeX, homeY - 37, barW, 3, 0x111111, 0.8).setDepth(Math.floor(homeY) + 1);
    const hpBar = this.add.rectangle(homeX - barW / 2, homeY - 37, barW, 3, 0x34d399)
      .setOrigin(0, 0.5).setDepth(Math.floor(homeY) + 2);

    const is2DMap = (this.worldH || 0) > 1500;
    const playerX = this.player ? this.player.x : (this.currentMap?.spawn?.x || 1792);
    const playerY = this.player ? this.player.y : (this.currentMap?.spawn?.y || 1792);
    const isNear = is2DMap
      ? (Phaser.Math.Distance.Between(homeX, homeY, playerX, playerY) <= 1200)
      : (Math.abs(homeX - playerX) <= 950);
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
      titlePrefix: '',
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
      isRetreating: false,
      retreatUntil: 0,
      nextHealTick: 0,
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

    const curMapId = gameState.currentMapId ?? CANONICAL_MAP_KEYS.THANH_VAN_THON;
    const map = (this.currentMap && this.currentMap.id === curMapId) ? this.currentMap : (this.getMapById ? this.getMapById(curMapId) : null);
    
    // Trong khu an toàn không xuất hiện, ra ngoài chiến trường sẽ tự động bám theo bảo vệ Player
    if (!map || map.isPeaceZone || curMapId === CANONICAL_MAP_KEYS.THANH_VAN_THON) return;

    const px = this.player ? this.player.x : 350;
    const py = this.player ? this.player.y : 600;

    const pRealmIdx = Math.max(0, Math.min(REALMS.length - 1, Number(gameState.realmIdx) || 0));

    this.partyFollowers = PARTY_MEMBERS_DEF.map((def, idx) => {
      const sx = px + def.offsetX;
      const sy = py + def.offsetY;
      const mType = def.modelType || 'npc_1';
      const stats = this.getNpcConfigFromRealm(pRealmIdx, def);

      const sprite = this.physics.add.sprite(sx, sy, mType, 0)
        .setScale(0.62)
        .setTint(def.tint)
        .setDepth(Math.floor(sy) + (stats.isFlying ? 10 : 0));
      sprite.setCollideWorldBounds(true);
      sprite.body.setSize(45, 68).setOffset(74, 90);

      const animKey = stats.isFlying ? `${mType}_fly` : `${mType}_idle`;
      if (this.anims.exists(animKey)) sprite.play(animKey);

      const shadow = this.add.ellipse(sx, sy + (stats.isFlying ? 20 : 26), stats.isFlying ? 28 : 32, stats.isFlying ? 9 : 11, 0x000000, stats.isFlying ? 0.35 : 0.45).setDepth(Math.floor(sy) - 1);

      let flyingSword = null;
      if (stats.isFlying && this.textures.exists('flying_sword')) {
        flyingSword = this.add.image(sx, sy + 4, 'flying_sword')
          .setScale(0.60)
          .setDepth(Math.floor(sy) + 9)
          .setTint(def.tint);
      }

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

      return {
        ...stats,
        sprite,
        shadow,
        nameTag,
        hpBg,
        hpBar,
        barW,
        flyingSword,
        name: def.name,
        modelType: mType,
        tint: def.tint,
        title: def.title,
        offsetX: def.offsetX,
        offsetY: def.offsetY,
        isPartyMember: true,
        speed: 155,
        lastAttack: 0,
        attackUntil: 0,
        targetEnemy: null,
        isDead: false,
        respawnTime: 0
      };
    });
    this.__lastPartySyncRealm = pRealmIdx;
  },

  updatePartyFollowers(time, delta) {
    if (!this.partyFollowers || this.partyFollowers.length === 0 || !this.player || !this.player.active) return;

    // Tự động đồng bộ cấp độ / cảnh giới của Hiệp Khách Tổ Đội khi Player đột phá
    const pRealmIdx = Math.max(0, Math.min(REALMS.length - 1, Number(gameState.realmIdx) || 0));
    if (this.__lastPartySyncRealm !== pRealmIdx) {
      this.__lastPartySyncRealm = pRealmIdx;
      for (let i = 0; i < this.partyFollowers.length; i++) {
        const f = this.partyFollowers[i];
        if (!f) continue;
        const def = PARTY_MEMBERS_DEF[i] || {};
        const newStats = this.getNpcConfigFromRealm(pRealmIdx, def);
        Object.assign(f, newStats);
        f.hp = f.maxHp;
        if (f.hpBar) f.hpBar.width = f.barW;
        if (f.flyingSword) {
          f.flyingSword.setVisible(f.isFlying);
        } else if (f.isFlying && this.textures.exists('flying_sword')) {
          f.flyingSword = this.add.image(f.sprite.x, f.sprite.y + 4, 'flying_sword').setScale(0.60).setDepth(Math.floor(f.sprite.y) + 9).setTint(f.tint);
        }
        this.showFloatingText(f.sprite.x, f.sprite.y - 50, `[${f.name}] Đột Phá ${newStats.stageLabel}!`, '#ffd700', '11px');
        this.spawnVfx(f.sprite.x, f.sprite.y, 0, 0.65, { owner: 'fellow', tint: f.tint, duration: 300 });
      }
    }

    const px = this.player.x;
    const py = this.player.y;
    const PARTY_TARGET_TICK_MS = 1000 / 3;
    const PARTY_VISUAL_TICK_MS = 1000 / 30;
    const PARTY_UI_TICK_MS = 50;

    const shouldRefreshPartyTargets = time >= Number(this.__nextPartyTargetTickAt || 0);
    if (shouldRefreshPartyTargets) this.__nextPartyTargetTickAt = time + PARTY_TARGET_TICK_MS;

    const shouldUpdatePartyVisual = time >= Number(this.__nextPartyVisualTickAt || 0);
    if (shouldUpdatePartyVisual) this.__nextPartyVisualTickAt = time + PARTY_VISUAL_TICK_MS;

    const shouldUpdatePartyUi = time >= Number(this.__nextPartyUiTickAt || 0);
    if (shouldUpdatePartyUi) this.__nextPartyUiTickAt = time + PARTY_UI_TICK_MS;

    for (let i = 0; i < this.partyFollowers.length; i++) {
      const f = this.partyFollowers[i];
      if (!f || !f.sprite) continue;

      const sx = f.sprite.x;
      const sy = f.sprite.y;
      const pScale = 0.72 * this.perspective(sy);
      const depth = Math.floor(sy) + (f.isFlying ? 10 : 0);

      if (!Number.isFinite(f.__lastRenderScale) || Math.abs(f.__lastRenderScale - pScale) > 0.002) {
        f.sprite.setScale(pScale);
        f.__lastRenderScale = pScale;
      }
      if (f.__lastRenderDepth !== depth) {
        f.sprite.setDepth(depth);
        f.__lastRenderDepth = depth;
      }

      if (shouldUpdatePartyVisual || f.__forceVisualSync) {
        f.shadow.setPosition(sx, sy + (f.isFlying ? 20 : 30) * pScale).setScale(pScale).setDepth(depth - 1);
        if (f.flyingSword && f.isFlying) {
          f.flyingSword.setPosition(sx, sy + 4 * pScale).setScale(0.60 * pScale).setDepth(depth - 1);
        }
      }

      if (shouldUpdatePartyUi || f.__forceVisualSync) {
        const moved = !Number.isFinite(f.__lastUiX)
          || Math.abs(f.__lastUiX - sx) > 0.5
          || Math.abs(f.__lastUiY - sy) > 0.5
          || Math.abs(Number(f.__lastUiScale || 0) - pScale) > 0.002
          || f.__lastUiDepth !== depth;

        if (moved || f.__forceVisualSync) {
          f.nameTag.setPosition(sx, sy - 48).setDepth(depth + 3);
          f.hpBg.setPosition(sx, sy - 37).setDepth(depth + 1);
          f.hpBar.setPosition(sx - f.barW / 2, sy - 37).setDepth(depth + 2);
          f.__lastUiX = sx;
          f.__lastUiY = sy;
          f.__lastUiScale = pScale;
          f.__lastUiDepth = depth;
        }
        f.__forceVisualSync = false;
      }

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
          if (f.flyingSword && f.isFlying) f.flyingSword.setVisible(true);
          f.sprite.setPosition(px + f.offsetX, py + f.offsetY)
            .setVelocity(0, 0)
            .clearTint()
            .setTint(f.tint)
            .setAlpha(1);
          f.__forceVisualSync = true;
          f.sprite.play(f.isFlying ? `${f.modelType}_fly` : `${f.modelType}_idle`, true);
          this.spawnVfx(f.sprite.x, f.sprite.y, 0, 0.6, { owner: 'fellow', tint: f.tint, duration: 250 });
          this.showFloatingText(f.sprite.x, f.sprite.y - 45, `[Tổ Đội · ${f.name}] Trợ Chiến!`, '#ffd700', '10px');
        }
        continue;
      }

      // 1. Quét tìm quái xung quanh Player (bán kính 380px)
      let target = f.targetEnemy;
      const partyTargetInvalid = !target || !target.active || target.isDead || Phaser.Math.Distance.Between(px, py, target.x, target.y) > 420;
      if (partyTargetInvalid) {
        target = null;
        f.targetEnemy = null;
        if (shouldRefreshPartyTargets) {
          target = this.findNearestEnemyForNpc(px, py, 380);
          f.targetEnemy = target;
        }
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
            if (f.sprite.anims && f.sprite.anims.timeScale !== 1) f.sprite.anims.timeScale = 1;
            const moveAnim = f.isFlying ? `${f.modelType}_fly` : `${f.modelType}_run`;
            f.sprite.play(moveAnim, true);
          }
        } else {
          // Vào tầm đánh quái: Thi triển pháp thuật & combo như hệ thống Player
          f.sprite.setVelocity(pushVx * 0.5, pushVy * 0.5);
          f.sprite.setFlipX(target.x < sx);

          if (time >= f.lastAttack + f.atkInterval && time >= f.attackUntil) {
            f.lastAttack = time;
            this.castFellowNpcElementalSkill(f, target);
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
            if (f.sprite.anims && f.sprite.anims.timeScale !== 1) f.sprite.anims.timeScale = 1;
            const moveAnim = f.isFlying ? `${f.modelType}_fly` : `${f.modelType}_run`;
            f.sprite.play(moveAnim, true);
          }
        } else {
          f.sprite.setVelocity(0, 0);
          if (time >= f.attackUntil) {
            if (f.sprite.anims && f.sprite.anims.timeScale !== 1) f.sprite.anims.timeScale = 1;
            const idleAnim = f.isFlying ? `${f.modelType}_fly` : `${f.modelType}_idle`;
            f.sprite.play(idleAnim, true);
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
    const dmg = Math.max(1, Math.floor(rawDmg * (100 / (100 + (follower.def || 0)))));
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
      if (follower.flyingSword) follower.flyingSword.setVisible(false);
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
    const playerY = this.player.y;

    // Keep sprite/physics movement at frame rate, but throttle attached visuals and AI.
    const FELLOW_AI_TICK_MS = 1000 / 3;
    const FELLOW_VISUAL_TICK_MS = 1000 / 30;
    const FELLOW_UI_TICK_MS = 50;

    const shouldThinkFellowAi = time >= Number(this.__nextFellowAiTickAt || 0);
    if (shouldThinkFellowAi) this.__nextFellowAiTickAt = time + FELLOW_AI_TICK_MS;

    const shouldUpdateFellowVisual = time >= Number(this.__nextFellowVisualTickAt || 0);
    if (shouldUpdateFellowVisual) this.__nextFellowVisualTickAt = time + FELLOW_VISUAL_TICK_MS;

    const shouldUpdateFellowUi = time >= Number(this.__nextFellowUiTickAt || 0);
    if (shouldUpdateFellowUi) this.__nextFellowUiTickAt = time + FELLOW_UI_TICK_MS;

    for (let i = 0; i < this.fellowNpcs.length; i++) {
      const npc = this.fellowNpcs[i];
      if (!npc || !npc.sprite) continue;

      const is2DMap = (this.worldH || 0) > 1500;
      const distToPlayer = is2DMap
        ? Phaser.Math.Distance.Between(npc.sprite.x, npc.sprite.y, playerX, playerY)
        : Math.abs(npc.sprite.x - playerX);

      // 1. Proximity Culling: Ẩn và dừng xử lý khi ở xa (>1200px)
      const maxCullRange = is2DMap ? 1200 : CULL_RANGE_X;
      if (distToPlayer > maxCullRange) {
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
          npc.__forceVisualSync = true;
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
        npc.__forceVisualSync = true;
      }

      // Sprite movement stays per-frame. Attached visuals/UI are rate-limited.
      const sx = npc.sprite.x;
      const sy = npc.sprite.y;
      const pScale = 0.62 * this.perspective(sy);
      const baseDepth = Math.floor(sy);
      const spriteDepth = baseDepth + (npc.isFlying ? 10 : 0);

      if (npc.__originMode !== (npc.isFlying ? 'flying' : 'ground')) {
        npc.sprite.setOrigin(0.5, npc.isFlying ? 0.78 : 0.5);
        npc.__originMode = npc.isFlying ? 'flying' : 'ground';
      }
      if (!Number.isFinite(npc.__lastRenderScale) || Math.abs(npc.__lastRenderScale - pScale) > 0.002) {
        npc.sprite.setScale(pScale);
        npc.__lastRenderScale = pScale;
      }
      if (npc.__lastRenderDepth !== spriteDepth) {
        npc.sprite.setDepth(spriteDepth);
        npc.__lastRenderDepth = spriteDepth;
      }

      if (npc.isFlying) {
        // Keep banking smooth because it is part of the character motion itself.
        const vx = npc.sprite.body ? npc.sprite.body.velocity.x : 0;
        const targetTilt = Phaser.Math.Clamp(vx * 0.0007, -0.15, 0.15);
        npc.sprite.rotation = Phaser.Math.Linear(npc.sprite.rotation || 0, targetTilt, 0.12);

        if (shouldUpdateFellowVisual || npc.__forceVisualSync) {
          const hoverOffset = Math.sin(time * 0.0035 + (npc.homeX || 0)) * 6;
          const shadowScale = pScale * (0.75 + 0.03 * Math.sin(time * 0.0035));
          npc.shadow.setPosition(sx, sy + 22 * pScale)
            .setScale(shadowScale, shadowScale * 0.45)
            .setAlpha(0.32)
            .setDepth(baseDepth - 1);

          if (npc.flyingSword) {
            const swordY = sy - 18 * pScale + hoverOffset;
            npc.flyingSword.setPosition(sx, swordY)
              .setScale(0.60 * pScale)
              .setRotation(npc.sprite.rotation)
              .setFlipX(npc.sprite.flipX)
              .setDepth(baseDepth + 9);
            if (!npc.flyingSword.visible) npc.flyingSword.setVisible(true);
          }
        }

        if (shouldUpdateFellowUi || npc.__forceVisualSync) {
          const hoverOffset = Math.sin(time * 0.0035 + (npc.homeX || 0)) * 6;
          const uiY = sy - 84 * pScale + hoverOffset;
          const moved = !Number.isFinite(npc.__lastUiX)
            || Math.abs(npc.__lastUiX - sx) > 0.5
            || Math.abs(npc.__lastUiY - uiY) > 0.5
            || Math.abs(Number(npc.__lastUiScale || 0) - pScale) > 0.002
            || npc.__lastUiDepth !== baseDepth;

          if (moved || npc.__forceVisualSync) {
            npc.nameTag.setPosition(sx, uiY - 14).setDepth(baseDepth + 15);
            npc.hpBg.setPosition(sx, uiY).setDepth(baseDepth + 12);
            npc.hpBar.setPosition(sx - npc.barW / 2, uiY).setDepth(baseDepth + 13);
            npc.__lastUiX = sx;
            npc.__lastUiY = uiY;
            npc.__lastUiScale = pScale;
            npc.__lastUiDepth = baseDepth;
          }
          npc.__forceVisualSync = false;
        }
      } else {
        if (npc.sprite.rotation !== 0) npc.sprite.rotation = 0;

        if (shouldUpdateFellowVisual || npc.__forceVisualSync) {
          npc.shadow.setPosition(sx, sy + 30 * pScale)
            .setScale(pScale, pScale * 0.33)
            .setAlpha(0.4)
            .setDepth(baseDepth - 1);
          if (npc.flyingSword?.visible) npc.flyingSword.setVisible(false);
        }

        if (shouldUpdateFellowUi || npc.__forceVisualSync) {
          const moved = !Number.isFinite(npc.__lastUiX)
            || Math.abs(npc.__lastUiX - sx) > 0.5
            || Math.abs(npc.__lastUiY - sy) > 0.5
            || Math.abs(Number(npc.__lastUiScale || 0) - pScale) > 0.002
            || npc.__lastUiDepth !== baseDepth;

          if (moved || npc.__forceVisualSync) {
            npc.nameTag.setPosition(sx, sy - 48).setDepth(baseDepth + 3);
            npc.hpBg.setPosition(sx, sy - 37).setDepth(baseDepth + 1);
            npc.hpBar.setPosition(sx - npc.barW / 2, sy - 37).setDepth(baseDepth + 2);
            npc.__lastUiX = sx;
            npc.__lastUiY = sy;
            npc.__lastUiScale = pScale;
            npc.__lastUiDepth = baseDepth;
          }
          npc.__forceVisualSync = false;
        }
      }

      // 2. Xử lý Hồi Sinh khi Chết
      if (npc.isDead) {
        if (time >= npc.respawnTime) {
          this.respawnFellowNpc(npc);
        }
        continue;
      }

      // 2.5. Trạng thái Tạm lui Hồi Phục Máu khi gần chết
      if (npc.isRetreating) {
        npc.targetEnemy = null;
        const nearestThreat = this.findNearestEnemyForNpc(sx, sy, 400);
        let runVx = 0, runVy = 0;

        if (nearestThreat && nearestThreat.active) {
          const awayAngle = Phaser.Math.Angle.Between(nearestThreat.x, nearestThreat.y, sx, sy);
          runVx = Math.cos(awayAngle) * (npc.speed * 1.2) + wildPushVx;
          runVy = Math.sin(awayAngle) * (npc.speed * 1.2) + wildPushVy;
        } else {
          const distToHome = Phaser.Math.Distance.Between(sx, sy, npc.homeX, npc.homeY);
          if (distToHome > 40) {
            const homeAngle = Phaser.Math.Angle.Between(sx, sy, npc.homeX, npc.homeY);
            runVx = Math.cos(homeAngle) * (npc.speed * 0.9) + wildPushVx;
            runVy = Math.sin(homeAngle) * (npc.speed * 0.9) + wildPushVy;
          } else {
            runVx = wildPushVx * 0.3;
            runVy = wildPushVy * 0.3;
          }
        }

        npc.sprite.setVelocity(runVx, runVy);
        if (Math.abs(runVx) > 2) npc.sprite.setFlipX(runVx < 0);
        const moving = Math.abs(runVx) > 4 || Math.abs(runVy) > 4;
        const moveAnim = npc.isFlying ? `${npc.modelType}_fly` : (moving ? `${npc.modelType}_run` : `${npc.modelType}_idle`);
        if (npc.sprite.anims && npc.sprite.anims.timeScale !== 1) npc.sprite.anims.timeScale = 1;
        npc.sprite.play(moveAnim, true);

        // Hồi phục sinh lực liên tục
        if (time >= (npc.nextHealTick || 0)) {
          npc.nextHealTick = time + 400;
          const healAmount = Math.max(3, Math.floor(npc.maxHp * 0.08));
          npc.hp = Math.min(npc.maxHp, npc.hp + healAmount);
          const ratio = Math.max(0, npc.hp / npc.maxHp);
          if (npc.hpBar) npc.hpBar.width = ratio * npc.barW;
          this.spawnVfx(sx, sy - 8, 0, 0.35, { owner: 'fellow', tint: 0x34d399, duration: 200 });

          if (npc.hp >= npc.maxHp * 0.90) {
            npc.hp = npc.maxHp;
            if (npc.hpBar) npc.hpBar.width = npc.barW;
            npc.isRetreating = false;
            this.showFloatingText(sx, sy - 45, `${npc.name}: Hồi Phục Đầy Đủ, Tái Chiến!`, '#fde047', '10px');
            this.spawnVfx(sx, sy, 0, 0.5, { owner: 'fellow', tint: 0xfacc15, duration: 250 });
          }
        }
        continue;
      }

      // 3. AI Tự Động Quét Tìm Quái Vật
      let target = npc.targetEnemy;
      const distToTarget = target ? Phaser.Math.Distance.Between(sx, sy, target.x, target.y) : 99999;
      const fellowTargetInvalid = !target || !target.active || target.isDead || distToTarget > npc.searchRange;
      if (fellowTargetInvalid) {
        target = null;
        npc.targetEnemy = null;
        if (shouldThinkFellowAi) {
          target = this.findNearestEnemyForNpc(sx, sy, npc.searchRange);
          npc.targetEnemy = target;
        }
      }

      // Separation is an AI decision, so reuse its last result between AI ticks.
      let wildPushVx = Number(npc.__separationVx || 0);
      let wildPushVy = Number(npc.__separationVy || 0);
      if (shouldThinkFellowAi) {
        wildPushVx = 0;
        wildPushVy = 0;
        for (let j = 0; j < this.fellowNpcs.length; j++) {
          if (i === j) continue;
          const otherNpc = this.fellowNpcs[j];
          if (!otherNpc || !otherNpc.sprite || otherNpc.isDead || !otherNpc.sprite.visible) continue;
          const dx = sx - otherNpc.sprite.x;
          const dy = sy - otherNpc.sprite.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0 && distSq < 48 * 48) {
            const d = Math.sqrt(distSq);
            const factor = (48 - d) / 48;
            wildPushVx += (dx / d) * 70 * factor;
            wildPushVy += (dy / d) * 70 * factor;
          }
        }
        npc.__separationVx = wildPushVx;
        npc.__separationVy = wildPushVy;
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
            if (npc.sprite.anims && npc.sprite.anims.timeScale !== 1) npc.sprite.anims.timeScale = 1;
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
          if (npc.sprite.anims && npc.sprite.anims.timeScale !== 1) npc.sprite.anims.timeScale = 1;
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

    // 0. PHÀM NHÂN: Chỉ đánh thường vật lý bằng kiếm, không dùng pháp thuật hay hiện tên skill
    if (npc.isMortal || npc.realmIdx === 0) {
      npc.sprite.setFlipX(target.x < npc.sprite.x);
      const atkDuration = Math.max(380, Math.min(1800, Math.round((npc.atkInterval || 2000) * 0.55)));
      npc.attackUntil = this.time.now + atkDuration;
      npc.sprite.play(`${npc.modelType || 'npc_warrior'}_attack`, true);
      const baseDuration = (npc.modelType === 'npc_2') ? 1000 : 888;
      if (npc.sprite.anims) {
        npc.sprite.anims.timeScale = baseDuration / atkDuration;
      }

      const hitDelay = Math.round(atkDuration * 0.45);
      this.time.delayedCall(hitDelay, () => {
        if (!npc || npc.isDead) return;
        const curTarget = (target && target.active && !target.isDead) ? target : this.findNearestEnemyForNpc(npc.sprite.x, npc.sprite.y, 160);
        if (!curTarget) return;

        const isCrit = Math.random() < 0.12;
        let finalDmg = Math.max(1, Math.floor(npc.dmg * (isCrit ? 1.5 : 1.0)));

        this.damageEnemy(curTarget, finalDmg, isCrit, {
          type: npc.isPartyMember ? 'party_npc' : 'wild_npc',
          name: npc.name,
          title: npc.isPartyMember ? (npc.title || 'Hiệp Khách') : npc.name,
          ref: npc
        });
      });
      return;
    }

    npc.sprite.setFlipX(target.x < npc.sprite.x);
    const tierLevel = Math.max(1, Math.min(5, npc.tierLevel || 1));
    const vfxMul = npc.vfxMul || 1.0;
    const masteryColor = npc.masteryColor || npc.elemColor || '#7dd3fc';

    // Thời gian duy trì thế công kích theo số lượng combo (1 -> 5 chiêu)
    const comboDurations = [0, 420, 680, 950, 1250, 1600];
    const animDuration = comboDurations[tierLevel] || 500;
    npc.attackUntil = this.time.now + animDuration;

    npc.sprite.play(`${npc.modelType}_attack`, true);
    const baseDuration = (npc.modelType === 'npc_2') ? 1000 : 888;
    if (npc.sprite.anims) {
      npc.sprite.anims.timeScale = baseDuration / animDuration;
    }

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
          type: npc.isPartyMember ? 'party_npc' : 'wild_npc',
          name: npc.name,
          title: npc.isPartyMember ? (npc.title || 'Hiệp Khách') : (npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`),
          ref: npc
        });

        const impactKey = this.textures.exists(`vfx_${eKey}_impact`)
          ? `vfx_${eKey}_impact`
          : (this.textures.exists(`vfx_${eKey}_1_7`) ? `vfx_${eKey}_1_7` : 'vfx_impact_frame7');

        if (this.textures.exists(impactKey)) {
          const imp = this.acquireFellowVfx(curTarget.x, curTarget.y - 15, impactKey)
            .setDepth(Math.floor(curTarget.y) + 55)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale((0.75 + hit * 0.15) * vfxMul);
          this.tweens.add({
            targets: imp,
            scaleX: (1.2 + hit * 0.2) * vfxMul,
            scaleY: (1.2 + hit * 0.2) * vfxMul,
            alpha: 0,
            duration: 200,
            onComplete: () => this.releaseSharedVfx(imp)
          });
        }
        this.spawnVfx(curTarget.x, curTarget.y - 15, 0, (0.5 + hit * 0.12) * vfxMul, { owner: 'fellow', tint: 0xf43f5e, duration: 180 });
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

    const proj = this.acquireFellowVfx(startX, startY, projKey)
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
        this.releaseSharedVfx(proj);

        const impactKey = this.textures.exists(`vfx_${eKey}_1_7`)
          ? `vfx_${eKey}_1_7`
          : (this.textures.exists(`vfx_${eKey}_impact`)
            ? `vfx_${eKey}_impact`
            : 'vfx_impact_frame7');

        if (this.textures.exists(impactKey)) {
          const imp = this.acquireFellowVfx(tx, ty - 15, impactKey)
            .setDepth(Math.floor(ty) + 55)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(0.85 * vfxMul);
          this.tweens.add({
            targets: imp,
            scaleX: 1.3 * vfxMul,
            scaleY: 1.3 * vfxMul,
            alpha: 0,
            duration: 200,
            onComplete: () => this.releaseSharedVfx(imp)
          });
        }

        if (curTarget && curTarget.active && !curTarget.isDead) {
          const isCrit = Math.random() < 0.18;
          let finalDmg = isCrit ? Math.floor(calculatedDmg * 1.85) : calculatedDmg;

          this.damageEnemy(curTarget, finalDmg, isCrit, {
            type: npc.isPartyMember ? 'party_npc' : 'wild_npc',
            name: npc.name,
            title: npc.isPartyMember ? (npc.title || 'Hiệp Khách') : (npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`),
            ref: npc
          });

          const tintColor = Phaser.Display.Color.HexStringToColor(npc.elemColor || '#ffd700').color;
          this.spawnVfx(tx, ty - 15, 0, 0.5 * vfxMul, { owner: 'fellow', tint: tintColor, duration: 180 });
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

    const proj = this.acquireFellowVfx(startX, startY, projKey)
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
        this.releaseSharedVfx(proj);

        if (curTarget && curTarget.active && !curTarget.isDead) {
          const isCrit = Math.random() < 0.22;
          let finalDmg = isCrit ? Math.floor(calculatedDmg * 1.85) : calculatedDmg;

          this.damageEnemy(curTarget, finalDmg, isCrit, {
            type: npc.isPartyMember ? 'party_npc' : 'wild_npc',
            name: npc.name,
            title: npc.isPartyMember ? (npc.title || 'Hiệp Khách') : (npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`),
            ref: npc
          });

          const tintColor = Phaser.Display.Color.HexStringToColor(npc.elemColor || '#ffd700').color;
          this.spawnVfx(tx, ty - 15, 0, 0.7 * vfxMul, { owner: 'fellow', tint: tintColor, duration: 200 });
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
    const arrayImg = this.acquireFellowVfx(tx, ty, arrayKey)
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
      onComplete: () => this.releaseSharedVfx(arrayImg)
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
              type: npc.isPartyMember ? 'party_npc' : 'wild_npc',
              name: npc.name,
              title: npc.isPartyMember ? (npc.title || 'Hiệp Khách') : (npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`),
              ref: npc
            });
            this.spawnVfx(e.x, e.y - 15, 0, 0.6 * vfxMul, { owner: 'fellow', duration: 180 });
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
        const missile = this.acquireFellowVfx(sx, sy, swarmKey)
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
            this.releaseSharedVfx(missile);
            this.spawnVfx(missile.x, missile.y, 0, 0.5 * vfxMul, { owner: 'fellow', duration: 150 });
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
            type: npc.isPartyMember ? 'party_npc' : 'wild_npc',
            name: npc.name,
            title: npc.isPartyMember ? (npc.title || 'Hiệp Khách') : (npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`),
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
    const giant = this.acquireFellowVfx(tx, ty - 350, colossusKey)
      .setDepth(Math.floor(ty) + 80)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.25 * vfxMul);

    this.tweens.add({
      targets: giant,
      y: ty - 15,
      duration: 340,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.releaseSharedVfx(giant);

        const shockKey = this.textures.exists(`vfx_${eKey}_shockwave`) ? `vfx_${eKey}_shockwave` : 'vfx_tru_tien_shockwave';
        if (this.textures.exists(shockKey)) {
          const shock = this.acquireFellowVfx(tx, ty, shockKey)
            .setDepth(Math.floor(ty) + 40)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(npc.tint || 0x38bdf8)
            .setScale(0.5)
            .setAlpha(0.55);
          this.tweens.add({
            targets: shock,
            scaleX: 2.0 * vfxMul,
            scaleY: 2.0 * vfxMul,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => { if (shock.active) this.releaseSharedVfx(shock); }
          });
        }

        if (this.enemies) {
          const isCrit = Math.random() < 0.28;
          const finalDmg = isCrit ? Math.floor(calculatedDmg * 1.85) : calculatedDmg;
          this.enemies.forEach(e => {
            if (!e || !e.active || e.isDead) return;
            if (Phaser.Math.Distance.Between(e.x, e.y, tx, ty) <= 240) {
              this.damageEnemy(e, finalDmg, isCrit, {
                type: npc.isPartyMember ? 'party_npc' : 'wild_npc',
                name: npc.name,
                title: npc.isPartyMember ? (npc.title || 'Hiệp Khách') : (npc.titlePrefix || `${npc.stageLabel} ${npc.elemTitle}`),
                ref: npc
              });
              this.spawnVfx(e.x, e.y - 15, 0, 0.9 * vfxMul, { owner: 'fellow', duration: 240 });
            }
          });
        }
      }
    });
  },

  findNearestEnemyForNpc(x, y, maxDist = 550) {
    if (!this.enemies || this.enemies.length === 0) return null;
    let nearest = null;
    let minDistSq = maxDist * maxDist;

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e || !e.active || e.isDead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq) {
        minDistSq = distSq;
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
    } else if (npc.hp <= npc.maxHp * 0.35 && !npc.isRetreating) {
      // Khi máu xuống dưới 35% -> Kích hoạt cơ chế tạm lui trị thương hồi phục
      npc.isRetreating = true;
      npc.targetEnemy = null;
      npc.nextHealTick = this.time.now + 300;
      this.showFloatingText(npc.sprite.x, npc.sprite.y - 45, `${npc.name}: Tạm Lui Hồi Phục!`, '#86efac', '10px');
      this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.45, { owner: 'fellow', tint: 0x34d399, duration: 250 });
    }
  },

  killFellowNpc(npc) {
    if (!npc || npc.isDead) return;
    npc.isDead = true;
    npc.isRetreating = false;
    npc.targetEnemy = null;
    npc.respawnTime = this.time.now + 6000;

    npc.sprite.setVelocity(0, 0);
    npc.sprite.setTint(0x666666).setAlpha(0.35);
    if (npc.hpBar) npc.hpBar.setVisible(false);
    if (npc.hpBg) npc.hpBg.setVisible(false);
    if (npc.flyingSword) npc.flyingSword.setVisible(false);

    this.showFloatingText(npc.sprite.x, npc.sprite.y - 45, `[${npc.name}] Bại Trận!`, '#fca5a5', '11px');
    this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.5, { owner: 'fellow', tint: 0x94a3b8, duration: 250 });
  },

  respawnFellowNpc(npc) {
    if (!npc || !npc.sprite) return;
    npc.isDead = false;
    npc.isRetreating = false;
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
    npc.titlePrefix = '';
    npc.tint = cfg.tint;
    npc.maxHp = cfg.maxHp;
    npc.hp = cfg.maxHp;
    npc.dmg = cfg.dmg;
    npc.def = cfg.def;
    npc.attackRange = cfg.attackRange || 240;
    npc.atkInterval = cfg.atkInterval || 2000;

    npc.nameTag.setText(npc.name);
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
    this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.6, { owner: 'fellow', tint: cfg.tint || 0x38bdf8, duration: 300 });
    this.showFloatingText(npc.sprite.x, npc.sprite.y - 50, `[${npc.name}] Tái Sinh!`, cfg.titleColor || '#67e8f9', '11px');
  }
};
