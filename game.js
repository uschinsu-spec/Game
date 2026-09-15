const canvas = document.getElementById('renderCanvas');
const isTouchDevice = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const deviceDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, isTouchDevice ? 2 : 2.5));

if (typeof BABYLON !== 'undefined' && BABYLON.Texture) {
  BABYLON.Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = isTouchDevice ? 2 : 4;
}

const engine = new BABYLON.Engine(canvas, false, {
  preserveDrawingBuffer: false,
  stencil: false,
  adaptToDeviceRatio: false,
  antialias: false,
  powerPreference: 'high-performance',
  audioEngine: false
});
const initialScale = isTouchDevice ? Math.max(1, (window.devicePixelRatio || 1) / deviceDpr) : 1;
engine.setHardwareScalingLevel(initialScale);
engine.disablePerformanceMonitorInBackground = true;

const scene = new BABYLON.Scene(engine);
// Clear sky tuned toward a soft xianxia cyan instead of a flat blue.
scene.clearColor = new BABYLON.Color4(0.48, 0.72, 0.82, 1);
scene.ambientColor = new BABYLON.Color3(0.13, 0.18, 0.20);
scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
scene.skipPointerMovePicking = true;
scene.autoClearDepthAndStencil = false;

if (scene.imageProcessingConfiguration) {
  const ip = scene.imageProcessingConfiguration;
  ip.toneMappingEnabled = true;
  ip.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
  ip.exposure = isTouchDevice ? 1.12 : 1.10;
  ip.contrast = isTouchDevice ? 1.14 : 1.12;
  ip.vignetteEnabled = !isTouchDevice;
  ip.vignetteWeight = 1.15;
  ip.vignetteColor = new BABYLON.Color4(0.03, 0.07, 0.10, 0.32);
}

// Warm key + cool fill gives characters readable silhouettes without expensive extra post FX.
const hemi = new BABYLON.HemisphericLight('sky', new BABYLON.Vector3(0, 1, 0), scene);
hemi.intensity = 1.20;
hemi.diffuse = new BABYLON.Color3(0.96, 0.99, 1.0);
hemi.groundColor = new BABYLON.Color3(0.34, 0.52, 0.31);

const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.42, -1, 0.32), scene);
sun.position.set(120, 200, -120);
sun.intensity = 1.30;
sun.diffuse = new BABYLON.Color3(1.0, 0.93, 0.78);
sun.specular = new BABYLON.Color3(0.58, 0.67, 0.72);

const shadowMapSize = isTouchDevice ? 512 : 1024;
const shadow = new BABYLON.ShadowGenerator(shadowMapSize, sun);
shadow.useBlurExponentialShadowMap = true;
shadow.blurKernel = isTouchDevice ? 4 : 10;
shadow.darkness = 0.27;
shadow.bias = 0.002;
shadow.normalBias = 0.01;

const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, 1.02, 23.5, new BABYLON.Vector3(0, 0.6, 0), scene);
camera.inputs.clear();
camera.panningSensibility = 0;
camera.lowerBetaLimit = 0.90;
camera.upperBetaLimit = 1.20;
camera.lowerRadiusLimit = 6.0;
camera.upperRadiusLimit = 220.0;
camera.fov = 0.50;
camera.minZ = 0.1;
camera.maxZ = isTouchDevice ? 1200 : 3000;

let pipeline = null;
try {
  pipeline = new BABYLON.DefaultRenderingPipeline('MobilePostProcess', false, scene, [camera]);
  pipeline.fxaaEnabled = true;
  pipeline.bloomEnabled = false;
  pipeline.bloomThreshold = 0.82;
  pipeline.bloomWeight = 0.18;
  pipeline.bloomKernel = isTouchDevice ? 16 : 32;
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
  m.freeze();
  return m;
};
const goldMat = mat('gold', '#d9b45d'), bladeMat = mat('blade', '#9bdcff');

const player = new BABYLON.TransformNode('PlayerRoot', scene);
player.position.set(0, 0, 0);
player.rotation.y = 0;
camera.lockedTarget = player;
const bodyRoot = new BABYLON.TransformNode('SkeletonRoot', scene);
bodyRoot.parent = player;
let attackT = 0;

const enemyHost = new BABYLON.TransformNode('EnemyHost', scene);
enemyHost.position.set(0, 0.8, 0);
enemyHost.setEnabled(false);
enemyHost.metadata = { enemySlot: 0, spawnSerial: 0 };

engine.runRenderLoop(() => {
  if (!document.hidden) scene.render();
});

const appContainer = document.getElementById('gameApp');
let resizeRaf = 0;
const scheduleResize = () => {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    engine.resize();
  });
};
if (window.ResizeObserver && appContainer) new ResizeObserver(scheduleResize).observe(appContainer);
window.addEventListener('resize', scheduleResize, { passive: true });
window.addEventListener('orientationchange', scheduleResize, { passive: true });

window.GameRuntime = {
  engine, scene, player, camera, enemyHost, shadow, pipeline,
  capabilities: { isTouchDevice, isIOS, deviceDpr }
};
