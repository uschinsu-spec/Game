/**
 * CombatMixin.js
 * Quản lý: basicAttack, castSkill, spawnSpellVfx, damageEnemy, takePlayerDamage,
 *           gainExp, playerDeath, respawnPlayer, onSecondTick
 */
import { REALMS } from '../../config/realmsData.js';
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js?v=20260928-sword-only-v2';
import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';
import { getItemByName, getItemQuantity, removeItem, useItem, getEquipmentStats, damageEquippedDurability } from './ItemSystem.js?v=20261001-item-v3';

export const CombatMixin = {

  basicAttack() {
    if (this.gameplayPaused || this.__uiHardPaused || this.isModalOpen?.()) return;
    if (this.time.now < this.lastBasic + 280) return;
    this.lastBasic = this.time.now;

    // Đánh quái: Tự động ngắt trạng thái nghỉ ngơi / tĩnh tọa
    if (this.cancelRestingState) {
      this.cancelRestingState();
    }

    // Auto reuses the 3 Hz cached target; manual combat keeps direct targeting.
    let target = null;
    if (gameState.autoFight) {
      const cached = this.__autoPlayerTarget;
      if (cached && cached.active && !cached.isDead && cached.visible && this.isEnemyOnScreen?.(cached, 20)) {
        const dx = cached.x - this.player.x;
        const dy = cached.y - this.player.y;
        if ((dx * dx + dy * dy) <= 160 * 160) target = cached;
      }
    } else {
      target = this.nearestEnemy(160, true);
    }
    if (target && target.active) {
      this.player.setFlipX(target.x < this.player.x);
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
      if (dist > 100 && !gameState.autoFight) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        this.player.x += Math.cos(angle) * Math.min(dist - 80, 40);
        this.player.y += Math.sin(angle) * Math.min(dist - 80, 25);
      }
    }

    if (this.player && this.player.active) {
      const atkInterval = this.calcPlayerAtkInterval ? this.calcPlayerAtkInterval() : 380;
      const animDuration = Math.min(500, Math.max(280, Math.floor(atkInterval * 0.82)));
      if (this.playPlayerAttackAnimation) this.playPlayerAttackAnimation(animDuration);
      else {
        const isTrucCoOrAbove = (Number(gameState.realmIdx) || 0) >= 13;
        this.attackUntil = this.time.now + animDuration;
        this.player.play(isTrucCoOrAbove ? 'p_fly_attack' : 'p_attack', true);
      }
    }

    if (target && target.active && !target.isDead) {
      const curDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
      if (curDist <= 135) {
        const sense = this.calcPlayerSpiritualSense ? this.calcPlayerSpiritualSense() : (gameState.spiritualSense || 10);
        const itemStats = getEquipmentStats();
        const critRate = Math.min(0.95, 0.15 + (sense * 0.005) + Number(itemStats.critRate || 0) / 100);
        const isCrit = Math.random() < critRate;
        let dmg = this.calcPlayerElementalDmg ? this.calcPlayerElementalDmg('Vật Lý') : (this.playerDmg || 1);
        if (isCrit) dmg = Math.floor(dmg * (1.85 + Number(itemStats.critDamage || 0) / 100));
        this.damageEnemy(target, dmg, isCrit);
        this.spawnVfx(target.x, target.y, 0, 0.65, { duration: 220, grow: 1.3, tint: 0xffeedd });

        // Direct Combat Hook
        if (typeof this.onBasicAttackHit === 'function') {
          this.onBasicAttackHit(target, dmg, isCrit);
        }
      }
    }
  },

  // ==================================================================
  // CAST EQUIPPED SKILL (1..5) — HỆ THỐNG SKILL 9 HỆ
  // ==================================================================
  castSkill(skillId) {
    if (this.gameplayPaused || this.__uiHardPaused || this.isModalOpen?.()) return;
    if (skillId === 'basic_attack') {
      this.basicAttack();
      return;
    }
    const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    const atkInterval = this.calcPlayerAtkInterval ? this.calcPlayerAtkInterval() : 400;

    // Fast skills / zero cd skills depend on player attack speed
    if (skill.cd === 0 || skill.id === 'kiem_1' || skill.id === 'kiem_2') {
      const lastCastKey = `last_${skill.id}_cast`;
      if (this[lastCastKey] && this.time.now < this[lastCastKey] + atkInterval) return;
      this[lastCastKey] = this.time.now;
      this.activeSkillCds[skillId] = atkInterval;
    } else {
      if (this.activeSkillCds[skillId] > 0) return;
      this.activeSkillCds[skillId] = skill.cd;
    }

    // Direct Combat Hook: onSkillCastSuccess
    if (typeof this.onSkillCastSuccess === 'function') {
      this.onSkillCastSuccess(skillId, skill);
    }

    // Tung kỹ năng: Tự động ngắt trạng thái nghỉ ngơi / tĩnh tọa
    if (this.cancelRestingState) {
      this.cancelRestingState();
    }

    // Auto reuses the 3 Hz cached target instead of scanning again on every cast.
    let target = null;
    if (gameState.autoFight) {
      const cached = this.__autoPlayerTarget;
      if (cached && cached.active && !cached.isDead && cached.visible && this.isEnemyOnScreen?.(cached, 20)) {
        const dx = cached.x - this.player.x;
        const dy = cached.y - this.player.y;
        if ((dx * dx + dy * dy) <= 460 * 460) target = cached;
      }
    } else {
      target = this.nearestEnemy(460, true);
    }
    if (target && target.active) {
      this.player.setFlipX(target.x < this.player.x);
    }

    if (this.player && this.player.active) {
      const isFastSkill = (skill.cd === 0 || skill.id === 'kiem_1' || skill.id === 'kiem_2');
      const animDuration = isFastSkill
        ? Math.min(420, Math.max(280, Math.floor(atkInterval * 0.75)))
        : 450;
      if (this.playPlayerAttackAnimation) this.playPlayerAttackAnimation(animDuration);
      else {
        const isTrucCoOrAbove = (Number(gameState.realmIdx) || 0) >= 13;
        this.attackUntil = this.time.now + animDuration;
        this.player.play(isTrucCoOrAbove ? 'p_fly_attack' : 'p_attack', true);
      }
    }

    const elemColors = {
      'Kiếm': '#99eeff',
      'Kim': '#ffd700',
      'Hỏa': '#ff4422',
      'Thủy': '#44aaff',
      'Thổ': '#aa8844',
      'Mộc': '#44dd66',
      'Phong': '#66ffcc',
      'Lôi': '#ffee33',
      'Vật Lý': '#ff88aa'
    };

    // Tăng điểm thuần thục kỹ năng mỗi khi thi triển (Sơ Nhập -> Tiểu Thành -> Đại Thành -> Viên Mãn)
    const mastery = this.gainSkillExp ? this.gainSkillExp(skillId, 1) : (this.getSkillMastery ? this.getSkillMastery(skillId) : { tier: { dmgBonus: 0, vfxMul: 1.0, name: 'Sơ Nhập', color: '#aaddff' } });
    const masteryDmgBonus = mastery.tier.dmgBonus || 0;
    const elemDmg = this.calcPlayerElementalDmg ? this.calcPlayerElementalDmg(skill.elem || 'Kiếm') : (this.playerDmg || 1);
    const baseDmg = Math.max(1, Math.floor(elemDmg * (skill.dmgMul || 1) * (1 + masteryDmgBonus)));

    if (skill.elem === 'Kiếm' || String(skill.id).startsWith('kiem_')) {
      this.castSwordSkill(skill, target, baseDmg, elemColors, mastery);
    } else {
      this.castElementalSpell(skill, target, baseDmg, elemColors, mastery);
    }
  },

  castElementalSpell(skill, target, baseDmg, elemColors, mastery) {
    const elemKeyMap = {
      'Kiếm': 'kim',
      'Kim': 'kim',
      'Hỏa': 'hoa',
      'Thủy': 'thuy',
      'Thổ': 'tho',
      'Mộc': 'moc',
      'Phong': 'phong',
      'Lôi': 'loi',
      'Vật Lý': 'ly'
    };
    const eKey = elemKeyMap[skill.elem] || 'kim';
    const elemColor = elemColors[skill.elem] || '#ffd700';
    const vfxMul = (mastery.tier && mastery.tier.vfxMul) ? mastery.tier.vfxMul : 1.0;

    let tierLevel = 1;
    if (skill.minRealm >= 16) tierLevel = 5;
    else if (skill.minRealm >= 12) tierLevel = 4;
    else if (skill.minRealm >= 8) tierLevel = 3;
    else if (skill.minRealm >= 4) tierLevel = 2;

    const tx = (target && target.active) ? target.x : this.player.x + (this.player.flipX ? -200 : 200);
    const ty = (target && target.active) ? target.y : this.player.y;

    if (tierLevel === 1 || tierLevel === 2) {
      const projKey = (tierLevel === 2 && this.textures.exists(`vfx_${eKey}_2`)) ? `vfx_${eKey}_2` : (this.textures.exists(`vfx_${eKey}_1_0`) ? `vfx_${eKey}_1_0` : (this.textures.exists(`vfx_${eKey}_1`) ? `vfx_${eKey}_1` : 'vfx_kim_1_0'));
      const startX = this.player.x;
      const startY = this.player.y - 15;
      const proj = this.add.sprite(startX, startY, projKey)
        .setDepth(Math.floor(this.player.y) + 50)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(0.65 * vfxMul);

      if (this.anims.exists(`anim_vfx_${eKey}_1`)) {
        proj.play(`anim_vfx_${eKey}_1`);
      }

      const angle = Phaser.Math.Angle.Between(startX, startY, tx, ty - 15);
      proj.setRotation(angle);

      const dist = Phaser.Math.Distance.Between(startX, startY, tx, ty - 15);
      const dur = Math.max(100, Math.round((dist / 320) * 1000));

      this.tweens.add({
        targets: proj,
        x: tx,
        y: ty - 15,
        duration: dur,
        ease: 'Linear',
        onComplete: () => {
          proj.destroy();
          const impactKey = this.textures.exists(`vfx_${eKey}_1_7`) ? `vfx_${eKey}_1_7` : (this.textures.exists(`vfx_${eKey}_impact`) ? `vfx_${eKey}_impact` : 'vfx_impact_frame7');
          if (this.textures.exists(impactKey)) {
            const imp = this.add.sprite(tx, ty - 15, impactKey)
              .setDepth(Math.floor(ty) + 55)
              .setBlendMode(Phaser.BlendModes.ADD)
              .setScale(0.85 * vfxMul);
            this.tweens.add({
              targets: imp,
              scaleX: 1.4 * vfxMul,
              scaleY: 1.4 * vfxMul,
              alpha: 0,
              duration: 220,
              onComplete: () => imp.destroy()
            });
          }
          if (target && target.active && this.isEnemyOnScreen(target, 40)) {
            this.damageEnemy(target, baseDmg, tierLevel === 2);
          }
        }
      });
    } else if (tierLevel === 3) {
      const arrayKey = this.textures.exists(`vfx_${eKey}_3`) ? `vfx_${eKey}_3` : 'vfx_kim_3_0';
      const arrayImg = this.add.image(tx, ty, arrayKey)
        .setDepth(Math.floor(ty) - 5)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(1.2 * vfxMul)
        .setAlpha(0.2);

      this.tweens.add({
        targets: arrayImg,
        alpha: 0.9,
        scaleX: 1.5 * vfxMul,
        scaleY: 1.5 * vfxMul,
        duration: 400,
        yoyo: true,
        repeat: 2,
        onComplete: () => arrayImg.destroy()
      });

      for (let tick = 0; tick < 3; tick++) {
        this.time.delayedCall(tick * 350, () => {
          [...this.enemies].forEach(t => {
            if (!t || !t.active || !this.isEnemyOnScreen(t, 40)) return;
            const dist = Phaser.Math.Distance.Between(t.x, t.y, tx, ty);
            if (dist < 150) {
              this.damageEnemy(t, Math.max(1, Math.floor(baseDmg / 3)), tick === 0);
              this.spawnVfx(t.x, t.y - 15, 0, 0.6 * vfxMul, { duration: 180 });
            }
          });
        });
      }
    } else if (tierLevel === 4) {
      const swarmKey = this.textures.exists(`vfx_${eKey}_4`) ? `vfx_${eKey}_4` : (this.textures.exists(`vfx_${eKey}_1`) ? `vfx_${eKey}_1` : 'vfx_kim_1_0');
      for (let i = 0; i < 8; i++) {
        const angle = (i * 2 * Math.PI) / 8;
        const sx = tx + Math.cos(angle) * 120;
        const sy = ty + Math.sin(angle) * 80 - 180;
        this.time.delayedCall(i * 45, () => {
          const missile = this.add.sprite(sx, sy, swarmKey)
            .setDepth(Math.floor(ty) + 40)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(0.7 * vfxMul);
          this.tweens.add({
            targets: missile,
            x: tx + Phaser.Math.Between(-40, 40),
            y: ty + Phaser.Math.Between(-20, 20),
            duration: 250,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              missile.destroy();
              this.spawnVfx(missile.x, missile.y, 0, 0.5 * vfxMul, { duration: 150 });
            }
          });
        });
      }
      this.time.delayedCall(400, () => {
        [...this.enemies].forEach(t => {
          if (!t || !t.active || !this.isEnemyOnScreen(t, 40)) return;
          const dist = Phaser.Math.Distance.Between(t.x, t.y, tx, ty);
          if (dist < 180) {
            this.damageEnemy(t, baseDmg, true);
          }
        });
      });
    } else if (tierLevel === 5) {
      const colossusKey = this.textures.exists(`vfx_${eKey}_5`) ? `vfx_${eKey}_5` : (this.textures.exists('vfx_giant_tru_tien_sword') ? 'vfx_giant_tru_tien_sword' : 'vfx_kim_1_0');
      const giant = this.add.sprite(tx, ty - 380, colossusKey)
        .setDepth(Math.floor(ty) + 80)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(1.2 * vfxMul);

      this.tweens.add({
        targets: giant,
        y: ty - 15,
        duration: 350,
        ease: 'Quad.easeIn',
        onComplete: () => {
          giant.destroy();
          const shockKey = this.textures.exists(`vfx_${eKey}_shockwave`) ? `vfx_${eKey}_shockwave` : 'vfx_tru_tien_shockwave';
          if (this.textures.exists(shockKey)) {
            const shock = this.add.image(tx, ty, shockKey)
              .setDepth(Math.floor(ty) + 40)
              .setBlendMode(Phaser.BlendModes.ADD)
              .setTint(tintHex)
              .setScale(0.5)
              .setAlpha(0.55);
            this.tweens.add({
              targets: shock,
              scaleX: 2.0 * vfxMul,
              scaleY: 2.0 * vfxMul,
              alpha: 0,
              duration: 400,
              onComplete: () => shock.destroy()
            });
          }
          [...this.enemies].forEach(t => {
            if (!t || !t.active || !this.isEnemyOnScreen(t, 40)) return;
            const dist = Phaser.Math.Distance.Between(t.x, t.y, tx, ty);
            if (dist < 260) {
              this.damageEnemy(t, baseDmg, true);
              this.spawnVfx(t.x, t.y - 15, 0, 0.9 * vfxMul, { duration: 250 });
            }
          });
        }
      });
    }

    this.showFloatingText(this.player.x, this.player.y - 70, `[${skill.elem} • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || elemColor, '14px');
  },

  // no-op kept for compatibility — HP is in this.playerHp
  updateHpBar() {},

  spawnSpellVfx(x, y, texKey, scale = 0.7, duration = 650, isSpin = false) {
    if (!this.textures.exists(texKey)) return;
    const vfx = this.add.image(x, y, texKey)
      .setScale(scale * 0.4)
      .setAlpha(1)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(Math.floor(y) + 50);

    this.tweens.add({
      targets: vfx,
      scaleX: scale * (isSpin ? 1.3 : 1.1),
      scaleY: scale * (isSpin ? 1.3 : 1.1),
      angle: isSpin ? 360 : 0,
      alpha: 0,
      duration,
      ease: 'Cubic.easeOut',
      onComplete: () => vfx.destroy()
    });
  },

  damageEnemy(enemy, dmg, isCrit, attacker = { type: 'player', name: 'Bạn' }) {
    if (!enemy || !enemy.active || enemy.isDead) return;
    let incoming = Math.max(1, Number(dmg) || 1);
    const isPlayerAttack = (attacker?.type || 'player') === 'player';
    if (isPlayerAttack) {
      const stats = getEquipmentStats();
      const rawDef = Math.max(0, Number(enemy?.monsterData?.def ?? enemy?.def ?? 0));
      const effectiveDef = rawDef * (1 - Math.min(95, Math.max(0, Number(stats.armorPen || 0))) / 100);
      incoming = Math.max(1, incoming - effectiveDef);
    }
    const finalDmg = Math.max(1, Math.floor(incoming));
    enemy.hp -= finalDmg;

    if (isPlayerAttack) {
      const lifeSteal = Math.max(0, Number(getEquipmentStats().lifeSteal || 0));
      if (lifeSteal > 0 && Number.isFinite(this.playerHpMax)) {
        const heal = Math.max(0, Math.floor(finalDmg * Math.min(50, lifeSteal) / 100));
        if (heal > 0) this.playerHp = Math.min(this.playerHpMax, Number(this.playerHp || 0) + heal);
      }
    }

    if (attacker?.type === 'player' && this.cancelRestingState) {
      this.cancelRestingState();
    }

    if (!enemy.damageDealers) {
      enemy.damageDealers = {};
    }
    const attType = attacker?.type || 'player';
    const attName = attacker?.name || (attType === 'player' ? 'Bạn' : 'Hiệp Khách');
    const attKey = attType === 'player' ? 'player' : (attacker?.id || `${attType}_${attName}`);

    if (!enemy.damageDealers[attKey]) {
      enemy.damageDealers[attKey] = {
        key: attKey,
        type: attType,
        name: attName,
        title: attacker?.title || '',
        totalDmg: 0,
        ref: attacker?.ref || null
      };
    }
    enemy.damageDealers[attKey].totalDmg += finalDmg;

    this.showFloatingText(enemy.x, enemy.y - 45, `-${finalDmg}`, isCrit ? '#ff3344' : '#ffffff', isCrit ? '18px' : '13px');

    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    if (enemy.hpBar && enemy.hpBar.active) {
      enemy.hpBar.width = ratio * (enemy.barW || 36);
    }

    if (enemy.hp <= 0) this.killEnemy(enemy);
  },

  takePlayerDamage(rawDmg, elem = 'Vật Lý') {
    if (this.gameplayPaused || this.__uiHardPaused || this.isModalOpen?.()) return;
    if (this.dead || this.time.now < this.invulnerableUntil || !this.player || !this.player.active) return;

    if (this.cancelRestingState) {
      this.cancelRestingState('⚔ Bị Địch Tấn Công: Ngắt Dưỡng Sức & Tĩnh Tọa!');
    }

    const itemStats = getEquipmentStats();
    const dodge = Math.min(60, Math.max(0, Number(itemStats.dodge || 0)));
    if (dodge > 0 && Math.random() < dodge / 100) {
      this.showFloatingText(this.player.x, this.player.y - 30, 'NÉ', '#89e5df');
      return;
    }
    const def = this.calcPlayerElementalDef ? this.calcPlayerElementalDef(elem) : (this.calcPlayerDef ? this.calcPlayerDef() : 0);
    const reduction = Math.min(75, Math.max(0, Number(itemStats.damageReduction || 0)));
    const dmg = Math.max(1, Math.floor(Math.max(1, rawDmg - def) * (1 - reduction / 100)));
    this.playerHp = Math.max(0, this.playerHp - dmg);
    this.showFloatingText(this.player.x, this.player.y - 30, `-${dmg}`, '#ff7777');
    this.updateHUD();
    if (this.playerHp === 0) {
      this.playerDeath();
    }
  },

  playerDeath() {
    if (this.dead) return;
    this.dead = true;
    damageEquippedDurability(5);
    this.player.setVelocity(0, 0).setTint(0x777777).setAlpha(0.45);
    this.moveTarget = null;
    this.joy.active = false;
    this.joy.id = null;
    this.joy.x = this.joy.y = 0;
    this.joyBase?.setVisible(false);
    this.joyKnob?.setVisible(false);
    this.showFloatingText(this.player.x, this.player.y - 60, 'TRỌNG THƯƠNG • ĐANG HỒI SINH', '#ffe5b0', '17px');
    this.respawnTimer?.remove();
    this.respawnTimer = this.time.delayedCall(1800, () => this.respawnPlayer());
  },

  respawnPlayer() {
    this.respawnTimer = null;
    if (!this.player?.active) return;
    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerHp = this.playerHpMax;
    gameState.mana = gameState.manaMax;
    this.player.setPosition(350, 620).setVelocity(0, 0).clearTint().setAlpha(1);
    this.player.play('p_idle', true);
    this.playerShadow?.setPosition(this.player.x, this.player.y + 35);
    this.invulnerableUntil = this.time.now + 2500;
    this.dead = false;
    this.updateHUD();
    this.showFloatingText(this.player.x, this.player.y - 60, '✦ HỒI SINH', '#a6ffd5', '18px');
  },

  onSecondTick() {
    const itemStats = getEquipmentStats();
    const pillSpeed = Math.max(0, Number(itemStats.cultivationSpeed) || 0);

    const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
    let cpSpeed = 0;
    if (cp && gameState.realmIdx <= cp.maxRealmIdx) {
      cpSpeed = cp.speed || 2;
    }

    let totalSpeed = cpSpeed + pillSpeed;
    if (totalSpeed > 0) {
      if (gameState.isMeditating) totalSpeed *= 3;
      if (gameState.aptitude === 'Thiên Linh Căn') totalSpeed = Math.floor(totalSpeed * 1.5);
      if (gameState.sectId) totalSpeed = Math.floor(totalSpeed * 1.2);

      this.gainExp(totalSpeed, false);

      if (this.player && this.player.active && (gameState.isMeditating || pillSpeed > 0)) {
        if (Math.random() < 0.35) {
          const vfxName = pillSpeed > 0 ? 'vfx_cast' : 'vfx_heal';
          this.spawnSpellVfx(this.player.x, this.player.y - 10, vfxName, 0.5, 500, false);
        }
      }
    }

    if (gameState.isResting && !this.dead) {
      const maxHp = this.calcPlayerMaxHp();
      const maxMp = this.calcPlayerMaxMp();
      const regenRate = gameState.isMeditating ? 0.10 : 0.05;
      const hpRegen = Math.max(1, Math.floor(maxHp * regenRate));
      const mpRegen = Math.max(1, Math.floor(maxMp * regenRate));

      const wasFullHp = this.playerHp >= maxHp;
      const wasFullMp = (gameState.mana || 0) >= maxMp;

      this.playerHp = Math.min(maxHp, (this.playerHp || 0) + hpRegen);
      gameState.mana  = Math.min(maxMp, (gameState.mana  || 0) + mpRegen);

      this.updateHUD();

      if (this.player && this.player.active && Math.random() < 0.55) {
        this.spawnSpellVfx(this.player.x, this.player.y - 10, 'vfx_heal', 0.55, 550, false);
      }

      if (this.playerHp >= maxHp && (gameState.mana || 0) >= maxMp && !wasFullHp) {
        gameState.isResting = false;
        this.createSideToggleButtons();
        this.showFloatingText(this.player.x, this.player.y - 70, '✦ HP & PHÁP LỰC ĐÃ HỒI ĐẦY! KẾT THÚC DƯỠNG SỨC', '#ffd700', '13px');
        return;
      }

      if (!wasFullHp || !wasFullMp) {
        const hpStr = !wasFullHp ? `+${hpRegen}HP` : '';
        const mpStr = !wasFullMp ? ` +${mpRegen}MP` : '';
        if (hpStr || mpStr) {
          this.showFloatingText(
            this.player.x + Phaser.Math.Between(-15, 15),
            this.player.y - 40,
            `🌿${hpStr}${mpStr}`,
            '#4ade80',
            '10px'
          );
        }
      }

      if (this.player.body && (Math.abs(this.player.body.velocity.x) > 5 || Math.abs(this.player.body.velocity.y) > 5)) {
        this.player.setVelocity(0, 0);
        this.moveTarget = null;
      }
    }
  },

  consumePill(pillName) {
    const pill = getItemByName(pillName);
    if (!pill || pill.kind !== 'pill') return { success:false, error:'Đan dược không tồn tại' };
    if (getItemQuantity(pill.id) <= 0) {
      this.showFloatingText(this.player.x, this.player.y - 60, `Không có [${pillName}] trong túi!`, '#ff5555');
      return { success:false, error:'Không có đan dược trong túi' };
    }
    if (pill.effect?.type === 'breakthrough') {
      this.showFloatingText(this.player.x, this.player.y - 60, `Hãy nhấn [ĐỘT PHÁ] trong bảng Cảnh Giới để dùng [${pill.name}]!`, '#ffd700');
      return { success:false, error:'Dùng khi đột phá cảnh giới' };
    }
    const result = useItem(pill.id, this);
    if (!result.success) {
      this.showFloatingText(this.player.x, this.player.y - 60, `❌ ${result.error || 'Không thể dùng item'}`, '#ff5555');
      return result;
    }
    if (result.type === 'heal') this.spawnSpellVfx(this.player.x, this.player.y, 'vfx_heal', 0.8, 600, false);
    else this.spawnSpellVfx(this.player.x, this.player.y, 'vfx_cast', 1.0, 800, false);
    this.showFloatingText(this.player.x, this.player.y - 70, `💊 Đã dùng [${pill.name}]`, '#38bdf8', '14px');
    this.updateHUD();
    return result;
  },

  gainExp(amt, showVisual = false) {
    const realm = REALMS[gameState.realmIdx] || REALMS[0];
    gameState.exp += amt;

    if (gameState.exp >= realm.expReq) {
      if (realm.bottleneck) {
        const reqPill = realm.pillNeeded;
        const reqPillDef = getItemByName(reqPill);
        if (gameState.afkSettings?.autoBreakthrough && reqPillDef && getItemQuantity(reqPillDef.id) > 0) {
          removeItem(reqPillDef.id, 1);
          if (gameState.realmIdx < REALMS.length - 1) {
            gameState.realmIdx++;
            gameState.exp = 0;
            gameState.spiritualSense += 15;
            this.playerHpMax = this.calcPlayerMaxHp();
            this.playerHp = this.playerHpMax;
            this.playerDmg = this.calcPlayerDmg();
            this.spawnVfx(this.player.x, this.player.y, 1, 1.5, { tint: 0xffff33, duration: 800 });
            this.showFloatingText(this.player.x, this.player.y - 80, `⚡ PHÁ BÌNH CẢNH: CẮN [${reqPill}] ĐỘT PHÁ ${REALMS[gameState.realmIdx].name}!`, '#ffff22', '16px');
          }
        } else {
          gameState.exp = realm.expReq;
        }
      } else {
        if (gameState.realmIdx < REALMS.length - 1) {
          gameState.realmIdx++;
          gameState.exp = 0;
          gameState.spiritualSense += 8;
          this.playerHpMax = this.calcPlayerMaxHp();
          this.playerHp = this.playerHpMax;
          this.playerDmg = this.calcPlayerDmg();
          this.spawnVfx(this.player.x, this.player.y, 0, 1.2, { tint: 0x66ffcc, duration: 600 });
          this.showFloatingText(this.player.x, this.player.y - 70, `🎉 ĐỘT PHÁ CẢNH GIỚI: ${REALMS[gameState.realmIdx].name}!`, '#ffff44', '18px');
        }
      }
    }
    this.updateHUD();
  },

  // ----------------------------------------------------------------
  // BỘ 5 SKILL KIẾM GỐC — 5 CẤP SKILL x 4 BẬC THUẦN THỤC
  // ----------------------------------------------------------------
  castSwordSkill(skill, target, baseDmg, elemColors, mastery) {
    return this.castElementalSkill(skill, target, baseDmg, elemColors, mastery);
  },

  castElementalSkill(skill, target, baseDmg, elemColors, mastery = { tier: { name: 'Sơ Nhập', dmgBonus: 0, vfxMul: 1.0, color: '#aaddff' } }) {
    const elemName = 'Kiếm';
    const elemColor = elemColors[elemName] || '#99eeff';
    const vfxMul = mastery.tier.vfxMul || 1.0;
    const facingDir = this.player.flipX ? -1 : 1;
    let tx = target && target.active ? target.x : this.player.x + facingDir * 200;
    let ty = target && target.active ? target.y : this.player.y;

    const cam = this.cameras.main;
    if (cam) {
      const minX = (cam.worldView ? cam.worldView.x : cam.scrollX) + 35;
      const maxX = (cam.worldView ? cam.worldView.right : cam.scrollX + cam.width) - 35;
      const minY = (cam.worldView ? cam.worldView.y : cam.scrollY) + 55;
      const maxY = (cam.worldView ? cam.worldView.bottom : cam.scrollY + cam.height) - 55;
      tx = Phaser.Math.Clamp(tx, minX, maxX);
      ty = Phaser.Math.Clamp(ty, minY, maxY);
    }

    let tierLevel = 1;
    if (skill.minRealm >= 16) tierLevel = 5;
    else if (skill.minRealm >= 12) tierLevel = 4;
    else if (skill.minRealm >= 8) tierLevel = 3;
    else if (skill.minRealm >= 4) tierLevel = 2;

    const mainTint = 0xffea66;
    const tierIdx = mastery.tierIdx || (mastery.tier ? mastery.tier.idx : 0);
    const isDaiThanhOrAbove = (tierIdx >= 2);
    const swordMasteryTints = [0xffea66, 0x00e5ff, 0xff3355, 0xaa44ff];

    const proj1Key = 'vfx_kim_1_0';
    const proj2Key = 'vfx_kim_2_0';
    const proj2HitKey = 'vfx_kim_2_2';
    const array3Key = 'vfx_kim_3_0';
    const swordKiemKhiKey = this.textures.exists('vfx_sword_kiem_khi') ? 'vfx_sword_kiem_khi' : 'vfx_kim_1_7';
    const swarm4Key = swordKiemKhiKey;
    const colossus5Key = 'vfx_giant_tru_tien_sword';
    const shockwaveKey = 'vfx_tru_tien_shockwave';
    const impactKey = this.textures.exists('vfx_impact_frame7') ? 'vfx_impact_frame7' : 'vfx_sword_impact_frame7';

    // =========================================================================
    // KIẾM 1 — Kim Nhận Thuật: Sơ Nhập 1 / Tiểu Thành 2 / Đại Thành 3 / Viên Mãn 4 kiếm
    // =========================================================================
    if (tierLevel === 1) {
      const startX = this.player.x;
      const startY = this.player.y - 15;
      let endX = target && target.active && this.isEnemyOnScreen(target, 20) ? target.x : tx;
      let endY = target && target.active && this.isEnemyOnScreen(target, 20) ? target.y - 15 : ty - 15;
      const dist = Phaser.Math.Distance.Between(startX, startY, endX, endY);
      const PROJECTILE_SPEED = 270;
      const flyDuration = Math.max(90, Math.round((dist / PROJECTILE_SPEED) * 1000));

      const pScale = Math.abs(this.player.scaleX || 0.85);
      const startScale = pScale * 0.50 * vfxMul;
      let targetScale = startScale;
      if (target && target.active) {
        const eScale = Math.abs(target.scaleX || 0.50);
        targetScale = Phaser.Math.Clamp(eScale * 1.00 * vfxMul, 0.40, 1.70);
      }

      const countByMastery = [1, 2, 3, 4];
      const projectileCount = countByMastery[tierIdx] || 1;
      const offsetsByCount = {
        1: [0],
        2: [-38, 38],
        3: [-58, 0, 58],
        4: [-70, -24, 24, 70]
      };
      const arcOffsets = offsetsByCount[projectileCount];
      const perProjDmg = Math.max(1, Math.floor(baseDmg / projectileCount));

      for (let i = 0; i < projectileCount; i++) {
        const pTint = tierIdx === 0 ? mainTint : swordMasteryTints[i % swordMasteryTints.length];
        const offsetDist = arcOffsets[i] * Math.min(1.5, vfxMul);

        this.time.delayedCall(i * 35, () => {
          const proj = this.add.sprite(startX, startY, proj1Key)
            .setDepth(Math.floor(this.player.y) + 50 + i)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(startScale)
            .setTint(pTint);

          if (this.anims.exists('anim_vfx_kiem_1')) proj.play('anim_vfx_kiem_1');

          const proxy = { t: 0 };
          this.tweens.add({
            targets: proxy,
            t: 1,
            duration: flyDuration,
            ease: 'Quad.easeInOut',
            onUpdate: () => {
              const curTargetX = (target && target.active) ? target.x : endX;
              const curTargetY = (target && target.active) ? target.y - 15 : endY;
              const curAngle = Phaser.Math.Angle.Between(startX, startY, curTargetX, curTargetY);
              const curNx = -Math.sin(curAngle);
              const curNy = Math.cos(curAngle);
              const curMidX = (startX + curTargetX) / 2;
              const curMidY = (startY + curTargetY) / 2;
              const curCtrlX = curMidX + curNx * offsetDist;
              const curCtrlY = curMidY + curNy * offsetDist;
              const t = proxy.t;
              const omt = 1 - t;
              const bx = omt * omt * startX + 2 * omt * t * curCtrlX + t * t * curTargetX;
              const by = omt * omt * startY + 2 * omt * t * curCtrlY + t * t * curTargetY;
              proj.setPosition(bx, by);
              const dx = 2 * omt * (curCtrlX - startX) + 2 * t * (curTargetX - curCtrlX);
              const dy = 2 * omt * (curCtrlY - startY) + 2 * t * (curTargetY - curCtrlY);
              proj.setRotation(Math.atan2(dy, dx));
              const curScale = startScale + (targetScale - startScale) * t;
              proj.setScale(curScale);
              if (target && target.active && t > 0.15) {
                const dToEnemy = Phaser.Math.Distance.Between(bx, by, target.x, target.y - 15);
                if (dToEnemy < 25) proxy.t = 1;
              }
            },
            onComplete: () => {
              const finalRotation = proj.rotation || 0;
              proj.destroy();
              const finalHitX = (target && target.active) ? target.x : endX;
              const finalHitY = (target && target.active) ? target.y - 15 : endY;

              if (impactKey && this.textures.exists(impactKey)) {
                const impactVfx = this.add.sprite(finalHitX, finalHitY, impactKey)
                  .setDepth(Math.floor(finalHitY) + 58)
                  .setBlendMode(Phaser.BlendModes.ADD)
                  .setScale(targetScale * 0.30)
                  .setAlpha(0.06)
                  .setTint(pTint)
                  .setRotation(finalRotation);

                this.tweens.add({
                  targets: impactVfx,
                  scaleX: targetScale * 1.15,
                  scaleY: targetScale * 1.15,
                  alpha: 0.22,
                  duration: 150,
                  ease: 'Cubic.easeOut',
                  onComplete: () => {
                    this.tweens.add({
                      targets: impactVfx,
                      scaleX: targetScale * 1.35,
                      scaleY: targetScale * 1.35,
                      alpha: 0,
                      duration: 160,
                      ease: 'Quad.easeIn',
                      onComplete: () => impactVfx.destroy()
                    });
                  }
                });
              }

              if (target && target.active && this.isEnemyOnScreen(target, 20)) {
                this.damageEnemy(target, perProjDmg, (isDaiThanhOrAbove && i === 0));
                this.spawnVfx(finalHitX, finalHitY, 0, targetScale * 0.50, { tint: pTint, duration: 160 });
              }
            }
          });
        });
      }

      this.showFloatingText(this.player.x, this.player.y - 70, `[Kiếm • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || elemColor, '13px');
      return;
    }

    // =========================================================================
    // KIẾM 2 — Bạch Hổ Canh Kim Kiếm (giữ nguyên choreography gốc)
    // =========================================================================
    if (tierLevel === 2) {
      const startX = this.player.x;
      const startY = this.player.y - 15;
      let endX = target && target.active && this.isEnemyOnScreen(target, 20) ? target.x : tx;
      let endY = target && target.active && this.isEnemyOnScreen(target, 20) ? target.y - 15 : ty - 15;
      const dist = Phaser.Math.Distance.Between(startX, startY, endX, endY);
      const PROJECTILE_SPEED = 280;
      const flyDuration = Math.max(90, Math.round((dist / PROJECTILE_SPEED) * 1000));
      const pScale = Math.abs(this.player.scaleX || 0.85);
      const startScale = pScale * 0.65 * vfxMul;

      let targetScale = startScale;
      if (target && target.active) {
        const eScale = Math.abs(target.scaleX || 0.50);
        targetScale = Phaser.Math.Clamp(eScale * 1.25 * vfxMul, 0.55, 2.10);
      }

      const crossProjectile = this.add.sprite(startX, startY, proj2Key)
        .setDepth(Math.floor(this.player.y) + 55)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(startScale)
        .setTint(mainTint);

      const initAngle = Phaser.Math.Angle.Between(startX, startY, endX, endY);
      crossProjectile.setRotation(initAngle);
      if (this.anims.exists('anim_vfx_kim_2_fly')) crossProjectile.play('anim_vfx_kim_2_fly');

      const proxy = { t: 0 };
      this.tweens.add({
        targets: proxy,
        t: 1,
        duration: flyDuration,
        ease: 'Linear',
        onUpdate: () => {
          const curTargetX = (target && target.active) ? target.x : endX;
          const curTargetY = (target && target.active) ? target.y - 15 : endY;
          const t = proxy.t;
          const curX = startX + (curTargetX - startX) * t;
          const curY = startY + (curTargetY - startY) * t;
          crossProjectile.setPosition(curX, curY);
          const curAngle = Phaser.Math.Angle.Between(curX, curY, curTargetX, curTargetY);
          crossProjectile.setRotation(curAngle);
          const curScale = startScale + (targetScale - startScale) * t;
          crossProjectile.setScale(curScale);
          if (target && target.active && t > 0.15) {
            const dToEnemy = Phaser.Math.Distance.Between(curX, curY, target.x, target.y - 15);
            if (dToEnemy < 32) proxy.t = 1;
          }
        },
        onComplete: () => {
          crossProjectile.destroy();
          const finalHitX = (target && target.active) ? target.x : endX;
          const finalHitY = (target && target.active) ? target.y - 15 : endY;
          const finalAngle = Phaser.Math.Angle.Between(startX, startY, finalHitX, finalHitY);

          const hitBurst = this.add.sprite(finalHitX, finalHitY, proj2HitKey)
            .setDepth(Math.floor(finalHitY) + 60)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(targetScale * 1.25)
            .setTint(mainTint)
            .setRotation(finalAngle);
          if (this.anims.exists('anim_vfx_kim_2_hit')) hitBurst.play('anim_vfx_kim_2_hit');

          this.tweens.add({
            targets: hitBurst,
            scaleX: targetScale * 1.45,
            scaleY: targetScale * 1.45,
            alpha: 0,
            duration: 320,
            ease: 'Quad.easeOut',
            onComplete: () => { if (hitBurst.active) hitBurst.destroy(); }
          });

          if (target && target.active && this.isEnemyOnScreen(target, 20)) {
            if (impactKey && this.textures.exists(impactKey)) {
              const impactVfx = this.add.sprite(finalHitX, finalHitY, impactKey)
                .setDepth(Math.floor(finalHitY) + 58)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setScale(targetScale * 0.35)
                .setAlpha(0.06)
                .setRotation(finalAngle)
                .setTint(mainTint);
              this.tweens.add({
                targets: impactVfx,
                scaleX: targetScale * 1.25,
                scaleY: targetScale * 1.25,
                alpha: 0.22,
                duration: 150,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                  this.tweens.add({
                    targets: impactVfx,
                    scaleX: targetScale * 1.45,
                    scaleY: targetScale * 1.45,
                    alpha: 0,
                    duration: 160,
                    ease: 'Quad.easeIn',
                    onComplete: () => impactVfx.destroy()
                  });
                }
              });
            }
            this.damageEnemy(target, baseDmg, true);
            this.spawnVfx(finalHitX, finalHitY, 0, targetScale * 0.85, { tint: mainTint, duration: 200 });
          }
        }
      });
      this.showFloatingText(this.player.x, this.player.y - 70, `[Kiếm • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || elemColor, '14px');
      return;
    }

    // =========================================================================
    // KIẾM 3 — Thập Nhị Thiên Kiếm Trận: 6 / 8 / 10 / 12 theo thuần thục
    // =========================================================================
    if (tierLevel === 3) {
      const DURATION_MS = 3000;
      const targetRadiusX = 145;
      const targetRadiusY = 78;

      const groundArray = this.add.image(tx, ty, array3Key)
        .setDepth(Math.floor(ty) - 6)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setOrigin(0.50, 0.50)
        .setScale(targetRadiusX / 60, targetRadiusY / 60)
        .setAlpha(0.15)
        .setTint(mainTint);

      this.tweens.add({
        targets: groundArray,
        alpha: 0.95,
        duration: 1800,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.tweens.add({
            targets: groundArray,
            alpha: 0,
            duration: 1200,
            ease: 'Quad.easeOut',
            onComplete: () => { if (groundArray && groundArray.active) groundArray.destroy(); }
          });
        }
      });

      const missiles = [];
      const countsByTier = [6, 8, 10, 12];
      const numMissiles = countsByTier[tierIdx] || 6;

      for (let i = 0; i < numMissiles; i++) {
        const theta = (i * 2 * Math.PI) / numMissiles;
        const gx = tx + Math.cos(theta) * targetRadiusX;
        const gy = ty + Math.sin(theta) * targetRadiusY;
        const sx = gx;
        const sy = gy - 360;

        const missile = this.add.sprite(sx, sy, swarm4Key)
          .setDepth(Math.floor(gy) + 40)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setOrigin(0.85, 0.50)
          .setScale(0.75)
          .setRotation(Math.PI / 2)
          .setTint(mainTint);

        missiles.push(missile);
        this.time.delayedCall(i * 25, () => {
          this.tweens.add({
            targets: missile,
            y: gy,
            duration: 260,
            ease: 'Cubic.easeIn',
            onComplete: () => this.spawnVfx(gx, gy, 0, 0.40, { tint: mainTint, duration: 160 })
          });
        });
      }

      const perTickDmg = Math.max(1, Math.floor(baseDmg / 6));
      for (let tick = 0; tick < 6; tick++) {
        this.time.delayedCall(tick * 500, () => {
          this.spawnVfx(tx, ty, 0, 1.2, { tint: mainTint, duration: 220 });
          [...this.enemies].forEach(t => {
            if (!t || !t.active || !this.isEnemyOnScreen(t, 40)) return;
            const nx = (t.x - tx) / (targetRadiusX + 20);
            const ny = (t.y - ty) / (targetRadiusY + 20);
            if ((nx * nx + ny * ny) <= 1.15) {
              this.damageEnemy(t, perTickDmg, (tick % 2 === 0));
              if (impactKey && this.textures.exists(impactKey)) {
                const eScale = Math.abs(t.scaleX || 0.50);
                const slashBaseScale = Math.max(0.40, eScale * 1.15);
                const hitOffsetY = t.displayHeight ? (t.displayHeight * 0.28) : 20;
                const slashVfx = this.add.sprite(t.x + Phaser.Math.Between(-8, 8), t.y - hitOffsetY + Phaser.Math.Between(-6, 6), impactKey)
                  .setDepth(Math.floor(t.y) + 60)
                  .setBlendMode(Phaser.BlendModes.ADD)
                  .setScale(slashBaseScale * 0.20)
                  .setAlpha(0.05)
                  .setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2))
                  .setTint(mainTint);
                this.tweens.add({
                  targets: slashVfx,
                  scaleX: slashBaseScale,
                  scaleY: slashBaseScale,
                  alpha: 0.21,
                  duration: 130,
                  ease: 'Cubic.easeOut',
                  onComplete: () => this.tweens.add({
                    targets: slashVfx,
                    scaleX: slashBaseScale * 1.25,
                    scaleY: slashBaseScale * 1.25,
                    alpha: 0,
                    duration: 150,
                    ease: 'Quad.easeIn',
                    onComplete: () => { if (slashVfx && slashVfx.active) slashVfx.destroy(); }
                  })
                });
              }
            }
          });
        });
      }

      this.time.delayedCall(DURATION_MS, () => {
        this.tweens.add({
          targets: missiles,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 350,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            if (groundArray && groundArray.active) groundArray.destroy();
            missiles.forEach(s => { if (s && s.active) s.destroy(); });
          }
        });
      });

      this.showFloatingText(this.player.x, this.player.y - 70, `[Kiếm • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || elemColor, '15px');
      return;
    }

    // =========================================================================
    // KIẾM 4 — Vạn Kiếm Quy Tông: 10 / 14 / 18 / 22 theo thuần thục
    // =========================================================================
    if (tierLevel === 4) {
      const countsByTier = [10, 14, 18, 22];
      const swarmCount = countsByTier[tierIdx] || 10;
      const targetEnemy = target;
      const perHitDmg = Math.max(1, Math.floor(baseDmg / (swarmCount * 3)));
      const orbitRadiusX = 85;
      const orbitRadiusY = 38;
      const orbitHeight = 130;

      const getTargetPos = () => targetEnemy && targetEnemy.active ? { x: targetEnemy.x, y: targetEnemy.y } : { x: tx, y: ty };

      for (let i = 0; i < swarmCount; i++) {
        this.time.delayedCall(i * 80, () => {
          const initT = getTargetPos();
          const unit = this.add.sprite(initT.x, initT.y - orbitHeight, swarm4Key)
            .setDepth(Math.floor(initT.y) + 55)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setOrigin(0.85, 0.50)
            .setScale(0.72)
            .setAlpha(0)
            .setTint(mainTint);

          const orbitAngleStep = (2 * Math.PI) / swarmCount;
          let orbitAngle = -i * orbitAngleStep;
          const orbitDuration = 800 + (i * 40);
          const orbitStartTime = this.time.now;
          this.tweens.add({ targets: unit, alpha: 1.0, duration: 160, ease: 'Quad.easeOut' });

          const startPiercingPasses = () => {
            let passIndex = 0;
            const dirAngle = (i % 8) * (Math.PI / 4);
            const passDistX = Math.cos(dirAngle) * 140;
            const passDistY = Math.sin(dirAngle) * 70;

            const executePass = () => {
              if (!unit || !unit.active) return;
              passIndex++;
              const curT = getTargetPos();
              const hitOffsetY = targetEnemy && targetEnemy.displayHeight ? (targetEnemy.displayHeight * 0.28) : 20;
              const hitX = curT.x;
              const hitY = curT.y - hitOffsetY;
              const endX = passIndex === 2 ? hitX - passDistX : hitX + passDistX;
              const endY = passIndex === 2 ? hitY - passDistY : hitY + passDistY;
              const startX = unit.x;
              const startY = unit.y;
              const flyAngle = Math.atan2(endY - startY, endX - startX);
              unit.setRotation(flyAngle);
              let hasDealtDamage = false;

              this.tweens.add({
                targets: unit,
                x: endX,
                y: endY,
                duration: 420,
                ease: 'Quad.easeInOut',
                onUpdate: (tween) => {
                  if (!hasDealtDamage && tween.progress >= 0.45) {
                    hasDealtDamage = true;
                    [...this.enemies].forEach(t => {
                      if (!t || !t.active || !this.isEnemyOnScreen(t, 40)) return;
                      const dCenter = Phaser.Math.Distance.Between(hitX, hitY, t.x, t.y);
                      const dUnit = Phaser.Math.Distance.Between(unit.x, unit.y, t.x, t.y);
                      if (dCenter < 95 || dUnit < 80) {
                        this.damageEnemy(t, perHitDmg, (passIndex === 3));
                        if (impactKey && this.textures.exists(impactKey)) {
                          const eScale = Math.abs(t.scaleX || 0.50);
                          const baseSlashScale = Math.max(0.40, eScale * 1.15);
                          const eOffsetY = t.displayHeight ? (t.displayHeight * 0.28) : 20;
                          const slashVfx = this.add.sprite(t.x, t.y - eOffsetY, impactKey)
                            .setDepth(Math.floor(t.y) + 70)
                            .setBlendMode(Phaser.BlendModes.ADD)
                            .setScale(baseSlashScale * 0.25)
                            .setAlpha(0.05)
                            .setRotation(flyAngle + Phaser.Math.FloatBetween(-0.20, 0.20))
                            .setTint(mainTint);
                          this.tweens.add({
                            targets: slashVfx,
                            scaleX: baseSlashScale,
                            scaleY: baseSlashScale,
                            alpha: 0.20,
                            duration: 120,
                            ease: 'Cubic.easeOut',
                            onComplete: () => this.tweens.add({
                              targets: slashVfx,
                              scaleX: baseSlashScale * 1.25,
                              scaleY: baseSlashScale * 1.25,
                              alpha: 0,
                              duration: 140,
                              ease: 'Quad.easeIn',
                              onComplete: () => { if (slashVfx.active) slashVfx.destroy(); }
                            })
                          });
                        }
                      }
                    });
                  }
                },
                onComplete: () => {
                  if (passIndex < 3) this.time.delayedCall(80, executePass);
                  else {
                    this.spawnVfx(unit.x, unit.y, 0, 0.60, { tint: mainTint, duration: 200 });
                    this.tweens.add({
                      targets: unit,
                      alpha: 0,
                      scaleX: 0.1,
                      scaleY: 0.1,
                      duration: 160,
                      onComplete: () => { if (unit && unit.active) unit.destroy(); }
                    });
                  }
                }
              });
            };
            executePass();
          };

          const orbitTimer = this.time.addEvent({
            delay: 16,
            loop: true,
            callback: () => {
              if (!unit || !unit.active) { orbitTimer.remove(); return; }
              const curT = getTargetPos();
              const elapsed = this.time.now - orbitStartTime;
              orbitAngle += 0.10;
              const ox = curT.x + Math.cos(orbitAngle) * orbitRadiusX;
              const oy = (curT.y - orbitHeight) + Math.sin(orbitAngle) * orbitRadiusY;
              unit.setPosition(ox, oy);
              unit.setRotation(Math.atan2(orbitRadiusY * Math.cos(orbitAngle), -orbitRadiusX * Math.sin(orbitAngle)));
              if (elapsed >= orbitDuration) {
                orbitTimer.remove();
                startPiercingPasses();
              }
            }
          });
        });
      }
      this.showFloatingText(this.player.x, this.player.y - 70, `[Kiếm • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || elemColor, '15px');
      return;
    }

    // =========================================================================
    // KIẾM 5 — Thái Canh Tru Tiên Trận: phạm vi 250 / 350 / 460 / 600 theo thuần thục
    // =========================================================================
    if (tierLevel === 5) {
      const DURATION_MS = 5000;
      const strikeX = tx;
      const strikeY = ty;
      const perTickDmg = Math.max(1, Math.floor(baseDmg * 0.06));
      const tierRanges = [250, 350, 460, 600];
      const tierColossusScales = [1.35, 1.70, 2.15, 2.70];
      const tierShockwaveScales = [3.2, 4.5, 6.0, 8.0];
      const tierStormSpreads = [80, 120, 165, 225];
      const aoeRadius = tierRanges[tierIdx] || 250;
      const colossusScale = tierColossusScales[tierIdx] || 1.35;
      const shockwaveScale = tierShockwaveScales[tierIdx] || 3.2;
      const stormSpread = tierStormSpreads[tierIdx] || 80;
      const startSkyY = strikeY - 560;

      const colossus = this.add.sprite(strikeX, startSkyY, colossus5Key)
        .setDepth(Math.floor(strikeY) + 70)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setOrigin(0.50, 0.94)
        .setScale(colossusScale)
        .setAlpha(0.95)
        .setTint(mainTint);

      this.tweens.add({
        targets: colossus,
        y: strikeY,
        duration: 260,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          const shockwave = this.add.image(strikeX, strikeY, shockwaveKey)
            .setDepth(Math.floor(strikeY) + 65)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(0.4)
            .setAlpha(0.55)
            .setTint(mainTint);

          this.tweens.add({
            targets: shockwave,
            scaleX: shockwaveScale * 0.75,
            scaleY: shockwaveScale * 0.50,
            alpha: 0,
            duration: 480,
            ease: 'Cubic.easeOut',
            onComplete: () => { if (shockwave.active) shockwave.destroy(); }
          });

          [...this.enemies].forEach(t => {
            if (!t || !t.active || !this.isEnemyOnScreen(t, 40)) return;
            const d = Phaser.Math.Distance.Between(strikeX, strikeY, t.x, t.y);
            if (d < aoeRadius) {
              this.damageEnemy(t, Math.floor(baseDmg * 0.40), true);
              if (impactKey && this.textures.exists(impactKey)) {
                const eScale = Math.abs(t.scaleX || 0.50);
                const slashTargetScale = eScale * 1.65;
                const hitOffsetY = t.displayHeight ? (t.displayHeight * 0.28) : 20;
                const slashVfx = this.add.sprite(t.x, t.y - hitOffsetY, impactKey)
                  .setDepth(Math.floor(t.y) + 75)
                  .setBlendMode(Phaser.BlendModes.ADD)
                  .setScale(slashTargetScale * 0.20)
                  .setAlpha(0.06)
                  .setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2))
                  .setTint(mainTint);
                this.tweens.add({
                  targets: slashVfx,
                  scaleX: slashTargetScale,
                  scaleY: slashTargetScale,
                  alpha: 0.24,
                  duration: 150,
                  ease: 'Cubic.easeOut',
                  onComplete: () => this.tweens.add({
                    targets: slashVfx,
                    scaleX: slashTargetScale * 1.25,
                    scaleY: slashTargetScale * 1.25,
                    alpha: 0,
                    duration: 180,
                    ease: 'Quad.easeIn',
                    onComplete: () => { if (slashVfx.active) slashVfx.destroy(); }
                  })
                });
              }
            }
          });
        }
      });

      const stormList = [];
      const stormTexture = 'vfx_loi';
      const stormTimer = this.time.addEvent({
        delay: 180,
        repeat: Math.floor(DURATION_MS / 180) - 1,
        callback: () => {
          if (!colossus || !colossus.active) return;
          const lx = strikeX + Phaser.Math.Between(-stormSpread, stormSpread);
          const ly = strikeY - Phaser.Math.Between(30, 150 * (colossusScale / 1.35));
          const lScale = Phaser.Math.FloatBetween(0.85, 1.45) * (1.0 + tierIdx * 0.15);
          if (this.textures.exists(stormTexture)) {
            const bolt = this.add.sprite(lx, ly, stormTexture)
              .setDepth(Math.floor(strikeY) + 72)
              .setBlendMode(Phaser.BlendModes.ADD)
              .setScale(lScale)
              .setAlpha(Phaser.Math.FloatBetween(0.60, 0.90))
              .setRotation(Phaser.Math.FloatBetween(-0.25, 0.25))
              .setTint(mainTint)
              .setFlipX(Math.random() > 0.5);
            stormList.push(bolt);
            this.tweens.add({
              targets: bolt,
              alpha: 0,
              scaleX: lScale * 1.15,
              scaleY: lScale * 1.15,
              duration: 160,
              ease: 'Quad.easeOut',
              onComplete: () => { if (bolt && bolt.active) bolt.destroy(); }
            });
          }
        }
      });

      for (let tick = 1; tick <= 10; tick++) {
        this.time.delayedCall(tick * 500, () => {
          this.spawnVfx(strikeX, strikeY, 0, 1.3 * (colossusScale / 1.35), { tint: mainTint, duration: 200 });
          [...this.enemies].forEach(t => {
            if (!t || !t.active || !this.isEnemyOnScreen(t, 30)) return;
            const d = Phaser.Math.Distance.Between(strikeX, strikeY, t.x, t.y);
            if (d < aoeRadius) {
              this.damageEnemy(t, perTickDmg, (tick % 3 === 0));
              if (this.textures.exists(stormTexture)) {
                const miniBurst = this.add.sprite(t.x, t.y - 30, stormTexture)
                  .setDepth(Math.floor(t.y) + 60)
                  .setBlendMode(Phaser.BlendModes.ADD)
                  .setScale(0.55 * (1 + tierIdx * 0.12))
                  .setAlpha(0.85)
                  .setTint(mainTint);
                this.tweens.add({
                  targets: miniBurst,
                  alpha: 0,
                  scaleY: 0.70,
                  duration: 140,
                  onComplete: () => { if (miniBurst.active) miniBurst.destroy(); }
                });
              }
            }
          });
        });
      }

      this.time.delayedCall(DURATION_MS, () => {
        if (stormTimer) stormTimer.remove();
        stormList.forEach(b => { if (b && b.active) b.destroy(); });
        if (colossus && colossus.active) {
          this.spawnVfx(strikeX, strikeY, 0, 2.0 * (colossusScale / 1.35), { tint: mainTint, duration: 350 });
          this.tweens.add({
            targets: colossus,
            alpha: 0,
            scaleY: colossusScale * 1.3,
            duration: 400,
            ease: 'Quad.easeOut',
            onComplete: () => { if (colossus && colossus.active) colossus.destroy(); }
          });
        }
      });

      this.showFloatingText(this.player.x, this.player.y - 70, `[Kiếm • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || '#ffffff', '16px');
    }
  }
};
