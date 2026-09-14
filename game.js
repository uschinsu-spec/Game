const canvas=document.getElementById('renderCanvas');
const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,adaptToDeviceRatio:true});
const scene=new BABYLON.Scene(engine);scene.clearColor=new BABYLON.Color4(.58,.72,.84,1);scene.fogMode=BABYLON.Scene.FOGMODE_LINEAR;scene.fogStart=55;scene.fogEnd=110;scene.fogColor=new BABYLON.Color3(.58,.72,.84);
const hemi=new BABYLON.HemisphericLight('sky',new BABYLON.Vector3(0,1,0),scene);hemi.intensity=.88;const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-.5,-1,.4),scene);sun.position=new BABYLON.Vector3(20,30,-20);sun.intensity=1.1;
const shadow=new BABYLON.ShadowGenerator(1024,sun);shadow.useBlurExponentialShadowMap=true;shadow.blurKernel=18;

// Third-person follow camera: camera always turns with the character's facing direction.
const CAM_BETA=1.12;
const CAM_RADIUS_DEFAULT=18;
const CAM_RADIUS_MIN=10;
const CAM_RADIUS_MAX=31;
const CAM_LOOK_AHEAD=4.4;
const CAM_TARGET_HEIGHT=1.45;
const CAMERA_FOLLOW_SPEED=8.5;
const TURN_SPEED=2.5;
let cameraRadius=CAM_RADIUS_DEFAULT;
const camera=new BABYLON.ArcRotateCamera('camera',Math.PI/2,CAM_BETA,cameraRadius,new BABYLON.Vector3(0,CAM_TARGET_HEIGHT,0),scene);
camera.inputs.clear();camera.panningSensibility=0;camera.lowerRadiusLimit=CAM_RADIUS_MIN;camera.upperRadiusLimit=CAM_RADIUS_MAX;camera.lowerBetaLimit=CAM_BETA;camera.upperBetaLimit=CAM_BETA;camera.fov=.66;camera.minZ=.1;camera.maxZ=180;

const mat=(name,color)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.08,.08,.08);return m};
const groundMat=mat('stone','#7e8994'),rockMat=mat('rock','#596b70'),woodMat=mat('wood','#553b2d'),roofMat=mat('roof','#273e45'),goldMat=mat('gold','#c9a95b'),redMat=mat('enemy','#9f3e38'),whiteMat=mat('robe','#d9e4ec'),blueMat=mat('armor','#294d73'),darkMat=mat('hair','#17202b'),bladeMat=mat('blade','#9bdcff'),horseMat=mat('horse','#5b4031');
const ground=BABYLON.MeshBuilder.CreateGround('ground',{width:80,height:80,subdivisions:2},scene);ground.material=groundMat;ground.receiveShadows=true;
for(let i=0;i<22;i++){const r=BABYLON.MeshBuilder.CreateCylinder('rock',{diameter:2+Math.random()*3,height:1.5+Math.random()*5,tessellation:7},scene);r.position.set((Math.random()-.5)*65,0,(Math.random()-.5)*65);r.position.y=r.getBoundingInfo().boundingBox.extendSizeWorld.y;r.rotation.y=Math.random()*Math.PI;r.material=rockMat;r.receiveShadows=true}
function pagoda(x,z,s=1){const root=new BABYLON.TransformNode('pagoda',scene);for(let y=0;y<2;y++){const base=BABYLON.MeshBuilder.CreateBox('hall',{width:4*s,height:1.8*s,depth:3*s},scene);base.position.set(x,1+y*2.1*s,z);base.material=woodMat;base.parent=root;const roof=BABYLON.MeshBuilder.CreateCylinder('roof',{diameterTop:1*s,diameterBottom:5.3*s,height:.65*s,tessellation:4},scene);roof.position.set(x,2+y*2.1*s,z);roof.rotation.y=Math.PI/4;roof.material=roofMat;roof.parent=root}return root}pagoda(0,-20,1.4);pagoda(-15,-14,.75);pagoda(17,-17,.8);
for(let i=-3;i<=3;i++){const step=BABYLON.MeshBuilder.CreateBox('step',{width:8,height:.25,depth:1},scene);step.position.set(0,.12+i*.06,-8-i);step.material=groundMat;step.receiveShadows=true}

