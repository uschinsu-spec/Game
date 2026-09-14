(()=>{
  const SOURCE='https://raw.githubusercontent.com/rajsinghtech/spurfire/main/game/assets/kenney/nature-kit/';
  const placements={
    tree_oak:[[-20,58,2.1],[-29,39,2.4],[23,31,2.2],[31,10,2.5],[-24,-8,2.3],[26,-28,2.4],[-30,-52,2.1],[28,-70,2.5],[-22,-91,2.2],[25,-111,2.5]],
    tree_default:[[16,51,1.8],[-17,45,1.9],[20,17,1.8],[-21,4,2.0],[18,-17,1.9],[-19,-39,1.8],[20,-61,2.0],[-18,-81,1.9],[19,-101,1.9]],
    rock_largeA:[[-11,54,1.9],[12,44,1.6],[-13,23,1.8],[11,3,1.7],[-12,-20,1.8],[13,-43,1.7],[-12,-67,1.9],[12,-88,1.8],[14,-108,1.7]],
    rock_smallA:[[8,60,1.4],[-9,36,1.3],[9,14,1.4],[-8,-5,1.3],[9,-29,1.4],[-9,-54,1.3],[8,-78,1.4],[-9,-99,1.3]],
    fence_simple:[[-7,-93,1.35],[7,-93,1.35],[-8,-116,1.25],[8,-116,1.25]],
    fence_gate:[[0,-92,1.35]],
    sign:[[7,56,1.5],[-7,-73,1.45]]
  };
  async function loadTemplate(scene,name){
    const result=await BABYLON.SceneLoader.ImportMeshAsync('',SOURCE,name+'.glb',scene);
    const root=result.meshes[0];
    root.name='FreeAssetTemplate_'+name;
    root.setEnabled(false);
    result.meshes.forEach(m=>{m.receiveShadows=true});
    return root;
  }
  function cloneAt(root,name,p,index,shadow){
    const c=root.clone(name+'_'+index,null,true);
    if(!c)return null;
    c.position.set(p[0],0,p[1]);
    c.scaling.setAll(p[2]);
    c.rotation.y=((index*1.91)%6.28);
    c.setEnabled(true);
    c.getChildMeshes(false).forEach(m=>{m.receiveShadows=true;if(shadow)shadow.addShadowCaster(m)});
    return c;
  }
  async function install(){
    const scene=BABYLON.EngineStore.LastCreatedScene;
    if(!scene||!BABYLON.SceneLoader)return;
    const sun=scene.lights.find(l=>l.name==='sun');
    const shadow=sun&&sun.getShadowGenerator?sun.getShadowGenerator():null;
    let loaded=0;
    for(const [name,list] of Object.entries(placements)){
      try{
        const root=await loadTemplate(scene,name);
        list.forEach((p,i)=>cloneAt(root,'CC0_'+name,p,i,shadow));
        loaded++;
      }catch(err){console.warn('Không tải được asset môi trường',name,err)}
    }
    if(loaded>=4){
      const legacy=new Set(['PaintedTree','PaintedCrown','PalmLeaf','ScholarRock','Bamboo','BambooLeaves']);
      scene.meshes.forEach(m=>{if(legacy.has(m.name))m.setEnabled(false)});
      console.info('Đã bật bộ asset môi trường CC0:',loaded,'nhóm');
    }
  }
  install();
})();
