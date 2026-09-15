(()=>{'use strict';
const DEFINITIONS=Object.freeze({
 thanh_linh_ho:Object.freeze({id:'thanh_linh_ho',name:'Thanh Linh Hồ',bloodline:'THANH_LINH',baseStats:{maxHP:75,maxMana:70,attack:9,defense:4,moveSpeed:6.8},followDistance:2.4,combatRange:9,returnDistance:16,skills:['pet_wind_claw'],evolutions:['LINH_HO','HUYEN_HO','THIEN_HO']}),
 loi_vu_dieu:Object.freeze({id:'loi_vu_dieu',name:'Lôi Vũ Điểu',bloodline:'LOI_VU',baseStats:{maxHP:62,maxMana:85,attack:11,defense:3,moveSpeed:7.5},followDistance:2.8,combatRange:11,returnDistance:18,skills:['pet_lightning_peck'],evolutions:['VU_DIEU','LOI_DIEU','THIEN_LOI_DIEU']})
});
const BLOODLINES=Object.freeze({THANH_LINH:Object.freeze({id:'THANH_LINH',name:'Thanh Linh Huyết Mạch',statMods:{maxMana:8,moveSpeed:.2}}),LOI_VU:Object.freeze({id:'LOI_VU',name:'Lôi Vũ Huyết Mạch',statMods:{attack:2,critChance:.02}})});
const CAPTURES=Object.freeze({
 wild_fox:Object.freeze({id:'wild_fox',petDefinitionId:'thanh_linh_ho',name:'Thanh Linh Hồ Hoang Dã',requirements:[{baseId:'spirit_trap',quantity:1},{baseId:'pet_food',quantity:2}],baseChance:.72,positionOffset:{x:4,z:2}}),
 wild_bird:Object.freeze({id:'wild_bird',petDefinitionId:'loi_vu_dieu',name:'Lôi Vũ Điểu Hoang Dã',requirements:[{baseId:'spirit_trap',quantity:1},{baseId:'pet_food',quantity:3}],baseChance:.58,positionOffset:{x:-4,z:3}})
});
function realmRequirement(s){const major=Math.max(0,Number(s.majorRealmIndex)||0);if(major===0)return 30+Math.max(1,Number(s.layer)||1)*14;return 120+major*110+Math.max(0,Number(s.minorRealmIndex)||0)*45}
window.GameCore=window.GameCore||{};window.GameCore.petCatalog=Object.freeze({DEFINITIONS,BLOODLINES,CAPTURES,realmRequirement});
})();
