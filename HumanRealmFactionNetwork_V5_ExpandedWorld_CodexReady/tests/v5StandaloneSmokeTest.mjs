import assert from 'node:assert/strict';
import { createGameWorldAdapter } from '../src/config/factions/game/gameWorldAdapter.js';
import { HumanRealmFactionNetwork } from '../src/config/factions/humanRealmFactionNetwork.js';
import { PLAYER_SECT_FACTIONS } from '../src/config/factions/core/playerSects.js';
import { assertUnifiedGameFactionBlueprint } from '../src/config/factions/validation/factionInvariant.js';
import { createEmptyFactionGameState } from '../src/config/factions/game/gameStateBridge.js';
import { serializeGameFactionState, hydrateFactionState } from '../src/config/factions/game/saveBridge.js';

const continentDefs=[['south','nl','Nam Lăng',9,108],['east','hr.cont.east','Đông Huyền',8,64],['west','hr.cont.west','Tây Mạc',7,49],['north','hr.cont.north','Bắc Minh',6,72],['central','hr.cont.central','Trung Vực',12,144]];
const nodes=[{id:'hr',type:'realm',name:'Nhân Giới',parentId:null}];
for(const [ck,cid,cname,regions,territories] of continentDefs){nodes.push({id:cid,type:'continent',name:cname,parentId:'hr',continentId:ck});for(let r=0;r<regions;r++)nodes.push({id:`${cid}.gr.${r}`,type:'great_region',name:`${cname} Vùng ${r}`,parentId:cid,continentId:ck,regionId:`r${r}`});for(let t=0;t<territories;t++){const gr=`${cid}.gr.${t%regions}`,p=`${cid}.prov.${t}`,n=`${p}.nation.0`,c=`${n}.city.0`,s=`${c}.settlement.0`,l=`${s}.loc.0`;nodes.push({id:p,type:'province',name:`${cname} Lãnh ${t}`,parentId:gr,continentId:ck,regionId:`r${t%regions}`,products:['linh thảo'],minerals:['linh thiết'],enemyProfile:{dominantElements:['Mộc']}});nodes.push({id:n,type:'nation',name:`Quốc ${t}`,parentId:p,continentId:ck});nodes.push({id:c,type:'city_territory',name:`Thành ${t}`,parentId:n,continentId:ck});nodes.push({id:s,type:'settlement',name:`Trấn ${t}`,parentId:c,continentId:ck});nodes.push({id:l,type:'location',name:`Hoang Dã ${t}`,parentId:s,continentId:ck,locationKind:'field'});}}
const adapter=createGameWorldAdapter({worldNodes:nodes,worldSeed:'test'});
const network=new HumanRealmFactionNetwork({worldSeed:'test',worldAdapter:adapter});
assert.equal(adapter.getAllTerritoryIds().length,437);
assert.equal(PLAYER_SECT_FACTIONS.length,9);
for(const id of adapter.getAllTerritoryIds()){const ctx=network.getJurisdictionFactionContext(id);assert.ok(ctx.factions.length>=5);for(const k of ['politicalController','cultivationController','economicController','securityController','intelligenceController','underworldController'])assert.ok(ctx.controllers[k],`${id} ${k}`);const nation=adapter.getChildren(id,{types:['nation'],limit:1})[0];const city=adapter.getChildren(nation.id,{types:['city_territory'],limit:1})[0];const settlement=adapter.getChildren(city.id,{types:['settlement'],limit:1})[0];const site=adapter.getChildren(settlement.id,{types:['location'],limit:1})[0];assert.ok(network.getJurisdictionFactionContext(nation.id));assert.ok(network.getJurisdictionFactionContext(city.id));assert.ok(network.getJurisdictionFactionContext(settlement.id));assert.ok(network.getFactionContextForWorldNode(site.id));}
const inv=assertUnifiedGameFactionBlueprint({network,worldAdapter:adapter,exhaustive:true});assert.equal(inv.checked,437);
const fs=createEmptyFactionGameState();const gs={factionState:{...fs,affiliations:{...fs.affiliations,CULTIVATION:{factionId:'van_kiem_tong',rankIdx:2,contribution:333}}}};const saved=serializeGameFactionState(gs);const fresh={};hydrateFactionState(fresh,saved);assert.equal(fresh.factionState.affiliations.CULTIVATION.factionId,'van_kiem_tong');assert.equal('sectId' in fresh,false);
console.log(JSON.stringify({ok:true,nodes:nodes.length,territories:437,playerSects:9,checked:inv.checked}));
