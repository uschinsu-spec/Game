import { MainGameScene, W, H } from './scenes/MainScene.js';
import { installTouchInputOptimization } from './scenes/mixins/TouchInputOptimization.js?v=20260928-safe-touch-2908207';
import { installUiCloseButtonOptimization } from './scenes/mixins/UiCloseButtonOptimization.js?v=20260928-close-daf1cd9';
import { installFullscreenModalOptimization } from './scenes/mixins/FullscreenModalOptimization.js?v=20260928-modal-freeze-bb97445';
import { installSimpleCraftingUI } from './scenes/mixins/SimpleCraftingUI.js?v=20260928-simple-crafting-ffe7105';
import { installSimplePrimaryUI } from './scenes/mixins/SimplePrimaryUI.js?v=20260928-simple-primary-932c701';
import { installSimpleCongPhapHomeUI } from './scenes/mixins/SimpleCongPhapHomeUI.js?v=20260928-simple-congphap-6057cd6';
import { installSimpleWelcomeUI } from './scenes/mixins/SimpleWelcomeUI.js?v=20260928-welcome-fullscreen-d18e1e9';
import { installUiGameplayPauseOptimization } from './scenes/mixins/UiGameplayPauseOptimization.js?v=20260928-safe-mode-29e7e99';

installTouchInputOptimization(MainGameScene);
installUiCloseButtonOptimization(MainGameScene);
installFullscreenModalOptimization(MainGameScene);
installSimpleCraftingUI(MainGameScene);
installSimplePrimaryUI(MainGameScene);
installSimpleCongPhapHomeUI(MainGameScene);
installSimpleWelcomeUI(MainGameScene);
installUiGameplayPauseOptimization(MainGameScene);

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
