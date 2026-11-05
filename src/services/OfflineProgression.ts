import { EventBus, GameEvents } from '../core/EventBus';
import { Player } from '../entities/Player';

const SAVE_KEY = 'van-tien-luc-offline-v1';
const MAX_OFFLINE_SECONDS = 12 * 60 * 60;

interface OfflineSnapshot {
  savedAt: number;
}

/**
 * Local prototype offline rewards. Production must calculate and validate rewards server-side.
 * The timestamp is refreshed whenever the page is backgrounded or closed.
 */
export class OfflineProgression {
  public static claim(player: Player): number {
    const now = Date.now();
    let previous = now;

    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const snapshot = JSON.parse(raw) as OfflineSnapshot;
        if (Number.isFinite(snapshot.savedAt)) previous = snapshot.savedAt;
      }
    } catch {
      // Storage may be unavailable in private browsing; keep the game playable.
    }

    const elapsedSeconds = Math.max(0, Math.min(MAX_OFFLINE_SECONDS, Math.floor((now - previous) / 1000)));
    this.saveNow();

    if (elapsedSeconds < 60) return 0;

    const minutes = Math.floor(elapsedSeconds / 60);
    const exp = minutes * 8;
    const gold = minutes * 5;
    const spirit = Math.floor(minutes / 5);

    player.addExp(exp);
    player.gold += gold;
    player.spirit += spirit;
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, player.stats);
    EventBus.emit(
      GameEvents.TOAST_MESSAGE,
      `AFK ${Math.floor(minutes / 60)}h ${minutes % 60}p: +${exp} Tu vi, +${gold} Bạc, +${spirit} Linh thạch`
    );
    return elapsedSeconds;
  }

  public static saveNow(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ savedAt: Date.now() } satisfies OfflineSnapshot));
    } catch {
      // Ignore storage quota/privacy errors in this client-only prototype.
    }
  }

  public static bindLifecycle(player: Player): void {
    if (typeof window === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.saveNow();
      else if (document.visibilityState === 'visible') this.claim(player);
    });
    window.addEventListener('pagehide', () => this.saveNow());
  }
}
