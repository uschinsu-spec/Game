/**
 * saveSystem.js
 * Quản lý Hệ thống Lưu & Tải Tiến Trình Tu Tiên (Save / Load Game via Code & LocalStorage)
 */
import { gameState } from './gameState.js';
import { migrateLegacyRealmIndex } from '../config/realmMigration.js';
import { createInitialWorldProgress, ensureWorldProgress } from './worldProgress.js';

export const SAVE_VERSION = 4;
export const SAVE_PREFIX = 'LSPK_';

const EMPTY_EQUIPPED = Object.freeze({
  weapon: null, armor: null, helm: null, boots: null, amulet: null, shield: null, ring: null, cloak: null
});

export const DEFAULT_INITIAL_STATE = {
  realmIdx: 0,
  exp: 0,
  spiritualSense: 10,
  spiritualSenseBonus: 0,
  manaMax: 100,
  mana: 100,
  aptitude: 'Ngũ Hành Linh Căn',
  gold: 0,
  currencies: { silver: 0, low: 0, mid: 0, high: 0, extreme: 0 },
  herbs: {},
  ores: 0,
  materials: { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 },
  activeCongPhapId: null,
  learnedCongPhapIds: [],
  congPhapMastery: {},
  isMeditating: false,
  isResting: false,
  activePillBuff: null,
  claimedStarterGift: false,
  party: { isFormed: false },
  sectId: null,
  sectRankIdx: 0,
  sectContrib: 0,
  lastSalaryClaim: 0,
  equipped: { ...EMPTY_EQUIPPED },
  inventory: { items: [], pills: {}, talismans: {}, formations: [] },
  currentMapId: 0,
  worldProgress: createInitialWorldProgress(0),
  gearPlus: 0,
  equippedSkillIds: [],
  skillMastery: {},
  autoFight: true,
  autoMode: 'farm',
  gardenTimer: 0,
  afkStats: { kills: 0, exp: 0, gold: 0, ores: 0, pelts: 0, startTime: Date.now() },
  afkSettings: { autoSkill: true, autoFly: true, autoBreakthrough: true, autoSurvivalDash: true },
  __realmSchemaV3: true
};

function utf8ToBase64(str) {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
  } catch (e) {
    return btoa(unescape(encodeURIComponent(str)));
  }
}

function base64ToUtf8(str) {
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(str), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  } catch (e) {
    return decodeURIComponent(escape(atob(str)));
  }
}

export function exportSaveCode() {
  ensureWorldProgress(gameState);
  const data = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    realmIdx: gameState.realmIdx ?? 0,
    exp: gameState.exp ?? 0,
    spiritualSense: gameState.spiritualSense ?? 10,
    spiritualSenseBonus: gameState.spiritualSenseBonus ?? 0,
    manaMax: gameState.manaMax ?? 100,
    mana: gameState.mana ?? 100,
    aptitude: gameState.aptitude || 'Ngũ Hành Linh Căn',
    gold: gameState.gold ?? 0,
    currencies: JSON.parse(JSON.stringify(gameState.currencies || { silver: 0, low: gameState.gold || 0, mid: 0, high: 0, extreme: 0 })),
    herbs: typeof gameState.herbs === 'object' && gameState.herbs !== null ? JSON.parse(JSON.stringify(gameState.herbs)) : { 'Ngưng Khí Thảo': Number(gameState.herbs) || 0 },
    ores: gameState.ores ?? 0,
    materials: JSON.parse(JSON.stringify(gameState.materials || { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 })),
    activeCongPhapId: gameState.activeCongPhapId || null,
    learnedCongPhapIds: [...(gameState.learnedCongPhapIds || [])],
    congPhapMastery: JSON.parse(JSON.stringify(gameState.congPhapMastery || {})),
    isMeditating: !!gameState.isMeditating,
    activePillBuff: gameState.activePillBuff ? JSON.parse(JSON.stringify(gameState.activePillBuff)) : null,
    claimedStarterGift: !!gameState.claimedStarterGift,
    party: JSON.parse(JSON.stringify(gameState.party || { isFormed: false })),
    sectId: gameState.sectId || null,
    sectRankIdx: gameState.sectRankIdx ?? 0,
    sectContrib: gameState.sectContrib ?? 0,
    lastSalaryClaim: gameState.lastSalaryClaim ?? 0,
    equipped: JSON.parse(JSON.stringify(gameState.equipped || EMPTY_EQUIPPED)),
    inventory: JSON.parse(JSON.stringify(gameState.inventory || { items: [], pills: {}, talismans: {}, formations: [] })),
    currentMapId: gameState.currentMapId ?? 0,
    worldProgress: JSON.parse(JSON.stringify(gameState.worldProgress || createInitialWorldProgress(gameState.currentMapId ?? 0))),
    gearPlus: gameState.gearPlus ?? 0,
    equippedSkillIds: [...(gameState.equippedSkillIds || [])],
    skillMastery: JSON.parse(JSON.stringify(gameState.skillMastery || {})),
    autoFight: !!gameState.autoFight,
    autoMode: gameState.autoMode || 'farm',
    afkStats: JSON.parse(JSON.stringify(gameState.afkStats || { kills: 0, exp: 0, gold: 0, ores: 0, pelts: 0 })),
    afkSettings: JSON.parse(JSON.stringify(gameState.afkSettings || { autoSkill: true, autoFly: true, autoBreakthrough: true, autoSurvivalDash: true }))
  };

  const fullCode = `${SAVE_PREFIX}${utf8ToBase64(JSON.stringify(data))}`;
  try {
    localStorage.setItem('LINH_SON_SAVE_CODE', fullCode);
    localStorage.setItem('LINH_SON_LAST_SAVE_TIME', String(Date.now()));
  } catch (e) {
    console.warn('Không thể ghi vào localStorage:', e);
  }
  return fullCode;
}

