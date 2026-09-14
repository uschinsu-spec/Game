const canvas = document.getElementById('renderCanvas');
// Configure high texture quality & anisotropic filtering
if (typeof BABYLON !== 'undefined' && BABYLON.Texture) {
  BABYLON.Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = 4;
}

const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: false,
  stencil: false,
  adaptToDeviceRatio: true,
  antialias: true,
  powerPreference: 'high-performance'
});
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.55, 0.78, 0.88, 1);
scene.fogMode = BABYLON.Scene.FOGMODE_NONE; // Disable fog so all distances are 100% crystal clear

// Advanced Color Grading & ACES Tone Mapping for cinematic mobile rendering
if (scene.imageProcessingConfiguration) {
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
  scene.imageProcessingConfiguration.exposure = 1.08;
  scene.imageProcessingConfiguration.contrast = 1.12;
  scene.imageProcessingConfiguration.vignetteEnabled = true;
  scene.imageProcessingConfiguration.vignetteWeight = 1.2;
  scene.imageProcessingConfiguration.vignetteColor = new BABYLON.Color4(0.04, 0.08, 0.12, 0.35);
}

const hemi = new BABYLON.HemisphericLight('sky', new BABYLON.Vector3(0, 1, 0), scene);
hemi.intensity = 1.28;
hemi.diffuse = new BABYLON.Color3(1.0, 0.98, 0.92);
hemi.groundColor = new BABYLON.Color3(0.42, 0.62, 0.38);

const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.4, -1, 0.4), scene);
sun.position.set(120, 200, -120);
sun.intensity = 1.22;
const shadow = new BABYLON.ShadowGenerator(1024, sun);
shadow.useBlurExponentialShadowMap = true;
shadow.blurKernel = 12;
shadow.darkness = 0.32; // Soft gentle shadows, never pitch black
shadow.bias = 0.002;
shadow.normalBias = 0.01;

const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, 1.02, 23.5, new BABYLON.Vector3(0, 0.6, 0), scene);
camera.inputs.clear();
camera.panningSensibility = 0;
camera.lowerBetaLimit = 0.90;
camera.upperBetaLimit = 1.20;
camera.lowerRadiusLimit = 6.0;   // Close-up inspection
camera.upperRadiusLimit = 220.0; // Epic ultra-wide open world zoom
camera.fov = 0.50; // Isometric-like lens: Keeps monster sizes stable without extreme perspective distortion
camera.minZ = 0.1;
camera.maxZ = 3000;

// Default Mobile Post-Processing Pipeline (FXAA Antialiasing + Xianxia Bloom)
let pipeline = null;
try {
  pipeline = new BABYLON.DefaultRenderingPipeline('MobilePostProcess', true, scene, [camera]);
  pipeline.fxaaEnabled = true; // Smooth jagged polygon edges on mobile
  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.78;
  pipeline.bloomWeight = 0.28;
  pipeline.bloomKernel = 32;
  pipeline.bloomScale = 0.5;
  pipeline.imageProcessingEnabled = true;
  pipeline.samples = 1;
} catch (e) {
  console.warn('[GameRuntime] Post-processing pipeline fallback:', e);
}

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

window.GameRuntime = { engine, scene, player, camera, enemyHost, shadow, pipeline };