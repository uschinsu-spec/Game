/**
 * MainScene.js — Core Scene (Orchestrator)
 * ========================================
 * Chỉ chứa lifecycle + gameplay loop + animation.
 * Toàn bộ map runtime do WorldMapRuntime.js sở hữu duy nhất.
 * Toàn bộ world-map UI do WorldMapHierarchyUI.js sở hữu duy nhất.
 */
import { getMapById } from '../config/world/worldRegistry.js?v=20260929-single-map-system-v1';
import { gameState } from '../state/gameState.js';
import { ELEMENTAL_SKILLS } from '../config/skillsData.js?v=20260928-skill-mastery-vfx-v4';
import { W, H } from './constants.js';

import { HudMixin } from './mixins/HudMixin.js?v=20260928-touch-controls-unified-v1';
import { CombatMixin } from './mixins/CombatMixin.js?v=20260928-combat-unified-v5';
import { EnemyMixin } from './mixins/EnemyMixin.js?v=20260928-enemy-loot-unified-v1';
import { PlayerMixin } from './mixins/PlayerMixin.js';
import { ModalMixin } from './mixins/ModalMixin.js?v=20260928-modal-manager-unified-v1';
import { NpcMixin } from './mixins/NpcMixin.js?v=20260928-npc-dialog-unified-v1';
import { FellowNpcMixin } from './mixins/FellowNpcMixin.js';
import { HerbsMixin } from './mixins/HerbsMixin.js?v=20260928-unified-resources-v2';
import { exportSaveCode } from '../state/saveSystem.js';
import { loadAllItemIcons } from '../config/iconManifest.js?v=20260928-game-icons-v1';

export { W, H } from './constants.js';

export class MainGameScene extends Phaser.Scene {
  constructor() {
    super('MainGameScene');
    this.gameState = gameState;
    this.currentMap = getMapById(gameState.currentMapId);
    this.worldW = this.currentMap.worldWidth;
    this.worldH = this.currentMap.worldHeight;
    this.field = { ...this.currentMap.field };
    this.enemies = [];
    this.activeSkillCds = {};
    this.moveTarget = null;
    this.lastBasic = 0;
    this.lastDash = 0;
    this.isDashing = false;
    this.isFlyingSword = false;
    this.dashCd = 1500;
    this.dead = false;
    this.respawnTimer = null;
    this.invulnerableUntil = 0;
    this.joy = { active: false, id: null, startX: 0, startY: 0, x: 0, y: 0 };
    this.skillsVisible = true;
    this.menuVisible = true;
  }

