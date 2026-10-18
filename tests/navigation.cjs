const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Minimal math adapter: exercise the game's navigation without a GPU or CDN.
class Vector3 {
  constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}
  clone(){return new Vector3(this.x,this.y,this.z);}
  copyFrom(v){Object.assign(this,{x:v.x,y:v.y,z:v.z});return this;}
  set(x,y,z){Object.assign(this,{x,y,z});return this;}
  subtract(v){return new Vector3(this.x-v.x,this.y-v.y,this.z-v.z);}
  add(v){return new Vector3(this.x+v.x,this.y+v.y,this.z+v.z);}
  scale(s){return new Vector3(this.x*s,this.y*s,this.z*s);}
  addInPlace(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  lengthSquared(){return this.x*this.x+this.y*this.y+this.z*this.z;}
  length(){return Math.sqrt(this.lengthSquared());}
  normalize(){const n=this.length();if(n){this.x/=n;this.y/=n;this.z/=n;}return this;}
  static Distance(a,b){return a.subtract(b).length();}
  static DistanceSquared(a,b){return a.subtract(b).lengthSquared();}
  static Up(){return new Vector3(0,1,0);}
  static Cross(a,b){return new Vector3(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);}
  static Lerp(a,b,t){return new Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t);}
}
const B={Vector3,TransformNode:class{constructor(){this.position=new Vector3();this.rotation=new Vector3();this.rotation.set=(x,y,z)=>{this.rotation.x=x;this.rotation.y=y;this.rotation.z=z;};this.scaling={clone:()=>({}),setAll(){}};} }};
const DummyVisual=class{constructor(){this.root={parent:null,rotation:new Vector3()};this.state='Idle';}async load(){}setState(s){this.state=s;}update(){}getSocket(){return null;}};
const context=vm.createContext({window:{PlayerConfig:{stats:{moveSpeed:7,maxHp:180,respawnSeconds:3},animation:{skillAnimationMap:['Attack1','Attack2','Cast','Cast','Cast']},PlayerVisual:DummyVisual},BABYLON:B},BABYLON:B,B});
context.window.BABYLON=B;context.window.PlayerVisual=DummyVisual;context.window.PlayerConfig=context.window.PlayerConfig;
const root=path.resolve(__dirname,'..');
vm.runInContext(fs.readFileSync(path.join(root,'mountain-world.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/player/core/motor.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/player/core/player.js'),'utf8'),context);
const world=new context.window.MountainWorld({});
vm.runInContext(fs.readFileSync(path.join(root,'forest-world.js'),'utf8'),context);
const forest=new context.window.ForestWorld({});forest.obstacles=[{x:0,z:0,w:6,d:6}];forest.blocked=new Set();
assert.equal(forest.walkRadius,550,'Expanded forest radius');
assert.equal(forest.bounds.maxX-forest.bounds.minX,1100,'Expanded forest bounds');
for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)forest.blocked.add(`${x},${z}`);
const forestStart=new Vector3(-15,.14,0),forestGoal=new Vector3(15,.14,0),forestRoute=forest.findPath(forestStart,forestGoal);
assert.ok(forestRoute.length>1,'Forest navigation goes around trunks');
let forestFrom=forestStart;for(const to of forestRoute){assert.ok(forest.clearLine(forestFrom,to),'Forest route segment clears obstacles');forestFrom=to;}
assert.equal(Vector3.Distance(forestRoute.at(-1),forestGoal),0);
assert.equal(world.summitScale,5);assert.equal(world.plazaScale,2);
assert.equal(world.bounds.maxX-world.bounds.minX,world.walkRadius*2);
for(let i=0;i<32;i++){
  const a=i/32*Math.PI*2,p=new Vector3(Math.cos(a)*1000,.14,world.summitCenter.z+Math.sin(a)*1000);
  world.constrain(p);assert.ok(world.onSummit(p),'Every direction stops inside the circular railing');
  assert.ok(Math.abs(Math.hypot(p.x,p.z-world.summitCenter.z)-world.walkRadius)<1e-6);
}
world.obstacles=[{x:0,z:0,w:12,d:16}];
const a=new Vector3(-20,.14,0),b=new Vector3(20,.14,0);
const route=world.findPath(a,b);
assert.ok(route.length>=3,'Route must go around the building');
assert.equal(Vector3.Distance(route.at(-1),b),0);
let from=a;
for(const to of route){for(let i=0;i<=100;i++){const p=from.add(to.subtract(from).scale(i/100));assert.ok(!(Math.abs(p.x)<6.6&&Math.abs(p.z)<8.6),'Route enters obstacle');}from=to;}
assert.equal(world.findPath(a,new Vector3(0,.14,0)).length,0,'Interior clicks rejected');
assert.equal(world.findPath(a,new Vector3(-30,.14,10)).length,1,'Clear ground uses straight path');
const edge=world.findPath(a,new Vector3(-1000,.14,0)).at(-1);assert.ok(world.onSummit(edge));
assert.ok(Math.abs(Math.hypot(edge.x,edge.z-world.summitCenter.z)-world.walkRadius)<1e-6);
assert.equal(world.findPath(new Vector3(150,.14,15),new Vector3(300,.14,15)).length,1,'Outer summit is walkable');

(async()=>{
  const player=new context.window.PlayerController({});await player.create(a);
  player.path=route;
  const idle={lengthSquared:()=>0},camera={getForwardRay:()=>({direction:new Vector3(0,0,1)})};
  for(let i=0;i<400&&player.path.length;i++)player.update(.05,idle,camera,world);
  assert.equal(player.path.length,0,'Player arrives and stops');
  assert.ok(Vector3.Distance(player.position,b)<.06,'Player reaches destination without overshooting');
  player.path=world.findPath(player.position,a);player.update(.05,new Vector3(1,0,0),camera,world);
  assert.equal(player.path.length,0,'Manual movement cancels click movement');
  player.path=[a];player.takeDamage(1000);player.update(.05,idle,camera,world);assert.equal(player.path.length,0,'Death cancels route');
  for(let i=0;i<65;i++)player.update(.05,idle,camera,world);
  assert.equal(player.dead,false);assert.equal(Vector3.Distance(player.position,a),0,'Respawn uses scaled spawn');
  console.log('PASS: scale, bounds, obstacle routing, arrival, manual override, death and respawn');
})().catch(error=>{console.error(error);process.exitCode=1;});
