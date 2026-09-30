import { FACTION_ARCHETYPES } from '../core/factionConstants.js';

const CONTROLLER_DIMENSION = Object.freeze({
  politicalController: 'political', cultivationController: 'cultivation', economicController: 'economic',
  securityController: 'military', intelligenceController: 'intelligence', underworldController: 'underworld'
});

const PREFERRED = Object.freeze({
  politicalController: new Set([FACTION_ARCHETYPES.DYNASTY, FACTION_ARCHETYPES.CITY_STATE, FACTION_ARCHETYPES.ADMINISTRATION, FACTION_ARCHETYPES.ANCIENT_CLAN]),
  cultivationController: new Set([FACTION_ARCHETYPES.SECT, FACTION_ARCHETYPES.CULTIVATION_FAMILY, FACTION_ARCHETYPES.ANCIENT_CLAN, FACTION_ARCHETYPES.DEMONIC_FACTION, FACTION_ARCHETYPES.NON_HUMAN_FACTION]),
  economicController: new Set([FACTION_ARCHETYPES.MERCHANT_GUILD, FACTION_ARCHETYPES.PROFESSION_GUILD, FACTION_ARCHETYPES.DYNASTY, FACTION_ARCHETYPES.CULTIVATION_FAMILY]),
  securityController: new Set([FACTION_ARCHETYPES.MILITARY_ORDER, FACTION_ARCHETYPES.DYNASTY, FACTION_ARCHETYPES.ADMINISTRATION, FACTION_ARCHETYPES.SECT, FACTION_ARCHETYPES.ANCIENT_CLAN]),
  intelligenceController: new Set([FACTION_ARCHETYPES.INTELLIGENCE_NETWORK, FACTION_ARCHETYPES.UNDERWORLD, FACTION_ARCHETYPES.ACADEMY, FACTION_ARCHETYPES.DYNASTY]),
  underworldController: new Set([FACTION_ARCHETYPES.UNDERWORLD, FACTION_ARCHETYPES.DEMONIC_FACTION])
});

export function resolveTerritoryControllers(influenceEntries = []) {
  const result = {};
  for (const [field, dim] of Object.entries(CONTROLLER_DIMENSION)) {
    let best = null;
    for (const entry of influenceEntries) {
      const raw = Number(entry.influence?.[dim] || 0);
      const preferred = PREFERRED[field]?.has(entry.archetype);
      const value = raw + (preferred ? 18 : 0);
      if (!best || value > best.value) best = { factionId: entry.factionId, value, raw, preferred };
    }
    result[field] = best?.raw > 0 ? best.factionId : null;
  }
  return Object.freeze(result);
}
