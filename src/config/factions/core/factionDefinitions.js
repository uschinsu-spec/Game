import { FACTION_ARCHETYPES, FACTION_VISIBILITY, CANONICAL_PLAYER_SECT_IDS, FACTION_DATA_LEVELS } from './factionConstants.js';
import { isValidScope, isValidPowerTier } from './factionScale.js';
import { validateStableId } from './factionIds.js';
import { createFactionDNA } from './factionDNA.js';

function freezeObject(value) {
  if (!value || typeof value !== 'object') return Object.freeze({});
  return Object.freeze({ ...value });
}

export function isValidFactionId(id) {
  const value=String(id||''); return CANONICAL_PLAYER_SECT_IDS.includes(value) || validateStableId(value, 'faction.');
}

export function createFactionDefinition(input) {
  const value = {
    id:String(input.id), name:String(input.name), archetype:input.archetype, scope:input.scope, powerTier:input.powerTier,
    continentIds:Object.freeze([...(input.continentIds||[])]), homeTerritoryId:input.homeTerritoryId||null,
    homePrimaryRegionId:input.homePrimaryRegionId||null, alignment:input.alignment||'neutral',
    dna:createFactionDNA(input.archetype,input.dna||{}), basePower:Object.freeze({...input.basePower}),
    visibility:input.visibility||FACTION_VISIBILITY.PUBLIC, dataLevel:input.dataLevel||FACTION_DATA_LEVELS.CORE,
    parentFactionId:input.parentFactionId||null, overlordFactionId:input.overlordFactionId||null,
    tags:Object.freeze([...(input.tags||[])]), goals:Object.freeze([...(input.goals||[])]),
    status:input.status||'active',

    // Rich baseline fields are optional for legacy/core factions, but canonical factions use them so
    // economy/population/cultivator systems do not materialize as zero-filled placeholders.
    population:freezeObject(input.population),
    cultivators:freezeObject(input.cultivators),
    economy:freezeObject(input.economy||input.baseEconomy),
    resources:freezeObject(input.resources),
    law:freezeObject(input.law),
    organization:freezeObject(input.organization),
    doctrine:freezeObject(input.doctrine),
    recruitment:freezeObject(input.recruitment),
    headquarters:freezeObject(input.headquarters),
    meta:Object.freeze({...input.meta})
  };
  const errors=validateFactionDefinition(value); if(errors.length) throw new Error(`Invalid faction ${value.id}: ${errors.join('; ')}`);
  return Object.freeze(value);
}

export function validateFactionDefinition(faction){
  const errors=[];
  if(!isValidFactionId(faction?.id)) errors.push('invalid id');
  if(!faction?.name) errors.push('missing name');
  if(!Object.values(FACTION_ARCHETYPES).includes(faction?.archetype)) errors.push('invalid archetype');
  if(!isValidScope(faction?.scope)) errors.push('invalid scope');
  if(!isValidPowerTier(faction?.powerTier)) errors.push('invalid powerTier');
  if(!Object.values(FACTION_VISIBILITY).includes(faction?.visibility)) errors.push('invalid visibility');
  return errors;
}
