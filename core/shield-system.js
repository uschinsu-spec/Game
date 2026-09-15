(()=>{'use strict';
class ShieldSystem{
 constructor(events,clock){this.events=events;this.clock=clock;this.byEntity=new Map();this.serial=0}
 add(entityId,{amount,type='ALL',priority=0,duration=null,sourceEntityId=null,tags=[]}={}){amount=Math.max(0,Number(amount)||0);if(!amount)return null;const id=`shield_${++this.serial}`,now=this.clock?.now?.()||0,s={id,entityId:String(entityId),amount,type,priority:Number(priority)||0,sourceEntityId,tags:[...tags],expiresAt:duration==null?null:now+Math.max(0,Number(duration)||0)};if(!this.byEntity.has(s.entityId))this.byEntity.set(s.entityId,[]);this.byEntity.get(s.entityId).push(s);this.events?.emit('shield:changed',{entityId:s.entityId});return{...s}}
 purge(entityId,now=this.clock?.now?.()||0){const id=String(entityId),a=this.byEntity.get(id)||[],b=a.filter(s=>s.amount>0&&(s.expiresAt==null||s.expiresAt>now));if(b.length)this.byEntity.set(id,b);else this.byEntity.delete(id);return b}
 absorb(entityId,amount,damageType='PHYSICAL'){let remaining=Math.max(0,Number(amount)||0),absorbed=0;const shields=this.purge(entityId).filter(s=>s.type==='ALL'||s.type===damageType).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));for(const s of shields){if(!remaining)break;const take=Math.min(s.amount,remaining);s.amount-=take;remaining-=take;absorbed+=take}this.purge(entityId);if(absorbed)this.events?.emit('shield:changed',{entityId:String(entityId),absorbed});return{remaining,absorbed}}
 clear(entityId){this.byEntity.delete(String(entityId));this.events?.emit('shield:changed',{entityId:String(entityId),cleared:true})}
 snapshot(entityId){return this.purge(entityId).map(s=>({...s}))}
}
window.GameCore=window.GameCore||{};window.GameCore.ShieldSystem=ShieldSystem;window.GameCore.shields=window.GameCore.shields||new ShieldSystem(window.GameCore.events,window.GameCore.clock);
})();