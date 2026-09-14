// Mobile Visual Fidelity & Performance Manager
// Provides crisp HD rendering, FXAA, Bloom, and dynamic adaptive quality.
(() => {
  const DPR = Math.max(1, window.devicePixelRatio || 1);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const isHighEnd = cores >= 6 && memory >= 4;
  
  // Storage key for player preference
  const PRESET_KEY = 'tu_tien_graphics_preset';
  let currentPreset = localStorage.getItem(PRESET_KEY) || (isHighEnd ? 'ultra' : 'balanced');

  const PRESETS = {
    ultra: {
      name: 'HD Sắc Nét',
      icon: '🌟',
      scale: 1.0,           // 100% Native Resolution (Crystal Clear, zero blur)
      fxaa: true,
      bloom: true,
      shadowBlur: 12,
      aniso: 4,
      desc: 'Độ nét tối đa, khử răng cưa & phát quang'
    },
    balanced: {
      name: 'Cân Bằng',
      icon: '⚡',
      scale: DPR >= 3 ? 1.15 : 1.05,
      fxaa: true,
      bloom: true,
      shadowBlur: 10,
      aniso: 2,
      desc: 'Cân bằng hình ảnh đẹp và tiết kiệm pin'
    },
    eco: {
      name: 'Tiết Kiệm Pin',
      icon: '🔋',
      scale: 1.35,
      fxaa: false,
      bloom: false,
      shadowBlur: 6,
      aniso: 1,
      desc: 'Mượt mà tối đa cho máy yếu'
    }
  };

  let activeScale = PRESETS[currentPreset]?.scale || 1.0;
  let dynamicScale = activeScale;
  let lowSamples = 0, highSamples = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function applyPreset(presetName, save = true) {
    if (!PRESETS[presetName]) presetName = 'balanced';
    currentPreset = presetName;
    if (save) localStorage.setItem(PRESET_KEY, presetName);

    const cfg = PRESETS[presetName];
    activeScale = cfg.scale;
    dynamicScale = activeScale;

    if (window.engine) {
      engine.setHardwareScalingLevel(dynamicScale);
      engine.resize();
    }

    // Update Post-Process pipeline
    const pipeline = window.GameRuntime?.pipeline;
    if (pipeline) {
      pipeline.fxaaEnabled = cfg.fxaa;
      pipeline.bloomEnabled = cfg.bloom;
    }

    // Update Shadow Quality
    const shadow = window.GameRuntime?.shadow;
    if (shadow) {
      shadow.blurKernel = cfg.shadowBlur;
    }

    // Update Anisotropic Filtering
    if (typeof BABYLON !== 'undefined' && BABYLON.Texture) {
      BABYLON.Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = cfg.aniso;
    }

    updateHudButton();
    console.log(`[MobileGraphics] Applied preset: ${cfg.name} (Scale: ${dynamicScale})`);
  }

  // Initial apply
  setTimeout(() => applyPreset(currentPreset, false), 100);

  // Mesh optimization & Culling
  const staticNames = new Set([
    'EnhancedGround','TerrainTerrace','EnhancedRoad','TrailStone','RoadEdgeStone',
    'SpiritLake0','SpiritLake1','LakeRock','BridgePlank','ImmortalPeak',
    'LanternPost','LanternBox','LanternCap','PagodaPodium','PagodaHall','PagodaRoof',
    'PagodaColumn','SectPillarNew','SectBeamNew','SectRoofNew','TempleStepNew','CloudRibbon'
  ]);

  setTimeout(() => {
    if (window.scene) {
      for (const m of scene.meshes) {
        if (staticNames.has(m.name) && m.freezeWorldMatrix) {
          try { m.freezeWorldMatrix(); } catch (_) {}
        }
      }
    }
  }, 600);

  // Distance Culling for decorative objects
  const cull = {
    LanternPost: 90, LanternBox: 90, LanternCap: 90,
    LakeRock: 105, BridgePlank: 110, CloudRibbon: 150,
    ImmortalPeak: 220, PagodaPodium: 160, PagodaHall: 160, PagodaRoof: 160, PagodaColumn: 160
  };

  const updateStreaming = () => {
    if (!window.player || !window.scene) return;
    const px = player.position.x, pz = player.position.z;
    for (const m of scene.meshes) {
      const r = cull[m.name];
      if (!r) continue;
      const q = m.getAbsolutePosition ? m.getAbsolutePosition() : m.position;
      const visible = (q.x - px) ** 2 + (q.z - pz) ** 2 <= r * r;
      if (m.isEnabled() !== visible) m.setEnabled(visible);
    }
  };
  const streamTimer = setInterval(updateStreaming, 850);

  // Dynamic Resolution / Thermal Protection
  const perfTimer = setInterval(() => {
    if (document.hidden || !window.engine) return;
    const fps = engine.getFps();

    // Auto degrade if dropping severely under 26 FPS for 3 checks
    if (fps < 26) {
      lowSamples++;
      highSamples = 0;
    } else if (fps > 45) {
      highSamples++;
      lowSamples = 0;
    } else {
      lowSamples = 0;
      highSamples = 0;
    }

    if (lowSamples >= 3) {
      dynamicScale = clamp(dynamicScale + 0.1, activeScale, 1.6);
      lowSamples = 0;
      engine.setHardwareScalingLevel(dynamicScale);
    } else if (highSamples >= 5 && dynamicScale > activeScale) {
      dynamicScale = clamp(dynamicScale - 0.05, activeScale, 1.6);
      highSamples = 0;
      engine.setHardwareScalingLevel(dynamicScale);
    }

    const debug = document.querySelector('.debug');
    if (debug) {
      const cfg = PRESETS[currentPreset];
      debug.dataset.perf = `${Math.round(fps)} FPS • ${cfg?.name || currentPreset}`;
    }
  }, 2000);

  // Pause rendering when tab is hidden to save mobile battery
  let running = true;
  document.addEventListener('visibilitychange', () => {
    if (!window.engine || !window.scene) return;
    if (document.hidden && running) {
      engine.stopRenderLoop();
      running = false;
    } else if (!document.hidden && !running) {
      engine.runRenderLoop(() => scene.render());
      running = true;
      engine.resize();
    }
  });

  // Create Quick Graphics Button in UI
  function createHudGraphicsButton() {
    const sideActions = document.querySelector('.ulala-side-actions');
    if (!sideActions || document.getElementById('gfxQualityBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'gfxQualityBtn';
    btn.className = 'ulala-side-btn';
    btn.title = 'Chỉnh Đồ Họa';
    btn.innerHTML = `<span>🌟</span><small>Đồ Họa</small>`;

    btn.addEventListener('click', () => {
      const order = ['ultra', 'balanced', 'eco'];
      const nextIdx = (order.indexOf(currentPreset) + 1) % order.length;
      const nextPreset = order[nextIdx];
      applyPreset(nextPreset, true);
      showGfxToast(`Đã chuyển: ${PRESETS[nextPreset].icon} ${PRESETS[nextPreset].name}`);
    });

    sideActions.prepend(btn);
    updateHudButton();
  }

  function updateHudButton() {
    const btn = document.getElementById('gfxQualityBtn');
    if (!btn) return;
    const cfg = PRESETS[currentPreset];
    if (cfg) {
      btn.innerHTML = `<span>${cfg.icon}</span><small>${cfg.name.split(' ')[0]}</small>`;
    }
  }

  function showGfxToast(msg) {
    let t = document.getElementById('gfxToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'gfxToast';
      t.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(22,34,47,0.95);border:1px solid #ffb82e;color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:bold;z-index:9999;pointer-events:none;transition:opacity 0.3s;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createHudGraphicsButton);
  } else {
    createHudGraphicsButton();
  }

  window.addEventListener('pagehide', () => {
    clearInterval(streamTimer);
    clearInterval(perfTimer);
  }, { once: true });

  window.MobileGraphics = {
    presets: PRESETS,
    getPreset: () => currentPreset,
    setPreset: applyPreset
  };
})();