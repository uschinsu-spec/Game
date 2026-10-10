import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeWorld} from '../src/world.js';
import {Engine,SKILLS,syncStats,trainSkill,npcComboSkills,npcMasteryCap,npcRealmForFloor} from '../src/cultivation.js';

function game(floor=2){
  const g=Object.assign(Object.create(Game.prototype),{mapId:'map'+floor,state:makeWorld('map'+floor),toast(){},ui:{toast(){}}});
  g.player=g.makePlayer();g.player.realmIdx=28;g.ensureNPCs();g.refreshEnemies();return g;
}
assert.equal(npcRealmForFloor(1),0);assert.equal(npcRealmForFloor(2),1);
const g=game(),p=g.state.npcs[0];
assert.equal(p.skillElement,'Kim');assert.equal(g.state.npcs[1].skillElement,'Hỏa');
for(const element of new Set(SKILLS.filter(s=>s.tier>0).map(s=>s.elem))){
  const actor={...p,realmIdx:28,skillElement:element};
  assert.equal(npcComboSkills(actor).length,5);
  assert.ok(npcComboSkills(actor).every(sk=>sk.elem===element));
}
assert.equal(p.realmIdx,1,'Floor 2 realm does not scale to the human player');
assert.ok(npcComboSkills(p).every(sk=>sk.tier===1));
for(let realm=1;realm<=28;realm++){
  p.realmIdx=realm;
  const cap=realm<=12?Math.floor((realm-1)/3):(realm-13)%4;
  const highest=npcComboSkills(p)[0];assert.equal(npcMasteryCap(p,highest.id),cap);
  assert.ok(npcComboSkills(p).every(sk=>sk.minRealm<=realm));
}
// Luyen Khi middle stage never trains or casts a Dai Thanh skill.
p.realmIdx=4;p.skillMastery.kiem_1=0;p.skillExp.kiem_1=0;
for(let i=0;i<2000;i++)trainSkill(p,'kiem_1');
assert.equal(p.skillMastery.kiem_1,1);
assert.equal(npcMasteryCap(p,'kiem_2'),-1);
Object.assign(p,{x:1000,y:600,aiTarget:g.state.enemies[0]});
const enemy=p.aiTarget;Object.assign(enemy,{x:1060,y:600,hp:1e12,maxHp:1e12});g.state.enemies=[enemy];
p.selectedSkillId='hoa_1';syncStats(p,true);
const before=p.mp;assert.equal(g.skill(p),undefined);assert.equal(p.mp,before);
p.selectedSkillId='kiem_1';p.skillMastery.kiem_1=3;p.mp=Engine.calcSkillMpCost(p,SKILLS.find(s=>s.id==='kiem_1'));assert.equal(g.skill(p),true);
assert.equal(p.mp,0,'Skill MP cost follows maximum MP and tier');
assert.equal(p.skillMastery.kiem_1,1,'Invalid mastery is clamped before damage');

// Truc Co chains both skill generations; each individual cooldown is respected.
p.realmIdx=13;syncStats(p,true);p.skillAnim=0;p.cooldowns.skill=0;p.skillCooldowns={};p.comboIndex=0;
for(const sk of npcComboSkills(p))p.skillMastery[sk.id]=npcMasteryCap(p,sk.id);
assert.equal(p.skillMastery.kiem_1,3);assert.equal(p.skillMastery.kiem_2,0);
g.state.npcs=[p];const casts=[],last=new Map();let now=0;
const cast=g.skill.bind(g);
g.skill=actor=>{
  const id=actor.selectedSkillId,result=cast(actor);
  if(result){
    const sk=SKILLS.find(s=>s.id===id);
    if(last.has(id))assert.ok(now-last.get(id)>=sk.cd-.001,'Cooldown: '+id);
    last.set(id,now);casts.push(sk);
  }
  return result;
};
for(let i=0;i<300;i++){
  now+=.1;p.mp=p.maxMp;g.stepNPCs(.1);g.stepEffects(.1);
}
assert.ok(casts.some(s=>s.tier===2));assert.ok(casts.some(s=>s.tier===1));
assert.ok(casts.every(s=>s.tier<=2));assert.equal(p.skillExp.basic_attack,undefined);
assert.equal(p.attackAnim,0);
// Waiting on skills or low MP must never fall back to basic attack.
p.mp=0;p.cooldowns.skill=10;
for(let i=0;i<10;i++)g.stepNPCs(.1);
assert.equal(p.attackAnim,0);g.attack(p);assert.equal(p.attackAnim,0);
// A cultivated NPC should cast against the nearest enemy immediately from anywhere.
const distant=game(14),rangedNpc=distant.state.npcs[0];
rangedNpc.realmIdx=1;syncStats(rangedNpc,true); // Tier-1 skill: test actual projectile travel
const farEnemy=distant.state.enemies[0],closerEnemy=distant.state.enemies[1];
Object.assign(rangedNpc,{x:1000,y:600,skillElement:'Kim',aiTarget:null,skillAnim:0,attackAnim:0,
  comboIndex:0,mp:rangedNpc.maxMp});
