(()=>{'use strict';
const WORLD=Object.freeze({id:'game2_world',name:'Thanh Vân Tiên Vực',regions:['thanh_van_mountains']});
const REGIONS=Object.freeze({thanh_van_mountains:Object.freeze({id:'thanh_van_mountains',worldId:WORLD.id,name:'Thanh Vân Sơn Mạch',zones:['thanh_van_region','thanh_truc_lam_zone','linh_khe_coc_zone','van_son_dao_zone','thanh_van_dinh_zone','co_dong_thanh_van_zone']})});
const zone=x=>Object.freeze(x),sub=x=>Object.freeze(x);
const ZONES=Object.freeze({
thanh_van_region:zone({
  id:'thanh_van_region',
  regionId:'thanh_van_mountains',
  name:'Thanh Vân Thôn',
  builder:'enhancedWorld',
  bounds:{minX:-600,minZ:-600,maxX:600,maxZ:600},
  chunkSize:200,
  streamRadius:2,
  spiritDensity:1.18,
  respawnAnchorId:'thanh_van_courtyard',
  visual:{grass:'#58b843',road:'#b59c74',rock:'#7e8d88',water:'#42a6c2',accent:'#dfc27e'},
  terrain:{water:[],roads:[],blocked:[]},
  subZones:{thanh_van_hub:sub({id:'thanh_van_hub',name:'Khu An Toàn Thanh Vân',center:{x:0,z:-6},radius:56,populationBudget:0,groups:[],spiritDensity:1.28,safe:true})},
  pois:[
    {id:'thanh_van_courtyard',type:'WAYPOINT',name:'Sân Thanh Vân',position:{x:0,y:0,z:0},discoverRadius:16},
    {id:'village_palace',type:'LANDMARK',name:'Đại Điện Thanh Vân',position:{x:0,y:0,z:32},discoverRadius:16},
    {id:'village_guest_lodge',type:'LANDMARK',name:'Nhà Khách Đông Các',position:{x:26,y:0,z:26},discoverRadius:16},
    {id:'village_market',type:'LANDMARK',name:'Thanh Vân Phường Thị',position:{x:28,y:0,z:0},discoverRadius:16},
    {id:'village_forge',type:'LANDMARK',name:'Lò Rèn Thanh Vân',position:{x:26,y:0,z:-26},discoverRadius:16},
    {id:'village_alchemy',type:'LANDMARK',name:'Đan Các Dược Phường',position:{x:-26,y:0,z:-26},discoverRadius:16},
    {id:'village_cultivation',type:'LANDMARK',name:'Đài Tĩnh Tu',position:{x:-28,y:0,z:0},discoverRadius:16},
    {id:'village_beast',type:'LANDMARK',name:'Linh Thú Viên',position:{x:-26,y:0,z:26},discoverRadius:16},
    {id:'village_residential',type:'LANDMARK',name:'Khu Nhà Dân',position:{x:0,y:0,z:-42},discoverRadius:16}
  ],
  resourceNodes:[
    {id:'village_herb_01',baseId:'spirit_herb',position:{x:-22,y:0,z:-20},quantity:2,respawnSeconds:35},
    {id:'village_herb_02',baseId:'spirit_herb',position:{x:22,y:0,z:20},quantity:2,respawnSeconds:35}
  ],
  respawnAnchors:[{id:'thanh_van_courtyard',position:{x:0,y:0,z:0},safe:true}],
  connections:[
    {id:'to_creek',toZoneId:'linh_khe_coc_zone',at:{x:0,y:0,z:-62},arrival:{x:0,y:0,z:-220},label:'Linh Khê Cốc'},
    {id:'to_bamboo',toZoneId:'thanh_truc_lam_zone',at:{x:-38,y:0,z:0},arrival:{x:0,y:0,z:-54},label:'Thanh Trúc Lâm'},
    {id:'to_road',toZoneId:'van_son_dao_zone',at:{x:38,y:0,z:0},arrival:{x:0,y:0,z:-54},label:'Vân Sơn Đạo'},
    {id:'to_peak',toZoneId:'thanh_van_dinh_zone',at:{x:0,y:0,z:46},arrival:{x:0,y:0,z:-40},label:'Thanh Vân Đỉnh'}
  ]
}),

thanh_truc_lam_zone:zone({
  id:'thanh_truc_lam_zone',
  regionId:'thanh_van_mountains',
  name:'Thanh Trúc Lâm',
  builder:'enhancedWorld',
  bounds:{minX:-90,minZ:-90,maxX:90,maxZ:90},
  chunkSize:90,
  streamRadius:1,
  spiritDensity:1.12,
  respawnAnchorId:'bamboo_waypoint',
  visual:{grass:'#50ba56',road:'#a99770',rock:'#73937d',water:'#4fc6ca',accent:'#87e88d'},
  terrain:{water:[{id:'bamboo_pool',center:{x:35,z:18},radius:10}],roads:[],blocked:[{id:'bamboo_wall_l',minX:-90,maxX:-75,minZ:-90,maxZ:90},{id:'bamboo_wall_r',minX:75,maxX:90,minZ:-90,maxZ:90}]},
  subZones:{bamboo_deep:sub({id:'bamboo_deep',name:'Trúc Lâm Nội Vi',center:{x:0,z:8},radius:60,populationBudget:6,groups:[{templateId:'bamboo_cactoro',weight:4},{templateId:'bamboo_dragon',weight:1}],spiritDensity:1.16})},
  pois:[{id:'bamboo_waypoint',type:'WAYPOINT',name:'Trúc Lâm Đạo Tiêu',position:{x:0,y:0,z:-45},discoverRadius:12},{id:'bamboo_shrine',type:'LANDMARK',name:'Trúc Lâm Cổ Đình',position:{x:30,y:0,z:36},discoverRadius:18}],
  resourceNodes:[{id:'herb_bamboo_01',baseId:'spirit_herb',position:{x:25,y:0,z:22},quantity:2,respawnSeconds:35},{id:'herb_bamboo_02',baseId:'spirit_herb',position:{x:-25,y:0,z:28},quantity:2,respawnSeconds:35}],
  respawnAnchors:[{id:'bamboo_waypoint',position:{x:0,y:0,z:-45},safe:true}],
  connections:[{id:'back_village',toZoneId:'thanh_van_region',at:{x:0,y:0,z:-58},arrival:{x:0,y:0,z:58},label:'Thanh Vân Thôn'},{id:'to_creek',toZoneId:'linh_khe_coc_zone',at:{x:0,y:0,z:68},arrival:{x:0,y:0,z:-220},label:'Linh Khê Cốc'}]
}),

linh_khe_coc_zone:zone({
  id:'linh_khe_coc_zone',
  regionId:'thanh_van_mountains',
  name:'Linh Khê Cốc',
  builder:'enhancedWorld',
  bounds:{minX:-700,minZ:-700,maxX:700,maxZ:700},
  chunkSize:140,
  streamRadius:2,
  spiritDensity:1.24,
  respawnAnchorId:'creek_waypoint',
  visual:{grass:'#56be65',road:'#a8976f',rock:'#6d8892',water:'#32b2d4',accent:'#69ddff'},
  terrain:{water:[{id:'creek_river',center:{x:-120,z:50},radius:85},{id:'creek_spring',center:{x:220,z:280},radius:60},{id:'creek_great_lake',center:{x:0,z:-160},radius:100}],roads:[],blocked:[{id:'creek_cliff',minX:-700,maxX:-550,minZ:-50,maxZ:700}]},
  subZones:{creek_valley:sub({id:'creek_valley',name:'Linh Khê Cốc',center:{x:0,z:0},radius:480,populationBudget:15,groups:[{templateId:'creek_cactoro',weight:4},{templateId:'creek_dragon',weight:3}],spiritDensity:1.26})},
  pois:[{id:'creek_waypoint',type:'WAYPOINT',name:'Linh Khê Đạo Tiêu',position:{x:0,y:0,z:-220},discoverRadius:20},{id:'spirit_lake',type:'LANDMARK',name:'Linh Tuyền Tiên Trì',position:{x:220,y:0,z:280},discoverRadius:35},{id:'creek_depths',type:'LANDMARK',name:'Cốc Để Linh Mạch',position:{x:-120,y:0,z:50},discoverRadius:30}],
  resourceNodes:[
    {id:'ore_creek_01',baseId:'iron_ore',position:{x:160,y:0,z:120},quantity:4,respawnSeconds:40},
    {id:'ore_creek_02',baseId:'iron_ore',position:{x:-220,y:0,z:-100},quantity:4,respawnSeconds:40},
    {id:'herb_creek_01',baseId:'spirit_herb',position:{x:-100,y:0,z:220},quantity:4,respawnSeconds:30},
    {id:'herb_creek_02',baseId:'spirit_herb',position:{x:120,y:0,z:-280},quantity:4,respawnSeconds:30}
  ],
  respawnAnchors:[{id:'creek_waypoint',position:{x:0,y:0,z:-220},safe:true}],
  connections:[{id:'back_bamboo',toZoneId:'thanh_truc_lam_zone',at:{x:0,y:0,z:-250},arrival:{x:0,y:0,z:62},label:'Thanh Trúc Lâm'},{id:'to_road',toZoneId:'van_son_dao_zone',at:{x:160,y:0,z:380},arrival:{x:0,y:0,z:-54},label:'Vân Sơn Đạo'}]
}),

van_son_dao_zone:zone({
  id:'van_son_dao_zone',
  regionId:'thanh_van_mountains',
  name:'Vân Sơn Đạo',
  builder:'enhancedWorld',
  bounds:{minX:-90,minZ:-90,maxX:90,maxZ:90},
  chunkSize:90,
  streamRadius:1,
  spiritDensity:1.08,
  respawnAnchorId:'road_waypoint',
  visual:{grass:'#6eb855',road:'#bca476',rock:'#8b998f',water:'#58a8c4',accent:'#f0c86d'},
  terrain:{water:[],roads:[],blocked:[{id:'road_cliff_l',minX:-90,maxX:-50,minZ:-90,maxZ:90},{id:'road_cliff_r',minX:50,maxX:90,minZ:-90,maxZ:90}]},
  subZones:{mountain_road:sub({id:'mountain_road',name:'Vân Sơn Đạo',center:{x:0,z:4},radius:62,populationBudget:6,groups:[{templateId:'road_mushnub',weight:3},{templateId:'road_armabee',weight:2},{templateId:'road_brute',weight:1}],spiritDensity:1.1})},
  pois:[{id:'road_waypoint',type:'WAYPOINT',name:'Vân Sơn Đạo Tiêu',position:{x:0,y:0,z:-45},discoverRadius:12},{id:'cloud_gate',type:'LANDMARK',name:'Vân Môn',position:{x:0,y:0,z:35},discoverRadius:16}],
  resourceNodes:[{id:'ore_road_01',baseId:'iron_ore',position:{x:22,y:0,z:24},quantity:3,respawnSeconds:45}],
  respawnAnchors:[{id:'road_waypoint',position:{x:0,y:0,z:-45},safe:true}],
  connections:[{id:'back_creek',toZoneId:'linh_khe_coc_zone',at:{x:0,y:0,z:-65},arrival:{x:150,y:0,z:360},label:'Linh Khê Cốc'},{id:'to_peak',toZoneId:'thanh_van_dinh_zone',at:{x:0,y:0,z:65},arrival:{x:0,y:0,z:-54},label:'Thanh Vân Đỉnh'}]
}),

thanh_van_dinh_zone:zone({
  id:'thanh_van_dinh_zone',
  regionId:'thanh_van_mountains',
  name:'Thanh Vân Đỉnh',
  builder:'enhancedWorld',
  bounds:{minX:-90,minZ:-90,maxX:90,maxZ:90},
  chunkSize:90,
  streamRadius:1,
  spiritDensity:1.42,
  respawnAnchorId:'peak_waypoint',
  visual:{grass:'#7ec46e',road:'#ccb991',rock:'#94a0a3',water:'#6ebed6',accent:'#f8e8a3'},
  terrain:{water:[],roads:[],blocked:[{id:'peak_edge_l',minX:-90,maxX:-55,minZ:-90,maxZ:90},{id:'peak_edge_r',minX:55,maxX:90,minZ:-90,maxZ:90}]},
  subZones:{peak_sanctum:sub({id:'peak_sanctum',name:'Thanh Vân Đỉnh',center:{x:0,z:10},radius:55,populationBudget:4,groups:[{templateId:'peak_dragon',weight:2},{templateId:'peak_ghost',weight:1}],spiritDensity:1.5})},
  pois:[{id:'peak_waypoint',type:'WAYPOINT',name:'Thanh Vân Đỉnh Trận',position:{x:0,y:0,z:-42},discoverRadius:14},{id:'peak_altar',type:'LANDMARK',name:'Tĩnh Tâm Đài',position:{x:0,y:0,z:28},discoverRadius:18}],
  resourceNodes:[{id:'peak_herb_01',baseId:'spirit_herb',position:{x:22,y:0,z:20},quantity:3,respawnSeconds:50}],
  respawnAnchors:[{id:'peak_waypoint',position:{x:0,y:0,z:-42},safe:true}],
  connections:[{id:'back_road',toZoneId:'van_son_dao_zone',at:{x:0,y:0,z:-65},arrival:{x:0,y:0,z:58},label:'Vân Sơn Đạo'},{id:'to_cave',toZoneId:'co_dong_thanh_van_zone',at:{x:38,y:0,z:40},arrival:{x:0,y:0,z:-52},label:'Cổ Động Thanh Vân'}]
}),

co_dong_thanh_van_zone:zone({
  id:'co_dong_thanh_van_zone',
  regionId:'thanh_van_mountains',
  name:'Cổ Động Thanh Vân',
  builder:'enhancedWorld',
  bounds:{minX:-70,minZ:-70,maxX:70,maxZ:70},
  chunkSize:70,
  streamRadius:1,
  spiritDensity:1.32,
  respawnAnchorId:'cave_entrance',
  visual:{grass:'#457357',road:'#6a645c',rock:'#505f69',water:'#387f94',accent:'#9fd4ff',cave:true},
  terrain:{water:[{id:'cave_pool',center:{x:-26,z:22},radius:8}],roads:[],blocked:[{id:'cave_wall_l',minX:-70,maxX:-48,minZ:-70,maxZ:70},{id:'cave_wall_r',minX:48,maxX:70,minZ:-70,maxZ:70}]},
  subZones:{ancient_cave:sub({id:'ancient_cave',name:'Cổ Động Thanh Vân',center:{x:0,z:4},radius:54,populationBudget:5,groups:[{templateId:'cave_ghost',weight:3},{templateId:'cave_demon',weight:2}],spiritDensity:1.34})},
  pois:[{id:'cave_entrance',type:'WAYPOINT',name:'Cổ Động Ngoại Môn',position:{x:0,y:0,z:-45},discoverRadius:12},{id:'cave_seal',type:'LANDMARK',name:'Ma Ấn Cổ Động',position:{x:0,y:0,z:36},discoverRadius:18}],
  resourceNodes:[{id:'ore_cave_01',baseId:'iron_ore',position:{x:25,y:0,z:10},quantity:4,respawnSeconds:55},{id:'artifact_cave_01',baseId:'artifact_shard',position:{x:-20,y:0,z:30},quantity:1,respawnSeconds:80}],
  respawnAnchors:[{id:'cave_entrance',position:{x:0,y:0,z:-45},safe:true}],
  connections:[{id:'back_peak',toZoneId:'thanh_van_dinh_zone',at:{x:0,y:0,z:-60},arrival:{x:35,y:0,z:36},label:'Thanh Vân Đỉnh'}]
})
});

const WAYPOINTS=Object.freeze({
  thanh_van_courtyard:Object.freeze({id:'thanh_van_courtyard',name:'Sân Thanh Vân',zoneId:'thanh_van_region',position:{x:0,y:0,z:0},unlockOnDiscover:true}),
  bamboo_waypoint:Object.freeze({id:'bamboo_waypoint',name:'Trúc Lâm Đạo Tiêu',zoneId:'thanh_truc_lam_zone',position:{x:0,y:0,z:-45},unlockOnDiscover:true}),
  creek_waypoint:Object.freeze({id:'creek_waypoint',name:'Linh Khê Đạo Tiêu',zoneId:'linh_khe_coc_zone',position:{x:0,y:0,z:-220},unlockOnDiscover:true}),
  road_waypoint:Object.freeze({id:'road_waypoint',name:'Vân Sơn Đạo Tiêu',zoneId:'van_son_dao_zone',position:{x:0,y:0,z:-45},unlockOnDiscover:true}),
  peak_waypoint:Object.freeze({id:'peak_waypoint',name:'Thanh Vân Đỉnh Trận',zoneId:'thanh_van_dinh_zone',position:{x:0,y:0,z:-42},unlockOnDiscover:true}),
  cave_entrance:Object.freeze({id:'cave_entrance',name:'Cổ Động Ngoại Môn',zoneId:'co_dong_thanh_van_zone',position:{x:0,y:0,z:-45},unlockOnDiscover:true})
});

window.GameCore=window.GameCore||{};
window.GameCore.phase13Catalog=Object.freeze({WORLD,REGIONS,ZONES,WAYPOINTS});
})();