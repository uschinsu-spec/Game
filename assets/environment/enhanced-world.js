(()=>{
  const scene=BABYLON.EngineStore.LastCreatedScene;
  if(!scene)return;
  const root=new BABYLON.TransformNode('EnhancedXianxiaWorld',scene);
  const shadow=(()=>{const sun=scene.lights.find(l=>l.name==='sun');return sun&&sun.getShadowGenerator?sun.getShadowGenerator():null})();
  const mk=(name,color,emissive)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor.set(.03,.03,.03);if(emissive)m.emissiveColor=BABYLON.Color3.FromHexString(emissive);return m};
  const grass=mk('exGrass','#78c95b'),grassDark=mk('exGrassDark','#4e9f4d'),path=mk('exPath','#cbb985'),stone=mk('exStone','#7d8879'),stoneLight=mk('exStoneLight','#a6b19d'),wood=mk('exWood','#67452f'),woodDark=mk('exWoodDark','#3f2d25'),roof=mk('exRoof','#b84f43'),roofDark=mk('exRoofDark','#753630'),gold=mk('exGold','#d8b55c'),water=mk('exWater','#69bdd3','#163f48'),mist=mk('exMist','#dff3ec'),lantern=mk('exLantern','#f3c46f','#ff9f3f');
  water.alpha=.76;mist.alpha=.16;
  function caster(m){m.parent=root;m.receiveShadows=true;m.isPickable=false;if(shadow)shadow.addShadowCaster(m);return m}
  function box(name,opt,pos,mat,rotY=0){const m=BABYLON.MeshBuilder.CreateBox(name,opt,scene);m.position.copyFrom(pos);m.rotation.y=rotY;m.material=mat;return caster(m)}
  function cyl(name,opt,pos,mat){const m=BABYLON.MeshBuilder.CreateCylinder(name,opt,scene);m.position.copyFrom(pos);m.material=mat;return caster(m)}
  function sphere(name,opt,pos,mat){const m=BABYLON.MeshBuilder.CreateSphere(name,opt,scene);m.position.copyFrom(pos);m.material=mat;return caster(m)}
  // Disable coarse prototype-only environment, keep gameplay meshes untouched.
  const oldNames=new Set(['PaintedGround','PaintedRoad','GrassPatch','PaintedMountain','PaintedFlower','PaintedMist','SpiritPeak','hall','curvedRoof','SectStep','GatePillar','SectGate','MountainMist']);
  scene.meshes.forEach(m=>{if(oldNames.has(m.name))m.setEnabled(false)});
  // Layered valley floor and readable central lane for portrait play.
  const floor=BABYLON.MeshBuilder.CreateGround('EnhancedGround',{width:150,height:265,subdivisions:2},scene);floor.parent=root;floor.position.set(0,.015,-42);floor.material=grass;floor.receiveShadows=true;floor.isPickable=false;
  for(let i=0;i<12;i++){
    const side=i%2?1:-1, z=70-i*18;
    const terrace=box('TerrainTerrace',{width:48+((i*7)%15),height:.22,depth:15},new BABYLON.Vector3(side*41,.03,z),i%3?grassDark:grass,(i%2?-.04:.04));
    terrace.scaling.y=.7;
  }
  const road=BABYLON.MeshBuilder.CreateGround('EnhancedRoad',{width:13.5,height:245,subdivisions:1},scene);road.parent=root;road.position.set(0,.055,-45);road.material=path;road.receiveShadows=true;road.isPickable=false;
  // Repeating stone edging adds depth without expensive textures.
  for(let i=0;i<43;i++){
    const z=72-i*5.4;
    [-1,1].forEach(side=>{
      const s=box('RoadEdgeStone',{width:1.6+(i%3)*.18,height:.28,depth:1.15},new BABYLON.Vector3(side*(7.1+(i%2)*.25),.15,z),i%4?stone:stoneLight,(i*.37)%1.2);
      s.scaling.y=.65;
    });
  }
  // Water gardens.
  [[-39,26,25,14],[43,-10,22,13]].forEach((v,idx)=>{
    const w=BABYLON.MeshBuilder.CreateGround('SpiritLake'+idx,{width:v[2],height:v[3]},scene);w.parent=root;w.position.set(v[0],.07,v[1]);w.material=water;w.isPickable=false;
    for(let i=0;i<9;i++){
      const a=(i/9)*Math.PI*2,r=(idx?7:8)+(i%3);
      const rock=sphere('LakeRock',{diameter:1.8+(i%2)*.7,segments:8},new BABYLON.Vector3(v[0]+Math.cos(a)*r,.55,v[1]+Math.sin(a)*r),i%2?stone:stoneLight);rock.scaling.y=.65;
    }
  });
  // Bridge across first pond.
  for(let i=0;i<9;i++)box('BridgePlank',{width:2.4,height:.18,depth:1.05},new BABYLON.Vector3(-39+i*.7-.0,.55+Math.sin(i/8*Math.PI)*.8,26),woodDark,.03);
  // Stylized distant mountain silhouettes.
  const peaks=[[-54,-120,27,58],[-34,-145,34,78],[-67,-174,42,92],[48,-127,29,65],[67,-159,39,88],[8,-205,52,104]];
  peaks.forEach((v,i)=>{const m=cyl('ImmortalPeak',{diameterTop:v[2]*.08,diameterBottom:v[2]*1.9,height:v[3],tessellation:9},new BABYLON.Vector3(v[0],v[3]/2-1,v[1]),i%2?stone:grassDark);m.scaling.x=.7+(i%3)*.08;m.rotation.y=i*.63});
  function lanternPost(x,z,scale=1){
    cyl('LanternPost',{height:3.7*scale,diameter:.22*scale,tessellation:8},new BABYLON.Vector3(x,1.85*scale,z),woodDark);
    box('LanternBox',{width:.72*scale,height:.9*scale,depth:.72*scale},new BABYLON.Vector3(x,3.35*scale,z),lantern);
    box('LanternCap',{width:1.05*scale,height:.14*scale,depth:1.05*scale},new BABYLON.Vector3(x,3.87*scale,z),roofDark);
  }
  [[-8,58],[8,48],[-8,23],[8,3],[-8,-20],[8,-44],[-8,-69],[8,-88]].forEach((p,i)=>lanternPost(p[0],p[1],.72+(i%2)*.06));
  function pagoda(x,z,s=1,levels=3){
    const p=new BABYLON.TransformNode('EnhancedPagoda',scene);p.parent=root;
    const podium=box('PagodaPodium',{width:7*s,height:.5*s,depth:6*s},new BABYLON.Vector3(x,.25*s,z),stoneLight);podium.parent=p;
    for(let y=0;y<levels;y++){
      const yy=.75*s+y*2.2*s;
      const hall=box('PagodaHall',{width:(4.8-y*.35)*s,height:1.55*s,depth:(3.8-y*.3)*s},new BABYLON.Vector3(x,yy+1*s,z),y?woodDark:wood);hall.parent=p;
      const roofMesh=BABYLON.MeshBuilder.CreateCylinder('PagodaRoof',{diameterTop:.8*s,diameterBottom:(7.0-y*.55)*s,height:.68*s,tessellation:4},scene);roofMesh.position.set(x,yy+1.95*s,z);roofMesh.rotation.y=Math.PI/4;roofMesh.material=y%2?roofDark:roof;roofMesh.parent=p;roofMesh.receiveShadows=true;if(shadow)shadow.addShadowCaster(roofMesh);
      for(const sx of [-1,1])for(const sz of [-1,1])box('PagodaColumn',{width:.22*s,height:1.75*s,depth:.22*s},new BABYLON.Vector3(x+sx*(1.75-y*.12)*s,yy+.95*s,z+sz*(1.25-y*.08)*s),gold).parent=p;
    }
    return p;
  }
  pagoda(0,-126,1.55,4);pagoda(-38,-66,.88,2);pagoda(39,-78,.92,2);pagoda(-52,2,.76,2);pagoda(54,17,.8,2);
  // Main sect gate with curved-roof silhouette.
  [-5.6,5.6].forEach(x=>cyl('SectPillarNew',{height:8.2,diameter:1.15,tessellation:10},new BABYLON.Vector3(x,4.1,-96),woodDark));
  box('SectBeamNew',{width:13.5,height:.65,depth:.9},new BABYLON.Vector3(0,7.15,-96),roofDark);
  const gateRoof=BABYLON.MeshBuilder.CreateCylinder('SectRoofNew',{diameterTop:2,diameterBottom:15.5,height:.8,tessellation:4},scene);gateRoof.position.set(0,8,-96);gateRoof.rotation.y=Math.PI/4;gateRoof.material=roof;caster(gateRoof);
  for(let i=0;i<11;i++)box('TempleStepNew',{width:13.2-i*.08,height:.18,depth:1.35},new BABYLON.Vector3(0,.1+i*.055,-101-i*1.18),i%2?stone:stoneLight);
  // Mist layers around distant architecture.
  for(let i=0;i<10;i++){const f=sphere('CloudRibbon',{diameter:16+(i%4)*4,segments:8},new BABYLON.Vector3(((i*31)%96)-48,7+(i%3)*2.5,-104-i*10),mist);f.scaling.set(1.7,.14,.65)}
  // Mobile-safe scene grading.
  scene.imageProcessingConfiguration.exposure=1.05;
  scene.imageProcessingConfiguration.contrast=1.08;
  scene.ambientColor=new BABYLON.Color3(.16,.18,.14);
  if(scene.fogMode!==BABYLON.Scene.FOGMODE_NONE){scene.fogStart=105;scene.fogEnd=230;scene.fogColor=new BABYLON.Color3(.72,.84,.81)}
  console.info('Thanh Vân Sơn: môi trường nâng cấp đã sẵn sàng.');
})();
