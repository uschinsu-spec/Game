(()=>{'use strict';
class EnvironmentRenderer{
 constructor({scene=window.GameRuntime?.scene,manifest=window.GameServices?.assetManifest}={}){Object.assign(this,{scene,manifest});this.builders=new Map()}
 builder(id){if(this.builders.has(id))return this.builders.get(id);const d=this.manifest?.builder?.(id),Ctor=this.manifest?.resolveGlobal?.(d?.global);if(!Ctor)throw new Error(`WORLD_BUILDER_MISSING:${id}`);const b=new Ctor(this.scene);this.builders.set(id,b);return b}
 async buildChunk(zone,ctx){const b=this.builder(zone.builder);return await Promise.resolve(b.buildChunk({zone,...ctx}))}
 dispose(){for(const b of this.builders.values())b.dispose?.();this.builders.clear()}
}
window.GameCore=window.GameCore||{};window.GameCore.EnvironmentRenderer=EnvironmentRenderer;window.GameCore.environmentRenderer=window.GameCore.environmentRenderer||new EnvironmentRenderer();window.GameServices=Object.assign(window.GameServices||{},{environmentRenderer:window.GameCore.environmentRenderer});
})();