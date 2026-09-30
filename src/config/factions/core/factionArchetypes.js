import { FACTION_ARCHETYPES } from './factionConstants.js';

export const ARCHETYPE_RULES = Object.freeze({
  [FACTION_ARCHETYPES.SECT]: Object.freeze({ hierarchy: 'sect', recruitment: 'talent_and_contribution', succession: 'designated_or_council', economy: 'resources_and_missions', membership: 'exclusive_cultivation' }),
  [FACTION_ARCHETYPES.CULTIVATION_FAMILY]: Object.freeze({ hierarchy: 'family', recruitment: 'bloodline_or_marriage', succession: 'bloodline_seniority', economy: 'estates_and_resources', membership: 'kinship' }),
  [FACTION_ARCHETYPES.ANCIENT_CLAN]: Object.freeze({ hierarchy: 'ancient_clan', recruitment: 'bloodline_strict', succession: 'bloodline_power', economy: 'ancestral_assets', membership: 'bloodline' }),
  [FACTION_ARCHETYPES.DYNASTY]: Object.freeze({ hierarchy: 'dynasty', recruitment: 'appointment_and_merit', succession: 'royal_succession', economy: 'tax_and_tribute', membership: 'political' }),
  [FACTION_ARCHETYPES.CITY_STATE]: Object.freeze({ hierarchy: 'civic', recruitment: 'appointment', succession: 'council_or_dynasty', economy: 'tax_and_trade', membership: 'political' }),
  [FACTION_ARCHETYPES.MERCHANT_GUILD]: Object.freeze({ hierarchy: 'merchant', recruitment: 'contract_and_credit', succession: 'council_or_shares', economy: 'trade', membership: 'commercial' }),
  [FACTION_ARCHETYPES.PROFESSION_GUILD]: Object.freeze({ hierarchy: 'profession', recruitment: 'certification', succession: 'council', economy: 'services_and_certification', membership: 'nonexclusive_profession' }),
  [FACTION_ARCHETYPES.ACADEMY]: Object.freeze({ hierarchy: 'academy', recruitment: 'examination', succession: 'council', economy: 'research_and_tuition', membership: 'academic' }),
  [FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE]: Object.freeze({ hierarchy: 'alliance', recruitment: 'registration', succession: 'election', economy: 'commissions', membership: 'nonexclusive_social' }),
  [FACTION_ARCHETYPES.UNDERWORLD]: Object.freeze({ hierarchy: 'cell_network', recruitment: 'secret_contract', succession: 'strength_or_intrigue', economy: 'black_market', membership: 'secret' }),
  [FACTION_ARCHETYPES.DEMONIC_FACTION]: Object.freeze({ hierarchy: 'cult', recruitment: 'secret_or_force', succession: 'strength', economy: 'forbidden_resources', membership: 'exclusive_or_secret' }),
  [FACTION_ARCHETYPES.NON_HUMAN_FACTION]: Object.freeze({ hierarchy: 'bloodline_or_tribal', recruitment: 'species_or_oath', succession: 'bloodline_or_strength', economy: 'territory_resources', membership: 'species_or_oath' })
});

export function getArchetypeRules(archetype) {
  return ARCHETYPE_RULES[archetype] || null;
}
