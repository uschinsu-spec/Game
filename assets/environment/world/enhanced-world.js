// Standalone procedural open-world environment.
// Ground must always render even if optional placeholder helpers fail to load.
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene || typeof BABYLON === 'undefined') return;

  const old = scene.getTransformNodeByName('DeepAncientForestWorld');
  if (old) old.dispose();
  const oldGround = scene.getMeshByName('UlalaMeadowGround');
  if (oldGround) oldGround.dispose();

  const root = new BABYLON.TransformNode('DeepAncientForestWorld', scene);

  const makeMat = (name, color) => {
    let m = scene.getMaterialByName(name);
    if (m) return m;
    m = new BABYLON.StandardMaterial(name, scene);
    m.diffuseColor = BABYLON.Color3.FromHexString(color);
    m.specularColor = new BABYLON.Color3(0.02, 0.02, 0.02);
    return m;
  };

  // Always create a visible ground first. Texture is optional enhancement only.
  const groundMat = makeMat('WorldGroundMat', '#55a94a');
  const grassData = window.GRASS_LUSH_TEXTURE || (window.GROUND_TEXTURE_ACTIVE && window.GROUND_TEXTURE_ACTIVE.data);
  if (grassData) {
    try {
      const tex = new BABYLON.Texture(grassData, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
      tex.uScale = 140;
      tex.vScale = 140;
      tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
      tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
      tex.anisotropicFilteringLevel = 8;
      groundMat.diffuseTexture = tex;
      groundMat.diffuseColor = BABYLON.Color3.White();
    } catch (_) {}
  }

  const ground = BABYLON.MeshBuilder.CreateGround('UlalaMeadowGround', { width: 2800, height: 2800, subdivisions: 2 }, scene);
  ground.parent = root;
  ground.position.set(0, 0, 0);
  ground.material = groundMat;
  ground.receiveShadows = true;
  ground.isPickable = false;
  ground.checkCollisions = false;
  ground.alwaysSelectAsActiveMesh = true;

  const mountainMat = makeMat('PlaceholderMountainMat', '#6d9280');
  [0.25,1.05,1.9,2.75,3.55,4.35,5.15,5.85].forEach((a,i)=>{
    const d=520+(i%3)*100;
    const m=BABYLON.MeshBuilder.CreateCylinder('PlaceholderMountain_'+i,{height:100+(i%2)*35,diameterTop:.1,diameterBottom:220+(i%3)*55,tessellation:7},scene);
    m.parent=root;m.position.set(Math.cos(a)*d,32,Math.sin(a)*d);m.material=mountainMat;m.isPickable=false;m.checkCollisions=false;
  });

  const P = window.PlaceholderAssets;
  if (P) {
    const flora=new BABYLON.TransformNode('PlaceholderFloraRoot',scene);flora.parent=root;
    const treeSpots=[[-62,45,1.5,0],[66,44,1.6,0],[-70,-52,1.55,1],[72,-55,1.65,0],[-82,76,1.75,1],[86,72,1.7,0],[-90,-82,1.8,0],[94,-78,1.75,1],[-108,22,1.9,0],[112,-25,1.85,1],[130,118,2,0],[-132,-120,2,0],[155,45,1.8,1],[-160,62,1.9,0],[48,156,1.7,0],[-52,-165,1.8,1]];
    treeSpots.forEach((v,i)=>P.createTree(scene,flora,'PlaceholderTree_'+i,v[0],v[1],v[2],v[3]));
    const rocks=[[-58,92,1.4],[73,102,1.1],[-96,-68,1.5],[118,-92,1.3],[178,25,1.6],[-180,-30,1.5]];
    rocks.forEach((v,i)=>P.createRock(scene,flora,'PlaceholderRock_'+i,v[0],v[1],v[2]));
  }

  console.info('[World] Ground active; optional placeholders loaded independently.');
})();