(() => {
  "use strict";
  const B=window.BABYLON,CFG=window.PlayerConfig;
  class PlayerEquipmentSystem{
    constructor(scene,visual){this.scene=scene;this.visual=visual;this.rig=visual.rig;this.active=new Map();this.loadout={};}
    _assertSlot(slot){if(!CFG.equipmentSlots.includes(slot))throw new Error(`Player equipment slot không hợp lệ: ${slot}`);}
    _disposeEntry(entry){if(!entry)return;for(const n of entry.nodes||[]){try{if(n&&!n.isDisposed?.())n.dispose(false,true);}catch{}}if(entry.dispose)try{entry.dispose();}catch{}}
    async unequip(slot){this._assertSlot(slot);const old=this.active.get(slot);this._disposeEntry(old);this.active.delete(slot);this.loadout[slot]=null;return true;}
    async equip(slot,itemId){
      this._assertSlot(slot);if(!itemId)return this.unequip(slot);
      const def=window.PlayerPartRegistry?.get(itemId);if(!def)throw new Error(`Không tìm thấy Player part: ${itemId}`);
      if(def.slot!==slot)throw new Error(`${itemId} thuộc slot ${def.slot}, không phải ${slot}`);
      await this.unequip(slot);
      let entry;
      if(def.type==="procedural"||!def.type)entry=await this._buildProcedural(def);
      else if(def.type==="glb-rigid")entry=await this._loadRigidGlb(def);
      else throw new Error(`Player part type chưa hỗ trợ: ${def.type}`);
      this.active.set(slot,{...entry,definition:def});this.loadout[slot]=itemId;return true;
    }
    async _buildProcedural(def){
      if(this.visual?.isGlbLoaded) {
        // Skinned GLB character is active: do not generate procedural body parts over the 3D model!
        return {nodes:[]};
      }
      const created=[];
      const part=(type,name,opts,pos,mat,parent,rot=null,scale=null)=>{
        const x=this.visual._part(type,name,opts,pos,mat,parent,rot,scale,def.slot);created.push(x);return x;
      };
      const extra=await def.build?.({scene:this.scene,rig:this.rig,materials:this.visual.materials,part,visual:this.visual,B});
      return {nodes:[...created,...(extra?.nodes||[])]};
    }
    async _loadRigidGlb(def){
      if(!B.SceneLoader?.ImportMeshAsync)throw new Error("Babylon SceneLoader chưa sẵn sàng");
      const mount=this.rig.getSocket(def.mount||"backSocket")||this.rig.root;
      const r=await B.SceneLoader.ImportMeshAsync("",def.rootUrl||"",def.fileName,this.scene);
      const root=new B.TransformNode(`player_equipment_${def.id}`,this.scene);root.parent=mount;
      for(const m of r.meshes||[]){if(m.parent==null)m.parent=root;m.isPickable=false;m.metadata={...(m.metadata||{}),playerSlot:def.slot,playerPartId:def.id};}
      if(def.position)root.position.set(...def.position);if(def.rotation)root.rotation.set(...def.rotation);if(def.scale)root.scaling.set(...def.scale);
      return {nodes:[root,...(r.meshes||[])],dispose:()=>{for(const a of r.animationGroups||[])a.dispose?.();}};
    }
    async equipLoadout(loadout){
      const target={...CFG.defaultLoadout,...(loadout||{})};
      for(const slot of CFG.equipmentSlots)await this.equip(slot,target[slot]??null);
      return this.getLoadout();
    }
    get(slot){return this.active.get(slot)?.definition||null;}
    getLoadout(){return {...this.loadout};}
    list(slot){this._assertSlot(slot);return window.PlayerPartRegistry.list(slot);}
  }
  window.PlayerEquipmentSystem=PlayerEquipmentSystem;
})();
