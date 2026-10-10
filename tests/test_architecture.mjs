import assert from 'node:assert/strict';
import {installSystems} from '../src/core/systems.js';
import {Game} from '../src/game.js';
import {TYPES,GAMEPLAY,NPC_TEMPLATES} from '../src/core/config.js';
import {makeWorld} from '../src/world.js';

class Host {existing(){}}
assert.throws(()=>installSystems(Host,[{existing(){}}]),/Duplicate/);
assert.throws(()=>installSystems(Host,[{invalid:2}]),/Invalid/);
installSystems(Host,[{feature(){return 42}}]);assert.equal(new Host().feature(),42);
assert.ok(GAMEPLAY.characterSpeed>0);
for(const npc of NPC_TEMPLATES)assert.ok(TYPES.includes(npc.sprite));

// Exercise real renderer methods to detect missing imports after system extraction.
const context=new Proxy({}, {get(target,key){
  if(key in target)return target[key];
  if(key==='createRadialGradient'||key==='createLinearGradient')return ()=>({addColorStop(){}});
  return ()=>{};
}});
const g=Object.assign(Object.create(Game.prototype),{
  state:makeWorld(),mapId:'map',ctx:context,miniCtx:context,mini:{width:160,height:90},
  w:1280,h:720,dpr:1,cam:{x:0,y:0},gameTime:0,images:Object.fromEntries(TYPES.map(id=>[id,{}])),
});
g.images.map={width:1672,height:941};g.player=g.makePlayer();g.ensureNPCs();g.refreshEnemies();
g.render();g.drawMinimap();
for(const actor of [g.player,...g.state.npcs]){
  for(const animation of ['idleAge','walkAge','attackAge','skillAge']){
    actor.attackAnim=animation==='attackAge'?.2:0;actor.skillAnim=animation==='skillAge'?.2:0;
    actor.walk=animation==='walkAge';actor[animation]=.1;g.drawHero(actor);
  }
}
console.log('PASS: system registration, shared configuration and renderer animations');
