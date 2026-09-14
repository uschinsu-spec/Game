// ============================================================================
// THANH VÂN 3D MAP STUDIO PRO - MASTER ENGINE
// Full-Featured 3D Map Designer: 3D Gizmos, Procedural + GLB Assets, Brush Tool,
// Terrain Sculpting, Sky & Lighting Atmosphere, Undo/Redo & Direct Game Sync
// ============================================================================
(async ()=>{
  const canvas = document.getElementById('studioCanvas');
  if (!canvas) return;

  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: false, adaptToDeviceRatio: true });
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.42, 0.80, 0.94, 1.0);
  scene.ambientColor = new BABYLON.Color3(0.45, 0.52, 0.42);
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 85;
  scene.fogEnd = 165;
  scene.fogColor = new BABYLON.Color3(0.60, 0.88, 0.90);

  // ---------------------------------------------------------------------------
  // 1. LIGHTING & CAMERAS
  // ---------------------------------------------------------------------------
  const hemi = new BABYLON.HemisphericLight('sky', new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 1.35;
  hemi.diffuse = new BABYLON.Color3(1.0, 0.98, 0.92);
  hemi.groundColor = new BABYLON.Color3(0.50, 0.75, 0.40);

  const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.35, -0.85, 0.4), scene);
  sun.intensity = 1.25;
  sun.diffuse = new BABYLON.Color3(1.0, 0.96, 0.88);

  // 3D Orbit Camera
  const studioCamera = new BABYLON.ArcRotateCamera('StudioCam', Math.PI / 2, 0.85, 36, new BABYLON.Vector3(0, 2, 0), scene);
  studioCamera.panningSensibility = 50;
  studioCamera.wheelPrecision = 12;
  studioCamera.lowerRadiusLimit = 4;
  studioCamera.upperRadiusLimit = 160;
  studioCamera.attachControl(canvas, true);

  // Top-Down Camera
  const topCamera = new BABYLON.ArcRotateCamera('TopCam', Math.PI / 2, 0.05, 55, new BABYLON.Vector3(0, 0, 0), scene);
  topCamera.panningSensibility = 50;
  topCamera.wheelPrecision = 12;

  // In-Game Preview Camera & Character
  const previewCamera = new BABYLON.ArcRotateCamera('PreviewCam', Math.PI / 2, 1.15, 19.2, new BABYLON.Vector3(0, 1.35, 0), scene);
  previewCamera.inputs.clear();

  const previewPlayer = new BABYLON.TransformNode('PreviewPlayer', scene);
  previewPlayer.position.set(0, 0, 45);
  previewPlayer.rotation.y = Math.PI;

  const playerBody = BABYLON.MeshBuilder.CreateCylinder('PreviewPlayerMesh', { height: 1.6, diameterTop: 0.3, diameterBottom: 0.7 }, scene);
  playerBody.position.y = 0.8;
  const pMat = new BABYLON.StandardMaterial('pMat', scene);
  pMat.diffuseColor = BABYLON.Color3.FromHexString('#32b5f5');
  playerBody.material = pMat;
  playerBody.parent = previewPlayer;
  previewPlayer.setEnabled(false);

  engine.runRenderLoop(() => {
    scene.render();
    const fpsBadge = document.getElementById('fpsBadge');
    if (fpsBadge) fpsBadge.textContent = `⚡ ${Math.round(engine.getFps())} FPS`;
  });
  window.addEventListener('resize', () => engine.resize());

  // ---------------------------------------------------------------------------
  // 2. 3D GIZMO MANAGER (MOVE, ROTATE, SCALE)
  // ---------------------------------------------------------------------------
  const gizmoManager = new BABYLON.GizmoManager(scene);
  gizmoManager.positionGizmoEnabled = true;
  gizmoManager.rotationGizmoEnabled = false;
  gizmoManager.scaleGizmoEnabled = false;
  gizmoManager.usePointerToAttachGizmos = false;
  gizmoManager.clearGizmoOnEmptyPointerEvent = false;

  let currentGizmoMode = 'translate'; // 'translate' | 'rotate' | 'scale'

  function setGizmoMode(mode) {
    currentGizmoMode = mode;
    gizmoManager.positionGizmoEnabled = (mode === 'translate');
    gizmoManager.rotationGizmoEnabled = (mode === 'rotate');
    gizmoManager.scaleGizmoEnabled = (mode === 'scale');

    document.querySelectorAll('.gizmo-btn').forEach(b => b.classList.remove('active'));
    if (mode === 'translate') document.getElementById('gizmoTranslateBtn')?.classList.add('active');
    if (mode === 'rotate') document.getElementById('gizmoRotateBtn')?.classList.add('active');
    if (mode === 'scale') document.getElementById('gizmoScaleBtn')?.classList.add('active');

    const badge = document.getElementById('gizmoModeBadge');
    if (badge) {
      if (mode === 'translate') badge.textContent = '🕹️ Gizmo: Di chuyển [W]';
      if (mode === 'rotate') badge.textContent = '🕹️ Gizmo: Xoay [E]';
      if (mode === 'scale') badge.textContent = '🕹️ Gizmo: Co giãn [R]';
    }
  }

  document.getElementById('gizmoTranslateBtn').onclick = () => setGizmoMode('translate');
  document.getElementById('gizmoRotateBtn').onclick = () => setGizmoMode('rotate');
  document.getElementById('gizmoScaleBtn').onclick = () => setGizmoMode('scale');

  // ---------------------------------------------------------------------------
  // 3. TERRAIN & GROUND SYSTEMS
  // ---------------------------------------------------------------------------
  const worldRoot = new BABYLON.TransformNode('StudioWorldRoot', scene);
  let itemsContainer = new BABYLON.TransformNode('StudioPlacedItems', scene);
  itemsContainer.parent = worldRoot;

  const groundMat = new BABYLON.StandardMaterial('studioGroundMat', scene);
  groundMat.diffuseColor = BABYLON.Color3.FromHexString('#48b336');
  groundMat.specularColor = new BABYLON.Color3(0.02, 0.02, 0.02);

  const studioTexUrl = window.GRASS_LUSH_TEXTURE;
  try {
    const grassTex = new BABYLON.Texture(studioTexUrl, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, () => {
      groundMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    }, (msg) => {
      groundMat.diffuseTexture = null;
      groundMat.diffuseColor = BABYLON.Color3.FromHexString('#48b336');
    });
    grassTex.uScale = 35;
    grassTex.vScale = 65;
    grassTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    grassTex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    groundMat.diffuseTexture = grassTex;
  } catch (_) {
    groundMat.diffuseColor = BABYLON.Color3.FromHexString('#48b336');
  }

  const trailMat = new BABYLON.StandardMaterial('studioTrailMat', scene);
  trailMat.diffuseColor = BABYLON.Color3.FromHexString('#735338');
  trailMat.specularColor = new BABYLON.Color3(0.02, 0.02, 0.02);

  const sideHillsMat = new BABYLON.StandardMaterial('studioSideHillsMat', scene);
  sideHillsMat.diffuseColor = BABYLON.Color3.FromHexString('#3da02d');

  const mountainMat = new BABYLON.StandardMaterial('studioMountainMat', scene);
  mountainMat.diffuseColor = BABYLON.Color3.FromHexString('#70b4a4');

  // Ground plane
  const ground = BABYLON.MeshBuilder.CreateGround('StudioGround', { width: 140, height: 260, subdivisions: 2 }, scene);
  ground.parent = worldRoot;
  ground.position.set(0, 0, -20);
  ground.material = groundMat;
  ground.isPickable = true;

  // Road plane (hidden by default in open meadow style)
  let roadVisible = false;
  const trail = BABYLON.MeshBuilder.CreateGround('StudioTrail', { width: 3.4, height: 250, subdivisions: 1 }, scene);
  trail.parent = worldRoot;
  trail.position.set(0, 0.015, -20);
  trail.material = trailMat;
  trail.setEnabled(false);
  trail.isPickable = true;

  // Hills container
  const hillsNode = new BABYLON.TransformNode('StudioHills', scene);
  hillsNode.parent = worldRoot;
  for (let side of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const hill = BABYLON.MeshBuilder.CreateSphere('SideHill_' + side + '_' + i, { diameter: 28 + (i % 3) * 6, segments: 6 }, scene);
      hill.position.set(side * (32 + (i % 3) * 6), -9.5, 65 - i * 16);
      hill.scaling.set(1.4, 0.45, 1.2);
      hill.material = sideHillsMat;
      hill.parent = hillsNode;
      hill.isPickable = false;
    }
  }

  // Mountains container
  const mountainsNode = new BABYLON.TransformNode('StudioMountains', scene);
  mountainsNode.parent = worldRoot;
  for (let i = 0; i < 5; i++) {
    const peak = BABYLON.MeshBuilder.CreateCylinder('FarPeak_' + i, { height: 26 + (i % 3) * 8, diameterTop: 0.1, diameterBottom: 38 + (i % 2) * 6, tessellation: 6 }, scene);
    peak.position.set(((i * 24) % 80) - 40, -2, -135 - (i % 2) * 10);
    peak.material = mountainMat;
    peak.parent = mountainsNode;
    peak.isPickable = false;
  }

  // ---------------------------------------------------------------------------
  // 4. BUILT-IN RICH PROCEDURAL 3D ASSET GENERATOR (WORKS 100% OFFLINE & ZERO ASSET DEPENDENCIES)
  // ---------------------------------------------------------------------------
  const proceduralTemplates = new Map();
  const customGltfTemplates = new Map();

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
  const matPalmTrunk = mkMat('pPalmTrunk', '#6b4f35');
  const matPalmLeaf = mkMat('pPalmLeaf', '#2d8238');
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

  // Generator Functions
  function createProcTemplate(id, buildFn) {
    const node = new BABYLON.TransformNode('ProcTmpl_' + id, scene);
    node.parent = worldRoot;
    buildFn(node);
    node.position.set(0, -999, 0);
    proceduralTemplates.set(id, node);
  }

  // 1. Evergreen Pine
  createProcTemplate('ProcPine', (root) => {
    const trunk = BABYLON.MeshBuilder.CreateCylinder('T', { height: 8.0, diameterTop: 0.4, diameterBottom: 0.9, tessellation: 8 }, scene);
    trunk.position.y = 4.0; trunk.material = matDarkBark; trunk.parent = root;
    [{ y: 5.0, d: 4.8, h: 3.2, m: matPineLeaf1 }, { y: 7.0, d: 4.0, h: 2.8, m: matPineLeaf2 }, { y: 8.8, d: 2.8, h: 2.4, m: matPineLeaf3 }].forEach((x, i) => {
      const c = BABYLON.MeshBuilder.CreateCylinder('C' + i, { height: x.h, diameterTop: 0.1, diameterBottom: x.d, tessellation: 8 }, scene);
      c.position.y = x.y; c.material = x.m; c.parent = root;
    });
  });

  // 2. White Birch
  createProcTemplate('ProcBirch', (root) => {
    const trunk = BABYLON.MeshBuilder.CreateCylinder('T', { height: 7.0, diameterTop: 0.35, diameterBottom: 0.6, tessellation: 8 }, scene);
    trunk.position.y = 3.5; trunk.material = matBirchBark; trunk.parent = root;
    [{ x: 0, y: 7.5, z: 0, s: 3.6 }, { x: 0.8, y: 6.2, z: 0.5, s: 2.6 }, { x: -0.8, y: 5.8, z: -0.6, s: 2.4 }].forEach((f, i) => {
      const sp = BABYLON.MeshBuilder.CreateSphere('F' + i, { diameter: f.s, segments: 6 }, scene);
      sp.position.set(f.x, f.y, f.z); sp.material = matOakLeaf; sp.parent = root;
    });
  });

  // 3. Autumn Maple
  createProcTemplate('ProcMaple', (root) => {
    const trunk = BABYLON.MeshBuilder.CreateCylinder('T', { height: 6.5, diameterTop: 0.5, diameterBottom: 1.0, tessellation: 8 }, scene);
    trunk.position.y = 3.25; trunk.material = matDarkBark; trunk.parent = root;
    [{ x: 0, y: 7.0, z: 0, s: 3.8 }, { x: -1.2, y: 6.0, z: 0.7, s: 2.8 }, { x: 1.1, y: 6.2, z: -0.6, s: 2.7 }].forEach((f, i) => {
      const sp = BABYLON.MeshBuilder.CreateSphere('F' + i, { diameter: f.s, segments: 6 }, scene);
      sp.position.set(f.x, f.y, f.z); sp.material = matMapleLeaf; sp.parent = root;
    });
  });

  // 4. Normal Forest Tree
  createProcTemplate('ProcNormalTree', (root) => {
    const trunk = BABYLON.MeshBuilder.CreateCylinder('T', { height: 6.8, diameterTop: 0.5, diameterBottom: 1.0, tessellation: 8 }, scene);
    trunk.position.y = 3.4; trunk.material = matDarkBark; trunk.parent = root;
    [{ x: 0, y: 7.2, z: 0, s: 4.2 }, { x: -1.0, y: 6.2, z: 0.8, s: 3.0 }, { x: 1.0, y: 6.0, z: -0.7, s: 2.9 }].forEach((f, i) => {
      const sp = BABYLON.MeshBuilder.CreateSphere('F' + i, { diameter: f.s, segments: 6 }, scene);
      sp.position.set(f.x, f.y, f.z); sp.material = matOakLeaf; sp.parent = root;
    });
  });

  // 5. Cherry Blossom Sakura
  createProcTemplate('ProcSakura', (root) => {
    const trunk = BABYLON.MeshBuilder.CreateCylinder('T', { height: 6.0, diameterTop: 0.45, diameterBottom: 0.9, tessellation: 8 }, scene);
    trunk.position.y = 3.0; trunk.material = matDarkBark; trunk.parent = root;
    const foliage = [{ x: 0, y: 6.8, z: 0, s: 3.8 }, { x: -1.1, y: 5.8, z: 0.7, s: 2.7 }, { x: 1.2, y: 6.0, z: -0.6, s: 2.8 }];
    foliage.forEach((f, i) => {
      const sp = BABYLON.MeshBuilder.CreateSphere('F' + i, { diameter: f.s, segments: 6 }, scene);
      sp.position.set(f.x, f.y, f.z); sp.material = matSakuraLeaf; sp.parent = root;
    });
  });

  // 6. Bush
  createProcTemplate('ProcBush', (root) => {
    const b = BABYLON.MeshBuilder.CreateSphere('B', { diameter: 2.0, segments: 6 }, scene);
    b.position.y = 0.8; b.scaling.set(1.3, 0.75, 1.2); b.material = matBush; b.parent = root;
  });

  // 7. Flower Clump
  createProcTemplate('ProcFlowerClump', (root) => {
    const fls = [matFlBlue, matFlPurple, matFlPink, matFlYellow];
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2, ra = 0.6 + (i % 2) * 0.3;
      const fl = BABYLON.MeshBuilder.CreateSphere('Fl' + i, { diameter: 0.42, segments: 4 }, scene);
      fl.position.set(Math.cos(ang) * ra, 0.35 + (i % 3) * 0.15, Math.sin(ang) * ra);
      fl.material = fls[i % fls.length]; fl.parent = root;
    }
  });

  // 8. Natural Rock
  createProcTemplate('ProcRock', (root) => {
    const rock = BABYLON.MeshBuilder.CreatePolyhedron('R', { type: 2, size: 1.2 }, scene);
    rock.position.y = 0.55; rock.scaling.set(1.3, 0.8, 1.15); rock.material = matRock; rock.parent = root;
  });

  // 9. Torii Gate (Cổng Torii)
  createProcTemplate('ProcTorii', (root) => {
    const pL = BABYLON.MeshBuilder.CreateCylinder('PL', { height: 7.0, diameter: 0.6 }, scene);
    pL.position.set(-2.5, 3.5, 0); pL.material = matTorii; pL.parent = root;
    const pR = BABYLON.MeshBuilder.CreateCylinder('PR', { height: 7.0, diameter: 0.6 }, scene);
    pR.position.set(2.5, 3.5, 0); pR.material = matTorii; pR.parent = root;
    const top = BABYLON.MeshBuilder.CreateBox('Top', { width: 7.2, height: 0.6, depth: 0.8 }, scene);
    top.position.set(0, 7.0, 0); top.material = matTorii; top.parent = root;
    const beam = BABYLON.MeshBuilder.CreateBox('Beam', { width: 6.2, height: 0.4, depth: 0.5 }, scene);
    beam.position.set(0, 5.8, 0); beam.material = matDarkBark; beam.parent = root;
  });

  // 10. Crystal Spire
  createProcTemplate('ProcCrystal', (root) => {
    const spire = BABYLON.MeshBuilder.CreateCylinder('Cry', { height: 6.0, diameterTop: 0.1, diameterBottom: 1.4, tessellation: 6 }, scene);
    spire.position.y = 3.0; spire.material = matCrystal; spire.parent = root;
  });

  // 11. Ancient Stone Arch
  createProcTemplate('ProcArch', (root) => {
    const pL = BABYLON.MeshBuilder.CreateCylinder('AL', { height: 8.0, diameter: 1.2 }, scene);
    pL.position.set(-3.4, 4.0, 0); pL.material = matArch; pL.parent = root;
    const pR = BABYLON.MeshBuilder.CreateCylinder('AR', { height: 8.0, diameter: 1.2 }, scene);
    pR.position.set(3.4, 4.0, 0); pR.material = matArch; pR.parent = root;
    const top = BABYLON.MeshBuilder.CreateTorus('AT', { diameter: 6.8, thickness: 1.1, tessellation: 16 }, scene);
    top.position.set(0, 8.0, 0); top.rotation.x = Math.PI / 2; top.material = matArch; top.parent = root;
  });

  // 12. Treasure Chest
  createProcTemplate('ProcChest', (root) => {
    const box = BABYLON.MeshBuilder.CreateBox('CBox', { width: 1.4, height: 0.8, depth: 0.9 }, scene);
    box.position.y = 0.4; box.material = matDarkBark; box.parent = root;
    const lid = BABYLON.MeshBuilder.CreateCylinder('CLid', { height: 1.4, diameter: 0.9, tessellation: 12 }, scene);
    lid.position.set(0, 0.8, 0); lid.rotation.z = Math.PI / 2; lid.material = matGold; lid.parent = root;
  });

  // ---------------------------------------------------------------------------
  // 5. ASSET CATALOG SPECIFICATIONS
  // ---------------------------------------------------------------------------
  const ASSET_CATALOG = [
    { id: 'ProcPine', name: 'Thông Xanh', cat: 'trees', icon: '🌲', defaultScale: 1.3 },
    { id: 'ProcBirch', name: 'Bạch Dương', cat: 'trees', icon: '🌳', defaultScale: 1.25 },
    { id: 'ProcMaple', name: 'Cây Phong Đỏ', cat: 'trees', icon: '🍁', defaultScale: 1.3 },
    { id: 'ProcNormalTree', name: 'Cây Rừng Rậm', cat: 'trees', icon: '🌳', defaultScale: 1.3 },
    { id: 'ProcSakura', name: 'Đào Tiên Hồng', cat: 'trees', icon: '🌸', defaultScale: 1.3 },
    { id: 'ProcBush', name: 'Bụi Cỏ Thảo Mộc', cat: 'trees', icon: '🌿', defaultScale: 1.1 },
    { id: 'ProcFlowerClump', name: 'Khóm Hoa Linh Khí', cat: 'trees', icon: '🌺', defaultScale: 1.1 },
    { id: 'ProcRock', name: 'Tảng Đá Tự Nhiên', cat: 'props', icon: '🪨', defaultScale: 1.2 },
    { id: 'ProcTorii', name: 'Cổng Torii Đỏ', cat: 'props', icon: '⛩️', defaultScale: 1.0 },
    { id: 'ProcArch', name: 'Cổng Vòm Cổ Đại', cat: 'props', icon: '🏛️', defaultScale: 1.0 },
    { id: 'ProcCrystal', name: 'Linh Thạch Pha Lê', cat: 'props', icon: '💎', defaultScale: 1.2 },
    { id: 'ProcChest', name: 'Rương Tiên Bảo', cat: 'props', icon: '🎁', defaultScale: 1.0 }
  ];

  // ---------------------------------------------------------------------------
  // 6. MAP DATA & UNDO/REDO HISTORY
  // ---------------------------------------------------------------------------
  const STORAGE_KEY = 'thanh_van_custom_map';
  let placedItems = []; // Array of { id, modelId, x, y, z, scale, rotY }
  let historyStack = [];
  let historyIndex = -1;

  function pushHistory() {
    // Truncate future if branched
    if (historyIndex < historyStack.length - 1) {
      historyStack = historyStack.slice(0, historyIndex + 1);
    }
    historyStack.push(JSON.stringify(placedItems));
    historyIndex = historyStack.length - 1;
    if (historyStack.length > 30) {
      historyStack.shift();
      historyIndex--;
    }
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      placedItems = JSON.parse(historyStack[historyIndex]);
      renderAll();
      deselect();
    }
  }

  function redo() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      placedItems = JSON.parse(historyStack[historyIndex]);
      renderAll();
      deselect();
    }
  }

  document.getElementById('btnUndo').onclick = undo;
  document.getElementById('btnRedo').onclick = redo;

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    if (e.key === 'w' || e.key === 'W') setGizmoMode('translate');
    if (e.key === 'e' || e.key === 'E') setGizmoMode('rotate');
    if (e.key === 'r' || e.key === 'R') setGizmoMode('scale');
  });

  // ---------------------------------------------------------------------------
  // 7. SPAWN IN 3D WORLD
  // ---------------------------------------------------------------------------
  function spawnItemInScene(item) {
    const node = new BABYLON.TransformNode('Placed_' + item.id, scene);
    node.parent = itemsContainer;
    node.position.set(item.x, item.y || 0.02, item.z);
    node.scaling.setAll(item.scale || 1.0);
    node.rotation.y = item.rotY || 0;
    node.metadata = { item };

    // Check custom uploaded GLB or built-in procedural template
    const tmpl = customGltfTemplates.get(item.modelId) || proceduralTemplates.get(item.modelId);
    if (tmpl) {
      for (const src of tmpl.getChildMeshes(false)) {
        if (src.geometry) {
          const cl = src.clone(src.name + '_' + item.id, node, false);
          if (cl) {
            cl.position.copyFrom(src.position);
            cl.rotation.copyFrom(src.rotation);
            cl.scaling.copyFrom(src.scaling);
            if (src.rotationQuaternion) cl.rotationQuaternion = src.rotationQuaternion.clone();
            cl.material = src.material;
            cl.setEnabled(true);
            cl.isPickable = false;
          }
        }
      }
    }

    // Interactive pointer bounds box
    const hitBox = BABYLON.MeshBuilder.CreateBox('Hit_' + item.id, { size: 3.5 }, scene);
    hitBox.position.y = 1.75;
    hitBox.parent = node;
    hitBox.visibility = 0.001;
    hitBox.isPickable = true;
    hitBox.metadata = { parentNode: node, item };

    return node;
  }

  function renderAll() {
    // Clear itemsContainer
    while (itemsContainer.getChildren().length > 0) {
      itemsContainer.getChildren()[0].dispose();
    }
    placedItems.forEach(item => spawnItemInScene(item));
    updateStats();
  }

  function updateStats() {
    const badge = document.getElementById('objCountBadge');
    if (badge) badge.textContent = `📦 Vật thể: ${placedItems.length}`;
    const hierCount = document.getElementById('hierCount');
    if (hierCount) hierCount.textContent = placedItems.length;
    const el = document.getElementById('statAssetCount');
    if (el) el.textContent = placedItems.length;
  }

  // Initial Map Load
  function initMap() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          placedItems = parsed;
          renderAll();
          pushHistory();
          return;
        }
      } catch (_) {}
    }

    // Default placement using built-in procedural items
    for (let z = 65; z >= -85; z -= 14.0) {
      const r1 = Math.abs(Math.sin(z * 19.3)) % 1;
      placedItems.push({
        id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
        modelId: r1 > 0.5 ? 'ProcPine' : 'ProcSakura',
        x: (r1 > 0.5 ? -1 : 1) * (12.0 + r1 * 4.0),
        y: 0.02,
        z: z,
        scale: 1.3,
        rotY: Math.random() * Math.PI * 2
      });
    }
    renderAll();
    pushHistory();
  }

  initMap();

  // ---------------------------------------------------------------------------
  // 8. ASSET CATALOG PALETTE UI & SEARCH
  // ---------------------------------------------------------------------------
  let selectedAssetId = 'ProcPine';
  let activeCategory = 'all';
  const catalogGrid = document.getElementById('assetCatalogGrid');
  const assetSearchInput = document.getElementById('assetSearchInput');

  function renderCatalog(cat, search = '') {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';
    const filtered = ASSET_CATALOG.filter(a => (cat === 'all' || a.cat === cat) && (search === '' || a.name.toLowerCase().includes(search.toLowerCase())));
    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'studio-asset-card' + (selectedAssetId === item.id ? ' selected' : '');
      card.innerHTML = `
        <span class="studio-asset-icon">${item.icon}</span>
        <span class="studio-asset-label">${item.name}</span>
      `;
      card.onclick = () => {
        selectedAssetId = item.id;
        document.querySelectorAll('.studio-asset-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      };
      catalogGrid.appendChild(card);
    });
  }

  renderCatalog('all');

  document.querySelectorAll('.palette-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.palette-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.cat;
      renderCatalog(activeCategory, assetSearchInput?.value || '');
    };
  });

  if (assetSearchInput) {
    assetSearchInput.oninput = () => {
      renderCatalog(activeCategory, assetSearchInput.value);
    };
  }

  // ---------------------------------------------------------------------------
  // 9. COMPREHENSIVE ASSET IMPORTER & MANAGER (.GLB, .GLTF, TEXTURES, INDEXEDDB)
  // ---------------------------------------------------------------------------
  const assetModal = document.getElementById('assetManagerModal');
  const btnOpenAssetMgr = document.getElementById('btnOpenAssetManager');
  const btnCloseAssetModal = document.getElementById('btnCloseAssetModal');
  const btnCloseModalBottom = document.getElementById('btnCloseModalBottom');
  const assetDropZone = document.getElementById('assetDropZone');
  const btnSelectFiles = document.getElementById('btnSelectFiles');
  const btnSelectFolder = document.getElementById('btnSelectFolder');
  const hiddenGltfInput = document.getElementById('hiddenGltfInput');
  const hiddenFolderInput = document.getElementById('hiddenFolderInput');
  const hiddenGroundTexInput = document.getElementById('hiddenGroundTexInput');
  const btnChooseGroundTex = document.getElementById('btnChooseGroundTex');
  const importedAssetsList = document.getElementById('importedAssetsList');
  const modalAssetCount = document.getElementById('modalAssetCount');
  const customModelCount = document.getElementById('customModelCount');
  const btnClearCustomAssets = document.getElementById('btnClearCustomAssets');

  let loadedCustomAssets = []; // Array of { id, name, type: 'glb'|'texture', size, dataUrl/blobUrl, buffer }

  // IndexedDB Storage Engine for Persisting Large 3D Models & Textures
  const IDB_NAME = 'ThanhVanAssetStore';
  const IDB_VERSION = 1;
  const IDB_STORE = 'custom_assets';

  function openAssetDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbSaveAsset(assetRecord) {
    try {
      const db = await openAssetDB();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(assetRecord);
      return new Promise((res) => { tx.oncomplete = () => res(true); tx.onerror = () => res(false); });
    } catch (e) {
      console.warn('IndexedDB save failed:', e);
      return false;
    }
  }

  async function idbGetAllAssets() {
    try {
      const db = await openAssetDB();
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).getAll();
      return new Promise((res) => { req.onsuccess = () => res(req.result || []); req.onerror = () => res([]); });
    } catch (e) {
      return [];
    }
  }

  async function idbDeleteAsset(id) {
    try {
      const db = await openAssetDB();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(id);
      return new Promise((res) => { tx.oncomplete = () => res(true); tx.onerror = () => res(false); });
    } catch (e) {
      return false;
    }
  }

  async function idbClearAssets() {
    try {
      const db = await openAssetDB();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
      return new Promise((res) => { tx.oncomplete = () => res(true); tx.onerror = () => res(false); });
    } catch (e) {
      return false;
    }
  }

  // Modal Open / Close Handlers
  function openAssetManagerModal() {
    if (assetModal) {
      assetModal.classList.add('active');
      renderImportedAssetsGrid();
    }
  }

  function closeAssetManagerModal() {
    if (assetModal) assetModal.classList.remove('active');
  }

  if (btnOpenAssetMgr) btnOpenAssetMgr.onclick = openAssetManagerModal;
  if (btnCloseAssetModal) btnCloseAssetModal.onclick = closeAssetManagerModal;
  if (btnCloseModalBottom) btnCloseModalBottom.onclick = closeAssetManagerModal;

  if (assetModal) {
    assetModal.onclick = (e) => {
      if (e.target === assetModal) closeAssetManagerModal();
    };
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && assetModal?.classList.contains('active')) {
      closeAssetManagerModal();
    }
  });

  // Wire up file & folder upload triggers
  if (btnSelectFiles) btnSelectFiles.onclick = () => hiddenGltfInput?.click();
  if (btnSelectFolder) btnSelectFolder.onclick = () => hiddenFolderInput?.click();
  if (btnChooseGroundTex) btnChooseGroundTex.onclick = () => hiddenGroundTexInput?.click();

  // Drag & Drop handlers on dropzone
  if (assetDropZone) {
    assetDropZone.onclick = (e) => {
      if (e.target.tagName !== 'BUTTON') hiddenGltfInput?.click();
    };

    ['dragenter', 'dragover'].forEach(name => {
      assetDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        assetDropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      assetDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        assetDropZone.classList.remove('drag-over');
      });
    });

    assetDropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) processIncomingFiles(Array.from(files));
    });
  }

  // Hidden Inputs change events
  if (hiddenGltfInput) {
    hiddenGltfInput.onchange = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) processIncomingFiles(Array.from(files));
      hiddenGltfInput.value = '';
    };
  }

  if (hiddenFolderInput) {
    hiddenFolderInput.onchange = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) processIncomingFiles(Array.from(files));
      hiddenFolderInput.value = '';
    };
  }

  if (hiddenGroundTexInput) {
    hiddenGroundTexInput.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) applyGroundTextureFromFile(file);
      hiddenGroundTexInput.value = '';
    };
  }

  // Format File Size
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Apply Ground Texture
  function applyGroundTextureFromFile(file) {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      applyGroundTextureDataUrl(dataUrl, file.name);
      // Persist in IndexedDB
      await idbSaveAsset({
        id: 'ground_tex_main',
        name: 'Texture Mặt Đất: ' + file.name,
        type: 'ground_texture',
        dataUrl: dataUrl,
        size: file.size,
        date: Date.now()
      });
      alert(`🎉 Đã áp dụng Texture nền: "${file.name}" thành công!`);
    };
    reader.readAsDataURL(file);
  }

  function applyGroundTextureDataUrl(dataUrl, label = '') {
    try {
      const tex = new BABYLON.Texture(dataUrl, scene);
      tex.uScale = 20;
      tex.vScale = 20;
      groundMat.diffuseTexture = tex;
      groundMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
      const groundLabel = document.getElementById('groundColorLabel');
      if (groundLabel) groundLabel.textContent = label || 'Texture Tùy Chỉnh';
    } catch (e) {
      console.error('Ground texture load error:', e);
    }
  }

  // Process Incoming 3D and Texture Files
  async function processIncomingFiles(files) {
    let successCount = 0;
    let lastLoadedId = null;

    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      if (ext === 'glb' || ext === 'gltf') {
        const id = 'custom_glb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        try {
          const arrayBuffer = await file.arrayBuffer();
          const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
          const blobUrl = URL.createObjectURL(blob);

          const res = await BABYLON.SceneLoader.ImportMeshAsync('', '', blobUrl, scene, null, '.' + ext);
          if (res && res.meshes && res.meshes.length > 0) {
            const rootMesh = res.meshes[0];
            rootMesh.name = 'CustomTmpl_' + id;
            rootMesh.parent = worldRoot;
            rootMesh.position.set(0, -999, 0);

            for (const m of res.meshes) {
              m.receiveShadows = false;
              m.isPickable = false;
            }

            customGltfTemplates.set(id, rootMesh);

            const catalogItem = {
              id: id,
              name: baseName,
              cat: 'custom',
              icon: '📦',
              defaultScale: 1.0
            };
            ASSET_CATALOG.push(catalogItem);

            const assetRecord = {
              id: id,
              name: baseName,
              type: 'glb',
              fileName: file.name,
              size: file.size,
              buffer: arrayBuffer,
              date: Date.now()
            };
            await idbSaveAsset(assetRecord);

            loadedCustomAssets.push(assetRecord);
            successCount++;
            lastLoadedId = id;
          }
        } catch (err) {
          console.error(`Lỗi nạp file 3D ${file.name}:`, err);
        }
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        // Texture File
        const id = 'custom_tex_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        try {
          const dataUrl = await new Promise((res) => {
            const r = new FileReader();
            r.onload = (e) => res(e.target.result);
            r.readAsDataURL(file);
          });

          const assetRecord = {
            id: id,
            name: baseName,
            type: 'texture',
            fileName: file.name,
            size: file.size,
            dataUrl: dataUrl,
            date: Date.now()
          };
          await idbSaveAsset(assetRecord);
          loadedCustomAssets.push(assetRecord);
          successCount++;
        } catch (err) {
          console.error(`Lỗi nạp texture ${file.name}:`, err);
        }
      }
    }

    if (successCount > 0) {
      renderImportedAssetsGrid();
      renderCatalog(activeCategory, assetSearchInput?.value || '');
      if (lastLoadedId) {
        selectedAssetId = lastLoadedId;
      }
      alert(`🎉 Đã nạp thành công ${successCount} asset vào bộ sưu tập!`);
    } else {
      alert('Không thể nhận diện asset nào hợp lệ. Vui lòng chọn file .GLB, .glTF hoặc hình ảnh .PNG/.JPG');
    }
  }

  // Render Imported Assets Grid in Modal
  function renderImportedAssetsGrid() {
    if (!importedAssetsList) return;
    importedAssetsList.innerHTML = '';

    if (modalAssetCount) modalAssetCount.textContent = loadedCustomAssets.length;
    if (customModelCount) {
      const glbCount = loadedCustomAssets.filter(a => a.type === 'glb').length;
      customModelCount.textContent = glbCount;
    }

    if (loadedCustomAssets.length === 0) {
      importedAssetsList.innerHTML = `
        <div class="no-custom-assets">
          Chưa có asset tùy chỉnh nào được nạp. Hãy bấm nút 'Chọn File Từ Máy' hoặc kéo thả file .GLB / Texture vào khung phía trên.
        </div>
      `;
      return;
    }

    loadedCustomAssets.forEach((asset) => {
      const card = document.createElement('div');
      card.className = 'custom-asset-entry';

      const isGlb = asset.type === 'glb';
      const icon = isGlb ? '📦' : '🖼️';
      const typeLabel = isGlb ? '3D Model' : 'Texture';

      card.innerHTML = `
        <button class="del-btn" title="Xóa asset này">&times;</button>
        <div class="icon">${icon}</div>
        <div class="name" title="${asset.name}">${asset.name}</div>
        <small style="font-size:8.5px;color:#8da4be;">${typeLabel} • ${formatBytes(asset.size)}</small>
        <div style="display:flex;gap:4px;margin-top:4px;width:100%;">
          ${isGlb 
            ? `<button class="studio-btn btn-use" style="font-size:9.5px;padding:3px 6px;width:100%;justify-content:center;">📍 Đặt Vật Thể</button>`
            : `<button class="studio-btn btn-apply-ground" style="font-size:9.5px;padding:3px 6px;width:100%;justify-content:center;">🏞️ Nền Đất</button>`
          }
        </div>
      `;

      // Delete action
      const delBtn = card.querySelector('.del-btn');
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm(`Bạn có chắc muốn xóa "${asset.name}" khỏi danh sách asset đã nạp?`)) {
          await idbDeleteAsset(asset.id);
          loadedCustomAssets = loadedCustomAssets.filter(a => a.id !== asset.id);
          customGltfTemplates.delete(asset.id);
          const catIdx = ASSET_CATALOG.findIndex(a => a.id === asset.id);
          if (catIdx >= 0) ASSET_CATALOG.splice(catIdx, 1);

          renderImportedAssetsGrid();
          renderCatalog(activeCategory);
        }
      };

      // Use / Place action
      const useBtn = card.querySelector('.btn-use');
      if (useBtn) {
        useBtn.onclick = () => {
          selectedAssetId = asset.id;
          activeCategory = 'custom';
          document.querySelectorAll('.palette-tab').forEach(t => {
            if (t.dataset.cat === 'custom') t.classList.add('active');
            else t.classList.remove('active');
          });
          renderCatalog('custom');
          closeAssetManagerModal();
        };
      }

      // Apply ground texture action
      const applyGroundBtn = card.querySelector('.btn-apply-ground');
      if (applyGroundBtn) {
        applyGroundBtn.onclick = () => {
          if (asset.dataUrl) {
            applyGroundTextureDataUrl(asset.dataUrl, asset.name);
            closeAssetManagerModal();
            alert(`🎉 Đã áp dụng "${asset.name}" làm Texture mặt đất!`);
          }
        };
      }

      importedAssetsList.appendChild(card);
    });
  }

  // Clear All Custom Assets
  if (btnClearCustomAssets) {
    btnClearCustomAssets.onclick = async () => {
      if (loadedCustomAssets.length === 0) return;
      if (confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ asset tùy chỉnh đã nạp không?')) {
        await idbClearAssets();
        for (const asset of loadedCustomAssets) {
          customGltfTemplates.delete(asset.id);
          const catIdx = ASSET_CATALOG.findIndex(a => a.id === asset.id);
          if (catIdx >= 0) ASSET_CATALOG.splice(catIdx, 1);
        }
        loadedCustomAssets = [];
        renderImportedAssetsGrid();
        renderCatalog(activeCategory);
        alert('Đã xóa toàn bộ asset tùy chỉnh.');
      }
    };
  }

  // Restore Persisted Assets from IndexedDB on Startup
  async function loadPersistedAssets() {
    try {
      const stored = await idbGetAllAssets();
      if (!stored || stored.length === 0) return;

      for (const item of stored) {
        if (item.type === 'glb' && item.buffer) {
          try {
            const blob = new Blob([item.buffer], { type: 'model/gltf-binary' });
            const blobUrl = URL.createObjectURL(blob);
            const res = await BABYLON.SceneLoader.ImportMeshAsync('', '', blobUrl, scene, null, '.glb');
            if (res && res.meshes.length > 0) {
              const rootMesh = res.meshes[0];
              rootMesh.name = 'CustomTmpl_' + item.id;
              rootMesh.parent = worldRoot;
              rootMesh.position.set(0, -999, 0);

              for (const m of res.meshes) {
                m.receiveShadows = false;
                m.isPickable = false;
              }

              customGltfTemplates.set(item.id, rootMesh);
              ASSET_CATALOG.push({
                id: item.id,
                name: item.name,
                cat: 'custom',
                icon: '📦',
                defaultScale: 1.0
              });
              loadedCustomAssets.push(item);
            }
          } catch (err) {
            console.warn(`Lỗi khôi phục model ${item.name}:`, err);
          }
        } else if (item.type === 'ground_texture' && item.dataUrl) {
          applyGroundTextureDataUrl(item.dataUrl, item.name);
        } else if (item.type === 'texture') {
          loadedCustomAssets.push(item);
        }
      }

      if (loadedCustomAssets.length > 0) {
        renderImportedAssetsGrid();
        renderCatalog(activeCategory);
        // Re-render placed objects in case any custom models were saved on the map
        renderAll();
      }
    } catch (e) {
      console.warn('Lỗi đọc asset từ IndexedDB:', e);
    }
  }

  // Initialize Saved Custom Assets
  loadPersistedAssets();

  // ---------------------------------------------------------------------------
  // 10. RAYCASTING, CLICK & BRUSH SCATTER PLACEMENT
  // ---------------------------------------------------------------------------
  let placementMode = 'single'; // 'single' | 'brush'
  let isPointerDown = false;
  let lastBrushTime = 0;
  let selectedItemNode = null;
  let snapGrid = 0;

  document.getElementById('modeSingle').onclick = () => {
    placementMode = 'single';
    document.getElementById('modeSingle').classList.add('active');
    document.getElementById('modeBrush').classList.remove('active');
  };
  document.getElementById('modeBrush').onclick = () => {
    placementMode = 'brush';
    document.getElementById('modeBrush').classList.add('active');
    document.getElementById('modeSingle').classList.remove('active');
  };

  document.querySelectorAll('.snap-chip').forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll('.snap-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      snapGrid = parseFloat(chip.dataset.snap);
    };
  });

  function placeAtPoint(pt) {
    let x = pt.x, z = pt.z;
    if (snapGrid > 0) {
      x = Math.round(x / snapGrid) * snapGrid;
      z = Math.round(z / snapGrid) * snapGrid;
    }

    const def = ASSET_CATALOG.find(a => a.id === selectedAssetId);
    let scale = def ? def.defaultScale : 1.2;
    if (document.getElementById('randomScaleToggle')?.checked) {
      scale *= (0.85 + Math.random() * 0.35);
    }
    let rot = 0;
    if (document.getElementById('randomRotToggle')?.checked) {
      rot = Math.random() * Math.PI * 2;
    }

    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      modelId: selectedAssetId,
      x: Math.round(x * 100) / 100,
      y: 0.02,
      z: Math.round(z * 100) / 100,
      scale: Math.round(scale * 100) / 100,
      rotY: Math.round(rot * 100) / 100
    };
    placedItems.push(newItem);
    const node = spawnItemInScene(newItem);
    selectObject(node);
    updateStatsBadges();
    pushHistory();
  }

  scene.onPointerDown = (evt) => {
    if (evt.button !== 0) return; // Left click only
    isPointerDown = true;

    // Check if clicking existing object
    const objPick = scene.pick(scene.pointerX, scene.pointerY, (m) => m.name.startsWith('PickBox_') || m.name.endsWith('_inst') || m.name.startsWith('P') || m.name.startsWith('R') || m.name.startsWith('T') || m.name.startsWith('C') || m.name.startsWith('F') || m.name.startsWith('B'));
    if (objPick && objPick.hit && objPick.pickedMesh) {
      let parent = objPick.pickedMesh.parent;
      while (parent && !parent.name.startsWith('Placed_')) parent = parent.parent;
      if (parent && parent.metadata?.item) {
        selectObject(parent);
        return;
      }
    }

    // If clicking on terrain
    const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m.name === 'StudioGround' || m.name === 'StudioTrail');
    if (pick && pick.hit && pick.pickedPoint) {
      if (placementMode === 'single') {
        placeAtPoint(pick.pickedPoint);
      }
    }
  };

  scene.onPointerUp = () => { isPointerDown = false; };

  scene.onPointerMove = () => {
    if (isPointerDown && placementMode === 'brush') {
      const now = performance.now();
      if (now - lastBrushTime > 150) {
        lastBrushTime = now;
        const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m.name === 'StudioGround' || m.name === 'StudioTrail');
        if (pick && pick.hit && pick.pickedPoint) {
          const r = parseFloat(document.getElementById('brushRadiusSlider')?.value || 3.0);
          const scatterPt = pick.pickedPoint.clone();
          scatterPt.x += (Math.random() - 0.5) * r * 1.5;
          scatterPt.z += (Math.random() - 0.5) * r * 1.5;
          placeAtPoint(scatterPt);
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 11. OBJECT INSPECTOR & GIZMO SYNC
  // ---------------------------------------------------------------------------
  const insEmpty = document.getElementById('inspectorEmptyState');
  const insDetails = document.getElementById('inspectorDetails');
  const insName = document.getElementById('insName');
  const insId = document.getElementById('insId');
  const insScale = document.getElementById('insScale');
  const insScaleVal = document.getElementById('insScaleVal');
  const insRot = document.getElementById('insRot');
  const insRotVal = document.getElementById('insRotVal');
  const insPosX = document.getElementById('insPosX');
  const insPosY = document.getElementById('insPosY');
  const insPosZ = document.getElementById('insPosZ');

  function selectObject(node) {
    selectedItemNode = node;
    if (!node || !node.metadata?.item) {
      deselect();
      return;
    }
    const item = node.metadata.item;
    const def = ASSET_CATALOG.find(a => a.id === item.modelId);
    insEmpty.style.display = 'none';
    insDetails.style.display = 'block';

    insName.textContent = def ? def.name : item.modelId;
    insId.textContent = '#' + item.id;

    insScale.value = item.scale || 1.0;
    insScaleVal.textContent = (item.scale || 1.0).toFixed(2) + 'x';

    const deg = Math.round(((item.rotY || 0) * 180 / Math.PI)) % 360;
    insRot.value = deg;
    insRotVal.textContent = deg + '°';

    insPosX.value = item.x;
    insPosY.value = item.y || 0.02;
    insPosZ.value = item.z;

    // Attach 3D Gizmo to the selected node
    gizmoManager.attachToNode(node);
    highlightHierarchyRow(item.id);
  }

  function deselect() {
    selectedItemNode = null;
    insEmpty.style.display = 'block';
    insDetails.style.display = 'none';
    gizmoManager.attachToNode(null);
  }

  // Focus Camera Button
  document.getElementById('insFocusBtn').onclick = () => {
    if (!selectedItemNode) return;
    studioCamera.target.copyFrom(selectedItemNode.position);
    studioCamera.radius = 16;
  };

  // Sliders
  insScale.oninput = () => {
    if (!selectedItemNode?.metadata?.item) return;
    const val = parseFloat(insScale.value);
    selectedItemNode.metadata.item.scale = val;
    selectedItemNode.scaling.setAll(val);
    insScaleVal.textContent = val.toFixed(2) + 'x';
    pushHistory();
  };

  insRot.oninput = () => {
    if (!selectedItemNode?.metadata?.item) return;
    const deg = parseFloat(insRot.value);
    const rad = deg * Math.PI / 180;
    selectedItemNode.metadata.item.rotY = rad;
    selectedItemNode.rotation.y = rad;
    insRotVal.textContent = deg + '°';
    pushHistory();
  };

  insPosX.onchange = () => {
    if (!selectedItemNode?.metadata?.item) return;
    const val = parseFloat(insPosX.value);
    selectedItemNode.metadata.item.x = val;
    selectedItemNode.position.x = val;
    pushHistory();
  };

  insPosY.onchange = () => {
    if (!selectedItemNode?.metadata?.item) return;
    const val = parseFloat(insPosY.value);
    selectedItemNode.metadata.item.y = val;
    selectedItemNode.position.y = val;
    pushHistory();
  };

  insPosZ.onchange = () => {
    if (!selectedItemNode?.metadata?.item) return;
    const val = parseFloat(insPosZ.value);
    selectedItemNode.metadata.item.z = val;
    selectedItemNode.position.z = val;
    pushHistory();
  };

  // Drop to ground
  document.getElementById('gizmoDropGroundBtn').onclick = () => {
    if (!selectedItemNode?.metadata?.item) return;
    selectedItemNode.metadata.item.y = 0.02;
    selectedItemNode.position.y = 0.02;
    insPosY.value = 0.02;
    pushHistory();
  };

  // Duplicate
  document.getElementById('insBtnDup').onclick = () => {
    if (!selectedItemNode?.metadata?.item) return;
    const src = selectedItemNode.metadata.item;
    const copy = {
      ...src,
      id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      x: src.x + 1.2,
      z: src.z + 1.2
    };
    placedItems.push(copy);
    const node = spawnItemInScene(copy);
    selectObject(node);
    updateStatsBadges();
    pushHistory();
  };

  // Delete
  document.getElementById('insBtnDel').onclick = () => {
    if (!selectedItemNode?.metadata?.item) return;
    const id = selectedItemNode.metadata.item.id;
    const idx = placedItems.findIndex(i => i.id === id);
    if (idx >= 0) placedItems.splice(idx, 1);
    selectedItemNode.dispose();
    deselect();
    updateStatsBadges();
    pushHistory();
  };

  // ---------------------------------------------------------------------------
  // 12. HIERARCHY TREE LIST
  // ---------------------------------------------------------------------------
  const hierList = document.getElementById('hierarchyListContainer');
  const hierSearch = document.getElementById('hierarchySearchInput');

  function renderHierarchyList() {
    if (!hierList) return;
    hierList.innerHTML = '';
    const q = hierSearch?.value.toLowerCase() || '';

    placedItems.forEach(item => {
      const def = ASSET_CATALOG.find(a => a.id === item.modelId);
      const name = def ? def.name : item.modelId;
      if (q && !name.toLowerCase().includes(q)) return;

      const row = document.createElement('div');
      row.className = 'hierarchy-item-row' + (selectedItemNode?.metadata?.item?.id === item.id ? ' selected' : '');
      row.id = 'hier_row_' + item.id;
      row.innerHTML = `
        <span>${def ? def.icon : '📦'} ${name}</span>
        <small style="opacity:0.6;font-size:9px;">(${item.x}, ${item.z})</small>
      `;
      row.onclick = () => {
        const foundNode = itemsContainer.getChildTransformNodes(false).find(n => n.metadata?.item?.id === item.id);
        if (foundNode) {
          selectObject(foundNode);
          studioCamera.target.copyFrom(foundNode.position);
        }
      };
      hierList.appendChild(row);
    });
  }

  function highlightHierarchyRow(id) {
    document.querySelectorAll('.hierarchy-item-row').forEach(r => r.classList.remove('selected'));
    document.getElementById('hier_row_' + id)?.classList.add('selected');
  }

  if (hierSearch) {
    hierSearch.oninput = () => renderHierarchyList();
  }

  document.getElementById('btnDeleteAllSelected').onclick = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả vật thể?')) {
      placedItems = [];
      renderAll();
      deselect();
      pushHistory();
    }
  };

  // ---------------------------------------------------------------------------
  // 13. SIDEBAR TABS CONTROLLER (LEFT & RIGHT)
  // ---------------------------------------------------------------------------
  document.querySelectorAll('.sidebar-tab-header .side-tab-btn').forEach(btn => {
    btn.onclick = () => {
      const parent = btn.closest('.studio-sidebar-left') || btn.closest('.studio-sidebar-right');
      if (!parent) return;
      parent.querySelectorAll('.side-tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.sidebar-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    };
  });

  // ---------------------------------------------------------------------------
  // 14. TERRAIN, ROAD & SKY CONTROLS
  // ---------------------------------------------------------------------------
  // Ground Color
  const groundColorInp = document.getElementById('groundColorInput');
  groundColorInp.oninput = () => {
    groundMat.diffuseColor = BABYLON.Color3.FromHexString(groundColorInp.value);
    document.getElementById('groundColorLabel').textContent = groundColorInp.value;
  };

  // ---------------------------------------------------------------------------
  // 20 PBR GROUND TEXTURES PACK CONTROLLER (ON-DEMAND MODULAR LOADER)
  // ---------------------------------------------------------------------------
  const GROUND_TEXTURE_CATALOG = [
    { id: '01_Grass_Lush', name: 'Cỏ Xanh Mướt (Grass Lush)', icon: '🌿' },
    { id: '02_Grass_Dry', name: 'Cỏ Khô Úa (Grass Dry)', icon: '🌾' },
    { id: '03_Dirt_Natural', name: 'Đất Tự Nhiên (Dirt Natural)', icon: '🟤' },
    { id: '04_Soil_Wet_Dark', name: 'Đất Ẩm Đậm (Soil Wet Dark)', icon: '🌑' },
    { id: '05_Mud_Damp', name: 'Bùn Lầy Ướt (Mud Damp)', icon: '💧' },
    { id: '06_Moss_Ground', name: 'Rêu Phong Phủ Đất (Moss Ground)', icon: '🌱' },
    { id: '07_Gravel_Natural', name: 'Sỏi Đá Tự Nhiên (Gravel Natural)', icon: '🪨' },
    { id: '08_ForestFloor_LeafLitter', name: 'Lá Rừng Rụng (Forest Floor)', icon: '🍂' },
    { id: '09_VillagePath_PackedDirt', name: 'Đường Mòn Thôn Làng (Village Path)', icon: '🛤️' },
    { id: '10_SandySoil_SparseGrass', name: 'Đất Cát Cỏ Thưa (Sandy Soil)', icon: '🏜️' },
    { id: '11_MountainPath_Rocky', name: 'Đường Núi Đá Sỏi (Mountain Path)', icon: '⛰️' },
    { id: '12_ForestFloor_PineNeedles', name: 'Lá Thông Rụng (Pine Needles)', icon: '🌲' },
    { id: '13_Moss_Lush_Stone', name: 'Đá Phủ Rêu Xanh (Moss Lush Stone)', icon: '🪨' },
    { id: '14_Earth_Cracked_Dry', name: 'Đất Khô Nứt Nẻ (Cracked Earth)', icon: '🌋' },
    { id: '15_Riverbank_WetGravel', name: 'Bờ Suối Sỏi Ướt (Riverbank Gravel)', icon: '🌊' },
    { id: '16_Courtyard_Rustic_Dirt', name: 'Sân Đất Mộc Mạc (Rustic Dirt)', icon: '🏡' },
    { id: '17_StonePath_Ancient', name: 'Đường Lát Đá Cổ (Ancient Stone Path)', icon: '🏛️' },
    { id: '18_Courtyard_PackedVillage', name: 'Sân Thôn Bản Nén (Packed Village)', icon: '🛖' },
    { id: '19_Stone_WetMossy', name: 'Đá Ẩm Phủ Rêu (Wet Mossy Stone)', icon: '🟩' },
    { id: '20_RiverSand_Pebbles', name: 'Cát Sông Sỏi Nhỏ (River Sand)', icon: '🏖️' }
  ];

  function loadDynamicGroundTexture(texId) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = `./assets/environment/terrain/tex_${texId}.js?v=` + Date.now();
      s.onload = () => resolve(window.GROUND_TEXTURE_ACTIVE);
      s.onerror = () => resolve(null);
      document.body.appendChild(s);
    });
  }

  const groundTexPackList = document.getElementById('groundTexturePackList');
  if (groundTexPackList) {
    let activeTexId = '01_Grass_Lush';
    GROUND_TEXTURE_CATALOG.forEach((texItem) => {
      const chip = document.createElement('button');
      chip.className = 'preset-chip' + (activeTexId === texItem.id ? ' active' : '');
      chip.style.textAlign = 'left';
      chip.style.fontSize = '10px';
      chip.style.padding = '4px 8px';
      chip.style.display = 'flex';
      chip.style.alignItems = 'center';
      chip.style.gap = '6px';
      chip.innerHTML = `<span>${texItem.icon}</span> <span>${texItem.name}</span>`;

      chip.onclick = async () => {
        groundTexPackList.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeTexId = texItem.id;
        
        const loadedTex = await loadDynamicGroundTexture(texItem.id);
        if (loadedTex && loadedTex.data) {
          applyGroundTextureDataUrl(loadedTex.data, texItem.name);
          await idbSaveAsset({
            id: 'ground_tex_main',
            name: texItem.name,
            type: 'ground_texture',
            dataUrl: loadedTex.data,
            date: Date.now()
          });
        }
      };
      groundTexPackList.appendChild(chip);
    });
  }

  // Road Toggle
  const roadToggle = document.getElementById('roadToggle');
  const roadWrapper = document.getElementById('roadControlsWrapper');
  roadToggle.onchange = (e) => {
    roadVisible = e.target.checked;
    trail.setEnabled(roadVisible);
    roadWrapper.style.display = roadVisible ? 'block' : 'none';
  };

  // Trail Width Slider
  const trailWidthSlider = document.getElementById('trailWidthSlider');
  trailWidthSlider.oninput = () => {
    const w = parseFloat(trailWidthSlider.value);
    trail.scaling.x = w / 3.4;
    document.getElementById('trailWidthVal').textContent = w.toFixed(1) + 'm';
  };

  // Trail Color
  const trailColorInp = document.getElementById('trailColorInput');
  trailColorInp.oninput = () => {
    trailMat.diffuseColor = BABYLON.Color3.FromHexString(trailColorInp.value);
    document.getElementById('trailColorLabel').textContent = trailColorInp.value;
  };

  // Hills & Mountains Toggle
  document.getElementById('hillsToggle').onchange = (e) => hillsNode.setEnabled(e.target.checked);
  document.getElementById('mountainsToggle').onchange = (e) => mountainsNode.setEnabled(e.target.checked);

  // Sky Color
  const skyColorInp = document.getElementById('skyColorInput');
  skyColorInp.oninput = () => {
    scene.clearColor = BABYLON.Color4.FromHexString(skyColorInp.value + 'ff');
    document.getElementById('skyColorLabel').textContent = skyColorInp.value;
  };

  // Sun Intensity
  const sunSlider = document.getElementById('sunIntensitySlider');
  sunSlider.oninput = () => {
    sun.intensity = parseFloat(sunSlider.value);
    document.getElementById('sunIntensityVal').textContent = sunSlider.value + 'x';
  };

  // Fog Distance
  const fogSlider = document.getElementById('fogDistSlider');
  fogSlider.oninput = () => {
    const val = parseFloat(fogSlider.value);
    scene.fogEnd = val;
    document.getElementById('fogDistVal').textContent = val + 'm';
  };

  // Sun Angle Slider
  const sunAngleSlider = document.getElementById('sunAngleSlider');
  sunAngleSlider.oninput = () => {
    const deg = parseFloat(sunAngleSlider.value);
    document.getElementById('sunAngleVal').textContent = deg + '°';
    const rad = deg * Math.PI / 180;
    sun.direction = new BABYLON.Vector3(Math.cos(rad) * 0.5, -0.85, Math.sin(rad) * 0.5).normalize();
  };

  // Presets
  const PRESETS = {
    forest: { ground: '#48b336', sky: '#6bcbf2', fog: '#8ee2eb', fogEnd: 165, sun: 1.25 },
    autumn: { ground: '#857335', sky: '#efc18d', fog: '#f2d5b0', fogEnd: 150, sun: 1.35 },
    sakura: { ground: '#5cb84d', sky: '#fcd3e3', fog: '#fce8f0', fogEnd: 160, sun: 1.2 },
    desert: { ground: '#d9b36c', sky: '#ffe2a8', fog: '#f5ddb8', fogEnd: 180, sun: 1.5 },
    snow: { ground: '#d8eaf2', sky: '#b0d4e8', fog: '#d5e8f2', fogEnd: 130, sun: 1.1 },
    dark: { ground: '#2e262c', sky: '#361e2b', fog: '#4d2b3b', fogEnd: 110, sun: 0.9 },
    crystal: { ground: '#2d637a', sky: '#93c5fd', fog: '#bae6fd', fogEnd: 170, sun: 1.3 }
  };

  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const p = PRESETS[chip.dataset.preset];
      if (!p) return;
      groundMat.diffuseColor = BABYLON.Color3.FromHexString(p.ground);
      groundColorInp.value = p.ground;
      document.getElementById('groundColorLabel').textContent = p.ground;

      scene.clearColor = BABYLON.Color4.FromHexString(p.sky + 'ff');
      skyColorInp.value = p.sky;
      document.getElementById('skyColorLabel').textContent = p.sky;

      scene.fogColor = BABYLON.Color3.FromHexString(p.fog);
      scene.fogEnd = p.fogEnd;
      fogSlider.value = p.fogEnd;
      document.getElementById('fogDistVal').textContent = p.fogEnd + 'm';
    };
  });

  // Sky Time Presets
  const SKY_TIMES = {
    day: { sky: '#6bcbf2', fog: '#8ee2eb', sun: 1.25 },
    sunset: { sky: '#f97316', fog: '#fdba74', sun: 1.1 },
    night: { sky: '#0f172a', fog: '#1e293b', sun: 0.35 },
    mist: { sky: '#cad5e2', fog: '#e2e8f0', sun: 0.8 },
    cyber: { sky: '#4c1d95', fog: '#8b5cf6', sun: 1.0 }
  };

  document.querySelectorAll('.sky-chip').forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll('.sky-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const s = SKY_TIMES[chip.dataset.time];
      if (!s) return;
      scene.clearColor = BABYLON.Color4.FromHexString(s.sky + 'ff');
      skyColorInp.value = s.sky;
      document.getElementById('skyColorLabel').textContent = s.sky;
      scene.fogColor = BABYLON.Color3.FromHexString(s.fog);
      sun.intensity = s.sun;
      sunSlider.value = s.sun;
      document.getElementById('sunIntensityVal').textContent = s.sun + 'x';
    };
  });

  // ---------------------------------------------------------------------------
  // 15. CAMERA SWITCHER (FREE ORBIT VS TOP-DOWN VS PREVIEW WALK)
  // ---------------------------------------------------------------------------
  let isPreviewWalking = false;

  document.getElementById('camFreeBtn').onclick = () => {
    scene.activeCamera = studioCamera;
    studioCamera.attachControl(canvas, true);
    document.getElementById('camFreeBtn').classList.add('active');
    document.getElementById('camTopBtn').classList.remove('active');
    document.getElementById('camModeBadge').textContent = '🎥 Camera: Bay Tự Do';
  };

  document.getElementById('camTopBtn').onclick = () => {
    scene.activeCamera = topCamera;
    topCamera.attachControl(canvas, true);
    document.getElementById('camTopBtn').classList.add('active');
    document.getElementById('camFreeBtn').classList.remove('active');
    document.getElementById('camModeBadge').textContent = '🎥 Camera: Mặt Bằng 2D';
  };

  const btnPreview = document.getElementById('btnPreviewWalk');
  btnPreview.onclick = () => {
    isPreviewWalking = !isPreviewWalking;
    if (isPreviewWalking) {
      btnPreview.innerHTML = '<span>🛑</span> Dừng Xem';
      btnPreview.classList.add('btn-danger');
      scene.activeCamera = previewCamera;
      previewPlayer.setEnabled(true);
      previewPlayer.position.set(0, 0, 40);
      document.getElementById('camModeBadge').textContent = '🎥 Camera: Xem Thử Game';
    } else {
      btnPreview.innerHTML = '<span>🚶</span> Xem Thử Game';
      btnPreview.classList.remove('btn-danger');
      scene.activeCamera = studioCamera;
      previewPlayer.setEnabled(false);
      document.getElementById('camModeBadge').textContent = '🎥 Camera: Bay Tự Do';
    }
  };

  scene.onBeforeRenderObservable.add(() => {
    if (isPreviewWalking) {
      previewPlayer.position.z -= 0.12;
      if (previewPlayer.position.z < -80) previewPlayer.position.z = 50;
      previewCamera.target.copyFrom(previewPlayer.position).addInPlace(new BABYLON.Vector3(0, 1.35, -4.8));
    }
  });

  // ---------------------------------------------------------------------------
  // 16. EXPORT, IMPORT & DIRECT APPLY TO GAME
  // ---------------------------------------------------------------------------
  // Direct Apply to Game
  document.getElementById('btnApplyGame').onclick = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(placedItems));
    alert(`🎉 ĐÃ ÁP DỤNG BẢN ĐỒ THÀNH CÔNG!\nBản đồ gồm ${placedItems.length} vật thể 3D đã được đồng bộ vào game.\nBạn có thể bấm 'Mở Game' để trải nghiệm ngay!`);
  };

  // Reset All
  document.getElementById('btnResetAll').onclick = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ vật thể và làm lại từ đầu không?')) {
      placedItems = [];
      localStorage.removeItem(STORAGE_KEY);
      renderAll();
      deselect();
      pushHistory();
    }
  };

  // Export JSON
  document.getElementById('btnExportJson').onclick = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(placedItems, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'thanh_van_map_data.json');
    a.click();
  };

  // Import JSON
  const fileInput = document.getElementById('hiddenFileInput');
  document.getElementById('btnImportJson').onclick = () => fileInput?.click();

  fileInput.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed)) {
          placedItems = parsed;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(placedItems));
          renderAll();
          pushHistory();
          alert(`Đã nạp thành công ${placedItems.length} vật thể từ file JSON!`);
        }
      } catch (_) {
        alert('File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  console.info('🚀 Thanh Vân 3D Map Studio Pro đã khởi chạy đầy đủ tính năng!');
})();
