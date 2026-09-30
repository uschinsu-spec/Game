import { MainGameScene, W, H } from './scenes/MainScene.js?v=20260929-map-smoke-fix-v5';
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
import { installElementalItemSystem } from './scenes/mixins/ElementalItemSystem.js?v=20260929-unified-item-system';
import { assertSingleItemSystem } from './config/itemSystemInvariant.js?v=20260929-unified-item-system';
import { installWorldMapRuntime } from './scenes/mixins/WorldMapRuntime.js?v=20260930-canonical-map-id-v7';
import { installWorldMapHierarchyUI } from './scenes/mixins/WorldMapHierarchyUI.js?v=20260930-visual-map-v6';
import { installMapContentZoneRuntime } from './scenes/mixins/MapContentZoneRuntime.js?v=20260929-single-map-system-v4';
import { installMapZoneAssetStreaming } from './scenes/mixins/MapZoneAssetStreaming.js?v=20260930-zone-stream-v2';
import { installItemIconStreaming } from './scenes/mixins/ItemIconStreaming.js?v=20260929-item-icon-stream-v1';
import { assertSingleMapSystem } from './config/world/mapSystemInvariant.js?v=20260929-single-map-system-v4';
import { installBootAssetOptimizationV3 } from './scenes/mixins/BootAssetOptimizationV3.js?v=20260929-p0-boot-assets-v3';
import { installFactionSystemIntegration } from './scenes/mixins/FactionSystemIntegration.js?v=20260930-faction-v5';
import { HUMAN_REALM_FACTION_NETWORK, GAME_FACTION_WORLD_ADAPTER, GAME_FACTION_MAP_ADAPTER } from './config/factions/gameFactionRegistry.js?v=20260930-faction-v5';
import { assertFactionBootReady } from './config/factions/validation/factionInvariant.js?v=20260930-faction-v5';
import { gameState } from './state/gameState.js';

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
installElementalItemSystem(MainGameScene);

assertSingleItemSystem(MainGameScene);

// Exactly one active map runtime, one map UI, and one map-zone geometry provider.
installWorldMapRuntime(MainGameScene);
installWorldMapHierarchyUI(MainGameScene);
installMapContentZoneRuntime(MainGameScene);

// The unified implementation remains the same canonical map UI owner expected by the invariant.
if (MainGameScene.prototype.openMapPanel?.name === 'openUnifiedWorldMap') {
  Object.defineProperty(MainGameScene.prototype.openMapPanel, 'name', {
    value: 'openHierarchicalWorldMap',
    configurable: true
  });
}

installFactionSystemIntegration(MainGameScene, {
  network: HUMAN_REALM_FACTION_NETWORK,
  worldAdapter: GAME_FACTION_WORLD_ADAPTER,
  mapAdapter: GAME_FACTION_MAP_ADAPTER,
  gameState
});
assertFactionBootReady({ network: HUMAN_REALM_FACTION_NETWORK, worldAdapter: GAME_FACTION_WORLD_ADAPTER });

installMapZoneAssetStreaming(MainGameScene);
installItemIconStreaming(MainGameScene);
assertSingleMapSystem(MainGameScene);
installBootAssetOptimizationV3(MainGameScene);

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
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  loader: { maxParallelDownloads: 12 }
};

function startGame() {
  try {
    window.__GAME_BOOT__?.stage('Đang khởi tạo Phaser...');
    window.game = new Phaser.Game(config);
  } catch (error) {
    window.__GAME_BOOT__?.fail(error);
    throw error;
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') startGame();
else window.addEventListener('DOMContentLoaded', startGame, { once: true });
