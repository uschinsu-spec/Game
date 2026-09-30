import { JURISDICTION_NODE_TYPES, SITE_NODE_TYPES } from '../core/factionConstants.js';

const DENSITY = Object.freeze({ south:1.08,east:1.0,west:.78,north:.82,central:1.32 });
const CONTINENTS = new Set(['south','east','west','north','central']);
const TYPE_TO_SCOPE = Object.freeze({realm:'HUMAN_REALM',continent:'CONTINENT',great_region:'PRIMARY_REGION',province:'SECONDARY_TERRITORY',nation:'NATION',commandery:'COMMANDERY',city_territory:'CITY',settlement:'SETTLEMENT',location:'SITE'});

function makeIndex(worldNodes){
  const byId=new Map(),children=new Map();
  for(const node of worldNodes){byId.set(node.id,node);const p=node.parentId??'__root__';if(!children.has(p))children.set(p,[]);children.get(p).push(node);}
  return {byId,children,jurisdictions:worldNodes.filter(n=>JURISDICTION_NODE_TYPES.includes(n.type)),sites:worldNodes.filter(n=>SITE_NODE_TYPES.includes(n.type)),territories:worldNodes.filter(n=>n.type==='province')};
}
function resolveContinent(node,byId){let cur=node,seen=new Set();while(cur&&!seen.has(cur.id)){seen.add(cur.id);if(CONTINENTS.has(cur.continentId))return cur.continentId;if(CONTINENTS.has(cur.humanRealmContinentId))return cur.humanRealmContinentId;if(cur.type==='continent'){if(cur.id==='nl'||/Nam Lăng/i.test(cur.name))return 'south';if(/Đông Huyền/i.test(cur.name))return 'east';if(/Tây Mạc/i.test(cur.name))return 'west';if(/Bắc Minh/i.test(cur.name))return 'north';if(/Trung Vực/i.test(cur.name))return 'central';}cur=cur.parentId?byId.get(cur.parentId):null;}return 'south';}
function compactNode(node,index){if(!node)return null;const parent=node.parentId?index.byId.get(node.parentId):null;return Object.freeze({id:node.id,nodeId:node.id,type:node.type,scope:TYPE_TO_SCOPE[node.type]||'LOCAL',name:node.name,parentId:node.parentId||null,continentKey:resolveContinent(node,index.byId),regionId:node.regionId||parent?.regionId||null,regionName:node.regionName||parent?.name||null,displayTypeLabel:node.displayTypeLabel||null,locationKind:node.locationKind||null,theme:node.theme||parent?.theme||'',climate:node.climate||parent?.climate||null,elements:Object.freeze([...(node.enemyProfile?.dominantElements||node.dominantElements||parent?.dominantElements||[])]),products:Object.freeze([...(node.products||node.signatureProducts||[])]),minerals:Object.freeze([...(node.minerals||node.signatureMinerals||[])]),enemyProfile:node.enemyProfile||null,capital:node.capital||null,realmRange:node.realmRange||null,playableMapId:node.playableMapId??null,rawNode:node});}
export function createGameWorldAdapter({worldNodes=[],worldSeed='game-default'}={}){
 let index=null;const idx=()=>index||(index=makeIndex(worldNodes));
 function getNode(id){return idx().byId.get(id)||null;}
 function ancestors(id,includeSelf=false){const out=[];let cur=includeSelf?getNode(id):getNode(getNode(id)?.parentId);const seen=new Set();while(cur&&!seen.has(cur.id)){seen.add(cur.id);out.push(compactNode(cur,idx()));cur=cur.parentId?getNode(cur.parentId):null;}return Object.freeze(out);}
 function nearest(id,type){let cur=getNode(id),seen=new Set();while(cur&&!seen.has(cur.id)){if(cur.type===type)return compactNode(cur,idx());seen.add(cur.id);cur=cur.parentId?getNode(cur.parentId):null;}return null;}
 function territoryFor(id){return nearest(id,'province');}
 return Object.freeze({
  worldSeed,
  getWorldNode:id=>getNode(id),
  getNode:id=>compactNode(getNode(id),idx()),
  getChildren:(id,{offset=0,limit=50,types=null}={})=>{let list=idx().children.get(id)||[];if(types)list=list.filter(n=>types.includes(n.type));return Object.freeze(list.slice(Math.max(0,offset),Math.max(0,offset)+Math.max(1,limit)).map(n=>compactNode(n,idx())));},
  getChildCount:(id,types=null)=>{const list=idx().children.get(id)||[];return types?list.filter(n=>types.includes(n.type)).length:list.length;},
  getAncestors:ancestors,
  getJurisdiction:id=>{const n=getNode(id);return n&&JURISDICTION_NODE_TYPES.includes(n.type)?compactNode(n,idx()):null;},
  getSite:id=>{const n=getNode(id);return n&&SITE_NODE_TYPES.includes(n.type)?compactNode(n,idx()):null;},
  getTerritory:id=>{const n=getNode(id);if(n?.type==='province')return compactNode(n,idx());return territoryFor(id);},
  getTerritoryForWorldNode:territoryFor,
  getAllTerritories:()=>Object.freeze(idx().territories.map(n=>compactNode(n,idx()))),
  getAllTerritoryIds:()=>Object.freeze(idx().territories.map(n=>n.id)),
  getAllJurisdictionIds:()=>Object.freeze(idx().jurisdictions.map(n=>n.id)),
  getAllSiteIds:()=>Object.freeze(idx().sites.map(n=>n.id)),
  getContinentKeyForNode:id=>resolveContinent(getNode(id),idx().byId),
  getContinentKeyForTerritory:id=>resolveContinent(getNode(id)||getNode(territoryFor(id)?.id),idx().byId),
  getCivilizationDensity:id=>DENSITY[resolveContinent(getNode(id)||getNode(territoryFor(id)?.id),idx().byId)]||1,
  getImportance:id=>{const n=getNode(id);if(!n)return 1;if(n.type==='great_region')return 1.45;if(n.type==='province')return 1.25;if(n.type==='nation')return 1.15;if(n.type==='city_territory')return 1.05;if(n.type==='settlement')return .72;return .6;},
  resolveTerritoryId:id=>territoryFor(typeof id==='object'?(id.locationNodeId||id.nodeId||id.geography?.nodeId||id.id):id)?.id||null,
  resolveJurisdictionForNode:id=>{let cur=getNode(id),seen=new Set();while(cur&&!seen.has(cur.id)){if(JURISDICTION_NODE_TYPES.includes(cur.type))return compactNode(cur,idx());seen.add(cur.id);cur=cur.parentId?getNode(cur.parentId):null;}return null;},
  validateGeography({expectedTerritories=437}={}){const counts={};for(const n of worldNodes)counts[n.type]=(counts[n.type]||0)+1;return Object.freeze({ok:(counts.province||0)===expectedTerritories&&!(worldNodes.some(n=>n.factionProfile||n.cultivationFactions||n.apexSect||n.makeFactionProfile)),nodeCount:worldNodes.length,counts:Object.freeze(counts),legacyFactionFields:worldNodes.filter(n=>n.factionProfile||n.cultivationFactions||n.apexSect||n.makeFactionProfile).map(n=>n.id)});}
 });
}
