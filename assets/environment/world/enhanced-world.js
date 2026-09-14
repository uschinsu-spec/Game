// ============================================================================
// THANH VÂN TIÊN VỰC - AUTHENTIC ULALA OPEN NATURE TERRAIN (ĐỒNG CỎ VÔ TẬN)
// Clean Flat Running Corridor, Distant Rolling Hills Far on the Sides, Zero Occlusion
// ============================================================================
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene) return;

  const prevWorld = scene.getTransformNodeByName('DeepAncientForestWorld');
  if (prevWorld) prevWorld.dispose();

  const root = new BABYLON.TransformNode('DeepAncientForestWorld', scene);

  // ---------------------------------------------------------------------------
  // 1. VIBRANT ULALA NATURE MATERIALS (01_GRASS_LUSH SEAMLESS)
  // ---------------------------------------------------------------------------
  const meadowMat = new BABYLON.StandardMaterial('ulalaMeadowMat', scene);
  meadowMat.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  meadowMat.specularColor = new BABYLON.Color3(0.01, 0.02, 0.01);
  meadowMat.ambientColor = new BABYLON.Color3(0.45, 0.50, 0.40);

  // Seamless Edge-Blending Algorithm (Eliminates all repeating tile seams & grid borders)
  function makeSeamlessGrassDataUrl(base64Data, onReady) {
    if (!base64Data || typeof document === 'undefined') {
      onReady(base64Data);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.width || 512;
        const h = img.height || 512;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const marginX = Math.floor(w * 0.20);
        const marginY = Math.floor(h * 0.20);

        // Horizontal border smoothstep cross-fade
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < marginX; x++) {
            const t = x / marginX;
            const s = t * t * (3 - 2 * t); // Smooth Hermite curve
            const idxL = (y * w + x) * 4;
            const idxR = (y * w + (w - marginX + x)) * 4;
            for (let c = 0; c < 3; c++) {
              const vL = data[idxL + c];
              const vR = data[idxR + c];
              data[idxL + c] = Math.round(vL * s + vR * (1 - s));
              data[idxR + c] = Math.round(vL * (1 - s) + vR * s);
            }
          }
        }

        // Vertical border smoothstep cross-fade
        for (let x = 0; x < w; x++) {
          for (let y = 0; y < marginY; y++) {
            const t = y / marginY;
            const s = t * t * (3 - 2 * t);
            const idxT = (y * w + x) * 4;
            const idxB = ((h - marginY + y) * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const vT = data[idxT + c];
              const vB = data[idxB + c];
              data[idxT + c] = Math.round(vT * s + vB * (1 - s));
              data[idxB + c] = Math.round(vT * (1 - s) + vB * s);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        onReady(canvas.toDataURL('image/jpeg', 0.95));
      } catch (_) {
        onReady(base64Data);
      }
    };
    img.onerror = () => onReady(base64Data);
    img.src = base64Data;
  }

  const rawTexUrl = window.GRASS_LUSH_TEXTURE || (window.GROUND_TEXTURE_ACTIVE && window.GROUND_TEXTURE_ACTIVE.data);
  makeSeamlessGrassDataUrl(rawTexUrl, (seamlessUrl) => {
    try {
      const grassTex = new BABYLON.Texture(seamlessUrl, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, () => {
        meadowMat.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
      });
      grassTex.uScale = 140;
      grassTex.vScale = 140;
      grassTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
      grassTex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
      grassTex.anisotropicFilteringLevel = 16;
      meadowMat.diffuseTexture = grassTex;
    } catch (_) {
      meadowMat.diffuseColor = BABYLON.Color3.FromHexString('#48b336');
    }
  });

  const sideHillsMat = new BABYLON.StandardMaterial('ulalaSideHillsMat', scene);
  sideHillsMat.diffuseColor = BABYLON.Color3.FromHexString('#3da02d');
  sideHillsMat.specularColor = new BABYLON.Color3(0.01, 0.02, 0.01);

  const mountainMat = new BABYLON.StandardMaterial('ulalaMountainMat', scene);
  mountainMat.diffuseColor = BABYLON.Color3.FromHexString('#70b4a4');
  mountainMat.specularColor = new BABYLON.Color3(0.01, 0.01, 0.01);

  const sporeMat = new BABYLON.StandardMaterial('ulalaSporeMat', scene);
  sporeMat.diffuseColor = BABYLON.Color3.FromHexString('#f0ff85');
  sporeMat.emissiveColor = BABYLON.Color3.FromHexString('#c8ff66');

  // ---------------------------------------------------------------------------
  // 2. 100X MASSIVE OPEN WORLD GROUND (2800m × 2800m) - ULTRA LIGHTWEIGHT (8 TRIS)
  // ---------------------------------------------------------------------------
  const ground = BABYLON.MeshBuilder.CreateGround('UlalaMeadowGround', { width: 2800, height: 2800, subdivisions: 2 }, scene);
  ground.parent = root;
  ground.position.set(0, 0, 0);
  ground.material = meadowMat;
  ground.receiveShadows = true;
  ground.isPickable = false;

  // Distant Horizon Mountain Range (8 Low-Poly Cones, ~100 Tris total for whole world)
  const mountainGroup = new BABYLON.TransformNode('DistantMountains', scene);
  mountainGroup.parent = root;
  const mountAngles = [0.2, 0.95, 1.8, 2.7, 3.4, 4.2, 5.0, 5.8];
  mountAngles.forEach((ang, idx) => {
    const mDist = 550 + (idx % 3) * 120;
    const mCone = BABYLON.MeshBuilder.CreateCylinder('DistantMountain_' + idx, {
      height: 120 + (idx % 2) * 45,
      diameterTop: 0.1,
      diameterBottom: 260 + (idx % 3) * 70,
      tessellation: 7
    }, scene);
    mCone.position.set(Math.cos(ang) * mDist, 35, Math.sin(ang) * mDist);
    mCone.material = mountainMat;
    mCone.parent = mountainGroup;
    mCone.isPickable = false;
  });

  // ---------------------------------------------------------------------------
  // 3. SCENIC BIOME LANDMARKS ACROSS THE 100X OPEN WORLD
  // ---------------------------------------------------------------------------
  const landmarksNode = new BABYLON.TransformNode('WorldLandmarks', scene);
  landmarksNode.parent = root;

  // Shared low-poly nature materials (Zero duplicate shaders)
  const matDarkBark = new BABYLON.StandardMaterial('pBark', scene); matDarkBark.diffuseColor = BABYLON.Color3.FromHexString('#452b1b');
  const matPineLeaf = new BABYLON.StandardMaterial('pPineL', scene); matPineLeaf.diffuseColor = BABYLON.Color3.FromHexString('#2f7a3a');
  const matOakLeaf = new BABYLON.StandardMaterial('pOakL', scene); matOakLeaf.diffuseColor = BABYLON.Color3.FromHexString('#3da02d');
  const matSakura = new BABYLON.StandardMaterial('pSakura', scene); matSakura.diffuseColor = BABYLON.Color3.FromHexString('#f584b4'); matSakura.emissiveColor = BABYLON.Color3.FromHexString('#4a152e');
  const matBush = new BABYLON.StandardMaterial('pBushMat', scene); matBush.diffuseColor = BABYLON.Color3.FromHexString('#32822a');
  const matFlower = new BABYLON.StandardMaterial('pFlMat', scene); matFlower.diffuseColor = BABYLON.Color3.FromHexString('#f5c32c'); matFlower.emissiveColor = BABYLON.Color3.FromHexString('#3b2f0a');
  const matRock = new BABYLON.StandardMaterial('pRockMat', scene); matRock.diffuseColor = BABYLON.Color3.FromHexString('#8c9c90');
  const matTorii = new BABYLON.StandardMaterial('pTorii', scene); matTorii.diffuseColor = BABYLON.Color3.FromHexString('#d93829');
  const matCrystal = new BABYLON.StandardMaterial('pCryst', scene); matCrystal.diffuseColor = BABYLON.Color3.FromHexString('#38bdf8'); matCrystal.emissiveColor = BABYLON.Color3.FromHexString('#0284c7');

  // Landmark Coords (Exploring hubs at various quadrants)
  const hubs = [
    { x: 0, z: 0, type: 'central_grove' },
    { x: 75, z: 85, type: 'shrine' },
    { x: -90, z: 120, type: 'pine_forest' },
    { x: 130, z: -95, type: 'sakura_garden' },
    { x: -110, z: -130, type: 'crystal_monolith' },
    { x: 180, z: 160, type: 'ancient_ruins' },
    { x: -200, z: 60, type: 'stone_circle' },
    { x: 60, z: -220, type: 'pine_forest' }
  ];

  hubs.forEach((hub, hIdx) => {
    const hubRoot = new BABYLON.TransformNode('Hub_' + hIdx, scene);
    hubRoot.parent = landmarksNode;
    hubRoot.position.set(hub.x, 0, hub.z);

    if (hub.type === 'shrine' || hub.type === 'ancient_ruins') {
      // Red Torii Arch
      const p1 = BABYLON.MeshBuilder.CreateCylinder('TP1_' + hIdx, { height: 7.0, diameter: 0.5, tessellation: 6 }, scene);
      p1.position.set(-2.5, 3.5, 0); p1.material = matTorii; p1.parent = hubRoot; p1.isPickable = false;
      const p2 = BABYLON.MeshBuilder.CreateCylinder('TP2_' + hIdx, { height: 7.0, diameter: 0.5, tessellation: 6 }, scene);
      p2.position.set(2.5, 3.5, 0); p2.material = matTorii; p2.parent = hubRoot; p2.isPickable = false;
      const topBeam = BABYLON.MeshBuilder.CreateBox('TB_' + hIdx, { width: 7.5, height: 0.6, depth: 0.7 }, scene);
      topBeam.position.set(0, 7.0, 0); topBeam.material = matTorii; topBeam.parent = hubRoot; topBeam.isPickable = false;
    } else if (hub.type === 'crystal_monolith') {
      // Glowing Xianxia Cultivation Crystal
      const crystal = BABYLON.MeshBuilder.CreateCylinder('Cry_' + hIdx, { height: 6.5, diameterTop: 0.2, diameterBottom: 1.8, tessellation: 5 }, scene);
      crystal.position.set(0, 3.25, 0); crystal.material = matCrystal; crystal.parent = hubRoot; crystal.isPickable = false;
    }

    // Hub Torii/Crystals only (Procedural sphere trees completely replaced by 3D BirchTree assets)
  });

  // ---------------------------------------------------------------------------
  // 3B. AUTHENTIC 3D FLORA & FORESTS (THIN INSTANCES: 2 DRAW CALLS PER SPECIES)
  // ---------------------------------------------------------------------------
  const floraGroup = new BABYLON.TransformNode('WorldFloraGroup', scene);
  floraGroup.parent = root;

  // 1. Birch Trees
  const birchApi = window.FloraAssetRegistry?.['BirchTree_1'] || window.BirchTree;
  if (birchApi && birchApi.createThinForest) {
    const birchPlacements = [
      { x: 16, y: 0, z: 18, s: 1.45, rot: 0.5 }, { x: -18, y: 0, z: 16, s: 1.55, rot: 1.9 },
      { x: 22, y: 0, z: -15, s: 1.4, rot: 3.4 }, { x: -20, y: 0, z: -20, s: 1.6, rot: 4.6 },
      { x: 28, y: 0, z: 5, s: 1.5, rot: 2.2 }, { x: -28, y: 0, z: 8, s: 1.35, rot: 0.8 },
      { x: 10, y: 0, z: -28, s: 1.6, rot: 5.2 }, { x: -12, y: 0, z: 28, s: 1.45, rot: 2.9 },
      { x: 65, y: 0, z: 80, s: 1.6, rot: 1.4 }, { x: 85, y: 0, z: 95, s: 1.5, rot: 2.8 }
    ];
    birchApi.createThinForest(scene, birchPlacements, { parent: floraGroup, freeze: true, maxDistance: 300 });
  }

  // 2. Normal Forest Trees
  const normalTreeApi = window.FloraAssetRegistry?.['NormalTree_1'];
  if (normalTreeApi && normalTreeApi.createThinForest) {
    const normalPlacements = [
      { x: 45, y: 0, z: 40, s: 1.3, rot: 0.8 }, { x: 52, y: 0, z: -35, s: 1.4, rot: 2.1 },
      { x: -50, y: 0, z: 45, s: 1.35, rot: 4.2 }, { x: -45, y: 0, z: -55, s: 1.25, rot: 1.5 },
      { x: 70, y: 0, z: -60, s: 1.45, rot: 3.1 }, { x: -65, y: 0, z: -75, s: 1.4, rot: 5.0 }
    ];
    normalTreeApi.createThinForest(scene, normalPlacements, { parent: floraGroup, freeze: true, maxDistance: 300 });
  }

  // 3. Pine Trees on Ridges
  const pineApi = window.FloraAssetRegistry?.['PineTree_1'];
  if (pineApi && pineApi.createThinForest) {
    const pinePlacements = [
      { x: 80, y: 0, z: 120, s: 1.5, rot: 1.2 }, { x: 95, y: 0, z: 140, s: 1.6, rot: 3.7 },
      { x: -90, y: 0, z: 110, s: 1.55, rot: 0.4 }, { x: -115, y: 0, z: 135, s: 1.65, rot: 2.9 },
      { x: 120, y: 0, z: -110, s: 1.5, rot: 4.8 }, { x: -130, y: 0, z: -125, s: 1.6, rot: 1.8 }
    ];
    pineApi.createThinForest(scene, pinePlacements, { parent: floraGroup, freeze: true, maxDistance: 350 });
  }

  // 4. Autumn Maple Trees
  const mapleApi = window.FloraAssetRegistry?.['MapleTree_1'];
  if (mapleApi && mapleApi.createThinForest) {
    const maplePlacements = [
      { x: 35, y: 0, z: -45, s: 1.3, rot: 1.7 }, { x: -38, y: 0, z: -40, s: 1.35, rot: 3.5 },
      { x: 42, y: 0, z: 65, s: 1.25, rot: 5.1 }, { x: -48, y: 0, z: 70, s: 1.4, rot: 0.9 }
    ];
    mapleApi.createThinForest(scene, maplePlacements, { parent: floraGroup, freeze: true, maxDistance: 300 });
  }

  // 5. Bushes & Flowers
  const bushApi = window.FloraAssetRegistry?.['Bush_Flowers'];
  if (bushApi && bushApi.createThinForest) {
    const bushPlacements = [
      { x: 12, y: 0, z: 14, s: 1.1, rot: 0.4 }, { x: -14, y: 0, z: 12, s: 1.15, rot: 2.3 },
      { x: 18, y: 0, z: -10, s: 1.05, rot: 4.1 }, { x: -15, y: 0, z: -14, s: 1.2, rot: 1.2 },
      { x: 22, y: 0, z: 24, s: 1.1, rot: 3.6 }, { x: -24, y: 0, z: 22, s: 1.15, rot: 5.4 }
    ];
    bushApi.createThinForest(scene, bushPlacements, { parent: floraGroup, freeze: true, maxDistance: 200 });
  }

  // 6. Natural Rocks
  const rockApi = window.FloraAssetRegistry?.['Rock_1'];
  if (rockApi && rockApi.createThinForest) {
    const rockPlacements = [
      { x: 20, y: 0, z: 12, s: 1.2, rot: 1.1 }, { x: -22, y: 0, z: 10, s: 1.35, rot: 3.2 },
      { x: 14, y: 0, z: -22, s: 1.1, rot: 4.9 }, { x: -18, y: 0, z: -25, s: 1.25, rot: 2.0 },
      { x: 55, y: 0, z: 60, s: 1.6, rot: 0.7 }, { x: -60, y: 0, z: -70, s: 1.8, rot: 3.8 }
    ];
    rockApi.createThinForest(scene, rockPlacements, { parent: floraGroup, freeze: true, maxDistance: 250 });
  }

  console.info('🌲 [Enhanced-World] Đã nạp thành công hệ sinh thái 3D Thực vật & Cây cối (Thin Instances 60 FPS)!');

  // ---------------------------------------------------------------------------
  // 4. FLOATING SPIRIT PARTICLES (DYNAMICALLY DRIFT AROUND PLAYER)
  // ---------------------------------------------------------------------------
  const spores = [];
  const playerRef = window.GameRuntime?.player;
  for (let i = 0; i < 26; i++) {
    const sp = BABYLON.MeshBuilder.CreateSphere('Spore_' + i, { diameter: 0.22, segments: 3 }, scene);
    sp.material = sporeMat;
    sp.parent = root;
    sp.isPickable = false;
    spores.push({
      mesh: sp,
      relX: (Math.random() - 0.5) * 55,
      relY: 0.8 + Math.random() * 2.5,
      relZ: (Math.random() - 0.5) * 55,
      speed: 0.8 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2
    });
  }

  let animT = 0;
  scene.onBeforeRenderObservable.add(() => {
    animT += 0.02;
    const px = playerRef ? playerRef.position.x : 0;
    const pz = playerRef ? playerRef.position.z : 0;
    for (let s of spores) {
      s.mesh.position.x = px + s.relX + Math.sin(animT * s.speed + s.phase) * 0.8;
      s.mesh.position.y = s.relY + Math.sin(animT * s.speed * 1.2 + s.phase) * 0.3;
      s.mesh.position.z = pz + s.relZ + Math.cos(animT * s.speed * 0.8 + s.phase) * 0.8;
    }
  });

  // ---------------------------------------------------------------------------
  // 4. BRIGHT CHEERFUL TOP-DOWN SKY & LIGHTING (CRYSTAL CLEAR, ZERO FOG HAZE)
  // ---------------------------------------------------------------------------
  scene.clearColor = new BABYLON.Color4(0.42, 0.80, 0.94, 1.0); // Vibrant sky blue
  scene.ambientColor = new BABYLON.Color3(0.50, 0.55, 0.45);    // Bright cheerful ambient
  scene.fogMode = BABYLON.Scene.FOGMODE_NONE; // Disable fog so whole map is 100% crisp and clear

  const hemi = scene.lights.find(l => l.name === 'sky');
  if (hemi) {
    hemi.intensity = 1.35;
    hemi.diffuse = new BABYLON.Color3(1.0, 0.98, 0.92);
    hemi.groundColor = new BABYLON.Color3(0.50, 0.75, 0.40);
  }

  const sun = scene.lights.find(l => l.name === 'sun');
  if (sun) {
    sun.intensity = 1.25;
    sun.diffuse = new BABYLON.Color3(1.0, 0.96, 0.88);
  }

  // ---------------------------------------------------------------------------
  // 5. CUSTOM MAP INTEGRATION (FROM THANH VÂN 3D MAP STUDIO PRO)
  // ---------------------------------------------------------------------------
  const STORAGE_KEY = 'thanh_van_custom_map';
  const customMapData = localStorage.getItem(STORAGE_KEY);

  if (customMapData) {
    try {
      const items = JSON.parse(customMapData);
      if (Array.isArray(items) && items.length > 0) {
        // Materials for procedural items
        function mkMat(name, col, spec = 0.04, em = null) {
          const m = new BABYLON.StandardMaterial(name, scene);
          m.diffuseColor = BABYLON.Color3.FromHexString(col);
          m.specularColor = new BABYLON.Color3(spec, spec, spec);
          if (em) m.emissiveColor = BABYLON.Color3.FromHexString(em);
          return m;
        }

        const matDarkBark = mkMat('pDarkBark', '#452b1b');
        const matBirchBark = mkMat('pBirchBark', '#e8e6dd');
        const matPineLeaf1 = mkMat('pPineLeaf1', '#1f5928');
        const matPineLeaf2 = mkMat('pPineLeaf2', '#2f7a3a');
        const matPineLeaf3 = mkMat('pPineLeaf3', '#489c55');
        const matOakLeaf = mkMat('pOakLeaf', '#388f34');
        const matMapleLeaf = mkMat('pMapleLeaf', '#c7661c');
        const matSakuraLeaf = mkMat('pSakuraLeaf', '#f584b4', 0.1, '#4a152e');
        const matBush = mkMat('pBush', '#32822a');
        const matFlPink = mkMat('pFlPink', '#f0548a', 0.1, '#3b1020');
        const matFlYellow = mkMat('pFlYellow', '#f5c32c', 0.1, '#3b2f0a');
        const matFlBlue = mkMat('pFlBlue', '#38bdf8', 0.1, '#0c3d52');
        const matFlPurple = mkMat('pFlPurple', '#a855f7', 0.1, '#2c0c4d');
        const matRock = mkMat('pRock', '#8c9c90');
        const matArch = mkMat('pArch', '#b0baad');
        const matTorii = mkMat('pTorii', '#d93829', 0.1, '#3d0a06');
        const matCrystal = mkMat('pCrystal', '#38bdf8', 0.8, '#0284c7');
        const matGold = mkMat('pGold', '#fbbf24', 0.5, '#78350f');

        const templates = new Map();
        function createTmpl(id, fn) {
          const node = new BABYLON.TransformNode('GameTmpl_' + id, scene);
          node.parent = root;
          fn(node);
          node.position.set(0, -999, 0);
          templates.set(id, node);
        }

        createTmpl('ProcPine', (r) => {
          const t = BABYLON.MeshBuilder.CreateCylinder('T', { height: 8.0, diameterTop: 0.4, diameterBottom: 0.9, tessellation: 7 }, scene);
          t.position.y = 4.0; t.material = matDarkBark; t.parent = r;
          [{ y: 5.0, d: 4.8, h: 3.2, m: matPineLeaf1 }, { y: 7.0, d: 4.0, h: 2.8, m: matPineLeaf2 }, { y: 8.8, d: 2.8, h: 2.4, m: matPineLeaf3 }].forEach((x, i) => {
            const c = BABYLON.MeshBuilder.CreateCylinder('C' + i, { height: x.h, diameterTop: 0.1, diameterBottom: x.d, tessellation: 7 }, scene);
            c.position.y = x.y; c.material = x.m; c.parent = r;
          });
        });

        createTmpl('ProcBirch', (r) => {
          if (window.BirchTree) {
            window.BirchTree.createInstance('WorldTmpl_Birch', r, scene);
          }
        });

        createTmpl('ProcMaple', (r) => {
          const t = BABYLON.MeshBuilder.CreateCylinder('T', { height: 6.5, diameterTop: 0.5, diameterBottom: 1.0, tessellation: 7 }, scene);
          t.position.y = 3.25; t.material = matDarkBark; t.parent = r;
          [{ x: 0, y: 7.0, z: 0, s: 3.8 }, { x: -1.2, y: 6.0, z: 0.7, s: 2.8 }].forEach((f, i) => {
            const sp = BABYLON.MeshBuilder.CreateSphere('F' + i, { diameter: f.s, segments: 5 }, scene);
            sp.position.set(f.x, f.y, f.z); sp.material = matMapleLeaf; sp.parent = r;
          });
        });

        createTmpl('ProcSakura', (r) => {
          const t = BABYLON.MeshBuilder.CreateCylinder('T', { height: 6.0, diameterTop: 0.45, diameterBottom: 0.9, tessellation: 7 }, scene);
          t.position.y = 3.0; t.material = matDarkBark; t.parent = r;
          [{ x: 0, y: 6.8, z: 0, s: 3.8 }, { x: -1.1, y: 5.8, z: 0.7, s: 2.7 }].forEach((f, i) => {
            const sp = BABYLON.MeshBuilder.CreateSphere('F' + i, { diameter: f.s, segments: 5 }, scene);
            sp.position.set(f.x, f.y, f.z); sp.material = matSakuraLeaf; sp.parent = r;
          });
        });

        createTmpl('ProcBush', (r) => {
          const b = BABYLON.MeshBuilder.CreateSphere('B', { diameter: 2.0, segments: 4 }, scene);
          b.position.y = 0.8; b.scaling.set(1.3, 0.75, 1.2); b.material = matBush; b.parent = r;
        });

        createTmpl('ProcFlowerClump', (r) => {
          const fls = [matFlBlue, matFlPurple, matFlPink, matFlYellow];
          for (let i = 0; i < 5; i++) {
            const ang = (i / 5) * Math.PI * 2, ra = 0.6 + (i % 2) * 0.3;
            const fl = BABYLON.MeshBuilder.CreateSphere('Fl' + i, { diameter: 0.42, segments: 3 }, scene);
            fl.position.set(Math.cos(ang) * ra, 0.35 + (i % 3) * 0.15, Math.sin(ang) * ra);
            fl.material = fls[i % fls.length]; fl.parent = r;
          }
        });

        createTmpl('ProcRock', (r) => {
          const rock = BABYLON.MeshBuilder.CreatePolyhedron('R', { type: 2, size: 1.2 }, scene);
          rock.position.y = 0.55; rock.scaling.set(1.3, 0.8, 1.15); rock.material = matRock; rock.parent = r;
        });

        createTmpl('ProcTorii', (r) => {
          const pL = BABYLON.MeshBuilder.CreateCylinder('PL', { height: 7.0, diameter: 0.6 }, scene);
          pL.position.set(-2.5, 3.5, 0); pL.material = matTorii; pL.parent = r;
          const pR = BABYLON.MeshBuilder.CreateCylinder('PR', { height: 7.0, diameter: 0.6 }, scene);
          pR.position.set(2.5, 3.5, 0); pR.material = matTorii; pR.parent = r;
          const top = BABYLON.MeshBuilder.CreateBox('Top', { width: 7.2, height: 0.6, depth: 0.8 }, scene);
          top.position.set(0, 7.0, 0); top.material = matTorii; top.parent = r;
        });

        createTmpl('ProcCrystal', (r) => {
          const spire = BABYLON.MeshBuilder.CreateCylinder('Cry', { height: 6.0, diameterTop: 0.1, diameterBottom: 1.4, tessellation: 6 }, scene);
          spire.position.y = 3.0; spire.material = matCrystal; spire.parent = r;
        });

        createTmpl('ProcChest', (r) => {
          const box = BABYLON.MeshBuilder.CreateBox('CBox', { width: 1.4, height: 0.8, depth: 0.9 }, scene);
          box.position.y = 0.4; box.material = matDarkBark; box.parent = r;
          const lid = BABYLON.MeshBuilder.CreateCylinder('CLid', { height: 1.4, diameter: 0.9, tessellation: 8 }, scene);
          lid.position.set(0, 0.8, 0); lid.rotation.z = Math.PI / 2; lid.material = matGold; lid.parent = r;
        });

        // Spawn custom placed items
        items.forEach((item) => {
          const itemNode = new BABYLON.TransformNode('GamePlaced_' + item.id, scene);
          itemNode.parent = root;
          itemNode.position.set(item.x, item.y || 0.02, item.z);
          itemNode.scaling.setAll(item.scale || 1.0);
          itemNode.rotation.y = item.rotY || 0;

          if (item.modelId === 'ProcBirch' && window.BIRCH_TREE_3D_DATA) {
            const tree = window.BIRCH_TREE_3D_DATA.spawnInstance('Birch_GP_' + item.id, itemNode, scene);
            if (tree) {
              tree.position.set(0, 0, 0);
              tree.rotation.set(0, 0, 0);
              tree.scaling.set(1, 1, 1);
            }
          } else {
            const tmpl = templates.get(item.modelId);
            if (tmpl) {
              for (const src of tmpl.getChildMeshes(false)) {
                if (src.geometry) {
                  const cl = src.clone(src.name + '_' + item.id, itemNode, false);
                  if (cl) {
                    cl.position.copyFrom(src.position);
                    cl.rotation.copyFrom(src.rotation);
                    cl.scaling.copyFrom(src.scaling);
                    cl.material = src.material;
                    cl.receiveShadows = false;
                    cl.isPickable = false;
                  }
                }
              }
            }
          }
        });

        console.info(`🌲 Đã nạp thành công ${items.length} vật thể tùy chỉnh từ Studio vào thế giới game!`);
      }
    } catch (e) {
      console.warn('Lỗi nạp map tùy chỉnh vào game:', e);
    }
  }

  // Restore Ground Texture if set
  const IDB_NAME = 'ThanhVanAssetStore';
  const IDB_VERSION = 1;
  const IDB_STORE = 'custom_assets';
  try {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onsuccess = () => {
      const db = req.result;
      if (db.objectStoreNames.contains(IDB_STORE)) {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const getReq = tx.objectStore(IDB_STORE).get('ground_tex_main');
        getReq.onsuccess = () => {
          const rec = getReq.result;
          if (rec && rec.dataUrl) {
            const tex = new BABYLON.Texture(rec.dataUrl, scene);
            tex.uScale = 20;
            tex.vScale = 20;
            meadowMat.diffuseTexture = tex;
            meadowMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
            console.info('🏞️ Đã đồng bộ Texture nền đất từ Studio vào game!');
          }
        };
      }
    };
  } catch (_) {}

  console.info('🌿 Ulala Open Meadow: Đã dời đồi núi ra xa, tầm nhìn nhân vật 100% thông thoáng!');
})();