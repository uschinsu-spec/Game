// Rigged GLB Player V17 - full-body authored animation controller
(()=>{
  const scene=window.GameRuntime?.scene, player=window.GameRuntime?.player, shadow=window.GameRuntime?.shadow||null;
  const bodyRoot=scene?.getTransformNodeByName('SkeletonRoot')||player;
  if(!scene||!player||!bodyRoot||window.__RIGGED_PLAYER_ACTIVE__)return;
  window.__RIGGED_PLAYER_ACTIVE__=window.RIGGED_PLAYER_ACTIVE=true;
  window.__PLAYER_FULL_BODY_RIG__=window.PLAYER_FULL_BODY_RIG=true;
  window.PLAYER_MODEL_READY=false; window.PLAYER_MOTION_STATE='idle'; window.PLAYER_ANIMATION_STATE='idle';
  const root=new BABYLON.TransformNode('XianxiaChibiRig',scene); root.parent=bodyRoot;
  const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const findNode=(nodes,...names)=>{const w=names.map(norm);return nodes.find(n=>w.some(x=>norm(n.name)===x||norm(n.name).endsWith(x)))||null};
  let targetAngle=Number.isFinite(player.rotation?.y)?player.rotation.y:0;
  window.setPlayerTargetAngle=a=>{if(Number.isFinite(a))targetAngle=a};
  const projectileMat=new BABYLON.StandardMaterial('PlayerSlashProjectileMat',scene); projectileMat.diffuseColor=BABYLON.Color3.FromHexString('#bff6ff'); projectileMat.emissiveColor=BABYLON.Color3.FromHexString('#2798b7'); projectileMat.specularColor=BABYLON.Color3.Black(); projectileMat.alpha=.78;
  const projectiles=[];
  window.spawnSwordSlashProjectile=(origin,target,opts={})=>{if(!origin||!target)return null;const dir=target.subtract(origin);dir.y=0;if(dir.lengthSquared()<1e-6)return null;dir.normalize();const mesh=BABYLON.MeshBuilder.CreateBox('PlayerSwordSlash',{width:.12,height:.72,depth:.04},scene);mesh.material=projectileMat;mesh.isPickable=false;mesh.position.copyFrom(origin);mesh.position.y+=1;mesh.rotation.y=Math.atan2(dir.x,dir.z);mesh.rotation.z=-.65;projectiles.push({mesh,dir,speed:Number(opts.speed)||18,life:Number(opts.life)||.55});return mesh};
  BABYLON.SceneLoader.ImportMeshAsync('','./assets/characters/','model-rigged.glb',scene).then(result=>{
    const importedRoots=result.meshes.filter(m=>!m.parent); importedRoots.forEach(m=>m.parent=root);
    const renderMeshes=result.meshes.filter(m=>m.getTotalVertices?.()>0); if(!renderMeshes.length)throw new Error('GLB contains no renderable mesh');
    renderMeshes.forEach(m=>{m.isPickable=false;m.receiveShadows=true;if(shadow)shadow.addShadowCaster(m)});
    let minY=Infinity,maxY=-Infinity; renderMeshes.forEach(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;minY=Math.min(minY,b.minimumWorld.y);maxY=Math.max(maxY,b.maximumWorld.y)}); const authoredHeight=Math.max(.001,maxY-minY),scale=2.72/authoredHeight;root.scaling.setAll(scale);root.position.y=-minY*scale;
    const nodes=[...(result.transformNodes||[]),...(result.meshes||[])];
    const hips=findNode(nodes,'Hips','mixamorig:Hips'),spine=findNode(nodes,'Spine','mixamorig:Spine'),chest=findNode(nodes,'Chest','Spine1','Spine2','UpperChest'),head=findNode(nodes,'Head');
    const armUL=findNode(nodes,'UpperArm.L','UpperArmL','LeftArm'),armUR=findNode(nodes,'UpperArm.R','UpperArmR','RightArm'),armLL=findNode(nodes,'Forearm.L','ForearmL','LeftForeArm'),armLR=findNode(nodes,'Forearm.R','ForearmR','RightForeArm'),handL=findNode(nodes,'Hand.L','HandL','LeftHand'),handR=findNode(nodes,'Hand.R','HandR','RightHand'),thighL=findNode(nodes,'Thigh.L','ThighL','LeftUpLeg'),thighR=findNode(nodes,'Thigh.R','ThighR','RightUpLeg'),shinL=findNode(nodes,'Shin.L','ShinL','LeftLeg'),shinR=findNode(nodes,'Shin.R','ShinR','RightLeg'),footL=findNode(nodes,'Foot.L','FootL','LeftFoot'),footR=findNode(nodes,'Foot.R','FootR','RightFoot');
    const weaponSocket=findNode(nodes,'WeaponSocket.R','WeaponSocketR','RightWeaponSocket')||handR; const backSocket=new BABYLON.TransformNode('Socket_BackWeapon',scene);backSocket.parent=chest||spine||root;backSocket.position.set(.18,.10,.14);backSocket.rotation.set(0,0,-.28);
    const groups=result.animationGroups||[];
    // Match exact names first, then common exporter prefixes/suffixes.
    const pick=(...aliases)=>{const a=aliases.map(norm);return groups.find(g=>a.includes(norm(g.name)))||groups.find(g=>a.some(x=>norm(g.name).includes(x)))||null};
    const clips={idle:pick('Idle','Idle_01','StandingIdle'),walk:pick('Walk','Walking','WalkForward'),run:pick('Run','Running','RunForward'),attack:pick('Attack','Attack_01','SwordAttack','Slash','MeleeAttack'),hit:pick('Hit','HitReact','Hurt','Damage','GetHit')};
    const loops=new Set([clips.idle,clips.walk,clips.run].filter(Boolean)); groups.forEach(g=>{try{g.stop();g.reset();g.loopAnimation=loops.has(g)}catch(_){}});
    let current=null,currentName='';
    const stopOthers=keep=>groups.forEach(g=>{if(g!==keep)try{g.stop();g.reset()}catch(_){}});
    const play=(name,speed=1,restart=false)=>{const g=clips[name];if(!g)return false;if(g===current&&!restart){g.speedRatio=speed;return true}stopOthers(g);if(restart)try{g.stop();g.reset()}catch(_){};current=g;currentName=name;g.loopAnimation=loops.has(g);g.speedRatio=speed;try{g.start(g.loopAnimation,speed,g.from,g.to,false)}catch(_){try{g.play(g.loopAnimation)}catch(__){return false}}window.PLAYER_ANIMATION_STATE=name;window.PLAYER_MOTION_STATE=(name==='walk'||name==='run')?'moving':name;return true};
    const duration=name=>{const g=clips[name];if(!g)return 0;const fps=g.targetedAnimations?.[0]?.animation?.framePerSecond||30;return Math.max(.05,Math.abs((g.to-g.from)/fps))};
    window.PlayerRig={root,hips,spine,chest,head,armUL,armUR,armLL,armLR,handL,handR,thighL,thighR,shinL,shinR,footL,footR,weaponSocket,backSocket,modelRoot:importedRoots[0]||result.meshes[0]||root,skeletons:result.skeletons||[],animationGroups:groups};
    window.PlayerAnimationController={clips,play,duration,stopAll:()=>{stopOthers(null);current=null;currentName=''},get current(){return current},get currentName(){return currentName}};
    play('idle',1,true); window.PLAYER_MODEL_READY=true;
    window.PLAYER_MODEL_DIAGNOSTICS={meshes:renderMeshes.length,skeletons:(result.skeletons||[]).length,animations:groups.map(g=>({name:g.name,from:g.from,to:g.to,targets:g.targetedAnimations?.length||0})),mapped:Object.fromEntries(Object.entries(clips).map(([k,g])=>[k,g?.name||null])),height:authoredHeight,scale,weaponSocket:weaponSocket?.name||null};
    window.dispatchEvent(new CustomEvent('player-model-ready'));console.info('[RiggedPlayer V17] ready',window.PLAYER_MODEL_DIAGNOSTICS);
  }).catch(e=>{window.PLAYER_MODEL_READY=false;window.PLAYER_MODEL_ERROR=String(e?.message||e);console.error('[RiggedPlayer V17]',e)});
  scene.onBeforeRenderObservable.add(()=>{const dt=Math.max(.001,Math.min(.05,scene.getEngine().getDeltaTime()/1000));let d=targetAngle-player.rotation.y;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;player.rotation.y+=d*(1-Math.exp(-18*dt));for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.life-=dt;if(p.life<=0){p.mesh.dispose();projectiles.splice(i,1);continue}p.mesh.position.addInPlace(p.dir.scale(p.speed*dt));p.mesh.material.alpha=Math.min(.78,p.life*2.2)}});
})();