// Procedural village safe-zone placeholders. Visual-only: never blocks player movement.
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene || typeof BABYLON === 'undefined') return;

  const prev = scene.getTransformNodeByName('PeacefulVillageRoot');
  if (prev) prev.dispose();
  const root = new BABYLON.TransformNode('PeacefulVillageRoot', scene);
  const SAFE_ZONE_RADIUS = 52;

  window.PEACEFUL_VILLAGE_SAFE_ZONE = {
    radius: SAFE_ZONE_RADIUS,
    center: new BABYLON.Vector3(0,0,0),
    isInside: pos => !!pos && Math.hypot(pos.x, pos.z) <= SAFE_ZONE_RADIUS
  };

  const makeMat=(name,color)=>{
    let m=scene.getMaterialByName(name);
    if(m) return m;
    m=new BABYLON.StandardMaterial(name,scene);
    m.diffuseColor=BABYLON.Color3.FromHexString(color);
    m.specularColor=new BABYLON.Color3(.03,.03,.03);
    return m;
  };
  const safeMesh=(m)=>{ if(!m) return m; m.isPickable=false; m.checkCollisions=false; return m; };

  const plaza=safeMesh(BABYLON.MeshBuilder.CreateCylinder('PlaceholderVillagePlaza',{height:.05,diameter:32,tessellation:48},scene));
  plaza.parent=root;plaza.position.y=.026;plaza.material=makeMat('PlaceholderPlazaMat','#b89d78');

  [[5,86],[86,5]].forEach((s,i)=>{
    const r=safeMesh(BABYLON.MeshBuilder.CreateBox('PlaceholderRoad_'+i,{width:s[0],height:.035,depth:s[1]},scene));
    r.parent=root;r.position.y=.018;r.material=makeMat('PlaceholderRoadMat','#9c866b');
  });

  const houseMat=makeMat('PlaceholderHouseWall','#d8c29a');
  const roofMat=makeMat('PlaceholderHouseRoof','#824238');
  const woodMat=makeMat('PlaceholderHouseWood','#70452c');
  const houses=[[0,34,0,1.35],[-34,7,Math.PI/2,1.1],[34,7,-Math.PI/2,1.1],[-25,-25,.55,1],[25,-25,-.55,1]];
  houses.forEach((h,i)=>{
    const n=new BABYLON.TransformNode('PlaceholderHouse_'+i,scene);n.parent=root;n.position.set(h[0],0,h[1]);n.rotation.y=h[2];n.scaling.setAll(h[3]);
    const body=safeMesh(BABYLON.MeshBuilder.CreateBox('PlaceholderHouse_'+i+'_Body',{width:7,height:3.8,depth:5.5},scene));body.parent=n;body.position.y=1.9;body.material=houseMat;
    const roof=safeMesh(BABYLON.MeshBuilder.CreateCylinder('PlaceholderHouse_'+i+'_Roof',{height:5.8,diameter:6.3,tessellation:3},scene));roof.parent=n;roof.position.y=4.5;roof.rotation.z=Math.PI/2;roof.scaling.x=1.25;roof.material=roofMat;
    const door=safeMesh(BABYLON.MeshBuilder.CreateBox('PlaceholderHouse_'+i+'_Door',{width:1.25,height:2.25,depth:.18},scene));door.parent=n;door.position.set(0,1.15,-2.84);door.material=woodMat;
  });

  const fenceMat=makeMat('PlaceholderFenceWood','#705039');
  for(let i=0;i<44;i++){
    const a=(i/44)*Math.PI*2;
    const deg=((a*180/Math.PI)+360)%360;
    const nearGate=[0,90,180,270].some(g=>Math.abs((((deg-g)+540)%360)-180)<11);
    if(nearGate) continue;
    const n=new BABYLON.TransformNode('PlaceholderFence_'+i,scene);n.parent=root;n.position.set(Math.cos(a)*49.5,0,Math.sin(a)*49.5);n.rotation.y=-a+Math.PI/2;
    [-1.35,1.35].forEach((px,j)=>{const p=safeMesh(BABYLON.MeshBuilder.CreateBox('PlaceholderFence_'+i+'_Post'+j,{width:.22,height:1.55,depth:.22},scene));p.parent=n;p.position.set(px,.78,0);p.material=fenceMat;});
    const rail=safeMesh(BABYLON.MeshBuilder.CreateBox('PlaceholderFence_'+i+'_Rail',{width:3,height:.25,depth:.18},scene));rail.parent=n;rail.position.y=.85;rail.material=fenceMat;
  }

  const gateMat=makeMat('PlaceholderGateWood','#6d3e2b');
  [[0,-49.5,0],[0,49.5,Math.PI],[49.5,0,-Math.PI/2],[-49.5,0,Math.PI/2]].forEach((g,i)=>{
    const n=new BABYLON.TransformNode('PlaceholderVillageGate_'+i,scene);n.parent=root;n.position.set(g[0],0,g[1]);n.rotation.y=g[2];
    [-3.2,3.2].forEach((x,j)=>{const p=safeMesh(BABYLON.MeshBuilder.CreateBox('VillageGatePost_'+i+'_'+j,{width:.55,height:5.5,depth:.55},scene));p.parent=n;p.position.set(x,2.75,0);p.material=gateMat;});
    const b=safeMesh(BABYLON.MeshBuilder.CreateBox('VillageGateBeam_'+i,{width:7.4,height:.65,depth:.7},scene));b.parent=n;b.position.y=5.1;b.material=gateMat;
  });

  const formationMat=makeMat('PlaceholderFormationMat','#38bdf8');formationMat.emissiveColor=BABYLON.Color3.FromHexString('#087ea4');formationMat.alpha=.55;
  const formation=safeMesh(BABYLON.MeshBuilder.CreateTorus('SpawnFormation',{diameter:5.8,thickness:.18,tessellation:40},scene));formation.parent=root;formation.position.y=.08;formation.material=formationMat;

  // Absolute safety: every village mesh is visual-only.
  root.getChildMeshes(false).forEach(m=>{m.isPickable=false;m.checkCollisions=false;});
  scene.collisionsEnabled = false;

  console.info('[Village] Placeholder village active in visual-only mode; movement cannot be blocked.');
})();