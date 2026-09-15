(()=>{'use strict';
const TIERS=Object.freeze(['HA','TRUNG','THUONG','CUC']);
const TIER_LABELS=Object.freeze({HA:'Hạ Phẩm',TRUNG:'Trung Phẩm',THUONG:'Thượng Phẩm',CUC:'Cực Phẩm'});
const ITEM_BASES=Object.freeze({
 spirit_dust:Object.freeze({id:'spirit_dust',name:'Linh Trần',type:'MATERIAL',stackable:true,maxStack:9999,value:{tier:'HA',amount:2}}),
 iron_sword:Object.freeze({id:'iron_sword',name:'Thanh Vân Thiết Kiếm',type:'EQUIPMENT',slot:'WEAPON',stackable:false,rarity:'COMMON',requirements:{majorRealmIndex:0},baseStats:{attack:8},value:{tier:'HA',amount:45}}),
 cloud_robe:Object.freeze({id:'cloud_robe',name:'Thanh Vân Đạo Bào',type:'EQUIPMENT',slot:'CHEST',stackable:false,rarity:'COMMON',requirements:{majorRealmIndex:0},baseStats:{maxHP:25,defense:4},value:{tier:'HA',amount:40}}),
 spirit_ring:Object.freeze({id:'spirit_ring',name:'Tụ Linh Giới',type:'EQUIPMENT',slot:'RING',stackable:false,rarity:'UNCOMMON',requirements:{majorRealmIndex:0},baseStats:{maxMana:15,attack:3},value:{tier:'HA',amount:60}})
});
const AFFIXES=Object.freeze({
 keen:Object.freeze({id:'keen',name:'Sắc Bén',stats:{attack:3}}),
 sturdy:Object.freeze({id:'sturdy',name:'Kiên Cố',stats:{defense:3,maxHP:12}}),
 flowing:Object.freeze({id:'flowing',name:'Lưu Vân',stats:{moveSpeed:.25,maxMana:8}})
});
const LOOT_TABLES=Object.freeze({
 mob:Object.freeze([{kind:'CURRENCY',tier:'HA',min:1,max:4,weight:100},{kind:'STACK',baseId:'spirit_dust',min:1,max:3,weight:45},{kind:'INSTANCE',baseId:'iron_sword',weight:5}]),
 elite:Object.freeze([{kind:'CURRENCY',tier:'HA',min:5,max:12,weight:100},{kind:'STACK',baseId:'spirit_dust',min:2,max:6,weight:70},{kind:'INSTANCE',baseId:'cloud_robe',weight:12},{kind:'INSTANCE',baseId:'spirit_ring',weight:8}]),
 boss:Object.freeze([{kind:'CURRENCY',tier:'HA',min:18,max:35,weight:100},{kind:'STACK',baseId:'spirit_dust',min:5,max:12,weight:100},{kind:'INSTANCE',baseId:'spirit_ring',weight:35},{kind:'INSTANCE',baseId:'cloud_robe',weight:30}])
});
const SHOPS=Object.freeze({thanh_van_shop:Object.freeze({id:'thanh_van_shop',name:'Thanh Vân Tạp Hóa',stock:Object.freeze([{baseId:'iron_sword',price:{tier:'HA',amount:80}},{baseId:'cloud_robe',price:{tier:'HA',amount:70}},{baseId:'spirit_ring',price:{tier:'HA',amount:120}},{baseId:'spirit_dust',quantity:10,price:{tier:'HA',amount:18}}])})});
window.GameCore=window.GameCore||{};window.GameCore.economyCatalog=Object.freeze({TIERS,TIER_LABELS,ITEM_BASES,AFFIXES,LOOT_TABLES,SHOPS,MANUAL_CONVERSION_RATE:100});
})();