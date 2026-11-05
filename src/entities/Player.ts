import Phaser from 'phaser';
import { PlayerStateEnum, type CharacterStats } from '../core/Types';
import { StateMachine } from '../core/StateMachine';
import { EventBus, GameEvents } from '../core/EventBus';
import { CULTIVATION_REALMS } from '../data/realms.data';

export class Player extends Phaser.GameObjects.Container {
  public stats: CharacterStats;
  public stateMachine: StateMachine<Player>;
  public exp = 0;
  public maxExp = 100;
  public gold = 120;
  public spirit = 35;
  public kills = 0;
  public questKills = 0;
  public realmIndex = 0;

  // Visual sub-elements
  private heroSprite: Phaser.GameObjects.Image;
  private lotusDais: Phaser.GameObjects.Ellipse;
  private waterRipples: Phaser.GameObjects.Arc;
  private flyingSword: Phaser.GameObjects.Image;
  private auraCircle: Phaser.GameObjects.Arc;
  private nameLabel: Phaser.GameObjects.Text;
  private realmLabel: Phaser.GameObjects.Text;

  // Timers
  private mpRegenTimer = 0;
  private respawnTimer = 0;
  private stateTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.stats = {
      level: 1,
      maxHp: 120,
      hp: 120,
      maxMp: 80,
      mp: 80,
      atk: 28,
      def: 10,
      critRate: 0.25,
      critDmg: 1.8,
      attackSpeed: 1.2,
      moveSpeed: 140,
      penetration: 8,
      combatPower: 12485
    };

    // Expanding water ripple ring underfoot
    this.waterRipples = scene.add.circle(0, 18, 32, 0x88eeff, 0.25);
    this.waterRipples.setScale(1, 0.4);
    this.add(this.waterRipples);
    scene.tweens.add({
      targets: this.waterRipples,
      scaleX: 1.8,
      scaleY: 0.7,
      alpha: 0,
      duration: 1200,
      repeat: -1
    });

    // Spiritual Lotus dais (Đài sen linh khí)
    this.lotusDais = scene.add.ellipse(0, 16, 50, 18, 0x62d4eb, 0.45);
    this.lotusDais.setStrokeStyle(2, 0xbbf5ff, 0.85);
    this.add(this.lotusDais);

    // Radiant Aura
    this.auraCircle = scene.add.circle(0, -25, 36, 0x7be2f5, 0.2);
    this.auraCircle.setBlendMode(Phaser.BlendModes.ADD);
    this.add(this.auraCircle);

    // Hero rear-view sprite (Bạch Y Kiếm Tiên)
    this.heroSprite = scene.add.image(0, 16, 'hero_rear').setOrigin(0.5, 1).setScale(0.32);
    this.add(this.heroSprite);

    // Flying Spiritual Sword hovering near shoulder
    this.flyingSword = scene.add.image(22, -36, 'spirit_sword').setOrigin(0.5, 1);
    this.flyingSword.setScale(0.85);
    this.add(this.flyingSword);

