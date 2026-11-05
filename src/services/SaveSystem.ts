import { EventBus, GameEvents } from '../core/EventBus';
import { Player } from '../entities/Player';
import type { CharacterStats, InventoryEntry, EquipmentSlot } from '../core/Types';

const SAVE_KEY = 'van-tien-luc-save-v3';
const LEGACY_SAVE_KEY = 'van-tien-luc-save-v2';
const MAX_OFFLINE_SECONDS = 12 * 60 * 60;

interface SaveSnapshot {
  version: 2 | 3;
  savedAt: number;
  stats: CharacterStats;
  exp: number;
  maxExp: number;
  cultivationExp: number;
  gold: number;
  spirit: number;
  kills: number;
  questKills: number;
  realmIndex: number;
  inventory: InventoryEntry[];
  equipment: Partial<Record<EquipmentSlot, InventoryEntry>>;
  questClaims: number;
  dailyClaimDate: string;
}

export class SaveSystem {
  static load(player: Player): number {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY);
      if (!raw) {
        // Migrate the previous prototype's timestamp-only AFK record once.
        const legacyRaw = localStorage.getItem('van-tien-luc-offline-v1');
        if (!legacyRaw) return 0;
        const legacy = JSON.parse(legacyRaw) as { savedAt?: number };
        const elapsed = Number.isFinite(legacy.savedAt)
          ? Math.max(0, Math.min(MAX_OFFLINE_SECONDS, Math.floor((Date.now() - (legacy.savedAt as number)) / 1000)))
          : 0;
        localStorage.removeItem('van-tien-luc-offline-v1');
        return elapsed;
      }
      const snapshot = JSON.parse(raw) as SaveSnapshot;
      if (![2, 3].includes(snapshot.version) || !Number.isFinite(snapshot.savedAt)) return 0;
      const legacyRealmMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11];
      const migratedRealmIndex = snapshot.version === 2
        ? legacyRealmMap[snapshot.realmIndex] ?? Math.min(35, snapshot.realmIndex)
        : snapshot.realmIndex;
      player.restoreSnapshot({ ...snapshot, realmIndex: migratedRealmIndex });
      return Math.max(0, Math.min(MAX_OFFLINE_SECONDS, Math.floor((Date.now() - snapshot.savedAt) / 1000)));
    } catch {
      return 0;
    }
  }

  static save(player: Player): void {
    try {
      const snapshot: SaveSnapshot = {
        version: 3,
        savedAt: Date.now(),
        stats: { ...player.stats },
        exp: player.exp,
        maxExp: player.maxExp,
        cultivationExp: player.cultivationExp,
        gold: player.gold,
        spirit: player.spirit,
        kills: player.kills,
        questKills: player.questKills,
        realmIndex: player.realmIndex,
        inventory: player.inventory.map(item => ({ ...item })),
        equipment: Object.fromEntries(Object.entries(player.equipment).map(([slot, item]) => [slot, item ? { ...item } : undefined])),
        questClaims: player.questClaims,
        dailyClaimDate: player.dailyClaimDate
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    } catch {
      // Keep the current session playable when browser storage is unavailable.
    }
  }

  static bind(player: Player): void {
    if (typeof window === 'undefined') return;
    let hiddenAt: number | null = null;
    const save = () => this.save(player);
    EventBus.on(GameEvents.PLAYER_STATS_CHANGED, save);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        save();
      } else if (document.visibilityState === 'visible' && hiddenAt !== null) {
        const elapsed = Math.max(0, Math.min(MAX_OFFLINE_SECONDS, Math.floor((Date.now() - hiddenAt) / 1000)));
        hiddenAt = null;
        if (elapsed >= 60) this.grantOfflineRewards(player, elapsed);
        save();
      }
    });
    window.setInterval(() => { if (document.visibilityState === 'visible') save(); }, 15000);
  }

  static grantOfflineRewards(player: Player, elapsedSeconds: number): void {
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 1) return;
    const exp = Math.floor(minutes * 700 / 60);
    const gold = minutes * 4;
    const spirit = Math.floor(minutes / 8);
    player.addExp(exp);
    player.gainResources(gold, spirit);
    EventBus.emit(GameEvents.TOAST_MESSAGE, 'AFK ' + Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'p: +' + exp + ' tu vi, +' + gold + ' bạc, +' + spirit + ' linh thạch');
  }
}
