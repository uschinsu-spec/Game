// Tuned for the agreed Human Realm target: roughly 20k–35k logical local factions
// across 437 canonical territories when every territory is eventually materialized.
export const DEFAULT_BUDGET = Object.freeze({
  majorSlots: 3,
  mediumSlots: 7,
  minorSlots: 18,
  familySlots: 22,
  merchantSlots: 3,
  guildSlots: 2,
  underworldSlots: 3
});

const CONTINENT_MOD = Object.freeze({
  south: { density: 1.15, families: 1.2, major: 0.9 },
  east: { density: 1.0, families: 1.0, major: 1.1 },
  west: { density: 0.75, families: 0.85, merchants: 1.3, underworld: 1.2 },
  north: { density: 0.7, families: 1.25, major: 1.15 },
  central: { density: 1.2, major: 1.6, guilds: 1.5, merchants: 1.2 }
});

function round(v) { return Math.max(0, Math.round(v)); }

export function getTerritoryFactionBudget({ continentKey = 'south', civilizationDensity = 1, importance = 1 } = {}) {
  const m = CONTINENT_MOD[continentKey] || CONTINENT_MOD.south;
  const d = Math.max(0.25, civilizationDensity) * Math.max(0.5, importance);
  return Object.freeze({
    majorSlots: round(DEFAULT_BUDGET.majorSlots * d * (m.major || 1)),
    mediumSlots: round(DEFAULT_BUDGET.mediumSlots * d * m.density),
    minorSlots: round(DEFAULT_BUDGET.minorSlots * d * m.density),
    familySlots: round(DEFAULT_BUDGET.familySlots * d * (m.families || m.density)),
    merchantSlots: round(DEFAULT_BUDGET.merchantSlots * d * (m.merchants || 1)),
    guildSlots: round(DEFAULT_BUDGET.guildSlots * d * (m.guilds || 1)),
    underworldSlots: round(DEFAULT_BUDGET.underworldSlots * d * (m.underworld || 1))
  });
}

export function estimateHumanRealmLogicalFactionCount(continentTerritoryCounts = { south:108, east:64, west:49, north:72, central:144 }, densityByContinent = { south:1.08, east:1.0, west:0.78, north:0.82, central:1.32 }) {
  let total = 0;
  const breakdown = {};
  for (const [continentKey, territoryCount] of Object.entries(continentTerritoryCounts)) {
    const budget = getTerritoryFactionBudget({ continentKey, civilizationDensity: densityByContinent[continentKey] || 1, importance: 1 });
    const perTerritory = Object.values(budget).reduce((sum, value) => sum + value, 0);
    breakdown[continentKey] = Object.freeze({ territories: territoryCount, perTerritory, logicalFactions: perTerritory * territoryCount });
    total += perTerritory * territoryCount;
  }
  return Object.freeze({ total, breakdown: Object.freeze(breakdown) });
}
