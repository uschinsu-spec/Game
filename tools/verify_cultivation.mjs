import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {Engine,REALMS,CONG_PHAP_LIST,SKILLS,syncStats,enemyStats} from '../src/cultivation.js';
import {makeWorld} from '../src/world.js';
import {UI} from '../src/ui.js';

const store=new Map();globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
globalThis.document={getElementById:()=>({classList:{remove(){}},textContent:''})};
function game(){const g=Object.assign(Object.create(Game.prototype),{mapId:'map',mapStates:{},portalCooldown:0,gameTime:0,saveAge:0});g.player=g.makePlayer();g.state=makeWorld();g.refreshEnemies();g.ensureNPCs();g.ui={toast(){},close(){},autoBtn:{classList:{remove(){}}}};g.input={clear(){},vector:()=>({active:false})};return g}
const g=game(),p=g.player;
assert.equal(p.maxHp,Engine.calcMaxHp(p));assert.equal(p.realmIdx,0);assert.equal(p.level,undefined);
Engine.addExp(g.player,75);assert.equal(p.realmIdx,0,'XP must not auto-level');g.breakthrough();assert.equal(p.realmIdx,1);assert.equal(p.exp,25);assert.equal(p.mp,Engine.calcMaxMp(p));
assert.equal(g.state.enemies[0].maxHp,enemyStats('deer',0,-1).hp);
p.realmIdx=12;p.exp=REALMS[12].expReq;syncStats(p,true);g.breakthrough();assert.equal(p.realmIdx,12,'Pill is required');
p.gold=1000;g.craftPill();assert.equal(p.pills[REALMS[12].pillNeeded],1);g.breakthrough();assert.equal(p.realmIdx,13);assert.equal(p.pills[REALMS[12].pillNeeded],0);
p.realmIdx=16;p.exp=REALMS[16].expReq;p.pills[REALMS[16].pillNeeded]=1;g.breakthrough();assert.equal(p.realmIdx,16,'Manual cap blocks breakthrough');
p.gold=10000;g.learnManual('cp_loi_huyen');g.breakthrough();assert.equal(p.realmIdx,17);
g.save();const restored=game();restored.restore();assert.equal(restored.player.realmIdx,17);assert.equal(restored.player.activeCongPhapId,'cp_loi_huyen');assert.equal(restored.player.maxHp,Engine.calcMaxHp(restored.player));
store.set('van-moc-sam-lam-save-v1',JSON.stringify({version:1,level:5,maxHp:999999,maxMp:99999,expNext:1,exp:20,gold:123,herbs:8,kills:6}));
restored.restore();assert.equal(restored.player.realmIdx,4);assert.equal(restored.player.gold,123);assert.equal(restored.player.maxHp,Engine.calcMaxHp(restored.player));assert.notEqual(restored.player.maxHp,999999);
assert.ok(!('herbs' in restored.player));assert.ok(!('kills' in restored.player));
const m=game();m.state.enemies=[];m.meditate();for(let i=0;i<120;i++)m.step(1/60);assert.equal(m.player.exp,12,'Meditation works at frame delta');m.input.vector=()=>({active:true,x:1,y:0});m.step(.02);assert.equal(m.player.isMeditating,false);
const combat=game();combat.player.realmIdx=28;combat.player.activeCongPhapId='cp_thien_giai';syncStats(combat.player,true);
for(const sk of SKILLS.filter(s=>s.tier>0)){
  const enemy={...enemyStats('wolf',5,3),id:100,kind:'wolf',x:combat.player.x+20,y:combat.player.y,maxHp:1e12,hp:1e12,dead:false};
  combat.state.enemies=[enemy];combat.player.selectedSkillId=sk.id;combat.player.cooldowns.skill=0;combat.player.mp=combat.player.maxMp;combat.skill();
  assert.ok(combat.player.cooldowns.skill>0,sk.id+' casts');
  combat.tickCharacter(combat.player,combat.player.skillDuration);
  combat.stepEffects(1);
  if(sk.type!=='buff')assert.ok(enemy.hp<1e12,sk.id+' damages');
  if(sk.effect==='stun')assert.ok(enemy.stun>0);if(sk.effect==='slow')assert.ok(enemy.slow>0);
}
combat.player.buffId='ly_4';combat.player.buffTime=5;assert.equal(Engine.resolveCombat(combat.player,{def:0}).isCrit,true);
// Combat calculation must not mutate HP; healing belongs to one cast.
combat.player.hp=10;
const result=Engine.resolveCombat(combat.player,{def:0},'moc_4');
assert.equal(combat.player.hp,10);assert.equal(result.healAmount,Math.floor(combat.player.maxHp*.25));
combat.player.selectedSkillId='moc_4';combat.player.cooldowns.skill=0;combat.player.mp=combat.player.maxMp;
combat.state.enemies=Array.from({length:3},(_,id)=>({...enemyStats('wolf',5,3),id,kind:'wolf',x:combat.player.x+20+id*10,y:combat.player.y,hp:1e12,maxHp:1e12,dead:false}));
combat.skill();combat.releaseSkill(combat.player);combat.player.skillAnim=0;assert.equal(combat.player.hp,10+Math.floor(combat.player.maxHp*.25),'AOE heals once, not per target');
// Healing AOE works without an enemy and damages every enemy in its radius.
combat.player.hp=10;combat.player.selectedSkillId='moc_5';combat.player.cooldowns.skill=0;combat.player.mp=combat.player.maxMp;
const previous=combat.state.enemies.map(e=>e.hp);combat.skill();combat.releaseSkill(combat.player);combat.player.skillAnim=0;
assert.ok(combat.state.enemies.every((e,i)=>e.hp<previous[i]));
assert.equal(combat.player.hp,10+Math.floor(combat.player.maxHp*.6));
combat.state.enemies=[];combat.player.hp=10;combat.player.cooldowns.skill=0;combat.player.mp=combat.player.maxMp;
combat.skill();combat.releaseSkill(combat.player);combat.player.skillAnim=0;assert.equal(combat.player.hp,10+Math.floor(combat.player.maxHp*.6));
assert.equal('mana' in combat.player,false,'MP has a single source of truth');
const fresh=Engine.createCharacter();assert.equal(fresh.mp,100);assert.equal('mana' in fresh,false);
fresh.exp=REALMS[0].expReq;Engine.breakthrough(fresh);assert.equal(fresh.mp,Engine.calcMaxMp(fresh));
const journey=game();journey.player.activeCongPhapId='cp_thien_giai';journey.player.ownedManuals.push('cp_thien_giai');
for(let i=0;i<28;i++){
  journey.player.exp=REALMS[i].expReq+7;
  if(REALMS[i].pillNeeded)journey.player.pills[REALMS[i].pillNeeded]=1;
  journey.breakthrough();assert.equal(journey.player.realmIdx,i+1);assert.equal(journey.player.exp,7);assert.equal(journey.player.maxHp,Engine.calcMaxHp(journey.player));
}
journey.player.exp=REALMS[28].expReq;journey.breakthrough();assert.equal(journey.player.realmIdx,28);
// Exercise DOM wiring, native selectors, HUD and the resurrection dialog.
const nodes=new Map();function element(){return {hidden:false,style:{},classList:{remove(){},add(){},toggle(){}},children:[],textContent:'',value:'',addEventListener(){},setAttribute(){},replaceChildren(){this.children=[]},append(...children){this.children.push(...children)}}}
globalThis.document={querySelector:key=>{if(!nodes.has(key)){const e=element();e.parentElement=element();nodes.set(key,e)}return nodes.get(key)},createElement:()=>element()};
const ui=new UI(g);g.ui=ui;ui.update(1000);assert.equal(nodes.get('#realm-name').textContent,'· Kim Đan');
ui.cultivation();assert.equal(g.paused,true);assert.ok(nodes.get('#cultivation-controls').children.length>4);
g.player.dead=true;ui.dead();ui.close();assert.equal(g.paused,true);nodes.get('#resume-btn').onclick();assert.equal(g.player.dead,false);assert.equal(g.paused,false);
console.log('PASS: engine stats, manual breakthrough, pills, manual caps, save migration, meditation, all '+SKILLS.filter(s=>s.tier>0).length+' active skills and status effects.');
