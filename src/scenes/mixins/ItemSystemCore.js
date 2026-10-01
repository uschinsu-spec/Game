/** ItemSystem.js — Item Runtime V3 duy nhất của GAME. */
import { gameState, createInitialItemState, ITEM_STATE_SCHEMA_VERSION, ITEM_EQUIPMENT_SLOTS } from '../../state/gameState.js';
import {
  ALL_ITEM_DEFS, ALL_ITEM_RECIPES, ITEM_CATALOG_STATS,
  getItemDef, getItemByName, getRecipe, listItems, listRecipes,
  getRealmItemRank, getRankMeta, getItemIconMeta, getItemIconAsset, rollEnemyLoot,
  assertItemCatalogIntegrity
} from '../../config/itemCatalog.js?v=20261001-item-icons-v4';

const OWNER = 'ItemSystemV3';
const GEAR_ENHANCE_MAX = 15;
const GEAR_REFINE_MAX = 10;
const AFFIX_POOL = Object.freeze([
  'dmgPct','hpPct','defPct','critRate','critDamage','armorPen','attackSpeed','dodge','lifeSteal','elementDamage','damageReduction'
]);

function now() { return Date.now(); }
function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function clamp(n,min,max) { return Math.max(min,Math.min(max,Number(n)||0)); }
function numberMapAdd(target, source, mult=1) {
  Object.entries(source || {}).forEach(([k,v]) => { target[k] = +(Number(target[k]||0) + Number(v||0)*mult).toFixed(4); });
  return target;
}

export function ensureItemState() {
  const s = gameState.itemState;
  if (!s || s.schemaVersion !== ITEM_STATE_SCHEMA_VERSION || typeof s.stacks !== 'object' || typeof s.instances !== 'object') {
    gameState.itemState = createInitialItemState();
  }
  const st = gameState.itemState;
  st.stacks ||= {};
  st.instances ||= {};
  st.equipped ||= Object.fromEntries(ITEM_EQUIPMENT_SLOTS.map(k=>[k,null]));
  ITEM_EQUIPMENT_SLOTS.forEach(k => { if (!(k in st.equipped)) st.equipped[k] = null; });
  if (!Array.isArray(st.quickSlots)) st.quickSlots = [null,null,null,null];
  while (st.quickSlots.length < 4) st.quickSlots.push(null);
  st.quickSlots = st.quickSlots.slice(0,4);
  st.discovered ||= {};
  st.cooldowns ||= {};
  st.temporaryBuffs ||= [];
  st.counters ||= { uid:0 };
  return st;
}

function nextUid(defId='gear') {
  const st = ensureItemState();
  st.counters.uid = Math.max(0, Number(st.counters.uid)||0) + 1;
  return `itm_${defId}_${Date.now().toString(36)}_${st.counters.uid.toString(36)}`;
}

function rollAffixes(def, count=def?.affixCount || 0, rng=Math.random) {
  const pool = AFFIX_POOL.slice();
  const out = [];
  const rank = Number(def?.rank)||0;
  for (let i=0; i<count && pool.length; i++) {
    const idx = Math.floor(rng()*pool.length);
    const stat = pool.splice(idx,1)[0];
    const pctStat = !['spiritualSense'].includes(stat);
    const base = pctStat ? 1.5 + rank*0.8 : 2 + rank*2;
    const value = +(base*(0.8+rng()*0.6)).toFixed(2);
    out.push({stat,value});
  }
  return out;
}

export function createGearInstance(defId, options={}) {
  const def = getItemDef(defId);
  if (!def || def.kind !== 'gear') throw new Error(`[ItemSystemV3] Không phải gear: ${defId}`);
  return {
    uid: nextUid(defId), defId,
    enhance: clamp(options.enhance,0,GEAR_ENHANCE_MAX),
    refine: clamp(options.refine,0,GEAR_REFINE_MAX),
    durability: clamp(options.durability ?? def.durabilityMax,0,def.durabilityMax || 100),
    affixes: Array.isArray(options.affixes) ? clone(options.affixes) : rollAffixes(def),
    sockets: Array.from({length:Math.max(0,Number(def.socketCount)||0)},(_,i)=>options.sockets?.[i] || null),
    locked: !!options.locked,
    favorite: !!options.favorite,
    bound: !!options.bound,
    acquiredAt: Number(options.acquiredAt)||now()
  };
}

