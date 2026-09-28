import { W } from '../constants.js';

const VILLAGE_HOTSPOTS = Object.freeze([
  { npcId: 'truong_thon', x: 270, y: 118, width: 205, height: 92 },
  { npcId: 'nong_phu',    x: 478, y: 205, width: 124, height: 118 },
  { npcId: 'tho_ren',     x: 100, y: 326, width: 165, height: 145 },
  { npcId: 'thuong_hoi',  x: 270, y: 405, width: 178, height: 126 },
  { npcId: 'tuu_lau',     x: 367, y: 526, width: 184, height: 128 },
  { npcId: 'duoc_diem',   x: 126, y: 590, width: 188, height: 142 },
  { npcId: 'tho_xay',     x: 473, y: 747, width: 132, height: 128 },
  { npcId: 've_si_cong',  x: 270, y: 825, width: 190, height: 150 }
]);

/**
 * Mobile hotfix for the Thanh Van Village image hub.
 *
 * - Touching a hotspot must never leave the highlight rectangle stuck on
 *   screen after a modal is closed (iOS Safari does not always emit
 *   pointerout after a touch).
 * - Touching the gate guard leaves the village immediately, without opening
 *   any confirmation/NPC panel.
 * - Re-entry to Thanh Van Village is blocked for 5 seconds after leaving so
 *   the player cannot bounce straight back through the return portal.
 */
export function installVillageHubTouchFix(SceneClass) {
  const proto = SceneClass?.prototype;
  if (!proto || proto.__villageHubTouchFixInstalled) return;
  proto.__villageHubTouchFixInstalled = true;

  proto.leaveThanhVanVillageDirect = function leaveThanhVanVillageDirect() {
    if (Number(this.gameState?.currentMapId) !== 0) return false;

    this.closeModal?.();
    this.moveTarget = null;

    const now = Number(this.time?.now || 0);
    const blockedUntil = now + 5000;
    this.villageReentryBlockedUntil = blockedUntil;
    this.portalCooldownUntil = Math.max(Number(this.portalCooldownUntil || 0), blockedUntil);

    // Same safe spawn as the previous gate action; outside the return portal.
    this.switchMap?.(1, 420, 620);
    return true;
  };

  proto.createVillageImageHotspots = function createVillageImageHotspotsFixed() {
    this.clearVillageImageHotspots?.();
    if (Number(this.gameState?.currentMapId) !== 0) return;

    this.villageHotspotObjects = [];

    const resetZone = (zone) => {
      if (!zone || zone.scene == null || zone.active === false) return;
      zone.setFillStyle(0xffe7a0, 0.001);
      zone.setStrokeStyle();
    };

    VILLAGE_HOTSPOTS.forEach(def => {
      const zone = this.add.rectangle(def.x, def.y, def.width, def.height, 0xffe7a0, 0.001)
        .setDepth(180)
        .setInteractive({ useHandCursor: true });

      // Avoid persistent pointerover styling. On iPhone/iPad Safari a touch can
      // emit pointerover without a matching pointerout, leaving stale borders.
      zone.on('pointerout', () => resetZone(zone));
      zone.on('pointerup', () => resetZone(zone));
      zone.on('pointercancel', () => resetZone(zone));

      zone.on('pointerdown', pointer => {
        this.input?.stopPropagation?.();
        pointer?.event?.stopPropagation?.();
        pointer?.event?.preventDefault?.();
        this.moveTarget = null;

        // Remove any old highlight left by a previous touch before doing anything.
        this.villageHotspotObjects?.forEach(obj => {
          if (obj?.input) resetZone(obj);
        });

        // Gate guard: one tap = leave immediately. No dialog, no confirmation.
        if (def.npcId === 've_si_cong') {
          this.leaveThanhVanVillageDirect?.();
          return;
        }

        // Short tap feedback only; always clear it even if pointerout never fires.
        zone.setFillStyle(0xffffff, 0.12).setStrokeStyle(2, 0xffefad, 0.85);
        this.time?.delayedCall?.(90, () => resetZone(zone));
        this.openNpcDialogModal?.(def.npcId);
      });

      this.villageHotspotObjects.push(zone);
    });

    const hintBg = this.add.rectangle(W / 2, 24, 314, 32, 0x071b25, 0.88)
      .setStrokeStyle(1.5, 0xffdf8c, 0.9)
      .setDepth(181);
    const hint = this.add.text(W / 2, 24, '☝ CHẠM VÀO TÊN CHỨC NĂNG TRÊN BẢN ĐỒ', {
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#fff3bd'
    }).setOrigin(0.5).setDepth(182);

    this.villageHotspotObjects.push(hintBg, hint);
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
