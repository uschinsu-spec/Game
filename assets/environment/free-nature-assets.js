(()=>{
  const SOURCES={
    kenney:'https://raw.githubusercontent.com/rajsinghtech/spurfire/main/game/assets/kenney/nature-kit/',
    curated:'https://raw.githubusercontent.com/syuhei176/ai-game-assets/main/models/environment/'
  };
  const catalog={
    tree_oak:{src:'curated',file:'tree_oak.glb',placements:[[-23,61,2.1],[-33,42,2.4],[28,35,2.3],[36,12,2.5],[-29,-10,2.2],[31,-30,2.5],[-35,-55,2.2],[33,-74,2.4],[-28,-96,2.3],[31,-117,2.5]]},
    tree_pine:{src:'curated',file:'tree_pine.glb',placements:[[20,58,2.2],[-20,49,2.1],[25,24,2.4],[-25,7,2.2],[23,-16,2.3],[-22,-39,2.4],[24,-62,2.2],[-24,-84,2.4],[22,-106,2.3]]},
    tree_palm:{src:'curated',file:'tree_palm.glb',placements:[[-43,29,1.9],[45,2,2.0],[-42,-31,1.8],[46,-67,2.0]]},
    rock_large:{src:'curated',file:'rock_large.glb',placements:[[-13,56,2.1],[14,45,1.8],[-15,24,2.0],[13,4,1.9],[-14,-19,2.0],[15,-44,1.9],[-14,-69,2.1],[14,-91,2.0],[16,-112,1.9]]},
    rock_medium:{src:'curated',file:'rock_medium.glb',placements:[[9,62,1.7],[-10,38,1.6],[10,16,1.7],[-9,-5,1.6],[10,-29,1.7],[-10,-54,1.6],[9,-79,1.7],[-10,-101,1.6]]},
    rock_small:{src:'curated',file:'rock_small.glb',placements:[[7,52,1.4],[-8,31,1.3],[8,8,1.4],[-7,-12,1.3],[8,-36,1.4],[-8,-61,1.3],[7,-86,1.4],[-8,-108,1.3]]},
    fence_simple:{src:'kenney',file:'fence_simple.glb',placements:[[-7,-93,1.35],[7,-93,1.35],[-8,-116,1.25],[8,-116,1.25]]},
    fence_gate:{src:'kenney',file:'fence_gate.glb',placements:[[0,-92,1.35]]},
    sign:{src:'kenney',file:'sign.glb',placements:[[7,57,1.5],[-7,-74,1.45]]}
  };
  async function loadTemplate(scene,key,item){
    const rootUrl=SOURCES[item.src];
    const result=await BABYLON.SceneLoader.ImportMeshAsync('',rootUrl,item.file,scene);
    const root=result.meshes[0];
    root.name='CC0Template_'+key;
    root.setEnabled(false);
    result.meshes.forEach(m=>{m.receiveShadows=true;m.isPickable=false});
    return root;
  }
  function cloneAt(root,key,p,index,shadow){
    const c=root.clone('CC0_'+key+'_'+index,null,true);
    if(!c)return null;
    c.position.set(p[0],0,p[1]);
    c.scaling.setAll(p[2]);
    c.rotation.y=((index*2.137)+(p[0]*.031))%(Math.PI*2);
    c.setEnabled(true);
    c.getChildMeshes(false).forEach(m=>{m.receiveShadows=true;m.isPickable=false;if(shadow)shadow.addShadowCaster(m)});
    return c;
  }
  async function install(){
    const scene=BABYLON.EngineStore.LastCreatedScene;
    if(!scene||!BABYLON.SceneLoader)return;
    const sun=scene.lights.find(l=>l.name==='sun');
    const shadow=sun&&sun.getShadowGenerator?sun.getShadowGenerator():null;
    let loaded=0;
    for(const [key,item] of Object.entries(catalog)){
      try{
        const root=await loadTemplate(scene,key,item);
        item.placements.forEach((p,i)=>cloneAt(root,key,p,i,shadow));
        loaded++;
      }catch(err){console.warn('Không tải được asset CC0',key,err)}
    }
    if(loaded>=5){
      const legacy=new Set(['PaintedTree','PaintedCrown','PalmLeaf','ScholarRock','Bamboo','BambooLeaves','PaintedRock']);
      scene.meshes.forEach(m=>{if(legacy.has(m.name))m.setEnabled(false)});
      window.__CC0_ENV_READY__=true;
      console.info('Thanh Vân Sơn: đã bật',loaded,'nhóm asset CC0.');
    }
  }
  install();
})();
