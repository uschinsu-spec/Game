import {WORLD,PLAYER_SPAWN,isWalkable} from '../world.js';
import {Engine,syncStats} from '../cultivation.js';
import {clamp,GAMEPLAY} from '../core/runtime.js';

export const CharactersSystem = {
  makePlayer(){
    const p={...Engine.createCharacter('Thanh Phong'),x:PLAYER_SPAWN.x,y:PLAYER_SPAWN.y,face:1,mp:100,
      gold:0,materials:{},gearInventory:{},gearSlots:{},baseEquippedGear:{},skillExp:{},selectedSkillId:'kiem_1',ownedManuals:[],pills:{hoi_huyet:0,hoi_linh:0},meditationAge:0,buffTime:0,buffId:null,walk:false,walkAge:0,idleAge:0,
      attackAnim:0,attackAge:0,attackHit:false,attackDuration:.38,attackHitTime:.11,
      skillAnim:0,skillAge:0,skillDuration:.52,skillReleaseAge:.2,pendingSkill:null,
      cooldowns:{attack:0,skill:0,heal:0,mana:0},hurt:0,dead:false};
    syncStats(p,true);return p;
  },
  tickCharacter(p,dt){
    for(const k in p.cooldowns)p.cooldowns[k]=Math.max(0,p.cooldowns[k]-dt);
    if(p.isNPC)for(const id in p.skillCooldowns)p.skillCooldowns[id]=Math.max(0,p.skillCooldowns[id]-dt);
    p.hurt=Math.max(0,p.hurt-dt);p.mp=Math.min(p.maxMp,p.mp+p.maxMp*.018*dt);
    p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.001*dt);p.buffTime=Math.max(0,p.buffTime-dt);
    if(p.attackAnim>0){
      p.attackAnim=Math.max(0,p.attackAnim-dt);p.attackAge+=dt;
      if(!p.attackHit&&p.attackAge>=p.attackHitTime){p.attackHit=true;this.doAttackHit(p)}
    }
    if(p.skillAnim>0){
      p.skillAnim=Math.max(0,p.skillAnim-dt);p.skillAge+=dt;
      if(p.pendingSkill&&p.skillAge>=p.skillReleaseAge)this.releaseSkill(p);
    }
  },
  moveCharacter(p,dir,dt){
    const moving=Math.hypot(dir.x,dir.y)>.01;
    p.walk=moving&&p.attackAnim<=.15&&p.skillAnim<=.15;
    if(moving){
      if(p.attackAnim<=0&&p.skillAnim<=0&&Math.abs(dir.x)>.045)p.face=dir.x>0?1:-1;
      this.moveEntity(p,dir.x*GAMEPLAY.characterSpeed*dt,dir.y*GAMEPLAY.characterSpeed*dt);p.walkAge+=dt*10;
    }else{p.walkAge+=dt*1.1;p.idleAge=(p.idleAge||0)+dt}
  },
  respawn(){
    const p=this.player;this.stopMeditation();p.buffTime=0;p.dead=false;p.hp=p.maxHp;p.mp=p.maxMp;p.x=PLAYER_SPAWN.x;p.y=PLAYER_SPAWN.y;
    p.cooldowns={attack:0,skill:0,heal:0,mana:0};p.attackAnim=0;p.skillAnim=0;p.pendingSkill=null;this.target=null;this.save();
  },
  moveEntity(entity,dx,dy){
    const nx=clamp(entity.x+dx,20,WORLD.width-20),ny=clamp(entity.y+dy,20,WORLD.height-20);
    if(isWalkable(nx,ny,this.mapId)){entity.x=nx;entity.y=ny;return}
    if(isWalkable(nx,entity.y,this.mapId))entity.x=nx;
    if(isWalkable(entity.x,ny,this.mapId))entity.y=ny;
  }
};
