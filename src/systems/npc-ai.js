import {PLAYER_SPAWN,clampIntoWorld,isWalkable} from '../world.js';
import {floorNumber} from '../floors.js';
import {Engine,syncStats,npcRealmForFloor,npcMasteryCap,npcComboSkills} from '../cultivation.js';
import {distance,rand,NPC_TEMPLATES} from '../core/runtime.js';

export const NpcAiSystem = {
  ensureNPCs(){
    if(floorNumber(this.mapId)===1){this.state.npcs=[];return}
    if(this.state.npcs){
      if(floorNumber(this.mapId)===2)for(const p of this.state.npcs){
        if(p.realmIdx!==0){p.realmIdx=0;p.attackAnim=0;p.skillAnim=0;p.pendingSkill=null;p.buffTime=0;p.buffId=null;p.skillCooldowns={};p.cooldowns={attack:0,skill:0,heal:0};syncStats(p,true)}
      }
      return;
    }
    this.state.npcs=NPC_TEMPLATES.map(({sprite,name,skillElement},i)=>{
      const p=this.makePlayer();
      Object.assign(p,{id:`${this.mapId}-${sprite}`,name,sprite,
        isNPC:true,skillElement,realmIdx:npcRealmForFloor(floorNumber(this.mapId)),skillCooldowns:{},comboIndex:0,
        x:PLAYER_SPAWN.x+140+i*180,y:PLAYER_SPAWN.y+100+i*110,
        aiTarget:null,patrol:null,stuckAge:0,detourTime:0,respawn:0});
      for(const sk of npcComboSkills(p))p.skillMastery[sk.id]=npcMasteryCap(p,sk.id);
      p.homeX=p.x;p.homeY=p.y;syncStats(p,true);return p;
    });
  },
  stepNPCs(dt){
    for(const p of this.state.npcs){
      if(p.dead){
        p.respawn-=dt;
        if(p.respawn<=0){
          p.dead=false;p.x=p.homeX;p.y=p.homeY;syncStats(p,true);p.hurt=0;p.aiTarget=null;
          p.patrol=null;p.buffTime=0;p.attackAnim=0;p.skillAnim=0;p.pendingSkill=null;
          p.skillCooldowns={};p.comboIndex=0;p.cooldowns={attack:0,skill:0,heal:0};
        }
        continue;
      }
      this.tickCharacter(p,dt);
      if(p.realmIdx>0&&p.hp<p.maxHp*.45)this.heal(p);
      p.detourTime=Math.max(0,p.detourTime-dt);

      // Both NPCs may attack the same nearest enemy. No target reservation or range check.
      p.aiTarget=p.realmIdx===0&&p.detourTime>0?null:this.findNPCTarget(p);
      const target=p.aiTarget;
      if(target){
        if(p.attackAnim<=0&&p.skillAnim<=0){
          this.faceEnemy(target,p);
          if(p.realmIdx>0)this.npcCombo(p,target);
          else if(distance(p,target)<=69)this.attack(p);
        }
      }else if(!p.patrol||distance(p,p.patrol)<15){
        for(let tries=0;tries<12;tries++){
          const point=clampIntoWorld(p.homeX+rand(-350,350),p.homeY+rand(-250,250));
          if(isWalkable(point.x,point.y,this.mapId)){p.patrol=point;break}
        }
      }

      // Cultivated NPCs cast in place immediately, regardless of enemy distance.
      // Mortal NPCs still need to approach within ordinary melee range.
      let dir={x:0,y:0};
      const goal=target||p.patrol;
      const d=goal?distance(p,goal):0;
      const range=target?69:15;
      if(goal&&d>range&&p.attackAnim<=0&&p.skillAnim<=0&&(!target||p.realmIdx===0)){
        dir={x:(goal.x-p.x)/d,y:(goal.y-p.y)/d};
      }
      const before={x:p.x,y:p.y};this.moveCharacter(p,dir,dt);
      p.stuckAge=p.walk&&distance(p,before)<.1?p.stuckAge+dt:0;
      if(p.stuckAge>.5){
        p.patrol=null;
        if(p.realmIdx===0)p.detourTime=1.5;
        p.stuckAge=0;
      }
    }
  },
  npcCombo(p,target){
    if(!target||target.dead||p.cooldowns.skill>0||p.skillAnim>0)return;
    const deck=npcComboSkills(p);
    for(let offset=0;offset<deck.length;offset++){
      const index=(p.comboIndex+offset)%deck.length,sk=deck[index];
      if((p.skillCooldowns[sk.id]||0)>0||p.mp<Engine.calcSkillMpCost(p,sk))continue;
      if(sk.type==='heal'&&p.hp>p.maxHp*.75)continue;
      if(sk.type==='buff'&&p.buffTime>0)continue;
      // NPC skills, including close-range/AOE tiers, target the nearest living enemy from anywhere.
      p.selectedSkillId=sk.id;
      if(this.skill(p)){p.comboIndex=(index+1)%deck.length;return}
    }
  },
  findNPCTarget(p){
    let nearest=null,min=Infinity;
    for(const enemy of this.state.enemies){
      if(enemy.dead)continue;
      const d=distance(p,enemy);
      if(d<min){min=d;nearest=enemy}
    }
    return nearest;
  }
};
