// THIÊN THẠCH VFX
// Tách riêng để nâng cấp độc lập mà không sửa các skill khác.
(() => {
  'use strict';
  const registry=window.SkillVfxRegistry;
  if(!registry) throw new Error('[SkillVfx] registry.js must load before skill modules.');
  registry.register({
    id:'thien_thach',
    aliases:[4,'thien-thach','meteor'],
    file:'thien-thach.js',
    run:function thien_thach(vfx,ctx){
    const {B,origin,end,ground}=ctx;
    const c=vfx.colors.meteor;
    // Telegraph before impact gives the skill scale and readability.
    vfx.castCircle(ground,c.main,4,7.8,{life:0.62,alpha:0.34,spin:4.3});
    vfx.ring(ground,4,6.8,0.62,{startRadius:6.0,thickness:0.045,spin:-5});
    
    const start=end.add(new B.Vector3(7.5,22,6.5));
    const impact=end.add(new B.Vector3(0,0.85,0));
    const meteor=B.MeshBuilder.CreateIcoSphere(`vfx_meteor_${vfx.serial++}`,{radius:1.05,subdivisions:2},vfx.scene);
    meteor.position.copyFrom(start);
    vfx._mesh(meteor,4,0.58,{delay:0.10,visibility:t=>t<0.92?1:Math.max(0,(1-t)/0.08),update:(m,t)=>{
      const e=vfx._easeInOut(t);m.position.copyFrom(B.Vector3.Lerp(start,impact,e));m.rotation.x+=0.16;m.rotation.y+=0.24;m.scaling.setAll(0.82+vfx._pulse(t)*0.28);
    }});
    
    // Delayed textured afterimages form a proper fiery comet tail.
    const tails=vfx.mobile?3:4;
    for(let i=0;i<tails;i++){
      vfx.plane('meteorImpact',start.clone(),1.8+i*0.10,i%2?c.accent:c.main,0.50,{delay:0.10+i*0.027,alpha:0.32-i*0.04,startScale:0.45,endScale:0.72,fadeOut:0.36,moveTo:impact,rotation:-0.65,spin:0.1});
    }
    
    const impactDelay=0.62;
    vfx.plane('meteorImpact',impact.clone(),8.8,c.core,0.72,{delay:impactDelay,alpha:0.58,startScale:0.08,endScale:1.35,spin:0.28,uvSpin:0.75,fadeOut:0.48});
    vfx.plane('impactBurst',impact.clone(),7.2,c.main,0.54,{delay:impactDelay+0.015,alpha:0.55,startScale:0.10,endScale:1.6,spin:-0.45,uvSpin:-0.65,fadeOut:0.40});
    vfx.ring(ground,4,7.8,0.72,{delay:impactDelay,startRadius:0.7,thickness:0.11,spin:5});
    
    const blast=B.MeshBuilder.CreateSphere(`vfx_blast_${vfx.serial++}`,{diameter:4.2,segments:vfx.mobile?6:10},vfx.scene);
    blast.position.copyFrom(ground);blast.position.y=0.45;
    vfx._mesh(blast,4,0.46,{delay:impactDelay,visibility:t=>0.25*Math.pow(1-t,1.5),update:(m,t)=>{const s=0.25+vfx._easeOut(t)*2.6;m.scaling.set(s,0.28+s*0.55,s);}});
    
    const rocks=vfx.mobile?4:6;
    for(let i=0;i<rocks;i++){
      const a=i/rocks*Math.PI*2+Math.random()*0.25;
      const r=1.6+Math.random()*2.1;
      const shard=B.MeshBuilder.CreatePolyhedron(`vfx_rock_${vfx.serial++}`,{type:2,size:0.28+Math.random()*0.28},vfx.scene);
      const base=new B.Vector3(end.x+Math.cos(a)*r,0.3,end.z+Math.sin(a)*r);
      shard.position.copyFrom(base);
      vfx._mesh(shard,4,0.62,{delay:impactDelay+0.02,visibility:t=>Math.pow(1-t,1.3),update:(m,t)=>{
        m.position.set(base.x+Math.cos(a)*3.4*t,base.y+5.2*t-4.7*t*t,base.z+Math.sin(a)*3.4*t);m.rotation.x=t*9;m.rotation.z=t*7;
      }});
    }
    vfx.spark(impact,4,12,6.6,0.64,{delay:impactDelay,up:2.0,gravity:5.8});
    vfx.spark(impact,2,5,4.6,0.46,{delay:impactDelay+0.02,up:1.4,gravity:5.0});
    }
  });
})();
