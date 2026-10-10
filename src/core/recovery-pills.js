import {resourceInfo} from './profession-items.js';
export const RECOVERY_PILLS={
  hp:{kind:'hp',id:'hoi_huyet',name:'Hồi Huyết Đan',icon:'pills/pill_hp',stat:'hp',max:'maxHp',cooldown:'heal',ratio:.32,gold:10},
  mp:{kind:'mp',id:'hoi_linh',name:'Hồi Linh Đan',icon:'pills/pill_mp',stat:'mp',max:'maxMp',cooldown:'mana',ratio:.32,gold:10}
};

export function recoveryInfo(kind,id){
 const dedicated=RECOVERY_PILLS[kind];if(!dedicated)return null;
 if(id===dedicated.id)return {...dedicated,source:'pills'};
 const item=resourceInfo(id);return item?.kind==='elixir'?{...item,source:'professionItems',icon:'professions/elixir'}:null;
}
export function recoveryChoices(player,kind){
 return [RECOVERY_PILLS[kind]?.id,...Object.keys(player.professionItems||{})].map(id=>recoveryInfo(kind,id)).filter(item=>item&&(player[item.source]?.[item.id]||0)>0);
}
