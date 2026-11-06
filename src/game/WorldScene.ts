import Phaser from 'phaser';
import heroRearUrl from '../assets/hero-xianxia.webp';
import monsterEyeUrl from '../assets/monster-void-eye.webp';
import monsterEliteUrl from '../assets/monster-elite.webp';
import monsterBossUrl from '../assets/monster-boss.webp';
import { Player } from '../entities/Player';
import { Monster } from '../entities/Monster';
import { TargetSystem } from '../systems/TargetSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { SkillSystem } from '../systems/SkillSystem';
import { LootSystem } from '../systems/LootSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { HUDManager } from '../ui/HUDManager';
import { PlayerStateEnum } from '../core/Types';
import { EventBus, GameEvents } from '../core/EventBus';
import { PerspectiveProjector } from './perspective/PerspectiveProjector';
import { WorldMotion } from './perspective/WorldMotion';
import { SaveSystem } from '../services/SaveSystem';
import { CinematicEnvironment } from './CinematicEnvironment';

interface WaterWave {
  line: Phaser.GameObjects.Graphics;
  progress: number;
  speed: number;
}

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private targetSystem!: TargetSystem;
  private combatSystem!: CombatSystem;
  private skillSystem!: SkillSystem;
  private lootSystem!: LootSystem;
  private spawnSystem!: SpawnSystem;
  private hudManager!: HUDManager;

  // Environment elements
  private horizonY = 0;
  private playerY = 0;
  private cauldronY = 0;
  private cauldron!: Phaser.GameObjects.Container;
  private waterWaves: WaterWave[] = [];
  private sunShimmer!: Phaser.GameObjects.Graphics;
  private cinematicEnvironment!: CinematicEnvironment;

  // Game control
  private isAutoCombat = true;
  private speedMultiplier = 1;
  private basicAttackTimer = 0;
  private combatClock = 0;
  private readonly worldMotion = new WorldMotion();
  private readonly depthEntities: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('WorldScene');
  }

  preload(): void {
    this.load.image('hero_rear', heroRearUrl);
    this.load.image('monster_eye', monsterEyeUrl);
    this.load.image('monster_eye_elite', monsterEliteUrl);
    this.load.image('monster_eye_boss', monsterBossUrl);
  }

  create(): void {
    this.createTextures();

    const w = this.scale.width;
    const h = this.scale.height;

    this.horizonY = h * 0.28;
    this.playerY = h * 0.68;
    this.cauldronY = h * 0.71;

    this.createEnvironment(w, h);
    this.createCauldron(w * 0.5, this.cauldronY);
    this.createPlayer(w * 0.5, this.playerY);
    this.initSystems();
    const offlineSeconds = SaveSystem.load(this.player);
    this.skillSystem.restoreProgression();
    SaveSystem.bind(this.player);
    SaveSystem.grantOfflineRewards(this.player, offlineSeconds);
    SaveSystem.save(this.player);

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.handleResize(gameSize.width, gameSize.height);
    });

    this.spawnSystem.spawnInitialWave();
    this.hudManager.refreshAll();
  }

  private createTextures(): void {
    // Character and demon artwork is loaded as high-density WebP textures generated from editable SVG masters.
    // 2. Flying Spiritual Sword (Phi Kiếm)
    const s = this.make.graphics({ x: 0, y: 0 });
    s.fillStyle(0x95f1ff); s.fillRect(7, 4, 4, 30);
    s.fillStyle(0xffffff); s.fillTriangle(9, 0, 5, 6, 13, 6);
    s.fillStyle(0xd6b76c); s.fillRect(4, 28, 10, 4);
    s.fillStyle(0x334455); s.fillRect(7, 32, 4, 8);
    s.generateTexture('spirit_sword', 18, 42);
    s.destroy();

    // 3. Ancient Cauldron / Tiên Đỉnh (Lò luyện đan)
    const c = this.make.graphics({ x: 0, y: 0 });
    // Glow aura
    c.fillStyle(0x40a9c4, 0.35); c.fillCircle(35, 35, 34);
    // Tripod bronze body
    c.fillStyle(0x1e5063); c.fillRoundedRect(15, 20, 40, 26, 6);
    c.fillStyle(0x2d7794); c.fillRect(11, 16, 48, 7);
    c.fillStyle(0x8eeeff); c.fillCircle(35, 33, 8);
    // Handles & legs
    c.fillStyle(0x1a4354);
    c.fillRect(7, 20, 6, 12);
    c.fillRect(57, 20, 6, 12);
    c.fillTriangle(18, 46, 12, 62, 22, 46);
    c.fillTriangle(52, 46, 58, 62, 48, 46);
    c.fillTriangle(32, 46, 35, 63, 38, 46);
    c.generateTexture('cauldron', 70, 70);
    c.destroy();

  }

  private createEnvironment(w: number, h: number): void {
    // 1. Sky Gradient (Sunset/Dawn golden glow)
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x3f8fa3, 0x3f8fa3, 0xf7b76d, 0xfbe29a, 1);
    sky.fillRect(0, 0, w, this.horizonY);

    // Sun disc at the horizon
    const sun = this.add.circle(w * 0.5, this.horizonY - 8, 38, 0xfff3c4, 0.95);
    const sunAura = this.add.circle(w * 0.5, this.horizonY - 8, 70, 0xffdf88, 0.35);
    sunAura.setBlendMode(Phaser.BlendModes.ADD);

    // Distant mountain haze silhouettes on the horizon
    for (let i = 0; i < 7; i++) {
      const triX = i * (w / 5);
      this.add.triangle(triX, this.horizonY, 0, 30, 40, 0, 80, 30, 0x73979e, 0.45);
    }

    // 2. Turquoise / Cyan Sea Surface
    const sea = this.add.graphics();
    sea.fillGradientStyle(0x278996, 0x278996, 0x14515c, 0x14515c, 1);
    sea.fillRect(0, this.horizonY, w, h - this.horizonY);

    // Vertical sun shimmer reflection on water
    this.sunShimmer = this.add.graphics();
    this.sunShimmer.fillStyle(0xfff1aa, 0.18);
    this.sunShimmer.fillTriangle(w * 0.5, this.horizonY, w * 0.32, h, w * 0.68, h);
    this.sunShimmer.fillStyle(0xfff7d2, 0.10);
    this.sunShimmer.fillTriangle(w * 0.5, this.horizonY + 5, w * 0.43, h, w * 0.57, h);
    const depthBands = this.add.graphics();
    depthBands.fillStyle(0x062d3b, 0.12);
    depthBands.fillRect(0, this.horizonY + (h - this.horizonY) * 0.28, w, (h - this.horizonY) * 0.72);
    depthBands.lineStyle(1, 0xb9f4e9, 0.13);
    for (let i = 0; i < 9; i++) {
      const y = this.horizonY + (h - this.horizonY) * (0.22 + i * 0.085);
      const half = w * (0.12 + i * 0.055);
      depthBands.beginPath(); depthBands.moveTo(w * 0.5 - half, y); depthBands.lineTo(w * 0.5 + half, y); depthBands.strokePath();
    }

    // Dynamic perspective forward water ripples
    const waveCount = 12;
    for (let i = 0; i < waveCount; i++) {
      const g = this.add.graphics();
      this.waterWaves.push({
        line: g,
        progress: i / waveCount,
        speed: 0.18
      });
    }

    this.cinematicEnvironment = new CinematicEnvironment(this);
    this.cinematicEnvironment.create(w, h, this.horizonY);
  }

  private createCauldron(x: number, y: number): void {
    this.cauldron = this.add.container(x, y);

    const runeCircle = this.add.circle(0, 0, 42, 0x7be2f5, 0.18).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: runeCircle,
      scale: 1.25,
      alpha: 0.35,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    const cauldronSprite = this.add.image(0, 0, 'cauldron').setOrigin(0.5, 0.5);
    this.cauldron.add([runeCircle, cauldronSprite]);
    this.cauldron.setDepth(y + 1);

    // Floating animation
    this.tweens.add({
      targets: this.cauldron,
      y: y - 5,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createPlayer(x: number, y: number): void {
    this.player = new Player(this, x, y);
    this.player.setDepth(y);
  }

  private initSystems(): void {
    this.targetSystem = new TargetSystem(this.player);
    this.combatSystem = new CombatSystem(this, this.player);
    this.skillSystem = new SkillSystem(this.player, this.targetSystem, this.combatSystem);
    this.lootSystem = new LootSystem(this, this.player);
    this.spawnSystem = new SpawnSystem(this, this.scale.height * 0.32, () => this.player.stats.level, () => this.player.realmIndex / 4);

    this.hudManager = new HUDManager(this.player, this.skillSystem, {
      onAutoToggle: (running: boolean) => {
        this.isAutoCombat = running;
        if (!running) {
          this.player.stateMachine.transitionTo(PlayerStateEnum.IDLE);
        } else {
          this.player.stateMachine.transitionTo(PlayerStateEnum.RUNNING);
        }
      },
      onSpeedChange: (speed: number) => {
        this.speedMultiplier = speed;
      },
      onUltimateCast: () => {
        this.skillSystem.castUltimate(this.spawnSystem.getMonsters(), this.combatClock);
      },
      onDungeonStart: () => this.spawnSystem.startDungeon(),
      onBossHunt: () => {
        if (!this.spawnSystem.canSpawnBossWave()) return;
        if (this.player.spirit < 50) {
          EventBus.emit(GameEvents.TOAST_MESSAGE, 'Cần 50 linh thạch để khiêu chiến Boss!');
          return;
        }
        this.player.spirit -= 50;
        EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.player.stats);
        this.spawnSystem.spawnBossWave();
      }
    });

    EventBus.on(GameEvents.MONSTER_DIED, (monster: Monster) => {
      this.handleMonsterDied(monster);
    });
    EventBus.on(GameEvents.MONSTER_DAMAGED, (payload: { damage: number }) => {
      this.player.sessionDamageDealt += Math.max(0, Number.isFinite(payload.damage) ? payload.damage : 0);
    });
    EventBus.on(GameEvents.PLAYER_DAMAGE_TAKEN, (damage: number) => {
      this.player.sessionDamageTaken += Math.max(0, Number.isFinite(damage) ? damage : 0);
    });
    EventBus.on(GameEvents.DUNGEON_COMPLETED, () => {
      const exp = Math.max(250, this.player.stats.level * 25);
      const gold = Math.max(300, this.player.stats.level * 20);
      this.player.addExp(exp);
      this.player.gainResources(gold, 15);
      this.player.addCultivationExp(35);
      EventBus.emit(GameEvents.TOAST_MESSAGE, `Bí cảnh hoàn thành: +${exp} EXP, +${gold} bạc, +15 linh thạch, +35 tu vi!`);
      SaveSystem.save(this.player);
    });
  }

  private handleMonsterDied(monster: Monster): void {
    this.lootSystem.dropLootForMonster(monster);

    this.player.kills++;
    this.player.sessionKills++;
    this.player.questKills++;
    this.player.addExp(monster.config.expReward);
    this.player.addCultivationExp(Math.max(1, Math.floor(monster.config.expReward * 0.03)));


    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.player.stats);
  }

  override update(time: number, rawDelta: number): void {
    const delta = Math.min(rawDelta, 50) * this.speedMultiplier;
    this.combatClock += delta;
    const combatTime = this.combatClock;
    const currentState = this.player.stateMachine.getCurrentStateName();

    // 1. Tick Player
    this.player.update(time, delta);
    this.hudManager.updateCooldowns(combatTime);
    this.cinematicEnvironment.update(time, delta);

    // A defeated character waits for the respawn state machine; do not spawn or attack during this window.
    if (currentState === PlayerStateEnum.DEAD) return;

    // 2. Animate perspective water waves moving downwards to create forward surfing motion
    const w = this.scale.width;
    const h = this.scale.height;
    const waterHeight = h - this.horizonY;

    for (const wave of this.waterWaves) {
      wave.progress += (wave.speed * (delta / 1000)) * (this.isAutoCombat ? 1.4 : 0.6);
      if (wave.progress > 1) wave.progress -= 1;

      // Exponential perspective scaling
      const y = this.horizonY + Math.pow(wave.progress, 1.8) * waterHeight;
      const alpha = Math.sin(wave.progress * Math.PI) * 0.52;
      const waveWidth = w * (0.35 + wave.progress * 0.7);

      wave.line.clear();
      wave.line.lineStyle(1.2 + wave.progress * 2.4, wave.progress > 0.62 ? 0xffedb4 : 0xd2f8ff, alpha);
      wave.line.beginPath();
      wave.line.moveTo((w - waveWidth) / 2, y);
      wave.line.lineTo((w + waveWidth) / 2, y);
      wave.line.strokePath();
    }

    // 3. Tick Monster Spawning & Waves
    this.spawnSystem.update();

    // 4. Simulate world-space movement, then project every monster into the portrait viewport.
    const monsters = this.spawnSystem.getMonsters();
    this.worldMotion.update(this.player, monsters, delta, this.isAutoCombat);
    for (const m of monsters) {
      m.update(time, delta);
      if (!m.active || !m.alive) continue;
      const projected = PerspectiveProjector.project(
        { x: m.worldX, z: m.worldZ, elevation: 0 },
        w,
        h,
        0.28
      );
      // Monster child artwork already includes its archetype scale; apply depth scaling only.
      m.setPerspectivePosition(projected.x, projected.y, projected.scale);
    }

    // 5. Tick Loot System (pulling dropped crystals to hero & cauldron)
    this.lootSystem.update(time, delta);

    // 6. Every living enemy runs its own attack cooldown; the auto toggle only controls
    // the player's autonomous attacks, not incoming enemy damage.
    for (const enemy of monsters) {
      if (!enemy.alive || !enemy.active) continue;
      this.combatSystem.processMonsterAttack(enemy, combatTime);
    }

    if (!this.isAutoCombat) {
      return;
    }

    // 7. Auto Combat Loop
    const primaryTarget = this.targetSystem.selectPrimaryTarget(monsters);

    if (!primaryTarget) {
      if (monsters.some(m => m.alive && m.active)) {
        if (currentState === PlayerStateEnum.COMBAT || currentState === PlayerStateEnum.BOSS_COMBAT) {
          this.player.stateMachine.transitionTo(PlayerStateEnum.LOOTING);
        }
      } else if (currentState === PlayerStateEnum.COMBAT || currentState === PlayerStateEnum.BOSS_COMBAT) {
        if (this.lootSystem.hasUncollectedLootNear(this.player.x, 300)) {
          this.player.stateMachine.transitionTo(PlayerStateEnum.LOOTING);
        } else {
          this.player.stateMachine.transitionTo(PlayerStateEnum.RESUMING);
        }
      }
    } else {
      const targetState = primaryTarget.config.isBoss ? PlayerStateEnum.BOSS_COMBAT : PlayerStateEnum.COMBAT;
      if (currentState !== targetState) {
        this.player.stateMachine.transitionTo(targetState);
      }

      // Basic Attack tick
      const attackInterval = 900 / this.player.stats.attackSpeed;
      if (combatTime - this.basicAttackTimer > attackInterval) {
        this.basicAttackTimer = combatTime;
        this.combatSystem.performBasicAttack(primaryTarget, combatTime);
      }

      // Auto Skills tick
      this.skillSystem.updateAutoSkills(monsters, combatTime);
    }
  }

  private handleResize(width: number, height: number): void {
    this.horizonY = height * 0.28;
    this.playerY = height * 0.68;
    this.cauldronY = height * 0.71;

    this.player.setPosition(width * 0.5, this.playerY);
    this.player.setDepth(this.playerY);
    this.cauldron.setPosition(width * 0.5, this.cauldronY);
    this.cauldron.setDepth(this.cauldronY + 1);
    this.spawnSystem.setArenaY(height * 0.32);
    this.cinematicEnvironment.resize(width, height);

    this.cameras.main.setViewport(0, 0, width, height);
  }
}
