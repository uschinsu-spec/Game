// Player Animation Pro v5 - GLB animation state bridge
(()=>{
  const scene=window.GameRuntime?.scene;
  const player=window.GameRuntime?.player;
  if(!scene||!player||window.__PLAYER_ANIMATION_PRO_V5__)return;
  window.__PLAYER_ANIMATION_PRO_V5__=true;
  window.__PLAYER_ANIMATION_PRO__=true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let prevPX=player.position.x,prevPZ=player.position.z,smoothedSpeed=0;
  let attackWasActive=false,attackAge=99,currentState='idle';
  let hitAge=99;
  window.triggerPlayerHitAnimation=()=>{hitAge=0;};

  function speed(dt){
    const dx=player.position.x-prevPX,dz=player.position.z-prevPZ;
    prevPX=player.position.x;prevPZ=player.position.z;
    const raw=Math.hypot(dx,dz)/Math.max(.001,dt);
    smoothedSpeed+=(raw-smoothedSpeed)*(1-Math.exp(-14*dt));
    return smoothedSpeed;
  }
  function applyState(next,moveSpeed){
    const ctl=window.PlayerAnimationController;
    if(!ctl)return;
    if(next!==currentState){
      currentState=next;
      const ratio=next==='run'?clamp(moveSpeed/8.8,.82,1.28):next==='walk'?clamp(moveSpeed/4,.8,1.2):1;
      ctl.play(next,ratio);
    }else if((next==='run'||next==='walk')&&ctl.current){
      ctl.current.speedRatio=next==='run'?clamp(moveSpeed/8.8,.82,1.28):clamp(moveSpeed/4,.8,1.2);
    }
    window.PLAYER_ANIMATION_STATE=next;
    window.PLAYER_MOTION_STATE=(next==='run'||next==='walk')?'moving':next;
  }

  scene.onBeforeRenderObservable.add(()=>{
    const dt=clamp(scene.getEngine().getDeltaTime()/1000,.001,.05);
    const moveSpeed=speed(dt);
    attackAge+=dt;hitAge+=dt;
    const attacking=(typeof attackT!=='undefined'&&attackT>0);
    if(attacking&&!attackWasActive)attackAge=0;
    attackWasActive=attacking;
    const moving=moveSpeed>.18||!!window.isPlayerMoving;
    let next='idle';
    if(hitAge<.42&&window.PlayerAnimationController?.clips?.hit)next='hit';
    else if(attackAge<.62&&window.PlayerAnimationController?.clips?.attack)next='attack';
    else if(moving)next=moveSpeed>4.4&&window.PlayerAnimationController?.clips?.run?'run':(window.PlayerAnimationController?.clips?.walk?'walk':'run');
    applyState(next,moveSpeed);
    window.PLAYER_ANIMATION_DEBUG={state:next,speed:moveSpeed,attackAge,hitAge,modelReady:!!window.PLAYER_MODEL_READY};
  });

  console.info('[PlayerAnimationPro v5] Authored GLB Idle/Walk/Run/Attack/Hit bridge active.');
})();
