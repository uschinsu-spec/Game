import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeWorld} from '../src/world.js';
import {Engine,REALMS,SKILLS,syncStats,cultivationPillForRealm,cultivationPillExp} from '../src/cultivation.js';
import {combatTempo} from '../src/core/combat-tempo.js';

const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const game=()=>{
  const g=Object.assign(Object.create(Game.prototype),{mapId:'map2',state:makeWorld('map2'),mapStates:{},toast(){},ui:{toast(){}}});
  g.player=g.makePlayer();g.refreshEnemies();g.ensureNPCs();return g;
};
// XP must NEVER arrive from kills, regardless of the actor or monster's reward.
const g=game(),p=g.player;
p.realmIdx=1;syncStats(p,true);
const before=p.exp;
let wolf=g.state.enemies[0];g.damageEnemy(wolf,wolf.hp+1,false,p);
assert.equal(p.exp,before,'Killing a wolf must not grant cultivation EXP');
assert.ok(g.state.drops.length>0,'Monsters still drop crafting resources');
const npc=g.state.npcs[0],npcExp=npc.exp;
wolf=g.state.enemies[1];g.damageEnemy(wolf,wolf.hp+1,false,npc);
assert.equal(npc.exp,npcExp,'NPCs must not gain cultivation EXP for kills');

// Alchemy is an explicit alternative to meditation; breakthrough pills remain separate.
p.gold=1000;p.herbs=100;
const recipe=cultivationPillForRealm(p.realmIdx);
assert.equal(recipe.id,'tu_vi_luyen_khi');
assert.equal(g.craftCultivationPill(),true);
const pillStock=p.pills[recipe.id];
const gained=cultivationPillExp(p);
assert.equal(gained,Math.ceil(REALMS[p.realmIdx].expReq*.12));
assert.equal(g.useCultivationPill(),true);
assert.equal(p.exp,before+gained);
assert.equal(p.pills[recipe.id],pillStock-1);
assert.equal(g.useCultivationPill(),false,'Cannot consume an absent pill');
assert.ok(Engine.calcMeditationRate(p)>0);
assert.equal(Engine.calcMeditationRate({...p,realmIdx:0}),6);

// Sense upgrades improve attack tempo without making crit almost certain at Truc Co.
const c={...p,equippedGear:{},spiritualSenseBonus:0};
for(const realm of [1,12,13,17,21,25,28]){
  c.realmIdx=realm;
  assert.ok(Engine.calcCritRate(c)<.76);
  assert.ok(Engine.calcCritRate(c)>.1);
}
c.realmIdx=13;const critAtTrucCo=Engine.calcCritRate(c);
assert.ok(critAtTrucCo<.40,'Crit must not reach its cap at Truc Co');
c.realmIdx=28;assert.ok(Engine.calcCritRate(c)>critAtTrucCo);
const low=Engine.calcAttackInterval({...c,realmIdx:1,equippedGear:{}});
const high=Engine.calcAttackInterval(c);
assert.ok(high<low);
assert.ok(combatTempo(c).attackDuration<=combatTempo(c).attackInterval);
assert.ok(Engine.calcSkillMpCost(c,SKILLS.find(s=>s.id==='kiem_5'))>
  Engine.calcSkillMpCost(c,SKILLS.find(s=>s.id==='kiem_1')));
assert.ok(Engine.calcElementalDefense({...c,activeCongPhapId:'cp_tho_hoang'},'Vật Lý')>
  Engine.calcElementalDefense({...c,activeCongPhapId:'cp_kiem_hoang'},'Vật Lý'));

// Animation must release precisely once, and the projectile has independent travel speed.
const ranged=game(),h=ranged.player;
h.realmIdx=1;syncStats(h,true);
h.x=1000;h.y=600;h.selectedSkillId='kiem_1';
const target=ranged.state.enemies[0];
Object.assign(target,{x:1240,y:600,hp:1e8,maxHp:1e8});
ranged.state.enemies=[target];
const damageBefore=target.hp;
assert.equal(ranged.skill(),true);
assert.equal(ranged.state.effects.length,0,'Do not spawn projectiles before the release frame');
ranged.tickCharacter(h,h.skillReleaseAge*.5);
assert.equal(ranged.state.effects.length,0);
ranged.tickCharacter(h,h.skillReleaseAge*.51);
const shot=ranged.state.effects.find(f=>f.type==='skillProjectile');
assert.ok(shot&&shot.speed>0);
assert.equal(target.hp,damageBefore);
ranged.stepEffects(.01);const oldX=shot.x;
assert.ok(oldX>shot.startX);
ranged.stepEffects(1);
assert.ok(target.hp<damageBefore);
const afterHit=target.hp;ranged.stepEffects(1);
assert.equal(target.hp,afterHit,'Projectile must not hit a second time');
assert.equal(ranged.skill(),undefined,'Skill cannot be repeated while animating or cooling down');

// Correct save-v3 persistence and legacy migration.
p.spiritualSenseBonus=123;p.congPhapMastery=.9;
p.equippedGear={...p.equippedGear,spiritualSense:12,attackSpeed:17};
p.pills[recipe.id]=3;g.save();
const saved=JSON.parse(store.get('van-moc-sam-lam-save-v1'));
assert.equal(saved.version,3);
const restored=game();restored.restore();
assert.equal(restored.player.spiritualSenseBonus,123);
assert.equal(restored.player.equippedGear.attackSpeed,17);
assert.equal(restored.player.congPhapMastery,.9);
assert.equal(restored.player.pills[recipe.id],3);
store.set('van-moc-sam-lam-save-v1',JSON.stringify({version:2,realmIdx:1,exp:42,gold:11,
  skillMastery:{kiem_1:1},skillExp:{kiem_1:7},ownedManuals:['cp_dan_khi'],pills:{}}));
const legacy=game();legacy.restore();
assert.equal(legacy.player.exp,42);
assert.equal(legacy.player.congPhapMastery,.35);
console.log('PASS: no kill XP, cultivation elixirs, balanced stats, staged projectiles, save-v3 and legacy saves');
