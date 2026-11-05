import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Monster } from '../entities/Monster';
import { MonsterStateEnum, type DamageResult, type SkillConfig } from '../core/Types';
import { EventBus, GameEvents } from '../core/EventBus';

export class CombatSystem {
  private scene: Phaser.Scene;
  private player: Player;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  public calculateDamage(attackerAtk: number, targetDef: number, critRate: number, critDmg: number, penetration = 0, multiplier = 1.0): DamageResult {
    const effectiveDef = Math.max(0, targetDef - penetration);
    const defenseMitigation = effectiveDef * 0.4;
    
    const variance = Phaser.Math.FloatBetween(0.92, 1.08);
    let rawDamage = Math.max(1, (attackerAtk * multiplier - defenseMitigation) * variance);

    const rollCrit = Math.random() < critRate;
    if (rollCrit) {
      rawDamage *= critDmg;
    }

    const finalDamage = Math.max(1, Math.round(rawDamage));
    return {
      damage: finalDamage,
      isCrit: rollCrit,
      isDead: false,
      targetX: 0,
      targetY: 0
    };
  }

  public performBasicAttack(target: Monster, _time: number): DamageResult | null {
    if (!target.alive) return null;

    const result = this.calculateDamage(
      this.player.stats.atk,
      target.config.def,
      this.player.stats.critRate,
      this.player.stats.critDmg,
      this.player.stats.penetration,
      1.0
    );

    result.targetX = target.x;
    result.targetY = target.y - 20;

    // Launch flying spiritual sword darting from player up to target
    this.spawnSwordProjectile(this.player.x + 15, this.player.y - 30, target.x, target.y, () => {
      if (!target.alive) return;
      const died = target.takeDamage(result.damage, result.isCrit);
      result.isDead = died;

      this.showDamageNumber(result.targetX, result.targetY, result.damage, result.isCrit);
      this.showSlashVfx(target.x, target.y, 0x88f0ff);

      EventBus.emit(GameEvents.MONSTER_DAMAGED, { monster: target, damage: result.damage, isCrit: result.isCrit });
      if (died) {
        EventBus.emit(GameEvents.MONSTER_DIED, target);
      }
    });

    return result;
  }

  public applySkillDamage(target: Monster, skill: SkillConfig, isUltimate = false): DamageResult | null {
    if (!target.alive) return null;

    const result = this.calculateDamage(
      this.player.stats.atk,
      target.config.def,
      this.player.stats.critRate + (isUltimate ? 0.3 : 0.05),
      this.player.stats.critDmg,
      this.player.stats.penetration,
      skill.damageMultiplier
    );

    result.targetX = target.x;
    result.targetY = target.y - 25;

    // Multi-sword barrage
    this.spawnSkillProjectile(this.player.x, this.player.y - 35, target.x, target.y, skill.color, () => {
      if (!target.alive) return;
      const died = target.takeDamage(result.damage, result.isCrit);
      result.isDead = died;

      this.showDamageNumber(result.targetX, result.targetY, result.damage, result.isCrit);
      this.showSlashVfx(target.x, target.y, skill.color, skill.name);

      EventBus.emit(GameEvents.MONSTER_DAMAGED, { monster: target, damage: result.damage, isCrit: result.isCrit });
      if (died) {
        EventBus.emit(GameEvents.MONSTER_DIED, target);
      }
    });

    return result;
  }

  private spawnSwordProjectile(fromX: number, fromY: number, toX: number, toY: number, onHit: () => void): void {
    const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
    const trail = this.scene.add.graphics().setDepth(9000);
    trail.lineStyle(10, 0x3deaff, 0.14);
    trail.lineBetween(fromX, fromY, toX, toY);
    trail.lineStyle(3, 0xc8fbff, 0.52);
    trail.lineBetween(fromX, fromY, toX, toY);
    trail.setBlendMode(Phaser.BlendModes.ADD);
    const glow = this.scene.add.circle(fromX, fromY, 13, 0x66efff, 0.24).setBlendMode(Phaser.BlendModes.ADD);
    const sword = this.scene.add.image(fromX, fromY, 'spirit_sword').setScale(0.92);
    sword.setTint(0xc9fbff);
    sword.rotation = angle + Math.PI / 2;
    sword.setBlendMode(Phaser.BlendModes.ADD);
    sword.setDepth(9001);
    glow.setDepth(9000);
    this.scene.tweens.add({
      targets: [sword, glow], x: toX, y: toY,
      duration: Phaser.Math.Clamp(260 - Phaser.Math.Distance.Between(fromX, fromY, toX, toY) * 0.12, 150, 260),
      ease: 'Cubic.easeIn',
      onUpdate: () => glow.setScale(0.85 + Math.sin(this.scene.time.now / 35) * 0.18),
      onComplete: () => {
        trail.destroy(); glow.destroy(); sword.destroy();
        const impact = this.scene.add.circle(toX, toY, 10, 0xb8fbff, 0.9).setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({ targets: impact, scale: 3.2, alpha: 0, duration: 180, onComplete: () => impact.destroy() });
        onHit();
      }
    });
  }

