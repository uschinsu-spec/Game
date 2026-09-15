(()=>{'use strict';
const QUALITY=Object.freeze(['HA','TRUNG','THUONG','CUC']),QUALITY_MULT=Object.freeze({HA:1,TRUNG:1.25,THUONG:1.6,CUC:2});
const FURNACES=Object.freeze({
 bronze_furnace:Object.freeze({id:'bronze_furnace',name:'Thanh Đồng Đan Lô',maxGrade:2,qualityBonus:0}),
 jade_furnace:Object.freeze({id:'jade_furnace',name:'Bạch Ngọc Đan Lô',maxGrade:4,qualityBonus:.12}),
 celestial_furnace:Object.freeze({id:'celestial_furnace',name:'Thiên Hỏa Đan Lô',maxGrade:5,qualityBonus:.24})
});
const RECIPES=Object.freeze({
 heal_pill_g1:Object.freeze({id:'heal_pill_g1',system:'ALCHEMY',name:'Hồi Nguyên Đan',stationType:'FURNACE',furnaceMin:'bronze_furnace',grade:1,duration:4,successChance:.96,inputs:[{baseId:'spirit_herb',quantity:2},{baseId:'spirit_dust',quantity:1}],output:{baseId:'healing_pill',type:'PILL',grade:1}}),
 mana_pill_g2:Object.freeze({id:'mana_pill_g2',system:'ALCHEMY',name:'Tụ Linh Đan',stationType:'FURNACE',furnaceMin:'bronze_furnace',grade:2,duration:6,successChance:.9,inputs:[{baseId:'spirit_herb',quantity:2},{baseId:'spirit_dust',quantity:3}],output:{baseId:'mana_pill',type:'PILL',grade:2}}),
 cultivation_pill_g3:Object.freeze({id:'cultivation_pill_g3',system:'ALCHEMY',name:'Tăng Tu Đan',stationType:'FURNACE',furnaceMin:'jade_furnace',grade:3,duration:8,successChance:.82,inputs:[{baseId:'spirit_herb',quantity:4},{baseId:'spirit_dust',quantity:6}],output:{baseId:'cultivation_pill',type:'PILL',grade:3}}),
 battle_pill_g3:Object.freeze({id:'battle_pill_g3',system:'ALCHEMY',name:'Chiến Ý Đan',stationType:'FURNACE',furnaceMin:'jade_furnace',grade:3,duration:8,successChance:.84,inputs:[{baseId:'spirit_herb',quantity:3},{baseId:'spirit_dust',quantity:5}],output:{baseId:'battle_pill',type:'PILL',grade:3}}),
 breakthrough_pill_g4:Object.freeze({id:'breakthrough_pill_g4',system:'ALCHEMY',name:'Phá Cảnh Đan',stationType:'FURNACE',furnaceMin:'jade_furnace',grade:4,duration:10,successChance:.72,inputs:[{baseId:'spirit_herb',quantity:6},{baseId:'artifact_shard',quantity:2}],output:{baseId:'breakthrough_pill',type:'PILL',grade:4}}),
 cleanse_pill_g5:Object.freeze({id:'cleanse_pill_g5',system:'ALCHEMY',name:'Thanh Tâm Đan',stationType:'FURNACE',furnaceMin:'celestial_furnace',grade:5,duration:12,successChance:.64,inputs:[{baseId:'spirit_herb',quantity:8},{baseId:'artifact_shard',quantity:4}],output:{baseId:'cleanse_pill',type:'PILL',grade:5}}),
 craft_cloud_blade:Object.freeze({id:'craft_cloud_blade',system:'CRAFTING',action:'CREATE',name:'Rèn Vân Thiết Kiếm',stationType:'FORGE',duration:7,successChance:1,inputs:[{baseId:'iron_ore',quantity:4},{baseId:'spirit_dust',quantity:3}],output:{baseId:'iron_sword'}}),
 craft_cloud_robe:Object.freeze({id:'craft_cloud_robe',system:'CRAFTING',action:'CREATE',name:'May Thanh Vân Đạo Bào',stationType:'FORGE',duration:7,successChance:.96,inputs:[{baseId:'iron_ore',quantity:2},{baseId:'spirit_dust',quantity:4}],output:{baseId:'cloud_robe'}}),
 craft_jade_mirror:Object.freeze({id:'craft_jade_mirror',system:'CRAFTING',action:'CREATE',name:'Luyện Bạch Ngọc Kính',stationType:'FORGE',duration:10,successChance:.9,inputs:[{baseId:'artifact_shard',quantity:5},{baseId:'spirit_dust',quantity:8}],output:{baseId:'jade_mirror_artifact'}}),
 craft_spirit_array:Object.freeze({id:'craft_spirit_array',system:'CRAFTING',action:'CREATE',name:'Khắc Tụ Linh Trận Bàn',stationType:'FORMATION_TABLE',duration:10,successChance:.9,inputs:[{baseId:'formation_ink',quantity:5},{baseId:'spirit_dust',quantity:6}],output:{baseId:'spirit_gathering_plate'}}),
 craft_thunder_array:Object.freeze({id:'craft_thunder_array',system:'CRAFTING',action:'CREATE',name:'Khắc Lôi Sát Trận Bàn',stationType:'FORMATION_TABLE',duration:12,successChance:.82,inputs:[{baseId:'formation_ink',quantity:7},{baseId:'artifact_shard',quantity:3}],output:{baseId:'thunder_kill_plate'}}),
 enhance_item:Object.freeze({id:'enhance_item',system:'CRAFTING',action:'ENHANCE',name:'Cường Hóa',stationType:'FORGE',duration:4,successChance:.9,inputs:[{baseId:'spirit_dust',quantity:2}],output:null}),
 refine_item:Object.freeze({id:'refine_item',system:'CRAFTING',action:'REFINE',name:'Tinh Luyện',stationType:'FORGE',duration:5,successChance:.86,inputs:[{baseId:'spirit_dust',quantity:3}],output:null}),
 reforge_item:Object.freeze({id:'reforge_item',system:'CRAFTING',action:'REFORGE',name:'Tái Chú',stationType:'FORGE',duration:6,successChance:.82,inputs:[{baseId:'spirit_dust',quantity:4}],output:null}),
 salvage_item:Object.freeze({id:'salvage_item',system:'CRAFTING',action:'SALVAGE',name:'Phân Giải',stationType:'FORGE',duration:3,successChance:1,inputs:[],output:null})
});
const ARTIFACT_DEFS=Object.freeze({
 jade_mirror_artifact:Object.freeze({baseId:'jade_mirror_artifact',name:'Bạch Ngọc Huyền Kính',passiveStats:{defense:6,maxMana:18},active:{cooldown:18,shield:55,duration:5}})
});
const FORMATION_DEFS=Object.freeze({
 spirit_gathering_plate:Object.freeze({baseId:'spirit_gathering_plate',name:'Tụ Linh Trận',radius:7,kind:'MEDITATION',meditationMultiplier:1.35,persistence:'ZONE_PERSIST'}),
 thunder_kill_plate:Object.freeze({baseId:'thunder_kill_plate',name:'Lôi Sát Trận',radius:6,kind:'COMBAT',damage:12,tickInterval:1.5,persistence:'ZONE_PERSIST'})
});
window.GameCore=window.GameCore||{};window.GameCore.phase10Catalog=Object.freeze({QUALITY,QUALITY_MULT,FURNACES,RECIPES,ARTIFACT_DEFS,FORMATION_DEFS});
})();