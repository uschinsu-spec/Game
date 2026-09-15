// Player Upper Body Animation v3 - authored GLB safe skill-state bridge
(()=>{
  const scene=window.GameRuntime?.scene;
  if(!scene||window.__PLAYER_UPPERBODY_ANIM_V3__)return;
  window.__PLAYER_UPPERBODY_ANIM_V3__=true;
  window.__PLAYER_UPPERBODY_ANIM_V2__=true;
  window.__PLAYER_UPPERBODY_ANIM_V1__=true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let castSkill=-1,castAge=99,castDuration=.86,lastActive=-1,attackWasActive=false;

  function activeSkillIndex(){
    const cards=[...document.querySelectorAll('.ulala-skill-card')];
    return cards.findIndex(x=>x.classList.contains('active'));
  }
  function beginCast(idx){
    idx=clamp(Number(idx)||0,0,3);
    if(castSkill===idx&&castAge<.12)return;
    castSkill=idx;castAge=0;
    window.PLAYER_CAST_STATE={active:true,skill:idx};
  }
  window.triggerPlayerSkillCast=(idx,duration=.86)=>{
    castDuration=Math.max(.5,Number(duration)||.86);
    beginCast(Number.isFinite(idx)?idx:0);
  };
  function detectSkill(){
    const idx=activeSkillIndex();
    if(idx>=0&&idx!==lastActive){lastActive=idx;beginCast(idx);}
  }
  setTimeout(()=>{
    const cards=[...document.querySelectorAll('.ulala-skill-card')];
    cards.forEach(c=>new MutationObserver(detectSkill).observe(c,{attributes:true,attributeFilter:['class']}));
    lastActive=activeSkillIndex();
  },300);

  scene.onBeforeRenderObservable.add(()=>{
    const dt=clamp(scene.getEngine().getDeltaTime()/1000,.001,.05);
    castAge+=dt;
    const attacking=(typeof attackT!=='undefined'&&attackT>0);
    if(attacking&&!attackWasActive){
      const idx=activeSkillIndex();
      beginCast(idx>=0?idx:0);
    }
    attackWasActive=attacking;
    const casting=castAge<castDuration;
    if(!casting&&window.PLAYER_CAST_STATE?.active)window.PLAYER_CAST_STATE={active:false,skill:castSkill};
    window.PLAYER_UPPERBODY_DEBUG={castSkill,castAge,castDuration,casting,activeSkill:activeSkillIndex(),authoredGLB:true};
  });

  console.info('[PlayerUpperBodyAnimation v3] Skill state preserved; procedural bone overrides disabled for authored GLB.');
})();
