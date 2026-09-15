// Adaptive Mobile Visual Fidelity & Performance Manager
(() => {
  'use strict';
  if (!window.GameRuntime) return;

  const { engine, scene, player, capabilities = {} } = window.GameRuntime;
  const isTouchDevice = !!capabilities.isTouchDevice;
  const isIOS = !!capabilities.isIOS;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || (isIOS ? 4 : 4);
  const weakDevice = cores <= 4 || memory <= 3;

  const PRESET_KEY = 'tu_tien_graphics_preset';
  let currentPreset = 'balanced';
  try { currentPreset = localStorage.getItem(PRESET_KEY) || 'balanced'; } catch (_) {}
  if (!['ultra', 'balanced', 'eco'].includes(currentPreset)) currentPreset = 'balanced';

  const PRESETS = {
    ultra: {
      name: 'HD Sắc Nét', icon: '🌟', scale: 1.0,
      fxaa: true, bloom: !isTouchDevice, shadowBlur: isTouchDevice ? 5 : 10,
      aniso: isTouchDevice ? 2 : 4,
      desc: 'Hình ảnh gần native, ưu tiên độ nét'
    },
    balanced: {
      name: 'Cân Bằng', icon: '⚡', scale: 1.0,
      fxaa: true, bloom: false, shadowBlur: isTouchDevice ? 4 : 8,
      aniso: 2,
      desc: 'Giữ nét cao, tự hạ độ phân giải khi FPS giảm'
    },
    eco: {
      name: 'Tiết Kiệm Pin', icon: '🔋', scale: weakDevice ? 1.35 : 1.25,
      fxaa: false, bloom: false, shadowBlur: 2,
      aniso: 1,
      desc: 'Ưu tiên FPS và nhiệt độ máy'
    }
  };

  let activeScale = PRESETS[currentPreset].scale;
  let dynamicScale = activeScale;
  let lowSamples = 0;
  let highSamples = 0;
  let lastScaleChange = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function applyPreset(presetName, save = true) {
    if (!PRESETS[presetName]) presetName = 'balanced';
    currentPreset = presetName;
    if (save) { try { localStorage.setItem(PRESET_KEY, presetName); } catch (_) {} }

    const cfg = PRESETS[presetName];
    activeScale = cfg.scale;
    dynamicScale = activeScale;
    lowSamples = 0;
    highSamples = 0;

    if (engine) {
      engine.setHardwareScalingLevel(dynamicScale);
      engine.resize();
    }

    const pipeline = window.GameRuntime?.pipeline;
    if (pipeline) {
      pipeline.fxaaEnabled = cfg.fxaa;
      pipeline.bloomEnabled = cfg.bloom;
    }

    const shadow = window.GameRuntime?.shadow;
    if (shadow) shadow.blurKernel = cfg.shadowBlur;

    if (typeof BABYLON !== 'undefined' && BABYLON.Texture) {
      BABYLON.Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = cfg.aniso;
    }

    updateHudButton();
  }

  setTimeout(() => applyPreset(currentPreset, false), 120);

  // Freeze transforms/materials for static world pieces to cut CPU work each frame.
  const staticPrefixes = [
    'EnhancedGround','TerrainTerrace','EnhancedRoad','TrailStone','RoadEdgeStone',
    'SpiritLake','LakeRock','BridgePlank','ImmortalPeak','LanternPost','LanternBox',
    'LanternCap','PagodaPodium','PagodaHall','PagodaRoof','PagodaColumn','SectPillarNew',
    'SectBeamNew','SectRoofNew','TempleStepNew','CloudRibbon'
  ];

  setTimeout(() => {
    if (!scene) return;
    for (const m of scene.meshes) {
      if (!m || m.isDisposed()) continue;
      if (!staticPrefixes.some(prefix => m.name && m.name.startsWith(prefix))) continue;
      try { if (m.freezeWorldMatrix) m.freezeWorldMatrix(); } catch (_) {}
      try { if (m.material && m.material.freeze && !m.material.isFrozen) m.material.freeze(); } catch (_) {}
      m.isPickable = false;
    }
  }, 900);

  // Conservative distance culling for decorations only; never hide gameplay-critical actors.
  const cullRules = [
    ['Lantern', 75], ['LakeRock', 95], ['BridgePlank', 110], ['CloudRibbon', 135],
    ['ImmortalPeak', 190], ['Pagoda', 145], ['Sect', 145], ['TempleStep', 135]
  ];

  function cullRadiusFor(name) {
    for (const [prefix, radius] of cullRules) if (name && name.startsWith(prefix)) return radius;
    return 0;
  }

  const updateStreaming = () => {
    if (!player || !scene || document.hidden) return;
    const px = player.position.x;
    const pz = player.position.z;
    for (const m of scene.meshes) {
      if (!m || m.isDisposed()) continue;
      const r = cullRadiusFor(m.name);
      if (!r) continue;
      const q = m.getAbsolutePosition ? m.getAbsolutePosition() : m.position;
      const dx = q.x - px, dz = q.z - pz;
      const visible = dx * dx + dz * dz <= r * r;
      if (m.isEnabled() !== visible) m.setEnabled(visible);
    }
  };
  const streamTimer = setInterval(updateStreaming, isTouchDevice ? 1200 : 900);

  // Adaptive resolution with hysteresis: protect FPS without constantly changing sharpness.
  const perfTimer = setInterval(() => {
    if (document.hidden || !engine) return;
    const fps = engine.getFps();
    const now = performance.now();

    if (fps < 28) {
      lowSamples++;
      highSamples = 0;
    } else if (fps > 50) {
      highSamples++;
      lowSamples = 0;
    } else {
      lowSamples = Math.max(0, lowSamples - 1);
      highSamples = Math.max(0, highSamples - 1);
    }

    const maxScale = currentPreset === 'eco' ? 1.55 : (weakDevice ? 1.45 : 1.30);
    if (lowSamples >= 3 && now - lastScaleChange > 3500) {
      dynamicScale = clamp(dynamicScale + 0.1, activeScale, maxScale);
      lowSamples = 0;
      lastScaleChange = now;
      engine.setHardwareScalingLevel(dynamicScale);
    } else if (highSamples >= 6 && dynamicScale > activeScale && now - lastScaleChange > 5000) {
      dynamicScale = clamp(dynamicScale - 0.05, activeScale, maxScale);
      highSamples = 0;
      lastScaleChange = now;
      engine.setHardwareScalingLevel(dynamicScale);
    }

    const debug = document.querySelector('.debug');
    if (debug) debug.dataset.perf = `${Math.round(fps)} FPS • ${PRESETS[currentPreset].name} • ${dynamicScale.toFixed(2)}x`;
  }, 1800);

  let running = true;
  document.addEventListener('visibilitychange', () => {
    if (!engine || !scene) return;
    if (document.hidden && running) {
      engine.stopRenderLoop();
      running = false;
    } else if (!document.hidden && !running) {
      engine.runRenderLoop(() => scene.render());
      running = true;
      engine.resize();
    }
  });

  function createHudGraphicsButton() {
    const sideActions = document.querySelector('.ulala-side-actions');
    if (!sideActions || document.getElementById('gfxQualityBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'gfxQualityBtn';
    btn.className = 'ulala-side-btn';
    btn.title = 'Chỉnh Đồ Họa';
    btn.innerHTML = '<span>⚡</span><small>Cân bằng</small>';
    btn.addEventListener('click', () => {
      const order = ['balanced', 'ultra', 'eco'];
      const next = order[(order.indexOf(currentPreset) + 1) % order.length];
      applyPreset(next, true);
      showGfxToast(`Đã chuyển: ${PRESETS[next].icon} ${PRESETS[next].name}`);
    });
    sideActions.prepend(btn);
    updateHudButton();
  }

  function updateHudButton() {
    const btn = document.getElementById('gfxQualityBtn');
    if (!btn) return;
    const cfg = PRESETS[currentPreset];
    btn.innerHTML = `<span>${cfg.icon}</span><small>${cfg.name.split(' ')[0]}</small>`;
  }

  function showGfxToast(msg) {
    let t = document.getElementById('gfxToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'gfxToast';
      t.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(22,34,47,.95);border:1px solid #ffb82e;color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:700;z-index:9999;pointer-events:none;transition:opacity .3s;box-shadow:0 4px 12px rgba(0,0,0,.4)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createHudGraphicsButton, { once: true });
  else createHudGraphicsButton();

  window.addEventListener('pagehide', event => {
    if (!event.persisted) {
      clearInterval(streamTimer);
      clearInterval(perfTimer);
    }
  });

  window.MobileGraphics = {
    presets: PRESETS,
    getPreset: () => currentPreset,
    getScale: () => dynamicScale,
    setPreset: applyPreset
  };
})();
