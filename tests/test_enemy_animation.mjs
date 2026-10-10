import assert from 'node:assert/strict';
import {ENEMY_MASTER,enemyVisual} from '../src/core/enemy-master.js';
const spec={sprite:'enemy2',frames:10};
assert.equal(Object.keys(ENEMY_MASTER).length,65);
assert.equal(Object.values(ENEMY_MASTER).filter(x=>x.category==='WINGED').length,18);
for(const sprite of ['enemy2','enemy10']){
 const e={kind:'wolf',sprite,walk:false,moveAge:6.9,attackAnim:0};
 assert.deepEqual([enemyVisual(e,spec).row,enemyVisual(e,spec).column],[0,0]);
 e.walk=true;assert.equal(enemyVisual(e,spec).column,6);
 e.moveAge=12.5;assert.equal(enemyVisual(e,spec).column,2);
 e.attackAnim=.1;e.attackAge=.59;
 assert.deepEqual([enemyVisual(e,spec).row,enemyVisual(e,spec).column],[1,9]);
 e.attackAge=1;assert.equal(enemyVisual(e,spec).column,9);
}
assert.equal(enemyVisual({sprite:'enemy10'},spec).hoverHeight,26);
assert.equal(enemyVisual({sprite:'enemy2'},spec).hoverHeight,0);
assert.equal(enemyVisual({kind:'deer',walk:false,moveAge:3},{}).column,0);
console.log('PASS: idle, run/fly, attack priority, frame limits and flying height');

assert.equal(ENEMY_MASTER.enemy10.movement,'fly');
assert.equal(ENEMY_MASTER.enemy2.movement,'run');
assert.equal(enemyVisual({sprite:'enemy10'},spec).shadowOpacity,.65);
assert.equal(enemyVisual({sprite:'enemy10'},spec).shadowWidthRatio,.44);
