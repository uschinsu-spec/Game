(()=>{'use strict';
class EnemyEntityRegistry{
 constructor({events=window.GameServices?.events,health=window.GameServices?.health,stats=window.GameServices?.stats}={}){Object.assign(this,{events,health,stats});this.map=new Map();this.serial=0}
 create(template,{zoneId='unknown',subZoneId='unknown',spawnPointId=null,home={x:0,y:0,z:0},metadata={}}={}){const id=`enemy_${++this.serial}_${template.enemyId}`;const e={entityId:id,template,zoneId,subZoneId,spawnPointId,home:{...home},position:{...home},state:'SPAWN',threat:new Map(),targetEntityId:null,renderer:null,alive:true,spawnedAt:window.GameServices?.clock?.now?.()||0,deadAt:null,respawnAt:null,metadata:{...metadata}};this.map.set(id,e);this.stats?.register?.(id,{base:{maxHP:template.stats.maxHP,attack:template.stats.attack,defense:template.stats.defense,moveSpeed:template.stats.moveSpeed,critChance:0,resistances:{}}});this.health?.register?.(id,{currentHP:template.stats.maxHP,maxHP:template.stats.maxHP,majorRealmIndex:template.majorRealmIndex,minorRealmIndex:template.minorRealmIndex,kind:template.role==='boss'?'BOSS':'ENEMY',metadata:{enemyEntity:e}});this.events?.emit?.('enemy:entityCreated',{entityId:id,templateId:template.id,zoneId,subZoneId});return e}
 get(id){return this.map.get(String(id))||null}
 all(){return[...this.map.values()]}
 alive(zoneId=null){return this.all().filter(e=>e.alive&&(!zoneId||e.zoneId===zoneId))}
 remove(id,{reason='REMOVED',disposeRenderer=true}={}){const e=this.get(id);if(!e)return false;if(disposeRenderer)try{e.renderer?.dispose?.()}catch(_){}this.map.delete(e.entityId);this.health?.unregister?.(e.entityId);this.stats?.unregister?.(e.entityId);this.events?.emit?.('enemy:entityRemoved',{entityId:e.entityId,reason,zoneId:e.zoneId});return true}
 clearZone(zoneId){let n=0;for(const e of this.all())if(e.zoneId===zoneId){this.remove(e.entityId,{reason:'ZONE_UNLOAD'});n++}return n}
 markDead(id){const e=this.get(id);if(!e||!e.alive)return false;e.alive=false;e.state='DEAD';e.deadAt=window.GameServices?.clock?.now?.()||0;return true}
}
window.GameCore=window.GameCore||{};window.GameCore.EnemyEntityRegistry=EnemyEntityRegistry;window.GameCore.enemyEntities=window.GameCore.enemyEntities||new EnemyEntityRegistry();window.GameServices=Object.assign(window.GameServices||{},{enemyEntities:window.GameCore.enemyEntities});
})();