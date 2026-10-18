/* Deterministic wilderness, batched vegetation and grid-based click navigation. */
window.ForestWorld=class ForestWorld extends window.MountainWorld {
  constructor(scene){
    super(scene);this.summitCenter={x:0,z:0};this.walkRadius=550;
    this.bounds={minX:-550,maxX:550,minZ:-550,maxZ:550};this.seed=9173;this.cellSize=3;
    this.staticRoots=[];this.streamChunks=new Map();
  }
  random(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296;}
  
  // Natural organic meandering trail curve
  pathX(z){
    return Math.sin(z*0.022)*21.5 
         + Math.sin(z*0.055)*7.5 
         + Math.sin(z*0.125)*2.8 
         + Math.cos(z*0.26)*1.2;
  }
  roadWidthAt(z){
    return 6.4 + Math.sin(z*0.035)*1.2 + Math.sin(z*0.085)*0.5;
  }
  pathDist(x,z){
    return Math.abs(x-this.pathX(z));
  }

  async create(){
    const B=BABYLON;
    
    // 1. Sky texture from the supplied clear-blue asset pack.
    const skybox=B.MeshBuilder.CreateSphere("skyDome",{diameter:400,segments:14,sideOrientation:B.Mesh.DOUBLESIDE},this.scene);
    const skyMat=new B.StandardMaterial("skyMat",this.scene);
    skyMat.backFaceCulling=false;skyMat.disableLighting=true;skyMat.fogEnabled=false;
    const skyTex=new B.Texture('./assets/textures/sky_clear_blue.png',this.scene,false,false);
    skyTex.wrapU=B.Texture.WRAP_ADDRESS_MODE;
    skyMat.emissiveTexture=skyTex;skyMat.freeze();
    skybox.material=skyMat;skybox.isPickable=false;skybox.infiniteDistance=true;

    // 2. One continuous earth surface; vegetation leaves a walkable clearing.
    const groundMat=new B.StandardMaterial('forestGroundMat',this.scene);
    const earthTex=new B.Texture('./assets/textures/forest_earth.png',this.scene);
    earthTex.uScale=48;earthTex.vScale=48;
    earthTex.anisotropicFilteringLevel=8;
    earthTex.wrapU=B.Texture.WRAP_ADDRESS_MODE;earthTex.wrapV=B.Texture.WRAP_ADDRESS_MODE;
    groundMat.diffuseTexture=earthTex;
    groundMat.specularColor=new B.Color3(0.02,0.02,0.02);
    groundMat.freeze();
    this.ground=this.mesh('CreateGround',{width:1200,height:1200,subdivisions:64},0,0,0,groundMat);
    const groundPositions=this.ground.getVerticesData(B.VertexBuffer.PositionKind);
    const groundColors=[];
    for(let i=0;i<groundPositions.length;i+=3){
      const x=groundPositions[i],z=groundPositions[i+2];
      const patches=Math.sin(x*0.036+Math.sin(z*0.018))*Math.cos(z*0.031-x*0.009);
      const fine=Math.sin(x*0.087+z*0.044)*0.5;
      const shade=patches*0.10+fine*0.035;
      groundColors.push(0.95+shade*0.55,0.96+shade*0.8,0.88+shade*0.4,1);
    }
    this.ground.setVerticesData(B.VertexBuffer.ColorKind,groundColors);
    this.ground.isPickable=true;this.ground.metadata={walkable:true};this.ground.freezeWorldMatrix();

    // Grass grows in irregular patches over the earth; the path is simply left bare.
    const meadow=B.MeshBuilder.CreateGround('forestMeadowPatches',{width:1200,height:1200,subdivisions:256},this.scene);
    meadow.position.y=0.012;
    const meadowPositions=meadow.getVerticesData(B.VertexBuffer.PositionKind);
    const meadowColors=[];
    const smoothstep=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
    for(let i=0;i<meadowPositions.length;i+=3){
      const x=meadowPositions[i],z=meadowPositions[i+2];
      const distance=Math.abs(x-this.pathX(z))-this.roadWidthAt(z)*0.5;
      const pathMask=smoothstep((distance-0.15)/3.5);
      const patches=Math.sin(x*0.045+Math.sin(z*0.032))*Math.cos(z*0.053-x*0.018);
      const smallPatches=Math.sin(x*0.13+z*0.08)*Math.cos(z*0.11-x*0.04);
      const density=smoothstep(0.05+patches*0.45+smallPatches*0.18);
      meadowColors.push(1,1,1,pathMask*(0.68+0.3*density));
    }
    meadow.setVerticesData(B.VertexBuffer.ColorKind,meadowColors);
    meadow.hasVertexAlpha=true;
    const meadowMat=new B.StandardMaterial('forestMeadowMat',this.scene);
    const meadowTex=new B.Texture('./assets/textures/forest_floor.png',this.scene);
    meadowTex.uScale=48;meadowTex.vScale=48;
    meadowTex.anisotropicFilteringLevel=8;
    meadowTex.wrapU=B.Texture.WRAP_ADDRESS_MODE;meadowTex.wrapV=B.Texture.WRAP_ADDRESS_MODE;
    meadowMat.diffuseTexture=meadowTex;
    meadowMat.diffuseColor=new B.Color3(0.77,1.0,0.70);
    meadowMat.specularColor=new B.Color3(0.01,0.01,0.01);
    meadowMat.transparencyMode=B.Material.MATERIAL_ALPHABLEND;
    meadowMat.backFaceCulling=false;
    meadow.material=meadowMat;
    meadow.isPickable=false;
    meadow.freezeWorldMatrix();
    meadowMat.freeze();

    // 3. Load All Categorized Stylized Nature MegaKit 3D Models (.glb)
    const load3D=async(subpath)=>{
      try{
        let rootUrl="./assets/nature/";
        let filename=subpath;
        const lastSlash=subpath.lastIndexOf('/');
        if(lastSlash!==-1){
          rootUrl+=subpath.substring(0,lastSlash+1);
          filename=subpath.substring(lastSlash+1);
        }
        const res=await B.SceneLoader.ImportMeshAsync("",rootUrl,filename,this.scene);
        const submeshes=[];
        res.meshes.forEach(m=>{
          if(m.getTotalVertices&&m.getTotalVertices()>0){
            m.isPickable=false;
            m.isVisible=true;
            if(m.material)m.material.freeze();
            submeshes.push(m);
          }
        });
        if(res.meshes[0]){
          res.meshes[0].position.set(0,-9999,0);
        }
        return submeshes;
      }catch(err){
        console.error(`Failed to load ${subpath}:`,err);
        return [];
      }
    };

    const [
      // Trees
      mCommon1, mCommon2, mCommon3, mCommon4, mCommon5,
      mPine1, mPine2, mPine3, mPine4, mPine5,
      mTwisted1, mTwisted2, mTwisted3, mTwisted4,
      mDead1, mDead2, mDead3,
      // Rocks & Paths
      mRock1, mRock2, mRock3,
      mPebbleR1, mPebbleR2, mPebbleR3, mPebbleS1, mPebbleS2,
      mPathR1, mPathR2, mPathR3, mPathWide, mPathS1,
      // Flora & Undergrowth
      mBush, mBushFl, mFern,
      mFl3Grp, mFl4Grp, mFl3Sgl, mFl4Sgl,
      mClover1, mClover2,
      mMushCommon, mMushShelf,
      mGrassTall, mGrassShort, mGrassWispyTall, mGrassWispyShort,
      mPlantBig1, mPlantBig7, mPetal1, mPetal2
    ]=await Promise.all([
      // Trees
      load3D("trees/CommonTree_1.glb"), load3D("trees/CommonTree_2.glb"), load3D("trees/CommonTree_3.glb"), load3D("trees/CommonTree_4.glb"), load3D("trees/CommonTree_5.glb"),
      load3D("trees/Pine_1.glb"), load3D("trees/Pine_2.glb"), load3D("trees/Pine_3.glb"), load3D("trees/Pine_4.glb"), load3D("trees/Pine_5.glb"),
      load3D("trees/TwistedTree_1.glb"), load3D("trees/TwistedTree_2.glb"), load3D("trees/TwistedTree_3.glb"), load3D("trees/TwistedTree_4.glb"),
      load3D("trees/DeadTree_1.glb"), load3D("trees/DeadTree_2.glb"), load3D("trees/DeadTree_3.glb"),
      // Rocks
      load3D("rocks/Rock_Medium_1.glb"), load3D("rocks/Rock_Medium_2.glb"), load3D("rocks/Rock_Medium_3.glb"),
      load3D("rocks/Pebble_Round_1.glb"), load3D("rocks/Pebble_Round_2.glb"), load3D("rocks/Pebble_Round_3.glb"),
      load3D("rocks/Pebble_Square_1.glb"), load3D("rocks/Pebble_Square_2.glb"),
      load3D("rocks/RockPath_Round_Small_1.glb"), load3D("rocks/RockPath_Round_Small_2.glb"), load3D("rocks/RockPath_Round_Small_3.glb"),
      load3D("rocks/RockPath_Round_Wide.glb"), load3D("rocks/RockPath_Square_Small_1.glb"),
      // Flora
      load3D("vegetation/Bush_Common.glb"), load3D("vegetation/Bush_Common_Flowers.glb"), load3D("vegetation/Fern_1.glb"),
      load3D("vegetation/Flower_3_Group.glb"), load3D("vegetation/Flower_4_Group.glb"), load3D("vegetation/Flower_3_Single.glb"), load3D("vegetation/Flower_4_Single.glb"),
      load3D("vegetation/Clover_1.glb"), load3D("vegetation/Clover_2.glb"),
      load3D("vegetation/Mushroom_Common.glb"), load3D("vegetation/Mushroom_Laetiporus.glb"),
      load3D("vegetation/Grass_Common_Tall.glb"), load3D("vegetation/Grass_Common_Short.glb"),
      load3D("vegetation/Grass_Wispy_Tall.glb"), load3D("vegetation/Grass_Wispy_Short.glb"),
      load3D("vegetation/Plant_1_Big.glb"), load3D("vegetation/Plant_7_Big.glb"),
      load3D("vegetation/Petal_1.glb"), load3D("vegetation/Petal_2.glb")
    ]);

    const spawn3D=(parts,name,x,y,z,sx,sy,sz,rotY,rotX=0,rotZ=0,chunk=null)=>{
      if(!parts||!parts.length)return null;
      const root=new B.TransformNode(name,this.scene);
      root.position.set(x,y,z);root.scaling.set(sx,sy,sz);
      root.rotation.set(rotX,rotY,rotZ);
      for(let k=0;k<parts.length;k++){
        const inst=parts[k].createInstance(`${name}_p${k}`);
        inst.parent=root;inst.isPickable=false;inst.doNotSyncBoundingInfo=true;
        if(B.AbstractMesh?.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY)inst.cullingStrategy=B.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
        inst.freezeWorldMatrix();
      }
      root.freezeWorldMatrix();
      if(chunk)chunk.roots.push(root);else this.staticRoots.push({root,x,z});
      return root;
    };

    // =========================================================================
    // 4. SCIENTIFIC ECOLOGICAL DESIGN & LOGICAL LANDSCAPE COMPOSITION
    // =========================================================================

    // --- A. Winding Trail: Border Pebbles & Shoulder Flowers ---
    const borderPebbles=[mPebbleR1,mPebbleR2,mPebbleR3,mPebbleS1,mPebbleS2];
    const pathFlowers=[mFl3Sgl,mFl4Sgl,mClover1,mClover2,mMushCommon];

    // Short grass softens both edges of the cobblestone strip without covering the road.
    const edgeGrass=[mGrassShort,mGrassWispyShort];
    for(let z=-137;z<=137;z+=2.8){
      const dx=this.pathX(z+1.2)-this.pathX(z-1.2);
      const len=Math.hypot(dx,1.2)||1;
      const nx=-1.2/len,nz=dx/len;
      const cx=this.pathX(z),rw=this.roadWidthAt(z);
      for(const side of [-1,1]){
        if(this.random()>0.78)continue;
        const edgeW=side<0
          ?rw*0.5+Math.sin(z*0.25)*0.32+Math.cos(z*0.55)*0.16
          :rw*0.5+Math.cos(z*0.22)*0.34+Math.sin(z*0.52)*0.14;
        const offset=edgeW-0.12+this.random()*0.5;
        const x=cx+side*nx*offset+(this.random()-0.5)*0.25;
        const zz=z+side*nz*offset+(this.random()-0.5)*0.35;
        const sc=1.0+this.random()*0.6;
        const model=edgeGrass[Math.floor(this.random()*edgeGrass.length)];
        spawn3D(model,`road_edge_grass_${z}_${side}`,x,0,zz,sc,sc*0.8,sc,this.random()*Math.PI);
      }
    }

    for(let z=-135;z<=135;z+=3.6){
      const cx=this.pathX(z);
      const halfW=this.roadWidthAt(z)*0.5;
      
      // Flanking pebbles along path shoulder
      if(this.random()<0.65){
        const side=this.random()<0.5?-1:1;
        const pebX=cx+side*(halfW+0.2+this.random()*1.4);
        const pebModel=borderPebbles[Math.floor(this.random()*borderPebbles.length)];
        spawn3D(pebModel,`trail_peb_${z}`,pebX,0.01,z+this.random()*2.5,1.1+this.random()*0.7,0.75,1.1+this.random()*0.7,this.random()*Math.PI);
      }

      // Wildflowers & mushrooms at path margins
      if(this.random()<0.65){
        const side=this.random()<0.5?-1:1;
        const flX=cx+side*(halfW+0.4+this.random()*1.6);
        const flModel=pathFlowers[Math.floor(this.random()*pathFlowers.length)];
        const sc=0.9+this.random()*0.45;
        spawn3D(flModel,`trail_fl_${z}`,flX,0,z+this.random()*2.5,sc,sc,sc,this.random()*Math.PI);
      }
    }

    // --- B. 48 Rock Outcrop Formations (Boulder + Satellite Pebbles + Crevice Flora) ---
    const bigRockModels=[mRock1,mRock2,mRock3];
    const crevicePlants=[mFern,mBushFl,mPlantBig1,mPlantBig7,mMushShelf];

    for(let i=0;i<48;i++){
      const a=this.random()*Math.PI*2;
      const r=12+Math.sqrt(this.random())*125;
      const rx=Math.cos(a)*r, rz=Math.sin(a)*r;
      // Ensure boulder is not directly blocking the center path
      if(this.pathDist(rx,rz)<3.8)continue;

      const mainScale=1.8+this.random()*1.6;
      const rotY=this.random()*Math.PI*2, rotX=(this.random()-0.5)*0.18, rotZ=(this.random()-0.5)*0.18;
      const mainModel=bigRockModels[i%bigRockModels.length];
      spawn3D(mainModel,`rock_outcrop_${i}`,rx,0,rz,mainScale,mainScale*0.9,mainScale,rotY,rotX,rotZ);
      this.obstacles.push({x:rx,z:rz,w:mainScale*1.4,d:mainScale*1.4});

      // 2-4 Satellite pebbles hugging the boulder base
      const pebCount=2+Math.floor(this.random()*3);
      for(let p=0;p<pebCount;p++){
        const pa=rotY+p*(Math.PI*2/pebCount)+this.random()*0.6;
        const pr=mainScale*(0.8+this.random()*0.5);
        const px=rx+Math.cos(pa)*pr, pz=rz+Math.sin(pa)*pr;
        const pModel=borderPebbles[Math.floor(this.random()*borderPebbles.length)];
        spawn3D(pModel,`rock_peb_${i}_${p}`,px,0.01,pz,1.2+this.random()*0.8,0.8,1.2+this.random()*0.8,this.random()*Math.PI);
      }

      // Crevice plant or shelf mushroom growing beside the boulder
      const plantModel=crevicePlants[Math.floor(this.random()*crevicePlants.length)];
      const plantA=rotY+this.random()*Math.PI*2;
      const plantDist=mainScale*0.85;
      spawn3D(plantModel,`rock_plant_${i}`,rx+Math.cos(plantA)*plantDist,0,rz+Math.sin(plantA)*plantDist,1.1+this.random()*0.4,1.1+this.random()*0.4,1.1+this.random()*0.4,this.random()*Math.PI);

      // Grass tufts nestled around rock
      const grassModel=this.random()<0.5?mGrassWispyTall:mGrassTall;
      for(let g=0;g<2;g++){
        const ga=this.random()*Math.PI*2, gr=mainScale*(0.7+this.random()*0.6);
        spawn3D(grassModel,`rock_grass_${i}_${g}`,rx+Math.cos(ga)*gr,0,rz+Math.sin(ga)*gr,1.3+this.random()*0.5,1.2,1.3+this.random()*0.5,this.random()*Math.PI);
      }
    }

    // --- C. 95 Natural Forest Groves & Tree Ecosystems (360 Trees Total) ---
    const commonTrees=[mCommon1,mCommon2,mCommon3,mCommon4,mCommon5];
    const pineTrees=[mPine1,mPine2,mPine3,mPine4,mPine5];
    const twistedTrees=[mTwisted1,mTwisted2,mTwisted3,mTwisted4];
    const deadTrees=[mDead1,mDead2,mDead3];
    let treeCount=0;

    for(let g=0;g<95;g++){
      const ga=this.random()*Math.PI*2;
      const gr=16+Math.sqrt(this.random())*126;
      const gx=Math.cos(ga)*gr, gz=Math.sin(ga)*gr;
      if(this.pathDist(gx,gz)<4.2)continue;

      // Select grove ecological type
      const groveType=g%5===0?'twisted':g%3===0?'pine':g%8===0?'dead':'common';
      const motherTreeCount=1;
      const companionCount=1+Math.floor(this.random()*3);

      // 1. Mother Tree (Tall, magnificent anchor)
      let motherModel, height, baseScale;
      if(groveType==='pine'){
        motherModel=pineTrees[Math.floor(this.random()*pineTrees.length)];
        height=14+this.random()*9;baseScale=height/6.8*0.9;
      }else if(groveType==='twisted'){
        motherModel=twistedTrees[Math.floor(this.random()*twistedTrees.length)];
        height=13+this.random()*7;baseScale=height/14*1.15;
      }else if(groveType==='dead'){
        motherModel=deadTrees[Math.floor(this.random()*deadTrees.length)];
        height=11+this.random()*6;baseScale=height/10*0.95;
      }else{
        motherModel=commonTrees[Math.floor(this.random()*commonTrees.length)];
        height=13+this.random()*8;baseScale=height/6.5*0.95;
      }

      const rotY=this.random()*Math.PI*2;
      const tiltX=(this.random()-0.5)*0.08, tiltZ=(this.random()-0.5)*0.08;
      spawn3D(motherModel,`tree_mother_${g}`,gx,0,gz,baseScale,baseScale,baseScale,rotY,tiltX,tiltZ);
      this.obstacles.push({x:gx,z:gz,w:2.4,d:2.4});
      treeCount++;

      // Trunk bracket mushroom (Shelf mushroom clinging to trunk bark at 0.7-1.4m height)
      if(groveType==='common'||groveType==='twisted'){
        const mushRot=rotY+Math.PI*0.35;
        const mushX=gx+Math.sin(mushRot)*0.48;
        const mushZ=gz+Math.cos(mushRot)*0.48;
        spawn3D(mMushShelf,`trunk_mush_${g}`,mushX,0.85+this.random()*0.6,mushZ,1.1,1.1,1.1,mushRot,0.25,0);
      }

      // Base Undergrowth: Fern or Bush hugging trunk foot
      const baseFlora=this.random()<0.5?mFern:this.random()<0.5?mBush:mBushFl;
      const floraA=rotY+1.2+this.random()*0.8;
      spawn3D(baseFlora,`tree_base_${g}`,gx+Math.cos(floraA)*1.3,0,gz+Math.sin(floraA)*1.3,1.1+this.random()*0.4,1.1+this.random()*0.4,1.1+this.random()*0.4,this.random()*Math.PI);

      // Fallen petals beneath canopy
      if(this.random()<0.5){
        const petalModel=this.random()<0.5?mPetal1:mPetal2;
        spawn3D(petalModel,`tree_petal_${g}`,gx+(this.random()-0.5)*3.5,0.01,gz+(this.random()-0.5)*3.5,1.5,1,1.5,this.random()*Math.PI);
      }

      // 2. Companion Younger Trees in Grove
      for(let c=0;c<companionCount;c++){
        const ca=rotY+c*(Math.PI*2/companionCount)+this.random()*0.7;
        const cDist=3.2+this.random()*4.5;
        const cx=gx+Math.cos(ca)*cDist, cz=gz+Math.sin(ca)*cDist;
        if(this.pathDist(cx,cz)<3.8)continue;

        const cHeight=6.5+this.random()*6;
        let cModel;
        if(groveType==='pine'||this.random()<0.35){
          cModel=pineTrees[Math.floor(this.random()*pineTrees.length)];
          const sc=cHeight/6.8*0.8;
          spawn3D(cModel,`tree_comp_${g}_${c}`,cx,0,cz,sc,sc,sc,this.random()*Math.PI);
        }else{
          cModel=commonTrees[Math.floor(this.random()*commonTrees.length)];
          const sc=cHeight/6.5*0.8;
          spawn3D(cModel,`tree_comp_${g}_${c}`,cx,0,cz,sc,sc,sc,this.random()*Math.PI);
        }
        this.obstacles.push({x:cx,z:cz,w:1.6,d:1.6});
        treeCount++;
      }
    }

    // --- D. Scenic Arching Trees Leaning Over The Trail at Curves ---
    const archSpots=[-75, -20, 35, 80];
    for(let i=0;i<archSpots.length;i++){
      const z=archSpots[i];
      const cx=this.pathX(z);
      const side=i%2===0?-1:1;
      const tx=cx+side*3.8;
      const tModel=twistedTrees[i%twistedTrees.length];
      const tRot=side>0?-Math.PI*0.45:Math.PI*0.45;
      const tiltZ=side>0?0.15:-0.15;
      spawn3D(tModel,`arch_tree_${i}`,tx,0,z,1.35,1.35,1.35,tRot,0,tiltZ);
      this.obstacles.push({x:tx,z,w:2.0,d:2.0});
    }

    // Frame the trail with uneven tree lines and layers of low vegetation.
    // Reuse the loaded meshes through instances so the denser corridor stays affordable.
    for(let z=-130;z<=130;z+=12){
      for(const side of [-1,1]){
        const sampleZ=z+(this.random()-0.5)*5;
        const edge=this.roadWidthAt(sampleZ)*0.5;
        const treeZ=sampleZ+(this.random()-0.5)*3;
        const treeX=this.pathX(treeZ)+side*(edge+7+this.random()*5);
        const treeModel=this.random()<0.2
          ?pineTrees[Math.floor(this.random()*pineTrees.length)]
          :commonTrees[Math.floor(this.random()*commonTrees.length)];
        const treeScale=1.2+this.random()*0.7;
        spawn3D(treeModel,`trail_canopy_${z}_${side}`,treeX,0,treeZ,treeScale,treeScale,treeScale,this.random()*Math.PI*2);
        this.obstacles.push({x:treeX,z:treeZ,w:2.3,d:2.3});

        const shrubZ=sampleZ+(this.random()-0.5)*5;
        const shrubX=this.pathX(shrubZ)+side*(edge+1.8+this.random()*3);
        const shrubModel=this.random()<0.55?mFern:this.random()<0.5?mBush:mBushFl;
        const shrubScale=0.9+this.random()*0.55;
        spawn3D(shrubModel,`trail_shrub_${z}_${side}`,shrubX,0,shrubZ,shrubScale,shrubScale,shrubScale,this.random()*Math.PI*2);

        for(let k=0;k<4;k++){
          const grassZ=sampleZ+(this.random()-0.5)*7;
          const grassX=this.pathX(grassZ)+side*(edge+0.7+this.random()*3.5);
          const grassModel=this.random()<0.5?mGrassShort:mGrassWispyShort;
          const scale=1.2+this.random()*0.85;
          spawn3D(grassModel,`trail_understory_${z}_${side}_${k}`,grassX,0,grassZ,scale,scale,scale,this.random()*Math.PI*2);
        }
      }
    }

    // --- E. 36 Flower Colonies & Mushroom Fairy Rings ---
    const flowerGroups=[mFl3Grp,mFl4Grp,mFl3Sgl,mFl4Sgl,mClover1,mClover2];
    for(let f=0;f<36;f++){
      const fa=this.random()*Math.PI*2;
      const fr=8+Math.sqrt(this.random())*120;
      const fx=Math.cos(fa)*fr, fz=Math.sin(fa)*fr;
      if(this.pathDist(fx,fz)<this.roadWidthAt(fz)*0.5+1.4)continue;

      // Clustered flower colony (4-7 flowers grouped within 2.5m)
      const colonyType=f%4;
      const fCount=4+Math.floor(this.random()*4);
      for(let k=0;k<fCount;k++){
        const kx=fx+(this.random()-0.5)*2.6, kz=fz+(this.random()-0.5)*2.6;
        if(this.pathDist(kx,kz)<this.roadWidthAt(kz)*0.5+0.4)continue;
        const flModel=colonyType===3?mMushCommon:flowerGroups[Math.floor(this.random()*flowerGroups.length)];
        const sc=1.0+this.random()*0.5;
        spawn3D(flModel,`colony_${f}_${k}`,kx,0,kz,sc,sc,sc,this.random()*Math.PI);
      }
    }

    // --- F. Grass clumps scattered over bare soil, leaving the winding trail open. ---
    const grassVarieties=[mGrassTall,mGrassShort,mGrassWispyTall,mGrassWispyShort];
    for(let i=0;i<520;i++){
      const ga=this.random()*Math.PI*2;
      const gr=4+Math.sqrt(this.random())*132;
      const gx=Math.cos(ga)*gr, gz=Math.sin(ga)*gr;
      if(this.pathDist(gx,gz)<this.roadWidthAt(gz)*0.5+0.65)continue;

      const gModel=grassVarieties[Math.floor(this.random()*grassVarieties.length)];
      const sc=1.1+this.random()*0.9;
      spawn3D(gModel,`grass_patch_${i}`,gx,0,gz,sc,sc*0.9,sc,this.random()*Math.PI);
    }

    // New forest sectors are deterministic and exist only near the player.
    const chunkSize=80;
    const makeRandom=(cx,cz)=>{
      let state=(Math.imul(cx,73856093)^Math.imul(cz,19349663)^0x9e3779b9)>>>0;
      return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    };
    const streamModels={trees:[...commonTrees,...pineTrees],bushes:[mBush,mBushFl,mFern],grass:grassVarieties,rocks:bigRockModels,flowers:flowerGroups};
    const createChunk=(cx,cz)=>{
      const chunk={cx,cz,roots:[],obstacles:[]};
      const rand=makeRandom(cx,cz);
      const point=()=>({x:(cx+(rand()-0.5))*chunkSize,z:(cz+(rand()-0.5))*chunkSize});
      const valid=(x,z,margin)=>Math.hypot(x,z)<this.walkRadius-8&&Math.hypot(x,z)>140&&this.pathDist(x,z)>this.roadWidthAt(z)*0.5+margin;
      const choose=list=>list[Math.floor(rand()*list.length)];
      for(let i=0;i<7;i++){
        const {x,z}=point();if(!valid(x,z,4))continue;
        const sc=1.15+rand()*1.15;
        spawn3D(choose(streamModels.trees),`sector_${cx}_${cz}_tree_${i}`,x,0,z,sc,sc,sc,rand()*Math.PI*2,0,0,chunk);
        chunk.obstacles.push({x,z,w:2.2,d:2.2});
      }
      for(let i=0;i<13;i++){
        const {x,z}=point();if(!valid(x,z,0.8))continue;
        const sc=0.85+rand()*0.8;
        spawn3D(choose(streamModels.bushes),`sector_${cx}_${cz}_shrub_${i}`,x,0,z,sc,sc,sc,rand()*Math.PI*2,0,0,chunk);
      }
      for(let i=0;i<48;i++){
        const {x,z}=point();if(!valid(x,z,0.35))continue;
        const sc=0.9+rand()*1.0;
        spawn3D(choose(streamModels.grass),`sector_${cx}_${cz}_grass_${i}`,x,0,z,sc,sc,sc,rand()*Math.PI*2,0,0,chunk);
      }
      for(let i=0;i<7;i++){
        const {x,z}=point();if(!valid(x,z,0.5))continue;
        const sc=0.6+rand()*1.5;
        spawn3D(choose(streamModels.rocks),`sector_${cx}_${cz}_rock_${i}`,x,0,z,sc,sc*0.8,sc,rand()*Math.PI*2,0,0,chunk);
        chunk.obstacles.push({x,z,w:sc*1.3,d:sc*1.3});
      }
      for(let i=0;i<5;i++){
        const {x,z}=point();if(!valid(x,z,0.6))continue;
        const sc=0.8+rand()*0.7;
        spawn3D(choose(streamModels.flowers),`sector_${cx}_${cz}_flower_${i}`,x,0,z,sc,sc,sc,rand()*Math.PI*2,0,0,chunk);
      }
      return chunk;
    };
    const refreshNavigation=()=>{
      this.obstacles=[...this.baseObstacles,...Array.from(this.streamChunks.values()).flatMap(chunk=>chunk.obstacles)];
      this.blocked=new Set();
      for(const o of this.obstacles){
        for(let x=Math.floor((o.x-o.w/2-1)/3);x<=Math.ceil((o.x+o.w/2+1)/3);x++){
          for(let z=Math.floor((o.z-o.d/2-1)/3);z<=Math.ceil((o.z+o.d/2+1)/3);z++){
            if(Math.abs(x*3-o.x)<o.w/2+1.1&&Math.abs(z*3-o.z)<o.d/2+1.1)this.blocked.add(`${x},${z}`);
          }
        }
      }
    };
    this.baseObstacles=this.obstacles.slice();
    this.updateStreaming=(position,force=false)=>{
      const now=performance.now();
      if(!force&&now-(this.lastStreamUpdate||0)<180)return;
      this.lastStreamUpdate=now;
      const px=position.x,pz=position.z;
      for(const entry of this.staticRoots){
        const near=(entry.x-px)**2+(entry.z-pz)**2<145*145;
        if(entry.enabled!==near){entry.root.setEnabled(near);entry.enabled=near;}
      }
      const centerX=Math.round(px/chunkSize),centerZ=Math.round(pz/chunkSize);
      const wanted=[];
      if(Math.hypot(px,pz)>=85){
        for(let cx=centerX-2;cx<=centerX+2;cx++)for(let cz=centerZ-2;cz<=centerZ+2;cz++){
          const x=cx*chunkSize,z=cz*chunkSize;
          if(Math.hypot(x-px,z-pz)>170||Math.hypot(x,z)>this.walkRadius+60||Math.hypot(x,z)<120)continue;
          wanted.push({cx,cz,key:`${cx},${cz}`,distance:(x-px)**2+(z-pz)**2});
        }
      }
      const keys=new Set(wanted.map(item=>item.key));
      let changed=false;
      for(const [key,chunk] of this.streamChunks){
        if(keys.has(key))continue;
        for(const root of chunk.roots)root.dispose(false,false);
        this.streamChunks.delete(key);changed=true;
      }
      wanted.sort((a,b)=>a.distance-b.distance);
      const next=wanted.find(item=>!this.streamChunks.has(item.key));
      if(next){this.streamChunks.set(next.key,createChunk(next.cx,next.cz));changed=true;}
      if(changed)refreshNavigation();
    };

    // =========================================================================
    // 5. CINEMATIC ATMOSPHERE & LIGHTING
    // =========================================================================

    // Warm natural sunlight (soft golden hour tone with gentle intensity)
    const sun=new B.DirectionalLight('forest sunlight',new B.Vector3(-0.45,-0.85,0.35),this.scene);
    sun.diffuse=new B.Color3(1.0,0.9,0.72);
    sun.specular=new B.Color3(0.08,0.08,0.06);
    sun.intensity=1.08;

    refreshNavigation();
    this.updateStreaming({x:0,z:0},true);
  }

  clearLine(a,b){
    const minX=Math.min(a.x,b.x)-2.5,maxX=Math.max(a.x,b.x)+2.5,minZ=Math.min(a.z,b.z)-2.5,maxZ=Math.max(a.z,b.z)+2.5;
    const obs=this.obstacles.filter(o=>o.x>=minX&&o.x<=maxX&&o.z>=minZ&&o.z<=maxZ);
    if(!obs.length)return true;
    const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.5);
    for(let i=0;i<=n;i++){const t=n?i/n:0,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;if(obs.some(o=>Math.abs(x-o.x)<o.w/2+.75&&Math.abs(z-o.z)<o.d/2+.75))return false;}
    return true;
  }

  findPath(start,point){
    const B=BABYLON,target=point.clone();this.constrain(target);target.y=start.y;
    if(this.clearLine(start,target))return [target];
    const key=(x,z)=>`${x},${z}`,sx=Math.round(start.x/3),sz=Math.round(start.z/3),gx=Math.round(target.x/3),gz=Math.round(target.z/3);
    const open=[],cost=new Map(),previous=new Map();
    const push=n=>{open.push(n);let i=open.length-1;while(i>0){const p=(i-1)>>1;if(open[p].f<=n.f)break;open[i]=open[p];i=p;}open[i]=n;};
    const pop=()=>{const first=open[0],last=open.pop();if(open.length){let i=0;while(i*2+1<open.length){let c=i*2+1;if(c+1<open.length&&open[c+1].f<open[c].f)c++;if(open[c].f>=last.f)break;open[i]=open[c];i=c;}open[i]=last;}return first;};
    const initial=key(sx,sz);cost.set(initial,0);push({x:sx,z:sz,g:0,f:0});let found=null;
    for(let count=0;open.length&&count<5000;count++){
      const n=pop(),k=key(n.x,n.z);if(n.g!==cost.get(k))continue;
      if(Math.hypot(n.x-gx,n.z-gz)<2&&this.clearLine(new B.Vector3(n.x*3,start.y,n.z*3),target)){found=k;break;}
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        const x=n.x+dx,z=n.z+dz,next=key(x,z);if(Math.hypot(x*3,z*3)>this.walkRadius||this.blocked.has(next))continue;
        if(dx&&dz&&(this.blocked.has(key(n.x+dx,n.z))||this.blocked.has(key(n.x,n.z+dz))))continue;
        const g=n.g+Math.hypot(dx,dz);if(g>=(cost.get(next)??Infinity))continue;cost.set(next,g);previous.set(next,k);push({x,z,g,f:g+Math.hypot(x-gx,z-gz)});
      }
    }
    if(!found)return [];
    const route=[target];for(let k=found;k&&k!==initial;k=previous.get(k)){const [x,z]=k.split(',').map(Number);route.unshift(new B.Vector3(x*3,start.y,z*3));}
    const result=[];let from=start;
    for(let i=0;i<route.length;){let j=route.length-1;while(j>i&&!this.clearLine(from,route[j]))j--;if(!this.clearLine(from,route[j]))return [];result.push(route[j]);from=route[j];i=j+1;}
    return result;
  }
};
