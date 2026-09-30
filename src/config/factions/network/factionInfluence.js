const DIMENSIONS = Object.freeze(['territorial','military','cultivation','economic','political','intelligence','infrastructure','prestige','resourceControl','underworld']);

export function createInfluenceVector(input = {}) {
  const out = {};
  for (const key of DIMENSIONS) out[key] = Math.max(0, Math.min(100, Number(input[key] ?? 0)));
  return Object.freeze(out);
}

export function combineInfluence(base, delta = {}) {
  const out = {};
  for (const key of DIMENSIONS) out[key] = Math.max(0, Math.min(100, Number(base?.[key] ?? 0) + Number(delta?.[key] ?? 0)));
  return Object.freeze(out);
}

export function rankFactionsByInfluence(entries, dimension) {
  if (!DIMENSIONS.includes(dimension)) throw new Error(`Unknown influence dimension: ${dimension}`);
  return [...entries].sort((a,b) => Number(b.influence?.[dimension] || 0) - Number(a.influence?.[dimension] || 0));
}

export { DIMENSIONS as INFLUENCE_DIMENSIONS };
