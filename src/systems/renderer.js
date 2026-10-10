import {WORLD,SPECIES,portalsFor} from '../world.js';
import {floorNumber} from '../floors.js';
import {SKILL_VFX,skillVfxFrame} from '../skill-vfx.js';
import {Engine} from '../cultivation.js';
import {FRAME,PLAYER_FRAME_WIDTH,PLAYER_FRAME_HEIGHT,PLAYER_SCALE,PLAYER_FRAMES,PLAYER_COLUMNS,NPC_RENDER,PLAYER_FEET,PLAYER_HEIGHTS,clamp,easing} from '../core/runtime.js';

export const RendererSystem = {
  drawSprite(sheet,row,col,x,y,w,h,foot=173,frame=FRAME,flipX=false){
    if(!sheet)return;
    const ctx=this.ctx;const sy=row*frame,sx=col*frame;
    if(flipX){
      ctx.save();ctx.translate(x,y);ctx.scale(-1,1);
      ctx.drawImage(sheet,sx,sy,frame,frame,-w/2,-h*foot/frame,w,h);
      ctx.restore();
    }else{
      ctx.drawImage(sheet,sx,sy,frame,frame,x-w/2,y-h*foot/frame,w,h);
    }
  },
  render(){
    if(!this.images[this.mapId])return;
    this.viewScale=Math.max(1,this.w/WORLD.width,this.h/WORLD.height);
    const viewW=this.w/this.viewScale,viewH=this.h/this.viewScale;
    this.cam.x=clamp(this.player.x-viewW/2,0,Math.max(0,WORLD.width-viewW));
    this.cam.y=clamp(this.player.y-viewH/2,0,Math.max(0,WORLD.height-viewH));
    const c=this.ctx;c.save();c.setTransform(this.dpr,0,0,this.dpr,0,0);
    c.clearRect(0,0,this.w,this.h);c.fillStyle='#1c382b';c.fillRect(0,0,this.w,this.h);
    c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    c.scale(this.viewScale,this.viewScale);
    c.drawImage(this.images[this.mapId],-this.cam.x,-this.cam.y,WORLD.width,WORLD.height);
    c.save();c.translate(-this.cam.x,-this.cam.y);
    this.drawPortal();this.drawHerbs();this.drawDrops();this.drawTap();
    const drawables=[...this.state.enemies.filter(e=>!e.dead),
      ...this.state.npcs.filter(p=>!p.dead),this.player];
    drawables.sort((a,b)=>a.y-b.y);
    for(const entity of drawables){if(entity.kind)this.drawEnemy(entity);else this.drawHero(entity)}
    this.drawEffects();this.drawTexts();c.restore();c.restore();
  },
  drawShadow(x,y,w=36,h=12){
    const c=this.ctx;c.fillStyle='#020b0b60';c.beginPath();c.ellipse(x,y-4,w/2,h/2,0,0,Math.PI*2);c.fill();
  },
  drawPortal(){
    const c=this.ctx,pulse=1+Math.sin(this.gameTime*3)*.06;
    for(const p of portalsFor(this.mapId)){
    c.save();c.translate(p.x,p.y);c.scale(pulse,pulse*.6);
    c.strokeStyle='#84f5ff';c.fillStyle='#174a7770';c.lineWidth=3;c.shadowColor='#39d9ff';c.shadowBlur=20;
    c.beginPath();c.arc(0,0,57,0,Math.PI*2);c.fill();c.stroke();
    c.rotate(this.gameTime*.4);
    c.beginPath();c.arc(0,0,43,0,Math.PI*2);c.stroke();
    for(let i=0;i<6;i++){const a=i*Math.PI/3,b=a+Math.PI*2/3;c.beginPath();c.moveTo(Math.cos(a)*43,Math.sin(a)*43);c.lineTo(Math.cos(b)*43,Math.sin(b)*43);c.stroke()}
    c.restore();c.save();c.textAlign='center';c.font='bold 13px system-ui';c.fillStyle='#d9fbff';c.shadowColor='#061c30';c.shadowBlur=5;
    c.fillText('Truyền tống trận · Tầng '+floorNumber(p.to),p.x,p.y-49);c.restore();
    }
  },
  drawHero(p=this.player){
    const c=this.ctx,sheet=this.images[p.sprite||'player'];
    const npcRender=NPC_RENDER[p.sprite],scale=npcRender?.scale||1;
    this.drawShadow(p.x,p.y,27*PLAYER_SCALE,7*PLAYER_SCALE);
    if(p.isMeditating||p.buffTime>0){c.strokeStyle=p.isMeditating?'#91ffc9':'#ffd77c';c.lineWidth=2;c.beginPath();c.ellipse(p.x,p.y-4,32+Math.sin(this.gameTime*3)*4,12,0,0,Math.PI*2);c.stroke()}

    let animOffset=0,col=0;
    if(p.skillAnim>0){
      animOffset=3;
      col=clamp(Math.floor(p.skillAge/.52*PLAYER_FRAMES),0,PLAYER_FRAMES-1);
    }else if(p.attackAnim>0){
      animOffset=2;
      col=clamp(Math.floor(p.attackAge/.38*PLAYER_FRAMES),0,PLAYER_FRAMES-1);
    }else if(p.walk){
      animOffset=1;
      col=Math.floor(p.walkAge)%PLAYER_FRAMES;
    }else{
      animOffset=0;
      col=Math.floor((p.idleAge||0)*10)%PLAYER_FRAMES;
    }
    const row=animOffset;
    c.save();c.translate(p.x,p.y);if(p.face<0)c.scale(-1,1);
    c.drawImage(sheet,(col%PLAYER_COLUMNS)*PLAYER_FRAME_WIDTH,row*PLAYER_FRAME_HEIGHT,
      PLAYER_FRAME_WIDTH,PLAYER_FRAME_HEIGHT,-(npcRender?.center||PLAYER_FRAME_WIDTH/2)*scale,
      npcRender?-npcRender.foot*scale:-PLAYER_FEET[row][col]*PLAYER_SCALE,
      PLAYER_FRAME_WIDTH*scale,PLAYER_FRAME_HEIGHT*scale);
    c.restore();
    c.globalAlpha=1;
    const healthY=p.y-(npcRender?79:PLAYER_HEIGHTS[row][col]*PLAYER_SCALE)-12;
    this.drawHealth(p.x,healthY,46,p.hp/p.maxHp,p.sprite?'#70dfff':'#6aeb6e');
    if(p.sprite){
      c.save();c.textAlign='center';c.textBaseline='alphabetic';
      c.shadowColor='#061c30';c.shadowBlur=4;
      c.font='bold 10px system-ui';c.fillStyle='#ffe2a3';
      c.fillText(Engine.getRealm(p).name,p.x,healthY-21);
      c.font='bold 11px system-ui';c.fillStyle='#b9eeff';
      c.fillText(p.name,p.x,healthY-7);c.restore();
    }
  },
  drawEnemy(e){
    const c=this.ctx,spec=SPECIES[e.kind],w=spec.size[0],h=spec.size[1];
    this.drawShadow(e.x,e.y,w*.57,12);
    if(e.kind!=='deer'&&e.flinch>0)c.globalAlpha=.66;
    const attacking=e.attackAnim>0;
    const row=attacking?1:0;
    const col=attacking?clamp(Math.floor(e.attackAge/.6*8),0,7):(e.kind==='deer'||e.walk?Math.floor(e.moveAge)%8:0);
    const foot=173;
    this.drawSprite(this.images[e.kind],row,col,e.x,e.y,w,h,foot,FRAME,e.face<0);c.globalAlpha=1;
    const targeted=this.target?.kind==='enemy'&&this.target.id===e.id;
    if(targeted){c.strokeStyle='#ffef9a';c.lineWidth=1.6;c.beginPath();c.ellipse(e.x,e.y-1,27,9,0,0,7);c.stroke()}
    this.drawHealth(e.x,e.y-h*.88,44,e.hp/e.maxHp,'#ee474c');
  },
  drawHealth(x,y,width,ratio,color){
    const c=this.ctx;c.fillStyle='#0d1917d9';c.fillRect(x-width/2-1,y-1,width+2,7);
    c.fillStyle=color;c.fillRect(x-width/2,y,width*clamp(ratio,0,1),5);
  },
  drawHerbs(){
    const c=this.ctx;for(const h of this.state.herbs){if(!h.available)continue;
      const bob=Math.sin(h.phase)*2;c.save();c.translate(h.x,h.y+bob);
      c.shadowColor='#88fcb0';c.shadowBlur=9;c.strokeStyle='#d4ffd5';c.lineWidth=1.3;c.fillStyle='#49af5f';
      c.beginPath();c.moveTo(0,9);c.lineTo(0,-8);c.stroke();
      for(const v of [[-7,-4,-2,-9],[7,-3,3,-11],[-5,4,-1,0]]){
        c.beginPath();c.ellipse(v[0],v[1],5,2.7,v[0]<0?-.7:.7,0,7);c.fill();c.stroke()}
      c.restore();
    }
  },
  drawDrops(){
    const c=this.ctx;for(const d of this.state.drops){
      c.save();c.translate(d.x,d.y-12+Math.sin(d.spin)*3);c.shadowColor=d.gold?'#ffda54':'#7cffaf';c.shadowBlur=9;
      if(d.gold){c.fillStyle='#ffd366';c.strokeStyle='#9b6422';c.lineWidth=2;c.beginPath();c.arc(0,0,7,0,7);c.fill();c.stroke();
        c.fillStyle='#96631f';c.font='bold 9px sans-serif';c.textAlign='center';c.fillText('✦',0,3)}
      else{c.fillStyle='#4af396';c.font='bold 21px sans-serif';c.textAlign='center';c.fillText('❀',0,7)}c.restore();
    }
  },
  drawTap(){
    if(!this.tapMarker)return;
    const t=this.tapMarker,c=this.ctx;c.save();c.strokeStyle=`rgba(255,229,134,${clamp(t.life,0,1)})`;c.lineWidth=2;c.beginPath();c.arc(t.x,t.y,12+(1-t.life)*17,0,Math.PI*2);c.stroke();c.restore();
  },
  impactSprite(color){
    this.impactSprites??=new Map();
    if(!this.impactSprites.has(color)){
      const image=this.images.frame_7,canvas=document.createElement('canvas');
      canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
      ctx.globalCompositeOperation='source-in';ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.4;ctx.drawImage(image,0,0);
      this.impactSprites.set(color,canvas);
    }
    return this.impactSprites.get(color);
  },
  drawEffects(){
    const c=this.ctx;
    for(const f of this.state.effects){
      const progress=1-f.life/f.max,alpha=clamp(f.life/f.max,0,1);
      c.save();c.globalAlpha=alpha;
      if(f.type==='skillProjectile'){
        const col=clamp(Math.floor(f.age/f.max*SKILL_VFX.columns),0,SKILL_VFX.columns-1);
        c.globalAlpha=1;c.translate(f.x,f.y);c.rotate(f.angle);
        const frame=skillVfxFrame(f.row,col);
        c.drawImage(this.images[SKILL_VFX.asset],frame.x,frame.y,
          frame.width,frame.height,-SKILL_VFX.width/2,-SKILL_VFX.height/2,SKILL_VFX.width,SKILL_VFX.height);
      }else if(f.type==='skillImpact'){
        const radius=48+progress*28,size=90+Math.sin(progress*Math.PI)*35;
        const glow=c.createRadialGradient(f.x,f.y,0,f.x,f.y,radius);
        glow.addColorStop(0,f.color+'80');glow.addColorStop(.4,f.color+'35');glow.addColorStop(1,f.color+'00');
        c.fillStyle=glow;c.beginPath();c.arc(f.x,f.y,radius,0,Math.PI*2);c.fill();
        c.shadowColor=f.color;c.shadowBlur=16;
        c.drawImage(this.impactSprite(f.color),f.x-size/2,f.y-size/2,size,size);
      }else if(f.type==='slash'){
        c.translate(f.x,f.y);c.scale(f.face,1);c.rotate(-.26);
        c.strokeStyle='#a8eaff';c.lineWidth=10*(1-progress*.7);c.shadowBlur=24;c.shadowColor='#19aaff';
        c.beginPath();c.arc(0,0,52,-1.3,1.15);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=2.5;
        c.beginPath();c.arc(0,0,58,-1.25,1.1);c.stroke();
      }else if(f.type==='wave'||f.type==='level'||f.type==='heal'){
        const radius=f.type==='wave'?25+190*easing(progress):f.type==='level'?20+110*easing(progress):15+65*easing(progress);
        c.strokeStyle=f.type==='heal'?'#9fffba':f.type==='level'?'#ffe5a3':'#7fdfff';
        c.shadowBlur=22;c.shadowColor=c.strokeStyle;c.lineWidth=7*(1-progress)+1;
        c.beginPath();c.arc(f.x,f.y,radius,0,7);c.stroke();
        if(f.type==='wave')for(let i=0;i<8;i++){
          const theta=i*Math.PI/4+progress*2;
          c.fillStyle='#c5f7ff';c.beginPath();c.arc(f.x+radius*.86*Math.cos(theta),f.y+radius*.65*Math.sin(theta),3,0,7);c.fill();
        }
      }else if(f.type==='impact'||f.type==='spark'){
        c.strokeStyle='#99e7ff';c.lineWidth=3;c.shadowColor='#4acbff';c.shadowBlur=13;
        for(let i=0;i<6;i++){const a=i*Math.PI/3;const r=8+25*progress;
          c.beginPath();c.moveTo(f.x+Math.cos(a)*r*.5,f.y+Math.sin(a)*r*.5);
          c.lineTo(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r);c.stroke();}
      }
      c.restore();
    }
  },
  drawTexts(){
    const c=this.ctx;c.textAlign='center';c.textBaseline='middle';
    for(const t of this.state.texts){
      c.save();c.globalAlpha=clamp(t.life/.35,0,1);c.font=t.text.includes('ĐỘT PHÁ')?'900 15px system-ui':'900 17px system-ui';
      c.lineWidth=4;c.strokeStyle='#281c13';const x=t.x+t.offset,y=t.y-(1-t.life/t.max)*36;
      c.strokeText(t.text,x,y);c.fillStyle=t.color;c.fillText(t.text,x,y);c.restore();
    }
  },
  drawMinimap(){
    if(!this.images[this.mapId])return;
    const c=this.miniCtx,n=224;
    c.clearRect(0,0,n,n);c.drawImage(this.images[this.mapId],0,0,n,n);
    // Preview whole world; object location mapped from world space.
    const sx=n/WORLD.width,sy=n/WORLD.height;
    c.strokeStyle='#85f5ff';c.lineWidth=2;
    for(const portal of portalsFor(this.mapId)){c.beginPath();c.arc(portal.x*sx,portal.y*sy,5,0,Math.PI*2);c.stroke()}
    c.fillStyle='#ff626c';
    for(const e of this.state.enemies){if(e.dead)continue;c.beginPath();c.arc(e.x*sx,e.y*sy,2.8,0,7);c.fill()}
    c.fillStyle='#70dfff';
    for(const p of this.state.npcs){if(p.dead)continue;c.beginPath();c.arc(p.x*sx,p.y*sy,3.5,0,Math.PI*2);c.fill()}
    c.strokeStyle='#123031';c.lineWidth=2;c.fillStyle='#a6f9ff';c.beginPath();
    c.arc(this.player.x*sx,this.player.y*sy,6,0,7);c.fill();c.stroke();
    c.fillStyle='#d8fff5';c.beginPath();c.moveTo(this.player.x*sx,this.player.y*sy-12);
    c.lineTo(this.player.x*sx-4,this.player.y*sy-5);c.lineTo(this.player.x*sx+4,this.player.y*sy-5);c.fill();
  }
};
