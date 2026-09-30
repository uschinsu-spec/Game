function normalizeToken(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function stableFactionId({ scope = 'local', archetype = 'faction', territoryId = 'world', slot = 0, slug = '' }) {
  const suffix = slug ? normalizeToken(slug) : String(slot).padStart(4, '0');
  return `faction.hr.${normalizeToken(scope)}.${normalizeToken(archetype)}.${normalizeToken(territoryId)}.${suffix}`;
}

export function branchId(parentFactionId, territoryId, branchType = 'branch') {
  return `branch.${normalizeToken(parentFactionId)}.${normalizeToken(territoryId)}.${normalizeToken(branchType)}`;
}

export function relationId(a, b) {
  const pair = [String(a), String(b)].sort();
  return `rel.${normalizeToken(pair[0])}.${normalizeToken(pair[1])}`;
}

export function assetId(factionId, type, worldNodeId, slot = 0) {
  return `asset.${normalizeToken(factionId)}.${normalizeToken(type)}.${normalizeToken(worldNodeId)}.${slot}`;
}

export function contractId(playerId, factionId, type, serial = 0) {
  return `contract.${normalizeToken(playerId)}.${normalizeToken(factionId)}.${normalizeToken(type)}.${serial}`;
}

export function validateStableId(id, prefix = '') {
  const value = String(id || '');
  if (!value || /\s/.test(value)) return false;
  if (prefix && !value.startsWith(prefix)) return false;
  return /^[a-z0-9_.-]+$/.test(value);
}

export function slugifyFactionName(name) {
  return normalizeToken(name);
}
