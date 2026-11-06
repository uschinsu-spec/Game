import Phaser from 'phaser';
import { Monster } from '../entities/Monster';
import { MONSTERS_DATA } from '../data/monsters.data';
import { EventBus, GameEvents } from '../core/EventBus';

export class SpawnSystem {
  private scene: Phaser.Scene;
  private monsters: Monster[] = [];
  private killCounter = 0;
  private arenaY: number;
  private emptySince = 0;
  private readonly waveDelayMs = 1400;
  private lastManualBossAt = -60000;
  private getPlayerLevel: () => number;
  private getPlayerRealm: () => number;
  private dungeonActive = false;
  private dungeonWave = 0;
  private readonly dungeonWaveCount = 5;

  constructor(scene: Phaser.Scene, arenaY: number, getPlayerLevel: () => number = () => 1, getPlayerRealm: () => number = () => 0) {
    this.scene = scene;
    this.arenaY = arenaY;
    this.getPlayerLevel = getPlayerLevel;
    this.getPlayerRealm = getPlayerRealm;
  }

  public setArenaY(y: number): void {
    this.arenaY = y;
  }

  public getMonsters(): Monster[] {
    return this.monsters;
  }

  public spawnInitialWave(): void {
    const w = this.scene.scale.width;
    this.spawnMonster(w * 0.28, this.arenaY + Phaser.Math.Between(-15, 15), 'eye_normal');
    this.spawnMonster(w * 0.50, this.arenaY - 10, 'eye_normal');
    this.spawnMonster(w * 0.72, this.arenaY + Phaser.Math.Between(-15, 15), 'eye_normal');
  }

  public isDungeonActive(): boolean { return this.dungeonActive; }

  public startDungeon(): boolean {
    if (this.dungeonActive) return false;
    this.dungeonActive = true;
    this.dungeonWave = 1;
    this.emptySince = 0;
    if (this.monsters.length === 0) this.spawnDungeonWave();
    EventBus.emit(GameEvents.BATTLE_LOG, '🏯 Bí cảnh mở cửa — vượt qua 5 tầng thử thách!');
    EventBus.emit(GameEvents.TOAST_MESSAGE, 'Bắt đầu Bí Cảnh Trảm Yêu!');
    return true;
  }

  private spawnDungeonWave(): void {
    const w = this.scene.scale.width;
    const scale = 1 + (this.dungeonWave - 1) * 0.18;
    const spawn = (x: number, key: string) => {
      const monster = this.spawnMonster(x, this.arenaY + Phaser.Math.Between(-12, 12), key);
      monster.applyDifficultyMultiplier(scale);
      monster.drawHpBar();
    };
    if (this.dungeonWave === this.dungeonWaveCount) {
      spawn(w * 0.5, 'eye_boss');
      spawn(w * 0.28, 'eye_elite');
      spawn(w * 0.72, 'eye_elite');
    } else {
      spawn(w * 0.28, 'eye_normal');
      spawn(w * 0.5, this.dungeonWave >= 3 ? 'eye_elite' : 'eye_normal');
      spawn(w * 0.72, 'eye_normal');
    }
    EventBus.emit(GameEvents.TOAST_MESSAGE, `Bí cảnh: Tầng ${this.dungeonWave}/${this.dungeonWaveCount}`);
  }

  public update(): void {
    // Clean up dead/destroyed monsters from active list
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      if (!m.alive || !m.active) {
        this.monsters.splice(i, 1);
      }
    }

