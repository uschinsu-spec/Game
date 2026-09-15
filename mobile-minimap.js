(()=>{
'use strict';
const canvas=document.getElementById('miniMapCanvas'),rt=window.GameRuntime;if(!canvas||!rt?.scene||!rt?.player)return;
const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
const scene=rt.scene,player=rt.player,RANGE=82,TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function posOf(x){try{return x?.getAbsolutePosition?.()||x?.absolutePosition||x?.position||null}catch(_){return null}}
function yaw(){const r=player.rotationQuaternion;if(r){const q=r.toEulerAngles();return q.y||0}return player.rotation?.y||0}
function isEnemy(n){const s=(n?.name||'').toLowerCase();return !n?.isDisposed?.()&&(n?.metadata?.isEnemy===true||s.includes('monster')||s.includes('enemy')||s.includes('boss'))}
function isOther(n){if(n===player||n?.parent===player)return false;const s=(n?.name||'').toLowerCase();return !n?.isDisposed?.()&&(n?.metadata?.isRemotePlayer===true||n?.metadata?.playerId||s.includes('remoteplayer')||s.includes('otherplayer'))}
function dot(x,y,r,c,glow=0){ctx.save();if(glow){ctx.shadowColor=c;ctx.shadowBlur=glow}ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=c;ctx.fill();ctx.strokeStyle='#071018';ctx.lineWidth=1.5;ctx.stroke();ctx.restore()}
function draw(){
 const w=canvas.width,h=canvas.height,cx=w/2,cy=h/2,rad=Math.min(cx,cy)-4,p=posOf(player);if(!p)return;
 ctx.clearRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.arc(cx,cy,rad,0,TAU);ctx.clip();
 const g=ctx.createRadialGradient(cx,cy,4,cx,cy,rad);g.addColorStop(0,'#638b65');g.addColorStop(.58,'#416c57');g.addColorStop(1,'#173b3e');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='rgba(219,246,220,.16)';ctx.lineWidth=2;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(0,cy+i*23);ctx.quadraticCurveTo(cx,cy+i*17+Math.sin(i)*8,w,cy+i*23);ctx.stroke()}
 ctx.strokeStyle='rgba(255,255,255,.11)';ctx.lineWidth=1;[rad*.33,rad*.66].forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke()});
 const a=-yaw(),ca=Math.cos(a),sa=Math.sin(a),seen=new Set();
 const plot=(n,c,size)=>{if(!n||seen.has(n.uniqueId))return;seen.add(n.uniqueId);const q=posOf(n);if(!q)return;let dx=q.x-p.x,dz=q.z-p.z;const rx=dx*ca-dz*sa,rz=dx*sa+dz*ca;const dist=Math.hypot(rx,rz);if(dist<.1)return;const edge=dist>RANGE,scale=(edge?RANGE:dist)/RANGE*rad*.87,x=cx+(rx/dist)*scale,y=cy+(rz/dist)*scale;if(edge){ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(rz,rx)+Math.PI/2);ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(-4,3);ctx.lineTo(4,3);ctx.closePath();ctx.fillStyle=c;ctx.fill();ctx.restore()}else dot(x,y,size,c,7)};
 for(const n of scene.transformNodes||[])if(isEnemy(n))plot(n,'#ff3b3b',5.3);
 for(const n of scene.meshes||[])if(!n.parent&&isEnemy(n))plot(n,'#ff3b3b',5.3);
 for(const n of scene.transformNodes||[])if(isOther(n))plot(n,'#ffd63d',5);
 for(const n of scene.meshes||[])if(!n.parent&&isOther(n))plot(n,'#ffd63d',5);
 ctx.restore();
 ctx.save();ctx.translate(cx,cy);ctx.shadowColor='#50eaff';ctx.shadowBlur=9;ctx.fillStyle='#54e8ff';ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(6,7);ctx.lineTo(0,4);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
 ctx.strokeStyle='rgba(255,229,154,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,rad,0,TAU);ctx.stroke();
}
let last=0;scene.onBeforeRenderObservable.add(()=>{const n=performance.now();if(n-last<80)return;last=n;draw()});
window.GameMiniMap={redraw:draw,range:RANGE};
})();