// PHONG LUÂN VFX
// Tách riêng để nâng cấp độc lập mà không sửa các skill khác.
(() => {
  'use strict';
  const registry=window.SkillVfxRegistry;
  if(!registry) throw new Error('[SkillVfx] registry.js must load before skill modules.');
  registry.register({
    id:'phong_luan',
    aliases:[1,'phong-luan','wind_wheel'],
    file:'phong-luan.js',
    run:function phong_luan(vfx,ctx){
    const {B,origin,end,ground,heading}=ctx;
    const c=vfx.colors.wind;
    vfx.castCircle(origin,c.accent,1,4.7,{life:0.75,alpha:0.30,spin:-2.2});
    vfx.plane('energyVortex',origin.clone(),6.2,c.main,0.95,{ground:true,y:0.10,alpha:0.44,startScale:0.28,endScale:1.2,spin:9.5,uvSpin:-5.5,uvZoom:0.12,fadeOut:0.62});
    vfx.plane('tornado',origin.add(new B.Vector3(0,2.1,0)),5.4,c.core,0.92,{alpha:0.40,startScale:0.35,endScale:1.15,spin:1.5,uvSpin:3.2,uvScrollY:-0.08,rise:1.1,fadeOut:0.66});
    
    // Layered orbiting blades: inner fast ring + outer delayed ring.
    const blades=vfx.mobile?4:5;
    for(let i=0;i<blades;i++){
      const a0=i/blades*Math.PI*2;
      const blade=B.MeshBuilder.CreateTorus(`vfx_windblade_${vfx.serial++}`,{diameter:1.6,thickness:0.055,tessellation:vfx.mobile?14:22},vfx.scene);
      blade.scaling.set(1.45,0.18,0.48);
      vfx._mesh(blade,i%3===0?5:1,0.78,{delay:i*0.016,visibility:t=>Math.pow(1-t,1.25),update:(m,t)=>{
        const a=a0+t*(i%2?11:-11);
        const r=0.9+vfx._easeOut(t)*4.8;
        m.position.set(origin.x+Math.cos(a)*r,0.45+vfx._pulse(t)*1.6,origin.z+Math.sin(a)*r);
        m.rotation.y=-a+Math.PI/2;m.rotation.x=0.35;m.rotation.z=t*4;
      }});
    }
    
    // Vertical helical energy lines give real volume.
    const coils=vfx.mobile?1:2;
    for(let k=0;k<coils;k++){
      const path=[];
      for(let p=0;p<=18;p++){
        const q=p/18,a=q*Math.PI*4.5+k*Math.PI*0.66,r=0.45+q*2.9;
        path.push(new B.Vector3(Math.cos(a)*r,q*4.8,Math.sin(a)*r));
      }
      const tube=B.MeshBuilder.CreateTube(`vfx_windcoil_${vfx.serial++}`,{path,radius:0.035,tessellation:3},vfx.scene);
      tube.position.copyFrom(origin);
      vfx._mesh(tube,k===0?5:1,0.86,{visibility:t=>0.46*Math.pow(1-t,1.15),update:(m,t)=>{m.rotation.y=t*(k%2?11:-11);m.scaling.setAll(0.55+t*0.85);}});
    }
    vfx.ring(origin,1,4.8,0.82,{startRadius:0.5,thickness:0.055,spin:7});
    vfx.spark(origin.add(new B.Vector3(0,0.5,0)),1,9,4.5,0.66,{up:2.2,gravity:3.5});
    }
  });
})();
