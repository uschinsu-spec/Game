// Rigged GLB Player V16 - model-rigged.glb integration
(()=>{
  const scene=window.GameRuntime?.scene;
  const player=window.GameRuntime?.player;
  const shadow=window.GameRuntime?.shadow||null;
  const bodyRoot=scene?.getTransformNodeByName('SkeletonRoot')||player;
  if(!scene||!player||!bodyRoot||window.__RIGGED_PLAYER_ACTIVE__)return;

  window.__RIGGED_PLAYER_ACTIVE__=true;
  window.RIGGED_PLAYER_ACTIVE=true;
  window.__PLAYER_FULL_BODY_RIG__=true;
  window.PLAYER_FULL_BODY_RIG=true;
  window.PLAYER_MODEL_READY=false;
  window.PLAYER_MOTION_STATE='idle';
  window.PLAYER_ANIMATION_STATE='idle';

  const MODEL_URL='./assets/characters/model-rigged.glb';
  const root=new BABYLON.TransformNode('XianxiaChibiRig',scene);
  root.parent=bodyRoot;

  const nameKey=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const findNode=(all,...candidates)=>{
    const wanted=candidates.map(nameKey);
    return all.find(n=>wanted.some(w=>nameKey(n.name)===w||nameKey(n.name).endsWith(w)))||null;
  };
  const stopAll=groups=>groups.forEach(g=>{try{g.stop();g.reset();}catch(_){}});
  const findGroup=(groups,keys)=>{
    const k=keys.map(nameKey);
    return groups.find(g=>k.some(x=>nameKey(g.name).includes(x)))||null;
  };

  let targetAngle=Number.isFinite(player.rotation.y)?player.rotation.y:0;
  window.setPlayerTargetAngle=angle=>{if(Number.isFinite(angle))targetAngle=angle;};

  const projectileMat=new BABYLON.StandardMaterial('PlayerSlashProjectileMat',scene);
  projectileMat.diffuseColor=BABYLON.Color3.FromHexString('#bff6ff');
  projectileMat.emissiveColor=BABYLON.Color3.FromHexString('#2798b7');
  projectileMat.specularColor=BABYLON.Color3.Black();
  projectileMat.alpha=.78;
  const projectiles=[];
  window.spawnSwordSlashProjectile=(origin,target,opts={})=>{
    if(!origin||!target)return null;
    const dir=target.subtract(origin);dir.y=0;
    const len=dir.length();if(len<.001)return null;dir.normalize();
    const m=BABYLON.MeshBuilder.CreateBox('PlayerSwordSlash',{width:.12,height:.72,depth:.04},scene);
    m.material=projectileMat;m.isPickable=false;m.position.copyFrom(origin);m.position.y+=1.0;
    m.rotation.y=Math.atan2(dir.x,dir.z);m.rotation.z=-.65;
    const speed=Number(opts.speed)||18;projectiles.push({mesh:m,dir,speed,life:Number(opts.life)||.55});
    return m;
  };

  function attachAuxSockets(nodes){
    const right=findNode(nodes,'WeaponSocket.R','WeaponSocketR','RightHandSocket','Hand.R','HandR');
    const chest=findNode(nodes,'Chest','Spine2','UpperChest','Spine_02')||findNode(nodes,'Spine');
    const back=new BABYLON.TransformNode('Socket_BackWeapon',scene);back.parent=chest||root;back.position.set(.18,.10,.14);back.rotation.set(0,0,-.28);
    window.PlayerRig.weaponSocket=right||findNode(nodes,'Hand.R','HandR');
    window.PlayerRig.backSocket=back;
  }

  function configureMesh(mesh){
    if(!mesh||mesh===root)return;
    mesh.isPickable=false;
    mesh.receiveShadows=true;
    if(shadow&&mesh.getTotalVertices?.()>0)shadow.addShadowCaster(mesh);
  }

  BABYLON.SceneLoader.ImportMeshAsync('',MODEL_URL,'',scene).then(result=>{
    const importedRoots=result.meshes.filter(m=>!m.parent);
    importedRoots.forEach(m=>{m.parent=root;});

    // Normalize authored character to the existing gameplay footprint without touching PlayerRoot.
    const renderMeshes=result.meshes.filter(m=>m.getTotalVertices&&m.getTotalVertices()>0);
    renderMeshes.forEach(configureMesh);
    let min=new BABYLON.Vector3(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY);
    let max=new BABYLON.Vector3(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY);
    renderMeshes.forEach(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;min=BABYLON.Vector3.Minimize(min,b.minimumWorld);max=BABYLON.Vector3.Maximize(max,b.maximumWorld);});
    const h=Math.max(.001,max.y-min.y);const desiredHeight=2.72;const s=desiredHeight/h;root.scaling.setAll(s);
    root.position.y=-min.y*s;

    const nodes=[...result.transformNodes,...result.meshes];
    const hips=findNode(nodes,'Hips','mixamorig:Hips');
    const spine=findNode(nodes,'Spine','mixamorig:Spine');
    const chest=findNode(nodes,'Chest','Spine1','Spine2','UpperChest');
    const neck=findNode(nodes,'Neck');
    const head=findNode(nodes,'Head');
    const armUL=findNode(nodes,'UpperArm.L','UpperArmL','LeftArm','mixamorig:LeftArm');
    const armUR=findNode(nodes,'UpperArm.R','UpperArmR','RightArm','mixamorig:RightArm');
    const armLL=findNode(nodes,'Forearm.L','ForearmL','LeftForeArm','mixamorig:LeftForeArm');
    const armLR=findNode(nodes,'Forearm.R','ForearmR','RightForeArm','mixamorig:RightForeArm');
    const handL=findNode(nodes,'Hand.L','HandL','LeftHand','mixamorig:LeftHand');
    const handR=findNode(nodes,'Hand.R','HandR','RightHand','mixamorig:RightHand');
    const thighL=findNode(nodes,'Thigh.L','ThighL','LeftUpLeg','mixamorig:LeftUpLeg');
    const thighR=findNode(nodes,'Thigh.R','ThighR','RightUpLeg','mixamorig:RightUpLeg');
    const shinL=findNode(nodes,'Shin.L','ShinL','LeftLeg','mixamorig:LeftLeg');
    const shinR=findNode(nodes,'Shin.R','ShinR','RightLeg','mixamorig:RightLeg');
    const footL=findNode(nodes,'Foot.L','FootL','LeftFoot','mixamorig:LeftFoot');
    const footR=findNode(nodes,'Foot.R','FootR','RightFoot','mixamorig:RightFoot');
    const weaponSocket=findNode(nodes,'WeaponSocket.R','WeaponSocketR','RightWeaponSocket')||handR;

    window.PlayerRig={
      root,hips,spine,chest,head,armUL,armUR,armLL,armLR,handL,handR,thighL,thighR,shinL,shinR,footL,footR,
      weaponSocket,backSocket:null,modelRoot:importedRoots[0]||result.meshes[0]||root,skeletons:result.skeletons,animationGroups:result.animationGroups
    };
    attachAuxSockets(nodes);

    const groups=result.animationGroups||[];
    const clips={
      idle:findGroup(groups,['idle']),
      walk:findGroup(groups,['walk']),
      run:findGroup(groups,['run']),
      attack:findGroup(groups,['attack','slash','sword']),
      hit:findGroup(groups,['hit','hurt','damage'])
    };
    const loop=new Set([clips.idle,clips.walk,clips.run].filter(Boolean));
    groups.forEach(g=>{try{g.stop();g.reset();g.loopAnimation=loop.has(g);}catch(_){}});
    let current=null;
    const play=(name,speed=1)=>{
      const g=clips[name];if(!g||g===current)return;
      if(current){try{current.stop();}catch(_){}}
      current=g;g.loopAnimation=loop.has(g);g.speedRatio=speed;
      try{g.start(g.loopAnimation,speed,g.from,g.to,false);}catch(_){try{g.play(g.loopAnimation);}catch(__){}}
      window.PLAYER_ANIMATION_STATE=name;
      window.PLAYER_MOTION_STATE=name==='run'||name==='walk'?'moving':name;
    };
    window.PlayerAnimationController={clips,play,stopAll:()=>stopAll(groups),get current(){return current;}};
    play('idle');
    window.PLAYER_MODEL_READY=true;
    window.dispatchEvent(new CustomEvent('player-model-ready'));
    console.info('[RiggedPlayer V16] model-rigged.glb loaded with authored skeleton/animations.',Object.keys(clips).filter(k=>clips[k]));
  }).catch(error=>{
    window.PLAYER_MODEL_ERROR=String(error?.message||error);
    console.error('[RiggedPlayer V16] Failed to load model-rigged.glb',error);
  });

  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.max(.001,Math.min(.05,scene.getEngine().getDeltaTime()/1000));
    let d=targetAngle-player.rotation.y;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;
    player.rotation.y+=d*(1-Math.exp(-18*dt));
    for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.life-=dt;if(p.life<=0){p.mesh.dispose();projectiles.splice(i,1);continue;}p.mesh.position.addInPlace(p.dir.scale(p.speed*dt));p.mesh.material.alpha=Math.min(.78,p.life*2.2);}
  });
})();
