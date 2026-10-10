import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeWorld} from '../src/world.js';
import {Engine,SKILLS,syncStats} from '../src/cultivation.js';
import {skillVfxRow,SKILL_VFX_ROWS,skillColor,SKILL_VFX,skillVfxFrame} from '../src/skill-vfx.js';

assert.equal(Object.keys(SKILL_VFX_ROWS).length,9);
assert.equal(SKILL_VFX.columns,12);
for(let row=0;row<9;row++)for(let col=0;col<12;col++){
  const frame=skillVfxFrame(row,col);
  assert.ok(frame.width>0&&frame.height>0);
  assert.ok(frame.x>=0&&frame.y>=0&&frame.x+frame.width<=1774&&frame.y+frame.height<=887);
  if(col<11)assert.ok(frame.x+frame.width<skillVfxFrame(row,col+1).x);
  if(row<8)assert.ok(frame.y+frame.height<skillVfxFrame(row+1,col).y);
}
assert.equal(skillVfxRow({id:'kiem_1',elem:'Kim'}),0);
assert.equal(skillVfxRow({id:'metal',elem:'Kim'}),3);
function game(){
  const g=Object.assign(Object.create(Game.prototype),{mapId:'map3',state:makeWorld('map3'),toast(){},ui:{toast(){}}});
  g.player=g.makePlayer();g.player.realmIdx=1;syncStats(g.player,true);g.ensureNPCs();g.refreshEnemies();return g;
}
for(const sk of SKILLS.filter(sk=>sk.tier===1)){
  const g=game(),p=g.player;
  p.x=1000;p.y=600;p.selectedSkillId=sk.id;
  const target=g.state.enemies[0];Object.assign(target,{x:1060,y:600,hp:100000,maxHp:100000});
  g.state.enemies=[target];
  const hp=target.hp;p.mp=Engine.calcSkillMpCost(p,sk);assert.equal(g.skill(),true);assert.equal(p.mp,0);
  assert.equal(g.state.effects.length,0,'VFX waits until player release frame');
  g.tickCharacter(p,p.skillReleaseAge+.001);
  assert.equal(target.hp,hp,'Damage waits for arrival: '+sk.id);
  const projectile=g.state.effects.find(f=>f.type==='skillProjectile');
  assert.equal(projectile.row,skillVfxRow(sk));
  g.stepEffects(.02);assert.ok(projectile.x>projectile.startX);
  assert.equal(target.hp,hp);assert.ok(!g.state.effects.some(f=>f.type==='skillImpact'));
  target.x+=10;g.stepEffects(1);
  assert.ok(target.hp<hp);assert.ok(!g.state.effects.some(f=>f.type==='skillProjectile'));
  const impact=g.state.effects.find(f=>f.type==='skillImpact');
  assert.equal(impact.color,skillColor(sk));assert.equal(impact.x,target.x);assert.equal(impact.life,.38);
  assert.ok(!g.state.effects.some(f=>f.type==='impact'),'No duplicate generic hit flash');
  const after=target.hp;g.stepEffects(.5);assert.equal(target.hp,after);
  assert.ok(!g.state.effects.some(f=>f.type==='skillImpact'));
}
// A dead target cannot take another hit or emit an impact; NPC ownership is kept.
const g=game(),npc=g.state.npcs[0],enemy=g.state.enemies[0];
Object.assign(npc,{x:1000,y:600});Object.assign(enemy,{x:1060,y:600});npc.aiTarget=enemy;
g.skill(npc);g.tickCharacter(npc,npc.skillReleaseAge+.001);assert.equal(g.state.effects[0].actor,npc);enemy.dead=true;g.stepEffects(1);
assert.equal(g.state.effects.length,0);
console.log('PASS: 8 Luyen Khi skills, 9 row configuration, moving projectiles, delayed damage, elemental impact, cleanup and NPC ownership');