    // Name & Realm Labels
    this.nameLabel = scene.add.text(0, -78, '申啸鹰 · Kiếm Tiên', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#102a35',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.add(this.nameLabel);

    const realm = CULTIVATION_REALMS[this.realmIndex];
    this.realmLabel = scene.add.text(0, -65, `${realm.name} · ${realm.stage}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '9px',
      color: '#bbf0e4',
      stroke: '#0e2329',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.add(this.realmLabel);

    scene.add.existing(this);

    // Setup State Machine
    this.stateMachine = new StateMachine<Player>(this);
    this.setupStateMachine();
  }

  private setupStateMachine(): void {
    this.stateMachine
      // 1. IDLE
      .addState({
        name: PlayerStateEnum.IDLE,
        enter: () => {
          EventBus.emit(GameEvents.PLAYER_STATE_CHANGED, PlayerStateEnum.IDLE);
        },
        update: (p, time) => {
          p.heroSprite.y = 16 + Math.sin(time / 260) * 1.5;
          p.flyingSword.y = -36 + Math.sin(time / 200) * 4;
        }
      })
      // 2. RUNNING (Lướt sóng trên mặt nước)
      .addState({
        name: PlayerStateEnum.RUNNING,
        enter: () => {
          EventBus.emit(GameEvents.PLAYER_STATE_CHANGED, PlayerStateEnum.RUNNING);
        },
        update: (p, time) => {
          // Bobbing wave surfing motion
          p.heroSprite.y = 16 + Math.sin(time / 160) * 2.5;
          p.lotusDais.scaleX = 1 + Math.sin(time / 200) * 0.08;
          p.flyingSword.y = -36 + Math.sin(time / 140) * 5;
          p.flyingSword.rotation = Math.sin(time / 180) * 0.15;
        }
      })
      // 3. DETECTING (Phát hiện quái vật phía trước chân trời)
      .addState({
        name: PlayerStateEnum.DETECTING,
        enter: (p) => {
          EventBus.emit(GameEvents.PLAYER_STATE_CHANGED, PlayerStateEnum.DETECTING);
          p.stateTimer = 0;
          p.flyingSword.setTint(0xffea88);
        },
        update: (p, time, delta) => {
          p.stateTimer += delta;
          p.heroSprite.y = 16 + Math.sin(time / 180) * 1.2;
          p.flyingSword.y = -36 + Math.sin(time / 140) * 3;
          if (p.stateTimer > 200) {
            p.stateMachine.transitionTo(PlayerStateEnum.COMBAT);
          }
        },
        exit: (p) => {
          p.flyingSword.clearTint();
        }
      })
      // 4. COMBAT (Trảm yêu trừ ma)
      .addState({
        name: PlayerStateEnum.COMBAT,
        enter: () => {
          EventBus.emit(GameEvents.PLAYER_STATE_CHANGED, PlayerStateEnum.COMBAT);
        },
        update: (p, time) => {
          p.heroSprite.y = 16 + Math.sin(time / 140) * 2.0;
          p.flyingSword.y = -40 + Math.sin(time / 90) * 6;
        }
      })
      // 5. BOSS_COMBAT (Quyết chiến Lĩnh Chủ)
      .addState({
        name: PlayerStateEnum.BOSS_COMBAT,
        enter: (p) => {
          EventBus.emit(GameEvents.PLAYER_STATE_CHANGED, PlayerStateEnum.BOSS_COMBAT);
          p.auraCircle.setFillStyle(0xffbb33, 0.32);
        },
        update: (p, time) => {
          p.heroSprite.y = 16 + Math.sin(time / 120) * 2.5;
          p.flyingSword.y = -42 + Math.sin(time / 80) * 8;
        },
        exit: (p) => {
          p.auraCircle.setFillStyle(0x7be2f5, 0.2);
        }
      })
      // 6. LOOTING (Hút linh khí chiến lợi phẩm)
      .addState({
        name: PlayerStateEnum.LOOTING,
        enter: (p) => {
          EventBus.emit(GameEvents.PLAYER_STATE_CHANGED, PlayerStateEnum.LOOTING);
          p.stateTimer = 0;
          p.auraCircle.setFillStyle(0xffdf66, 0.3);
        },
        update: (p, time, delta) => {
          p.stateTimer += delta;
          p.heroSprite.y = 16 + Math.sin(time / 200) * 1.2;
          if (p.stateTimer > 500) {
            p.stateMachine.transitionTo(PlayerStateEnum.RESUMING);
          }
        },
        exit: (p) => {
          p.auraCircle.setFillStyle(0x7be2f5, 0.2);
        }
      })
      // 7. RESUMING
      .addState({
        name: PlayerStateEnum.RESUMING,
        enter: (p) => {
          EventBus.emit(GameEvents.PLAYER_STATE_CHANGED, PlayerStateEnum.RESUMING);
          p.stateTimer = 0;
        },
        update: (p, _time, delta) => {
          p.stateTimer += delta;
          if (p.stateTimer > 250) {
            p.stateMachine.transitionTo(PlayerStateEnum.RUNNING);
          }
        }
      })
      // 8. DEAD
      .addState({
        name: PlayerStateEnum.DEAD,
        enter: (p) => {
          EventBus.emit(GameEvents.PLAYER_STATE_CHANGED, PlayerStateEnum.DEAD);
          EventBus.emit(GameEvents.PLAYER_DIED);
          p.respawnTimer = 3500;
          p.heroSprite.setTint(0x444444);
          p.flyingSword.setVisible(false);
          p.auraCircle.setVisible(false);

          p.scene.tweens.add({
            targets: p.heroSprite,
            alpha: 0.3,
            scaleY: 0.5,
            duration: 400
          });
        },
        update: (p, _time, delta) => {
          p.respawnTimer -= delta;
          if (p.respawnTimer <= 0) {
            p.respawn();
          }
        },
        exit: (p) => {
          p.heroSprite.clearTint();
          p.heroSprite.alpha = 1;
          p.heroSprite.scaleY = 1;
          p.flyingSword.setVisible(true);
          p.auraCircle.setVisible(true);
        }
      });

    this.stateMachine.transitionTo(PlayerStateEnum.RUNNING);
  }

  public takeDamage(amount: number): boolean {
    if (this.stateMachine.getCurrentStateName() === PlayerStateEnum.DEAD) return false;

    const effectiveDamage = Math.max(1, Math.round(amount - this.stats.def * 0.35));
    this.stats.hp = Math.max(0, this.stats.hp - effectiveDamage);

    EventBus.emit(GameEvents.PLAYER_DAMAGE_TAKEN, effectiveDamage);
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);

    this.heroSprite.setTint(0xff5555);
    this.scene.time.delayedCall(120, () => {
      if (this.stateMachine.getCurrentStateName() !== PlayerStateEnum.DEAD) {
        this.heroSprite.clearTint();
      }
    });

    if (this.stats.hp <= 0) {
      this.stateMachine.transitionTo(PlayerStateEnum.DEAD);
      return true;
    }
    return false;
  }

  public heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
  }

  public spendMp(amount: number): boolean {
    if (this.stats.mp < amount) return false;
    this.stats.mp -= amount;
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
    return true;
  }

  public restoreMp(amount: number): void {
    this.stats.mp = Math.min(this.stats.maxMp, this.stats.mp + amount);
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
  }

  public addExp(amount: number): void {
    this.exp += amount;
    while (this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.levelUp();
    }
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
  }

  private levelUp(): void {
    this.stats.level++;
    this.maxExp = Math.round(this.maxExp * 1.35);
    this.stats.maxHp += 30;
    this.stats.hp = this.stats.maxHp;
    this.stats.maxMp += 12;
    this.stats.mp = this.stats.maxMp;
    this.stats.atk += 8;
    this.stats.def += 4;
    this.stats.combatPower = Math.round(this.stats.combatPower + 850 + this.stats.level * 120);

    if (this.stats.level % 5 === 0 && this.realmIndex < CULTIVATION_REALMS.length - 1) {
      this.realmIndex++;
      const realm = CULTIVATION_REALMS[this.realmIndex];
      this.realmLabel.setText(`${realm.name} · ${realm.stage}`);
    }

    EventBus.emit(GameEvents.LEVEL_UP, this.stats.level);
    EventBus.emit(GameEvents.TOAST_MESSAGE, `Đột phá Cấp độ ${this.stats.level}! Lực chiến tăng vọt!`);
  }

  public respawn(): void {
    this.stats.hp = this.stats.maxHp;
    this.stats.mp = this.stats.maxMp;
    this.stateMachine.transitionTo(PlayerStateEnum.RESUMING);
    EventBus.emit(GameEvents.PLAYER_RESPAWNED);
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
    EventBus.emit(GameEvents.TOAST_MESSAGE, 'Niết Bàn Trọng Sinh! Tiếp tục ngự kiếm!');
  }

  public update(time: number, delta: number): void {
    this.auraCircle.setScale(1 + Math.sin(time / 280) * 0.08);

    if (time > this.mpRegenTimer) {
      this.mpRegenTimer = time + 1000;
      if (this.stats.mp < this.stats.maxMp && this.stateMachine.getCurrentStateName() !== PlayerStateEnum.DEAD) {
        this.restoreMp(4);
      }
    }

    this.stateMachine.update(time, delta);
  }
}
