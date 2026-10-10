/** Four profession item families. All IDs are canonical and save-safe. */
export const ITEM_KINDS=Object.freeze([
  {id:'ore',name:'Khoáng Thạch',root:'Tinh Khoáng'},
  {id:'herb',name:'Linh Thảo',root:'Linh Thảo'},
  {id:'elixir',name:'Đan Dược',root:'Hồi Nguyên Đan'},
  {id:'talisman',name:'Phù Lục',root:'Hộ Thân Phù'}
]);
export const QUALITIES=Object.freeze(['Sơ Cấp','Trung Cấp','Thượng Phẩm','Cực Phẩm']);
export const RANK_NAMES=Object.freeze(['Phàm Phẩm','Nhất Phẩm','Nhị Phẩm','Tam Phẩm','Tứ Phẩm','Ngũ Phẩm']);
export const rankForFloor=floor=>Math.min(5,Math.max(0,Math.floor((Math.max(1,floor)-2)/12)+1));
export function makeItemId(kind,rank,quality=0){return kind+'_'+rank+'_'+(rank===0?0:quality)}
export function itemInfo(id){
  const m=/^(ore|herb|elixir|talisman)_([0-5])_([0-3])$/.exec(id||'');
  if(!m)return null;
  const type=ITEM_KINDS.find(t=>t.id===m[1]),rank=+m[2],quality=+m[3];
  if(rank===0&&quality!==0)return null;
  return {id,kind:type.id,rank,quality,name:type.root+' · '+RANK_NAMES[rank]+(rank?' · '+QUALITIES[quality]:''),
    family:type.name,price:Math.round((rank+1)**3*(quality+1)*10)};
}
export function normalizeItems(raw){
  const out={};
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const [id,count] of Object.entries(raw))if(itemInfo(id)&&Number.isFinite(count)&&count>0)out[id]=Math.min(1e9,Math.floor(count));
  return out;
}
export function addItem(player,id,count=1){
  if(!itemInfo(id)||!Number.isSafeInteger(count)||count<1)return false;
  player.professionItems??={};
  player.professionItems[id]=Math.min(1e9,(player.professionItems[id]||0)+count);return true;
}
export function spendItems(player,recipe){
  if(!recipe.every(([id,n])=>(player.professionItems?.[id]||0)>=n))return false;
  for(const [id,n] of recipe)player.professionItems[id]-=n;
  return true;
}
export function craftRecipe(kind,rank,quality=0){
  if(!['elixir','talisman'].includes(kind))return null;
  return kind==='elixir'
    ?[[makeItemId('herb',rank,quality),2],[makeItemId('ore',rank,quality),1]]
    :[[makeItemId('ore',rank,quality),2],[makeItemId('herb',rank,quality),1]];
}
export function gatherItem(player,kind,floor,roll=Math.random()){
  if(!['ore','herb'].includes(kind))return null;
  const rank=rankForFloor(floor);
  const quality=rank===0?0:roll<.55?0:roll<.8?1:roll<.95?2:3;
  const id=makeItemId(kind,rank,quality);addItem(player,id,1);return itemInfo(id);
}
