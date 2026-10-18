const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
class V{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}clone(){return new V(this.x,this.y,this.z);}add(v){return new V(this.x+v.x,this.y+v.y,this.z+v.z);}static Distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);}}
const source=fs.readFileSync(path.join(__dirname,'../game.js'),'utf8'),context=vm.createContext({B:{Vector3:V},window:{}});
vm.runInContext(source.slice(source.indexOf('  class Combat {'),source.indexOf('  class Inventory {'))+'\nwindow.Combat=Combat;',context);
const player={position:new V(),dead:false,hp:70,maxHp:180,playAttack(){}};
function enemy(x,z){return {alive:true,hp:250,mesh:{position:new V(x,0,z)},damageBy(n){const d=Math.min(n,this.hp);this.hp-=d;if(this.hp<=0)this.alive=false;return d;}};}
const entities={monsters:[enemy(2,0),enemy(3,0),enemy(80,0)],nearest(p,max){return this.monsters.filter(m=>m.alive&&V.Distance(p,m.mesh.position)<max).sort((a,b)=>V.Distance(p,a.mesh.position)-V.Distance(p,b.mesh.position))[0]||null;}};
const c=new context.window.Combat(player,entities);let casts=0;c.onSkillCast=()=>casts++;
c.update(.1);assert.equal(casts,0,'Auto starts off');
c.auto=true;c.update(.1);assert.equal(casts,1);assert.equal(player.hp,115,'Auto heals low health');
assert.ok(entities.monsters[0].hp<250&&entities.monsters[1].hp<250,'Area skill hits nearby enemies');assert.equal(entities.monsters[2].hp,250,'Distant enemies unaffected');
c.update(.1);assert.equal(casts,1,'Global cooldown prevents spamming');
c.auto=false;c.update(10);assert.equal(casts,1,'Auto stops immediately when disabled');
player.dead=true;c.auto=true;c.update(10);assert.equal(casts,1,'No casts while dead');assert.equal(c.useSkill(0),false);
player.dead=false;entities.monsters.forEach(m=>m.mesh.position.x=100);c.target=entities.monsters[0];assert.equal(c.useSkill(0),false,'No attacks beyond range');
player.hp=179;assert.equal(c.useSkill(3),true);assert.equal(player.hp,180,'Healing cannot exceed max HP');
assert.equal(c.useSkill(3),false,'Individual cooldown enforced');
console.log('PASS: auto toggle, targeting, range, area damage, cooldowns, healing, death');
