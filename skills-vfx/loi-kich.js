// LÔI KÍCH VFX
// Tách riêng để nâng cấp độc lập mà không sửa các skill khác.
(() => {
  'use strict';
  const registry=window.SkillVfxRegistry;
  if(!registry) throw new Error('[SkillVfx] registry.js must load before skill modules.');
  registry.register({
    id:'loi_kich',
    aliases:[2,'loi-kich','thunder_strike'],
    file:'loi-kich.js',
    run:function loi_kich(vfx,ctx){
    const {B,origin,end,ground}=ctx;
    const c=vfx.colors.thunder;
    // Target marker first makes the strike feel intentional.
    vfx.castCircle(ground,c.main,2,5.0,{life:0.56,alpha:0.36,spin:3.6});
    vfx.plane('lightningBurst',ground.add(new B.Vector3(0,0.95,0)),1.8,c.accent,0.25,{delay:0.12,alpha:0.40,startScale:0.2,endScale:1.0,fadeOut:0.35});
    
    const strikes=vfx.mobile?1:2;
    for(let b=0;b<strikes;b++){
      const delay=0.17+b*0.045;
      const tp=end.add(new B.Vector3((Math.random()-0.5)*1.2,0.4,(Math.random()-0.5)*1.2));
      const sky=tp.add(new B.Vector3((Math.random()-0.5)*1.5,15+Math.random()*3,(Math.random()-0.5)*1.5));
      const path=[sky.clone()];
      for(let s=1;s<10;s++){
        const q=B.Vector3.Lerp(sky,tp,s/10);q.x+=(Math.random()-0.5)*0.9;q.z+=(Math.random()-0.5)*0.9;path.push(q);
      }
      path.push(tp.clone());
      const bolt=B.MeshBuilder.CreateTube(`vfx_bolt_${vfx.serial++}`,{path,radius:b===0?0.10:0.065,tessellation:4},vfx.scene);
      vfx._mesh(bolt,b===0?5:2,0.28,{delay,visibility:t=>(0.45+0.55*Math.abs(Math.sin(t*26)))*Math.pow(1-t,0.8),update:(m,t)=>{const s=1+Math.sin(t*24)*0.18;m.scaling.x=m.scaling.z=s;}});
    }
    
    // Textured bolt + vertical core reinforce thickness without many meshes.
    vfx.plane('lightningBolt',end.add(new B.Vector3(0,6.1,0)),8.6,c.core,0.34,{delay:0.16,alpha:0.50,startScale:0.88,endScale:1.02,uvScrollY:-0.04,fadeIn:0.02,fadeOut:0.38});
    const flare=B.MeshBuilder.CreateCylinder(`vfx_thunder_core_${vfx.serial++}`,{height:16,diameterTop:0.12,diameterBottom:1.15,tessellation:8},vfx.scene);
    flare.position.set(end.x,8,end.z);
    vfx._mesh(flare,5,0.24,{delay:0.18,visibility:t=>Math.pow(1-t,2.1),update:(m,t)=>m.scaling.set(1-t*0.65,1,1-t*0.65)});
    
    // Impact happens just after the first bolt, not simultaneously with everything.
    vfx.plane('lightningBurst',end.add(new B.Vector3(0,1.15,0)),4.2,c.core,0.40,{delay:0.22,alpha:0.62,startScale:0.12,endScale:1.45,spin:0.4,uvSpin:0.6,fadeOut:0.4});
    vfx.ring(ground,2,3.8,0.46,{delay:0.22,startRadius:0.4,thickness:0.07,spin:7});
        vfx.spark(end.add(new B.Vector3(0,0.55,0)),2,10,5.4,0.46,{delay:0.23,up:1.5});
    }
  });
})();
