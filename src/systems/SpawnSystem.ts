import Phaser from 'phaser';
import { Monster } from '../entities/Monster';
import { MONSTERS_DATA } from '../data/monsters.data';
import { EventBus, GameEvents } from '../core/EventBus';

export class SpawnSystem {
  private scene: Phaser.Scene;
  private monsters: Monster[] = [];
  private killCounter = 0;
  private arenaY: number;

  constructor(scene: Phaser.Scene, arenaY: number) {
    this.scene = scene;
    this.arenaY = arenaY;
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
      this.killCounter += 3;
      const w = this.scene.scale.width;

      if (this.killCounter % 15 === 0) {
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

  public spawnMonster(x: number, y: number, templateKey: string): Monster {
    const config = MONSTERS_DATA[templateKey] || MONSTERS_DATA.eye_normal;
    const monster = new Monster(this.scene, x, y, config);
    this.monsters.push(monster);
    EventBus.emit(GameEvents.MONSTER_SPAWNED, monster);
    return monster;
  }
}
