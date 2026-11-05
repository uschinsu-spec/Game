import Phaser from 'phaser';
import { PlayerStateEnum, type CharacterStats } from '../core/Types';
import { StateMachine } from '../core/StateMachine';
import { EventBus, GameEvents } from '../core/EventBus';
import { CULTIVATION_REALMS } from '../data/realms.data';
import type { InventoryEntry, EquipmentSlot } from '../core/Types';

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
  public inventory: InventoryEntry[] = [];
  public equipment: Partial<Record<EquipmentSlot, InventoryEntry>> = {};
  public questClaims = 0;
  public dailyClaimDate = '';

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
      combatPower: 584
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

  /** Resolve mitigation once so combat feedback and HP loss always use the same value. */
  public calculateIncomingDamage(amount: number): number {
    const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
    return Math.max(1, Math.round(safeAmount - Math.max(0, this.stats.def) * 0.35));
  }

  public takeDamage(amount: number): boolean {
    if (this.stateMachine.getCurrentStateName() === PlayerStateEnum.DEAD) return false;

    const effectiveDamage = this.calculateIncomingDamage(amount);
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


  public gainResources(gold: number, spirit: number): void {
    this.gold = Math.max(0, this.gold + Math.floor(gold));
    this.spirit = Math.max(0, this.spirit + Math.floor(spirit));
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
  }

  public addInventoryItem(item: InventoryEntry): void {
    const existing = this.inventory.find(entry => entry.id === item.id && entry.type === item.type);
    if (existing && item.type !== 'equipment') existing.amount += item.amount;
    else this.inventory.push({ ...item });
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
  }

  public usePotion(itemId: string): boolean {
    const item = this.inventory.find(entry => entry.id === itemId && entry.type === 'potion' && entry.amount > 0);
    if (!item) return false;
    item.amount -= 1;
    if (item.amount <= 0) this.inventory = this.inventory.filter(entry => entry !== item);
    this.heal(Math.max(40, Math.round(this.stats.maxHp * 0.3)));
    this.restoreMp(Math.max(25, Math.round(this.stats.maxMp * 0.3)));
    return true;
  }

  public equipItem(itemId: string): boolean {
    const index = this.inventory.findIndex(entry => entry.id === itemId && entry.type === 'equipment' && !!entry.slot);
    if (index < 0) return false;
    const item = this.inventory[index];
    const slot = item.slot as EquipmentSlot;
    const previous = this.equipment[slot];
    if (previous) this.inventory.push(previous);
    this.equipment[slot] = item;
    this.inventory.splice(index, 1);
    this.recalculateEquipmentStats();
    return true;
  }

  public unequipItem(slot: EquipmentSlot): boolean {
    const item = this.equipment[slot];
    if (!item) return false;
    this.inventory.push(item);
    delete this.equipment[slot];
    this.recalculateEquipmentStats();
    return true;
  }

  private recalculateEquipmentStats(): void {
    const gear = Object.values(this.equipment);
    const atk = gear.reduce((sum, item) => sum + (item?.atk || 0), 0);
    const def = gear.reduce((sum, item) => sum + (item?.def || 0), 0);
    const hp = gear.reduce((sum, item) => sum + (item?.hp || 0), 0);
    const mp = gear.reduce((sum, item) => sum + (item?.mp || 0), 0);
    const old = (this as unknown as { gear?: { atk: number; def: number; hp: number; mp: number } }).gear || { atk: 0, def: 0, hp: 0, mp: 0 };
    const oldMaxHp = this.stats.maxHp;
    const oldMaxMp = this.stats.maxMp;
    this.stats.atk = Math.max(1, this.stats.atk - old.atk + atk);
    this.stats.def = Math.max(0, this.stats.def - old.def + def);
    this.stats.maxHp = Math.max(1, this.stats.maxHp - old.hp + hp);
    this.stats.maxMp = Math.max(1, this.stats.maxMp - old.mp + mp);
    (this as unknown as { gear: { atk: number; def: number; hp: number; mp: number } }).gear = { atk, def, hp, mp };
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + Math.max(0, this.stats.maxHp - oldMaxHp));
    this.stats.mp = Math.min(this.stats.maxMp, this.stats.mp + Math.max(0, this.stats.maxMp - oldMaxMp));
    this.stats.combatPower = Math.round(this.stats.atk * 12 + this.stats.def * 8 + this.stats.maxHp * 0.4 + this.stats.maxMp * 0.25 + this.stats.level * 100);
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
  }


  public craftRecoveryPill(): boolean {
    const material = this.inventory.find(item => item.type === 'material' && item.name === 'Thanh Trúc Dược Thảo' && item.amount > 0);
    if (!material || this.gold < 30 || this.spirit < 3) return false;
    this.gold -= 30;
    this.spirit -= 3;
    material.amount -= 1;
    if (material.amount <= 0) this.inventory = this.inventory.filter(item => item !== material);
    this.addInventoryItem({ id: 'recovery-pill', name: 'Bồi Nguyên Đan', type: 'potion', amount: 1, quality: material.quality, iconText: '🧪' });
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
    return true;
  }

  public claimDailyWelfare(): boolean {
    const now = new Date();
    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    if (this.dailyClaimDate === today) return false;
    this.dailyClaimDate = today;
    this.gainResources(100, 5);
    this.addExp(50);
    return true;
  }

  public claimKillQuest(): boolean {
    const required = (this.questClaims + 1) * 10;
    if (this.kills < required) return false;
    this.questClaims += 1;
    this.gainResources(120, 8);
    this.addExp(80);
    EventBus.emit(GameEvents.TOAST_MESSAGE, 'Hoàn thành nhiệm vụ trảm yêu! Nhận 120 bạc, 8 linh thạch và 80 tu vi.');
    return true;
  }

  public cultivate(amount = 10): boolean {
    if (this.spirit < 5 || this.stats.mp < 5) return false;
    this.spirit -= 5;
    this.spendMp(5);
    this.addExp(amount);
    return true;
  }

  public breakthrough(): boolean {
    const next = CULTIVATION_REALMS[this.realmIndex + 1];
    if (!next || this.exp < next.expRequired || this.stats.level < (this.realmIndex + 1) * 5 || this.spirit < next.id * 10) return false;
    this.spirit -= next.id * 10;
    this.exp -= next.expRequired;
    this.realmIndex += 1;
    this.stats.maxHp += next.bonusHp;
    this.stats.hp = this.stats.maxHp;
    this.stats.atk += next.bonusAtk;
    this.stats.def += next.bonusDef;
    this.stats.combatPower = Math.round(this.stats.atk * 12 + this.stats.def * 8 + this.stats.maxHp * 0.4 + this.stats.level * 100);
    this.realmLabel.setText(next.name + ' · ' + next.stage);
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.stats);
    EventBus.emit(GameEvents.TOAST_MESSAGE, 'Đột phá thành công: ' + next.name + ' · ' + next.stage + '!');
    return true;
  }

  public restoreSnapshot(snapshot: Partial<{ stats: CharacterStats; exp: number; maxExp: number; gold: number; spirit: number; kills: number; questKills: number; realmIndex: number; inventory: InventoryEntry[]; equipment: Partial<Record<EquipmentSlot, InventoryEntry>>; questClaims: number; dailyClaimDate: string }>): void {
    if (snapshot.stats) this.stats = { ...this.stats, ...snapshot.stats };
    this.exp = Math.max(0, snapshot.exp ?? this.exp);
    this.maxExp = Math.max(1, snapshot.maxExp ?? this.maxExp);
    this.gold = Math.max(0, snapshot.gold ?? this.gold);
    this.spirit = Math.max(0, snapshot.spirit ?? this.spirit);
    this.kills = Math.max(0, snapshot.kills ?? this.kills);
    this.questKills = Math.max(0, snapshot.questKills ?? this.questKills);
    this.realmIndex = Math.min(CULTIVATION_REALMS.length - 1, Math.max(0, snapshot.realmIndex ?? this.realmIndex));
    this.inventory = Array.isArray(snapshot.inventory) ? snapshot.inventory : [];
    this.equipment = snapshot.equipment || {};
    const equipped = Object.values(this.equipment);
    (this as unknown as { gear: { atk: number; def: number; hp: number; mp: number } }).gear = {
      atk: equipped.reduce((sum, item) => sum + (item?.atk || 0), 0),
      def: equipped.reduce((sum, item) => sum + (item?.def || 0), 0),
      hp: equipped.reduce((sum, item) => sum + (item?.hp || 0), 0),
      mp: equipped.reduce((sum, item) => sum + (item?.mp || 0), 0)
    };
    this.questClaims = Math.max(0, snapshot.questClaims ?? 0);
    this.dailyClaimDate = snapshot.dailyClaimDate || '';
    const realm = CULTIVATION_REALMS[this.realmIndex];
    this.realmLabel.setText(realm.name + ' · ' + realm.stage);
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

    this.stats.combatPower = Math.round(this.stats.atk * 12 + this.stats.def * 8 + this.stats.maxHp * 0.4 + this.stats.maxMp * 0.25 + this.stats.level * 100);

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
