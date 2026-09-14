// Player Upper Body Animation v1
// Final animation layer: soft running arms + visible two-hand skill casts.
(()=>{
  const scene=window.GameRuntime?.scene;
  const rig=window.PlayerRig;
  if(!scene||!rig||window.__PLAYER_UPPERBODY_ANIM_V1__)return;
  window.__PLAYER_UPPERBODY_ANIM_V1__=true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const blend=(s,dt)=>1-Math.exp(-s*dt);

  let runPhase=0;
  let castSkill=-1;
  let castAge=99;
  let castDuration=.86;
  let lastActive=-1;
  const current={
    armUL:{x:0,y:0,z:0},armUR:{x:0,y:0,z:0},
    armLL:{x:0,y:0,z:0},armLR:{x:0,y:0,z:0},
    handL:{x:0,y:0,z:0},handR:{x:0,y:0,z:0}
  };

  const setRot=(node,p,t)=>{
    node.rotation.x=lerp(node.rotation.x,p.x,t);
    node.rotation.y=lerp(node.rotation.y,p.y,t);
    node.rotation.z=lerp(node.rotation.z,p.z,t);
  };

  function beginCast(idx){
    castSkill=idx;
    castAge=0;
    window.PLAYER_CAST_STATE={active:true,skill:idx};
  }
  window.triggerPlayerSkillCast=(idx,duration=.86)=>{
    castDuration=Math.max(.5,Number(duration)||.86);
    beginCast(Number.isFinite(idx)?idx:0);
  };

  function detectSkill(){
    const cards=[...document.querySelectorAll('.ulala-skill-card')];
    if(cards.length<4)return;
    const idx=cards.findIndex(x=>x.classList.contains('active'));
    if(idx>=0&&idx!==lastActive){ lastActive=idx; beginCast(idx); }
  }
  setTimeout(()=>{
    const cards=[...document.querySelectorAll('.ulala-skill-card')];
    cards.forEach(c=>new MutationObserver(detectSkill).observe(c,{attributes:true,attributeFilter:['class']}));
  },300);

  function runPose(dt){
    runPhase+=dt*10.6;
    const s=Math.sin(runPhase);
    const e=Math.sin(runPhase-.6);
    const w=Math.sin(runPhase-1.0);
    return {
      armUL:{x:-.16-s*.34,y:.04*s,z:1.00+.07*Math.cos(runPhase)},
      armLL:{x:-.30+Math.max(0,e)*.32,y:.02*s,z:.12-.05*Math.cos(runPhase)},
      handL:{x:-.03+.07*w,y:.07*s,z:-.04+.04*w},
      armUR:{x:-.26+s*.28,y:-.035*s,z:-.94-.065*Math.cos(runPhase)},
      armLR:{x:-.44+Math.max(0,-e)*.24,y:-.02*s,z:-.14+.04*Math.cos(runPhase)},
      handR:{x:-.11-.05*w,y:-.08*s,z:.06-.035*w}
    };
  }

  function castPose(dt){
    castAge+=dt;
    const u=clamp(castAge/castDuration,0,1);
    const gather=smooth(clamp(u/.34,0,1));
    const release=u<.34?0:smooth(clamp((u-.34)/.30,0,1));
    const recover=u<.64?0:smooth((u-.64)/.36);
    const h=1-recover;
    let p;
    if(castSkill===1){
      p={
        armUL:{x:-.52*gather+.18*release,y:-.18*gather,z:.82-.58*gather+.44*release},
        armLL:{x:-.72*gather+.18*release,y:0,z:.26*gather},
        handL:{x:-.18*gather,y:0,z:-.20*gather},
        armUR:{x:-.52*gather+.18*release,y:.18*gather,z:-.82+.58*gather-.44*release},
        armLR:{x:-.72*gather+.18*release,y:0,z:-.26*gather},
        handR:{x:-.18*gather,y:0,z:.20*gather}
      };
    }else if(castSkill===2){
      p={
        armUL:{x:-1.10*gather+1.20*release,y:0,z:.60-.78*gather+.30*release},
        armLL:{x:-.42-.34*gather,y:0,z:.12},handL:{x:-.16*gather,y:0,z:0},
        armUR:{x:-1.10*gather+1.20*release,y:0,z:-.60+.78*gather-.30*release},
        armLR:{x:-.42-.34*gather,y:0,z:-.12},handR:{x:-.16*gather,y:0,z:0}
      };
    }else if(castSkill===3){
      p={
        armUL:{x:-.34*gather-.24*release,y:0,z:.96-1.18*gather+.44*release},
        armLL:{x:-.24-.18*gather,y:0,z:.08},handL:{x:0,y:-.22*release,z:0},
        armUR:{x:-.34*gather-.24*release,y:0,z:-.96+1.18*gather-.44*release},
        armLR:{x:-.24-.18*gather,y:0,z:-.08},handR:{x:0,y:.22*release,z:0}
      };
    }else{
      p={
        armUL:{x:-.40*gather,y:0,z:.84-.54*gather},armLL:{x:-.56*gather,y:0,z:.18},handL:{x:-.18*gather,y:.18*gather,z:-.10},
        armUR:{x:-.38-.68*gather+1.02*release,y:-.18*gather,z:-.88+.78*gather-.60*release},
        armLR:{x:-.36-.24*gather+.36*release,y:0,z:-.16},handR:{x:-.12+.22*release,y:.28*release,z:.05}
      };
    }
    for(const k in p){p[k].x*=h;p[k].y*=h;p[k].z*=h;}
    return p;
  }

  scene.onBeforeRenderObservable.add(()=>{
    const dt=clamp(scene.getEngine().getDeltaTime()/1000,.001,.05);
    const state=window.PLAYER_ANIMATION_STATE||window.PLAYER_MOTION_STATE||'idle';
    const casting=castAge<castDuration;
    let pose=null;
    if(casting)pose=castPose(dt);
    else if(state==='run'||state==='moving')pose=runPose(dt);

    if(pose){
      const a=blend(casting?26:18,dt);
      setRot(rig.armUL,pose.armUL,a); setRot(rig.armLL,pose.armLL,a); setRot(rig.handL,pose.handL,a);
      setRot(rig.armUR,pose.armUR,a); setRot(rig.armLR,pose.armLR,a); setRot(rig.handR,pose.handR,a);
    }
    if(!casting&&window.PLAYER_CAST_STATE?.active)window.PLAYER_CAST_STATE={active:false,skill:castSkill};
  });

  console.info('[PlayerUpperBodyAnimation] Soft run arms + 4 skill cast poses active.');
})();