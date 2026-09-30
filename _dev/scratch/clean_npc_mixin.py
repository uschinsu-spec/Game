with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\NpcMixin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace createVillageImageHotspots with clean, invisible interactive zones (no duplicate sprites, no text overlays, no shaking tweens)
old_method_start = '  createVillageImageHotspots() {'
old_method_end = '  syncVillageHubMode() {'

start_idx = content.find(old_method_start)
end_idx = content.find(old_method_end)

if start_idx != -1 and end_idx != -1:
    new_method = '''  createVillageImageHotspots() {
    this.clearVillageImageHotspots?.();
    if (Number(gameState.currentMapId) !== 0) return;

    this.villageHotspotObjects = [];

    const resetZone = (zone) => {
      if (!zone || zone.scene == null || zone.active === false) return;
      zone.setFillStyle(0xffe7a0, 0.001);
      zone.setStrokeStyle();
    };

    // Tạo các vùng tương tác trong suốt khớp với từng công trình trên ảnh nền THON TRAN.png
    VILLAGE_HOTSPOTS.forEach(def => {
      const zone = this.add.rectangle(def.x, def.y, def.width || 130, def.height || 100, 0xffe7a0, 0.001)
        .setDepth(180)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerout', () => resetZone(zone));
      zone.on('pointerup', () => resetZone(zone));
      zone.on('pointercancel', () => resetZone(zone));

      zone.on('pointerdown', pointer => {
        this.input?.stopPropagation?.();
        pointer?.event?.stopPropagation?.();
        pointer?.event?.preventDefault?.();
        this.moveTarget = null;

        // Xóa highlight cũ
        this.villageHotspotObjects?.forEach(obj => {
          if (obj?.input) resetZone(obj);
        });

        // Hiệu ứng phát sáng nhẹ khi chạm vào công trình
        zone.setFillStyle(0xffe57f, 0.15).setStrokeStyle(2, 0xffd700, 0.85);
        this.time?.delayedCall?.(120, () => resetZone(zone));

        // Chạm vào Cổng Làng: rời thôn ngay lập tức
        if (def.npcId === 've_si_cong') {
          this.leaveThanhVanVillageDirect?.();
          return;
        }

        // Mở modal tương tác NPC / công trình
        this.openNpcDialogModal?.(def.npcId);
      });

      this.villageHotspotObjects.push(zone);
    });
  },

'''
    updated = content[:start_idx] + new_method + content[end_idx:]
    with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\NpcMixin.js', 'w', encoding='utf-8') as f:
        f.write(updated)
    print("NpcMixin.js cleaned up successfully!")
else:
    print("Could not find start or end index in NpcMixin.js")
