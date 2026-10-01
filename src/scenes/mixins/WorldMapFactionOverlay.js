import { getControllerAssignments, getWorldNode } from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';

const CONTROLLER_ARCHETYPES = new Set(['SECT', 'CULTIVATION_FAMILY', 'ANCIENT_CLAN']);

function controllerAssignmentsFor(network, parentId) {
  const all = (network?.getAllCoreFactions?.() || [])
    .filter(faction => CONTROLLER_ARCHETYPES.has(faction?.archetype))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const used = new Set();
  return getControllerAssignments(parentId, {
    resolveFactionId(child, index) {
      const local = (network?.getFactionsForJurisdiction?.(child.id, { limit: 32 }) || [])
        .filter(faction => CONTROLLER_ARCHETYPES.has(faction?.archetype))
        .sort((a, b) => String(a.id).localeCompare(String(b.id)));
      const selected = [...local, ...all].find(faction => !used.has(faction.id));
      if (!selected) return null;
      used.add(selected.id);
      return selected.id;
    }
  });
}

export function buildFactionOverlayModel(network,territoryId,coordinator,{worldNodeId=null,markerLimit=8}={}){
  if(!territoryId&&!worldNodeId)return null;
  const mapMarkers=worldNodeId?network.getFactionMapMarkersForWorldNode?.(worldNodeId,{limit:markerLimit})||[]:[];
  const parentId = worldNodeId && getWorldNode(worldNodeId) ? worldNodeId : null;
  const assignments = parentId ? controllerAssignmentsFor(network, parentId) : Object.freeze([]);
  if(!territoryId){return Object.freeze({territoryId:null,worldNodeId,controllers:null,controllerAssignments:assignments,contested:false,powerVacuum:null,topFactions:Object.freeze([]),mapMarkers:Object.freeze([...mapMarkers])});}
  const influence=network.getInfluenceForTerritory(territoryId);
  const vacuum=coordinator?.powerVacuumByTerritory?.get(territoryId);
  return Object.freeze({
    territoryId,
    worldNodeId,
    // Influence controllers remain an overlay concern. Administrative ownership
    // is exposed only through the deterministic canonical assignments above.
    controllers:network.getTerritoryControllers(territoryId),
    controllerAssignments:assignments,
    contested:Boolean(vacuum),
    powerVacuum:vacuum||null,
    topFactions:network.getRelevantFactionsForTerritory(territoryId,{limit:8}).map(f=>Object.freeze({id:f.id,name:f.name,archetype:f.archetype,powerTier:f.powerTier,influence:influence.find(x=>x.factionId===f.id)?.influence||{}})),
    mapMarkers:Object.freeze([...mapMarkers])
  });
}
export function installWorldMapFactionOverlay(MainGameScene,{network,worldAdapter,coordinator}={}){
  if(!MainGameScene?.prototype)return;
  const p=MainGameScene.prototype;if(p.__worldMapFactionOverlayInstalled)return;p.__worldMapFactionOverlayInstalled=true;
  p.getFactionOverlayForWorldNode=function(nodeId){
    const territory=worldAdapter?.getTerritoryForWorldNode?.(nodeId)||worldAdapter?.getTerritory?.(nodeId);
    return buildFactionOverlayModel(network,territory?.id||null,coordinator,{worldNodeId:nodeId,markerLimit:8});
  };
}
