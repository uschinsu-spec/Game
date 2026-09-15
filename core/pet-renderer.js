(()=>{'use strict';
class PetRenderer{
 constructor({pets=window.GameServices?.pets,events=window.GameServices?.events,scene=window.GameRuntime?.scene,player=window.GameRuntime?.player}={}){Object.assign(this,{pets,events,scene,player});this.visuals=new Map();events?.on?.('pet:deployed',d=>this.attach(d.petId),{owner:'PetRenderer'});events?.on?.('pet:withdrawn',d=>this.detach(d.petId),{owner:'PetRenderer'});events?.on?.('pet:downed',d=>this.setDown(d.petId,true),{owner:'PetRenderer'});events?.on?.('pet:revived',d=>this.setDown(d.petId,false),{owner:'PetRenderer'});const p=pets?.deployed?.();if(p)this.attach(p.petId)}
 attach(id){if(!this.scene||typeof BABYLON==='undefined'||this.visuals.has(id))return this.visuals.get(id)||null;const p=this.pets.get(id),def=p&&window.GameCore.petCatalog.DEFINITIONS[p.definitionId];if(!p||!def)return null;const root=new BABYLON.TransformNode(`PetRoot_${id}`,this.scene),mat=new BABYLON.StandardMaterial(`PetMat_${id}`,this.scene);mat.diffuseColor=p.definitionId==='loi_vu_dieu'?new BABYLON.Color3(.55,.72,1):new BABYLON.Color3(.45,.85,.8);mat.emissiveColor=mat.diffuseColor.scale(.16);const body=BABYLON.MeshBuilder.CreateSphere(`PetBody_${id}`,{diameter:.65,segments:10},this.scene);body.parent=root;body.position.y=.42;body.material=mat;const head=BABYLON.MeshBuilder.CreateSphere(`PetHead_${id}`,{diameter:.42,segments:10},this.scene);head.parent=root;head.position.set(0,.67,-.28);head.material=mat;root.metadata={petId:id,entityId:id};const pp=this.player?.position||{x:0,y:0,z:0};root.position.set(pp.x-1.2,pp.y+.1,pp.z+.8);this.visuals.set(id,{root,body,head,mat,dispose(){root.dispose();mat.dispose()}});this.events?.emit?.('pet:renderAttached',{petId:id});return this.visuals.get(id)}
 detach(id){const v=this.visuals.get(id);if(!v)return false;v.dispose();this.visuals.delete(id);return true}
 get(id){return this.visuals.get(String(id))||null}
 positionOf(id){return this.get(id)?.root?.position||null}
 setPosition(id,p){const r=this.get(id)?.root;if(!r||!p)return false;r.position.set(p.x,p.y??r.position.y,p.z);return true}
 face(id,dx,dz){const r=this.get(id)?.root;if(!r||Math.hypot(dx,dz)<.001)return;r.rotation.y=Math.atan2(dx,dz)}
 setDown(id,v){const x=this.get(id);if(x)x.root.scaling.y=v?.55:1}
 dispose(){this.events?.disposeOwner?.('PetRenderer');for(const id of [...this.visuals.keys()])this.detach(id)}
}
window.GameCore=window.GameCore||{};window.GameCore.PetRenderer=PetRenderer;window.GameCore.petRenderer=window.GameCore.petRenderer||new PetRenderer();window.GameServices=Object.assign(window.GameServices||{},{petRenderer:window.GameCore.petRenderer});
})();
