import { validateFactionDefinition } from '../core/factionDefinitions.js';
import { validateVassalGraph } from '../network/factionVassals.js';
import { MAX_REALM_INDEX } from '../core/factionConstants.js';

function assertRichCanonicalFaction(faction,label='canonical faction'){
  if(!faction)throw new Error(`[FACTION] missing ${label}`);
  if(!faction.meta?.canonical||faction.meta?.declarationMode!=='fixed')throw new Error(`[FACTION] ${faction.id} is not a fixed canonical declaration`);
  if(!faction.meta?.seatName||!faction.meta?.leaderName||!faction.meta?.signatureTechnique)throw new Error(`[FACTION] ${faction.id} missing identity detail`);
  if(Number(faction.population?.population||0)<=0||Number(faction.population?.cultivators||0)<=0)throw new Error(`[FACTION] ${faction.id} missing population baseline`);
  if(Number(faction.economy?.treasury||0)<=0||Number(faction.economy?.income||0)<=0)throw new Error(`[FACTION] ${faction.id} missing economy baseline`);
  if(Number(faction.resources?.spiritStone||0)<=0)throw new Error(`[FACTION] ${faction.id} missing resource baseline`);
  if(Number(faction.cultivators?.leaderRealmIdx)<0||Number(faction.cultivators?.leaderRealmIdx)>MAX_REALM_INDEX)throw new Error(`[FACTION] ${faction.id} leader realm invalid`);
  if(!Array.isArray(faction.organization?.ranks)||!faction.organization.ranks.length)throw new Error(`[FACTION] ${faction.id} missing organization ranks`);
}

export function assertFactionBootReady({network,worldAdapter}={}){
  if(!network||!worldAdapter)throw new Error('[FACTION] missing network/worldAdapter');
  const atlas=network.getCanonicalFactionAtlasStats?.();
  const expected={regions:25,territories:125,nations:625,cities:3125,regionRulers:25,provinceRulers:125,nationRulers:625,cityRulers:3125,geographicRulers:3900,sectRulers:1959,familyRulers:1941,joinableSects:1959,factions:3900,branches:0,rulersPerJurisdiction:1};
  for(const [key,value] of Object.entries(expected))if(Number(atlas?.[key])!==value)throw new Error(`[FACTION] canonical atlas ${key} ${atlas?.[key]} != ${value}`);
  if(atlas?.declarationMode!=='single-source-3950')throw new Error('[FACTION] atlas is not fixed-declaration mode');
  const staticStats=network.getCanonicalStaticFactionStats?.();
  if(staticStats&&Number(staticStats.total)!==3950)throw new Error(`[FACTION] static faction total ${staticStats.total} != 3950`);
  const relationStats=network.getCanonicalRelationStats?.();
  if(relationStats){if(Number(relationStats.vassals)!==3875)throw new Error(`[FACTION] fixed vassals ${relationStats.vassals} != 3875`);if(Number(relationStats.total)!==3883)throw new Error(`[FACTION] fixed relations ${relationStats.total} != 3883`);}
  const territoryIds=worldAdapter.getAllTerritoryIds?.()||[];
  const sampleIds=[territoryIds[0],territoryIds[Math.floor(territoryIds.length/2)],territoryIds[territoryIds.length-1]].filter(Boolean);
  for(const territoryId of sampleIds){const local=network.getLocalFactionsForJurisdiction?.(territoryId)||[];if(local.length!==1)throw new Error(`[FACTION] ${territoryId} rulers ${local.length} != 1`);assertRichCanonicalFaction(local[0],`${territoryId} ruler`);if((network.ensureBranchesForTerritory?.(territoryId)||[]).length!==0)throw new Error(`[FACTION] ${territoryId} must not have generated canonical branches`);}
  return Object.freeze({ok:true,canonicalAtlas:atlas,staticStats,relationStats,mode:'single-source-3950'});
}

export function assertFactionNetworkIntegrity({factions=[],branches=[],vassals=[],relations=[],cultivatorProfiles=[],territoryIds=[],expectedTerritoryCount=125}={}){const errors=[],ids=new Set();for(const f of factions){for(const e of validateFactionDefinition(f))errors.push(`${f.id}: ${e}`);if(ids.has(f.id))errors.push(`duplicate ${f.id}`);ids.add(f.id);}for(const b of branches)if(!ids.has(b.parentFactionId))errors.push(`branch ${b.id} missing parent`);errors.push(...validateVassalGraph(vassals));for(const r of relations)if(!ids.has(r.a)||!ids.has(r.b))errors.push(`relation ${r.id} dangling`);for(const p of cultivatorProfiles)if(Number(p.leaderRealmIdx)>MAX_REALM_INDEX||Number(p.ancestorRealmIdx)>MAX_REALM_INDEX)errors.push('realm cap exceeded');if(territoryIds.length&&new Set(territoryIds).size!==expectedTerritoryCount)errors.push(`territory count != ${expectedTerritoryCount}`);if(errors.length)throw new Error(`[FACTION INVARIANT] ${errors.join('; ')}`);return Object.freeze({ok:true,factionCount:factions.length,branchCount:branches.length,vassalCount:vassals.length,relationCount:relations.length,territoryCoverageCount:new Set(territoryIds).size});}

export function assertUnifiedGameFactionBlueprint({network,worldAdapter,expectedTerritoryCount=125,exhaustive=false}={}){if(!network||!worldAdapter)throw new Error('[FACTION] missing network/worldAdapter');const geo=worldAdapter.validateGeography?.({expectedTerritories:expectedTerritoryCount});if(geo&&!geo.ok)throw new Error(`[FACTION] geography invalid ${JSON.stringify(geo)}`);const ids=worldAdapter.getAllTerritoryIds();const sample=exhaustive?ids:ids.filter((_,i)=>i%Math.max(1,Math.floor(ids.length/24))===0).slice(0,24);for(const id of sample){const c=network.getTerritoryControllers(id);for(const k of ['politicalController','cultivationController','economicController','securityController','intelligenceController','underworldController'])if(!c?.[k])throw new Error(`[FACTION] ${id} missing ${k}`);}return Object.freeze({ok:true,territoryCount:ids.length,checked:sample.length,nodeCount:geo?.nodeCount||null});}
