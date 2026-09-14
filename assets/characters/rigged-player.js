(()=>{
  const cfg=window.PLAYER_RIG_CONFIG;if(!cfg)return;
  let current='';const clips={};
  const pick=(groups,names)=>{for(const n of names){const g=groups.find(x=>x.name.toLowerCase().includes(n.toLowerCase()));if(g)return g}return null};
  const splitUrl=url=>{const i=url.lastIndexOf('/');return {root:url.slice(0,i+1),file:url.slice(i+1)}};
  function retarget(sourceGroups,skeleton){const bones=new Map(skeleton.bones.map(b=>[b.name,b])),out=[];for(const src of sourceGroups){const g=new BABYLON.AnimationGroup('Player_'+src.name,scene);for(const ta of src.targetedAnimations){const target=ta.target&&bones.get(ta.target.name);if(target)g.addTargetedAnimation(ta.animation.clone(),target)}if(g.targetedAnimations.length)out.push(g);else g.dispose()}return out}
  function play(state){if(state===current)return;current=state;window.PLAYER_MOTION_STATE=state;for(const g of Object.values(clips))if(g&&g.isPlaying)g.stop();const g=clips[state]||clips.idle;if(g)g.start(state!=='attack'&&state!=='jump',1,g.from,g.to,false)}
  function addSword(handBone,ref){if(!handBone||!ref)return;const blade=BABYLON.MeshBuilder.CreateBox('SocketSwordBlade',{width:.055,height:1.05,depth:.028},scene);blade.material=bladeMat;blade.attachToBone(handBone,ref);blade.position.set(0,-.46,.06);blade.rotation.z=-.12;shadow.addShadowCaster(blade);const guard=BABYLON.MeshBuilder.CreateBox('SocketSwordGuard',{width:.28,height:.055,depth:.065},scene);guard.material=goldMat;guard.attachToBone(handBone,ref);guard.position.set(0,.05,.05);guard.rotation.z=-.12;shadow.addShadowCaster(guard)}
  async function boot(){try{
    const ch=splitUrl(cfg.characterUrl),c=await BABYLON.SceneLoader.ImportMeshAsync('',ch.root,ch.file,scene),skeleton=c.skeletons?.[0];if(!skeleton)throw new Error('missing skeleton');
    const root=c.meshes[0];root.name='ChibiPlayerRoot';root.parent=bodyRoot;root.rotation.y=Math.PI;root.scaling.set(cfg.scale.x,cfg.scale.y,cfg.scale.z);
    for(const m of c.meshes){m.isPickable=false;m.receiveShadows=true;if(m.getTotalVertices&&m.getTotalVertices()>0)shadow.addShadowCaster(m)}
    const bone=n=>skeleton.bones.find(b=>b.name===n),head=bone(cfg.sockets.head),ref=c.meshes.find(m=>m.skeleton===skeleton)||c.meshes[0],hand=bone(cfg.sockets.rightHand);
    if(head&&head.scale)try{head.scale(cfg.headScale,cfg.headScale,cfg.headScale,false)}catch(_){}
    addSword(hand,ref);
    window.PLAYER_SOCKETS={head,rightHand:hand,leftHand:bone(cfg.sockets.leftHand),rightFoot:bone(cfg.sockets.rightFoot),leftFoot:bone(cfg.sockets.leftFoot),skeleton,referenceMesh:ref};
    const au=splitUrl(cfg.animationUrl),a=await BABYLON.SceneLoader.ImportMeshAsync('',au.root,au.file,scene),groups=retarget(a.animationGroups||[],skeleton);
    clips.idle=pick(groups,['idle_loop','idle']);clips.walk=pick(groups,['jog_fwd_loop','jog','walk']);clips.run=pick(groups,['sprint_loop','sprint','run']);clips.attack=pick(groups,['punch_cross','punch','attack']);clips.jump=pick(groups,['jump']);
    for(const g of a.animationGroups||[])g.stop();for(const m of a.meshes||[])m.setEnabled(false);
    window.__RIGGED_PLAYER_ACTIVE__=true;
    let last=player.position.clone();play('idle');
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.max(.001,Math.min(.05,engine.getDeltaTime()/1000)),dx=player.position.x-last.x,dz=player.position.z-last.z,speed=Math.hypot(dx,dz)/dt;last.copyFrom(player.position);if(attackT>0&&clips.attack)play('attack');else if(player.position.y>.08&&clips.jump)play('jump');else if(speed>1.2&&clips.run)play('run');else if(speed>.12)play('walk');else play('idle')});
    console.info('Rigged GLB player active');
  }catch(e){window.__RIGGED_PLAYER_ACTIVE__=false;window.PLAYER_MOTION_STATE='error';console.warn('Rigged player failed',e)}}
  boot();
})();