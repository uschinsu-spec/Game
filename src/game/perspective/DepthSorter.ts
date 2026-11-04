import Phaser from 'phaser';

/** Sorts perspective containers by projected ground position, back to front. */
export class DepthSorter {
  public sort(scene: Phaser.Scene, entities: Phaser.GameObjects.GameObject[]): void {
    const sorted = entities
      .filter((entity): entity is Phaser.GameObjects.Container => entity instanceof Phaser.GameObjects.Container && entity.active)
      .sort((a, b) => a.y - b.y);

    sorted.forEach((entity, index) => entity.setDepth(100 + index));
  }
}
