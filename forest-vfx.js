window.ForestVfx=class ForestVfx {
  constructor(scene){
    const B=BABYLON;
    this.scene=scene;
    this.effects=[];
    this.serial=0;
    this.mobile=(window.innerWidth||1280)<820;
    this.maxEffects=this.mobile?95:150;
    // VFX readability profile: lower bloom/alpha, fewer simultaneous layers, clearer silhouettes.

    this.colors={
      sword:{core:B.Color3.FromHexString('#cbefff'),main:B.Color3.FromHexString('#4fbdd6'),accent:B.Color3.FromHexString('#7d78c9')},
      wind:{core:B.Color3.FromHexString('#e5dcf0'),main:B.Color3.FromHexString('#a27ec4'),accent:B.Color3.FromHexString('#54c7b3')},
      thunder:{core:B.Color3.FromHexString('#fff1bd'),main:B.Color3.FromHexString('#d8b448'),accent:B.Color3.FromHexString('#78b6cf')},
      lotus:{core:B.Color3.FromHexString('#eef8f3'),main:B.Color3.FromHexString('#5bbf91'),accent:B.Color3.FromHexString('#d88ebc')},
      meteor:{core:B.Color3.FromHexString('#ffe1b0'),main:B.Color3.FromHexString('#df7438'),accent:B.Color3.FromHexString('#d9ae4a')}
    };

    const palette=[
      ['#4fbdd6','#073844'],['#a27ec4','#332044'],['#d8b448','#544313'],
      ['#5bbf91','#0b4736'],['#df7438','#572815'],['#e8eef0','#777777']
    ];
    this.materials=palette.map((p,i)=>{
      const m=new B.StandardMaterial(`vfx_shared_${i}`,scene);
      m.emissiveColor=B.Color3.FromHexString(p[0]).scale(0.72);
      m.diffuseColor=B.Color3.FromHexString(p[1]);
      m.specularColor=B.Color3.Black();
      m.disableLighting=true;
      m.backFaceCulling=false;
      m.alphaMode=B.Engine.ALPHA_ADD;
      m.freeze();
      return m;
    });

    const existing=scene.effectLayers?.find?.(x=>x.name==='vfx_glow');
    this.glow=existing||new B.GlowLayer('vfx_glow',scene,{mainTextureRatio:this.mobile?0.22:0.32,blurKernelSize:this.mobile?8:10});
    // Readability tuning: restrained bloom so the skill silhouette stays visible.
    this.glow.intensity=this.mobile?0.28:0.42;
    this.ownsGlow=!existing;

    this.textureBase='assets/textures/vfx/';
    this.textureFiles={
      slashCrescent:'vfx_slash_crescent.png',slashCross:'vfx_slash_cross.png',impactBurst:'vfx_impact_burst.png',
      energyVortex:'vfx_energy_vortex.png',tornado:'vfx_tornado.png',lightningBolt:'vfx_lightning_bolt.png',
      lightningBurst:'vfx_lightning_burst.png',magicCircle:'vfx_magic_circle.png',lotus:'vfx_lotus.png',meteorImpact:'vfx_meteor_impact.png'
    };
    this.textures={};
    for(const [key,file] of Object.entries(this.textureFiles)){
      const tex=new B.Texture(this.textureBase+file,scene,false,false,B.Texture.TRILINEAR_SAMPLINGMODE);
      tex.hasAlpha=true;
      tex.wrapU=B.Texture.CLAMP_ADDRESSMODE;
      tex.wrapV=B.Texture.CLAMP_ADDRESSMODE;
      this.textures[key]=tex;
    }
  }

  _easeOut(t){return 1-Math.pow(1-t,3);}
  _easeInOut(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  _pulse(t){return Math.sin(Math.PI*Math.max(0,Math.min(1,t)));}
  _target(target,fallback){
    const p=target?.mesh?.position||target?.position;
    return p?.clone?p.clone():fallback.clone();
  }

  _track(node,life,opts={}){
    const fx={node,life,age:-(opts.delay||0),started:false,update:opts.update||null,dispose:opts.dispose||null};
    if(node?.setEnabled)node.setEnabled((opts.delay||0)<=0);
    this.effects.push(fx);
    this._trim();
    return fx;
  }

  _trim(){
    while(this.effects.length>this.maxEffects){
      const e=this.effects.shift();
      try{e.dispose?.();}catch(_){ }
      try{e.node?.dispose?.();}catch(_){ }
    }
  }

  _mesh(mesh,index,life,opts={}){
    mesh.material=this.materials[index%this.materials.length];
    mesh.isPickable=false;
    mesh.doNotSyncBoundingInfo=true;
    return this._track(mesh,life,{...opts,update:(m,t,dt)=>{
      m.visibility=opts.visibility?opts.visibility(t):Math.max(0,1-t*t);
      opts.update?.(m,t,dt);
    }});
  }

  _texMat(key,color,alpha=1){
    const B=BABYLON;
    const mat=new B.StandardMaterial(`vfx_texmat_${key}_${this.serial++}`,this.scene);
    const tex=this.textures[key].clone();
    tex.hasAlpha=true;
    tex.wrapU=B.Texture.CLAMP_ADDRESSMODE;
    tex.wrapV=B.Texture.CLAMP_ADDRESSMODE;
    mat.diffuseTexture=tex;
    mat.emissiveTexture=tex;
    mat.opacityTexture=tex;
    mat.useAlphaFromDiffuseTexture=true;
    mat.diffuseColor=B.Color3.Black();
    mat.emissiveColor=(color.clone?color.clone():color).scale(0.72);
    mat.specularColor=B.Color3.Black();
    mat.disableLighting=true;
    mat.backFaceCulling=false;
    mat.alphaMode=B.Engine.ALPHA_ADD;
    mat.alpha=Math.min(alpha,0.72);
    mat.disableDepthWrite=true;
    return {mat,tex};
  }

  plane(key,pos,size,color,life=0.6,opts={}){
    const B=BABYLON;
    const p=B.MeshBuilder.CreatePlane(`vfx_${key}_${this.serial++}`,{size:1},this.scene);
    p.position.copyFrom(pos);
    p.scaling.setAll(0.001);
    p.isPickable=false;
    p.doNotSyncBoundingInfo=true;
    if(opts.ground){
      p.billboardMode=B.Mesh.BILLBOARDMODE_NONE;
      p.rotation.x=Math.PI/2;
      p.position.y=opts.y??0.08;
    }else if(opts.billboard!==false){
      p.billboardMode=B.Mesh.BILLBOARDMODE_ALL;
    }
    const {mat,tex}=this._texMat(key,color,opts.alpha??1);
    p.material=mat;
    const basePos=pos.clone();
    const start=opts.startScale??0.35,end=opts.endScale??1.15;
    const spin=opts.spin??0,uvSpin=opts.uvSpin??0;
    const fadeIn=opts.fadeIn??0.08,fadeOut=opts.fadeOut??0.55;
    return this._track(p,life,{delay:opts.delay||0,dispose:()=>{mat.dispose();tex.dispose();},update:(mesh,t,dt)=>{
      const e=opts.ease==='linear'?t:this._easeOut(t);
      const s=start+(end-start)*e;
      mesh.scaling.set(size*s,size*s,1);
      mesh.rotation.z=(opts.rotation||0)+spin*t;
      tex.wAng=uvSpin*t;
      const uvz=1-(opts.uvZoom??0.08)*t;
      tex.uScale=uvz;tex.vScale=uvz;
      tex.uOffset=(1-uvz)*0.5+(opts.uvScrollX||0)*t;
      tex.vOffset=(1-uvz)*0.5+(opts.uvScrollY||0)*t;
      if(opts.rise)mesh.position.y=basePos.y+opts.rise*e;
      if(opts.moveTo){const q=B.Vector3.Lerp(basePos,opts.moveTo,e);mesh.position.copyFrom(q);}
      const fi=Math.min(1,t/Math.max(0.001,fadeIn));
      const fo=t<fadeOut?1:Math.max(0,(1-t)/Math.max(0.001,1-fadeOut));
      mat.alpha=Math.min(opts.alpha??1,0.72)*fi*Math.pow(fo,opts.fadePow??1.2);
      mesh.visibility=1;
      opts.update?.(mesh,t,dt,mat,tex);
    }});
  }

  ring(pos,index,radius,life=0.55,opts={}){
    const B=BABYLON;
    const m=B.MeshBuilder.CreateTorus(`vfx_ring_${this.serial++}`,{diameter:1,thickness:opts.thickness||0.055,tessellation:this.mobile?18:32},this.scene);
    m.position.copyFrom(pos);m.position.y=opts.y??0.12;
    m.rotation.x=opts.vertical?0:Math.PI/2;
    const r0=opts.startRadius??0.35;
    return this._mesh(m,index,life,{delay:opts.delay||0,visibility:t=>0.72*Math.pow(1-t,1.4),update:(mesh,t)=>{
      const r=r0+(radius-r0)*this._easeOut(t);
      mesh.scaling.set(r*2,r*2,r*2);
      mesh.rotation.y+=(opts.spin??2.5)*0.016;
      mesh.rotation.z+=(opts.spinZ??0)*0.016;
    }});
  }

  spark(pos,index,count=10,speed=4.5,life=0.45,opts={}){
    const B=BABYLON;
    const n=Math.max(2,Math.round(count*(this.mobile?0.45:0.70)));
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2;
      const v=new B.Vector3(Math.cos(a)*speed*(0.45+Math.random()*0.55),(opts.up??1.1)+Math.random()*speed*0.7,Math.sin(a)*speed*(0.45+Math.random()*0.55));
      const m=B.MeshBuilder.CreatePolyhedron(`vfx_sp_${this.serial++}`,{type:1,size:0.06+Math.random()*0.09},this.scene);
      m.position.copyFrom(pos);
      const base=pos.clone();
      this._mesh(m,index,life,{delay:opts.delay||0,visibility:t=>Math.pow(1-t,1.7),update:(mesh,t)=>{
        mesh.position.set(base.x+v.x*t,base.y+v.y*t-(opts.gravity??5.2)*t*t,base.z+v.z*t);
        mesh.rotation.x=t*10;mesh.rotation.y=t*14;
        mesh.scaling.setAll(0.55+this._pulse(t)*0.65);
      }});
    }
  }

  arcTrail(start,end,color,size=2.7,opts={}){
    const copies=this.mobile?2:Math.min(opts.copies||4,3);
    for(let i=0;i<copies;i++){
      const delay=(opts.delay||0)+i*(opts.spacing||0.045);
      this.plane('slashCrescent',start.clone(),size*(1-i*0.035),color,opts.life||0.48,{
        delay,alpha:(opts.alpha??0.62)*(1-i*0.16),startScale:0.55,endScale:1.18,
        spin:(i%2?1:-1)*(opts.spin??0.24),uvSpin:(i%2?-1:1)*0.18,fadeOut:0.48,
        moveTo:end,rise:opts.rise||0.2,rotation:opts.rotation||0
      });
    }
  }

  castCircle(pos,color,index,size=4.5,opts={}){
    this.plane('magicCircle',pos.clone(),size,color,opts.life||0.72,{ground:true,y:opts.y??0.09,delay:opts.delay||0,alpha:opts.alpha??0.42,startScale:0.45,endScale:1.12,spin:opts.spin??2.1,uvSpin:-(opts.spin??2.1)*0.45,uvZoom:0.04,fadeIn:0.12,fadeOut:0.55});
    this.ring(pos,index,size*0.52,opts.life||0.72,{delay:opts.delay||0,startRadius:0.35,thickness:0.045,spin:4});
  }

  skill(origin,target,skillRef){
    const B=BABYLON;
    const end=this._target(target,origin);
    const ground=end.clone();ground.y=0.02;
    const start=origin.add(new B.Vector3(0,1.05,0));
    const flat=end.subtract(origin);flat.y=0;
    const dist=Math.max(1,flat.length());
    const dir=flat.lengthSquared()>0.001?flat.normalize():new B.Vector3(0,0,1);
    const heading=Math.atan2(dir.x,dir.z);
    const context={B,start,origin,end,ground,dir,heading,dist,skillRef};

    // Primary path: stable string Skill ID through the central registry.
    if(window.SkillVfxRegistry?.run?.(skillRef,this,context)) return true;

    // Temporary backward compatibility for older un-migrated modules.
    const legacy=window.ForestSkillVfx?.[skillRef];
    if(typeof legacy==='function'){
      legacy(this,context);
      return true;
    }

    console.warn(`[ForestVfx] Missing skill VFX module: ${String(skillRef)}`);
    return false;
  }

  hit(position){
    const p=position.clone?position.clone():new BABYLON.Vector3(position.x,position.y,position.z);
    this.plane('impactBurst',p.add(new BABYLON.Vector3(0,0.45,0)),1.6,this.colors.sword.core,0.24,{alpha:0.48,startScale:0.15,endScale:1.1,spin:0.35,fadeOut:0.33});
    this.spark(p,0,3,2.4,0.25,{up:0.8,gravity:4.5});
  }

  update(dt){
    dt=Math.min(0.05,Math.max(0,dt||0));
    for(let i=this.effects.length-1;i>=0;i--){
      const e=this.effects[i];
      e.age+=dt;
      if(e.age<0)continue;
      if(!e.started){e.started=true;e.node?.setEnabled?.(true);}
      const t=Math.min(1,e.age/e.life);
      try{e.update?.(e.node,t,dt);}catch(_){ }
      if(t>=1){
        try{e.dispose?.();}catch(_){ }
        try{e.node?.dispose?.();}catch(_){ }
        this.effects.splice(i,1);
      }
    }
    this._trim();
  }

  dispose(){
    for(const e of this.effects){try{e.dispose?.();}catch(_){ }try{e.node?.dispose?.();}catch(_){ }}
    this.effects.length=0;
    for(const tex of Object.values(this.textures||{})){try{tex.dispose();}catch(_){ }}
    for(const mat of this.materials||[]){try{mat.dispose();}catch(_){ }}
    if(this.ownsGlow){try{this.glow.dispose();}catch(_){ }}
  }
};
