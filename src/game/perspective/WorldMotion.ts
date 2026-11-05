import { PlayerStateEnum } from '../../core/Types';
import { Player } from '../../entities/Player';
import { Monster } from '../../entities/Monster';

/**
 * Ranged combat keeps a visible lane between hero and enemies.
 * z=0 is the horizon and z=1 is closest to the camera/player.
 */
export class WorldMotion {
  private static readonly RANGED_STANDOFF_DEPTH = 0.48;
  private static readonly APPROACH_PER_MS = 0.0001;
  private static readonly RETREAT_PER_MS = 0.00014;

  public update(player: Player, monsters: Monster[], deltaMs: number, autoEnabled: boolean): void {
    if (!autoEnabled || player.stateMachine.getCurrentStateName() === PlayerStateEnum.DEAD) return;

    const standoff = WorldMotion.RANGED_STANDOFF_DEPTH;
    for (const monster of monsters) {
      if (!monster.active || !monster.alive) continue;

      // Enemies stop in the middle distance instead of closing into melee range.
      if (monster.worldZ < standoff) {
        monster.worldZ = Math.min(standoff, monster.worldZ + deltaMs * WorldMotion.APPROACH_PER_MS);
      } else if (monster.worldZ > standoff) {
        // Recover gracefully if an enemy was already too close before this update.
        monster.worldZ = Math.max(standoff, monster.worldZ - deltaMs * WorldMotion.RETREAT_PER_MS);
      }
    }
  }
}