const player=new BABYLON.TransformNode('PlayerRoot',scene);player.position.set(0,0,5);player.rotation.y=Math.PI;const bodyRoot=new BABYLON.TransformNode('SkeletonRoot',scene);bodyRoot.parent=player;
function part(name,type,opt,pos,material,parent=bodyRoot){let m=type==='box'?BABYLON.MeshBuilder.CreateBox(name,opt,scene):type==='sphere'?BABYLON.MeshBuilder.CreateSphere(name,opt,scene):BABYLON.MeshBuilder.CreateCylinder(name,opt,scene);m.position.copyFrom(pos);m.material=material;m.parent=parent;shadow.addShadowCaster(m);return m}
const torso=part('Torso','box',{width:.72,height:1.05,depth:.38},new BABYLON.Vector3(0,1.55,0),whiteMat);const armor=part('ArmorSocket','box',{width:.86,height:.78,depth:.48},new BABYLON.Vector3(0,1.62,0),blueMat);const head=part('Head','sphere',{diameter:.48,segments:12},new BABYLON.Vector3(0,2.28,0),mat('skin','#d8b59a'));const hair=part('Hair','sphere',{diameter:.53,segments:10},new BABYLON.Vector3(0,2.38,.03),darkMat);hair.scaling.y=.72;
const armL=part('ArmL','cylinder',{height:.9,diameter:.22,tessellation:8},new BABYLON.Vector3(-.52,1.55,0),whiteMat);const armR=part('ArmR','cylinder',{height:.9,diameter:.22,tessellation:8},new BABYLON.Vector3(.52,1.55,0),whiteMat);const legL=part('LegL','cylinder',{height:1.05,diameter:.27,tessellation:8},new BABYLON.Vector3(-.22,.58,0),darkMat);const legR=part('LegR','cylinder',{height:1.05,diameter:.27,tessellation:8},new BABYLON.Vector3(.22,.58,0),darkMat);
const handSocket=new BABYLON.TransformNode('RightHandSocket',scene);handSocket.parent=bodyRoot;handSocket.position.set(.58,1.18,0);const backSocket=new BABYLON.TransformNode('BackSocket',scene);backSocket.parent=bodyRoot;backSocket.position.set(0,1.75,.25);const mountSocket=new BABYLON.TransformNode('MountSocket',scene);mountSocket.parent=player;
function sword(kind=0){if(handSocket.getChildren().length)handSocket.getChildren().forEach(n=>n.dispose());const root=new BABYLON.TransformNode('Weapon',scene);root.parent=handSocket;root.rotation.z=-.2;part('Blade','box',{width:.09,height:1.3,depth:.04},new BABYLON.Vector3(0,-.55,0),kind?goldMat:bladeMat,root);part('Hilt','box',{width:.4,height:.08,depth:.09},new BABYLON.Vector3(0,.1,0),goldMat,root);return root}sword();
let mounted=false,mount=null,weaponKind=0,armorKind=0,beast=null;
function createMount(){const root=new BABYLON.TransformNode('HorseMount',scene);root.parent=mountSocket;part('HorseBody','box',{width:.75,height:.85,depth:1.65},new BABYLON.Vector3(0,.9,0),horseMat,root);const neck=part('HorseNeck','cylinder',{height:.9,diameter:.42,tessellation:8},new BABYLON.Vector3(0,1.45,-.62),horseMat,root);neck.rotation.x=-.45;part('HorseHead','box',{width:.45,height:.45,depth:.7},new BABYLON.Vector3(0,1.82,-.95),horseMat,root);[-.28,.28].forEach(x=>[-.55,.55].forEach(z=>part('HorseLeg','cylinder',{height:.9,diameter:.15,tessellation:7},new BABYLON.Vector3(x,.35,z),horseMat,root)));return root}
function spawnBeast(){if(beast){beast.dispose();beast=null;return}beast=new BABYLON.TransformNode('SpiritBeast',scene);const bm=mat('beastMat','#7fc6d5');part('BeastBody','sphere',{diameter:.75,segments:10},new BABYLON.Vector3(0,.65,0),bm,beast);part('BeastHead','sphere',{diameter:.5,segments:10},new BABYLON.Vector3(0,1,-.42),bm,beast);beast.position=player.position.add(new BABYLON.Vector3(-1,0,1.5))}
for(let i=0;i<5;i++){const e=BABYLON.MeshBuilder.CreateCylinder('Demon',{height:1.6,diameter:.7,tessellation:8},scene);e.position.set(-8+i*4,.8,-4-Math.random()*4);e.material=redMat;shadow.addShadowCaster(e)}

