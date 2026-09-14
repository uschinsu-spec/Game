const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false, adaptToDeviceRatio: true });
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.60, 0.82, 0.88, 1);
scene.fogMode = BABYLON.Scene.FOGMODE_NONE; // Disable fog so all distances are 100% crystal clear

const hemi = new BABYLON.HemisphericLight('sky', new BABYLON.Vector3(0, 1, 0), scene);
hemi.intensity = 1.25;
hemi.diffuse = new BABYLON.Color3(1.0, 1.0, 0.95);
hemi.groundColor = new BABYLON.Color3(0.45, 0.65, 0.35);

const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.4, -1, 0.4), scene);
sun.position.set(120, 200, -120);
sun.intensity = 1.15;
const shadow = new BABYLON.ShadowGenerator(1024, sun);
shadow.useBlurExponentialShadowMap = true;
shadow.blurKernel = 16;
shadow.darkness = 0.28; // Soft gentle shadows, never pitch black
shadow.bias = 0.002;

const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, 0.92, 50.0, new BABYLON.Vector3(0, 0.4, 0), scene);
camera.inputs.clear();
camera.panningSensibility = 0;
camera.lowerBetaLimit = 0.92;
camera.upperBetaLimit = 0.92;
camera.lowerRadiusLimit = 16.0;
camera.upperRadiusLimit = 95.0;
camera.fov = 0.85;
camera.minZ = 0.1;
camera.maxZ = 2000;

const mat = (name, color) => {
  const m = new BABYLON.StandardMaterial(name, scene);
  m.diffuseColor = BABYLON.Color3.FromHexString(color);
  m.specularColor = new BABYLON.Color3(0.06, 0.06, 0.06);
  return m;
};
const goldMat = mat('gold', '#d9b45d'), bladeMat = mat('blade', '#9bdcff');

// Central Player Root Anchor
const player = new BABYLON.TransformNode('PlayerRoot', scene);
player.position.set(0, 0, 0);
player.rotation.y = 0;
camera.lockedTarget = player;
const bodyRoot = new BABYLON.TransformNode('SkeletonRoot', scene);
bodyRoot.parent = player;
let attackT = 0;

// Pure scene-graph anchor: no geometry, no material, no render cost, impossible to become visible.
const enemyHost = new BABYLON.TransformNode('EnemyHost', scene);
enemyHost.position.set(0, 0.8, 0);
enemyHost.setEnabled(false);
enemyHost.metadata = { enemySlot: 0, spawnSerial: 0 };

engine.runRenderLoop(() => scene.render());

const appContainer = document.getElementById('gameApp');
if (window.ResizeObserver && appContainer) {
  new ResizeObserver(() => engine.resize()).observe(appContainer);
}
window.addEventListener('resize', () => engine.resize(), { passive: true });

window.GameRuntime = { engine, scene, player, camera, enemyHost };