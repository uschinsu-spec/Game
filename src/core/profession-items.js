import {rankForFloor} from './floor-grades.js';
export {rankForFloor};
/** Four families, grades Pham (0) through Ngu (5), four qualities for grades 1-5. */
export const GRADES=['Phàm Phẩm','Nhất Phẩm','Nhị Phẩm','Tam Phẩm','Tứ Phẩm','Ngũ Phẩm'];
export const QUALITIES=['Sơ Cấp','Trung Cấp','Thượng Phẩm','Cực Phẩm'];
export const FAMILIES={ore:'Khoáng Thạch',herb:'Linh Thảo',elixir:'Đan Dược',talisman:'Phù Lục'};
export const RANK_COUNT=21;
export function resourceId(kind,grade,quality=0){return `${kind}_${grade}_${grade?quality:0}`;}
export function resourceInfo(id){const m=/^(ore|herb|elixir|talisman)_([0-5])_([0-3])$/.exec(id||'');if(!m||m[2]==='0'&&m[3]!=='0')return null;const [_,kind,g,q]=m,grade=Number(g),quality=Number(q);return {id,kind,grade,quality,name:`${FAMILIES[kind]} · ${GRADES[grade]}${grade?' · '+QUALITIES[quality]:''}`};}
export function normalizeResources(src){const out={};if(!src||typeof src!=='object'||Array.isArray(src))return out;for(const [id,count] of Object.entries(src)){if(resourceInfo(id)&&Number.isFinite(count)&&count>0)out[id]=Math.min(1e9,Math.floor(count));}return out;}
export function addResource(player,id,count=1){if(!resourceInfo(id)||!Number.isSafeInteger(count)||count<1)return false;player.professionItems??={};player.professionItems[id]=Math.min(1e9,(player.professionItems[id]||0)+count);return true;}
export function consumeResources(player,cost){if(!cost.every(([id,n])=>(player.professionItems?.[id]||0)>=n))return false;for(const [id,n] of cost)player.professionItems[id]-=n;return true;}
export function gatherResource(player,kind,floor,random=Math.random()){if(kind!=='ore'&&kind!=='herb')return null;const grade=rankForFloor(floor),quality=!grade?0:random<.55?0:random<.8?1:random<.95?2:3,id=resourceId(kind,grade,quality);addResource(player,id);return resourceInfo(id);}
export function recipeFor(kind,grade,quality){if(!['elixir','talisman'].includes(kind))return null;return kind==='elixir'?[[resourceId('herb',grade,quality),2],[resourceId('ore',grade,quality),1]]:[[resourceId('ore',grade,quality),2],[resourceId('herb',grade,quality),1]];}
