// Procedural village safe-zone placeholders. No THON TRAN asset dependencies.
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene || !window.PlaceholderAssets) return;

  const prev = scene.getTransformNodeByName('PeacefulVillageRoot');
  if (prev) prev.dispose();
  const root = new BABYLON.TransformNode('PeacefulVillageRoot', scene);
  const P = window.PlaceholderAssets;
  const SAFE_ZONE_RADIUS = 52;

  window.PEACEFUL_VILLAGE_SAFE_ZONE = {
    radius: SAFE_ZONE_RADIUS,
    center: new BABYLON.Vector3(0,0,0),
    isInside: pos => !!pos && Math.hypot(pos.x, pos.z) <= SAFE_ZONE_RADIUS
  };

  const plazaMat = P.makeMat(scene, 'PlaceholderPlazaMat', '#b89d78');
  const plaza = BABYLON.MeshBuilder.CreateCylinder('PlaceholderVillagePlaza', { height: 0.08, diameter: 32, tessellation: 48 }, scene);
  plaza.parent = root; plaza.position.y = 0.035; plaza.material = plazaMat; plaza.isPickable = false;

  const roadMat = P.makeMat(scene, 'PlaceholderRoadMat', '#9c866b');
  const roads = [
    [0,0,5,0.05,86], [0,0,86,0.05,5]
  ];
  roads.forEach((d,i)=>{
    const r = BABYLON.MeshBuilder.CreateBox('PlaceholderRoad_'+i,{width:d[2],height:d[3],depth:d[4]},scene);
    r.parent=root;r.position.y=0.03;r.material=roadMat;r.isPickable=false;
  });

  const houses = [
    [0,34,0,1.35],[-34,7,Math.PI/2,1.1],[34,7,-Math.PI/2,1.1],[-25,-25,.55,1],[25,-25,-.55,1]
  ];
  houses.forEach((h,i)=>P.createHouse(scene,root,'PlaceholderHouse_'+i,h[0],h[1],h[2],h[3]));

  // Four gate openings remain clear. Fences occupy the rest of the perimeter.
  const fenceCount = 44;
  for (let i=0;i<fenceCount;i++) {
    const a=(i/fenceCount)*Math.PI*2;
    const deg=((a*180/Math.PI)+360)%360;
    const nearGate = [0,90,180,270].some(g => Math.abs((((deg-g)+540)%360)-180) < 11);
    if (nearGate) continue;
    const x=Math.cos(a)*49.5, z=Math.sin(a)*49.5;
    P.createFence(scene,root,'PlaceholderFence_'+i,x,z,-a+Math.PI/2,1.15);
  }

  const gateMat=P.makeMat(scene,'PlaceholderGateWood','#6d3e2b');
  [[0,-49.5,0],[0,49.5,Math.PI],[49.5,0,-Math.PI/2],[-49.5,0,Math.PI/2]].forEach((g,i)=>{
    const n=new BABYLON.TransformNode('PlaceholderVillageGate_'+i,scene);n.parent=root;n.position.set(g[0],0,g[1]);n.rotation.y=g[2];
    [-3.2,3.2].forEach((x,j)=>{const p=BABYLON.MeshBuilder.CreateBox('VillageGatePost_'+i+'_'+j,{width:.55,height:5.5,depth:.55},scene);p.parent=n;p.position.set(x,2.75,0);p.material=gateMat;p.isPickable=false;});
    const b=BABYLON.MeshBuilder.CreateBox('VillageGateBeam_'+i,{width:7.4,height:.65,depth:.7},scene);b.parent=n;b.position.y=5.1;b.material=gateMat;b.isPickable=false;
  });

  const formationMat=P.makeMat(scene,'PlaceholderFormationMat','#38bdf8'); formationMat.emissiveColor=BABYLON.Color3.FromHexString('#087ea4'); formationMat.alpha=.55;
  const formation=BABYLON.MeshBuilder.CreateTorus('SpawnFormation',{diameter:5.8,thickness:.18,tessellation:40},scene);formation.parent=root;formation.position.y=.08;formation.material=formationMat;

  console.info('[Village] Procedural placeholder village active; THON TRAN pack removed.');
})();