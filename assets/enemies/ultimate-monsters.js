(()=>{
  const cfg=window.ULTIMATE_MONSTERS_CONFIG;
  const scene=BABYLON.EngineStore.LastCreatedScene;
  if(!cfg||!scene)return;
  const host=window.GameRuntime?.enemyHost||scene.getTransformNodeByName('EnemyHost');
  if(!host)return;
  const records=new WeakMap();
  const pick=(groups,keys)=>{for(const k of keys){const g=groups.find(x=>x.name&&x.name.toLowerCase().includes(k));if(g)return g}return null};
  const lists={mob:cfg.catalog.filter(x=>x.role==='mob'),elite:cfg.catalog.filter(x=>x.role==='elite'),boss:cfg.catalog.filter(x=>x.role==='boss')};
  host.metadata=host.metadata||{};host.metadata.enemySlot=0;host.metadata.spawnSerial=0;host.setEnabled(false);

  function choose(anchor,isBoss,stage){
    const s=Math.max(1,stage||1),slot=anchor.metadata.enemySlot||0,serial=anchor.metadata.spawnSerial||0;
    if(isBoss)return lists.boss[(s-1)%lists.boss.length];
    const elite=s>=8&&((s+serial)%5===0),pool=elite?lists.elite:lists.mob;
    return pool[(s*3+slot+serial)%pool.length];
  }
  const groupsFor=r=>(r.animationGroups||[]).filter(Boolean);
  const mapClips=groups=>({idle:pick(groups,['idle']),walk:pick(groups,['walk','run','move']),attack:pick(groups,['attack','bite','slash','punch','shoot','hit']),hurt:pick(groups,['hurt','damage','hit']),death:pick(groups,['death','die'])});
  function stop(rec){Object.values(rec.clips||{}).forEach(g=>{try{if(g&&g.isPlaying)g.stop()}catch(_){}})}
  function play(anchor,state){const rec=records.get(anchor);if(!rec||!rec.ready)return;const g=rec.clips[state]||rec.clips.idle;if(!g)return;if(rec.state===state&&g.isPlaying)return;stop(rec);rec.state=state;const loop=!['attack','hurt','death'].includes(state);try{g.start(loop,1,g.from,g.to,false);if(!loop&&state!=='death'&&g.onAnimationGroupEndObservable)g.onAnimationGroupEndObservable.addOnce(()=>{if(records.get(anchor)===rec&&rec.state===state&&anchor.isEnabled()){rec.state='';play(anchor,'idle')}})}catch(_){}}
  function disposeRecord(rec){if(!rec)return;stop(rec);(rec.groups||[]).forEach(g=>{try{g.dispose()}catch(_){}});(rec.meshes||[]).slice().reverse().forEach(m=>{try{m.dispose()}catch(_){}});try{rec.root&&rec.root.dispose()}catch(_){}}
  async function load(anchor,entry){
    const old=records.get(anchor);if(old&&old.entry.id===entry.id&&old.ready)return old;if(old)disposeRecord(old);
    const rec={entry,ready:false,state:'',root:null,meshes:[],groups:[],clips:{}};records.set(anchor,rec);
    try{
      const r=await BABYLON.SceneLoader.ImportMeshAsync('',cfg.root,entry.file,scene);
      if(records.get(anchor)!==rec){(r.meshes||[]).forEach(m=>m.dispose());return null}
      const root=new BABYLON.TransformNode('UltimateMonster_'+entry.id,scene);root.parent=anchor;root.position.set(0,entry.y??-.78,0);root.scaling.setAll(entry.scale||1);root.rotation.y=entry.yaw||0;
      const imported=new Set(r.meshes||[]),nodes=r.transformNodes||[];
      (r.meshes||[]).filter(m=>!m.parent||!imported.has(m.parent)).forEach(m=>m.parent=root);
      nodes.filter(n=>!n.parent||(!imported.has(n.parent)&&!nodes.includes(n.parent))).forEach(n=>n.parent=root);
      (r.meshes||[]).forEach(m=>{m.isPickable=false;m.receiveShadows=true;if(m.getTotalVertices&&m.getTotalVertices()>0)shadow.addShadowCaster(m)});
      rec.root=root;rec.meshes=r.meshes||[];rec.groups=groupsFor(r);rec.clips=mapClips(rec.groups);rec.ready=true;play(anchor,'idle');return rec;
    }catch(err){console.warn('Enemy asset load failed:',entry.id,err);rec.ready=false;return rec}
  }
  function candidates(primary,isBoss){const pool=isBoss?lists.boss:(primary.role==='elite'?lists.elite:lists.mob);return [primary,...pool.filter(x=>x.id!==primary.id)]}
  async function activate(anchor,isBoss,stage){
    if(!anchor)return null;anchor.metadata=anchor.metadata||{};const primary=choose(anchor,isBoss,stage);if(!isBoss)anchor.metadata.spawnSerial=(anchor.metadata.spawnSerial||0)+1;
    for(const entry of candidates(primary,isBoss)){
      const rec=await load(anchor,entry);
      if(rec&&rec.ready){anchor.metadata.enemyDisplayName=entry.name;anchor.metadata.enemyAssetId=entry.id;anchor.metadata.enemyIsBoss=!!isBoss;play(anchor,'idle');return entry}
    }
    anchor.metadata.enemyDisplayName=isBoss?'Yêu Vương':'Yêu Thú';anchor.metadata.enemyAssetId='unavailable';anchor.metadata.enemyIsBoss=!!isBoss;return primary;
  }
  function deactivate(anchor){const rec=records.get(anchor);if(rec){stop(rec);rec.state=''}}
  function getDisplayName(anchor,isBoss){return anchor&&anchor.metadata&&anchor.metadata.enemyDisplayName||(isBoss?'Yêu Vương':'Yêu Thú')}
  function facePlayer(anchor,target){if(!anchor||!target)return;const dx=target.position.x-anchor.position.x,dz=target.position.z-anchor.position.z;anchor.rotation.y=Math.atan2(dx,dz)}
  window.EnemySystem={activate,deactivate,play,getDisplayName,facePlayer,catalog:cfg.catalog};
  console.info('Transform-only enemy system ready:',cfg.catalog.length,'monsters');
})();