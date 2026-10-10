import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeWorld} from '../src/world.js';
import {SAVE_KEY} from '../src/core/config.js';
import {Engine} from '../src/cultivation.js';
import {
  BEAST_MATERIALS,CORE_QUALITIES,BEAST_STAGES,BEAST_CORE_DROP_CHANCE,
  CORE_CHANCE_MULTIPLIER_PER_RANK,beastRankForFloor,
  beastStageForFloor,beastCoreDropChance,beastCoreQuality,beastTitle,
  lootInfo,generateBeastLoot,sellCommonMaterials
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

// Substages are mapped to 3 floors per grade, including the boundary floors.
assert.equal(beastStageForFloor(1),-1);
assert.equal(beastStageForFloor(2),0);
assert.equal(beastStageForFloor(4),0);
assert.equal(beastStageForFloor(5),1);
assert.equal(beastStageForFloor(7),1);
assert.equal(beastStageForFloor(8),2);
assert.equal(beastStageForFloor(10),2);
assert.equal(beastStageForFloor(11),3);
assert.equal(beastStageForFloor(13),3);
assert.equal(beastStageForFloor(14),0);
assert.equal(beastStageForFloor(25),3);
assert.equal(beastStageForFloor(26),0);
assert.equal(beastStageForFloor(98),0);
assert.equal(beastStageForFloor(99),0);
for(let floor=2;floor<=99;floor++){
  const beast=makeWorld(floor===1?'map':'map'+floor).enemies[0];
  assert.equal(beast.beastRank,beastRankForFloor(floor));
  assert.equal(beast.beastStage,beastStageForFloor(floor));
}
assert.equal(CORE_QUALITIES.length,4);
assert.equal(BEAST_STAGES.length,4);
assert.equal(BEAST_CORE_DROP_CHANCE,.50);
assert.equal(CORE_CHANCE_MULTIPLIER_PER_RANK,.85);
assert.deepEqual(BEAST_STAGES.map(s=>s.quality),['ha','trung','thuong','cuc']);
assert.deepEqual(BEAST_STAGES.map(s=>s.coreChance),[.50,.30,.15,.05]);
assert.equal(beastTitle({beastRank:1,beastStage:3},'Yêu Lang'),'Yêu Lang · Nhất Phẩm Đỉnh Phong');
assert.equal(beastTitle({beastRank:0},'Linh Lộc'),'Linh Lộc · Phàm Thú');
for(const [id,info] of Object.entries(BEAST_MATERIALS)){
  assert.equal(lootInfo(id),info);
  assert.ok(info.sellPrice>0);
}
assert.equal(lootInfo('gold'),null);
assert.equal(lootInfo('noi_dan_0_ha'),null);
assert.equal(lootInfo('noi_dan_10_ha'),null);
assert.equal(lootInfo('noi_dan_1_khong'),null);
assert.equal(lootInfo('noi_dan_9_cuc').name,'Nội Đan 9 Phẩm · Cực Phẩm');

// Deer (Phàm Thú) drops no core even when all random draws succeed.
const deerLoot=generateBeastLoot({kind:'deer',beastRank:0,beastStage:-1},()=>0);
assert.deepEqual(deerLoot.map(x=>x.itemId),['da_thu','long_thu','huyet_thu']);
for(const drop of deerLoot)assert.equal(drop.quantity,1);
assert.ok(deerLoot.every(x=>!('gold' in x)&&!('exp' in x)));
assert.equal(beastCoreDropChance({beastRank:0,beastStage:-1}),0);

// Quality is guaranteed by substage whenever a core drops, but rarer stages
// and higher major ranks reduce the chance of receiving that core.
for(const rank of [1,2,5,9]){
  for(let stage=0;stage<4;stage++){
    const enemy={kind:'wolf',beastRank:rank,beastStage:stage};
    const chance=beastCoreDropChance(enemy);
    const expected=BEAST_STAGES[stage].coreChance*Math.pow(.85,rank-1);
    assert.ok(Math.abs(chance-expected)<1e-12);
    assert.equal(beastCoreQuality(enemy).id,BEAST_STAGES[stage].quality);
    const hit=[.99,.99,chance-.000001];
    const loot=generateBeastLoot(enemy,()=>hit.shift());
    assert.deepEqual(loot.map(x=>x.itemId),['da_thu',
      'noi_dan_'+rank+'_'+BEAST_STAGES[stage].quality]);
    const miss=[.99,.99,chance];
    assert.deepEqual(generateBeastLoot(enemy,()=>miss.shift()).map(x=>x.itemId),
      ['da_thu'],'Core roll at chance boundary must fail');
    if(stage>0){
      assert.ok(beastCoreDropChance(enemy)<
        beastCoreDropChance({...enemy,beastStage:stage-1}),
        'Higher-grade inner cores must have a lower chance');
    }
    if(rank>1)assert.ok(chance<beastCoreDropChance({...enemy,beastRank:rank-1}),
      'Higher-rank beasts must have a lower core drop rate at equal substage');
  }
}
assert.equal(beastCoreDropChance({beastRank:1,beastStage:3}),.05);
assert.ok(Math.abs(beastCoreDropChance({beastRank:9,beastStage:3})-
  .05*Math.pow(.85,8))<1e-12);
for(let rank=1;rank<=9;rank++){
  let previous=Infinity;
  for(let stage=0;stage<=3;stage++){
    const chance=beastCoreDropChance({beastRank:rank,beastStage:stage});
    assert.ok(chance<previous,'Substage progression must reduce core chance');
    previous=chance;
  }
}
const peak={kind:'wolf',beastRank:1,beastStage:3};
const peakLoot=generateBeastLoot(peak,()=>0);
assert.equal(peakLoot.at(-1).itemId,'noi_dan_1_cuc');
assert.ok(!peakLoot.some(x=>x.itemId==='noi_dan_1_ha'));

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
console.log('PASS: deterministic core quality, drop chance declines with substage and rank, no money/EXP, stacking and save-v5 compatibility');
