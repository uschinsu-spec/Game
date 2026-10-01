/** saveSystem.js — Save V8. Item ownership duy nhất: gameState.itemState (schema V3). */
import { gameState, createInitialItemState, ITEM_STATE_SCHEMA_VERSION } from './gameState.js';
import { migrateLegacyRealmIndex } from '../config/realmMigration.js';
import { normalizeMapId } from '../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { createInitialWorldProgress, ensureWorldProgress } from './worldProgress.js';
import { createEmptyFactionGameState } from '../config/factions/game/gameStateBridge.js';
import { serializeGameFactionState, hydrateFactionState } from '../config/factions/game/saveBridge.js';
import { CANONICAL_MAP_KEYS } from '../config/world/masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';

export const SAVE_VERSION = 8;
export const SAVE_PREFIX = 'LSPK_';

export function migrateLegacySaveMapIds(data) {
  if (!data) return;
  const rawMapId = data.currentMapId;
  if (rawMapId === 0 || rawMapId === '0') data.currentMapId = CANONICAL_MAP_KEYS.THANH_VAN_THON;
  else if (rawMapId === 1 || rawMapId === '1' || rawMapId === 2 || rawMapId === '2') data.currentMapId = CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI;
  else if (rawMapId != null) data.currentMapId = normalizeMapId(rawMapId);
  else data.currentMapId = CANONICAL_MAP_KEYS.THANH_VAN_THON;

  if (data.worldProgress) {
    const normalize = id => {
      if (id === 0 || id === '0') return CANONICAL_MAP_KEYS.THANH_VAN_THON;
      if (id === 1 || id === '1' || id === 2 || id === '2') return CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI;
      return normalizeMapId(id);
    };
    if (Array.isArray(data.worldProgress.visitedMapIds)) data.worldProgress.visitedMapIds = data.worldProgress.visitedMapIds.map(normalize);
    if (Array.isArray(data.worldProgress.unlockedWaypointMapIds)) data.worldProgress.unlockedWaypointMapIds = data.worldProgress.unlockedWaypointMapIds.map(normalize);
  }
}

export const DEFAULT_INITIAL_STATE = {
  realmIdx:0, exp:0, spiritualSense:10, spiritualSenseBonus:0, manaMax:100, mana:100,
  aptitude:'Ngũ Hành Linh Căn', gold:0,
  currencies:{silver:0,low:0,mid:0,high:0,extreme:0},
  itemState:createInitialItemState(),
  activeCongPhapId:null, learnedCongPhapIds:[], congPhapMastery:{}, isMeditating:false, isResting:false,
  claimedStarterGift:false, party:{isFormed:false}, factionState:createEmptyFactionGameState(),
  currentMapId:CANONICAL_MAP_KEYS.THANH_VAN_THON,
  worldProgress:createInitialWorldProgress(CANONICAL_MAP_KEYS.THANH_VAN_THON),
  equippedSkillIds:['basic_attack','kiem_1'], skillMastery:{}, autoFight:true, autoMode:'farm', gardenTimer:0,
  afkStats:{kills:0,exp:0,gold:0,startTime:Date.now()},
  afkSettings:{autoSkill:true,autoFly:true,autoBreakthrough:true,autoSurvivalDash:true},
  __realmSchemaV3:true
};

