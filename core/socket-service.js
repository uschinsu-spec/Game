(()=>{'use strict';
class SocketService{
 constructor({scene=window.GameRuntime?.scene,rigAdapter=null,visualRoot=null,logger=window.GameCore?.logger}={}){Object.assign(this,{scene,rigAdapter,visualRoot,logger});this.sockets=new Map();this.diagnostics=[]}
 nodeForBone(b){return b?.getTransformNode?.()||b||null}
 create(name,{boneKey=null,parent=null,position={x:0,y:0,z:0},rotation={x:0,y:0,z:0}}={}){if(!this.scene)return null;const bone=boneKey?this.rigAdapter?.boneMap?.[boneKey]:null,resolved=this.nodeForBone(bone)||parent||this.visualRoot||null,node=new BABYLON.TransformNode(`Socket_${name}`,this.scene);node.parent=resolved;node.position.set(position.x||0,position.y||0,position.z||0);node.rotation.set(rotation.x||0,rotation.y||0,rotation.z||0);this.sockets.set(name,node);const fallback=!bone&&!!boneKey;this.diagnostics.push({name,boneKey,resolvedParent:resolved?.name||null,fallback});if(fallback)this.logger?.warn?.('ANIMATION',`Socket ${name} fallback: missing bone ${boneKey}`);return node}
 buildDefaults(){this.create('WeaponRight',{boneKey:'handR'});this.create('BackWeapon',{boneKey:'chest',position:{x:.18,y:.10,z:.14},rotation:{x:0,y:0,z:-.28}});this.create('Mount',{boneKey:'hips',position:{x:0,y:-.5,z:0}});return this}
 get(name){return this.sockets.get(name)||null}
 snapshot(){return this.diagnostics.map(x=>({...x}))}
 dispose(){for(const n of this.sockets.values())try{n.dispose()}catch(_){}this.sockets.clear()}
}
window.GameCore=window.GameCore||{};window.GameCore.SocketService=SocketService;
})();