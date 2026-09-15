(()=>{'use strict';
class SpatialQuery{
 constructor({rt=window.GameRuntime,entities=window.GameServices?.enemyEntities,health=window.GameServices?.health}={}){Object.assign(this,{rt,entities,health})}
 positionOf(entityId){if(entityId==='player')return this.rt?.player?.position||null;const e=this.entities?.get?.(entityId);if(!e)return null;return e.renderer?.root?.position||e.position||null}
 enemiesNear(origin,radius=20){if(!origin)return[];const r2=radius*radius,out=[];for(const e of this.entities?.alive?.()||[]){const h=this.health?.get?.(e.entityId);if(!h?.alive)continue;const p=e.renderer?.root?.position||e.position;if(!p)continue;const dx=p.x-origin.x,dz=p.z-origin.z,d2=dx*dx+dz*dz;if(d2<=r2)out.push({entityId:e.entityId,enemy:e,monster:e,position:p,distanceSq:d2})}return out}
 inCircle(origin,radius){return this.enemiesNear(origin,radius)}
 inLine(origin,dir,length,width=1){const out=[];for(const e of this.enemiesNear(origin,length+width)){const dx=e.position.x-origin.x,dz=e.position.z-origin.z,forward=dx*dir.x+dz*dir.z;if(forward<0||forward>length)continue;const side=Math.abs(dx*dir.z-dz*dir.x);if(side<=width)out.push(e)}return out}
}
window.GameCore=window.GameCore||{};window.GameCore.SpatialQuery=SpatialQuery;window.GameCore.spatialQuery=new SpatialQuery();window.GameServices=Object.assign(window.GameServices||{},{spatialQuery:window.GameCore.spatialQuery});
})();