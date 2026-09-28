/**
 * HudMixin.js
 * Quản lý: Top HUD, Bottom Nav, Skill Bar, AFK Banner, Touch Controls, Minimap
 */
import { REALMS } from '../../config/realmsData.js';
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { SECTS, SECT_RANKS } from '../../config/sectsData.js';
import { ALL_MAPS } from '../../config/regionsData.js';
import { gameState } from '../../state/gameState.js';
import { W, H } from '../constants.js';

export const HudMixin = {

  addHudSkinRegion(rect, depth) {
    const skin = this.fixed(this.add.image(W / 2, H / 2, 'hud_skin').setDisplaySize(W, H), depth);
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    for (const area of rect) maskShape.fillRect(area.x, area.y, area.w, area.h);
    maskShape.setScrollFactor(0);
    skin.setMask(maskShape.createGeometryMask());
    skin.once(Phaser.GameObjects.Events.DESTROY, () => maskShape.destroy());
    return skin;
  },

  createTopHUD() {
    this.topHudVisible = true;
    this.topHudElements = [];
    const font = 'Be Vietnam Pro, sans-serif';
    const fixed = (obj, depth) => {
      const item = this.fixed(obj, 9000 + depth - 200);
      this.topHudElements.push(item);
      return item;
    };

    this.topHudElements.push(this.addHudSkinRegion([{ x: 0, y: 0, w: 405, h: 145 }], 9000));
    fixed(this.add.circle(52, 54, 37, 0x092c35, 1), 200);
    const portrait = fixed(this.add.image(52, 54, 'hud_portrait').setDisplaySize(82, 82), 203);
    const portraitMask = this.make.graphics({ x: 0, y: 0, add: false });
    portraitMask.fillStyle(0xffffff).fillCircle(52, 54, 38);
    portraitMask.setScrollFactor(0);
    portrait.setMask(portraitMask.createGeometryMask());
    portrait.once(Phaser.GameObjects.Events.DESTROY, () => portraitMask.destroy());
    const avatarHit = fixed(this.add.circle(52, 54, 40, 0x000000, 0).setInteractive({ useHandCursor: true }), 205);
    avatarHit.on('pointerdown', () => this.openCurrencyExchangeModal());

    this.hudRealmText = fixed(this.add.text(110, 24, '', {
      fontFamily: font, fontSize: '17px', fontStyle: 'bold', color: '#ffe2a0'
    }).setStroke('#07151b', 3).setOrigin(0, 0.5), 204);
    this.hudSectText = fixed(this.add.text(112, 45, '', {
      fontFamily: font, fontSize: '12px', fontStyle: 'bold', color: '#9ee9d8'
    }).setOrigin(0, 0.5), 204);
    this.hudMapText = fixed(this.add.text(348, 45, '', {
      fontFamily: font, fontSize: '11px', fontStyle: 'bold', color: '#f2d991'
    }).setOrigin(1, 0.5), 204);

    const makeBar = (y, label, track, fill) => {
      fixed(this.add.text(113, y, label, { fontFamily: font, fontSize: '11px', fontStyle: 'bold', color: '#eef8ec' }).setOrigin(0, 0.5), 204);
      return fixed(this.add.rectangle(143, y, 230, 8, fill, 1).setOrigin(0, 0.5), 203);
    };
    this.hudHpBar = makeBar(68, 'HP', 0x321520, 0xe64e65);
    this.hudMpBar = makeBar(85, 'MP', 0x102c44, 0x51b9f4);
    this.hudExpBar = makeBar(102, 'TU', 0x14352e, 0x68e0ae);
    this.hudHpText = fixed(this.add.text(258, 68, '', { fontFamily: font, fontSize: '11px', fontStyle: 'bold', color: '#ffffff' }).setStroke('#291019', 2).setOrigin(0.5), 204);
    this.hudMpText = fixed(this.add.text(258, 85, '', { fontFamily: font, fontSize: '11px', fontStyle: 'bold', color: '#ffffff' }).setStroke('#0a2030', 2).setOrigin(0.5), 204);
    this.hudExpText = fixed(this.add.text(258, 102, '', { fontFamily: font, fontSize: '10px', fontStyle: 'bold', color: '#ffffff' }).setStroke('#0c2720', 2).setOrigin(0.5), 204);

    this.createUiToggleButton();
    this.updateHUD();
  },

  createUiToggleButton() {
    if (this.input?.keyboard) {
      this.input.keyboard.on('keydown-H', () => this.toggleTopHUD());
    }
  },

  toggleTopHUD() {
    this.topHudVisible = !this.topHudVisible;
    const isVis = this.topHudVisible;

    if (this.topHudElements) {
      this.topHudElements.forEach(el => {
        if (el && el.setVisible) el.setVisible(isVis);
      });
    }

    if (this.minimapElements) {
      this.minimapElements.forEach(el => {
        if (el && el.setVisible) el.setVisible(isVis);
      });
      this.miniMapLabel?.setVisible?.(isVis && Number(gameState.currentMapId) === 0);
    }

    if (this.mini) {
      if (!isVis) this.mini.clear();
      this.mini.setVisible(isVis);
    }
    this.restToggleElements?.forEach(el => el.setVisible(isVis));
    this.autoToggleElements?.forEach(el => el.setVisible(isVis));

    this.showFloatingText(this.player.x, this.player.y - 70, isVis ? '✨ ĐÃ HIỆN GIAO DIỆN UI' : '👁️ ĐÃ ẨN GIAO DIỆN UI', isVis ? '#68e0ae' : '#ffdf8c', '13px');
  },

  updateHUD() {
    const realm = REALMS[gameState.realmIdx] || REALMS[0];
    const nextReq = realm.expReq;
    const exp = gameState.exp || 0;
    const expPct = Math.min(100, Math.floor((exp / nextReq) * 100));

    const fmtCompact = (val) => {
      const num = Math.max(0, Math.floor(Number(val) || 0));
      if (num >= 1e9) return (num / 1e9).toFixed(2) + ' Tỷ';
      if (num >= 1e6) return (num / 1e6).toFixed(1) + ' Tr';
      if (num >= 1e4) return (num / 1e3).toFixed(1) + ' k';
      return num.toLocaleString('vi-VN');
    };

    if (this.hudRealmText) this.hudRealmText.setText(`✦ ${realm.name}`);
    if (this.hudExpBar) this.hudExpBar.width = Math.max(0, (expPct / 100) * 230);
    if (this.hudExpText) this.hudExpText.setText(`Tu Vi ${expPct}% · ${fmtCompact(exp)}/${fmtCompact(nextReq)}`);

    // HP Bar
    this.playerHpMax = this.calcPlayerMaxHp();
    if (this.playerHp === undefined || this.playerHp === null) this.playerHp = this.playerHpMax;
    const hpRatio = Math.max(0, Math.min(1, this.playerHp / (this.playerHpMax || 1)));
    if (this.hudHpBar) this.hudHpBar.width = Math.max(0, hpRatio * 230);
    if (this.hudHpText) this.hudHpText.setText(`${fmtCompact(this.playerHp)} / ${fmtCompact(this.playerHpMax)}`);

    // MP Bar
    const manaMax = this.calcPlayerMaxMp ? this.calcPlayerMaxMp() : (gameState.manaMax || 100);
    gameState.manaMax = manaMax;
    if (gameState.mana === undefined || gameState.mana === null || gameState.mana > manaMax) {
      gameState.mana = manaMax;
    }
    const mana = gameState.mana;
    const mpRatio = Math.max(0, Math.min(1, mana / (manaMax || 1)));
    if (this.hudMpBar) this.hudMpBar.width = Math.max(0, mpRatio * 230);
    if (this.hudMpText) this.hudMpText.setText(`${fmtCompact(mana)} / ${fmtCompact(manaMax)}`);

    // Sect
    if (this.hudSectText) {
      if (gameState.sectId) {
        const sect = SECTS.find(s => s.id === gameState.sectId);
        this.hudSectText.setText(`${sect.name} · ${SECT_RANKS[gameState.sectRankIdx].name}`.slice(0, 25));
      } else {
        this.hudSectText.setText('Tán Tu Tự Do');
      }
    }

    // Map
    if (this.hudMapText) {
      const map = ALL_MAPS[gameState.currentMapId] || ALL_MAPS[0];
      this.hudMapText.setText(map.name.slice(0, 23));
    }

    this.playerDmg = this.calcPlayerDmg();
    this.updateAfkBanner();
  },

  // ---- Bottom Navigation ----
  createBottomNav() {
    if (this.menuContainer) this.menuContainer.destroy(true);
    this.menuContainer = this.add.container(0, 0).setDepth(9000);
    const navSkin = this.addHudSkinRegion([{ x: 0, y: 833, w: W, h: H - 833 }], 9000);
    this.menuContainer.add(navSkin);

    // Bản đồ được mở bằng minimap ở góc trên.
    const navItems = [
      { key: 'bag',    label: 'Túi Đồ',   icon: 'xianxia_bag',    action: () => this.openGearPanel() },
      { key: 'realm',  label: 'Nhân Vật', icon: 'xianxia_realm',  action: () => this.openCharacterPanel() },
      { key: 'craft',  label: 'Bách Nghệ', icon: 'xianxia_craft',  action: () => this.openCraftingPanel('pills') },
      { key: 'skills', label: 'Công Pháp', icon: 'xianxia_skills', action: () => (this.openCongPhapHome ? this.openCongPhapHome() : this.openCongPhapPanel()) },
    ];

    // Các nút chia đều trong thanh điều hướng.
    const totalNavW = W - 24;
    const gap = totalNavW / navItems.length;
    const startX = 12 + gap / 2;
    navItems.forEach((btn, idx) => {
      const x = startX + idx * gap;
      const y = H - 62;
      const btnBox = this.fixed(
        this.add.rectangle(x, y, gap - 4, 130, 0x111e30, 0)
          .setInteractive({ useHandCursor: true }), 202);
      const iconImg = this.fixed(this.add.image(x, y - 17, btn.icon).setDisplaySize(57, 57), 204);
      const labelTxt = this.fixed(this.add.text(x, y + 27, btn.label, {
        fontSize: '15px', fontFamily: 'Be Vietnam Pro, sans-serif', fontStyle: 'bold', color: '#fff1d0'
      }).setStroke('#0a1b20', 3).setOrigin(0.5), 204);
      btnBox.on('pointerdown', (_pointer, _localX, _localY, event) => {
        event?.stopPropagation();
        btn.action();
      });
      btnBox.on('pointerover', () => iconImg.setTint(0xffe066));
      btnBox.on('pointerout', () => iconImg.clearTint());
      this.menuContainer.add([btnBox, iconImg, labelTxt]);
    });
    this.menuContainer.setVisible(this.menuVisible !== false);
  },

  // ---- Skill Bar (6 independent slots) ----
  createSkillBar() {
    if (this.skillContainer) this.skillContainer.destroy(true);
    this.skillContainer = this.add.container(0, 0).setDepth(9001);
    const skillSkin = this.addHudSkinRegion([{ x: 0, y: 720, w: 495, h: 115 }], 9001);
    this.skillContainer.add(skillSkin);
    const startX = 105, y = 795, gap = 63;
    this.skillSlots = [];

    for (let i = 0; i < 6; i++) {
      const slotIndex = i;
      const x = startX + i * gap;
      const skillId = gameState.equippedSkillIds[i];

      const slotBg = this.fixed(this.add.circle(x, y, 26, 0x111a28, 0).setInteractive({ useHandCursor: true }), 210);
      const hotkeyTxt = this.fixed(this.add.text(x, y + 26, `${i + 1}`, { fontSize: '11px', fontStyle: 'bold', color: '#ffe8a6' })
        .setOrigin(0.5).setBackgroundColor('#0b2630'), 211);

      let icon = null, cdOverlay = null, cdText = null;
      if (skillId) {
        const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
        if (skill) {
          icon = this.fixed(this.add.image(x, y, skill.icon).setDisplaySize(43, 43), 206);
          cdOverlay = this.fixed(this.add.circle(x, y, 22, 0x000000, 0.7).setVisible(false), 207);
          cdText = this.fixed(this.add.text(x, y, '', { fontSize: '13px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5), 208);

          const mastery = this.getSkillMastery ? this.getSkillMastery(skill.id) : { tier: { name: 'Sơ Nhập', color: '#aaddff' } };
          const badgeShort = mastery.tier.name[0]; // S, T, Đ, V
          const masteryBgColor = Phaser.Display.Color.HexStringToColor(mastery.tier.color).color;
          const masteryDot = this.fixed(this.add.rectangle(x + 18, y - 18, 15, 13, 0x08121e, 0.95).setStrokeStyle(1, masteryBgColor), 208);
          const masteryTxt = this.fixed(this.add.text(x + 18, y - 18, badgeShort, { fontSize: '8.5px', fontStyle: 'bold', color: mastery.tier.color }).setOrigin(0.5), 209);

          this.skillSlots.push({ skillId: skill.id, cdOverlay, cdText, slotBg, masteryDot, masteryTxt });
          this.skillContainer.add([icon, cdOverlay, cdText, masteryDot, masteryTxt]);
        }
      } else {
        const plus = this.fixed(this.add.text(x, y, '+', {
          fontSize: '24px', fontStyle: 'bold', color: '#9fc7c4'
        }).setOrigin(0.5), 207);
        this.skillContainer.add(plus);
        this.skillSlots.push({ skillId: null, slotBg });
      }

      let pressTimer = null, isLongPress = false;
      slotBg.on('pointerdown', (_pointer, _localX, _localY, event) => {
        event?.stopPropagation();
        isLongPress = false;
        pressTimer = this.time.delayedCall(450, () => {
          isLongPress = true;
          this.openQuickSkillSelectModal(slotIndex);
        });
      });
      slotBg.on('pointerup', () => {
        if (pressTimer) pressTimer.remove(false);
        if (!isLongPress) {
          if (skillId) this.castSkill(skillId);
          else this.openQuickSkillSelectModal(slotIndex);
        }
      });
      slotBg.on('pointerout', () => { if (pressTimer) pressTimer.remove(false); });

      this.skillContainer.add([slotBg, hotkeyTxt]);
    }

    this.skillContainer.setVisible(this.skillsVisible !== false);

  },

  createSideToggleButtons() {
    if (this.sideToggleContainer) this.sideToggleContainer.destroy(true);
    this.sideToggleContainer = this.add.container(0, 0).setDepth(9010);
    const controlsSkin = this.addHudSkinRegion([{ x: 395, y: 145, w: W - 395, h: 60 }], 9010);
    const isRest = gameState.isResting;
    const restToggle = this.fixed(this.add.rectangle(W - 39, 174, 70, 46, 0x45db9b, isRest ? 0.16 : 0)
      .setInteractive({ useHandCursor: true }), 209);
    const restToggleIcon = this.fixed(this.add.text(W - 39, 163, '♨', { fontSize: '20px', color: '#f5e5bf' }).setOrigin(0.5), 210);
    const restToggleTxt = this.fixed(this.add.text(W - 39, 186, isRest ? 'DỪNG' : 'NGHỈ', {
      fontSize: '11px', fontStyle: 'bold', color: isRest ? '#7affb7' : '#fff1d1'
    }).setOrigin(0.5), 210);

    restToggle.on('pointerdown', (_pointer, _localX, _localY, event) => {
      event?.stopPropagation();
      this.toggleResting();
    });

    if (isRest) {
      this.tweens.add({
        targets: restToggle,
        alpha: { from: 0.7, to: 1 },
        duration: 650,
        yoyo: true,
        repeat: -1
      });
    }

    const isAuto = !!gameState.autoFight;
    this.sideAutoBtnBg = this.fixed(this.add.rectangle(W - 110, 174, 70, 46, 0x45db9b, isAuto ? 0.16 : 0)
      .setInteractive({ useHandCursor: true }), 209);
    this.sideAutoBtnIcon = this.fixed(this.add.image(W - 110, 163, 'xianxia_auto').setDisplaySize(26, 26), 210);
    this.sideAutoBtnLabel = this.fixed(this.add.text(W - 110, 186, 'AUTO', {
      fontSize: '11px', fontStyle: 'bold', color: isAuto ? '#7affb7' : '#fff1d1'
    }).setOrigin(0.5), 210);

    let autoPressTimer = null;
    let isAutoLongPress = false;
    this.sideAutoBtnBg.on('pointerdown', (_pointer, _localX, _localY, event) => {
      event?.stopPropagation();
      isAutoLongPress = false;
      autoPressTimer = this.time.delayedCall(380, () => {
        isAutoLongPress = true;
        this.openAfkPanel();
      });
    });
    this.sideAutoBtnBg.on('pointerup', () => {
      if (autoPressTimer) autoPressTimer.remove(false);
      if (!isAutoLongPress) {
        this.toggleAutoFight();
      }
    });
    this.sideAutoBtnBg.on('pointerout', () => {
      if (autoPressTimer) autoPressTimer.remove(false);
    });

    // Thu gọn hoặc mở lại hai khay dưới, vẫn giữ các nút chức năng phía trên.
    const menuFrame = this.addHudSkinRegion([{ x: 495, y: 775, w: 45, h: 63 }], 9010);
    const menuToggle = this.fixed(this.add.rectangle(W - 23, 809, 38, 42, 0x092832, 0)
      .setInteractive({ useHandCursor: true }), 209);
    const menuToggleIcon = this.fixed(this.add.text(W - 23, 809, this.menuVisible === false ? '⌄' : '⌃', {
      fontSize: '32px', fontStyle: 'bold', color: '#ffe5a4'
    }).setOrigin(0.5), 210);

    menuToggle.on('pointerdown', (_pointer, _localX, _localY, event) => {
      event?.stopPropagation();
      this.menuVisible = !this.menuVisible;
      this.skillsVisible = this.menuVisible;
      if (this.menuContainer) this.menuContainer.setVisible(this.menuVisible);
      if (this.skillContainer) this.skillContainer.setVisible(this.menuVisible);
      menuToggleIcon.setText(this.menuVisible ? '⌃' : '⌄');
    });

    this.sideToggleContainer.add([
      controlsSkin,
      restToggle, restToggleIcon, restToggleTxt,
      this.sideAutoBtnBg, this.sideAutoBtnIcon, this.sideAutoBtnLabel,
      menuFrame, menuToggle, menuToggleIcon
    ]);
    this.restToggleElements = [controlsSkin, restToggle, restToggleIcon, restToggleTxt];
    this.autoToggleElements = [this.sideAutoBtnBg, this.sideAutoBtnIcon, this.sideAutoBtnLabel];
    if (this.topHudVisible === false) {
      this.restToggleElements.forEach(el => el.setVisible(false));
      this.autoToggleElements.forEach(el => el.setVisible(false));
    }
    this.updateAutoBtnVisual();
  },

  // ---- AFK Banner ----
  createAfkBanner() {
    this.updateAfkBanner();
  },

  updateAfkBanner() {
    if (!this.afkBannerText) return;
    const s = gameState.afkStats || {};
    const mode = gameState.autoMode || 'farm';
    let modeLabel = '☯ TỰ ĐỘNG';
    if (mode === 'march') modeLabel = '⚔ HÀNH QUÂN';
    else if (mode === 'rush') modeLabel = '⚡ VƯỢT MAP';
    const modeText = gameState.autoFight ? modeLabel : '⚔ THỦ CÔNG';

    let pillStr = '';
    if (gameState.activePillBuff) {
      pillStr = `  ·  💊 +${gameState.activePillBuff.speed}/s (${gameState.activePillBuff.durationLeft}s)`;
    }

    this.afkBannerText.setText(`${modeText}${pillStr}  ·  ${s.kills || 0} quái  ·  +${s.exp || 0} Tu Vi  ·  +${s.gold || 0} LT`);
  },

  openAfkPanel() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 590, 0x0a1220, 0.98).setStrokeStyle(2, 0x2a5078);
    const title = this.add.text(0, -265, '⚙️ THIẾT LẬP AUTO CHIẾN ĐẤU & TU LUYỆN', { fontSize: '13.5px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add([bg, title]);
    this.createModalCloseBtn(panel, 215, -265);

    // ---- 1. Chọn Chế Độ Auto (Chọn 1 trong 3) ----
    const modeHeader = this.add.text(-220, -238, '◈ CHẾ ĐỘ DI CHUYỂN & CHIẾN ĐẤU (CHỌN 1):', { fontSize: '10.5px', fontStyle: 'bold', color: '#88ccff' });
    panel.add(modeHeader);

    const modes = [
      {
        key: 'farm',
        title: '☯ Quét Map Tự Do (Farm Quái Mặc Định)',
        desc: 'Tự tìm & áp sát quái gần nhất, tung chiêu diệt quái nhặt đồ.',
        y: -198
      },
      {
        key: 'march',
        title: '⚔️ Vừa Đánh Vừa Tiến Lên (Hành Quân)',
        desc: 'Liên tục tiến về trước, tung chiêu & trảm sạch quái cản đường.',
        y: -144
      },
      {
        key: 'rush',
        title: '⚡ Chạy Thẳng Về Phía Trước (Vượt Map)',
        desc: 'Ngự kiếm phi hành lướt nhanh về phía trước, không đánh quái.',
        y: -90
      }
    ];

    const currentMode = gameState.autoMode || 'farm';
    const modeRows = [];

    modes.forEach(m => {
      const isCurrent = currentMode === m.key;
      const box = this.add.rectangle(0, m.y, 440, 48, isCurrent ? 0x142c44 : 0x0c1524, 0.95)
        .setStrokeStyle(1.8, isCurrent ? 0x00f0ff : 0x253c5a);
      
      const radioBg = this.add.circle(-196, m.y, 8, isCurrent ? 0x00d8ff : 0x182436).setStrokeStyle(1.5, isCurrent ? 0xffffff : 0x486482);
      const radioDot = this.add.circle(-196, m.y, 4, 0xffffff).setVisible(isCurrent);

      const titleTxt = this.add.text(-180, m.y - 11, m.title, { fontSize: '11px', fontStyle: 'bold', color: isCurrent ? '#38f4ff' : '#d8e8f8' });
      const descTxt = this.add.text(-180, m.y + 7, m.desc, { fontSize: '9px', color: isCurrent ? '#a4dcff' : '#7e93aa' });
      const statusTxt = this.add.text(194, m.y, isCurrent ? '✔ ĐANG CHỌN' : 'CHỌN', { fontSize: '9.5px', fontStyle: 'bold', color: isCurrent ? '#33ffaa' : '#557396' }).setOrigin(0.5);

      // Full-row transparent hitzone to capture every click/touch
      const hitZone = this.add.rectangle(0, m.y, 440, 48, 0x000000, 0.001).setInteractive({ useHandCursor: true });

      panel.add([box, radioBg, radioDot, titleTxt, descTxt, statusTxt, hitZone]);

      const rowObj = { key: m.key, title: m.title, box, radioBg, radioDot, titleTxt, descTxt, statusTxt, hitZone };
      modeRows.push(rowObj);

      hitZone.on('pointerover', () => {
        if (gameState.autoMode !== m.key) box.setFillStyle(0x102030, 0.95);
      });
      hitZone.on('pointerout', () => {
        if (gameState.autoMode !== m.key) box.setFillStyle(0x0c1524, 0.95);
      });
      hitZone.on('pointerdown', () => {
        gameState.autoMode = m.key;
        this.updateAutoBtnVisual();
        this.updateAfkBanner();

        modeRows.forEach(r => {
          const isCur = (r.key === m.key);
          r.box.setFillStyle(isCur ? 0x142c44 : 0x0c1524, 0.95);
          r.box.setStrokeStyle(1.8, isCur ? 0x00f0ff : 0x253c5a);
          r.radioBg.setFillStyle(isCur ? 0x00d8ff : 0x182436);
          r.radioBg.setStrokeStyle(1.5, isCur ? 0xffffff : 0x486482);
          r.radioDot.setVisible(isCur);
          r.titleTxt.setColor(isCur ? '#38f4ff' : '#d8e8f8');
          r.descTxt.setColor(isCur ? '#a4dcff' : '#7e93aa');
          r.statusTxt.setText(isCur ? '✔ ĐANG CHỌN' : 'CHỌN');
          r.statusTxt.setColor(isCur ? '#33ffaa' : '#557396');
        });

        this.showFloatingText(this.player.x, this.player.y - 70, `Đã chuyển sang: ${m.title}`, '#00f0ff');
      });
    });

    // ---- 2. Tùy Chọn Bổ Trợ (Checkboxes) ----
    const optHeader = this.add.text(-220, -50, '◈ TÙY CHỌN BỔ TRỢ TỰ ĐỘNG:', { fontSize: '10.5px', fontStyle: 'bold', color: '#88ccff' });
    panel.add(optHeader);

    if (!gameState.afkSettings) {
      gameState.afkSettings = { autoSkill: true, autoFly: true, autoBreakthrough: true, autoSurvivalDash: true };
    }

    const toggles = [
      { key: 'autoSkill', label: 'Tự Động Tung Kỹ Năng & Pháp Bảo', y: -22 },
      { key: 'autoFly', label: 'Tự Động Ngự Kiếm Phi Hành Khi Di Chuyển Xa', y: 22 },
      { key: 'autoSurvivalDash', label: 'Tự Thân Pháp Né Đòn (Lướt né khi HP < 35%)', y: 66 },
      { key: 'autoBreakthrough', label: 'Tự Động Đột Phá Cảnh Giới (Dùng Đan Dược)', y: 110 },
    ];

    toggles.forEach(({ key, label, y }) => {
      const isOn = gameState.afkSettings[key] ?? true;
      const box = this.add.rectangle(0, y, 440, 38, isOn ? 0x0f2233 : 0x0a121c, 0.9).setStrokeStyle(1.4, isOn ? 0x33cc88 : 0x2e4868);
      
      const checkBg = this.add.rectangle(-196, y, 16, 16, isOn ? 0x22c55e : 0x142030).setStrokeStyle(1.4, isOn ? 0xffffff : 0x486482);
      const checkMark = this.add.text(-196, y, '✓', { fontSize: '11px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setVisible(isOn);

      const labelTxt = this.add.text(-178, y, label, { fontSize: '10.5px', color: '#d4e6ff' }).setOrigin(0, 0.5);
      const statusTxt = this.add.text(194, y, isOn ? 'BẬT' : 'TẮT', { fontSize: '11px', fontStyle: 'bold', color: isOn ? '#33ff88' : '#ff6655' }).setOrigin(0.5);

      // Full-row transparent hitzone
      const hitZone = this.add.rectangle(0, y, 440, 38, 0x000000, 0.001).setInteractive({ useHandCursor: true });

      panel.add([box, checkBg, checkMark, labelTxt, statusTxt, hitZone]);

      hitZone.on('pointerdown', () => {
        gameState.afkSettings[key] = !gameState.afkSettings[key];
        const updated = !!gameState.afkSettings[key];

        box.setStrokeStyle(1.4, updated ? 0x33cc88 : 0x2e4868);
        box.setFillStyle(updated ? 0x0f2233 : 0x0a121c, 0.9);
        checkBg.setFillStyle(updated ? 0x22c55e : 0x142030);
        checkBg.setStrokeStyle(1.4, updated ? 0xffffff : 0x486482);
        checkMark.setVisible(updated);
        statusTxt.setText(updated ? 'BẬT' : 'TẮT');
        statusTxt.setColor(updated ? '#33ff88' : '#ff6655');

        this.showFloatingText(this.player.x, this.player.y - 70, `${label}: ${updated ? 'BẬT' : 'TẮT'}`, updated ? '#33ff88' : '#ff6655');
      });
    });

    // ---- 3. Thống Kê & Bật/Tắt Auto Nhanh ----
    const statsBox = this.add.rectangle(0, 168, 440, 50, 0x091422, 0.95).setStrokeStyle(1.2, 0x224466);
    const s = gameState.afkStats || {};
    const statsTxt = this.add.text(0, 168,
      `Quái Diệt: ${s.kills || 0}  •  Tu Vi: +${s.exp || 0}  •  Linh Thạch: +${s.gold || 0}  •  Khoáng: +${s.ores || 0}`,
      { fontSize: '10.5px', color: '#88ccff', align: 'center' }
    ).setOrigin(0.5);
    panel.add([statsBox, statsTxt]);

    // Nút Bật / Tắt Auto Lớn
    let isAutoOn = !!gameState.autoFight;
    const toggleBtn = this.add.rectangle(0, 230, 440, 44, isAutoOn ? 0x145a32 : 0x3e2723, 0.95)
      .setStrokeStyle(1.8, isAutoOn ? 0x2ecc71 : 0xe74c3c);
    
    const toggleTxt = this.add.text(0, 230,
      isAutoOn ? '✔ TRẠNG THÁI: ĐANG BẬT AUTO (NHẤN ĐỂ TẮT)' : '✖ TRẠNG THÁI: ĐANG TẮT AUTO (NHẤN ĐỂ BẬT)',
      { fontSize: '11.5px', fontStyle: 'bold', color: isAutoOn ? '#a9dfbf' : '#f5b7b1' }
    ).setOrigin(0.5);

    const toggleHitZone = this.add.rectangle(0, 230, 440, 44, 0x000000, 0.001).setInteractive({ useHandCursor: true });

    toggleHitZone.on('pointerdown', () => {
      gameState.autoFight = !gameState.autoFight;
      isAutoOn = !!gameState.autoFight;
      this.updateAutoBtnVisual();
      this.updateAfkBanner();

      toggleBtn.setFillStyle(isAutoOn ? 0x145a32 : 0x3e2723, 0.95);
      toggleBtn.setStrokeStyle(1.8, isAutoOn ? 0x2ecc71 : 0xe74c3c);
      toggleTxt.setText(isAutoOn ? '✔ TRẠNG THÁI: ĐANG BẬT AUTO (NHẤN ĐỂ TẮT)' : '✖ TRẠNG THÁI: ĐANG TẮT AUTO (NHẤN ĐỂ BẬT)');
      toggleTxt.setColor(isAutoOn ? '#a9dfbf' : '#f5b7b1');

      const mode = gameState.autoMode || 'farm';
      let modeText = 'TỰ ĐỘNG TU LUYỆN';
      if (mode === 'march') modeText = 'HÀNH QUÂN (VỪA ĐI VỪA ĐÁNH)';
      else if (mode === 'rush') modeText = 'VƯỢT MAP (CHẠY THẲNG)';
      this.showFloatingText(this.player.x, this.player.y - 70, isAutoOn ? `☯ BẬT ${modeText}` : '⚔ ĐIỀU KHIỂN THỦ CÔNG', isAutoOn ? '#66ffaa' : '#ff7777');
    });

    panel.add([toggleBtn, toggleTxt, toggleHitZone]);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  updateAutoBtnVisual() {
    const isAuto = !!gameState.autoFight;
    const mode = gameState.autoMode || 'farm';

    // Update Side AUTO Button
    if (this.sideAutoBtnBg) {
      this.sideAutoBtnBg.setFillStyle(0x45db9b, isAuto ? 0.16 : 0);
    }
    if (this.sideAutoBtnIcon) {
      if (isAuto) {
        if (mode === 'rush') this.sideAutoBtnIcon.setTint(0xffaa44);
        else if (mode === 'march') this.sideAutoBtnIcon.setTint(0x44ddff);
        else this.sideAutoBtnIcon.setTint(0x44ffcc);
      } else {
        this.sideAutoBtnIcon.clearTint();
      }
    }
    if (this.sideAutoBtnLabel) {
      this.sideAutoBtnLabel.setText('AUTO');
      this.sideAutoBtnLabel.setColor(isAuto ? '#7affb7' : '#fff1d1');
    }

    // Update bottom skill bar auto button if exists
    if (this.autoBtnIcon) {
      let labelText = 'TỰ ĐỘNG';
      if (mode === 'march') labelText = 'HÀNH QUÂN';
      else if (mode === 'rush') labelText = 'VƯỢT MAP';
      if (this.autoBtnLabel) this.autoBtnLabel.setText(labelText);

      if (isAuto) {
        if (mode === 'rush') {
          this.autoBtnIcon.setTint(0xffaa44);
          if (this.autoBtnLabel) this.autoBtnLabel.setColor('#ffaa44');
        } else if (mode === 'march') {
          this.autoBtnIcon.setTint(0x44ddff);
          if (this.autoBtnLabel) this.autoBtnLabel.setColor('#44ddff');
        } else {
          this.autoBtnIcon.setTint(0x44ffcc);
          if (this.autoBtnLabel) this.autoBtnLabel.setColor('#44ffcc');
        }
      } else {
        this.autoBtnIcon.clearTint();
        if (this.autoBtnLabel) this.autoBtnLabel.setColor('#ffffff');
      }
    }
  },

  toggleAutoFight() {
    gameState.autoFight = !gameState.autoFight;
    this.updateAutoBtnVisual();
    this.updateAfkBanner();
    const mode = gameState.autoMode || 'farm';
    let modeText = 'TỰ ĐỘNG TU LUYỆN';
    if (mode === 'march') modeText = 'HÀNH QUÂN (VỪA ĐI VỪA ĐÁNH)';
    else if (mode === 'rush') modeText = 'VƯỢT MAP (CHẠY THẲNG)';
    this.showFloatingText(this.player.x, this.player.y - 70, gameState.autoFight ? `☯ BẬT ${modeText}` : '⚔ ĐIỀU KHIỂN THỦ CÔNG', '#66ffaa');
  },

  resetJoy() {
    if (!this.joy) return;
    this.joy.active = false;
    this.joy.id = null;
    this.joy.x = 0;
    this.joy.y = 0;
    this.joyBase?.setVisible?.(false);
    this.joyKnob?.setVisible?.(false);
  },

  // ---- Dynamic Touch Joystick ----
  createDynamicTouchControls() {
    this.resetJoy();

    if (this.joyBase) this.joyBase.destroy();
    if (this.joyKnob) this.joyKnob.destroy();

    this.joyBase = this.fixed(
      this.add.circle(0, 0, 50, 0xd9fff1, 0.15)
        .setStrokeStyle(2, 0x66ffcc, 0.45)
        .setVisible(false),
      220
    );
    this.joyKnob = this.fixed(
      this.add.circle(0, 0, 22, 0xd9fff1, 0.4)
        .setStrokeStyle(2, 0xffffff, 0.75)
        .setVisible(false),
      221
    );

    const old = this._touchInputHandlers;
    if (old && this.input) {
      this.input.off('pointerdown', old.pointerDown);
      this.input.off('pointermove', old.pointerMove);
      this.input.off('pointerup', old.release);
      this.input.off('pointerupoutside', old.release);
      if (old.blur) window.removeEventListener('blur', old.blur);
      if (old.visibility) document.removeEventListener('visibilitychange', old.visibility);
    }

    const isReservedUiZone = (pointer) => {
      if (!pointer) return true;
      return pointer.y < 155 || pointer.y > H - 150 || pointer.x > W - 58;
    };

    const release = (pointer) => {
      if (!pointer || this.joy.id === pointer.id || !this.joy.active) this.resetJoy();
    };

    const pointerDown = (pointer, currentlyOver = []) => {
      if (!pointer) return;

      // Modal đang mở: tuyệt đối không tạo joystick.
      if (this.isModalOpen?.()) {
        this.resetJoy();
        return;
      }

      // UI/portal/NPC interactive đang nằm dưới ngón tay: để GameObject đó xử lý.
      if (Array.isArray(currentlyOver) && currentlyOver.length > 0) {
        this.resetJoy();
        return;
      }

      // Dành riêng toàn bộ vùng HUD/skill/menu/sidebar cho UI.
      if (isReservedUiZone(pointer)) {
        this.resetJoy();
        return;
      }

      // Ngón tay thứ hai không được cướp joystick của ngón đang điều khiển.
      if (this.joy.active && this.joy.id !== pointer.id) return;

      this.joy.active = true;
      this.joy.id = pointer.id;
      this.joy.startX = pointer.x;
      this.joy.startY = pointer.y;
      this.joy.x = 0;
      this.joy.y = 0;
      this.joyBase.setPosition(pointer.x, pointer.y).setVisible(true);
      this.joyKnob.setPosition(pointer.x, pointer.y).setVisible(true);
    };

    const pointerMove = (pointer) => {
      if (!pointer || !this.joy.active || this.joy.id !== pointer.id) return;
      if (pointer.isDown === false) {
        this.resetJoy();
        return;
      }

      let dx = pointer.x - this.joy.startX;
      let dy = pointer.y - this.joy.startY;
      const len = Math.hypot(dx, dy) || 1;
      const max = 45;
      if (len > max) {
        dx = (dx / len) * max;
        dy = (dy / len) * max;
      }
      this.joyKnob.setPosition(this.joy.startX + dx, this.joy.startY + dy);
      this.joy.x = dx / max;
      this.joy.y = dy / max;
    };

    const blur = () => this.resetJoy();
    const visibility = () => {
      if (document.hidden) this.resetJoy();
    };

    this._touchInputHandlers = { pointerDown, pointerMove, release, blur, visibility };
    this.input.on('pointerdown', pointerDown);
    this.input.on('pointermove', pointerMove);
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);
  },

  // ---- Minimap (Local Radar View) & Save Game Button ----
  createMinimap() {
    this.minimapElements = [];
    const fixed = (obj, depth) => {
      const item = this.fixed(obj, 9000 + depth - 200);
      this.minimapElements.push(item);
      return item;
    };

    this.minimapElements.push(this.addHudSkinRegion([{ x: 405, y: 0, w: W - 405, h: 145 }], 9014));

    this.miniBg = fixed(this.add.circle(W - 65, 61, 55, 0x071b25, 0)
      .setInteractive({ useHandCursor: true }), 215);
    this.mini = this.fixed(this.add.graphics(), 9016);
    const miniMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
    miniMaskShape.fillStyle(0xffffff).fillCircle(W - 65, 61, 42);
    miniMaskShape.setScrollFactor(0);
    this.mini.setMask(miniMaskShape.createGeometryMask());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => miniMaskShape.destroy());
    this.miniMapHitArea = fixed(this.add.circle(W - 65, 61, 55, 0x071b25, 0)
      .setInteractive({ useHandCursor: true }), 217);
    this.miniMapHitArea.on('pointerdown', (pointer, _localX, _localY, event) => {
      event?.stopPropagation();
      this.openMapPanel();
    });
    this.miniMapLabel = fixed(this.add.text(W - 65, 61, 'BẢN ĐỒ', {
      fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#ffdf8c'
    }).setOrigin(0.5).setVisible(false), 218);

    // Save Game Button (Below Minimap)
    this.saveBtnBg = fixed(this.add.rectangle(W - 70, 130, 132, 26, 0x092832, 0)
      .setInteractive({ useHandCursor: true }), 215);
    this.saveBtnTxt = fixed(this.add.text(W - 70, 130, '▣ LƯU TIẾN TRÌNH', {
      fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#ffdf8c'
    }).setOrigin(0.5), 216);

    this.saveBtnBg.on('pointerdown', (_pointer, _localX, _localY, event) => {
      event?.stopPropagation();
      this.openSaveGameModal();
    });
    this.saveBtnBg.on('pointerover', () => this.saveBtnTxt.setColor('#ffffff'));
    this.saveBtnBg.on('pointerout', () => this.saveBtnTxt.setColor('#ffdf8c'));
  },

  updateMinimap() {
    if (!this.mini || !this.player || this.topHudVisible === false) return;
    this.mini.clear();
    const bx = W - 117, by = 10, bw = 104, bh = 102;
    const cx = bx + bw / 2;
    const cy = by + bh / 2;

    // Nền Radar khu vực lân cận
    this.mini.fillStyle(0x061824, 0.92);
    this.mini.fillCircle(cx, cy, 42);

    // Đường kẻ định vị tâm và vòng cự ly radar
    this.mini.lineStyle(1, 0x1a3854, 0.6);
    this.mini.strokeCircle(cx, cy, 22);
    this.mini.strokeLineShape(new Phaser.Geom.Line(bx + 4, cy, bx + bw - 4, cy));
    this.mini.strokeLineShape(new Phaser.Geom.Line(cx, by + 4, cx, by + bh - 4));

    // Phạm vi quét radar cục bộ xung quanh nhân vật (1200px ngang, 500px dọc)
    const RADAR_X = 1200;
    const RADAR_Y = 500;
    const halfW = (bw / 2) - 4;
    const halfH = (bh / 2) - 4;

    // 1. Hiển thị quái vật trong khu vực lân cận của player (Màu đỏ / Cam)
    if (this.enemies && Array.isArray(this.enemies)) {
      this.enemies.forEach(e => {
        if (!e || !e.active || e.isDead) return;
        const dx = e.x - this.player.x;
        const dy = e.y - this.player.y;

        if (Math.abs(dx) <= RADAR_X && Math.abs(dy) <= RADAR_Y) {
          const ex = cx + (dx / RADAR_X) * halfW;
          const ey = cy + (dy / RADAR_Y) * halfH;

          if (ex >= bx + 2 && ex <= bx + bw - 2 && ey >= by + 2 && ey <= by + bh - 2) {
            if (e.isBoss) {
              this.mini.fillStyle(0xffaa00, 1);
              this.mini.fillCircle(ex, ey, 3.5);
              this.mini.lineStyle(1, 0xffe066, 0.8);
              this.mini.strokeCircle(ex, ey, 5.5);
            } else {
              this.mini.fillStyle(0xef4444, 0.9);
              this.mini.fillCircle(ex, ey, 2.2);
            }
          }
        }
      });
    }

    // 2. Hiển thị Linh Thảo trên Minimap (Màu xanh lục ngọc)
    if (this.herbsGroup && Array.isArray(this.herbsGroup)) {
      this.herbsGroup.forEach(h => {
        if (!h || h.harvested) return;
        const hx = (h.container && h.container.x != null) ? h.container.x : h.x;
        const hy = (h.container && h.container.y != null) ? h.container.y : h.y;
        if (hx == null || hy == null) return;

        const dx = hx - this.player.x;
        const dy = hy - this.player.y;

        if (Math.abs(dx) <= RADAR_X && Math.abs(dy) <= RADAR_Y) {
          const ex = cx + (dx / RADAR_X) * halfW;
          const ey = cy + (dy / RADAR_Y) * halfH;

          if (ex >= bx + 2 && ex <= bx + bw - 2 && ey >= by + 2 && ey <= by + bh - 2) {
            this.mini.fillStyle(0x34d399, 0.95);
            this.mini.fillCircle(ex, ey, 2.0);
          }
        }
      });
    }

    // 3. Hiển thị TẤT CẢ NPC TRÊN MINIMAP (MÀU VÀNG HOÀNG KIM)
    // - NPC Thôn Làng / Map (npcsGroup)
    if (this.npcsGroup && Array.isArray(this.npcsGroup)) {
      this.npcsGroup.forEach(npc => {
        if (!npc) return;
        const nx = (npc.container && npc.container.x != null) ? npc.container.x : (npc.data ? npc.data.x : 0);
        const ny = (npc.container && npc.container.y != null) ? npc.container.y : (npc.data ? npc.data.y : 0);
        const dx = nx - this.player.x;
        const dy = ny - this.player.y;

        if (Math.abs(dx) <= RADAR_X && Math.abs(dy) <= RADAR_Y) {
          const ex = cx + (dx / RADAR_X) * halfW;
          const ey = cy + (dy / RADAR_Y) * halfH;

          if (ex >= bx + 2 && ex <= bx + bw - 2 && ey >= by + 2 && ey <= by + bh - 2) {
            // Chấm màu vàng sáng có viền vàng rực
            this.mini.fillStyle(0xfacc15, 1);
            this.mini.fillCircle(ex, ey, 2.8);
            this.mini.lineStyle(1, 0xfff08a, 0.7);
            this.mini.strokeCircle(ex, ey, 4.2);
          }
        }
      });
    }

    // - NPC Tán Tu Dã Ngoại (fellowNpcs)
    if (this.fellowNpcs && Array.isArray(this.fellowNpcs)) {
      this.fellowNpcs.forEach(f => {
        if (!f || f.isDead) return;
        const nx = (f.sprite && f.sprite.x != null) ? f.sprite.x : f.homeX;
        const ny = (f.sprite && f.sprite.y != null) ? f.sprite.y : f.homeY;
        if (nx == null || ny == null) return;

        const dx = nx - this.player.x;
        const dy = ny - this.player.y;

        if (Math.abs(dx) <= RADAR_X && Math.abs(dy) <= RADAR_Y) {
          const ex = cx + (dx / RADAR_X) * halfW;
          const ey = cy + (dy / RADAR_Y) * halfH;

          if (ex >= bx + 2 && ex <= bx + bw - 2 && ey >= by + 2 && ey <= by + bh - 2) {
            this.mini.fillStyle(0xfacc15, 1);
            this.mini.fillCircle(ex, ey, 2.6);
            this.mini.lineStyle(0.8, 0xfff08a, 0.6);
            this.mini.strokeCircle(ex, ey, 3.8);
          }
        }
      });
    }

    // - Hiệp Khách Đồng Đội Tổ Đội (partyFollowers)
    if (this.partyFollowers && Array.isArray(this.partyFollowers)) {
      this.partyFollowers.forEach(p => {
        if (!p || p.isDead || !p.sprite) return;
        const dx = p.sprite.x - this.player.x;
        const dy = p.sprite.y - this.player.y;

        if (Math.abs(dx) <= RADAR_X && Math.abs(dy) <= RADAR_Y) {
          const ex = cx + (dx / RADAR_X) * halfW;
          const ey = cy + (dy / RADAR_Y) * halfH;

          if (ex >= bx + 2 && ex <= bx + bw - 2 && ey >= by + 2 && ey <= by + bh - 2) {
            this.mini.fillStyle(0xfef08a, 1);
            this.mini.fillCircle(ex, ey, 2.8);
            this.mini.lineStyle(1, 0x38bdf8, 0.8);
            this.mini.strokeCircle(ex, ey, 4.0);
          }
        }
      });
    }

    // 4. Nhân vật ở chính giữa Radar (Điểm Hoàng Kim + Hướng nhìn)
    this.mini.fillStyle(0x38bdf8, 1);
    this.mini.fillCircle(cx, cy, 3.2);

    const facingDir = this.player.flipX ? -1 : 1;
    this.mini.lineStyle(1.5, 0x66ffcc, 0.9);
    this.mini.strokeLineShape(new Phaser.Geom.Line(cx, cy, cx + facingDir * 6, cy));
  },
};
