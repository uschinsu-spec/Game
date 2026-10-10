/** 8 equipable xianxia gear slots, ranks 1..5 and 4 quality grades: 160 variants. */
import {GRADES,QUALITIES,resourceId} from './profession-items.js';

export const EQUIPMENT_SLOTS=Object.freeze([
  {id:'armor',name:'Áo',icon:'🥋'},
  {id:'gloves',name:'Bao Tay',icon:'🧤'},
  {id:'weapon',name:'Vũ Khí',icon:'⚔️'},
  {id:'pants',name:'Quần',icon:'👖'},
  {id:'necklace',name:'Dây Chuyền',icon:'📿'},
  {id:'belt',name:'Thắt Lưng',icon:'🎗️'},
  {id:'ring',name:'Nhẫn',icon:'💍'},
  {id:'jade',name:'Ngọc Bội',icon:'🟢'}
]);
export const EQUIPMENT_GRADES=GRADES.slice(1);
export const EQUIPMENT_QUALITIES=QUALITIES;
const EQUIPMENT_MAP=new Map(EQUIPMENT_SLOTS.map(s=>[s.id,s]));
const GEAR_KEYS=['hp','mp','dmg','def','critRate','critDamage','attackSpeed','elementDamage','spiritualSense','hpPct','mpPct','dmgPct','defPct'];
const BASE_POWER=[0,5,120,1800,32000,600000];
const QUALITY_FACTOR=[1,1.3,1.65,2.1];

export function equipmentId(slot,grade,quality=0){return `gear_${slot}_${grade}_${quality}`;}
export function equipmentInfo(id){
  const m=/^gear_([a-z]+)_([1-5])_([0-3])$/.exec(id||'');
  if(!m)return null;
  const slot=EQUIPMENT_MAP.get(m[1]);if(!slot)return null;
  const grade=Number(m[2]),quality=Number(m[3]);
  return {id,slot:slot.id,icon:slot.icon,grade,quality,
    name:`${slot.name} · ${GRADES[grade]} · ${QUALITIES[quality]}`,
    stats:equipmentStats(slot.id,grade,quality)};
}
export function equipmentStats(slot,grade,quality){
  if(!EQUIPMENT_MAP.has(slot)||!Number.isInteger(grade)||grade<1||grade>5||!Number.isInteger(quality)||quality<0||quality>3)return {};
  const scale=BASE_POWER[grade]*QUALITY_FACTOR[quality];
  const value=n=>Math.max(1,Math.round(scale*n));
  const pct=n=>Number((n*(grade+quality*.5)).toFixed(2));
  switch(slot){
    case 'armor':return {hp:value(18),def:value(3)};
    case 'gloves':return {dmg:value(1),attackSpeed:pct(1)};
    case 'weapon':return {dmg:value(5),elementDamage:pct(1.3)};
    case 'pants':return {hp:value(14),def:value(2)};
    case 'necklace':return {mp:value(18),spiritualSense:value(.8)};
    case 'belt':return {hp:value(11),def:value(2.5)};
    case 'ring':return {dmg:value(1.4),critRate:pct(.7)};
    case 'jade':return {mp:value(22),spiritualSense:value(1.2),critDamage:pct(1.5)};
  }
}
export function normalizeEquipmentInventory(raw){
  const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const [id,n] of Object.entries(raw))if(equipmentInfo(id)&&Number.isFinite(n)&&n>0)out[id]=Math.min(1000000000,Math.floor(n));
  return out;
}
export function normalizeEquipmentSlots(raw){
  const out=Object.fromEntries(EQUIPMENT_SLOTS.map(s=>[s.id,null]));
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const slot of EQUIPMENT_SLOTS){const id=raw[slot.id],info=equipmentInfo(id);if(info&&info.slot===slot.id)out[slot.id]=id;}
  return out;
}
export function normalizeBaseGear(raw){
  const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const key of GEAR_KEYS)if(Number.isFinite(raw[key]))out[key]=Math.max(-99,Math.min(1e9,raw[key]));
  return out;
}
export function rebuildEquippedGear(player){
  player.baseEquippedGear=normalizeBaseGear(player.baseEquippedGear??player.equippedGear);
  player.gearSlots=normalizeEquipmentSlots(player.gearSlots);
  const merged={...player.baseEquippedGear};
  for(const id of Object.values(player.gearSlots)){
    const info=equipmentInfo(id);if(!info)continue;
    for(const [key,value] of Object.entries(info.stats))merged[key]=(merged[key]||0)+value;
  }
  player.equippedGear=merged;
  return merged;
}
export function equipItem(player,id){
  const info=equipmentInfo(id);if(!info||(player.gearInventory?.[id]||0)<1)return false;
  player.gearInventory[id]--;
  player.gearSlots??=normalizeEquipmentSlots();
  const old=player.gearSlots[info.slot];if(old)player.gearInventory[old]=(player.gearInventory[old]||0)+1;
  player.gearSlots[info.slot]=id;rebuildEquippedGear(player);return true;
}
export function unequipItem(player,slot){
  if(!EQUIPMENT_MAP.has(slot))return false;
  const id=player.gearSlots?.[slot];if(!equipmentInfo(id))return false;
  player.gearInventory??={};player.gearInventory[id]=(player.gearInventory[id]||0)+1;
  player.gearSlots[slot]=null;rebuildEquippedGear(player);return true;
}
export function equipmentRecipe(id){
  const item=equipmentInfo(id);if(!item)return null;
  const heavy=['armor','gloves','pants','belt'].includes(item.slot);
  const materialId=heavy?'da_thu':'huyet_thu';
  return {oreId:resourceId('ore',item.grade,item.quality),oreCount:heavy?2:3,
    materialId,materialCount:heavy?1+item.grade:1+item.quality};
}
export function craftEquipment(player,id){
  const recipe=equipmentRecipe(id);if(!recipe)return false;
  if((player.professionItems?.[recipe.oreId]||0)<recipe.oreCount||(player.materials?.[recipe.materialId]||0)<recipe.materialCount)return false;
  player.professionItems[recipe.oreId]-=recipe.oreCount;
  player.materials[recipe.materialId]-=recipe.materialCount;
  player.gearInventory??={};player.gearInventory[id]=(player.gearInventory[id]||0)+1;
  return true;
}
