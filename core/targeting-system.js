(()=>{'use strict';
class TargetingSystem{
 constructor(){this.current=new Map()}
 nearest(entityId,candidates,positionOf,maxDistance=Infinity){const origin=positionOf(entityId);if(!origin)return null;let best=null,bestD=maxDistance*maxDistance;for(const c of candidates||[]){if(!c||c.entityId===entityId)continue;const p=positionOf(c.entityId);if(!p)continue;const dx=p.x-origin.x,dz=p.z-origin.z,d=dx*dx+dz*dz;if(d<bestD){bestD=d;best=c.entityId}}if(best)this.current.set(String(entityId),best);return best}
 set(entityId,targetId){if(targetId==null)this.current.delete(String(entityId));else this.current.set(String(entityId),String(targetId))}
 get(entityId){return this.current.get(String(entityId))||null}
 clearInvalid(isValid){for(const[id,t]of[...this.current])if(!isValid(t))this.current.delete(id)}
}
window.GameCore=window.GameCore||{};window.GameCore.TargetingSystem=TargetingSystem;window.GameCore.targeting=window.GameCore.targeting||new TargetingSystem();window.GameServices=Object.assign(window.GameServices||{}, {targeting:window.GameCore.targeting});
})();