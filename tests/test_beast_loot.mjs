import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeWorld} from '../src/world.js';
import {SAVE_KEY} from '../src/core/config.js';
import {Engine} from '../src/cultivation.js';
import {
  BEAST_MATERIALS,CORE_QUALITIES,BEAST_STAGES,BEAST_CORE_DROP_CHANCE,
  CORE_CHANCE_MULTIPLIER_PER_RANK,MAX_BEAST_RANK,FINAL_BEAST_FLOOR,beastRankForFloor,
  beastStageForFloor,beastCoreDropChance,beastCoreQuality,beastTitle,
  lootInfo,normalizeBeastLootId,generateBeastLoot,sellCommonMaterials
} from '../src/core/beast-loot.js';

const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
function game(mapId='map2'){
  const g=Object.assign(Object.create(Game.prototype),{
    mapId,state:makeWorld(mapId),mapStates:{},toast(){},ui:{toast(){}}
  });
  g.player=g.makePlayer();g.refreshEnemies();g.ensureNPCs();return g;
}

// Floors 1 and 2 are mortal beasts; higher floor progression is unchanged.
assert.equal(beastRankForFloor(1),0);
assert.equal(beastRankForFloor(2),0);
assert.equal(beastRankForFloor(13),1);
assert.equal(beastRankForFloor(14),2);
assert.equal(MAX_BEAST_RANK,5);
assert.equal(FINAL_BEAST_FLOOR,61);
assert.equal(beastRankForFloor(37),3);
assert.equal(beastRankForFloor(38),4);
assert.equal(beastRankForFloor(49),4);
assert.equal(beastRankForFloor(50),5);
assert.equal(beastRankForFloor(61),5);
assert.equal(beastRankForFloor(62),5);
assert.equal(beastRankForFloor(98),5);
assert.equal(beastRankForFloor(99),5);
assert.equal(makeWorld('map').enemies[0].beastRank,0);
assert.equal(makeWorld('map2').enemies[0].beastRank,0);
assert.equal(makeWorld('map14').enemies[0].beastRank,2);
assert.equal(makeWorld('map99').enemies[0].beastRank,5);
assert.equal(makeWorld('map99').enemies[0].beastStage,3);

// Substages are mapped to 3 floors per grade, including the boundary floors.
assert.equal(beastStageForFloor(1),-1);
assert.equal(beastStageForFloor(2),-1);
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
assert.equal(beastStageForFloor(50),0);
assert.equal(beastStageForFloor(58),2);
assert.equal(beastStageForFloor(59),3);
assert.equal(beastStageForFloor(61),3);
assert.equal(beastStageForFloor(62),3);
assert.equal(beastStageForFloor(98),3);
assert.equal(beastStageForFloor(99),3);
for(let floor=3;floor<=99;floor++){
  const beast=makeWorld(floor===1?'map':'map'+floor).enemies[0];
  assert.equal(beast.beastRank,beastRankForFloor(floor));
  assert.equal(beast.beastStage,beastStageForFloor(floor));
  assert.ok(beast.beastRank>=1&&beast.beastRank<=MAX_BEAST_RANK);
  assert.ok(beast.beastStage>=0&&beast.beastStage<=3);
  if(floor>=62)assert.equal(beastTitle(beast,'Yêu Lang'),'Yêu Lang · Ngũ Phẩm Đỉnh Phong');
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
assert.equal(lootInfo('noi_dan_5_cuc').name,'Nội Đan 5 Phẩm · Cực Phẩm');
for(let rank=6;rank<=9;rank++){
  assert.equal(lootInfo('noi_dan_'+rank+'_cuc'),null);
  assert.equal(normalizeBeastLootId('noi_dan_'+rank+'_cuc'),'noi_dan_5_cuc');
}
assert.equal(normalizeBeastLootId('da_thu'),'da_thu');
assert.equal(normalizeBeastLootId('noi_dan_5_ha'),'noi_dan_5_ha');
assert.equal(normalizeBeastLootId('made_up_item'),null);

// Deer (Phàm Thú) drops no core even when all random draws succeed.
const deerLoot=generateBeastLoot({kind:'deer',beastRank:0,beastStage:-1},()=>0);
assert.deepEqual(deerLoot.map(x=>x.itemId),['da_thu','long_thu','huyet_thu']);
for(const drop of deerLoot)assert.equal(drop.quantity,1);
assert.ok(deerLoot.every(x=>!('gold' in x)&&!('exp' in x)));
assert.equal(beastCoreDropChance({beastRank:0,beastStage:-1}),0);

// Quality is guaranteed by substage whenever a core drops, but rarer stages
// and higher major ranks reduce the chance of receiving that core.
for(const rank of [1,2,3,4,5]){
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
assert.ok(Math.abs(beastCoreDropChance({beastRank:5,beastStage:3})-
  .05*Math.pow(.85,4))<1e-12);
assert.equal(beastCoreDropChance({beastRank:9,beastStage:3}),
  beastCoreDropChance({beastRank:5,beastStage:3}),
  'Out-of-range enemy ranks cannot generate Lục–Cửu Phẩm cores');
assert.equal(beastTitle({beastRank:9,beastStage:3},'Yêu Lang'),
  'Yêu Lang · Ngũ Phẩm Đỉnh Phong');
assert.equal(generateBeastLoot({beastRank:9,beastStage:3},()=>0).at(-1).itemId,
  'noi_dan_5_cuc');
for(let rank=1;rank<=MAX_BEAST_RANK;rank++){
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
g.stepDrops(1.99);
assert.ok(g.state.drops.length>0);
g.stepDrops(.01);
assert.equal(g.state.drops.length,0);
assert.ok(p.materials.da_thu>=1);
assert.equal(p.gold,goldBefore);
assert.equal(p.exp,expBefore);

// All inner-core grades stack under distinct rank/quality IDs.
g.state.drops.push({x:p.x,y:p.y,life:24,spin:0,owner:null,quantity:1,itemId:'noi_dan_1_cuc'});
g.state.drops.push({x:p.x,y:p.y,life:24,spin:0,owner:null,quantity:2,itemId:'noi_dan_1_cuc'});
g.stepDrops(2);
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
store.set(SAVE_KEY,JSON.stringify({
  ...save,materials:{noi_dan_5_cuc:2,noi_dan_6_cuc:3,noi_dan_7_cuc:4,
    noi_dan_8_thuong:5,noi_dan_9_cuc:1,da_thu:8}
}));
const migrated=game();migrated.restore();
assert.equal(migrated.player.materials.noi_dan_5_cuc,10,
  'Old rank-6/7/9 cores merge into rank-5 stack, keeping quantities');
assert.equal(migrated.player.materials.noi_dan_5_thuong,5);
for(let rank=6;rank<=9;rank++)for(const quality of ['ha','trung','thuong','cuc']){
  assert.ok(!Object.hasOwn(migrated.player.materials,`noi_dan_${rank}_${quality}`));
}
migrated.save();
const migratedSave=JSON.parse(store.get(SAVE_KEY));
assert.equal(migratedSave.materials.noi_dan_5_cuc,10);
assert.ok(!('noi_dan_9_cuc' in migratedSave.materials));
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
console.log('PASS: max 5 beast ranks across 99 floors, capped core drops, 6–9 save migration, decreasing rarity and inventory compatibility');
