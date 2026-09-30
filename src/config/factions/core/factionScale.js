import { FACTION_SCOPES, FACTION_POWER_TIERS } from './factionConstants.js';

const SCOPE_ORDER = Object.freeze([
  FACTION_SCOPES.LOCAL,
  FACTION_SCOPES.CITY,
  FACTION_SCOPES.COMMANDERY,
  FACTION_SCOPES.NATION,
  FACTION_SCOPES.SECONDARY_TERRITORY,
  FACTION_SCOPES.PRIMARY_REGION,
  FACTION_SCOPES.CONTINENT,
  FACTION_SCOPES.HUMAN_REALM
]);

const TIER_ORDER = Object.freeze([
  FACTION_POWER_TIERS.LOCAL,
  FACTION_POWER_TIERS.MINOR,
  FACTION_POWER_TIERS.MEDIUM,
  FACTION_POWER_TIERS.MAJOR,
  FACTION_POWER_TIERS.OVERLORD,
  FACTION_POWER_TIERS.SUPREME
]);

export const scopeRank = scope => SCOPE_ORDER.indexOf(scope);
export const tierRank = tier => TIER_ORDER.indexOf(tier);
export const compareScopes = (a, b) => scopeRank(a) - scopeRank(b);
export const comparePowerTiers = (a, b) => tierRank(a) - tierRank(b);
export const isValidScope = scope => SCOPE_ORDER.includes(scope);
export const isValidPowerTier = tier => TIER_ORDER.includes(tier);
