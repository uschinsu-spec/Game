import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeWorld,isWalkable,PLAYER_SPAWN} from '../src/world.js';
import {syncStats} from '../src/cultivation.js';

function game(mapId='map2'){
  const g=Object.assign(Object.create(Game.prototype),{
    mapId,mapStates:{},images:{},mapImages:new Map(),state:makeWorld(mapId),gameTime:0,
    async loadFloorImage(){return {}},
    input:{clear(){},vector(){return {x:0,y:0,active:false}}},
    ui:{toast(){},dead(){}},save(){},toast(){},drawMinimap(){},
  });
  g.player=g.makePlayer();g.ensureNPCs();g.refreshEnemies();return g;
}

const g=game(),npc=g.state.npcs[0];
assert.equal(g.state.npcs.length,2);
assert.notEqual(npc.cooldowns,g.player.cooldowns);
assert.notEqual(npc.skillExp,g.player.skillExp);
for(const p of g.state.npcs)assert.ok(isWalkable(p.x,p.y,g.mapId));

// NPCs reserve separate targets across the map, including after a kill.
const spread=game(),[firstNPC,secondNPC]=spread.state.npcs;
for(const actor of spread.state.npcs)Object.assign(actor,{x:1000,y:600,aiTarget:null});
const [firstEnemy,secondEnemy]=spread.state.enemies;
Object.assign(firstEnemy,{x:1300,y:600});Object.assign(secondEnemy,{x:2000,y:600});
spread.state.enemies=[firstEnemy,secondEnemy];spread.stepNPCs(.01);
assert.equal(firstNPC.aiTarget,firstEnemy);assert.equal(secondNPC.aiTarget,secondEnemy);
spread.stepNPCs(.01);assert.notEqual(firstNPC.aiTarget,secondNPC.aiTarget);
assert.equal(spread.combatTarget(300,secondNPC),null,'Never switch to another NPC target when out of range');
firstEnemy.dead=true;spread.stepNPCs(.01);
assert.equal(firstNPC.aiTarget,null,'Wait or patrol when all living monsters are reserved');
assert.equal(secondNPC.aiTarget,secondEnemy);
secondNPC.dead=true;spread.stepNPCs(.01);assert.equal(firstNPC.aiTarget,secondEnemy);

// Shared movement has the same speed, facing, and animation clocks.
const player=g.makePlayer(),other=g.makePlayer();
Object.assign(player,{x:1000,y:600});Object.assign(other,{x:1000,y:600});
g.moveCharacter(player,{x:-1,y:0},.1);g.moveCharacter(other,{x:-1,y:0},.1);
assert.equal(player.x,983.6);assert.equal(player.x,other.x);
assert.equal(player.face,-1);assert.equal(player.walkAge,other.walkAge);

// NPC attacks resolve once at the same hit time, with independent cooldowns.
const enemy=g.state.enemies[0];
Object.assign(npc,{x:1000,y:600});Object.assign(enemy,{x:1060,y:600,hp:100000,maxHp:100000});
npc.aiTarget=enemy;const playerGold=g.player.gold,playerExp=g.player.exp;
npc.realmIdx=0;
g.attack(npc);assert.ok(npc.attackAnim>0);assert.equal(g.player.attackAnim,0);
const hp=enemy.hp;g.tickCharacter(npc,npc.attackHitTime+.01);assert.ok(enemy.hp<hp);
const after=enemy.hp;g.tickCharacter(npc,.02);assert.equal(enemy.hp,after);
assert.equal(g.player.gold,playerGold);assert.equal(g.player.exp,playerExp);

// MP, skill mastery and healing belong to the acting NPC.
npc.realmIdx=1;
g.tickCharacter(npc,1);npc.cooldowns.skill=0;const mp=npc.mp;g.skill(npc);
assert.ok(npc.mp<mp);assert.equal(g.player.skillAnim,0);
npc.hp=1;npc.mp=npc.maxMp;g.heal(npc);assert.ok(npc.hp>1);
assert.equal(g.player.cooldowns.heal,0);

// NPC kills must not award Player or NPC cultivation EXP, and drop only spirit stones.
const playerExp=g.player.exp,npcExp=npc.exp;g.damageEnemy(enemy,1000000,false,npc);
assert.ok(enemy.dead);assert.equal(g.player.exp,playerExp);assert.equal(npc.exp,npcExp);
assert.ok(!('kills' in g.player));assert.ok(!('kills' in npc));
assert.ok(g.state.drops.every(d=>d.owner===npc.id&&d.gold>0&&!('herb' in d)));

// Wolves lock their chosen victim for the attack, then NPCs respawn.
const wolf=g.state.enemies[1];
Object.assign(npc,{x:1200,y:700,hp:1,hurt:0,buffTime:0});
Object.assign(g.player,{x:PLAYER_SPAWN.x,y:PLAYER_SPAWN.y});
Object.assign(g.state.npcs[1],{x:700,y:450});
Object.assign(wolf,{x:1210,y:700,attack:100000,attackCD:0,attackAnim:0,stun:0});
g.stepEnemies(.01);assert.equal(wolf.victim,npc);
g.stepEnemies(.25);assert.ok(npc.dead);assert.ok(!g.player.dead);
g.stepNPCs(13);assert.ok(!npc.dead);assert.equal(npc.hp,npc.maxHp);
assert.equal(npc.x,npc.homeX);

// AI can acquire, pursue and fight without manual input.
const sim=game();sim.player.x=200;sim.player.y=700;
const initial=sim.state.npcs.map(p=>({x:p.x,y:p.y}));
for(let i=0;i<600;i++){
  sim.stepNPCs(1/60);sim.stepEnemies(1/60);sim.stepDrops(1/60);sim.stepEffects(1/60);
}
assert.ok(sim.state.npcs.some((p,i)=>Math.hypot(p.x-initial[i].x,p.y-initial[i].y)>10));
assert.ok(sim.state.npcs.some(p=>p.skillExp.basic_attack>0||p.skillExp.kiem_1>0));
for(const p of sim.state.npcs)assert.ok(Number.isFinite(p.hp)&&Number.isFinite(p.x));

// Returning to a map restores its NPC state, with no duplicate spawns.
const first=sim.state;await sim.travel('back');assert.equal(sim.mapId,'map');
assert.equal(sim.state.npcs.length,2);assert.notEqual(sim.state.npcs[0],first.npcs[0]);
await sim.travel();assert.equal(sim.state,first);assert.equal(sim.state.npcs.length,2);
console.log('PASS: shared actions, damage ownership, enemy targeting, AI, respawn and map travel');
const mortal=game('map');mortal.player.realmIdx=28;
for(const p of mortal.state.npcs){
  assert.equal(p.realmIdx,0);p.hp=1;
  const target=mortal.state.enemies[0];target.hp=100000;target.maxHp=100000;
  p.x=target.x-60;p.y=target.y;p.aiTarget=target;
}
for(let i=0;i<120;i++){mortal.stepNPCs(1/60);mortal.stepEffects(1/60)}
for(const p of mortal.state.npcs){
  assert.equal(p.realmIdx,0);assert.equal(p.cooldowns.skill,0);assert.equal(p.cooldowns.heal,0);
  assert.equal(p.skillExp.kiem_1,undefined);assert.ok(p.skillExp.basic_attack>0);
}
assert.ok(!mortal.state.effects.some(f=>f.type==='skillProjectile'));
console.log('PASS: floor 1 NPCs remain mortal and use only basic attacks');
