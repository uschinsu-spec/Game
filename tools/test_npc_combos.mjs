import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeWorld} from '../src/world.js';
import {SKILLS,syncStats,trainSkill,npcComboSkills,npcMasteryCap,npcRealmForFloor} from '../src/cultivation.js';

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
p.selectedSkillId='kiem_1';p.skillMastery.kiem_1=3;p.mp=1;assert.equal(g.skill(p),true);
assert.equal(p.mp,0,'A skill costs exactly 1 MP');
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
// Movement uses the skill range even while waiting for the next cast.
p.realmIdx=1;p.skillAnim=0;p.attackAnim=0;p.detourTime=0;p.hp=p.maxHp;
for(const [element,targetX,direction] of [['Kim',1240,0],['Kim',1350,1],['Kim',1100,-1],['Vật Lý',1140,1],['Vật Lý',1090,0],['Thổ',1150,1]]){
  Object.assign(p,{skillElement:element,x:1000,y:600,comboIndex:0,aiTarget:enemy,castTarget:null});
  Object.assign(enemy,{x:targetX,y:600,dead:false});p.cooldowns.skill=10;
  g.stepNPCs(.01);
  assert.equal(Math.sign(p.x-1000),direction,'Skill range movement: '+element+' '+targetX);
}
assert.equal(typeof g.dash,'undefined');assert.equal('dash' in p.cooldowns,false);
// Once the first skill is cast, stay put for this target even if it moves.
Object.assign(p,{skillElement:'Kim',selectedSkillId:'kiem_1',x:1000,y:600,castTarget:null,skillAnim:0,mp:1});
Object.assign(enemy,{x:1240,y:600});p.cooldowns.skill=0;p.skillCooldowns={};
assert.equal(cast(p),true);assert.equal(p.castTarget,enemy);
for(const x of [1100,1350]){
  enemy.x=x;p.skillAnim=0;p.cooldowns.skill=10;
  g.stepNPCs(.01);assert.equal(p.x,1000,'No repositioning after first cast');assert.equal(p.walk,false);
}
enemy.dead=true;g.stepNPCs(.01);assert.equal(p.castTarget,null);
console.log('PASS: floor realm, mastery caps, same-element combos, skill range movement, cooldowns and no basic fallback');
