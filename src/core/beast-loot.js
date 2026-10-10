/**
 * All enemy rewards are physical beast parts. No gold/EXP drops.
 * Floor 1: ordinary deer (no core); floor 2 onward: rank 1-9 beasts.
 */
export const BEAST_MATERIALS=Object.freeze({
  da_thu:Object.freeze({id:'da_thu',name:'Da Thú',icon:'▤',color:'#cba178',sellPrice:12}),
  long_thu:Object.freeze({id:'long_thu',name:'Lông Thú',icon:'❧',color:'#e5d8bd',sellPrice:8}),
  huyet_thu:Object.freeze({id:'huyet_thu',name:'Huyết Thú',icon:'✚',color:'#e45b66',sellPrice:20})
});
export const CORE_QUALITIES=Object.freeze([
  Object.freeze({id:'ha',name:'Hạ Phẩm',weight:.70,color:'#8adea9'}),
  Object.freeze({id:'trung',name:'Trung Phẩm',weight:.20,color:'#64cafa'}),
  Object.freeze({id:'thuong',name:'Thượng Phẩm',weight:.08,color:'#d49bff'}),
  Object.freeze({id:'cuc',name:'Cực Phẩm',weight:.02,color:'#ffca65'})
]);
export const BEAST_CORE_DROP_CHANCE=.35;

export function beastRankForFloor(floor){
  if(!Number.isFinite(floor)||floor<2)return 0;
  return Math.min(9,1+Math.floor((floor-2)/12));
}

export function lootInfo(itemId){
  if(Object.hasOwn(BEAST_MATERIALS,itemId))return BEAST_MATERIALS[itemId];
  const m=/^noi_dan_([1-9])_(ha|trung|thuong|cuc)$/.exec(itemId);
  if(!m)return null;
  const quality=CORE_QUALITIES.find(q=>q.id===m[2]);
  return {id:itemId,name:`Nội Đan ${m[1]} Phẩm · ${quality.name}`,
    icon:'◆',color:quality.color,sellPrice:0,beastRank:Number(m[1]),quality:quality.id};
}
export function rollCoreQuality(random=Math.random){
  const roll=Math.min(.999999,Math.max(0,random()));
  let cumulative=0;
  for(const quality of CORE_QUALITIES){
    cumulative+=quality.weight;
    if(roll<cumulative)return quality;
  }
  return CORE_QUALITIES.at(-1);
}
export function generateBeastLoot(enemy,random=Math.random){
  // Always drop hide; fur and blood may drop as additional items.
  const loot=[{itemId:'da_thu',quantity:1}];
  if(random()<.72)loot.push({itemId:'long_thu',quantity:1});
  if(random()<.42)loot.push({itemId:'huyet_thu',quantity:1});
  const rank=Math.min(9,Math.max(0,Math.floor(Number(enemy.beastRank)||0)));
  if(rank>=1&&random()<BEAST_CORE_DROP_CHANCE){
    const quality=rollCoreQuality(random);
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
