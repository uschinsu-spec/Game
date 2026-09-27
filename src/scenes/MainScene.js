/**
 * MainScene.js  —  Core Scene (Orchestrator)
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
    this.gameplayStarted = false;
  }

  preload() {
    const A = './assets/';
    const loadedPanoramaKeys = new Set();
    ALL_MAPS.forEach(map => {
      if (map.panoramaAsset && !loadedPanoramaKeys.has(map.panoramaKey)) {
        this.load.image(map.panoramaKey, A + map.panoramaAsset);
        loadedPanoramaKeys.add(map.panoramaKey);
      }
    });
    this.load.image('flying_sword', A + 'player/flying_sword.png');
    this.load.spritesheet('player_idle', A + 'player/player_idle.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_run', A + 'player/player_run.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_attack', A + 'player/player_attack.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_fly', A + 'player/player_fly.png', { frameWidth: 128, frameHeight: 128 });
    for (let i = 1; i <= 16; i++) {
      this.load.image(`enemy_${i}_idle_0`, `${A}enemies/enemy_${i}/idle_0.png`);
      this.load.image(`enemy_${i}_idle_1`, `${A}enemies/enemy_${i}/idle_1.png`);
      for (let r = 0; r < 4; r++) this.load.image(`enemy_${i}_run_${r}`, `${A}enemies/enemy_${i}/run_${r}.png`);
      for (let a = 0; a < 4; a++) this.load.image(`enemy_${i}_attack_${a}`, `${A}enemies/enemy_${i}/attack_${a}.png`);
    }
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
    for (let n = 1; n <= 16; n++) this.load.image(`npc_${n}`, `${A}npc/npc_${n}.png`);
    for (let i = 0; i < 10; i++) this.load.image(`skill_${i}`, A + `icons/skills/skill_${i}.png`);
    ELEMENTAL_SKILLS.forEach(skill => this.load.image(skill.icon, A + `icons/skills/unique/${skill.id}.png`));
    for (let i = 0; i < 18; i++) this.load.image(`item_${i}`, A + `icons/items/item_${i}.png`);
    ['beast_pelt','beast_fur','beast_claw','beast_blood','beast_horn','herb','ore'].forEach(m => this.load.image(`mat_${m}`, A + `icons/materials/${m}.png`));
    for (let h = 1; h <= 7; h++) this.load.image(`herb_${h}`, A + `icons/materials/herb_${h}.png`);
    ['silver','spirit_stone_low','spirit_stone_mid','spirit_stone_high','spirit_stone_top'].forEach(c => this.load.image(`curr_${c}`, A + `icons/currencies/${c}.png`));
    ['pill_heal','pill_cultivation','pill_breakthrough','pill_golden'].forEach(p => this.load.image(`icon_${p}`, A + `icons/pills/${p}.png`));
    ['manual_hoang','manual_huyen','manual_dia','manual_thien','manual_than'].forEach(m => this.load.image(`icon_${m}`, A + `icons/manuals/${m}.png`));
    for (let i = 0; i < 12; i++) this.load.image(`stage_${i}`, A + `icons/stages/stage_${i}.png`);
    ['bag','realm','skills','auto','settings','close','map','gold','pill','quest'].forEach(icon => this.load.image(`ui_${icon}`, A + `icons/ui/${icon}.png`));
    ['bag','realm','skills','sect','craft','map','attack','auto','gold'].forEach(icon => this.load.image(`xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.png`));
    const elemDirs = { hoa:'fire', loi:'lightning', kim:'metal', thuy:'water', phong:'wind', moc:'wood', tho:'earth', ly:'physical' };
    Object.entries(elemDirs).forEach(([elemKey, dirName]) => {
      this.load.image(`vfx_${elemKey}_1`, `${A}vfx/${dirName}/proj_1.png`);
      for (let f = 0; f < 8; f++) this.load.image(`vfx_${elemKey}_1_${f}`, `${A}vfx/${dirName}/frame_${f}.png`);
      this.load.image(`vfx_${elemKey}_2`, `${A}vfx/${dirName}/proj_2.png`);
      this.load.image(`vfx_${elemKey}_3`, `${A}vfx/${dirName}/array_3.png`);
      this.load.image(`vfx_${elemKey}_4`, `${A}vfx/${dirName}/swarm_4.png`);
      this.load.image(`vfx_${elemKey}_5`, `${A}vfx/${dirName}/colossus_5.png`);
      this.load.image(`vfx_${elemKey}_shockwave`, `${A}vfx/${dirName}/shockwave.png`);
      this.load.image(`vfx_${elemKey}_impact`, `${A}vfx/${dirName}/impact.png`);
    });
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
    this.load.image('vfx_heal', A + 'vfx/skills/vfx_heal.png');
    this.load.image('vfx_shield', A + 'vfx/skills/vfx_shield.png');
    this.load.image('vfx_speed', A + 'vfx/skills/vfx_speed.png');
    this.load.image('vfx_divine', A + 'vfx/ultimates/vfx_divine.png');
    this.load.spritesheet('vfx', A + 'vfx/vfx_atlas.png', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    this.createAnimations();
    this.modalLayer = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,F,Q,E,SPACE,ONE,TWO,THREE,FOUR,FIVE,ESC,T');
    this.input.keyboard.on('keydown-ESC', () => this.closeModal());
    this.input.keyboard.on('keydown-T', () => { if (this.gameplayStarted) this.toggleMeditation(); });

    this.input.on('pointerdown', (p, currentlyOver = []) => {
      if (!this.gameplayStarted) return;
      if (this.isModalOpen && this.isModalOpen()) return;
      if (currentlyOver && currentlyOver.length > 0) return;
      if (p.y < 155 || p.y > H - 145 || p.x > W - 58) return;
      this.moveTarget = {
        x: Phaser.Math.Clamp(p.x + this.cameras.main.scrollX, this.field.left, this.field.right),
        y: Phaser.Math.Clamp(p.y, this.field.top, this.field.bottom)
      };
    });

    this.openWelcomeScreenModal();
  }

  startGameplayFromState({ forceVillage = false } = {}) {
    if (this.gameplayStarted) return;
    if (forceVillage) gameState.currentMapId = 0;
    this.applyMapRuntimeConfig(gameState.currentMapId ?? 0);
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
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
    this.initBattlefield();
    this.initFellowNpcs();
    this.initHerbs();
    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerHp = this.playerHpMax;
    this.gameplayStarted = true;
    this.time.addEvent({ delay: 1000, callback: this.onSecondTick, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 200, callback: () => this.updateMinimap(), loop: true });
    this.time.addEvent({ delay: 30000, callback: () => { try { exportSaveCode(); } catch (e) {} }, loop: true });
    this.updateHUD();
  }

  update(time, delta) {
    if (!this.gameplayStarted) return;
    if (!this.player || !this.player.body || this.dead) return;

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

    let baseSpeed = 175;
    if (this.isFlyingSword) baseSpeed = 265;
    if (this.isDashing) baseSpeed = 520;
    let vx = 0, vy = 0;

    if (this.joy.active) {
      vx = this.joy.x * baseSpeed;
      vy = this.joy.y * baseSpeed;
      this.moveTarget = null;
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
        vx = Math.cos(angle) * baseSpeed;
        vy = Math.sin(angle) * baseSpeed;
      } else {
        const onArriveCb = this.moveTarget.onArrive;
        this.moveTarget = null;
        if (onArriveCb && typeof onArriveCb === 'function') onArriveCb();
      }
    }

    const isAttacking = (this.time.now < (this.attackUntil || 0));
    if (gameState.autoFight && !this.joy.active && !this.moveTarget && vx === 0 && vy === 0) {
      const mode = gameState.autoMode || 'farm';
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
      if (mode === 'rush') {
        if (gameState.afkSettings?.autoFly && !this.isFlyingSword) this.isFlyingSword = true;
        vx = baseSpeed; vy = 0; this.player.setFlipX(false);
      } else if (mode === 'march') {
        vx = baseSpeed * 0.85; vy = 0; this.player.setFlipX(false);
        const target = this.nearestEnemy(480, true);
        if (target && target.active && target.x >= this.player.x - 50) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          let castedSkill = false;
          if (gameState.afkSettings?.autoSkill && !isAttacking) {
            for (let i = 0; i < gameState.equippedSkillIds.length; i++) {
              const sId = gameState.equippedSkillIds[i];
              if (sId && !(this.activeSkillCds[sId] > 0)) {
                if (this.isFlyingSword) this.isFlyingSword = false;
                this.castSkill(sId); castedSkill = true; break;
              }
            }
          }
          if (!castedSkill && dist <= 115 && !isAttacking) {
            if (this.isFlyingSword) this.isFlyingSword = false;
            this.basicAttack();
          }
        }
      } else if (this.enemies.length > 0) {
        const target = this.nearestEnemy(3000, false);
        if (target && target.active) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          const isTargetOnScreen = this.isEnemyOnScreen ? this.isEnemyOnScreen(target, 20) : (dist <= 420);
          let castedSkill = false;
          if (gameState.afkSettings?.autoSkill && isTargetOnScreen && dist <= 420 && !isAttacking) {
            for (let i = 0; i < gameState.equippedSkillIds.length; i++) {
              const sId = gameState.equippedSkillIds[i];
              if (sId && !(this.activeSkillCds[sId] > 0)) {
                if (this.isFlyingSword) this.isFlyingSword = false;
                this.player.setFlipX(target.x < this.player.x);
                this.castSkill(sId); castedSkill = true; break;
              }
            }
          }
          if (!castedSkill) {
            if (dist > 220) {
              if (gameState.afkSettings?.autoFly && !this.isFlyingSword) this.isFlyingSword = true;
              if (!isAttacking) {
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
                vx = Math.cos(angle) * baseSpeed; vy = Math.sin(angle) * baseSpeed;
              }
            } else {
              if (this.isFlyingSword) this.isFlyingSword = false;
              if (!isAttacking) this.basicAttack();
            }
          }
        }
      }
    }

    this.player.setVelocity(vx, vy);
    this.player.x = Phaser.Math.Clamp(this.player.x, this.field.left, this.field.right);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.field.top, this.field.bottom);
    if (!isAttacking) {
      const moving = Math.abs(vx) > 3 || Math.abs(vy) > 3;
      if (moving) {
        this.player.setFlipX(vx < 0);
        this.player.play(this.isFlyingSword ? 'p_fly' : 'p_run', true);
      } else {
        this.player.play(this.isFlyingSword ? 'p_fly' : 'p_idle', true);
      }
    }

    if (this.updateEnemies) this.updateEnemies(time, delta);
    if (this.updateFellowNpcs) this.updateFellowNpcs(time, delta);
    if (this.updateHerbs) this.updateHerbs(time, delta);

    if (Phaser.Input.Keyboard.JustDown(this.keys.F) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.basicAttack();
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.performDash();
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.toggleFlyingSword();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE) && gameState.equippedSkillIds[0]) this.castSkill(gameState.equippedSkillIds[0]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO) && gameState.equippedSkillIds[1]) this.castSkill(gameState.equippedSkillIds[1]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE) && gameState.equippedSkillIds[2]) this.castSkill(gameState.equippedSkillIds[2]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FOUR) && gameState.equippedSkillIds[3]) this.castSkill(gameState.equippedSkillIds[3]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FIVE) && gameState.equippedSkillIds[4]) this.castSkill(gameState.equippedSkillIds[4]);
  }

  createAnimations() {
    const make = (key, tex, start, end, rate, repeat = -1) => {
      if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start, end }), frameRate: rate, repeat });
    };
    make('p_idle','player_idle',0,7,8);
    make('p_run','player_run',0,7,12);
    make('p_attack','player_attack',0,7,15,0);
    make('p_fly','player_fly',0,7,10);
    for (let i = 1; i <= 16; i++) {
      const t = 'enemy_' + i;
      if (!this.anims.exists('e_' + t + '_idle')) this.anims.create({ key:'e_' + t + '_idle', frames:[{key:`${t}_idle_0`},{key:`${t}_idle_1`}], frameRate:4, repeat:-1 });
      if (!this.anims.exists('e_' + t + '_run')) this.anims.create({ key:'e_' + t + '_run', frames:[0,1,2,3].map(r=>({key:`${t}_run_${r}`})), frameRate:8, repeat:-1 });
      if (!this.anims.exists('e_' + t + '_attack')) this.anims.create({ key:'e_' + t + '_attack', frames:[0,1,2,3].map(a=>({key:`${t}_attack_${a}`})), frameRate:10, repeat:0 });
    }
    ['dai_han','tho_san'].forEach(npcType => {
      if (!this.anims.exists(`${npcType}_idle`)) this.anims.create({ key:`${npcType}_idle`, frames:[1,2,3,4,5,6,7,8].map(f=>({key:`${npcType}_idle_${f}`})), frameRate:8, repeat:-1 });
      if (!this.anims.exists(`${npcType}_run`)) this.anims.create({ key:`${npcType}_run`, frames:[1,2,3,4,5,6,7,8].map(f=>({key:`${npcType}_run_${f}`})), frameRate:12, repeat:-1 });
      if (!this.anims.exists(`${npcType}_attack`)) this.anims.create({ key:`${npcType}_attack`, frames:[1,2,3,4,5,6,7,8].map(f=>({key:`${npcType}_attack_${f}`})), frameRate:14, repeat:0 });
    });
    ['hoa','loi','kim','thuy','phong','moc','tho','ly'].forEach(elemKey => {
      const animKey = `anim_vfx_${elemKey}_1`;
      if (!this.anims.exists(animKey)) this.anims.create({ key:animKey, frames:[0,1,2,3,4,5,6].map(f=>({key:`vfx_${elemKey}_1_${f}`})), frameRate:9, repeat:-1 });
    });
    if (!this.anims.exists('anim_vfx_kim_1')) this.anims.create({ key:'anim_vfx_kim_1', frames:[0,1,2,3,4,5,6].map(f=>({key:`vfx_kim_1_${f}`})), frameRate:9, repeat:-1 });
    if (!this.anims.exists('anim_vfx_kiem_1')) this.anims.create({ key:'anim_vfx_kiem_1', frames:[0,1,2,3,4,5,6].map(f=>({key:`vfx_kim_1_${f}`})), frameRate:9, repeat:-1 });
    if (!this.anims.exists('anim_vfx_kim_2_fly')) this.anims.create({ key:'anim_vfx_kim_2_fly', frames:[0,1].map(f=>({key:`vfx_kim_2_${f}`})), frameRate:8, repeat:-1 });
    if (!this.anims.exists('anim_vfx_kim_2_hit')) this.anims.create({ key:'anim_vfx_kim_2_hit', frames:[2,3,4,5,6,7].map(f=>({key:`vfx_kim_2_${f}`})), frameRate:14, repeat:0 });
  }

  applyMapRuntimeConfig(mapId) {
    const map = getMapById(mapId);
    this.currentMap = map;
    this.worldW = map.worldWidth || 2880;
    this.worldH = map.worldHeight || H;
    this.field = { ...(map.field || { left:60, right:this.worldW - 60, top:350, bottom:900 }) };
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
    if (map.noRepeat || map.isPeaceZone || map.worldWidth <= 2880) this.bg = this.add.image(this.worldW / 2, this.worldH / 2, panoramaKey).setDisplaySize(this.worldW, this.worldH).setDepth(-10);
    else this.bg = this.add.tileSprite(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, panoramaKey).setDepth(-10);
  }

  switchMap(mapId, spawnX, spawnY) {
    const map = this.applyMapRuntimeConfig(mapId);
    gameState.currentMapId = map.id;
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    if (this.bg) this.bg.destroy();
    const panoramaKey = this.getMapPanoramaKey(map);
    if (map.noRepeat || map.isPeaceZone || map.worldWidth <= 2880) this.bg = this.add.image(this.worldW / 2, this.worldH / 2, panoramaKey).setDisplaySize(this.worldW, this.worldH).setDepth(-10);
    else this.bg = this.add.tileSprite(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, panoramaKey).setDepth(-10);
    const sx = spawnX ?? map.spawn?.x ?? 350;
    const sy = spawnY ?? map.spawn?.y ?? 620;
    if (this.player) this.player.setPosition(sx, sy).setVelocity(0, 0);
    this.moveTarget = null;
    this.createNpcs();
    this.createMapPortals();
    this.initBattlefield();
    this.initFellowNpcs();
    this.initHerbs();
    this.updateHUD();
    return map;
  }

  createMapPortals() {
    if (this.activePortals) this.activePortals.forEach(p => { if (p.container) p.container.destroy(); });
    this.activePortals = [];
    const curMapId = gameState.currentMapId;
    const portalDefs = [];
    if (curMapId === 0) portalDefs.push({ x:270,y:865,signOffsetY:-115,targetMapId:1,targetSpawnX:350,targetSpawnY:620,title:'THANH VÂN NGOẠI VI',sub:'✦ CỔNG NAM • BÃI SĂN YÊU TÂN THỦ ✦',minRealm:0 });
    else if (curMapId === 1) {
      portalDefs.push({ x:250,y:620,targetMapId:0,targetSpawnX:270,targetSpawnY:760,title:'THANH VÂN THÔN',sub:'QUAY VỀ THÔN LÀNG AN TOÀN',minRealm:0 });
      portalDefs.push({ x:this.worldW - 350,y:620,targetMapId:2,targetSpawnX:350,targetSpawnY:620,title:'VẠN MỘC SÂM LÂM',sub:'LỐI VÀO CỔ MỘC BÍ CẢNH',minRealm:2 });
    } else if (curMapId === 2) {
      portalDefs.push({ x:250,y:620,targetMapId:1,targetSpawnX:31500,targetSpawnY:620,title:'THANH VÂN NGOẠI VI',sub:'QUAY VỀ NGOẠI VI',minRealm:0 });
      portalDefs.push({ x:this.worldW - 350,y:620,targetMapId:3,targetSpawnX:350,targetSpawnY:620,title:'HUYẾT LẠC CẤM ĐỊA',sub:'TIẾN VÀO NHỊ PHẨM CẤM KHU',minRealm:4 });
    } else if (curMapId === 3) portalDefs.push({ x:250,y:620,targetMapId:2,targetSpawnX:31500,targetSpawnY:620,title:'VẠN MỘC SÂM LÂM',sub:'QUAY VỀ CỔ MỘC',minRealm:2 });

    portalDefs.forEach(def => {
      const container = this.add.container(def.x, def.y).setDepth(Math.floor(def.y) - 5);
      const groundGfx = this.add.graphics();
      groundGfx.setScale(1.25, 0.46);
      const rainbowColors = [0x00ffff,0xff00ff,0xffd700,0x00ff88,0x9d4edd,0xff6b00];
      for (let r = 92; r >= 20; r -= 14) { const c = rainbowColors[(r / 14) % rainbowColors.length]; groundGfx.lineStyle(3,c,0.75); groundGfx.strokeCircle(0,0,r); }
      groundGfx.fillStyle(0x00ffff,0.18); groundGfx.fillCircle(0,0,96);
      container.add(groundGfx);
      const groundHit = this.add.ellipse(0,0,240,90,0x00ffff,0.001).setInteractive({ useHandCursor:true });
      groundHit.on('pointerdown', pointer => { if (pointer?.event) pointer.event.stopPropagation(); this.triggerPortalTeleport(def); });
      container.add(groundHit);
      const signContainer = this.add.container(0, def.signOffsetY ?? -225);
      const signBg = this.add.graphics(); signBg.fillStyle(0x061426,0.9); signBg.fillRoundedRect(-145,-34,290,68,14); signBg.lineStyle(2.5,0x00ffff,0.95); signBg.strokeRoundedRect(-145,-34,290,68,14); signContainer.add(signBg);
      const titleTxt = this.add.text(0,-12,`🌀 ${def.title} 🌀`,{fontFamily:'sans-serif',fontSize:'17px',fontStyle:'bold',color:'#ffffff',stroke:'#003366',strokeThickness:4,align:'center'}).setOrigin(0.5);
      const subTxt = this.add.text(0,14,`[ ${def.sub} ]`,{fontFamily:'sans-serif',fontSize:'10.5px',fontStyle:'bold',color:'#66ffcc',stroke:'#000000',strokeThickness:2,align:'center'}).setOrigin(0.5);
      const hitZone = this.add.rectangle(0,0,300,74,0x00ffff,0.001).setInteractive({ useHandCursor:true });
      hitZone.on('pointerdown', pointer => { if (pointer?.event) pointer.event.stopPropagation(); this.triggerPortalTeleport(def); });
      signContainer.add([titleTxt,subTxt,hitZone]); container.add(signContainer);
      this.activePortals.push({ ...def, container });
    });
  }

  getPortalCooldownKey(fromMapId, toMapId) { return `portal_${fromMapId}_${toMapId}`; }

  triggerPortalTeleport(portal) {
    if (portal.minRealm && gameState.realmIdx < portal.minRealm) {
      this.showFloatingText(this.player.x, this.player.y - 70, `Tu vi chưa đủ! Cần cảnh giới [${REALMS[portal.minRealm]?.name || 'cao hơn'}] để bước vào Tiên Môn!`, '#ff5555', '14px');
      return;
    }
    const PORTAL_COOLDOWN_MS = 5000;
    if (!this.portalCooldowns) this.portalCooldowns = {};
    const fromMap = gameState.currentMapId;
    const toMap = portal.targetMapId;
    const cdKey = this.getPortalCooldownKey(fromMap, toMap);
    const now = Date.now();
    const remaining = PORTAL_COOLDOWN_MS - (now - (this.portalCooldowns[cdKey] || 0));
    if (remaining > 0) {
      this.showFloatingText(this.player.x, this.player.y - 70, `⏳ Hãy đợi thêm ${Math.ceil(remaining / 1000)}s trước khi quay lại ${portal.title}!`, '#facc15', '13px');
      return;
    }
    this.portalCooldowns[this.getPortalCooldownKey(toMap, fromMap)] = now;
    this.cameras.main.flash(450,230,255,255);
    this.showFloatingText(this.player.x, this.player.y - 80, `✨ TIẾN NHẬP: ${portal.title} ✨`, '#00ffff', '18px');
    this.time.delayedCall(150, () => this.switchMap(portal.targetMapId, portal.targetSpawnX, portal.targetSpawnY));
  }
}

Object.assign(MainGameScene.prototype, HudMixin);
Object.assign(MainGameScene.prototype, CombatMixin);
Object.assign(MainGameScene.prototype, EnemyMixin);
Object.assign(MainGameScene.prototype, PlayerMixin);
Object.assign(MainGameScene.prototype, ModalMixin);
Object.assign(MainGameScene.prototype, NpcMixin);
Object.assign(MainGameScene.prototype, FellowNpcMixin);
Object.assign(MainGameScene.prototype, HerbsMixin);
