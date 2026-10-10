import assert from 'node:assert/strict';
import {separateEnemies} from '../src/systems/world-update.js';
import {makeEnemy} from '../src/world.js';
const enemies=Array.from({length:8},(_,i)=>makeEnemy('wolf',500,500,i,0,-1));
const corpse={...makeEnemy('wolf',500,500,9),dead:true};
const game={state:{enemies:[...enemies,corpse]},moveEntity(e,dx,dy){e.x+=dx;e.y+=dy}};
for(let frame=0;frame<120;frame++)separateEnemies(game,1/60);
for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++){
 assert.ok(Math.hypot(enemies[i].x-enemies[j].x,enemies[i].y-enemies[j].y)>43.9,'crowd bodies stay apart');
}
assert.equal(corpse.x,500);assert.equal(corpse.y,500);
const a=makeEnemy('wolf',100,100,0),b=makeEnemy('wolf',150,100,1);
game.state.enemies=[a,b];separateEnemies(game,1/60);
assert.equal(a.x,100);assert.equal(b.x,150,'partial sprite overlap remains allowed');
console.log('PASS: eight coincident enemies separate smoothly, dead enemies excluded, partial sprite overlap allowed');
