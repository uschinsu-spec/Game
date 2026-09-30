import { SUPREME_FACTIONS } from './core/supremeFactions.js';
import { PLAYER_SECT_FACTIONS } from './core/playerSects.js';
import { ALL_CONTINENT_POWERS } from './core/continentPowers.js';
import { SUPREME_RELATIONS } from './core/supremeRelations.js';
import { createCanonicalLocalFactionAtlas } from './core/canonicalLocalFactionAtlas.js?v=20260930-canonical-local-v2';
import { getJurisdictionBudget } from './hierarchy/jurisdictionBudgets.js';
import { buildInheritedPresences } from './hierarchy/factionPresence.js';
import { buildSiteFactionContext } from './hierarchy/siteControl.js';
import { buildTerritoryInfluenceBaseline, factionRelevanceScore } from './network/humanRealmInfluenceAtlas.js';
import { combineInfluence } from './network/factionInfluence.js';
import { resolveTerritoryControllers } from './network/territoryControllers.js';
import { relationFor, createRelation } from './network/factionDiplomacy.js';
import { indexBranches } from './network/factionBranches.js?v=20260930-canonical-local-v1';
import { planVassalsForTerritory } from './network/factionVassalPlanner.js';
import { BoundedFactionCache } from './runtime/factionCache.js';
import { RELATION_TYPES } from './core/factionConstants.js';

function canonicalBranchPresence(branch, jurisdictionId) {
  return Object.freeze({
    id: `presence.${branch.id}.${jurisdictionId}`,
    factionId: branch.parentFactionId,
    jurisdictionId,
    role: branch.markerLabel || branch.branchType || 'trú điểm',
    authority: Math.round(Math.max(0, Math.min(1, Number(branch.authority) || 0.5)) * 100),
    visibility: 'PUBLIC',
    branchLike: true,
    canonical: true,
    branchId: branch.id,
    mapNodeId: branch.mapNodeId || branch.territoryId
  });
}

