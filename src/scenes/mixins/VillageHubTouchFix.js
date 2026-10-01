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

    const didTravel = travelService.travel(CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI, {
      scene: this,
      source: TRAVEL_SOURCES.NPC,
      spawnX: 420,
      spawnY: 620
    });
    if (!didTravel) return false;

    const blockedUntil = Date.now() + 5000;
    this.villageReentryBlockedUntil = blockedUntil;
    travelService.villageReentryBlockedUntil = blockedUntil;
    this.portalCooldownUntil = Math.max(Number(this.portalCooldownUntil || 0), blockedUntil);
    return true;
  };

  // Extra guard if another system attempts a direct teleport back to village.
  const originalTriggerPortalTeleport = proto.triggerPortalTeleport;
  if (typeof originalTriggerPortalTeleport === 'function') {
    proto.triggerPortalTeleport = function patchedTriggerPortalTeleport(portal, ...args) {
      const isVillage = portal?.targetMapId === CANONICAL_MAP_KEYS.THANH_VAN_THON || String(portal?.targetMapId) === '0' || String(portal?.targetMapId) === 'thanh_van_thon';
      const blockedUntil = Math.max(Number(this.villageReentryBlockedUntil || 0), Number(travelService.villageReentryBlockedUntil || 0));
      if (isVillage && Date.now() < blockedUntil) {
        const remainingSec = Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000));
        this.showToast?.(`⏳ Vừa rời thôn! Vui lòng chờ ${remainingSec}s trước khi quay lại.`);
        return;
      }
      return originalTriggerPortalTeleport.call(this, portal, ...args);
    };
  }
}