rangedNpc.cooldowns.skill=0;rangedNpc.skillCooldowns={};
Object.assign(farEnemy,{x:2250,y:1000,dead:false,hp:1e12,maxHp:1e12});
Object.assign(closerEnemy,{x:2100,y:600,dead:false,hp:1e12,maxHp:1e12});
distant.state.enemies=[farEnemy,closerEnemy];
distant.stepNPCs(.01);
assert.equal(rangedNpc.aiTarget,closerEnemy,'First cast goes straight to nearest enemy');
assert.ok(rangedNpc.cooldowns.skill>0);
assert.equal(rangedNpc.x,1000,'NPC casts without walking into attack range');
assert.equal(rangedNpc.y,600);
distant.tickCharacter(rangedNpc,rangedNpc.skillReleaseAge+.001);
const projectile=distant.state.effects.find(f=>f.type==='skillProjectile');
assert.ok(projectile,'Tier 1 projectile is released from the NPC position');
assert.equal(projectile.target,closerEnemy);
assert.ok(projectile.max>3,'Long distance projectile is not cut off at the old 3-second limit');
const hpBefore=closerEnemy.hp;distant.stepEffects(1);
assert.equal(closerEnemy.hp,hpBefore,'Projectile still deals damage on arrival, not immediately');
distant.stepEffects(5);assert.ok(closerEnemy.hp<hpBefore);
rangedNpc.cooldowns.skill=0;rangedNpc.skillAnim=0;rangedNpc.skillCooldowns={};
closerEnemy.dead=true;
distant.stepNPCs(.01);
assert.equal(rangedNpc.aiTarget,farEnemy,'NPC immediately retargets the next nearest living enemy');
assert.equal(rangedNpc.x,1000);

// AOE skills should strike the nearest remote target, not an empty circle around NPC.
const aoeGame=game(18),aoeNPC=aoeGame.state.npcs[0],victim=aoeGame.state.enemies[0];
Object.assign(aoeNPC,{x:1000,y:600,aiTarget:null,skillAnim:0,attackAnim:0,mp:aoeNPC.maxMp});
aoeNPC.cooldowns.skill=0;aoeNPC.skillCooldowns={};
Object.assign(victim,{x:1800,y:1100,hp:1e12,maxHp:1e12,dead:false});
aoeGame.state.enemies=[victim];
aoeNPC.comboIndex=0; // Kim Dan skill kiem_3 is an AOE attack
aoeGame.stepNPCs(.01);
assert.equal(aoeNPC.selectedSkillId,'kiem_3');
const hpAoe=victim.hp;
aoeGame.tickCharacter(aoeNPC,aoeNPC.skillReleaseAge+.001);
assert.ok(victim.hp<hpAoe,'Remote AOE is centered on selected enemy');
assert.equal(aoeNPC.x,1000);

// Melee spells from cultivated NPCs also target directly, without approaching.
const meleeGame=game(14),meleeNpc=meleeGame.state.npcs[0],meleeEnemy=meleeGame.state.enemies[0];
Object.assign(meleeNpc,{skillElement:'Vật Lý',x:1000,y:600,comboIndex:0,mp:meleeNpc.maxMp});
meleeNpc.skillCooldowns={};meleeNpc.cooldowns.skill=0;
Object.assign(meleeEnemy,{x:1500,y:850,hp:1e12,maxHp:1e12,dead:false});
meleeGame.state.enemies=[meleeEnemy];
meleeGame.stepNPCs(.01);
assert.equal(meleeNpc.selectedSkillId,'ly_2');
const hpMelee=meleeEnemy.hp;
meleeGame.tickCharacter(meleeNpc,meleeNpc.skillReleaseAge+.001);
assert.ok(meleeEnemy.hp<hpMelee,'Remote NPC melee-type spell hits selected enemy');
assert.equal(meleeNpc.x,1000);

console.log('PASS: floor realm, mastery caps, shared nearest targets, long-distance projectiles, remote AOE and no melee repositioning');
