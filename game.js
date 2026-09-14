const canvas=document.getElementById('renderCanvas');
const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:false,adaptToDeviceRatio:true});
const scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(.60,.82,.88,1);
scene.fogMode=BABYLON.Scene.FOGMODE_LINEAR;scene.fogStart=92;scene.fogEnd=220;scene.fogColor=new BABYLON.Color3(.73,.86,.83);

const hemi=new BABYLON.HemisphericLight('sky',new BABYLON.Vector3(0,1,0),scene);hemi.intensity=1.08;
const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-.5,-1,.35),scene);sun.position.set(70,100,-60);sun.intensity=1.25;
const shadow=new BABYLON.ShadowGenerator(1024,sun);shadow.useBlurExponentialShadowMap=true;shadow.blurKernel=18;

const camera=new BABYLON.ArcRotateCamera('camera',Math.PI/2,1.15,19.2,new BABYLON.Vector3(0,1.35,0),scene);
camera.inputs.clear();camera.panningSensibility=0;camera.lowerBetaLimit=1.15;camera.upperBetaLimit=1.15;camera.lowerRadiusLimit=19.2;camera.upperRadiusLimit=19.2;camera.fov=.72;camera.minZ=.1;camera.maxZ=420;

const mat=(name,color)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.06,.06,.06);return m};
const goldMat=mat('gold','#d9b45d'),bladeMat=mat('blade','#9bdcff'),redMat=mat('enemyHost','#9f3e38');

const player=new BABYLON.TransformNode('PlayerRoot',scene);player.position.set(0,0,62);player.rotation.y=Math.PI;
const bodyRoot=new BABYLON.TransformNode('SkeletonRoot',scene);bodyRoot.parent=player;
let attackT=0;

// Read-only compatibility bridge for cloth/hair sway. It does not own movement.
const keys={};
const joy={get x(){return 0},get y(){const s=window.PLAYER_MOTION_STATE;return s==='walk'||s==='run'?-1:0}};

const enemyHost=BABYLON.MeshBuilder.CreateCylinder('Demon',{height:1.6,diameter:.7,tessellation:6},scene);
enemyHost.position.set(0,.8,0);enemyHost.material=redMat;enemyHost.isVisible=false;enemyHost.setEnabled(false);enemyHost.metadata={enemySlot:0,spawnSerial:0};

engine.runRenderLoop(()=>scene.render());
window.addEventListener('resize',()=>engine.resize(),{passive:true});
window.GameRuntime={engine,scene,player,camera,enemyHost};