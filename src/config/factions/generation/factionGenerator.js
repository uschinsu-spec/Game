/**
 * Compatibility utilities for the canonical faction system.
 *
 * The legacy faction generator/catalog was removed. Current faction modules only
 * depend on the deterministic hashing helper from that module, so keep that tiny
 * API here without restoring a second faction-generation system.
 */

export function hash32(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function rand01(seed, salt = '') {
  return hash32(`${seed}|${salt}`) / 0xffffffff;
}