export function getItemQuantity(itemId) {
  const def = getItemDef(itemId);
  if (!def) return 0;
  const st = ensureItemState();
  if (def.kind === 'gear') return Object.values(st.instances).filter(x=>x?.defId===itemId).length;
  return Math.max(0, Math.floor(Number(st.stacks[itemId])||0));
}

export function addItem(itemId, qty=1, options={}) {
  const def = getItemDef(itemId);
  if (!def) return {success:false,error:`Item không tồn tại: ${itemId}`};
  qty = Math.max(1,Math.floor(Number(qty)||1));
  const st = ensureItemState();
  st.discovered[itemId] = true;
  if (def.kind === 'gear') {
    const uids=[];
    for (let i=0;i<qty;i++) { const inst=createGearInstance(itemId,options); st.instances[inst.uid]=inst; uids.push(inst.uid); }
    return {success:true,item:def,qty,uids};
  }
  st.stacks[itemId] = Math.min(Number(def.maxStack)||999999, getItemQuantity(itemId)+qty);
  return {success:true,item:def,qty,newQty:st.stacks[itemId]};
}

export function removeItem(itemId, qty=1) {
  const def = getItemDef(itemId);
  if (!def) return {success:false,error:'Item không tồn tại'};
  qty = Math.max(1,Math.floor(Number(qty)||1));
  const st=ensureItemState();
  if (def.kind === 'gear') {
    const candidates=Object.values(st.instances).filter(x=>x?.defId===itemId && !x.locked && !Object.values(st.equipped).includes(x.uid));
    if (candidates.length<qty) return {success:false,error:'Không đủ trang bị khả dụng'};
    candidates.slice(0,qty).forEach(x=>delete st.instances[x.uid]);
    return {success:true,qty};
  }
  const owned=getItemQuantity(itemId);
  if (owned<qty) return {success:false,error:`Không đủ ${def.name}`};
  const left=owned-qty;
  if (left>0) st.stacks[itemId]=left; else delete st.stacks[itemId];
  return {success:true,qty,newQty:left};
}

export function hasItems(requirements=[]) { return requirements.every(r=>getItemQuantity(r.itemId)>=Math.max(0,Number(r.qty)||0)); }

export function listOwnedItems(filter={}) {
  const st=ensureItemState(); const out=[];
  Object.entries(st.stacks).forEach(([itemId,qty])=>{
    const def=getItemDef(itemId); if (!def || qty<=0) return;
    if (filter.kind && def.kind!==filter.kind) return; if (filter.category && def.category!==filter.category) return;
    if (filter.rank!=null && Number(def.rank)!==Number(filter.rank)) return;
    out.push({type:'stack',itemId,def,qty:Number(qty)||0});
  });
  Object.values(st.instances).forEach(instance=>{
    const def=getItemDef(instance?.defId); if (!def) return;
    if (filter.kind && def.kind!==filter.kind) return; if (filter.category && def.category!==filter.category) return;
    if (filter.rank!=null && Number(def.rank)!==Number(filter.rank)) return;
    out.push({type:'instance',itemId:def.id,def,qty:1,instance});
  });
  return out;
}

export function getInstance(uid) { return ensureItemState().instances[uid] || null; }
export function getEquippedInstance(slot) { const uid=ensureItemState().equipped?.[slot]; return uid ? getInstance(uid) : null; }

export function equipItem(uid) {
  const st=ensureItemState(); const inst=st.instances[uid]; const def=getItemDef(inst?.defId);
  if (!inst || !def || def.kind!=='gear' || !def.slot) return {success:false,error:'Trang bị không hợp lệ'};
  if ((inst.durability||0)<=0) return {success:false,error:'Trang bị đã hỏng'};
  const previous=st.equipped[def.slot] || null; st.equipped[def.slot]=uid;
  return {success:true,slot:def.slot,uid,previous};
}
export function unequipItem(slot) { const st=ensureItemState(); const uid=st.equipped?.[slot]||null; if (slot in st.equipped) st.equipped[slot]=null; return {success:!!uid,uid,slot}; }

function liveBuffs() {
  const st=ensureItemState(), t=now();
  st.temporaryBuffs=(st.temporaryBuffs||[]).filter(b=>!b.expiresAt || b.expiresAt>t);
  if (st.activeFormation?.expiresAt && st.activeFormation.expiresAt<=t) st.activeFormation=null;
  return st;
}

