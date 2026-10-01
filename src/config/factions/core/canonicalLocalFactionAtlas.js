import { FACTION_ARCHETYPES } from './factionConstants.js';
import { FIXED_GEOGRAPHIC_RULERS } from './declarations/fixedFactionNames3950.js';

export const CANONICAL_LOCAL_FACTION_ATLAS_VERSION='20261001-single-source-3950-v1';

function addIndex(map,key,value){if(!key)return;if(!map.has(key))map.set(key,[]);map.get(key).push(value);}
function markerForFaction(faction){return Object.freeze({
  id:`marker:${faction.id}`,markerType:'FACTION_HQ',factionId:faction.id,branchId:null,
  worldNodeId:faction.meta?.governedNodeId||faction.meta?.mapNodeId||faction.homeTerritoryId,
  territoryId:faction.homeTerritoryId,label:faction.name,archetype:faction.archetype,powerTier:faction.powerTier,
  branchType:null,subLabel:faction.archetype===FACTION_ARCHETYPES.SECT?'TÔNG MÔN':'GIA TỘC',
  rankLabel:faction.meta?.rankLabel||faction.powerTier,seatName:faction.meta?.seatName||null
});}

export function createCanonicalLocalFactionAtlas({worldAdapter}={}){
  const factions=FIXED_GEOGRAPHIC_RULERS;
  const factionById=new Map(factions.map(f=>[f.id,f]));
  const rulerByJurisdiction=new Map();
  const byJurisdiction=new Map();
  const markersByJurisdiction=new Map();
  const markersByTerritory=new Map();
  const counts={region:0,province:0,nation:0,city_territory:0,sect:0,family:0};

  for(const faction of factions){
    const nodeId=faction.meta?.governedNodeId||faction.homeTerritoryId;
    const node=worldAdapter?.getJurisdiction?.(nodeId)||worldAdapter?.getNode?.(nodeId)||null;
    if(worldAdapter&&!node)throw new Error(`[FACTION DECLARATION] missing world node ${nodeId} for ${faction.id}`);
    if(rulerByJurisdiction.has(nodeId))throw new Error(`[FACTION DECLARATION] duplicate ruler for ${nodeId}`);
    rulerByJurisdiction.set(nodeId,faction);addIndex(byJurisdiction,nodeId,faction);
    const marker=markerForFaction(faction);addIndex(markersByJurisdiction,nodeId,marker);
    const territory=worldAdapter?.getTerritoryForWorldNode?.(nodeId)||worldAdapter?.getTerritory?.(nodeId)||null;
    if(territory)addIndex(markersByTerritory,territory.id,marker);
    const type=faction.meta?.governedNodeType||node?.type;if(type in counts)counts[type]+=1;
    if(faction.archetype===FACTION_ARCHETYPES.SECT)counts.sect+=1;else counts.family+=1;
  }

  const expectedJurisdictions=counts.region+counts.province+counts.nation+counts.city_territory;
  if(expectedJurisdictions!==factions.length)throw new Error(`[FACTION DECLARATION] ruler count mismatch ${expectedJurisdictions} != ${factions.length}`);

  return Object.freeze({
    version:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,
    factions,branches:Object.freeze([]),
    stats:Object.freeze({
      regions:counts.region,territories:counts.province,nations:counts.nation,cities:counts.city_territory,
      regionRulers:counts.region,provinceRulers:counts.province,nationRulers:counts.nation,cityRulers:counts.city_territory,
      geographicRulers:factions.length,sectRulers:counts.sect,familyRulers:counts.family,joinableSects:counts.sect,
      localFactions:factions.length,factions:factions.length,
      branches:0,branchesPerTerritory:0,rulersPerJurisdiction:1,declarationMode:'single-source-3950'
    }),
    getFactionById:id=>factionById.get(id)||null,
    getRulerForJurisdiction:id=>rulerByJurisdiction.get(id)||null,
    getFactionsForJurisdiction:id=>Object.freeze([...(byJurisdiction.get(id)||[])]),
    getBranchesForTerritory:()=>Object.freeze([]),
    getMapMarkersForTerritory:id=>Object.freeze([...(markersByTerritory.get(id)||[])]),
    getMapMarkersForJurisdiction:id=>Object.freeze([...(markersByJurisdiction.get(id)||[])])
  });
}
