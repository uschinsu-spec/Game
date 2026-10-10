import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeWorld} from '../src/world.js';
import {SAVE_KEY} from '../src/core/config.js';
import {Engine} from '../src/cultivation.js';
import {
  BEAST_MATERIALS,CORE_QUALITIES,BEAST_CORE_DROP_CHANCE,beastRankForFloor,
  lootInfo,rollCoreQuality,generateBeastLoot,sellCommonMaterials
} from '../src/core/beast-loot.js';

const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
function game(mapId='map2'){
  const g=Object.assign(Object.create(Game.prototype),{
    mapId,state:makeWorld(mapId),mapStates:{},toast(){},ui:{toast(){}}
  });
  g.player=g.makePlayer();g.refreshEnemies();g.ensureNPCs();return g;
}

// Rank 0 deer has no core; starting from floor 2, the wolf is rank 1.
assert.equal(beastRankForFloor(1),0);
assert.equal(beastRankForFloor(2),1);
assert.equal(beastRankForFloor(13),1);
assert.equal(beastRankForFloor(14),2);
assert.equal(beastRankForFloor(98),9);
assert.equal(beastRankForFloor(99),9);
assert.equal(makeWorld('map').enemies[0].beastRank,0);
assert.equal(makeWorld('map2').enemies[0].beastRank,1);
assert.equal(makeWorld('map14').enemies[0].beastRank,2);
assert.equal(makeWorld('map99').enemies[0].beastRank,9);

assert.equal(CORE_QUALITIES.length,4);
assert.equal(CORE_QUALITIES.reduce((s,q)=>s+q.weight,0),1);
assert.equal(BEAST_CORE_DROP_CHANCE,.35);
for(const [roll,quality] of [[0,'ha'],[.69999,'ha'],[.70,'trung'],[.89999,'trung'],[.90,'thuong'],[.97999,'thuong'],[.98,'cuc'],[.99999,'cuc']]){
  assert.equal(rollCoreQuality(()=>roll).id,quality,'Core grade roll '+roll);
}
for(const [id,info] of Object.entries(BEAST_MATERIALS)) {
  assert.equal(lootInfo(id),info);
  assert.ok(info.sellPrice>0);
}
assert.equal(lootInfo('gold'),null);
assert.equal(lootInfo('noi_dan_0_ha'),null);
assert.equal(lootInfo('noi_dan_10_ha'),null);
assert.equal(lootInfo('noi_dan_1_khong'),null);
assert.equal(lootInfo('noi_dan_9_cuc').name,'Nội Đan 9 Phẩm · Cực Phẩm');

// Material-only deer, never a coin or core even if all random rolls succeed.
const deerLoot=generateBeastLoot({kind:'deer',beastRank:0},()=>0);
assert.deepEqual(deerLoot.map(x=>x.itemId),['da_thu','long_thu','huyet_thu']);
for(const drop of deerLoot)assert.equal(drop.quantity,1);
assert.ok(deerLoot.every(x=>!('gold' in x)&&!('exp' in x)));

// For rank-1+, a successful core roll has exactly one grade; rare quality independent.
for(const [roll,grade] of [[.10,'ha'],[.75,'trung'],[.94,'thuong'],[.999,'cuc']]){
  const rng=[.5,.5,.02,roll]; // no extra fur/blood; guaranteed core roll
  const items=generateBeastLoot({kind:'wolf',beastRank:1},()=>rng.shift());
  assert.deepEqual(items.map(x=>x.itemId),['da_thu','noi_dan_1_'+grade]);
}
const noCore=generateBeastLoot({kind:'wolf',beastRank:9},()=>.999);
assert.deepEqual(noCore.map(x=>x.itemId),['da_thu']);
const highest=generateBeastLoot({kind:'wolf',beastRank:9},()=>0);
assert.equal(highest.at(-1).itemId,'noi_dan_9_ha');

