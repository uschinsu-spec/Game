import {PLAYER_SPAWN,clampIntoWorld,isWalkable} from '../world.js';
import {floorNumber} from '../floors.js';
import {Engine,syncStats,npcRealmForFloor,npcMasteryCap,npcComboSkills} from '../cultivation.js';
import {distance,rand,NPC_TEMPLATES} from '../core/runtime.js';

export const NpcAiSystem = {
  ensureNPCs(){
    if(this.state.npcs)return;
    this.state.npcs=NPC_TEMPLATES.map(({sprite,name,skillElement},i)=>{
      const p=this.makePlayer();
      Object.assign(p,{id:`${this.mapId}-${sprite}`,name,sprite,
        isNPC:true,skillElement,realmIdx:npcRealmForFloor(floorNumber(this.mapId)),skillCooldowns:{},comboIndex:0,
        x:PLAYER_SPAWN.x+140+i*180,y:PLAYER_SPAWN.y+100+i*110,
        aiTarget:null,castTarget:null,patrol:null,stuckAge:0,detourTime:0,respawn:0});
      for(const sk of npcComboSkills(p))p.skillMastery[sk.id]=npcMasteryCap(p,sk.id);
      p.homeX=p.x;p.homeY=p.y;syncStats(p,true);return p;
    });
  },
  stepNPCs(dt){
    for(const p of this.state.npcs){
      if(p.dead){
        p.respawn-=dt;
        if(p.respawn<=0){p.dead=false;p.x=p.homeX;p.y=p.homeY;syncStats(p,true);p.hurt=0;p.aiTarget=null;p.castTarget=null;p.patrol=null;p.buffTime=0;
          p.attackAnim=0;p.skillAnim=0;p.pendingSkill=null;p.skillCooldowns={};p.comboIndex=0;p.cooldowns={attack:0,skill:0,heal:0}}
        continue;
      }
      this.tickCharacter(p,dt);
      if(p.realmIdx>0&&p.hp<p.maxHp*.45)this.heal(p);
      p.detourTime=Math.max(0,p.detourTime-dt);
      const claimed=new Set(this.state.npcs.filter(other=>other!==p&&!other.dead).map(other=>other.aiTarget).filter(e=>e&&!e.dead));
      if(p.detourTime===0&&(!p.aiTarget||p.aiTarget.dead||claimed.has(p.aiTarget)))p.aiTarget=this.findNPCTarget(p,claimed);
      if(p.castTarget!==p.aiTarget)p.castTarget=null;
      let goal=p.aiTarget;
      if(goal){
        this.faceEnemy(goal,p);
        if(p.attackAnim<=0&&p.skillAnim<=0){
          if(p.realmIdx>0)this.npcCombo(p,goal);
          else if(distance(p,goal)<=69)this.attack(p);
        }
      }else{
        if(!p.patrol||distance(p,p.patrol)<15){
          for(let tries=0;tries<12;tries++){
            const point=clampIntoWorld(p.homeX+rand(-350,350),p.homeY+rand(-250,250));
            if(isWalkable(point.x,point.y,this.mapId)){p.patrol=point;break}
          }
        }
        goal=p.patrol;
      }
      let dir={x:0,y:0};const d=goal?distance(p,goal):0;
      const range=p.aiTarget?this.npcAttackRange(p):0;
      const approach=p.aiTarget?range*.85:15;
      const retreat=p.aiTarget&&range>108?range*.65:0;
      const standing=p.aiTarget&&p.castTarget===p.aiTarget;
      if(!standing&&goal&&d>0&&(d>approach||d<retreat)&&p.attackAnim<=0&&p.skillAnim<=0){
        const sign=d<retreat?-1:1;
        dir={x:sign*(goal.x-p.x)/d,y:sign*(goal.y-p.y)/d};
      }
      const before={x:p.x,y:p.y};this.moveCharacter(p,dir,dt);
      p.stuckAge=p.walk&&distance(p,before)<.1?p.stuckAge+dt:0;
      if(p.stuckAge>.5){p.aiTarget=null;p.patrol=null;p.detourTime=1.5;p.stuckAge=0}
    }
  },
  npcAttackRange(p){
    if(p.realmIdx===0)return 69/.85;
    const deck=npcComboSkills(p);
    const ordered=deck.map((_,i)=>deck[(p.comboIndex+i)%deck.length]).filter(sk=>sk.type!=='buff'&&(sk.type!=='heal'||p.hp<=p.maxHp*.75));
    const sk=ordered.find(sk=>(p.skillCooldowns[sk.id]||0)<=0)||ordered[0];
    return sk?this.skillRange(sk):300;
  },
  npcCombo(p,target){
    if(p.cooldowns.skill>0||p.skillAnim>0)return;
    const deck=npcComboSkills(p);
    for(let offset=0;offset<deck.length;offset++){
      const index=(p.comboIndex+offset)%deck.length,sk=deck[index];
      const range=this.skillRange(sk);
      if((p.skillCooldowns[sk.id]||0)>0||p.mp<Engine.calcSkillMpCost(p,sk))continue;
      if(sk.type==='heal'&&p.hp>p.maxHp*.75)continue;
      if(sk.type==='buff'&&p.buffTime>0)continue;
      if(sk.type!=='buff'&&sk.type!=='heal'&&distance(p,target)>=range)continue;
      p.selectedSkillId=sk.id;
      if(this.skill(p)){p.comboIndex=(index+1)%deck.length;return}
    }
  },
  findNPCTarget(p,claimed){
    let nearest=null,min=Infinity;
    for(const enemy of this.state.enemies){
      if(enemy.dead||claimed.has(enemy))continue;
      const d=distance(p,enemy);
      if(d<min){min=d;nearest=enemy}
    }
    return nearest;
  }
};
