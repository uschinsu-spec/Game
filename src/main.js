import { MainGameScene, W, H } from './scenes/MainScene.js';
import { installTouchInputOptimization } from './scenes/mixins/TouchInputOptimization.js';

installTouchInputOptimization(MainGameScene);

export const config = {
  type: Phaser.AUTO,
  width: W || 540,
  height: H || 960,
  parent: 'game',
  backgroundColor: '#061118',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainGameScene],
  input: {
    touch: {
      capture: true
    },
    activePointers: 3
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// Khởi động game ngay khi DOM sẵn sàng hoặc window load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  window.game = new Phaser.Game(config);
} else {
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new Phaser.Game(config);
  });
}
