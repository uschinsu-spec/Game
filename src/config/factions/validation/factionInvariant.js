import { validateFactionDefinition } from '../core/factionDefinitions.js';
import { validateVassalGraph } from '../network/factionVassals.js';
import { MAX_REALM_INDEX, CANONICAL_PLAYER_SECT_IDS } from '../core/factionConstants.js';

function assertRichCanonicalFaction(faction,label='canonical faction'){
  if(!faction)throw new Error(`[FACTION V5] missing ${label}`);
  if(!faction.meta?.canonical)throw new Error(`[FACTION V5] ${faction.id} is not canonical`);
  if(!faction.meta?.seatName||!faction.meta?.leaderName||!faction.meta?.signatureTechnique)throw new Error(`[FACTION V5] ${faction.id} missing canonical identity detail`);
  if(Number(faction.population?.population||0)<=0||Number(faction.population?.cultivators||0)<=0)throw new Error(`[FACTION V5] ${faction.id} missing population baseline`);
  if(Number(faction.economy?.treasury||0)<=0||Number(faction.economy?.income||0)<=0)throw new Error(`[FACTION V5] ${faction.id} missing economy baseline`);
  if(Number(faction.resources?.spiritStone||0)<=0)throw new Error(`[FACTION V5] ${faction.id} missing resource baseline`);
  if(Number(faction.cultivators?.leaderRealmIdx)<0||Number(faction.cultivators?.leaderRealmIdx)>MAX_REALM_INDEX)throw new Error(`[FACTION V5] ${faction.id} leader realm invalid`);
  if(!Array.isArray(faction.organization?.ranks)||!faction.organization.ranks.length)throw new Error(`[FACTION V5] ${faction.id} missing organization ranks`);
}

export function assertFactionBootReady({network,worldAdapter}={}){
  if(!network||!worldAdapter)throw new Error('[FACTION V5] missing network/worldAdapter');
  for(const id of CANONICAL_PLAYER_SECT_IDS)if(!network.getFaction(id))throw new Error(`[FACTION V5] missing player sect ${id}`);
  if(typeof worldAdapter.getTerritoryForWorldNode!=='function'||typeof network.getJurisdictionFactionContext!=='function')throw new Error('[FACTION V5] adapter contract incomplete');

  const atlas=network.getCanonicalFactionAtlasStats?.();
  if(atlas){
    const expected={regions:42,territories:437,factions:1832,branches:2622};
    for(const [key,value] of Object.entries(expected))if(Number(atlas[key])!==value)throw new Error(`[FACTION V5] canonical atlas ${key} ${atlas[key]} != ${value}`);
    if(Number(atlas.branchesPerTerritory)!==6)throw new Error(`[FACTION V5] canonical branchesPerTerritory ${atlas.branchesPerTerritory} != 6`);

    const territoryIds=worldAdapter.getAllTerritoryIds?.()||[];
    const sampleIds=[territoryIds[0],territoryIds[Math.floor(territoryIds.length/2)],territoryIds[territoryIds.length-1]].filter(Boolean);
    for(const territoryId of sampleIds){
      const local=network.getLocalFactionsForJurisdiction?.(territoryId)||[];
      if(local.length!==4)throw new Error(`[FACTION V5] ${territoryId} local canonical factions ${local.length} != 4`);
      local.forEach((f,index)=>assertRichCanonicalFaction(f,`${territoryId} local[${index}]`));
      const branches=network.ensureBranchesForTerritory?.(territoryId)||[];
      if(branches.length!==6)throw new Error(`[FACTION V5] ${territoryId} canonical branches ${branches.length} != 6`);
      if(branches.some(branch=>!branch.mapNodeId||!branch.displayName||!branch.markerLabel))throw new Error(`[FACTION V5] ${territoryId} branch map metadata incomplete`);
      if(typeof network.getFactionMapMarkersForWorldNode==='function'){
        const markers=network.getFactionMapMarkersForWorldNode(territoryId,{limit:16});
        if(markers.length<10)throw new Error(`[FACTION V5] canonical map markers incomplete for ${territoryId}: ${markers.length}`);
      }
    }
  }
  return Object.freeze({ok:true,checkedPlayerSects:CANONICAL_PLAYER_SECT_IDS.length,canonicalAtlas:atlas||null,mode:'production-complete-canonical'});
}

export function assertFactionNetworkIntegrity({factions=[],branches=[],vassals=[],relations=[],cultivatorProfiles=[],territoryIds=[],requireCanonicalPlayerSects=true,expectedTerritoryCount=437}={}){const errors=[],ids=new Set();for(const f of factions){for(const e of validateFactionDefinition(f))errors.push(`${f.id}: ${e}`);if(ids.has(f.id))errors.push(`duplicate ${f.id}`);ids.add(f.id);}if(requireCanonicalPlayerSects)for(const id of CANONICAL_PLAYER_SECT_IDS)if(!ids.has(id))errors.push(`missing player sect ${id}`);for(const b of branches)if(!ids.has(b.parentFactionId))errors.push(`branch ${b.id} missing parent`);errors.push(...validateVassalGraph(vassals));for(const r of relations)if(!ids.has(r.a)||!ids.has(r.b))errors.push(`relation ${r.id} dangling`);for(const p of cultivatorProfiles)if(Number(p.leaderRealmIdx)>MAX_REALM_INDEX||Number(p.ancestorRealmIdx)>MAX_REALM_INDEX)errors.push('realm cap exceeded');if(territoryIds.length&&new Set(territoryIds).size!==expectedTerritoryCount)errors.push(`territory count != ${expectedTerritoryCount}`);if(errors.length)throw new Error(`[FACTION V5 INVARIANT] ${errors.join('; ')}`);return Object.freeze({ok:true,factionCount:factions.length,branchCount:branches.length,vassalCount:vassals.length,relationCount:relations.length,territoryCoverageCount:new Set(territoryIds).size});}

export function assertUnifiedGameFactionBlueprint({network,worldAdapter,expectedTerritoryCount=437,exhaustive=false}={}){if(!network||!worldAdapter)throw new Error('[FACTION V5] missing network/worldAdapter');const geo=worldAdapter.validateGeography?.({expectedTerritories:expectedTerritoryCount});if(geo&&!geo.ok)throw new Error(`[FACTION V5] geography invalid ${JSON.stringify(geo)}`);const ids=worldAdapter.getAllTerritoryIds();const sample=exhaustive?ids:ids.filter((_,i)=>i%Math.max(1,Math.floor(ids.length/24))===0).slice(0,24);for(const id of sample){const c=network.getTerritoryControllers(id);for(const k of ['politicalController','cultivationController','economicController','securityController','intelligenceController','underworldController'])if(!c?.[k])throw new Error(`[FACTION V5] ${id} missing ${k}`);}return Object.freeze({ok:true,territoryCount:ids.length,checked:sample.length,nodeCount:geo?.nodeCount||null});}
