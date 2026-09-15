(()=>{'use strict';
class CombatStateSystem{
 constructor(events,clock,balance){this.events=events;this.clock=clock;this.balance=balance;this.lastHostile=new Map()}
 mark(entityId,otherEntityId=null){const id=String(entityId),now=this.clock?.now?.()||0,was=this.isInCombat(id);this.lastHostile.set(id,{at:now,otherEntityId});if(!was)this.events?.emit('combat:entered',{entityId:id,otherEntityId,at:now})}
 isInCombat(entityId){const r=this.lastHostile.get(String(entityId));if(!r)return false;return(this.clock?.now?.()||0)-r.at<(this.balance?.combatExitDelay||5)}
 update(){const now=this.clock?.now?.()||0,delay=this.balance?.combatExitDelay||5;for(const[id,r]of[...this.lastHostile])if(now-r.at>=delay){this.lastHostile.delete(id);this.events?.emit('combat:exited',{entityId:id,at:now})}}
 clear(entityId){const id=String(entityId);if(this.lastHostile.delete(id))this.events?.emit('combat:exited',{entityId:id,forced:true})}
}
window.GameCore=window.GameCore||{};window.GameCore.CombatStateSystem=CombatStateSystem;window.GameCore.combatState=window.GameCore.combatState||new CombatStateSystem(window.GameCore.events,window.GameCore.clock,window.GameCore.combatBalance);window.GameCore.tickScheduler?.register?.('FAST',()=>window.GameCore.combatState.update(),{owner:'CombatStateSystem',label:'combat-state'});
})();