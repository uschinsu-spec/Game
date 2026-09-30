export const FACTION_SAVE_SCHEMA_VERSION=5;
export function serializeFactionState({worldSeed='default',worldState,playerRelations={},affiliations={},contracts=[],wantedState={},history=[],createdFactions=[],destroyedFactionIds=[]}={}){
  return Object.freeze({version:FACTION_SAVE_SCHEMA_VERSION,worldSeed,factionDynamicOverrides:[...(worldState?.overrides?.values?.()||[])],influenceDeltas:[...(worldState?.influenceDeltas?.entries?.()||[])],dynamicRelations:[...(worldState?.dynamicRelations?.entries?.()||[])],majorEvents:[...(worldState?.events||[])],playerRelations,affiliations,contracts,wantedState,history:[...history],createdFactions:[...createdFactions],destroyedFactionIds:[...destroyedFactionIds]});
}
