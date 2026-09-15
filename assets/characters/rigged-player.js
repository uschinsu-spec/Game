// Rigged GLB Player V16.1 - production integration
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

  const MODEL_ROOT='./assets/characters/';
  const MODEL_FILE='model-rigged.glb';
  const root=new BABYLON.TransformNode('XianxiaChibiRig',scene);
  root.parent=bodyRoot;

  const key=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const findNode=(nodes,...names)=>{
    const wanted=names.map(key);
    return nodes.find(n=>wanted.some(w=>key(n.name)===w||key(n.name).endsWith(w)))||null;
  };
  const findGroup=(groups,names)=>{
    const wanted=names.map(key);
    return groups.find(g=>wanted.some(w=>key(g.name).includes(w)))||null;
  };

  let targetAngle=Number.isFinite(player.rotation?.y)?player.rotation.y:0;
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
    if(dir.lengthSquared()<.000001)return null;
    dir.normalize();
    const mesh=BABYLON.MeshBuilder.CreateBox('PlayerSwordSlash',{width:.12,height:.72,depth:.04},scene);
    mesh.material=projectileMat;mesh.isPickable=false;mesh.position.copyFrom(origin);mesh.position.y+=1;
    mesh.rotation.y=Math.atan2(dir.x,dir.z);mesh.rotation.z=-.65;
    projectiles.push({mesh,dir,speed:Number(opts.speed)||18,life:Number(opts.life)||.55});
    return mesh;
  };

  const configureMesh=mesh=>{
    if(!mesh||!mesh.getTotalVertices||mesh.getTotalVertices()<=0)return;
    mesh.isPickable=false;mesh.receiveShadows=true;
    if(shadow)shadow.addShadowCaster(mesh);
  };

  // Babylon SceneLoader requires rootUrl and filename separately for reliable GLB plugin detection.
  BABYLON.SceneLoader.ImportMeshAsync('',MODEL_ROOT,MODEL_FILE,scene).then(result=>{
    const importedRoots=result.meshes.filter(m=>!m.parent);
    importedRoots.forEach(m=>m.parent=root);
    const renderMeshes=result.meshes.filter(m=>m.getTotalVertices?.()>0);
    renderMeshes.forEach(configureMesh);
    if(!renderMeshes.length)throw new Error('GLB contains no renderable player mesh');

    // Normalize visual height only. PlayerRoot remains the gameplay/camera anchor.
    let minY=Infinity,maxY=-Infinity;
    renderMeshes.forEach(m=>{
      m.computeWorldMatrix(true);
      const b=m.getBoundingInfo().boundingBox;
      minY=Math.min(minY,b.minimumWorld.y);maxY=Math.max(maxY,b.maximumWorld.y);
    });
    const authoredHeight=Math.max(.001,maxY-minY);
    const scale=2.72/authoredHeight;
    root.scaling.setAll(scale);
    root.position.y=-minY*scale;

    const nodes=[...(result.transformNodes||[]),...(result.meshes||[])];
    const hips=findNode(nodes,'Hips','mixamorig:Hips');
    const spine=findNode(nodes,'Spine','mixamorig:Spine');
    const chest=findNode(nodes,'Chest','Spine1','Spine2','UpperChest');
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
    const backParent=chest||spine||root;
    const backSocket=new BABYLON.TransformNode('Socket_BackWeapon',scene);
    backSocket.parent=backParent;backSocket.position.set(.18,.10,.14);backSocket.rotation.set(0,0,-.28);

    const groups=result.animationGroups||[];
    const clips={
      idle:findGroup(groups,['idle']),walk:findGroup(groups,['walk']),run:findGroup(groups,['run']),
      attack:findGroup(groups,['attack','slash','sword']),hit:findGroup(groups,['hit','hurt','damage'])
    };
    const loops=new Set([clips.idle,clips.walk,clips.run].filter(Boolean));
    groups.forEach(g=>{try{g.stop();g.reset();g.loopAnimation=loops.has(g);}catch(_){}});

    window.PlayerRig={root,hips,spine,chest,head,armUL,armUR,armLL,armLR,handL,handR,thighL,thighR,shinL,shinR,footL,footR,weaponSocket,backSocket,modelRoot:importedRoots[0]||result.meshes[0]||root,skeletons:result.skeletons||[],animationGroups:groups};
    let current=null;
    const play=(name,speed=1)=>{
      const g=clips[name];if(!g)return false;
      if(g===current){g.speedRatio=speed;return true;}
      if(current){try{current.stop();}catch(_){}}
      current=g;g.loopAnimation=loops.has(g);g.speedRatio=speed;
      try{g.start(g.loopAnimation,speed,g.from,g.to,false);}catch(_){try{g.play(g.loopAnimation);}catch(__){return false;}}
      window.PLAYER_ANIMATION_STATE=name;
      window.PLAYER_MOTION_STATE=(name==='run'||name==='walk')?'moving':name;
      return true;
    };
    window.PlayerAnimationController={clips,play,stopAll:()=>groups.forEach(g=>{try{g.stop();g.reset();}catch(_){}}),get current(){return current;}};
    if(!clips.idle)console.warn('[RiggedPlayer V16.1] Idle clip not found',groups.map(g=>g.name));
    play('idle');
    window.PLAYER_MODEL_READY=true;
    window.PLAYER_MODEL_DIAGNOSTICS={meshes:renderMeshes.length,skeletons:(result.skeletons||[]).length,animations:groups.map(g=>g.name),height:authoredHeight,scale,weaponSocket:weaponSocket?.name||null,backSocket:backSocket.name};
    window.dispatchEvent(new CustomEvent('player-model-ready'));
    console.info('[RiggedPlayer V16.1] GLB ready',window.PLAYER_MODEL_DIAGNOSTICS);
  }).catch(error=>{
    window.PLAYER_MODEL_READY=false;
    window.PLAYER_MODEL_ERROR=String(error?.message||error);
    console.error('[RiggedPlayer V16.1] GLB load failed',error);
  });

  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.max(.001,Math.min(.05,scene.getEngine().getDeltaTime()/1000));
    let d=targetAngle-player.rotation.y;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;
    player.rotation.y+=d*(1-Math.exp(-18*dt));
    for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.life-=dt;if(p.life<=0){p.mesh.dispose();projectiles.splice(i,1);continue;}p.mesh.position.addInPlace(p.dir.scale(p.speed*dt));p.mesh.material.alpha=Math.min(.78,p.life*2.2);}
  });
})();
