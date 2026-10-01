/**
 * PlayerMixin.js
 * Quản lý: createPlayer, calcStats, flyingSword,
 *           nearestEnemy, createVfxPool, spawnVfx, perspective, fixed
 */
import { REALMS } from '../../config/realmsData.js';

import { getEquipmentStats } from './ItemSystem.js?v=20261001-item-v3';
import { SKILL_MASTERY_TIERS, ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';

export const PlayerMixin = {

  createPlayer() {
    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerHp = this.playerHpMax;
    this.playerDmg = this.calcPlayerDmg();

    const spawn = this.currentMap?.spawn || { x: 350, y: 620 };
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player_idle', 0)
      .setScale(0.85)
      .setDepth(620);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(44, 70).setOffset(42, 40);
    this.player.play('p_idle');

    this.playerShadow = this.add.ellipse(this.player.x, this.player.y + 35, 40, 14, 0x000000, 0.45).setDepth(1);

    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, 0, 40);
  },

  // Animation tier:
  // - Dưới Trúc Cơ (realmIdx < 13): idle / run / attack.
  // - Trúc Cơ Sơ Kỳ trở lên (realmIdx >= 13): idle / fly / fly_attack.
  isPlayerFlyingRealm() {
    return (Number(gameState.realmIdx) || 0) >= 13;
  },

  playPlayerAttackAnimation(durationMs = 360) {
    if (!this.player || !this.player.active) return;
    const safeDuration = Phaser.Math.Clamp(Math.floor(Number(durationMs) || 360), 280, 520);
    const animKey = this.isPlayerFlyingRealm() ? 'p_fly_attack' : 'p_attack';

    // p_attack / p_fly_attack are 12 frames at 24 fps => 500ms base duration.
    // timeScale keeps every frame while matching the actual combat cadence.
    if (this.player.anims) this.player.anims.timeScale = 500 / safeDuration;
    this.attackUntil = this.time.now + safeDuration;
    this.player.play(animKey, true);
  },

  calcPlayerMaxHp() {
    const realm = REALMS[gameState.realmIdx] || REALMS[0];
    let hp = realm.hp;
    const itemStats = getEquipmentStats();
    hp += Number(itemStats.hp || 0);
    if (itemStats.hpPct) hp = Math.floor(hp * (1 + Number(itemStats.hpPct) / 100));

    const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
    if (cp && cp.bonusHpPct) hp = Math.floor(hp * (1 + cp.bonusHpPct / 100));
    return hp;
  },

  calcPlayerMaxMp() {
    const realm = REALMS[gameState.realmIdx] || REALMS[0];
    let mp = (realm.manaMax || 100);
    const itemStats = getEquipmentStats();
    mp += Number(itemStats.mp || 0);
    if (itemStats.mpPct) mp = Math.floor(mp * (1 + Number(itemStats.mpPct) / 100));
    const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
    if (cp && cp.bonusMpPct) mp = Math.floor(mp * (1 + cp.bonusMpPct / 100));

    return mp;
  },

  getSpiritualSenseBase() {
    const realm = REALMS[gameState.realmIdx] || REALMS[0];
    return Math.max(1, Number(realm.spiritualSense) || 10);
  },

  getSpiritualSenseBonusCap() {
    // Bonus vĩnh viễn tối đa bằng 100% Thần Thức nền của cảnh giới hiện tại.
    return this.getSpiritualSenseBase();
  },

  getStoredSpiritualSenseBonus() {
    const raw = Math.max(0, Number(gameState.spiritualSenseBonus) || 0);
    return Math.min(raw, this.getSpiritualSenseBonusCap());
  },

  addPermanentSpiritualSense(amount = 0) {
    // Dùng cho đan dược/công pháp tăng Thần Thức vĩnh viễn.
    // Phần đã cộng được giữ nguyên khi đột phá; cảnh giới cao hơn chỉ mở trần bonus lớn hơn.
    const add = Math.max(0, Math.floor(Number(amount) || 0));
    const current = Math.max(0, Number(gameState.spiritualSenseBonus) || 0);
    const cap = this.getSpiritualSenseBonusCap();
    const applied = Math.max(0, Math.min(add, cap - current));
    gameState.spiritualSenseBonus = Math.min(cap, current + applied);
    return {
      applied,
      bonus: gameState.spiritualSenseBonus,
      cap,
      total: this.calcPlayerSpiritualSense()
    };
  },

  calcPlayerSpiritualSense() {
    const baseSense = this.getSpiritualSenseBase();
    let permanentBonus = this.getStoredSpiritualSenseBonus();

    // Giữ tương thích save cũ nếu spiritualSense từng được lưu cao hơn nền cảnh giới.
    if (!Number.isFinite(Number(gameState.spiritualSenseBonus)) && Number(gameState.spiritualSense) > baseSense) {
      permanentBonus = Math.min(Number(gameState.spiritualSense) - baseSense, this.getSpiritualSenseBonusCap());
      gameState.spiritualSenseBonus = permanentBonus;
    }

    let sense = baseSense + permanentBonus;

    // Trang bị/tông môn là bonus động, không ghi vào phần bonus vĩnh viễn.
    const itemStats = getEquipmentStats();
    sense += Math.floor(Number(itemStats.spiritualSense || 0));


    gameState.spiritualSense = sense;
    return sense;
  },

  // Tốc độ đánh lấy trực tiếp từ tổng Thần Thức sau mọi bonus.
  // Chuẩn: 20 Thần Thức = 2000ms/đòn, 5700 Thần Thức ≈ 500ms/đòn.
  // Đường cong logarit giữ giá trị cho đan dược/trang bị mà không làm tốc đánh mất kiểm soát.
  calcPlayerAtkInterval() {
    const sense = Math.max(1, this.calcPlayerSpiritualSense());
    const BASE_SENSE = 20;
    const HUA_SHEN_PEAK_SENSE = 5700;
    const BASE_INTERVAL = 2000;
    const HUA_SHEN_PEAK_INTERVAL = 500;
    const MIN_INTERVAL = 450;
    const MAX_INTERVAL = 2600;

    if (sense <= BASE_SENSE) {
      const lowSenseInterval = Math.round(BASE_INTERVAL * (BASE_SENSE / sense));
      return Math.max(BASE_INTERVAL, Math.min(MAX_INTERVAL, lowSenseInterval));
    }

    const progress = Math.log(sense / BASE_SENSE) / Math.log(HUA_SHEN_PEAK_SENSE / BASE_SENSE);
    let interval = Math.round(
      BASE_INTERVAL - (BASE_INTERVAL - HUA_SHEN_PEAK_INTERVAL) * progress
    );
    const itemStats = getEquipmentStats();
    if (itemStats.attackSpeed) interval = Math.round(interval / (1 + Number(itemStats.attackSpeed) / 100));
    return Math.max(MIN_INTERVAL, Math.min(MAX_INTERVAL, interval));
  },

  calcPlayerBaseDmg() {
    const realm = REALMS[gameState.realmIdx] || REALMS[0];
    let dmg = realm.dmg;
    const itemStats = getEquipmentStats();
    dmg += Number(itemStats.dmg || 0);
    if (itemStats.dmgPct) dmg = Math.floor(dmg * (1 + Number(itemStats.dmgPct) / 100));
    return dmg;
  },

  calcPlayerBaseDef() {
    const realm = REALMS[gameState.realmIdx] || REALMS[0];
    let def = realm.def;
    const itemStats = getEquipmentStats();
    def += Number(itemStats.def || 0);
    if (itemStats.defPct) def = Math.floor(def * (1 + Number(itemStats.defPct) / 100));
    return def;
  },

  toggleMeditation() {
    if (!gameState.activeCongPhapId) {
      this.showFloatingText(this.player.x, this.player.y - 70, 'Chưa học Công Pháp! Hãy đổi Da Thú lấy [Dẫn Khí Quyết]!', '#ff7777', '14px');
      if (this.openCongPhapPanel) this.openCongPhapPanel();
      return;
    }
    gameState.isMeditating = !gameState.isMeditating;
    if (gameState.isMeditating) {
      this.player.setVelocity(0, 0);
      gameState.autoFight = false;
      this.updateAutoBtnVisual();
      const cp = getCongPhapById(gameState.activeCongPhapId);
      this.showFloatingText(this.player.x, this.player.y - 70, `🧘 TĨNH TỌA TU LUYỆN [${cp?.name || ''}] (+${(cp?.speed || 2) * 3} Tu Vi/s)`, '#55ff99', '15px');
    } else {
      this.showFloatingText(this.player.x, this.player.y - 70, '⚔ KẾT THÚC TĨNH TỌA', '#ffd700', '14px');
    }
    this.updateHUD();
  },

  toggleResting() {
    if (this.dead) return;
    gameState.isResting = !gameState.isResting;
    if (gameState.isResting) {
      this.player.setVelocity(0, 0);
      this.moveTarget = null;
      this.player.play('p_idle', true);
      gameState.autoFight = false;
      this.updateAutoBtnVisual();
      this.showFloatingText(this.player.x, this.player.y - 70, '🛌 DƯỠNG SỨC: Hồi HP & Pháp Lực (+5%/s)', '#86efac', '14px');
    } else {
      this.showFloatingText(this.player.x, this.player.y - 70, '⚔ KẾT THÚC DƯỠNG SỨC', '#ffd700', '13px');
    }
    this.createSideToggleButtons();
    this.updateHUD();
  },

  cancelRestingState(reason = '') {
    let wasActive = false;
    if (gameState.isResting) { gameState.isResting = false; wasActive = true; }
    if (gameState.isMeditating) { gameState.isMeditating = false; wasActive = true; }
    if (wasActive) {
      if (this.createSideToggleButtons) this.createSideToggleButtons();
      this.updateHUD();
      if (reason && this.player && this.player.active) this.showFloatingText(this.player.x, this.player.y - 70, reason, '#ffd700', '13px');
    }
  },


  isOnScreen(x, y, margin = 20) {
    const cam = this.cameras.main;
    if (!cam) return true;
    const left = (cam.worldView ? cam.worldView.x : cam.scrollX) - margin;
    const right = (cam.worldView ? cam.worldView.right : cam.scrollX + cam.width) + margin;
    const top = (cam.worldView ? cam.worldView.y : cam.scrollY) - margin;
    const bottom = (cam.worldView ? cam.worldView.bottom : cam.scrollY + cam.height) + margin;
    return x >= left && x <= right && y >= top && y <= bottom;
  },

  isEnemyOnScreen(enemy, margin = 20) {
    if (!enemy || !enemy.active) return false;
    return this.isOnScreen(enemy.x, enemy.y, margin);
  },

  nearestEnemy(maxDist = 460, onlyOnScreen = true) {
    let closest = null, minD = maxDist;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e || !e.active || e.isDead || !e.visible) continue;
      if (onlyOnScreen && !this.isEnemyOnScreen(e, 20)) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < minD) { minD = d; closest = e; }
    }
    return closest;
  },

  createVfxPool() {
    this.vfxPool = this.add.group({ defaultKey: 'vfx', maxSize: 48 });
    for (let i = 0; i < 30; i++) {
      const s = this.add.image(-200, -200, 'vfx', 0).setVisible(false).setActive(false).setDepth(150);
      this.vfxPool.add(s);
    }
  },

  spawnVfx(x, y, frame = 0, scale = 1, opts = {}) {
    const v = this.vfxPool.get(x, y, 'vfx', frame);
    if (!v) return null;
    const grow = opts.grow || 1, duration = opts.duration || 320, alpha = opts.alpha ?? 0.95;
    v.clearTint().setActive(true).setVisible(true).setPosition(x, y).setFrame(frame)
      .setScale(scale).setAlpha(alpha).setAngle(opts.angle || 0).setDepth(opts.depth || y + 2);
    if (opts.tint) v.setTint(opts.tint);
    this.tweens.killTweensOf(v);
    this.tweens.add({
      targets: v,
      scaleX: scale * grow, scaleY: scale * grow,
      alpha: 0,
      duration,
      ease: opts.ease || 'Cubic.easeOut',
      onComplete: () => { v.setActive(false).setVisible(false); }
    });
    return v;
  },

  perspective(y) {
    const t = Phaser.Math.Clamp((y - this.field.top) / (this.field.bottom - this.field.top), 0, 1);
    return 0.65 + 0.55 * t;
  },

  fixed(o, d = 100) {
    return o.setScrollFactor(0).setDepth(d);
  },

  showFloatingText(x, y, text, color = '#ffffff', fontSize = '12px') {
    const txt = this.add.text(x, y, text, {
      fontSize,
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(8500);

    this.tweens.add({
      targets: txt,
      y: y - 45,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  },

  getSkillMastery(skillId) {
    if (!gameState.skillMastery) gameState.skillMastery = {};
    if (!gameState.skillMastery[skillId]) gameState.skillMastery[skillId] = { tierIdx: 0, exp: 0 };
    const data = gameState.skillMastery[skillId];
    const tier = SKILL_MASTERY_TIERS[data.tierIdx] || SKILL_MASTERY_TIERS[0];
    const nextTier = SKILL_MASTERY_TIERS[data.tierIdx + 1] || null;
    return { tierIdx: data.tierIdx, exp: data.exp, tier, nextTier, isMax: !nextTier };
  },

  gainSkillExp(skillId, amt = 1) {
    const mastery = this.getSkillMastery(skillId);
    if (mastery.isMax) return mastery;
    const skillObj = ELEMENTAL_SKILLS.find(s => s.id === skillId);
    const sName = skillObj ? skillObj.name : skillId;
    gameState.skillMastery[skillId].exp += amt;
    const curTier = mastery.tier;
    if (gameState.skillMastery[skillId].exp >= curTier.expReq && mastery.nextTier) {
      gameState.skillMastery[skillId].tierIdx++;
      gameState.skillMastery[skillId].exp = 0;
      const newTier = SKILL_MASTERY_TIERS[gameState.skillMastery[skillId].tierIdx];
      this.spawnVfx(this.player.x, this.player.y, 0, 1.4, { tint: newTier.badgeBg, duration: 600 });
      this.showFloatingText(this.player.x, this.player.y - 85,
        `⚡ [${sName}] ĐỘT PHÁ [${newTier.name.toUpperCase()}]! (ST +${Math.round(newTier.dmgBonus * 100)}%)`,
        newTier.color, '15px');
      if (this.createSkillBar) this.createSkillBar();
    }
    return this.getSkillMastery(skillId);
  },
};
