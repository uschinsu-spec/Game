import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {Game} from '../src/game.js';
import {floorNumber,floorId,floorAsset,FLOOR_COUNT} from '../src/floors.js';
import {portalsFor,makeWorld,isWalkable} from '../src/world.js';

for(let n=1;n<=FLOOR_COUNT;n++){
  const id=floorId(n),portals=portalsFor(id);
  assert.equal(floorNumber(id),n);
  assert.ok(existsSync(new URL(`../assets/webp/${floorAsset(id)}.webp`,import.meta.url)));
  assert.equal(portals.length,n===1||n===99?1:2);
  for(const portal of portals){
    assert.ok(isWalkable(portal.x,portal.y,id));
    assert.equal(Math.abs(floorNumber(portal.to)-n),1);
    assert.ok(portalsFor(portal.to).some(p=>p.to===id));
  }
  assert.ok(makeWorld(id).enemies.every(e=>e.kind===(n===1?'deer':'wolf')));
}
assert.equal(floorId(100),'map');assert.equal(floorId(-1),'map');

const store=new Map();globalThis.localStorage={setItem:(k,v)=>store.set(k,v),getItem:k=>store.get(k)};
const g=Object.assign(Object.create(Game.prototype),{
  mapId:'map',mapStates:{},mapImages:new Map(),images:{map:{}},state:makeWorld(),gameTime:0,
  input:{clear(){}},toast(){},drawMinimap(){},async loadFloorImage(){return {}},
});
g.player=g.makePlayer();g.ensureNPCs();g.refreshEnemies();
const states=[g.state];g.player.gold=777;
for(let n=2;n<=99;n++){
  assert.equal(await g.travel(),true);assert.equal(g.mapId,floorId(n));
  assert.ok(isWalkable(g.player.x,g.player.y,g.mapId));
  assert.equal(g.state.npcs.length,2);states.push(g.state);
}
assert.equal(await g.travel(),false,'No floor 100');
const restored=Object.create(Game.prototype);restored.player=restored.makePlayer();restored.restore();
assert.equal(restored.mapId,'map99');assert.equal(restored.player.gold,777);
for(let n=98;n>=1;n--){
  assert.equal(await g.travel('back'),true);assert.equal(g.mapId,floorId(n));
  assert.equal(g.state,states[n-1]);assert.ok(isWalkable(g.player.x,g.player.y,g.mapId));
}
assert.equal(await g.travel('back'),false,'No floor 0');
g.loadFloorImage=async()=>{throw Error('Expected simulated load failure')};
const originalError=console.error;console.error=()=>{};
try{assert.equal(await g.travel(),false)}finally{console.error=originalError}
assert.equal(g.mapId,'map');assert.equal(g.transitioning,false);assert.equal(g.state,states[0]);
// Only one transfer can be pending; the current floor stays intact until loaded.
let finish;g.loadFloorImage=()=>new Promise(resolve=>{finish=resolve});
const pending=g.travel();assert.equal(g.transitioning,true);assert.equal(await g.travel(),false);
assert.equal(g.mapId,'map');finish({});await pending;assert.equal(g.mapId,'map2');
console.log('PASS: all 99 assets, adjacent portals, forward/back travel, boundaries, save, load failure and duplicate transfer');
// The image cache is bounded and reuses a repeated floor's existing art.
let loads=0;
globalThis.Image=class{set src(value){this.url=value;loads++;queueMicrotask(()=>this.onload())}};
const cache=Object.assign(Object.create(Game.prototype),{mapImages:new Map()});
const image=await cache.loadFloorImage('map');assert.equal(await cache.loadFloorImage('map'),image);assert.equal(loads,1);
await cache.loadFloorImage('map2');await cache.loadFloorImage('map3');await cache.loadFloorImage('map4');
assert.equal(cache.mapImages.size,3);assert.equal(cache.mapImages.has(floorAsset('map')),false);
const count=loads;await cache.loadFloorImage('map25');assert.equal(loads,count,'Cyclic art should reuse cache');
console.log('PASS: bounded LRU image cache and shared art reuse');
