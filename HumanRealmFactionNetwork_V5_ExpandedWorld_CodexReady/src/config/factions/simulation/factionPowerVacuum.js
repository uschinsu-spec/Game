export function resolvePowerVacuum({territoryId,candidates=[],influenceByFaction={},maxContenders=4}){
  const ranked=[...candidates].sort((a,b)=>Number(influenceByFaction[b]?.political||0)+Number(influenceByFaction[b]?.military||0)-Number(influenceByFaction[a]?.political||0)-Number(influenceByFaction[a]?.military||0)).slice(0,maxContenders);
  return Object.freeze({territoryId,contenders:Object.freeze(ranked),status:ranked.length<=1?'resolved':'contested',provisionalController:ranked[0]||null});
}