function deep(v) { return JSON.parse(JSON.stringify(v)); }
function validItemState(data) {
  return !!data && data.schemaVersion === ITEM_STATE_SCHEMA_VERSION && data.stacks && typeof data.stacks === 'object' && data.instances && typeof data.instances === 'object';
}
function utf8ToBase64(str) {
  try { return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,(_,p)=>String.fromCharCode('0x'+p))); }
  catch { return btoa(unescape(encodeURIComponent(str))); }
}
function base64ToUtf8(str) {
  try { return decodeURIComponent(Array.prototype.map.call(atob(str),c=>'%' + ('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')); }
  catch { return decodeURIComponent(escape(atob(str))); }
}

export function exportSaveCode() {
  gameState.currentMapId = normalizeMapId(gameState.currentMapId);
  ensureWorldProgress(gameState);
  if (!validItemState(gameState.itemState)) gameState.itemState = createInitialItemState();

  const data = {
    version:SAVE_VERSION, timestamp:Date.now(),
    realmIdx:gameState.realmIdx??0, exp:gameState.exp??0,
    spiritualSense:gameState.spiritualSense??10, spiritualSenseBonus:gameState.spiritualSenseBonus??0,
    manaMax:gameState.manaMax??100, mana:gameState.mana??100, aptitude:gameState.aptitude||'Ngũ Hành Linh Căn',
    gold:gameState.gold??0, currencies:deep(gameState.currencies||{silver:0,low:0,mid:0,high:0,extreme:0}),
    itemState:deep(gameState.itemState),
    activeCongPhapId:gameState.activeCongPhapId||null, learnedCongPhapIds:[...(gameState.learnedCongPhapIds||[])],
    congPhapMastery:deep(gameState.congPhapMastery||{}), isMeditating:!!gameState.isMeditating,
    claimedStarterGift:!!gameState.claimedStarterGift, party:deep(gameState.party||{isFormed:false}),
    factionState:serializeGameFactionState(gameState),
    currentMapId:gameState.currentMapId, worldProgress:deep(gameState.worldProgress||createInitialWorldProgress(gameState.currentMapId)),
    equippedSkillIds:[...(gameState.equippedSkillIds||[])], skillMastery:deep(gameState.skillMastery||{}),
    autoFight:!!gameState.autoFight, autoMode:gameState.autoMode||'farm',
    afkStats:deep(gameState.afkStats||{kills:0,exp:0,gold:0,startTime:Date.now()}),
    afkSettings:deep(gameState.afkSettings||{autoSkill:true,autoFly:true,autoBreakthrough:true,autoSurvivalDash:true})
  };
  const code=`${SAVE_PREFIX}${utf8ToBase64(JSON.stringify(data))}`;
  try { localStorage.setItem('LINH_SON_SAVE_CODE',code); localStorage.setItem('LINH_SON_LAST_SAVE_TIME',String(Date.now())); } catch(e){ console.warn('Không thể ghi localStorage:',e); }
  return code;
}

export function importSaveCode(codeString) {
  if(!codeString||typeof codeString!=='string') return {success:false,error:'Mã lưu không hợp lệ'};
  let clean=codeString.trim(); if(clean.startsWith(SAVE_PREFIX)) clean=clean.slice(SAVE_PREFIX.length);
  try {
    const data=JSON.parse(base64ToUtf8(clean));
    if(data.realmIdx===undefined && data.exp===undefined) return {success:false,error:'Mã lưu không chứa dữ liệu nhân vật hợp lệ'};
    migrateLegacySaveMapIds(data);
    gameState.realmIdx=migrateLegacyRealmIndex(data.realmIdx,data.version); gameState.__realmSchemaV3=true;
    gameState.exp=data.exp??0; gameState.spiritualSense=data.spiritualSense??10; gameState.spiritualSenseBonus=Math.max(0,Number(data.spiritualSenseBonus)||0);
    gameState.manaMax=data.manaMax??100; gameState.mana=data.mana??100; gameState.aptitude=data.aptitude||'Ngũ Hành Linh Căn';
    gameState.gold=data.gold??0; gameState.currencies=data.currencies||{silver:0,low:data.gold??0,mid:0,high:0,extreme:0};
    for(const k of ['silver','low','mid','high','extreme']) if(gameState.currencies[k]===undefined) gameState.currencies[k]=0;
    gameState.itemState=validItemState(data.itemState)?deep(data.itemState):createInitialItemState();
    gameState.activeCongPhapId=data.activeCongPhapId||null; gameState.learnedCongPhapIds=data.learnedCongPhapIds||[]; gameState.congPhapMastery=data.congPhapMastery||{};
    for(const cpId of gameState.learnedCongPhapIds) if(!gameState.congPhapMastery[cpId]) gameState.congPhapMastery[cpId]={tierIdx:0,uses:0};
    gameState.claimedStarterGift=!!data.claimedStarterGift; gameState.isMeditating=false; gameState.isResting=false;
    gameState.party=data.party||{isFormed:false}; hydrateFactionState(gameState,data.factionState);
    gameState.currentMapId=normalizeMapId(data.currentMapId); gameState.worldProgress=data.worldProgress||createInitialWorldProgress(gameState.currentMapId); ensureWorldProgress(gameState);
    gameState.equippedSkillIds=(data.equippedSkillIds?.length?data.equippedSkillIds:['basic_attack','kiem_1']); gameState.skillMastery=data.skillMastery||{};
    gameState.autoFight=data.autoFight!==undefined?!!data.autoFight:true; gameState.autoMode=data.autoMode||'farm';
    gameState.afkStats=data.afkStats||{kills:0,exp:0,gold:0,startTime:Date.now()};
    gameState.afkSettings=data.afkSettings||{autoSkill:true,autoFly:true,autoBreakthrough:true,autoSurvivalDash:true};
    try { const upgraded=exportSaveCode(); localStorage.setItem('LINH_SON_SAVE_CODE',upgraded); } catch {}
    return {success:true,data:{...data,version:SAVE_VERSION,itemState:gameState.itemState,realmIdx:gameState.realmIdx,currentMapId:gameState.currentMapId,worldProgress:gameState.worldProgress}};
  } catch(err) { console.error('Lỗi giải mã Save Code:',err); return {success:false,error:'Mã lưu bị lỗi hoặc không thể giải mã: '+err.message}; }
}

export function resetToNewGame() {
  const def=deep(DEFAULT_INITIAL_STATE); def.itemState=createInitialItemState(); def.worldProgress=createInitialWorldProgress(CANONICAL_MAP_KEYS.THANH_VAN_THON);
  Object.assign(gameState,def); hydrateFactionState(gameState, null); gameState.currentMapId=CANONICAL_MAP_KEYS.THANH_VAN_THON; ensureWorldProgress(gameState);
  try { localStorage.removeItem('LINH_SON_SAVE_CODE'); localStorage.removeItem('LINH_SON_LAST_SAVE_TIME'); } catch {}
}
export function hasLocalSave(){try{const code=localStorage.getItem('LINH_SON_SAVE_CODE');return !!(code&&code.length>10);}catch{return false;}}
export function saveToLocalStorage(){try{return{success:true,code:exportSaveCode()};}catch(e){return{success:false,error:e.message};}}
export function loadFromLocalStorage(){try{const code=localStorage.getItem('LINH_SON_SAVE_CODE');if(code)return importSaveCode(code);}catch{}return{success:false,error:'Không tìm thấy dữ liệu lưu cục bộ'};}
