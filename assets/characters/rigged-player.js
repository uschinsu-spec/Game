// Premium Chibi Xianxia Player V15 - production visual upgrade, rig/socket/gameplay APIs preserved
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene || !window.GameRuntime) return;
  const player = window.GameRuntime.player;
  const bodyRoot = scene.getTransformNodeByName('SkeletonRoot') || player;
  const shadow = window.GameRuntime.shadow || null;

  const mat=(name,color,{emissive=null,spec=.1,alpha=1,backFace=true}={})=>{
    const m=new BABYLON.StandardMaterial(name,scene);
    m.diffuseColor=BABYLON.Color3.FromHexString(color);
    m.specularColor=new BABYLON.Color3(spec,spec,spec);
    if(emissive)m.emissiveColor=BABYLON.Color3.FromHexString(emissive);
    m.alpha=alpha;m.backFaceCulling=backFace;
    return m;
  };

  // Eight principal shared material groups for mobile draw-call discipline.
  const skin=mat('TV_Skin','#f2c7aa',{spec:.05});
  const clothLight=mat('TV_ClothLight','#edf4f0',{spec:.05});
  const clothBlue=mat('TV_ClothBlue','#4e8fca',{spec:.10});
  const clothDark=mat('TV_ClothDark','#18283d',{spec:.09});
  const gold=mat('TV_Gold','#d9b85e',{emissive:'#251d08',spec:.28});
  const jade=mat('TV_Jade','#75ded8',{emissive:'#103237',spec:.22});
  const hair=mat('TV_Hair','#101825',{spec:.15});
  const blade=mat('TV_Blade','#d5f8ff',{emissive:'#176379',spec:.34});
  const eyeWhite=clothLight;
  const iris=jade;
  const pupil=clothDark;
  const mouthMat=mat('TV_FaceAccent','#a45d66',{spec:.02});
  const auraMat=mat('TV_Aura','#80e9ff',{emissive:'#12647a',spec:.03,alpha:.08,backFace:false});
  const qiMat=mat('TV_Qi','#ead47f',{emissive:'#4d3b0a',spec:.06,alpha:.16,backFace:false});

  const root=new BABYLON.TransformNode('XianxiaChibiRig',scene);root.parent=bodyRoot;root.scaling.setAll(1.045);
  const bone=(name,parent,x,y,z)=>{const n=new BABYLON.TransformNode(name,scene);n.parent=parent;n.position.set(x,y,z);return n;};
  const add=(mesh,parent,pos,material,{shadowOn=true,receive=true}={})=>{
    mesh.parent=parent;mesh.position.copyFrom(pos);mesh.material=material;mesh.isPickable=false;mesh.receiveShadows=receive;
    if(shadow&&shadowOn)shadow.addShadowCaster(mesh);
    return mesh;
  };
  const box=(name,w,h,d,parent,pos,material)=>add(BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene),parent,pos,material);
  const cyl=(name,h,top,bottom,tess,parent,pos,material)=>add(BABYLON.MeshBuilder.CreateCylinder(name,{height:h,diameterTop:top,diameterBottom:bottom,tessellation:tess},scene),parent,pos,material);
  const sph=(name,d,seg,parent,pos,material,opts)=>add(BABYLON.MeshBuilder.CreateSphere(name,{diameter:d,segments:seg},scene),parent,pos,material,opts);

  // Existing procedural hierarchy and bone offsets intentionally preserved.
  const hips=bone('Rig_Hips',root,0,.82,0),spine=bone('Rig_Spine',hips,0,.34,0),chest=bone('Rig_Chest',spine,0,.38,0),neck=bone('Rig_Neck',chest,0,.34,0),headBone=bone('Rig_Head',neck,0,.24,0);
  const clavL=bone('Rig_Clavicle_L',chest,-.32,.25,0),armUL=bone('Rig_UpperArm_L',clavL,-.25,0,0),armLL=bone('Rig_Forearm_L',armUL,-.34,0,0),handL=bone('Rig_Hand_L',armLL,-.27,0,0);
  const clavR=bone('Rig_Clavicle_R',chest,.32,.25,0),armUR=bone('Rig_UpperArm_R',clavR,.25,0,0),armLR=bone('Rig_Forearm_R',armUR,.34,0,0),handR=bone('Rig_Hand_R',armLR,.27,0,0);
  const thighL=bone('Rig_Thigh_L',hips,-.20,-.05,0),shinL=bone('Rig_Shin_L',thighL,0,-.45,0),footL=bone('Rig_Foot_L',shinL,0,-.40,.06);
  const thighR=bone('Rig_Thigh_R',hips,.20,-.05,0),shinR=bone('Rig_Shin_R',thighR,0,-.45,0),footR=bone('Rig_Foot_R',shinR,0,-.40,.06);

  // Heroic torso silhouette: tapered, wider shoulders, narrow waist.
  const torso=cyl('TV_Torso',.70,.58,.72,18,chest,new BABYLON.Vector3(0,-.11,0),clothBlue);torso.scaling.z=.72;
  const inner=cyl('TV_InnerTunic',.58,.43,.55,16,chest,new BABYLON.Vector3(0,-.12,-.018),clothLight);inner.scaling.z=.72;
  const chestPanel=box('TV_ChestPanel',.37,.48,.055,chest,new BABYLON.Vector3(0,-.07,-.34),clothLight);chestPanel.rotation.z=.04;
  const collarL=box('TV_CollarL',.095,.42,.052,chest,new BABYLON.Vector3(-.105,.045,-.36),gold);collarL.rotation.z=-.47;
  const collarR=box('TV_CollarR',.095,.42,.052,chest,new BABYLON.Vector3(.105,.045,-.36),gold);collarR.rotation.z=.47;
  const belt=cyl('TV_Belt',.105,.76,.80,18,hips,new BABYLON.Vector3(0,.33,0),clothDark);belt.scaling.z=.74;
  const beltTrim=cyl('TV_BeltTrim',.022,.82,.82,18,hips,new BABYLON.Vector3(0,.365,0),gold);beltTrim.scaling.z=.75;
  const jadeOrn=sph('TV_JadeOrn',.18,10,hips,new BABYLON.Vector3(0,.315,-.405),jade);jadeOrn.scaling.y=.82;
  const charm=box('TV_Charm',.07,.18,.018,hips,new BABYLON.Vector3(.17,.17,-.38),gold);charm.rotation.z=.09;

  // Layered robe panels with taper and overlap; legs remain visible in run cycle.
  const flap=(name,x,z,rot,material,wTop=.22,wBottom=.31,h=.68)=>{
    const m=cyl(name,h,wTop,wBottom,6,hips,new BABYLON.Vector3(x,-.05,z),material);m.scaling.z=.18;m.rotation.z=rot;return m;
  };
  const robeFrontL=flap('TV_RobeFrontL',-.15,-.30,-.055,clothLight,.20,.30,.68);
  const robeFrontR=flap('TV_RobeFrontR',.15,-.30,.055,clothLight,.20,.30,.68);
  const robeSideL=flap('TV_RobeSideL',-.35,-.015,.08,clothBlue,.18,.28,.66);
  const robeSideR=flap('TV_RobeSideR',.35,-.015,-.08,clothBlue,.18,.28,.66);
  const robeBack=flap('TV_RobeBack',0,.24,0,clothBlue,.32,.48,.72);robeBack.scaling.z=.20;
  const backTrim=flap('TV_RobeBackTrim',0,.215,0,gold,.06,.08,.72);backTrim.scaling.z=.13;

  // Face: soft chibi proportions with visible cheeks/jaw and layered eyes.
  const head=sph('TV_Head',.75,22,headBone,new BABYLON.Vector3(0,.10,0),skin);head.scaling.set(1.00,1.06,.91);
  const cheekL=sph('TV_CheekL',.13,8,headBone,new BABYLON.Vector3(-.225,.035,-.315),skin,{shadowOn:false,receive:false});cheekL.scaling.set(1.15,.62,.32);
  const cheekR=sph('TV_CheekR',.13,8,headBone,new BABYLON.Vector3(.225,.035,-.315),skin,{shadowOn:false,receive:false});cheekR.scaling.set(1.15,.62,.32);
  const chin=sph('TV_Chin',.16,8,headBone,new BABYLON.Vector3(0,-.105,-.285),skin,{shadowOn:false,receive:false});chin.scaling.set(.85,.55,.55);
  const earL=sph('TV_EarL',.12,8,headBone,new BABYLON.Vector3(-.35,.10,0),skin),earR=sph('TV_EarR',.12,8,headBone,new BABYLON.Vector3(.35,.10,0),skin);earL.scaling.z=earR.scaling.z=.55;
  function eyeSide(s){
    const x=.13*s;
    const ew=sph('TV_EyeWhite_'+s,.112,10,headBone,new BABYLON.Vector3(x,.15,-.344),eyeWhite,{shadowOn:false,receive:false});ew.scaling.set(1.14,.92,.20);
    const ir=sph('TV_Iris_'+s,.072,10,headBone,new BABYLON.Vector3(x,.15,-.371),iris,{shadowOn:false,receive:false});ir.scaling.z=.16;
    const pu=sph('TV_Pupil_'+s,.034,8,headBone,new BABYLON.Vector3(x,.15,-.384),pupil,{shadowOn:false,receive:false});pu.scaling.z=.10;
    sph('TV_EyeHi_'+s,.016,6,headBone,new BABYLON.Vector3(x-.013*s,.168,-.393),eyeWhite,{shadowOn:false,receive:false});
    const lid=box('TV_Eyelid_'+s,.12,.014,.014,headBone,new BABYLON.Vector3(x,.205,-.355),hair);lid.rotation.z=-.08*s;
    const brow=box('TV_Brow_'+s,.11,.016,.014,headBone,new BABYLON.Vector3(x,.255,-.34),hair);brow.rotation.z=-.10*s;
  }
  eyeSide(-1);eyeSide(1);
  const nose=sph('TV_Nose',.045,8,headBone,new BABYLON.Vector3(0,.065,-.368),skin,{shadowOn:false,receive:false});nose.scaling.set(.72,.85,.48);
  const mouth=box('TV_Mouth',.082,.014,.012,headBone,new BABYLON.Vector3(0,-.015,-.365),mouthMat);mouth.rotation.z=.01;
  const blushL=box('TV_BlushL',.075,.018,.008,headBone,new BABYLON.Vector3(-.22,.02,-.36),mouthMat);blushL.material.alpha=.18;
  const blushR=box('TV_BlushR',.075,.018,.008,headBone,new BABYLON.Vector3(.22,.02,-.36),mouthMat);blushR.material.alpha=.18;

  // Hair silhouette: curved cap + separated layered locks rather than flat boxes only.
  const hairCap=sph('TV_HairCap',.74,20,headBone,new BABYLON.Vector3(0,.235,.035),hair);hairCap.scaling.set(1.01,.82,.95);
  const bangC=cyl('TV_BangC',.30,.075,.12,5,headBone,new BABYLON.Vector3(0,.21,-.335),hair);bangC.rotation.z=.08;bangC.scaling.z=.52;
  const bangL=cyl('TV_BangL',.31,.075,.13,5,headBone,new BABYLON.Vector3(-.145,.225,-.305),hair);bangL.rotation.z=-.29;bangL.scaling.z=.48;
  const bangR=cyl('TV_BangR',.31,.075,.13,5,headBone,new BABYLON.Vector3(.145,.225,-.305),hair);bangR.rotation.z=.29;bangR.scaling.z=.48;
  const templeL=cyl('TV_TempleHairL',.34,.08,.12,6,headBone,new BABYLON.Vector3(-.275,.09,-.15),hair);templeL.rotation.z=-.06;templeL.scaling.z=.55;
  const templeR=cyl('TV_TempleHairR',.34,.08,.12,6,headBone,new BABYLON.Vector3(.275,.09,-.15),hair);templeR.rotation.z=.06;templeR.scaling.z=.55;
  const backHair=cyl('TV_BackHair',.62,.19,.27,10,headBone,new BABYLON.Vector3(0,-.07,.25),hair);backHair.scaling.set(1.55,1,.55);
  const lockL=cyl('TV_HairLockL',.54,.055,.095,7,headBone,new BABYLON.Vector3(-.27,-.10,.015),hair),lockR=cyl('TV_HairLockR',.54,.055,.095,7,headBone,new BABYLON.Vector3(.27,-.10,.015),hair);lockL.rotation.z=.04;lockR.rotation.z=-.04;lockL.scaling.z=lockR.scaling.z=.72;
  const knot=sph('TV_Topknot',.27,12,headBone,new BABYLON.Vector3(0,.57,.03),hair);knot.scaling.y=1.32;
  cyl('TV_Crown',.18,.08,.15,8,headBone,new BABYLON.Vector3(0,.73,.03),gold);
  box('TV_Hairpin',.40,.032,.032,headBone,new BABYLON.Vector3(0,.63,.02),jade);

  // Arms/legs: tapered segments create a less cylindrical read while keeping each procedural parent intact.
  const sleeveL=cyl('TV_UpperArmL',.50,.22,.31,10,armUL,new BABYLON.Vector3(-.22,0,0),clothBlue),sleeveR=cyl('TV_UpperArmR',.50,.22,.31,10,armUR,new BABYLON.Vector3(.22,0,0),clothBlue);sleeveL.rotation.z=sleeveR.rotation.z=Math.PI/2;sleeveL.scaling.z=sleeveR.scaling.z=.92;
  const foreL=cyl('TV_ForearmL',.40,.15,.20,10,armLL,new BABYLON.Vector3(-.18,0,0),clothLight),foreR=cyl('TV_ForearmR',.40,.15,.20,10,armLR,new BABYLON.Vector3(.18,0,0),clothLight);foreL.rotation.z=foreR.rotation.z=Math.PI/2;foreL.scaling.z=foreR.scaling.z=.88;
  const cuffL=cyl('TV_CuffL',.09,.21,.21,10,armLL,new BABYLON.Vector3(-.34,0,0),gold),cuffR=cyl('TV_CuffR',.09,.21,.21,10,armLR,new BABYLON.Vector3(.34,0,0),gold);cuffL.rotation.z=cuffR.rotation.z=Math.PI/2;
  const handMeshL=sph('TV_HandL',.19,10,handL,new BABYLON.Vector3(-.07,0,0),skin),handMeshR=sph('TV_HandR',.19,10,handR,new BABYLON.Vector3(.07,0,0),skin);handMeshL.scaling.set(1.12,.82,.72);handMeshR.scaling.set(1.12,.82,.72);
  const thighMeshL=cyl('TV_ThighL',.48,.22,.29,10,thighL,new BABYLON.Vector3(0,-.23,0),clothDark),thighMeshR=cyl('TV_ThighR',.48,.22,.29,10,thighR,new BABYLON.Vector3(0,-.23,0),clothDark);thighMeshL.scaling.z=thighMeshR.scaling.z=.88;
  const shinMeshL=cyl('TV_ShinL',.44,.18,.23,10,shinL,new BABYLON.Vector3(0,-.20,0),clothDark),shinMeshR=cyl('TV_ShinR',.44,.18,.23,10,shinR,new BABYLON.Vector3(0,-.20,0),clothDark);shinMeshL.scaling.z=shinMeshR.scaling.z=.82;
  const footMeshL=box('TV_FootL',.30,.16,.43,footL,new BABYLON.Vector3(0,-.05,-.09),clothDark),footMeshR=box('TV_FootR',.30,.16,.43,footR,new BABYLON.Vector3(0,-.05,-.09),clothDark);footMeshL.scaling.x=footMeshR.scaling.x=.94;footMeshL.scaling.z=footMeshR.scaling.z=1.05;
  const shL=sph('TV_ShoulderL',.30,10,clavL,new BABYLON.Vector3(-.08,0,0),gold),shR=sph('TV_ShoulderR',.30,10,clavR,new BABYLON.Vector3(.08,0,0),gold);shL.scaling.set(1.25,.50,.92);shR.scaling.set(1.25,.50,.92);

  // Weapon socket remains a separate transform; weapon mesh is never hard-coded to the hand geometry.
  const weaponSocket=bone('Socket_Weapon_R',handR,.10,0,0);weaponSocket.rotation.z=-Math.PI/2;
  const swordRoot=bone('Chibi_SwordRoot',weaponSocket,0,0,0);
  const bladeCore=cyl('TV_SwordBlade',.98,.018,.09,4,swordRoot,new BABYLON.Vector3(0,.56,0),blade);bladeCore.rotation.y=Math.PI/4;bladeCore.scaling.x=1.35;
  const fuller=box('TV_SwordFuller',.026,.78,.012,swordRoot,new BABYLON.Vector3(0,.52,-.015),jade);fuller.material.alpha=.55;
  const guard=box('TV_SwordGuard',.33,.055,.085,swordRoot,new BABYLON.Vector3(0,.075,0),gold);guard.rotation.z=.02;
  const guardTipL=sph('TV_GuardTipL',.07,6,swordRoot,new BABYLON.Vector3(-.16,.075,0),jade),guardTipR=sph('TV_GuardTipR',.07,6,swordRoot,new BABYLON.Vector3(.16,.075,0),jade);
  cyl('TV_SwordHandle',.29,.060,.068,8,swordRoot,new BABYLON.Vector3(0,-.10,0),clothDark);
  for(let i=0;i<5;i++){const wrap=cyl('TV_HandleWrap'+i,.014,.074,.074,8,swordRoot,new BABYLON.Vector3(0,-.02-i*.05,0),clothLight);wrap.scaling.y=.55;}
  sph('TV_SwordPommel',.09,8,swordRoot,new BABYLON.Vector3(0,-.26,0),jade);

  const backSocket=bone('Socket_BackWeapon',chest,.34,.08,.17);backSocket.rotation.z=-.28;
  const scabbard=cyl('TV_Scabbard',1.10,.08,.12,6,backSocket,new BABYLON.Vector3(0,-.05,0),clothDark);scabbard.scaling.z=.45;
  box('TV_ScabbardTrim',.14,.08,.10,backSocket,new BABYLON.Vector3(0,.48,0),gold);
  box('TV_ScabbardTip',.13,.08,.10,backSocket,new BABYLON.Vector3(0,-.58,0),gold);

  // Lightweight aura: low-alpha foot/body accents, no sphere shell and no shadow casting.
  const qi=add(BABYLON.MeshBuilder.CreateTorus('TV_QiCircle',{diameter:1.36,thickness:.022,tessellation:24},scene),root,new BABYLON.Vector3(0,.024,0),qiMat,{shadowOn:false,receive:false});
  const aura1=add(BABYLON.MeshBuilder.CreateTorus('TV_AuraArc1',{diameter:1.08,thickness:.014,tessellation:20},scene),root,new BABYLON.Vector3(0,.25,0),auraMat,{shadowOn:false,receive:false});aura1.rotation.x=Math.PI/2;
  const aura2=add(BABYLON.MeshBuilder.CreateTorus('TV_AuraArc2',{diameter:.84,thickness:.012,tessellation:20},scene),root,new BABYLON.Vector3(0,.61,0),auraMat,{shadowOn:false,receive:false});aura2.rotation.x=Math.PI/2;

  // Preserve old and documented compatibility flags.
  window.__RIGGED_PLAYER_ACTIVE__=true;window.RIGGED_PLAYER_ACTIVE=true;
  window.__PLAYER_FULL_BODY_RIG__=true;window.PLAYER_FULL_BODY_RIG=true;
  window.PLAYER_MOTION_STATE='idle';
  window.PlayerRig={root,hips,spine,chest,head:headBone,armUL,armUR,armLL,armLR,handL,handR,thighL,thighR,shinL,shinR,footL,footR,weaponSocket,backSocket};

  let targetAngle=0;
  window.setPlayerTargetAngle=a=>{if(Number.isFinite(a))targetAngle=a;};
  const projectiles=[],projMat=blade;
  window.spawnSwordSlashProjectile=function(fromPos,toPos){
    if(!fromPos||!toPos)return;
    const p=BABYLON.MeshBuilder.CreateBox('SwordProj_'+Date.now(),{width:.08,height:.026,depth:.72},scene);
    p.position.copyFrom(fromPos);p.position.y=Math.max(.8,p.position.y);p.material=projMat;p.isPickable=false;
    const dir=toPos.subtract(fromPos).normalize();p.rotation.y=Math.atan2(dir.x,dir.z);
    projectiles.push({mesh:p,dir,life:.82,speed:42});
  };

  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.max(.001,Math.min(.05,scene.getEngine().getDeltaTime()/1000)),t=performance.now()*.001;
    let diff=targetAngle-player.rotation.y;while(diff<-Math.PI)diff+=Math.PI*2;while(diff>Math.PI)diff-=Math.PI*2;
    player.rotation.y+=diff*Math.min(1,dt*12);
    qi.rotation.y+=dt*.34;aura1.rotation.z+=dt*.20;aura2.rotation.z-=dt*.15;
    const pulse=.95+Math.sin(t*2.2)*.022;qi.scaling.setAll(pulse);
    aura1.scaling.setAll(.985+Math.sin(t*1.9)*.018);aura2.scaling.setAll(.985+Math.sin(t*1.6+1)*.016);
    lockL.rotation.z=.04+Math.sin(t*2.0)*.022;lockR.rotation.z=-.04-Math.sin(t*2.0)*.022;
    robeSideL.rotation.z=.08+Math.sin(t*2.2)*.016;robeSideR.rotation.z=-.08-Math.sin(t*2.2)*.016;
    robeFrontL.rotation.z=-.055+Math.sin(t*2.4)*.010;robeFrontR.rotation.z=.055-Math.sin(t*2.4)*.010;
    robeBack.rotation.x=Math.sin(t*1.8)*.008;
    for(let i=projectiles.length-1;i>=0;i--){const q=projectiles[i];q.mesh.position.addInPlace(q.dir.scale(q.speed*dt));q.life-=dt;q.mesh.rotation.z+=dt*8;if(q.life<=0){q.mesh.dispose();projectiles.splice(i,1);}}
  });

  console.info('[RiggedPlayer V15] Premium Thanh Van chibi xianxia visuals active; rig/socket/gameplay APIs preserved.');
})();