// Full-body Chibi Xianxia Player - procedural rig + animation, local only
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene || !window.GameRuntime) return;

  const player = window.GameRuntime.player;
  const bodyRoot = scene.getTransformNodeByName('SkeletonRoot') || player;
  const shadow = window.GameRuntime.shadow || null;

  const mat = (name, color, emissive=null, spec=0.14) => {
    const m = new BABYLON.StandardMaterial(name, scene);
    m.diffuseColor = BABYLON.Color3.FromHexString(color);
    m.specularColor = new BABYLON.Color3(spec, spec, spec);
    if (emissive) m.emissiveColor = BABYLON.Color3.FromHexString(emissive);
    return m;
  };

  const skinMat  = mat('Chibi_Skin', '#f6d3ba');
  const skin2Mat = mat('Chibi_SkinShade', '#e8b994');
  const blushMat = mat('Chibi_Blush', '#f29aa6', '#4a1016', 0.05);
  blushMat.alpha = 0.42;
  const lipMat   = mat('Chibi_Lip', '#b95669', '#351019', 0.08);
  const robeMat  = mat('Chibi_Robe', '#d9eefc');
  const robe2Mat = mat('Chibi_RobeBlue', '#4b90d8', '#0b2742');
  const trimMat  = mat('Chibi_Trim', '#f1d58a', '#43330d');
  const beltMat  = mat('Chibi_Belt', '#23314a');
  const hairMat  = mat('Chibi_Hair', '#101522', '#050812', 0.28);
  const hairHiMat= mat('Chibi_HairHighlight', '#263b5a', '#0b2035', 0.22);
  const hairBlueMat=mat('Chibi_HairBlue', '#4c91c8', '#123b63', 0.18);
  const eyeWhiteMat = mat('Chibi_EyeWhite', '#fdfefe', '#101820', 0.35);
  const irisMat   = mat('Chibi_Iris', '#4f9ee8', '#194b7f', 0.45);
  const pupilMat  = mat('Chibi_Pupil', '#111a2c', '#05070c', 0.25);
  const eyeGlowMat= mat('Chibi_EyeGlow', '#d7f3ff', '#80cfff', 0.55);
  const browMat   = mat('Chibi_Brow', '#151b2a');
  const markMat   = mat('Chibi_ImmortalMark', '#6fc7ff', '#2b78bb', 0.30);
  const bootMat   = mat('Chibi_Boot', '#263044');
  const bladeMat = mat('Chibi_Blade', '#bff5ff', '#1aa6d9', 0.35);
  const hiltMat  = mat('Chibi_Hilt', '#d5b55e', '#493a10');

  const root = new BABYLON.TransformNode('XianxiaChibiRig', scene);
  root.parent = bodyRoot;
  root.position.set(0,0,0);
  root.scaling.setAll(1.06);

  const bone = (name, parent, x,y,z) => {
    const n = new BABYLON.TransformNode(name, scene);
    n.parent = parent;
    n.position.set(x,y,z);
    return n;
  };
  const meshPart = (mesh, parent, pos, material) => {
    mesh.parent = parent;
    mesh.position.copyFrom(pos);
    mesh.material = material;
    mesh.isPickable = false;
    mesh.receiveShadows = true;
    if (shadow) shadow.addShadowCaster(mesh);
    return mesh;
  };

  // -------- Skeleton hierarchy --------
  const hips = bone('Rig_Hips', root, 0, 0.82, 0);
  const spine = bone('Rig_Spine', hips, 0, 0.34, 0);
  const chest = bone('Rig_Chest', spine, 0, 0.38, 0);
  const neck = bone('Rig_Neck', chest, 0, 0.34, 0);
  const headBone = bone('Rig_Head', neck, 0, 0.24, 0);

  const clavL = bone('Rig_Clavicle_L', chest, -0.32, 0.25, 0);
  const armUL = bone('Rig_UpperArm_L', clavL, -0.25, 0, 0);
  const armLL = bone('Rig_Forearm_L', armUL, -0.34, 0, 0);
  const handL = bone('Rig_Hand_L', armLL, -0.27, 0, 0);
  const clavR = bone('Rig_Clavicle_R', chest, 0.32, 0.25, 0);
  const armUR = bone('Rig_UpperArm_R', clavR, 0.25, 0, 0);
  const armLR = bone('Rig_Forearm_R', armUR, 0.34, 0, 0);
  const handR = bone('Rig_Hand_R', armLR, 0.27, 0, 0);

  const thighL = bone('Rig_Thigh_L', hips, -0.20, -0.05, 0);
  const shinL = bone('Rig_Shin_L', thighL, 0, -0.45, 0);
  const footL = bone('Rig_Foot_L', shinL, 0, -0.40, 0.06);
  const thighR = bone('Rig_Thigh_R', hips, 0.20, -0.05, 0);
  const shinR = bone('Rig_Shin_R', thighR, 0, -0.45, 0);
  const footR = bone('Rig_Foot_R', shinR, 0, -0.40, 0.06);

  // -------- Chibi body --------
  const torso = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Torso',{height:0.78,diameterTop:0.62,diameterBottom:0.80,tessellation:16},scene), chest, new BABYLON.Vector3(0,-0.10,0), robe2Mat);
  torso.scaling.z = 0.75;
  const skirt = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_RobeSkirt',{height:0.66,diameterTop:0.72,diameterBottom:1.02,tessellation:16},scene), hips, new BABYLON.Vector3(0,0.04,0), robeMat);
  skirt.scaling.z = 0.74;
  const belt = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Belt',{height:0.12,diameter:0.82,tessellation:16},scene), hips, new BABYLON.Vector3(0,0.34,0), beltMat);
  belt.scaling.z = 0.76;
  const beltOrn = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_BeltOrn',{diameter:0.17,segments:10},scene), hips, new BABYLON.Vector3(0,0.34,-0.38), trimMat);

  // -------- Premium chibi face --------
  const head = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_Head',{diameter:0.75,segments:28},scene), headBone, new BABYLON.Vector3(0,0.10,0), skinMat);
  head.scaling.set(1.02,1.05,0.95);
  const earL = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_Ear_L',{diameter:0.13,segments:10},scene), headBone, new BABYLON.Vector3(-0.36,0.09,0), skin2Mat);
  const earR = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_Ear_R',{diameter:0.13,segments:10},scene), headBone, new BABYLON.Vector3(0.36,0.09,0), skin2Mat);
  earL.scaling.z = earR.scaling.z = 0.52;

  const makeEye = (side)=>{
    const x=side*0.135;
    const eyeRoot=bone(side<0?'Face_Eye_L':'Face_Eye_R',headBone,x,0.14,-0.345);
    const sclera=meshPart(BABYLON.MeshBuilder.CreateSphere((side<0?'EyeWhite_L':'EyeWhite_R'),{diameter:0.145,segments:18},scene),eyeRoot,new BABYLON.Vector3(0,0,0),eyeWhiteMat);
    sclera.scaling.set(1.0,1.18,0.28);
    const iris=meshPart(BABYLON.MeshBuilder.CreateSphere((side<0?'Iris_L':'Iris_R'),{diameter:0.093,segments:16},scene),eyeRoot,new BABYLON.Vector3(0,-0.004,-0.037),irisMat);
    iris.scaling.z=.24;
    const pupil=meshPart(BABYLON.MeshBuilder.CreateSphere((side<0?'Pupil_L':'Pupil_R'),{diameter:0.050,segments:12},scene),eyeRoot,new BABYLON.Vector3(0,-0.002,-0.058),pupilMat);
    pupil.scaling.z=.18;
    const glint1=meshPart(BABYLON.MeshBuilder.CreateSphere((side<0?'EyeGlint1_L':'EyeGlint1_R'),{diameter:0.027,segments:8},scene),eyeRoot,new BABYLON.Vector3(-0.018,0.024,-0.071),eyeGlowMat);
    const glint2=meshPart(BABYLON.MeshBuilder.CreateSphere((side<0?'EyeGlint2_L':'EyeGlint2_R'),{diameter:0.013,segments:6},scene),eyeRoot,new BABYLON.Vector3(0.022,-0.018,-0.072),eyeGlowMat);
    glint1.scaling.z=glint2.scaling.z=.22;
    const lid=meshPart(BABYLON.MeshBuilder.CreateTorus((side<0?'UpperLid_L':'UpperLid_R'),{diameter:0.145,thickness:0.010,tessellation:24,arc:0.48},scene),eyeRoot,new BABYLON.Vector3(0,0.016,-0.078),browMat);
    lid.rotation.x=Math.PI/2; lid.rotation.z=side<0?0.03:-0.03;
    const lash=meshPart(BABYLON.MeshBuilder.CreateBox((side<0?'Lash_L':'Lash_R'),{width:0.066,height:0.010,depth:0.010},scene),eyeRoot,new BABYLON.Vector3(side*0.048,0.035,-0.079),browMat);
    lash.rotation.z=side<0?-0.16:0.16;
    return eyeRoot;
  };
  const eyeRootL=makeEye(-1), eyeRootR=makeEye(1);

  const browL=meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_Brow_L',{width:0.12,height:0.018,depth:0.014},scene),headBone,new BABYLON.Vector3(-0.14,0.245,-0.344),browMat);
  const browR=meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_Brow_R',{width:0.12,height:0.018,depth:0.014},scene),headBone,new BABYLON.Vector3(0.14,0.245,-0.344),browMat);
  browL.rotation.z=-0.10; browR.rotation.z=0.10;

  const nose = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_Nose',{diameter:0.048,segments:10},scene), headBone, new BABYLON.Vector3(0,0.055,-0.373), skin2Mat);
  nose.scaling.set(.8,.85,.45);
  const mouth=meshPart(BABYLON.MeshBuilder.CreateTorus('Chibi_Mouth',{diameter:0.095,thickness:0.009,tessellation:20,arc:0.42},scene),headBone,new BABYLON.Vector3(0,-0.035,-0.382),lipMat);
  mouth.rotation.x=Math.PI/2; mouth.rotation.z=Math.PI;
  const blushL=meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_Blush_L',{diameter:0.115,segments:10},scene),headBone,new BABYLON.Vector3(-0.235,0.015,-0.333),blushMat);
  const blushR=meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_Blush_R',{diameter:0.115,segments:10},scene),headBone,new BABYLON.Vector3(0.235,0.015,-0.333),blushMat);
  blushL.scaling.set(1,.45,.20); blushR.scaling.set(1,.45,.20);

  // Immortal forehead sigil: central gem + wing strokes.
  const mark=meshPart(BABYLON.MeshBuilder.CreatePolyhedron('Chibi_ForeheadMark',{type:0,size:0.055},scene),headBone,new BABYLON.Vector3(0,0.315,-0.335),markMat);
  mark.scaling.set(.55,1.15,.18); mark.rotation.z=Math.PI/4;
  const markL=meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_ForeheadMark_L',{width:.065,height:.012,depth:.010},scene),headBone,new BABYLON.Vector3(-.052,.300,-.346),markMat);
  const markR=meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_ForeheadMark_R',{width:.065,height:.012,depth:.010},scene),headBone,new BABYLON.Vector3(.052,.300,-.346),markMat);
  markL.rotation.z=-.55; markR.rotation.z=.55;

  // -------- Layered Chinese xianxia hair --------
  const hairRoot=bone('Hair_Root',headBone,0,0.17,0.02);
  const hairCap = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_HairCap',{diameter:0.76,segments:26,slice:0.62},scene), hairRoot, new BABYLON.Vector3(0,0.08,0.035), hairMat);
  hairCap.rotation.x = Math.PI; hairCap.scaling.set(1.03,1.00,.96);
  const hairBack=meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_HairBack',{diameter:0.69,segments:22},scene),hairRoot,new BABYLON.Vector3(0,-0.02,0.19),hairMat);
  hairBack.scaling.set(.92,1.12,.56);

  const bang=(name,x,y,z,sx,sy,rz,matl=hairMat)=>{
    const b=meshPart(BABYLON.MeshBuilder.CreateSphere(name,{diameter:.27,segments:14},scene),hairRoot,new BABYLON.Vector3(x,y,z),matl);
    b.scaling.set(sx,sy,.26); b.rotation.z=rz; return b;
  };
  bang('Hair_Bang_C',0,.13,-.305,.42,1.18,0,hairHiMat);
  bang('Hair_Bang_L1',-.115,.13,-.292,.48,1.16,.34,hairMat);
  bang('Hair_Bang_R1',.115,.13,-.292,.48,1.16,-.34,hairMat);
  bang('Hair_Bang_L2',-.225,.08,-.245,.40,1.10,.50,hairHiMat);
  bang('Hair_Bang_R2',.225,.08,-.245,.40,1.10,-.50,hairHiMat);

  const sideLock=(name,x,rz)=>{
    const r=bone(name,hairRoot,x,-0.11,-0.02); r.rotation.z=rz;
    const s1=meshPart(BABYLON.MeshBuilder.CreateCylinder(name+'_A',{height:.42,diameterTop:.075,diameterBottom:.12,tessellation:10},scene),r,new BABYLON.Vector3(0,-.15,0),hairMat);
    const s2=meshPart(BABYLON.MeshBuilder.CreateCylinder(name+'_B',{height:.34,diameterTop:.035,diameterBottom:.09,tessellation:10},scene),r,new BABYLON.Vector3(0,-.46,.02),hairHiMat);
    s2.rotation.z=-rz*.35; return r;
  };
  const lockL=sideLock('Chibi_HairLock_L',-.30,.10);
  const lockR=sideLock('Chibi_HairLock_R',.30,-.10);

  const topknotRoot=bone('Hair_Topknot',hairRoot,0,.40,.05);
  const bun=meshPart(BABYLON.MeshBuilder.CreateTorus('Chibi_HairBun',{diameter:.27,thickness:.095,tessellation:24},scene),topknotRoot,new BABYLON.Vector3(0,.03,0),hairMat);
  bun.rotation.x=Math.PI/2;
  const knotCore=meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_TopknotCore',{diameter:.21,segments:16},scene),topknotRoot,new BABYLON.Vector3(0,.04,0),hairHiMat);
  knotCore.scaling.y=1.2;
  const crown=meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Crown',{height:.20,diameterTop:.075,diameterBottom:.14,tessellation:8},scene),topknotRoot,new BABYLON.Vector3(0,.20,0),trimMat);
  const crownGem=meshPart(BABYLON.MeshBuilder.CreatePolyhedron('Chibi_CrownGem',{type:0,size:.07},scene),topknotRoot,new BABYLON.Vector3(0,.29,-.015),markMat);
  crownGem.rotation.z=Math.PI/4; crownGem.scaling.z=.55;

  const tailRoot=bone('Hair_LongTail',hairRoot,0,.00,.26);
  tailRoot.rotation.x=.08;
  const hairTails=[];
  for(let i=0;i<5;i++){
    const x=(i-2)*.075;
    const seg=meshPart(BABYLON.MeshBuilder.CreateCylinder('Hair_Tail_'+i,{height:.66,diameterTop:.035,diameterBottom:.105,tessellation:9},scene),tailRoot,new BABYLON.Vector3(x,-.34,.05+Math.abs(i-2)*.02),i%2?hairHiMat:hairMat);
    seg.rotation.z=(i-2)*.035; hairTails.push(seg);
  }
  const ribbonL=meshPart(BABYLON.MeshBuilder.CreateBox('Hair_Ribbon_L',{width:.055,height:.56,depth:.018},scene),topknotRoot,new BABYLON.Vector3(-.11,-.22,.03),hairBlueMat);
  const ribbonR=meshPart(BABYLON.MeshBuilder.CreateBox('Hair_Ribbon_R',{width:.055,height:.56,depth:.018},scene),topknotRoot,new BABYLON.Vector3(.11,-.22,.03),hairBlueMat);
  ribbonL.rotation.z=.12; ribbonR.rotation.z=-.12;

  // Arms: sleeves + forearms + hands
  const sleeveL = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_UpperArm_L',{height:0.50,diameterTop:0.25,diameterBottom:0.32,tessellation:12},scene), armUL, new BABYLON.Vector3(-0.22,0,0), robe2Mat);
  const sleeveR = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_UpperArm_R',{height:0.50,diameterTop:0.25,diameterBottom:0.32,tessellation:12},scene), armUR, new BABYLON.Vector3(0.22,0,0), robe2Mat);
  sleeveL.rotation.z = sleeveR.rotation.z = Math.PI/2;
  const foreL = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Forearm_L',{height:0.40,diameter:0.18,tessellation:12},scene), armLL, new BABYLON.Vector3(-0.18,0,0), robeMat);
  const foreR = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Forearm_R',{height:0.40,diameter:0.18,tessellation:12},scene), armLR, new BABYLON.Vector3(0.18,0,0), robeMat);
  foreL.rotation.z = foreR.rotation.z = Math.PI/2;
  const palmL = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_Hand_L',{diameter:0.19,segments:10},scene), handL, new BABYLON.Vector3(-0.07,0,0), skinMat);
  const palmR = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_Hand_R',{diameter:0.19,segments:10},scene), handR, new BABYLON.Vector3(0.07,0,0), skinMat);

  // Legs + boots
  const legUL = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Thigh_L',{height:0.48,diameter:0.27,tessellation:12},scene), thighL, new BABYLON.Vector3(0,-0.23,0), robe2Mat);
  const legUR = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Thigh_R',{height:0.48,diameter:0.27,tessellation:12},scene), thighR, new BABYLON.Vector3(0,-0.23,0), robe2Mat);
  const legLL = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Shin_L',{height:0.44,diameter:0.22,tessellation:12},scene), shinL, new BABYLON.Vector3(0,-0.20,0), bootMat);
  const legLR = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_Shin_R',{height:0.44,diameter:0.22,tessellation:12},scene), shinR, new BABYLON.Vector3(0,-0.20,0), bootMat);
  const bootL = meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_Foot_L',{width:0.28,height:0.16,depth:0.42},scene), footL, new BABYLON.Vector3(0,-0.05,-0.09), bootMat);
  const bootR = meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_Foot_R',{width:0.28,height:0.16,depth:0.42},scene), footR, new BABYLON.Vector3(0,-0.05,-0.09), bootMat);

  // Shoulder ornaments
  const shoulderL = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_ShoulderArmor_L',{diameter:0.29,segments:10},scene), clavL, new BABYLON.Vector3(-0.08,0,0), trimMat);
  const shoulderR = meshPart(BABYLON.MeshBuilder.CreateSphere('Chibi_ShoulderArmor_R',{diameter:0.29,segments:10},scene), clavR, new BABYLON.Vector3(0.08,0,0), trimMat);
  shoulderL.scaling.set(1.2,0.60,1.0); shoulderR.scaling.set(1.2,0.60,1.0);

  const weaponSocket = bone('Socket_Weapon_R', handR, 0.10,0,0);
  weaponSocket.rotation.z = -Math.PI/2;
  const swordRoot = bone('Chibi_SwordRoot', weaponSocket, 0,0,0);
  const blade = meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_SwordBlade',{width:0.075,height:0.88,depth:0.035},scene), swordRoot, new BABYLON.Vector3(0,0.53,0), bladeMat);
  const guard = meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_SwordGuard',{width:0.28,height:0.06,depth:0.09},scene), swordRoot, new BABYLON.Vector3(0,0.07,0), hiltMat);
  const handle = meshPart(BABYLON.MeshBuilder.CreateCylinder('Chibi_SwordHandle',{height:0.26,diameter:0.065,tessellation:8},scene), swordRoot, new BABYLON.Vector3(0,-0.09,0), beltMat);

  const backSocket = bone('Socket_BackWeapon', chest, 0.34,0.08,0.17);
  backSocket.rotation.z = -0.28;
  const scabbard = meshPart(BABYLON.MeshBuilder.CreateBox('Chibi_Scabbard',{width:0.11,height:1.05,depth:0.08},scene), backSocket, new BABYLON.Vector3(0,-0.05,0), beltMat);

  const auraMat = new BABYLON.StandardMaterial('Chibi_AuraMat', scene);
  auraMat.diffuseColor = BABYLON.Color3.FromHexString('#83e9ff');
  auraMat.emissiveColor = BABYLON.Color3.FromHexString('#128bb5');
  auraMat.alpha = 0.11; auraMat.backFaceCulling = false;
  const aura = BABYLON.MeshBuilder.CreateSphere('Chibi_Aura',{diameter:2.35,segments:14},scene);
  aura.parent=root; aura.position.set(0,1.0,0); aura.material=auraMat; aura.isPickable=false;

  const circleMat = new BABYLON.StandardMaterial('Chibi_QiCircleMat',scene);
  circleMat.diffuseColor=BABYLON.Color3.FromHexString('#f5d36c');
  circleMat.emissiveColor=BABYLON.Color3.FromHexString('#c78f19'); circleMat.alpha=0.34;
  const qi = BABYLON.MeshBuilder.CreateTorus('Chibi_QiCircle',{diameter:1.55,thickness:0.035,tessellation:32},scene);
  qi.parent=root; qi.position.y=0.025; qi.material=circleMat; qi.isPickable=false;

  window.__RIGGED_PLAYER_ACTIVE__ = true;
  window.__PLAYER_FULL_BODY_RIG__ = true;
  window.__PLAYER_PREMIUM_FACE_HAIR__ = true;
  window.PLAYER_MOTION_STATE = 'idle';
  window.PlayerRig = { root, hips, spine, chest, head:headBone, armUL,armUR,armLL,armLR,handL,handR,thighL,thighR,shinL,shinR,footL,footR, weaponSocket, backSocket };

  let targetAngle=0, attackClock=0, attackPrev=false;
  window.setPlayerTargetAngle = angle => { if (Number.isFinite(angle)) targetAngle=angle; };

  const projectiles=[];
  const projMat=mat('Chibi_SwordProjectile','#a9f4ff','#168fbd',0.4);
  window.spawnSwordSlashProjectile=function(fromPos,toPos){
    if(!fromPos||!toPos)return;
    const p=BABYLON.MeshBuilder.CreateBox('SwordProj_'+Date.now(),{width:0.10,height:0.035,depth:0.78},scene);
    p.position.copyFrom(fromPos); p.position.y=Math.max(0.8,p.position.y); p.material=projMat; p.isPickable=false;
    const dir=toPos.subtract(fromPos).normalize(); p.rotation.y=Math.atan2(dir.x,dir.z);
    projectiles.push({mesh:p,dir,life:0.9,speed:42});
  };

  const resetPose=()=>{
    spine.rotation.set(0,0,0); chest.rotation.set(0,0,0); headBone.rotation.set(0,0,0);
    armUL.rotation.set(0,0,-0.10); armUR.rotation.set(0,0,0.10);
    armLL.rotation.set(0,0,0); armLR.rotation.set(0,0,0);
    thighL.rotation.set(0,0,0); thighR.rotation.set(0,0,0); shinL.rotation.set(0,0,0); shinR.rotation.set(0,0,0);
    root.position.y=0;
  };

  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.max(0.001,Math.min(0.05,scene.getEngine().getDeltaTime()/1000));
    const t=performance.now()*0.001;

    let diff=targetAngle-player.rotation.y;
    while(diff<-Math.PI)diff+=Math.PI*2; while(diff>Math.PI)diff-=Math.PI*2;
    player.rotation.y+=diff*Math.min(1,dt*12);

    aura.scaling.setAll(1+Math.sin(t*3.0)*0.025); qi.rotation.y=t*0.85;
    lockL.rotation.z=.10+Math.sin(t*2.1)*0.035; lockR.rotation.z=-.10-Math.sin(t*2.0)*0.035;
    ribbonL.rotation.x=Math.sin(t*2.6)*.08; ribbonR.rotation.x=-Math.sin(t*2.4)*.08;
    tailRoot.rotation.z=Math.sin(t*1.75)*.025;
    eyeRootL.rotation.y=Math.sin(t*.55)*.012; eyeRootR.rotation.y=Math.sin(t*.55)*.012;

    for(let i=projectiles.length-1;i>=0;i--){
      const p=projectiles[i]; p.life-=dt; p.mesh.position.addInPlace(p.dir.scale(p.speed*dt));
      if(p.life<=0){p.mesh.dispose();projectiles.splice(i,1);}
    }

    const attacking=(typeof attackT!=='undefined'&&attackT>0);
    const moving=(window.PLAYER_MOTION_STATE==='moving'||window.isPlayerMoving);
    resetPose();

    if(attacking){
      window.PLAYER_MOTION_STATE='attack';
      if(!attackPrev) attackClock=0;
      attackClock+=dt;
      const a=Math.min(1,attackClock/0.42);
      const swing=Math.sin(a*Math.PI);
      hips.rotation.y=-0.20+swing*0.36;
      chest.rotation.y=-0.30+swing*0.65;
      chest.rotation.x=-0.10;
      armUR.rotation.x=-1.25+swing*1.55;
      armUR.rotation.z=0.75-swing*1.10;
      armLR.rotation.z=-0.45-swing*0.70;
      handR.rotation.y=-0.35+swing*0.75;
      armUL.rotation.x=-0.25; armUL.rotation.z=-0.42;
      thighL.rotation.x=0.12; thighR.rotation.x=-0.10;
      headBone.rotation.y=0.12;
    } else if(moving){
      window.PLAYER_MOTION_STATE='moving';
      const s=Math.sin(t*11.5), c=Math.cos(t*11.5);
      root.position.y=Math.abs(s)*0.055;
      hips.rotation.x=0.10; chest.rotation.x=-0.06;
      thighL.rotation.x=s*0.72; thighR.rotation.x=-s*0.72;
      shinL.rotation.x=Math.max(0,-s)*0.78; shinR.rotation.x=Math.max(0,s)*0.78;
      armUL.rotation.x=-s*0.58; armUR.rotation.x=s*0.58;
      armLL.rotation.x=0.10; armLR.rotation.x=0.10;
      footL.rotation.x=-c*0.12; footR.rotation.x=c*0.12;
      lockL.rotation.x=0.10+s*0.05; lockR.rotation.x=0.10-s*0.05;
      tailRoot.rotation.x=.08+s*.025;
    } else {
      window.PLAYER_MOTION_STATE='idle';
      const b=Math.sin(t*2.7);
      root.position.y=b*0.018;
      chest.rotation.x=b*0.018; headBone.rotation.x=-b*0.012;
      armUL.rotation.z=-0.14+b*0.025; armUR.rotation.z=0.20-b*0.025;
      armLR.rotation.x=-0.20; handR.rotation.z=-0.08;
      thighL.rotation.z=-0.025; thighR.rotation.z=0.025;
    }
    attackPrev=attacking;
  });

  console.info('[Player] Full-body chibi xianxia rig loaded with premium face + layered Chinese xianxia hair.');
})();