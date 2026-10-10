import {SPECIES} from '../world.js';
import {Engine} from '../cultivation.js';
import {distance,rand} from '../core/runtime.js';
import {lootInfo} from '../core/beast-loot.js';

// Small ground footprints allow sprite edges to overlap while keeping bodies apart.
export function separateEnemies(game,dt){
  const enemies=game.state.enemies.filter(e=>!e.dead);
  const maxPush=90*dt;
  for(let pass=0;pass<3;pass++)for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++){
    const a=enemies[i],b=enemies[j];
    const spacing=(SPECIES[a.kind]?.separationRadius??22)+(SPECIES[b.kind]?.separationRadius??22);
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    if(d>=spacing)continue;
    // A stable direction also separates enemies spawned at exactly the same point.
    const angle=(i*2.399963229728653+j*.61803398875);
    const nx=d>1e-6?dx/d:Math.cos(angle),ny=d>1e-6?dy/d:Math.sin(angle);
    const push=Math.min((spacing-d)*.5,maxPush);
    game.moveEntity(a,-nx*push,-ny*push);
    game.moveEntity(b,nx*push,ny*push);
  }
}

export const WorldUpdateSystem = {
  stepEnemies(dt){
    const actors=[this.player,...this.state.npcs].filter(p=>!p.dead);
    for(const e of this.state.enemies){
      if(e.dead){e.respawn-=dt;if(e.respawn<=0){e.dead=false;e.damageContributors=null;e.hp=e.maxHp;e.x=e.homeX;e.y=e.homeY}continue}
      const nearest=actors.reduce((best,p)=>p.dead?best:!best||distance(e,p)<distance(e,best)?p:best,null);
      if(e.attackAnim>0&&(!e.victim||e.victim.dead)){e.attackAnim=0;e.attackAge=0;e.victim=null}
      const p=e.attackAnim>0?e.victim:nearest;
      if(!p){e.attackAnim=0;e.walk=false;continue}
      const spec=SPECIES[e.kind],d=distance(p,e);
      e.stun=Math.max(0,(e.stun||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
      if(e.stun>0){e.walk=false;continue}
      e.flinch=Math.max(0,e.flinch-dt);e.attackCD=Math.max(0,e.attackCD-dt);e.wander-=dt;
      if(e.attackAnim>0){
        e.attackAnim=Math.max(0,e.attackAnim-dt);e.attackAge+=dt;e.walk=false;
        if(!e.attackHit&&e.attackAge>=.24){
          e.attackHit=true;
          if(d<58&&!p.dead&&p.hurt<=.12&&e.attack>0){
            p.isMeditating=false;
            const raw=p.buffTime>0&&p.buffId==='tho_5'?0:Math.max(1,Math.ceil(e.attack-Engine.calcElementalDefense(p,'Vật Lý')));const amount=p.buffTime>0&&p.buffId==='profession_shield'?Math.max(1,Math.ceil(raw*.7)):raw;
            if(p.buffTime>0&&p.buffId==='tho_5')this.damageEnemy(e,e.attack,false,p);
            const adjusted=p.buffId==='profession_shield'&&p.buffTime>0?Math.max(1,Math.ceil(amount*(1-(p.professionShield||.2)))):amount;
             p.hp=Math.max(0,p.hp-adjusted);p.hurt=.25;
            this.floatText(p.x,p.y-70,'-'+adjusted,'#ff7772');
            if(p.hp<=0){
              p.dead=true;p.walk=false;p.attackAnim=0;p.skillAnim=0;
              if(p===this.player){this.auto=false;this.ui.dead();this.save()}else p.respawn=12;
            }
          }
        }
        continue;
      }
      let dx=0,dy=0;
      if(e.kind==='deer'){
        const homeDistance=Math.hypot(e.homeX-e.x,e.homeY-e.y);
        if(homeDistance>85)e.returning=true;
        else if(homeDistance<15){
          if(e.returning)e.wander=0;
          e.returning=false;
        }
      }
      if(e.kind!=='deer'&&(spec.seekActors||d<spec.aggro)&&d>37){dx=(p.x-e.x)/d;dy=(p.y-e.y)/d}
      else if(e.kind==='deer'?e.returning:(!spec.seekActors&&d>spec.aggro+140&&distance(e,{x:e.homeX,y:e.homeY})>25)){
        const homeD=Math.hypot(e.homeX-e.x,e.homeY-e.y);dx=(e.homeX-e.x)/homeD;dy=(e.homeY-e.y)/homeD;
      }else {
        if(e.wander<=0){e.wander=2+Math.random()*2.5;e.vx=rand(-.8,.8);e.vy=rand(-.7,.7)}
        if(e.kind==='deer'){dx=e.vx*.38;dy=e.vy*.38}
      }
      e.walk=Math.hypot(dx,dy)>.08;
      if(e.walk&&e.kind!=='deer')e.moveAge+=dt*7;
      if(e.walk){
        if(Math.abs(dx)>(e.kind==='deer'?.15:.04))e.face=dx>0?1:-1;
        const oldX=e.x,oldY=e.y;
        this.moveEntity(e,dx*spec.speed*dt*(e.slow>0?.45:1),dy*spec.speed*dt*(e.slow>0?.45:1));
        if(e.kind==='deer')e.moveAge+=Math.hypot(e.x-oldX,e.y-oldY)/8;
      }
      if(e.kind!=='deer'&&d<42&&e.attackCD<=0&&!p.dead){
        e.attackCD=1.3+Math.random()*.25;
        e.attackAnim=.6;e.attackAge=0;e.attackHit=false;e.walk=false;e.victim=p;
        if(p.x!==e.x)e.face=p.x>e.x?1:-1;
      }
    }
    separateEnemies(this,dt);
  },
  stepDrops(dt){
    let pickedByPlayer=false;
    this.state.drops=this.state.drops.filter(d=>{
      d.age=(d.age||0)+dt;d.spin+=dt*3;
      if(d.age<2)return true;
      const p=d.owner?this.state.npcs.find(p=>p.id===d.owner):this.player;
      if(!p)return true;
      const item=lootInfo(d.itemId),quantity=Math.max(0,Math.floor(d.quantity||0));
      if(item&&quantity){
        p.materials??={};
        p.materials[d.itemId]=(p.materials[d.itemId]||0)+quantity;
        if(p===this.player){
          pickedByPlayer=true;
          this.floatText(d.x,d.y-43,`+${quantity} ${item.name}`,item.color);
        }
      }
      return false;
    });
    if(pickedByPlayer)this.save();
  },
  floatText(x,y,text,color){this.state.texts.push({x,y,text,color,life:.95,max:.95,offset:rand(-10,10)})},
  stepEffects(dt){
    const existing=new Set(this.state.effects);
    this.stepSkillProjectiles(dt);
    this.state.effects=this.state.effects.filter(f=>{
      if(f.type==='skillProjectile')return !f.impacted;
      if(existing.has(f))f.life-=dt;
      return f.life>0;
    });
    this.state.texts=this.state.texts.filter(f=>(f.life-=dt)>0);
    if(this.tapMarker){this.tapMarker.life-=dt;if(this.tapMarker.life<=0)this.tapMarker=null}
  }
};
