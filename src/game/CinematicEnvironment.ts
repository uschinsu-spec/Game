import Phaser from 'phaser';

interface DriftCloud {
  root: Phaser.GameObjects.Container;
  speed: number;
  baseY: number;
}

interface SpiritMote {
  dot: Phaser.GameObjects.Arc;
  phase: number;
  speed: number;
  amplitude: number;
}

/**
 * Layered, lightweight 2.5D xianxia scenery.
 * All artwork is drawn with vector primitives so it scales cleanly on mobile.
 */
export class CinematicEnvironment {
  private scene: Phaser.Scene;
  private clouds: DriftCloud[] = [];
  private motes: SpiritMote[] = [];
  private staticLayers: Phaser.GameObjects.GameObject[] = [];
  private width = 0;
  private height = 0;
  private horizon = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public create(width: number, height: number, horizon: number): void {
    this.width = width;
    this.height = height;
    this.horizon = horizon;
    this.drawMountainLayers();
    this.drawFloatingSanctuary();
    this.createClouds();
    this.createSpiritMotes();
    this.drawAtmosphericLight();
  }

  private drawMountainLayers(): void {
    const { scene, width: w, horizon: y } = this;
    const far = scene.add.graphics().setDepth(3);
    this.staticLayers.push(far);
    far.fillStyle(0x9bc5c4, 0.22);
    far.beginPath();
    far.moveTo(0, y + 16);
    far.lineTo(w * .10, y - 36); far.lineTo(w * .20, y + 2);
    far.lineTo(w * .36, y - 58); far.lineTo(w * .49, y + 1);
    far.lineTo(w * .68, y - 48); far.lineTo(w * .81, y + 3);
    far.lineTo(w * .93, y - 30); far.lineTo(w, y + 14);
    far.closePath(); far.fillPath();

    const mid = scene.add.graphics().setDepth(4);
    this.staticLayers.push(mid);
    mid.fillStyle(0x426f78, 0.34);
    mid.beginPath();
    mid.moveTo(0, y + 30);
    mid.lineTo(w * .13, y - 8); mid.lineTo(w * .26, y + 22);
    mid.lineTo(w * .43, y - 25); mid.lineTo(w * .58, y + 17);
    mid.lineTo(w * .76, y - 13); mid.lineTo(w * .91, y + 24);
    mid.lineTo(w, y + 8); mid.lineTo(w, y + 44); mid.lineTo(0, y + 44);
    mid.closePath(); mid.fillPath();

    const ridge = scene.add.graphics().setDepth(5);
    this.staticLayers.push(ridge);
    ridge.lineStyle(1.5, 0xd9eee0, 0.2);
    ridge.beginPath();
    ridge.moveTo(0, y + 20); ridge.lineTo(w * .13, y - 8);
    ridge.lineTo(w * .26, y + 22); ridge.lineTo(w * .43, y - 25);
    ridge.lineTo(w * .58, y + 17); ridge.lineTo(w * .76, y - 13);
    ridge.lineTo(w * .91, y + 24); ridge.strokePath();
  }

