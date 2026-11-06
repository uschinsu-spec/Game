import { PlayerStateEnum } from '../../core/Types';
import { Player } from '../../entities/Player';
import { Monster } from '../../entities/Monster';

/**
 * Ranged combat keeps a visible lane between hero and enemies.
 * z=0 is the horizon and z=1 is closest to the camera/player.
 */
export class WorldMotion {
  // Lower depth moves enemies farther toward the horizon, widening the gap above the hero.
  private static readonly RANGED_STANDOFF_DEPTH = 0.24;
  private static readonly APPROACH_PER_MS = 0.0001;
  private static readonly RETREAT_PER_MS = 0.00018;

  public update(player: Player, monsters: Monster[], deltaMs: number, autoEnabled: boolean): void {
    if (!autoEnabled || player.stateMachine.getCurrentStateName() === PlayerStateEnum.DEAD) return;

    const standoff = WorldMotion.RANGED_STANDOFF_DEPTH;
    for (const monster of monsters) {
      if (!monster.active || !monster.alive) continue;

      // Approach only to the back edge of the farther-distance lane.
      // Clamp both sides so older spawns cannot crowd the hero.
      if (monster.worldZ < standoff) {
        monster.worldZ = Math.min(standoff, monster.worldZ + deltaMs * WorldMotion.APPROACH_PER_MS);
      } else if (monster.worldZ > standoff) {
        monster.worldZ = Math.max(standoff, monster.worldZ - deltaMs * WorldMotion.RETREAT_PER_MS);
      }
    }
  }
}
