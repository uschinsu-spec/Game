import Phaser from 'phaser';
import './style.css';
import { WorldScene } from './game/WorldScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#91b8b2',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: 390, height: 844 },
  render: { antialias: true, pixelArt: false, roundPixels: true },
  fps: { target: 60, forceSetTimeOut: false },
  scene: [WorldScene]
};

const game = new Phaser.Game(config);
(window as Window & { game?: Phaser.Game }).game = game;
