/**
 * saveSystem.js
 * Quản lý Hệ thống Lưu & Tải Tiến Trình Tu Tiên (Save / Load Game via Code & LocalStorage)
 */
import { gameState } from './gameState.js';

export const SAVE_VERSION = 2;
export const SAVE_PREFIX = 'LSPK_';

export const DEFAULT_INITIAL_STATE = {
  realmIdx: 0,
  exp: 0,
  spiritualSense: 10,
  manaMax: 500,
  mana: 500,
  aptitude: 'Ngũ Hành Linh Căn',
  gold: 0,
  currencies: {
    silver: 0,
    low: 0,
    mid: 0,
    high: 0,
    extreme: 0
  },
  herbs: {},
  ores: 0,
  materials: {
    beastPelts: 0,
    beastFurs: 0,
    beastClaws: 0,
    beastBlood: 0,
    beastHorns: 0
  },
  activeCongPhapId: null,
  learnedCongPhapIds: [],
  isMeditating: false,
  isResting: false,
  activePillBuff: null,
  claimedStarterGift: false,
  party: {
    isFormed: false
  },
  sectId: null,
  sectRankIdx: 0,
  sectContrib: 0,
  equipped: {
    weapon: null,
    armor: null,
    helm: null,
    boots: null,
    amulet: null,
    shield: null
  },
  inventory: {
    items: [],
    pills: {},
    talismans: {},
    formations: []
  },
  currentMapId: 0,
  gearPlus: 0,
  equippedSkillIds: [],
  skillMastery: {},
  autoFight: true,
  autoMode: 'farm',
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

/**
 * UTF-8 safe Base64 encoding for browser
 */
function utf8ToBase64(str) {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    }));
  } catch (e) {
    return btoa(unescape(encodeURIComponent(str)));
  }
}

/**
 * UTF-8 safe Base64 decoding for browser
 */
function base64ToUtf8(str) {
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return decodeURIComponent(escape(atob(str)));
  }
}

/**
 * Xuất dữ liệu gameState thành chuỗi mã lưu (Save Code)
 */
export function exportSaveCode() {
  const data = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    realmIdx: gameState.realmIdx ?? 0,
    exp: gameState.exp ?? 0,
    spiritualSense: gameState.spiritualSense ?? 10,
    manaMax: gameState.manaMax ?? 500,
    mana: gameState.mana ?? 500,
    aptitude: gameState.aptitude || 'Ngũ Hành Linh Căn',
    gold: gameState.gold ?? 0,
    currencies: JSON.parse(JSON.stringify(gameState.currencies || { silver: 0, low: gameState.gold || 0, mid: 0, high: 0, extreme: 0 })),
    herbs: typeof gameState.herbs === 'object' && gameState.herbs !== null
      ? JSON.parse(JSON.stringify(gameState.herbs))
      : { 'Ngưng Khí Thảo': Number(gameState.herbs) || 0 },
    ores: gameState.ores ?? 0,
    materials: JSON.parse(JSON.stringify(gameState.materials || { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 })),
    activeCongPhapId: gameState.activeCongPhapId || null,
    learnedCongPhapIds: [...(gameState.learnedCongPhapIds || [])],
    isMeditating: !!gameState.isMeditating,
    activePillBuff: gameState.activePillBuff ? JSON.parse(JSON.stringify(gameState.activePillBuff)) : null,
    claimedStarterGift: !!gameState.claimedStarterGift,
    party: JSON.parse(JSON.stringify(gameState.party || { isFormed: false })),
    sectId: gameState.sectId || null,
    sectRankIdx: gameState.sectRankIdx ?? 0,
    sectContrib: gameState.sectContrib ?? 0,
    lastSalaryClaim: gameState.lastSalaryClaim ?? 0,
    equipped: JSON.parse(JSON.stringify(gameState.equipped || { weapon: null, armor: null, helm: null, boots: null, amulet: null, shield: null })),
    inventory: JSON.parse(JSON.stringify(gameState.inventory || { items: [], pills: {}, talismans: {}, formations: [] })),
    currentMapId: gameState.currentMapId ?? 0,
    gearPlus: gameState.gearPlus ?? 0,
    equippedSkillIds: [...(gameState.equippedSkillIds || [])],
    skillMastery: JSON.parse(JSON.stringify(gameState.skillMastery || {})),
    autoFight: !!gameState.autoFight,
    autoMode: gameState.autoMode || 'farm',
    afkStats: JSON.parse(JSON.stringify(gameState.afkStats || { kills: 0, exp: 0, gold: 0, ores: 0, pelts: 0 })),
    afkSettings: JSON.parse(JSON.stringify(gameState.afkSettings || { autoSkill: true, autoFly: true, autoBreakthrough: true, autoSurvivalDash: true }))
  };

  const jsonStr = JSON.stringify(data);
  const encoded = utf8ToBase64(jsonStr);
  const fullCode = `${SAVE_PREFIX}${encoded}`;

  // Tự động lưu bản sao lưu dự phòng vào LocalStorage
  try {
    localStorage.setItem('LINH_SON_SAVE_CODE', fullCode);
    localStorage.setItem('LINH_SON_LAST_SAVE_TIME', String(Date.now()));
  } catch (e) {
    console.warn('Không thể ghi vào localStorage:', e);
  }

  return fullCode;
}

