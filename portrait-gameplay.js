// Portrait one-hand gameplay layer: 360 joystick steering, auto-target, soft-lock combat,
// compact utility menu, portrait camera composition and lightweight skill effects.
(() => {
  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const normAngle=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a};
  const lerpAngle=(a,b,t)=>a+normAngle(b-a)*clamp(t,0,1);

  document.documentElement.classList.add('portrait-game');

  const targetPanel=document.getElementById('targetPanel');
  const targetName=document.getElementById('targetName');
  const targetHp=document.getElementById('targetHp');
  const utilityTray=document.getElementById('utilityTray');
  const menuToggle=document.getElementById('menuToggle');
  if(menuToggle&&utilityTray) menuToggle.addEventListener('click',()=>utilityTray.classList.toggle('open'));

  // Replace the old tank-like joystick with a portrait-friendly 360 degree control.
  // The movement direction is measured against the camera/player heading at touch start,
  // so holding a diagonal does not make the character spiral while the camera follows.
  let activeTouch=null, rawX=0, rawY=0, magnitude=0, baseYaw=player.rotation.y;
  const readStick=(t)=>{
    const r=joystick.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const max=r.width*.34;
    const dx=t.clientX-cx,dy=t.clientY-cy;
    const len=Math.hypot(dx,dy)||1;
    const k=Math.min(1,max/len);
    rawX=dx/max*k;rawY=dy/max*k;magnitude=Math.min(1,Math.hypot(rawX,rawY));
    stick.style.transform=`translate(${rawX*max}px,${rawY*max}px)`;
  };
  const findTouch=e=>[...e.changedTouches].find(t=>t.identifier===activeTouch)||e.changedTouches[0];
  joystick.addEventListener('touchstart',e=>{
    if(e.touches.length!==1)return;
    e.preventDefault();e.stopImmediatePropagation();
    activeTouch=e.changedTouches[0].identifier;baseYaw=player.rotation.y;readStick(e.changedTouches[0]);
  },{passive:false,capture:true});
  joystick.addEventListener('touchmove',e=>{
    if(activeTouch===null)return;
    e.preventDefault();e.stopImmediatePropagation();const t=findTouch(e);if(t)readStick(t);
  },{passive:false,capture:true});
  const endStick=e=>{
    if(activeTouch===null)return;e.preventDefault();e.stopImmediatePropagation();
    if([...e.changedTouches].some(t=>t.identifier===activeTouch)){activeTouch=null;rawX=rawY=magnitude=0;joy.x=joy.y=0;stick.style.transform=''}
  };
  joystick.addEventListener('touchend',endStick,{passive:false,capture:true});
  joystick.addEventListener('touchcancel',endStick,{passive:false,capture:true});

  const enemies=()=>scene.meshes.filter(m=>m.name==='Demon'&&m.isEnabled()&&m.metadata?.alive!==false);
  scene.meshes.filter(m=>m.name==='Demon').forEach((m,i)=>{m.metadata={...(m.metadata||{}),alive:true,hp:100,maxHp:100,id:i};});
  let currentTarget=null,lastTargetScan=0;

  function facingVector(){return new BABYLON.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));}
  function pickTarget(){
    const now=performance.now();if(now-lastTargetScan<120&&currentTarget?.isEnabled())return currentTarget;lastTargetScan=now;
    const f=facingVector();let best=null,bestScore=1e9;
    for(const e of enemies()){
      const d=e.position.subtract(player.position);d.y=0;const dist=d.length();if(dist>22||dist<.01)continue;d.normalize();
      const front=1-BABYLON.Vector3.Dot(f,d);const score=dist+front*7;
      if(score<bestScore){bestScore=score;best=e;}
    }
    currentTarget=best;updateTargetUI();return best;
  }
  function updateTargetUI(){
    if(!targetPanel)return;
    if(!currentTarget||!currentTarget.isEnabled()||currentTarget.metadata?.alive===false){targetPanel.classList.remove('show');return;}
    targetPanel.classList.add('show');targetName.textContent='Ma Linh';
    const hp=currentTarget.metadata?.hp??100,max=currentTarget.metadata?.maxHp??100;
    targetHp.style.width=`${clamp(hp/max*100,0,100)}%`;
  }
  function faceTarget(t,snap=.8){if(!t)return;const d=t.position.subtract(player.position);d.y=0;if(d.lengthSquared()<.001)return;const yaw=Math.atan2(d.x,d.z);player.rotation.y=lerpAngle(player.rotation.y,yaw,snap);}
  function hitTarget(t,damage){
    if(!t||!t.isEnabled())return;t.metadata=t.metadata||{};t.metadata.hp=(t.metadata.hp??100)-damage;
    const old=t.scaling.clone();t.scaling.scaleInPlace(1.16);setTimeout(()=>{if(t&&!t.isDisposed())t.scaling.copyFrom(old)},90);
    if(t.metadata.hp<=0){t.metadata.alive=false;t.setEnabled(false);if(currentTarget===t)currentTarget=null;setTimeout(()=>{if(t&&!t.isDisposed()){t.metadata.hp=t.metadata.maxHp||100;t.metadata.alive=true;t.setEnabled(true)}},7000);}
    updateTargetUI();
  }
  function nearestTargets(radius){return enemies().filter(e=>BABYLON.Vector3.DistanceSquared(e.position,player.position)<=radius*radius);}
  function flashRing(radius,duration=280){
    const ring=BABYLON.MeshBuilder.CreateTorus('SkillFx',{diameter:radius*2,thickness:.08,tessellation:28},scene);ring.position=player.position.add(new BABYLON.Vector3(0,.08,0));ring.rotation.x=Math.PI/2;ring.material=bladeMat;ring.material.alpha=.75;
    const born=performance.now();const obs=scene.onBeforeRenderObservable.add(()=>{const p=clamp((performance.now()-born)/duration,0,1);ring.scaling.setAll(.65+p*.55);ring.visibility=1-p;if(p>=1){scene.onBeforeRenderObservable.remove(obs);ring.dispose();}});
  }

  const attackBtn=document.getElementById('attack');
  attackBtn?.addEventListener('click',()=>{const t=pickTarget();if(t){faceTarget(t,1);hitTarget(t,22)}else flashRing(1.2,180)});
  document.querySelectorAll('[data-skill]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=Number(btn.dataset.skill||1),t=pickTarget();
    if(id===1){if(t){faceTarget(t,1);hitTarget(t,38)}flashRing(2.1);}
    else if(id===2){flashRing(3.5,360);nearestTargets(3.8).forEach(e=>hitTarget(e,28));}
    else {flashRing(5,420);nearestTargets(5.2).forEach(e=>hitTarget(e,24));if(t)faceTarget(t,.75);}
  }));

  // Portrait gameplay observer. Existing game movement is reused as forward motion,
  // while this layer continuously turns the character toward the 360-degree stick direction.
  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.min(.033,engine.getDeltaTime()/1000);
    if(activeTouch!==null&&magnitude>.05){
      const forward=new BABYLON.Vector3(Math.sin(baseYaw),0,Math.cos(baseYaw));
      const right=new BABYLON.Vector3(Math.cos(baseYaw),0,-Math.sin(baseYaw));
      const desired=forward.scale(-rawY).add(right.scale(rawX));
      if(desired.lengthSquared()>.001){desired.normalize();const desiredYaw=Math.atan2(desired.x,desired.z);player.rotation.y=lerpAngle(player.rotation.y,desiredYaw,dt*12);}
      joy.x=0;joy.y=-magnitude;window.portraitMoveAmount=magnitude;
    }else{joy.x=0;joy.y=0;window.portraitMoveAmount=0;}

    // Camera remains behind the character and frames the avatar in the lower third of portrait screens.
    const f=facingVector();camera.alpha=-player.rotation.y-Math.PI/2;camera.beta=1.02;camera.radius=cameraRadius;
    const portraitLook=window.innerHeight>window.innerWidth?8.2:6.4;
    const targetHeight=mounted?2.35:1.6;
    camera.target.copyFrom(player.position.add(f.scale(portraitLook)).add(new BABYLON.Vector3(0,targetHeight,0)));

    const t=pickTarget();if(t&&BABYLON.Vector3.DistanceSquared(t.position,player.position)>24*24)currentTarget=null;updateTargetUI();
  });
})();
