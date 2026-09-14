// Articulated procedural Xianxia cultivator v2. Keeps the prototype assetless/mobile friendly.
(() => {
  [torso,armor,head,hair,armL,armR,legL,legR].forEach(m=>m.setEnabled(false));
  if(handSocket) handSocket.setEnabled(false);

  const skin=mat('cultivatorSkin','#d6b39b'), robe=mat('moonRobe','#d9e5e7'), robe2=mat('robeShadow','#8096a0'), ink=mat('inkSilk','#17242b'), jade=mat('jadeTrim','#79b8ad'), silver=mat('silverTrim','#b9c9cc');
  const rig=new BABYLON.TransformNode('CultivatorRig',scene);rig.parent=bodyRoot;
  const node=(name,parent,pos)=>{const n=new BABYLON.TransformNode(name,scene);n.parent=parent;n.position.copyFrom(pos);return n};
  const mesh=(name,type,opt,parent,pos,material)=>{let m=type==='box'?BABYLON.MeshBuilder.CreateBox(name,opt,scene):type==='sphere'?BABYLON.MeshBuilder.CreateSphere(name,opt,scene):BABYLON.MeshBuilder.CreateCylinder(name,opt,scene);m.parent=parent;m.position.copyFrom(pos);m.material=material;shadow.addShadowCaster(m);return m};

  // Pelvis, waist and layered immortal robes.
  const pelvis=node('PelvisJoint',rig,new BABYLON.Vector3(0,1.02,0));
  mesh('Waist','cylinder',{height:.34,diameter:.62,tessellation:10},pelvis,new BABYLON.Vector3(0,.08,0),ink);
  const spine=node('SpineJoint',pelvis,new BABYLON.Vector3(0,.34,0));
  mesh('InnerRobe','box',{width:.72,height:.92,depth:.36},spine,new BABYLON.Vector3(0,.42,0),robe2);
  mesh('OuterRobe','box',{width:.84,height:.78,depth:.42},spine,new BABYLON.Vector3(0,.48,0),robe);
  const belt=mesh('JadeBelt','box',{width:.9,height:.12,depth:.47},spine,new BABYLON.Vector3(0,.08,0),jade);
  const skirt=mesh('LongRobeSkirt','cylinder',{height:1.12,diameterTop:.7,diameterBottom:1.05,tessellation:10},pelvis,new BABYLON.Vector3(0,-.42,0),robe);skirt.scaling.z=.62;
  const sashL=mesh('FlowingSashL','box',{width:.12,height:1.25,depth:.05},pelvis,new BABYLON.Vector3(-.37,-.43,.25),jade);sashL.rotation.z=-.1;
  const sashR=mesh('FlowingSashR','box',{width:.12,height:1.05,depth:.05},pelvis,new BABYLON.Vector3(.37,-.34,.25),silver);sashR.rotation.z=.1;

  // Neck, head, topknot and long hair.
  const neck=node('NeckJoint',spine,new BABYLON.Vector3(0,1.02,0));mesh('Neck','cylinder',{height:.2,diameter:.22,tessellation:10},neck,new BABYLON.Vector3(0,0,0),skin);
  const headJoint=node('HeadJoint',neck,new BABYLON.Vector3(0,.31,0));const face=mesh('CultivatorHead','sphere',{diameter:.48,segments:12},headJoint,new BABYLON.Vector3(0,0,0),skin);face.scaling.z=.86;
  const hairCap=mesh('HairCap','sphere',{diameter:.51,segments:10},headJoint,new BABYLON.Vector3(0,.08,.035),ink);hairCap.scaling.y=.7;
  const topknot=mesh('TopKnot','sphere',{diameter:.22,segments:8},headJoint,new BABYLON.Vector3(0,.36,.02),ink);topknot.scaling.y=1.45;
  mesh('HairPin','cylinder',{height:.48,diameter:.035,tessellation:6},headJoint,new BABYLON.Vector3(0,.4,.02),silver).rotation.z=Math.PI/2;
  const pony=node('LongHairJoint',headJoint,new BABYLON.Vector3(0,.02,.18));const ponyMesh=mesh('LongHair','cylinder',{height:1.05,diameterTop:.2,diameterBottom:.07,tessellation:8},pony,new BABYLON.Vector3(0,-.48,.05),ink);ponyMesh.rotation.x=.08;

  // True articulated arms: shoulder -> upper arm -> elbow -> forearm -> wrist -> hand.
  function makeArm(side){const s=side==='L'?-1:1;const shoulder=node('Shoulder'+side,spine,new BABYLON.Vector3(.53*s,.78,0));mesh('ShoulderGuard'+side,'sphere',{diameter:.34,segments:8},shoulder,new BABYLON.Vector3(0,0,0),robe);const upper=node('UpperArmJoint'+side,shoulder,new BABYLON.Vector3(0,0,0));mesh('UpperArm'+side,'cylinder',{height:.58,diameter:.2,tessellation:8},upper,new BABYLON.Vector3(0,-.28,0),robe).rotation.z=0;const elbow=node('ElbowJoint'+side,upper,new BABYLON.Vector3(0,-.57,0));mesh('Elbow'+side,'sphere',{diameter:.21,segments:8},elbow,new BABYLON.Vector3(0,0,0),robe2);const fore=node('ForearmJoint'+side,elbow,new BABYLON.Vector3(0,-.02,0));mesh('Forearm'+side,'cylinder',{height:.55,diameterTop:.19,diameterBottom:.14,tessellation:8},fore,new BABYLON.Vector3(0,-.27,0),robe);const wrist=node('WristJoint'+side,fore,new BABYLON.Vector3(0,-.55,0));mesh('Hand'+side,'sphere',{diameter:.19,segments:8},wrist,new BABYLON.Vector3(0,-.06,0),skin);return {shoulder,upper,elbow,fore,wrist}}
  const leftArm=makeArm('L'),rightArm=makeArm('R');

  // True articulated legs: hip -> thigh -> knee -> shin -> ankle -> foot.
  function makeLeg(side){const s=side==='L'?-1:1;const hip=node('HipJoint'+side,pelvis,new BABYLON.Vector3(.23*s,-.05,0));const thigh=node('ThighJoint'+side,hip,new BABYLON.Vector3(0,0,0));mesh('Thigh'+side,'cylinder',{height:.62,diameter:.25,tessellation:8},thigh,new BABYLON.Vector3(0,-.3,0),robe2);const knee=node('KneeJoint'+side,thigh,new BABYLON.Vector3(0,-.61,0));mesh('Knee'+side,'sphere',{diameter:.24,segments:8},knee,new BABYLON.Vector3(0,0,0),ink);const shin=node('ShinJoint'+side,knee,new BABYLON.Vector3(0,-.02,0));mesh('Shin'+side,'cylinder',{height:.6,diameterTop:.22,diameterBottom:.17,tessellation:8},shin,new BABYLON.Vector3(0,-.29,0),ink);const ankle=node('AnkleJoint'+side,shin,new BABYLON.Vector3(0,-.59,0));const foot=mesh('Boot'+side,'box',{width:.25,height:.18,depth:.43},ankle,new BABYLON.Vector3(0,-.08,-.1),ink);return {hip,thigh,knee,shin,ankle}}
  const leftLeg=makeLeg('L'),rightLeg=makeLeg('R');

  // Sword socket follows the articulated right wrist.
  const weaponSocket=node('CultivatorWeaponSocket',rightArm.wrist,new BABYLON.Vector3(0,-.12,0));weaponSocket.rotation.z=-.2;
  mesh('ImmortalSwordBlade','box',{width:.075,height:1.45,depth:.035},weaponSocket,new BABYLON.Vector3(0,-.72,0),bladeMat);
  mesh('ImmortalSwordGuard','box',{width:.38,height:.07,depth:.08},weaponSocket,new BABYLON.Vector3(0,.02,0),goldMat);

  let phase=0;
  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.min(.033,engine.getDeltaTime()/1000);const speed=Math.abs(-joy.y+(keys.w?1:0)-(keys.s?1:0));const moving=speed>.05&&!mounted;
    if(moving)phase+=dt*8.5;else phase+=dt*1.8;
    const swing=moving?Math.sin(phase):Math.sin(phase)*.035;
    const bend=moving?Math.max(0,Math.sin(phase))*0.42:0;
    leftArm.upper.rotation.x=swing*.52;rightArm.upper.rotation.x=-swing*.52;
    leftArm.elbow.rotation.x=-Math.abs(swing)*.28;rightArm.elbow.rotation.x=-Math.abs(swing)*.28;
    leftLeg.thigh.rotation.x=-swing*.68;rightLeg.thigh.rotation.x=swing*.68;
    leftLeg.knee.rotation.x=bend;rightLeg.knee.rotation.x=moving?Math.max(0,-Math.sin(phase))*.42:0;
    leftLeg.shin.rotation.x=-leftLeg.knee.rotation.x*.55;rightLeg.shin.rotation.x=-rightLeg.knee.rotation.x*.55;
    pelvis.position.y=1.02+(moving?Math.abs(Math.sin(phase*2))*.035:Math.sin(phase*.5)*.012);
    spine.rotation.z=moving?Math.sin(phase)*.025:Math.sin(phase*.35)*.012;
    pony.rotation.x=.08+(moving?Math.sin(phase-.8)*.12:Math.sin(phase*.45)*.035);
    sashL.rotation.x=moving?Math.sin(phase-.5)*.14:.03*Math.sin(phase);sashR.rotation.x=moving?Math.sin(phase+.3)*.12:.03*Math.sin(phase+.5);
    if(attackT>0){rightArm.upper.rotation.x=-1.15;rightArm.upper.rotation.z=-.55;rightArm.elbow.rotation.x=-.75}else rightArm.upper.rotation.z*=.75;
    rig.setEnabled(!mounted);
  });
})();