export function getEquipmentStats() {
  const st=liveBuffs(); const stats={};
  for (const uid of Object.values(st.equipped||{})) {
    const inst=st.instances[uid]; const def=getItemDef(inst?.defId); if (!inst||!def||(inst.durability||0)<=0) continue;
    const enhanceMult=1+(Number(inst.enhance)||0)*0.08;
    const refineMult=1+(Number(inst.refine)||0)*0.035;
    numberMapAdd(stats,def.baseStats,enhanceMult*refineMult);
    (inst.affixes||[]).forEach(a=>{ stats[a.stat]=+(Number(stats[a.stat]||0)+Number(a.value||0)).toFixed(4); });
    (inst.sockets||[]).forEach(coreId=>{ const core=getItemDef(coreId); if(core?.kind==='core') numberMapAdd(stats,core.socketStats); });
  }
  (st.temporaryBuffs||[]).forEach(b=>numberMapAdd(stats,b.stats));
  if (st.activeFormation?.stats) numberMapAdd(stats,st.activeFormation.stats);
  return stats;
}

export function getPowerScore(instanceOrUid) {
  const inst=typeof instanceOrUid==='string'?getInstance(instanceOrUid):instanceOrUid; const def=getItemDef(inst?.defId); if(!inst||!def)return 0;
  let score=Object.values(def.baseStats||{}).reduce((a,v)=>a+Math.abs(Number(v)||0),0);
  score*=1+(inst.enhance||0)*0.08+(inst.refine||0)*0.04;
  score+=(inst.affixes||[]).reduce((a,x)=>a+Math.abs(Number(x.value)||0)*10,0);
  score+=(inst.sockets||[]).filter(Boolean).length*50*(1+(def.rank||0));
  return Math.round(score);
}

export function setQuickSlot(index,itemId) {
  const st=ensureItemState(); index=Math.floor(Number(index)); if(index<0||index>3)return false;
  const def=itemId?getItemDef(itemId):null; if(itemId && (!def || !['pill','talisman','formation'].includes(def.kind))) return false;
  st.quickSlots[index]=itemId||null; return true;
}

export function useQuickSlot(index, scene=null) {
  const st=ensureItemState(); index=Math.floor(Number(index));
  if(index<0||index>3) return {success:false,error:'Quick slot không hợp lệ'};
  const itemId=st.quickSlots[index];
  if(!itemId) return {success:false,error:'Quick slot đang trống'};
  return useItem(itemId, scene);
}

export function damageEquippedDurability(amount=1) {
  const st=ensureItemState(); amount=Math.max(0,Math.floor(Number(amount)||0));
  if(!amount) return {success:true,damaged:0};
  let damaged=0;
  for(const uid of Object.values(st.equipped||{})) {
    const inst=st.instances[uid]; const def=getItemDef(inst?.defId);
    if(!inst||!def) continue;
    inst.durability=Math.max(0,Number(inst.durability||0)-amount);
    damaged++;
  }
  return {success:true,damaged};
}

function applyEffect(def, scene=null) {
  const e=def.effect||{}; const st=ensureItemState();
  if(e.type==='heal') { if(scene && Number.isFinite(scene.playerHpMax)) scene.playerHp=Math.min(scene.playerHpMax,Number(scene.playerHp||0)+Number(e.value||0)); return {type:'heal',value:e.value}; }
  if(e.type==='mana') { gameState.mana=Math.min(Number(gameState.manaMax)||100,Number(gameState.mana||0)+Number(e.value||0)); return {type:'mana',value:e.value}; }
  if(e.type==='cultivation') { const speed=Number(e.speed)||0; const durationSec=Number(e.durationSec)||180; st.temporaryBuffs.push({itemId:def.id,name:def.name,stats:{cultivationSpeed:speed},expiresAt:now()+durationSec*1000}); return {type:'cultivation',speed,durationSec}; }
  if(e.type==='sense') { gameState.spiritualSenseBonus=Math.max(0,Number(gameState.spiritualSenseBonus)||0)+Number(e.value||0); return {type:'sense',value:e.value}; }
  if(e.type==='buff') { st.temporaryBuffs.push({itemId:def.id,stats:clone(e.stats||{}),expiresAt:now()+(Number(e.durationSec)||60)*1000}); return {type:'buff'}; }
  if(e.type==='formation') { st.activeFormation={itemId:def.id,stats:clone(e.stats||{}),radius:Number(e.radius)||600,expiresAt:now()+(Number(e.durationSec)||180)*1000}; return {type:'formation'}; }
  if(e.type==='combat_damage') {
    const target=scene?.findNearestEnemy?.() || scene?.enemies?.find?.(x=>x?.active && !x.dead);
    if(target && typeof scene?.damageEnemy==='function') scene.damageEnemy(target,Number(e.power)||0,null);
    else if(target && typeof target.hp==='number') target.hp-=Number(e.power)||0;
    return {type:'combat_damage',value:e.power};
  }
  if(e.type==='teleport_home') {
    if (typeof scene?.returnToVillage === 'function') scene.returnToVillage();
    else if (typeof scene?.goHome === 'function') scene.goHome();
    return {type:'teleport_home'};
  }
  if(e.type==='breakthrough') return {type:'breakthrough'};
  return {type:e.type||'none'};
}

