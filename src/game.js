import {portalsFor,makeWorld} from './world.js';
import {Input} from './input.js';
import {UI} from './ui.js';
import {Engine} from './cultivation.js';
import {TYPES,clamp,distance,loadImage,GAMEPLAY} from './core/runtime.js';
import {installSystems} from './core/systems.js';
import {RendererSystem} from './systems/renderer.js';
import {NpcAiSystem} from './systems/npc-ai.js';
import {CombatSystem} from './systems/combat.js';
import {CharactersSystem} from './systems/characters.js';
import {TravelSystem} from './systems/travel.js';
import {PersistenceSystem} from './systems/persistence.js';
import {ProgressionSystem} from './systems/progression.js';
import {WorldUpdateSystem} from './systems/world-update.js';

export class Game {
  constructor(){
    this.shell=document.getElementById('game-shell');this.canvas=document.getElementById('game');this.ctx=this.canvas.getContext('2d',{alpha:false});
    this.mini=document.getElementById('minimap');this.miniCtx=this.mini.getContext('2d');
    this.w=0;this.h=0;this.dpr=1;this.cam={x:0,y:0};this.auto=false;this.paused=false;
    this.lastManual=0;this.target=null;this.tapMarker=null;
    this.images={};this.gameTime=0;this.saveAge=0;this.miniAge=0;
    this.mapId='map';this.mapStates={};this.portalCooldown=0;
    this.mapImages=new Map();this.transitioning=false;
    this.state=makeWorld();this.player=this.makePlayer();
    this.ui=new UI(this);
    this.input=new Input(document.getElementById('joystick'),document.getElementById('joy-knob'),a=>this.action(a),(x,y)=>this.tap(x,y));
    this.resize();new ResizeObserver(()=>this.resize()).observe(this.shell);
    window.addEventListener('pagehide',()=>this.save());
    this.restore();this.state=makeWorld(this.mapId);this.refreshEnemies();this.ensureNPCs();
  }
  async start(){
    try{
      this.ui.setLoading('Đang nạp tài nguyên PNG / WebP...');
      const imgs=await Promise.all(TYPES.map(async type=>[type,await loadImage(type)]));
      this.images=Object.fromEntries(imgs);
      this.images[this.mapId]=await this.loadFloorImage(this.mapId);

      this.resize();this.cam.x=this.player.x-this.w/2;
      this.cam.y=this.player.y-this.h/2;
      this.ui.hideLoading();this.ui.toast('Joystick để di chuyển · ⚔ để đánh · Q thần thông · F hồi máu',5200);
      this.last=performance.now();this.raf=requestAnimationFrame(t=>this.loop(t));
      if(new URLSearchParams(location.search).has('debug'))window.__GAME_DEBUG__=this;
    }catch(err){
      console.error('Không thể khởi động game:',err);
      this.ui.setLoading('Lỗi tải asset. Hãy chạy qua HTTP / GitHub Pages (không mở file://).');
    }
  }
  resize(){
    const rect=this.shell.getBoundingClientRect();this.w=Math.max(1,Math.round(rect.width));this.h=Math.max(1,Math.round(rect.height));
    this.dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.ctx.imageSmoothingEnabled=true;
  }
  toast(txt){this.ui.toast(txt)}
  action(name){
    if(name==='menu'){this.ui.menu();return}
    if(this.paused||this.player.dead||this.transitioning)return;
    this.stopMeditation();if(name==='attack')this.attack();else if(name==='skill')this.skill();else if(name==='heal')this.heal();
  }
  tap(clientX,clientY){
    if(this.paused||this.player.dead||this.transitioning)return;this.stopMeditation();
    const r=this.canvas.getBoundingClientRect(),zoom=this.viewScale||1;
    const x=this.cam.x+(clientX-r.left)/zoom,y=this.cam.y+(clientY-r.top)/zoom;
    let closest=null,best=45;
    for(const enemy of this.state.enemies){
      if(enemy.dead)continue;
      const d=Math.hypot(enemy.x-x,enemy.y-y);
      if(d<best){best=d;closest=enemy}
    }
    this.target=closest?{kind:'enemy',id:closest.id}:{kind:'point',x,y};
    this.tapMarker={x,y,life:.8};this.lastManual=this.gameTime;
  }
  loop(now){
    const dt=clamp((now-this.last)/1000,0,GAMEPLAY.maxFrameDelta);this.last=now;
    if(!this.paused){this.step(dt);this.gameTime+=dt}
    this.render();this.ui.update(now);
    this.miniAge+=dt;if(this.miniAge>GAMEPLAY.minimapInterval){this.miniAge=0;this.drawMinimap()}
    this.raf=requestAnimationFrame(t=>this.loop(t));
  }
  step(dt){
    const p=this.player;if(p.dead||this.transitioning)return;
    this.portalCooldown=Math.max(0,this.portalCooldown-dt);
    const portal=portalsFor(this.mapId).find(portal=>distance(p,portal)<48);
    if(this.portalCooldown===0&&portal){void this.travel(portal.id);return}
    this.tickCharacter(p,dt);
    if(p.isMeditating){
      if(this.findNearest(260)||this.input.vector().active)this.stopMeditation();
      else{p.meditationAge+=dt;while(p.meditationAge>=1){Engine.meditateTick(p,1);p.meditationAge--}
        p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.025*dt);p.mp=Math.min(p.maxMp,p.mp+p.maxMp*.05*dt)}
    }
    const v=this.input.vector();let dir={x:0,y:0},moving=false;
    if(v.active){
      dir={x:v.x,y:v.y};moving=true;this.target=null;this.lastManual=this.gameTime;
    }else if(this.target){
      let target=null;
      if(this.target.kind==='point')target=this.target;
      else target=this.state.enemies.find(e=>e.id===this.target.id&&!e.dead);
      if(!target)this.target=null;
      else{
        const d=distance(p,target),stop=this.target.kind==='enemy'?69:10;
        if(d>stop){dir={x:(target.x-p.x)/d,y:(target.y-p.y)/d};moving=true}
        else {if(this.target.kind==='enemy'&&p.cooldowns.attack<=0){this.faceEnemy(target);this.attack()}else if(this.target.kind==='point')this.target=null;}
      }
    }else if(this.auto&&this.gameTime-this.lastManual>.55){
      const near=this.findNearest(390);
      if(near){
        const d=distance(p,near);if(p.attackAnim<=0&&p.skillAnim<=0)this.faceEnemy(near);
        if(d>72){dir={x:(near.x-p.x)/d,y:(near.y-p.y)/d};moving=true}
        else if(p.cooldowns.attack<=0)this.attack();
      }
    }
    this.moveCharacter(p,moving?dir:{x:0,y:0},dt);
    this.stepNPCs(dt);this.stepEnemies(dt);this.stepDrops(dt);this.stepEffects(dt);

    this.saveAge+=dt;if(this.saveAge>GAMEPLAY.saveInterval){this.saveAge=0;this.save()}
  }
}

installSystems(Game,[CharactersSystem,NpcAiSystem,CombatSystem,ProgressionSystem,
  PersistenceSystem,TravelSystem,WorldUpdateSystem,RendererSystem]);
