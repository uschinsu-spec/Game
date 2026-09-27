/**
 * MainScene.js  —  Core Scene (Orchestrator)
 * ============================================
 * Chỉ chứa: constructor, preload, create, update, switchMap, createAnimations.
 * Mọi logic nghiệp vụ được tách vào các Mixin module riêng biệt:
 *
 *   mixins/HudMixin.js     — HUD, Nav, Skill Bar, AFK, Joystick, Minimap
 *   mixins/CombatMixin.js  — basicAttack, castSkill, VFX, damage, gainExp
 *   mixins/EnemyMixin.js   — initBattlefield, spawnOneEnemy, killEnemy, AI
 *   mixins/PlayerMixin.js  — createPlayer, stats, dash, flyingSword, utilities
 *   mixins/ModalMixin.js   — 7 panel UI (Map, Skill, Sect, Crafting, Gear, etc.)
 */
import { REALMS } from '../config/realmsData.js';
import { ALL_MAPS, getMapById } from '../config/regionsData.js';
import { gameState } from '../state/gameState.js';
import { ELEMENTAL_SKILLS } from '../config/skillsData.js';
import { W, H } from './constants.js';

import { HudMixin } from './mixins/HudMixin.js';
import { CombatMixin } from './mixins/CombatMixin.js';
import { EnemyMixin } from './mixins/EnemyMixin.js';
import { PlayerMixin } from './mixins/PlayerMixin.js';
import { ModalMixin } from './mixins/ModalMixin.js';
import { NpcMixin } from './mixins/NpcMixin.js';
import { FellowNpcMixin } from './mixins/FellowNpcMixin.js';
import { HerbsMixin } from './mixins/HerbsMixin.js';
import { exportSaveCode } from '../state/saveSystem.js';

// Re-export constants for backward compatibility (main.js imports W, H from here)
export { W, H } from './constants.js';