export function importSaveCode(codeString) {
  if (!codeString || typeof codeString !== 'string') return { success: false, error: 'Mã lưu không hợp lệ (trống hoặc sai định dạng)' };
  let cleanCode = codeString.trim();
  if (cleanCode.startsWith(SAVE_PREFIX)) cleanCode = cleanCode.slice(SAVE_PREFIX.length);

  try {
    const data = JSON.parse(base64ToUtf8(cleanCode));
    if (data.realmIdx === undefined && data.exp === undefined && !data.inventory) return { success: false, error: 'Mã lưu không chứa dữ liệu nhân vật hợp lệ' };

    gameState.realmIdx = migrateLegacyRealmIndex(data.realmIdx, data.version);
    gameState.__realmSchemaV3 = true;
    gameState.exp = data.exp ?? 0;
    gameState.spiritualSense = data.spiritualSense ?? 10;
    gameState.spiritualSenseBonus = Math.max(0, Number(data.spiritualSenseBonus) || 0);
    gameState.manaMax = data.manaMax ?? 100;
    gameState.mana = data.mana ?? 100;
    gameState.aptitude = data.aptitude || 'Ngũ Hành Linh Căn';
    gameState.gold = data.gold ?? 0;
    gameState.currencies = data.currencies || { silver: 0, low: data.gold ?? 0, mid: 0, high: 0, extreme: 0 };
    if (gameState.currencies.silver === undefined) gameState.currencies.silver = 0;
    if (gameState.currencies.low === undefined) gameState.currencies.low = gameState.gold ?? 0;
    if (typeof data.herbs === 'object' && data.herbs !== null) gameState.herbs = data.herbs;
    else if (typeof data.herbs === 'number') gameState.herbs = { 'Ngưng Khí Thảo': data.herbs };
    else gameState.herbs = {};
    gameState.ores = data.ores ?? 0;
    gameState.materials = data.materials || { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 };
    if (gameState.materials.beastHorns === undefined) gameState.materials.beastHorns = 0;
    gameState.activeCongPhapId = data.activeCongPhapId || null;
    gameState.learnedCongPhapIds = data.learnedCongPhapIds || [];
    gameState.congPhapMastery = data.congPhapMastery || {};
    (gameState.learnedCongPhapIds || []).forEach(cpId => {
      if (!gameState.congPhapMastery[cpId]) gameState.congPhapMastery[cpId] = { tierIdx: 0, uses: 0 };
    });
    gameState.activePillBuff = data.activePillBuff || null;
    gameState.claimedStarterGift = !!data.claimedStarterGift;
    gameState.isMeditating = false;
    gameState.isResting = false;
    gameState.party = data.party || { isFormed: false };
    gameState.sectId = data.sectId || null;
    gameState.sectRankIdx = data.sectRankIdx ?? 0;
    gameState.sectContrib = data.sectContrib ?? 0;
    gameState.lastSalaryClaim = data.lastSalaryClaim ?? 0;
    gameState.equipped = { ...EMPTY_EQUIPPED, ...(data.equipped || {}) };
    gameState.inventory = data.inventory || { items: [], pills: {}, talismans: {}, formations: [] };
    gameState.currentMapId = data.currentMapId ?? 0;
    gameState.worldProgress = data.worldProgress || createInitialWorldProgress(gameState.currentMapId);
    ensureWorldProgress(gameState);
    gameState.gearPlus = data.gearPlus ?? 0;
    gameState.equippedSkillIds = (data.equippedSkillIds && data.equippedSkillIds.length > 0) ? data.equippedSkillIds : ['basic_attack', 'kiem_1'];
    gameState.skillMastery = data.skillMastery || {};
    gameState.autoFight = data.autoFight !== undefined ? !!data.autoFight : true;
    gameState.autoMode = data.autoMode || 'farm';
    gameState.afkStats = data.afkStats || { kills: 0, exp: 0, gold: 0, ores: 0, pelts: 0, startTime: Date.now() };
    gameState.afkSettings = data.afkSettings || { autoSkill: true, autoFly: true, autoBreakthrough: true, autoSurvivalDash: true };

    try {
      const migratedCode = exportSaveCode();
      localStorage.setItem('LINH_SON_SAVE_CODE', migratedCode);
      localStorage.setItem('LINH_SON_LAST_SAVE_TIME', String(Date.now()));
    } catch (e) {}
    return { success: true, data: { ...data, version: SAVE_VERSION, realmIdx: gameState.realmIdx, worldProgress: gameState.worldProgress } };
  } catch (err) {
    console.error('Lỗi khi giải mã Save Code:', err);
    return { success: false, error: 'Mã lưu bị lỗi hoặc không thể giải mã: ' + err.message };
  }
}

export function resetToNewGame() {
  const def = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
  def.worldProgress = createInitialWorldProgress(0);
  Object.assign(gameState, def);
  try {
    localStorage.removeItem('LINH_SON_SAVE_CODE');
    localStorage.removeItem('LINH_SON_LAST_SAVE_TIME');
  } catch (e) {}
}

export function hasLocalSave() {
  try {
    const code = localStorage.getItem('LINH_SON_SAVE_CODE');
    return !!(code && code.length > 10);
  } catch (e) { return false; }
}

export function saveToLocalStorage() {
  try { return { success: true, code: exportSaveCode() }; }
  catch (e) { return { success: false, error: e.message }; }
}

export function loadFromLocalStorage() {
  try {
    const code = localStorage.getItem('LINH_SON_SAVE_CODE');
    if (code) return importSaveCode(code);
  } catch (e) {}
  return { success: false, error: 'Không tìm thấy dữ liệu lưu cục bộ' };
}