  private spawnSkillProjectile(fromX: number, fromY: number, toX: number, toY: number, color: number, onHit: () => void): void {
    const bolt = this.scene.add.circle(fromX, fromY, 8, color, 0.95);
    bolt.setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({
      targets: bolt,
      x: toX,
      y: toY,
      scale: 1.5,
      duration: 160,
      ease: 'Power2',
      onComplete: () => {
        bolt.destroy();
        onHit();
      }
    });
  }

  /**
   * Xianxia floating damage numbers (Bold Red/Gold Bạo Kích text matching screenshot)
   */
  public showDamageNumber(x: number, y: number, amount: number, isCrit = false): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = isCrit
      ? {
          fontFamily: 'system-ui, "Microsoft YaHei", sans-serif',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#ff2d2d',
          stroke: '#ffe680',
          strokeThickness: 4
        }
      : {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ffffff',
          stroke: '#401515',
          strokeThickness: 3
        };

    const displayText = isCrit ? `暴击 ${amount}` : `${amount}`;
    const txt = this.scene.add.text(x + Phaser.Math.Between(-15, 15), y - 10, displayText, textStyle).setOrigin(0.5);

    if (isCrit) {
      txt.setScale(0.5);
      this.scene.tweens.add({
        targets: txt,
        scale: 1.35,
        duration: 100,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    }

    this.scene.tweens.add({
      targets: txt,
      y: y - 55,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  public showSlashVfx(x: number, y: number, color: number, skillName?: string): void {
    const burst = this.scene.add.circle(x, y, 28, color, 0.85);
    burst.setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({
      targets: burst,
      scale: 2.2,
      alpha: 0,
      duration: 240,
      ease: 'Quad.easeOut',
      onComplete: () => burst.destroy()
    });

    if (skillName) {
      const banner = this.scene.add.text(x, y - 40, skillName, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fffae8',
        stroke: '#1b343d',
        strokeThickness: 3
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: banner,
        y: y - 22,
        alpha: 0,
        duration: 550,
        onComplete: () => banner.destroy()
      });
    }
  }

  public showUltimateVfx(): void {
    this.scene.cameras.main.shake(350, 0.015);

    const flash = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0xfff6dd,
      0.4
    );

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // Swarm of spiritual swords flying upward to the sky
    for (let i = 0; i < 12; i++) {
      const sword = this.scene.add.image(
        this.player.x + Phaser.Math.Between(-80, 80),
        this.player.y + Phaser.Math.Between(-10, 40),
        'spirit_sword'
      );
      sword.setScale(0.9);
      sword.setTint(0xffea66);
      sword.setAngle(-15 + Phaser.Math.Between(-10, 10));

      this.scene.tweens.add({
        targets: sword,
        y: this.scene.scale.height * 0.22 - Phaser.Math.Between(0, 60),
        x: sword.x + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: 350 + i * 30,
        ease: 'Cubic.easeIn',
        onComplete: () => sword.destroy()
      });
    }
  }

  public processMonsterAttack(monster: Monster, time: number): void {
    if (!monster.alive) return;
    if (Phaser.Math.Distance.Between(monster.x, monster.y, this.player.x, this.player.y) > monster.config.attackRange) return;
    if (time < monster.nextAttackTime) return;

    monster.nextAttackTime = time + monster.config.attackInterval;
    monster.stateMachine.transitionTo(MonsterStateEnum.ATTACK);

    // Telegraph the targeted lane before the projectile launches. Boss phases shorten
    // the warning slightly through their faster attack cadence, but never remove it.
    const targetX = this.player.x;
    const targetY = this.player.y - 15;
    const warning = this.scene.add.circle(targetX, this.player.y + 8, 28, 0xff3333, 0.16)
      .setStrokeStyle(2, 0xff5555, 0.9)
      .setDepth(9500);
    this.scene.tweens.add({
      targets: warning,
      scale: 1.35,
      alpha: 0.04,
      duration: 320,
      ease: 'Sine.easeIn',
      onComplete: () => {
        warning.destroy();
        if (!monster.alive || !this.player.active || this.player.stateMachine.getCurrentStateName() === 'DEAD') return;
        const orb = this.scene.add.circle(monster.x, monster.y + 15, 7, 0xff334f, 0.95).setDepth(9501);
        this.scene.tweens.add({
          targets: orb,
          x: targetX,
          y: targetY,
          duration: 250,
          onComplete: () => {
            orb.destroy();
            // Ignore late impacts after death and show the mitigated HP loss.
            if (!monster.alive || this.player.stateMachine.getCurrentStateName() === 'DEAD') return;
            const damageDealt = this.player.calculateIncomingDamage(monster.config.atk);
            const isPlayerDead = this.player.takeDamage(monster.config.atk);
            this.showDamageNumber(this.player.x, this.player.y - 45, damageDealt, false);
            if (isPlayerDead) {
              EventBus.emit(GameEvents.BATTLE_LOG, `☠ Bạn bị ${monster.config.name} trọng thương! Chờ hồi sinh...`);
            }
          }
        });
      }
    });
  }
}
