(()=>{
  const scene=BABYLON.EngineStore.LastCreatedScene;
  if(!scene)return;
  const mk=(name,hex,emissive)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(hex);m.specularColor=new BABYLON.Color3(.07,.07,.07);m.roughness=.82;if(emissive)m.emissiveColor=BABYLON.Color3.FromHexString(emissive);return m};
  const ivory=mk('xIvory','#e9eef0'),ivoryShade=mk('xIvoryShade','#b9c9cd'),ink=mk('xInk','#14242b'),teal=mk('xTeal','#3f918c'),tealDark=mk('xTealDark','#286763'),jade=mk('xJade','#78c7b8','#123f39'),gold=mk('xGold','#d6b566','#3b2a0c'),silk=mk('xSilk','#9bbfc3'),hair=mk('xHair','#0d151b'),skinAccent=mk('xSkinAccent','#d5b29d'),crystal=mk('xCrystal','#91efe0','#277b70'),aura=mk('xAura','#8ef5df','#2c8f7e');
  crystal.alpha=.93;aura.alpha=.34;aura.backFaceCulling=false;
  const wait=()=>new Promise(resolve=>{const tick=()=>window.PLAYER_SOCKETS?resolve(window.PLAYER_SOCKETS):setTimeout(tick,60);tick()});
  const safeShadow=m=>{m.isPickable=false;m.receiveShadows=true;try{shadow.addShadowCaster(m)}catch(_){}return m};
  function attach(mesh,bone,ref,pos,rot,scale){mesh.attachToBone(bone,ref);mesh.position.copyFrom(pos||BABYLON.Vector3.Zero());mesh.rotation.copyFrom(rot||BABYLON.Vector3.Zero());if(scale)mesh.scaling.copyFrom(scale);return safeShadow(mesh)}
  function box(n,w,h,d,bone,ref,p,r,m){const x=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);x.material=m;return attach(x,bone,ref,p,r)}
  function cyl(n,top,bottom,hgt,bone,ref,p,r,m,tess=12){const x=BABYLON.MeshBuilder.CreateCylinder(n,{diameterTop:top,diameterBottom:bottom,height:hgt,tessellation:tess},scene);x.material=m;return attach(x,bone,ref,p,r)}
  function sph(n,d,bone,ref,p,s,m){const x=BABYLON.MeshBuilder.CreateSphere(n,{diameter:d,segments:12},scene);x.material=m;return attach(x,bone,ref,p,BABYLON.Vector3.Zero(),s||new BABYLON.Vector3(1,1,1))}
  function torus(n,diam,thick,bone,ref,p,r,m){const x=BABYLON.MeshBuilder.CreateTorus(n,{diameter:diam,thickness:thick,tessellation:24},scene);x.material=m;return attach(x,bone,ref,p,r)}
  wait().then(s=>{
    const sk=s.skeleton,ref=s.referenceMesh,b=n=>sk.bones.find(x=>x.name===n);
    const pelvis=b('pelvis'),chest=b('spine_03')||b('spine_02'),neck=b('neck_01'),head=s.head;
    const uaL=b('upperarm_l'),uaR=b('upperarm_r'),laL=b('lowerarm_l'),laR=b('lowerarm_r');
    const handL=s.leftHand,handR=s.rightHand,thighL=b('thigh_l'),thighR=b('thigh_r'),calfL=b('calf_l'),calfR=b('calf_r'),footL=s.leftFoot,footR=s.rightFoot;
    if(!pelvis||!chest||!head||!handR)return;

    // Chibi xianxia torso: rounded layered silhouette, narrow waist, wide flowing hem.
    cyl('ImmortalInnerRobe',.66,.84,.88,chest,ref,new BABYLON.Vector3(0,-.08,0),BABYLON.Vector3.Zero(),ivoryShade,14);
    cyl('ImmortalOuterRobe',.78,.98,.8,chest,ref,new BABYLON.Vector3(0,-.03,0),BABYLON.Vector3.Zero(),ivory,14);
    box('CrossCollarL',.16,.7,.44,chest,ref,new BABYLON.Vector3(-.12,.18,-.02),new BABYLON.Vector3(0,0,-.34),teal);
    box('CrossCollarR',.16,.7,.45,chest,ref,new BABYLON.Vector3(.12,.18,-.025),new BABYLON.Vector3(0,0,.34),jade);
    box('ChestCloudTrim',.58,.09,.47,chest,ref,new BABYLON.Vector3(0,.36,-.015),BABYLON.Vector3.Zero(),gold);
    box('ImmortalBelt',1.02,.15,.46,pelvis,ref,new BABYLON.Vector3(0,.09,0),BABYLON.Vector3.Zero(),ink);
    box('BeltJadePlate',.46,.2,.06,pelvis,ref,new BABYLON.Vector3(0,.09,-.29),BABYLON.Vector3.Zero(),jade);
    sph('BeltSpiritGem',.18,pelvis,ref,new BABYLON.Vector3(0,.09,-.34),new BABYLON.Vector3(1,.82,.46),crystal);

    // Multi-layer lower robe hides the old superhero leg silhouette.
    cyl('ImmortalLowerRobe',.7,1.2,1.22,pelvis,ref,new BABYLON.Vector3(0,-.5,.02),BABYLON.Vector3.Zero(),ivory,16);
    box('FrontJadePanel',.5,1.34,.055,pelvis,ref,new BABYLON.Vector3(0,-.52,-.37),new BABYLON.Vector3(.025,0,0),teal);
    box('FrontGoldSeam',.07,1.26,.065,pelvis,ref,new BABYLON.Vector3(0,-.52,-.405),BABYLON.Vector3.Zero(),gold);
    const backPanel=box('BackSilkPanel',.66,1.48,.06,pelvis,ref,new BABYLON.Vector3(0,-.57,.35),new BABYLON.Vector3(-.1,0,0),silk);
    const sashL=box('FlowingJadeSashL',.11,1.28,.045,pelvis,ref,new BABYLON.Vector3(-.34,-.46,-.34),new BABYLON.Vector3(.08,0,.1),jade);
    const sashR=box('FlowingGoldSashR',.095,1.16,.045,pelvis,ref,new BABYLON.Vector3(.34,-.42,-.34),new BABYLON.Vector3(-.06,0,-.1),gold);

    // Full sleeves and cuffs, attached segment-by-segment so animation remains readable.
    const sleeve=(side,ua,la,hand)=>{if(!ua||!la)return;const sign=side==='L'?-1:1;
      sph('CloudShoulder'+side,.39,ua,ref,new BABYLON.Vector3(0,.07,0),new BABYLON.Vector3(1.35,.58,1.08),tealDark);
      cyl('UpperSleeve'+side,.34,.28,.62,ua,ref,new BABYLON.Vector3(0,-.27,0),BABYLON.Vector3.Zero(),ivory,12);
      cyl('LowerSleeve'+side,.29,.2,.56,la,ref,new BABYLON.Vector3(0,-.25,0),BABYLON.Vector3.Zero(),silk,12);
      if(hand){cyl('JadeCuff'+side,.23,.23,.13,hand,ref,new BABYLON.Vector3(0,.03,0),BABYLON.Vector3.Zero(),jade,10);box('CuffGold'+side,.26,.055,.22,hand,ref,new BABYLON.Vector3(0,.03,-.01),BABYLON.Vector3.Zero(),gold)}
      box('SleeveRibbon'+side,.065,.72,.035,la,ref,new BABYLON.Vector3(.13*sign,-.31,-.13),new BABYLON.Vector3(.08,0,.08*sign),teal);
    };
    sleeve('L',uaL,laL,handL);sleeve('R',uaR,laR,handR);

    // Dark under-trousers and ivory boots remove leftover modern/superhero shapes during running.
    const leg=(side,thigh,calf,foot)=>{if(thigh)cyl('InnerTrouser'+side,.27,.23,.58,thigh,ref,new BABYLON.Vector3(0,-.27,0),BABYLON.Vector3.Zero(),ink,10);if(calf)cyl('ImmortalBootShaft'+side,.24,.19,.55,calf,ref,new BABYLON.Vector3(0,-.25,0),BABYLON.Vector3.Zero(),tealDark,10);if(foot){box('ImmortalBoot'+side,.27,.18,.42,foot,ref,new BABYLON.Vector3(0,-.04,-.09),BABYLON.Vector3.Zero(),ink);box('BootJadeTrim'+side,.29,.055,.25,foot,ref,new BABYLON.Vector3(0,.045,-.07),BABYLON.Vector3.Zero(),jade)}};
    leg('L',thighL,calfL,footL);leg('R',thighR,calfR,footR);

    // Head treatment: large hair mass, side locks, long ponytail, crown and hairpin.
    sph('ImmortalHairCap',.6,head,ref,new BABYLON.Vector3(0,.075,.035),new BABYLON.Vector3(1.04,.78,1.02),hair);
    if(neck){cyl('LongHairBack',.24,.09,1.12,neck,ref,new BABYLON.Vector3(0,-.36,.24),new BABYLON.Vector3(.14,0,0),hair,9);box('HairRibbon',.12,.78,.045,neck,ref,new BABYLON.Vector3(0,-.48,.29),new BABYLON.Vector3(.12,0,0),teal)}
    cyl('SideLockL',.08,.035,.66,head,ref,new BABYLON.Vector3(-.22,-.19,.02),new BABYLON.Vector3(.08,0,-.12),hair,7);
    cyl('SideLockR',.08,.035,.66,head,ref,new BABYLON.Vector3(.22,-.19,.02),new BABYLON.Vector3(.08,0,.12),hair,7);
    sph('ImmortalTopKnot',.22,head,ref,new BABYLON.Vector3(0,.37,.02),new BABYLON.Vector3(.88,1.52,.88),hair);
    box('JadeCrown',.37,.18,.29,head,ref,new BABYLON.Vector3(0,.29,.01),BABYLON.Vector3.Zero(),jade);
    box('CrownGoldLine',.4,.045,.31,head,ref,new BABYLON.Vector3(0,.35,.01),BABYLON.Vector3.Zero(),gold);
    cyl('GoldenHairpin',.034,.034,.56,head,ref,new BABYLON.Vector3(0,.4,.02),new BABYLON.Vector3(0,0,Math.PI/2),gold,7);
    sph('CrownPearl',.09,head,ref,new BABYLON.Vector3(0,.42,-.08),new BABYLON.Vector3(1,1,.75),crystal);

    // Back mantle and scabbard build the cultivator silhouette from 3/4 and rear camera angles.
    const mantle=box('CloudMantle',1.0,.74,.055,chest,ref,new BABYLON.Vector3(0,.05,.31),new BABYLON.Vector3(-.13,0,0),ivoryShade);
    box('MantleJadeEdge',.92,.07,.065,chest,ref,new BABYLON.Vector3(0,.37,.32),BABYLON.Vector3.Zero(),jade);
    box('BackScabbard',.12,1.22,.09,chest,ref,new BABYLON.Vector3(.31,.03,.39),new BABYLON.Vector3(.18,0,-.52),ink);
    box('ScabbardGoldTop',.17,.09,.13,chest,ref,new BABYLON.Vector3(.48,.52,.39),new BABYLON.Vector3(.18,0,-.52),gold);
    box('ScabbardJadeMark',.15,.18,.12,chest,ref,new BABYLON.Vector3(.22,-.38,.39),new BABYLON.Vector3(.18,0,-.52),jade);

    // Replace placeholder sword with a cleaner fantasy blade using the real right-hand socket.
    scene.getMeshByName('SocketSwordBlade')?.setEnabled(false);scene.getMeshByName('SocketSwordGuard')?.setEnabled(false);scene.getMeshByName('ThanhVanBlade')?.setEnabled(false);scene.getMeshByName('ThanhVanGuard')?.setEnabled(false);scene.getMeshByName('ThanhVanGrip')?.setEnabled(false);
    box('AzureSwordBlade',.064,1.35,.03,handR,ref,new BABYLON.Vector3(0,-.6,.055),new BABYLON.Vector3(0,0,-.1),crystal);
    box('AzureSwordSpine',.023,1.22,.042,handR,ref,new BABYLON.Vector3(.03,-.58,.055),new BABYLON.Vector3(0,0,-.1),ivory);
    box('AzureSwordGuard',.4,.065,.095,handR,ref,new BABYLON.Vector3(0,.055,.055),new BABYLON.Vector3(0,0,-.1),gold);
    cyl('AzureSwordGrip',.075,.075,.32,handR,ref,new BABYLON.Vector3(0,.225,.055),new BABYLON.Vector3(0,0,-.1),ink,10);
    sph('AzureSwordPommel',.12,handR,ref,new BABYLON.Vector3(0,.405,.055),new BABYLON.Vector3(1,.72,1),jade);

    // Premium but restrained aura: waist jade charms + rotating spirit ring at the feet.
    const orbs=[];for(let i=0;i<4;i++){const o=sph('SpiritCharm'+i,.105,pelvis,ref,new BABYLON.Vector3((i-1.5)*.23,-.02,-.42),new BABYLON.Vector3(1,1,.68),i%2?jade:crystal);o.metadata={phase:i*1.57};orbs.push(o)}
    const ring=torus('CultivatorSpiritRing',1.35,.035,pelvis,ref,new BABYLON.Vector3(0,-1.12,0),new BABYLON.Vector3(Math.PI/2,0,0),aura);
    const ring2=torus('CultivatorSpiritRingInner',.94,.022,pelvis,ref,new BABYLON.Vector3(0,-1.105,0),new BABYLON.Vector3(Math.PI/2,0,0),crystal);ring2.material.alpha=.25;

    const start=performance.now();scene.onBeforeRenderObservable.add(()=>{
      const t=(performance.now()-start)/1000;
      orbs.forEach((o,i)=>{o.position.y=-.02+Math.sin(t*2.1+i*1.57)*.032;o.rotation.y=t*.8+i});
      ring.rotation.z=t*.34;ring2.rotation.z=-t*.42;
      const moving=Math.abs(-joy.y+(keys.w?1:0)-(keys.s?1:0))>.05||Math.abs(joy.x+(keys.d?1:0)-(keys.a?1:0))>.1;
      const sway=moving?Math.sin(t*7.5)*.09:Math.sin(t*2)*.025;
      backPanel.rotation.x=-.1+sway;sashL.rotation.x=.08+sway*1.25;sashR.rotation.x=-.06-sway;mantle.rotation.x=-.13+sway*.35;
    });
    window.XIANXIA_PLAYER_STYLE_READY=true;
    console.info('Premium chibi xianxia appearance ready');
  });
})();