// ================================================================
// Mix all modules into MainGameScene prototype
// ================================================================
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

  // ----------------------------------------------------------------
  // PRELOAD — Tải toàn bộ assets
  // ----------------------------------------------------------------
  preload() {
    const A = './assets/';

    // 1. Map panoramas
    const loadedPanoramaKeys = new Set();
    ALL_MAPS.forEach(map => {
      if (map.panoramaAsset && !loadedPanoramaKeys.has(map.panoramaKey)) {
        this.load.image(map.panoramaKey, A + map.panoramaAsset);
        loadedPanoramaKeys.add(map.panoramaKey);
      }
    });

    // 2. Player
    this.load.image('flying_sword', A + 'player/flying_sword.png');
    this.load.spritesheet('player_idle',   A + 'player/player_idle.png',   { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_run',    A + 'player/player_run.png',    { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_attack', A + 'player/player_attack.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_fly',    A + 'player/player_fly.png',    { frameWidth: 128, frameHeight: 128 });

    // 3. Enemies (1..16) - Tải từng frame riêng biệt từ thư mục của mỗi enemy
    for (let i = 1; i <= 16; i++) {
      this.load.image(`enemy_${i}_idle_0`, `${A}enemies/enemy_${i}/idle_0.png`);
      this.load.image(`enemy_${i}_idle_1`, `${A}enemies/enemy_${i}/idle_1.png`);
      for (let r = 0; r < 4; r++) {
        this.load.image(`enemy_${i}_run_${r}`, `${A}enemies/enemy_${i}/run_${r}.png`);
      }
      for (let a = 0; a < 4; a++) {
        this.load.image(`enemy_${i}_attack_${a}`, `${A}enemies/enemy_${i}/attack_${a}.png`);
      }
    }

    // 3b. Fellow Player/Hunter NPCs (Dai_Han_Dao & Tho_San_Riu)
    for (let f = 1; f <= 8; f++) {
      const pad = String(f).padStart(2, '0');
      this.load.image(`dai_han_idle_${f}`, `${A}player/NPC/Dai_Han_Dao/dai_han_3d_idle_${pad}.png`);
      this.load.image(`dai_han_run_${f}`, `${A}player/NPC/Dai_Han_Dao/dai_han_3d_run_${pad}.png`);
      this.load.image(`dai_han_attack_${f}`, `${A}player/NPC/Dai_Han_Dao/dai_han_3d_attack_${pad}.png`);
      this.load.image(`dai_han_fly_${f}`, `${A}player/NPC/Dai_Han_Dao/dai_han_3d_fly_${pad}.png`);

      this.load.image(`tho_san_idle_${f}`, `${A}player/NPC/Tho_San_Riu/tho_san_riu_3d_idle_${pad}.png`);
      this.load.image(`tho_san_run_${f}`, `${A}player/NPC/Tho_San_Riu/tho_san_riu_3d_run_${pad}.png`);
      this.load.image(`tho_san_attack_${f}`, `${A}player/NPC/Tho_San_Riu/tho_san_riu_3d_attack_${pad}.png`);
      this.load.image(`tho_san_fly_${f}`, `${A}player/NPC/Tho_San_Riu/tho_san_riu_3d_fly_${pad}.png`);
    }

    // 3c. Village & World NPC Sprites (16 Unique 3D Characters)
    for (let n = 1; n <= 16; n++) {
      this.load.image(`npc_${n}`, `${A}npc/npc_${n}.png`);
    }

    // 4. Skill icons
    for (let i = 0; i < 10; i++) this.load.image(`skill_${i}`, A + `icons/skills/skill_${i}.png`);
    ELEMENTAL_SKILLS.forEach(skill => this.load.image(skill.icon, A + `icons/skills/unique/${skill.id}.png`));

    // 5. Item & Equipment icons
    for (let i = 0; i < 18; i++) this.load.image(`item_${i}`, A + `icons/items/item_${i}.png`);

    // 5b. Materials, Currencies, Pills & Manuals (HD Xianxia Icons)
    ['beast_pelt', 'beast_fur', 'beast_claw', 'beast_blood', 'beast_horn', 'herb', 'ore'].forEach(m => {
      this.load.image(`mat_${m}`, A + `icons/materials/${m}.png`);
    });
    for (let h = 1; h <= 7; h++) {
      this.load.image(`herb_${h}`, A + `icons/materials/herb_${h}.png`);
    }
    ['silver', 'spirit_stone_low', 'spirit_stone_mid', 'spirit_stone_high', 'spirit_stone_top'].forEach(c => {
      this.load.image(`curr_${c}`, A + `icons/currencies/${c}.png`);
    });
    ['pill_heal', 'pill_cultivation', 'pill_breakthrough', 'pill_golden'].forEach(p => {
      this.load.image(`icon_${p}`, A + `icons/pills/${p}.png`);
    });
    ['manual_hoang', 'manual_huyen', 'manual_dia', 'manual_thien', 'manual_than'].forEach(m => {
      this.load.image(`icon_${m}`, A + `icons/manuals/${m}.png`);
    });

    // 6. Map stage icons
    for (let i = 0; i < 12; i++) this.load.image(`stage_${i}`, A + `icons/stages/stage_${i}.png`);

    // 7. UI icons
    ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest'].forEach(icon => {
      this.load.image(`ui_${icon}`, A + `icons/ui/${icon}.png`);
    });
    ['bag', 'realm', 'skills', 'sect', 'craft', 'map', 'attack', 'auto', 'gold'].forEach(icon => {
      this.load.image(`xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.png`);
    });

    // 8. Elemental VFX — từng frame Luyện Khí nằm trong thư mục mỗi hệ.
    const elemDirs = {
      'hoa': 'fire', 'loi': 'lightning', 'kim': 'metal', 'thuy': 'water',
      'phong': 'wind', 'moc': 'wood', 'tho': 'earth', 'ly': 'physical'
    };
    Object.entries(elemDirs).forEach(([elemKey, dirName]) => {
      this.load.image(`vfx_${elemKey}_1`, `${A}vfx/${dirName}/proj_1.png`);
      for (let f = 0; f < 8; f++) {
        this.load.image(`vfx_${elemKey}_1_${f}`, `${A}vfx/${dirName}/frame_${f}.png`);
      }
      this.load.image(`vfx_${elemKey}_2`, `${A}vfx/${dirName}/proj_2.png`);
      this.load.image(`vfx_${elemKey}_3`, `${A}vfx/${dirName}/array_3.png`);
      this.load.image(`vfx_${elemKey}_4`, `${A}vfx/${dirName}/swarm_4.png`);
      this.load.image(`vfx_${elemKey}_5`, `${A}vfx/${dirName}/colossus_5.png`);
      this.load.image(`vfx_${elemKey}_shockwave`, `${A}vfx/${dirName}/shockwave.png`);
      this.load.image(`vfx_${elemKey}_impact`, `${A}vfx/${dirName}/impact.png`);
    });

    // 8b. Custom Sword System VFX (Kim / Kiếm Hệ - Flat Directory)
    for (let i = 0; i < 8; i++) {
      this.load.image(`vfx_kim_1_${i}`, `${A}vfx/sword/kim_1_frame_${i}.png`);
      this.load.image(`vfx_kim_2_${i}`, `${A}vfx/sword/kim_2_frame_${i}.png`);
    }
    this.load.image('vfx_kim_3_0', `${A}vfx/sword/kim_3_frame_0.png`);
    this.load.image('vfx_tru_tien_shockwave', `${A}vfx/sword/tru_tien_shockwave.png`);
    this.load.image('vfx_sword_impact_frame7', `${A}vfx/frame_7.png`);
    this.load.image('vfx_impact_frame7', `${A}vfx/frame_7.png`);
    this.load.image('vfx_sword_kiem_khi', `${A}vfx/sword/kiem_khi.png`);
    this.load.image('vfx_giant_tru_tien_sword', `${A}vfx/sword/giant_tru_tien_sword.png`);
    this.load.image('vfx_loi', `${A}vfx/sword/vfx_loi.png`);

    // 8c. Special VFX
    this.load.image('vfx_heal',   A + 'vfx/skills/vfx_heal.png');
    this.load.image('vfx_shield', A + 'vfx/skills/vfx_shield.png');
    this.load.image('vfx_speed',  A + 'vfx/skills/vfx_speed.png');
    this.load.image('vfx_divine', A + 'vfx/ultimates/vfx_divine.png');

    // 9. VFX Atlas (pool-based basic hit effects)
    this.load.spritesheet('vfx', A + 'vfx/vfx_atlas.png', { frameWidth: 128, frameHeight: 128 });
  }

  // ----------------------------------------------------------------
  // CREATE — Khởi tạo scene
  // ----------------------------------------------------------------
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
    this.enemyProjectiles  = this.physics.add.group({ maxSize: 30 });
    this.createVfxPool();

    // UI
    this.createTopHUD();
    this.createAfkBanner();
    this.createBottomNav();
    this.createSkillBar();
    this.createDynamicTouchControls();
    this.createSideToggleButtons();
    this.createMinimap();

    this.modalLayer = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);

    this.initBattlefield();
    this.initFellowNpcs();
    this.initHerbs();

    // Keyboard controls (PC)
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,F,Q,E,SPACE,ONE,TWO,THREE,FOUR,FIVE,ESC,T');
    this.input.keyboard.on('keydown-ESC', () => this.closeModal());
    this.input.keyboard.on('keydown-T', () => this.toggleMeditation());

    // Tap-to-move
    this.input.on('pointerdown', (p, currentlyOver = []) => {
      if (this.isModalOpen && this.isModalOpen()) return;
      // UI must always win over world/tap-to-move input. Phaser passes every
      // interactive object under the pointer in currentlyOver.
      if (currentlyOver && currentlyOver.length > 0) return;
      // Reserve the complete fixed HUD / skill / menu zones on mobile.
      if (p.y < 155 || p.y > H - 145 || p.x > W - 58) return;
      this.moveTarget = {
        x: Phaser.Math.Clamp(p.x + this.cameras.main.scrollX, this.field.left, this.field.right),
        y: Phaser.Math.Clamp(p.y, this.field.top, this.field.bottom)
      };
    });

    // 1-second tick (passive cultivation, garden)
    this.time.addEvent({ delay: 1000, callback: this.onSecondTick, callbackScope: this, loop: true });

    // Minimap refresh every 200ms
    this.time.addEvent({ delay: 200, callback: () => this.updateMinimap(), loop: true });

    // Tự động lưu game định kỳ mỗi 30s vào LocalStorage
    this.time.addEvent({
      delay: 30000,
      callback: () => {
        try {
          exportSaveCode();
        } catch (e) {}
      },
      loop: true
    });

    // Hiển thị bảng Khởi Đầu Game (Tạo Nhân Vật Mới / Nhập Mã Lưu Game)
    this.time.delayedCall(250, () => {
      this.openWelcomeScreenModal();
    });
  }

  // ----------------------------------------------------------------
  // UPDATE — Main gameplay loop
  // ----------------------------------------------------------------
  update(time, delta) {
    if (!this.player || !this.player.body || this.dead) return;

    // 0. Map Portal Detection & Teleportation
    if (this.activePortals && this.activePortals.length > 0) {
      if ((this.portalCooldownUntil || 0) <= time) {
        for (const portal of this.activePortals) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, portal.x, portal.y);
          if (dist <= 100) {
            this.portalCooldownUntil = time + 3500;
            this.triggerPortalTeleport(portal);
            break;
          }
        }
      }
    }

    // 1. Skill Cooldown countdown
    for (const sId in this.activeSkillCds) {
      if (this.activeSkillCds[sId] > 0) {
        this.activeSkillCds[sId] -= delta;
        if (this.activeSkillCds[sId] <= 0) delete this.activeSkillCds[sId];
      }
    }
    if (this.skillSlots) {
      this.skillSlots.forEach(slot => {
        if (slot.skillId && slot.cdOverlay && slot.cdText) {
          const cd = this.activeSkillCds[slot.skillId] || 0;
          if (cd > 0) {
            slot.cdOverlay.setVisible(true);
            const skillDef = ELEMENTAL_SKILLS.find(s => s.id === slot.skillId);
            slot.cdText.setText((skillDef?.cd === 0) ? '' : (cd / 1000).toFixed(1) + 's');
          } else {
            slot.cdOverlay.setVisible(false);
            slot.cdText.setText('');
          }
        }
      });
    }

    // 2. Movement speed
    let baseSpeed = 175;
    if (this.isFlyingSword) baseSpeed = 265;
    if (this.isDashing) baseSpeed = 520;

    let vx = 0, vy = 0;

    // 3. Input: Joystick / WASD / Tap-to-move
    if (this.joy.active) {
      vx = this.joy.x * baseSpeed;
      vy = this.joy.y * baseSpeed;
      this.moveTarget = null;
    } else {
      if (this.keys.A.isDown || this.keys.LEFT.isDown)  vx -= baseSpeed;
      if (this.keys.D.isDown || this.keys.RIGHT.isDown) vx += baseSpeed;
      if (this.keys.W.isDown || this.keys.UP.isDown)    vy -= baseSpeed;
      if (this.keys.S.isDown || this.keys.DOWN.isDown)  vy += baseSpeed;
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
        vx = Math.cos(angle) * baseSpeed;
        vy = Math.sin(angle) * baseSpeed;
      } else {
        const onArriveCb = this.moveTarget.onArrive;
        this.moveTarget = null;
        if (onArriveCb && typeof onArriveCb === 'function') {
          onArriveCb();
        }
      }
    }

    const isAttacking = (this.time.now < (this.attackUntil || 0));

    // 4. AFK Smart AI Combat
    if (gameState.autoFight && !this.joy.active && !this.moveTarget && vx === 0 && vy === 0) {
      const mode = gameState.autoMode || 'farm'; // 'farm' | 'march' | 'rush'

      // Auto-survival dash when HP is low
      if (gameState.afkSettings?.autoSurvivalDash && (this.playerHp < this.playerHpMax * 0.35) && (this.time.now >= this.lastDash + this.dashCd)) {
        this.performDash();
        const healPill = 'Cuu Chuyen Hoan Hon Dan';
        if (gameState.inventory.pills[healPill] > 0) {
          gameState.inventory.pills[healPill]--;
          this.playerHp = Math.min(this.playerHpMax, this.playerHp + Math.floor(this.playerHpMax * 0.5));
          this.showFloatingText(this.player.x, this.player.y - 60, 'Tu can Dan Duoc hoi 50% HP!', '#66ffaa');
          this.updateHUD();
        }
      }

      // ================================================================
      // CHẾ ĐỘ 1: RUSH (Chạy thẳng về phía trước, không đánh quái)
      // ================================================================
      if (mode === 'rush') {
        if (gameState.afkSettings?.autoFly && !this.isFlyingSword) {
          this.isFlyingSword = true;
        }
        vx = baseSpeed;
        vy = 0;
        this.player.setFlipX(false);
      }
      // ================================================================
      // CHẾ ĐỘ 2: MARCH (Vừa đánh vừa tiến về phía trước)
      // ================================================================
      else if (mode === 'march') {
        // Luôn duy trì hướng tiến về phía trước (bên phải map)
        vx = baseSpeed * 0.85;
        vy = 0;
        this.player.setFlipX(false);

        const target = this.nearestEnemy(480, true);
        if (target && target.active && target.x >= this.player.x - 50) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);

          // 1. Ranged skill check (bắn thẳng về phía quái trước mặt)
          let castedSkill = false;
          if (gameState.afkSettings?.autoSkill && !isAttacking) {
            for (let i = 0; i < gameState.equippedSkillIds.length; i++) {
              const sId = gameState.equippedSkillIds[i];
              if (sId && !(this.activeSkillCds[sId] > 0)) {
                if (this.isFlyingSword) this.isFlyingSword = false;
                this.castSkill(sId);
                castedSkill = true;
                break;
              }
            }
          }

          // 2. Nếu quái ở cự ly cận chiến (dist <= 115px), chém thường quét sạch
          if (!castedSkill && dist <= 115 && !isAttacking) {
            if (this.isFlyingSword) this.isFlyingSword = false;
            this.basicAttack();
          }
        }
      }
      // ================================================================
      // CHẾ ĐỘ 3: FARM (Tự tìm & tiêu diệt quái lân cận truyền thống)
      // ================================================================
      else if (this.enemies.length > 0) {
        const target = this.nearestEnemy(3000, false);
        if (target && target.active) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          const isTargetOnScreen = this.isEnemyOnScreen ? this.isEnemyOnScreen(target, 20) : (dist <= 420);

          // 1. Ranged Skill check (Cast skills ONLY when enemy is visible on screen)
          let castedSkill = false;
          if (gameState.afkSettings?.autoSkill && isTargetOnScreen && dist <= 420 && !isAttacking) {
            for (let i = 0; i < gameState.equippedSkillIds.length; i++) {
              const sId = gameState.equippedSkillIds[i];
              if (sId && !(this.activeSkillCds[sId] > 0)) {
                if (this.isFlyingSword) this.isFlyingSword = false;
                this.player.setFlipX(target.x < this.player.x);
                this.castSkill(sId);
                castedSkill = true;
                break;
              }
            }
          }

          if (!castedSkill) {
            if (dist > 220) {
              // Sprint to target
              if (gameState.afkSettings?.autoFly && !this.isFlyingSword) {
                this.isFlyingSword = true;
              }
              if (!isAttacking) {
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
                vx = Math.cos(angle) * baseSpeed;
                vy = Math.sin(angle) * baseSpeed;
              }
            } else if (dist > 85) {
              // Approach
              if (this.isFlyingSword) this.isFlyingSword = false;
              if (!isAttacking) {
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
                vx = Math.cos(angle) * (baseSpeed * 0.9);
                vy = Math.sin(angle) * (baseSpeed * 0.9);
              }
            } else {
              // Melee range: stand, face, basic attack
              if (this.isFlyingSword) this.isFlyingSword = false;
              vx = 0; vy = 0;
              this.player.setFlipX(target.x < this.player.x);
              if (!isAttacking) this.basicAttack();
            }
          }
        }
      }
    }

    if (isAttacking) { vx = 0; vy = 0; }

    // 5. Apply movement
    this.player.setVelocity(vx, vy);
    this.player.x = Phaser.Math.Clamp(this.player.x, this.field.left, this.field.right);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.field.top, this.field.bottom);

    // 6. Player visual — perspective scale
    const playerScale = 0.72 * this.perspective(this.player.y);
    this.player.setScale(playerScale).setDepth(Math.floor(this.player.y));

    if (this.playerShadow) {
      this.playerShadow.setPosition(this.player.x, this.player.y + 32 * playerScale)
        .setScale(playerScale).setAlpha(0.45);
    }

    // 7. Player animation
    const isMoving = (Math.abs(vx) > 5 || Math.abs(vy) > 5);
    if (this.time.now >= (this.attackUntil || 0)) {
      if (vx !== 0) this.player.setFlipX(vx < 0);
      if (this.isFlyingSword) {
        this.player.play('p_fly', true);
      } else {
        this.player.play(isMoving ? 'p_run' : 'p_idle', true);
      }
    }

    // 8. Update Fellow Cultivator / Hunter NPCs AI
    this.updateFellowNpcs(time, delta);

    // 9. Enemy AI update with Proximity Culling (<950px) and Home Territory Anchoring
    const CULL_RANGE_X = 950;
    const playerX = this.player.x;
    const playerY = this.player.y;
    const enemiesCopy = this.enemies;

    for (let i = 0; i < enemiesCopy.length; i++) {
      const enemy = enemiesCopy[i];
      if (!enemy || !enemy.active || enemy.isDead) continue;

      const distToPlayerX = Math.abs(enemy.x - playerX);

      // 8a. Tối ưu hóa: Khi ở xa (>950px), ẩn hoàn toàn và tắt physics
      if (distToPlayerX > CULL_RANGE_X) {
        if (enemy.visible) {
          enemy.setVisible(false);
          if (enemy.body) {
            enemy.body.enable = false;
            enemy.setVelocity(0, 0);
          }
          if (enemy.hpBar) enemy.hpBar.setVisible(false);
          if (enemy.hpBg) enemy.hpBg.setVisible(false);
          if (enemy.nameText) enemy.nameText.setVisible(false);
        }
        continue; // Bỏ qua toàn bộ tính toán AI quái ngoài tầm nhìn
      }

      // 8b. Khi người chơi lại gần (<950px), bật lại hiển thị và kích hoạt AI
      if (!enemy.visible) {
        enemy.setVisible(true);
        if (enemy.body) enemy.body.enable = true;
        if (enemy.hpBar) enemy.hpBar.setVisible(true);
        if (enemy.hpBg) enemy.hpBg.setVisible(true);
        if (enemy.nameText) enemy.nameText.setVisible(true);
      }

      if (!enemy.body) continue;

      const pScale = (enemy.baseEnemyScale || 0.50) * this.perspective(enemy.y);
      enemy.setScale(pScale).setDepth(Math.floor(enemy.y));

      if (enemy.hpBar && enemy.hpBar.active) {
        enemy.hpBg.setPosition(enemy.x, enemy.y - 36 * pScale).setDepth(Math.floor(enemy.y) + 1);
        enemy.hpBar.setPosition(enemy.x - (enemy.barW || 36) / 2, enemy.y - 36 * pScale).setDepth(Math.floor(enemy.y) + 2);
        enemy.nameText.setPosition(enemy.x, enemy.y - 47 * pScale).setDepth(Math.floor(enemy.y) + 3);
      }

      // Enemy repulsion (chỉ tính với các quái lân cận đang hiển thị)
      let repX = 0, repY = 0;
      for (let j = 0; j < enemiesCopy.length; j++) {
        if (i === j) continue;
        const other = enemiesCopy[j];
        if (!other || !other.active || other.isDead || !other.visible) continue;
        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y);
        if (d < 38 && d > 0) {
          const push = (38 - d) / 38 * 18;
          repX += ((enemy.x - other.x) / d) * push;
          repY += ((enemy.y - other.y) / d) * push;
        }
      }

      // Quét tìm mục tiêu gần nhất trong tầm (Player hoặc Đồng Đạo NPC / Hiệp Khách Tổ Đội / Map NPC)
      let nearestTarget = null;
      let minTargetDist = 999999;

      // 1. Player
      if (this.player && this.player.active && !this.dead) {
        const dP = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dP < minTargetDist) {
          minTargetDist = dP;
          nearestTarget = { type: 'player', x: this.player.x, y: this.player.y, ref: this.player };
        }
      }

      // 2. Party Followers (Hiệp Khách Trong Đội)
      if (this.partyFollowers && this.partyFollowers.length > 0) {
        for (let fi = 0; fi < this.partyFollowers.length; fi++) {
          const f = this.partyFollowers[fi];
          if (f && !f.isDead && f.sprite && f.sprite.visible && f.sprite.active) {
            const dF = Phaser.Math.Distance.Between(enemy.x, enemy.y, f.sprite.x, f.sprite.y);
            if (dF < minTargetDist) {
              minTargetDist = dF;
              nearestTarget = { type: 'party_follower', x: f.sprite.x, y: f.sprite.y, ref: f };
            }
          }
        }
      }

      // 3. Fellow NPCs (Tán Tu Tự Do Trên Map)
      if (this.fellowNpcs && this.fellowNpcs.length > 0) {
        for (let ni = 0; ni < this.fellowNpcs.length; ni++) {
          const npc = this.fellowNpcs[ni];
          if (npc && !npc.isDead && npc.sprite && npc.sprite.visible && npc.sprite.active) {
            const dN = Phaser.Math.Distance.Between(enemy.x, enemy.y, npc.sprite.x, npc.sprite.y);
            if (dN < minTargetDist) {
              minTargetDist = dN;
              nearestTarget = { type: 'fellow_npc', x: npc.sprite.x, y: npc.sprite.y, ref: npc };
            }
          }
        }
      }

      // 4. Map NPCs (NPC Thôn/Thương Hội gần đó)
      if (this.npcsGroup && this.npcsGroup.length > 0) {
        for (let mi = 0; mi < this.npcsGroup.length; mi++) {
          const mNpc = this.npcsGroup[mi];
          if (mNpc && mNpc.container && mNpc.container.active && mNpc.container.visible) {
            const dM = Phaser.Math.Distance.Between(enemy.x, enemy.y, mNpc.container.x, mNpc.container.y);
            if (dM < minTargetDist) {
              minTargetDist = dM;
              nearestTarget = { type: 'map_npc', x: mNpc.container.x, y: mNpc.container.y, ref: mNpc };
            }
          }
        }
      }

      let evx = 0, evy = 0;
      const isEnemyAttacking = (this.time.now < (enemy.attackUntil || 0));

      if (nearestTarget && minTargetDist < 500) {
        const targetX = nearestTarget.x;
        const targetY = nearestTarget.y;
        enemy.setFlipX(targetX < enemy.x);
        
        if (enemy.isRanged) {
          if (minTargetDist > 220) {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
            evx = Math.cos(angle) * 50;
            evy = Math.sin(angle) * 50;
          } else {
            evx = 0; evy = 0;
          }
          if (minTargetDist <= 260) {
            if (enemy.atkTimer === undefined || enemy.atkTimer > 1800) enemy.atkTimer = 400;
            enemy.atkTimer -= delta;
            if (enemy.atkTimer <= 0) {
              enemy.atkTimer = 1600 + Math.random() * 800;
              this.enemyShootProjectile(enemy, nearestTarget);
            }
          }
        } else {
          if (minTargetDist > 80) {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
            evx = Math.cos(angle) * 58;
            evy = Math.sin(angle) * 58;
          } else {
            evx = 0; evy = 0;
          }
          // Melee attack triggers when within 115px
          if (minTargetDist <= 115) {
            if (enemy.atkTimer === undefined || enemy.atkTimer > 1200) enemy.atkTimer = 250;
            enemy.atkTimer -= delta;
            if (enemy.atkTimer <= 0) {
              enemy.atkTimer = 1000 + Math.random() * 400;
              this.enemyAttack(enemy, nearestTarget);
            }
          }
        }
      } else {
        // Roaming tuần tra quanh vị trí spawn cố định
        enemy.roamTimer = (enemy.roamTimer || 2000) - delta;
        if (enemy.roamTimer <= 0) {
          if (enemy.roamState === 'idle') {
            enemy.roamState = 'walk';
            enemy.roamTimer = 1500 + Math.random() * 2000;
            const dHomeX = (enemy.homeX || enemy.x) - enemy.x;
            if (Math.abs(dHomeX) > 120) {
              enemy.roamVx = (dHomeX > 0 ? 1 : -1) * Phaser.Math.Between(20, 35);
            } else {
              enemy.roamVx = Phaser.Math.Between(-30, 30);
            }
            enemy.roamVy = Phaser.Math.Between(-20, 20);
          } else {
            enemy.roamState = 'idle';
            enemy.roamTimer = 1200 + Math.random() * 1500;
            enemy.roamVx = 0; enemy.roamVy = 0;
          }
        }
        evx = enemy.roamVx || 0;
        evy = enemy.roamVy || 0;
        if (evx !== 0) enemy.setFlipX(evx < 0);
      }

      if (isEnemyAttacking) {
        evx = 0; evy = 0;
      } else {
        evx += repX; evy += repY;
      }
      enemy.setVelocity(evx, evy);
      enemy.x = Phaser.Math.Clamp(enemy.x, this.field.left, this.field.right);
      enemy.y = Phaser.Math.Clamp(enemy.y, this.field.top, this.field.bottom);

      if (!isEnemyAttacking) {
        const enemyMoving = (Math.abs(evx) > 3 || Math.abs(evy) > 3);
        const animKey = 'e_enemy_' + enemy.enemySpriteNum + (enemyMoving ? '_run' : '_idle');
        if (enemy.anims && enemy.anims.currentAnim?.key !== animKey) {
          enemy.play(animKey, true);
        }
      }
    }

    // 8. Update Fellow NPCs, Party Followers & Herbs
    if (this.updateFellowNpcs) {
      this.updateFellowNpcs(time, delta);
    }
    if (this.updateHerbs) {
      this.updateHerbs(time, delta);
    }

    // 9. PC keyboard shortcuts
    if (Phaser.Input.Keyboard.JustDown(this.keys.F) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.basicAttack();
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.performDash();
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.toggleFlyingSword();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)   && gameState.equippedSkillIds[0]) this.castSkill(gameState.equippedSkillIds[0]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)   && gameState.equippedSkillIds[1]) this.castSkill(gameState.equippedSkillIds[1]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE) && gameState.equippedSkillIds[2]) this.castSkill(gameState.equippedSkillIds[2]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FOUR)  && gameState.equippedSkillIds[3]) this.castSkill(gameState.equippedSkillIds[3]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FIVE)  && gameState.equippedSkillIds[4]) this.castSkill(gameState.equippedSkillIds[4]);
  }

  // ----------------------------------------------------------------
  // Animations
  // ----------------------------------------------------------------
  createAnimations() {
    const make = (key, tex, start, end, rate, repeat = -1) => {
      if (!this.anims.exists(key)) {
        this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start, end }), frameRate: rate, repeat });
      }
    };
    make('p_idle',   'player_idle',   0, 7, 8);
    make('p_run',    'player_run',    0, 7, 12);
    make('p_attack', 'player_attack', 0, 7, 15, 0);
    make('p_fly',    'player_fly',    0, 7, 10);
    for (let i = 1; i <= 16; i++) {
      const t = 'enemy_' + i;
      if (!this.anims.exists('e_' + t + '_idle')) {
        this.anims.create({
          key: 'e_' + t + '_idle',
          frames: [{ key: `${t}_idle_0` }, { key: `${t}_idle_1` }],
          frameRate: 4,
          repeat: -1
        });
      }
      if (!this.anims.exists('e_' + t + '_run')) {
        this.anims.create({
          key: 'e_' + t + '_run',
          frames: [0, 1, 2, 3].map(r => ({ key: `${t}_run_${r}` })),
          frameRate: 8,
          repeat: -1
        });
      }
      if (!this.anims.exists('e_' + t + '_attack')) {
        this.anims.create({
          key: 'e_' + t + '_attack',
          frames: [0, 1, 2, 3].map(a => ({ key: `${t}_attack_${a}` })),
          frameRate: 10,
          repeat: 0
        });
      }
    }

    // ----------------------------------------------------------------
    // Fellow Player/Hunter NPC Animations (Dai_Han_Dao & Tho_San_Riu)
    // ----------------------------------------------------------------
    ['dai_han', 'tho_san'].forEach(npcType => {
      if (!this.anims.exists(`${npcType}_idle`)) {
        this.anims.create({
          key: `${npcType}_idle`,
          frames: [1, 2, 3, 4, 5, 6, 7, 8].map(f => ({ key: `${npcType}_idle_${f}` })),
          frameRate: 8,
          repeat: -1
        });
      }
      if (!this.anims.exists(`${npcType}_run`)) {
        this.anims.create({
          key: `${npcType}_run`,
          frames: [1, 2, 3, 4, 5, 6, 7, 8].map(f => ({ key: `${npcType}_run_${f}` })),
          frameRate: 12,
          repeat: -1
        });
      }
      if (!this.anims.exists(`${npcType}_attack`)) {
        this.anims.create({
          key: `${npcType}_attack`,
          frames: [1, 2, 3, 4, 5, 6, 7, 8].map(f => ({ key: `${npcType}_attack_${f}` })),
          frameRate: 14,
          repeat: 0
        });
      }
    });

    // ----------------------------------------------------------------
    // Elemental Luyện Khí 7-Frame VFX Animations (Tất Cả 9 Đại Hệ)
    // ----------------------------------------------------------------
    ['hoa', 'loi', 'kim', 'thuy', 'phong', 'moc', 'tho', 'ly'].forEach(elemKey => {
      const animKey = `anim_vfx_${elemKey}_1`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: [0, 1, 2, 3, 4, 5, 6].map(f => ({ key: `vfx_${elemKey}_1_${f}` })),
          frameRate: 9,
          repeat: -1
        });
      }
    });

    if (!this.anims.exists('anim_vfx_kim_1')) {
      this.anims.create({
        key: 'anim_vfx_kim_1',
        frames: [0, 1, 2, 3, 4, 5, 6].map(f => ({ key: `vfx_kim_1_${f}` })),
        frameRate: 9,
        repeat: -1
      });
    }

    if (!this.anims.exists('anim_vfx_kiem_1')) {
      this.anims.create({
        key: 'anim_vfx_kiem_1',
        frames: [0, 1, 2, 3, 4, 5, 6].map(f => ({ key: `vfx_kim_1_${f}` })),
        frameRate: 9,
        repeat: -1
      });
    }

    if (!this.anims.exists('anim_vfx_kim_2_fly')) {
      this.anims.create({
        key: 'anim_vfx_kim_2_fly',
        frames: [0, 1].map(f => ({ key: `vfx_kim_2_${f}` })),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.anims.exists('anim_vfx_kim_2_hit')) {
      this.anims.create({
        key: 'anim_vfx_kim_2_hit',
        frames: [2, 3, 4, 5, 6, 7].map(f => ({ key: `vfx_kim_2_${f}` })),
        frameRate: 14,
        repeat: 0
      });
    }
  }

  // ----------------------------------------------------------------
  // Map Management
  // ----------------------------------------------------------------
  applyMapRuntimeConfig(mapId) {
    const map = getMapById(mapId);
    this.currentMap = map;
    this.worldW = map.worldWidth || 2880;
    this.worldH = map.worldHeight || H;
    this.field = { ...(map.field || { left: 60, right: this.worldW - 60, top: 350, bottom: 900 }) };
    return map;
  }

  getMapPanoramaKey(map = this.currentMap) {
    if (map?.panoramaKey && this.textures.exists(map.panoramaKey)) return map.panoramaKey;
    return 'map_panorama_0';
  }

  createWorld() {
    const map = this.currentMap || this.applyMapRuntimeConfig(gameState.currentMapId);
    const panoramaKey = this.getMapPanoramaKey(map);
    if (this.bg) this.bg.destroy();
    if (map.noRepeat || map.isPeaceZone || map.worldWidth <= 2880) {
      this.bg = this.add.image(this.worldW / 2, this.worldH / 2, panoramaKey)
        .setDisplaySize(this.worldW, this.worldH)
        .setDepth(-10);
    } else {
      this.bg = this.add.tileSprite(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, panoramaKey)
        .setDepth(-10);
    }
  }

  switchMap(mapId, spawnX, spawnY) {
    const map = this.applyMapRuntimeConfig(mapId);
    gameState.currentMapId = map.id;
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    if (this.bg) {
      this.bg.destroy();
    }
    const panoramaKey = this.getMapPanoramaKey(map);
    if (map.noRepeat || map.isPeaceZone || map.worldWidth <= 2880) {
      this.bg = this.add.image(this.worldW / 2, this.worldH / 2, panoramaKey)
        .setDisplaySize(this.worldW, this.worldH)
        .setDepth(-10);
    } else {
      this.bg = this.add.tileSprite(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, panoramaKey)
        .setDepth(-10);
    }
    const sx = spawnX ?? map.spawn?.x ?? 350;
    const sy = spawnY ?? map.spawn?.y ?? 620;
    if (this.player) {
      this.player.setPosition(sx, sy).setVelocity(0, 0);
    }
    this.moveTarget = null;
    this.createNpcs();
    this.createMapPortals();
    this.initBattlefield();
    this.initFellowNpcs();
    this.initHerbs();
    this.updateHUD();
    return map;
  }

  // ----------------------------------------------------------------
  // Map Portals (Cổng Truyền Tống Đa Sắc Rực Rỡ & Huyền Ảo)
  // ----------------------------------------------------------------
  createMapPortals() {
    if (this.activePortals) {
      this.activePortals.forEach(p => {
        if (p.container) p.container.destroy();
      });
    }
    this.activePortals = [];

    const curMapId = gameState.currentMapId;
    const portalDefs = [];

    if (curMapId === 0) {
      // Map 0: Thanh Vân Thôn (Thôn Làng An Toàn - Static 540x960) -> Cổng Hướng Nam đi Thanh Vân Ngoại Vi
      portalDefs.push({
        x: 270,
        y: 865,
        signOffsetY: -115,
        targetMapId: 1,
        targetSpawnX: 350,
        targetSpawnY: 620,
        title: 'THANH VÂN NGOẠI VI',
        sub: '✦ CỔNG NAM • BÃI SĂN YÊU TÂN THỦ ✦',
        minRealm: 0
      });
    } else if (curMapId === 1) {
      // Map 1: Thanh Vân Ngoại Vi -> Cổng Bắc quay về Thanh Vân Thôn
      portalDefs.push({
        x: 250,
        y: 620,
        targetMapId: 0,
        targetSpawnX: 270,
        targetSpawnY: 760,
        title: 'THANH VÂN THÔN',
        sub: 'QUAY VỀ THÔN LÀNG AN TOÀN',
        minRealm: 0
      });
      // Tận cùng Map 1 -> Tiến vào Vạn Mộc Sâm Lâm (Map 2)
      portalDefs.push({
        x: this.worldW - 350,
        y: 620,
        targetMapId: 2,
        targetSpawnX: 350,
        targetSpawnY: 620,
        title: 'VẠN MỘC SÂM LÂM',
        sub: 'LỐI VÀO CỔ MỘC BÍ CẢNH',
        minRealm: 2
      });
    } else if (curMapId === 2) {
      // Map 2: Vạn Mộc Sâm Lâm -> Quay về Thanh Vân Ngoại Vi
      portalDefs.push({
        x: 250,
        y: 620,
        targetMapId: 1,
        targetSpawnX: 31500,
        targetSpawnY: 620,
        title: 'THANH VÂN NGOẠI VI',
        sub: 'QUAY VỀ NGOẠI VI',
        minRealm: 0
      });
      // Tận cùng Map 2 -> Tiến vào Huyết Lạc Cấm Địa (Map 3)
      portalDefs.push({
        x: this.worldW - 350,
        y: 620,
        targetMapId: 3,
        targetSpawnX: 350,
        targetSpawnY: 620,
        title: 'HUYẾT LẠC CẤM ĐỊA',
        sub: 'TIẾN VÀO NHỊ PHẨM CẤM KHU',
        minRealm: 4
      });
    } else if (curMapId === 3) {
      // Map 3: Huyết Lạc Cấm Địa -> Quay về Vạn Mộc Sâm Lâm
      portalDefs.push({
        x: 250,
        y: 620,
        targetMapId: 2,
        targetSpawnX: 31500,
        targetSpawnY: 620,
        title: 'VẠN MỘC SÂM LÂM',
        sub: 'QUAY VỀ CỔ MỘC',
        minRealm: 2
      });
    }

    portalDefs.forEach(def => {
      const container = this.add.container(def.x, def.y).setDepth(Math.floor(def.y) - 5);

      // 1. Vòng Trận Pháp Mặt Đất Huyền Ảo Xoay Đa Tầng (Ground Runic Magic Arrays)
      const groundGfx = this.add.graphics();
      groundGfx.setScale(1.25, 0.46);

      const rainbowColors = [0x00ffff, 0xff00ff, 0xffd700, 0x00ff88, 0x9d4edd, 0xff6b00];
      for (let r = 92; r >= 20; r -= 14) {
        const c = rainbowColors[(r / 14) % rainbowColors.length];
        groundGfx.lineStyle(3, c, 0.75);
        groundGfx.strokeCircle(0, 0, r);
      }
      groundGfx.fillStyle(0x00ffff, 0.18);
      groundGfx.fillCircle(0, 0, 96);

      // Trận Đồ Lục Giác & Bát Quái
      groundGfx.lineStyle(2, 0xffffff, 0.85);
      for (let i = 0; i < 6; i++) {
        const a1 = (i * 60) * Math.PI / 180;
        const a2 = ((i + 2) * 60) * Math.PI / 180;
        groundGfx.lineBetween(Math.cos(a1) * 78, Math.sin(a1) * 78, Math.cos(a2) * 78, Math.sin(a2) * 78);
      }
      container.add(groundGfx);

      // Vùng chạm trực tiếp dưới mặt đất
      const groundHit = this.add.ellipse(0, 0, 240, 90, 0x00ffff, 0.001)
        .setInteractive({ useHandCursor: true });
      groundHit.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        this.triggerPortalTeleport(def);
      });
      container.add(groundHit);

      this.tweens.add({
        targets: groundGfx,
        angle: 360,
        duration: 11000,
        repeat: -1,
        ease: 'Linear'
      });

      // 2. Cột Sáng Cực Quang Phát Sáng Nhiều Màu (Multi-Colored Prismatic Light Pillars)
      const auraColors = [0x00f0ff, 0xff00cc, 0xffd700, 0x00ff88, 0xa855f7, 0xff7b00];
      auraColors.forEach((color, idx) => {
        const auraGfx = this.add.graphics();
        auraGfx.setBlendMode(Phaser.BlendModes.ADD);

        auraGfx.fillStyle(color, 0.32);
        auraGfx.fillEllipse(0, -95, 75 + idx * 10, 230 + idx * 14);
        auraGfx.fillStyle(0xffffff, 0.5);
        auraGfx.fillEllipse(0, -95, 26, 170);

        container.add(auraGfx);

        this.tweens.add({
          targets: auraGfx,
          scaleX: { from: 0.82 + idx * 0.05, to: 1.28 + idx * 0.05 },
          scaleY: { from: 0.88, to: 1.16 },
          alpha: { from: 0.28, to: 0.72 },
          duration: 1500 + idx * 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      });

      // 3. Linh Quang Tinh Tú & Đốm Sáng Bảy Sắc Cầu Vồng (Rainbow Sparkle Wisps)
      for (let s = 0; s < 14; s++) {
        const star = this.add.graphics();
        star.setBlendMode(Phaser.BlendModes.ADD);
        const starColor = rainbowColors[s % rainbowColors.length];
        star.fillStyle(starColor, 0.95);
        star.fillCircle(0, 0, Phaser.Math.Between(3, 6));
        container.add(star);

        const radiusX = Phaser.Math.Between(35, 85);
        const speed = Phaser.Math.Between(2400, 4200);

        this.tweens.add({
          targets: star,
          y: { from: 10, to: -220 },
          alpha: { from: 1, to: 0 },
          scale: { from: 1.3, to: 0.3 },
          duration: speed,
          repeat: -1,
          delay: s * 240,
          onUpdate: (tween, target) => {
            const progress = tween.getValue();
            const angle = (Date.now() / 420 + s * 1.6);
            target.x = Math.cos(angle) * (radiusX * (1 - progress * 0.25));
          }
        });
      }

      // 4. Bảng Hiệu Tiên Môn Phát Sáng Lơ Lửng (Floating Glowing Xianxia Portal Signboard)
      const signContainer = this.add.container(0, def.signOffsetY ?? -225);

      const signBg = this.add.graphics();
      signBg.fillStyle(0x061426, 0.9);
      signBg.fillRoundedRect(-145, -34, 290, 68, 14);
      signBg.lineStyle(2.5, 0x00ffff, 0.95);
      signBg.strokeRoundedRect(-145, -34, 290, 68, 14);
      signBg.lineStyle(1.5, 0xffd700, 0.85);
      signBg.strokeRoundedRect(-140, -29, 280, 58, 10);
      signContainer.add(signBg);

      const titleTxt = this.add.text(0, -12, `🌀 ${def.title} 🌀`, {
        fontFamily: 'sans-serif',
        fontSize: '17px',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#003366',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);

      const subTxt = this.add.text(0, 14, `[ ${def.sub} ]`, {
        fontFamily: 'sans-serif',
        fontSize: '10.5px',
        fontWeight: 'bold',
        color: '#66ffcc',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      }).setOrigin(0.5);

      // Chạm/Click trực tiếp vào bảng hiệu để dịch chuyển ngay lập tức
      const hitZone = this.add.rectangle(0, 0, 300, 74, 0x00ffff, 0.001)
        .setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        this.triggerPortalTeleport(def);
      });

      signContainer.add([titleTxt, subTxt, hitZone]);
      container.add(signContainer);

      this.tweens.add({
        targets: signContainer,
        y: '-=12',
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.activePortals.push({
        ...def,
        container
      });
    });
  }

  // Theo dõi thời điểm dịch chuyển gần nhất theo từng cặp bản đồ (srcMapId -> targetMapId)
  // Người chơi phải chờ PORTAL_COOLDOWN_MS trước khi được dịch chuyển quay lại
  getPortalCooldownKey(fromMapId, toMapId) {
    return `portal_${fromMapId}_${toMapId}`;
  }

  triggerPortalTeleport(portal) {
    if (portal.minRealm && gameState.realmIdx < portal.minRealm) {
      this.showFloatingText(
        this.player.x,
        this.player.y - 70,
        `Tu vi chưa đủ! Cần cảnh giới [${REALMS[portal.minRealm]?.name || 'cao hơn'}] để bước vào Tiên Môn!`,
        '#ff5555',
        '14px'
      );
      return;
    }

    // ── KIỂM TRA THỜI GIAN HỒI CỔNG (5s sau khi vừa rời bản đồ đó) ──────────
    const PORTAL_COOLDOWN_MS = 5000; // 5 giây
    if (!this.portalCooldowns) this.portalCooldowns = {};

    const fromMap = gameState.currentMapId;
    const toMap   = portal.targetMapId;
    const cdKey   = this.getPortalCooldownKey(fromMap, toMap);
    const now     = Date.now();
    const lastUsed = this.portalCooldowns[cdKey] || 0;
    const remaining = PORTAL_COOLDOWN_MS - (now - lastUsed);

    if (remaining > 0) {
      const secs = Math.ceil(remaining / 1000);
      this.showFloatingText(
        this.player.x,
        this.player.y - 70,
        `⏳ Hãy đợi thêm ${secs}s trước khi quay lại ${portal.title}!`,
        '#facc15',
        '13px'
      );
      return;
    }

    // Ghi lại thời điểm dịch chuyển vào hướng ngược lại (để khi đến nơi không thể quay lại ngay)
    const reverseCdKey = this.getPortalCooldownKey(toMap, fromMap);
    this.portalCooldowns[reverseCdKey] = now;

    // ── HIỆU ỨNG & DỊCH CHUYỂN ───────────────────────────────────────────────
    this.cameras.main.flash(450, 230, 255, 255);
    this.showFloatingText(this.player.x, this.player.y - 80, `✨ TIẾN NHẬP: ${portal.title} ✨`, '#00ffff', '18px');

    this.time.delayedCall(150, () => {
      this.switchMap(portal.targetMapId, portal.targetSpawnX, portal.targetSpawnY);
    });
  }
}

// ================================================================
// Apply Mixins to prototype
// ================================================================
Object.assign(MainGameScene.prototype, HudMixin);
Object.assign(MainGameScene.prototype, CombatMixin);
Object.assign(MainGameScene.prototype, EnemyMixin);
Object.assign(MainGameScene.prototype, PlayerMixin);
Object.assign(MainGameScene.prototype, ModalMixin);
Object.assign(MainGameScene.prototype, NpcMixin);
Object.assign(MainGameScene.prototype, FellowNpcMixin);
Object.assign(MainGameScene.prototype, HerbsMixin);
