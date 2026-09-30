import os

# -------------------------------------------------------------
# 1. SCENE: MainScene.js (Tích hợp hoàn hảo: Map Panorama, Player Spritesheets, Attack Animations, Monster Animations, Joystick, Minimap & Hệ thống Tu Tiên)
# -------------------------------------------------------------
mainSceneCode = r"""import { REALMS } from '../config/realmsData.js';
import { MONSTER_RANKS } from '../config/monstersData.js';
import { WORLD_REGIONS, ALL_STAGES } from '../config/regionsData.js';
import { ELEMENTAL_SKILLS } from '../config/skillsData.js';
import { CRAFTING_SYSTEM } from '../config/craftingData.js';
import { INITIAL_ITEMS } from '../config/itemsData.js';
import { SECTS, SECT_RANKS } from '../config/sectsData.js';
import { gameState } from '../state/gameState.js';

export const W = 960;
export const H = 540;
export const WORLD_W = 2880;
export const FIELD = { left: 40, right: 2840, top: 290, bottom: 480 };

export class MainGameScene extends Phaser.Scene {
  constructor() {
    super('MainGameScene');
    this.stageIndex = 0;
    this.enemies = [];
    this.activeSkillCds = {};
    this.moveTarget = null;
    this.lastBasic = 0;
    this.joy = { x: 0, y: 0, active: false, id: null };
  }

  preload() {
    const A = './assets/';

    // 1. Environment Background (Panorama)
    this.load.image('valley_panorama', A + 'environment/valley_panorama.png');

    // 2. Player Spritesheets & Flying Sword
    this.load.image('flying_sword', A + 'player/flying_sword.png');
    this.load.spritesheet('player_idle', A + 'player/player_idle.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_run', A + 'player/player_run.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_attack', A + 'player/player_attack.png', { frameWidth: 128, frameHeight: 128 });

    // 3. Enemies Spritesheets (1..8 & Boss)
    for (let i = 1; i <= 8; i++) {
      this.load.spritesheet('enemy_' + i, A + 'enemies/enemy_' + i + '.png', { frameWidth: 128, frameHeight: 128 });
    }

    // 4. Icons Skills (10 skills)
    for (let i = 0; i < 10; i++) {
      this.load.image(`skill_${i}`, A + `icons/skills/skill_${i}.png`);
    }

    // 5. Icons Items (18 items)
    for (let i = 0; i < 18; i++) {
      this.load.image(`item_${i}`, A + `icons/items/item_${i}.png`);
    }

    // 6. Icons Stages (12 stages)
    for (let i = 0; i < 12; i++) {
      this.load.image(`stage_${i}`, A + `icons/stages/stage_${i}.png`);
    }

    // 7. UI Icons
    const uiIcons = ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest'];
    uiIcons.forEach(icon => {
      this.load.image(`ui_${icon}`, A + `icons/ui/${icon}.png`);
    });

    // 8. VFX Atlas
    this.load.spritesheet('vfx', A + 'vfx/vfx_atlas.png', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_W, H);
    this.createAnimations();
    this.createWorld();
    this.createPlayer();

    this.enemyGroup = this.physics.add.group({ runChildUpdate: false });
    this.playerProjectiles = this.physics.add.group({ maxSize: 24 });
    this.createVfxPool();

    this.createTopHUD();
    this.createBottomNav();
    this.createSkillBar();
    this.createTouchControls();
    this.createMinimap();

    this.modalLayer = this.add.container(0, 0).setDepth(200);

    // Bắt đầu phụ bản hiện tại
    this.startStage(gameState.currentStageId || 0);

    // Keyboard controls
    this.keys = this.input.keyboard.addKeys('A,D,W,S,LEFT,RIGHT,UP,DOWN,SPACE,J,K,L,ONE,TWO,THREE,FOUR');

    // Tap to move
    this.input.on('pointerdown', p => {
      if (this.modalLayer.length > 0) return;
      if (p.y >= FIELD.top && p.y <= FIELD.bottom + 40 && p.x > 180 && p.x < W - 60) {
        this.moveTarget = {
          x: Phaser.Math.Clamp(p.x + this.cameras.main.scrollX, FIELD.left, FIELD.right),
          y: Phaser.Math.Clamp(p.y, FIELD.top, FIELD.bottom)
        };
      }
    });

    // Game loop 1s ticks
    this.time.addEvent({
      delay: 1000,
      callback: this.onSecondTick,
      callbackScope: this,
      loop: true
    });

    // Minimap update loop
    this.time.addEvent({
      delay: 200,
      callback: () => this.updateMinimap(),
      loop: true
    });
  }

  createAnimations() {
    const make = (key, tex, start, end, rate, repeat = -1) => {
      if (!this.anims.exists(key)) {
        this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start, end }), frameRate: rate, repeat });
      }
    };

    // Player Animations
    make('p_idle', 'player_idle', 0, 7, 8);
    make('p_run', 'player_run', 0, 7, 12);
    make('p_attack', 'player_attack', 0, 7, 15, 0);

    // Monster Animations (1..8)
    for (let i = 1; i <= 8; i++) {
      const t = 'enemy_' + i;
      make('e_' + t + '_idle', t, 0, 1, 4);
      make('e_' + t + '_run', t, 2, 5, 8);
      make('e_' + t + '_attack', t, 6, 9, 10, 0);
    }
  }

  createWorld() {
    this.add.rectangle(WORLD_W / 2, H / 2, WORLD_W, H, 0x061118).setDepth(-10);
    this.bg = this.add.tileSprite(WORLD_W / 2, H / 2, WORLD_W, H, 'valley_panorama')
      .setDepth(-8);

    this.decorGroup = this.add.group();
    for (let x = 60; x < WORLD_W; x += 160) {
      const y = Phaser.Math.Between(FIELD.top + 10, FIELD.bottom - 10);
      const s = this.perspective(y);
      const shadow = this.add.ellipse(x, y + 10, 50 * s, 16 * s, 0x08151c, 0.4).setDepth(2);
      this.decorGroup.add(shadow);
    }
  }

  createPlayer() {
    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerHp = this.playerHpMax;
    this.playerDmg = this.calcPlayerDmg();

    this.player = this.physics.add.sprite(300, 420, 'player_idle', 0)
      .setScale(0.72)
      .setDepth(20);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(44, 70).setOffset(42, 40);
    this.player.play('p_idle');

    this.sword = this.add.image(this.player.x, this.player.y + 15, 'flying_sword')
      .setScale(0.38)
      .setDepth(19)
      .setVisible(false);

    this.guardAura = this.add.ellipse(this.player.x, this.player.y, 78, 92, 0x67e8f9, 0.18)
      .setStrokeStyle(2, 0x38bdf8, 0.7)
      .setDepth(21)
      .setVisible(false);

    // Camera follow player smoothly
    this.cameras.main.setBounds(0, 0, WORLD_W, H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, 0, 10);
    this.cameras.main.setDeadzone(40, 30);
  }

  perspective(y) {
    return 0.55 + 0.85 * Phaser.Math.Clamp((y - FIELD.top) / (FIELD.bottom - FIELD.top), 0, 1);
  }

  fixed(o, d = 100) {
    return o.setScrollFactor(0).setDepth(d);
  }

  createVfxPool() {
    this.vfxPool = this.add.group({ defaultKey: 'vfx', maxSize: 48 });
    for (let i = 0; i < 24; i++) {
      const s = this.add.image(-200, -200, 'vfx', 0).setVisible(false).setActive(false).setDepth(35);
      this.vfxPool.add(s);
    }
  }

  spawnVfx(x, y, frame = 0, scale = 1, opts = {}) {
    const v = this.vfxPool.get(x, y, 'vfx', frame);
    if (!v) return null;

    const grow = opts.grow || 1, duration = opts.duration || 320, alpha = opts.alpha ?? 0.95;
    v.clearTint().setActive(true).setVisible(true).setPosition(x, y).setFrame(frame)
      .setScale(scale).setAlpha(alpha).setAngle(opts.angle || 0).setDepth(opts.depth || 35);

    if (opts.tint) v.setTint(opts.tint);
    this.tweens.killTweensOf(v);
    this.tweens.add({
      targets: v,
      scaleX: scale * grow,
      scaleY: scale * grow,
      alpha: 0,
      duration,
      ease: opts.ease || 'Cubic.easeOut',
      onComplete: () => {
        v.setActive(false).setVisible(false);
      }
    });
    return v;
  }

  calcPlayerMaxHp() {
    const realm = REALMS[gameState.realmIdx];
    let hp = realm.hp + gameState.gearPlus * 150;
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      if (sect && sect.hpBonus) hp = Math.floor(hp * (1 + sect.hpBonus / 100));
    }
    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusHp) hp += fObj.bonusHp;
    });
    return hp;
  }

  calcPlayerDmg() {
    const realm = REALMS[gameState.realmIdx];
    let dmg = realm.dmg + gameState.gearPlus * 25;
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      if (sect && sect.bonusDmgMul) dmg = Math.floor(dmg * sect.bonusDmgMul);
    }
    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusDmg) dmg += fObj.bonusDmg;
    });
    return dmg;
  }

  calcPlayerDef() {
    const realm = REALMS[gameState.realmIdx];
    let def = realm.def + gameState.gearPlus * 10;
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      if (sect && sect.defBonus) def = Math.floor(def * (1 + sect.defBonus / 100));
    }
    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusDef) def += fObj.bonusDef;
    });
    return def;
  }

  // TOP HUD
  createTopHUD() {
    this.topHudContainer = this.add.container(0, 0).setDepth(100);

    const topBarBg = this.fixed(this.add.rectangle(W / 2, 28, W - 24, 46, 0x090f1d, 0.92)
      .setStrokeStyle(1.5, 0x2a3e5c), 100);

    const avatar = this.fixed(this.add.image(36, 28, 'player_avatar').setDisplaySize(38, 38)
      .setInteractive({ useHandCursor: true }), 102);
    avatar.on('pointerdown', () => this.openCharacterPanel());

    this.hudRealmText = this.fixed(this.add.text(64, 16, REALMS[gameState.realmIdx].name, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffdd66'
    }), 104);

    this.hudExpBg = this.fixed(this.add.rectangle(130, 36, 130, 8, 0x1a2638).setOrigin(0.5), 104);
    this.hudExpBar = this.fixed(this.add.rectangle(65, 36, 0, 8, 0x33bbff).setOrigin(0, 0.5), 105);

    this.hudExpText = this.fixed(this.add.text(202, 32, '0%', {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      color: '#aaddee'
    }), 106);

    this.hudSectText = this.fixed(this.add.text(255, 20, gameState.sectId ? `🏛️ ${SECTS.find(s => s.id === gameState.sectId).name}` : '🏛️ Chưa Nhập Môn', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#66ffcc'
    }), 104);

    const goldIcon = this.fixed(this.add.image(410, 28, 'ui_gold').setDisplaySize(20, 20), 104);
    this.hudGoldText = this.fixed(this.add.text(425, 20, `${gameState.gold}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#ffcc00'
    }), 104);

    const herbIcon = this.fixed(this.add.image(490, 28, 'item_6').setDisplaySize(20, 20), 104);
    this.hudHerbText = this.fixed(this.add.text(505, 20, `${gameState.herbs}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#88ee88'
    }), 104);

    const oreIcon = this.fixed(this.add.image(560, 28, 'item_8').setDisplaySize(20, 20), 104);
    this.hudOreText = this.fixed(this.add.text(575, 20, `${gameState.ores}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#66ccff'
    }), 104);

    const stage = ALL_STAGES[gameState.currentStageId] || ALL_STAGES[0];
    this.hudStageText = this.fixed(this.add.text(W - 30, 20, `📍 ${stage.name}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#aaddff'
    }).setOrigin(1, 0), 104);

    this.updateHUD();
  }

  updateHUD() {
    const realm = REALMS[gameState.realmIdx];
    const nextReq = realm.expReq;
    const pct = Math.min(100, Math.floor((gameState.exp / nextReq) * 100));

    this.hudRealmText.setText(realm.name);
    this.hudExpBar.width = (pct / 100) * 130;
    this.hudExpText.setText(`${pct}%`);
    
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      this.hudSectText.setText(`🏛️ ${sect.name} (${SECT_RANKS[gameState.sectRankIdx].name})`);
    } else {
      this.hudSectText.setText('🏛️ Chưa Nhập Môn');
    }

    this.hudGoldText.setText(`${gameState.gold}`);
    this.hudHerbText.setText(`${gameState.herbs}`);
    this.hudOreText.setText(`${gameState.ores}`);
    
    const stage = ALL_STAGES[gameState.currentStageId] || ALL_STAGES[0];
    this.hudStageText.setText(`📍 ${stage.name}`);

    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerDmg = this.calcPlayerDmg();
  }

  // BOTTOM NAVIGATION
  createBottomNav() {
    const navBg = this.fixed(this.add.rectangle(W / 2, H - 32, W - 24, 52, 0x070c16, 0.95)
      .setStrokeStyle(1.5, 0x22354d), 100);

    const navItems = [
      { key: 'bag', label: 'HÀNH TRANG', icon: 'ui_bag', action: () => this.openGearPanel() },
      { key: 'realm', label: 'CẢNH GIỚI', icon: 'ui_realm', action: () => this.openCharacterPanel() },
      { key: 'sect', label: 'TÔNG MÔN', icon: 'item_16', action: () => this.openSectPanel() },
      { key: 'craft', label: 'BÁCH NGHỆ', icon: 'item_7', action: () => this.openCraftingPanel('pills') },
      { key: 'skills', label: 'CÔNG PHÁP', icon: 'ui_skills', action: () => this.openSkillPanel('Kim') },
      { key: 'auto', label: 'TỰ ĐỘNG', icon: 'ui_auto', action: () => this.toggleAutoFight() },
      { key: 'map', label: 'BẢN ĐỒ', icon: 'ui_map', action: () => this.openMapPanel() }
    ];

    const startX = 75;
    const gap = 135;

    navItems.forEach((btn, idx) => {
      const x = startX + idx * gap;
      const y = H - 32;

      const btnBox = this.fixed(this.add.rectangle(x, y, 118, 42, 0x111e30, 0.8)
        .setStrokeStyle(1, 0x2a4466)
        .setInteractive({ useHandCursor: true }), 102);

      const iconImg = this.fixed(this.add.image(x - 38, y, btn.icon).setDisplaySize(22, 22), 103);

      const labelTxt = this.fixed(this.add.text(x + 6, y, btn.label, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#d4e6ff'
      }).setOrigin(0.5), 104);

      if (btn.key === 'auto') {
        this.autoBtnBg = btnBox;
        this.autoBtnLabel = labelTxt;
        this.updateAutoBtnVisual();
      }

      btnBox.on('pointerdown', btn.action);
    });
  }

  updateAutoBtnVisual() {
    if (gameState.autoFight) {
      this.autoBtnBg.setFillStyle(0x1a4028, 0.95);
      this.autoBtnBg.setStrokeStyle(1.5, 0x33cc66);
      this.autoBtnLabel.setColor('#66ff88');
      this.autoBtnLabel.setText('ĐANG TREO');
    } else {
      this.autoBtnBg.setFillStyle(0x111e30, 0.8);
      this.autoBtnBg.setStrokeStyle(1, 0x2a4466);
      this.autoBtnLabel.setColor('#d4e6ff');
      this.autoBtnLabel.setText('THỦ CÔNG');
    }
  }

  toggleAutoFight() {
    gameState.autoFight = !gameState.autoFight;
    this.updateAutoBtnVisual();
    this.showFloatingText(this.player.x, this.player.y - 60, gameState.autoFight ? '☯ TỰ ĐỘNG TU LUYỆN' : '⚔ ĐIỀU KHIỂN TAY', '#66ffaa');
  }

  // 4 SLOTS QUICK SKILL BAR
  createSkillBar() {
    if (this.skillBarGroup) this.skillBarGroup.destroy(true);
    this.skillBarGroup = this.add.group();

    const startX = 370;
    const y = H - 80;
    const gap = 58;

    this.skillSlots = [];

    for (let i = 0; i < 4; i++) {
      const x = startX + i * gap;
      const skillId = gameState.equippedSkillIds[i];

      const slotBg = this.fixed(this.add.rectangle(x, y, 48, 48, 0x111a28, 0.9)
        .setStrokeStyle(1.5, 0x335577)
        .setInteractive({ useHandCursor: true }), 105);

      let icon = null;
      let cdOverlay = null;
      let cdText = null;

      if (skillId) {
        const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
        if (skill) {
          icon = this.fixed(this.add.image(x, y, skill.icon).setDisplaySize(40, 40), 106);
          cdOverlay = this.fixed(this.add.rectangle(x, y, 48, 48, 0x000000, 0.65).setVisible(false), 107);
          cdText = this.fixed(this.add.text(x, y, '', { fontSize: '12px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5), 108);

          slotBg.on('pointerdown', () => this.castSkill(skill.id));
          this.skillSlots.push({ skillId: skill.id, cdOverlay, cdText, slotBg });
        }
      } else {
        const lockText = this.fixed(this.add.text(x, y, '+', { fontSize: '20px', color: '#556677' }).setOrigin(0.5), 106);
        this.skillSlots.push({ skillId: null });
      }
    }
  }

  // VIRTUAL JOYSTICK & CONTROLS
  createTouchControls() {
    const zone = this.fixed(this.add.rectangle(120, H - 140, 200, 160, 0x000000, 0).setInteractive(), 50);
    const base = this.fixed(this.add.circle(120, H - 140, 52, 0xd9fff1, 0.12).setStrokeStyle(2, 0xd9fff1, 0.36), 51);
    const knob = this.fixed(this.add.circle(120, H - 140, 22, 0xd9fff1, 0.35).setStrokeStyle(2, 0xffffff, 0.55), 52);

    const upd = p => {
      let dx = p.x - base.x, dy = p.y - base.y;
      const len = Math.hypot(dx, dy) || 1, max = 40;
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      knob.setPosition(base.x + dx, base.y + dy);
      this.joy.x = dx / max;
      this.joy.y = dy / max;
    };

    zone.on('pointerdown', p => {
      this.joy.active = true;
      this.joy.id = p.id;
      upd(p);
    });

    this.input.on('pointermove', p => {
      if (this.joy.active && this.joy.id === p.id) upd(p);
    });

    const release = p => {
      if (this.joy.id === p.id) {
        this.joy.active = false;
        this.joy.id = null;
        this.joy.x = 0;
        this.joy.y = 0;
        knob.setPosition(base.x, base.y);
      }
    };

    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
  }

  // MINIMAP
  createMinimap() {
    this.miniBg = this.fixed(this.add.circle(W - 46, 75, 36, 0x081f29, 0.9).setStrokeStyle(1.8, 0xd4af37), 115);
    this.mini = this.fixed(this.add.graphics(), 116);
  }

  updateMinimap() {
    if (!this.mini || !this.player) return;
    this.mini.clear();
    const cx = W - 46, cy = 75, r = 32;
    this.mini.fillStyle(0x0a2218, 0.75);
    this.mini.fillCircle(cx, cy, r);

    const px = (this.player.x / WORLD_W) * 60 - 30;
    const py = (this.player.y - FIELD.top) / (FIELD.bottom - FIELD.top) * 50 - 25;
    this.mini.fillStyle(0xffd700, 1);
    this.mini.fillTriangle(cx + px, cy + py - 4, cx + px - 4, cy + py + 4, cx + px + 4, cy + py + 4);

    this.enemies.forEach(e => {
      if (!e.active) return;
      const ex = (e.x / WORLD_W) * 60 - 30;
      const ey = (e.y - FIELD.top) / (FIELD.bottom - FIELD.top) * 50 - 25;
      this.mini.fillStyle(e.isBoss ? 0xffa100 : 0xef4444, e.isBoss ? 1 : 0.75);
      this.mini.fillCircle(cx + ex, cy + ey, e.isBoss ? 3 : 1.8);
    });
  }

  // START STAGE & SPAWN ENEMIES
  startStage(idx) {
    this.stageIndex = idx;
    gameState.currentStageId = idx;
    this.updateHUD();

    if (this.enemyGroup) {
      this.enemyGroup.getChildren().forEach(e => {
        if (e.hpBar) e.hpBar.destroy();
        if (e.hpBg) e.hpBg.destroy();
        if (e.nameText) e.nameText.destroy();
      });
      this.enemyGroup.clear(true, true);
    }
    this.enemies = [];

    const stage = ALL_STAGES[this.stageIndex] || ALL_STAGES[0];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const isBoss = (i === count - 1);
      const mIdx = Math.min(MONSTER_RANKS.length - 1, stage.monsterIdxStart + (isBoss ? 2 : (i % 3)));
      const monsterData = MONSTER_RANKS[mIdx];

      const x = 500 + i * 180 + Phaser.Math.Between(-30, 30);
      const y = Phaser.Math.Between(FIELD.top + 20, FIELD.bottom - 20);

      const enemySpriteNum = (mIdx % 8) + 1;
      const enemy = this.enemyGroup.create(x, y, 'enemy_' + enemySpriteNum, 0)
        .setScale(isBoss ? 0.95 : 0.75 * this.perspective(y))
        .setDepth(10);

      enemy.data = monsterData;
      enemy.isBoss = isBoss;
      enemy.hp = monsterData.hp;
      enemy.maxHp = monsterData.hp;
      enemy.dmg = monsterData.dmg;
      enemy.atkTimer = 1500 + Math.random() * 1000;
      enemy.enemySpriteNum = enemySpriteNum;

      enemy.play('e_enemy_' + enemySpriteNum + '_run', true);

      // HP Bar & Name
      enemy.hpBg = this.add.rectangle(x, y - 55, 70, 5, 0x222222).setDepth(30);
      enemy.hpBar = this.add.rectangle(x - 35, y - 55, 70, 5, isBoss ? 0xff2244 : 0xee5533).setOrigin(0, 0.5).setDepth(31);
      enemy.nameText = this.add.text(x, y - 68, `${isBoss ? '👑 ' : ''}${monsterData.name}`, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isBoss ? '#ff4466' : '#ffd700',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(32);

      this.enemies.push(enemy);
    }
  }

  update(time, delta) {
    if (!this.player || !this.player.body) return;

    let vx = 0, vy = 0;
    const speed = 160;

    // Joystick & Keyboard Movement
    if (this.joy.active) {
      vx = this.joy.x * speed;
      vy = this.joy.y * speed;
    } else if (this.keys.A.isDown || this.keys.LEFT.isDown) {
      vx = -speed;
    } else if (this.keys.D.isDown || this.keys.RIGHT.isDown) {
      vx = speed;
    }

    if (this.keys.W.isDown || this.keys.UP.isDown) {
      vy = -speed;
    } else if (this.keys.S.isDown || this.keys.DOWN.isDown) {
      vy = speed;
    }

    // Tap target movement
    if (this.moveTarget) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y);
      if (dist > 10) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y);
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      } else {
        this.moveTarget = null;
      }
    }

    // Auto Battle AI Movement
    if (gameState.autoFight && this.enemies.length > 0 && !this.joy.active && !this.moveTarget) {
      const nearest = this.nearestEnemy();
      if (nearest) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, nearest.x, nearest.y);
        if (dist > 140) {
          const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearest.x, nearest.y);
          vx = Math.cos(angle) * (speed * 0.9);
          vy = Math.sin(angle) * (speed * 0.9);
        } else if (dist < 80) {
          vx = (this.player.x < nearest.x) ? -speed * 0.5 : speed * 0.5;
        }
      }
    }

    // Apply velocity
    this.player.setVelocity(vx, vy);
    this.player.y = Phaser.Math.Clamp(this.player.y, FIELD.top, FIELD.bottom);

    // Update animations & flip
    if (vx !== 0) this.player.setFlipX(vx < 0);
    const isMoving = (Math.abs(vx) > 5 || Math.abs(vy) > 5);

    if (this.player.anims.currentAnim?.key !== 'p_attack') {
      if (isMoving) this.player.play('p_run', true);
      else this.player.play('p_idle', true);
    }

    // Update enemy bars & AI movement
    this.enemies.forEach(enemy => {
      if (!enemy.active) return;
      if (enemy.hpBar) {
        enemy.hpBg.setPosition(enemy.x, enemy.y - 55);
        enemy.hpBar.setPosition(enemy.x - 35, enemy.y - 55);
        enemy.nameText.setPosition(enemy.x, enemy.y - 68);
      }

      // Enemy moves toward player if close
      const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (distToPlayer < 400 && distToPlayer > 80) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        enemy.setVelocity(Math.cos(angle) * 45, Math.sin(angle) * 45);
        enemy.setFlipX(this.player.x < enemy.x);
      } else {
        enemy.setVelocity(0, 0);
      }
    });

    // Space / J for basic attack
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.J)) {
      this.basicAttack();
    }
  }

  nearestEnemy(maxDist = 600) {
    let closest = null, minD = maxDist;
    this.enemies.forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < minD) { minD = d; closest = e; }
    });
    return closest;
  }

  basicAttack() {
    if (this.time.now < this.lastBasic + 250) return;
    this.lastBasic = this.time.now;

    this.player.play('p_attack', true);
    this.player.once('animationcomplete', () => {
      if (this.player.active) this.player.play('p_idle', true);
    });

    const target = this.nearestEnemy(220);
    if (target) {
      const critRate = 0.15 + (gameState.spiritualSense * 0.005);
      const isCrit = Math.random() < critRate;
      let dmg = this.playerDmg;
      if (isCrit) dmg = Math.floor(dmg * 1.85);

      this.damageEnemy(target, dmg, isCrit);
      this.spawnVfx(target.x, target.y, 0, 0.45, { duration: 220, grow: 1.25 });
    }
  }

  castSkill(skillId) {
    if (this.activeSkillCds[skillId] > 0) return;
    const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    this.activeSkillCds[skillId] = skill.cd;
    this.player.play('p_attack', true);
    this.player.once('animationcomplete', () => {
      if (this.player.active) this.player.play('p_idle', true);
    });

    const elemColors = {
      'Kim': '#ffd700', 'Hỏa': '#ff4422', 'Thủy': '#44aaff', 'Thổ': '#aa8844',
      'Mộc': '#44dd66', 'Phong': '#66ffcc', 'Lôi': '#ffee33', 'Vật Lý': '#ff88aa'
    };

    const baseDmg = Math.floor(this.playerDmg * skill.dmgMul);

    if (skill.isAoE) {
      this.enemies.forEach(target => {
        if (!target.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
        if (d < 450) {
          this.damageEnemy(target, baseDmg, true);
          this.spawnVfx(target.x, target.y, 1, 0.7, { duration: 350 });
        }
      });
      this.showFloatingText(this.player.x, this.player.y - 70, `💥 [${skill.elem}] ${skill.name}!`, elemColors[skill.elem] || '#ffd700');
    } else {
      const target = this.nearestEnemy(450);
      if (target) {
        this.damageEnemy(target, baseDmg, true);
        this.spawnVfx(target.x, target.y, 2, 0.6, { duration: 300 });
        this.showFloatingText(this.player.x, this.player.y - 70, `⚡ [${skill.elem}] ${skill.name}!`, elemColors[skill.elem] || '#ffd700');
      }
    }
  }

  damageEnemy(enemy, dmg, isCrit) {
    enemy.hp -= dmg;
    this.showFloatingText(enemy.x, enemy.y - 45, `-${dmg}`, isCrit ? '#ff3344' : '#ffffff', isCrit ? '18px' : '13px');

    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    if (enemy.hpBar) enemy.hpBar.width = ratio * 70;

    enemy.setTint(0xff5555);
    this.time.delayedCall(120, () => { if (enemy.active) enemy.clearTint(); });

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy) {
    const data = enemy.data;
    this.gainExp(data.exp, true);
    gameState.gold += data.gold;
    gameState.ores += data.ore;

    if (gameState.sectId) gameState.sectContrib += 1;

    this.showFloatingText(enemy.x, enemy.y - 20, `+${data.exp} Tu Vi  +${data.gold} L.Thạch  +${data.ore} Khoáng`, '#ffdd44');

    if (enemy.hpBar) enemy.hpBar.destroy();
    if (enemy.hpBg) enemy.hpBg.destroy();
    if (enemy.nameText) enemy.nameText.destroy();
    enemy.destroy();

    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) this.enemies.splice(idx, 1);

    this.updateHUD();

    if (this.enemies.length === 0) {
      this.time.delayedCall(1500, () => this.startStage(this.stageIndex));
    }
  }

  enemyAttack(enemy) {
    if (this.playerHp <= 0) return;
    const def = this.calcPlayerDef();
    const dmg = Math.max(1, enemy.dmg - def);
    this.playerHp = Math.max(0, this.playerHp - dmg);

    this.showFloatingText(this.player.x, this.player.y - 30, `-${dmg}`, '#ff7777');
    this.updateHUD();

    this.player.setTint(0xff6666);
    this.time.delayedCall(120, () => { if (this.player.active) this.player.clearTint(); });
  }

  onSecondTick() {
    gameState.gardenTimer++;
    if (gameState.gardenTimer >= 10) {
      gameState.gardenTimer = 0;
      let herbsGain = 3;
      if (gameState.sectId === 'thanh_moc_cac') herbsGain += 1;
      gameState.herbs += herbsGain;
      this.updateHUD();
    }

    const passiveExp = Math.floor(12 * (1 + gameState.realmIdx * 1.2));
    this.gainExp(passiveExp, false);

    // Auto fight AI
    if (gameState.autoFight && this.enemies.length > 0) {
      let casted = false;
      for (let i = 0; i < gameState.equippedSkillIds.length; i++) {
        const sId = gameState.equippedSkillIds[i];
        if (sId && (!this.activeSkillCds[sId] || this.activeSkillCds[sId] <= 0)) {
          this.castSkill(sId);
          casted = true;
          break;
        }
      }
      if (!casted) this.basicAttack();
    }

    // Enemies attack
    this.enemies.forEach(enemy => {
      if (!enemy.active) return;
      enemy.atkTimer -= 1000;
      if (enemy.atkTimer <= 0) {
        enemy.atkTimer = 2200 + Math.random() * 1000;
        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (d < 120) this.enemyAttack(enemy);
      }
    });

    // Update Skill Cooldowns
    Object.keys(this.activeSkillCds).forEach(k => {
      if (this.activeSkillCds[k] > 0) this.activeSkillCds[k] -= 1000;
    });

    this.skillSlots.forEach(slot => {
      if (slot && slot.skillId && slot.cdOverlay) {
        const cdLeft = this.activeSkillCds[slot.skillId] || 0;
        if (cdLeft > 0) {
          slot.cdOverlay.setVisible(true);
          slot.cdText.setText(`${Math.ceil(cdLeft / 1000)}s`);
        } else {
          slot.cdOverlay.setVisible(false);
          slot.cdText.setText('');
        }
      }
    });
  }

  gainExp(amt, showVisual = false) {
    const realm = REALMS[gameState.realmIdx];
    gameState.exp += amt;

    if (gameState.exp >= realm.expReq) {
      if (realm.bottleneck) {
        gameState.exp = realm.expReq;
      } else {
        if (gameState.realmIdx < REALMS.length - 1) {
          gameState.realmIdx++;
          gameState.exp = 0;
          gameState.spiritualSense += 8;
          this.playerHp = this.calcPlayerMaxHp();
          this.showFloatingText(this.player.x, this.player.y - 60, `🎉 ĐỘT PHÁ: ${REALMS[gameState.realmIdx].name}!`, '#ffff44', '20px');
        }
      }
    }
    this.updateHUD();
  }

  showFloatingText(x, y, text, color = '#ffffff', fontSize = '13px') {
    const txt = this.add.text(x, y, text, {
      fontSize: fontSize,
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(180);

    this.tweens.add({
      targets: txt,
      y: y - 45,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  // ==============================================================
  // 🏛️ MODAL TÔNG MÔN
  // ==============================================================
  openSectPanel() {
    this.closeModal();

    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setInteractive(), 190);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 191);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -200, '🏛️ HỆ THỐNG 8 ĐẠI TÔNG MÔN TU CHÂN GIỚI', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(360, -200, 'ui_close').setDisplaySize(26, 26).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      const rank = SECT_RANKS[gameState.sectRankIdx];
      const nextRank = SECT_RANKS[gameState.sectRankIdx + 1];

      const sectIcon = this.add.image(-220, -110, sect.icon).setDisplaySize(64, 64);
      const sectName = this.add.text(-170, -130, `${sect.name} (${sect.title})`, { fontSize: '16px', fontStyle: 'bold', color: '#66ffcc' });
      const sectInfo = this.add.text(-170, -105, `Đẳng Cấp Chức Vị: ${rank.name}\nĐiểm Cống Hiến: ${gameState.sectContrib} Điểm\nTrấn Phái Gia Trì: ${sect.buffDesc}`, { fontSize: '11px', color: '#cceeff', lineSpacing: 5 });

      const salaryBox = this.add.rectangle(180, -100, 320, 110, 0x111e33, 0.9).setStrokeStyle(1.5, 0x336699);
      const salaryTitle = this.add.text(180, -135, '🎁 Bổng Lộc Môn Phái', { fontSize: '13px', fontStyle: 'bold', color: '#ffaa44' }).setOrigin(0.5);
      const salaryDesc = this.add.text(180, -105, `Nhận mỗi chu kỳ: +${rank.salaryGold} L.Thạch, +${rank.salaryHerb} Thảo, +${rank.salaryOre} Khoáng`, { fontSize: '10px', color: '#99bbdd' }).setOrigin(0.5);

      const claimBtn = this.add.rectangle(180, -70, 160, 30, 0x1b4d3e).setStrokeStyle(1.5, 0x33cc88).setInteractive({ useHandCursor: true });
      const claimTxt = this.add.text(180, -70, 'Lãnh Bổng Lộc', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);

      claimBtn.on('pointerdown', () => {
        gameState.gold += rank.salaryGold;
        gameState.herbs += rank.salaryHerb;
        gameState.ores += rank.salaryOre;
        this.updateHUD();
        this.showFloatingText(this.player.x, this.player.y - 60, `🎁 Nhận bổng lộc: +${rank.salaryGold} L.Thạch, +${rank.salaryHerb} Thảo, +${rank.salaryOre} Khoáng!`, '#66ffcc');
      });

      const canPromote = (nextRank && gameState.sectContrib >= nextRank.reqContrib);
      const promoteBtn = this.add.rectangle(0, 5, 340, 36, canPromote ? 0x884400 : 0x223344).setStrokeStyle(1.5, canPromote ? 0xffaa00 : 0x445566).setInteractive({ useHandCursor: canPromote });
      const promoteTxt = this.add.text(0, 5, nextRank ? `Thăng Chức [${nextRank.name}] (Cần ${nextRank.reqContrib} Cống Hiến)` : 'ĐÃ ĐẠT CHỨC VỊ CAO NHẤT', { fontSize: '11px', fontStyle: 'bold', color: canPromote ? '#ffffff' : '#8899aa' }).setOrigin(0.5);

      promoteBtn.on('pointerdown', () => {
        if (canPromote) {
          gameState.sectRankIdx++;
          this.updateHUD();
          this.openSectPanel();
          this.showFloatingText(this.player.x, this.player.y - 60, `🎉 Chúc mừng thăng tiến: ${nextRank.name}!`, '#ffd700');
        }
      });

      const leaveBtn = this.add.rectangle(0, 180, 160, 28, 0x551111).setStrokeStyle(1, 0xaa3333).setInteractive({ useHandCursor: true });
      const leaveTxt = this.add.text(0, 180, 'Rời Khỏi Môn Phái', { fontSize: '10px', fontStyle: 'bold', color: '#ffaaaa' }).setOrigin(0.5);
      leaveBtn.on('pointerdown', () => {
        gameState.sectId = null;
        gameState.sectRankIdx = 0;
        gameState.sectContrib = 0;
        this.updateHUD();
        this.openSectPanel();
      });

      panel.add([sectIcon, sectName, sectInfo, salaryBox, salaryTitle, salaryDesc, claimBtn, claimTxt, promoteBtn, promoteTxt, leaveBtn, leaveTxt]);
    } else {
      SECTS.forEach((st, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const sx = -190 + col * 380;
        const sy = -120 + row * 82;

        const cardBg = this.add.rectangle(sx, sy, 360, 72, 0x122035).setStrokeStyle(1.5, 0x2a5078);
        const icon = this.add.image(sx - 145, sy, st.icon).setDisplaySize(40, 40);
        const sTitle = this.add.text(sx - 115, sy - 24, `${st.name} [Hệ ${st.elem}]`, { fontSize: '12px', fontStyle: 'bold', color: '#ffd700' });
        const sBuff = this.add.text(sx - 115, sy - 8, st.buffDesc, { fontSize: '10px', color: '#66ffcc' });
        const sDesc = this.add.text(sx - 115, sy + 8, st.desc, { fontSize: '9px', color: '#99bbdd', wordWrap: { width: 210 } });

        const joinBtn = this.add.rectangle(sx + 130, sy, 68, 30, 0x1b4d3e).setStrokeStyle(1.5, 0x33cc88).setInteractive({ useHandCursor: true });
        const joinTxt = this.add.text(sx + 130, sy, 'Bái Sư', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);

        joinBtn.on('pointerdown', () => {
          gameState.sectId = st.id;
          gameState.sectRankIdx = 0;
          gameState.sectContrib = 50;
          this.updateHUD();
          this.openSectPanel();
          this.showFloatingText(this.player.x, this.player.y - 60, `🏮 Bái nhập ${st.name} thành công!`, '#ffd700');
        });

        panel.add([cardBg, icon, sTitle, sBuff, sDesc, joinBtn, joinTxt]);
      });
    }

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 🧘 MODAL THÔNG TIN TU SĨ
  // ==============================================================
  openCharacterPanel() {
    this.closeModal();

    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setInteractive(), 190);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 191);

    const bg = this.add.rectangle(0, 0, 720, 440, 0x0a1220, 0.98).setStrokeStyle(2, 0x2a5078);
    const title = this.add.text(0, -190, '🧘 BẢNG THÔNG TIN TU SĨ & THUỘC TÍNH TU TIÊN', { fontSize: '16px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    const closeBtn = this.add.image(330, -190, 'ui_close').setDisplaySize(26, 26).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const currentRealm = REALMS[gameState.realmIdx];
    const sect = gameState.sectId ? SECTS.find(s => s.id === gameState.sectId) : null;

    const avatar = this.add.image(-220, -90, 'player_avatar').setDisplaySize(80, 80);
    const realmName = this.add.text(-220, -35, `${currentRealm.major} Kỳ • ${currentRealm.tier}`, { fontSize: '16px', fontStyle: 'bold', color: '#66ccff' }).setOrigin(0.5);
    const sectTag = this.add.text(-220, -12, sect ? `🏛️ ${sect.name} [${SECT_RANKS[gameState.sectRankIdx].name}]` : '🏛️ Tán Tu Tự Do', { fontSize: '11px', color: '#ffd700' }).setOrigin(0.5);

    const critRate = 15 + (gameState.spiritualSense * 0.5);
    const statsText = this.add.text(80, -60,
      `❤️ Khí Huyết (HP): ${this.calcPlayerMaxHp()}\n` +
      `🌀 Linh Lực / Chân Nguyên: ${gameState.mana} / ${gameState.manaMax}\n` +
      `⚔️ Kiếm Kình / Công Kích: ${this.calcPlayerDmg()}\n` +
      `🛡️ Hộ Thể Chân Khí (Giáp): ${this.calcPlayerDef()}\n` +
      `👁️ Thần Thức Cảm Ứng: ${gameState.spiritualSense} Điểm (+${critRate.toFixed(1)}% Bạo Kích)\n` +
      `🌱 Linh Căn Bản Mệnh: ${gameState.aptitude}\n` +
      `✨ Tu Vi Tích Lũy: ${gameState.exp} / ${currentRealm.expReq}`, {
      fontSize: '12px', color: '#d4e6ff', lineSpacing: 8
    }).setOrigin(0.5);

    let btnText = 'TỰ ĐỘNG HẤP THU LINH KHÍ';
    let canBreak = false;
    let requiredPill = null;

    if (gameState.exp >= currentRealm.expReq) {
      if (currentRealm.bottleneck) {
        requiredPill = currentRealm.pillNeeded;
        btnText = `CẮN [${requiredPill}] ĐỂ ĐỘT PHÁ`;
        canBreak = (gameState.inventory.pills[requiredPill] > 0);
      } else {
        btnText = 'LẬP TỨC ĐỘT PHÁ';
        canBreak = true;
      }
    }

    const breakBtn = this.add.rectangle(0, 135, 380, 44, canBreak ? 0x226633 : 0x223344)
      .setStrokeStyle(1.5, canBreak ? 0x44ff88 : 0x556677)
      .setInteractive({ useHandCursor: canBreak });

    const breakBtnTxt = this.add.text(0, 135, btnText, { fontSize: '12px', fontStyle: 'bold', color: canBreak ? '#ffffff' : '#8899aa' }).setOrigin(0.5);

    breakBtn.on('pointerdown', () => {
      if (!canBreak) {
        if (requiredPill && !gameState.inventory.pills[requiredPill]) {
          this.showFloatingText(this.player.x, this.player.y - 60, `Cần luyện chế [${requiredPill}] tại mục Bách Nghệ!`, '#ff5555');
        }
        return;
      }

      if (requiredPill) gameState.inventory.pills[requiredPill]--;

      if (gameState.realmIdx < REALMS.length - 1) {
        gameState.realmIdx++;
        gameState.exp = 0;
        gameState.spiritualSense += 8;
        this.playerHp = this.calcPlayerMaxHp();
        this.updateHUD();
        this.openCharacterPanel();
        this.showFloatingText(this.player.x, this.player.y - 60, `🎉 ĐỘT PHÁ THÀNH CÔNG: ${REALMS[gameState.realmIdx].name}!`, '#ffd700', '20px');
      }
    });

    panel.add([bg, title, closeBtn, avatar, realmName, sectTag, statsText, breakBtn, breakBtnTxt]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 🗺️ MODAL ĐẠI BẢN ĐỒ NHÂN GIỚI (5 ĐẠI VỰC)
  // ==============================================================
  openMapPanel(activeRegionId = 'nam_lang') {
    this.closeModal();

    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setInteractive(), 190);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 191);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98).setStrokeStyle(2, 0x2a5078);
    const title = this.add.text(0, -200, '🗺️ ĐẠI BẢN ĐỒ NHÂN GIỚI - 5 ĐẠI VỰC TU CHÂN KỲ VĨ', { fontSize: '16px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    const closeBtn = this.add.image(360, -200, 'ui_close').setDisplaySize(26, 26).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    WORLD_REGIONS.forEach((reg, idx) => {
      const rx = -310 + idx * 155;
      const isAct = (reg.id === activeRegionId);
      const regBg = this.add.rectangle(rx, -160, 145, 30, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const regTxt = this.add.text(rx, -160, reg.name, { fontSize: '11px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      regBg.on('pointerdown', () => this.openMapPanel(reg.id));
      panel.add([regBg, regTxt]);
    });

    const activeReg = WORLD_REGIONS.find(r => r.id === activeRegionId);

    activeReg.stages.forEach((stg, idx) => {
      const sx = -220 + idx * 220;
      const sy = -20;
      const isCurrent = (stg.id === gameState.currentStageId);
      const isUnlocked = (gameState.realmIdx >= stg.minRealm);

      const cardBg = this.add.rectangle(sx, sy, 200, 180, isCurrent ? 0x1d3855 : 0x111c2b)
        .setStrokeStyle(1.5, isCurrent ? 0x44ff88 : (isUnlocked ? 0x336699 : 0x333333))
        .setInteractive({ useHandCursor: isUnlocked });

      const icon = this.add.image(sx, sy - 40, stg.icon).setDisplaySize(56, 56);
      if (!isUnlocked) icon.setTint(0x555555);

      const sName = this.add.text(sx, sy + 5, stg.name, { fontSize: '12px', fontStyle: 'bold', color: isUnlocked ? '#ffd700' : '#778899' }).setOrigin(0.5);
      const sSub = this.add.text(sx, sy + 25, stg.sub, { fontSize: '10px', color: '#99bbdd' }).setOrigin(0.5);
      const statusTxt = this.add.text(sx, sy + 60, isCurrent ? '📍 ĐANG Ở ĐÂY' : (isUnlocked ? 'TIẾN VÀO BÍ CẢNH' : `Yêu cầu: ${REALMS[stg.minRealm].name}`), {
        fontSize: '10px', fontStyle: 'bold', color: isCurrent ? '#44ff88' : (isUnlocked ? '#66ccff' : '#ff6666')
      }).setOrigin(0.5);

      cardBg.on('pointerdown', () => {
        if (!isUnlocked) {
          this.showFloatingText(this.player.x, this.player.y - 60, `Cảnh giới chưa đủ để vào ${stg.name}!`, '#ff5555');
          return;
        }
        this.closeModal();
        this.startStage(stg.id);
        this.showFloatingText(this.player.x, this.player.y - 60, `🚀 Đã tiến vào: ${stg.name}!`, '#66ffcc');
      });

      panel.add([cardBg, icon, sName, sSub, statusTxt]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 📜 MODAL TÀNG KINH CÁC (8 HỆ, 40 THẦN THÔNG)
  // ==============================================================
  openSkillPanel(activeElem = 'Kim') {
    this.closeModal();

    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setInteractive(), 190);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 191);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98).setStrokeStyle(2, 0x2a5078);
    const title = this.add.text(0, -200, '📜 TÀNG KINH CÁC: 8 ĐẠI HỆ NGUYÊN TỐ & 40 THẦN THÔNG', { fontSize: '16px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    const closeBtn = this.add.image(360, -200, 'ui_close').setDisplaySize(26, 26).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const elements = ['Kim', 'Hỏa', 'Thủy', 'Thổ', 'Mộc', 'Phong', 'Lôi', 'Vật Lý'];
    elements.forEach((elem, idx) => {
      const ex = -315 + idx * 90;
      const isAct = (elem === activeElem);
      const elemBg = this.add.rectangle(ex, -160, 84, 30, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const elemTxt = this.add.text(ex, -160, elem, { fontSize: '12px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      elemBg.on('pointerdown', () => this.openSkillPanel(elem));
      panel.add([elemBg, elemTxt]);
    });

    const skillsOfElem = ELEMENTAL_SKILLS.filter(s => s.elem === activeElem);

    skillsOfElem.forEach((skill, idx) => {
      const sy = -105 + idx * 62;
      const isUnlocked = (gameState.realmIdx >= skill.minRealm);
      const isEquipped = gameState.equippedSkillIds.includes(skill.id);

      const cardBg = this.add.rectangle(0, sy, 730, 54, isEquipped ? 0x182c44 : 0x111c2a)
        .setStrokeStyle(1.5, isEquipped ? 0x44ff88 : (isUnlocked ? 0x336699 : 0x333333));

      const icon = this.add.image(-320, sy, skill.icon).setDisplaySize(42, 42);
      if (!isUnlocked) icon.setTint(0x555555);

      const sStage = this.add.text(-280, sy - 14, `[${skill.stage}]`, { fontSize: '11px', fontStyle: 'bold', color: '#ffaa00' });
      const sName = this.add.text(-190, sy - 14, skill.name, { fontSize: '13px', fontStyle: 'bold', color: isUnlocked ? '#ffffff' : '#778899' });
      const sDesc = this.add.text(-280, sy + 6, `${skill.desc} (Hồi: ${skill.cd / 1000}s, x${skill.dmgMul} Sát Thương${skill.isAoE ? ' AoE' : ''})`, { fontSize: '10px', color: '#88bbdd' });

      if (isUnlocked) {
        const btnBg = this.add.rectangle(300, sy, 76, 30, isEquipped ? 0x335533 : 0x1a3a5a).setStrokeStyle(1, isEquipped ? 0x55aa55 : 0x3377bb).setInteractive({ useHandCursor: true });
        const btnTxt = this.add.text(300, sy, isEquipped ? 'Gỡ' : 'Lắp', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);

        btnBg.on('pointerdown', () => {
          if (isEquipped) {
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
          } else {
            if (gameState.equippedSkillIds.length < 4) {
              gameState.equippedSkillIds.push(skill.id);
            } else {
              this.showFloatingText(this.player.x, this.player.y - 60, 'Tối đa gắn 4 Thần Thông!', '#ff5555');
              return;
            }
          }
          this.createSkillBar();
          this.openSkillPanel(activeElem);
        });
        panel.add([btnBg, btnTxt]);
      } else {
        const reqTxt = this.add.text(300, sy, `Yêu cầu: ${skill.stage}`, { fontSize: '10px', color: '#ff6666' }).setOrigin(0.5);
        panel.add(reqTxt);
      }

      panel.add([cardBg, icon, sStage, sName, sDesc]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 💊 MODAL BÁCH NGHỆ
  // ==============================================================
  openCraftingPanel(currentTab = 'pills') {
    this.closeModal();

    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setInteractive(), 190);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 191);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98).setStrokeStyle(2, 0x2a5078);
    const title = this.add.text(0, -200, '🏮 BÁCH NGHỆ TU TIÊN: ĐAN DƯỢC • PHÙ LỤC • TRẬN PHÁP', { fontSize: '16px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    const closeBtn = this.add.image(360, -200, 'ui_close').setDisplaySize(26, 26).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const tabs = [
      { key: 'pills', label: '💊 ĐAN DƯỢC (1~5 Phẩm)' },
      { key: 'talismans', label: '📜 PHÙ LỤC (1~5 Phẩm)' },
      { key: 'formations', label: '🌌 TRẬN PHÁP (1~5 Phẩm)' }
    ];

    tabs.forEach((tb, idx) => {
      const tx = -240 + idx * 240;
      const isAct = (tb.key === currentTab);
      const tabBg = this.add.rectangle(tx, -165, 220, 32, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const tabTxt = this.add.text(tx, -165, tb.label, { fontSize: '12px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      tabBg.on('pointerdown', () => this.openCraftingPanel(tb.key));
      panel.add([tabBg, tabTxt]);
    });

    const recipeList = CRAFTING_SYSTEM[currentTab] || [];

    recipeList.slice(0, 5).forEach((item, idx) => {
      const iy = -105 + idx * 58;
      const itemBox = this.add.rectangle(0, iy, 740, 50, 0x122035)
        .setStrokeStyle(1.5, item.grade === 'Cực Phẩm' ? 0xffaa00 : (item.grade === 'Thượng Phẩm' ? 0xcc44cc : (item.grade === 'Trung Phẩm' ? 0x3399ff : 0x44aa44)));

      const gradeColor = (item.grade === 'Cực Phẩm') ? '#ffaa00' : (item.grade === 'Thượng Phẩm' ? '#ff77ff' : (item.grade === 'Trung Phẩm' ? '#66ccff' : '#66ff66'));
      const gradeBadge = this.add.text(-350, iy - 14, `[${item.rank} • ${item.grade}]`, { fontSize: '11px', fontStyle: 'bold', color: gradeColor });
      const iName = this.add.text(-220, iy - 14, item.name, { fontSize: '12px', fontStyle: 'bold', color: '#ffffff' });
      const iDesc = this.add.text(-350, iy + 6, `${item.desc} | Chi phí: ${item.costHerbs} Thảo, ${item.costOres || 0} Khoáng, ${item.costGold} L.Thạch`, { fontSize: '10px', color: '#88bbdd' });

      const canCraft = (gameState.herbs >= item.costHerbs && gameState.ores >= (item.costOres || 0) && gameState.gold >= item.costGold);
      const actionBtn = this.add.rectangle(310, iy, 90, 32, canCraft ? 0x884400 : 0x223344).setStrokeStyle(1.5, canCraft ? 0xffaa00 : 0x445566).setInteractive({ useHandCursor: canCraft });
      const btnLabel = currentTab === 'formations' ? (gameState.inventory.formations.includes(item.name) ? 'Đã Có' : 'Bố Trí') : 'Luyện Chế';
      const actionTxt = this.add.text(310, iy, btnLabel, { fontSize: '11px', fontStyle: 'bold', color: canCraft ? '#ffffff' : '#778899' }).setOrigin(0.5);

      actionBtn.on('pointerdown', () => {
        if (!canCraft) {
          this.showFloatingText(this.player.x, this.player.y - 60, 'Không đủ nguyên liệu hoặc Linh Thạch!', '#ff5555');
          return;
        }

        gameState.herbs -= item.costHerbs;
        gameState.ores -= (item.costOres || 0);
        gameState.gold -= item.costGold;

        if (currentTab === 'pills') {
          gameState.inventory.pills[item.name] = (gameState.inventory.pills[item.name] || 0) + 1;
          this.showFloatingText(this.player.x, this.player.y - 60, `🔥 Luyện thành công 1 viên [${item.name}]!`, '#ffd700');
        } else if (currentTab === 'talismans') {
          gameState.inventory.talismans[item.name] = (gameState.inventory.talismans[item.name] || 0) + 1;
          this.showFloatingText(this.player.x, this.player.y - 60, `📜 Vẽ thành công 1 tấm [${item.name}]!`, '#66ffcc');
        } else if (currentTab === 'formations') {
          if (!gameState.inventory.formations.includes(item.name)) {
            gameState.inventory.formations.push(item.name);
          }
          this.showFloatingText(this.player.x, this.player.y - 60, `🌌 Bố trí thành công [${item.name}]!`, '#ffd700');
        }

        this.updateHUD();
        this.openCraftingPanel(currentTab);
      });

      panel.add([itemBox, gradeBadge, iName, iDesc, actionBtn, actionTxt]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 🎒 MODAL HÀNH TRANG
  // ==============================================================
  openGearPanel() {
    this.closeModal();

    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setInteractive(), 190);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 191);

    const bg = this.add.rectangle(0, 0, 720, 420, 0x0a1220, 0.98).setStrokeStyle(2, 0x2a5078);
    const title = this.add.text(0, -180, '🎒 HÀNH TRANG & TÔI LUYỆN PHÁP BẢO', { fontSize: '17px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    const closeBtn = this.add.image(330, -180, 'ui_close').setDisplaySize(26, 26).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    INITIAL_ITEMS.slice(0, 6).forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const ix = -225 + col * 110;
      const iy = -80 + row * 80;

      const slotBg = this.add.rectangle(ix, iy, 76, 64, 0x16263e).setStrokeStyle(1, 0x335577);
      const icon = this.add.image(ix, iy - 8, item.icon).setDisplaySize(38, 38);
      const lbl = this.add.text(ix, iy + 18, `+${gameState.gearPlus}`, { fontSize: '11px', fontStyle: 'bold', color: '#ffcc00' }).setOrigin(0.5);

      panel.add([slotBg, icon, lbl]);
    });

    const forgeBox = this.add.rectangle(170, 0, 310, 310, 0x111e33, 0.9).setStrokeStyle(1.5, 0x336699);
    const forgeTitle = this.add.text(170, -135, '🔨 Luyện Khí Các (Tôi Luyện)', { fontSize: '14px', fontStyle: 'bold', color: '#ff9944' }).setOrigin(0.5);
    const forgeDesc = this.add.text(170, -30,
      `Cấp Tôi Luyện: +${gameState.gearPlus}\n` +
      `Khoáng Thạch: ${gameState.ores} viên\n` +
      `Chi phí: 3 Khoáng Thạch + 50 L.Thạch\n\n` +
      `Hiệu quả mỗi cấp:\n` +
      `⚔️ +25 Công Kích\n` +
      `❤️ +150 Sinh Mệnh\n` +
      `🛡️ +10 Phòng Ngự`, {
      fontSize: '12px', align: 'center', color: '#cceeff', lineSpacing: 5
    }).setOrigin(0.5);

    const forgeBtn = this.add.rectangle(170, 95, 230, 38, 0x884400).setStrokeStyle(1.5, 0xffaa00).setInteractive({ useHandCursor: true });
    const forgeBtnTxt = this.add.text(170, 95, '🔨 Tôi Luyện Pháp Bảo (+1)', { fontSize: '12px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);

    forgeBtn.on('pointerdown', () => {
      if (gameState.ores >= 3 && gameState.gold >= 50) {
        gameState.ores -= 3;
        gameState.gold -= 50;
        gameState.gearPlus += 1;
        this.updateHUD();
        this.openGearPanel();
        this.showFloatingText(this.player.x, this.player.y - 60, `✨ Tôi Luyện Thành Công: Pháp Bảo +${gameState.gearPlus}!`, '#ffd700');
      } else {
        this.showFloatingText(this.player.x, this.player.y - 60, 'Không đủ Khoáng Thạch hoặc Linh Thạch!', '#ff5555');
      }
    });

    panel.add([bg, title, closeBtn, forgeBox, forgeTitle, forgeDesc, forgeBtn, forgeBtnTxt]);
    this.modalLayer.add([overlay, panel]);
  }

  closeModal() {
    this.modalLayer.removeAll(true);
  }
}
"""
with open('H:/GOOGLE DRIVER/GAME/src/scenes/MainScene.js', 'w', encoding='utf-8') as f:
    f.write(mainSceneCode)

print("Merged Map Panorama, Player Animations, Attack and Xianxia System successfully!")
