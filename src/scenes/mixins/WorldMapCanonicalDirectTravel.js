/**
 * WorldMapCanonicalDirectTravel.js
 * =========================================================================
 * Thin interaction layer for the ONE canonical world-map UI.
 *
 * Contract:
 * - Gameplay marker -> travel directly to its declared playableMapId.
 * - Faction marker -> travel directly to faction.headquarters.playableMapId.
 * - Hierarchy/container marker -> drill down to that node (never invent a map).
 * - No fallback map IDs, no generated travel destinations, no second map UI.
 * =========================================================================
 */
import {
  findMapById,
  getWorldChildren,
  getWorldNode
} from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { travelService, TRAVEL_SOURCES } from '../../services/travelService.js';

const PATCH_OWNER = 'WorldMapCanonicalDirectTravel';

function sameId(a, b) {
  return String(a) === String(b);
}

function declaredNodeMap(node) {
  if (!node?.playableMapId) return null;
  return findMapById(node.playableMapId);
}

function resolveSelectedFactionMarker(scene, activeNodeId) {
  const selectedId = scene?.__worldMapUiState?.selectedFactionId;
  if (!selectedId || !activeNodeId) return null;

  const overlay = scene.getFactionOverlayForWorldNode?.(activeNodeId);
  const markers = overlay?.mapMarkers || [];
  return markers.find(marker =>
    selectedId === marker?.id ||
    selectedId === marker?.faction?.id ||
    selectedId === `faction:${marker?.id}`
  ) || null;
}

function declaredFactionMap(marker) {
  const faction = marker?.faction;
  const mapId = faction?.headquarters?.playableMapId;
  return mapId ? findMapById(mapId) : null;
}

function travelCanonical(scene, map, label) {
  if (!map?.id) return false;
  return travelService.travel(map.id, {
    scene,
    source: TRAVEL_SOURCES.WORLD_MAP,
    customMessage: `Đã đến: ${label || map.name}`
  });
}

export function installWorldMapCanonicalDirectTravel(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const proto = MainGameScene.prototype;
  if (proto.__worldMapCanonicalDirectTravelInstalled) return;

  const canonicalOpenMapPanel = proto.openMapPanel;
  if (typeof canonicalOpenMapPanel !== 'function') {
    throw new Error('WorldMapCanonicalDirectTravel requires WorldMapHierarchyUI first.');
  }

  proto.__worldMapCanonicalDirectTravelInstalled = true;
  proto.__worldMapInteractionOwner = PATCH_OWNER;

  proto.openMapPanel = function openHierarchicalWorldMap(
    activeNodeId = null,
    selectedMapId = null,
    page = 0
  ) {
    return canonicalOpenMapPanel.call(this, activeNodeId, selectedMapId, page);
  };
}

