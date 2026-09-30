import { createFactionDefinition } from './factionDefinitions.js';
import { FACTION_SCOPES, FACTION_POWER_TIERS } from './factionConstants.js';
export function continentPower(spec){return createFactionDefinition({...spec,scope:FACTION_SCOPES.CONTINENT,powerTier:FACTION_POWER_TIERS.OVERLORD,visibility:spec.visibility||'PUBLIC',basePower:{cultivation:76,military:74,economic:62,political:70,intelligence:50,infrastructure:62,prestige:78,...spec.basePower},meta:{continentBackbone:true,...spec.meta}});}