export function useItem(itemId, scene=null) {
  const def=getItemDef(itemId); if(!def || !['pill','talisman','formation'].includes(def.kind)) return {success:false,error:'Item không thể sử dụng'};
  if(getItemQuantity(itemId)<1) return {success:false,error:`Không có ${def.name}`};
  const st=ensureItemState(); const group=def.cooldownGroup; const t=now();
  if(group && Number(st.cooldowns[group]||0)>t) return {success:false,error:'Item đang hồi',remainingMs:st.cooldowns[group]-t};
  if(def.effect?.type==='breakthrough') return {success:true,type:'breakthrough',item:def,consumed:false};
  const removed=removeItem(itemId,1); if(!removed.success)return removed;
  if(group && def.cooldownMs) st.cooldowns[group]=t+Number(def.cooldownMs);
  return {success:true,item:def,...applyEffect(def,scene),consumed:true};
}

export function craftItem(recipeId, qty=1) {
  const recipe=getRecipe(recipeId); if(!recipe)return {success:false,error:'Công thức không tồn tại'};
  qty=Math.max(1,Math.floor(Number(qty)||1));
  const req=(recipe.inputs||[]).map(r=>({itemId:r.itemId,qty:(Number(r.qty)||0)*qty}));
  if(!hasItems(req)) return {success:false,error:'Thiếu nguyên liệu'};
  const curKey=recipe.currency?.key; const curNeed=(Number(recipe.currency?.amount)||0)*qty;
  if(curKey && Number(gameState.currencies?.[curKey]||0)<curNeed) return {success:false,error:'Không đủ tiền tệ'};
  req.forEach(r=>removeItem(r.itemId,r.qty));
  if(curKey && curNeed>0) { gameState.currencies[curKey]-=curNeed; if(curKey==='low') gameState.gold=gameState.currencies.low; }
  const result=addItem(recipe.outputId,(Number(recipe.outputQty)||1)*qty);
  return {success:true,recipe,output:result};
}

