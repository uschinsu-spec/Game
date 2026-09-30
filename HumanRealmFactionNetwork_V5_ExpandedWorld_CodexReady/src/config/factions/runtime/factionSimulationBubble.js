export function buildSimulationBubble({currentTerritoryId,neighborTerritoryIds=[],playerRelatedFactionIds=[],territoryFactionProvider,maxTerritories=5,maxFactions=60}){
  const territories=[currentTerritoryId,...neighborTerritoryIds].filter(Boolean).slice(0,maxTerritories);
  const factions=[];const seen=new Set();
  const add=id=>{if(id&&!seen.has(id)&&factions.length<maxFactions){seen.add(id);factions.push(id);}};
  for(const id of playerRelatedFactionIds)add(id);
  for(const t of territories)for(const f of territoryFactionProvider?.(t)||[])add(typeof f==='string'?f:f.id);
  return Object.freeze({territories:Object.freeze(territories),factionIds:Object.freeze(factions)});
}
