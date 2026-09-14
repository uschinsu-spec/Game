(()=>{
  window.createPaintedValleyEnvironment=function(scene,shadow){
    const mk=(name,color)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor.set(0.02,0.02,0.02);return m};
    const grass=mk('pvGrass','#6fc94f'),grass2=mk('pvGrass2','#93df64'),path=mk('pvPath','#cbbd7a'),rock=mk('pvRock','#7e896e'),rock2=mk('pvRock2','#a6ad8b'),leaf=mk('pvLeaf','#76c94e'),leaf2=mk('pvLeaf2','#a9dd61'),trunk=mk('pvTrunk','#6b4c2d'),mist=mk('pvMist','#d8f0df');mist.alpha=.22;
    const root=new BABYLON.TransformNode('PaintedValleyRoot',scene);
    function addCaster(m){if(shadow)shadow.addShadowCaster(m);return m}
    function roundedRock(x,z,sx,sy,sz,matl=rock){const r=BABYLON.MeshBuilder.CreateSphere('PaintedRock',{diameter:2,segments:8},scene);r.parent=root;r.position.set(x,sy*.42,z);r.scaling.set(sx,sy,sz);r.material=matl;r.receiveShadows=true;return r}
    function tree(x,z,s=1,palm=false){const t=BABYLON.MeshBuilder.CreateCylinder('PaintedTree',{height:5.8*s,diameterTop:.22*s,diameterBottom:.45*s,tessellation:7},scene);t.parent=root;t.position.set(x,2.9*s,z);t.material=trunk;addCaster(t);if(palm){for(let i=0;i<6;i++){const l=BABYLON.MeshBuilder.CreateSphere('PalmLeaf',{diameter:2.2*s,segments:6},scene);l.parent=root;l.position.set(x,5.65*s,z);l.scaling.set(1.6,.18,.45);l.rotation.y=i*Math.PI/3;l.rotation.z=.2;l.material=i%2?leaf:leaf2}}else{for(let i=0;i<3;i++){const c=BABYLON.MeshBuilder.CreateSphere('PaintedCrown',{diameter:2.5*s,segments:8},scene);c.parent=root;c.position.set(x+(i-1)*.55*s,5.3*s+Math.abs(i-1)*.25*s,z);c.scaling.y=.8;c.material=i%2?leaf:leaf2}}}
    // layered ground ribbons create a hand-painted mobile idle valley without external textures
    const base=BABYLON.MeshBuilder.CreateGround('PaintedGround',{width:120,height:260,subdivisions:2},scene);base.parent=root;base.position.set(0,.035,-42);base.material=grass;base.receiveShadows=true;
    const road=BABYLON.MeshBuilder.CreateGround('PaintedRoad',{width:16,height:245,subdivisions:18},scene);road.parent=root;road.position.set(0,.06,-45);road.material=path;road.receiveShadows=true;
    for(let i=0;i<22;i++){const patch=BABYLON.MeshBuilder.CreateGround('GrassPatch',{width:7+Math.random()*10,height:10+Math.random()*15},scene);patch.parent=root;patch.position.set((Math.random()>.5?1:-1)*(9+Math.random()*37),.07,70-Math.random()*220);patch.rotation.y=(Math.random()-.5)*.6;patch.material=grass2}
    // foreground rocks and broken temple slabs
    for(let i=0;i<34;i++){const side=i%2?1:-1;const z=78-Math.random()*220;roundedRock(side*(11+Math.random()*34),z,1.1+Math.random()*2.8,.6+Math.random()*1.5,1+Math.random()*2.4,i%3?rock:rock2)}
    for(let i=0;i<18;i++){const side=i%2?1:-1;tree(side*(16+Math.random()*30),72-Math.random()*210,.75+Math.random()*.8,i%5===0)}
    // soft distant mountain walls, stylized and readable like a painted mobile backdrop
    const mountainMatA=mk('pvMountainA','#6ea46e'),mountainMatB=mk('pvMountainB','#7eb28a'),mountainMatC=mk('pvMountainC','#9dc7a6');
    [[-34,-128,28,45,mountainMatA],[30,-138,32,58,mountainMatB],[-52,-170,38,72,mountainMatC],[52,-178,42,78,mountainMatA],[0,-210,55,92,mountainMatB]].forEach(v=>{const m=BABYLON.MeshBuilder.CreateCylinder('PaintedMountain',{diameterTop:v[2]*.1,diameterBottom:v[2]*2,height:v[3],tessellation:7},scene);m.parent=root;m.position.set(v[0],v[3]/2-1,v[1]);m.scaling.x=.65;m.material=v[4]});
    // flower dots and warm path markers improve the illustrated feel
    const flowerA=mk('pvFlowerA','#f4dc70'),flowerB=mk('pvFlowerB','#fff2b6');
    for(let i=0;i<70;i++){const f=BABYLON.MeshBuilder.CreateSphere('PaintedFlower',{diameter:.11+Math.random()*.08,segments:4},scene);f.parent=root;const side=Math.random()>.5?1:-1;f.position.set(side*(8+Math.random()*38),.16,76-Math.random()*205);f.material=i%2?flowerA:flowerB}
    for(let i=0;i<8;i++){const fog=BABYLON.MeshBuilder.CreateSphere('PaintedMist',{diameter:18+Math.random()*12,segments:8},scene);fog.parent=root;fog.position.set((Math.random()-.5)*70,7+Math.random()*8,-95-Math.random()*95);fog.scaling.y=.18;fog.material=mist}
    return root;
  };
})();