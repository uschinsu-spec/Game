import { MainGameScene, W, H } from './scenes/MainScene.js?v=20261003-attack-move-v1';
import { installUiModalManager } from './scenes/mixins/UiModalManager.js?v=20260928-modal-manager-unified-v1';
import { installTransparentBottomMenuOptimization } from './scenes/mixins/TransparentBottomMenuOptimization.js?v=20260928-transparent-nav-518b6b2';
import { installSimpleCraftingUI } from './scenes/mixins/SimpleCraftingUI.js?v=20261001-item-icons-v4';
import { installSimpleCongPhapHomeUI } from './scenes/mixins/SimpleCongPhapHomeUI.js?v=20260928-modal-manager-unified-v1';
import { installSimpleWelcomeUI } from './scenes/mixins/SimpleWelcomeUI.js?v=20260928-modal-manager-unified-v1';
import { installSimplePrimaryUI } from './scenes/mixins/SimplePrimaryUI.js?v=20261001-item-icons-v4';
import { installNpcDialogUI } from './scenes/mixins/SimpleNpcFullscreenUI.js?v=20260930-hotspot-align-v35';
import { installSimpleSkillFullscreenUI } from './scenes/mixins/SimpleSkillFullscreenUI.js?v=20260928-modal-manager-unified-v1';
import { installInventoryGridUI } from './scenes/mixins/InventoryGridUI.js?v=20261001-item-detail-v5';
import { installCongPhapMasteryProgression } from './scenes/mixins/CongPhapMasteryProgression.js?v=20260928-cp-mastery-direct-v3';
import { installElementalCombatProgression } from './scenes/mixins/ElementalCombatProgression.js?v=20261001-item-icons-v4';
import { installRealmProgression } from './scenes/mixins/RealmProgression.js?v=20260928-realm-progression-unified-v1';
import { installMerchantTalismanFormationShop } from './scenes/mixins/MerchantTalismanFormationShop.js?v=20261001-item-icons-v4';
import { installItemSystem } from './scenes/mixins/ItemSystem.js?v=20261001-item-icons-v4';
import { assertSingleItemSystem } from './config/itemSystemInvariant.js?v=20261001-item-icons-v4';
import { installWorldMapRuntime } from './scenes/mixins/WorldMapRuntime.js?v=20260930-canonical-map-id-v7';
import { installWorldMapHierarchyUI } from './scenes/mixins/WorldMapHierarchyUI.js?v=20261001-fixed-faction-destinations-v47';
import { installMapAtlasRuntimeGuard } from './scenes/mixins/MapAtlasRuntimeGuard.js?v=20261001-map-atlas-visible-v45';
import { installWorldMapCanonicalDirectTravel } from './scenes/mixins/WorldMapCanonicalDirectTravel.js?v=20261001-canonical-direct-travel-v46';
import { installMapContentZoneRuntime } from './scenes/mixins/MapContentZoneRuntime.js?v=20260930-profile-driven-zone-v41';
import { installMapZoneAssetStreaming } from './scenes/mixins/MapZoneAssetStreaming.js?v=20260930-zone-stream-v2';
import { installItemIconStreaming } from './scenes/mixins/ItemIconStreaming.js?v=20261001-item-icons-v4';
import { assertSingleMapSystem } from './config/world/mapSystemInvariant.js?v=20260930-profile-driven-zone-v41';
import { installBootAssetOptimizationV3 } from './scenes/mixins/BootAssetOptimizationV3.js?v=20261001-map-atlas-visible-v45';
import { installFactionSystemIntegration } from './scenes/mixins/FactionSystemIntegration.js?v=20261001-fixed-faction-overlay-v38';
import { installClanHubUI } from './scenes/mixins/clan/ClanHubUIManager.js?v=20261001-org-relations-v40';
import { installSectHubUI } from './scenes/mixins/sect/SectHubUIManager.js?v=20261001-org-relations-v40';
import { HUMAN_REALM_FACTION_NETWORK, GAME_FACTION_WORLD_ADAPTER, GAME_FACTION_MAP_ADAPTER } from './config/factions/gameFactionRegistry.js?v=20260930-canonical-geography-v1';
import { assertFactionBootReady } from './config/factions/validation/factionInvariant.js?v=20260930-map-standard-ranks-v27';
import { gameState } from './state/gameState.js';

installUiModalManager(MainGameScene);
installRealmProgression(MainGameScene);
installItemSystem(MainGameScene);
assertSingleItemSystem(MainGameScene);
installTransparentBottomMenuOptimization(MainGameScene);
installSimpleCraftingUI(MainGameScene);
installSimpleCongPhapHomeUI(MainGameScene);
installSimpleWelcomeUI(MainGameScene);
installSimplePrimaryUI(MainGameScene);
installNpcDialogUI(MainGameScene);
installClanHubUI(MainGameScene);
installSectHubUI(MainGameScene);
// Village/City Hub UI are lazy-loaded so a delayed Drive sync or one missing feature file
// cannot prevent the whole game from booting. Each click still routes through exactly one Hub manager.
MainGameScene.prototype.openVillageBuildingUI = function(buildingKey) {
  return import('./scenes/mixins/village/VillageHubUIManager.js?v=20261001-hub-ui-v4')
    .then(({ VillageHubUIManager }) => VillageHubUIManager.openBuildingUI(this, buildingKey))
    .catch(error => {
      console.error('[VillageHubUI] load failed', error);
      this.showToast?.(`⚠️ Không tải được UI Thôn: ${error?.message || 'module lỗi'}`);
      return null;
    });
};
MainGameScene.prototype.openCityBuildingUI = function(buildingKey) {
  return import('./scenes/mixins/city/CityHubUIManager.js?v=20261001-hub-ui-v2')
    .then(({ CityHubUIManager }) => CityHubUIManager.openBuildingUI(this, buildingKey))
    .catch(error => {
      console.error('[CityHubUI] load failed', error);
      this.showToast?.(`⚠️ Không tải được UI Thành: ${error?.message || 'module lỗi'}`);
      return null;
    });
};
installSimpleSkillFullscreenUI(MainGameScene);
installInventoryGridUI(MainGameScene);
installCongPhapMasteryProgression(MainGameScene);
installElementalCombatProgression(MainGameScene);
installMerchantTalismanFormationShop(MainGameScene);

// Exactly one active map runtime, one map UI, and one map-zone geometry provider.
installWorldMapRuntime(MainGameScene);
installWorldMapHierarchyUI(MainGameScene);
installMapAtlasRuntimeGuard(MainGameScene);
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
installWorldMapCanonicalDirectTravel(MainGameScene);
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
