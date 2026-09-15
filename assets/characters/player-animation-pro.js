// Player Animation Pro V6 - reliable authored full-body state machine
(()=>{
 const scene=window.GameRuntime?.scene,player=window.GameRuntime?.player;if(!scene||!player)return;
 window.__PLAYER_ANIMATION_PRO_V6__=true;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));let px=player.position.x,pz=player.position.z,speedSmooth=0,state='',locked='',lockUntil=0,attackPrev=false;
 const now=()=>performance.now()/1000;
 const ctl=()=>window.PlayerAnimationController;
 function trigger(name,fallback=.55){const c=ctl();if(!c?.clips?.[name])return false;const d=clamp(c.duration?.(name)||fallback,.18,1.5);locked=name;lockUntil=now()+d*.92;c.play(name,1,true);state=name;return true}
 window.triggerPlayerAttackAnimation=()=>trigger('attack',.62);
 window.triggerPlayerHitAnimation=()=>trigger('hit',.45);
 window.addEventListener('player-model-ready',()=>{state='';ctl()?.play('idle',1,true)});
 scene.onBeforeRenderObservable.add(()=>{
  const dt=clamp(scene.getEngine().getDeltaTime()/1000,.001,.05),dx=player.position.x-px,dz=player.position.z-pz;px=player.position.x;pz=player.position.z;const raw=Math.hypot(dx,dz)/dt;speedSmooth+=(raw-speedSmooth)*(1-Math.exp(-14*dt));
  const attacking=(typeof attackT!=='undefined'&&attackT>0);if(attacking&&!attackPrev)trigger('attack',.62);attackPrev=attacking;
  if(!window.PLAYER_MODEL_READY||!ctl())return;
  if(locked&&now()<lockUntil){window.PLAYER_ANIMATION_DEBUG={state:locked,speed:speedSmooth,locked:true};return}locked='';
  const moving=!!window.isPlayerMoving||speedSmooth>.2;let next='idle';if(moving){if(speedSmooth>4.4&&ctl().clips.run)next='run';else if(ctl().clips.walk)next='walk';else if(ctl().clips.run)next='run'}
  const ratio=next==='run'?clamp(speedSmooth/8.8,.8,1.3):next==='walk'?clamp(speedSmooth/4,.75,1.25):1;
  if(next!==state){ctl().play(next,ratio,true);state=next}else if(ctl().current)ctl().current.speedRatio=ratio;
  window.PLAYER_ANIMATION_STATE=next;window.PLAYER_MOTION_STATE=moving?'moving':next;window.PLAYER_ANIMATION_DEBUG={state:next,speed:speedSmooth,locked:false,mapped:Object.fromEntries(Object.entries(ctl().clips).map(([k,g])=>[k,g?.name||null]))};
 });
 console.info('[PlayerAnimationPro V6] full-body authored state machine active');
})();