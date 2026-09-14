const canvas=document.getElementById('renderCanvas');
const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,adaptToDeviceRatio:true});
const scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(.60,.82,.88,1);
scene.fogMode=BABYLON.Scene.FOGMODE_LINEAR;scene.fogStart=92;scene.fogEnd=220;scene.fogColor=new BABYLON.Color3(.73,.86,.83);

const hemi=new BABYLON.HemisphericLight('sky',new BABYLON.Vector3(0,1,0),scene);hemi.intensity=1.08;
const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-.5,-1,.35),scene);sun.position=new BABYLON.Vector3(70,100,-60);sun.intensity=1.25;
const shadow=new BABYLON.ShadowGenerator(1024,sun);shadow.useBlurExponentialShadowMap=true;shadow.blurKernel=18;

// Camera is created here, but idle-adventure.js is the only runtime owner of camera movement.
const camera=new BABYLON.ArcRotateCamera('camera',Math.PI/2,1.15,19.2,new BABYLON.Vector3(0,1.35,0),scene);
camera.inputs.clear();camera.panningSensibility=0;camera.lowerBetaLimit=1.15;camera.upperBetaLimit=1.15;camera.lowerRadiusLimit=19.2;camera.upperRadiusLimit=19.2;camera.fov=.72;camera.minZ=.1;camera.maxZ=420;

const mat=(name,color)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.06,.06,.06);return m};
const goldMat=mat('gold','#d9b45d'),redMat=mat('enemyHost','#9f3e38'),whiteMat=mat('robeFallback','#e7ece9'),blueMat=mat('armorFallback','#5da3bf'),darkMat=mat('hairFallback','#17202b'),bladeMat=mat('blade','#9bdcff');

// PlayerRoot is the only gameplay transform. rigged-player.js owns visual model/animation/socket.
// These primitive parts are emergency fallback only and are disabled after the GLB loads.
const player=new BABYLON.TransformNode('PlayerRoot',scene);player.position.set(0,0,62);player.rotation.y=Math.PI;
const bodyRoot=new BABYLON.TransformNode('SkeletonRoot',scene);bodyRoot.parent=player;
function part(name,type,opt,pos,material,parent=bodyRoot){
  const m=type==='box'?BABYLON.MeshBuilder.CreateBox(name,opt,scene):type==='sphere'?BABYLON.MeshBuilder.CreateSphere(name,opt,scene):BABYLON.MeshBuilder.CreateCylinder(name,opt,scene);
  m.position.copyFrom(pos);m.material=material;m.parent=parent;shadow.addShadowCaster(m);return m;
}
const torso=part('Torso','box',{width:.72,height:1.05,depth:.38},new BABYLON.Vector3(0,1.55,0),whiteMat);
const armor=part('ArmorSocket','box',{width:.86,height:.78,depth:.48},new BABYLON.Vector3(0,1.62,0),blueMat);
const head=part('Head','sphere',{diameter:.48,segments:12},new BABYLON.Vector3(0,2.28,0),mat('skinFallback','#d8b59a'));
const hair=part('Hair','sphere',{diameter:.53,segments:10},new BABYLON.Vector3(0,2.38,.03),darkMat);hair.scaling.y=.72;
const armL=part('ArmL','cylinder',{height:.9,diameter:.22,tessellation:8},new BABYLON.Vector3(-.52,1.55,0),whiteMat);
const armR=part('ArmR','cylinder',{height:.9,diameter:.22,tessellation:8},new BABYLON.Vector3(.52,1.55,0),whiteMat);
const legL=part('LegL','cylinder',{height:1.05,diameter:.27,tessellation:8},new BABYLON.Vector3(-.22,.58,0),darkMat);
const legR=part('LegR','cylinder',{height:1.05,diameter:.27,tessellation:8},new BABYLON.Vector3(.22,.58,0),darkMat);
const handSocket=new BABYLON.TransformNode('RightHandSocket',scene);handSocket.parent=bodyRoot;handSocket.position.set(.58,1.18,0);
const fallbackWeapon=new BABYLON.TransformNode('FallbackWeapon',scene);fallbackWeapon.parent=handSocket;fallbackWeapon.rotation.z=-.2;
part('FallbackBlade','box',{width:.09,height:1.3,depth:.04},new BABYLON.Vector3(0,-.55,0),bladeMat,fallbackWeapon);
part('FallbackHilt','box',{width:.4,height:.08,depth:.09},new BABYLON.Vector3(0,.1,0),goldMat,fallbackWeapon);

// Shared gameplay state only. No movement/camera loop lives here.
const keys={};let joy={x:0,y:0};let mounted=false;let attackT=0;let skillT=0;
const anim=document.getElementById('animState'),equip=document.getElementById('equipmentState');

// Enemy host objects are hitboxes/parents only. ultimate-monsters.js exclusively owns enemy visuals and animation.
for(let i=0;i<12;i++){
  const e=BABYLON.MeshBuilder.CreateCylinder('Demon',{height:1.6,diameter:.7,tessellation:8},scene);
  e.position.set(0,.8,0);e.material=redMat;e.isVisible=false;e.setEnabled(false);e.metadata={enemySlot:i,spawnSerial:0};
}

// Exactly one render loop. mobile-runtime.js may pause/resume this loop but never creates gameplay updates.
engine.runRenderLoop(()=>scene.render());
window.addEventListener('resize',()=>engine.resize(),{passive:true});
window.GameRuntime={engine,scene,player,camera};