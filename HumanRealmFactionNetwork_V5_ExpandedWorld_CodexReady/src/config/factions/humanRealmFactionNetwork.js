import { SUPREME_FACTIONS } from './core/supremeFactions.js';
import { PLAYER_SECT_FACTIONS } from './core/playerSects.js';
import { ALL_CONTINENT_POWERS } from './core/continentPowers.js';
import { SUPREME_RELATIONS } from './core/supremeRelations.js';
import { generateJurisdictionFactions } from './hierarchy/jurisdictionFactionGenerator.js';
import { getJurisdictionBudget } from './hierarchy/jurisdictionBudgets.js';
import { buildInheritedPresences } from './hierarchy/factionPresence.js';
import { buildSiteFactionContext } from './hierarchy/siteControl.js';
import { buildTerritoryInfluenceBaseline, factionRelevanceScore } from './network/humanRealmInfluenceAtlas.js';
import { resolveTerritoryControllers } from './network/territoryControllers.js';
import { relationFor, createRelation } from './network/factionDiplomacy.js';
import { indexBranches } from './network/factionBranches.js';
import { planVassalsForTerritory } from './network/factionVassalPlanner.js';
import { BoundedFactionCache } from './runtime/factionCache.js';
import { RELATION_TYPES } from './core/factionConstants.js';

