// Player Skill Animation V4 - authored GLB combat integration
(()=>{
 const scene=window.GameRuntime?.scene;if(!scene)return;window.__PLAYER_UPPERBODY_ANIM_V4__=true;
 let castSkill=-1,castAge=99,castDuration=.72,lastActive=-1;
 const cards=()=>[...document.querySelectorAll('.ulala-skill-card')];
 const active=()=>cards().findIndex(x=>x.classList.contains('active'));
 function cast(idx,duration=.72){castSkill=Math.max(0,Math.min(3,Number(idx)||0));castAge=0;castDuration=Math.max(.35,Number(duration)||.72);window.PLAYER_CAST_STATE={active:true,skill:castSkill};window.triggerPlayerAttackAnimation?.();}
 window.triggerPlayerSkillCast=cast;
 setTimeout(()=>{cards().forEach(c=>new MutationObserver(()=>{const i=active();if(i>=0&&i!==lastActive){lastActive=i;cast(i)}}).observe(c,{attributes:true,attributeFilter:['class']}));lastActive=active()},300);
 scene.onBeforeRenderObservable.add(()=>{const dt=Math.max(.001,Math.min(.05,scene.getEngine().getDeltaTime()/1000));castAge+=dt;if(castAge>=castDuration&&window.PLAYER_CAST_STATE?.active)window.PLAYER_CAST_STATE={active:false,skill:castSkill};window.PLAYER_UPPERBODY_DEBUG={castSkill,castAge,castDuration,casting:castAge<castDuration,authoredGLB:true}});
 console.info('[PlayerSkillAnimation V4] skills drive authored full-body attack animation');
})();