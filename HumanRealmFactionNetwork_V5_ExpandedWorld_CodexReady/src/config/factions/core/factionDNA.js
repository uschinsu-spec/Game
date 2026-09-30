import { FACTION_ARCHETYPES } from './factionConstants.js';

const BASE_DNA = Object.freeze({
  culture: 'balanced', alignment: 'neutral', doctrine: 'mixed', elements: [],
  militaryStyle: 'balanced', economicModel: 'mixed', recruitmentPolicy: 'selective', diplomacyStyle: 'pragmatic',
  expansionism: 0.5, riskTolerance: 0.5, loyaltyCulture: 0.5, resourcePriority: [], researchPriority: [], secrecy: 0.2, corruption: 0.1
});

const PRESETS = Object.freeze({
  [FACTION_ARCHETYPES.SECT]: { culture: 'cultivation', doctrine: 'orthodox', recruitmentPolicy: 'talent_based', militaryStyle: 'elite_cultivators', loyaltyCulture: 0.75 },
  [FACTION_ARCHETYPES.CULTIVATION_FAMILY]: { culture: 'kinship', recruitmentPolicy: 'bloodline', diplomacyStyle: 'marriage_and_interest', loyaltyCulture: 0.9 },
  [FACTION_ARCHETYPES.ANCIENT_CLAN]: { culture: 'ancestral', recruitmentPolicy: 'bloodline_strict', secrecy: 0.55, loyaltyCulture: 0.95 },
  [FACTION_ARCHETYPES.DYNASTY]: { culture: 'bureaucratic', economicModel: 'taxation', militaryStyle: 'mass_army_plus_experts', diplomacyStyle: 'political', expansionism: 0.7 },
  [FACTION_ARCHETYPES.MERCHANT_GUILD]: { culture: 'commercial', economicModel: 'trade', diplomacyStyle: 'pragmatic', expansionism: 0.2, riskTolerance: 0.65 },
  [FACTION_ARCHETYPES.PROFESSION_GUILD]: { culture: 'craft', economicModel: 'services', diplomacyStyle: 'neutral_professional', researchPriority: ['craft'], expansionism: 0.15 },
  [FACTION_ARCHETYPES.ACADEMY]: { culture: 'scholarly', researchPriority: ['knowledge'], expansionism: 0.1, diplomacyStyle: 'neutral_scholarly' },
  [FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE]: { culture: 'independent', recruitmentPolicy: 'open', loyaltyCulture: 0.35, diplomacyStyle: 'transactional' },
  [FACTION_ARCHETYPES.UNDERWORLD]: { culture: 'secretive', economicModel: 'black_market', secrecy: 0.95, corruption: 0.7, diplomacyStyle: 'covert' },
  [FACTION_ARCHETYPES.DEMONIC_FACTION]: { culture: 'ruthless', doctrine: 'demonic', militaryStyle: 'aggressive_elite', secrecy: 0.75, expansionism: 0.75, riskTolerance: 0.8 },
  [FACTION_ARCHETYPES.NON_HUMAN_FACTION]: { culture: 'tribal_or_bloodline', recruitmentPolicy: 'species_or_oath', militaryStyle: 'bloodline_elite', diplomacyStyle: 'territorial' }
});

function clamp01(v) { return Math.max(0, Math.min(1, Number(v ?? 0))); }

export function createFactionDNA(archetype, overrides = {}) {
  const raw = { ...BASE_DNA, ...(PRESETS[archetype] || {}), ...overrides };
  for (const key of ['expansionism', 'riskTolerance', 'loyaltyCulture', 'secrecy', 'corruption']) raw[key] = clamp01(raw[key]);
  raw.elements = Object.freeze([...(raw.elements || [])]);
  raw.resourcePriority = Object.freeze([...(raw.resourcePriority || [])]);
  raw.researchPriority = Object.freeze([...(raw.researchPriority || [])]);
  return Object.freeze(raw);
}

export function mergeFactionDNA(base, override = {}) {
  return createFactionDNA(null, { ...base, ...override });
}
