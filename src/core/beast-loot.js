/**
 * Enemy rewards: beast hide, fur, blood, and possibly an inner core. No gold or EXP.
 * Each 12-floor major rank has four 3-floor substages; quality matches substage exactly.
 */
export const BEAST_MATERIALS=Object.freeze({
  da_thu:Object.freeze({id:'da_thu',name:'Da Thú',icon:'▤',color:'#cba178',sellPrice:12}),
  long_thu:Object.freeze({id:'long_thu',name:'Lông Thú',icon:'❧',color:'#e5d8bd',sellPrice:8}),
  huyet_thu:Object.freeze({id:'huyet_thu',name:'Huyết Thú',icon:'✚',color:'#e45b66',sellPrice:20})
});
export const CORE_QUALITIES=Object.freeze([
  Object.freeze({id:'ha',name:'Hạ Phẩm',color:'#8adea9'}),
  Object.freeze({id:'trung',name:'Trung Phẩm',color:'#64cafa'}),
  Object.freeze({id:'thuong',name:'Thượng Phẩm',color:'#d49bff'}),
  Object.freeze({id:'cuc',name:'Cực Phẩm',color:'#ffca65'})
]);
export const BEAST_STAGES=Object.freeze([
  Object.freeze({id:'so',name:'Sơ Kỳ',quality:'ha',coreChance:.50}),
  Object.freeze({id:'trung',name:'Trung Kỳ',quality:'trung',coreChance:.30}),
  Object.freeze({id:'hau',name:'Hậu Kỳ',quality:'thuong',coreChance:.15}),
  Object.freeze({id:'dinh',name:'Đỉnh Phong',quality:'cuc',coreChance:.05})
]);
// Each higher major rank has 15% less chance than the preceding rank.
// Higher substage grades (Cực > Thượng > Trung > Hạ) are independently rarer.
export const CORE_CHANCE_MULTIPLIER_PER_RANK=.85;
export const BEAST_CORE_DROP_CHANCE=BEAST_STAGES[0].coreChance; // Nhất Phẩm Sơ Kỳ: 50%

export function beastRankForFloor(floor){
  if(!Number.isInteger(floor)||floor<2)return 0;
  return Math.min(9,1+Math.floor((floor-2)/12));
}
export function beastStageForFloor(floor){
  if(!Number.isInteger(floor)||floor<2)return -1;
  return Math.min(3,Math.floor(((floor-2)%12)/3));
}
export function beastCoreDropChance(enemy){
  const rank=Math.min(9,Math.max(0,Math.floor(Number(enemy?.beastRank)||0)));
  if(!rank)return 0; // Phàm thú không có nội đan
  const stage=Math.min(3,Math.max(0,Math.floor(Number(enemy?.beastStage)||0)));
  return BEAST_STAGES[stage].coreChance *
    Math.pow(CORE_CHANCE_MULTIPLIER_PER_RANK,rank-1);
}
export function beastCoreQuality(enemy){
  const stage=Math.min(3,Math.max(0,Math.floor(Number(enemy?.beastStage)||0)));
  return CORE_QUALITIES.find(q=>q.id===BEAST_STAGES[stage].quality);
}
export function beastTitle(enemy,speciesName='Yêu Thú'){
  const rank=Math.min(9,Math.max(0,Math.floor(Number(enemy?.beastRank)||0)));
  if(!rank)return speciesName+' · Phàm Thú';
  const name=['','Nhất','Nhị','Tam','Tứ','Ngũ','Lục','Thất','Bát','Cửu'][rank];
  const stage=Math.min(3,Math.max(0,Math.floor(Number(enemy?.beastStage)||0)));
  return `${speciesName} · ${name} Phẩm ${BEAST_STAGES[stage].name}`;
}
export function lootInfo(itemId){
  if(Object.hasOwn(BEAST_MATERIALS,itemId))return BEAST_MATERIALS[itemId];
  const m=/^noi_dan_([1-9])_(ha|trung|thuong|cuc)$/.exec(itemId);
  if(!m)return null;
  const quality=CORE_QUALITIES.find(q=>q.id===m[2]);
  return {id:itemId,name:`Nội Đan ${m[1]} Phẩm · ${quality.name}`,
    icon:'◆',color:quality.color,sellPrice:0,beastRank:Number(m[1]),quality:quality.id};
}
export function generateBeastLoot(enemy,random=Math.random){
  const loot=[{itemId:'da_thu',quantity:1}];
  if(random()<.72)loot.push({itemId:'long_thu',quantity:1});
  if(random()<.42)loot.push({itemId:'huyet_thu',quantity:1});
  const rank=Math.min(9,Math.max(0,Math.floor(Number(enemy?.beastRank)||0)));
  if(rank&&random()<beastCoreDropChance(enemy)){
    // Quality comes exclusively from this beast's cultivation stage;
    // e.g. Nhất Phẩm Đỉnh Phong always yields Nhất Phẩm Cực Phẩm when a core drops.
    const quality=beastCoreQuality(enemy);
    loot.push({itemId:`noi_dan_${rank}_${quality.id}`,quantity:1});
  }
  return loot;
}
export function sellCommonMaterials(actor){
  if(!actor||!actor.materials)return {gold:0,items:0};
  let gold=0,items=0;
  for(const [id,info] of Object.entries(BEAST_MATERIALS)){
    const count=Math.max(0,Math.floor(Number(actor.materials[id])||0));
    if(!count)continue;
    const price=count*info.sellPrice;
    gold+=price;items+=count;delete actor.materials[id];
  }
  if(gold)actor.gold=(actor.gold||0)+gold;
  return {gold,items};
}
