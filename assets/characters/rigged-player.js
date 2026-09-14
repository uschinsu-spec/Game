(()=>{
  const cfg=window.PLAYER_RIG_CONFIG;
  if(!cfg)return;
  let current='';
  const clips={};
  const oldParts=[torso,armor,head,hair,armL,armR,legL,legR].filter(Boolean);
  const pick=(groups,names)=>{for(const n of names){const g=groups.find(x=>x.name.toLowerCase().includes(n.toLowerCase()));if(g)return g}return null};
  const splitUrl=url=>{const i=url.lastIndexOf('/');return {root:url.slice(0,i+1),file:url.slice(i+1)}};
  function retarget(sourceGroups,skeleton){
    const bones=new Map(skeleton.bones.map(b=>[b.name,b]));
    const out=[];
    sourceGroups.forEach(src=>{
      const g=new BABYLON.AnimationGroup('Player_'+src.name,scene);
      src.targetedAnimations.forEach(ta=>{const target=ta.target&&bones.get(ta.target.name);if(target)g.addTargetedAnimation(ta.animation.clone(),target)});
      if(g.targetedAnimations.length)out.push(g);else g.dispose();
    });
    return out;
  }
  function play(state){
    if(state===current)return;
    current=state;
    Object.values(clips).forEach(g=>{if(g&&g.isPlaying)g.stop()});
    const g=clips[state]||clips.idle;
    if(g)g.start(state!=='attack'&&state!=='jump',1,g.from,g.to,false);
  }
  function addSword(handBone,referenceMesh){
    if(!handBone||!referenceMesh)return;
    const blade=BABYLON.MeshBuilder.CreateBox('SocketSwordBlade',{width:.055,height:1.05,depth:.028},scene);
    blade.material=bladeMat;blade.attachToBone(handBone,referenceMesh);blade.position.set(0,-.46,.06);blade.rotation.z=-.12;shadow.addShadowCaster(blade);
    const guard=BABYLON.MeshBuilder.CreateBox('SocketSwordGuard',{width:.28,height:.055,depth:.065},scene);
    guard.material=goldMat;guard.attachToBone(handBone,referenceMesh);guard.position.set(0,.05,.05);guard.rotation.z=-.12;shadow.addShadowCaster(guard);
  }
  async function boot(){
    try{
      const character=splitUrl(cfg.characterUrl);
      const c=await BABYLON.SceneLoader.ImportMeshAsync('',character.root,character.file,scene);
      const skeleton=c.skeletons&&c.skeletons[0];
      if(!skeleton)throw new Error('missing skeleton');
      const root=c.meshes[0];root.name='ChibiPlayerRoot';root.parent=bodyRoot;root.rotation.y=Math.PI;root.scaling.set(cfg.scale.x,cfg.scale.y,cfg.scale.z);
      c.meshes.forEach(m=>{m.isPickable=false;m.receiveShadows=true;if(m.getTotalVertices&&m.getTotalVertices()>0)shadow.addShadowCaster(m)});
      const headBone=skeleton.bones.find(b=>b.name===cfg.sockets.head);if(headBone&&headBone.scale)try{headBone.scale(cfg.headScale,cfg.headScale,cfg.headScale,false)}catch(_){}
      const ref=c.meshes.find(m=>m.skeleton===skeleton)||c.meshes[0];
      const hand=skeleton.bones.find(b=>b.name===cfg.sockets.rightHand);addSword(hand,ref);
      window.PLAYER_SOCKETS={head:headBone,rightHand:hand,leftHand:skeleton.bones.find(b=>b.name===cfg.sockets.leftHand),rightFoot:skeleton.bones.find(b=>b.name===cfg.sockets.rightFoot),leftFoot:skeleton.bones.find(b=>b.name===cfg.sockets.leftFoot),skeleton,referenceMesh:ref};
      const animation=splitUrl(cfg.animationUrl);
      const a=await BABYLON.SceneLoader.ImportMeshAsync('',animation.root,animation.file,scene);
      const retargeted=retarget(a.animationGroups||[],skeleton);
      clips.idle=pick(retargeted,['idle_loop','idle']);clips.walk=pick(retargeted,['jog_fwd_loop','jog','walk']);clips.run=pick(retargeted,['sprint_loop','sprint','run']);clips.attack=pick(retargeted,['punch_cross','punch','attack']);clips.jump=pick(retargeted,['jump']);
      (a.animationGroups||[]).forEach(g=>g.stop());(a.meshes||[]).forEach(m=>m.setEnabled(false));
      oldParts.forEach(m=>m.setEnabled(false));if(handSocket)handSocket.setEnabled(false);const fallback=scene.getTransformNodeByName('CultivatorRig');if(fallback)fallback.setEnabled(false);
      play('idle');
      scene.onBeforeRenderObservable.add(()=>{const f=Math.abs(-joy.y+(keys.w?1:0)-(keys.s?1:0)),t=Math.abs(joy.x+(keys.d?1:0)-(keys.a?1:0)),moving=(f>.05||t>.15)&&!mounted;if(attackT>0&&clips.attack)play('attack');else if(player.position.y>.08&&clips.jump)play('jump');else if(moving&&f>.72&&clips.run)play('run');else if(moving)play('walk');else play('idle')});
      console.info('Rigged chibi player enabled');
    }catch(e){console.warn('Rigged player failed; procedural fallback kept',e)}
  }
  boot();
})();