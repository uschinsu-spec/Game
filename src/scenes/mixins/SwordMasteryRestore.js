// SwordMasteryRestore.js
// Chỉ sửa đúng lỗi của KIẾM 1: Sơ Nhập 1 kiếm, Tiểu Thành 2 kiếm,
// Đại Thành 3 kiếm, Viên Mãn 4 kiếm.
// Bốn skill Kiếm còn lại giữ NGUYÊN choreography/VFX trong CombatMixin gốc.

function masteryIndex(mastery) {
  const idx = Number(mastery?.tierIdx ?? mastery?.tier?.idx ?? 0);
  return Math.max(0, Math.min(3, Number.isFinite(idx) ? idx : 0));
}

function onScreen(scene, enemy, padding = 20) {
  if (!enemy || !enemy.active || enemy.isDead) return false;
  return typeof scene.isEnemyOnScreen === 'function' ? scene.isEnemyOnScreen(enemy, padding) : true;
}

export function installSwordMasteryRestore(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__swordMasteryRestoreInstalled) return;
  proto.__swordMasteryRestoreInstalled = true;

  const originalCastElementalSkill = proto.castElementalSkill;
  if (typeof originalCastElementalSkill !== 'function') return;

  proto.castElementalSkill = function castElementalSkillRestoreSword(skill, target, baseDmg, elemColors, mastery) {
    // KHÔNG đụng vào Kiếm 2/3/4/5 và toàn bộ hệ khác.
    // Chúng chạy nguyên renderer đã thiết kế trong CombatMixin gốc.
    if (skill?.id !== 'kiem_1') {
      return originalCastElementalSkill.call(this, skill, target, baseDmg, elemColors, mastery);
    }

    const tierIdx = masteryIndex(mastery);
    const countByMastery = [1, 2, 3, 4];
    const projectileCount = countByMastery[tierIdx];
    const masteryName = mastery?.tier?.name || ['Sơ Nhập', 'Tiểu Thành', 'Đại Thành', 'Viên Mãn'][tierIdx];
    const masteryColor = mastery?.tier?.color || ['#aaddff', '#55ff99', '#ffd700', '#ff44dd'][tierIdx];

    const startX = this.player.x;
    const startY = this.player.y - 15;
    const facingDir = this.player.flipX ? -1 : 1;

    let endX = target && onScreen(this, target, 20) ? target.x : startX + facingDir * 200;
    let endY = target && onScreen(this, target, 20) ? target.y - 15 : startY;

    const cam = this.cameras?.main;
    if (cam) {
      const view = cam.worldView;
      const minX = (view ? view.x : cam.scrollX) + 35;
      const maxX = (view ? view.right : cam.scrollX + cam.width) - 35;
      const minY = (view ? view.y : cam.scrollY) + 55;
      const maxY = (view ? view.bottom : cam.scrollY + cam.height) - 55;
      endX = Phaser.Math.Clamp(endX, minX, maxX);
      endY = Phaser.Math.Clamp(endY, minY, maxY);
    }

    const dist = Phaser.Math.Distance.Between(startX, startY, endX, endY);
    const flyDuration = Math.max(90, Math.round((dist / 270) * 1000));
    const pScale = Math.abs(this.player.scaleX || 0.85);
    const startScale = pScale * 0.50;

    let targetScale = startScale;
    if (target && target.active) {
      const eScale = Math.abs(target.scaleX || 0.50);
      targetScale = Phaser.Math.Clamp(eScale * (target.isBoss ? 1.30 : 1.00), 0.40, 1.70);
    }

    const offsetsByCount = {
      1: [0],
      2: [-38, 38],
      3: [-58, 0, 58],
      4: [-70, -24, 24, 70]
    };
    const arcOffsets = offsetsByCount[projectileCount];
    const tints = [0xffea66, 0x00e5ff, 0xff3355, 0xaa44ff];
    const perProjDmg = Math.max(1, Math.floor(baseDmg / projectileCount));
    const projKey = this.textures.exists('vfx_kim_1_0') ? 'vfx_kim_1_0' : 'vfx_sword_kiem_khi';
    const impactKey = this.textures.exists('vfx_impact_frame7') ? 'vfx_impact_frame7' : 'vfx_sword_impact_frame7';

    for (let i = 0; i < projectileCount; i++) {
      const offsetDist = arcOffsets[i];
      const tint = tierIdx === 0 ? 0xffea66 : tints[i % tints.length];

      this.time.delayedCall(i * 35, () => {
        const proj = this.add.sprite(startX, startY, projKey)
          .setDepth(Math.floor(this.player.y) + 50 + i)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(startScale)
          .setTint(tint);

        if (this.anims.exists('anim_vfx_kiem_1')) proj.play('anim_vfx_kiem_1');

        const proxy = { t: 0 };
        this.tweens.add({
          targets: proxy,
          t: 1,
          duration: flyDuration,
          ease: 'Quad.easeInOut',
          onUpdate: () => {
            const curTargetX = target && target.active ? target.x : endX;
            const curTargetY = target && target.active ? target.y - 15 : endY;
            const angle = Phaser.Math.Angle.Between(startX, startY, curTargetX, curTargetY);
            const nx = -Math.sin(angle);
            const ny = Math.cos(angle);
            const ctrlX = (startX + curTargetX) / 2 + nx * offsetDist;
            const ctrlY = (startY + curTargetY) / 2 + ny * offsetDist;
            const t = proxy.t;
            const omt = 1 - t;
            const bx = omt * omt * startX + 2 * omt * t * ctrlX + t * t * curTargetX;
            const by = omt * omt * startY + 2 * omt * t * ctrlY + t * t * curTargetY;
            proj.setPosition(bx, by);
            const dx = 2 * omt * (ctrlX - startX) + 2 * t * (curTargetX - ctrlX);
            const dy = 2 * omt * (ctrlY - startY) + 2 * t * (curTargetY - ctrlY);
            proj.setRotation(Math.atan2(dy, dx));
            proj.setScale(startScale + (targetScale - startScale) * t);
          },
          onComplete: () => {
            const finalRotation = proj.rotation || 0;
            proj.destroy();
            const hitX = target && target.active ? target.x : endX;
            const hitY = target && target.active ? target.y - 15 : endY;

            if (this.textures.exists(impactKey)) {
              const hit = this.add.sprite(hitX, hitY, impactKey)
                .setDepth(Math.floor(hitY) + 58)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setScale(targetScale * 0.30)
                .setAlpha(0.06)
                .setRotation(finalRotation)
                .setTint(tint);
              this.tweens.add({
                targets: hit,
                scaleX: targetScale * 1.15,
                scaleY: targetScale * 1.15,
                alpha: 0,
                duration: 220,
                ease: 'Cubic.easeOut',
                onComplete: () => hit.destroy()
              });
            }

            if (target && onScreen(this, target, 20)) {
              this.damageEnemy(target, perProjDmg, tierIdx >= 2 && i === 0);
            }
          }
        });
      });
    }

    this.showFloatingText(
      this.player.x,
      this.player.y - 70,
      `[Kiếm • ${masteryName}] ${skill.name}!`,
      masteryColor,
      '13px'
    );
  };
}
