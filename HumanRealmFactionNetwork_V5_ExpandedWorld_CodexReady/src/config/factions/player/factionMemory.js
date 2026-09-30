export const MEMORY_TYPES = Object.freeze(['savedLeader','killedElder','betrayedFaction','wonWar','lostArtifact','marriedClanMember','protectedCaravan','stoleTreasure','revealedSecret','helpedFaction','attackedFaction']);

export function createFactionMemory({ factionId,type,severity=1,cycle=0,sourceTerritoryId=null,decayPolicy='none',meta={} }) {
  if(!MEMORY_TYPES.includes(type)) throw new Error(`Unknown memory type ${type}`);
  return Object.freeze({ factionId,type,severity:Math.max(0,Number(severity)),cycle:Number(cycle),sourceTerritoryId,decayPolicy,meta:Object.freeze({...meta}) });
}

export function memoryImpact(memories=[]) {
  return memories.reduce((out,m)=>{
    const sign=['savedLeader','wonWar','marriedClanMember','protectedCaravan','helpedFaction'].includes(m.type)?1:-1;
    out.reputation += sign*m.severity*25; out.trust += sign*m.severity*15; out.grievance += sign<0?m.severity*20:0; return out;
  },{reputation:0,trust:0,grievance:0});
}
