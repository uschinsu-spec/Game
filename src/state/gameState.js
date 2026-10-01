// QUẢN LÝ TOÀN BỘ TRẠNG THÁI NGƯỜI CHƠI & DỮ LIỆU TU TIÊN
import { createInitialWorldProgress } from './worldProgress.js';
import { createEmptyFactionGameState } from '../config/factions/game/gameStateBridge.js';
import { CANONICAL_MAP_KEYS } from '../config/world/masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';

export const ITEM_STATE_SCHEMA_VERSION = 3;
export const ITEM_EQUIPMENT_SLOTS = Object.freeze(['weapon','armor','helm','boots','amulet','shield','ring','cloak']);

export function createInitialItemState() {
  return {
    schemaVersion: ITEM_STATE_SCHEMA_VERSION,
    stacks: {},          // stackable item: itemId -> quantity
    instances: {},       // unique gear: uid -> instance
    equipped: Object.fromEntries(ITEM_EQUIPMENT_SLOTS.map(slot => [slot, null])),
    quickSlots: [null, null, null, null],
    discovered: {},      // itemId -> true
    cooldowns: {},       // cooldownGroup -> timestamp
    activeFormation: null,
    temporaryBuffs: [],
    counters: { uid: 0 }
  };
}

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

  // Tiền tệ. Toàn bộ vật phẩm/tài nguyên nằm DUY NHẤT trong itemState.
  gold: 0,
  currencies: { silver: 0, low: 0, mid: 0, high: 0, extreme: 0 },
  itemState: createInitialItemState(),

  // Công pháp / tu luyện
  activeCongPhapId: null,
  learnedCongPhapIds: [],
  congPhapMastery: {},
  isMeditating: false,
  isResting: false,
  claimedStarterGift: false,

  party: { isFormed: false },

  // Hệ thế lực V5
  factionState: createEmptyFactionGameState(),

  currentMapId: CANONICAL_MAP_KEYS.THANH_VAN_THON,
  worldProgress: createInitialWorldProgress(CANONICAL_MAP_KEYS.THANH_VAN_THON),

  equippedSkillIds: ['basic_attack'],
  skillMastery: {},
  autoFight: true,
  autoMode: 'farm',
  gardenTimer: 0,

  afkStats: {
    kills: 0,
    exp: 0,
    gold: 0,
    startTime: Date.now()
  },
  afkSettings: {
    autoSkill: true,
    autoFly: true,
    autoBreakthrough: true
  }
};
