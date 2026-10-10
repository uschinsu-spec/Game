import {skillVfxRow,skillColor} from '../skill-vfx.js';
import {Engine,SKILLS,trainSkill,npcMasteryCap} from '../cultivation.js';
import {clamp,distance,rand} from '../core/runtime.js';
import {combatTempo} from '../core/combat-tempo.js';

export const CombatSystem = {
  skillRange(sk){return sk.type==='melee'?108:(sk.type==='aoe'||sk.type==='heal')?sk.radius:300},
  findNearest(range,p=this.player){
    let min=range,found=null;
    for(const e of this.state.enemies){if(e.dead)continue;const d=distance(p,e);
      if(d<min){min=d;found=e}}
    return found;
  },
  combatTarget(range,p=this.player){
    if(p!==this.player)return p.aiTarget&&!p.aiTarget.dead&&distance(p,p.aiTarget)<range?p.aiTarget:null;
    const selected=this.target?.kind==='enemy'
      ?this.state.enemies.find(e=>e.id===this.target.id&&!e.dead):null;
    return selected&&distance(this.player,selected)<range?selected:this.findNearest(range);
  },
  faceEnemy(enemy,p=this.player){
    if(!enemy)return;
    const dx=enemy.x-p.x;
    if(dx!==0)p.face=dx>0?1:-1;
  },
  attack(p=this.player){
    if(p.isNPC&&p.realmIdx>0)return;
    if(p.cooldowns.attack>0||p.attackAnim>0||p.skillAnim>0||p.dead)return;
    const tempo=combatTempo(p);
    p.isMeditating=false;p.cooldowns.attack=tempo.attackInterval;
    p.attackDuration=tempo.attackDuration;p.attackHitTime=tempo.attackHitTime;
    p.attackAnim=p.attackDuration;p.attackAge=0;p.attackHit=false;p.walk=false;
    const near=this.combatTarget(108,p);
    this.faceEnemy(near,p);
  },
  doAttackHit(p=this.player){
    let hits=0;
    for(const e of this.state.enemies){if(e.dead)continue;
      const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
      if(d<108&&Math.abs(dy)<80&&dx*p.face>-24){this.hitEnemy(e,'basic_attack',p);hits++}
    }
    this.state.effects.push({type:'slash',x:p.x+p.face*45,y:p.y-17,face:p.face,life:.3,max:.3});
    if(hits)trainSkill(p,'basic_attack');
    if(!hits)this.state.effects.push({type:'spark',x:p.x+p.face*75,y:p.y-12,life:.2,max:.2});
  },
  hitEnemy(e,id,p=this.player,skillImpact=false){
    if(e.dead)return;
    if(p.isNPC)p.skillMastery[id]=Math.min(p.skillMastery[id]||0,Math.max(0,npcMasteryCap(p,id)));
    const hit=Engine.resolveCombat(p,e,id);
    const resisted=Math.random()<clamp(Number(e.controlResistance)||0,0,.9);
    if(!resisted&&hit.status==='stun')e.stun=1.2;
    if(!resisted&&hit.status==='slow')e.slow=2.5;
    this.damageEnemy(e,hit.damage,hit.isCrit,p,skillImpact);
    if(skillImpact)this.state.effects.push({type:'skillImpact',x:e.x,y:e.y-24,color:skillColor(hit.skill),life:.38,max:.38});
  },
  launchSkill(p,sk,target){
    const tempo=combatTempo(p,sk.id);
    const x=p.x+p.face*16,y=p.y-36;
    this.state.effects.push({
      type:'skillProjectile',row:skillVfxRow(sk),actor:p,skill:sk,target,
      x,y,angle:Math.atan2(target.y-24-y,target.x-x),age:0,life:3,max:3,
      startX:x,startY:y,speed:tempo.projectileSpeed,vfxFps:tempo.vfxFps,
      impacted:false
    });
  },
  stepSkillProjectiles(dt){
    for(const f of this.state.effects){
      if(f.type!=='skillProjectile'||f.impacted)continue;
      if(f.target.dead||f.actor.dead){f.life=0;f.impacted=true;continue}
      const tx=f.target.x,ty=f.target.y-24,dx=tx-f.x,dy=ty-f.y,d=Math.hypot(dx,dy);
      f.age+=dt;f.life=Math.max(0,f.max-f.age);f.angle=Math.atan2(dy,dx);
      if(d>0){const step=Math.min(d,f.speed*dt);f.x+=dx/d*step;f.y+=dy/d*step}
      if(d<=f.speed*dt||f.age>=f.max){
        f.impacted=true;f.life=0;
        if(f.skill.type==='aoe'){
          for(const e of this.state.enemies)if(!e.dead&&distance(e,f.target)<f.skill.radius)this.hitEnemy(e,f.skill.id,f.actor,true);
        }else this.hitEnemy(f.target,f.skill.id,f.actor,true);
      }
    }
  },
  /** Called by the animation clock at its release frame, never from render(). */
  releaseSkill(p){
    const cast=p.pendingSkill;
    if(!cast)return;
    p.pendingSkill=null;
    const {sk,target,area}=cast;
    const flying=sk.tier===1&&target&&skillVfxRow(sk)!==undefined;
    if(flying){
      if(!target.dead)this.launchSkill(p,sk,target);
    }else if(sk.type==='buff'){
      p.buffTime=sk.duration;p.buffId=sk.id;
      if(p===this.player)this.toast(sk.name+' · '+sk.duration+' giây');
    }else if(area){
      for(const e of this.state.enemies)if(!e.dead&&distance(e,p)<this.skillRange(sk))this.hitEnemy(e,sk.id,p);
    }else if(target&&!target.dead)this.hitEnemy(target,sk.id,p);
    if(sk.healPct)p.hp=Math.min(p.maxHp,p.hp+Math.floor(p.maxHp*sk.healPct));
    if(!flying)this.state.effects.push({type:'wave',x:target?.x??p.x,y:(target?.y??p.y)-16,life:.5,max:.5});
  },
  skill(p=this.player){
    const sk=SKILLS.find(s=>s.id===p.selectedSkillId),notify=message=>{if(p===this.player)this.toast(message)};
    if(p.dead||p.attackAnim>0||p.skillAnim>0)return;
    if(!sk||sk.minRealm>p.realmIdx){notify('Đột phá Luyện Khí Tầng 1 để mở thần thông.');return}
    if(p.isNPC&&sk.elem!==p.skillElement)return;
    const cost=Engine.calcSkillMpCost(p,sk);
    if(p.cooldowns.skill>0||(p.isNPC&&(p.skillCooldowns[sk.id]||0)>0))return;
    if(p.mp<cost){notify('Không đủ linh lực');return}
    const area=sk.type==='aoe'||sk.type==='heal';
    const range=this.skillRange(sk),target=this.combatTarget(range,p);
    if(sk.type!=='buff'&&sk.type!=='heal'&&!target){notify('Không có mục tiêu trong tầm thi triển');return}
    if(p.isNPC)p.skillMastery[sk.id]=Math.min(p.skillMastery[sk.id]||0,Math.max(0,npcMasteryCap(p,sk.id)));
    p.isMeditating=false;this.faceEnemy(target,p);p.cooldowns.skill=p.isNPC?.65:sk.cd;
    if(p.isNPC)p.skillCooldowns[sk.id]=sk.cd;
    p.mp-=cost;
    const tempo=combatTempo(p,sk.id);
    p.skillDuration=tempo.skillDuration;p.skillAnim=tempo.skillDuration;p.skillAge=0;
    p.skillReleaseAge=p.skillDuration*tempo.releaseRatio;
    p.pendingSkill={sk,target,area};p.walk=false;
    if(p.isNPC&&target&&sk.type!=='buff')p.castTarget=target;
    trainSkill(p,sk.id);
    return true;
  },
  heal(p=this.player){
    const cost=Math.ceil(p.maxMp*.12);if(p.cooldowns.heal>0||p.dead)return;if(p.mp<cost){if(p===this.player)this.ui.toast('Không đủ linh lực để hồi máu');return}
    if(p.hp>=p.maxHp-3){if(p===this.player)this.ui.toast('Sinh lực đã đầy');return}
    p.mp-=cost;p.cooldowns.heal=12;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.32);
    this.state.effects.push({type:'heal',x:p.x,y:p.y-16,life:.8,max:.8});
    this.floatText(p.x,p.y-64,'+ HỒI MÁU','#91ffc9');
  },
  damageEnemy(e,amount,crit=false,actor=this.player,skillImpact=false){
    if(e.dead)return;e.hp=Math.max(0,e.hp-Math.round(amount));e.flinch=.16;
    this.floatText(e.x,e.y-57,(crit?'BẠO KÍCH ':'-')+Math.round(amount),crit?'#fff09b':'#ffb35a');
    if(!skillImpact)this.state.effects.push({type:'impact',x:e.x,y:e.y-21,life:.21,max:.21});
    if(e.hp<=0)this.kill(e,actor);
  },
  kill(e,p=this.player){
    e.dead=true;e.attackAnim=0;e.attackAge=0;e.respawn=12+Math.random()*8;
    if(e.kind==='wolf')p.kills++;
    // Killing monsters grants only drops/materials/gold, NEVER cultivation EXP.
    this.state.drops.push({x:e.x+rand(-9,9),y:e.y,gold:e.gold,owner:p===this.player?null:p.id,life:13,spin:Math.random()*6});
    if(e.kind==='deer'||Math.random()<.22)this.state.drops.push({x:e.x+rand(-13,13),y:e.y+12,herb:1,owner:p===this.player?null:p.id,life:14,spin:0});
    if(p===this.player&&p.kills===10)this.ui.toast('Đã hoàn thành: Đánh bại 10 Yêu Lang!');
  }
};
