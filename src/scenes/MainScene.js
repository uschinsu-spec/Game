/**
 * MainScene.js — Core Scene (Orchestrator)
 * ========================================
 * Chỉ chứa lifecycle + gameplay loop + animation.
 * Toàn bộ map runtime do WorldMapRuntime.js sở hữu duy nhất.
 * Toàn bộ world-map UI do WorldMapHierarchyUI.js sở hữu duy nhất.
 */
import { getMapById } from '../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { gameState } from '../state/gameState.js';
import { ELEMENTAL_SKILLS } from '../config/skillsData.js?v=20260928-skill-mastery-vfx-v4';
import { W, H } from './constants.js';

import { HudMixin } from './mixins/HudMixin.js?v=20260928-touch-controls-unified-v1';
import { CombatMixin } from './mixins/CombatMixin.js?v=20261002-stable-rollback-v1';
import { EnemyMixin } from './mixins/EnemyMixin.js?v=20261001-item-icons-v4';
import { PlayerMixin } from './mixins/PlayerMixin.js?v=20261002-stable-rollback-v1';
import { ModalMixin } from './mixins/ModalMixin.js?v=20260928-modal-manager-unified-v1';
import { NpcMixin } from './mixins/NpcMixin.js?v=20261001-hub-ui-v4';
import { FellowNpcMixin } from './mixins/FellowNpcMixin.js?v=20261002-shared-vfx-pool-v5';
import { HerbsMixin } from './mixins/HerbsMixin.js?v=20261001-item-icons-v4';
import { exportSaveCode } from '../state/saveSystem.js?v=20261001-item-icons-v4';

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

    this.load.spritesheet('player_idle', A + 'characters/player/player_idle.webp?v=20261002-sync-run-v12', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('player_run', A + 'characters/player/player_run.webp?v=20261002-sync-run-v12', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('player_attack', A + 'characters/player/player_attack.webp?v=20261002-sync-run-v12', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('player_fly', A + 'characters/player/player_fly.webp?v=20261002-sync-run-v12', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('player_fly_attack', A + 'characters/player/player_fly_attack.webp?v=20261002-sync-run-v12', { frameWidth: 192, frameHeight: 192 });

    for (let i = 1; i <= 16; i++) {
      this.load.spritesheet(`enemy_${i}`, `${A}characters/enemies/enemy_${i}.webp?v=20261002-unified-v1`, { frameWidth: 192, frameHeight: 192 });
    }

    for (let i = 1; i <= 10; i++) {
      this.load.spritesheet(`enemy_fly_${i}`, `${A}characters/enemies/enemy_fly_${i}.webp?v=20261002-unified-v2`, { frameWidth: 192, frameHeight: 192 });
    }

    this.load.spritesheet('npc_1', `${A}characters/npc/npc_1.webp?v=20261002-unified-v1`, { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('npc_2', `${A}characters/npc/npc_2.webp?v=20261002-unified-v1`, { frameWidth: 192, frameHeight: 192 });
    for (let i = 0; i < 10; i++) this.load.image(`skill_${i}`, A + `icons/skills/skill_${i}.webp`);
    ELEMENTAL_SKILLS.forEach(skill => this.load.image(skill.icon, A + `icons/skills/unique/${skill.id}.webp`));

    ['beast_pelt', 'beast_fur', 'beast_claw', 'beast_blood', 'beast_horn', 'herb', 'ore'].forEach(m => this.load.image(`mat_${m}`, A + `icons/materials/${m}.webp`));
    for (let h = 1; h <= 7; h++) this.load.image(`herb_${h}`, A + `icons/materials/herb_${h}.webp`);
    ['silver', 'spirit_stone_low', 'spirit_stone_mid', 'spirit_stone_high', 'spirit_stone_top'].forEach(c => this.load.image(`curr_${c}`, A + `icons/currencies/${c}.webp`));
    ['pill_heal', 'pill_cultivation', 'pill_breakthrough', 'pill_golden'].forEach(p => this.load.image(`icon_${p}`, A + `icons/pills/${p}.webp`));
    ['manual_hoang', 'manual_huyen', 'manual_dia', 'manual_thien', 'manual_than'].forEach(m => this.load.image(`icon_${m}`, A + `icons/manuals/${m}.webp`));
    for (let i = 0; i < 12; i++) this.load.image(`stage_${i}`, A + `icons/stages/stage_${i}.webp`);
    ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest'].forEach(icon => this.load.image(`ui_${icon}`, A + `icons/ui/${icon}.webp`));
    ['bag', 'realm', 'skills', 'sect', 'craft', 'map', 'attack', 'auto', 'gold'].forEach(icon => this.load.image(`xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.webp`));
    this.load.image('hud_skin', A + 'ui/hud_skin.webp');
    this.load.image('hud_portrait', A + 'ui/hud_portrait.webp');
    this.load.image('human_realm_atlas', A + 'ui/map/human_realm_atlas.webp');

    const elemDirs = { hoa: 'fire', loi: 'lightning', kim: 'metal', thuy: 'water', phong: 'wind', moc: 'wood', tho: 'earth', ly: 'physical' };
    Object.entries(elemDirs).forEach(([elemKey, dirName]) => {
      this.load.image(`vfx_${elemKey}_1`, `${A}vfx/elemental/${dirName}/proj_1.webp`);
      for (let f = 0; f < 8; f++) this.load.image(`vfx_${elemKey}_1_${f}`, `${A}vfx/elemental/${dirName}/frame_${f}.webp`);
      this.load.image(`vfx_${elemKey}_2`, `${A}vfx/elemental/${dirName}/proj_2.webp`);
      this.load.image(`vfx_${elemKey}_3`, `${A}vfx/elemental/${dirName}/array_3.webp`);
      this.load.image(`vfx_${elemKey}_4`, `${A}vfx/elemental/${dirName}/swarm_4.webp`);
      this.load.image(`vfx_${elemKey}_5`, `${A}vfx/elemental/${dirName}/colossus_5.webp`);
      this.load.image(`vfx_${elemKey}_shockwave`, `${A}vfx/elemental/${dirName}/shockwave.webp`);
      this.load.image(`vfx_${elemKey}_impact`, `${A}vfx/elemental/${dirName}/impact.webp`);
    });

    for (let i = 0; i < 8; i++) {
      this.load.image(`vfx_kim_1_${i}`, `${A}vfx/sword/kim_1_frame_${i}.webp`);
      this.load.image(`vfx_kim_2_${i}`, `${A}vfx/sword/kim_2_frame_${i}.webp`);
    }
    this.load.image('vfx_kim_3_0', `${A}vfx/sword/kim_3_frame_0.webp`);
    this.load.image('vfx_tru_tien_shockwave', `${A}vfx/sword/tru_tien_shockwave.webp`);
    this.load.image('vfx_sword_impact_frame7', `${A}vfx/atlas/frame_7.webp`);
    this.load.image('vfx_impact_frame7', `${A}vfx/atlas/frame_7.webp`);
    this.load.image('vfx_sword_kiem_khi', `${A}vfx/sword/kiem_khi.webp`);
    this.load.image('vfx_giant_tru_tien_sword', `${A}vfx/sword/giant_tru_tien_sword.webp`);
    this.load.image('vfx_loi', `${A}vfx/sword/vfx_loi.webp`);
    this.load.image('vfx_heal', A + 'vfx/skills/vfx_heal.webp');
    this.load.image('vfx_shield', A + 'vfx/skills/vfx_shield.webp');
    this.load.image('vfx_speed', A + 'vfx/skills/vfx_speed.webp');
    this.load.image('vfx_divine', A + 'vfx/ultimates/vfx_divine.webp');
    this.load.spritesheet('vfx', A + 'vfx/atlas/vfx_atlas.webp', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    window.__ACTIVE_PHASER_SCENE__ = this;
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
      if (this.lastModalClosedAt && (Date.now() - this.lastModalClosedAt < 350)) return;
      if (p.y < 70 || p.y > (this.skillsVisible ? H - 225 : H - 140) || p.x > W - 60) return;
      const targetX = p.worldX ?? (p.x + this.cameras.main.scrollX);
      const targetY = p.worldY ?? (p.y + this.cameras.main.scrollY);
      this.moveTarget = {
        x: Phaser.Math.Clamp(targetX, this.field.left, this.field.right),
        y: Phaser.Math.Clamp(targetY, this.field.top, this.field.bottom)
      };
    });
    this.time.addEvent({ delay: 1000, callback: this.onSecondTick, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 200, callback: () => this.updateMinimap(), loop: true });
    this.time.addEvent({ delay: 30000, callback: () => { try { exportSaveCode(); } catch (e) {} }, loop: true });
    this.time.delayedCall(250, () => this.openWelcomeScreenModal());
    window.__GAME_BOOT__?.ready();
  }

  update(time, delta) {
    if (!this.player || !this.player.body || this.dead) return;
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

    const isTrucCoOrAbove = this.isPlayerFlyingRealm ? this.isPlayerFlyingRealm() : (Number(gameState.realmIdx) || 0) >= 13;
    let baseSpeed = isTrucCoOrAbove ? 265 : 175;
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

      // Player Auto scans for a target at only 3 Hz. Movement and combat response still run every frame.
      const PLAYER_AUTO_SCAN_MS = 1000 / 3;
      if (this.__autoPlayerMode !== mode) {
        this.__autoPlayerMode = mode;
        this.__autoPlayerTarget = null;
        this.__nextAutoPlayerScanAt = 0;
      }

      let target = this.__autoPlayerTarget;
      if (!target || !target.active || target.isDead || !target.visible) {
        target = null;
        this.__autoPlayerTarget = null;
      }

      if (mode !== 'rush' && time >= Number(this.__nextAutoPlayerScanAt || 0)) {
        this.__nextAutoPlayerScanAt = time + PLAYER_AUTO_SCAN_MS;
        target = mode === 'march'
          ? this.nearestEnemy(480, true)
          : this.nearestEnemy(3000, false);
        this.__autoPlayerTarget = target || null;
      }

      if (mode === 'rush') {
        this.__autoPlayerTarget = null;
        vx = baseSpeed; this.player.setFlipX(false);
      } else if (mode === 'march') {
        vx = baseSpeed * 0.85; this.player.setFlipX(false);
        if (target && target.active && target.x >= this.player.x - 50) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          let casted = false;
          if (gameState.afkSettings?.autoSkill && !isAttacking) {
            for (const sId of gameState.equippedSkillIds) {
              if (!sId || this.activeSkillCds[sId] > 0) continue;
              if (sId === 'basic_attack' && dist > 115) continue;
              this.castSkill(sId);
              casted = true;
              break;
            }
          }
          const hasBasicEquipped = gameState.equippedSkillIds.includes('basic_attack');
          if (!casted && hasBasicEquipped && dist <= 115 && !isAttacking) {
            this.basicAttack();
          }
        }
      } else if (target && target.active) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
        const onScreen = this.isEnemyOnScreen ? this.isEnemyOnScreen(target, 20) : dist <= 420;
        let casted = false;
        if (gameState.afkSettings?.autoSkill && onScreen && !isAttacking) {
          for (const sId of gameState.equippedSkillIds) {
            if (!sId || this.activeSkillCds[sId] > 0) continue;
            if (sId === 'basic_attack' && dist > 120) continue;
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
            if (!isAttacking) {
              const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
              vx = Math.cos(angle) * baseSpeed;
              vy = Math.sin(angle) * baseSpeed;
            }
          } else {
            vx = 0; vy = 0;
            this.player.setFlipX(target.x < this.player.x);
            if (hasBasicEquipped && dist <= 125 && !isAttacking) this.basicAttack();
          }
        }
      }
    } else if (!gameState.autoFight) {
      this.__autoPlayerTarget = null;
      this.__autoPlayerMode = null;
      this.__nextAutoPlayerScanAt = 0;
    }
    if (isAttacking) { vx = 0; vy = 0; }

    // Smooth acceleration/deceleration so 12-frame locomotion does not snap between states.
    const currentVx = Number(this.player.body.velocity.x) || 0;
    const currentVy = Number(this.player.body.velocity.y) || 0;
    const targetMoving = Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01;
    let responseMs = targetMoving ? (isTrucCoOrAbove ? 72 : 88) : 118;
    if (isAttacking) responseMs = 42;
    const blend = 1 - Math.exp(-Math.max(1, delta) / responseMs);
    let appliedVx = Phaser.Math.Linear(currentVx, vx, blend);
    let appliedVy = Phaser.Math.Linear(currentVy, vy, blend);
    if (!targetMoving && Math.abs(appliedVx) < 2) appliedVx = 0;
    if (!targetMoving && Math.abs(appliedVy) < 2) appliedVy = 0;
    this.player.setVelocity(appliedVx, appliedVy);

    this.player.x = Phaser.Math.Clamp(this.player.x, this.field.left, this.field.right);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.field.top, this.field.bottom);
    const playerScale = 0.72 * this.perspective(this.player.y);
    this.player.setScale(playerScale).setDepth(Math.floor(this.player.y));
    if (this.playerShadow) this.playerShadow.setPosition(this.player.x, this.player.y + 32 * playerScale).setScale(playerScale).setAlpha(0.45).setDepth(Math.max(1, Math.floor(this.player.y) - 1));

    const isMoving = Math.abs(appliedVx) > 7 || Math.abs(appliedVy) > 7;
    if (this.time.now >= (this.attackUntil || 0)) {
      if (Math.abs(appliedVx) > 7) this.player.setFlipX(appliedVx < 0);
      if (this.player.anims) this.player.anims.timeScale = 1;
      if (isTrucCoOrAbove) {
        // Trúc Cơ trở lên: idle khi đứng yên, fly khi di chuyển.
        this.player.play(isMoving ? 'p_fly' : 'p_idle', true);
      } else {
        // Dưới Trúc Cơ: chỉ idle/run.
        this.player.play(isMoving ? 'p_run' : 'p_idle', true);
      }
    }
    this.updateFellowNpcs(time, delta);

    // Enemy AI "thinks" at 3 Hz while movement/animation still update every frame.
    // Reuse one shared target snapshot so every enemy does not rebuild the same candidate list.
    const ENEMY_AI_TICK_MS = 1000 / 3;
    const shouldRefreshEnemyAi = time >= Number(this.__nextEnemyAiTickAt || 0);
    if (shouldRefreshEnemyAi) {
      this.__nextEnemyAiTickAt = time + ENEMY_AI_TICK_MS;
      const candidates = [{ type: 'player', x: this.player.x, y: this.player.y, ref: this.player }];

      const partyFollowers = this.partyFollowers || [];
      for (let i = 0; i < partyFollowers.length; i++) {
        const f = partyFollowers[i];
        if (f && !f.isDead && f.sprite?.visible && f.sprite?.active) {
          candidates.push({ type: 'party_follower', x: f.sprite.x, y: f.sprite.y, ref: f });
        }
      }

      const fellowNpcs = this.fellowNpcs || [];
      for (let i = 0; i < fellowNpcs.length; i++) {
        const n = fellowNpcs[i];
        if (n && !n.isDead && n.sprite?.visible && n.sprite?.active) {
          candidates.push({ type: 'fellow_npc', x: n.sprite.x, y: n.sprite.y, ref: n });
        }
      }

      const mapNpcs = this.npcsGroup || [];
      for (let i = 0; i < mapNpcs.length; i++) {
        const n = mapNpcs[i];
        if (n?.container?.active && n.container.visible) {
          candidates.push({ type: 'map_npc', x: n.container.x, y: n.container.y, ref: n });
        }
      }

      this.__enemyTargetCandidates = candidates;
    }

    const enemyTargetCandidates = this.__enemyTargetCandidates || [];

    // Entity labels / HP bars do not need full frame-rate updates.
    // Keep gameplay movement every frame, but move attached enemy UI at 20 Hz.
    const ENEMY_UI_TICK_MS = 50;
    const shouldUpdateEnemyUi = time >= Number(this.__nextEnemyUiTickAt || 0);
    if (shouldUpdateEnemyUi) this.__nextEnemyUiTickAt = time + ENEMY_UI_TICK_MS;

    const CULL_RANGE_X = 950;
    const isIso = (this.worldH || 0) > 1500;
    const enemiesCopy = this.enemies;
    for (let i = 0; i < enemiesCopy.length; i++) {
      const enemy = enemiesCopy[i];
      if (!enemy || !enemy.active || enemy.isDead) continue;
      const outOfRange = isIso ? (Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y) > 1100) : (Math.abs(enemy.x - this.player.x) > CULL_RANGE_X);
      if (outOfRange) {
        if (enemy.visible) {
          enemy.setVisible(false);
          if (enemy.body) { enemy.body.enable = false; enemy.setVelocity(0, 0); }
          enemy.hpBar?.setVisible(false);
          enemy.hpBg?.setVisible(false);
          enemy.nameText?.setVisible(false);
          enemy.__forceUiSync = true;
        }
        continue;
      }
      if (!enemy.visible) {
        enemy.setVisible(true);
        if (enemy.body) enemy.body.enable = true;
        enemy.hpBar?.setVisible(true);
        enemy.hpBg?.setVisible(true);
        enemy.nameText?.setVisible(true);
        enemy.__forceUiSync = true;
      }
      if (!enemy.body) continue;

      const pScale = (enemy.baseEnemyScale || 0.50) * this.perspective(enemy.y);
      const enemyDepth = Math.floor(enemy.y);

      // Avoid redundant sprite setters when perspective/depth did not materially change.
      if (!Number.isFinite(enemy.__lastRenderScale) || Math.abs(enemy.__lastRenderScale - pScale) > 0.002) {
        enemy.setScale(pScale);
        enemy.__lastRenderScale = pScale;
      }
      if (enemy.__lastRenderDepth !== enemyDepth) {
        enemy.setDepth(enemyDepth);
        enemy.__lastRenderDepth = enemyDepth;
      }

      if (enemy.hpBar?.active && (shouldUpdateEnemyUi || enemy.__forceUiSync)) {
        const uiX = enemy.x;
        const uiY = enemy.y;
        const moved = !Number.isFinite(enemy.__lastUiX)
          || Math.abs(enemy.__lastUiX - uiX) > 0.5
          || Math.abs(enemy.__lastUiY - uiY) > 0.5
          || Math.abs(Number(enemy.__lastUiScale || 0) - pScale) > 0.002
          || enemy.__lastUiDepth !== enemyDepth;

        if (moved || enemy.__forceUiSync) {
          enemy.hpBg.setPosition(uiX, uiY - 36 * pScale).setDepth(enemyDepth + 1);
          enemy.hpBar.setPosition(uiX - (enemy.barW || 36) / 2, uiY - 36 * pScale).setDepth(enemyDepth + 2);
          enemy.nameText.setPosition(uiX, uiY - 47 * pScale).setDepth(enemyDepth + 3);
          enemy.__lastUiX = uiX;
          enemy.__lastUiY = uiY;
          enemy.__lastUiScale = pScale;
          enemy.__lastUiDepth = enemyDepth;
        }
        enemy.__forceUiSync = false;
      }

      let nearestTarget = enemy.__aiTarget || null;

      // Target selection is throttled; squared distance avoids a sqrt for every candidate.
      if (shouldRefreshEnemyAi || !nearestTarget) {
        let bestTarget = null;
        let bestDistSq = Number.POSITIVE_INFINITY;
        for (let c = 0; c < enemyTargetCandidates.length; c++) {
          const candidate = enemyTargetCandidates[c];
          const dx = candidate.x - enemy.x;
          const dy = candidate.y - enemy.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < bestDistSq) {
            bestDistSq = distSq;
            bestTarget = candidate;
          }
        }
        enemy.__aiTarget = bestTarget;
        nearestTarget = bestTarget;
      }

      // Read the selected target's live position each frame so movement stays smooth.
      let targetX = 0, targetY = 0, targetValid = false;
      if (nearestTarget?.type === 'player') {
        targetValid = !!(this.player?.active && !this.dead);
        if (targetValid) { targetX = this.player.x; targetY = this.player.y; }
      } else if (nearestTarget?.type === 'party_follower') {
        const f = nearestTarget.ref;
        targetValid = !!(f && !f.isDead && f.sprite?.active && f.sprite.visible);
        if (targetValid) { targetX = f.sprite.x; targetY = f.sprite.y; }
      } else if (nearestTarget?.type === 'fellow_npc') {
        const n = nearestTarget.ref;
        targetValid = !!(n && !n.isDead && n.sprite?.active && n.sprite.visible);
        if (targetValid) { targetX = n.sprite.x; targetY = n.sprite.y; }
      } else if (nearestTarget?.type === 'map_npc') {
        const n = nearestTarget.ref;
        targetValid = !!(n?.container?.active && n.container.visible);
        if (targetValid) { targetX = n.container.x; targetY = n.container.y; }
      }

      if (!targetValid) {
        enemy.__aiTarget = null;
        nearestTarget = null;
      } else {
        // Keep x/y fresh because existing projectile/attack code expects them on the target wrapper.
        nearestTarget.x = targetX;
        nearestTarget.y = targetY;
      }

      const minTargetDist = nearestTarget ? Math.hypot(targetX - enemy.x, targetY - enemy.y) : 999999;

      let evx = 0, evy = 0;
      let isEnemyAttacking = this.time.now < (enemy.attackUntil || 0);

      if (nearestTarget && minTargetDist < 500) {
        if (!isEnemyAttacking) enemy.setFlipX(targetX < enemy.x);
        const skillId = enemy.equippedSkillId || enemy.skillId || 'basic_attack';
        const skillDef = ELEMENTAL_SKILLS.find(s => s.id === skillId) || ELEMENTAL_SKILLS[0];
        const atkRange = skillDef.range || (skillDef.id === 'basic_attack' ? 115 : 240);
        const approachDist = Math.max(70, atkRange - 35);

        if (minTargetDist > approachDist && !isEnemyAttacking) {
          const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
          evx = Math.cos(angle) * (enemy.speed || 58);
          evy = Math.sin(angle) * (enemy.speed || 58);
        }

        if (minTargetDist <= atkRange) {
          if (enemy.atkTimer === undefined) {
            enemy.atkTimer = 450;
          }
          enemy.atkTimer -= delta;
          if (enemy.atkTimer <= 0 && this.time.now >= (enemy.attackUntil || 0)) {
            const nextCooldown = enemy.attackInterval || (1600 + Math.random() * 400);
            enemy.atkTimer = nextCooldown;
            this.enemyAttack(enemy, nearestTarget, nextCooldown);
            isEnemyAttacking = true;
          }
        } else {
          if (enemy.atkTimer === undefined || enemy.atkTimer > 600) {
            enemy.atkTimer = 400;
          }
        }
      } else if (!isEnemyAttacking) {
        enemy.roamTimer = (enemy.roamTimer || 2000) - delta;
        if (enemy.roamTimer <= 0) {
          if (enemy.roamState === 'idle') { enemy.roamState = 'walk'; enemy.roamTimer = 1500 + Math.random() * 2000; const dHomeX = (enemy.homeX || enemy.x) - enemy.x; enemy.roamVx = Math.abs(dHomeX) > 120 ? (dHomeX > 0 ? 1 : -1) * Phaser.Math.Between(20, 35) : Phaser.Math.Between(-30, 30); enemy.roamVy = Phaser.Math.Between(-20, 20); }
          else { enemy.roamState = 'idle'; enemy.roamTimer = 1200 + Math.random() * 1500; enemy.roamVx = 0; enemy.roamVy = 0; }
        }
        evx = enemy.roamVx || 0; evy = enemy.roamVy || 0; if (evx !== 0) enemy.setFlipX(evx < 0);
      }

      if (this.time.now < (enemy.attackUntil || 0)) {
        isEnemyAttacking = true;
      }

      if (isEnemyAttacking) { evx = 0; evy = 0; }
      enemy.setVelocity(evx, evy);
      enemy.x = Phaser.Math.Clamp(enemy.x, this.field.left, this.field.right);
      enemy.y = Phaser.Math.Clamp(enemy.y, this.field.top, this.field.bottom);

      if (!isEnemyAttacking && this.time.now >= (enemy.attackUntil || 0)) {
        if (enemy.anims && enemy.anims.timeScale !== 1) {
          enemy.anims.timeScale = 1;
        }
        const moving = Math.abs(evx) > 3 || Math.abs(evy) > 3;
        const pfx = enemy.isFlying ? ('e_enemy_fly_' + enemy.enemySpriteNum) : ('e_enemy_' + enemy.enemySpriteNum);
        const animKey = pfx + (moving ? '_run' : '_idle');
        if ((enemy.anims?.currentAnim?.key !== animKey || !enemy.anims?.isPlaying) && this.anims.exists(animKey)) {
          enemy.play(animKey, true);
        }
      }
    }

    if (this.updateHerbs) this.updateHerbs(time, delta);
    if (Phaser.Input.Keyboard.JustDown(this.keys.F) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) { if (gameState.equippedSkillIds[0]) this.castSkill(gameState.equippedSkillIds[0]); else this.basicAttack(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE) && gameState.equippedSkillIds[0]) this.castSkill(gameState.equippedSkillIds[0]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO) && gameState.equippedSkillIds[1]) this.castSkill(gameState.equippedSkillIds[1]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE) && gameState.equippedSkillIds[2]) this.castSkill(gameState.equippedSkillIds[2]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FOUR) && gameState.equippedSkillIds[3]) this.castSkill(gameState.equippedSkillIds[3]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FIVE) && gameState.equippedSkillIds[4]) this.castSkill(gameState.equippedSkillIds[4]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.SIX) && gameState.equippedSkillIds[5]) this.castSkill(gameState.equippedSkillIds[5]);
  }

  createAnimations() {
    const make = (key, tex, start, end, rate, repeat = -1, yoyo = false) => { if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start, end }), frameRate: rate, repeat, yoyo }); };
    make('p_idle', 'player_idle', 0, 11, 11, -1);
    make('p_run', 'player_run', 0, 11, 12, -1);
    make('p_attack', 'player_attack', 0, 39, 45, 0);
    make('p_fly', 'player_fly', 0, 11, 15, -1);
    make('p_fly_attack', 'player_fly_attack', 0, 11, 24, 0);
    for (let i = 1; i <= 16; i++) {
      make(`e_enemy_${i}_idle`, `enemy_${i}`, 0, 3, 6, -1);
      make(`e_enemy_${i}_run`, `enemy_${i}`, 0, 3, 8, -1);
      make(`e_enemy_${i}_attack`, `enemy_${i}`, 4, 15, 12, 0);
    }
    for (let i = 1; i <= 10; i++) {
      make(`e_enemy_fly_${i}_idle`, `enemy_fly_${i}`, 0, 3, 6, -1);
      make(`e_enemy_fly_${i}_run`, `enemy_fly_${i}`, 0, 3, 8, -1);
      make(`e_enemy_fly_${i}_attack`, `enemy_fly_${i}`, 4, 15, 12, 0);
    }
    const makeNpcAnim = (prefix, tex) => {
      make(`${prefix}_idle`, tex, 0, 3, 6, -1);
      make(`${prefix}_run`, tex, 4, 7, 8, -1);
      make(`${prefix}_attack`, tex, 8, 25, 18, 0);
      make(`${prefix}_fly`, tex, 26, 39, 10, -1);
    };
    makeNpcAnim('npc_1', 'npc_1');
    makeNpcAnim('npc_warrior', 'npc_1');
    makeNpcAnim('npc_2', 'npc_2');
    makeNpcAnim('dai_han', 'npc_1');
    makeNpcAnim('tho_san', 'npc_2');
    for (let i = 1; i <= 20; i++) {
      makeNpcAnim(`npc_fly_${i}`, (i % 2 === 0) ? 'npc_2' : 'npc_1');
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
