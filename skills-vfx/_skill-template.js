// COPY THIS FILE to create a new skill VFX module. Do not add this template itself to manifest.
(() => {
  'use strict';
  const registry=window.SkillVfxRegistry;
  if(!registry) throw new Error('[SkillVfx] registry.js must load first.');

  registry.register({
    id:'your_skill_id',
    aliases:[],
    file:'your-skill-file.js',
    run(vfx,ctx){
      const {B,origin,end,ground}=ctx;
      // Example only: replace with your own VFX.
      vfx.castCircle(origin,vfx.colors.sword.main,0,2.5,{life:0.4,alpha:0.3});
      vfx.plane('impactBurst',end.add(new B.Vector3(0,0.8,0)),2.5,vfx.colors.sword.core,0.3,{alpha:0.45});
    }
  });
})();
