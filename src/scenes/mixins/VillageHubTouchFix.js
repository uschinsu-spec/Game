import { W } from '../constants.js';
import { VILLAGE_HOTSPOTS, VILLAGE_DECORATIONS } from '../../config/npcData.js?v=20260929-village-thon-tran-v2';

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

    // Xuất hiện an toàn ngoài cổng dịch chuyển tại Ngoại Vi (Map 1)
    this.switchMap?.(1, 420, 620);
    return true;
  };

  // Extra guard if another system attempts a direct teleport back to map 0.
  const originalTriggerPortalTeleport = proto.triggerPortalTeleport;
  if (typeof originalTriggerPortalTeleport === 'function') {
    proto.triggerPortalTeleport = function patchedTriggerPortalTeleport(portal, ...args) {
      const now = Number(this.time?.now || 0);
      if (Number(portal?.targetMapId) === 0 && now < Number(this.villageReentryBlockedUntil || 0)) {
        return;
      }
      return originalTriggerPortalTeleport.call(this, portal, ...args);
    };
  }
}
