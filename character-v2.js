// Procedural Xianxia fallback. It stays hidden whenever the rigged GLB player is active.
(() => {
  [torso,armor,head,hair,armL,armR,legL,legR].forEach(m=>m.setEnabled(false));
  if(handSocket) handSocket.setEnabled(false);

  const skin=mat('cultivatorSkin','#d6b39b'), robe=mat('moonRobe','#d9e5e7'), robe2=mat('robeShadow','#8096a0'), ink=mat('inkSilk','#17242b'), jade=mat('jadeTrim','#79b8ad'), silver=mat('silverTrim','#b9c9cc');
  const rig=new BABYLON.TransformNode('CultivatorRig',scene);rig.parent=bodyRoot;
  const node=(name,parent,pos)=>{const n=new BABYLON.TransformNode(name,scene);n.parent=parent;n.position.copyFrom(pos);return n};
  const mesh=(name,type,opt,parent,pos,material)=>{let m=type==='box'?BABYLON.MeshBuilder.CreateBox(name,opt,scene):type==='sphere'?BABYLON.MeshBuilder.CreateSphere(name,opt,scene):BABYLON.MeshBuilder.CreateCylinder(name,opt,scene);m.parent=parent;m.position.copyFrom(pos);m.material=material;shadow.addShadowCaster(m);return m};
  const pelvis=node('PelvisJoint',rig,new BABYLON.Vector3(0,1.02,0));mesh('Waist','cylinder',{height:.34,diameter:.62,tessellation:10},pelvis,new BABYLON.Vector3(0,.08,0),ink);
  const spine=node('SpineJoint',pelvis,new BABYLON.Vector3(0,.34,0));mesh('InnerRobe','box',{width:.72,height:.92,depth:.36},spine,new BABYLON.Vector3(0,.42,0),robe2);mesh('OuterRobe','box',{width:.84,height:.78,depth:.42},spine,new BABYLON.Vector3(0,.48,0),robe);mesh('JadeBelt','box',{width:.9,height:.12,depth:.47},spine,new BABYLON.Vector3(0,.08,0),jade);const skirt=mesh('LongRobeSkirt','cylinder',{height:1.12,diameterTop:.7,diameterBottom:1.05,tessellation:10},pelvis,new BABYLON.Vector3(0,-.42,0),robe);skirt.scaling.z=.62;
  const neck=node('NeckJoint',spine,new BABYLON.Vector3(0,1.02,0));mesh('Neck','cylinder',{height:.2,diameter:.22,tessellation:10},neck,new BABYLON.Vector3(0,0,0),skin);const headJoint=node('HeadJoint',neck,new BABYLON.Vector3(0,.31,0));mesh('CultivatorHead','sphere',{diameter:.48,segments:12},headJoint,new BABYLON.Vector3(0,0,0),skin);mesh('HairCap','sphere',{diameter:.51,segments:10},headJoint,new BABYLON.Vector3(0,.08,.035),ink);
  function makeArm(side){const s=side==='L'?-1:1,shoulder=node('Shoulder'+side,spine,new BABYLON.Vector3(.53*s,.78,0)),upper=node('UpperArmJoint'+side,shoulder,new BABYLON.Vector3(0,0,0));mesh('UpperArm'+side,'cylinder',{height:.58,diameter:.2,tessellation:8},upper,new BABYLON.Vector3(0,-.28,0),robe);const fore=node('ForearmJoint'+side,upper,new BABYLON.Vector3(0,-.57,0));mesh('Forearm'+side,'cylinder',{height:.55,diameterTop:.19,diameterBottom:.14,tessellation:8},fore,new BABYLON.Vector3(0,-.27,0),robe);return {upper,fore}}
  const leftArm=makeArm('L'),rightArm=makeArm('R');
  function makeLeg(side){const s=side==='L'?-1:1,thigh=node('ThighJoint'+side,pelvis,new BABYLON.Vector3(.23*s,-.05,0));mesh('Thigh'+side,'cylinder',{height:.62,diameter:.25,tessellation:8},thigh,new BABYLON.Vector3(0,-.3,0),robe2);const shin=node('ShinJoint'+side,thigh,new BABYLON.Vector3(0,-.61,0));mesh('Shin'+side,'cylinder',{height:.6,diameterTop:.22,diameterBottom:.17,tessellation:8},shin,new BABYLON.Vector3(0,-.29,0),ink);return {thigh,shin}}
  const leftLeg=makeLeg('L'),rightLeg=makeLeg('R');
  let phase=0;
  scene.onBeforeRenderObservable.add(()=>{
    if(window.__RIGGED_PLAYER_ACTIVE__){rig.setEnabled(false);return}
    rig.setEnabled(!mounted);if(mounted)return;
    const dt=Math.min(.033,engine.getDeltaTime()/1000),speed=Math.abs(-joy.y+(keys.w?1:0)-(keys.s?1:0)),moving=speed>.05;phase+=dt*(moving?8.5:1.8);const swing=moving?Math.sin(phase):Math.sin(phase)*.035;
    leftArm.upper.rotation.x=swing*.52;rightArm.upper.rotation.x=-swing*.52;leftLeg.thigh.rotation.x=-swing*.68;rightLeg.thigh.rotation.x=swing*.68;pelvis.position.y=1.02+(moving?Math.abs(Math.sin(phase*2))*.035:Math.sin(phase*.5)*.012);
    if(attackT>0){rightArm.upper.rotation.x=-1.15;rightArm.upper.rotation.z=-.55}else rightArm.upper.rotation.z*=.75;
  });
})();