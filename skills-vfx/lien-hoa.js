// LIÊN HOA VFX
// Tách riêng để nâng cấp độc lập mà không sửa các skill khác.
(() => {
  'use strict';
  const registry=window.SkillVfxRegistry;
  if(!registry) throw new Error('[SkillVfx] registry.js must load before skill modules.');
  registry.register({
    id:'lien_hoa',
    aliases:[3,'lien-hoa','lotus'],
    file:'lien-hoa.js',
    run:function lien_hoa(vfx,ctx){
    const {B,origin,ground}=ctx;
    const c=vfx.colors.lotus;
    // A calm build-up differentiates healing/support from attack skills.
    vfx.castCircle(origin,c.main,3,5.8,{life:1.05,alpha:0.34,spin:1.25});
    vfx.castCircle(origin,c.accent,3,3.8,{life:0.88,alpha:0.22,spin:-1.8,delay:0.05});
    vfx.plane('lotus',origin.add(new B.Vector3(0,1.15,0)),5.2,c.core,1.20,{delay:0.06,alpha:0.50,startScale:0.18,endScale:1.18,spin:0.12,uvSpin:0.35,rise:1.15,fadeOut:0.68});
    
    // Physical petals layer around the 2D lotus so the effect reads from isometric angles.
    const petals=vfx.mobile?6:8;
    for(let i=0;i<petals;i++){
      const a=i/petals*Math.PI*2;
      const petal=B.MeshBuilder.CreateSphere(`vfx_lotuspetal_${vfx.serial++}`,{diameter:1.0,segments:6},vfx.scene);
      petal.scaling.set(0.26,1.25,0.11);
      petal.position.set(origin.x+Math.cos(a)*0.75,0.38,origin.z+Math.sin(a)*0.75);
      petal.rotation.y=-a;petal.rotation.z=-0.65;
      vfx._mesh(petal,i%4===0?5:3,1.08,{delay:0.04+i*0.012,visibility:t=>0.58*Math.pow(1-t,0.8),update:(m,t)=>{
        const e=vfx._easeOut(t),r=0.75+e*3.0;
        m.position.set(origin.x+Math.cos(a+t*0.55)*r,0.38+e*2.1,origin.z+Math.sin(a+t*0.55)*r);
        m.rotation.z=-0.65+e*0.95;m.rotation.y=-a-t*0.6;
      }});
    }
    
    // Upward healing motes instead of explosive sparks.
    const motes=vfx.mobile?6:9;
    for(let i=0;i<motes;i++){
      const a=Math.random()*Math.PI*2,r=0.5+Math.random()*2.4;
      const pos=new B.Vector3(origin.x+Math.cos(a)*r,0.35+Math.random()*0.4,origin.z+Math.sin(a)*r);
      vfx.plane('impactBurst',pos,0.35+Math.random()*0.32,i%3===0?c.accent:c.main,0.9+Math.random()*0.35,{delay:0.12+Math.random()*0.18,alpha:0.22,startScale:0.2,endScale:0.68,rise:2.7+Math.random()*2.2,spin:0.4,fadeOut:0.62});
    }
    vfx.ring(ground,3,5.5,1.05,{startRadius:0.55,thickness:0.05,spin:2.5});
    }
  });
})();
