(()=>{'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function css(){
  if(document.getElementById('mapV2Style'))return;
  const s=document.createElement('style');
  s.id='mapV2Style';
  s.textContent=`
#mapV2Overlay{position:fixed;inset:0;z-index:5000;background:rgba(4,12,18,.86);backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;padding:max(10px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));user-select:none;-webkit-user-select:none}
#mapV2Overlay.show{display:flex}
#mapV2Panel{width:min(980px,100%);height:min(760px,100%);display:flex;flex-direction:column;background:linear-gradient(180deg,#0f2430,#081620);border:2px solid #dfc27e;border-radius:20px;overflow:hidden;box-shadow:0 24px 70px #000c,inset 0 0 40px rgba(223,194,126,.08)}
#mapV2Head{display:flex;align-items:center;gap:10px;padding:12px 16px;background:linear-gradient(90deg,#163748,#0d2533);border-bottom:1px solid rgba(223,194,126,.3);color:#ffeab3}
#mapV2Head .brand{flex:1;display:flex;align-items:center;gap:8px}
#mapV2Head .brand b{font-size:1.15rem;letter-spacing:1px;text-shadow:0 2px 6px #000}
#mapV2Head .brand span{font-size:.75rem;padding:2px 8px;border-radius:99px;background:#dfc27e22;color:#dfc27e;border:1px solid #dfc27e55}
#mapV2Head button,#mapV2Tools button{min-height:40px;border:1px solid #dfc27e66;border-radius:10px;padding:0 14px;background:linear-gradient(180deg,#1c4558,#112e3c);color:#e2f6ff;font-weight:700;cursor:pointer;transition:all .15s ease}
#mapV2Head button:hover,#mapV2Tools button:hover{border-color:#ffe8a3;background:#245870;color:#fff}
#mapV2Head button.active,#mapV2Tools button.active{background:linear-gradient(180deg,#dfc27e,#b89243);border-color:#fff0b8;color:#180f03;box-shadow:0 2px 10px #dfc27e44}
#mapV2Tools{display:flex;flex-wrap:wrap;gap:8px;padding:8px 12px;background:#0a1e2a;border-bottom:1px solid rgba(255,255,255,.07);color:#d9f5ff;align-items:center}
#mapV2Tools .spacer{flex:1}
#mapV2CanvasWrap{position:relative;flex:1;min-height:0;background:#05121a;overflow:hidden;touch-action:none}
#mapV2Canvas{width:100%;height:100%;display:block;touch-action:none}
#mapV2Status{font-size:12px;color:#a2d7eb}
.mobile-minimap{cursor:pointer;touch-action:manipulation;transition:transform .12s ease}
.mobile-minimap:hover{transform:scale(1.04)}
.mobile-minimap:focus-visible{outline:3px solid #78e9ff;outline-offset:2px}`;
  document.head.appendChild(s);
}

class MapV2UI{
  constructor({data=window.GameServices?.mapData,mapState=window.GameServices?.mapState,input=window.GameServices?.input,events=window.GameServices?.events,rt=window.GameRuntime}={}){
    Object.assign(this,{data,mapState,input,events,rt});
    this.mode='LOCAL';
    this.authoring=false;
    this.pan={x:0,z:0};
    this.pointers=new Map();
    this.lastDraw=0;
    this.dirty=true;
    this.filter='ALL';
    css();
    this.build();
    this.bindMini();
    this.listen();
    rt?.scene?.onBeforeRenderObservable?.add?.(()=>this.frame());
  }

  build(){
    const o=document.createElement('section');
    o.id='mapV2Overlay';
    o.setAttribute('aria-hidden','true');
    o.innerHTML=`<div id="mapV2Panel" role="dialog" aria-modal="true" aria-label="Bản đồ">
      <div id="mapV2Head">
        <div class="brand">
          <b>仙 域 地 圖 · THANH VÂN SƠN MẠCH</b>
          <span id="mapV2ZoneBadge">Thanh Vân Thôn</span>
        </div>
        <button data-map-mode="LOCAL" class="active">Phân Vùng</button>
        <button data-map-mode="WORLD">Toàn Cảnh Tiên Sơn</button>
        <button id="mapV2Close">✕</button>
      </div>
      <div id="mapV2Tools">
        <button id="mapV2Add">＋ Đặt dấu trận</button>
        <button id="mapV2Delete">⌫ Xóa dấu</button>
        <button id="mapV2Reset">◎ Vị trí bản thân</button>
        <span class="spacer"></span>
        <span id="mapV2Status"></span>
      </div>
      <div id="mapV2CanvasWrap">
        <canvas id="mapV2Canvas" width="900" height="560"></canvas>
      </div>
    </div>`;
    document.body.appendChild(o);
    this.overlay=o;
    this.canvas=o.querySelector('#mapV2Canvas');
    this.ctx=this.canvas.getContext('2d');
    this.status=o.querySelector('#mapV2Status');
    this.badge=o.querySelector('#mapV2ZoneBadge');

    o.querySelector('#mapV2Close').onclick=()=>this.close();
    o.querySelector('#mapV2Add').onclick=()=>{
      this.authoring=!this.authoring;
      o.querySelector('#mapV2Add').classList.toggle('active',this.authoring);
      this.status.textContent=this.authoring?'Chạm điểm bất kỳ trên bản đồ để cắm cờ ấn ký':''
    };
    o.querySelector('#mapV2Delete').onclick=()=>this.deleteNearest();
    o.querySelector('#mapV2Reset').onclick=()=>{
      this.pan={x:0,z:0};
      this.mapState.setZoom(this.mode,1,{persist:true});
      this.dirty=true;
    };
    for(const b of o.querySelectorAll('[data-map-mode]'))b.onclick=()=>this.setMode(b.dataset.mapMode);

    this.bindPointers();
    this.bindWheel();
  }

  bindMini(){
    const mini=document.getElementById('miniMap');
    if(!mini)return;
    mini.setAttribute('role','button');
    mini.setAttribute('tabindex','0');
    mini.setAttribute('aria-label','Mở bản đồ phân khu');
    mini.addEventListener('click',()=>this.open('LOCAL'));
    mini.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.open('LOCAL')}});
  }

  listen(){
    for(const ev of['world:chunkDiscovered','world:poiDiscovered','waypoint:unlocked','quest:markersChanged','enemy:spawned','enemy:entityRemoved','map:stateChanged','map:worldEventsChanged','world:environmentChanged','zone:loaded']){
      this.events?.on?.(ev,()=>{this.dirty=true},{owner:'MapV2UI'});
    }
  }

  setMode(m){
    this.mode=m==='WORLD'?'WORLD':'LOCAL';
    this.pan={x:0,z:0};
    for(const b of this.overlay.querySelectorAll('[data-map-mode]'))b.classList.toggle('active',b.dataset.mapMode===this.mode);
    this.dirty=true;
  }

  open(mode='LOCAL'){
    this.setMode(mode);
    this.overlay.classList.add('show');
    this.overlay.setAttribute('aria-hidden','false');
    this.resize();
    this.dirty=true;
  }

  close(){
    this.overlay.classList.remove('show');
    this.overlay.setAttribute('aria-hidden','true');
    this.authoring=false;
    for(const[id]of this.pointers)this.input?.releasePointer?.(id);
    this.pointers.clear();
    this.mapState?.save?.('MAP_VIEW');
  }

  resize(){
    const r=this.canvas.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1),w=Math.max(300,Math.round(r.width*d)),h=Math.max(220,Math.round(r.height*d));
    if(this.canvas.width!==w||this.canvas.height!==h){
      this.canvas.width=w;
      this.canvas.height=h;
      this.dirty=true;
    }
  }

  bindWheel(){
    this.canvas.addEventListener('wheel',e=>{
      e.preventDefault();
      e.stopPropagation();
      const currentZoom=this.mapState.getZoom(this.mode)||1;
      const factor=e.deltaY<0?1.15:0.87;
      const newZoom=clamp(currentZoom*factor,.45,3.5);
      this.mapState.setZoom(this.mode,newZoom,{persist:true});
      this.dirty=true;
    },{passive:false});
  }

  bindPointers(){
    const c=this.canvas,pt=e=>{
      const r=c.getBoundingClientRect(),sx=c.width/r.width,sy=c.height/r.height;
      return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};
    };
    c.addEventListener('pointerdown',e=>{
      if(!this.input?.claimPointer?.(e.pointerId,'MAP_V2'))return;
      e.preventDefault();
      e.stopPropagation();
      c.setPointerCapture?.(e.pointerId);
      const q=pt(e);
      this.pointers.set(e.pointerId,{start:q,last:q});
      this.dirty=true;
    },{passive:false});

    c.addEventListener('pointermove',e=>{
      const p=this.pointers.get(e.pointerId);
      if(!p)return;
      e.preventDefault();
      e.stopPropagation();
      const q=pt(e);
      if(this.pointers.size===1&&!this.authoring){
        const dx=q.x-p.last.x,dy=q.y-p.last.y,scale=this.mode==='WORLD'?1:.22/this.mapState.getZoom('LOCAL');
        this.pan.x-=dx*scale;
        this.pan.z+=dy*scale;
      }else if(this.pointers.size===2){
        const arr=[...this.pointers.values()],o=arr[0]===p?arr[1]:arr[0],old=Math.hypot(p.last.x-o.last.x,p.last.y-o.last.y),neu=Math.hypot(q.x-o.last.x,q.y-o.last.y);
        if(old>3&&neu>3)this.mapState.setZoom(this.mode,clamp(this.mapState.getZoom(this.mode)*neu/old,.45,3.5));
      }
      p.last=q;
      this.dirty=true;
    },{passive:false});

    const end=(e,cancel=false)=>{
      const p=this.pointers.get(e.pointerId);
      if(!p)return;
      e.preventDefault();
      e.stopPropagation();
      const q=pt(e),moved=Math.hypot(q.x-p.start.x,q.y-p.start.y);
      if(!cancel&&this.authoring&&moved<12&&this.mode==='LOCAL')this.addMarkerAt(q);
      this.pointers.delete(e.pointerId);
      this.input?.releasePointer?.(e.pointerId);
      if(this.pointers.size===0)this.mapState?.save?.('MAP_VIEW');
      this.dirty=true;
    };
    c.addEventListener('pointerup',e=>end(e),{passive:false});
    c.addEventListener('pointercancel',e=>end(e,true),{passive:false});
  }

  addMarkerAt(q){
    const s=this.data.local(),p=this.localTransform(s).from(q),n=this.mapState.list(s.zoneId).length+1,r=this.mapState.add({zoneId:s.zoneId,position:p,label:`Dấu Trận ${n}`,icon:'✦'});
    if(r?.ok){
      this.authoring=false;
      this.overlay.querySelector('#mapV2Add').classList.remove('active');
      this.status.textContent='Đã lưu dấu trận';
    }
  }

  deleteNearest(){
    const s=this.data.local(),ms=this.mapState.list(s.zoneId);
    if(!ms.length){this.status.textContent='Chưa có dấu trận cá nhân';return}
    const center={x:s.player.position.x+this.pan.x,z:s.player.position.z+this.pan.z};
    ms.sort((a,b)=>Math.hypot(a.position.x-center.x,a.position.z-center.z)-Math.hypot(b.position.x-center.x,b.position.z-center.z));
    this.mapState.remove(ms[0].id);
    this.status.textContent='Đã xóa dấu trận gần nhất';
    this.dirty=true;
  }

  frame(){
    const now=performance.now();
    this.drawMini(now);
    if(!this.overlay.classList.contains('show'))return;
    if(now-this.lastDraw<120&&!this.dirty)return;
    this.lastDraw=now;
    this.resize();
    this.mode==='WORLD'?this.drawWorld():this.drawLocal();
    this.dirty=false;
  }

  drawMini(now){
    if(now-(this._miniLast||0)<90)return;
    this._miniLast=now;
    const c=document.getElementById('miniMapCanvas');
    if(!c)return;
    const x=c.getContext('2d'),s=this.data.local(),w=c.width,h=c.height,cx=w/2,cy=h/2,r=Math.min(cx,cy)-4,range=75,y=-s.player.yaw,ca=Math.cos(y),sa=Math.sin(y);
    x.clearRect(0,0,w,h);
    x.save();
    x.beginPath();
    x.arc(cx,cy,r,0,TAU);
    x.clip();

    // Ancient Silk Terrain Background
    const bgGrad=x.createRadialGradient(cx,cy,5,cx,cy,r);
    bgGrad.addColorStop(0,'#1d463b');
    bgGrad.addColorStop(0.7,'#15342c');
    bgGrad.addColorStop(1,'#0c211b');
    x.fillStyle=bgGrad;
    x.fillRect(0,0,w,h);

    // Subtle terrain rings
    x.strokeStyle='rgba(223,194,126,0.12)';
    x.lineWidth=1;
    x.beginPath();x.arc(cx,cy,r*0.4,0,TAU);x.stroke();
    x.beginPath();x.arc(cx,cy,r*0.75,0,TAU);x.stroke();

    for(const m of s.markers){
      if(!this.data.pointDiscovered(s.zoneId,m.position)&&!['CUSTOM','QUEST','QUEST_READY','WAYPOINT'].includes(m.kind))continue;
      const dx=m.position.x-s.player.position.x,dz=m.position.z-s.player.position.z,rx=dx*ca-dz*sa,rz=dx*sa+dz*ca,d=Math.hypot(rx,rz);
      if(d>range*1.2)continue;
      const sc=Math.min(range,d)/range*r*.85,px=cx+(rx/(d||1))*sc,py=cy+(rz/(d||1))*sc;
      this.dot(x,px,py,m.kind==='BOSS'?5:m.kind==='ENEMY'?3.5:4,this.color(m.kind),m.icon);
    }
    x.restore();

    // Player arrow with glowing jade aura
    x.save();
    x.shadowColor='#62e8ff';
    x.shadowBlur=8;
    x.fillStyle='#72f4ff';
    x.beginPath();
    x.moveTo(cx,cy-10);
    x.lineTo(cx+5,cy+6);
    x.lineTo(cx,cy+3);
    x.lineTo(cx-5,cy+6);
    x.closePath();
    x.fill();
    x.restore();

    // Ancient Golden Jade Frame
    x.strokeStyle='#dfc27e';
    x.lineWidth=3;
    x.beginPath();
    x.arc(cx,cy,r,0,TAU);
    x.stroke();
    x.strokeStyle='rgba(255,255,255,0.4)';
    x.lineWidth=1;
    x.beginPath();
    x.arc(cx,cy,r-2,0,TAU);
    x.stroke();
  }

  dot(c,x,y,r,color,icon=''){
    c.save();
    c.shadowColor=color;
    c.shadowBlur=6;
    c.beginPath();
    c.arc(x,y,r,0,TAU);
    c.fillStyle=color;
    c.fill();
    c.strokeStyle='#ffffffcc';
    c.lineWidth=1.2;
    c.stroke();
    c.restore();
    if(icon&&r>=4){
      c.font=`bold ${Math.max(9,r*1.8)}px sans-serif`;
      c.textAlign='center';
      c.textBaseline='middle';
      c.fillStyle='#fff';
      c.fillText(icon,x,y);
    }
  }

  color(k){
    return({ENEMY:'#ff4d4d',BOSS:'#ff9020',NPC:'#54d6ff',QUEST:'#ffd034',QUEST_READY:'#fff36d',WAYPOINT:'#4fe8d2',POI:'#d9bfff',CUSTOM:'#ff78ea',EVENT:'#ff5959',CONNECTION:'#7aff8c'})[k]||'#fff';
  }

  localTransform(s){
    const z=this.mapState.getZoom('LOCAL'),b=s.zone.bounds,w=this.canvas.width,h=this.canvas.height,span=Math.max(b.maxX-b.minX,b.maxZ-b.minZ)/z,cx=s.player.position.x+this.pan.x,cz=s.player.position.z+this.pan.z,scale=Math.min(w,h)/span;
    return{scale,cx,cz,to:p=>({x:w/2+(p.x-cx)*scale,y:h/2-(p.z-cz)*scale}),from:q=>({x:cx+(q.x-w/2)/scale,z:cz-(q.y-h/2)/scale})};
  }

  drawCompass(c,cx,cy,size=32){
    c.save();
    c.translate(cx,cy);
    // Outer circle
    c.strokeStyle='rgba(223,194,126,0.6)';
    c.lineWidth=1.5;
    c.beginPath();c.arc(0,0,size,0,TAU);c.stroke();
    // 4 cardinal points
    c.font='bold 11px system-ui';
    c.textAlign='center';
    c.textBaseline='middle';
    c.fillStyle='#ffd885';
    c.fillText('Bắc',0,-size-12);
    c.fillStyle='#a8d4d8';
    c.fillText('Nam',0,size+12);
    c.fillText('Đông',size+16,0);
    c.fillText('Tây',-size-16,0);
    // Needle
    c.fillStyle='#ff5454';
    c.beginPath();c.moveTo(0,-size+2);c.lineTo(4,0);c.lineTo(-4,0);c.closePath();c.fill();
    c.fillStyle='#54b2ff';
    c.beginPath();c.moveTo(0,size-2);c.lineTo(4,0);c.lineTo(-4,0);c.closePath();c.fill();
    c.restore();
  }

  drawLocal(){
    const s=this.data.local(),c=this.ctx,w=this.canvas.width,h=this.canvas.height,T=this.localTransform(s),z=s.zone,size=z.chunkSize||70,maxX=Math.max(0,Math.ceil((z.bounds.maxX-z.bounds.minX)/size)-1),maxZ=Math.max(0,Math.ceil((z.bounds.maxZ-z.bounds.minZ)/size)-1);

    if(this.badge)this.badge.textContent=z.name;

    // 1. Xianxia Parchment / Jade Mountain Background
    c.clearRect(0,0,w,h);
    const grad=c.createRadialGradient(w/2,h/2,50,w/2,h/2,Math.max(w,h)/1.2);
    grad.addColorStop(0,'#1a3a34');
    grad.addColorStop(0.5,'#142e29');
    grad.addColorStop(1,'#0c1e1a');
    c.fillStyle=grad;
    c.fillRect(0,0,w,h);

    // Decorative grid & border contour
    c.strokeStyle='rgba(223,194,126,0.06)';
    c.lineWidth=1;
    const gridStep=40*T.scale;
    if(gridStep>15&&gridStep<200){
      for(let x=0;x<w;x+=gridStep){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
      for(let y=0;y<h;y+=gridStep){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    }

    // 2. Water / Streams with ripple aura
    for(const wa of z.terrain?.water||[]){
      const p=T.to(wa.center),r=wa.radius*T.scale;
      // Outer aura
      const wGrad=c.createRadialGradient(p.x,p.y,r*0.2,p.x,p.y,r*1.15);
      wGrad.addColorStop(0,'#4ec2e0');
      wGrad.addColorStop(0.7,'#2985a2');
      wGrad.addColorStop(1,'rgba(28,94,115,0)');
      c.fillStyle=wGrad;
      c.beginPath();c.arc(p.x,p.y,r*1.15,0,TAU);c.fill();
      // Body
      c.fillStyle='#36a0c0';
      c.beginPath();c.arc(p.x,p.y,r,0,TAU);c.fill();
      c.strokeStyle='#8de4ff';
      c.lineWidth=2;
      c.stroke();
      // Inner ripple
      c.strokeStyle='rgba(255,255,255,0.45)';
      c.lineWidth=1;
      c.beginPath();c.arc(p.x,p.y,r*0.55,0,TAU);c.stroke();
    }

    // 3. Ancient Stone Roads & Pathways
    c.lineCap='round';
    c.lineJoin='round';
    for(const r of z.terrain?.roads||[]){
      const a=T.to(r.a),b=T.to(r.b),rw=Math.max(4,r.width*T.scale);
      // Road border / earth shoulder
      c.strokeStyle='#79684b';
      c.lineWidth=rw+4;
      c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      // Road paver body
      c.strokeStyle='#c4b087';
      c.lineWidth=rw;
      c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      // Center stones guideline
      c.strokeStyle='rgba(255,255,255,0.3)';
      c.lineWidth=Math.max(1,rw*0.18);
      c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
    }

    // 4. SubZone Hub Areas / Court Yards
    for(const sz of Object.values(z.subZones||{})){
      const p=T.to(sz.center),r=sz.radius*T.scale;
      c.save();
      c.strokeStyle='rgba(223,194,126,0.22)';
      c.lineWidth=2;
      c.setLineDash([6,4]);
      c.beginPath();c.arc(p.x,p.y,r,0,TAU);c.stroke();
      c.restore();
    }

    // 5. Fog of War (Soft Tiên Khí Mist Overlay)
    for(let x=0;x<=maxX;x++){
      for(let zz=0;zz<=maxZ;zz++){
        const key=`${z.id}:${x},${zz}`,disc=!!s.discoveredChunks[key];
        if(!disc){
          const x0=z.bounds.minX+x*size,x1=Math.min(z.bounds.maxX,x0+size),z0=z.bounds.minZ+zz*size,z1=Math.min(z.bounds.maxZ,z0+size);
          const p0=T.to({x:x0,z:z1}),p1=T.to({x:x1,z:z0}),cw=p1.x-p0.x,ch=p1.y-p0.y;
          // Soft mist block
          c.fillStyle='rgba(6,16,22,0.92)';
          c.fillRect(p0.x,p0.y,cw,ch);
          c.strokeStyle='rgba(100,200,220,0.06)';
          c.strokeRect(p0.x,p0.y,cw,ch);
        }
      }
    }

    // 6. Markers & POIs
    for(const m of s.markers){
      if(!this.data.pointDiscovered(s.zoneId,m.position)&&!['CUSTOM','QUEST','QUEST_READY','WAYPOINT','CONNECTION'].includes(m.kind))continue;
      const p=T.to(m.position);
      if(p.x<-40||p.y<-40||p.x>w+40||p.y>h+40)continue;

      // Special rendering for Waypoints (Đạo Tiêu Bát Quái)
      if(m.kind==='WAYPOINT'){
        c.save();
        c.shadowColor='#4fe8d2';
        c.shadowBlur=12;
        c.fillStyle='#236056';
        c.beginPath();c.arc(p.x,p.y,12,0,TAU);c.fill();
        c.strokeStyle='#4fe8d2';
        c.lineWidth=2;
        c.stroke();
        c.fillStyle='#e3fffa';
        c.font='bold 11px system-ui';
        c.textAlign='center';
        c.textBaseline='middle';
        c.fillText('🌀',p.x,p.y);
        c.restore();
      }else if(m.kind==='CONNECTION'){
        c.save();
        c.shadowColor='#7aff8c';
        c.shadowBlur=8;
        c.fillStyle='#1c4a24';
        c.beginPath();c.arc(p.x,p.y,11,0,TAU);c.fill();
        c.strokeStyle='#7aff8c';
        c.lineWidth=2;
        c.stroke();
        c.fillStyle='#e3fffa';
        c.font='bold 11px system-ui';
        c.textAlign='center';
        c.textBaseline='middle';
        c.fillText('⛩️',p.x,p.y);
        c.restore();
      }else{
        this.dot(c,p.x,p.y,m.kind==='BOSS'?10:8,this.color(m.kind),m.icon);
      }

      // Marker Label with background badge
      if(m.kind!=='ENEMY'){
        c.save();
        c.font='bold 11px system-ui';
        c.textAlign='center';
        c.textBaseline='bottom';
        const txt=m.label||'',tw=c.measureText(txt).width;
        c.fillStyle='rgba(6,18,24,0.78)';
        c.fillRect(p.x-tw/2-5,p.y+16,tw+10,18);
        c.strokeStyle='rgba(223,194,126,0.4)';
        c.lineWidth=1;
        c.strokeRect(p.x-tw/2-5,p.y+16,tw+10,18);
        c.fillStyle='#f1fbff';
        c.fillText(txt,p.x,p.y+31);
        c.restore();
      }
    }

    // 7. Player Character Marker with Orientation Cone
    const pp=T.to(s.player.position),yaw=-s.player.yaw;
    c.save();
    // Vision cone
    c.fillStyle='rgba(98,232,255,0.14)';
    c.beginPath();
    c.moveTo(pp.x,pp.y);
    c.arc(pp.x,pp.y,38,yaw-0.45,yaw+0.45);
    c.closePath();
    c.fill();
    // Glowing pulse
    c.shadowColor='#62e8ff';
    c.shadowBlur=14;
    c.fillStyle='#62e8ff';
    c.beginPath();
    c.arc(pp.x,pp.y,8,0,TAU);
    c.fill();
    // Flying sword pointer
    c.translate(pp.x,pp.y);
    c.rotate(yaw+Math.PI/2);
    c.fillStyle='#ffffff';
    c.beginPath();
    c.moveTo(0,-14);
    c.lineTo(6,7);
    c.lineTo(0,3);
    c.lineTo(-6,7);
    c.closePath();
    c.fill();
    c.restore();

    // 8. Top-right Ancient Compass
    this.drawCompass(c,w-60,65,26);

    // Status bar info
    this.status.textContent=`${z.name} · ${s.environment?.weather||'Trời Quang'} · ${s.environment?.labelTime||'12:00'} · Tỉ lệ ${this.mapState.getZoom('LOCAL').toFixed(1)}×`;
  }

  drawWorld(){
    const s=this.data.world(),c=this.ctx,w=this.canvas.width,h=this.canvas.height,z=this.mapState.getZoom('WORLD'),nodes=s.nodes,margin=90,step=(w-margin*2)/Math.max(1,nodes.length-1)*z,baseX=w/2-((nodes.length-1)*step)/2+this.pan.x,baseY=h/2+this.pan.z*.2,pos=new Map();

    if(this.badge)this.badge.textContent=s.region.name;

    // Background
    c.clearRect(0,0,w,h);
    const grad=c.createRadialGradient(w/2,h/2,80,w/2,h/2,w);
    grad.addColorStop(0,'#0e222a');
    grad.addColorStop(1,'#050e12');
    c.fillStyle=grad;
    c.fillRect(0,0,w,h);

    nodes.forEach((n,i)=>pos.set(n.id,{x:baseX+i*step,y:baseY+(i%2?42:-42)}));

    // Sợi Linh Mạch (Spirit Vein Edges)
    for(const e of s.edges){
      const a=pos.get(e.a),b=pos.get(e.b);
      if(!a||!b)continue;
      c.save();
      c.shadowColor='#51c7b8';
      c.shadowBlur=8;
      c.strokeStyle='#dfc27e';
      c.lineWidth=4;
      c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      c.strokeStyle='#fff6cc';
      c.lineWidth=1.5;
      c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      c.restore();
    }

    // Tiên Môn Phân Vùng (Zone Nodes)
    for(const n of nodes){
      const p=pos.get(n.id),disc=n.discovered;
      c.save();
      if(n.current){
        c.shadowColor='#70e4ff';
        c.shadowBlur=20;
      }
      c.beginPath();
      c.arc(p.x,p.y,n.current?30:24,0,TAU);
      c.fillStyle=n.current?'#186378':disc?'#1b4c3e':'#0d1a20';
      c.fill();
      c.strokeStyle=n.current?'#a3f2ff':disc?'#dfc27e':'#44585f';
      c.lineWidth=n.current?3:2;
      c.stroke();

      // Inner seal icon
      c.fillStyle=n.current?'#a3f2ff':disc?'#dfc27e':'#50656d';
      c.font='bold 15px system-ui';
      c.textAlign='center';
      c.textBaseline='middle';
      c.fillText(disc||n.current?'⛰️':'🔒',p.x,p.y);
      c.restore();

      // Title badge
      c.fillStyle=disc||n.current?'#f1fbfb':'#718184';
      c.font='bold 13px system-ui';
      c.textAlign='center';
      c.fillText(disc||n.current?n.name:'Vùng Ẩn Bí',p.x,p.y+46);
      if(n.waypoints){
        c.font='11px system-ui';
        c.fillStyle='#78e9ff';
        c.fillText(`🌀 ${n.waypoints} Đạo Tiêu`,p.x,p.y+63);
      }
    }

    this.status.textContent=`${s.region.name} · ${s.environment?.weather||'Trời Quang'} · ${s.environment?.labelTime||'12:00'} · Sơn Mạch 6 Phân Vùng`;
  }

  dispose(){
    this.events?.disposeOwner?.('MapV2UI');
    this.overlay?.remove?.();
  }
}

window.GameCore=window.GameCore||{};
window.GameCore.MapV2UI=MapV2UI;
})();