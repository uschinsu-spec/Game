// THANH VAN TIEN VUC - HIGH CLARITY MOBILE SKILL VFX
// Visual-only layer. Does not modify combat damage or skill rotation.
(()=>{
  const ready = () => typeof BABYLON !== 'undefined' && typeof scene !== 'undefined' && typeof player !== 'undefined';
  const disposables = new Set();

  function safeDispose(x){ try { if (x && !x.isDisposed?.()) x.dispose(); } catch(_){} disposables.delete(x); }
  function later(x, ms){ disposables.add(x); setTimeout(()=>safeDispose(x), ms); return x; }
  function ppos(y=1){ const p = player.position.clone(); p.y += y; return p; }
  function mat(name, hex, alpha=1, emissive=1){
    const m = new BABYLON.StandardMaterial(name + Math.random(), scene);
    const c = BABYLON.Color3.FromHexString(hex);
    m.diffuseColor = c.scale(0.22); m.emissiveColor = c.scale(emissive); m.specularColor = c; m.alpha = alpha;
    m.disableLighting = true; return m;
  }
  function animateScale(mesh, from, to, frames=18){
    mesh.scaling.setAll(from);
    const a = new BABYLON.Animation('vfxScale','scaling',60,BABYLON.Animation.ANIMATIONTYPE_VECTOR3,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    a.setKeys([{frame:0,value:new BABYLON.Vector3(from,from,from)},{frame:frames,value:new BABYLON.Vector3(to,to,to)}]);
    scene.beginDirectAnimation(mesh,[a],0,frames,false);
  }
  function animateAlpha(material, a0=1, a1=0, frames=22){
    const a = new BABYLON.Animation('vfxAlpha','alpha',60,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    a.setKeys([{frame:0,value:a0},{frame:frames,value:a1}]); scene.beginDirectAnimation(material,[a],0,frames,false);
  }
  function flash(pos, hex, radius=4, life=180){
    const l = new BABYLON.PointLight('skillFlash',pos.clone(),scene); l.diffuse=BABYLON.Color3.FromHexString(hex); l.intensity=7; l.range=radius;
    later(l,life); setTimeout(()=>{ if(l) l.intensity=2; },70);
  }
  function ring(pos, hex, diameter=2, life=500, thickness=.08){
    const m = mat('ring',hex,.95,1.35);
    const r = BABYLON.MeshBuilder.CreateTorus('skillRing',{diameter,thickness,tessellation:40},scene); r.position=pos.clone(); r.rotation.x=Math.PI/2; r.material=m;
    animateScale(r,.25,2.25,24); animateAlpha(m,.95,0,24); later(r,life); setTimeout(()=>safeDispose(m),life+20); return r;
  }
  function orb(pos, hex, diameter=.6, life=400){
    const m=mat('orb',hex,.85,1.6); const s=BABYLON.MeshBuilder.CreateSphere('skillOrb',{diameter,segments:10},scene); s.position=pos.clone(); s.material=m;
    animateScale(s,.2,2.3,18); animateAlpha(m,.9,0,18); later(s,life); setTimeout(()=>safeDispose(m),life+20); return s;
  }
  function tube(points, hex, radius=.055, life=300){
    const m=mat('tube',hex,1,1.8); const t=BABYLON.MeshBuilder.CreateTube('skillBolt',{path:points,radius,tessellation:6,cap:BABYLON.Mesh.CAP_ALL},scene); t.material=m;
    animateAlpha(m,1,0,18); later(t,life); setTimeout(()=>safeDispose(m),life+20); return t;
  }
  function forwardVec(dist=5){
    const yaw = (typeof player.rotation?.y === 'number' ? player.rotation.y : 0);
    return new BABYLON.Vector3(Math.sin(yaw)*dist,0,Math.cos(yaw)*dist);
  }
  function skillLabel(text, hex){
    const old=document.querySelector('.skill-cast-banner'); if(old) old.remove();
    const el=document.createElement('div'); el.className='skill-cast-banner'; el.textContent=text; el.style.setProperty('--skill-color',hex); document.getElementById('hud')?.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show')); setTimeout(()=>el.classList.remove('show'),520); setTimeout(()=>el.remove(),760);
  }

  function thanhVan(){
    const base=ppos(.75), f=forwardVec(5.8), end=base.add(f); skillLabel('THANH VÂN KIẾM','#5ee7ff'); flash(base,'#65eaff',4.5,170);
    ring(new BABYLON.Vector3(base.x,.12,base.z),'#67e8f9',2.2,420,.07);
    for(let i=-1;i<=1;i++){
      const side=new BABYLON.Vector3(Math.cos(player.rotation?.y||0)*i*.42,.15,-Math.sin(player.rotation?.y||0)*i*.42);
      const p0=base.add(side); const p1=end.add(side).add(new BABYLON.Vector3(0,.3,0)); tube([p0,p0.add(f.scale(.42)).add(new BABYLON.Vector3(0,.3,0)),p1],i===0?'#d9fbff':'#36cfff',i===0?.085:.045,300);
    }
    const slashMat=mat('slash','#bdf8ff',.72,1.8); const slash=BABYLON.MeshBuilder.CreateTorus('crescentSlash',{diameter:3.2,thickness:.12,tessellation:48,arc:.55},scene); slash.position=end; slash.rotation.x=Math.PI/2; slash.rotation.z=(player.rotation?.y||0)+Math.PI/2; slash.material=slashMat; animateScale(slash,.45,1.45,16); animateAlpha(slashMat,.9,0,18); later(slash,340); setTimeout(()=>safeDispose(slashMat),360);
  }
  function hoThe(){
    const base=ppos(.85); skillLabel('HỘ THỂ KIM QUANG','#ffd65a'); flash(base,'#ffd54f',5.5,260);
    const shieldMat=mat('shield','#ffd45b',.28,1.5); const shield=BABYLON.MeshBuilder.CreateSphere('goldenShield',{diameter:3.3,segments:18},scene); shield.position=base; shield.scaling.y=.72; shield.material=shieldMat; animateScale(shield,.45,1,18); animateAlpha(shieldMat,.55,0,42); later(shield,720); setTimeout(()=>safeDispose(shieldMat),740);
    ring(new BABYLON.Vector3(base.x,.12,base.z),'#ffd65a',2.5,620,.11); setTimeout(()=>ring(new BABYLON.Vector3(base.x,.13,base.z),'#fff2a1',3.1,520,.06),90);
    for(let i=0;i<8;i++){ const a=i*Math.PI/4; const o=base.add(new BABYLON.Vector3(Math.cos(a)*1.2,Math.sin(i)*.12,Math.sin(a)*1.2)); orb(o,i%2?'#fff2a8':'#ffbf33',.22,430); }
  }
  function lightningPath(top,target,jitter=.8,segments=8){
    const pts=[top.clone()];
    for(let i=1;i<segments;i++){
      const t=i/segments;
      pts.push(BABYLON.Vector3.Lerp(top,target,t).add(new BABYLON.Vector3((Math.random()-.5)*jitter,0,(Math.random()-.5)*jitter)));
    }
    pts.push(target.clone());
    return pts;
  }
  function lightningBranch(origin, hex, spread=2.3, life=260){
    const dir=new BABYLON.Vector3((Math.random()-.5)*spread,(Math.random()*.5+.15),(Math.random()-.5)*spread);
    const end=origin.add(dir);
    const mid=BABYLON.Vector3.Lerp(origin,end,.52).add(new BABYLON.Vector3((Math.random()-.5)*.45,.1,(Math.random()-.5)*.45));
    tube([origin.clone(),mid,end],hex,.025,life);
  }
  function thienLoi(){
    const base=ppos(.9), center=base.add(forwardVec(4.2)); center.y=.22;
    skillLabel('THIÊN LÔI THẦN TRẢM','#b77cff');
    flash(center,'#9c6cff',8.5,320);
    ring(new BABYLON.Vector3(center.x,.11,center.z),'#7b5cff',3.0,620,.11);
    setTimeout(()=>ring(new BABYLON.Vector3(center.x,.12,center.z),'#63e6ff',4.8,560,.07),70);
    setTimeout(()=>ring(new BABYLON.Vector3(center.x,.13,center.z),'#d7c5ff',6.1,520,.045),145);

    const strikes=[];
    const mainCount=9;
    for(let i=0;i<mainCount;i++){
      const a=(i/mainCount)*Math.PI*2 + (Math.random()-.5)*.35;
      const r=i===0?0:(.9 + Math.random()*2.4);
      strikes.push(center.add(new BABYLON.Vector3(Math.cos(a)*r,0,Math.sin(a)*r)));
    }

    strikes.forEach((target,idx)=>{
      const delay=idx*42;
      setTimeout(()=>{
        const top=target.add(new BABYLON.Vector3((Math.random()-.5)*1.0,9+Math.random()*2.8,(Math.random()-.5)*1.0));
        const mainHex=idx===0?'#ffffff':(idx%3===0?'#d8c6ff':(idx%2===0?'#7be8ff':'#ad7dff'));
        tube(lightningPath(top,target,idx===0?1.0:.72,9),mainHex,idx===0?.12:.06,360);
        if(idx===0){
          tube(lightningPath(top.add(new BABYLON.Vector3(.45,.4,-.25)),target.add(new BABYLON.Vector3(-.15,0,.2)),.9,8),'#7be8ff',.055,320);
          tube(lightningPath(top.add(new BABYLON.Vector3(-.5,.25,.35)),target.add(new BABYLON.Vector3(.18,0,-.18)),.9,8),'#bb8cff',.05,320);
        }
        for(let b=0;b<(idx===0?5:2);b++) lightningBranch(target, b%2?'#7be8ff':'#b990ff', idx===0?3.4:2.0,240);
        orb(target,idx===0?'#efe6ff':'#cbbaff',idx===0?1.35:.72,350);
        flash(target,idx===0?'#d8c6ff':'#7be8ff',idx===0?7:4.2,180);
      },delay);
    });

    setTimeout(()=>{
      for(let i=0;i<10;i++){
        const a=i/10*Math.PI*2;
        const p=center.add(new BABYLON.Vector3(Math.cos(a)*2.1,.15,Math.sin(a)*2.1));
        lightningBranch(p,i%2?'#66e6ff':'#9c78ff',2.6,220);
      }
      orb(center,'#d8c4ff',1.5,430);
    },170);
  }
  function vanKiem(){
    const base=ppos(1.0); skillLabel('VẠN KIẾM QUY TÔNG','#ff6b8d'); flash(base,'#ff4f86',8,320);
    ring(new BABYLON.Vector3(base.x,.12,base.z),'#ff5d85',3.1,650,.11); ring(new BABYLON.Vector3(base.x,.14,base.z),'#d875ff',4.2,650,.055);
    const swordMat=mat('swords','#f8e8ff',.95,1.6);
    for(let i=0;i<16;i++){
      const a=i/16*Math.PI*2; const r=1.2+(i%2)*.35; const root=new BABYLON.TransformNode('spiritSword',scene); root.position=base.add(new BABYLON.Vector3(Math.cos(a)*r,(i%4)*.16-.15,Math.sin(a)*r)); root.rotation.y=-a+Math.PI/2; root.rotation.z=(i%2?-.14:.14);
      const blade=BABYLON.MeshBuilder.CreateBox('swordBlade',{width:.06,height:.07,depth:1.45},scene); blade.parent=root; blade.position.z=.55; blade.material=swordMat;
      const tip=BABYLON.MeshBuilder.CreateCylinder('swordTip',{diameterTop:0,diameterBottom:.12,height:.36,tessellation:4},scene); tip.parent=root; tip.rotation.x=Math.PI/2; tip.position.z=1.43; tip.material=swordMat;
      const dir=new BABYLON.Vector3(Math.cos(a)*7,0,Math.sin(a)*7); const anim=new BABYLON.Animation('swordFly','position',60,BABYLON.Animation.ANIMATIONTYPE_VECTOR3,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT); anim.setKeys([{frame:0,value:root.position.clone()},{frame:8,value:root.position.add(dir.scale(.1))},{frame:25,value:root.position.add(dir)}]); scene.beginDirectAnimation(root,[anim],0,25,false); later(root,520); later(blade,520); later(tip,520);
    }
    setTimeout(()=>safeDispose(swordMat),560);
  }

  const casts=[thanhVan,hoThe,thienLoi,vanKiem];
  function boot(){
    if(!ready()){ setTimeout(boot,250); return; }
    const slots=[...document.querySelectorAll('.ulala-skill-card')]; if(slots.length<4){ setTimeout(boot,250); return; }
    let last=-1, lock=false;
    const detect=()=>{
      const idx=slots.findIndex(x=>x.classList.contains('active')); if(idx<0||idx===last||lock) return;
      last=idx; lock=true; try{ casts[idx]?.(); }catch(e){ console.warn('SkillVFX',e); } setTimeout(()=>lock=false,110);
    };
    slots.forEach(s=>new MutationObserver(detect).observe(s,{attributes:true,attributeFilter:['class']}));
    window.SkillVFX={cast:i=>{ try{ casts[i]?.(); }catch(_){} }};
  }
  boot();
})();