export function enhanceGear(uid, levels=1) {
  const inst=getInstance(uid); const def=getItemDef(inst?.defId); if(!inst||!def)return {success:false,error:'Gear không tồn tại'};
  levels=Math.max(1,Math.floor(Number(levels)||1)); const target=Math.min(GEAR_ENHANCE_MAX,inst.enhance+levels); if(target===inst.enhance)return {success:false,error:'Đã cường hóa tối đa'};
  const realm=getRankMeta(def.rank); const oreId=`ore_${realm.key}_linh`; const amount=(target-inst.enhance)*(2+def.rank);
  if(getItemQuantity(oreId)<amount)return {success:false,error:`Thiếu ${getItemDef(oreId)?.name}`};
  const curKey=realm.currencyKey, cost=(target-inst.enhance)*Math.max(1,Math.round(10*realm.power));
  if(Number(gameState.currencies?.[curKey]||0)<cost)return {success:false,error:'Không đủ linh thạch'};
  removeItem(oreId,amount); gameState.currencies[curKey]-=cost; if(curKey==='low')gameState.gold=gameState.currencies.low; inst.enhance=target;
  return {success:true,enhance:target};
}
export function refineGear(uid) {
  const inst=getInstance(uid), def=getItemDef(inst?.defId); if(!inst||!def)return {success:false,error:'Gear không tồn tại'};
  if(inst.refine>=GEAR_REFINE_MAX)return {success:false,error:'Đã tinh luyện tối đa'};
  const realm=getRankMeta(def.rank), coreId=`core_${realm.key}_linh`;
  if(getItemQuantity(coreId)<1)return {success:false,error:`Cần ${getItemDef(coreId)?.name}`};
  removeItem(coreId,1); inst.refine++; return {success:true,refine:inst.refine};
}
export function rerollAffixes(uid) {
  const inst=getInstance(uid), def=getItemDef(inst?.defId); if(!inst||!def)return {success:false,error:'Gear không tồn tại'};
  const realm=getRankMeta(def.rank), bloodId=`beast_${realm.key}_blood`, need=2+def.rank;
  if(getItemQuantity(bloodId)<need)return {success:false,error:`Thiếu ${getItemDef(bloodId)?.name}`};
  removeItem(bloodId,need); inst.affixes=rollAffixes(def); return {success:true,affixes:clone(inst.affixes)};
}
export function socketCore(uid,index,coreId) {
  const inst=getInstance(uid), def=getItemDef(inst?.defId), core=getItemDef(coreId); index=Math.floor(Number(index));
  if(!inst||!def||!core||core.kind!=='core')return {success:false,error:'Dữ liệu khảm không hợp lệ'};
  if(index<0||index>=inst.sockets.length)return {success:false,error:'Socket không tồn tại'};
  if(getItemQuantity(coreId)<1)return {success:false,error:'Không có Nội Đan'};
  const old=inst.sockets[index]||null; removeItem(coreId,1); if(old)addItem(old,1); inst.sockets[index]=coreId; return {success:true,old,coreId};
}
export function unsocketCore(uid,index) { const inst=getInstance(uid); index=Math.floor(Number(index)); if(!inst||index<0||index>=inst.sockets.length)return {success:false}; const old=inst.sockets[index]; if(!old)return {success:false,error:'Socket trống'}; inst.sockets[index]=null; addItem(old,1); return {success:true,itemId:old}; }
export function repairGear(uid) { const inst=getInstance(uid),def=getItemDef(inst?.defId); if(!inst||!def)return {success:false}; const max=Number(def.durabilityMax)||100; const missing=Math.max(0,max-inst.durability); if(!missing)return {success:true,cost:0}; const key=getRankMeta(def.rank).currencyKey, cost=Math.max(1,Math.ceil(missing*(1+def.rank))); if(Number(gameState.currencies?.[key]||0)<cost)return {success:false,error:'Không đủ linh thạch'}; gameState.currencies[key]-=cost; if(key==='low')gameState.gold=gameState.currencies.low; inst.durability=max; return {success:true,cost}; }
export function salvageGear(uid) {
  const st=ensureItemState(),inst=st.instances[uid],def=getItemDef(inst?.defId); if(!inst||!def)return {success:false}; if(inst.locked||Object.values(st.equipped).includes(uid))return {success:false,error:'Gear đang khóa hoặc đang trang bị'};
  const realm=getRankMeta(def.rank), oreId=`ore_${realm.key}_${def.system && getItemDef(`ore_${realm.key}_${def.system}`) ? def.system : 'linh'}`;
  const qty=Math.max(1,2+def.rank+Math.floor((inst.enhance||0)/3)); delete st.instances[uid]; addItem(oreId,qty); if(inst.sockets)inst.sockets.filter(Boolean).forEach(core=>addItem(core,1)); return {success:true,returns:[{itemId:oreId,qty}]};
}

export function buyItem(itemId,qty=1,multiplier=1) { const def=getItemDef(itemId); if(!def||def.price<=0)return {success:false,error:'Không bán'}; qty=Math.max(1,Math.floor(qty)); const key=getRankMeta(def.rank).currencyKey, cost=Math.ceil(def.price*multiplier)*qty; if(Number(gameState.currencies?.[key]||0)<cost)return {success:false,error:'Không đủ tiền'}; gameState.currencies[key]-=cost;if(key==='low')gameState.gold=gameState.currencies.low; addItem(itemId,qty);return {success:true,cost,currencyKey:key}; }
export function sellItem(itemId,qty=1,multiplier=.35) { const def=getItemDef(itemId); if(!def||def.price<=0)return {success:false,error:'Không thể bán'}; qty=Math.max(1,Math.floor(qty)); const r=removeItem(itemId,qty);if(!r.success)return r; const key=getRankMeta(def.rank).currencyKey, gain=Math.max(1,Math.floor(def.price*multiplier))*qty; gameState.currencies[key]=(Number(gameState.currencies?.[key])||0)+gain;if(key==='low')gameState.gold=gameState.currencies.low;return {success:true,gain,currencyKey:key}; }