export class HumanRealmFactionNetwork {
  constructor({worldSeed='linh-son-phi-kiem-v5',worldAdapter,playerSects=PLAYER_SECT_FACTIONS,coreFactions=[],branches=[],vassals=[],relations=[],assets=[]}={}){
    this.worldSeed=worldSeed;
    this.worldAdapter=worldAdapter;
    this.factions=new Map();
    this.dynamicFactions=new Map();
    this.rootPresenceFactions=Object.freeze([...SUPREME_FACTIONS,...ALL_CONTINENT_POWERS,...playerSects,...coreFactions]);
    this.canonicalAtlas=createCanonicalLocalFactionAtlas({worldAdapter});
    for(const f of [...this.rootPresenceFactions,...this.canonicalAtlas.factions])this.factions.set(f.id,f);
    const branchById=new Map([...this.canonicalAtlas.branches,...branches].map(branch=>[branch.id,branch]));
    this.branches=[...branchById.values()];
    this.branchIndex=indexBranches(this.branches);
    this.vassals=[...vassals];
    this.relations=[...SUPREME_RELATIONS,...relations];
    this.assets=[...assets];
    this.jurisdictionCache=new BoundedFactionCache(96);
    this.influenceCache=new BoundedFactionCache(96);
    this.siteCache=new BoundedFactionCache(96);
    this.vassalCache=new BoundedFactionCache(96);
    this.branchCache=new BoundedFactionCache(96);
    this.dynamicWorldState=null;
  }
  getFaction(id){return this.factions.get(id)||this.dynamicFactions.get(id)||null;}
  registerDynamicFaction(faction){if(!faction?.id)throw new Error('[FACTION V5] dynamic faction requires stable id');if(this.factions.has(faction.id))throw new Error(`[FACTION V5] duplicate faction id ${faction.id}`);this.dynamicFactions.set(faction.id,faction);return faction;}
  unregisterDynamicFaction(id){if(this.factions.has(id))return false;return this.dynamicFactions.delete(id);}
  setDynamicWorldState(worldState){this.dynamicWorldState=worldState||null;this.influenceCache.clear();return this.dynamicWorldState;}
  invalidateDynamicTerritory(){this.influenceCache.clear();this.siteCache.clear();}
  getAllCoreFactions(){return Object.freeze([...this.factions.values()]);}
  getAllKnownFactions(){return Object.freeze([...this.factions.values(),...this.dynamicFactions.values()]);}
  getCanonicalFactionAtlasStats(){return this.canonicalAtlas.stats;}
  getJurisdiction(id){return this.worldAdapter?.getJurisdiction?.(id)||null;}
  listJurisdictionChildren(id,opts){return this.worldAdapter?.getChildren?.(id,opts)||Object.freeze([]);}
  getLocalFactionsForJurisdiction(id){
    const j=this.getJurisdiction(id);if(!j)return Object.freeze([]);
    const key=`canonical-local:${id}`;const cached=this.jurisdictionCache.get(key);if(cached)return cached;
    return this.jurisdictionCache.set(key,this.canonicalAtlas.getFactionsForJurisdiction(id));
  }
  getInheritedPresencesForJurisdiction(id,{limit}={}){
    const j=this.getJurisdiction(id);if(!j)return Object.freeze([]);
    const budget=getJurisdictionBudget(j.type,this.worldAdapter?.getImportance?.(id)||1);
    const base=buildInheritedPresences({factions:this.rootPresenceFactions,jurisdiction:j,limit:limit||budget.presence});
    const fixedBranches=(this.branchIndex.byMapNode.get(id)||[]).map(branch=>canonicalBranchPresence(branch,id));
    const byFaction=new Map();
    for(const presence of [...fixedBranches,...base])if(!byFaction.has(presence.factionId))byFaction.set(presence.factionId,presence);
    return Object.freeze([...byFaction.values()].slice(0,Math.max(1,limit||budget.presence)));
  }
  getFactionsForJurisdiction(id,{limit=24}={}){
    const j=this.getJurisdiction(id);if(!j)return Object.freeze([]);
    const locals=this.getLocalFactionsForJurisdiction(id);
    const presences=this.getInheritedPresencesForJurisdiction(id,{limit});
    const byId=new Map();for(const f of locals)byId.set(f.id,f);for(const p of presences){const f=this.getFaction(p.factionId);if(f)byId.set(f.id,f);}
    return Object.freeze([...byId.values()].slice(0,Math.max(1,limit)));
  }
  _territoryIdForJurisdiction(id){const j=this.getJurisdiction(id);return this.worldAdapter?.getTerritory?.(id)?.id||j?.territoryId||this.worldAdapter?.getTerritoryForWorldNode?.(id)?.id||id;}
  _controllersWithOverrides(territoryId,influence){const base={...resolveTerritoryControllers(influence)};for(const field of Object.keys(base)){const override=this.dynamicWorldState?.getOverride?.('territory',territoryId,field);if(override)base[field]=override.value;}return Object.freeze(base);}
  getJurisdictionInfluence(id){
    const cached=this.influenceCache.get(id);if(cached)return cached;const j=this.getJurisdiction(id);if(!j)return Object.freeze([]);
    const territoryId=this._territoryIdForJurisdiction(id);const branches=this.ensureBranchesForTerritory(territoryId);const vassals=this.ensureVassalsForTerritory(territoryId);
    const byId=new Map(this.getFactionsForJurisdiction(id,{limit:24}).map(f=>[f.id,f]));
    for(const branch of branches){const f=this.getFaction(branch.parentFactionId);if(f)byId.set(f.id,f);}
    for(const link of vassals){for(const factionId of [link.overlordId,link.vassalId]){const f=this.getFaction(factionId);if(f)byId.set(f.id,f);}}
    for(const key of this.dynamicWorldState?.influenceDeltas?.keys?.()||[]){const prefix=`${territoryId}:`;if(!key.startsWith(prefix))continue;const f=this.getFaction(key.slice(prefix.length));if(f)byId.set(f.id,f);}
    const baseline=buildTerritoryInfluenceBaseline({...j,id:territoryId},[...byId.values()],{branches,vassals});
    const inf=Object.freeze(baseline.map(entry=>Object.freeze({...entry,influence:combineInfluence(entry.influence,this.dynamicWorldState?.influenceDeltas?.get?.(`${territoryId}:${entry.factionId}`)||{})})));
    return this.influenceCache.set(id,inf);
  }
  getJurisdictionFactionContext(id,{presenceLimit=12}={}){const j=this.getJurisdiction(id);if(!j)return null;const factions=this.getFactionsForJurisdiction(id,{limit:Math.max(12,presenceLimit+8)});const influence=this.getJurisdictionInfluence(id);const controllers=this._controllersWithOverrides(this._territoryIdForJurisdiction(id),influence);const presences=this.getInheritedPresencesForJurisdiction(id,{limit:presenceLimit});return Object.freeze({jurisdiction:j,factions,presences,influence,controllers,powerProfile:this.getJurisdictionPowerProfile(id)});}
  getJurisdictionPowerProfile(id){const j=this.getJurisdiction(id);if(!j)return null;const influence=this.getJurisdictionInfluence(id);const top=[...influence].sort((a,b)=>factionRelevanceScore(b)-factionRelevanceScore(a)).slice(0,8);return Object.freeze({jurisdictionId:id,jurisdictionType:j.type,top:Object.freeze(top),controllers:this._controllersWithOverrides(this._territoryIdForJurisdiction(id),influence)});}
  getFactionContextForWorldNode(nodeId){const j=this.worldAdapter?.resolveJurisdictionForNode?.(nodeId);if(!j)return null;const parent=this.getJurisdictionFactionContext(j.id);const site=this.worldAdapter?.getSite?.(nodeId);return site?buildSiteFactionContext({site,parentContext:parent}):parent;}
  getFactionsForTerritory(territoryId){const j=this.worldAdapter?.getTerritory?.(territoryId);return j?this.getFactionsForJurisdiction(j.id,{limit:28}):Object.freeze([]);}
  getInfluenceForTerritory(territoryId){const j=this.worldAdapter?.getTerritory?.(territoryId);return j?this.getJurisdictionInfluence(j.id):Object.freeze([]);}
  getRelevantFactionsForTerritory(territoryId,{limit=12}={}){const factions=this.getFactionsForTerritory(territoryId),byId=new Map(factions.map(f=>[f.id,f]));for(const branch of this.ensureBranchesForTerritory(territoryId)){const f=this.getFaction(branch.parentFactionId);if(f)byId.set(f.id,f);}return Object.freeze([...this.getInfluenceForTerritory(territoryId)].sort((a,b)=>factionRelevanceScore(b)-factionRelevanceScore(a)).slice(0,Math.max(1,Math.min(20,limit))).map(e=>byId.get(e.factionId)).filter(Boolean));}
  getFactionMapMarkersForWorldNode(nodeId,{limit=8}={}){
    const jurisdiction=this.worldAdapter?.resolveJurisdictionForNode?.(nodeId)||this.worldAdapter?.getJurisdiction?.(nodeId);
    const territory=this.worldAdapter?.getTerritoryForWorldNode?.(nodeId)||this.worldAdapter?.getTerritory?.(nodeId);
    let raw=territory?this.canonicalAtlas.getMapMarkersForTerritory(territory.id):(jurisdiction?this.canonicalAtlas.getMapMarkersForJurisdiction(jurisdiction.id):Object.freeze([]));
    if(territory&&String(nodeId)!==String(territory.id)){
      const direct=raw.filter(marker=>String(marker.worldNodeId)===String(nodeId));
      const headquarters=raw.filter(marker=>marker.markerType==='FACTION_HQ'&&String(marker.worldNodeId)===String(territory.id));
      raw=[...direct,...headquarters,...raw.filter(marker=>!direct.includes(marker)&&!headquarters.includes(marker))];
    }
    const tierWeight={SUPREME:6,OVERLORD:5,MAJOR:4,MEDIUM:3,MINOR:2,LOCAL:1};
    return Object.freeze(raw.map(marker=>Object.freeze({...marker,faction:this.getFaction(marker.factionId),branch:marker.branchId?this.branchIndex.byId.get(marker.branchId)||null:null})).filter(marker=>marker.faction).sort((a,b)=>{const directA=String(a.worldNodeId)===String(nodeId)?1:0,directB=String(b.worldNodeId)===String(nodeId)?1:0;if(directA!==directB)return directB-directA;const tier=(tierWeight[b.powerTier]||0)-(tierWeight[a.powerTier]||0);if(tier)return tier;return String(a.label).localeCompare(String(b.label),'vi');}).slice(0,Math.max(1,Math.min(16,limit))));
  }
  getTerritoryControllers(id){return this._controllersWithOverrides(id,this.getInfluenceForTerritory(id));}
  getFactionRelation(a,b){const found=relationFor(this.relations,a,b);if(found)return found;const fa=this.getFaction(a),fb=this.getFaction(b);const same=fa&&fb&&fa.continentIds?.some(x=>fb.continentIds?.includes(x));return createRelation({a,b,type:RELATION_TYPES.NEUTRAL,trust:0,respect:same?20:0});}
  getFactionBranches(id){return Object.freeze([...(this.branchIndex.byParent.get(id)||[])]);}
  getBranchesForJurisdiction(id){return Object.freeze([...(this.branchIndex.byMapNode.get(id)||this.branchIndex.byTerritory.get(id)||[])]);}
  ensureBranchesForTerritory(id){const cached=this.branchCache.get(id);if(cached)return cached;const territory=this.worldAdapter?.getTerritory?.(id);if(!territory)return Object.freeze([]);return this.branchCache.set(id,Object.freeze([...(this.branchIndex.byTerritory.get(territory.id)||[])]));}
  ensureBranchesForJurisdiction(id){const territory=this.worldAdapter?.getTerritory?.(id)||this.worldAdapter?.resolveJurisdictionForNode?.(id);return territory?this.ensureBranchesForTerritory(territory.id):Object.freeze([]);}
  getFactionVassals(id){return Object.freeze(this.vassals.filter(v=>v.overlordId===id));}
  getFactionAssets(id){return Object.freeze(this.assets.filter(a=>a.factionId===id));}
  ensureVassalsForTerritory(id){const cached=this.vassalCache.get(id);if(cached)return cached;const t=this.worldAdapter?.getTerritory?.(id);if(!t)return Object.freeze([]);const local=this.getLocalFactionsForJurisdiction(t.id);const overlords=this.getInheritedPresencesForJurisdiction(t.id,{limit:8}).map(p=>this.getFaction(p.factionId)).filter(Boolean);const links=planVassalsForTerritory({territory:t,localFactions:local,candidateOverlords:overlords,worldSeed:this.worldSeed});for(const v of links)if(!this.vassals.some(x=>x.overlordId===v.overlordId&&x.vassalId===v.vassalId))this.vassals.push(v);return this.vassalCache.set(id,links);}
  hasTerritoryBlueprint(id){return Boolean(this.worldAdapter?.getTerritory?.(id));}
  clearCaches(){this.jurisdictionCache.clear();this.influenceCache.clear();this.siteCache.clear();this.vassalCache.clear();this.branchCache.clear();}
}
