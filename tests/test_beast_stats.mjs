import {REALMS} from '../src/cultivation.js';
import assert from 'node:assert/strict';
import DATA from '../src/data/enemies.json' with {type:'json'};
import {enemyStats} from '../src/cultivation.js';
import {makeWorld} from '../src/world.js';
import {ProgressionSystem} from '../src/systems/progression.js';
import {beastTitle,beastCoreQuality} from '../src/core/beast-loot.js';
assert.equal(DATA.combatLevels.length,21);
assert.equal(new Set(DATA.combatLevels.map(e=>`${e.rank}:${e.stage}`)).size,21);
for(const level of DATA.combatLevels){
 const realm=REALMS[level.playerRealmIdx];
 for(const [enemyKey,playerKey] of [['hp','hp'],['attack','dmg'],['def','def']]){
  const base=realm[playerKey],value=level[enemyKey];
  if(base===0)assert.equal(value,0);
  else if(enemyKey==='attack')assert.equal(value,Math.ceil(base*1.12-1e-9));
  else {assert.ok(value>=base*1.10-1e-6&&value<=base*1.15+1e-6);assert.ok(Math.abs(value/base-1.12)<1e-9)}
 }
 const actual=enemyStats('wolf',level.rank,level.stage);
 assert.deepEqual(actual,{hp:level.hp,attack:level.attack,def:level.def});
 assert.ok(beastTitle({beastRank:level.rank,beastStage:level.stage},'').includes(level.name));
}
assert.deepEqual(enemyStats('deer',0,-1),{hp:43,attack:0,def:0});
for(let floor=1;floor<=99;floor++){
 const state=makeWorld(floor===1?'map':'map'+floor);const enemy=state.enemies[0];
 const before={hp:enemy.hp,attack:enemy.attack,def:enemy.def};
 const game={state,player:{realmIdx:28}};ProgressionSystem.refreshEnemies.call(game);
 assert.deepEqual({hp:enemy.hp,attack:enemy.attack,def:enemy.def},before,'player realm cannot scale beasts');
 assert.deepEqual(before,enemyStats(enemy.kind,enemy.beastRank,enemy.beastStage));
 if(enemy.beastRank>0)assert.equal(beastCoreQuality(enemy).id,['ha','trung','thuong','cuc'][enemy.beastStage]);
}
assert.notEqual(makeWorld('map2').enemies[0].hp,makeWorld('map14').enemies[0].hp);
console.log('PASS: 21 fixed beast levels, 99 floor mappings, combat/title/core consistency, no player scaling');

assert.equal(enemyStats('wolf',0,-1).attack,6);
assert.equal(enemyStats('wolf',1,0).attack,Math.ceil(REALMS[3].dmg*1.12-1e-9));
assert.deepEqual(DATA.combatLevels.filter(l=>l.rank===1).map(l=>l.playerRealmIdx),[3,6,9,12]);
console.log('PASS: all 21 combat levels exceed matching player baseline by 12%, with damage rounded up');

const mortal=makeWorld('map2').enemies[0];
assert.equal(mortal.beastRank,0);assert.equal(mortal.beastStage,-1);
assert.deepEqual({hp:mortal.hp,attack:mortal.attack,def:mortal.def},{hp:112,attack:6,def:0});
assert.ok(beastTitle(mortal).includes('Phàm Thú'));

assert.equal(makeWorld("map2").enemies.length,3);
for(const e of makeWorld("map2").enemies)assert.equal(e.respawnSeconds,5);

const {CombatSystem}=await import('../src/systems/combat.js');
const {WorldUpdateSystem}=await import('../src/systems/world-update.js');
const floor2=makeWorld('map2'),actor={id:'player',dead:false};
const g={player:actor,state:{...floor2,npcs:[]}};
const victim=g.state.enemies[0];
CombatSystem.kill.call(g,victim);
assert.equal(victim.respawn,5);assert.equal(victim.dead,true);
g.state.enemies=[victim];
WorldUpdateSystem.stepEnemies.call(g,4.9);assert.equal(victim.dead,true);
WorldUpdateSystem.stepEnemies.call(g,.1);assert.equal(victim.dead,false);assert.equal(victim.hp,victim.maxHp);
console.log('PASS: floor 2 spawns exactly 3 beasts and respawns after 5 seconds');
