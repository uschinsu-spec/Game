// Player Animation Pro - layered state machine for procedural chibi rig
// Runs AFTER rigged-player.js and overrides final bone pose each frame.
(()=>{
  const scene = window.GameRuntime?.scene;
  const rig = window.PlayerRig;
  if (!scene || !rig || window.__PLAYER_ANIMATION_PRO__) return;
  window.__PLAYER_ANIMATION_PRO__ = true;

  const PI = Math.PI;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp = (a,b,t)=>a+(b-a)*t;
  const smooth01 = t => { t=clamp(t,0,1); return t*t*(3-2*t); };
  const easeOut = t => 1-Math.pow(1-clamp(t,0,1),3);
  const easeIn = t => Math.pow(clamp(t,0,1),3);
  const expBlend = (speed,dt)=>1-Math.exp(-speed*dt);

  const bones = {
    hips:rig.hips, spine:rig.spine, chest:rig.chest, head:rig.head,
    armUL:rig.armUL, armUR:rig.armUR, armLL:rig.armLL, armLR:rig.armLR,
    handL:rig.handL, handR:rig.handR,
    thighL:rig.thighL, thighR:rig.thighR, shinL:rig.shinL, shinR:rig.shinR,
    footL:rig.footL, footR:rig.footR
  };

  const pose = {};
  for (const k of Object.keys(bones)) pose[k]={x:0,y:0,z:0};
  const target = {};
  for (const k of Object.keys(bones)) target[k]={x:0,y:0,z:0};

  let rootY=0, rootYTarget=0;
  let rootX=0, rootXTarget=0;
  let locomotionPhase=0;
  let idlePhase=0;
  let currentState='idle';
  let previousState='idle';
  let stateAge=0;
  let attackAge=99;
  let attackWasActive=false;
  let lastMoving=false;

  const zeroTargets=()=>{
    for(const k of Object.keys(target)){ target[k].x=0; target[k].y=0; target[k].z=0; }
    rootYTarget=0; rootXTarget=0;
  };
  const set=(k,x=0,y=0,z=0)=>{ const p=target[k]; p.x=x; p.y=y; p.z=z; };
  const add=(k,x=0,y=0,z=0)=>{ const p=target[k]; p.x+=x; p.y+=y; p.z+=z; };

  function buildIdle(dt){
    idlePhase += dt*2.15;
    const breath=Math.sin(idlePhase);
    const sway=Math.sin(idlePhase*0.53+0.8);
    rootYTarget = 0.010 + breath*0.012;
    rootXTarget = sway*0.006;
    set('hips', 0.015+breath*0.010, sway*0.018, sway*0.012);
    set('spine', -0.018-breath*0.012, -sway*0.022, -sway*0.010);
    set('chest', -0.025-breath*0.018, -sway*0.020, -sway*0.010);
    set('head', 0.012+breath*0.010, sway*0.028, sway*0.006);

    set('armUL', -0.10+breath*0.016, 0.03, -0.18+sway*0.018);
    set('armLL', -0.10, 0.02, -0.10);
    set('handL', 0.02, -0.03, 0.02);
    set('armUR', -0.22-breath*0.018, -0.02, 0.25-sway*0.018);
    set('armLR', -0.36, 0.04, -0.18);
    set('handR', -0.08, 0.06, -0.10);

    set('thighL', 0.025, 0, -0.025);
    set('thighR', -0.015, 0, 0.025);
    set('shinL', 0.02,0,0); set('shinR',0.01,0,0);
    set('footL', -0.015,0,0); set('footR',-0.010,0,0);
  }

  function buildRun(dt){
    const cadence=10.7;
    locomotionPhase += dt*cadence;
    const s=Math.sin(locomotionPhase), c=Math.cos(locomotionPhase);
    const s2=Math.sin(locomotionPhase+PI);
    const contactL=Math.max(0,c);
    const contactR=Math.max(0,-c);
    const liftL=Math.max(0,-c);
    const liftR=Math.max(0,c);

    rootYTarget = 0.025 + Math.abs(s)*0.045 - (contactL+contactR)*0.006;
    rootXTarget = Math.sin(locomotionPhase*0.5)*0.018;

    set('hips', 0.13, -s*0.10, -s*0.045);
    set('spine', -0.10, s*0.075, s*0.025);
    set('chest', -0.08, s*0.055, s*0.018);
    set('head', 0.045-Math.abs(s)*0.018, -s*0.028, -s*0.010);

    // Chibi run: thighs lead, knees fold during swing, ankles counter-rotate at contact.
    set('thighL', s*0.78-0.06, 0, -0.018);
    set('thighR', s2*0.78-0.06, 0, 0.018);
    set('shinL', liftL*0.92 + Math.max(0,s)*0.08, 0, 0);
    set('shinR', liftR*0.92 + Math.max(0,-s)*0.08, 0, 0);
    set('footL', -s*0.22 - contactL*0.10 + liftL*0.12, 0, 0);
    set('footR', s*0.22 - contactR*0.10 + liftR*0.12, 0, 0);

    // Counter-swing arms. Sword arm stays controlled instead of flailing.
    set('armUL', -s*0.54-0.05, 0.02, -0.17);
    set('armLL', -0.18 + Math.max(0,s)*0.34, 0, -0.08);
    set('handL', 0,0,-s*0.035);
    set('armUR', s*0.40-0.30, -0.04, 0.30);
    set('armLR', -0.48 + Math.max(0,-s)*0.20, 0.03, -0.18);
    set('handR', -0.12, 0.10, -0.08+s*0.025);
  }

  function buildAttack(dt){
    attackAge += dt;
    const d=0.62;
    const u=clamp(attackAge/d,0,1);

    // 0-24% anticipation, 24-58% strike, 58-100% recovery.
    let wind=0, hit=0, recover=0;
    if(u<0.24) wind=smooth01(u/0.24);
    else if(u<0.58){ wind=1; hit=easeOut((u-0.24)/0.34); }
    else { wind=1; hit=1; recover=smooth01((u-0.58)/0.42); }
    const power=(1-recover);
    const snap=hit*power;

    rootYTarget = -0.010*wind + 0.020*snap;
    rootXTarget = -0.022*wind + 0.030*snap;

    set('hips', 0.08*wind-0.04*snap, -0.42*wind+0.78*snap, -0.05*wind);
    set('spine', -0.08*wind-0.09*snap, 0.18*wind-0.42*snap, 0.03*wind);
    set('chest', -0.16*wind-0.12*snap, 0.34*wind-0.92*snap, 0.08*wind);
    set('head', 0.06*wind, -0.10*wind+0.24*snap, -0.03*wind);

    // Sword arm: raise behind shoulder, elbow loads, then wrist whips through.
    set('armUR', -0.42-1.05*wind+1.52*snap, -0.18*wind+0.24*snap, 0.62+0.48*wind-1.35*snap);
    set('armLR', -0.32-0.62*wind+0.46*snap, 0.05, -0.30-0.48*wind+0.62*snap);
    set('handR', -0.14-0.18*wind+0.36*snap, -0.10*wind+0.52*snap, -0.12-0.20*wind+0.28*snap);

    // Off-hand balances the torso.
    set('armUL', -0.18+0.12*wind-0.26*snap, 0.10*wind, -0.32-0.20*wind+0.18*snap);
    set('armLL', -0.20-0.18*wind+0.12*snap, 0, -0.10);
    set('handL', 0.02,0,-0.05);

    // Stable martial stance, front/back legs absorb strike.
    set('thighL', 0.24*wind-0.10*snap, 0, -0.08);
    set('shinL', 0.42*wind-0.18*snap, 0, 0);
    set('footL', -0.14*wind+0.06*snap,0,0);
    set('thighR', -0.18*wind+0.10*snap,0,0.06);
    set('shinR', 0.12*wind,0,0);
    set('footR', 0.06*wind,0,0);
  }

  function chooseState(){
    const attacking = (typeof attackT!=='undefined' && attackT>0);
    const moving = !!window.isPlayerMoving || window.PLAYER_MOTION_STATE==='moving';
    if(attacking && !attackWasActive) attackAge=0;
    attackWasActive=attacking;
    if(attackAge < 0.62) return 'attack';
    return moving ? 'run' : 'idle';
  }

  scene.onBeforeRenderObservable.add(()=>{
    const dt=clamp(scene.getEngine().getDeltaTime()/1000,0.001,0.05);
    zeroTargets();

    const next=chooseState();
    if(next!==currentState){ previousState=currentState; currentState=next; stateAge=0; }
    stateAge+=dt;

    if(currentState==='attack') buildAttack(dt);
    else if(currentState==='run') buildRun(dt);
    else buildIdle(dt);

    // Faster response entering attack/run, softer return to idle.
    let response = currentState==='attack' ? 28 : currentState==='run' ? 18 : 9;
    if(stateAge<0.12 && previousState!==currentState) response*=1.25;
    const a=expBlend(response,dt);

    for(const k of Object.keys(bones)){
      const p=pose[k], q=target[k], n=bones[k];
      p.x=lerp(p.x,q.x,a); p.y=lerp(p.y,q.y,a); p.z=lerp(p.z,q.z,a);
      n.rotation.set(p.x,p.y,p.z);
    }
    rootY=lerp(rootY,rootYTarget,a);
    rootX=lerp(rootX,rootXTarget,a);
    rig.root.position.y=rootY;
    rig.root.position.x=rootX;

    // Expose diagnostics for future GLB migration / tuning.
    window.PLAYER_ANIMATION_STATE=currentState;
    window.PLAYER_ANIMATION_DEBUG={state:currentState,stateAge,attackAge,locomotionPhase};
    lastMoving=currentState==='run';
  });

  console.info('[PlayerAnimationPro] State blending, locomotion, attack anticipation/recovery and foot cycle active.');
})();