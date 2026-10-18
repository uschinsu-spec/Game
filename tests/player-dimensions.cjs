const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

class Vector3{
  constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}
  copyFrom(v){Object.assign(this,{x:v.x,y:v.y,z:v.z});return this;}
  clone(){return new Vector3(this.x,this.y,this.z);}
  set(x,y,z){Object.assign(this,{x,y,z});return this;}
}
class TransformNode{
  constructor(name){this.name=name;this.position=new Vector3();this.rotation=new Vector3();this.scaling=new Vector3(1,1,1);this.parent=null;}
}

const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},BABYLON:{Vector3,TransformNode}});
context.window.BABYLON=context.BABYLON;
vm.runInContext(fs.readFileSync(path.join(root,'assets/player/core/config.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/player/core/rig.js'),'utf8'),context);
const rig=new context.window.PlayerRig({},null),n=rig.nodes,A=context.window.PlayerConfig.anthropometry;
const worldPos=node=>{let x=0,y=0,z=0;for(let p=node;p;p=p.parent){x+=p.position?.x||0;y+=p.position?.y||0;z+=p.position?.z||0;}return {x,y,z};};
const cm=v=>v*100, near=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<1e-7,`${label}: ${actual} != ${expected}`);

near(cm(worldPos(n.pelvis).y),92,'pelvis height');
near(cm(worldPos(n.shinL).y),49,'knee height');
near(cm(worldPos(n.footL).y),8,'ankle height');
near(cm(worldPos(n.upperArmL).y),143,'shoulder height');
near(cm(worldPos(n.headSocket).y),175,'crown height');
near(Math.abs(cm(worldPos(n.upperArmR).x-worldPos(n.upperArmL).x)),A.shoulderJointWidthCm,'shoulder joint width');
assert.equal(A.heightCm,175);
assert.equal(A.eyeHeightCm,164);
assert.equal(A.headHeightCm,23);
assert.equal(A.handLengthCm,18);
assert.equal(A.footLengthCm,27);
console.log('PASS: canonical Player anthropometry = 175 cm and rig landmarks match centimetre specification');