  preload() {
    const A = './assets/';
    const bootUi = window.__GAME_BOOT__;
    bootUi?.stage('Đang chuẩn bị tài nguyên bản đồ...');
    this.load.on('progress', value => bootUi?.progress(value));
    this.load.on('loaderror', () => bootUi?.assetError());

    this.load.image('flying_sword', A + 'characters/player/flying_sword.png');
    this.load.spritesheet('player_idle', A + 'characters/player/player_idle.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_run', A + 'characters/player/player_run.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_attack', A + 'characters/player/player_attack.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_fly', A + 'characters/player/player_fly.png', { frameWidth: 128, frameHeight: 128 });

    for (let i = 1; i <= 16; i++) {
      this.load.image(`enemy_${i}_idle_0`, `${A}characters/enemies/ground/enemy_${i}/idle_0.png`);
      this.load.image(`enemy_${i}_idle_1`, `${A}characters/enemies/ground/enemy_${i}/idle_1.png`);
      for (let r = 0; r < 4; r++) this.load.image(`enemy_${i}_run_${r}`, `${A}characters/enemies/ground/enemy_${i}/run_${r}.png`);
      for (let a = 0; a < 4; a++) this.load.image(`enemy_${i}_attack_${a}`, `${A}characters/enemies/ground/enemy_${i}/attack_${a}.png`);
    }

    for (let i = 1; i <= 10; i++) {
      this.load.image(`enemy_fly_${i}_idle_0`, `${A}characters/enemies/flying/enemy_${i}/idle_0.png`);
      this.load.image(`enemy_fly_${i}_idle_1`, `${A}characters/enemies/flying/enemy_${i}/idle_1.png`);
      for (let r = 0; r < 4; r++) this.load.image(`enemy_fly_${i}_run_${r}`, `${A}characters/enemies/flying/enemy_${i}/run_${r}.png`);
      for (let a = 0; a < 4; a++) this.load.image(`enemy_fly_${i}_attack_${a}`, `${A}characters/enemies/flying/enemy_${i}/attack_${a}.png`);
    }

    for (let f = 1; f <= 8; f++) {
      const pad = String(f).padStart(2, '0');
      this.load.image(`dai_han_idle_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_idle_${pad}.png`);
      this.load.image(`dai_han_run_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_run_${pad}.png`);
      this.load.image(`dai_han_attack_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_attack_${pad}.png`);
      this.load.image(`dai_han_fly_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_fly_${pad}.png`);
      this.load.image(`tho_san_idle_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_idle_${pad}.png`);
      this.load.image(`tho_san_run_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_run_${pad}.png`);
      this.load.image(`tho_san_attack_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_attack_${pad}.png`);
      this.load.image(`tho_san_fly_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_fly_${pad}.png`);
    }

    for (let i = 1; i <= 20; i++) {
      for (let f = 1; f <= 8; f++) {
        const pad = String(f).padStart(2, '0');
        this.load.image(`npc_fly_${i}_attack_${f}`, `${A}characters/npc/flying/npc_${i}/attack_${pad}.png`);
        this.load.image(`npc_fly_${i}_fly_${f}`, `${A}characters/npc/flying/npc_${i}/fly_${pad}.png`);
      }
    }

    for (let n = 1; n <= 16; n++) this.load.image(`npc_${n}`, `${A}characters/npc/portraits/npc_${n}.png`);
    for (let i = 0; i < 10; i++) this.load.image(`skill_${i}`, A + `icons/skills/skill_${i}.png`);
    ELEMENTAL_SKILLS.forEach(skill => this.load.image(skill.icon, A + `icons/skills/unique/${skill.id}.png`));
    for (let i = 0; i < 18; i++) this.load.image(`item_${i}`, A + `icons/items/item_${i}.png`);

    ['beast_pelt', 'beast_fur', 'beast_claw', 'beast_blood', 'beast_horn', 'herb', 'ore'].forEach(m => this.load.image(`mat_${m}`, A + `icons/materials/${m}.png`));
    for (let h = 1; h <= 7; h++) this.load.image(`herb_${h}`, A + `icons/materials/herb_${h}.png`);
    ['silver', 'spirit_stone_low', 'spirit_stone_mid', 'spirit_stone_high', 'spirit_stone_top'].forEach(c => this.load.image(`curr_${c}`, A + `icons/currencies/${c}.png`));
    ['pill_heal', 'pill_cultivation', 'pill_breakthrough', 'pill_golden'].forEach(p => this.load.image(`icon_${p}`, A + `icons/pills/${p}.png`));
    ['manual_hoang', 'manual_huyen', 'manual_dia', 'manual_thien', 'manual_than'].forEach(m => this.load.image(`icon_${m}`, A + `icons/manuals/${m}.png`));
    for (let i = 0; i < 12; i++) this.load.image(`stage_${i}`, A + `icons/stages/stage_${i}.png`);
    ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest'].forEach(icon => this.load.image(`ui_${icon}`, A + `icons/ui/${icon}.png`));
    ['bag', 'realm', 'skills', 'sect', 'craft', 'map', 'attack', 'auto', 'gold'].forEach(icon => this.load.image(`xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.png`));
    this.load.image('hud_skin', A + 'ui/hud_skin.png');
    this.load.image('hud_portrait', A + 'ui/hud_portrait.png');
    loadAllItemIcons(this, A);

    const elemDirs = { hoa: 'fire', loi: 'lightning', kim: 'metal', thuy: 'water', phong: 'wind', moc: 'wood', tho: 'earth', ly: 'physical' };
    Object.entries(elemDirs).forEach(([elemKey, dirName]) => {
      this.load.image(`vfx_${elemKey}_1`, `${A}vfx/elemental/${dirName}/proj_1.png`);
      for (let f = 0; f < 8; f++) this.load.image(`vfx_${elemKey}_1_${f}`, `${A}vfx/elemental/${dirName}/frame_${f}.png`);
      this.load.image(`vfx_${elemKey}_2`, `${A}vfx/elemental/${dirName}/proj_2.png`);
      this.load.image(`vfx_${elemKey}_3`, `${A}vfx/elemental/${dirName}/array_3.png`);
      this.load.image(`vfx_${elemKey}_4`, `${A}vfx/elemental/${dirName}/swarm_4.png`);
      this.load.image(`vfx_${elemKey}_5`, `${A}vfx/elemental/${dirName}/colossus_5.png`);
      this.load.image(`vfx_${elemKey}_shockwave`, `${A}vfx/elemental/${dirName}/shockwave.png`);
      this.load.image(`vfx_${elemKey}_impact`, `${A}vfx/elemental/${dirName}/impact.png`);
    });

    for (let i = 0; i < 8; i++) {
      this.load.image(`vfx_kim_1_${i}`, `${A}vfx/sword/kim_1_frame_${i}.png`);
      this.load.image(`vfx_kim_2_${i}`, `${A}vfx/sword/kim_2_frame_${i}.png`);
    }
    this.load.image('vfx_kim_3_0', `${A}vfx/sword/kim_3_frame_0.png`);
    this.load.image('vfx_tru_tien_shockwave', `${A}vfx/sword/tru_tien_shockwave.png`);
    this.load.image('vfx_sword_impact_frame7', `${A}vfx/atlas/frame_7.png`);
    this.load.image('vfx_impact_frame7', `${A}vfx/atlas/frame_7.png`);
    this.load.image('vfx_sword_kiem_khi', `${A}vfx/sword/kiem_khi.png`);
    this.load.image('vfx_giant_tru_tien_sword', `${A}vfx/sword/giant_tru_tien_sword.png`);
    this.load.image('vfx_loi', `${A}vfx/sword/vfx_loi.png`);
    this.load.image('vfx_heal', A + 'vfx/skills/vfx_heal.png');
    this.load.image('vfx_shield', A + 'vfx/skills/vfx_shield.png');
    this.load.image('vfx_speed', A + 'vfx/skills/vfx_speed.png');
    this.load.image('vfx_divine', A + 'vfx/ultimates/vfx_divine.png');
    this.load.spritesheet('vfx', A + 'vfx/atlas/vfx_atlas.png', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    this.applyMapRuntimeConfig(gameState.currentMapId);
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.createAnimations();
    this.createWorld();
    this.createPlayer();
    this.createNpcs();
    this.createMapPortals();
    this.enemyGroup = this.physics.add.group({ runChildUpdate: false });
    this.playerProjectiles = this.physics.add.group({ maxSize: 30 });
    this.enemyProjectiles = this.physics.add.group({ maxSize: 30 });
    this.createVfxPool();
    this.createTopHUD();
    this.createAfkBanner();
    this.createBottomNav();
    this.createSkillBar();
    this.createDynamicTouchControls();
    this.createSideToggleButtons();
    this.createMinimap();
    this.syncVillageHubMode();
    this.modalLayer = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);
    this.initBattlefield();
    this.initFellowNpcs();
    this.initHerbs();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,F,Q,E,SPACE,ONE,TWO,THREE,FOUR,FIVE,SIX,ESC,T');
    this.input.keyboard.on('keydown-ESC', () => this.closeModal());
    this.input.keyboard.on('keydown-T', () => this.toggleMeditation());
    this.input.on('pointerdown', p => {
      if (this.isModalOpen && this.isModalOpen()) return;
      if (Number(gameState.currentMapId) === 0) return;
      if (p.y < 90 || p.y > (this.skillsVisible ? H - 225 : H - 140) || p.x > W - 60) return;
      this.moveTarget = { x: Phaser.Math.Clamp(p.x + this.cameras.main.scrollX, this.field.left, this.field.right), y: Phaser.Math.Clamp(p.y, this.field.top, this.field.bottom) };
    });
    this.time.addEvent({ delay: 1000, callback: this.onSecondTick, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 200, callback: () => this.updateMinimap(), loop: true });
    this.time.addEvent({ delay: 30000, callback: () => { try { exportSaveCode(); } catch (e) {} }, loop: true });
    this.time.delayedCall(250, () => this.openWelcomeScreenModal());
    window.__GAME_BOOT__?.ready();
  }

