(()=>{'use strict';
class StatSystem{
 constructor(logger){this.logger=logger;this.records=new Map()}
 register(entityId,{base={},provider=null}={}){this.records.set(String(entityId),{base:{...base},provider});return()=>this.records.delete(String(entityId))}
 unregister(entityId){return this.records.delete(String(entityId))}
 get(entityId){
  const r=this.records.get(String(entityId)); const dynamic=r?.provider?.()||{};
  const s={...(r?.base||{}),...dynamic};
  return{maxHP:Math.max(1,Number(s.maxHP)||100),maxMana:Math.max(0,Number(s.maxMana)||100),defense:Math.max(0,Number(s.defense)||0),attack:Math.max(0,Number(s.attack)||0),critChance:Math.max(0,Math.min(1,Number(s.critChance)||0)),critMultiplier:Math.max(1,Number(s.critMultiplier)||1.5),resistances:{PHYSICAL:0,METAL:0,WOOD:0,WATER:0,FIRE:0,EARTH:0,WIND:0,LIGHTNING:0,...(s.resistances||{})},damageBonuses:{...(s.damageBonuses||{})},healingDone:Number(s.healingDone)||0,healingTaken:Number(s.healingTaken)||0}
 }
}
window.GameCore=window.GameCore||{};window.GameCore.StatSystem=StatSystem;window.GameCore.stats=window.GameCore.stats||new StatSystem(window.GameCore.logger);
})();