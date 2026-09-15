(()=>{'use strict';
class InputSystem{
 constructor(events){this.events=events;this.moveSources=new Map();this.zoomIntent=null;this.commands=[];this.pointerOwners=new Map()}
 setMoveSource(source,x=0,z=0,magnitude=null){x=Number(x)||0;z=Number(z)||0;let m=magnitude==null?Math.hypot(x,z):Math.max(0,Math.min(1,Number(magnitude)||0));const l=Math.hypot(x,z);if(l>1){x/=l;z/=l}this.moveSources.set(String(source),{x,z,magnitude:Math.min(1,m)});this.events?.emit?.('input:moveChanged',{source:String(source),intent:this.getMoveIntent()})}
 clearMoveSource(source){this.moveSources.delete(String(source));this.events?.emit?.('input:moveChanged',{source:String(source),intent:this.getMoveIntent()})}
 getMoveIntent(){let x=0,z=0,sources=[];for(const[k,v]of this.moveSources){if(v.magnitude<=0)continue;x+=v.x*v.magnitude;z+=v.z*v.magnitude;sources.push(k)}let m=Math.hypot(x,z);if(m>1){x/=m;z/=m;m=1}return{x,z,magnitude:m,source:sources.join('+')||'NONE'}}
 setZoomIntent(intent){this.zoomIntent=intent?{...intent}:null;if(intent)this.events?.emit?.('input:zoomChanged',this.zoomIntent)}
 consumeZoomIntent(){const z=this.zoomIntent;this.zoomIntent=null;return z}
 pushCommand(type,payload={}){const c={type:String(type),payload,timestamp:performance.now()};this.commands.push(c);this.events?.emit?.('input:command',c);return c}
 consumeCommands(){return this.commands.splice(0)}
 claimPointer(id,owner){if(this.pointerOwners.has(id))return false;this.pointerOwners.set(id,String(owner));return true}
 releasePointer(id){this.pointerOwners.delete(id)}
 getPointerOwner(id){return this.pointerOwners.get(id)||null}
 reset(){this.moveSources.clear();this.zoomIntent=null;this.commands.length=0;this.pointerOwners.clear();this.events?.emit?.('input:reset',{})}
}
window.GameCore=window.GameCore||{};window.GameCore.InputSystem=InputSystem;window.GameCore.input=window.GameCore.input||new InputSystem(window.GameCore.events);window.GameServices=Object.assign(window.GameServices||{},{input:window.GameCore.input});
})();