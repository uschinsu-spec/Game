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
    // A marker click in WorldMapHierarchyUI passes the clicked world-node ID as
    // selectedMapId while activeNodeId remains the current parent level.
    if (selectedMapId != null) {
      const selectedNode = getWorldNode(String(selectedMapId));

      if (selectedNode) {
        const map = declaredNodeMap(selectedNode);
        if (map) {
          const travelled = travelCanonical(this, map, selectedNode.name || map.name);
          if (travelled) return true;
          // If travel is blocked (realm/current map/etc.), keep the canonical
          // detail panel visible so the player can see the reason/status.
          return canonicalOpenMapPanel.call(this, activeNodeId, selectedMapId, page);
        }

        // Administrative hierarchy nodes are not runtime maps. One tap drills
        // down to their children instead of pretending they are destinations.
        if (!sameId(selectedNode.id, activeNodeId) && getWorldChildren(selectedNode.id).length) {
          if (this.__worldMapUiState) this.__worldMapUiState.selectedFactionId = null;
          return canonicalOpenMapPanel.call(this, selectedNode.id, null, 0);
        }
      }

      // Some callers may pass a canonical map ID instead of a node ID. Travel
      // only when it is not the explicit "open details for this same node" call.
      const directMap = findMapById(selectedMapId);
      if (directMap && !sameId(directMap.locationNodeId, activeNodeId)) {
        const travelled = travelCanonical(this, directMap, directMap.name);
        if (travelled) return true;
      }
    }

    // Faction marker click stores selectedFactionId and reopens the same node.
    // Resolve only the fixed faction object's declared headquarters map.
    if (selectedMapId == null && activeNodeId != null) {
      const marker = resolveSelectedFactionMarker(this, activeNodeId);
      const factionMap = declaredFactionMap(marker);
      if (marker?.faction && factionMap) {
        const travelled = travelCanonical(this, factionMap, marker.faction.name || factionMap.name);
        if (travelled) {
          if (this.__worldMapUiState) this.__worldMapUiState.selectedFactionId = null;
          return true;
        }
      }
    }

    return canonicalOpenMapPanel.call(this, activeNodeId, selectedMapId, page);
  };
}
