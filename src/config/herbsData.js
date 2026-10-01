/**
 * Compatibility view for legacy herb consumers.
 *
 * itemCatalog.js remains the single canonical item source. This module only
 * exposes the small herb lookup API still used by map/admin runtime code.
 */
import { listItems } from './itemCatalog.js?v=20261001-item-icons-v4';

export const ALL_HERBS = Object.freeze(
  listItems({ kind: 'herb' }).map(item => Object.freeze({
    ...item,
    type: 'herb'
  }))
);

export function getHerbById(id) {
  return ALL_HERBS.find(herb => herb.id === id) || null;
}

export function getHerbByName(name) {
  const needle = String(name ?? '').trim().toLowerCase();
  if (!needle) return null;
  return ALL_HERBS.find(herb => String(herb.name || '').trim().toLowerCase() === needle) || null;
}

export function getHerbsByRank(rank) {
  return ALL_HERBS.filter(herb => Number(herb.rank) === Number(rank));
}
