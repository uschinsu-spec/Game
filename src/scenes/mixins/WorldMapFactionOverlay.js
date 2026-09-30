export function buildFactionOverlayModel(network,territoryId,coordinator,{worldNodeId=null,markerLimit=8}={}){
  if(!territoryId&&!worldNodeId)return null;
  const mapMarkers=worldNodeId?network.getFactionMapMarkersForWorldNode?.(worldNodeId,{limit:markerLimit})||[]:[];
  if(!territoryId){return Object.freeze({territoryId:null,worldNodeId,controllers:null,contested:false,powerVacuum:null,topFactions:Object.freeze([]),mapMarkers:Object.freeze([...mapMarkers])});}
  const influence=network.getInfluenceForTerritory(territoryId);
  const vacuum=coordinator?.powerVacuumByTerritory?.get(territoryId);
  return Object.freeze({
    territoryId,
    worldNodeId,
    controllers:network.getTerritoryControllers(territoryId),
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
