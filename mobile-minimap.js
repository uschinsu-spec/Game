(()=>{
  'use strict';
  const canvas=document.getElementById('miniMapCanvas');
  const rt=window.GameRuntime;
  if(!canvas||!rt?.scene||!rt?.player)return;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return;
  const scene=rt.scene,player=rt.player;
  const RANGE=72;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function posOf(x){try{return x?.getAbsolutePosition?.()||x?.absolutePosition||x?.position||null}catch(_){return null}}
  function isEnemy(node){const n=(node?.name||'').toLowerCase();return !node?.isDisposed?.()&&(n.includes('monster')||n.includes('enemy')||n.includes('boss'))}
  function isOtherPlayer(node){if(node===player||node?.parent===player)return false;const n=(node?.name||'').toLowerCase();return !node?.isDisposed?.()&&(node?.metadata?.isRemotePlayer===true||node?.metadata?.playerId||n.includes('remoteplayer')||n.includes('otherplayer'))}
  function dot(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.65)';ctx.lineWidth=1.5;ctx.stroke()}
  function draw(){
    const w=canvas.width,h=canvas.height,cx=w/2,cy=h/2,p=posOf(player);if(!p)return;
    ctx.clearRect(0,0,w,h);
    const g=ctx.createRadialGradient(cx,cy,5,cx,cy,w*.52);g.addColorStop(0,'#527b5b');g.addColorStop(1,'#183b3c');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;for(let r=30;r<90;r+=30){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()}
    const plot=(node,color,size)=>{const q=posOf(node);if(!q)return;const dx=q.x-p.x,dz=q.z-p.z;if(dx*dx+dz*dz>RANGE*RANGE)return;const x=clamp(cx+dx/RANGE*cx*0.88,8,w-8),y=clamp(cy+dz/RANGE*cy*0.88,8,h-8);dot(x,y,size,color)};
    const roots=scene.transformNodes||[];const meshes=scene.meshes||[];
    for(const n of roots)if(isEnemy(n))plot(n,'#ff4141',5.2);
    for(const n of meshes)if(!n.parent&&isEnemy(n))plot(n,'#ff4141',5.2);
    for(const n of roots)if(isOtherPlayer(n))plot(n,'#ffd84a',5);
    for(const n of meshes)if(!n.parent&&isOtherPlayer(n))plot(n,'#ffd84a',5);
    dot(cx,cy,6,'#55eaff');
    ctx.beginPath();ctx.moveTo(cx,cy-11);ctx.lineTo(cx-4,cy-4);ctx.lineTo(cx+4,cy-4);ctx.closePath();ctx.fillStyle='#ffffff';ctx.fill();
  }
  let last=0;scene.onBeforeRenderObservable.add(()=>{const now=performance.now();if(now-last<100)return;last=now;draw()});
  window.GameMiniMap={redraw:draw,range:RANGE};
})();