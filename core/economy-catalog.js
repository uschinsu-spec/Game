(()=>{'use strict';
const TIERS=Object.freeze(['HA','TRUNG','THUONG','CUC']);const TIER_LABELS=Object.freeze({HA:'Hạ Phẩm',TRUNG:'Trung Phẩm',THUONG:'Thượng Phẩm',CUC:'Cực Phẩm'});
const ITEM_BASES=Object.freeze({
 spirit_dust:Object.freeze({id:'spirit_dust',name:'Linh Trần',type:'MATERIAL',stackable:true,maxStack:9999,value:{tier:'HA',amount:2}}),
 spirit_herb:Object.freeze({id:'spirit_herb',name:'Linh Thảo',type:'MATERIAL',stackable:true,maxStack:9999,value:{tier:'HA',amount:3}}),
 iron_ore:Object.freeze({id:'iron_ore',name:'Vân Thiết Khoáng',type:'MATERIAL',stackable:true,maxStack:9999,value:{tier:'HA',amount:4}}),
 artifact_shard:Object.freeze({id:'artifact_shard',name:'Pháp Bảo Tàn Phiến',type:'MATERIAL',stackable:true,maxStack:9999,value:{tier:'HA',amount:8}}),
 formation_ink:Object.freeze({id:'formation_ink',name:'Trận Văn Linh Mặc',type:'MATERIAL',stackable:true,maxStack:9999,value:{tier:'HA',amount:6}}),
 iron_sword:Object.freeze({id:'iron_sword',name:'Thanh Vân Thiết Kiếm',type:'EQUIPMENT',slot:'WEAPON',stackable:false,rarity:'COMMON',requirements:{majorRealmIndex:0},baseStats:{attack:8},value:{tier:'HA',amount:45}}),
 cloud_robe:Object.freeze({id:'cloud_robe',name:'Thanh Vân Đạo Bào',type:'EQUIPMENT',slot:'CHEST',stackable:false,rarity:'COMMON',requirements:{majorRealmIndex:0},baseStats:{maxHP:25,defense:4},value:{tier:'HA',amount:40}}),
 spirit_ring:Object.freeze({id:'spirit_ring',name:'Tụ Linh Giới',type:'EQUIPMENT',slot:'RING',stackable:false,rarity:'UNCOMMON',requirements:{majorRealmIndex:0},baseStats:{maxMana:15,attack:3},value:{tier:'HA',amount:60}}),
 healing_pill:Object.freeze({id:'healing_pill',name:'Hồi Nguyên Đan',type:'PILL',stackable:false,rarity:'COMMON',value:{tier:'HA',amount:8}}),
 mana_pill:Object.freeze({id:'mana_pill',name:'Tụ Linh Đan',type:'PILL',stackable:false,rarity:'COMMON',value:{tier:'HA',amount:10}}),
 cultivation_pill:Object.freeze({id:'cultivation_pill',name:'Tăng Tu Đan',type:'PILL',stackable:false,rarity:'UNCOMMON',value:{tier:'HA',amount:18}}),
 breakthrough_pill:Object.freeze({id:'breakthrough_pill',name:'Phá Cảnh Đan',type:'PILL',stackable:false,rarity:'RARE',value:{tier:'HA',amount:30}}),
 cleanse_pill:Object.freeze({id:'cleanse_pill',name:'Thanh Tâm Đan',type:'PILL',stackable:false,rarity:'RARE',value:{tier:'HA',amount:32}}),
 battle_pill:Object.freeze({id:'battle_pill',name:'Chiến Ý Đan',type:'PILL',stackable:false,rarity:'UNCOMMON',value:{tier:'HA',amount:16}}),
 jade_mirror_artifact:Object.freeze({id:'jade_mirror_artifact',name:'Bạch Ngọc Huyền Kính',type:'ARTIFACT',stackable:false,rarity:'EPIC',value:{tier:'TRUNG',amount:2}}),
 spirit_gathering_plate:Object.freeze({id:'spirit_gathering_plate',name:'Tụ Linh Trận Bàn',type:'FORMATION',stackable:false,rarity:'RARE',value:{tier:'HA',amount:80}}),
 thunder_kill_plate:Object.freeze({id:'thunder_kill_plate',name:'Lôi Sát Trận Bàn',type:'FORMATION',stackable:false,rarity:'EPIC',value:{tier:'TRUNG',amount:2}})
});
const AFFIXES=Object.freeze({keen:Object.freeze({id:'keen',name:'Sắc Bén',stats:{attack:3}}),sturdy:Object.freeze({id:'sturdy',name:'Kiên Cố',stats:{defense:3,maxHP:12}}),flowing:Object.freeze({id:'flowing',name:'Lưu Vân',stats:{moveSpeed:.25,maxMana:8}})});
const LOOT_TABLES=Object.freeze({mob:Object.freeze([{kind:'CURRENCY',tier:'HA',min:1,max:4,weight:100},{kind:'STACK',baseId:'spirit_dust',min:1,max:3,weight:45},{kind:'STACK',baseId:'spirit_herb',min:1,max:2,weight:28},{kind:'STACK',baseId:'iron_ore',min:1,max:2,weight:22},{kind:'INSTANCE',baseId:'iron_sword',weight:5}]),elite:Object.freeze([{kind:'CURRENCY',tier:'HA',min:5,max:12,weight:100},{kind:'STACK',baseId:'spirit_dust',min:2,max:6,weight:70},{kind:'STACK',baseId:'artifact_shard',min:1,max:2,weight:30},{kind:'STACK',baseId:'formation_ink',min:1,max:2,weight:22},{kind:'INSTANCE',baseId:'cloud_robe',weight:12},{kind:'INSTANCE',baseId:'spirit_ring',weight:8}]),boss:Object.freeze([{kind:'CURRENCY',tier:'HA',min:18,max:35,weight:100},{kind:'STACK',baseId:'spirit_dust',min:5,max:12,weight:100},{kind:'STACK',baseId:'artifact_shard',min:2,max:5,weight:100},{kind:'STACK',baseId:'formation_ink',min:2,max:5,weight:70},{kind:'INSTANCE',baseId:'spirit_ring',weight:35},{kind:'INSTANCE',baseId:'cloud_robe',weight:30}])});
const SHOPS=Object.freeze({thanh_van_shop:Object.freeze({id:'thanh_van_shop',name:'Thanh Vân Tạp Hóa',stock:Object.freeze([{baseId:'iron_sword',price:{tier:'HA',amount:80}},{baseId:'cloud_robe',price:{tier:'HA',amount:70}},{baseId:'spirit_ring',price:{tier:'HA',amount:120}},{baseId:'spirit_dust',quantity:10,price:{tier:'HA',amount:18}},{baseId:'spirit_herb',quantity:5,price:{tier:'HA',amount:20}}])})});
window.GameCore=window.GameCore||{};window.GameCore.economyCatalog=Object.freeze({TIERS,TIER_LABELS,ITEM_BASES,AFFIXES,LOOT_TABLES,SHOPS,MANUAL_CONVERSION_RATE:100});
})();