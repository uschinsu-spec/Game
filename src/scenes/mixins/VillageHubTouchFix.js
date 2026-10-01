import { W } from '../constants.js';
import { VILLAGE_HOTSPOTS, VILLAGE_DECORATIONS } from '../../config/npcData.js?v=20260929-village-thon-tran-v2';
import { CANONICAL_MAP_KEYS } from '../../config/world/masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';
import { travelService, TRAVEL_SOURCES } from '../../services/travelService.js';

/**
 * Mobile touch & portal guard fix for the Thanh Van Village image hub.
 */
export function installVillageHubTouchFix(SceneClass) {
  const proto = SceneClass?.prototype;
  if (!proto || proto.__villageHubTouchFixInstalled) return;
  proto.__villageHubTouchFixInstalled = true;

  proto.leaveThanhVanVillageDirect = function leaveThanhVanVillageDirect() {
    this.closeModal?.();
    this.moveTarget = null;

    const now = Number(this.time?.now || 0);
    const blockedUntil = now + 5000;
    this.villageReentryBlockedUntil = blockedUntil;
    this.portalCooldownUntil = Math.max(Number(this.portalCooldownUntil || 0), blockedUntil);

    // Xuất hiện an toàn ngoài cổng dịch chuyển tại Ngoại Vi qua TravelService
    travelService.travel(CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI, {
      scene: this,
      source: TRAVEL_SOURCES.NPC,
      spawnX: 420,
      spawnY: 620
    });
    return true;
  };

  // Extra guard if another system attempts a direct teleport back to village.
  const originalTriggerPortalTeleport = proto.triggerPortalTeleport;
  if (typeof originalTriggerPortalTeleport === 'function') {
    proto.triggerPortalTeleport = function patchedTriggerPortalTeleport(portal, ...args) {
      const now = Number(this.time?.now || 0);
      const isVillage = portal?.targetMapId === CANONICAL_MAP_KEYS.THANH_VAN_THON || String(portal?.targetMapId) === '0';
      if (isVillage && now < Number(this.villageReentryBlockedUntil || 0)) {
        return;
      }
      return originalTriggerPortalTeleport.call(this, portal, ...args);
    };
  }
}
