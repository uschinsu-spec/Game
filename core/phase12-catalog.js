(()=>{'use strict';
const NPCS=Object.freeze({
 elder_yun:Object.freeze({id:'elder_yun',name:'Vân trưởng lão',role:'MENTOR',position:{x:1.8,y:0,z:3.2},services:['QUEST','MENTOR'],priority:80,range:3.2,dialogueId:'elder_intro'}),
 shopkeeper_lan:Object.freeze({id:'shopkeeper_lan',name:'Lan chưởng quỹ',role:'MERCHANT',position:{x:4.2,y:0,z:1.2},services:['SHOP'],priority:60,range:3,dialogueId:'shopkeeper_intro'}),
 alchemist_mo:Object.freeze({id:'alchemist_mo',name:'Mặc đan sư',role:'ALCHEMIST',position:{x:6.2,y:0,z:3.8},services:['ALCHEMY'],priority:60,range:3,dialogueId:'alchemist_intro'}),
 smith_han:Object.freeze({id:'smith_han',name:'Hàn khí sư',role:'SMITH',position:{x:-4.8,y:0,z:3.4},services:['CRAFT'],priority:60,range:3,dialogueId:'smith_intro'}),
 beastmaster_qin:Object.freeze({id:'beastmaster_qin',name:'Tần ngự thú sư',role:'BEASTMASTER',position:{x:-2.2,y:0,z:5.2},services:['PET'],priority:60,range:3,dialogueId:'beastmaster_intro'}),
 waypoint_keeper:Object.freeze({id:'waypoint_keeper',name:'Thủ môn truyền tống',role:'WAYPOINT',position:{x:0,y:0,z:-4.5},services:['WAYPOINT'],priority:70,range:3.2,dialogueId:'waypoint_intro'})
});
const DIALOGUES=Object.freeze({
 elder_intro:{id:'elder_intro',start:'root',nodes:{root:{speaker:'Vân trưởng lão',text:'Thanh Vân Sơn không dùng cấp độ chiến đấu. Muốn mạnh lên, hãy tu luyện, trang bị và hoàn thành việc trong thế giới.',choices:[{text:'Ta có thể giúp gì?',next:'quest'},{text:'Chỉ dẫn tu luyện',actions:[{type:'OPEN_SERVICE',service:'MENTOR'}]},{text:'Rời đi',end:true}]},quest:{speaker:'Vân trưởng lão',text:'Hãy thu thập Linh Trần và hạ yêu thú quanh sơn môn.',choices:[{text:'Nhận nhiệm vụ',actions:[{type:'START_QUEST',questId:'q_cleanse_foothill'}],end:true},{text:'Để sau',end:true}]}}},
 shopkeeper_intro:{id:'shopkeeper_intro',start:'root',nodes:{root:{speaker:'Lan chưởng quỹ',text:'Muốn mua bán vật phẩm thì xem hàng trực tiếp ở quầy.',choices:[{text:'Mở cửa hàng',actions:[{type:'OPEN_SERVICE',service:'SHOP',serviceId:'thanh_van_shop'}]},{text:'Rời đi',end:true}]}}},
 alchemist_intro:{id:'alchemist_intro',start:'root',nodes:{root:{speaker:'Mặc đan sư',text:'Đan lô chỉ nhận công thức hợp phẩm và nguyên liệu đã đặt trước.',choices:[{text:'Luyện đan',actions:[{type:'OPEN_SERVICE',service:'ALCHEMY',stationId:'jade_furnace_node'}]},{text:'Rời đi',end:true}]}}},
 smith_intro:{id:'smith_intro',start:'root',nodes:{root:{speaker:'Hàn khí sư',text:'Luyện khí, tinh luyện, tái chú và phân giải đều phải qua Luyện Khí Đài.',choices:[{text:'Mở Luyện Khí Đài',actions:[{type:'OPEN_SERVICE',service:'CRAFT',stationId:'forge_node'}]},{text:'Rời đi',end:true}]}}},
 beastmaster_intro:{id:'beastmaster_intro',start:'root',nodes:{root:{speaker:'Tần ngự thú sư',text:'Linh thú không có cấp. Hãy bồi dưỡng bằng Tu Vi, huyết mạch và thân mật.',choices:[{text:'Quản lý linh thú',actions:[{type:'OPEN_SERVICE',service:'PET'}]},{text:'Rời đi',end:true}]}}},
 waypoint_intro:{id:'waypoint_intro',start:'root',nodes:{root:{speaker:'Thủ môn truyền tống',text:'Ta có thể đưa ngươi về sân Thanh Vân nếu cần.',choices:[{text:'Dịch chuyển về sân',actions:[{type:'TELEPORT',waypointId:'thanh_van_courtyard'}],end:true},{text:'Rời đi',end:true}]}}}
});
const QUESTS=Object.freeze({q_cleanse_foothill:Object.freeze({id:'q_cleanse_foothill',name:'Tĩnh Yên Sơn Môn',giverNpcId:'elder_yun',turnInNpcId:'elder_yun',objectives:Object.freeze([{id:'kill',type:'KILL',count:3,filter:{kind:'ENEMY'}},{id:'dust',type:'PICKUP',count:3,filter:{baseId:'spirit_dust'}}]),rewards:Object.freeze([{kind:'CURRENCY',tier:'HA',amount:30},{kind:'STACK',baseId:'spirit_herb',quantity:4}]),flagsOnComplete:Object.freeze({foothill_cleansed:true}),markerNpcId:'elder_yun'})});
const WAYPOINTS=Object.freeze({thanh_van_courtyard:Object.freeze({id:'thanh_van_courtyard',name:'Sân Thanh Vân',position:{x:0,y:0,z:0},zoneId:'thanh_van_region'})});
window.GameCore=window.GameCore||{};window.GameCore.phase12Catalog=Object.freeze({NPCS,DIALOGUES,QUESTS,WAYPOINTS});
})();