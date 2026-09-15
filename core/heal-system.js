(()=>{'use strict';
class HealSystem{
 constructor({health,stats,events}={}){this.health=health;this.stats=stats;this.events=events;this.serial=0}
 resolve(req={}){const requestId=req.requestId||`heal_${++this.serial}`,target=String(req.targetEntityId||''),h=this.health.get(target);if(!target||!h||!h.alive)return{ok:false,requestId,reason:'INVALID_TARGET'};const source=req.sourceEntityId?String(req.sourceEntityId):null,ss=source?this.stats.get(source):{},ts=this.stats.get(target);let amount=Math.max(0,Number(req.baseAmount)||0);amount*=1+(Number(ss.healingDone)||0);amount*=1+(Number(ts.healingTaken)||0);const before=h.currentHP,snap=this.health.applyHeal(target,amount),applied=(snap?.currentHP||before)-before,result={ok:true,requestId,sourceEntityId:source,targetEntityId:target,requested:amount,applied,currentHP:snap.currentHP,maxHP:snap.maxHP};this.events?.emit('heal:resolved',result);return result}
}
window.GameCore=window.GameCore||{};window.GameCore.HealSystem=HealSystem;window.GameCore.heal=window.GameCore.heal||new HealSystem({health:window.GameCore.health,stats:window.GameCore.stats,events:window.GameCore.events});
})();