// Actual kills only create beast parts; no gold, no EXP, no herb.
const g=game(),p=g.player;
const enemy=g.state.enemies[0];
p.x=enemy.x;p.y=enemy.y;
const expBefore=p.exp,goldBefore=p.gold;
g.damageEnemy(enemy,enemy.hp+100,false,p);
assert.ok(enemy.dead);
assert.ok(g.state.drops.some(d=>d.itemId==='da_thu'));
assert.ok(g.state.drops.every(d=>lootInfo(d.itemId)&&!('gold' in d)&&!('exp' in d)&&!('herb' in d)));
assert.equal(p.exp,expBefore);assert.equal(p.gold,goldBefore);
g.stepDrops(.05);
assert.equal(g.state.drops.length,0);
assert.ok(p.materials.da_thu>=1);
assert.equal(p.gold,goldBefore);
assert.equal(p.exp,expBefore);

// All inner-core grades stack under distinct rank/quality IDs.
g.state.drops.push({x:p.x,y:p.y,life:24,spin:0,owner:null,quantity:1,itemId:'noi_dan_1_cuc'});
g.state.drops.push({x:p.x,y:p.y,life:24,spin:0,owner:null,quantity:2,itemId:'noi_dan_1_cuc'});
g.stepDrops(.01);
assert.equal(p.materials.noi_dan_1_cuc,3);
const materialCount=Object.entries(BEAST_MATERIALS).reduce((sum,[id])=>sum+(p.materials[id]||0),0);
const expectedMoney=Object.entries(BEAST_MATERIALS)
  .reduce((sum,[id,info])=>sum+(p.materials[id]||0)*info.sellPrice,0);
assert.equal(g.sellBeastMaterials(),true);
assert.equal(p.gold,expectedMoney);
assert.equal(p.materials.noi_dan_1_cuc,3,'Inner cores are preserved, not automatically sold');
assert.equal(g.sellBeastMaterials(),false,'Nothing left to sell');
assert.ok(materialCount>=1);
assert.equal(Object.entries(BEAST_MATERIALS).reduce((sum,[id])=>sum+(p.materials[id]||0),0),0);
assert.equal(Engine.getRealm(p).name,'Phàm Nhân');

// Saving and restoring materials; migration from save-v4 and validation of unknown IDs.
g.save();
const save=JSON.parse(store.get(SAVE_KEY));
assert.equal(save.version,5);
assert.equal(save.materials.noi_dan_1_cuc,3);
assert.equal(save.gold,expectedMoney);
const restored=game();restored.restore();
assert.equal(restored.player.materials.noi_dan_1_cuc,3);
assert.equal(restored.player.gold,expectedMoney);
store.set(SAVE_KEY,JSON.stringify({
  ...save,materials:{'da_thu':8,'noi_dan_2_ha':1,'made_up_item':999,'__proto__':100}
}));
const clean=game();clean.restore();
assert.equal(clean.player.materials.da_thu,8);
assert.equal(clean.player.materials.noi_dan_2_ha,1);
assert.ok(!Object.hasOwn(clean.player.materials,'made_up_item'));
store.set(SAVE_KEY,JSON.stringify({version:4,realmIdx:1,exp:12,gold:31,materials:{da_thu:99},pills:{}}));
const legacy=game();legacy.restore();
assert.equal(legacy.player.gold,31);
assert.equal(legacy.player.exp,12);
assert.deepEqual(legacy.player.materials,{},'Legacy saves cannot introduce unknown loot data');

// Enemy loot ownership still stays with the killer NPC.
const npcg=game(),npc=npcg.state.npcs[0],prey=npcg.state.enemies[0];
npcg.damageEnemy(prey,prey.hp+1,false,npc);
assert.ok(npcg.state.drops.length>0);
assert.ok(npcg.state.drops.every(d=>d.owner===npc.id&&!('gold' in d)));
console.log('PASS: beast ranks 0-9, four core qualities, drop tables, no money/EXP, stacking, selling and save-v5 compatibility');
