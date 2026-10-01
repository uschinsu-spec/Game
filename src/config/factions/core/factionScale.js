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

// Canonical cultivation floors are part of the existing faction scale.
// One hierarchy is used everywhere: LOCAL -> MINOR -> MEDIUM -> MAJOR -> OVERLORD -> SUPREME.
// Realm indexes are the canonical GAME indexes from src/config/realmsData.js.
const REALM_FLOOR_BY_TIER = Object.freeze({
  [FACTION_POWER_TIERS.LOCAL]: Object.freeze({ leaderRealmIdx: 12, ancestorRealmIdx: 13 }), // Luyện Khí 12 -> Trúc Cơ Sơ
  [FACTION_POWER_TIERS.MINOR]: Object.freeze({ leaderRealmIdx: 16, ancestorRealmIdx: 17 }), // Trúc Cơ Đỉnh -> Kim Đan Sơ
  [FACTION_POWER_TIERS.MEDIUM]: Object.freeze({ leaderRealmIdx: 20, ancestorRealmIdx: 21 }), // Kim Đan Đỉnh -> Nguyên Anh Sơ
  [FACTION_POWER_TIERS.MAJOR]: Object.freeze({ leaderRealmIdx: 24, ancestorRealmIdx: 25 }), // Nguyên Anh Đỉnh -> Hóa Thần Sơ
  [FACTION_POWER_TIERS.OVERLORD]: Object.freeze({ leaderRealmIdx: 26, ancestorRealmIdx: 27 }), // Hóa Thần Trung -> Hóa Thần Hậu
  [FACTION_POWER_TIERS.SUPREME]: Object.freeze({ leaderRealmIdx: 27, ancestorRealmIdx: 28 }) // Hóa Thần Hậu -> Hóa Thần Đỉnh
});

export const getFactionRealmFloor = powerTier => REALM_FLOOR_BY_TIER[powerTier] || REALM_FLOOR_BY_TIER[FACTION_POWER_TIERS.LOCAL];

export function normalizeFactionCultivators(profile = {}, powerTier = FACTION_POWER_TIERS.LOCAL) {
  const floor = getFactionRealmFloor(powerTier);
  const leaderRealmIdx = Math.max(floor.leaderRealmIdx, Number(profile.leaderRealmIdx ?? 0));
  const ancestorRealmIdx = Math.max(floor.ancestorRealmIdx, leaderRealmIdx, Number(profile.ancestorRealmIdx ?? leaderRealmIdx));
  const byRealm = { ...(profile.byRealm || {}) };
  byRealm[leaderRealmIdx] = Math.max(1, Number(byRealm[leaderRealmIdx] || 0));
  byRealm[ancestorRealmIdx] = Math.max(1, Number(byRealm[ancestorRealmIdx] || 0));
  return Object.freeze({ leaderRealmIdx, ancestorRealmIdx, byRealm: Object.freeze(byRealm) });
}

export function validateFactionCultivators(profile = {}, powerTier = FACTION_POWER_TIERS.LOCAL) {
  const floor = getFactionRealmFloor(powerTier);
  const leaderRealmIdx = Number(profile.leaderRealmIdx);
  const ancestorRealmIdx = Number(profile.ancestorRealmIdx);
  const errors = [];
  if (!Number.isFinite(leaderRealmIdx) || leaderRealmIdx < floor.leaderRealmIdx) errors.push(`leader realm ${leaderRealmIdx} < ${floor.leaderRealmIdx} for ${powerTier}`);
  if (!Number.isFinite(ancestorRealmIdx) || ancestorRealmIdx < floor.ancestorRealmIdx) errors.push(`ancestor realm ${ancestorRealmIdx} < ${floor.ancestorRealmIdx} for ${powerTier}`);
  if (ancestorRealmIdx < leaderRealmIdx) errors.push(`ancestor realm ${ancestorRealmIdx} < leader realm ${leaderRealmIdx}`);
  return Object.freeze(errors);
}

