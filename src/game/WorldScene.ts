import Phaser from 'phaser';
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

  // Game control
  private isAutoCombat = true;
  private speedMultiplier = 1;
  private basicAttackTimer = 0;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    this.createTextures();

    const w = this.scale.width;
    const h = this.scale.height;

    this.horizonY = h * 0.28;
    this.playerY = h * 0.58;
    this.cauldronY = h * 0.71;

    this.createEnvironment(w, h);
    this.createCauldron(w * 0.5, this.cauldronY);
    this.createPlayer(w * 0.5, this.playerY);
    this.initSystems();

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.handleResize(gameSize.width, gameSize.height);
    });

    this.spawnSystem.spawnInitialWave();
    this.hudManager.refreshAll();
  }

  private createTextures(): void {
    // 1. Hero Rear Sprite (Bạch Y Kiếm Tiên nhìn từ sau lưng)
    const g = this.make.graphics({ x: 0, y: 0 });
    // Flowing hair
    g.fillStyle(0x132029); g.fillRoundedRect(16, 8, 16, 42, 6);
    g.fillStyle(0x0e181f); g.fillCircle(24, 14, 9);
    // Jade hairpin
    g.fillStyle(0xa3f2dd); g.fillRect(19, 10, 10, 3);
    // White robes with cyan shading
    g.fillStyle(0xeff7f8); g.fillTriangle(24, 22, 10, 68, 38, 68);
    g.fillStyle(0x7dc7d8); g.fillTriangle(14, 30, 2, 60, 22, 54);
    g.fillStyle(0x7dc7d8); g.fillTriangle(34, 30, 46, 60, 26, 54);
    // Celestial sash (Dải lụa tiên phong)
    g.lineStyle(2, 0xaaf5ff, 0.85);
    g.lineBetween(12, 36, 4, 70);
    g.lineBetween(36, 36, 44, 70);
    g.generateTexture('hero_rear', 48, 72);
    g.destroy();

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

    // 4. Normal Void Eye Monster (Thiên Mục Yêu - 千目妖)
    const m = this.make.graphics({ x: 0, y: 0 });
    // Spikes
    m.fillStyle(0x1f0b15);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = 30 + Math.cos(angle) * 26;
      const y1 = 30 + Math.sin(angle) * 26;
      m.fillCircle(x1, y1, 5);
    }
    // Main dark orb
    m.fillStyle(0x351424); m.fillCircle(30, 30, 22);
    m.fillStyle(0x541c38); m.fillCircle(30, 30, 16);
    // Demonic golden-red eyes
    m.fillStyle(0xff2222); m.fillCircle(30, 30, 7);
    m.fillStyle(0xffe600); m.fillCircle(30, 30, 3.5);
    m.fillStyle(0xff4444); m.fillCircle(20, 25, 4);
    m.fillStyle(0xff4444); m.fillCircle(40, 25, 4);
    m.generateTexture('monster_eye', 60, 60);
    m.destroy();

    // 5. Elite Monster
    const me = this.make.graphics({ x: 0, y: 0 });
    me.fillStyle(0x420c22); me.fillCircle(35, 35, 28);
    me.fillStyle(0x731a3f); me.fillCircle(35, 35, 20);
    me.fillStyle(0xff0044); me.fillCircle(35, 35, 9);
    me.fillStyle(0xffe066); me.fillCircle(35, 35, 4);
    me.generateTexture('monster_eye_elite', 70, 70);
    me.destroy();

    // 6. Boss Monster (Thiên Mục Ma Quân)
    const mb = this.make.graphics({ x: 0, y: 0 });
    mb.fillStyle(0x520a22); mb.fillCircle(45, 45, 38);
    mb.fillStyle(0x94163d); mb.fillCircle(45, 45, 28);
    mb.fillStyle(0xff1133); mb.fillCircle(45, 45, 12);
    mb.fillStyle(0xfff066); mb.fillCircle(45, 45, 5);
    mb.generateTexture('monster_eye_boss', 90, 90);
    mb.destroy();
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
  }

  private initSystems(): void {
    this.targetSystem = new TargetSystem(this.player);
    this.combatSystem = new CombatSystem(this, this.player);
    this.skillSystem = new SkillSystem(this.player, this.targetSystem, this.combatSystem);
    this.lootSystem = new LootSystem(this, this.player);
    this.spawnSystem = new SpawnSystem(this, this.scale.height * 0.32);

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
        this.skillSystem.castUltimate(this.spawnSystem.getMonsters(), this.time.now);
      }
    });

    EventBus.on(GameEvents.MONSTER_DIED, (monster: Monster) => {
      this.handleMonsterDied(monster);
    });
  }

  private handleMonsterDied(monster: Monster): void {
    this.lootSystem.dropLootForMonster(monster);

    this.player.kills++;
    this.player.questKills++;
    this.player.addExp(monster.config.expReward);

    if (this.player.questKills >= 10) {
      this.player.questKills = 0;
      this.player.gold += 120;
      this.player.spirit += 8;
      this.player.addExp(80);
      EventBus.emit(GameEvents.TOAST_MESSAGE, 'Hoàn thành trảm yêu! Thu hoạch linh thạch phong phú!');
      EventBus.emit(GameEvents.BATTLE_LOG, '✦ Công đức vô lượng: Tiên môn ban thưởng Bạc +120, Linh Thạch +8, EXP +80.');
    }

    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.player.stats);
  }

  override update(time: number, rawDelta: number): void {
    const delta = Math.min(rawDelta, 50) * this.speedMultiplier;
    const currentState = this.player.stateMachine.getCurrentStateName();

    // 1. Tick Player
    this.player.update(time, delta);

    // 2. Animate perspective water waves moving downwards to create forward surfing motion
    const w = this.scale.width;
    const h = this.scale.height;
    const waterHeight = h - this.horizonY;

    for (const wave of this.waterWaves) {
      wave.progress += (wave.speed * (delta / 1000)) * (this.isAutoCombat ? 1.4 : 0.6);
      if (wave.progress > 1) wave.progress -= 1;

      // Exponential perspective scaling
      const y = this.horizonY + Math.pow(wave.progress, 1.8) * waterHeight;
      const alpha = Math.sin(wave.progress * Math.PI) * 0.45;
      const waveWidth = w * (0.35 + wave.progress * 0.7);

      wave.line.clear();
      wave.line.lineStyle(1.5 + wave.progress * 2, 0xd2f8ff, alpha);
      wave.line.beginPath();
      wave.line.moveTo((w - waveWidth) / 2, y);
      wave.line.lineTo((w + waveWidth) / 2, y);
      wave.line.strokePath();
    }

    // 3. Tick Monster Spawning & Waves
    this.spawnSystem.update();

    // 4. Tick Active Monsters
    const monsters = this.spawnSystem.getMonsters();
    for (const m of monsters) {
      m.update(time, delta);
    }

    // 5. Tick Loot System (pulling dropped crystals to hero & cauldron)
    this.lootSystem.update(time, delta);

    // 6. Dead state handling
    if (currentState === PlayerStateEnum.DEAD) {
      return;
    }

    if (!this.isAutoCombat) {
      return;
    }

    // 7. Auto Combat Loop
    const primaryTarget = this.targetSystem.selectPrimaryTarget(monsters);

    if (!primaryTarget) {
      if (currentState === PlayerStateEnum.COMBAT || currentState === PlayerStateEnum.BOSS_COMBAT) {
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
      const attackInterval = (900 / this.player.stats.attackSpeed) / this.speedMultiplier;
      if (time - this.basicAttackTimer > attackInterval) {
        this.basicAttackTimer = time;
        this.combatSystem.performBasicAttack(primaryTarget, time);
      }

      // Auto Skills tick
      this.skillSystem.updateAutoSkills(monsters, time);

      // Monster Retaliation tick
      this.combatSystem.processMonsterAttack(primaryTarget, time);
    }
  }

  private handleResize(width: number, height: number): void {
    this.horizonY = height * 0.28;
    this.playerY = height * 0.58;
    this.cauldronY = height * 0.71;

    this.player.setPosition(width * 0.5, this.playerY);
    this.cauldron.setPosition(width * 0.5, this.cauldronY);
    this.spawnSystem.setArenaY(height * 0.32);

    this.cameras.main.setViewport(0, 0, width, height);
  }
}
