(()=>{
  const cfg=window.ULTIMATE_MONSTERS_CONFIG;
  const scene=BABYLON.EngineStore.LastCreatedScene;
  if(!cfg||!scene)return;
  const hosts=scene.meshes.filter(m=>m.name==='Demon');
  const records=new WeakMap();
  const pick=(groups,keys)=>{for(const k of keys){const g=groups.find(x=>x.name&&x.name.toLowerCase().includes(k));if(g)return g}return null};
  const lists={mob:cfg.catalog.filter(x=>x.role==='mob'),elite:cfg.catalog.filter(x=>x.role==='elite'),boss:cfg.catalog.filter(x=>x.role==='boss')};
  hosts.forEach((h,i)=>{h.metadata=h.metadata||{};h.metadata.enemySlot=i;h.metadata.spawnSerial=0;h.isVisible=false;h.setEnabled(false)});

  function choose(host,isBoss,stage){
    const s=Math.max(1,stage||1),slot=host.metadata.enemySlot||0,serial=host.metadata.spawnSerial||0;
    if(isBoss)return lists.boss[(s-1)%lists.boss.length];
    const elite=s>=8&&((s+serial)%5===0),pool=elite?lists.elite:lists.mob;
    return pool[(s*3+slot+serial)%pool.length];
  }
  const groupsFor=r=>(r.animationGroups||[]).filter(Boolean);
  const mapClips=groups=>({idle:pick(groups,['idle']),walk:pick(groups,['walk','run','move']),attack:pick(groups,['attack','bite','slash','punch','shoot','hit']),hurt:pick(groups,['hurt','damage','hit']),death:pick(groups,['death','die'])});
  function stop(rec){Object.values(rec.clips||{}).forEach(g=>{try{if(g&&g.isPlaying)g.stop()}catch(_){}})}
  function play(host,state){const rec=records.get(host);if(!rec||!rec.ready)return;const g=rec.clips[state]||rec.clips.idle;if(!g)return;if(rec.state===state&&g.isPlaying)return;stop(rec);rec.state=state;const loop=!['attack','hurt','death'].includes(state);try{g.start(loop,1,g.from,g.to,false);if(!loop&&state!=='death'&&g.onAnimationGroupEndObservable)g.onAnimationGroupEndObservable.addOnce(()=>{if(records.get(host)===rec&&rec.state===state&&host.isEnabled()){rec.state='';play(host,'idle')}})}catch(_){}}
  function disposeRecord(rec){if(!rec)return;stop(rec);(rec.groups||[]).forEach(g=>{try{g.dispose()}catch(_){}});(rec.meshes||[]).slice().reverse().forEach(m=>{try{m.dispose()}catch(_){}});try{rec.root&&rec.root.dispose()}catch(_){}}
  async function load(host,entry){
    const old=records.get(host);if(old&&old.entry.id===entry.id&&old.ready)return old;if(old)disposeRecord(old);
    const rec={entry,ready:false,state:'',root:null,meshes:[],groups:[],clips:{}};records.set(host,rec);host.isVisible=false;
    try{
      const r=await BABYLON.SceneLoader.ImportMeshAsync('',cfg.root,entry.file,scene);
      if(records.get(host)!==rec){(r.meshes||[]).forEach(m=>m.dispose());return null}
      const root=new BABYLON.TransformNode('UltimateMonster_'+entry.id,scene);root.parent=host;root.position.set(0,entry.y??-.78,0);root.scaling.setAll(entry.scale||1);root.rotation.y=entry.yaw||0;
      const imported=new Set(r.meshes||[]),nodes=r.transformNodes||[];
      (r.meshes||[]).filter(m=>!m.parent||!imported.has(m.parent)).forEach(m=>m.parent=root);
      nodes.filter(n=>!n.parent||(!imported.has(n.parent)&&!nodes.includes(n.parent))).forEach(n=>n.parent=root);
      (r.meshes||[]).forEach(m=>{m.isPickable=false;m.receiveShadows=true;if(m.getTotalVertices&&m.getTotalVertices()>0)shadow.addShadowCaster(m)});
      rec.root=root;rec.meshes=r.meshes||[];rec.groups=groupsFor(r);rec.clips=mapClips(rec.groups);rec.ready=true;host.isVisible=false;play(host,'idle');return rec;
    }catch(err){console.warn('Enemy asset load failed:',entry.id,err);rec.ready=false;host.isVisible=false;return rec}
  }
  function candidates(primary,isBoss){const pool=isBoss?lists.boss:(primary.role==='elite'?lists.elite:lists.mob);return [primary,...pool.filter(x=>x.id!==primary.id)]}
  async function activate(host,isBoss,stage){
    if(!host)return null;host.metadata=host.metadata||{};const primary=choose(host,isBoss,stage);if(!isBoss)host.metadata.spawnSerial=(host.metadata.spawnSerial||0)+1;
    for(const entry of candidates(primary,isBoss)){
      const rec=await load(host,entry);
      if(rec&&rec.ready){host.metadata.enemyDisplayName=entry.name;host.metadata.enemyAssetId=entry.id;host.metadata.enemyIsBoss=!!isBoss;play(host,'idle');return entry}
    }
    host.metadata.enemyDisplayName=isBoss?'Yêu Vương':'Yêu Thú';host.metadata.enemyAssetId='unavailable';host.metadata.enemyIsBoss=!!isBoss;host.isVisible=false;return primary;
  }
  function deactivate(host){const rec=records.get(host);if(rec){stop(rec);rec.state=''}host.isVisible=false}
  function getDisplayName(host,isBoss){return host&&host.metadata&&host.metadata.enemyDisplayName||(isBoss?'Yêu Vương':'Yêu Thú')}
  function facePlayer(host,target){if(!host||!target)return;const dx=target.position.x-host.position.x,dz=target.position.z-host.position.z;host.rotation.y=Math.atan2(dx,dz)}
  window.EnemySystem={activate,deactivate,play,getDisplayName,facePlayer,catalog:cfg.catalog};
  console.info('Asset-only enemy system ready:',cfg.catalog.length,'monsters');
})();