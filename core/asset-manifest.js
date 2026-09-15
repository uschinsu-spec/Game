(()=>{'use strict';
const manifest=Object.freeze({
 builders:Object.freeze({enhancedWorld:Object.freeze({id:'enhancedWorld',kind:'ZONE_BUILDER',global:'EnhancedWorldZoneAssetBuilder'})}),
 textures:Object.freeze({grass:Object.freeze({id:'grass',global:'GRASS_LUSH_TEXTURE'})})
});
class AssetManifest{constructor(data=manifest){this.data=data}builder(id){return this.data.builders[id]||null}texture(id){return this.data.textures[id]||null}resolveGlobal(name){return name?window[name]:null}}
window.GameCore=window.GameCore||{};window.GameCore.assetManifest=new AssetManifest();window.GameServices=Object.assign(window.GameServices||{},{assetManifest:window.GameCore.assetManifest});
})();