// Player Animation Pro v4 - corrected arm pose + velocity-driven locomotion
(()=>{
  const scene=window.GameRuntime?.scene;
  const rig=window.PlayerRig;
  const player=window.GameRuntime?.player;
  if(!scene||!rig||!player||window.__PLAYER_ANIMATION_PRO_V4__)return;
  window.__PLAYER_ANIMATION_PRO_V4__=true;
  window.__PLAYER_ANIMATION_PRO__=true;

  const PI=Math.PI;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth01=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const easeOut=t=>1-Math.pow(1-clamp(t,0,1),3);
  const expBlend=(speed,dt)=>1-Math.exp(-speed*dt);

  const bones={hips:rig.hips,spine:rig.spine,chest:rig.chest,head:rig.head,armUL:rig.armUL,armUR:rig.armUR,armLL:rig.armLL,armLR:rig.armLR,handL:rig.handL,handR:rig.handR,thighL:rig.thighL,thighR:rig.thighR,shinL:rig.shinL,shinR:rig.shinR,footL:rig.footL,footR:rig.footR};
  const pose={},target={};
  for(const k of Object.keys(bones)){pose[k]={x:0,y:0,z:0};target[k]={x:0,y:0,z:0};}

  let rootY=0,rootYTarget=0,rootX=0,rootXTarget=0;
  let locomotionPhase=0,idlePhase=0,currentState='idle',previousState='idle',stateAge=0,attackAge=99,attackWasActive=false;
  let prevPX=player.position.x,prevPZ=player.position.z,smoothedSpeed=0;

  const zeroTargets=()=>{for(const k of Object.keys(target)){target[k].x=0;target[k].y=0;target[k].z=0;}rootYTarget=0;rootXTarget=0;};
  const set=(k,x=0,y=0,z=0)=>{const p=target[k];p.x=x;p.y=y;p.z=z;};

  function buildIdle(dt){
    idlePhase+=dt*2.0;
    const b=Math.sin(idlePhase),s=Math.sin(idlePhase*0.55+0.7);
    rootYTarget=0.008+b*0.010;
    set('hips',0.01,s*0.015,s*0.008);
    set('spine',-0.02,-s*0.018,-s*0.008);
    set('chest',-0.03-b*0.012,-s*0.015,0);
    set('head',0.015+b*0.008,s*0.025,0);

    // Arms hang naturally beside torso instead of T-pose.
    set('armUL',-0.08,0,1.08);
    set('armLL',-0.18,0,0.12);
    set('handL',0.04,0,-0.04);
    set('armUR',-0.18,0,-1.02);
    set('armLR',-0.34,0,-0.16);
    set('handR',-0.10,0,0.06);

    set('thighL',0.02,0,-0.015); set('thighR',-0.01,0,0.015);
    set('shinL',0.02,0,0); set('shinR',0.01,0,0);
    set('footL',-0.01,0,0); set('footR',-0.01,0,0);
  }

  function buildRun(dt,speed){
    const speed01=clamp(speed/8.8,0.35,1.25);
    locomotionPhase+=dt*(8.6+speed01*4.8);
    const s=Math.sin(locomotionPhase), c=Math.cos(locomotionPhase);
    const swingL=s, swingR=-s;
    const kneeL=Math.max(0,-c);
    const kneeR=Math.max(0,c);
    const stride=0.88*clamp(speed01,0.55,1.12);

    rootYTarget=0.018+Math.abs(s)*0.060;
    rootXTarget=Math.sin(locomotionPhase*0.5)*0.012;
    set('hips',0.16,-s*0.12,-s*0.045);
    set('spine',-0.11,s*0.08,s*0.025);
    set('chest',-0.09,s*0.06,s*0.018);
    set('head',0.055,-s*0.035,-s*0.01);

    // Strong, visible leg cycle: hip swing + knee lift + ankle plant.
    set('thighL',swingL*stride-0.10,0,-0.03);
    set('thighR',swingR*stride-0.10,0,0.03);
    set('shinL',kneeL*1.12+Math.max(0,swingL)*0.10,0,0);
    set('shinR',kneeR*1.12+Math.max(0,swingR)*0.10,0,0);
    set('footL',-swingL*0.28-kneeL*0.16,0,0);
    set('footR',-swingR*0.28-kneeR*0.16,0,0);

    // Arms remain down and swing around that resting pose.
    set('armUL',-0.10-s*0.48,0,1.00);
    set('armLL',-0.22+Math.max(0,s)*0.28,0,0.10);
    set('handL',0,0,-0.04);
    set('armUR',-0.28+s*0.34,0,-0.92);
    set('armLR',-0.42+Math.max(0,-s)*0.18,0,-0.14);
    set('handR',-0.10,0,0.05);
  }

  function buildAttack(dt){
    attackAge+=dt;
    const d=0.62,u=clamp(attackAge/d,0,1);
    let wind=0,hit=0,recover=0;
    if(u<0.24)wind=smooth01(u/0.24);
    else if(u<0.58){wind=1;hit=easeOut((u-0.24)/0.34);}
    else{wind=1;hit=1;recover=smooth01((u-0.58)/0.42);}
    const power=1-recover,snap=hit*power;

    rootYTarget=-0.01*wind+0.018*snap;
    set('hips',0.08*wind-0.04*snap,-0.42*wind+0.78*snap,-0.05*wind);
    set('spine',-0.08*wind-0.09*snap,0.18*wind-0.42*snap,0.03*wind);
    set('chest',-0.16*wind-0.12*snap,0.34*wind-0.92*snap,0.08*wind);
    set('head',0.06*wind,-0.10*wind+0.24*snap,0);

    // Sword arm starts from lowered pose, then raises/slashes; no T-pose.
    set('armUR',-0.32-1.05*wind+1.48*snap,-0.12*wind,-0.92+1.72*wind-1.28*snap);
    set('armLR',-0.38-0.56*wind+0.44*snap,0,-0.16-0.36*wind+0.46*snap);
    set('handR',-0.12-0.16*wind+0.30*snap,0.42*snap,0.05-0.18*wind+0.22*snap);

    set('armUL',-0.12+0.08*wind-0.22*snap,0,0.96-0.35*wind+0.18*snap);
    set('armLL',-0.20-0.14*wind,0,0.08);
    set('handL',0,0,-0.04);

    set('thighL',0.28*wind-0.12*snap,0,-0.08);
    set('shinL',0.48*wind-0.18*snap,0,0);
    set('footL',-0.16*wind+0.06*snap,0,0);
    set('thighR',-0.20*wind+0.12*snap,0,0.06);
    set('shinR',0.16*wind,0,0);
    set('footR',0.06*wind,0,0);
  }

  function movementSpeed(dt){
    const dx=player.position.x-prevPX,dz=player.position.z-prevPZ;
    prevPX=player.position.x;prevPZ=player.position.z;
    const raw=Math.hypot(dx,dz)/Math.max(dt,0.001);
    smoothedSpeed=lerp(smoothedSpeed,raw,expBlend(14,dt));
    return smoothedSpeed;
  }

  scene.onBeforeRenderObservable.add(()=>{
    const dt=clamp(scene.getEngine().getDeltaTime()/1000,0.001,0.05);
    zeroTargets();
    const speed=movementSpeed(dt);
    const attacking=(typeof attackT!=='undefined'&&attackT>0);
    if(attacking&&!attackWasActive)attackAge=0;
    attackWasActive=attacking;
    const movingByVelocity=speed>0.18;
    const movingFlag=!!window.isPlayerMoving;
    const next=(attackAge<0.62)?'attack':((movingByVelocity||movingFlag)?'run':'idle');
    if(next!==currentState){previousState=currentState;currentState=next;stateAge=0;}
    stateAge+=dt;

    if(currentState==='attack')buildAttack(dt);
    else if(currentState==='run')buildRun(dt,speed);
    else buildIdle(dt);

    let response=currentState==='attack'?30:currentState==='run'?22:11;
    if(stateAge<0.10&&previousState!==currentState)response*=1.3;
    const a=expBlend(response,dt);
    for(const k of Object.keys(bones)){
      const p=pose[k],q=target[k],n=bones[k];
      p.x=lerp(p.x,q.x,a);p.y=lerp(p.y,q.y,a);p.z=lerp(p.z,q.z,a);
      n.rotation.set(p.x,p.y,p.z);
    }
    rootY=lerp(rootY,rootYTarget,a);rootX=lerp(rootX,rootXTarget,a);
    rig.root.position.y=rootY;rig.root.position.x=rootX;
    window.PLAYER_MOTION_STATE=currentState==='run'?'moving':currentState;
    window.PLAYER_ANIMATION_STATE=currentState;
    window.PLAYER_ANIMATION_DEBUG={state:currentState,speed,stateAge,attackAge,locomotionPhase};
  });

  console.info('[PlayerAnimationPro v4] Corrected lowered arms + velocity-driven leg locomotion active.');
})();