/**
 * Tải và khôi phục dữ liệu từ chuỗi mã lưu (Save Code)
 */
export function importSaveCode(codeString) {
  if (!codeString || typeof codeString !== 'string') {
    return { success: false, error: 'Mã lưu không hợp lệ (trống hoặc sai định dạng)' };
  }

  let cleanCode = codeString.trim();
  if (cleanCode.startsWith(SAVE_PREFIX)) {
    cleanCode = cleanCode.slice(SAVE_PREFIX.length);
  }

  try {
    const jsonStr = base64ToUtf8(cleanCode);
    const data = JSON.parse(jsonStr);

    if (data.realmIdx === undefined && data.exp === undefined && !data.inventory) {
      return { success: false, error: 'Mã lưu không chứa dữ liệu nhân vật hợp lệ' };
    }

    // Áp dụng dữ liệu vào gameState
    gameState.realmIdx = data.realmIdx ?? 0;
    gameState.exp = data.exp ?? 0;
    gameState.spiritualSense = data.spiritualSense ?? 10;
    gameState.manaMax = data.manaMax ?? 500;
    gameState.mana = data.mana ?? 500;
    gameState.aptitude = data.aptitude || 'Ngũ Hành Linh Căn';
    gameState.gold = data.gold ?? 0;
    gameState.currencies = data.currencies || {
      silver: 0,
      low: data.gold ?? 0,
      mid: 0,
      high: 0,
      extreme: 0
    };
    if (gameState.currencies.silver === undefined) gameState.currencies.silver = 0;
    if (gameState.currencies.low === undefined) gameState.currencies.low = gameState.gold ?? 0;

    if (typeof data.herbs === 'object' && data.herbs !== null) {
      gameState.herbs = data.herbs;
    } else if (typeof data.herbs === 'number') {
      gameState.herbs = { 'Ngưng Khí Thảo': data.herbs };
    } else {
      gameState.herbs = {};
    }
    gameState.ores = data.ores ?? 0;
    gameState.materials = data.materials || { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 };
    if (gameState.materials.beastHorns === undefined) gameState.materials.beastHorns = 0;

    gameState.activeCongPhapId = data.activeCongPhapId || null;
    gameState.learnedCongPhapIds = data.learnedCongPhapIds || [];
    gameState.activePillBuff = data.activePillBuff || null;
    gameState.claimedStarterGift = !!data.claimedStarterGift;
    gameState.isMeditating = false;
    
    // Khôi phục tổ đội 5 người
    gameState.party = data.party || { isFormed: false };

    gameState.sectId = data.sectId || null;
    gameState.sectRankIdx = data.sectRankIdx ?? 0;
    gameState.sectContrib = data.sectContrib ?? 0;
    gameState.lastSalaryClaim = data.lastSalaryClaim ?? 0;
    gameState.equipped = data.equipped || { weapon: null, armor: null, helm: null, boots: null, amulet: null, shield: null };
    gameState.inventory = data.inventory || { items: [], pills: {}, talismans: {}, formations: [] };
    gameState.currentMapId = data.currentMapId ?? 0;
    gameState.gearPlus = data.gearPlus ?? 0;
    gameState.equippedSkillIds = data.equippedSkillIds || [];
    gameState.skillMastery = data.skillMastery || {};
    gameState.autoFight = data.autoFight !== undefined ? !!data.autoFight : true;
    gameState.autoMode = data.autoMode || 'farm';
    gameState.afkStats = data.afkStats || { kills: 0, exp: 0, gold: 0, ores: 0, pelts: 0, startTime: Date.now() };
    gameState.afkSettings = data.afkSettings || { autoSkill: true, autoFly: true, autoBreakthrough: true, autoSurvivalDash: true };

    // Lưu lại mã vào LocalStorage
    try {
      localStorage.setItem('LINH_SON_SAVE_CODE', codeString.trim());
      localStorage.setItem('LINH_SON_LAST_SAVE_TIME', String(Date.now()));
    } catch (e) {}

    return { success: true, data };
  } catch (err) {
    console.error('Lỗi khi giải mã Save Code:', err);
    return { success: false, error: 'Mã lưu bị lỗi hoặc không thể giải mã: ' + err.message };
  }
}

/**
 * Đặt lại trạng thái về ban đầu (Tạo nhân vật mới)
 */
export function resetToNewGame() {
  const def = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
  Object.assign(gameState, def);
  try {
    localStorage.removeItem('LINH_SON_SAVE_CODE');
    localStorage.removeItem('LINH_SON_LAST_SAVE_TIME');
  } catch (e) {}
}

/**
 * Kiểm tra xem có bản lưu nào trong LocalStorage không
 */
export function hasLocalSave() {
  try {
    const code = localStorage.getItem('LINH_SON_SAVE_CODE');
    return !!(code && code.length > 10);
  } catch (e) {
    return false;
  }
}

/**
 * Lưu trực tiếp vào LocalStorage
 */
export function saveToLocalStorage() {
  try {
    const code = exportSaveCode();
    return { success: true, code };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Tải bản lưu từ LocalStorage nếu có
 */
export function loadFromLocalStorage() {
  try {
    const code = localStorage.getItem('LINH_SON_SAVE_CODE');
    if (code) {
      return importSaveCode(code);
    }
  } catch (e) {}
  return { success: false, error: 'Không tìm thấy dữ liệu lưu cục bộ' };
}
