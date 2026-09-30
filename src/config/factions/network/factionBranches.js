import { branchId } from '../core/factionIds.js';

export function createBranch({ parentFactionId, territoryId, branchType = 'branch', authority = 0.5, assets = [], localLeaderSummary = null, meta = {} }) {
  return Object.freeze({
    id: branchId(parentFactionId, territoryId, branchType), parentFactionId, territoryId, branchType,
    authority: Math.max(0, Math.min(1, Number(authority))), assets: Object.freeze([...assets]), localLeaderSummary,
    meta: Object.freeze({ ...meta }), status: 'active'
  });
}

export function indexBranches(branches = []) {
  const byParent = new Map(), byTerritory = new Map(), byId = new Map();
  for (const b of branches) {
    byId.set(b.id,b);
    if (!byParent.has(b.parentFactionId)) byParent.set(b.parentFactionId, []);
    if (!byTerritory.has(b.territoryId)) byTerritory.set(b.territoryId, []);
    byParent.get(b.parentFactionId).push(b); byTerritory.get(b.territoryId).push(b);
  }
  return { byParent, byTerritory, byId };
}
