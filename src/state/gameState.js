// QUẢN LÝ TOÀN BỘ TRẠNG THÁI NGƯỜI CHƠI & DỮ LIỆU TU TIÊN
import { createInitialWorldProgress } from './worldProgress.js';

export const gameState = {
  // Cảnh giới & Tu vi
  realmIdx: 0,
  exp: 0,
  __realmSchemaV3: true,

  // Thuộc tính Tu Tiên
  spiritualSense: 10,
  spiritualSenseBonus: 0,
  manaMax: 100,
  mana: 100,
  aptitude: 'Ngũ Hành Linh Căn',

  // Tài nguyên & Tiền tệ
  gold: 0,
  currencies: { silver: 0, low: 0, mid: 0, high: 0, extreme: 0 },
  herbs: {},
  ores: 0,
  materials: { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 },

  // Công pháp / tu luyện
  activeCongPhapId: null,
  learnedCongPhapIds: [],
  congPhapMastery: {},
  isMeditating: false,
  isResting: false,
  activePillBuff: null,
  claimedStarterGift: false,

  party: { isFormed: false },

  // Tông môn
  sectId: null,
  sectRankIdx: 0,
  sectContrib: 0,
  lastSalaryClaim: 0,

  // Trang bị
  equipped: {
    weapon: null,
    armor: null,
    helm: null,
    boots: null,
    amulet: null,
    shield: null,
    ring: null,
    cloak: null
  },

  inventory: {
    items: [],
    pills: {},
    talismans: {},
    formations: []
  },

  currentMapId: 0,
  // Chỉ lưu tiến độ khám phá quan trọng; không lưu state của hàng triệu địa danh.
  worldProgress: createInitialWorldProgress(0),

  gearPlus: 0,
  equippedSkillIds: ['basic_attack', 'kiem_1'],
  skillMastery: {},
  autoFight: true,
  autoMode: 'farm',
  gardenTimer: 0,

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
