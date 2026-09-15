const canvas = document.getElementById('renderCanvas');
const isTouchDevice = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const deviceDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, isTouchDevice ? 2 : 2.5));

if (typeof BABYLON !== 'undefined' && BABYLON.Texture) BABYLON.Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = isTouchDevice ? 2 : 4;
const engine = new BABYLON.Engine(canvas, false, {preserveDrawingBuffer:false,stencil:false,adaptToDeviceRatio:false,antialias:false,powerPreference:'high-performance',audioEngine:false});
const initialScale=isTouchDevice?Math.max(1,(window.devicePixelRatio||1)/deviceDpr):1;engine.setHardwareScalingLevel(initialScale);engine.disablePerformanceMonitorInBackground=true;
const scene=new BABYLON.Scene(engine);
// Bright, clean xianxia daylight palette.
scene.clearColor=new BABYLON.Color4(0.64,0.84,0.93,1);
scene.ambientColor=new BABYLON.Color3(0.32,0.36,0.38);
scene.fogMode=BABYLON.Scene.FOGMODE_NONE;scene.skipPointerMovePicking=true;scene.autoClearDepthAndStencil=false;
if(scene.imageProcessingConfiguration){const ip=scene.imageProcessingConfiguration;ip.toneMappingEnabled=true;ip.toneMappingType=BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;ip.exposure=isTouchDevice?1.34:1.30;ip.contrast=isTouchDevice?1.05:1.07;ip.vignetteEnabled=false;ip.colorCurvesEnabled=true;const curves=new BABYLON.ColorCurves();curves.globalSaturation=8;curves.globalExposure=4;curves.highlightsExposure=3;curves.shadowsExposure=5;ip.colorCurves=curves}
// Strong soft skylight keeps the player face/robes readable even when turned away from the sun.
const hemi=new BABYLON.HemisphericLight('sky',new BABYLON.Vector3(0,1,0),scene);hemi.intensity=1.48;hemi.diffuse=new BABYLON.Color3(1.0,1.0,1.0);hemi.specular=new BABYLON.Color3(.35,.40,.42);hemi.groundColor=new BABYLON.Color3(.55,.66,.50);
const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-.42,-1,.32),scene);sun.position.set(120,200,-120);sun.intensity=1.42;sun.diffuse=new BABYLON.Color3(1.0,.97,.88);sun.specular=new BABYLON.Color3(.62,.70,.74);
// Camera-side fill light specifically prevents the player from becoming a dark silhouette.
const playerFill=new BABYLON.HemisphericLight('playerFill',new BABYLON.Vector3(0,.35,-1),scene);playerFill.intensity=.38;playerFill.diffuse=new BABYLON.Color3(.88,.96,1.0);playerFill.groundColor=new BABYLON.Color3(.30,.34,.32);playerFill.specular=new BABYLON.Color3(.12,.15,.16);
const shadowMapSize=isTouchDevice?512:1024;const shadow=new BABYLON.ShadowGenerator(shadowMapSize,sun);shadow.useBlurExponentialShadowMap=true;shadow.blurKernel=isTouchDevice?4:10;shadow.darkness=.18;shadow.bias=.002;shadow.normalBias=.01;
const camera=new BABYLON.ArcRotateCamera('camera',Math.PI/2,1.02,23.5,new BABYLON.Vector3(0,.6,0),scene);camera.inputs.clear();camera.panningSensibility=0;camera.lowerBetaLimit=.90;camera.upperBetaLimit=1.20;camera.lowerRadiusLimit=6;camera.upperRadiusLimit=220;camera.fov=.50;camera.minZ=.1;camera.maxZ=isTouchDevice?1200:3000;
let pipeline=null;try{pipeline=new BABYLON.DefaultRenderingPipeline('MobilePostProcess',false,scene,[camera]);pipeline.fxaaEnabled=true;pipeline.bloomEnabled=false;pipeline.bloomThreshold=.82;pipeline.bloomWeight=.18;pipeline.bloomKernel=isTouchDevice?16:32;pipeline.bloomScale=.5;pipeline.imageProcessingEnabled=true;pipeline.samples=1}catch(e){console.warn('[GameRuntime] Post-processing pipeline fallback:',e)}
const mat=(name,color)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.06,.06,.06);m.freeze();return m};const goldMat=mat('gold','#d9b45d'),bladeMat=mat('blade','#9bdcff');
const player=new BABYLON.TransformNode('PlayerRoot',scene);player.position.set(0,0,0);player.rotation.y=0;camera.lockedTarget=player;const bodyRoot=new BABYLON.TransformNode('SkeletonRoot',scene);bodyRoot.parent=player;let attackT=0;
const enemyHost=new BABYLON.TransformNode('EnemyHost',scene);enemyHost.position.set(0,.8,0);enemyHost.setEnabled(false);enemyHost.metadata={enemySlot:0,spawnSerial:0};
engine.runRenderLoop(()=>{if(!document.hidden)scene.render()});const appContainer=document.getElementById('gameApp');let resizeRaf=0;const scheduleResize=()=>{if(resizeRaf)return;resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;engine.resize()})};if(window.ResizeObserver&&appContainer)new ResizeObserver(scheduleResize).observe(appContainer);window.addEventListener('resize',scheduleResize,{passive:true});window.addEventListener('orientationchange',scheduleResize,{passive:true});
window.GameRuntime={engine,scene,player,camera,enemyHost,shadow,pipeline,playerFill,capabilities:{isTouchDevice,isIOS,deviceDpr}};