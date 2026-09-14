// Procedural open-world environment. No external flora asset pack dependencies.
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene || !window.PlaceholderAssets) return;

  const old = scene.getTransformNodeByName('DeepAncientForestWorld');
  if (old) old.dispose();
  const root = new BABYLON.TransformNode('DeepAncientForestWorld', scene);
  const P = window.PlaceholderAssets;

  const groundMat = P.makeMat(scene, 'PlaceholderGroundMat', '#55a94a');
  const ground = BABYLON.MeshBuilder.CreateGround('UlalaMeadowGround', { width: 2800, height: 2800, subdivisions: 2 }, scene);
  ground.parent = root; ground.material = groundMat; ground.receiveShadows = true; ground.isPickable = false;

  const mountainMat = P.makeMat(scene, 'PlaceholderMountainMat', '#6d9280');
  [0.25, 1.05, 1.9, 2.75, 3.55, 4.35, 5.15, 5.85].forEach((a, i) => {
    const d = 520 + (i % 3) * 100;
    const m = BABYLON.MeshBuilder.CreateCylinder('PlaceholderMountain_' + i, {
      height: 100 + (i % 2) * 35, diameterTop: 0.1, diameterBottom: 220 + (i % 3) * 55, tessellation: 7
    }, scene);
    m.parent = root; m.position.set(Math.cos(a) * d, 32, Math.sin(a) * d); m.material = mountainMat; m.isPickable = false;
  });

  const flora = new BABYLON.TransformNode('PlaceholderFloraRoot', scene); flora.parent = root;
  const treeSpots = [
    [-62,45,1.5,0], [66,44,1.6,0], [-70,-52,1.55,1], [72,-55,1.65,0],
    [-82,76,1.75,1], [86,72,1.7,0], [-90,-82,1.8,0], [94,-78,1.75,1],
    [-108,22,1.9,0], [112,-25,1.85,1], [130,118,2.0,0], [-132,-120,2.0,0],
    [155,45,1.8,1], [-160,62,1.9,0], [48,156,1.7,0], [-52,-165,1.8,1]
  ];
  treeSpots.forEach((v, i) => P.createTree(scene, flora, 'PlaceholderTree_' + i, v[0], v[1], v[2], v[3]));

  const rocks = [[-58,92,1.4],[73,102,1.1],[-96,-68,1.5],[118,-92,1.3],[178,25,1.6],[-180,-30,1.5]];
  rocks.forEach((v, i) => P.createRock(scene, flora, 'PlaceholderRock_' + i, v[0], v[1], v[2]));

  // A few simple landmarks so the world is not visually empty while real assets are being rebuilt.
  const toriiMat = P.makeMat(scene, 'PlaceholderToriiMat', '#b83b32');
  [[85,95],[-155,145],[165,-145]].forEach((p, i) => {
    const n = new BABYLON.TransformNode('PlaceholderGate_' + i, scene); n.parent = root; n.position.set(p[0],0,p[1]);
    [-2.5,2.5].forEach((x,j)=>{ const q=BABYLON.MeshBuilder.CreateBox('GatePost_'+i+'_'+j,{width:.45,height:6,depth:.45},scene); q.parent=n;q.position.set(x,3,0);q.material=toriiMat;q.isPickable=false; });
    const beam=BABYLON.MeshBuilder.CreateBox('GateBeam_'+i,{width:6.8,height:.55,depth:.65},scene);beam.parent=n;beam.position.y=5.8;beam.material=toriiMat;beam.isPickable=false;
  });

  console.info('[World] Procedural placeholder environment active; external flora pack removed.');
})();