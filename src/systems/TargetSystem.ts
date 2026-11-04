import { Monster } from '../entities/Monster';
import { Player } from '../entities/Player';

export class TargetSystem {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public getMonstersInRange(monsters: Monster[], _maxDistance = 500): Monster[] {
    return monsters.filter((m) => m.alive && m.active);
  }

  public selectPrimaryTarget(monsters: Monster[], _maxRange?: number): Monster | null {
    const aliveMonsters = monsters.filter(m => m.alive && m.active);
    if (aliveMonsters.length === 0) return null;

    aliveMonsters.sort((a, b) => {
      // 1. Boss priority
      if (a.config.isBoss && !b.config.isBoss) return -1;
      if (!a.config.isBoss && b.config.isBoss) return 1;

      // 2. Distance to player
      const distA = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
      const distB = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
      return distA - distB;
    });

    return aliveMonsters[0] || null;
  }

  public selectAoeTargets(monsters: Monster[], primaryTarget: Monster, count: number, aoeRadius = 160): Monster[] {
    const aliveMonsters = monsters.filter(m => m.alive && m.active);
    const inAoe = aliveMonsters.filter(m => {
      const dist = Phaser.Math.Distance.Between(primaryTarget.x, primaryTarget.y, m.x, m.y);
      return dist <= aoeRadius;
    });

    inAoe.sort((a, b) => {
      const distA = Phaser.Math.Distance.Between(primaryTarget.x, primaryTarget.y, a.x, a.y);
      const distB = Phaser.Math.Distance.Between(primaryTarget.x, primaryTarget.y, b.x, b.y);
      return distA - distB;
    });

    return inAoe.slice(0, count);
  }
}