export class HumanRealmFactionNetwork {
  constructor({worldSeed='linh-son-phi-kiem-v5',worldAdapter,playerSects=PLAYER_SECT_FACTIONS,coreFactions=[],branches=[],vassals=[],relations=[],assets=[]}={}){
    this.worldSeed=worldSeed;this.worldAdapter=worldAdapter;this.factions=new Map();this.dynamicFactions=new Map();
    for(const f of [...SUPREME_FACTIONS,...ALL_CONTINENT_POWERS,...playerSects,...coreFactions])this.factions.set(f.id,f);
    this.branches=[...branches];this.branchIndex=indexBranches(this.branches);this.vassals=[...vassals];this.relations=[...SUPREME_RELATIONS,...relations];this.assets=[...assets];
    this.jurisdictionCache=new BoundedFactionCache(96);this.influenceCache=new BoundedFactionCache(96);this.siteCache=new BoundedFactionCache(96);this.vassalCache=new BoundedFactionCache(96);
  }
  getFaction(id){return this.factions.get(id)||this.dynamicFactions.get(id)||null;}
  getAllCoreFactions(){return Object.freeze([...this.factions.values()]);}
  getAllKnownFactions(){return Object.freeze([...this.factions.values(),...this.dynamicFactions.values()]);}
  _register(list){for(const f of list||[])this.dynamicFactions.set(f.id,f);return list||[];}
  getJurisdiction(id){return this.worldAdapter?.getJurisdiction?.(id)||null;}
  listJurisdictionChildren(id,opts){return this.worldAdapter?.getChildren?.(id,opts)||Object.freeze([]);}
  getLocalFactionsForJurisdiction(id){const j=this.getJurisdiction(id);if(!j)return Object.freeze([]);const key=`local:${id}`;const cached=this.jurisdictionCache.get(key);if(cached)return cached;const local=this._register(generateJurisdictionFactions({worldSeed:this.worldSeed,jurisdiction:j,importance:this.worldAdapter?.getImportance?.(id)||1}));return this.jurisdictionCache.set(key,local);}
  getInheritedPresencesForJurisdiction(id,{limit}={}){const j=this.getJurisdiction(id);if(!j)return Object.freeze([]);const budget=getJurisdictionBudget(j.type,this.worldAdapter?.getImportance?.(id)||1);const candidates=[...this.factions.values()];const ancestors=this.worldAdapter?.getAncestors?.(id,true)||[];for(const a of ancestors){for(const f of this.getLocalFactionsForJurisdiction(a.id))candidates.push(f);}return buildInheritedPresences({factions:candidates,jurisdiction:j,limit:limit||budget.presence});}
  getFactionsForJurisdiction(id,{limit=24}={}){const j=this.getJurisdiction(id);if(!j)return Object.freeze([]);const locals=this.getLocalFactionsForJurisdiction(id);const presences=this.getInheritedPresencesForJurisdiction(id,{limit});const byId=new Map();for(const f of locals)byId.set(f.id,f);for(const p of presences){const f=this.getFaction(p.factionId);if(f)byId.set(f.id,f);}return Object.freeze([...byId.values()].slice(0,Math.max(1,limit)));}
  getJurisdictionInfluence(id){const cached=this.influenceCache.get(id);if(cached)return cached;const j=this.getJurisdiction(id);if(!j)return Object.freeze([]);const factions=this.getFactionsForJurisdiction(id,{limit:24});const inf=buildTerritoryInfluenceBaseline({...j,id:j.id},factions,{branches:[],vassals:[]});return this.influenceCache.set(id,inf);}
  getJurisdictionFactionContext(id,{presenceLimit=12}={}){const j=this.getJurisdiction(id);if(!j)return null;const factions=this.getFactionsForJurisdiction(id,{limit:Math.max(12,presenceLimit+8)});const influence=this.getJurisdictionInfluence(id);const controllers=resolveTerritoryControllers(influence);const presences=this.getInheritedPresencesForJurisdiction(id,{limit:presenceLimit});return Object.freeze({jurisdiction:j,factions,presences,influence,controllers,powerProfile:this.getJurisdictionPowerProfile(id)});}
  getJurisdictionPowerProfile(id){const j=this.getJurisdiction(id);if(!j)return null;const influence=this.getJurisdictionInfluence(id);const top=[...influence].sort((a,b)=>factionRelevanceScore(b)-factionRelevanceScore(a)).slice(0,8);return Object.freeze({jurisdictionId:id,jurisdictionType:j.type,top:Object.freeze(top),controllers:resolveTerritoryControllers(influence)});}
  getFactionContextForWorldNode(nodeId){const j=this.worldAdapter?.resolveJurisdictionForNode?.(nodeId);if(!j)return null;const parent=this.getJurisdictionFactionContext(j.id);const site=this.worldAdapter?.getSite?.(nodeId);return site?buildSiteFactionContext({site,parentContext:parent}):parent;}
  getFactionsForTerritory(territoryId){const j=this.worldAdapter?.getTerritory?.(territoryId);return j?this.getFactionsForJurisdiction(j.id,{limit:28}):Object.freeze([]);}
  getInfluenceForTerritory(territoryId){const j=this.worldAdapter?.getTerritory?.(territoryId);return j?this.getJurisdictionInfluence(j.id):Object.freeze([]);}
  getRelevantFactionsForTerritory(territoryId,{limit=12}={}){const factions=this.getFactionsForTerritory(territoryId),byId=new Map(factions.map(f=>[f.id,f]));return Object.freeze([...this.getInfluenceForTerritory(territoryId)].sort((a,b)=>factionRelevanceScore(b)-factionRelevanceScore(a)).slice(0,Math.max(1,Math.min(20,limit))).map(e=>byId.get(e.factionId)).filter(Boolean));}
  getTerritoryControllers(id){return resolveTerritoryControllers(this.getInfluenceForTerritory(id));}
  getFactionRelation(a,b){const found=relationFor(this.relations,a,b);if(found)return found;const fa=this.getFaction(a),fb=this.getFaction(b);const same=fa&&fb&&fa.continentIds?.some(x=>fb.continentIds?.includes(x));return createRelation({a,b,type:RELATION_TYPES.NEUTRAL,trust:0,respect:same?20:0});}
  getFactionBranches(id){return Object.freeze([...(this.branchIndex.byParent.get(id)||[])]);}
  getFactionVassals(id){return Object.freeze(this.vassals.filter(v=>v.overlordId===id));}
  getFactionAssets(id){return Object.freeze(this.assets.filter(a=>a.factionId===id));}
  ensureVassalsForTerritory(id){const cached=this.vassalCache.get(id);if(cached)return cached;const t=this.worldAdapter?.getTerritory?.(id);if(!t)return Object.freeze([]);const local=this.getLocalFactionsForJurisdiction(t.id);const overlords=this.getInheritedPresencesForJurisdiction(t.id,{limit:8}).map(p=>this.getFaction(p.factionId)).filter(Boolean);const links=planVassalsForTerritory({territory:t,localFactions:local,candidateOverlords:overlords,worldSeed:this.worldSeed});for(const v of links)if(!this.vassals.some(x=>x.overlordId===v.overlordId&&x.vassalId===v.vassalId))this.vassals.push(v);return this.vassalCache.set(id,links);}
  hasTerritoryBlueprint(id){return Boolean(this.worldAdapter?.getTerritory?.(id));}
  clearCaches(){this.jurisdictionCache.clear();this.influenceCache.clear();this.siteCache.clear();this.vassalCache.clear();}
}
