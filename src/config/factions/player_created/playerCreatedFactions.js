import { createFactionDefinition } from '../core/factionDefinitions.js';
import { stableFactionId } from '../core/factionIds.js';
import { FACTION_ARCHETYPES,FACTION_SCOPES,FACTION_POWER_TIERS } from '../core/factionConstants.js';

const TYPE_TO_ARCHETYPE=Object.freeze({Guild:FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE,Family:FACTION_ARCHETYPES.CULTIVATION_FAMILY,Sect:FACTION_ARCHETYPES.SECT,MerchantCompany:FACTION_ARCHETYPES.MERCHANT_GUILD,MercenaryGroup:FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE});
export function createPlayerFaction({name,type='Guild',territoryId,continentKey='south',serial=0,playerId='player',dna={}}){const archetype=TYPE_TO_ARCHETYPE[type]||FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE;return createFactionDefinition({id:stableFactionId({scope:'player',archetype,territoryId,slot:serial,slug:`${playerId}_${name}`}),name,archetype,scope:FACTION_SCOPES.LOCAL,powerTier:FACTION_POWER_TIERS.LOCAL,continentIds:[continentKey],homeTerritoryId:territoryId,alignment:'player',dna,tags:['player_created'],meta:{playerId,createdType:type}});}
