import { HumanRealmFactionNetwork, createGameWorldAdapter } from './src/config/factions/index.js';
const nodes = [
  { id:'hr', type:'realm', parentId:null },
  { id:'hr.continent.east', type:'continent', parentId:'hr', humanRealmContinentId:'east' },
  { id:'hr.continent.east.gr.test', type:'great_region', parentId:'hr.continent.east', regionId:'test', dominantElements:['Kiếm'] },
  { id:'hr.continent.east.gr.test.unit.alpha', type:'province', parentId:'hr.continent.east.gr.test', continentId:'east', regionId:'test', name:'Alpha Đạo', capital:'Alpha Đại Thành', products:['Linh Thảo'], minerals:['Kiếm Tinh'], enemyProfile:{minRealmIdx:6,maxRealmIdx:10,bossRealmIdx:11,dominantElements:['Kiếm']} }
];
const manifest=[{id:3,nodeId:'hr.continent.east.gr.test.unit.alpha',canonicalKey:'map_alpha_dao',type:'combat_wild',uiMode:'combat_battlefield',isPeaceZone:false}];
const adapter=createGameWorldAdapter({worldNodes:nodes,territoryManifest:manifest,worldSeed:'demo'});
const network=new HumanRealmFactionNetwork({worldSeed:'demo',worldAdapter:adapter});
const tid=adapter.getAllTerritoryIds()[0];
console.log({ territory: adapter.getTerritory(tid), controllers: network.getTerritoryControllers(tid), active: network.getRelevantFactionsForTerritory(tid,{limit:8}).map(f=>f.name) });
