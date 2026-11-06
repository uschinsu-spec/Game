import { PlayerStateEnum } from '../../core/Types';
import { Player } from '../../entities/Player';
import { Monster } from '../../entities/Monster';

/**
 * Ranged combat keeps a visible lane between hero and enemies.
 * z=0 is the horizon and z=1 is closest to the camera/player.
 */
export class WorldMotion {
  // Keep enemies farther back: at this depth the perspective projection leaves
  // a clear visual gap above the hero at y=68% of the viewport.
  private static readonly RANGED_STANDOFF_DEPTH = 0.36;
  private static readonly APPROACH_PER_MS = 0.0001;
  private static readonly RETREAT_PER_MS = 0.00018;

  public update(player: Player, monsters: Monster[], deltaMs: number, autoEnabled: boolean): void {
    if (!autoEnabled || player.stateMachine.getCurrentStateName() === PlayerStateEnum.DEAD) return;

    const standoff = WorldMotion.RANGED_STANDOFF_DEPTH;
    for (const monster of monsters) {
      if (!monster.active || !monster.alive) continue;

      // Enemies approach only to the back edge of the mid-distance lane.
      // Clamp both sides so old saves/spawns cannot leave enemies crowding the hero.
      if (monster.worldZ < standoff) {
        monster.worldZ = Math.min(standoff, monster.worldZ + deltaMs * WorldMotion.APPROACH_PER_MS);
      } else if (monster.worldZ > standoff) {
        monster.worldZ = Math.max(standoff, monster.worldZ - deltaMs * WorldMotion.RETREAT_PER_MS);
      }
    }
  }
}
