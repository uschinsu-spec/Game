(()=>{'use strict';
class AlchemySystem{
 constructor({jobs=window.GameServices?.craftJobs,inventory=window.GameServices?.inventory,items=window.GameServices?.items,catalog=window.GameCore?.phase10Catalog}={}){Object.assign(this,{jobs,inventory,items,catalog});jobs?.registerHandler?.('ALCHEMY',{validate:(j,r)=>({ok:j.outcome.success?this.inventory.hasSpace(1):true,reason:'INVENTORY_FULL'}),apply:(j,r)=>{if(!j.outcome.success)return{ok:true,success:false,reason:'ALCHEMY_FAILED_SAFE'};const item=this.items.createInstance(r.output.baseId,{seed:j.seed,quality:j.outcome.quality,grade:r.output.grade,bound:false,metadata:{pillGrade:r.output.grade,craftedBy:'ALCHEMY'}});const a=this.inventory.addInstanceDirect(item);return a.ok?{ok:true,success:true,item}:{ok:false,reason:a.reason}}})}
 start(recipeId,station,metadata={}){const r=this.catalog.RECIPES[recipeId];if(r?.system!=='ALCHEMY')return{ok:false,reason:'NOT_ALCHEMY_RECIPE'};return this.jobs.start(recipeId,{station,metadata})}
 claim(id){return this.jobs.claim(id)}
 recipes(){return Object.values(this.catalog.RECIPES).filter(r=>r.system==='ALCHEMY')}
}
window.GameCore=window.GameCore||{};window.GameCore.AlchemySystem=AlchemySystem;window.GameCore.alchemy=window.GameCore.alchemy||new AlchemySystem();window.GameServices=Object.assign(window.GameServices||{},{alchemy:window.GameCore.alchemy});
})();