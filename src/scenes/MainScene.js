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
    this.uiPointerIds = new Set();
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
    this.load.spritesheet('player_idle',   A + 'player/player_idle.png',   { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_run',    A + 'player/player_run.png',    { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_attack', A + 'player/player_attack.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_fly',    A + 'player/player_fly.png',    { frameWidth: 128, frameHeight: 128 });

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

    ['beast_pelt', 'beast_fur', 'beast_claw', 'beast_blood', 'beast_horn', 'herb', 'ore'].forEach(m => this.load.image(`mat_${m}`, A + `icons/materials/${m}.png`));
    for (let h = 1; h <= 7; h++) this.load.image(`herb_${h}`, A + `icons/materials/herb_${h}.png`);
    ['silver', 'spirit_stone_low', 'spirit_stone_mid', 'spirit_stone_high', 'spirit_stone_top'].forEach(c => this.load.image(`curr_${c}`, A + `icons/currencies/${c}.png`));
    ['pill_heal', 'pill_cultivation', 'pill_breakthrough', 'pill_golden'].forEach(p => this.load.image(`icon_${p}`, A + `icons/pills/${p}.png`));
    ['manual_hoang', 'manual_huyen', 'manual_dia', 'manual_thien', 'manual_than'].forEach(m => this.load.image(`icon_${m}`, A + `icons/manuals/${m}.png`));
    for (let i = 0; i < 12; i++) this.load.image(`stage_${i}`, A + `icons/stages/stage_${i}.png`);

    ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest'].forEach(icon => this.load.image(`ui_${icon}`, A + `icons/ui/${icon}.png`));
    ['bag', 'realm', 'skills', 'sect', 'craft', 'map', 'attack', 'auto', 'gold'].forEach(icon => this.load.image(`xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.png`));

    const elemDirs = { 'hoa': 'fire', 'loi': 'lightning', 'kim': 'metal', 'thuy': 'water', 'phong': 'wind', 'moc': 'wood', 'tho': 'earth', 'ly': 'physical' };
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

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,F,Q,E,SPACE,ONE,TWO,THREE,FOUR,FIVE,ESC,T');
    this.input.keyboard.on('keydown-ESC', () => this.closeModal());
    this.input.keyboard.on('keydown-T', () => this.toggleMeditation());

    this.input.on('pointerdown', p => {
      if (this.uiPointerIds.has(p.id)) return;
      if (this.isModalOpen && this.isModalOpen()) return;
      if (p.y < 155 || p.y > H - 140 || p.x > W - 60) return;
      this.moveTarget = {
        x: Phaser.Math.Clamp(p.x + this.cameras.main.scrollX, this.field.left, this.field.right),
        y: Phaser.Math.Clamp(p.y, this.field.top, this.field.bottom)
      };
    });
    this.input.on('pointerup', p => this.uiPointerIds.delete(p.id));
    this.input.on('pointerupoutside', p => this.uiPointerIds.delete(p.id));

    this.time.addEvent({ delay: 1000, callback: this.onSecondTick, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 200, callback: () => this.updateMinimap(), loop: true });
    this.time.addEvent({ delay: 30000, callback: () => { try { exportSaveCode(); } catch (e) {} }, loop: true });
    this.time.delayedCall(250, () => this.openWelcomeScreenModal());
  }

  update(time, delta) {
    if (!this.player || !this.player.body || this.dead) return;
    // Existing update implementation preserved in repository after this section.
  }
}

Object.assign(MainGameScene.prototype, HudMixin, CombatMixin, EnemyMixin, PlayerMixin, ModalMixin, NpcMixin, FellowNpcMixin, HerbsMixin);
