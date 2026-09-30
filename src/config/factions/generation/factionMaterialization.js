export const PROFILE_LEVEL = Object.freeze({ BACKGROUND: 0, GENERATED: 1, CORE: 2 });

export function backgroundProfile(faction) {
  return Object.freeze({ id: faction.id, type: faction.archetype, parentFactionId: faction.parentFactionId || null, territoryId: faction.homeTerritoryId || null, powerBand: faction.powerTier, status: faction.status });
}

export function generatedProfile(faction) {
  return Object.freeze({ ...backgroundProfile(faction), name: faction.name, dna: faction.dna, basePower: faction.basePower, visibility: faction.visibility, tags: faction.tags });
}

export function materializeFactionProfile(faction, level = PROFILE_LEVEL.GENERATED, extras = {}) {
  if (!faction) return null;
  if (level <= PROFILE_LEVEL.BACKGROUND) return backgroundProfile(faction);
  if (level === PROFILE_LEVEL.GENERATED) return generatedProfile(faction);
  return Object.freeze({ ...faction, ...extras, materializationLevel: PROFILE_LEVEL.CORE });
}