  update(time, delta) {
    if (!this.player || !this.player.body || this.dead) return;
    if (Number(gameState.currentMapId) === 0) { this.enforceVillageHubPresentation(); return; }
    for (const sId in this.activeSkillCds) {
      if (this.activeSkillCds[sId] > 0) {
        this.activeSkillCds[sId] -= delta;
        if (this.activeSkillCds[sId] <= 0) delete this.activeSkillCds[sId];
      }
    }
    if (this.skillSlots) this.skillSlots.forEach(slot => {
      if (slot.skillId && slot.cdOverlay && slot.cdText) {
        const cd = this.activeSkillCds[slot.skillId] || 0;
        if (cd > 0) {
          slot.cdOverlay.setVisible(true);
          const skillDef = ELEMENTAL_SKILLS.find(s => s.id === slot.skillId);
          slot.cdText.setText((skillDef?.cd === 0) ? '' : (cd / 1000).toFixed(1) + 's');
        } else { slot.cdOverlay.setVisible(false); slot.cdText.setText(''); }
      }
    });

    let baseSpeed = 175;
    if (this.isFlyingSword) baseSpeed = 265;
    if (this.isDashing) baseSpeed = 520;
    let vx = 0, vy = 0;
    if (this.joy.active) {
      vx = this.joy.x * baseSpeed; vy = this.joy.y * baseSpeed; this.moveTarget = null;
    } else {
      if (this.keys.A.isDown || this.keys.LEFT.isDown) vx -= baseSpeed;
      if (this.keys.D.isDown || this.keys.RIGHT.isDown) vx += baseSpeed;
      if (this.keys.W.isDown || this.keys.UP.isDown) vy -= baseSpeed;
      if (this.keys.S.isDown || this.keys.DOWN.isDown) vy += baseSpeed;
      if (vx !== 0 || vy !== 0) {
        this.moveTarget = null;
        const len = Math.hypot(vx, vy);
        if (len > 0) { vx = (vx / len) * baseSpeed; vy = (vy / len) * baseSpeed; }
      }
    }
    if (this.moveTarget && vx === 0 && vy === 0) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y);
      if (dist > 14) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y);
        vx = Math.cos(angle) * baseSpeed; vy = Math.sin(angle) * baseSpeed;
      } else {
        const cb = this.moveTarget.onArrive; this.moveTarget = null; if (cb) cb();
      }
    }
    const isAttacking = this.time.now < (this.attackUntil || 0);
    if (gameState.autoFight && !this.joy.active && !this.moveTarget && vx === 0 && vy === 0) {
      const mode = gameState.autoMode || 'farm';
      if (gameState.afkSettings?.autoSurvivalDash && this.playerHp < this.playerHpMax * 0.35 && this.time.now >= this.lastDash + this.dashCd) this.performDash();
      if (mode === 'rush') {
        if (gameState.afkSettings?.autoFly && !this.isFlyingSword) this.isFlyingSword = true;
        vx = baseSpeed; this.player.setFlipX(false);
      } else if (mode === 'march') {
        vx = baseSpeed * 0.85; this.player.setFlipX(false);
        const target = this.nearestEnemy(480, true);
        if (target && target.active && target.x >= this.player.x - 50) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          let casted = false;
          if (gameState.afkSettings?.autoSkill && !isAttacking) {
            for (const sId of gameState.equippedSkillIds) {
              if (!sId || this.activeSkillCds[sId] > 0) continue;
              if (sId === 'basic_attack' && dist > 115) continue;
              if (this.isFlyingSword) this.isFlyingSword = false;
              this.castSkill(sId);
              casted = true;
              break;
            }
          }
          const hasBasicEquipped = gameState.equippedSkillIds.includes('basic_attack');
          if (!casted && hasBasicEquipped && dist <= 115 && !isAttacking) {
            if (this.isFlyingSword) this.isFlyingSword = false;
            this.basicAttack();
          }
        }
      } else if (this.enemies.length > 0) {
        const target = this.nearestEnemy(3000, false);
        if (target && target.active) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          const onScreen = this.isEnemyOnScreen ? this.isEnemyOnScreen(target, 20) : dist <= 420;
          let casted = false;
          if (gameState.afkSettings?.autoSkill && onScreen && !isAttacking) {
            for (const sId of gameState.equippedSkillIds) {
              if (!sId || this.activeSkillCds[sId] > 0) continue;
              if (sId === 'basic_attack' && dist > 120) continue;
              if (this.isFlyingSword) this.isFlyingSword = false;
              this.player.setFlipX(target.x < this.player.x);
              this.castSkill(sId);
              casted = true;
              break;
            }
          }
          if (!casted) {
            const hasBasicEquipped = gameState.equippedSkillIds.includes('basic_attack');
            const hasReadyRangedSkill = gameState.equippedSkillIds.some(sId => sId && sId !== 'basic_attack' && !(this.activeSkillCds[sId] > 0));
            const stopDist = hasReadyRangedSkill ? 220 : (hasBasicEquipped ? 85 : 220);

            if (dist > stopDist) {
              if (gameState.afkSettings?.autoFly && !this.isFlyingSword && dist > 200) this.isFlyingSword = true;
              if (!isAttacking) {
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
                vx = Math.cos(angle) * baseSpeed;
                vy = Math.sin(angle) * baseSpeed;
              }
            } else {
              if (this.isFlyingSword) this.isFlyingSword = false;
              vx = 0; vy = 0;
              this.player.setFlipX(target.x < this.player.x);
              if (hasBasicEquipped && dist <= 125 && !isAttacking) this.basicAttack();
            }
          }
        }
      }
    }
    if (isAttacking) { vx = 0; vy = 0; }
    this.player.setVelocity(vx, vy);
    this.player.x = Phaser.Math.Clamp(this.player.x, this.field.left, this.field.right);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.field.top, this.field.bottom);
    const playerScale = 0.72 * this.perspective(this.player.y);
    this.player.setScale(playerScale).setDepth(Math.floor(this.player.y));
    if (this.playerShadow) this.playerShadow.setPosition(this.player.x, this.player.y + 32 * playerScale).setScale(playerScale).setAlpha(0.45);
    const isMoving = Math.abs(vx) > 5 || Math.abs(vy) > 5;
    if (this.time.now >= (this.attackUntil || 0)) {
      if (vx !== 0) this.player.setFlipX(vx < 0);
      if (this.isFlyingSword) this.player.play('p_fly', true); else this.player.play(isMoving ? 'p_run' : 'p_idle', true);
    }
    this.updateFellowNpcs(time, delta);

    const CULL_RANGE_X = 950;
    const enemiesCopy = this.enemies;
    for (let i = 0; i < enemiesCopy.length; i++) {
      const enemy = enemiesCopy[i];
      if (!enemy || !enemy.active || enemy.isDead) continue;
      if (Math.abs(enemy.x - this.player.x) > CULL_RANGE_X) {
        if (enemy.visible) { enemy.setVisible(false); if (enemy.body) { enemy.body.enable = false; enemy.setVelocity(0, 0); } enemy.hpBar?.setVisible(false); enemy.hpBg?.setVisible(false); enemy.nameText?.setVisible(false); }
        continue;
      }
      if (!enemy.visible) { enemy.setVisible(true); if (enemy.body) enemy.body.enable = true; enemy.hpBar?.setVisible(true); enemy.hpBg?.setVisible(true); enemy.nameText?.setVisible(true); }
      if (!enemy.body) continue;
      const pScale = (enemy.baseEnemyScale || 0.50) * this.perspective(enemy.y);
      enemy.setScale(pScale).setDepth(Math.floor(enemy.y));
      if (enemy.hpBar?.active) { enemy.hpBg.setPosition(enemy.x, enemy.y - 36 * pScale).setDepth(Math.floor(enemy.y) + 1); enemy.hpBar.setPosition(enemy.x - (enemy.barW || 36) / 2, enemy.y - 36 * pScale).setDepth(Math.floor(enemy.y) + 2); enemy.nameText.setPosition(enemy.x, enemy.y - 47 * pScale).setDepth(Math.floor(enemy.y) + 3); }

      let nearestTarget = null, minTargetDist = 999999;
      const candidates = [{ type: 'player', x: this.player.x, y: this.player.y, ref: this.player }];
      (this.partyFollowers || []).forEach(f => { if (f && !f.isDead && f.sprite?.visible && f.sprite?.active) candidates.push({ type: 'party_follower', x: f.sprite.x, y: f.sprite.y, ref: f }); });
      (this.fellowNpcs || []).forEach(n => { if (n && !n.isDead && n.sprite?.visible && n.sprite?.active) candidates.push({ type: 'fellow_npc', x: n.sprite.x, y: n.sprite.y, ref: n }); });
      (this.npcsGroup || []).forEach(n => { if (n?.container?.active && n.container.visible) candidates.push({ type: 'map_npc', x: n.container.x, y: n.container.y, ref: n }); });
      candidates.forEach(c => { const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, c.x, c.y); if (d < minTargetDist) { minTargetDist = d; nearestTarget = c; } });

      let evx = 0, evy = 0;
      const isEnemyAttacking = this.time.now < (enemy.attackUntil || 0);
      if (nearestTarget && minTargetDist < 500) {
        enemy.setFlipX(nearestTarget.x < enemy.x);
        if (enemy.isRanged) {
          if (minTargetDist > 220) { const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, nearestTarget.x, nearestTarget.y); evx = Math.cos(angle) * 50; evy = Math.sin(angle) * 50; }
          if (minTargetDist <= 260) { if (enemy.atkTimer === undefined || enemy.atkTimer > 1800) enemy.atkTimer = 400; enemy.atkTimer -= delta; if (enemy.atkTimer <= 0) { enemy.atkTimer = 1600 + Math.random() * 800; this.enemyShootProjectile(enemy, nearestTarget); } }
        } else {
          if (minTargetDist > 80) { const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, nearestTarget.x, nearestTarget.y); evx = Math.cos(angle) * 58; evy = Math.sin(angle) * 58; }
          if (minTargetDist <= 115) { if (enemy.atkTimer === undefined || enemy.atkTimer > 1200) enemy.atkTimer = 250; enemy.atkTimer -= delta; if (enemy.atkTimer <= 0) { enemy.atkTimer = 1000 + Math.random() * 400; this.enemyAttack(enemy, nearestTarget); } }
        }
      } else {
        enemy.roamTimer = (enemy.roamTimer || 2000) - delta;
        if (enemy.roamTimer <= 0) {
          if (enemy.roamState === 'idle') { enemy.roamState = 'walk'; enemy.roamTimer = 1500 + Math.random() * 2000; const dHomeX = (enemy.homeX || enemy.x) - enemy.x; enemy.roamVx = Math.abs(dHomeX) > 120 ? (dHomeX > 0 ? 1 : -1) * Phaser.Math.Between(20, 35) : Phaser.Math.Between(-30, 30); enemy.roamVy = Phaser.Math.Between(-20, 20); }
          else { enemy.roamState = 'idle'; enemy.roamTimer = 1200 + Math.random() * 1500; enemy.roamVx = 0; enemy.roamVy = 0; }
        }
        evx = enemy.roamVx || 0; evy = enemy.roamVy || 0; if (evx !== 0) enemy.setFlipX(evx < 0);
      }
      if (isEnemyAttacking) { evx = 0; evy = 0; }
      enemy.setVelocity(evx, evy);
      enemy.x = Phaser.Math.Clamp(enemy.x, this.field.left, this.field.right);
      enemy.y = Phaser.Math.Clamp(enemy.y, this.field.top, this.field.bottom);
      if (!isEnemyAttacking) { const moving = Math.abs(evx) > 3 || Math.abs(evy) > 3; const pfx = enemy.isFlying ? ('e_enemy_fly_' + enemy.enemySpriteNum) : ('e_enemy_' + enemy.enemySpriteNum); const animKey = pfx + (moving ? '_run' : '_idle'); if (enemy.anims?.currentAnim?.key !== animKey && this.anims.exists(animKey)) enemy.play(animKey, true); }
    }

    if (this.updateHerbs) this.updateHerbs(time, delta);
    if (Phaser.Input.Keyboard.JustDown(this.keys.F) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) { if (gameState.equippedSkillIds[0]) this.castSkill(gameState.equippedSkillIds[0]); else this.basicAttack(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.performDash();
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.toggleFlyingSword();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE) && gameState.equippedSkillIds[0]) this.castSkill(gameState.equippedSkillIds[0]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO) && gameState.equippedSkillIds[1]) this.castSkill(gameState.equippedSkillIds[1]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE) && gameState.equippedSkillIds[2]) this.castSkill(gameState.equippedSkillIds[2]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FOUR) && gameState.equippedSkillIds[3]) this.castSkill(gameState.equippedSkillIds[3]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FIVE) && gameState.equippedSkillIds[4]) this.castSkill(gameState.equippedSkillIds[4]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.SIX) && gameState.equippedSkillIds[5]) this.castSkill(gameState.equippedSkillIds[5]);
  }

  createAnimations() {
    const make = (key, tex, start, end, rate, repeat = -1) => { if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start, end }), frameRate: rate, repeat }); };
    make('p_idle', 'player_idle', 0, 7, 8); make('p_run', 'player_run', 0, 7, 12); make('p_attack', 'player_attack', 0, 7, 15, 0); make('p_fly', 'player_fly', 0, 7, 10);
    for (let i = 1; i <= 16; i++) {
      const t = 'enemy_' + i;
      if (!this.anims.exists('e_' + t + '_idle')) this.anims.create({ key: 'e_' + t + '_idle', frames: [{ key: `${t}_idle_0` }, { key: `${t}_idle_1` }], frameRate: 4, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_run')) this.anims.create({ key: 'e_' + t + '_run', frames: [0, 1, 2, 3].map(r => ({ key: `${t}_run_${r}` })), frameRate: 8, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_attack')) this.anims.create({ key: 'e_' + t + '_attack', frames: [0, 1, 2, 3].map(a => ({ key: `${t}_attack_${a}` })), frameRate: 10, repeat: 0 });
    }
    for (let i = 1; i <= 10; i++) {
      const t = 'enemy_fly_' + i;
      if (!this.anims.exists('e_' + t + '_idle')) this.anims.create({ key: 'e_' + t + '_idle', frames: [{ key: `${t}_idle_0` }, { key: `${t}_idle_1` }], frameRate: 5, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_run')) this.anims.create({ key: 'e_' + t + '_run', frames: [0, 1, 2, 3].map(r => ({ key: `${t}_run_${r}` })), frameRate: 9, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_attack')) this.anims.create({ key: 'e_' + t + '_attack', frames: [0, 1, 2, 3].map(a => ({ key: `${t}_attack_${a}` })), frameRate: 11, repeat: 0 });
    }
    ['dai_han', 'tho_san'].forEach(npcType => {
      if (!this.anims.exists(`${npcType}_idle`)) this.anims.create({ key: `${npcType}_idle`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_idle_${f}` })), frameRate: 8, repeat: -1 });
      if (!this.anims.exists(`${npcType}_run`)) this.anims.create({ key: `${npcType}_run`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_run_${f}` })), frameRate: 12, repeat: -1 });
      if (!this.anims.exists(`${npcType}_attack`)) this.anims.create({ key: `${npcType}_attack`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_attack_${f}` })), frameRate: 14, repeat: 0 });
      if (!this.anims.exists(`${npcType}_fly`)) this.anims.create({ key: `${npcType}_fly`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_fly_${f}` })), frameRate: 10, repeat: -1 });
    });
    for (let i = 1; i <= 20; i++) {
      const npcType = `npc_fly_${i}`;
      if (!this.anims.exists(`${npcType}_fly`)) this.anims.create({ key: `${npcType}_fly`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_fly_${f}` })), frameRate: 10, repeat: -1 });
      if (!this.anims.exists(`${npcType}_idle`)) this.anims.create({ key: `${npcType}_idle`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_fly_${f}` })), frameRate: 10, repeat: -1 });
      if (!this.anims.exists(`${npcType}_run`)) this.anims.create({ key: `${npcType}_run`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_fly_${f}` })), frameRate: 10, repeat: -1 });
      if (!this.anims.exists(`${npcType}_attack`)) this.anims.create({ key: `${npcType}_attack`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_attack_${f}` })), frameRate: 14, repeat: 0 });
    }
    ['hoa', 'loi', 'kim', 'thuy', 'phong', 'moc', 'tho', 'ly'].forEach(elemKey => {
      const animKey = `anim_vfx_${elemKey}_1`;
      if (!this.anims.exists(animKey)) this.anims.create({ key: animKey, frames: [0,1,2,3,4,5,6].map(f => ({ key: `vfx_${elemKey}_1_${f}` })), frameRate: 9, repeat: -1 });
    });
    if (!this.anims.exists('anim_vfx_kiem_1')) this.anims.create({ key: 'anim_vfx_kiem_1', frames: [0,1,2,3,4,5,6].map(f => ({ key: `vfx_kim_1_${f}` })), frameRate: 9, repeat: -1 });
    if (!this.anims.exists('anim_vfx_kim_2_fly')) this.anims.create({ key: 'anim_vfx_kim_2_fly', frames: [0,1].map(f => ({ key: `vfx_kim_2_${f}` })), frameRate: 8, repeat: -1 });
    if (!this.anims.exists('anim_vfx_kim_2_hit')) this.anims.create({ key: 'anim_vfx_kim_2_hit', frames: [2,3,4,5,6,7].map(f => ({ key: `vfx_kim_2_${f}` })), frameRate: 14, repeat: 0 });
  }
}

Object.assign(MainGameScene.prototype, HudMixin, CombatMixin, EnemyMixin, PlayerMixin, ModalMixin, NpcMixin, FellowNpcMixin, HerbsMixin);
