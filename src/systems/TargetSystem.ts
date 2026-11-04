import { Monster } from '../entities/Monster';
import { Player } from '../entities/Player';

export class TargetSystem {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /** Targets are selected in world-space, not from projected pixel positions. */
  public getMonstersInRange(monsters: Monster[], maxDistance = 0.62): Monster[] {
    return monsters.filter((m) => m.alive && m.active && m.worldZ >= 0.48 && this.worldDistance(m) <= maxDistance);
  }

  public selectPrimaryTarget(monsters: Monster[], maxRange = 0.62): Monster | null {
    const candidates = this.getMonstersInRange(monsters, maxRange);
    candidates.sort((a, b) => this.worldDistance(a) - this.worldDistance(b));
    return candidates[0] ?? null;
  }

  private worldDistance(monster: Monster): number {
    const playerLane = 0;
    const playerDepth = 0.72;
    const dx = (monster.worldX - playerLane) * 0.72;
    const dz = monster.worldZ - playerDepth;
    return Math.sqrt(dx * dx + dz * dz);
  }

  public selectAoeTargets(monsters: Monster[], primaryTarget: Monster, count: number, aoeRadius = 0.28): Monster[] {
    return monsters
      .filter(m => m.alive && m.active)
      .map(m => ({ monster: m, distance: Math.hypot(m.worldX - primaryTarget.worldX, m.worldZ - primaryTarget.worldZ) }))
      .filter(item => item.distance <= aoeRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
      .map(item => item.monster);
  }
}
