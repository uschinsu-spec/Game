// Loader dùng chung. Giữ procedural fallback để game vẫn chạy khi chưa có file asset thật.
window.AssetLoader={
  exists:async function(path){try{const r=await fetch(path,{method:'HEAD',cache:'no-store'});return r.ok}catch(_){return false}},
  async importModel(scene,path,parent){
    if(!path||!(await this.exists(path)))return null;
    try{
      const slash=path.lastIndexOf('/'),root=path.slice(0,slash+1),file=path.slice(slash+1);
      const result=await BABYLON.SceneLoader.ImportMeshAsync('',root,file,scene);
      const rootNode=new BABYLON.TransformNode('AssetRoot:'+file,scene);
      if(parent)rootNode.parent=parent;
      result.meshes.forEach(m=>{if(m!==scene.meshes[0]&&!m.parent)m.parent=rootNode});
      return {root:rootNode,meshes:result.meshes,animationGroups:result.animationGroups||[]};
    }catch(e){console.warn('Không tải được asset',path,e);return null}
  },
  async useModel(key,scene,parent){
    const parts=key.split('.');let cfg=window.GameAssets;
    for(const p of parts)cfg=cfg&&cfg[p];
    if(!cfg||!cfg.model)return null;
    return this.importModel(scene,cfg.model,parent);
  },
  image:function(key){const parts=key.split('.');let cfg=window.GameAssets;for(const p of parts)cfg=cfg&&cfg[p];return typeof cfg==='string'?cfg:null}
};