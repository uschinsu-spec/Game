(()=>{
  const scene=BABYLON.EngineStore.LastCreatedScene;
  if(!scene)return;
  const mat=(name,hex,emissive)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(hex);m.specularColor=new BABYLON.Color3(.08,.08,.08);if(emissive)m.emissiveColor=BABYLON.Color3.FromHexString(emissive);return m};
  const ivory=mat('xIvory','#e9edf0'),ink=mat('xInk','#16252b'),teal=mat('xTeal','#4f9f98'),jade=mat('xJade','#78c7b8','#153a34'),gold=mat('xGold','#d5b76a'),silk=mat('xSilk','#9fbfc2'),hair=mat('xHair','#10181f'),crystal=mat('xCrystal','#91efe0','#2a7d70');crystal.alpha=.92;
  const wait=()=>new Promise(resolve=>{const tick=()=>window.PLAYER_SOCKETS?resolve(window.PLAYER_SOCKETS):setTimeout(tick,80);tick()});
  function attach(mesh,bone,ref,pos,rot,scale){mesh.attachToBone(bone,ref);mesh.position.copyFrom(pos);mesh.rotation.copyFrom(rot||BABYLON.Vector3.Zero());if(scale)mesh.scaling.copyFrom(scale);mesh.isPickable=false;shadow.addShadowCaster(mesh);return mesh}
  function box(n,w,h,d,bone,ref,p,r,m){const x=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);x.material=m;return attach(x,bone,ref,p,r,null)}
  function cyl(n,top,bottom,hgt,bone,ref,p,r,m,tess=10){const x=BABYLON.MeshBuilder.CreateCylinder(n,{diameterTop:top,diameterBottom:bottom,height:hgt,tessellation:tess},scene);x.material=m;return attach(x,bone,ref,p,r,null)}
  function sph(n,d,bone,ref,p,s,m){const x=BABYLON.MeshBuilder.CreateSphere(n,{diameter:d,segments:10},scene);x.material=m;return attach(x,bone,ref,p,BABYLON.Vector3.Zero(),s||new BABYLON.Vector3(1,1,1))}
  wait().then(s=>{
    const sk=s.skeleton,ref=s.referenceMesh,b=n=>sk.bones.find(x=>x.name===n);
    const pelvis=b('pelvis'),chest=b('spine_03')||b('spine_02'),head=s.head,handR=s.rightHand;
    if(!pelvis||!chest||!head||!handR)return;

    // layered robe silhouette
    cyl('XianxiaLowerRobe',.68,1.08,1.15,pelvis,ref,new BABYLON.Vector3(0,-.48,.01),BABYLON.Vector3.Zero(),ivory,12);
    box('XianxiaFrontPanel',.48,1.25,.055,pelvis,ref,new BABYLON.Vector3(0,-.5,-.31),new BABYLON.Vector3(.04,0,0),teal);
    box('XianxiaBackPanel',.52,1.35,.05,pelvis,ref,new BABYLON.Vector3(0,-.53,.28),new BABYLON.Vector3(-.08,0,0),silk);
    box('XianxiaSashL',.1,1.15,.04,pelvis,ref,new BABYLON.Vector3(-.31,-.45,-.29),new BABYLON.Vector3(.05,0,.08),jade);
    box('XianxiaSashR',.1,1.05,.04,pelvis,ref,new BABYLON.Vector3(.31,-.4,-.29),new BABYLON.Vector3(-.04,0,-.08),gold);
    box('XianxiaBelt',.95,.13,.42,pelvis,ref,new BABYLON.Vector3(0,.08,0),BABYLON.Vector3.Zero(),ink);
    sph('XianxiaBeltGem',.2,pelvis,ref,new BABYLON.Vector3(0,.08,-.27),new BABYLON.Vector3(1,.8,.45),crystal);

    // elegant upper robe and shoulder guards
    box('XianxiaChestLayer',.82,.72,.42,chest,ref,new BABYLON.Vector3(0,.08,0),BABYLON.Vector3.Zero(),ivory);
    box('XianxiaChestTrim',.56,.11,.45,chest,ref,new BABYLON.Vector3(0,.26,-.02),new BABYLON.Vector3(0,0,.12),jade);
    const shL=b('upperarm_l'),shR=b('upperarm_r');
    if(shL)sph('ShoulderJadeL',.34,shL,ref,new BABYLON.Vector3(0,.08,0),new BABYLON.Vector3(1.25,.55,1),teal);
    if(shR)sph('ShoulderJadeR',.34,shR,ref,new BABYLON.Vector3(0,.08,0),new BABYLON.Vector3(1.25,.55,1),teal);

    // long black hair, crown and hairpin for cultivator silhouette
    sph('CultivatorHairCap',.56,head,ref,new BABYLON.Vector3(0,.08,.03),new BABYLON.Vector3(1,0.76,1),hair);
    cyl('CultivatorPonytail',.18,.07,.95,head,ref,new BABYLON.Vector3(0,-.35,.24),new BABYLON.Vector3(.12,0,0),hair,8);
    sph('CultivatorTopKnot',.2,head,ref,new BABYLON.Vector3(0,.36,.02),new BABYLON.Vector3(.85,1.45,.85),hair);
    cyl('CultivatorHairpin',.035,.035,.48,head,ref,new BABYLON.Vector3(0,.38,.02),new BABYLON.Vector3(0,0,Math.PI/2),gold,6);
    const crown=box('JadeCrown',.34,.18,.28,head,ref,new BABYLON.Vector3(0,.28,.01),BABYLON.Vector3.Zero(),jade);crown.scaling.y=.7;

    // refined sword and scabbard
    scene.getMeshByName('SocketSwordBlade')?.setEnabled(false);scene.getMeshByName('SocketSwordGuard')?.setEnabled(false);
    box('ThanhVanBlade',.06,1.28,.026,handR,ref,new BABYLON.Vector3(0,-.57,.05),new BABYLON.Vector3(0,0,-.1),crystal);
    box('ThanhVanGuard',.34,.06,.08,handR,ref,new BABYLON.Vector3(0,.04,.05),new BABYLON.Vector3(0,0,-.1),gold);
    cyl('ThanhVanGrip',.07,.07,.3,handR,ref,new BABYLON.Vector3(0,.2,.05),new BABYLON.Vector3(0,0,-.1),ink,8);
    box('BackScabbard',.11,1.1,.08,chest,ref,new BABYLON.Vector3(.28,.08,.3),new BABYLON.Vector3(.2,0,-.5),ink);
    box('BackScabbardTrim',.14,.08,.11,chest,ref,new BABYLON.Vector3(.45,.52,.3),new BABYLON.Vector3(.2,0,-.5),gold);

    // subtle floating jade ornaments around waist
    for(let i=0;i<3;i++){const orb=sph('SpiritJade'+i,.1,pelvis,ref,new BABYLON.Vector3((i-1)*.26,-.06,-.38),new BABYLON.Vector3(1,1,.7),crystal);orb.metadata={phase:i*2.1}}
    const start=performance.now();scene.onBeforeRenderObservable.add(()=>{const t=(performance.now()-start)/1000;for(let i=0;i<3;i++){const o=scene.getMeshByName('SpiritJade'+i);if(o)o.position.y=-.06+Math.sin(t*2+i*2.1)*.035}});
    console.info('Polished xianxia chibi appearance enabled');
  });
})();