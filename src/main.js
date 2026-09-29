import { MainGameScene, W, H } from './scenes/MainScene.js?v=20260929-single-map-system-v2';
import { installUiModalManager } from './scenes/mixins/UiModalManager.js?v=20260928-modal-manager-unified-v1';
import { installTransparentBottomMenuOptimization } from './scenes/mixins/TransparentBottomMenuOptimization.js?v=20260928-transparent-nav-518b6b2';
import { installSimpleCraftingUI } from './scenes/mixins/SimpleCraftingUI.js?v=20260928-modal-manager-unified-v1';
import { installSimpleCongPhapHomeUI } from './scenes/mixins/SimpleCongPhapHomeUI.js?v=20260928-modal-manager-unified-v1';
import { installSimpleWelcomeUI } from './scenes/mixins/SimpleWelcomeUI.js?v=20260928-modal-manager-unified-v1';
import { installNpcDialogUI } from './scenes/mixins/SimpleNpcFullscreenUI.js?v=20260928-modal-manager-unified-v1';
import { installSimpleSkillFullscreenUI } from './scenes/mixins/SimpleSkillFullscreenUI.js?v=20260928-modal-manager-unified-v1';
import { installStarterGiftResourceOnly } from './scenes/mixins/StarterGiftResourceOnly.js?v=20260928-starter-resource-only-16f2fc3';
import { installEarlyGamePharmacopeia } from './scenes/mixins/EarlyGamePharmacopeia.js?v=20260928-pharmacopeia-clean-v4';
import { installCommonPillRankUiFix } from './scenes/mixins/CommonPillRankUiFix.js?v=20260928-common-pill-ui-b25b6a2';
import { installInventoryGridUI } from './scenes/mixins/InventoryGridUI.js?v=20260928-stacked-grid-5c655cb';
import { installCongPhapMasteryProgression } from './scenes/mixins/CongPhapMasteryProgression.js?v=20260928-cp-mastery-direct-v3';
import { installElementalCombatProgression } from './scenes/mixins/ElementalCombatProgression.js?v=20260928-elemental-combat-v1';
import { installRealmProgression } from './scenes/mixins/RealmProgression.js?v=20260928-realm-progression-unified-v1';
import { installMerchantTalismanFormationShop } from './scenes/mixins/MerchantTalismanFormationShop.js?v=20260928-modal-manager-unified-v1';
import { installWorldMapRuntime } from './scenes/mixins/WorldMapRuntime.js?v=20260929-single-map-system-v2';
import { installWorldMapHierarchyUI } from './scenes/mixins/WorldMapHierarchyUI.js?v=20260929-single-map-system-v2';
import { assertSingleMapSystem } from './config/world/mapSystemInvariant.js?v=20260929-single-map-system-v2';

installUiModalManager(MainGameScene);
installRealmProgression(MainGameScene);
installTransparentBottomMenuOptimization(MainGameScene);
installSimpleCraftingUI(MainGameScene);
installSimpleCongPhapHomeUI(MainGameScene);
installSimpleWelcomeUI(MainGameScene);
installNpcDialogUI(MainGameScene);
installSimpleSkillFullscreenUI(MainGameScene);
installStarterGiftResourceOnly(MainGameScene);
installEarlyGamePharmacopeia(MainGameScene);
installCommonPillRankUiFix(MainGameScene);
installInventoryGridUI(MainGameScene);
installCongPhapMasteryProgression(MainGameScene);
installElementalCombatProgression(MainGameScene);
installMerchantTalismanFormationShop(MainGameScene);

// Exactly one active map runtime and one active map UI.
installWorldMapRuntime(MainGameScene);
installWorldMapHierarchyUI(MainGameScene);

// Fail fast if a future change reintroduces duplicate/conflicting map systems.
assertSingleMapSystem(MainGameScene);

export const config = {
  type: Phaser.AUTO,
  width: W || 540,
  height: H || 960,
  parent: 'game',
  backgroundColor: '#061118',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [MainGameScene],
  input: { touch: { capture: true }, activePointers: 3 },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') window.game = new Phaser.Game(config);
else window.addEventListener('DOMContentLoaded', () => { window.game = new Phaser.Game(config); });
