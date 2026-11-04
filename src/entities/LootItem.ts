import Phaser from 'phaser';
import { LootQuality, type LootItemData } from '../core/Types';
import { EventBus, GameEvents } from '../core/EventBus';

export class LootItem extends Phaser.GameObjects.Container {
  public dataItem: LootItemData;
  public collected = false;
  private glowArc: Phaser.GameObjects.Arc;
  private iconText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, itemData: LootItemData) {
    super(scene, x, y);
    this.dataItem = itemData;

    // Quality color glow
    const qualityColors: Record<LootQuality, number> = {
      [LootQuality.COMMON]: 0xffffff,
      [LootQuality.FINE]: 0x55ff55,
      [LootQuality.RARE]: 0x44aaff,
      [LootQuality.EPIC]: 0xbb55ff,
      [LootQuality.LEGENDARY]: 0xffaa00,
      [LootQuality.MYTHIC]: 0xff3344
    };
    const glowColor = qualityColors[itemData.quality] || itemData.color;

    this.glowArc = scene.add.circle(0, 0, 14, glowColor, 0.4);
    this.glowArc.setBlendMode(Phaser.BlendModes.ADD);
    this.add(this.glowArc);

    this.iconText = scene.add.text(0, 0, itemData.iconText, {
      fontSize: '14px',
      align: 'center'
    }).setOrigin(0.5);
    this.add(this.iconText);

    scene.add.existing(this);

    // Initial bounce drop animation
    const targetY = y;
    this.y = y - 30;
    scene.tweens.add({
      targets: this,
      y: targetY,
      duration: 400,
      ease: 'Bounce.easeOut'
    });

    // Floating idle pulse
    scene.tweens.add({
      targets: this.glowArc,
      scale: 1.4,
      alpha: 0.7,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  public attractTo(targetX: number, targetY: number, delta: number): void {
    if (this.collected) return;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 28) {
      this.collect();
      return;
    }

    const speed = 480 * (delta / 1000);
    this.x += (dx / dist) * Math.min(dist, speed);
    this.y += (dy / dist) * Math.min(dist, speed);
  }

  public collect(): void {
    if (this.collected) return;
    this.collected = true;

    // Sparkle burst
    this.scene.tweens.add({
      targets: this,
      scale: 1.8,
      alpha: 0,
      y: this.y - 25,
      duration: 250,
      onComplete: () => {
        EventBus.emit(GameEvents.LOOT_COLLECTED, this.dataItem);
        this.destroy();
      }
    });
  }
}
