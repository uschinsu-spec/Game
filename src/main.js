import { MainGameScene, W, H } from './scenes/MainScene.js';
import { installTouchInputOptimization } from './scenes/mixins/TouchInputOptimization.js?v=20260928-safe-touch-2908207';
import { installUiCloseButtonOptimization } from './scenes/mixins/UiCloseButtonOptimization.js?v=20260928-close-daf1cd9';
import { installFullscreenModalOptimization } from './scenes/mixins/FullscreenModalOptimization.js?v=20260928-bright-modal-ed67031';
import { installTransparentBottomMenuOptimization } from './scenes/mixins/TransparentBottomMenuOptimization.js?v=20260928-transparent-nav-518b6b2';
import { installSimpleCraftingUI } from './scenes/mixins/SimpleCraftingUI.js?v=20260928-simple-crafting-ffe7105';
import { installSimplePrimaryUI } from './scenes/mixins/SimplePrimaryUI.js?v=20260928-simple-primary-932c701';
import { installSimpleCongPhapHomeUI } from './scenes/mixins/SimpleCongPhapHomeUI.js?v=20260928-single-line-congphap-22fa3d0';
import { installSimpleWelcomeUI } from './scenes/mixins/SimpleWelcomeUI.js?v=20260928-welcome-fullscreen-d18e1e9';
import { installSimpleNpcFullscreenUI } from './scenes/mixins/SimpleNpcFullscreenUI.js?v=20260928-npc-fullscreen-d9ed7f8';
import { installSimpleSkillFullscreenUI } from './scenes/mixins/SimpleSkillFullscreenUI.js?v=20260928-skill-fullscreen-1d6de02';
import { installStarterGiftResourceOnly } from './scenes/mixins/StarterGiftResourceOnly.js?v=20260928-starter-resource-only-16f2fc3';
import { installEarlyGamePharmacopeia } from './scenes/mixins/EarlyGamePharmacopeia.js?v=20260928-common-herbs-1af431a';
import { installCommonPillRankUiFix } from './scenes/mixins/CommonPillRankUiFix.js?v=20260928-common-pill-ui-b25b6a2';
import { installUiGameplayPauseOptimization } from './scenes/mixins/UiGameplayPauseOptimization.js?v=20260928-hard-pause-2e30108';
import { installUnifiedUiMapIsolation } from './scenes/mixins/UnifiedUiMapIsolation.js?v=20260928-bright-isolation-29997cc';

installTouchInputOptimization(MainGameScene);
installUiCloseButtonOptimization(MainGameScene);
installFullscreenModalOptimization(MainGameScene);
installTransparentBottomMenuOptimization(MainGameScene);
installSimpleCraftingUI(MainGameScene);
installSimplePrimaryUI(MainGameScene);
installSimpleCongPhapHomeUI(MainGameScene);
installSimpleWelcomeUI(MainGameScene);
installSimpleNpcFullscreenUI(MainGameScene);
installSimpleSkillFullscreenUI(MainGameScene);
installStarterGiftResourceOnly(MainGameScene);
installEarlyGamePharmacopeia(MainGameScene);
installCommonPillRankUiFix(MainGameScene);
// Hard pause must wrap all final gameplay/UI methods first.
installUiGameplayPauseOptimization(MainGameScene);
// MUST be absolutely last: normalizes every modal child to screen-space and disables
// all world/HUD input behind it, so 32,000px combat maps behave exactly like Map 0.
installUnifiedUiMapIsolation(MainGameScene);

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

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  window.game = new Phaser.Game(config);
} else {
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new Phaser.Game(config);
  });
}