const keys={};addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);let joy={x:0,y:0},joyId=null;const joystick=document.getElementById('joystick'),stick=document.getElementById('stick');
function joyMove(e){const t=[...e.changedTouches].find(t=>t.identifier===joyId);if(!t)return;const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=t.clientX-cx,dy=t.clientY-cy,max=r.width*.32,len=Math.hypot(dx,dy)||1,k=Math.min(1,max/len);joy.x=dx/max*k;joy.y=dy/max*k;stick.style.transform=`translate(${joy.x*max}px,${joy.y*max}px)`}
joystick.addEventListener('touchstart',e=>{joyId=e.changedTouches[0].identifier;joyMove(e)},{passive:false});joystick.addEventListener('touchmove',e=>{e.preventDefault();joyMove(e)},{passive:false});joystick.addEventListener('touchend',()=>{joy={x:0,y:0};joyId=null;stick.style.transform=''});
let vy=0,onGround=true,attackT=0,skillT=0;const anim=document.getElementById('animState'),equip=document.getElementById('equipmentState');
function pulse(type){if(type==='attack')attackT=.32;else skillT=.55}document.getElementById('attack').onclick=()=>pulse('attack');document.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>pulse('skill'));document.getElementById('jump').onclick=()=>{if(onGround){vy=5.2;onGround=false}};
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='weapon'){weaponKind=1-weaponKind;sword(weaponKind)}if(a==='armor'){armorKind=1-armorKind;armor.material=armorKind?goldMat:blueMat}if(a==='mount'){mounted=!mounted;if(mounted&&!mount)mount=createMount();bodyRoot.position.y=mounted?1.75:0;if(mount)mount.setEnabled(mounted);b.textContent=mounted?'Xuống ngựa':'Cưỡi ngựa'}if(a==='beast')spawnBeast();equip.textContent=`${weaponKind?'Tiên kiếm':'Thanh kiếm'} • ${armorKind?'Kim Vân giáp':'Thanh Vân giáp'}${mounted?' • Đang cưỡi':''}`});
function normalizeAngle(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a}

scene.onBeforeRenderObservable.add(()=>{
  const dt=Math.min(.033,engine.getDeltaTime()/1000);
  let turn=joy.x+(keys.d?1:0)-(keys.a?1:0);
  let forward=-joy.y+(keys.w?1:0)-(keys.s?1:0);
  turn=BABYLON.Scalar.Clamp(turn,-1,1);forward=BABYLON.Scalar.Clamp(forward,-1,1);

  // Tank/MMORPG controls: left/right rotates the character; up/down moves along its facing direction.
  if(Math.abs(turn)>.04)player.rotation.y+=turn*TURN_SPEED*dt*(mounted?1.15:1);
  const moveSpeed=(mounted?6.5:4)*(forward<0?.72:1);
  const facing=new BABYLON.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));
  const moving=Math.abs(forward)>.05;
  if(moving){player.position.addInPlace(facing.scale(moveSpeed*forward*dt));const t=performance.now()*.012*(mounted?1.5:1);armL.rotation.x=Math.sin(t)*.55;armR.rotation.x=-Math.sin(t)*.55;legL.rotation.x=-Math.sin(t)*.55;legR.rotation.x=Math.sin(t)*.55}else{armL.rotation.x*=.82;armR.rotation.x*=.82;legL.rotation.x*=.82;legR.rotation.x*=.82}

  if(!onGround){player.position.y+=vy*dt;vy-=12*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true}}
  if(attackT>0){attackT-=dt;armR.rotation.z=-1.5*Math.sin((.32-attackT)/.32*Math.PI)}
  if(skillT>0){skillT-=dt;const s=1+Math.sin((.55-skillT)/.55*Math.PI)*.15;player.scaling.setAll(s)}else player.scaling.setAll(1);
  if(beast){const target=player.position.add(new BABYLON.Vector3(-1.4,0,1.5));beast.position=BABYLON.Vector3.Lerp(beast.position,target,dt*3);beast.position.y=.15+Math.sin(performance.now()*.004)*.15}

  // Camera yaw follows the character, so turning the character also turns the whole view.
  const desiredAlpha=-player.rotation.y-Math.PI/2;
  const delta=normalizeAngle(desiredAlpha-camera.alpha);
  camera.alpha+=delta*Math.min(1,dt*CAMERA_FOLLOW_SPEED);
  camera.beta=CAM_BETA;camera.radius=cameraRadius;
  const desiredTarget=player.position.add(facing.scale(CAM_LOOK_AHEAD)).add(new BABYLON.Vector3(0,mounted?2.25:CAM_TARGET_HEIGHT,0));
  camera.target=BABYLON.Vector3.Lerp(camera.target,desiredTarget,Math.min(1,dt*CAMERA_FOLLOW_SPEED));

  anim.textContent=attackT>0?'Attack':skillT>0?'Skill':!onGround?'Jump':moving?(mounted?'Ride Run':'Run'):(mounted?'Ride Idle':'Idle');
  document.getElementById('coords').textContent=`X: ${player.position.x.toFixed(1)} Z: ${player.position.z.toFixed(1)}`;
});
engine.runRenderLoop(()=>scene.render());addEventListener('resize',()=>engine.resize());