export function generateEnemyLoot(enemy,rng=Math.random){return rollEnemyLoot(enemy,rng);}
export function awardLoot(drops=[]){ const awarded=[]; for(const d of drops||[]){ const r=addItem(d.itemId,d.qty||1); if(r.success)awarded.push({itemId:d.itemId,qty:d.qty||1}); } return awarded; }

export function ensureItemTexture(scene,itemOrId,onReady=null) {
  const def=typeof itemOrId==='string'?getItemDef(itemOrId):itemOrId;
  if(!scene||!def)return null;
  const key=def.icon;
  if(scene.textures?.exists?.(key)){ try{onReady?.(key,def);}catch{} return key; }
  const asset=getItemIconAsset(def);
  if(!asset?.path||!scene.load?.image)return null;

  const pending=scene.__itemIconLoads || (scene.__itemIconLoads=new Set());
  const callbacks=scene.__itemIconCallbacks || (scene.__itemIconCallbacks=new Map());
  if(typeof onReady==='function'){
    const list=callbacks.get(key)||[]; list.push(onReady); callbacks.set(key,list);
  }
  if(pending.has(key))return key;
  pending.add(key);

  const flush=(loaded)=>{
    pending.delete(key);
    const list=callbacks.get(key)||[]; callbacks.delete(key);
    if(loaded){
      list.forEach(fn=>{try{fn(key,def);}catch{}});
      scene.events?.emit?.('item-icon-ready',key,def.id);
    }else scene.events?.emit?.('item-icon-error',key,def.id,asset.path);
  };
  const onError=file=>{
    if(file?.key!==key)return;
    scene.load?.off?.('loaderror',onError);
    flush(false);
  };
  scene.load.once?.(`filecomplete-image-${key}`,()=>{scene.load?.off?.('loaderror',onError);flush(true);});
  scene.load.on?.('loaderror',onError);
  scene.load.image(key,asset.path);
  const loading=typeof scene.load.isLoading==='function'?scene.load.isLoading():!!scene.load.isLoading;
  if(!loading)scene.load.start();
  return key;
}

export function assertItemStateIntegrity() {
  assertItemCatalogIntegrity(); const st=ensureItemState(),errors=[];
  Object.entries(st.stacks).forEach(([id,qty])=>{const d=getItemDef(id);if(!d)errors.push(`stack ${id} không tồn tại`);if(d?.kind==='gear')errors.push(`gear ${id} nằm trong stack`);if(!Number.isFinite(Number(qty))||qty<0)errors.push(`stack ${id} qty lỗi`);});
  Object.entries(st.instances).forEach(([uid,inst])=>{if(uid!==inst?.uid)errors.push(`uid mismatch ${uid}`);const d=getItemDef(inst?.defId);if(!d||d.kind!=='gear')errors.push(`instance ${uid} def lỗi`);});
  Object.entries(st.equipped).forEach(([slot,uid])=>{if(!ITEM_EQUIPMENT_SLOTS.includes(slot))errors.push(`slot ${slot} lỗi`);if(uid&&!st.instances[uid])errors.push(`equipped uid ${uid} mất`);});
  if(errors.length)throw new Error(`[ItemSystemV3] ${errors.slice(0,20).join(' | ')}`); return {ok:true,owner:OWNER,catalog:ITEM_CATALOG_STATS};
}

export function installItemSystem(MainGameScene) {
  const p=MainGameScene?.prototype; if(!p)throw new Error('[ItemSystemV3] Thiếu MainGameScene.prototype');
  if(p.__itemSystemV3Installed)return; p.__itemSystemV3Installed=true; p.__itemSystemOwner=OWNER;
  ensureItemState();
  Object.assign(p,{
    getItemDef,getItemByName,getItemRecipe:getRecipe,listItemCatalog:listItems,listItemRecipes:listRecipes,
    getItemQuantity,addItem,removeItem,listOwnedItems,getItemInstance:getInstance,getEquipmentStats,getItemPowerScore:getPowerScore,setQuickSlot,useQuickSlot,damageEquippedDurability,
    equipItem,unequipItem,setItemQuickSlot:setQuickSlot,useItem,craftItem,enhanceGear,refineGear,rerollGearAffixes:rerollAffixes,
    socketCore,unsocketCore,repairGear,salvageGear,buyItem,sellItem,generateEnemyLoot,awardLoot,ensureItemTexture,
    assertItemSystemIntegrity:assertItemStateIntegrity
  });
  p.itemCatalogStats=ITEM_CATALOG_STATS;
  assertItemStateIntegrity();
}
