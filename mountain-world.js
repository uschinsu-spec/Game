/* Thiên Vân Tông: procedural mountaintop environment, no external assets. */
window.MountainWorld = class MountainWorld {
  constructor(scene) {
    this.scene=scene;this.obstacles=[];this.clouds=[];this.serial=0;
    this.summitScale=5;this.plazaScale=2;
    this.summitCenter={x:0,z:3*this.summitScale};
    this.railingRadius=68.2*this.summitScale;
    this.walkRadius=this.railingRadius-2;
    this.bounds={minX:-this.walkRadius,maxX:this.walkRadius,minZ:this.summitCenter.z-this.walkRadius,maxZ:this.summitCenter.z+this.walkRadius};
  }
  material(name, hex, glow=0) {
    const m=new BABYLON.StandardMaterial(name,this.scene);
    m.diffuseColor=BABYLON.Color3.FromHexString(hex);m.specularColor=new BABYLON.Color3(.08,.08,.08);
    if(glow)m.emissiveColor=m.diffuseColor.scale(glow);
    return m;
  }
  mesh(type,options,x,y,z,material) {
    const m=BABYLON.MeshBuilder[type](`sect_${this.serial++}`,options,this.scene);
    m.position.set(x,y,z);m.material=material;m.isPickable=false;
    if(m.freezeWorldMatrix)m.freezeWorldMatrix();
    return m;
  }
  box(x,y,z,w,h,d,mat) { return this.mesh('CreateBox',{width:w,height:h,depth:d},x,y,z,mat); }
  roof(x,y,z,w,d,h) {
    // Four curved slopes, with raised eave tips and gold ridges.
    const B=BABYLON, rings=[[1,.65],[.82,0],[.5,h*.48],[.03,h]];
    const positions=[],indices=[];
    for(const [scale,dy] of rings)for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]])positions.push(x+sx*w*scale/2,y+dy,z+sz*d*scale/2);
    for(let r=0;r<3;r++)for(let i=0;i<4;i++){const a=r*4+i,b=r*4+(i+1)%4,c=b+4,e=a+4;indices.push(a,b,c,a,c,e);}
    const data=new B.VertexData();data.positions=positions;data.indices=indices;data.normals=[];B.VertexData.ComputeNormals(positions,indices,data.normals);
    const roof=new B.Mesh(`jade_roof_${this.serial++}`,this.scene);data.applyToMesh(roof);roof.material=this.jade;roof.isPickable=false;
    for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
      const path=rings.map(([s,dy])=>new B.Vector3(x+sx*w*s/2,y+dy+.06,z+sz*d*s/2));
      const trim=B.MeshBuilder.CreateTube(`gold_ridge_${this.serial++}`,{path,radius:.09,tessellation:5},this.scene);trim.material=this.gold;trim.isPickable=false;
    }
    this.mesh('CreateSphere',{diameter:.65,segments:8},x,y+h+.35,z,this.gold);
  }
  hall(x,z,scale=1,tiers=2) {
    const w=20*scale,d=12*scale;
    this.box(x,.7,z,w+3,1.4,d+3,this.stone);
    this.obstacles.push({x,z,w:w+4,d:d+4});
    this.box(x,4*scale,z,w-2,5.5*scale,d-2,this.cream);
    this.box(x,3.1*scale,z-d/2+.4,5*scale,4.3*scale,.3,this.wood);
    for(const dx of [-.43,-.23,.23,.43])for(const dz of [-.48,.48]){
      this.mesh('CreateCylinder',{height:6*scale,diameter:.65*scale,tessellation:8},x+dx*w,3*scale+1,z+dz*d,this.red);
      this.box(x+dx*w,1.35,z+dz*d,1*scale,.5,1*scale,this.gold);
    }
    for(let i=0;i<tiers;i++){
      const s=1-i*.21,y=6.5*scale+i*3.3*scale;
      if(i)this.box(x,y-.9*scale,z,w*s*.7,2.8*scale,d*s*.65,this.red);
      this.roof(x,y,z,(w+5)*s,(d+5)*s,3*scale);
    }
    for(let i=0;i<5;i++)this.box(x,.14*(5-i),z-d/2-1-i*.65,8*scale,.28*(5-i),.7,this.stone);
  }
  constrain(position) {
    this.clampToSummit(position);
    for(const o of this.obstacles){const dx=position.x-o.x,dz=position.z-o.z,px=o.w/2+.6-Math.abs(dx),pz=o.d/2+.6-Math.abs(dz);if(px>0&&pz>0){if(px<pz)position.x=o.x+(dx<0?-1:1)*(o.w/2+.6);else position.z=o.z+(dz<0?-1:1)*(o.d/2+.6);}}
    this.clampToSummit(position);
  }
  onSummit(p) { return Math.hypot(p.x-this.summitCenter.x,p.z-this.summitCenter.z)<=this.walkRadius+1e-6; }
  clampToSummit(p) {
    const dx=p.x-this.summitCenter.x,dz=p.z-this.summitCenter.z,d=Math.hypot(dx,dz);
    if(d>this.walkRadius){p.x=this.summitCenter.x+dx/d*this.walkRadius;p.z=this.summitCenter.z+dz/d*this.walkRadius;}
  }
  findPath(start,point) {
    // Visibility graph around expanded building footprints, with clearance for the player.
    const B=BABYLON,b=this.bounds,target=point.clone();this.constrain(target);target.y=start.y;
    const rects=this.obstacles.map(o=>({minX:o.x-o.w/2-.7,maxX:o.x+o.w/2+.7,minZ:o.z-o.d/2-.7,maxZ:o.z+o.d/2+.7}));
    const inside=(p,r)=>p.x>r.minX&&p.x<r.maxX&&p.z>r.minZ&&p.z<r.maxZ;
    // A click inside a building is not a movement command.
    if(rects.some(r=>inside(target,r)))return [];
    const clear=(a,c)=>!rects.some(r=>{
      let lo=0,hi=1;
      for(const axis of ['X','Z']){const k=axis.toLowerCase(),d=c[k]-a[k];if(Math.abs(d)<1e-8){if(a[k]<=r['min'+axis]||a[k]>=r['max'+axis])return false;}else{let t1=(r['min'+axis]-a[k])/d,t2=(r['max'+axis]-a[k])/d;if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>=hi)return false;}}
      return hi>0&&lo<1;
    });
    if(clear(start,target))return [target];
    const nodes=[start.clone(),target];
    for(const r of rects)for(const x of [r.minX-.08,r.maxX+.08])for(const z of [r.minZ-.08,r.maxZ+.08]){
      const p=new B.Vector3(x,start.y,z);if(this.onSummit(p)&&!rects.some(o=>inside(p,o)))nodes.push(p);
    }
    const distances=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),visited=new Set();distances[0]=0;
    while(visited.size<nodes.length){let i=-1;for(let n=0;n<nodes.length;n++)if(!visited.has(n)&&(i<0||distances[n]<distances[i]))i=n;if(i<0||!Number.isFinite(distances[i]))return [];if(i===1)break;visited.add(i);
      for(let j=0;j<nodes.length;j++)if(!visited.has(j)&&clear(nodes[i],nodes[j])){const cost=distances[i]+B.Vector3.Distance(nodes[i],nodes[j]);if(cost<distances[j]){distances[j]=cost;previous[j]=i;}}
    }
    const path=[];for(let i=1;i>0;i=previous[i]){if(i<0)return [];path.unshift(nodes[i]);}return path;
  }
  mountain(x,z,height,width,seed,material) {
    const B=BABYLON,positions=[],indices=[],sides=12;
    // Uneven ridgelines and offset summits, rather than regular cone silhouettes.
    for(let ring=0;ring<7;ring++){
      const t=ring/6,radius=width*Math.pow(1-t,.8)+2;
      for(let j=0;j<sides;j++){
        const a=j/sides*Math.PI*2,noise=1+.19*Math.sin(j*2.7+seed)+.12*Math.cos(j*4.3+ring*1.6+seed);
        positions.push(x+Math.cos(a)*radius*noise+Math.sin(seed)*t*t*width*.35,
          -155+t*height+(ring>0&&ring<6?Math.sin(j*1.8+seed)*height*.065:0),
          z+Math.sin(a)*radius*noise+Math.cos(seed*2)*t*t*width*.3);
      }
    }
    for(let r=0;r<6;r++)for(let j=0;j<sides;j++){const a=r*sides+j,b=r*sides+(j+1)%sides;indices.push(a,b,b+sides,a,b+sides,a+sides);}
    const mesh=new B.Mesh(`horizon_peak_${seed}`,this.scene),data=new B.VertexData();
    data.positions=positions;data.indices=indices;data.normals=[];B.VertexData.ComputeNormals(positions,indices,data.normals);data.applyToMesh(mesh);
    mesh.material=material;mesh.isPickable=false;mesh.convertToFlatShadedMesh();mesh.freezeWorldMatrix();
  }
  createHorizon() {
    const B=BABYLON;
    const skyMat=this.material('painted dawn sky','#ffffff');skyMat.disableLighting=true;skyMat.emissiveColor=B.Color3.White();skyMat.fogEnabled=false;
    const sky=this.mesh('CreateSphere',{diameter:5200,segments:32,sideOrientation:B.Mesh.BACKSIDE},0,0,0,skyMat);
    const vertices=sky.getVerticesData(B.VertexBuffer.PositionKind),colors=[];
    const top=B.Color3.FromHexString('#649bbd'),middle=B.Color3.FromHexString('#b4d4df'),horizon=B.Color3.FromHexString('#f6d8b5'),bottom=B.Color3.FromHexString('#9cb5c7');
    for(let i=0;i<vertices.length;i+=3){const y=vertices[i+1]/2600;let c;
      if(y>.22)c=B.Color3.Lerp(middle,top,Math.min(1,(y-.22)/.7));
      else if(y>0)c=B.Color3.Lerp(horizon,middle,y/.22);
      else c=B.Color3.Lerp(horizon,bottom,Math.min(1,-y/.18));
      colors.push(c.r,c.g,c.b,1);
    }
    sky.setVerticesData(B.VertexBuffer.ColorKind,colors);sky.hasVertexAlpha=false;sky.infiniteDistance=true;
    const sunMat=this.material('soft gold sun','#ffecc4',1);sunMat.disableLighting=true;sunMat.fogEnabled=false;
    this.mesh('CreateSphere',{diameter:100,segments:20},-850,290,1650,sunMat);
    const palettes=['#bbc4cf','#8faab9','#557c8e'];
    for(let layer=0;layer<3;layer++){
      const material=this.material(`mountain mist layer ${layer}`,palettes[layer],.18);material.backFaceCulling=false;
      const count=32-layer*5,radius=1700-layer*450;
      for(let i=0;i<count;i++){
        const a=i/count*Math.PI*2+layer*.13,h=190+(Math.sin(i*2.39+layer)*.5+.5)*150+(2-layer)*60;
        this.mountain(Math.sin(a)*radius,Math.cos(a)*radius,h,130+layer*12,i+layer*43,material);
      }
    }
    const cloudMat=this.material('luminous cloud banks','#e4e6e6',.4);
    for(let i=0;i<36;i++){
      const a=i/36*Math.PI*2,r=440+(i%3)*180;
      const c=this.mesh('CreateSphere',{diameter:1,segments:10},Math.sin(a)*r,-45-(i%4)*13,Math.cos(a)*r,cloudMat);
      c.scaling.set(240+(i%3)*65,15+(i%3)*7,105+(i%4)*25);c.rotation.y=a;this.clouds.push(c);
    }
    const sunlight=new B.DirectionalLight('dawn sunlight',new B.Vector3(.5,-.65,-1),this.scene);sunlight.diffuse=B.Color3.FromHexString('#ffe5bf');sunlight.intensity=.6;
  }
  create() {
    const B=BABYLON;
    this.stone=this.material('white marble','#bfc9c9');this.cream=this.material('ivory walls','#e4d9bb');
    this.jade=this.material('jade tiled roofs','#164e59');this.jade.backFaceCulling=false;
    this.gold=this.material('antique gold','#d4ac58');this.red=this.material('vermilion columns','#7e3433');this.wood=this.material('dark gates','#24393e');
    const rock=this.material('mountain cliff','#576573'),pine=this.material('pine needles','#28534c'),bark=this.material('pine trunks','#665447');
    // The walkable square sits at y=0; the mountain continues down into the clouds.
    const mountainStart=this.scene.meshes.length;
    this.mesh('CreateCylinder',{height:210,diameterTop:138,diameterBottom:170,tessellation:128},0,-106.5,3,rock);
    const summitMat=this.material('round summit stone','#7e9290');
    this.summitGround=this.mesh('CreateCylinder',{height:2,diameter:138,tessellation:128},0,-1,3,summitMat);
    this.summitGround.isPickable=true;this.summitGround.metadata={walkable:true};
    this.mesh('CreateTorus',{diameter:136.8,thickness:.45,tessellation:128},0,-1.45,3,this.stone);
    for(let i=0;i<32;i++){const a=i*Math.PI/16;this.mesh('CreateCylinder',{height:125+(i%3)*18,diameterTop:5,diameterBottom:17,tessellation:7},Math.cos(a)*65,-90,3+Math.sin(a)*65,rock);}
    const summit=new B.TransformNode('summit_x5',this.scene);summit.scaling.set(this.summitScale,1,this.summitScale);
    this.scene.meshes.slice(mountainStart).forEach(m=>m.parent=summit);
    // Continuous full-circle railing at the mountain edge, in world coordinates.
    for(const y of [.65,1.65])this.mesh('CreateTorus',{diameter:this.railingRadius*2,thickness:.28,tessellation:256},0,y,this.summitCenter.z,this.stone);
    this.mesh('CreateTorus',{diameter:this.railingRadius*2,thickness:.12,tessellation:256},0,1.85,this.summitCenter.z,this.gold);
    for(let i=0;i<192;i++){
      const a=i/192*Math.PI*2,x=Math.cos(a)*this.railingRadius,z=this.summitCenter.z+Math.sin(a)*this.railingRadius;
      const post=this.box(x,1,z,.75,2,.75,this.stone);post.rotation.y=-a;
      this.mesh('CreateSphere',{diameter:.9,segments:6},x,2.12,z,this.stone);
    }
    const plazaStart=this.scene.meshes.length;
    this.box(0,-1.6,3,114,3.2,114,this.stone);
    const paving=new B.DynamicTexture('marble paving',{width:512,height:512},this.scene,false),ctx=paving.getContext();
    ctx.fillStyle='#bec8c9';ctx.fillRect(0,0,512,512);ctx.strokeStyle='#95a6ad';ctx.lineWidth=3;
    for(let i=0;i<=512;i+=128){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}
    paving.update();paving.uScale=7*this.plazaScale;paving.vScale=7*this.plazaScale;const floor=this.material('square paving','#ffffff');floor.diffuseTexture=paving;
    this.ground=this.mesh('CreateGround',{width:110,height:110},0,.005,3,floor);
    this.ground.isPickable=true;this.ground.metadata={walkable:true};
    // Ceremonial avenue and inlaid cultivation circle.
    this.box(0,.02,1,11,.025,99,this.cream);
    for(const x of [-5.5,5.5])this.box(x,.045,1,.12,.03,99,this.gold);
    this.mesh('CreateCylinder',{height:.025,diameter:24,tessellation:64},0,.045,-12,this.jade);
    for(const diameter of [15,21,23])this.mesh('CreateTorus',{diameter,thickness:.1,tessellation:64},0,.08,-12,this.gold);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const mark=this.box(Math.sin(a)*8.9,.09,-12+Math.cos(a)*8.9,1.4,.04,.22,this.gold);mark.rotation.y=a;}
    const star=this.mesh('CreateCylinder',{height:.04,diameter:8,tessellation:4},0,.08,-12,this.gold);star.rotation.y=Math.PI/4;
    this.mesh('CreateCylinder',{height:.05,diameter:5.8,tessellation:4},0,.09,-12,this.jade);
    this.hall(0,47,1.45,3);this.hall(-41,18,.72,2);this.hall(41,18,.72,2);
    for(const x of [-44,44])this.hall(x,-30,.45,3);
    // Monumental entrance arch, behind the player's arrival point.
    for(const x of [-10,10]){this.box(x,5.5,-46,1.5,11,1.5,this.red);this.box(x,.5,-46,3,1,3,this.stone);this.obstacles.push({x,z:-46,w:3,d:3});}
    this.box(0,9,-46,23,1.4,2,this.red);this.roof(0,10,-46,28,7,3);
    const sign=new B.DynamicTexture('sect inscription',{width:1024,height:256},this.scene,false);
    sign.drawText('THIÊN VÂN TÔNG',null,165,'bold 84px serif','#f1d68a','#24393e',true);
    const signMat=this.material('inscription','#ffffff');signMat.diffuseTexture=sign;signMat.emissiveColor=new B.Color3(.22,.2,.12);
    const plaque=this.mesh('CreatePlane',{width:12,height:3},0,10.2,36.7,signMat);plaque.rotation.y=0;
    for(const x of [-15,15])for(const z of [-35,-16,4,25]){
      this.obstacles.push({x,z,w:1.8,d:1.8});
      this.box(x,.35,z,1.8,.7,1.8,this.stone);this.mesh('CreateCylinder',{height:3,diameter:.3,tessellation:8},x,2,z,this.gold);
      this.box(x,3.5,z,1.1,1.2,1.1,this.red);this.roof(x,4.15,z,1.8,1.8,.55);
      this.box(x,3.5,z-.56,.7,.8,.035,this.material(`lantern_${x}_${z}`,'#ffc778',.7));
    }
    for(const x of [-49,49])for(const z of [-8,37]){
      this.obstacles.push({x,z,w:4,d:4});
      this.box(x,.3,z,4,.6,4,this.stone);this.mesh('CreateCylinder',{height:7,diameter:.6,tessellation:6},x,3.7,z,bark);
      for(let i=0;i<3;i++)this.mesh('CreateCylinder',{height:3,diameterTop:0,diameterBottom:6-i,tessellation:7},x,5+i*1.6,z,pine);
    }
    const plaza=new B.TransformNode('plaza_x2',this.scene);plaza.scaling.set(this.plazaScale,1,this.plazaScale);
    this.scene.meshes.slice(plazaStart).forEach(m=>m.parent=plaza);
    this.obstacles.forEach(o=>{o.x*=this.plazaScale;o.z*=this.plazaScale;o.w*=this.plazaScale;o.d*=this.plazaScale;});
    this.createHorizon();
    let time=0;const cloudOrigins=this.clouds.map(c=>c.position.x);
    this.scene.onBeforeRenderObservable.add(()=>{time+=Math.min(this.scene.getEngine().getDeltaTime()/1000,.05);this.clouds.forEach((c,i)=>c.position.x=cloudOrigins[i]+Math.sin(time*.06+i)*3);});
  }
};
