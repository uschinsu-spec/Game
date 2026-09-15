const canvas = document.getElementById('renderCanvas');
const isTouchDevice = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const deviceDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, isTouchDevice ? 2 : 2.5));

// Keep textures crisp while avoiding excessive sampling cost on phones.
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

// Start close to native on phones. The adaptive manager can lower resolution only when FPS drops.
const initialScale = isTouchDevice ? Math.max(1, (window.devicePixelRatio || 1) / deviceDpr) : 1;
engine.setHardwareScalingLevel(initialScale);
engine.disablePerformanceMonitorInBackground = true;

const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.55, 0.78, 0.88, 1);
scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
scene.skipPointerMovePicking = true;
scene.autoClearDepthAndStencil = false;

// Advanced color grading kept lightweight enough for mobile.
if (scene.imageProcessingConfiguration) {
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
  scene.imageProcessingConfiguration.exposure = 1.08;
  scene.imageProcessingConfiguration.contrast = 1.10;
  scene.imageProcessingConfiguration.vignetteEnabled = !isTouchDevice;
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
const shadowMapSize = isTouchDevice ? 512 : 1024;
const shadow = new BABYLON.ShadowGenerator(shadowMapSize, sun);
shadow.useBlurExponentialShadowMap = true;
shadow.blurKernel = isTouchDevice ? 4 : 10;
shadow.darkness = 0.30;
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

// Mobile post processing: FXAA only. Bloom remains opt-in via graphics preset.
let pipeline = null;
try {
  pipeline = new BABYLON.DefaultRenderingPipeline('MobilePostProcess', false, scene, [camera]);
  pipeline.fxaaEnabled = true;
  pipeline.bloomEnabled = false;
  pipeline.bloomThreshold = 0.78;
  pipeline.bloomWeight = 0.24;
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
