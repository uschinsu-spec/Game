/**
 * WorldMapFactionOverlay.js
 * Read-only projection of the FIXED canonical faction atlas onto the world map.
 * It never assigns, generates, rotates or substitutes factions for jurisdictions.
 */

function uniqueCanonicalMarkers(markers, limit = 8) {
  const seen = new Set();
  const out = [];
  for (const marker of markers || []) {
    if (!marker?.factionId || !marker?.worldNodeId) continue;
    const faction = marker.faction;
    if (!faction || faction.meta?.canonical !== true || faction.meta?.declarationMode !== 'fixed') continue;
    const key = `${marker.factionId}@@${marker.worldNodeId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(marker);
    if (out.length >= Math.max(1, limit)) break;
  }
  return Object.freeze(out);
}

function collectFixedMapMarkers(network, worldAdapter, worldNodeId, markerLimit = 8) {
  if (!worldNodeId) return Object.freeze([]);

  // 1) Faction cố định của chính node hiện tại, nếu node này là jurisdiction có ruler.
  const own = network.getFactionMapMarkersForWorldNode?.(worldNodeId, { limit: markerLimit }) || [];
  const ownDirect = own.filter(marker => String(marker?.worldNodeId) === String(worldNodeId));

  // 2) Faction cố định của các jurisdiction con trực tiếp.
  // Đây chỉ là đọc declaration đã có; tuyệt đối không tự phân bổ faction.
  const children = worldAdapter?.getChildren?.(worldNodeId, { offset: 0, limit: 64 }) || [];
  const childDirect = [];
  for (const child of children) {
    const markers = network.getFactionMapMarkersForWorldNode?.(child.id, { limit: 4 }) || [];
    const exact = markers.find(marker => String(marker?.worldNodeId) === String(child.id));
    if (exact) childDirect.push(exact);
  }

  return uniqueCanonicalMarkers([...ownDirect, ...childDirect], markerLimit);
}

export function buildFactionOverlayModel(network, territoryId, coordinator, {
  worldNodeId = null,
  markerLimit = 8,
  mapMarkers = null
} = {}) {
  if (!territoryId && !worldNodeId) return null;

  const canonicalMarkers = mapMarkers || (worldNodeId
    ? (network.getFactionMapMarkersForWorldNode?.(worldNodeId, { limit: markerLimit }) || [])
    : []);

  if (!territoryId) {
    return Object.freeze({
      territoryId: null,
      worldNodeId,
      controllers: null,
      contested: false,
      powerVacuum: null,
      topFactions: Object.freeze([]),
      mapMarkers: Object.freeze([...canonicalMarkers])
    });
  }

  const influence = network.getInfluenceForTerritory(territoryId);
  const vacuum = coordinator?.powerVacuumByTerritory?.get(territoryId);
  return Object.freeze({
    territoryId,
    worldNodeId,
    controllers: network.getTerritoryControllers(territoryId),
    contested: Boolean(vacuum),
    powerVacuum: vacuum || null,
    topFactions: network.getRelevantFactionsForTerritory(territoryId, { limit: 8 }).map(f => Object.freeze({
      id: f.id,
      name: f.name,
      archetype: f.archetype,
      powerTier: f.powerTier,
      influence: influence.find(x => x.factionId === f.id)?.influence || {}
    })),
    mapMarkers: Object.freeze([...canonicalMarkers])
  });
}

export function installWorldMapFactionOverlay(MainGameScene, { network, worldAdapter, coordinator } = {}) {
  if (!MainGameScene?.prototype) return;
  const p = MainGameScene.prototype;
  if (p.__worldMapFactionOverlayInstalled) return;
  p.__worldMapFactionOverlayInstalled = true;

  p.getFactionOverlayForWorldNode = function getFixedFactionOverlayForWorldNode(nodeId) {
    const territory = worldAdapter?.getTerritoryForWorldNode?.(nodeId) || worldAdapter?.getTerritory?.(nodeId);
    const mapMarkers = collectFixedMapMarkers(network, worldAdapter, nodeId, 8);
    return buildFactionOverlayModel(network, territory?.id || null, coordinator, {
      worldNodeId: nodeId,
      markerLimit: 8,
      mapMarkers
    });
  };
}
