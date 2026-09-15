(()=>{'use strict';
const WORLD=Object.freeze({id:'game2_world',name:'Thanh Vân Tiên Vực',regions:['thanh_van_mountains']});
const REGIONS=Object.freeze({thanh_van_mountains:Object.freeze({id:'thanh_van_mountains',worldId:WORLD.id,name:'Thanh Vân Sơn Mạch',zones:['thanh_van_region']})});
const ZONES=Object.freeze({thanh_van_region:Object.freeze({
 id:'thanh_van_region',regionId:'thanh_van_mountains',name:'Thanh Vân Ngoại Sơn',builder:'enhancedWorld',
 bounds:Object.freeze({minX:-280,minZ:-280,maxX:280,maxZ:280}),chunkSize:80,streamRadius:1,
 spiritDensity:1.05,respawnAnchorId:'thanh_van_courtyard',
 terrain:Object.freeze({
  water:Object.freeze([{id:'linh_khe',center:{x:-36,z:32},radius:8}]),
  roads:Object.freeze([{id:'main_path',a:{x:0,z:-30},b:{x:0,z:42},width:5}]),
  blocked:Object.freeze([{id:'north_cliff',minX:-18,maxX:18,minZ:225,maxZ:280}])
 }),
 subZones:Object.freeze({
  thanh_van_hub:Object.freeze({id:'thanh_van_hub',name:'Thanh Vân Sơn Môn',center:{x:0,z:0},radius:16,populationBudget:0,groups:Object.freeze([]),spiritDensity:1.25,safe:true}),
  thanh_truc_lam:Object.freeze({id:'thanh_truc_lam',name:'Thanh Trúc Lâm',center:{x:18,z:18},radius:18,populationBudget:4,groups:Object.freeze([{templateId:'bamboo_cactoro',weight:3},{templateId:'bamboo_dragon',weight:1}]),spiritDensity:1.12}),
  linh_khe_coc:Object.freeze({id:'linh_khe_coc',name:'Linh Khê Cốc',center:{x:-24,z:20},radius:16,populationBudget:3,groups:Object.freeze([{templateId:'creek_cactoro',weight:2},{templateId:'creek_dragon',weight:1}]),spiritDensity:1.18})
 }),
 pois:Object.freeze([
  {id:'thanh_van_courtyard',type:'WAYPOINT',name:'Sân Thanh Vân',position:{x:0,y:0,z:0},discoverRadius:12},
  {id:'spirit_lake',type:'LANDMARK',name:'Linh Khê',position:{x:-36,y:0,z:32},discoverRadius:18},
  {id:'bamboo_shrine',type:'LANDMARK',name:'Trúc Lâm Cổ Đình',position:{x:26,y:0,z:24},discoverRadius:18}
 ]),
 resourceNodes:Object.freeze([
  {id:'herb_01',baseId:'spirit_herb',position:{x:13,y:0,z:16},quantity:2,respawnSeconds:35},
  {id:'ore_01',baseId:'iron_ore',position:{x:-18,y:0,z:11},quantity:2,respawnSeconds:45}
 ]),
 respawnAnchors:Object.freeze([{id:'thanh_van_courtyard',position:{x:0,y:0,z:0},safe:true}])
})});
const WAYPOINTS=Object.freeze({thanh_van_courtyard:Object.freeze({id:'thanh_van_courtyard',name:'Sân Thanh Vân',zoneId:'thanh_van_region',position:{x:0,y:0,z:0},unlockOnDiscover:true})});
window.GameCore=window.GameCore||{};window.GameCore.phase13Catalog=Object.freeze({WORLD,REGIONS,ZONES,WAYPOINTS});
})();