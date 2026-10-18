(() => {
  "use strict";
  const B=window.BABYLON,CFG=window.PlayerConfig;
  class PlayerVisual{
    constructor(scene){
      this.scene=scene;this.root=new B.TransformNode("player_visualRoot",scene);this.root.scaling.setAll(CFG.visual.scale||1);
      this.root.metadata={playerHeightCm:CFG.anthropometry?.heightCm||175,eyeHeightCm:CFG.anthropometry?.eyeHeightCm||164,worldUnitsPerMeter:CFG.units?.worldUnitsPerMeter||1};
      this.parts=[];this.materials=this._materials();this.rig=new window.PlayerRig(scene,this.root);this.sockets=this._collectSockets();
      this.animator=new window.PlayerAnimator(this.rig);this.equipment=new window.PlayerEquipmentSystem(scene,this);this.state="Idle";
      this.isGlbLoaded=false;this.glbModelRoot=null;this.animGroups={};this.activeAg=null;this.fadingOutAgs=[];this.currentGlbAnim=null;
    }
    _color(hex){return B.Color3.FromHexString(hex);}
    _material(slot,hex,{metallic=0,roughness=.65,emissive=null}={}){
      let m;if(B.PBRMaterial){m=new B.PBRMaterial(`player_${slot}`,this.scene);m.albedoColor=this._color(hex);m.metallic=metallic;m.roughness=roughness;if(emissive)m.emissiveColor=this._color(emissive);}
      else{m=new B.StandardMaterial(`player_${slot}`,this.scene);m.diffuseColor=this._color(hex);m.specularColor=new B.Color3(.18,.18,.18);if(emissive)m.emissiveColor=this._color(emissive);}
      m.metadata={playerTextureSlot:slot};const path=CFG.textureSlots?.[slot];
      if(path){
        const tex=new B.Texture(path,this.scene);
        tex.wrapU=B.Texture.WRAP_ADDRESS_MODE;tex.wrapV=B.Texture.WRAP_ADDRESS_MODE;
        tex.uScale=1.5;tex.vScale=1.5;
        if("albedoTexture" in m){m.albedoTexture=tex;if(emissive&&slot==='weapon')m.emissiveTexture=tex;}
        else{m.diffuseTexture=tex;if(emissive&&slot==='weapon')m.emissiveTexture=tex;}
      }
      return m;
    }
    _materials(){const p=CFG.palette;return{
      skin:this._material("skin",p.skin,{roughness:.65}),skinShadow:this._material("skinShadow",p.skinShadow,{roughness:.72}),hair:this._material("hair",p.hair,{roughness:.78}),
      cloth:this._material("cloth",p.cloth,{roughness:.68}),clothDark:this._material("clothDark",p.clothDark,{roughness:.75}),clothAccent:this._material("clothAccent",p.clothAccent,{roughness:.55}),armor:this._material("armor",p.armor,{metallic:.45,roughness:.32}),armorDark:this._material("armorDark",p.armorDark,{metallic:.5,roughness:.35}),
      metal:this._material("metal",p.metal,{metallic:.85,roughness:.18}),gold:this._material("gold",p.gold,{metallic:.75,roughness:.24}),leather:this._material("leather",p.leather,{roughness:.85}),boot:this._material("boot",p.boot,{roughness:.70}),
      eye:this._material("eye",p.eye,{roughness:.15,emissive:p.eye}),magic:this._material("magic",p.magic,{roughness:.15,emissive:p.magic}),
      weapon:this._material("weapon",p.metal,{metallic:.88,roughness:.15,emissive:p.magic}),
      jade:this._material("jade",p.jade,{roughness:.25,emissive:p.jade}),
      ruby:this._material("ruby",p.ruby,{roughness:.20,emissive:p.ruby})
    };}
    _collectSockets(){const out={};for(const n of CFG.sockets)out[n]=this.rig.getSocket(n);return out;}
    getSocket(name){return this.sockets[name]||null;}
    _part(type,name,opts,pos,mat,parent,rot=null,scale=null,slot=null){const x=B.MeshBuilder[type](`player_${name}`,opts,this.scene);x.parent=parent;x.position.copyFrom(pos);if(rot)x.rotation.copyFrom(rot);if(scale)x.scaling.copyFrom(scale);x.material=mat;x.isPickable=false;x.metadata={playerPart:name,playerSlot:slot,textureSlot:mat?.metadata?.playerTextureSlot||null};this.parts.push(x);return x;}

    async _loadGlbModel(){
      const path=CFG.visual?.modelPath||"./assets/player/models/player_male.glb";
      const lastSlash=Math.max(path.lastIndexOf("/"),path.lastIndexOf("\\"));
      const rootUrl=lastSlash>=0?path.substring(0,lastSlash+1):"./";
      const filename=lastSlash>=0?path.substring(lastSlash+1):path;

      const r=await B.SceneLoader.ImportMeshAsync("",rootUrl,filename,this.scene);
      if(!r||!r.meshes||r.meshes.length===0)return false;

      const modelRoot=new B.TransformNode("player_glb_root",this.scene);
      modelRoot.parent=this.root;
      // All glTF characters face -Z by default; rotate Math.PI so character faces +Z (movement forward)
      modelRoot.rotation.set(0, Math.PI, 0);

      for(const m of r.meshes){
        if(m.parent==null)m.parent=modelRoot;
        m.isPickable=false;
        m.metadata={...(m.metadata||{}),isPlayerMesh:true};
        this.parts.push(m);
      }

      this.glbModelRoot=modelRoot;
      this.isGlbLoaded=true;
      this.isPerformingAction=false;

      // Disable procedural rig root so no procedural geometry or bones render
      if(this.rig?.root){
        this.rig.root.setEnabled(false);
      }
      for(let i=this.parts.length-1;i>=0;i--){
        const p=this.parts[i];
        if(p && !p.metadata?.isPlayerMesh){
          try{p.dispose(false,true);}catch{}
          this.parts.splice(i,1);
        }
      }

      // Cleanly register animation groups
      this.animGroups={};
      if(r.animationGroups){
        for(const ag of r.animationGroups){
          ag.stop();
          this.animGroups[ag.name]=ag;
        }
      }

      // Map sockets for either Bip01 (YJQY) or mixamorig (Mixamo)
      if(r.skeletons&&r.skeletons.length>0){
        const skel=r.skeletons[0];
        const boneMap=isMixamo ? {
          weaponSocket:"mixamorig:RightHand",offhandSocket:"mixamorig:LeftHand",
          headSocket:"mixamorig:Head",backSocket:"mixamorig:Spine2",
          vfxHandR:"mixamorig:RightHand",vfxHandL:"mixamorig:LeftHand",
          vfxFootR:"mixamorig:RightFoot",vfxFootL:"mixamorig:LeftFoot"
        } : {
          weaponSocket:"Bip01 R Hand",offhandSocket:"Bip01 L Hand",
          headSocket:"Bip01 Head",backSocket:"Bip01 Spine1",
          vfxHandR:"Bip01 R Hand",vfxHandL:"Bip01 L Hand",
          vfxFootR:"Bip01 R Foot",vfxFootL:"Bip01 L Foot"
        };
        for(const [sName,bName] of Object.entries(boneMap)){
          const bone=skel.bones.find(b=>b.name===bName);
          if(bone){
            const sNode=new B.TransformNode(`player_socket_${sName}`,this.scene);
            if(sNode.attachToBone&&r.meshes[0])sNode.attachToBone(bone,r.meshes[0]);
            this.sockets[sName]=sNode;
          }
        }
      }

      this._playGlbAnim("Idle", true);
      return true;
    }

    _playGlbAnim(name, loop = true, onEnd = null){
      if(!this.isGlbLoaded)return;
      const nextAg=this.animGroups[name];
      if(!nextAg)return;

      if(this.currentGlbAnim===name&&this.activeAg?.isPlaying)return;

      if(this.activeAg&&this.activeAg!==nextAg){
        this.activeAg.stop();
      }

      nextAg.onAnimationEndObservable.clear();
      if(onEnd){
        nextAg.onAnimationEndObservable.addOnce(onEnd);
      }

      nextAg.start(loop, 1.0, nextAg.from, nextAg.to, false);
      this.activeAg=nextAg;
      this.currentGlbAnim=name;
    }

    async load(){
      let glbLoaded=false;
      if(CFG.visual?.useGlbModel&&B.SceneLoader?.ImportMeshAsync){
        try{glbLoaded=await this._loadGlbModel();}
        catch(err){console.warn("[PlayerVisual] Load GLB failed, fallback to procedural:",err);}
      }
      if(!glbLoaded){
        await this.equipment.equipLoadout();
      }
      this.setState("Respawn");
    }

    async equip(slot,itemId){return this.equipment.equip(slot,itemId);}
    async unequip(slot){return this.equipment.unequip(slot);}
    getLoadout(){return this.equipment.getLoadout();}
    listEquipment(slot){return this.equipment.list(slot);}

    setState(state, context = null){
      this.state=state;
      if(this.isGlbLoaded){
        let actionAnim=null;
        if(state==="Attack1"&&(this.animGroups["Attack1"]||this.animGroups["Attack"])){
          actionAnim=this.animGroups["Attack1"]?"Attack1":"Attack";
        }else if(state==="Attack2"&&(this.animGroups["Attack2"]||this.animGroups["Attack"])){
          actionAnim=this.animGroups["Attack2"]?"Attack2":"Attack";
        }else if(state==="Attack3"&&(this.animGroups["Attack3"]||this.animGroups["Attack"])){
          actionAnim=this.animGroups["Attack3"]?"Attack3":"Attack";
        }else if((state.startsWith("Cast")||state==="Skill")&&(this.animGroups["Skill"]||this.animGroups["Attack3"])){
          actionAnim=this.animGroups["Skill"]?"Skill":"Attack3";
        }else if(state==="Hit"&&this.animGroups["Hit"]){
          actionAnim="Hit";
        }else if(state==="Death"&&this.animGroups["Death"]){
          actionAnim="Death";
        }else if(state==="Jump"&&this.animGroups["Jump"]){
          actionAnim="Jump";
        }

        if(actionAnim){
          this.isPerformingAction=true;
          this._playGlbAnim(actionAnim, actionAnim==="Death"?false:false, ()=>{
            this.isPerformingAction=false;
            this.currentGlbAnim=null;
          });
        }
      }
      this.animator.trigger(state, context);
    }

    setLocomotion(state){
      this.state=state;
      this.animator.setLocomotion(state);
    }

    update(dt,moving,speedNorm=0,locomotionContext=null){
      this.animator.setLocomotion(moving?(speedNorm>.60?"Run":"Walk"):"Idle");
      this.animator.update(dt,speedNorm,locomotionContext);
      this.state=this.animator.state;

      if(this.isGlbLoaded){
        if(this.isPerformingAction&&this.activeAg?.isPlaying){
          return;
        }
        this.isPerformingAction=false;

        let targetAnim="Idle";
        if(moving){
          const strafeX=locomotionContext?.strafeX||0;
          const strafeZ=locomotionContext?.strafeZ!==undefined?locomotionContext.strafeZ:1;
          if(speedNorm>0.85&&this.animGroups["Sprint"]){
            targetAnim="Sprint";
          }else if(speedNorm>0.40){
            if(strafeZ<-0.4&&this.animGroups["Run_Back"])targetAnim="Run_Back";
            else if(strafeX<-0.5&&this.animGroups["Run_Left"])targetAnim="Run_Left";
            else if(strafeX>0.5&&this.animGroups["Run_Right"])targetAnim="Run_Right";
            else if(this.animGroups["Run_Forward"])targetAnim="Run_Forward";
            else if(this.animGroups["Run"])targetAnim="Run";
            else targetAnim="Walk";
          }else{
            if(strafeZ<-0.4&&this.animGroups["Walk_Back"])targetAnim="Walk_Back";
            else if(strafeX<-0.5&&this.animGroups["Walk_Left"])targetAnim="Walk_Left";
            else if(strafeX>0.5&&this.animGroups["Walk_Right"])targetAnim="Walk_Right";
            else if(this.animGroups["Walk_Forward"])targetAnim="Walk_Forward";
            else if(this.animGroups["Walk"])targetAnim="Walk";
            else if(this.animGroups["Run"])targetAnim="Run";
          }
        }

        this._playGlbAnim(targetAnim, true);
        if(this.activeAg&&moving){
          const baseRatio=targetAnim==="Sprint"?1.25:(targetAnim.toLowerCase().includes("run")?1.05:0.95);
          this.activeAg.speedRatio=Math.max(0.65,speedNorm*baseRatio*1.15);
        }
      }
    }
  }
  window.PlayerVisual=PlayerVisual;
})();
