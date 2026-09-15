// Premium Chibi Xianxia Player V14 - preserves rig/socket/gameplay APIs
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
    m.alpha=alpha;m.backFaceCulling=backFace;return m;
  };
  const skin=mat('TV_Skin','#f2cbb1',{spec:.05});
  const skinShade=mat('TV_SkinShade','#d99e82',{spec:.04});
  const white=mat('TV_ClothIvory','#eaf4f4',{spec:.05});
  const blue=mat('TV_ClothBlue','#4d96d3',{spec:.10});
  const navy=mat('TV_ClothNavy','#172a42',{spec:.08});
  const cyan=mat('TV_ClothCyan','#8fd8e8',{spec:.08});
  const gold=mat('TV_Gold','#e6c36c',{emissive:'#2e260c',spec:.30});
  const jade=mat('TV_Jade','#72e7dd',{emissive:'#123c40',spec:.24});
  const hair=mat('TV_Hair','#111827',{spec:.16});
  const hairHi=mat('TV_HairHi','#26344a',{spec:.18});
  const boot=mat('TV_Boot','#192338',{spec:.12});
  const eyeWhite=mat('TV_EyeWhite','#f6fbff',{spec:.10});
  const iris=mat('TV_Iris','#4cc8e8',{emissive:'#0d3440',spec:.22});
  const pupil=mat('TV_Pupil','#081018',{spec:.02});
  const mouthMat=mat('TV_Mouth','#9f5560',{spec:.03});
  const blade=mat('TV_Blade','#c9f5ff',{emissive:'#1d8dad',spec:.38});

  const root=new BABYLON.TransformNode('XianxiaChibiRig',scene);root.parent=bodyRoot;root.scaling.setAll(1.06);
  const bone=(name,parent,x,y,z)=>{const n=new BABYLON.TransformNode(name,scene);n.parent=parent;n.position.set(x,y,z);return n;};
  const add=(mesh,parent,pos,material,{shadowOn=true,receive=true}={})=>{mesh.parent=parent;mesh.position.copyFrom(pos);mesh.material=material;mesh.isPickable=false;mesh.receiveShadows=receive;if(shadow&&shadowOn)shadow.addShadowCaster(mesh);return mesh;};

  const hips=bone('Rig_Hips',root,0,.82,0),spine=bone('Rig_Spine',hips,0,.34,0),chest=bone('Rig_Chest',spine,0,.38,0),neck=bone('Rig_Neck',chest,0,.34,0),headBone=bone('Rig_Head',neck,0,.24,0);
  const clavL=bone('Rig_Clavicle_L',chest,-.32,.25,0),armUL=bone('Rig_UpperArm_L',clavL,-.25,0,0),armLL=bone('Rig_Forearm_L',armUL,-.34,0,0),handL=bone('Rig_Hand_L',armLL,-.27,0,0);
  const clavR=bone('Rig_Clavicle_R',chest,.32,.25,0),armUR=bone('Rig_UpperArm_R',clavR,.25,0,0),armLR=bone('Rig_Forearm_R',armUR,.34,0,0),handR=bone('Rig_Hand_R',armLR,.27,0,0);
  const thighL=bone('Rig_Thigh_L',hips,-.20,-.05,0),shinL=bone('Rig_Shin_L',thighL,0,-.45,0),footL=bone('Rig_Foot_L',shinL,0,-.40,.06);
  const thighR=bone('Rig_Thigh_R',hips,.20,-.05,0),shinR=bone('Rig_Shin_R',thighR,0,-.45,0),footR=bone('Rig_Foot_R',shinR,0,-.40,.06);

  const torso=add(BABYLON.MeshBuilder.CreateCylinder('TV_Torso',{height:.72,diameterTop:.60,diameterBottom:.72,tessellation:18},scene),chest,new BABYLON.Vector3(0,-.10,0),blue);torso.scaling.z=.72;
  const chestPanel=add(BABYLON.MeshBuilder.CreateBox('TV_ChestPanel',{width:.40,height:.50,depth:.07},scene),chest,new BABYLON.Vector3(0,-.08,-.31),white);chestPanel.rotation.z=.06;
  const collarL=add(BABYLON.MeshBuilder.CreateBox('TV_CollarL',{width:.12,height:.42,depth:.06},scene),chest,new BABYLON.Vector3(-.10,.03,-.35),white);collarL.rotation.z=-.45;
  const collarR=add(BABYLON.MeshBuilder.CreateBox('TV_CollarR',{width:.12,height:.42,depth:.06},scene),chest,new BABYLON.Vector3(.10,.03,-.35),white);collarR.rotation.z=.45;
  const belt=add(BABYLON.MeshBuilder.CreateCylinder('TV_Belt',{height:.11,diameter:.80,tessellation:18},scene),hips,new BABYLON.Vector3(0,.33,0),navy);belt.scaling.z=.74;
  const beltGold=add(BABYLON.MeshBuilder.CreateCylinder('TV_BeltTrim',{height:.025,diameter:.84,tessellation:18},scene),hips,new BABYLON.Vector3(0,.36,0),gold);beltGold.scaling.z=.75;
  add(BABYLON.MeshBuilder.CreateSphere('TV_JadeOrn',{diameter:.18,segments:10},scene),hips,new BABYLON.Vector3(0,.32,-.39),jade);

  const flap=(name,x,z,rot,material)=>{const m=add(BABYLON.MeshBuilder.CreateBox(name,{width:.27,height:.66,depth:.055},scene),hips,new BABYLON.Vector3(x,-.05,z),material);m.rotation.z=rot;return m;};
  const robeFrontL=flap('TV_RobeFrontL',-.16,-.29,-.05,white),robeFrontR=flap('TV_RobeFrontR',.16,-.29,.05,white),robeSideL=flap('TV_RobeSideL',-.37,-.02,.08,cyan),robeSideR=flap('TV_RobeSideR',.37,-.02,-.08,cyan),robeBack=flap('TV_RobeBack',0,.26,0,blue);robeBack.scaling.x=1.45;robeBack.scaling.y=1.05;

  const head=add(BABYLON.MeshBuilder.CreateSphere('TV_Head',{diameter:.74,segments:22},scene),headBone,new BABYLON.Vector3(0,.10,0),skin);head.scaling.set(1,1.05,.92);
  const earL=add(BABYLON.MeshBuilder.CreateSphere('TV_EarL',{diameter:.12,segments:8},scene),headBone,new BABYLON.Vector3(-.35,.10,0),skinShade),earR=add(BABYLON.MeshBuilder.CreateSphere('TV_EarR',{diameter:.12,segments:8},scene),headBone,new BABYLON.Vector3(.35,.10,0),skinShade);earL.scaling.z=earR.scaling.z=.55;
  function eyeSide(s){const x=.13*s;const ew=add(BABYLON.MeshBuilder.CreateSphere('TV_EyeWhite_'+s,{diameter:.10,segments:10},scene),headBone,new BABYLON.Vector3(x,.15,-.343),eyeWhite,{shadowOn:false,receive:false});ew.scaling.set(1.12,.92,.24);const ir=add(BABYLON.MeshBuilder.CreateSphere('TV_Iris_'+s,{diameter:.065,segments:10},scene),headBone,new BABYLON.Vector3(x,.15,-.370),iris,{shadowOn:false,receive:false});ir.scaling.z=.18;const pu=add(BABYLON.MeshBuilder.CreateSphere('TV_Pupil_'+s,{diameter:.032,segments:8},scene),headBone,new BABYLON.Vector3(x,.15,-.383),pupil,{shadowOn:false,receive:false});pu.scaling.z=.12;add(BABYLON.MeshBuilder.CreateSphere('TV_EyeHi_'+s,{diameter:.016,segments:6},scene),headBone,new BABYLON.Vector3(x-.012*s,.166,-.392),eyeWhite,{shadowOn:false,receive:false});const br=add(BABYLON.MeshBuilder.CreateBox('TV_Brow_'+s,{width:.105,height:.018,depth:.015},scene),headBone,new BABYLON.Vector3(x,.245,-.345),hair,{shadowOn:false,receive:false});br.rotation.z=-.10*s;}
  eyeSide(-1);eyeSide(1);add(BABYLON.MeshBuilder.CreateSphere('TV_Nose',{diameter:.045,segments:8},scene),headBone,new BABYLON.Vector3(0,.07,-.36),skinShade,{shadowOn:false,receive:false});add(BABYLON.MeshBuilder.CreateBox('TV_Mouth',{width:.09,height:.018,depth:.012},scene),headBone,new BABYLON.Vector3(0,-.005,-.359),mouthMat,{shadowOn:false,receive:false});

  const hairCap=add(BABYLON.MeshBuilder.CreateSphere('TV_HairCap',{diameter:.73,segments:20,slice:.60},scene),headBone,new BABYLON.Vector3(0,.24,.03),hair);hairCap.rotation.x=Math.PI;
  const bangC=add(BABYLON.MeshBuilder.CreateBox('TV_BangC',{width:.12,height:.29,depth:.08},scene),headBone,new BABYLON.Vector3(0,.24,-.34),hairHi);bangC.rotation.z=.10;
  const bangL=add(BABYLON.MeshBuilder.CreateBox('TV_BangL',{width:.13,height:.31,depth:.08},scene),headBone,new BABYLON.Vector3(-.14,.23,-.31),hair);bangL.rotation.z=-.28;
  const bangR=add(BABYLON.MeshBuilder.CreateBox('TV_BangR',{width:.13,height:.31,depth:.08},scene),headBone,new BABYLON.Vector3(.14,.23,-.31),hair);bangR.rotation.z=.28;
  const backHair=add(BABYLON.MeshBuilder.CreateCylinder('TV_BackHair',{height:.62,diameter:.22,tessellation:10},scene),headBone,new BABYLON.Vector3(0,-.08,.27),hair);backHair.scaling.x=1.55;backHair.scaling.z=.55;
  const lockL=add(BABYLON.MeshBuilder.CreateCylinder('TV_HairLockL',{height:.52,diameter:.085,tessellation:8},scene),headBone,new BABYLON.Vector3(-.27,-.10,.02),hair),lockR=add(BABYLON.MeshBuilder.CreateCylinder('TV_HairLockR',{height:.52,diameter:.085,tessellation:8},scene),headBone,new BABYLON.Vector3(.27,-.10,.02),hair);lockL.rotation.z=.04;lockR.rotation.z=-.04;
  const knot=add(BABYLON.MeshBuilder.CreateSphere('TV_Topknot',{diameter:.26,segments:12},scene),headBone,new BABYLON.Vector3(0,.57,.03),hair);knot.scaling.y=1.28;
  add(BABYLON.MeshBuilder.CreateCylinder('TV_Crown',{height:.18,diameterTop:.08,diameterBottom:.15,tessellation:8},scene),headBone,new BABYLON.Vector3(0,.73,.03),gold);add(BABYLON.MeshBuilder.CreateBox('TV_Hairpin',{width:.40,height:.035,depth:.035},scene),headBone,new BABYLON.Vector3(0,.63,.02),jade);

  const sleeveL=add(BABYLON.MeshBuilder.CreateCylinder('TV_UpperArmL',{height:.50,diameterTop:.24,diameterBottom:.31,tessellation:12},scene),armUL,new BABYLON.Vector3(-.22,0,0),blue),sleeveR=add(BABYLON.MeshBuilder.CreateCylinder('TV_UpperArmR',{height:.50,diameterTop:.24,diameterBottom:.31,tessellation:12},scene),armUR,new BABYLON.Vector3(.22,0,0),blue);sleeveL.rotation.z=sleeveR.rotation.z=Math.PI/2;
  const foreL=add(BABYLON.MeshBuilder.CreateCylinder('TV_ForearmL',{height:.40,diameter:.18,tessellation:12},scene),armLL,new BABYLON.Vector3(-.18,0,0),white),foreR=add(BABYLON.MeshBuilder.CreateCylinder('TV_ForearmR',{height:.40,diameter:.18,tessellation:12},scene),armLR,new BABYLON.Vector3(.18,0,0),white);foreL.rotation.z=foreR.rotation.z=Math.PI/2;
  add(BABYLON.MeshBuilder.CreateSphere('TV_HandL',{diameter:.19,segments:10},scene),handL,new BABYLON.Vector3(-.07,0,0),skin);add(BABYLON.MeshBuilder.CreateSphere('TV_HandR',{diameter:.19,segments:10},scene),handR,new BABYLON.Vector3(.07,0,0),skin);
  add(BABYLON.MeshBuilder.CreateCylinder('TV_ThighL',{height:.48,diameter:.27,tessellation:12},scene),thighL,new BABYLON.Vector3(0,-.23,0),navy);add(BABYLON.MeshBuilder.CreateCylinder('TV_ThighR',{height:.48,diameter:.27,tessellation:12},scene),thighR,new BABYLON.Vector3(0,-.23,0),navy);
  add(BABYLON.MeshBuilder.CreateCylinder('TV_ShinL',{height:.44,diameter:.22,tessellation:12},scene),shinL,new BABYLON.Vector3(0,-.20,0),boot);add(BABYLON.MeshBuilder.CreateCylinder('TV_ShinR',{height:.44,diameter:.22,tessellation:12},scene),shinR,new BABYLON.Vector3(0,-.20,0),boot);
  add(BABYLON.MeshBuilder.CreateBox('TV_FootL',{width:.30,height:.16,depth:.43},scene),footL,new BABYLON.Vector3(0,-.05,-.09),boot);add(BABYLON.MeshBuilder.CreateBox('TV_FootR',{width:.30,height:.16,depth:.43},scene),footR,new BABYLON.Vector3(0,-.05,-.09),boot);
  const shL=add(BABYLON.MeshBuilder.CreateSphere('TV_ShoulderL',{diameter:.30,segments:10},scene),clavL,new BABYLON.Vector3(-.08,0,0),gold),shR=add(BABYLON.MeshBuilder.CreateSphere('TV_ShoulderR',{diameter:.30,segments:10},scene),clavR,new BABYLON.Vector3(.08,0,0),gold);shL.scaling.set(1.25,.55,1);shR.scaling.set(1.25,.55,1);

  const weaponSocket=bone('Socket_Weapon_R',handR,.10,0,0);weaponSocket.rotation.z=-Math.PI/2;const swordRoot=bone('Chibi_SwordRoot',weaponSocket,0,0,0);
  add(BABYLON.MeshBuilder.CreateBox('TV_SwordBlade',{width:.085,height:.94,depth:.032},scene),swordRoot,new BABYLON.Vector3(0,.56,0),blade);add(BABYLON.MeshBuilder.CreateBox('TV_SwordGuard',{width:.31,height:.055,depth:.095},scene),swordRoot,new BABYLON.Vector3(0,.075,0),gold);add(BABYLON.MeshBuilder.CreateCylinder('TV_SwordHandle',{height:.29,diameter:.066,tessellation:8},scene),swordRoot,new BABYLON.Vector3(0,-.10,0),navy);add(BABYLON.MeshBuilder.CreateSphere('TV_SwordPommel',{diameter:.09,segments:8},scene),swordRoot,new BABYLON.Vector3(0,-.26,0),jade);
  const backSocket=bone('Socket_BackWeapon',chest,.34,.08,.17);backSocket.rotation.z=-.28;add(BABYLON.MeshBuilder.CreateBox('TV_Scabbard',{width:.12,height:1.10,depth:.085},scene),backSocket,new BABYLON.Vector3(0,-.05,0),navy);add(BABYLON.MeshBuilder.CreateBox('TV_ScabbardTrim',{width:.14,height:.08,depth:.10},scene),backSocket,new BABYLON.Vector3(0,.43,0),gold);

  const auraMat=mat('TV_Aura','#80e9ff',{emissive:'#147a95',spec:.05,alpha:.10,backFace:false});const qiMat=mat('TV_Qi','#e9cf72',{emissive:'#6f5110',spec:.10,alpha:.22,backFace:false});
  const qi=add(BABYLON.MeshBuilder.CreateTorus('TV_QiCircle',{diameter:1.42,thickness:.025,tessellation:28},scene),root,new BABYLON.Vector3(0,.025,0),qiMat,{shadowOn:false,receive:false});const aura1=add(BABYLON.MeshBuilder.CreateTorus('TV_AuraArc1',{diameter:1.16,thickness:.018,tessellation:24},scene),root,new BABYLON.Vector3(0,.28,0),auraMat,{shadowOn:false,receive:false});aura1.rotation.x=Math.PI/2;const aura2=add(BABYLON.MeshBuilder.CreateTorus('TV_AuraArc2',{diameter:.94,thickness:.016,tessellation:24},scene),root,new BABYLON.Vector3(0,.68,0),auraMat,{shadowOn:false,receive:false});aura2.rotation.x=Math.PI/2;

  window.__RIGGED_PLAYER_ACTIVE__=true;window.__PLAYER_FULL_BODY_RIG__=true;window.PLAYER_MOTION_STATE='idle';window.PlayerRig={root,hips,spine,chest,head:headBone,armUL,armUR,armLL,armLR,handL,handR,thighL,thighR,shinL,shinR,footL,footR,weaponSocket,backSocket};
  let targetAngle=0;window.setPlayerTargetAngle=a=>{if(Number.isFinite(a))targetAngle=a;};const projectiles=[],projMat=mat('TV_Projectile','#b8f7ff',{emissive:'#178eac',spec:.35});
  window.spawnSwordSlashProjectile=function(fromPos,toPos){if(!fromPos||!toPos)return;const p=BABYLON.MeshBuilder.CreateBox('SwordProj_'+Date.now(),{width:.10,height:.035,depth:.78},scene);p.position.copyFrom(fromPos);p.position.y=Math.max(.8,p.position.y);p.material=projMat;p.isPickable=false;const dir=toPos.subtract(fromPos).normalize();p.rotation.y=Math.atan2(dir.x,dir.z);projectiles.push({mesh:p,dir,life:.9,speed:42});};
  scene.onBeforeRenderObservable.add(()=>{const dt=Math.max(.001,Math.min(.05,scene.getEngine().getDeltaTime()/1000)),t=performance.now()*.001;let diff=targetAngle-player.rotation.y;while(diff<-Math.PI)diff+=Math.PI*2;while(diff>Math.PI)diff-=Math.PI*2;player.rotation.y+=diff*Math.min(1,dt*12);qi.rotation.y+=dt*.42;aura1.rotation.z+=dt*.26;aura2.rotation.z-=dt*.19;const pulse=.92+Math.sin(t*2.4)*.035;qi.scaling.setAll(pulse);aura1.scaling.setAll(.98+Math.sin(t*2.1)*.025);aura2.scaling.setAll(.98+Math.sin(t*1.7+1)*.02);lockL.rotation.z=.04+Math.sin(t*2.1)*.025;lockR.rotation.z=-.04-Math.sin(t*2.1)*.025;robeSideL.rotation.z=.08+Math.sin(t*2.3)*.018;robeSideR.rotation.z=-.08-Math.sin(t*2.3)*.018;robeFrontL.rotation.z=-.05+Math.sin(t*2.5)*.012;robeFrontR.rotation.z=.05-Math.sin(t*2.5)*.012;for(let i=projectiles.length-1;i>=0;i--){const q=projectiles[i];q.mesh.position.addInPlace(q.dir.scale(q.speed*dt));q.life-=dt;q.mesh.rotation.z+=dt*8;if(q.life<=0){q.mesh.dispose();projectiles.splice(i,1);}}});
  console.info('[RiggedPlayer V14] Premium layered xianxia visuals active; rig/socket APIs preserved.');
})();
