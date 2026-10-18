(() => {
  "use strict";
  const B = window.BABYLON;
  const loading = document.getElementById("loadingScreen");
  const loaderText = document.getElementById("loaderText");
  if (!B) {
    document.body.innerHTML = `<div class="error-box">Không tải được Babylon.js CDN.\n\nHãy kiểm tra Internet rồi chạy lại RUN_GAME.bat.</div>`;
    return;
  }
  loaderText.textContent = `Babylon.js ${B.Engine.Version || "CDN"} · Đang tạo world...`;

  class InputManager {
    constructor() {
      this.keys = new Set(); this.joystick = new B.Vector2(0,0); this.onSkill=null; this.onToggleInventory=null;
      addEventListener("keydown", e => {
        if(e.target.closest?.('button,input,textarea,select'))return;
        this.keys.add(e.code);
        if (["Digit1","Digit2","Digit3","Digit4","Digit5"].includes(e.code)) this.onSkill?.(Number(e.code.slice(-1))-1);
        if (e.code === "Space") { e.preventDefault(); this.onSkill?.(0); }
        if (e.code === "KeyI") this.onToggleInventory?.();
      });
      addEventListener("keyup", e => this.keys.delete(e.code));
      addEventListener("blur",()=>{this.keys.clear();this.joystick.set(0,0)});
      this.setupJoystick();
    }
    getMoveVector(){
      let x=0,y=0;
      if(this.keys.has("KeyA")||this.keys.has("ArrowLeft"))x--;
      if(this.keys.has("KeyD")||this.keys.has("ArrowRight"))x++;
      if(this.keys.has("KeyW")||this.keys.has("ArrowUp"))y++;
      if(this.keys.has("KeyS")||this.keys.has("ArrowDown"))y--;
      if(Math.abs(this.joystick.x)>.05||Math.abs(this.joystick.y)>.05){x=this.joystick.x;y=this.joystick.y}
      const v=new B.Vector2(x,y); if(v.lengthSquared()>1)v.normalize(); return v;
    }
    setupJoystick(){
      const root=document.querySelector("#hudRoot"), stick=document.createElement("div"); stick.className="joystick"; stick.innerHTML='<div class="joystick-knob"></div>'; root.appendChild(stick);
      const knob=stick.firstElementChild; let active=null;
      const update=(x,y)=>{const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=x-cx,dy=y-cy,max=r.width*.32,len=Math.hypot(dx,dy),s=len>max?max/len:1,px=dx*s,py=dy*s;knob.style.transform=`translate(calc(-50% + ${px}px),calc(-50% + ${py}px))`;this.joystick.set(px/max,-py/max)};
      stick.addEventListener("pointerdown",e=>{active=e.pointerId;stick.setPointerCapture(active);update(e.clientX,e.clientY)}); stick.addEventListener("pointermove",e=>{if(active===e.pointerId)update(e.clientX,e.clientY)});
      const end=e=>{if(active!==e.pointerId)return;active=null;this.joystick.set(0,0);knob.style.transform="translate(-50%,-50%)"}; stick.addEventListener("pointerup",end);stick.addEventListener("pointercancel",end);
    }
  }

  // Player config, rig, visual, animations and controller are loaded from ./assets/player/* before game.js.
  if(!window.PlayerController) throw new Error("PlayerController chưa được tải. Kiểm tra ./assets/player và thứ tự script trong index.html");

  class ClickMovement {
    constructor(canvas,scene,player,world,entities,combat){
      this.player=player;
      this.marker=B.MeshBuilder.CreateTorus('move_destination',{diameter:1.5,thickness:.09,tessellation:32},scene);
      const mat=new B.StandardMaterial('destination_jade',scene);mat.emissiveColor=new B.Color3(.2,1,.8);mat.diffuseColor=new B.Color3(.08,.6,.4);
      this.marker.material=mat;this.marker.isPickable=false;this.marker.setEnabled(false);
      const pointers=new Map();let gestureBlocked=false;
      canvas.addEventListener('pointerdown',e=>{
        if(pointers.size)gestureBlocked=true;else gestureBlocked=false;
        pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,dragged:false,button:e.button});
      });
      canvas.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>7)p.dragged=true;});
      canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);gestureBlocked=true;});
      canvas.addEventListener('lostpointercapture',e=>pointers.delete(e.pointerId));
      canvas.addEventListener('pointerup',e=>{
        const p=pointers.get(e.pointerId);pointers.delete(e.pointerId);
        if(!p||p.button!==0||p.dragged||gestureBlocked||player.dead||Math.hypot(e.clientX-p.x,e.clientY-p.y)>7)return;
        const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
        // Only ground and living monsters participate; roof geometry cannot become a destination.
        const pick=scene.pick(x,y,m=>Boolean(m.metadata?.walkable)||Boolean(entities.byMesh(m)?.alive));
        if(!pick?.hit)return;
        const monster=entities.byMesh(pick.pickedMesh);
        if(monster){combat.setTarget(monster);player.path=[];return;}
        const path=world.findPath(player.position,pick.pickedPoint);
        if(!path.length)return;
        player.path=path;this.marker.position.copyFrom(path[path.length-1]);this.marker.position.y=.2;
        this.marker.setEnabled(true);
      });
      addEventListener('blur',()=>{pointers.clear();player.path=[];});
    }
    update(){this.marker.setEnabled(!this.player.dead&&this.player.path.length>0);}
  }

  // Enemy visuals/configs are loaded from ./enemies/* before game.js.
  if(!window.EnemyRegistry) throw new Error("EnemyRegistry chưa được tải. Kiểm tra thứ tự script trong index.html");

  // Monster & EnemyManager are loaded modularly from ./enemies/core/*
  if(!window.Monster || !window.EnemyManager) {
    throw new Error("Hệ thống Unified Enemy chưa được nạp đầy đủ. Kiểm tra thứ tự script trong index.html");
  }


  class Combat {
    constructor(player,entities){this.player=player;this.entities=entities;this.target=null;this.global=0;this.cds=[0,0,0,0,0];this.auto=false;this.onDamage=null;this.onSkillCast=null;this.skills=[{id:'kiem_khi',d:25,r:4.5,c:.6},{id:'phong_luan',d:42,r:6,c:2.5},{id:'loi_kich',d:65,r:14,c:3},{id:'lien_hoa',d:30,r:6,c:7},{id:'thien_thach',d:100,r:12,c:8}]}
    setTarget(m){if(m?.alive)this.target=m}
    update(dt){
      this.global=Math.max(0,this.global-dt);this.cds=this.cds.map(x=>Math.max(0,x-dt));if(this.target&&!this.target.alive)this.target=null;
      if(this.auto&&!this.player.dead&&this.global<=0){this.target=this.entities.nearest(this.player.position,14);for(const i of (this.player.hp<this.player.maxHp*.7?[3,4,1,2,0]:[4,1,2,0]))if(this.useSkill(i))break;}
    }
    useSkill(i){
      const s=this.skills[i],p=this.player;if(!s||p.dead||this.global>0||this.cds[i]>0)return false;
      if(!this.target?.alive||B.Vector3.Distance(p.position,this.target.mesh.position)>s.r)this.target=this.entities.nearest(p.position,s.r);
      if(!this.target&&i!==3)return false;
      const target=this.target||{mesh:{position:p.position}},origin=p.position.clone();
      if(p.playSkill)p.playSkill(i);else p.playAttack();this.onSkillCast?.({index:i,skillId:s.id,target,origin});this.global=.25;this.cds[i]=s.c;
      if(i===3)p.hp=Math.min(p.maxHp,p.hp+45);
      const center=i===4?target.mesh.position:p.position;
      const victims=[1,3,4].includes(i)?this.entities.monsters.filter(m=>m.alive&&B.Vector3.Distance(center,m.mesh.position)<(i===4?4.5:s.r)):this.target?[this.target]:[];
      for(const m of victims){const critical=Math.random()<.15,amount=m.damageBy(Math.round(s.d*(critical?1.7:1)));if(amount>0)this.onDamage?.({amount,world:m.mesh.position.add(new B.Vector3(0,1.1,0)),critical});}
      return true;
    }
  }

  class Inventory {
    constructor(){this.items=new Map();this.onChanged=null}
    add(item){const key=item.name;const old=this.items.get(key);if(old)old.quantity++;else this.items.set(key,{...item,quantity:1});this.onChanged?.()}
    list(){return [...this.items.values()]}
  }

  class Loot {
    constructor(scene,inventory,player){this.scene=scene;this.inventory=inventory;this.player=player;this.drops=[]}
    spawn(pos,level){if(Math.random()<.28){this.player.gold+=2+Math.floor(Math.random()*(4+level));return}const roll=Math.random(),rarity=roll>.9?"Rare":roll>.55?"Uncommon":"Common",names=rarity==="Rare"?["Azure Rune","Ancient Ring"]:rarity==="Uncommon"?["Wolf Fang","Iron Charm"]:["Hide Scrap","Stone Shard"],name=names[Math.floor(Math.random()*names.length)];const mesh=B.MeshBuilder.CreateBox(`loot_${performance.now()}`,{size:.42},this.scene);mesh.position=pos.add(new B.Vector3(0,.35,0));const mat=new B.StandardMaterial(`lootMat_${performance.now()}`,this.scene);mat.emissiveColor=rarity==="Rare"?new B.Color3(.2,.5,1):rarity==="Uncommon"?new B.Color3(.2,.85,.25):new B.Color3(.75,.75,.75);mat.freeze();mesh.material=mat;mesh.doNotSyncBoundingInfo=true;this.drops.push({mesh,name,rarity,life:30})}
    update(dt){for(let i=this.drops.length-1;i>=0;i--){const d=this.drops[i];d.life-=dt;d.mesh.rotation.y+=dt*2;if(B.Vector3.Distance(d.mesh.position,this.player.position)<1.7){this.inventory.add({name:d.name,rarity:d.rarity});d.mesh.dispose();this.drops.splice(i,1)}else if(d.life<=0){d.mesh.dispose();this.drops.splice(i,1)}}}
  }

  // Vfx & World are handled by window.ForestVfx & window.ForestWorld


  class Hud {
    constructor(player,entities,combat,inventory,scene,camera){
      this.player=player;this.entities=entities;this.combat=combat;this.inventory=inventory;this.scene=scene;this.camera=camera;this.labels=new Map();
      this.canvasRect={left:0,top:0,width:window.innerWidth,height:window.innerHeight};
      this.identityMatrix=B.Matrix.Identity();this.tmpPos=new B.Vector3();this.tmpProj=new B.Vector3();
      this.lastHp=-1;this.lastGold=-1;this.lastFpsTimer=0;this.lastTargetId=null;this.lastTargetHp=-1;this.lastDotX=-1;this.lastDotZ=-1;
      const root=document.createElement("div");root.className="hud";root.innerHTML=`<div class="panel top-left"><div class="name">Adventurer</div><div class="bar"><div class="bar-fill player-fill"></div></div><div class="target-panel"><div class="name target-name">Target</div><div class="bar"><div class="bar-fill target-fill"></div></div></div><div class="meta-row"><span>Gold: <b class="gold">0</b></span><span class="fps">0 FPS</span></div><div class="hint">WASD: di chuyển · kéo chuột: camera · wheel: zoom · click quái: target · 1–5/Space: skill · I: túi đồ</div></div><div class="minimap"><div class="map-dot"></div></div><div class="skillbar"></div><button class="inventory-button">Bag [I]</button><div class="panel inventory-panel"><div class="inventory-title"><span>Inventory</span><span>Auto pickup</span></div><div class="inventory-list"></div></div><div class="floating-layer"></div><div class="cdn-badge">CDN + Python prototype</div>`;document.querySelector("#hudRoot").appendChild(root);this.root=root;this.playerFill=root.querySelector(".player-fill");this.targetPanel=root.querySelector(".target-panel");this.targetName=root.querySelector(".target-name");this.targetFill=root.querySelector(".target-fill");this.gold=root.querySelector(".gold");this.fps=root.querySelector(".fps");this.dot=root.querySelector(".map-dot");this.invPanel=root.querySelector(".inventory-panel");this.invList=root.querySelector(".inventory-list");this.skillEls=[];
      root.querySelector(".inventory-button").addEventListener("pointerdown",()=>this.toggleInventory());const sb=root.querySelector(".skillbar");
      const names=['Kiếm khí','Phong luân','Lôi kích','Liên hoa','Thiên thạch'];
      const paths=['M9 29L29 9M22 8L32 6L30 16M7 24L16 33M8 32L4 36','M7 25C-1 8 24 0 31 11C39 27 16 37 9 26C4 16 23 8 27 17C32 26 16 30 15 22','M23 3L9 23H19L15 37L32 16H22Z','M20 34C2 29 1 15 6 12C13 13 18 22 20 34ZM20 34C38 29 39 15 34 12C27 13 22 22 20 34ZM20 32C9 21 15 10 20 4C25 10 31 21 20 32Z','M30 4L18 18M36 11L25 22M24 3L13 15M22 26A9 9 0 1 1 4 26A9 9 0 1 1 22 26'];
      paths.forEach((path,i)=>{const e=document.createElement('button');e.className=`skill skill-${i}`;e.title=`${names[i]} [${i+1}]`;e.setAttribute('aria-label',names[i]);e.innerHTML=`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${path}"/></svg><small>${i+1}</small><i></i>`;e.addEventListener('pointerdown',()=>combat.useSkill(i));sb.appendChild(e);this.skillEls.push(e);});
      const fl=root.querySelector(".floating-layer");for(const m of entities.monsters){const e=document.createElement("div");e.className="world-label";e.innerHTML=`<span>Lv.${m.level} ${m.name}</span><div class="world-hp"><i></i></div>`;fl.appendChild(e);this.labels.set(m.id,e)}inventory.onChanged=()=>this.renderInventory();this.renderInventory();
      this.updateRect();
    }
    updateRect(){
      const canvas=this.scene.getEngine().getRenderingCanvas();
      if(canvas){const r=canvas.getBoundingClientRect();this.canvasRect={left:r.left,top:r.top,width:r.width,height:r.height};}
    }
    toggleInventory(){this.invPanel.classList.toggle("visible")}
    setupAutoAttack(){
      const button=document.createElement('button');button.type='button';button.className='camera-lock-button auto-attack-button';
      const refresh=()=>{button.innerHTML=`<span class="atlas-icon icon-auto" aria-hidden="true"></span><span class="control-label">Auto: ${this.combat.auto?'BẬT':'TẮT'}</span>`;button.setAttribute('aria-label',this.combat.auto?'Tắt tự động đánh':'Bật tự động đánh');button.setAttribute('aria-pressed',String(this.combat.auto));button.title='Tự chọn quái trong tầm và dùng skill khi hồi chiêu xong';};
      button.addEventListener('click',e=>{e.stopPropagation();this.combat.auto=!this.combat.auto;refresh();});this.root.appendChild(button);refresh();
    }
    setupCameraLock(canvas){
      const button=document.createElement('button');button.type='button';button.className='camera-lock-button';
      this.root.appendChild(button);let locked=false;
      const clearInertia=()=>{for(const key of ['inertialAlphaOffset','inertialBetaOffset','inertialRadiusOffset','inertialPanningX','inertialPanningY'])this.camera[key]=0;};
      const refresh=()=>{
        button.innerHTML=`<span class="atlas-icon icon-lock" aria-hidden="true"></span><span class="control-label">${locked?'Mở khóa':'Khóa góc'}</span>`;
        button.setAttribute('aria-label',locked?'Mở khóa camera':'Khóa camera');
        button.setAttribute('aria-pressed',String(locked));
        button.title=locked?'Camera đã khóa góc và zoom, vẫn theo nhân vật. Bấm để mở.':'Bấm để giữ góc nhìn và mức zoom hiện tại.';
      };
      button.addEventListener('pointerdown',e=>e.stopPropagation());
      button.addEventListener('click',e=>{
        e.stopPropagation();locked=!locked;
        if(locked)this.camera.detachControl();else this.camera.attachControl(canvas,true);
        clearInertia();refresh();
      });
      refresh();
    }
    project(w){
      const r=this.canvasRect,vp=this.camera.viewport;
      const p=B.Vector3.Project(w,this.identityMatrix,this.scene.getTransformMatrix(),vp.toGlobal(r.width,r.height));
      p.x+=r.left;p.y+=r.top;return p;
    }
    damage(amount,world,critical){const e=document.createElement("div");e.className=critical?"damage-number critical":"damage-number";e.textContent=critical?`${amount}!`:`${amount}`;const p=this.project(world);e.style.transform=`translate(${p.x}px,${p.y}px)`;this.root.querySelector(".floating-layer").appendChild(e);setTimeout(()=>e.remove(),850)}
    renderInventory(){const a=this.inventory.list();this.invList.innerHTML=a.length?a.map(i=>`<div class="inventory-row ${i.rarity.toLowerCase()}"><span>${i.name}</span><b>x${i.quantity}</b></div>`).join(""):'<div class="inventory-empty">Đánh quái và đi qua vật phẩm để nhặt.</div>'}
    update(){
      if(this.player.hp!==this.lastHp){this.lastHp=this.player.hp;this.playerFill.style.width=`${this.player.hp/this.player.maxHp*100}%`;}
      if(this.player.gold!==this.lastGold){this.lastGold=this.player.gold;this.gold.textContent=this.player.gold;}
      const now=performance.now();
      if(now-this.lastFpsTimer>300){this.lastFpsTimer=now;this.fps.textContent=`${Math.round(this.scene.getEngine().getFps())} FPS`;}
      const t=this.combat.target;
      if(t?.alive){
        if(this.lastTargetId!==t.id||this.lastTargetHp!==t.hp){
          this.lastTargetId=t.id;this.lastTargetHp=t.hp;
          this.targetPanel.classList.add("visible");
          this.targetName.textContent=`Lv.${t.level} ${t.name} · ${Math.ceil(t.hp)}/${t.maxHp}`;
          this.targetFill.style.width=`${t.hp/t.maxHp*100}%`;
        }
      }else if(this.lastTargetId!==null){this.lastTargetId=null;this.targetPanel.classList.remove("visible");}
      for(let i=0;i<this.skillEls.length;i++){
        const cd=this.combat.cds[i],e=this.skillEls[i];
        e.classList.toggle("cooldown",cd>0);
        const text=cd>0?cd.toFixed(1):"";
        const icon=e.querySelector("i");if(icon&&icon.textContent!==text)icon.textContent=text;
      }
      const px=this.player.position.x,pz=this.player.position.z;
      for(const m of this.entities.monsters){
        const l=this.labels.get(m.id);if(!m.alive){l.style.display="none";continue;}
        const dx=m.mesh.position.x-px,dz=m.mesh.position.z-pz;
        if(dx*dx+dz*dz>1400){l.style.display="none";continue;}
        this.tmpPos.set(m.mesh.position.x,m.mesh.position.y+2.1,m.mesh.position.z);
        const p=this.project(this.tmpPos);
        const visible=p.z>0&&p.z<1;
        l.style.display=visible?"block":"none";
        if(visible){
          l.style.transform=`translate(${p.x}px,${p.y}px)`;
          l.querySelector(".world-hp i").style.width=`${m.hp/m.maxHp*100}%`;
          l.classList.toggle("targeted",this.combat.target?.id===m.id);
        }
      }
    }
  }

  async function boot(){
    const canvas=document.getElementById("gameCanvas"),engine=new B.Engine(canvas,true,{stencil:false,preserveDrawingBuffer:false,powerPreference:"high-performance",audioEngine:false});
    let lowPerfMode=false;
    const resizeRenderer=()=>{
      const baseDpr=Math.min(1.5,Math.max(1,window.devicePixelRatio||1));
      const renderDpr=lowPerfMode?1.0:baseDpr;
      engine.setHardwareScalingLevel(1/renderDpr);
      engine.resize();
      if(window._gameHud)window._gameHud.updateRect();
    };
    resizeRenderer();
    const scene=new B.Scene(engine);
    scene.clearColor=new B.Color4(.78,.89,.91,1);scene.fogMode=B.Scene.FOGMODE_LINEAR;scene.fogStart=80;scene.fogEnd=205;scene.fogColor=new B.Color3(.82,.89,.82);
    scene.skipPointerMovePicking=true;scene.constantlyUpdateMeshUnderPointer=false;scene.autoClear=false;scene.autoClearDepthAndStencil=true;
    const light=new B.HemisphericLight("sky ambient",new B.Vector3(0,1,0),scene);light.intensity=.85;light.diffuse=new B.Color3(.9,.95,1);light.groundColor=new B.Color3(.32,.46,.22);
    const world=new window.ForestWorld(scene);await world.create();
    const player=new window.PlayerController(scene);await player.create(new B.Vector3(0,0,0));player.invulnerable=window.PlayerConfig?.stats?.spawnInvulnerability??6;window.player=player;window.PlayerRuntime={player,equip:(slot,id)=>player.equip(slot,id),unequip:slot=>player.unequip(slot),applyLoadout:loadout=>player.applyLoadout(loadout),reset:()=>player.resetEquipment(),getEquipment:()=>player.getEquipment(),list:slot=>player.listEquipment(slot),getSocket:name=>player.getSocket(name),getMeasurements:()=>window.PlayerConfig?.anthropometry||null};
    const camera=new B.ArcRotateCamera("camera",-Math.PI/2,1.32,22,player.position.clone(),scene);
    camera.lowerRadiusLimit=9;camera.upperRadiusLimit=48;camera.lowerBetaLimit=.55;camera.upperBetaLimit=1.45;camera.maxZ=320;camera.wheelPrecision=30;camera.panningSensibility=0;camera.angularSensibilityX=4200;camera.angularSensibilityY=4200;camera.attachControl(canvas,true);
    const entities=new window.EnemyManager(scene,world);entities.spawn(16);
    const input=new InputManager(),combat=new Combat(player,entities),inventory=new Inventory(),loot=new Loot(scene,inventory,player),vfx=new window.ForestVfx(scene),hud=new Hud(player,entities,combat,inventory,scene,camera);
    window._gameHud=hud;
    input.onSkill=i=>combat.useSkill(i);input.onToggleInventory=()=>hud.toggleInventory();
    combat.onSkillCast=e=>vfx.skill(e.origin,e.target,e.skillId??e.index);combat.onDamage=e=>{vfx.hit(e.world);hud.damage(e.amount,e.world,e.critical)};
    entities.monsters.forEach(m=>m.onDeath=d=>loot.spawn(d.mesh.position,d.level));
    hud.root.querySelector('.cdn-badge').textContent='HẮC LÂM · RỪNG HOANG VÔ TẬN';
    hud.setupCameraLock(canvas);
    hud.setupAutoAttack();
    window.setupMobileHud(hud);
    hud.root.querySelector('.hint').textContent='Click/chạm nền: di chuyển · WASD: di chuyển · kéo: camera · cuộn: zoom · click quái: chọn · 1–5/Space: skill · I: túi đồ';
    const clickMovement=new ClickMovement(canvas,scene,player,world,entities,combat);
    scene.blockMaterialDirtyMechanism=true;
    const tmpCameraLead=new B.Vector3(0,0,0);
    const tmpDesiredCameraTarget=new B.Vector3(0,0,0);
    scene.onBeforeRenderObservable.add(()=>{
      const dt=Math.min(engine.getDeltaTime()/1000,.05);
      player.update(dt,input.getMoveVector(),camera,world);
      world.updateStreaming(player.position);
      clickMovement.update();
      // Velocity-aware camera target with preallocated vectors to eliminate GC spikes
      if(player.motor?.currentVelocity){
        tmpCameraLead.copyFrom(player.motor.currentVelocity).scaleInPlace(0.14);
      }else{
        tmpCameraLead.set(0,0,0);
      }
      tmpDesiredCameraTarget.copyFrom(player.position).addInPlace(tmpCameraLead);
      tmpDesiredCameraTarget.y+=window.PlayerConfig?.visual?.cameraTargetHeight??1.30;
      const cameraFollowAlpha=1-Math.exp(-9*dt);
      B.Vector3.LerpToRef(camera.target,tmpDesiredCameraTarget,cameraFollowAlpha,camera.target);
      entities.update(dt,player,(d, src)=>player.takeDamage(d, src));
      combat.update(dt);loot.update(dt);vfx.update(dt);hud.update();
      const b=world.bounds;
      const nx=Math.max(4,Math.min(96,4+(player.position.x-b.minX)/(b.maxX-b.minX)*92)),nz=Math.max(4,Math.min(96,96-(player.position.z-b.minZ)/(b.maxZ-b.minZ)*92));
      if(Math.abs(nx-hud.lastDotX)>0.2||Math.abs(nz-hud.lastDotZ)>0.2){hud.lastDotX=nx;hud.lastDotZ=nz;hud.dot.style.left=`${nx}%`;hud.dot.style.top=`${nz}%`;}
    });
    engine.runRenderLoop(()=>scene.render());
    addEventListener("resize",resizeRenderer);
    window.visualViewport?.addEventListener("resize",resizeRenderer);
    loading.style.opacity="0";setTimeout(()=>loading.remove(),350);
  }
  boot().catch(err=>{console.error(err);document.body.innerHTML=`<div class="error-box">Game không khởi động được.\n\n${String(err?.stack||err)}\n\nHãy mở DevTools (F12) để xem chi tiết.</div>`});
})();
