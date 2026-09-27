/**
 * CombatMixin.js
 * Quản lý: basicAttack, castSkill, spawnSpellVfx, damageEnemy, takePlayerDamage,
 *           gainExp, playerDeath, respawnPlayer, onSecondTick
 */
import { REALMS } from '../../config/realmsData.js';
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';
import { CRAFTING_SYSTEM, calculatePillEfficiency, getPlayerPillRank } from '../../config/craftingData.js';

export const CombatMixin = {

  basicAttack() {
    if (this.time.now < this.lastBasic + 300) return;
    this.lastBasic = this.time.now;

    // Đánh quái: Tự động ngắt trạng thái nghỉ ngơi / tĩnh tọa
    if (this.cancelRestingState) {
      this.cancelRestingState();
    }

    // Melee attack only (close range 110px)
    const target = this.nearestEnemy(110);
    if (target && target.active) {
      this.player.setFlipX(target.x < this.player.x);
    }

    if (this.player && this.player.active) {
      this.attackUntil = this.time.now + 400;
      this.player.play('p_attack', true);
    }

    if (target && target.active) {
      const sense = this.calcPlayerSpiritualSense ? this.calcPlayerSpiritualSense() : (gameState.spiritualSense || 10);
      const critRate = 0.15 + (sense * 0.005);
      const isCrit = Math.random() < critRate;
      let dmg = this.calcPlayerElementalDmg ? this.calcPlayerElementalDmg('Vật Lý') : (this.playerDmg || 1);
      if (isCrit) dmg = Math.floor(dmg * 1.85);
      this.damageEnemy(target, dmg, isCrit);
      this.spawnVfx(target.x, target.y, 0, 0.55, { duration: 240, grow: 1.3 });
    }
  },

  // ==================================================================
  // CAST EQUIPPED SKILL (1..5)  —  Ranged Spell & Sword System
  // ==================================================================
  castSkill(skillId) {
    const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    const atkInterval = this.calcPlayerAtkInterval ? this.calcPlayerAtkInterval() : 400;

    // Kim Nhận Thuật & Bạch Hổ Canh Kim Kiếm: Không có hồi chiêu cố định, phụ thuộc vào Tốc Độ Đánh của Player
    if (skill.id === 'kim_1' || skill.id === 'kim_2' || skill.cd === 0) {
      const lastCastKey = `last_${skill.id}_cast`;
      if (this[lastCastKey] && this.time.now < this[lastCastKey] + atkInterval) return;
      this[lastCastKey] = this.time.now;
      this.activeSkillCds[skillId] = atkInterval;
    } else {
      if (this.activeSkillCds[skillId] > 0) return;
      this.activeSkillCds[skillId] = skill.cd;
    }

    // Tung kỹ năng: Tự động ngắt trạng thái nghỉ ngơi / tĩnh tọa
    if (this.cancelRestingState) {
      this.cancelRestingState();
    }

    // Ranged skill targeting (strictly limited to visible on-screen enemies)
    const target = this.nearestEnemy(460, true);
    if (target && target.active) {
      this.player.setFlipX(target.x < this.player.x);
    }

    if (this.player && this.player.active) {
      const isFastSkill = (skill.id === 'kim_1' || skill.id === 'kim_2' || skill.cd === 0);
      const animDuration = isFastSkill ? Math.min(260, Math.floor(atkInterval * 0.65)) : 450;
      this.attackUntil = this.time.now + animDuration;
      this.player.play('p_attack', true);
    }

    const elemColors = {
      'Kiếm': '#99eeff', 'Kim': '#ffd700', 'Hỏa': '#ff4422', 'Thủy': '#44aaff', 'Thổ': '#aa8844',
      'Mộc': '#44dd66', 'Phong': '#66ffcc', 'Lôi': '#ffee33', 'Vật Lý': '#ff88aa'
    };
    const elemKeyMap = {
      'Kiếm': 'kim', 'Kim': 'kim', 'Hỏa': 'hoa', 'Thủy': 'thuy', 'Thổ': 'tho',
      'Mộc': 'moc', 'Phong': 'phong', 'Lôi': 'loi', 'Vật Lý': 'ly'
    };
    const elemKey = elemKeyMap[skill.elem] || 'kim';

    // --- 3-Tier VFX logic ---
    let vfxKey;
    if (skill.healPct && !skill.dmgMul)        { vfxKey = 'vfx_heal'; }
    else if (skill.shield && !skill.dmgMul)    { vfxKey = 'vfx_shield'; }
    else if (skill.spdBuff && !skill.dmgMul)   { vfxKey = 'vfx_speed'; }
    else if (skill.minRealm >= 8)              { vfxKey = `vfx_ult_${elemKey}`; }
    else if (skill.minRealm >= 4)              { vfxKey = `vfx_mid_${elemKey}`; }
    else                                       { vfxKey = `vfx_skill_${elemKey}`; }

    // Tăng điểm thuần thục kỹ năng mỗi khi thi triển (Sơ Nhập -> Tiểu Thành -> Đại Thành -> Viên Mãn)
    const mastery = this.gainSkillExp ? this.gainSkillExp(skillId, 1) : (this.getSkillMastery ? this.getSkillMastery(skillId) : { tier: { dmgBonus: 0, vfxMul: 1.0, name: 'Sơ Nhập', color: '#aaddff' } });
    const masteryDmgBonus = mastery.tier.dmgBonus || 0;
    const vfxMul = mastery.tier.vfxMul || 1.0;

    const isDivine = (skill.minRealm >= 16);
    const elemDmg = this.calcPlayerElementalDmg ? this.calcPlayerElementalDmg(skill.elem || 'Kiếm') : (this.playerDmg || 1);
    const baseDmg = Math.max(1, Math.floor(elemDmg * (skill.dmgMul || 1) * (1 + masteryDmgBonus)));

    // --- Buff-only skills ---
    if (skill.healPct && !skill.dmgMul) {
      const healAmount = Math.floor(this.playerHpMax * skill.healPct * (1 + masteryDmgBonus * 0.5));
      this.playerHp = Math.min(this.playerHpMax, this.playerHp + healAmount);
      this.spawnSpellVfx(this.player.x, this.player.y - 30, 'vfx_heal', 0.75 * vfxMul, 600, false);
      this.showFloatingText(this.player.x, this.player.y - 80, `+${healAmount} HP`, '#44ff66', '16px');
      this.showFloatingText(this.player.x, this.player.y - 60, `[${skill.elem} • ${mastery.tier.name}] ${skill.name}`, mastery.tier.color || elemColors[skill.elem] || '#ffd700', '12px');
      return;
    }
    if (skill.spdBuff && !skill.dmgMul) {
      this.spawnSpellVfx(this.player.x, this.player.y, 'vfx_speed', 0.75 * vfxMul, 500, true);
      this.showFloatingText(this.player.x, this.player.y - 60, `[${skill.elem} • ${mastery.tier.name}] ${skill.name}`, mastery.tier.color || elemColors[skill.elem] || '#ffd700', '12px');
      return;
    }
    if (skill.shield && !skill.dmgMul) {
      this.spawnSpellVfx(this.player.x, this.player.y, 'vfx_shield', 0.8 * vfxMul, 550, false);
      this.showFloatingText(this.player.x, this.player.y - 60, `[${skill.elem} • ${mastery.tier.name}] ${skill.name}`, mastery.tier.color || elemColors[skill.elem] || '#ffd700', '12px');
      return;
    }

    // --- Dedicated Universal Elemental & Sword System Choreography ---
    this.castElementalSkill(skill, target, baseDmg, elemColors, mastery);
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
    const finalDmg = Math.max(1, Math.floor(dmg || 1));
    enemy.hp -= finalDmg;

    if (attacker?.type === 'player' && this.cancelRestingState) {
      this.cancelRestingState();
    }

    // Ghi nhận lượng sát thương của từng nguồn tấn công (Player, NPC Tổ Đội, NPC Tán Tu Ngoài Map)
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
    if (this.dead || this.time.now < this.invulnerableUntil || this.isDashing || !this.player || !this.player.active) return;

    // Bị đánh: Ngắt ngay trạng thái nghỉ ngơi / dưỡng sức & tĩnh tọa
    if (this.cancelRestingState) {
      this.cancelRestingState('⚔ Bị Địch Tấn Công: Ngắt Dưỡng Sức & Tĩnh Tọa!');
    }

    const def = this.calcPlayerElementalDef ? this.calcPlayerElementalDef(elem) : (this.calcPlayerDef ? this.calcPlayerDef() : 0);
    const dmg = Math.max(1, rawDmg - def);
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
    // gardenTimer cũ đã bị xóa: Linh Thảo CHỈ thu được bằng cách hái tay, không tự tăng

    // 1. Quản lý Dược Lực Đan Dược (Pill Buff Countdown)
    let pillSpeed = 0;
    if (gameState.activePillBuff) {
      gameState.activePillBuff.durationLeft = (gameState.activePillBuff.durationLeft || 1) - 1;
      pillSpeed = gameState.activePillBuff.speed || 0;
      if (gameState.activePillBuff.durationLeft <= 0) {
        const expiredName = gameState.activePillBuff.name;
        gameState.activePillBuff = null;
        this.updateHUD();
        this.showFloatingText(this.player.x, this.player.y - 70, `Dược lực của [${expiredName}] đã tiêu tán hết!`, '#a0aec0');
      }
    }

    // 2. Tu Luyện Tự Động / Tĩnh Tọa (Công Pháp + Dược Lực Đan Dược)
    const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
    let cpSpeed = 0;
    if (cp && gameState.realmIdx <= cp.maxRealmIdx) {
      cpSpeed = cp.speed || 2;
    }

    let totalSpeed = cpSpeed + pillSpeed;
    if (totalSpeed > 0) {
      if (gameState.isMeditating) totalSpeed *= 3; // Tĩnh tọa tăng gấp 3 toàn bộ tốc độ tụ khí
      if (gameState.aptitude === 'Thiên Linh Căn') totalSpeed = Math.floor(totalSpeed * 1.5);
      if (gameState.sectId) totalSpeed = Math.floor(totalSpeed * 1.2);

      this.gainExp(totalSpeed, false);

      // Hiệu ứng hào quang khi tĩnh tọa hoặc khi có dược lực đan dược
      if (this.player && this.player.active && (gameState.isMeditating || pillSpeed > 0)) {
        if (Math.random() < 0.35) {
          const vfxName = pillSpeed > 0 ? 'vfx_cast' : 'vfx_heal';
          this.spawnSpellVfx(this.player.x, this.player.y - 10, vfxName, 0.5, 500, false);
        }
      }
    }

    // 3. DƯỠNG SỨC: Hồi Phục HP & Pháp Lực Mỗi Giây (Khi isResting = true)
    if (gameState.isResting && !this.dead) {
      const maxHp = this.calcPlayerMaxHp();
      const maxMp = this.calcPlayerMaxMp();

      // Hồi 5% HP + 5% MP mỗi giây (x2 khi đồng thời Tĩnh Tọa)
      const regenRate = gameState.isMeditating ? 0.10 : 0.05;
      const hpRegen = Math.max(1, Math.floor(maxHp * regenRate));
      const mpRegen = Math.max(1, Math.floor(maxMp * regenRate));

      const wasFullHp = this.playerHp >= maxHp;
      const wasFullMp = (gameState.mana || 0) >= maxMp;

      this.playerHp = Math.min(maxHp, (this.playerHp || 0) + hpRegen);
      gameState.mana  = Math.min(maxMp, (gameState.mana  || 0) + mpRegen);

      this.updateHUD();

      // Hiệu ứng hào quang xanh hồi máu
      if (this.player && this.player.active && Math.random() < 0.55) {
        this.spawnSpellVfx(this.player.x, this.player.y - 10, 'vfx_heal', 0.55, 550, false);
      }

      // Thông báo khi HP/MP đầy, tự kết thúc dưỡng sức
      if (this.playerHp >= maxHp && (gameState.mana || 0) >= maxMp && !wasFullHp) {
        gameState.isResting = false;
        this.createSideToggleButtons();
        this.showFloatingText(this.player.x, this.player.y - 70, '✦ HP & PHÁP LỰC ĐÃ HỒI ĐẦY! KẾT THÚC DƯỠNG SỨC', '#ffd700', '13px');
        return;
      }

      // Hiển thị số HP/MP được hồi
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

      // Dừng di chuyển khi đang dưỡng sức (phòng khi bị nhấn nhầm di chuyển)
      if (this.player.body && (Math.abs(this.player.body.velocity.x) > 5 || Math.abs(this.player.body.velocity.y) > 5)) {
        this.player.setVelocity(0, 0);
        this.moveTarget = null;
      }
    }
  },

  // Phương thức dùng đan dược (Uống / Nuốt Đan)
  consumePill(pillName) {
    if (!gameState.inventory.pills || !gameState.inventory.pills[pillName] || gameState.inventory.pills[pillName] <= 0) {
      this.showFloatingText(this.player.x, this.player.y - 60, `Không có [${pillName}] trong túi!`, '#ff5555');
      return { success: false, error: 'Không có đan dược trong túi' };
    }

    const pill = CRAFTING_SYSTEM.pills.find(p => p.name === pillName);
    if (!pill) return { success: false, error: 'Đan dược không tồn tại' };

    // A. Đan dược Hồi Phục Khí Huyết
    if (pill.type === 'heal') {
      gameState.inventory.pills[pillName]--;
      const healHp = pill.healHp || 300;
      this.playerHp = Math.min(this.calcPlayerMaxHp(), (this.playerHp || 0) + healHp);
      this.spawnSpellVfx(this.player.x, this.player.y, 'vfx_heal', 0.8, 600, false);
      this.showFloatingText(this.player.x, this.player.y - 60, `+${healHp} HP (${pill.name})!`, '#4ade80');
      this.updateHUD();
      return { success: true, type: 'heal' };
    }

    // B. Đan dược Đột Phá Bình Cảnh
    if (pill.type === 'breakthrough') {
      this.showFloatingText(this.player.x, this.player.y - 60, `Hãy nhấn [ĐỘT PHÁ] trong bảng Cảnh Giới để dùng [${pill.name}]!`, '#ffd700');
      return { success: false, error: 'Dùng khi đột phá cảnh giới' };
    }

    // C. Đan dược Tăng Tốc Độ Tụ Khí (Cultivation Speed Buff)
    const check = calculatePillEfficiency(pill, gameState.realmIdx);
    if (!check.canUse) {
      this.showFloatingText(this.player.x, this.player.y - 70, `❌ ${check.reason}`, '#ff4444', '13px');
      return { success: false, error: check.reason };
    }

    // Tiêu thụ 1 viên đan dược
    gameState.inventory.pills[pillName]--;
    const duration = pill.durationSec || 180;
    gameState.activePillBuff = {
      name: pill.name,
      speed: check.effectiveSpeed,
      rank: pill.pillRank,
      durationLeft: duration,
      expiresAt: Date.now() + duration * 1000
    };

    this.spawnSpellVfx(this.player.x, this.player.y, 'vfx_cast', 1.0, 800, false);
    const floatColor = (check.efficiency < 1.0) ? '#f59e0b' : '#38bdf8';
    this.showFloatingText(this.player.x, this.player.y - 70, `💊 Nuốt [${pill.name}]: +${check.effectiveSpeed} Tu Vi/s (${duration}s)!`, floatColor, '14px');
    this.updateHUD();
    return { success: true, type: 'cultivation', buff: gameState.activePillBuff, check };
  },

  gainExp(amt, showVisual = false) {
    const realm = REALMS[gameState.realmIdx] || REALMS[0];
    gameState.exp += amt;

    if (gameState.exp >= realm.expReq) {
      if (realm.bottleneck) {
        const reqPill = realm.pillNeeded;
        if (gameState.afkSettings?.autoBreakthrough && gameState.inventory.pills[reqPill] > 0) {
          gameState.inventory.pills[reqPill]--;
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
  // Universal Elemental System Choreography (9 Elemental Systems x 5 Tiers x 4 Mastery Stages)
  // ----------------------------------------------------------------
  castSwordSkill(skill, target, baseDmg, elemColors, mastery) {
    return this.castElementalSkill(skill, target, baseDmg, elemColors, mastery);
  },

  castElementalSkill(skill, target, baseDmg, elemColors, mastery = { tier: { name: 'Sơ Nhập', dmgBonus: 0, vfxMul: 1.0, color: '#aaddff' } }) {
    const elemName = skill.elem || skill.element || 'Kiếm';
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

    // Determine element key
    let elemKey = 'kiem';
    if (elemName === 'Hỏa') elemKey = 'hoa';
    else if (elemName === 'Lôi') elemKey = 'loi';
    else if (elemName === 'Kim') elemKey = 'kim';
    else if (elemName === 'Thủy') elemKey = 'thuy';
    else if (elemName === 'Phong') elemKey = 'phong';
    else if (elemName === 'Mộc') elemKey = 'moc';
    else if (elemName === 'Thổ') elemKey = 'tho';
    else if (elemName === 'Vật Lý') elemKey = 'ly';
    else if (elemName === 'Kiếm') elemKey = 'kiem';

    // Skill tier: 1 (Luyện Khí), 2 (Trúc Cơ), 3 (Kim Đan), 4 (Nguyên Anh), 5 (Hóa Thần)
    let tierLevel = 1;
    if (skill.minRealm >= 16) tierLevel = 5;
    else if (skill.minRealm >= 12) tierLevel = 4;
    else if (skill.minRealm >= 8) tierLevel = 3;
    else if (skill.minRealm >= 4) tierLevel = 2;
    else tierLevel = 1;

    // Color palettes for 4 mastery stages
    const paletteMap = {
      hoa: [0xff5522, 0xff7733, 0xff9944, 0xffcc44],
      loi: [0xaa44ff, 0x00e5ff, 0xdd66ff, 0xffffff],
      kim: [0xffd700, 0xfff0aa, 0xffcc33, 0xffe680],
      thuy: [0x00c8ff, 0x33e5ff, 0x80f0ff, 0x0099ff],
      phong: [0x00ffaa, 0x66ffcc, 0x33e5b5, 0xaaffdd],
      moc: [0x22ee66, 0x66ff88, 0xaaffaa, 0x33cc55],
      tho: [0xddaa44, 0xffbb55, 0xcc8833, 0xeecc77],
      ly: [0xffeedd, 0xddccbb, 0xffffff, 0xeeaa88],
      kiem: [0xffd700, 0x00e5ff, 0xff3355, 0xaa44ff]
    };
    const elementTints = {
      hoa: 0xff6622,
      loi: 0xaa44ff,
      kim: 0xffd700,
      thuy: 0x00c8ff,
      phong: 0x00ffaa,
      moc: 0x22ee66,
      tho: 0xddaa44,
      ly: 0xffeedd,
      kiem: 0xffea66
    };

    const mainTint = elementTints[elemKey] || 0xffd700;
    const tierIdx = mastery.tierIdx || (mastery.tier ? mastery.tier.idx : 0);
    const isDaiThanhOrAbove = (tierIdx >= 2);

    // Texture Key Resolution
    const proj1Key = (elemKey === 'kiem') ? 'vfx_kim_1_0' : (this.textures.exists(`vfx_${elemKey}_1`) ? `vfx_${elemKey}_1` : 'vfx_kim_1_0');
    const proj2Key = (elemKey === 'kiem') ? 'vfx_kim_2_0' : (this.textures.exists(`vfx_${elemKey}_2`) ? `vfx_${elemKey}_2` : 'vfx_kim_2_0');
    const proj2HitKey = (elemKey === 'kiem') ? 'vfx_kim_2_2' : (this.textures.exists(`vfx_${elemKey}_2`) ? `vfx_${elemKey}_2` : 'vfx_kim_2_2');
    const array3Key = (elemKey === 'kiem') ? 'vfx_kim_3_0' : (this.textures.exists(`vfx_${elemKey}_3`) ? `vfx_${elemKey}_3` : 'vfx_kim_3_0');
    const swordKiemKhiKey = (this.textures.exists('vfx_sword_kiem_khi')) ? 'vfx_sword_kiem_khi' : 'vfx_kim_1_7';
    const swarm4Key = (elemKey === 'kiem') ? swordKiemKhiKey : (this.textures.exists(`vfx_${elemKey}_4`) ? `vfx_${elemKey}_4` : swordKiemKhiKey);
    const colossus5Key = (elemKey === 'kiem') ? 'vfx_giant_tru_tien_sword' : (this.textures.exists(`vfx_${elemKey}_5`) ? `vfx_${elemKey}_5` : 'vfx_giant_tru_tien_sword');
    const shockwaveKey = (elemKey === 'kiem') ? 'vfx_tru_tien_shockwave' : (this.textures.exists(`vfx_${elemKey}_shockwave`) ? `vfx_${elemKey}_shockwave` : 'vfx_tru_tien_shockwave');
    const impactKey = (this.textures.exists('vfx_impact_frame7')) ? 'vfx_impact_frame7' : 'vfx_sword_impact_frame7';

    // =========================================================================
    // TIER 1: Luyện Khí (4 Projectiles - Bezier Arc Tracking - Soft Impact Slash)
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
        targetScale = Phaser.Math.Clamp(eScale * (target.isBoss ? 1.30 : 1.00) * vfxMul, 0.40, 1.70);
      }

      const colors = isDaiThanhOrAbove
        ? (paletteMap[elemKey] || [0xffd700, 0x00e5ff, 0xff3355, 0xaa44ff])
        : [mainTint, 0xffffff, mainTint, 0xffffff];

      const arcOffsets = [-70, -24, 24, 70];
      const perProjDmg = Math.max(1, Math.floor(baseDmg / 4));

      for (let i = 0; i < 4; i++) {
        const pTint = colors[i];
        const offsetDist = arcOffsets[i] * Math.min(1.5, vfxMul);

        this.time.delayedCall(i * 35, () => {
          const proj = this.add.sprite(startX, startY, proj1Key)
            .setDepth(Math.floor(this.player.y) + 50 + i)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(startScale)
            .setTint(pTint);

          const animKey = `anim_vfx_${elemKey}_1`;
          if (this.anims.exists(animKey)) proj.play(animKey);

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
              proj.destroy();
              const finalHitX = (target && target.active) ? target.x : endX;
              const finalHitY = (target && target.active) ? target.y - 15 : endY;

              if (impactKey && this.textures.exists(impactKey)) {
                const impactVfx = this.add.sprite(finalHitX, finalHitY, impactKey)
                  .setDepth(Math.floor(finalHitY) + 58)
                  .setBlendMode(Phaser.BlendModes.ADD)
                  .setScale(targetScale * 0.30)
                  .setAlpha(0.06)
                  .setTint(pTint);

                impactVfx.setRotation(proj.rotation || 0);

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

      this.showFloatingText(
        this.player.x,
        this.player.y - 70,
        `[${elemName} • ${mastery.tier.name}] ${skill.name}!`,
        mastery.tier.color || elemColor,
        '13px'
      );
      return;
    }

    // =========================================================================
    // TIER 2: Trúc Cơ (Dual Strike / Crescent Qi -> Dynamic Tracking -> Hit Burst)
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
        targetScale = Phaser.Math.Clamp(eScale * (target.isBoss ? 1.60 : 1.25) * vfxMul, 0.55, 2.10);
      }

      const crossProjectile = this.add.sprite(startX, startY, proj2Key)
        .setDepth(Math.floor(this.player.y) + 55)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(startScale)
        .setTint(mainTint);
      
      const initAngle = Phaser.Math.Angle.Between(startX, startY, endX, endY);
      crossProjectile.setRotation(initAngle);
      if (elemKey === 'kiem' && this.anims.exists('anim_vfx_kim_2_fly')) crossProjectile.play('anim_vfx_kim_2_fly');

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
            .setTint(mainTint);
          hitBurst.setRotation(finalAngle);
          if (elemKey === 'kiem' && this.anims.exists('anim_vfx_kim_2_hit')) hitBurst.play('anim_vfx_kim_2_hit');
          
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
      this.showFloatingText(this.player.x, this.player.y - 70, `[${elemName} • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || elemColor, '14px');
      return;
    }

    // =========================================================================
    // TIER 3: Kim Đan (Formation Array & 6/8/10/12 Missiles Falling in Circle - 3.0s AoE)
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
            onComplete: () => {
              if (groundArray && groundArray.active) groundArray.destroy();
            }
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
            onComplete: () => {
              this.spawnVfx(gx, gy, 0, 0.40, { tint: mainTint, duration: 160 });
            }
          });
        });
      }

      const tickCount = 6;
      const tickInterval = 500;
      const perTickDmg = Math.max(1, Math.floor(baseDmg / 6));

      for (let tick = 0; tick < tickCount; tick++) {
        this.time.delayedCall(tick * tickInterval, () => {
          this.spawnVfx(tx, ty, 0, 1.2, { tint: mainTint, duration: 220 });

          [...this.enemies].forEach(t => {
            if (!t || !t.active || !this.isEnemyOnScreen(t, 40)) return;
            const nx = (t.x - tx) / (targetRadiusX + 20);
            const ny = (t.y - ty) / (targetRadiusY + 20);
            const inFormation = (nx * nx + ny * ny) <= 1.15;

            if (inFormation) {
              this.damageEnemy(t, perTickDmg, (tick % 2 === 0));

              if (impactKey && this.textures.exists(impactKey)) {
                const eScale = Math.abs(t.scaleX || 0.50);
                const slashBaseScale = Math.max(0.40, eScale * 1.15);
                const hitOffsetY = t.displayHeight ? (t.displayHeight * 0.28) : 20;
                const hx = t.x + Phaser.Math.Between(-8, 8);
                const hy = t.y - hitOffsetY + Phaser.Math.Between(-6, 6);

                const slashVfx = this.add.sprite(hx, hy, impactKey)
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
                  onComplete: () => {
                    this.tweens.add({
                      targets: slashVfx,
                      scaleX: slashBaseScale * 1.25,
                      scaleY: slashBaseScale * 1.25,
                      alpha: 0,
                      duration: 150,
                      ease: 'Quad.easeIn',
                      onComplete: () => {
                        if (slashVfx && slashVfx.active) slashVfx.destroy();
                      }
                    });
                  }
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

      this.showFloatingText(
        this.player.x,
        this.player.y - 70,
        `[${elemName} • ${mastery.tier.name}] ${skill.name}!`,
        mastery.tier.color || elemColor,
        '15px'
      );
      return;
    }

    // =========================================================================
    // TIER 4: Nguyên Anh (Swarm Dragon Orbit -> 8 Directions Pierce & 3 Passes)
    // =========================================================================
    if (tierLevel === 4) {
      const countsByTier = [10, 14, 18, 22];
      const swarmCount = countsByTier[tierIdx] || 10;
      const targetEnemy = target;

      const perHitDmg = Math.max(1, Math.floor(baseDmg / (swarmCount * 3)));
      const orbitRadiusX = 85;
      const orbitRadiusY = 38;
      const orbitHeight = 130;

      const getTargetPos = () => {
        if (targetEnemy && targetEnemy.active) {
          return { x: targetEnemy.x, y: targetEnemy.y };
        }
        return { x: tx, y: ty };
      };

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

          this.tweens.add({
            targets: unit,
            alpha: 1.0,
            duration: 160,
            ease: 'Quad.easeOut'
          });

          const orbitTimer = this.time.addEvent({
            delay: 16,
            loop: true,
            callback: () => {
              if (!unit || !unit.active) {
                orbitTimer.remove();
                return;
              }
              const curT = getTargetPos();
              const elapsed = this.time.now - orbitStartTime;
              orbitAngle += 0.10;

              const ox = curT.x + Math.cos(orbitAngle) * orbitRadiusX;
              const oy = (curT.y - orbitHeight) + Math.sin(orbitAngle) * orbitRadiusY;
              unit.setPosition(ox, oy);

              const vx = -orbitRadiusX * Math.sin(orbitAngle);
              const vy = orbitRadiusY * Math.cos(orbitAngle);
              unit.setRotation(Math.atan2(vy, vx));

              if (elapsed >= orbitDuration) {
                orbitTimer.remove();
                startPiercingPasses();
              }
            }
          });

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

              let endX, endY;

              if (passIndex === 1) {
                endX = hitX + passDistX;
                endY = hitY + passDistY;
              } else if (passIndex === 2) {
                endX = hitX - passDistX;
                endY = hitY - passDistY;
              } else {
                endX = hitX + passDistX;
                endY = hitY + passDistY;
              }

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
                            onComplete: () => {
                              this.tweens.add({
                                targets: slashVfx,
                                scaleX: baseSlashScale * 1.25,
                                scaleY: baseSlashScale * 1.25,
                                alpha: 0,
                                duration: 140,
                                ease: 'Quad.easeIn',
                                onComplete: () => { if (slashVfx.active) slashVfx.destroy(); }
                              });
                            }
                          });
                        }
                      }
                    });
                  }
                },
                onComplete: () => {
                  if (passIndex < 3) {
                    this.time.delayedCall(80, () => {
                      executePass();
                    });
                  } else {
                    this.spawnVfx(unit.x, unit.y, 0, 0.60, { tint: mainTint, duration: 200 });
                    this.tweens.add({
                      targets: unit,
                      alpha: 0,
                      scaleX: 0.1,
                      scaleY: 0.1,
                      duration: 160,
                      onComplete: () => {
                        if (unit && unit.active) unit.destroy();
                      }
                    });
                  }
                }
              });
            };

            executePass();
          };
        });
      }
      this.showFloatingText(this.player.x, this.player.y - 70, `[${elemName} • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || elemColor, '15px');
      return;
    }

    // =========================================================================
    // TIER 5: Hóa Thần (Colossus Sky Drop, 4-Tier Range Scaling & 5.0s AoE Storm)
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
            .setAlpha(1.0)
            .setTint(mainTint);

          this.tweens.add({
            targets: shockwave,
            scaleX: shockwaveScale,
            scaleY: shockwaveScale * 0.62,
            alpha: 0,
            duration: 950,
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
                  onComplete: () => {
                    this.tweens.add({
                      targets: slashVfx,
                      scaleX: slashTargetScale * 1.25,
                      scaleY: slashTargetScale * 1.25,
                      alpha: 0,
                      duration: 180,
                      ease: 'Quad.easeIn',
                      onComplete: () => { if (slashVfx.active) slashVfx.destroy(); }
                    });
                  }
                });
              }
            }
          });
        }
      });

      // Ambient Storm effects over 5s
      const stormList = [];
      const stormTexture = (elemKey === 'kiem' || elemKey === 'loi') ? 'vfx_loi' : swarm4Key;
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
              onComplete: () => {
                if (bolt && bolt.active) bolt.destroy();
              }
            });
          }
        }
      });

      const tickCount = 10;
      const tickInterval = 500;

      for (let tick = 1; tick <= tickCount; tick++) {
        this.time.delayedCall(tick * tickInterval, () => {
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
            onComplete: () => {
              if (colossus && colossus.active) colossus.destroy();
            }
          });
        }
      });

      this.showFloatingText(this.player.x, this.player.y - 70, `[${elemName} • ${mastery.tier.name}] ${skill.name}!`, mastery.tier.color || '#ffffff', '16px');
      return;
    }
  }
};