  private drawFloatingSanctuary(): void {
    const { scene, width: w, horizon: y } = this;
    const island = scene.add.container(w * .78, y - 38).setDepth(6).setAlpha(.72);
    this.staticLayers.push(island);
    const glow = scene.add.ellipse(0, 28, 112, 20, 0xb5f4df, .15);
    const rock = scene.add.triangle(0, 18, -52, 0, 50, 0, 0, 52, 0x385d68, .9);
    const terrace = scene.add.ellipse(0, 0, 116, 18, 0x8bb6a9, .9).setStrokeStyle(2, 0xd5d5a3, .6);
    const hall = scene.add.graphics();
    hall.fillStyle(0x244653, .95);
    hall.fillRect(-21, -28, 42, 29);
    hall.fillStyle(0xcba96a, .95);
    hall.fillTriangle(-30, -27, 0, -49, 30, -27);
    hall.fillStyle(0x8c6545, 1);
    hall.fillRect(-25, -30, 50, 4);
    hall.fillStyle(0x9cd8ce, .9);
    hall.fillRect(-3, -18, 6, 17);
    island.add([glow, rock, terrace, hall]);
    scene.tweens.add({ targets: island, y: island.y - 5, duration: 3600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const distantPeak = scene.add.graphics().setDepth(5);
    this.staticLayers.push(distantPeak);
    distantPeak.fillStyle(0x244c5b, .42);
    distantPeak.fillTriangle(w * .19, y + 5, w * .28, y - 76, w * .39, y + 5);
    distantPeak.fillStyle(0xe0eee1, .35);
    distantPeak.fillTriangle(w * .28, y - 76, w * .255, y - 49, w * .30, y - 48);
  }

  private createClouds(): void {
    const specs = [
      { x: .17, y: .22, scale: .85, speed: 8 },
      { x: .60, y: .15, scale: 1.1, speed: -5 },
      { x: .88, y: .27, scale: .68, speed: 6 }
    ];
    for (const spec of specs) {
      const root = this.scene.add.container(this.width * spec.x, this.height * spec.y).setDepth(7).setAlpha(.34);
      const cloud = this.scene.add.graphics();
      cloud.fillStyle(0xf4f2d9, .55);
      cloud.fillEllipse(-24, 4, 62, 17);
      cloud.fillEllipse(0, -3, 54, 23);
      cloud.fillEllipse(27, 5, 58, 16);
      cloud.lineStyle(1, 0xffffff, .24);
      cloud.strokeEllipse(0, 4, 91, 17);
      root.add(cloud);
      root.setScale(spec.scale);
      this.clouds.push({ root, speed: spec.speed, baseY: root.y });
    }
  }

  private createSpiritMotes(): void {
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(8, Math.max(9, this.width - 8));
      const y = Phaser.Math.Between(this.horizon * .12, this.height * .68);
      const dot = this.scene.add.circle(x, y, Phaser.Math.FloatBetween(1, 2.3), 0xd9fff0, .5)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(8);
      this.motes.push({
        dot,
        phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        speed: Phaser.Math.FloatBetween(.35, 1.1),
        amplitude: Phaser.Math.FloatBetween(3, 12)
      });
    }
  }

  private drawAtmosphericLight(): void {
    const light = this.scene.add.graphics().setDepth(2);
    this.staticLayers.push(light);
    light.fillStyle(0xffe7a8, .08);
    light.fillTriangle(this.width * .5, this.horizon - 30, this.width * .12, this.horizon + 5, this.width * .88, this.horizon + 5);
    light.fillStyle(0xb5f8ef, .045);
    light.fillEllipse(this.width * .5, this.horizon + 4, this.width * .9, 34);
  }

  public update(time: number, delta: number): void {
    const dt = Math.min(delta, 50) / 1000;
    for (const cloud of this.clouds) {
      cloud.root.x += cloud.speed * dt;
      if (cloud.root.x > this.width + 70) cloud.root.x = -70;
      if (cloud.root.x < -70) cloud.root.x = this.width + 70;
      cloud.root.y = cloud.baseY + Math.sin(time / 2600 + cloud.root.x * .01) * 2;
    }
    for (const mote of this.motes) {
      mote.phase += mote.speed * dt;
      mote.dot.y -= mote.speed * 2 * dt;
      mote.dot.x += Math.sin(mote.phase) * mote.amplitude * dt;
      mote.dot.alpha = .2 + (Math.sin(mote.phase * 1.8) + 1) * .32;
      if (mote.dot.y < this.horizon * .08) {
        mote.dot.y = this.height * Phaser.Math.FloatBetween(.38, .7);
        mote.dot.x = Phaser.Math.Between(8, Math.max(9, this.width - 8));
      }
    }
  }

  public resize(width: number, height: number): void {
    // Recreate only on scene resize to keep the artwork aligned with the new horizon.
    this.clouds.forEach(({ root }) => root.destroy());
    this.motes.forEach(({ dot }) => dot.destroy());
    this.clouds = [];
    this.motes = [];
    this.width = width;
    this.height = height;
    this.horizon = height * .28;
    this.create(width, height, this.horizon);
  }
}
