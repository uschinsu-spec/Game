import { VASSAL_TYPES } from '../core/factionConstants.js';

export function createVassalLink({ overlordId, vassalId, type = VASSAL_TYPES.VASSAL, tribute = 0.1, autonomy = 0.5, protection = 0.5, sinceCycle = 0 }) {
  if (overlordId === vassalId) throw new Error('Faction cannot vassalize itself');
  return Object.freeze({ overlordId, vassalId, type, tribute: Math.max(0, Math.min(1, tribute)), autonomy: Math.max(0, Math.min(1, autonomy)), protection: Math.max(0, Math.min(1, protection)), sinceCycle });
}

export function validateVassalGraph(links = []) {
  const children = new Map();
  for (const l of links) { if (!children.has(l.overlordId)) children.set(l.overlordId, []); children.get(l.overlordId).push(l.vassalId); }
  const errors = [];
  const visit = (id, stack = new Set(), seen = new Set()) => {
    if (stack.has(id)) { errors.push(`Vassal cycle at ${id}`); return; }
    if (seen.has(id)) return;
    stack.add(id); seen.add(id);
    for (const c of children.get(id) || []) visit(c, new Set(stack), seen);
  };
  for (const id of children.keys()) visit(id);
  return errors;
}