    // If all monsters defeated, spawn the next wave!
    if (this.monsters.length === 0) {
      if (this.emptySince === 0) this.emptySince = this.scene.time.now;
      if (this.scene.time.now - this.emptySince < this.waveDelayMs) return;
      this.emptySince = 0;
      if (this.dungeonActive) {
        if (this.dungeonWave >= this.dungeonWaveCount) {
          this.dungeonActive = false;
          EventBus.emit(GameEvents.DUNGEON_COMPLETED);
          EventBus.emit(GameEvents.BATTLE_LOG, '🏆 Bí cảnh hoàn thành!');
        } else {
          this.dungeonWave += 1;
          this.spawnDungeonWave();
        }
        return;
      }
      this.killCounter += 3;
      const w = this.scene.scale.width;

      if (this.killCounter % 450 === 0) {
        // Boss Wave!
        this.spawnMonster(w * 0.5, this.arenaY - 10, 'eye_boss');
        this.spawnMonster(w * 0.25, this.arenaY + 15, 'eye_elite');
        this.spawnMonster(w * 0.75, this.arenaY + 15, 'eye_elite');
        EventBus.emit(GameEvents.TOAST_MESSAGE, '⚠️ CẢNH BÁO: Thiên Mục Ma Quân xuất hiện!');
        EventBus.emit(GameEvents.BATTLE_LOG, '⚠️ Hư Không Yêu Vương giáng lâm! Chuẩn bị nghênh chiến!');
      } else if (this.killCounter % 6 === 0) {
        // Elite Wave
        this.spawnMonster(w * 0.35, this.arenaY, 'eye_elite');
        this.spawnMonster(w * 0.65, this.arenaY, 'eye_normal');
      } else {
        // Normal Wave (2-3 monsters spread across the sea)
        this.spawnMonster(w * 0.3, this.arenaY + Phaser.Math.Between(-10, 10), 'eye_normal');
        this.spawnMonster(w * 0.5, this.arenaY - 5, 'eye_normal');
        this.spawnMonster(w * 0.7, this.arenaY + Phaser.Math.Between(-10, 10), 'eye_normal');
      }
    }
  }

  public canSpawnBossWave(): boolean {
    if (this.monsters.some((monster) => monster.alive && monster.config.isBoss)) {
      EventBus.emit(GameEvents.TOAST_MESSAGE, 'Boss đã xuất hiện trên chiến trường!');
      return false;
    }
    if (this.scene.time.now - this.lastManualBossAt < 60000) {
      EventBus.emit(GameEvents.TOAST_MESSAGE, 'Săn Boss đang hồi chiêu. Vui lòng chờ!');
      return false;
    }
    return true;
  }

  public spawnBossWave(): boolean {
    if (!this.canSpawnBossWave()) return false;
    this.lastManualBossAt = this.scene.time.now;
    const w = this.scene.scale.width;
    this.spawnMonster(w * 0.5, this.arenaY - 10, 'eye_boss');
    this.spawnMonster(w * 0.28, this.arenaY + 12, 'eye_elite');
    this.spawnMonster(w * 0.72, this.arenaY + 12, 'eye_elite');
    EventBus.emit(GameEvents.TOAST_MESSAGE, 'Boss lĩnh chủ được triệu hồi!');
    EventBus.emit(GameEvents.BATTLE_LOG, '⚠️ Đạo hữu chủ động khiêu chiến Boss lĩnh chủ!');
    return true;
  }

  public spawnMonster(x: number, y: number, templateKey: string): Monster {
    const base = MONSTERS_DATA[templateKey] || MONSTERS_DATA.eye_normal;
    const level = Math.max(base.level, this.getPlayerLevel());
    const levelGap = Math.min(20, level - base.level);
    const config = {
      ...base,
      level,
      maxHp: Math.round(base.maxHp * (1 + levelGap * 0.16)),
      atk: Math.round(base.atk * (1 + levelGap * 0.10)),
      def: Math.round(base.def * (1 + levelGap * 0.08)),
      expReward: Math.round([49, 59, 70, 84, 102, 119, 140, 168, 210][Math.min(8, Math.max(0, Math.floor(this.getPlayerRealm())))] * (templateKey === 'eye_elite' ? 3 : templateKey === 'eye_boss' ? 8 : 1)),
      goldReward: Math.round(base.goldReward * (1 + levelGap * 0.08)),
      spiritReward: base.spiritReward + Math.floor(levelGap / 5)
    };
    const monster = new Monster(this.scene, x, y, config);
    monster.worldZ = templateKey === 'eye_boss' ? 0.025 : templateKey === 'eye_elite' ? 0.045 : Phaser.Math.FloatBetween(0.025, 0.075);
    this.monsters.push(monster);
    EventBus.emit(GameEvents.MONSTER_SPAWNED, monster);
    return monster;
  }
}
