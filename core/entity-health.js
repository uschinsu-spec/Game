(()=>{'use strict';
class EntityHealthSystem{
 constructor(events,stats,logger){this.events=events;this.stats=stats;this.logger=logger;this.records=new Map()}
 register(entityId,{currentHP=null,maxHP=null,majorRealmIndex=0,minorRealmIndex=0,alive=true,kind='GENERIC',metadata=null}={}){const id=String(entityId),statMax=this.stats?.get(id)?.maxHP||100,mx=Math.max(1,Number(maxHP)||statMax),rec={entityId:id,currentHP:Math.max(0,Math.min(mx,currentHP==null?mx:Number(currentHP)||0)),maxHP:mx,majorRealmIndex:Math.max(0,Number(majorRealmIndex)||0),minorRealmIndex:Math.max(0,Number(minorRealmIndex)||0),alive:!!alive,kind,metadata};this.records.set(id,rec);this.events?.emit('health:registered',{...rec});return rec}
 ensure(entityId,opts={}){return this.records.get(String(entityId))||this.register(entityId,opts)}
 unregister(entityId){const id=String(entityId),v=this.records.get(id);this.records.delete(id);return v}
 get(entityId){return this.records.get(String(entityId))||null}
 snapshot(entityId){const r=this.get(entityId);return r?{...r}:null}
 setRealm(entityId,majorRealmIndex,minorRealmIndex=0){const r=this.get(entityId);if(!r)return false;r.majorRealmIndex=Math.max(0,Number(majorRealmIndex)||0);r.minorRealmIndex=Math.max(0,Number(minorRealmIndex)||0);return true}
 syncMax(entityId){const r=this.get(entityId);if(!r)return null;const next=Math.max(1,this.stats?.get(entityId)?.maxHP||r.maxHP),ratio=r.maxHP>0?r.currentHP/r.maxHP:1;r.maxHP=next;r.currentHP=Math.min(next,Math.max(0,ratio*next));return this.snapshot(entityId)}
 applyDamage(entityId,amount){const r=this.get(entityId);if(!r||!r.alive)return null;const a=Math.max(0,Number(amount)||0);r.currentHP=Math.max(0,r.currentHP-a);if(r.currentHP<=0)r.alive=false;return this.snapshot(entityId)}
 applyHeal(entityId,amount){const r=this.get(entityId);if(!r||!r.alive)return null;r.currentHP=Math.min(r.maxHP,r.currentHP+Math.max(0,Number(amount)||0));return this.snapshot(entityId)}
 revive(entityId,{hpRatio=1}={}){const r=this.get(entityId);if(!r)return null;r.alive=true;r.currentHP=Math.max(1,Math.min(r.maxHP,r.maxHP*Math.max(0,Math.min(1,hpRatio))));return this.snapshot(entityId)}
}
window.GameCore=window.GameCore||{};window.GameCore.EntityHealthSystem=EntityHealthSystem;window.GameCore.health=window.GameCore.health||new EntityHealthSystem(window.GameCore.events,window.GameCore.stats,window.GameCore.logger);
})();