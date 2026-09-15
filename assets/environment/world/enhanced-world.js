(()=>{'use strict';
const TAU=Math.PI*2;

function tag(node,{zoneId,chunkKey,kind='PROP',cullRadius=120,walkable=false,blocksSpawn=false}={}){
  node.metadata=Object.assign(node.metadata||{},{worldStatic:true,streamingStatic:true,zoneId,chunkKey,kind,cullRadius,walkable,blocksSpawn});
  return node;
}

function makeMat(scene,name,color,alpha=1,emissive=null,specular=null){
  let m=scene.getMaterialByName?.(name);
  if(m)return m;
  m=new BABYLON.StandardMaterial(name,scene);
  m.diffuseColor=BABYLON.Color3.FromHexString(color);
  if(emissive)m.emissiveColor=BABYLON.Color3.FromHexString(emissive);
  if(specular)m.specularColor=BABYLON.Color3.FromHexString(specular);
  else m.specularColor=new BABYLON.Color3(.04,.04,.04);
  m.alpha=alpha;
  return m;
}

function createPatternedGrayStoneTexture(scene){
  const tex=new BABYLON.DynamicTexture('G2_PatternedGrayStoneTex',{width:512,height:512},scene,false);
  const ctx=tex.getContext();
  // Base gray slate background
  ctx.fillStyle='#69717a';
  ctx.fillRect(0,0,512,512);

  // Stacked stone brick blocks with engraved cloud/meander relief
  const rows=4,cols=2;
  const rh=512/rows,cw=512/cols;
  for(let r=0;r<rows;r++){
    const offset=(r%2)*cw*0.5;
    for(let c=-1;c<=cols+1;c++){
      const bx=c*cw+offset,by=r*rh;
      // Stone tile gradient
      const grad=ctx.createLinearGradient(bx,by,bx,by+rh);
      grad.addColorStop(0,'#7d8690');
      grad.addColorStop(0.5,'#636b73');
      grad.addColorStop(1,'#515860');
      ctx.fillStyle=grad;
      ctx.fillRect(bx+3,by+3,cw-6,rh-6);

      // Engraved ancient cloud & meander patterns (Hoa văn vân mây cổ phong)
      ctx.strokeStyle='#393e44';
      ctx.lineWidth=3;
      const mx=bx+cw/2,my=by+rh/2;
      ctx.beginPath();
      ctx.arc(mx-16,my,11,0,Math.PI*1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mx+16,my,11,Math.PI,Math.PI*2.5);
      ctx.stroke();

      // Horizontal relief borders
      ctx.beginPath();
      ctx.moveTo(bx+8,by+12);
      ctx.lineTo(bx+cw-8,by+12);
      ctx.moveTo(bx+8,by+rh-12);
      ctx.lineTo(bx+cw-8,by+rh-12);
      ctx.stroke();

      // Stone highlight bevel
      ctx.strokeStyle='#9ba5ae';
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(bx+3,by+rh-3);
      ctx.lineTo(bx+3,by+3);
      ctx.lineTo(bx+cw-3,by+3);
      ctx.stroke();
    }
  }
  tex.update();
  return tex;
}

class EnhancedWorldZoneAssetBuilder{
  constructor(scene){
    this.scene=scene;
    this.byZone=new Map();
    this.initSharedMaterials();
  }

  initSharedMaterials(){
    const s=this.scene;
    const grayStoneTex=createPatternedGrayStoneTexture(s);
    const patternedGrayStone=makeMat(s,'G2_PatternedGrayStone','#69717a');
    patternedGrayStone.diffuseTexture=grayStoneTex;
    patternedGrayStone.specularColor=new BABYLON.Color3(.06,.06,.06);

    this.shared={
      wood:makeMat(s,'G2_Wood','#5c3d2e'),
      darkWood:makeMat(s,'G2_DarkWood','#382216'),
      roofRed:makeMat(s,'G2_RoofRed','#a3382c'),
      roofJade:makeMat(s,'G2_RoofJade','#2d6b5e'),
      wallPlaster:makeMat(s,'G2_WallPlaster','#e8e1cf'),
      goldTrim:makeMat(s,'G2_GoldTrim','#dfc27e',1,'#52401a'),
      stonePaver:makeMat(s,'G2_StonePaver','#b0a48e'),
      stoneBorder:makeMat(s,'G2_StoneBorder','#6e6456'),
      patternedGrayStone,
      grayStoneDark:makeMat(s,'G2_GrayStoneDark','#474e55'),
      grayStoneLight:makeMat(s,'G2_GrayStoneLight','#8a939c'),
      lanternRed:makeMat(s,'G2_LanternRed','#ff3e2e',1,'#991508'),
      lanternGold:makeMat(s,'G2_LanternGold','#ffdf6b',1,'#cc9d1a'),
      bambooStem:makeMat(s,'G2_BambooStem','#68b849'),
      bambooLeaf:makeMat(s,'G2_BambooLeaf','#46942e'),
      pineFoliage:makeMat(s,'G2_PineFoliage','#2d5e3f'),
      pineBark:makeMat(s,'G2_PineBark','#4a3627'),
      peachBlossom:makeMat(s,'G2_PeachBlossom','#ff9ebb',1,'#4a2230'),
      spiritCrystal:makeMat(s,'G2_SpiritCrystal','#5ce1e6',0.88,'#1c8287','#ffffff'),
      incenseBronze:makeMat(s,'G2_Bronze','#5e523c',1,'#1f180d','#9c8965')
    };

    // Dedicated Village Courtyard Ground (Texture 18: Sân Thôn Bản Nén)
    const villageGround=makeMat(s,'G2_VillageCourtyardGround','#968c78');
    const villageTex=window.VILLAGE_COURTYARD_TEXTURE||(window.GROUND_TEXTURE_ACTIVE&&window.GROUND_TEXTURE_ACTIVE.data);
    if(villageTex){
      try{
        const vt=new BABYLON.Texture(villageTex,s,false,true);
        vt.uScale=12;
        vt.vScale=14;
        villageGround.diffuseTexture=vt;
      }catch(_){}
    }
    villageGround.specularColor=new BABYLON.Color3(.04,.04,.04);
    villageGround.zOffset=-1;
    this.shared.villageGround=villageGround;

    for(const m of Object.values(this.shared)){
      if(m&&m.freeze)m.freeze();
    }
  }

  freezeNode(node){
    if(!node)return node;
    const meshes=node.getChildMeshes?node.getChildMeshes(false):[node];
    for(let i=0;i<meshes.length;i++){
      const m=meshes[i];
      if(m){
        if(m.freezeWorldMatrix)m.freezeWorldMatrix();
        m.cullingStrategy=BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
        m.doNotSerialize=true;
      }
    }
    return node;
  }

  mats(zone){
    if(this.byZone.has(zone.id))return this.byZone.get(zone.id);
    const v=zone.visual||{},id=zone.id,s=this.scene;
    const grass=makeMat(s,`GAME2_Grass_${id}`,v.grass||'#4fa83d');
    const road=makeMat(s,`GAME2_Road_${id}`,v.road||'#aa9270');
    const rock=makeMat(s,`GAME2_Rock_${id}`,v.rock||'#6f7a75');
    const water=makeMat(s,`GAME2_Water_${id}`,v.water||'#389eb8',.78,'#0b333d');
    const accent=makeMat(s,`GAME2_Accent_${id}`,v.accent||'#dfc27e');

    const tex=window.GRASS_LUSH_TEXTURE||(window.GROUND_TEXTURE_ACTIVE&&window.GROUND_TEXTURE_ACTIVE.data);
    if(tex&&!v.cave){
      try{
        const t=new BABYLON.Texture(tex,s,false,true);
        t.uScale=16;
        t.vScale=16;
        grass.diffuseTexture=t;
      }catch(_){}
    }
    for(const m of [grass,road,rock,water,accent]){
      if(m&&m.freeze)m.freeze();
    }
    const m={grass,road,rock,water,accent,...this.shared};
    this.byZone.set(id,m);
    return m;
  }

  // --- Procedural 3D Tiên Hiệp Props ---

  createPeachTree(s,parent,x,z,scale=1){
    const root=new BABYLON.TransformNode('PeachTree',s);
    root.position.set(x,0,z);
    root.scaling.setAll(scale);
    root.parent=parent;
    // Trunk
    const trunk=BABYLON.MeshBuilder.CreateCylinder('Trunk',{height:2.8,diameterBottom:0.5,diameterTop:0.25,tessellation:7},s);
    trunk.position.y=1.4;
    trunk.rotation.z=0.12;
    trunk.material=this.shared.pineBark;
    trunk.parent=root;
    // Foliage Clusters
    const f1=BABYLON.MeshBuilder.CreateSphere('Foliage1',{diameter:2.2,segments:6},s);
    f1.position.set(0.2,2.8,0);
    f1.scaling.set(1.1,0.7,1.1);
    f1.material=this.shared.peachBlossom;
    f1.parent=root;

    const f2=BABYLON.MeshBuilder.CreateSphere('Foliage2',{diameter:1.6,segments:5},s);
    f2.position.set(-0.7,2.3,0.4);
    f2.scaling.set(1,0.6,1);
    f2.material=this.shared.peachBlossom;
    f2.parent=root;

    const f3=BABYLON.MeshBuilder.CreateSphere('Foliage3',{diameter:1.5,segments:4},s);
    f3.position.set(0.6,2.4,-0.3);
    f3.scaling.set(1,0.6,1);
    f3.material=this.shared.peachBlossom;
    f3.parent=root;
    return this.freezeNode(root);
  }

  createPineTree(s,parent,x,z,scale=1){
    const root=new BABYLON.TransformNode('PineTree',s);
    root.position.set(x,0,z);
    root.scaling.setAll(scale);
    root.parent=parent;
    // Trunk
    const trunk=BABYLON.MeshBuilder.CreateCylinder('Trunk',{height:3.5,diameterBottom:0.45,diameterTop:0.2,tessellation:6},s);
    trunk.position.y=1.75;
    trunk.material=this.shared.pineBark;
    trunk.parent=root;
    // Tiered Pine Foliage
    for(let i=0;i<3;i++){
      const c=BABYLON.MeshBuilder.CreateCylinder(`PineTier_${i}`,{height:1.4,diameterBottom:2.8-i*0.7,diameterTop:0.1,tessellation:6},s);
      c.position.y=2.2+i*1.1;
      c.material=this.shared.pineFoliage;
      c.parent=root;
    }
    return this.freezeNode(root);
  }

  createBambooCluster(s,parent,x,z,count=4){
    const root=new BABYLON.TransformNode('BambooCluster',s);
    root.position.set(x,0,z);
    root.parent=parent;
    for(let i=0;i<count;i++){
      const bx=(Math.random()-0.5)*1.8,bz=(Math.random()-0.5)*1.8,bh=4.2+Math.random()*1.5;
      const stem=BABYLON.MeshBuilder.CreateCylinder(`BambooStem_${i}`,{height:bh,diameter:0.12,tessellation:5},s);
      stem.position.set(bx,bh/2,bz);
      stem.rotation.z=(Math.random()-0.5)*0.08;
      stem.material=this.shared.bambooStem;
      stem.parent=root;
      // Leaf puffs
      const leaf=BABYLON.MeshBuilder.CreateSphere(`BambooLeaf_${i}`,{diameter:1.2,segments:4},s);
      leaf.position.set(bx,bh-0.3,bz);
      leaf.scaling.set(1.2,0.5,1.2);
      leaf.material=this.shared.bambooLeaf;
      leaf.parent=root;
    }
    return this.freezeNode(root);
  }

  createRockCluster(s,parent,x,z,scale=1){
    const root=new BABYLON.TransformNode('RockCluster',s);
    root.position.set(x,0,z);
    root.scaling.setAll(scale);
    root.parent=parent;
    const r1=BABYLON.MeshBuilder.CreatePolyhedron('Rock1',{type:1,size:1.1},s);
    r1.position.set(0,0.6,0);
    r1.rotation.set(0.4,1.1,0.2);
    r1.scaling.set(1.4,0.9,1.1);
    r1.material=this.shared.rock;
    r1.parent=root;

    const r2=BABYLON.MeshBuilder.CreatePolyhedron('Rock2',{type:1,size:0.6},s);
    r2.position.set(0.8,0.3,0.5);
    r2.rotation.set(1.2,0.3,0.8);
    r2.material=this.shared.rock;
    r2.parent=root;
    return this.freezeNode(root);
  }

  createStoneLantern(s,parent,x,z){
    const root=new BABYLON.TransformNode('StoneLantern',s);
    root.position.set(x,0,z);
    root.parent=parent;
    // Base
    const base=BABYLON.MeshBuilder.CreateCylinder('LBase',{height:0.3,diameter:0.6,tessellation:6},s);
    base.position.y=0.15;
    base.material=this.shared.stoneBorder;
    base.parent=root;
    // Pillar
    const pillar=BABYLON.MeshBuilder.CreateCylinder('LPillar',{height:1.2,diameter:0.25,tessellation:6},s);
    pillar.position.y=0.85;
    pillar.material=this.shared.stoneBorder;
    pillar.parent=root;
    // Light Core
    const core=BABYLON.MeshBuilder.CreateBox('LCore',{size:0.42},s);
    core.position.y=1.55;
    core.material=this.shared.lanternGold;
    core.parent=root;
    // Pagoda Cap
    const cap=BABYLON.MeshBuilder.CreateCylinder('LCap',{height:0.35,diameterBottom:0.85,diameterTop:0.1,tessellation:4},s);
    cap.position.y=1.85;
    cap.material=this.shared.roofJade;
    cap.parent=root;
    return this.freezeNode(root);
  }

  // 1. Quảng Trường Thanh Vân — Thanh Vân Linh Thạch (Center 0, 0)
  createThanhVanLinhThach(s,parent,x,z){
    const root=new BABYLON.TransformNode('ThanhVanLinhThach',s);
    root.position.set(x,0,z);
    root.parent=parent;

    // Elegant Low-Profile Paved Spiritual Platform (Quảng trường phẳng rộng, sạch đẹp)
    const dais=BABYLON.MeshBuilder.CreateCylinder('LTDais',{height:0.08,diameter:5.6,tessellation:24},s);
    dais.position.y=0.04;
    dais.material=this.shared.patternedGrayStone;
    dais.parent=root;

    // Outer Decorative Gold Trim
    const ring=BABYLON.MeshBuilder.CreateTorus('LTRing',{diameter:5.2,thickness:0.06,tessellation:24},s);
    ring.position.y=0.08;
    ring.material=this.shared.goldTrim;
    ring.parent=root;

    // Center Spirit Crystal Monolith
    const crystal=BABYLON.MeshBuilder.CreateCylinder('LTCrystal',{height:2.2,diameterBottom:0.7,diameterTop:0.2,tessellation:6},s);
    crystal.position.y=1.1;
    crystal.material=this.shared.spiritCrystal;
    crystal.parent=root;

    return this.freezeNode(root);
  }

  // 2. Bắc Thôn — Đại Điện Thanh Vân (0, 38)
  createThanhVanPalace(s,parent,x,z){
    const root=new BABYLON.TransformNode('ThanhVanPalace',s);
    root.position.set(x,0,z);
    root.parent=parent;

    const width=14,depth=10,height=5.2;

    // Grand Stone Base & Stairs
    const base=BABYLON.MeshBuilder.CreateBox('PalaceBase',{width:width+2,height:0.8,depth:depth+2},s);
    base.position.y=0.4;
    base.material=this.shared.patternedGrayStone;
    base.parent=root;

    const stairs=BABYLON.MeshBuilder.CreateBox('PalaceStairs',{width:5.5,height:0.4,depth:2.5},s);
    stairs.position.set(0,0.2,-depth/2-1.2);
    stairs.material=this.shared.grayStoneDark;
    stairs.parent=root;

    // White Plaster Main Hall
    const hall=BABYLON.MeshBuilder.CreateBox('PalaceHall',{width,height,depth},s);
    hall.position.y=height/2+0.8;
    hall.material=this.shared.wallPlaster;
    hall.parent=root;

    // 8 Lacquer Red / Dark Wood Pillars
    const pillX=[-width/2+0.8,-width/4,width/4,width/2-0.8];
    for(const px of pillX){
      for(const pz of [-depth/2+0.6,depth/2-0.6]){
        const col=BABYLON.MeshBuilder.CreateCylinder('Pillar',{height:height+0.4,diameter:0.45,tessellation:8},s);
        col.position.set(px,height/2+0.8,pz);
        col.material=this.shared.roofRed;
        col.parent=root;
      }
    }

    // 2-Tier Grand Curved Pagoda Jade Roof
    const roof1=BABYLON.MeshBuilder.CreateCylinder('PRoof1',{height:1.6,diameterBottom:width+3.5,diameterTop:width*0.5,tessellation:4},s);
    roof1.position.y=height+1.5;
    roof1.rotation.y=Math.PI/4;
    roof1.material=this.shared.roofJade;
    roof1.parent=root;

    const roof2=BABYLON.MeshBuilder.CreateCylinder('PRoof2',{height:1.4,diameterBottom:width*0.7,diameterTop:width*0.15,tessellation:4},s);
    roof2.position.y=height+2.8;
    roof2.rotation.y=Math.PI/4;
    roof2.material=this.shared.roofJade;
    roof2.parent=root;

    // Hanging Banners / Pennants
    for(const bx of [-2.4,2.4]){
      const banner=BABYLON.MeshBuilder.CreateBox('Banner',{width:0.6,height:2.8,depth:0.05},s);
      banner.position.set(bx,height-0.6,-depth/2-0.1);
      banner.material=this.shared.roofRed;
      banner.parent=root;
    }

    // Flanking Stone Lanterns
    this.createStoneLantern(s,root,-3.2,-depth/2-1.4);
    this.createStoneLantern(s,root,3.2,-depth/2-1.4);

    // Ancient Blossoming Peach Tree on the side
    this.createPeachTree(s,root,width/2+3.5,2,1.65);

    return this.freezeNode(root);
  }

  // 3. Đông Thôn — Thanh Vân Phường Thị (36, 12)
  createMarketStreet(s,parent,cx,cz){
    const root=new BABYLON.TransformNode('ThanhVanMarketStreet',s);
    root.position.set(cx,0,cz);
    root.parent=parent;

    // Central Commercial Guild House
    const shopHouse=this.createPagodaBuilding(s,root,8,0,'GuildHouse','roofRed',7,6,4.2);

    // 4 Market Stalls along the street
    const s1=this.createMarketStall(s,root,-3,-6); // Tạp Hóa
    const s2=this.createMarketStall(s,root,3,-6);  // Dược Liệu
    const s3=this.createMarketStall(s,root,-3,6);  // Trang Bị
    const s4=this.createMarketStall(s,root,3,6);   // Thu Mua

    // Baskets, barrels & lanterns
    for(const bx of [-6,6]){
      const crate=BABYLON.MeshBuilder.CreateBox('MCrate',{size:0.7},s);
      crate.position.set(bx,0.35,0);
      crate.material=this.shared.darkWood;
      crate.parent=root;
    }
    return this.freezeNode(root);
  }

  // 4. Đông Nam — Lò Rèn Thanh Vân (32, -28)
  createBlacksmithForge(s,parent,x,z){
    const root=new BABYLON.TransformNode('BlacksmithForge',s);
    root.position.set(x,0,z);
    root.parent=parent;

    // Open Timber Workshop Canopy
    const canopy=BABYLON.MeshBuilder.CreateCylinder('ForgeRoof',{height:0.8,diameterBottom:8.5,diameterTop:7.2,tessellation:4},s);
    canopy.position.y=3.6;
    canopy.rotation.y=Math.PI/4;
    canopy.material=this.shared.grayStoneDark;
    canopy.parent=root;

    for(const px of [-3.2,3.2]){
      for(const pz of [-3.2,3.2]){
        const post=BABYLON.MeshBuilder.CreateCylinder('FPost',{height:3.6,diameter:0.3,tessellation:6},s);
        post.position.set(px,1.8,pz);
        post.material=this.shared.darkWood;
        post.parent=root;
      }
    }

    // Blast Furnace & Stone Chimney
    const furnace=BABYLON.MeshBuilder.CreateBox('Furnace',{width:2.2,height:2.6,depth:2.2},s);
    furnace.position.set(-1.8,1.3,1.8);
    furnace.material=this.shared.patternedGrayStone;
    furnace.parent=root;

    const fireCore=BABYLON.MeshBuilder.CreateSphere('FireCore',{diameter:0.9,segments:5},s);
    fireCore.position.set(-1.8,1.1,1.0);
    fireCore.material=this.shared.lanternGold;
    fireCore.parent=root;

    const chimney=BABYLON.MeshBuilder.CreateCylinder('Chimney',{height:2.4,diameter:0.7,tessellation:6},s);
    chimney.position.set(-1.8,3.8,1.8);
    chimney.material=this.shared.grayStoneDark;
    chimney.parent=root;

    // Heavy Iron Anvil on Oak Stump
    const stump=BABYLON.MeshBuilder.CreateCylinder('Stump',{height:0.7,diameter:0.9,tessellation:6},s);
    stump.position.set(0.6,0.35,-0.4);
    stump.material=this.shared.darkWood;
    stump.parent=root;

    const anvil=BABYLON.MeshBuilder.CreateBox('Anvil',{width:0.8,height:0.45,depth:0.4},s);
    anvil.position.set(0.6,0.9,-0.4);
    anvil.material=this.shared.grayStoneDark;
    anvil.parent=root;

    // Weapon Rack
    const rack=BABYLON.MeshBuilder.CreateBox('Rack',{width:2.4,height:1.6,depth:0.3},s);
    rack.position.set(2.4,0.8,1.8);
    rack.material=this.shared.darkWood;
    rack.parent=root;

    // Quenching Water Barrel
    const barrel=BABYLON.MeshBuilder.CreateCylinder('Barrel',{height:0.9,diameter:0.75,tessellation:6},s);
    barrel.position.set(-0.6,0.45,-1.8);
    barrel.material=this.shared.wood;
    barrel.parent=root;

    return this.freezeNode(root);
  }

  // 5. Tây Nam — Đan Các / Dược Phường (-30, -30)
  createAlchemySanctuary(s,parent,x,z){
    const root=new BABYLON.TransformNode('AlchemySanctuary',s);
    root.position.set(x,0,z);
    root.parent=parent;

    // Quiet Daoist Apothecary Lodge
    const lodge=this.createPagodaBuilding(s,root,0,4,'ApothecaryLodge','roofJade',7,5,3.8);

    // Giant Bronze Eight-Trigram Crucible (Đan Lô)
    const danLo=BABYLON.MeshBuilder.CreateCylinder('DanLo',{height:2.2,diameterBottom:1.6,diameterTop:1.1,tessellation:8},s);
    danLo.position.set(0,1.1,-2.4);
    danLo.material=this.shared.incenseBronze;
    danLo.parent=root;

    const lid=BABYLON.MeshBuilder.CreateCylinder('DanLoLid',{height:0.5,diameterBottom:1.3,diameterTop:0.3,tessellation:8},s);
    lid.position.set(0,2.4,-2.4);
    lid.material=this.shared.goldTrim;
    lid.parent=root;

    // Bamboo Drying Racks
    const rack1=BABYLON.MeshBuilder.CreateBox('HerbRack1',{width:2.5,height:1.5,depth:0.6},s);
    rack1.position.set(-3.5,0.75,-1.5);
    rack1.material=this.shared.bambooStem;
    rack1.parent=root;

    const rack2=BABYLON.MeshBuilder.CreateBox('HerbRack2',{width:2.5,height:1.5,depth:0.6},s);
    rack2.position.set(3.5,0.75,-1.5);
    rack2.material=this.shared.bambooStem;
    rack2.parent=root;

    // Medicine Jars & Gourds
    const jar=BABYLON.MeshBuilder.CreateCylinder('MedJar',{height:0.55,diameter:0.45},s);
    jar.position.set(1.6,0.3,-2.8);
    jar.material=this.shared.patternedGrayStone;
    jar.parent=root;

    // Bamboo grove & Peach tree
    this.createBambooCluster(s,root,-4.8,2,4);
    this.createPeachTree(s,root,4.8,2,1.2);

    return this.freezeNode(root);
  }

  // 6. Tây Thôn — Đài Tĩnh Tu (-36, 10)
  createCultivationSanctuary(s,parent,x,z){
    const root=new BABYLON.TransformNode('CultivationSanctuary',s);
    root.position.set(x,0,z);
    root.parent=parent;

    // 3-tiered white lotus marble dais
    for(let i=0;i<3;i++){
      const tier=BABYLON.MeshBuilder.CreateCylinder(`Dais_${i}`,{height:0.35,diameter:6.8-i*1.2,tessellation:12},s);
      tier.position.y=0.18+i*0.35;
      tier.material=i===1?this.shared.patternedGrayStone:this.shared.wallPlaster;
      tier.parent=root;
    }

    // Central Lotus Meditation Mat
    const mat=BABYLON.MeshBuilder.CreateCylinder('LotusMat',{height:0.15,diameter:2.4,tessellation:12},s);
    mat.position.y=1.15;
    mat.material=this.shared.goldTrim;
    mat.parent=root;

    // 4 Surrounding Spirit Crystal Pillars
    const angles=[0,Math.PI/2,Math.PI,Math.PI*1.5];
    for(let i=0;i<4;i++){
      const a=angles[i],cx=Math.cos(a)*3.6,cz=Math.sin(a)*3.6;
      const pil=BABYLON.MeshBuilder.CreateCylinder(`CrystalPil_${i}`,{height:2.8,diameterBottom:0.4,diameterTop:0.1,tessellation:6},s);
      pil.position.set(cx,1.4,cz);
      pil.material=this.shared.spiritCrystal;
      pil.parent=root;
    }

    // Blossoming Ancient Peach Tree Behind the Altar
    this.createPeachTree(s,root,0,-4.5,1.5);

    return this.freezeNode(root);
  }

  // 7. Tây Bắc — Linh Thú Viên (-32, 36)
  createBeastSanctuary(s,parent,x,z){
    const root=new BABYLON.TransformNode('BeastSanctuary',s);
    root.position.set(x,0,z);
    root.parent=parent;

    // Wooden Stables / Shelter Shed
    const shed=this.createPagodaBuilding(s,root,0,-3.5,'BeastShed','roofRed',6,4.5,3.2);

    // Wooden Corral Fence (Hàng rào chuồng trại)
    const fencePosts=[[-4.5,-2],[4.5,-2],[-4.5,3.5],[4.5,3.5],[-4.5,0],[4.5,0],[0,3.5]];
    for(let i=0;i<fencePosts.length;i++){
      const fp=fencePosts[i];
      const post=BABYLON.MeshBuilder.CreateCylinder(`FPost_${i}`,{height:1.4,diameter:0.18,tessellation:6},s);
      post.position.set(fp[0],0.7,fp[1]);
      post.material=this.shared.darkWood;
      post.parent=root;
    }

    // Water Trough & Hay
    const trough=BABYLON.MeshBuilder.CreateBox('Trough',{width:2.2,height:0.5,depth:0.9},s);
    trough.position.set(-2,0.25,1.5);
    trough.material=this.shared.grayStoneDark;
    trough.parent=root;

    const hay=BABYLON.MeshBuilder.CreateCylinder('Hay',{height:0.8,diameter:1.2,tessellation:8},s);
    hay.position.set(2.2,0.4,1.5);
    hay.material=this.shared.goldTrim;
    hay.parent=root;

    return this.freezeNode(root);
  }

  // 8. Nam Thôn — Khu Nhà Dân (Residential Hamlet around 0, -36)
  createResidentialHamlet(s,parent,cx,cz){
    const root=new BABYLON.TransformNode('ResidentialHamlet',s);
    root.position.set(cx,0,cz);
    root.parent=parent;

    // 6-8 Varied Small Houses comfortably inside village walls
    const houseConfigs=[
      {x:-14,z:5,r:'roofRed',w:5.5,d:4.5,rot:0.15},
      {x:14,z:5,r:'roofJade',w:5.5,d:4.5,rot:-0.2},
      {x:-15,z:-5,r:'roofJade',w:5,d:4.2,rot:0.3},
      {x:15,z:-5,r:'roofRed',w:5.2,d:4.2,rot:-0.25},
      {x:-6,z:-10,r:'roofRed',w:5,d:4,rot:0.05},
      {x:6,z:-10,r:'roofJade',w:5,d:4,rot:-0.1}
    ];

    for(let i=0;i<houseConfigs.length;i++){
      const c=houseConfigs[i];
      const h=this.createPagodaBuilding(s,root,c.x,c.z,`ResHouse_${i}`,c.r,c.w,c.d,3.2);
      h.rotation.y=c.rot;
    }

    // Ancient Stone Water Well (Giếng nước cổ)
    const well=BABYLON.MeshBuilder.CreateCylinder('VillageWell',{height:0.85,diameter:1.5,tessellation:12},s);
    well.position.set(0,0.42,-3);
    well.material=this.shared.patternedGrayStone;
    well.parent=root;

    // Wooden Cart & Firewood
    const cart=BABYLON.MeshBuilder.CreateBox('WoodCart',{width:1.8,height:0.6,depth:1.2},s);
    cart.position.set(3.5,0.3,-3);
    cart.material=this.shared.wood;
    cart.parent=root;

    const woodpile=BABYLON.MeshBuilder.CreateCylinder('WoodPile',{height:1.2,diameter:1.4,tessellation:6},s);
    woodpile.position.set(-3.5,0.6,-3);
    woodpile.rotation.z=Math.PI/2;
    woodpile.material=this.shared.darkWood;
    woodpile.parent=root;

    return this.freezeNode(root);
  }

  // 9. Hồ Thanh Vân — Tiêu Dao Cổ Đình & Cầu Gỗ Cong (-34, -10)
  createThanhVanLakeFeatures(s,parent,cx,cz,radius){
    const root=new BABYLON.TransformNode('ThanhVanLakeFeatures',s);
    root.position.set(cx,0,cz);
    root.parent=parent;

    // Arched Wooden Bridge (Cầu gỗ cong)
    const bridge=BABYLON.MeshBuilder.CreateBox('ArchBridge',{width:2.2,height:0.35,depth:7.5},s);
    bridge.position.set(radius*0.6,0.3,0);
    bridge.rotation.x=0.08;
    bridge.material=this.shared.wood;
    bridge.parent=root;

    // Pagoda Pavilion over the water (Tiêu Dao Cổ Đình)
    const pavilion=this.createPagodaBuilding(s,root,-radius*0.4,radius*0.3,'TieuDaoDinh','roofJade',5,5,3.6);

    // Lotus flowers & shore rocks
    this.createLotusPondDetail(s,root,0,0,radius);

    return this.freezeNode(root);
  }

  createPagodaBuilding(s,parent,x,z,name='House',colorRoof='roofJade',width=6,depth=5,height=3.5){
    const root=new BABYLON.TransformNode(`Building_${name}`,s);
    root.position.set(x,0,z);
    root.parent=parent;
    // Stone foundation
    const base=BABYLON.MeshBuilder.CreateBox('Fdn',{width:width+0.6,height:0.4,depth:depth+0.6},s);
    base.position.y=0.2;
    base.material=this.shared.patternedGrayStone;
    base.parent=root;
    // Plaster Walls
    const wall=BABYLON.MeshBuilder.CreateBox('Wall',{width,height,depth},s);
    wall.position.y=height/2+0.35;
    wall.material=this.shared.wallPlaster;
    wall.parent=root;
    // Wooden corner pillars
    const corners=[[-width/2,-depth/2],[width/2,-depth/2],[-width/2,depth/2],[width/2,depth/2]];
    for(let i=0;i<4;i++){
      const col=BABYLON.MeshBuilder.CreateCylinder(`Col_${i}`,{height:height+0.2,diameter:0.35,tessellation:6},s);
      col.position.set(corners[i][0],height/2+0.35,corners[i][1]);
      col.material=this.shared.darkWood;
      col.parent=root;
    }
    // Tiered Pagoda Roof (curved eaves)
    const roof1=BABYLON.MeshBuilder.CreateCylinder('Roof1',{height:1.4,diameterBottom:Math.max(width,depth)+2.2,diameterTop:Math.max(width,depth)*0.35,tessellation:4},s);
    roof1.position.y=height+1.0;
    roof1.rotation.y=Math.PI/4;
    roof1.material=this.shared[colorRoof]||this.shared.roofJade;
    roof1.parent=root;

    // Hanging lanterns on corners
    for(let i=0;i<2;i++){
      const l=BABYLON.MeshBuilder.CreateSphere(`Lantern_${i}`,{diameter:0.4,segments:5},s);
      l.position.set(corners[i][0]*1.15,height+0.1,corners[i][1]*1.15);
      l.material=this.shared.lanternRed;
      l.parent=root;
    }
    return this.freezeNode(root);
  }

  createMarketStall(s,parent,x,z){
    const root=new BABYLON.TransformNode('MarketStall',s);
    root.position.set(x,0,z);
    root.parent=parent;
    // Wooden counter table
    const table=BABYLON.MeshBuilder.CreateBox('Table',{width:3.2,height:0.9,depth:1.4},s);
    table.position.y=0.45;
    table.material=this.shared.wood;
    table.parent=root;
    // 4 Canopy Posts
    for(const px of [-1.5,1.5]){
      for(const pz of [-0.6,0.6]){
        const post=BABYLON.MeshBuilder.CreateCylinder('Post',{height:2.4,diameter:0.1,tessellation:5},s);
        post.position.set(px,1.2,pz);
        post.material=this.shared.darkWood;
        post.parent=root;
      }
    }
    // Cloth Canopy Roof
    const canopy=BABYLON.MeshBuilder.CreateCylinder('Canopy',{height:0.6,diameterBottom:3.8,diameterTop:3.2,tessellation:4},s);
    canopy.position.y=2.4;
    canopy.scaling.set(1,0.5,0.7);
    canopy.material=this.shared.roofRed;
    canopy.parent=root;
    // Goods / Jars / Crates
    const c1=BABYLON.MeshBuilder.CreateBox('Crate1',{size:0.5},s);
    c1.position.set(-0.8,1.15,0);
    c1.material=this.shared.darkWood;
    c1.parent=root;
    const j1=BABYLON.MeshBuilder.CreateCylinder('Jar1',{height:0.4,diameter:0.3},s);
    j1.position.set(0.6,1.1,0.2);
    j1.material=this.shared.goldTrim;
    j1.parent=root;
    return this.freezeNode(root);
  }

  createVillageGate(s,parent,x,z,isMainGate=false){
    const root=new BABYLON.TransformNode('VillageGate',s);
    root.position.set(x,0,z);
    root.parent=parent;
    const span=isMainGate?5.5:4.2;
    // 2 Grand Pillars
    for(const px of [-span,span]){
      const col=BABYLON.MeshBuilder.CreateCylinder('GateCol',{height:5.2,diameter:0.75,tessellation:6},s);
      col.position.set(px,2.6,0);
      col.material=this.shared.roofRed;
      col.parent=root;
    }
    // Cross Beam
    const beam=BABYLON.MeshBuilder.CreateBox('GateBeam',{width:span*2+1.8,height:0.65,depth:0.85},s);
    beam.position.set(0,5.0,0);
    beam.material=this.shared.goldTrim;
    beam.parent=root;
    // Gate Pagoda Roof
    const roof=BABYLON.MeshBuilder.CreateCylinder('GateRoof',{height:1.2,diameterBottom:span*2+2.8,diameterTop:span*1.2,tessellation:4},s);
    roof.position.set(0,5.8,0);
    roof.scaling.set(1,0.5,0.45);
    roof.material=this.shared.roofJade;
    roof.parent=root;
    return this.freezeNode(root);
  }

  createLotusPondDetail(s,parent,cx,cz,radius){
    const root=new BABYLON.TransformNode('LotusPondDetail',s);
    root.position.set(cx,0,cz);
    root.parent=parent;
    for(let i=0;i<6;i++){
      const a=(i/6)*TAU+Math.random()*0.4,dist=(0.25+Math.random()*0.6)*radius;
      const lx=Math.cos(a)*dist,lz=Math.sin(a)*dist;
      const pad=BABYLON.MeshBuilder.CreateDisc(`Pad_${i}`,{radius:0.75+Math.random()*0.3,tessellation:10},s);
      pad.position.set(lx,0.06,lz);
      pad.rotation.x=Math.PI/2;
      pad.material=this.shared.lotusPad;
      pad.parent=root;
      if(i%2===0){
        const flower=BABYLON.MeshBuilder.CreateSphere(`Lotus_${i}`,{diameter:0.48,segments:4},s);
        flower.position.set(lx,0.22,lz);
        flower.material=this.shared.lotusFlower;
        flower.parent=root;
      }
    }
    for(let i=0;i<8;i++){
      const a=(i/8)*TAU,rx=Math.cos(a)*(radius+0.4),rz=Math.sin(a)*(radius+0.4);
      const rock=BABYLON.MeshBuilder.CreatePolyhedron(`ShoreRock_${i}`,{type:1,size:0.8+Math.random()*0.5},s);
      rock.position.set(rx,0.3,rz);
      rock.rotation.set(Math.random()*3,Math.random()*3,0);
      rock.material=this.shared.rock;
      rock.parent=root;
    }
    return this.freezeNode(root);
  }

  // --- Ancient Village Curved Fortress Wall & 4 Pagoda Gates ---
  buildVillageStoneWall(s,parent,cx,cz,size,chunkKey){
    if(Math.abs(cx)>size*.6||Math.abs(cz)>size*.6)return;
    const root=new BABYLON.TransformNode('ThanhVanCurvedStoneWall',s);
    root.parent=parent;

    const rx=44, rz=54, ox=0, oz=-5;

    // 1. Four Grand Pagoda Gates at the 4 Cardinal entrances
    const gates=[
      {name:'NorthGate',gx:ox,gz:oz+rz,rotY:0},
      {name:'SouthGate',gx:ox,gz:oz-rz,rotY:0},
      {name:'EastGate',gx:ox+rx,gz:oz,rotY:Math.PI/2},
      {name:'WestGate',gx:ox-rx,gz:oz,rotY:Math.PI/2}
    ];
    for(const g of gates){
      this.createVillageCurvedGate(s,root,g.gx,g.gz,g.rotY,g.name);
    }

    // 2. Four Octagonal Stone Watchtowers at the 4 curve shoulders
    const shoulders=[
      {name:'Tower_NE',sx:ox+rx*Math.cos(Math.PI/4),sz:oz+rz*Math.sin(Math.PI/4)},
      {name:'Tower_NW',sx:ox+rx*Math.cos(3*Math.PI/4),sz:oz+rz*Math.sin(3*Math.PI/4)},
      {name:'Tower_SW',sx:ox+rx*Math.cos(5*Math.PI/4),sz:oz+rz*Math.sin(5*Math.PI/4)},
      {name:'Tower_SE',sx:ox+rx*Math.cos(7*Math.PI/4),sz:oz+rz*Math.sin(7*Math.PI/4)}
    ];
    for(const t of shoulders){
      this.createWatchTower(s,root,t.sx,t.sz);
    }

    // 3. Four Smooth Curved Wall Arcs connecting between Gates
    const arcs=[
      {name:'Arc_NE',a1:0.078,a2:1.475,steps:8},
      {name:'Arc_NW',a1:1.666,a2:3.064,steps:8},
      {name:'Arc_SW',a1:3.220,a2:4.617,steps:8},
      {name:'Arc_SE',a1:4.808,a2:6.205,steps:8}
    ];

    for(const arc of arcs){
      const dTheta=(arc.a2-arc.a1)/arc.steps;
      for(let i=0;i<arc.steps;i++){
        const th1=arc.a1+i*dTheta, th2=arc.a1+(i+1)*dTheta;
        const x1=ox+rx*Math.cos(th1), z1=oz+rz*Math.sin(th1);
        const x2=ox+rx*Math.cos(th2), z2=oz+rz*Math.sin(th2);
        this.createCurvedWallPiece(s,root,x1,z1,x2,z2,`${arc.name}_${i}`);
      }
    }

    return this.freezeNode(root);
  }

  createCurvedWallPiece(s,parent,x1,z1,x2,z2,name='WallPiece'){
    const mx=(x1+x2)/2, mz=(z1+z2)/2;
    const len=Math.hypot(x2-x1,z2-z1);
    const angle=Math.atan2(x2-x1,z2-z1);

    const root=new BABYLON.TransformNode(name,s);
    root.position.set(mx,0,mz);
    root.rotation.y=angle;
    root.parent=parent;

    // 1. Sturdy Stone Foundation Plinth
    const fdn=BABYLON.MeshBuilder.CreateBox('Fdn',{width:1.4,height:0.5,depth:len+0.12},s);
    fdn.position.y=0.25;
    fdn.material=this.shared.grayStoneDark;
    fdn.parent=root;

    // 2. Main Wall Body (Dark Stone with cloud relief texture)
    const body=BABYLON.MeshBuilder.CreateBox('Body',{width:0.85,height:2.4,depth:len+0.04},s);
    body.position.y=1.45;
    body.material=this.shared.grayStoneDark;
    body.parent=root;

    // 3. Jade Tiled Wall Cap / Coping
    const roof=BABYLON.MeshBuilder.CreateBox('Roof',{width:1.45,height:0.38,depth:len+0.18},s);
    roof.position.y=2.75;
    roof.material=this.shared.roofJade;
    roof.parent=root;

    return root;
  }

  createVillageCurvedGate(s,parent,gx,gz,rotY,name='CurvedGate'){
    const gateRoot=new BABYLON.TransformNode(name,s);
    gateRoot.position.set(gx,0,gz);
    gateRoot.rotation.y=rotY;
    gateRoot.parent=parent;

    const span=4.2;
    // Two Grand Crimson Gate Columns
    for(const px of [-span,span]){
      const pBase=BABYLON.MeshBuilder.CreateCylinder(`GBase_${px}`,{height:0.6,diameter:1.2,tessellation:8},s);
      pBase.position.set(px,0.3,0);
      pBase.material=this.shared.patternedGrayStone;
      pBase.parent=gateRoot;

      const col=BABYLON.MeshBuilder.CreateCylinder(`GCol_${px}`,{height:4.6,diameter:0.65,tessellation:8},s);
      col.position.set(px,2.6,0);
      col.material=this.shared.roofRed;
      col.parent=gateRoot;

      // Stone Lantern in front of pillar
      this.createStoneLantern(s,gateRoot,px,-1.2);
    }

    // Grand Timber Crossbeam
    const arch=BABYLON.MeshBuilder.CreateBox('GArch',{width:span*2+1.8,height:0.6,depth:1.6},s);
    arch.position.set(0,4.8,0);
    arch.material=this.shared.darkWood;
    arch.parent=gateRoot;

    // Grand Jade Pagoda Roof
    const gRoof=BABYLON.MeshBuilder.CreateCylinder('GRoof',{height:1.2,diameterBottom:span*2+2.8,diameterTop:span*1.4,tessellation:4},s);
    gRoof.position.set(0,5.6,0);
    gRoof.rotation.y=Math.PI/4;
    gRoof.material=this.shared.roofJade;
    gRoof.parent=gateRoot;

    return gateRoot;
  }


  // --- Main Chunk Builder ---

  buildChunk({zone,chunkKey,cx,cz,size,signal}={}){
    if(signal?.aborted)return null;
    const s=this.scene,m=this.mats(zone),root=new BABYLON.TransformNode(`WorldChunk_${zone.id}_${chunkKey}`,s);
    tag(root,{zoneId:zone.id,chunkKey,kind:'CHUNK_ROOT',cullRadius:size*2});

    // 1. Terrain Ground
    const ground=BABYLON.MeshBuilder.CreateGround(`Ground_${zone.id}_${chunkKey}`,{width:size,height:size,subdivisions:1},s);
    ground.position.set(cx,0,cz);
    ground.parent=root;
    ground.material=m.grass;
    ground.receiveShadows=true;
    ground.isPickable=true;
    tag(ground,{zoneId:zone.id,chunkKey,kind:'TERRAIN',cullRadius:size*2.5,walkable:true});

    // 2. Roads & Pathways (Dirt/Cobblestone paths without plain white box overlays)
    for(const r of zone.terrain?.roads||[]){
      const mx=(r.a.x+r.b.x)/2,mz=(r.a.z+r.b.z)/2;
      if(Math.abs(mx-cx)>size*.85||Math.abs(mz-cz)>size*.85)continue;
      const len=Math.hypot(r.b.x-r.a.x,r.b.z-r.a.z);
      const mesh=BABYLON.MeshBuilder.CreateBox(`Road_${zone.id}_${chunkKey}_${r.id}`,{width:r.width,height:.03,depth:len},s);
      mesh.position.set(mx,.035,mz);
      mesh.rotation.y=Math.atan2(r.b.x-r.a.x,r.b.z-r.a.z);
      mesh.parent=root;
      mesh.material=this.shared.stonePaver;
      mesh.isPickable=false;
      tag(mesh,{zoneId:zone.id,chunkKey,kind:'ROAD',cullRadius:size*2});
    }

    // 3. Water Pond / Springs
    for(const w of zone.terrain?.water||[]){
      if(Math.abs(w.center.x-cx)>size*.85||Math.abs(w.center.z-cz)>size*.85)continue;
      const mesh=BABYLON.MeshBuilder.CreateDisc(`Water_${zone.id}_${chunkKey}_${w.id}`,{radius:w.radius,tessellation:28},s);
      mesh.position.set(w.center.x,.05,w.center.z);
      mesh.rotation.x=Math.PI/2;
      mesh.parent=root;
      mesh.material=m.water;
      mesh.isPickable=false;
      tag(mesh,{zoneId:zone.id,chunkKey,kind:'WATER',cullRadius:size*2});

      // Add rich Lotus Flowers and Rocks
      if(zone.id==='thanh_van_region'||zone.id==='linh_khe_coc_zone'){
        const pondDetails=this.createLotusPondDetail(s,root,w.center.x,w.center.z,w.radius);
        tag(pondDetails,{zoneId:zone.id,chunkKey,kind:'PROP',cullRadius:100});
      }
    }

    // 4. Village Specific Architectural Landmarks & Stone Fortress Wall
    if(zone.id==='thanh_van_region'){
      // --- Ancient Stone Fortress Wall enclosing ALL village buildings ---
      const wall=this.buildVillageStoneWall(s,root,cx,cz,size,chunkKey);
      if(wall)tag(wall,{zoneId:zone.id,chunkKey,kind:'WALL',cullRadius:160,blocksSpawn:true});

      // 0. Ancient Village Safe Zone Ground inside Fortress Wall (Texture 18: Sân Thôn Bản Nén - Curved Elliptical Ground)
      if(Math.abs(cx)<size*.6&&Math.abs(cz)<size*.6){
        const vGround=BABYLON.MeshBuilder.CreateDisc('ThanhVanVillageGround',{radius:54,tessellation:72},s);
        vGround.rotation.x=Math.PI/2;
        vGround.scaling.set(44/54,1,1);
        vGround.position.set(0,0.015,-5);
        vGround.parent=root;
        vGround.material=this.shared.villageGround;
        vGround.receiveShadows=true;
        vGround.isPickable=true;
        tag(vGround,{zoneId:zone.id,chunkKey,kind:'TERRAIN',cullRadius:180,walkable:true});
      }

      // 1. Quảng Trường Thanh Vân — Thanh Vân Linh Thạch (Center 0, 0)
      if(Math.abs(cx)<size*.6&&Math.abs(cz)<size*.6){
        const linhThach=this.createThanhVanLinhThach(s,root,0,0);
        tag(linhThach,{zoneId:zone.id,chunkKey,kind:'LANDMARK',cullRadius:150});
      }

      // 2. Bắc Thôn — Đại Điện Thanh Vân (0, 32)
      if(Math.abs(cx)<size*.6&&Math.abs(32-cz)<size*.6){
        const palace=this.createThanhVanPalace(s,root,0,32);
        tag(palace,{zoneId:zone.id,chunkKey,kind:'BUILDING',cullRadius:150,blocksSpawn:true});
      }

      // 3. Đông Bắc — Nhà Khách Đông Các (26, 26)
      if(Math.abs(26-cx)<size*.6&&Math.abs(26-cz)<size*.6){
        const guestLodge=this.createPagodaBuilding(s,root,26,26,'GuestLodge','roofJade',7,6,4);
        tag(guestLodge,{zoneId:zone.id,chunkKey,kind:'BUILDING',cullRadius:140,blocksSpawn:true});
      }

      // 4. Đông Thôn — Thanh Vân Phường Thị / Chợ (28, 0)
      if(Math.abs(28-cx)<size*.6&&Math.abs(cz)<size*.6){
        const market=this.createMarketStreet(s,root,28,0);
        tag(market,{zoneId:zone.id,chunkKey,kind:'BUILDING',cullRadius:140,blocksSpawn:true});
      }

      // 5. Đông Nam — Lò Rèn Thanh Vân (26, -26)
      if(Math.abs(26-cx)<size*.6&&Math.abs(-26-cz)<size*.6){
        const forge=this.createBlacksmithForge(s,root,26,-26);
        tag(forge,{zoneId:zone.id,chunkKey,kind:'BUILDING',cullRadius:130,blocksSpawn:true});
      }

      // 6. Tây Bắc — Linh Thú Viên (Pet Garden) (-26, 26)
      if(Math.abs(-26-cx)<size*.6&&Math.abs(26-cz)<size*.6){
        const beast=this.createBeastSanctuary(s,root,-26,26);
        tag(beast,{zoneId:zone.id,chunkKey,kind:'BUILDING',cullRadius:130,blocksSpawn:true});
      }

      // 7. Tây Thôn — Đài Tĩnh Tu (-28, 0)
      if(Math.abs(-28-cx)<size*.6&&Math.abs(cz)<size*.6){
        const altar=this.createCultivationSanctuary(s,root,-28,0);
        tag(altar,{zoneId:zone.id,chunkKey,kind:'LANDMARK',cullRadius:140,blocksSpawn:true});
      }

      // 8. Tây Nam — Đan Các / Dược Phường (-26, -26)
      if(Math.abs(-26-cx)<size*.6&&Math.abs(-26-cz)<size*.6){
        const alchemy=this.createAlchemySanctuary(s,root,-26,-26);
        tag(alchemy,{zoneId:zone.id,chunkKey,kind:'BUILDING',cullRadius:130,blocksSpawn:true});
      }

      // 9. Nam Thôn — Khu Nhà Dân (0, -42)
      if(Math.abs(cx)<size*.6&&Math.abs(-42-cz)<size*.6){
        const hamlet=this.createResidentialHamlet(s,root,0,-42);
        tag(hamlet,{zoneId:zone.id,chunkKey,kind:'BUILDING',cullRadius:140,blocksSpawn:true});
      }

      // Village Trees & Stone Lanterns (Quảng trường trung tâm |x|<22, |z|<22 hoàn toàn trống trải, rộng thoáng)
      const villageProps=[
        // Outer Corner Peach Trees
        {type:'peach',x:-36,z:14,s:1.2},{type:'peach',x:36,z:14,s:1.2},{type:'peach',x:-36,z:-14,s:1.2},{type:'peach',x:36,z:-14,s:1.2},
        // Outer Pines near Palace & Hamlet
        {type:'pine',x:14,z:38,s:1.3},{type:'pine',x:-14,z:38,s:1.3},{type:'pine',x:14,z:-52,s:1.3},{type:'pine',x:-14,z:-52,s:1.3},
        // Avenue Lanterns leading to buildings
        {type:'lantern',x:3,z:26},{type:'lantern',x:-3,z:26},{type:'lantern',x:3,z:42},{type:'lantern',x:-3,z:42},
        {type:'lantern',x:3,z:-32},{type:'lantern',x:-3,z:-32},{type:'lantern',x:3,z:-54},{type:'lantern',x:-3,z:-54},
        {type:'lantern',x:22,z:3},{type:'lantern',x:22,z:-3},{type:'lantern',x:36,z:3},{type:'lantern',x:36,z:-3},
        {type:'lantern',x:-22,z:3},{type:'lantern',x:-22,z:-3},{type:'lantern',x:-36,z:3},{type:'lantern',x:-36,z:-3},
        // Outer Bamboo Clusters
        {type:'bamboo',x:14,z:26},{type:'bamboo',x:-14,z:26},{type:'bamboo',x:-14,z:-26},{type:'bamboo',x:14,z:-26}
      ];

      for(const p of villageProps){
        if(Math.abs(p.x-cx)>size*.6||Math.abs(p.z-cz)>size*.6)continue;
        let node;
        if(p.type==='peach')node=this.createPeachTree(s,root,p.x,p.z,p.s||1);
        else if(p.type==='pine')node=this.createPineTree(s,root,p.x,p.z,p.s||1);
        else if(p.type==='bamboo')node=this.createBambooCluster(s,root,p.x,p.z,4);
        else if(p.type==='lantern')node=this.createStoneLantern(s,root,p.x,p.z);
        if(node)tag(node,{zoneId:zone.id,chunkKey,kind:'PROP',cullRadius:110});
      }

      // Outer Wilderness Flora outside the Safe Zone Walls
      if(Math.abs(cx)>35||Math.abs(cz)>45){
        const seed=Math.abs(Math.sin(cx*12.9898+cz*78.233)*43758.5453)%1;
        const count=Math.floor(seed*5)+3;
        for(let i=0;i<count;i++){
          const ox=(Math.sin(seed*80+i*33)*0.38)*size;
          const oz=(Math.cos(seed*80+i*37)*0.38)*size;
          const px=cx+ox,pz=cz+oz;
          if(Math.abs(px)<=48&&pz<=52&&pz>=-64)continue; // keep Safe Zone clear
          const kind=(Math.floor(seed*12+i))%4;
          let node;
          if(kind===0)node=this.createPineTree(s,root,px,pz,1.2+seed*0.6);
          else if(kind===1)node=this.createPeachTree(s,root,px,pz,1.1+seed*0.5);
          else if(kind===2)node=this.createBambooCluster(s,root,px,pz,4);
          else node=this.createRockCluster(s,root,px,pz,1.3+seed*0.7);
          if(node)tag(node,{zoneId:zone.id,chunkKey,kind:'PROP',cullRadius:130});
        }
      }
    }

    // Distant Horizon Vista Terrain & Majestic Mountain Skirt (No more void edges)
    if(!zone.visual?.cave&&(Math.abs(cx)<size*.6&&Math.abs(cz)<size*.6)){
      this.createHorizonVista(s,root,zone,m);
    }

    // 5. Bamboo Forest Zone Props
    if(zone.id==='thanh_truc_lam_zone'){
      const bambooCoords=[
        {x:-16,z:-20},{x:16,z:-20},{x:-24,z:0},{x:24,z:0},{x:-18,z:25},{x:18,z:25},{x:-10,z:40},{x:10,z:40}
      ];
      for(const b of bambooCoords){
        if(Math.abs(b.x-cx)<=size*.6&&Math.abs(b.z-cz)<=size*.6){
          const bc=this.createBambooCluster(s,root,b.x,b.z,6);
          tag(bc,{zoneId:zone.id,chunkKey,kind:'PROP',cullRadius:120});
        }
      }
    }

    // 6. Linh Khê Cốc 100x Expanded Open World Flora & Crystals
    if(zone.id==='linh_khe_coc_zone'){
      const seed=Math.abs(Math.sin(cx*12.9898+cz*78.233)*43758.5453)%1;
      const count=Math.floor(seed*4)+2;
      for(let i=0;i<count;i++){
        const ox=(Math.sin(seed*100+i*37)*0.35)*size;
        const oz=(Math.cos(seed*100+i*41)*0.35)*size;
        const px=cx+ox,pz=cz+oz;
        const kindIndex=(Math.floor(seed*10+i))%4;
        let node;
        if(kindIndex===0)node=this.createPineTree(s,root,px,pz,1.2+seed*0.6);
        else if(kindIndex===1)node=this.createPeachTree(s,root,px,pz,1.1+seed*0.5);
        else if(kindIndex===2)node=this.createBambooCluster(s,root,px,pz,4);
        else node=this.createRockCluster(s,root,px,pz,1.3+seed*0.8);
        if(node)tag(node,{zoneId:zone.id,chunkKey,kind:'PROP',cullRadius:120});
      }
    }

    // 7. Generic POI Landmark fallback
    for(const p of zone.pois||[]){
      if(Math.abs(p.position.x-cx)>size*.58||Math.abs(p.position.z-cz)>size*.58||p.type==='WAYPOINT')continue;
      if(zone.id==='thanh_van_region'&&/market|cultivation|hall|garden/i.test(p.id))continue;

      let mesh;
      if(zone.visual?.cave)mesh=BABYLON.MeshBuilder.CreatePolyhedron(`POI_${p.id}`,{type:1,size:2.2},s);
      else if(/altar|shrine/i.test(p.id)){
        const altar=this.createCultivationSanctuary(s,root,p.position.x,p.position.z);
        tag(altar,{zoneId:zone.id,chunkKey,kind:'LANDMARK',cullRadius:130,blocksSpawn:true});
        continue;
      }else{
        mesh=BABYLON.MeshBuilder.CreateCylinder(`POI_${p.id}`,{height:4.2,diameterBottom:2.4,diameterTop:.35,tessellation:7},s);
      }
      if(mesh){
        mesh.position.set(p.position.x,zone.visual?.cave?1.3:2,p.position.z);
        mesh.parent=root;
        mesh.material=/lake|spring/i.test(p.id)?m.water:m.accent;
        mesh.isPickable=false;
        tag(mesh,{zoneId:zone.id,chunkKey,kind:'LANDMARK',cullRadius:130,blocksSpawn:true});
      }
    }

    // 8. Cave Roof
    if(zone.visual?.cave){
      const roof=BABYLON.MeshBuilder.CreateBox(`CaveRoof_${zone.id}_${chunkKey}`,{width:size,height:2,depth:size},s);
      roof.position.set(cx,8,cz);
      roof.parent=root;
      roof.material=m.rock;
      roof.isPickable=false;
      tag(roof,{zoneId:zone.id,chunkKey,kind:'CAVE_ROOF',cullRadius:size*2});
    }

    return{root,dispose:()=>root.dispose(false,false)};
  }



  createWatchTower(s,parent,x,z){
    const root=new BABYLON.TransformNode('WatchTower',s);
    root.position.set(x,0,z);
    root.parent=parent;

    // Tower Stone Base (Sturdy hexagonal bastion with Patterned Gray Stone)
    const baseH=5.5;
    const base=BABYLON.MeshBuilder.CreateCylinder('TowerBase',{height:baseH,diameter:4.8,tessellation:6},s);
    base.position.y=baseH/2;
    base.material=this.shared.patternedGrayStone;
    base.parent=root;

    // Platform Rim with Dark Slate
    const rim=BABYLON.MeshBuilder.CreateCylinder('TowerRim',{height:0.4,diameter:5.4,tessellation:6},s);
    rim.position.y=baseH+0.2;
    rim.material=this.shared.grayStoneDark;
    rim.parent=root;

    // 4 Guard Posts / Pillars
    for(const px of [-1.4,1.4]){
      for(const pz of [-1.4,1.4]){
        const post=BABYLON.MeshBuilder.CreateCylinder('TPost',{height:2.2,diameter:0.25,tessellation:5},s);
        post.position.set(px,baseH+1.3,pz);
        post.material=this.shared.darkWood;
        post.parent=root;
      }
    }

    // Pagoda Roof (Jade Roof)
    const roof=BABYLON.MeshBuilder.CreateCylinder('TRoof',{height:1.2,diameterBottom:5.8,diameterTop:1.2,tessellation:4},s);
    roof.position.y=baseH+2.8;
    roof.rotation.y=Math.PI/4;
    roof.material=this.shared.roofJade;
    roof.parent=root;

    // Hanging Lantern
    const lantern=BABYLON.MeshBuilder.CreateSphere('TLantern',{diameter:0.55,segments:5},s);
    lantern.position.set(0,baseH+1.8,1.6);
    lantern.material=this.shared.lanternRed;
    lantern.parent=root;
    return this.freezeNode(root);
  }

  createHorizonVista(s,parent,zone,m){
    // Vast outer rolling terrain skirt (3000m x 3000m)
    const vista=BABYLON.MeshBuilder.CreateGround(`VistaTerrain_${zone.id}`,{width:3000,height:3000,subdivisions:1},s);
    vista.position.set(0,-0.04,0);
    vista.material=m.grass;
    vista.receiveShadows=false;
    vista.isPickable=true;
    vista.freezeWorldMatrix();
    vista.doNotSerialize=true;
    vista.parent=parent;
    tag(vista,{zoneId:zone.id,kind:'TERRAIN',cullRadius:4000,walkable:true});

    // Ring of Majestic Distant Mountain Peaks on the horizon (Thanh Vân Sơn Mạch xa xăm)
    const numMountains=18,mountainRadius=1100,mountains=[];
    for(let i=0;i<numMountains;i++){
      const a=(i/numMountains)*TAU;
      const mx=Math.cos(a)*(mountainRadius+(i%3)*120);
      const mz=Math.sin(a)*(mountainRadius+((i+1)%3)*120);
      const mh=140+(i%5)*45;
      const mw=280+(i%4)*60;
      const mountain=BABYLON.MeshBuilder.CreateCylinder(`Mountain_${i}`,{height:mh,diameterBottom:mw,diameterTop:10,tessellation:5},s);
      mountain.position.set(mx,mh/2-15,mz);
      mountain.material=m.rock;
      mountain.isPickable=false;
      mountain.doNotSerialize=true;
      mountains.push(mountain);
    }
    try{
      const merged=BABYLON.Mesh.MergeMeshes(mountains,true,true,undefined,false,true);
      if(merged){
        merged.parent=parent;
        merged.material=m.rock;
        merged.freezeWorldMatrix();
        tag(merged,{zoneId:zone.id,kind:'LANDMARK',cullRadius:4000});
      }
    }catch(_){
      for(const mnt of mountains){
        mnt.parent=parent;
        mnt.freezeWorldMatrix();
        tag(mnt,{zoneId:zone.id,kind:'LANDMARK',cullRadius:4000});
      }
    }
  }

  dispose(){
    for(const m of this.byZone.values())for(const x of Object.values(m))x?.dispose?.();
    for(const x of Object.values(this.shared))x?.dispose?.();
    this.byZone.clear();
  }
}

window.EnhancedWorldZoneAssetBuilder=EnhancedWorldZoneAssetBuilder;
})();