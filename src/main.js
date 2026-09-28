import { MainGameScene, W, H } from './scenes/MainScene.js?v=20260928-thanh-van-image-hub-v3';
import { installTouchInputOptimization } from './scenes/mixins/TouchInputOptimization.js?v=20260928-safe-touch-2908207';
import { installUiCloseButtonOptimization } from './scenes/mixins/UiCloseButtonOptimization.js?v=20260928-close-daf1cd9';
import { installFullscreenModalOptimization } from './scenes/mixins/FullscreenModalOptimization.js?v=20260928-bright-modal-ed67031';
import { installTransparentBottomMenuOptimization } from './scenes/mixins/TransparentBottomMenuOptimization.js?v=20260928-transparent-nav-518b6b2';
import { installSimpleCraftingUI } from './scenes/mixins/SimpleCraftingUI.js?v=20260928-simple-crafting-ffe7105';
import { installSimplePrimaryUI } from './scenes/mixins/SimplePrimaryUI.js?v=20260928-simple-primary-932c701';
import { installSimpleCongPhapHomeUI } from './scenes/mixins/SimpleCongPhapHomeUI.js?v=20260928-single-line-congphap-22fa3d0';
import { installSimpleWelcomeUI } from './scenes/mixins/SimpleWelcomeUI.js?v=20260928-welcome-fullscreen-d18e1e9';
import { installSimpleNpcFullscreenUI } from './scenes/mixins/SimpleNpcFullscreenUI.js?v=20260928-thanh-van-image-hub-v3';
import { installSimpleSkillFullscreenUI } from './scenes/mixins/SimpleSkillFullscreenUI.js?v=20260928-skill-fullscreen-1d6de02';
import { installStarterGiftResourceOnly } from './scenes/mixins/StarterGiftResourceOnly.js?v=20260928-starter-resource-only-16f2fc3';
import { installWorldResourceProgression } from './scenes/mixins/WorldResourceProgression.js?v=20260928-world-resources-a419273';
import { installEarlyGamePharmacopeia } from './scenes/mixins/EarlyGamePharmacopeia.js?v=20260928-thanh-van-image-hub-v3';
import { installCommonPillRankUiFix } from './scenes/mixins/CommonPillRankUiFix.js?v=20260928-common-pill-ui-b25b6a2';
import { installVanMocEnemyProgression } from './scenes/mixins/VanMocEnemyProgression.js?v=20260928-van-moc-ranks-145c118';
import { installRankOneBeastCoreDrops } from './scenes/mixins/RankOneBeastCoreDrops.js?v=20260928-rank1-cores-357150f';
import { installRareResourceInventoryUI } from './scenes/mixins/RareResourceInventoryUI.js?v=20260928-rare-inventory-aeb0de9';
import { installInventoryGridUI } from './scenes/mixins/InventoryGridUI.js?v=20260928-stacked-grid-5c655cb';
import { installVillageHubTouchFix } from './scenes/mixins/VillageHubTouchFix.js?v=20260928-village-touch-exit-5s-v2';
import { installCongPhapMasteryProgression } from './scenes/mixins/CongPhapMasteryProgression.js?v=20260928-cp-mastery-realm-v1';
import { installElementalCombatProgression } from './scenes/mixins/ElementalCombatProgression.js?v=20260928-elemental-combat-v1';
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
installWorldResourceProgression(MainGameScene);
installEarlyGamePharmacopeia(MainGameScene);
installCommonPillRankUiFix(MainGameScene);
installVanMocEnemyProgression(MainGameScene);
installRankOneBeastCoreDrops(MainGameScene);
installRareResourceInventoryUI(MainGameScene);
installInventoryGridUI(MainGameScene);
installVillageHubTouchFix(MainGameScene);
installCongPhapMasteryProgression(MainGameScene);
installElementalCombatProgression(MainGameScene);
installUiGameplayPauseOptimization(MainGameScene);
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
