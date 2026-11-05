import Phaser from 'phaser';
import { MonsterStateEnum, type MonsterConfig } from '../core/Types';
import { StateMachine } from '../core/StateMachine';

export class Monster extends Phaser.GameObjects.Container {
  public config: MonsterConfig;
  public hp: number;
  public maxHp: number;
  public alive = true;
  public nextAttackTime = 0;
  public bossPhase = 1;
  private baseBossAtk = 0;
  private baseBossAttackInterval = 0;
  /** Normalized world lane (-1..1) and depth (0 horizon, 1 near camera). */
  public worldX: number;
  public worldZ = 0.22;
  public baseScale: number;
  public stateMachine: StateMachine<Monster>;

  private bodySprite: Phaser.GameObjects.Image;
  private shadow: Phaser.GameObjects.Ellipse;
  private hpBarBg: Phaser.GameObjects.Graphics;
  private hpBarFill: Phaser.GameObjects.Graphics;
  private nameLabel: Phaser.GameObjects.Text;
  private auraRing?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, config: MonsterConfig) {
    super(scene, x, y);
    this.config = config;
    this.worldX = Phaser.Math.Clamp(((x / Math.max(1, scene.scale.width)) - 0.5) * 2, -0.85, 0.85);
    this.baseScale = config.scale || 1;
    this.hp = config.maxHp;
    this.maxHp = config.maxHp;
    this.baseBossAtk = config.atk;
    this.baseBossAttackInterval = config.attackInterval;

    // Distant water reflection / shadow
    this.shadow = scene.add.ellipse(0, 48 * (config.scale || 1), 38 * (config.scale || 1), 10, 0x051b22, 0.45);
    this.add(this.shadow);

    // Demonic aura
    this.auraRing = scene.add.circle(0, 0, 32 * (config.scale || 1), config.isBoss ? 0xff2222 : 0xaa2277, 0.25);
    this.auraRing.setBlendMode(Phaser.BlendModes.ADD);
    this.add(this.auraRing);

    scene.tweens.add({
      targets: this.auraRing,
      scale: 1.3,
      alpha: 0.45,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Monster Sprite
    this.bodySprite = scene.add.image(0, 0, config.textureKey).setOrigin(0.5, 0.5);
    if (config.scale) {
      this.bodySprite.setScale(config.scale * 0.38);
    }
    this.add(this.bodySprite);

    // Name & Title label (e.g. 千目妖 · Lv.01)
    const labelColor = config.isBoss ? '#ff5252' : '#ffcf66';
    const tagText = `${config.isBoss ? '👑 ' : ''}${config.name} · Lv.${config.level}`;
    this.nameLabel = scene.add.text(0, -38 * (config.scale || 1), tagText, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: labelColor,
      stroke: '#240808',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.add(this.nameLabel);

    // HP Bar
    this.hpBarBg = scene.add.graphics();
    this.hpBarFill = scene.add.graphics();
    this.add(this.hpBarBg);
    this.add(this.hpBarFill);
    this.drawHpBar();

    scene.add.existing(this);

    // Setup State Machine
    this.stateMachine = new StateMachine<Monster>(this);
    this.setupStateMachine();
  }

  private setupStateMachine(): void {
    this.stateMachine
      .addState({
        name: MonsterStateEnum.IDLE,
        update: (m, time) => {
          // Floating hovering animation
          m.bodySprite.y = Math.sin(time / 220) * 3;
        }
      })
      .addState({
        name: MonsterStateEnum.ATTACK,
        enter: (m) => {
          // Ranged casting tell: charge in place; never lunge into the player's space.
          m.bodySprite.setTint(m.config.isBoss ? 0xff9a5c : 0xc77bff);
          m.scene.tweens.add({
            targets: [m.bodySprite, m.auraRing],
            scale: 1.12,
            duration: 180,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              if (m.alive) m.bodySprite.clearTint();
            }
          });
        }
      })
      .addState({
        name: MonsterStateEnum.HURT,
        enter: (m) => {
          m.bodySprite.setTint(0xff5555);
          m.scene.tweens.add({
            targets: m.bodySprite,
            scaleX: (m.config.scale || 1) * 0.38 * 1.15,
            duration: 90,
            yoyo: true,
            onComplete: () => {
              if (m.alive) {
                m.bodySprite.clearTint();
                m.stateMachine.transitionTo(MonsterStateEnum.IDLE);
              }
            }
          });
        }
      })
      .addState({
        name: MonsterStateEnum.DEAD,
        enter: (m) => {
          m.alive = false;
          m.hpBarBg.clear();
          m.hpBarFill.clear();
          m.nameLabel.setVisible(false);
          m.bodySprite.setTint(0x442222);

          m.scene.tweens.add({
            targets: [m.bodySprite, m.shadow, m.auraRing],
            alpha: 0,
            scale: 0.3,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              m.destroy();
            }
          });
        }
      });

    this.stateMachine.transitionTo(MonsterStateEnum.IDLE);
  }

  public setPerspectivePosition(x: number, y: number, depthScale: number): void {
    this.setPosition(x, y);
    this.setScale(depthScale);
    this.setDepth(Math.round(y));
  }

  public takeDamage(amount: number, _isCrit = false): boolean {
    if (!this.alive) return false;

    this.hp = Math.max(0, this.hp - Math.max(0, Number.isFinite(amount) ? amount : 0));
    this.updateBossPhase();
    this.drawHpBar();

    if (this.hp <= 0) {
      this.die();
      return true;
    } else {
      this.stateMachine.transitionTo(MonsterStateEnum.HURT);
      return false;
    }
  }

  /** Bosses gain two escalating phases at 70% and 35% HP. */
  private updateBossPhase(): void {
    if (!this.config.isBoss) return;
    const hpRatio = this.hp / this.maxHp;
    const nextPhase = hpRatio <= 0.35 ? 3 : hpRatio <= 0.70 ? 2 : 1;
    if (nextPhase <= this.bossPhase) return;

    this.bossPhase = nextPhase;
    const attackMultiplier = nextPhase === 2 ? 1.2 : 1.45;
    const cadenceMultiplier = nextPhase === 2 ? 0.88 : 0.72;
    this.config.atk = Math.round(this.baseBossAtk * attackMultiplier);
    this.config.attackInterval = Math.round(this.baseBossAttackInterval * cadenceMultiplier);
    this.nameLabel.setText(`👑 ${this.config.name} · Giai đoạn ${nextPhase}`);
    this.nameLabel.setColor(nextPhase === 3 ? '#ff3333' : '#ff9b52');
    this.auraRing?.setFillStyle(nextPhase === 3 ? 0xff2222 : 0xff7a22, 0.42);
    this.scene.cameras.main.shake(180, nextPhase === 3 ? 0.008 : 0.004);
    EventBus.emit(GameEvents.TOAST_MESSAGE, nextPhase === 2
      ? '⚠ Boss chuyển sang Giai đoạn 2 — cuồng nộ!'
      : '☠ Boss bước vào Giai đoạn Cuối — diệt thế!');
    EventBus.emit(GameEvents.BATTLE_LOG, `${this.config.name} tiến vào giai đoạn ${nextPhase}!`);
  }

  public die(): void {
    if (!this.alive) return;
    this.alive = false;
    this.stateMachine.transitionTo(MonsterStateEnum.DEAD);
  }

  public drawHpBar(): void {
    this.hpBarBg.clear();
    this.hpBarFill.clear();
    if (!this.alive) return;

    const barWidth = 46 * (this.config.scale || 1);
    const barHeight = 4;
    const barX = -barWidth / 2;
    const barY = -27 * (this.config.scale || 1);

    this.hpBarBg.fillStyle(0x1a0d0d, 0.9);
    this.hpBarBg.fillRoundedRect(barX, barY, barWidth, barHeight, 2);

    const ratio = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    const fillColor = this.config.isBoss ? 0xff2222 : 0xe84a4a;
    this.hpBarFill.fillStyle(fillColor, 1);
    this.hpBarFill.fillRoundedRect(barX, barY, barWidth * ratio, barHeight, 2);
  }

  public update(time: number, delta: number): void {
    if (!this.alive) return;
    this.stateMachine.update(time, delta);
  }
}
