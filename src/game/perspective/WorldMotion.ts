import { PlayerStateEnum } from '../../core/Types';
import { Player } from '../../entities/Player';
import { Monster } from '../../entities/Monster';

/** World-space motion. Rendering coordinates are assigned separately by PerspectiveProjector. */
export class WorldMotion {
  public update(player: Player, monsters: Monster[], deltaMs: number, autoEnabled: boolean): void {
    if (!autoEnabled || player.stateMachine.getCurrentStateName() === PlayerStateEnum.DEAD) return;

    const state = player.stateMachine.getCurrentStateName();
    const exploring = state === PlayerStateEnum.RUNNING || state === PlayerStateEnum.RESUMING || state === PlayerStateEnum.IDLE;
    if (exploring) {
      for (const monster of monsters) {
        if (monster.alive && monster.worldZ < 0.72) {
          monster.worldZ = Math.min(0.72, monster.worldZ + deltaMs * 0.000055);
        }
      }
    } else if (state === PlayerStateEnum.COMBAT || state === PlayerStateEnum.BOSS_COMBAT) {
      for (const monster of monsters) {
        if (monster.alive && monster.worldZ > 0.72) {
          monster.worldZ = Math.max(0.72, monster.worldZ - deltaMs * 0.00008);
        }
      }
    }
  }
}
