const LOADERS = Object.freeze({
  lord: () => import('./CityLordUI.js?v=20261001-hub-ui-v2').then(m => m.openCityLordModal),
  alchemy: () => import('./CityAlchemyUI.js?v=20261001-hub-ui-v2').then(m => m.openCityAlchemyModal),
  arena: () => import('./CityArenaUI.js?v=20261001-hub-ui-v2').then(m => m.openCityArenaModal),
  forge: () => import('./CityForgeUI.js?v=20261001-hub-ui-v2').then(m => m.openCityForgeModal),
  cultivation: () => import('./CityCultivationUI.js?v=20261001-hub-ui-v2').then(m => m.openCityCultivationModal),
  crafting: () => import('./CityCraftingUI.js?v=20261001-hub-ui-v2').then(m => m.openCityCraftingModal),
  treasure_guild: () => import('./CityTreasureGuildUI.js?v=20261001-hub-ui-v2').then(m => m.openCityTreasureGuildModal),
  travel_gate: () => import('./CityTravelGateUI.js?v=20261001-hub-ui-v2').then(m => m.openCityTravelGateModal),
  free_market: () => import('./CityFreeMarketUI.js?v=20261001-hub-ui-v2').then(m => m.openCityFreeMarketModal)
});

export class CityHubUIManager {
  static async openBuildingUI(scene, buildingKey) {
    const key = String(buildingKey || '').toLowerCase();
    const loader = LOADERS[key];
    if (!loader) { scene?.showToast?.(`⚠️ Chức năng thành không hợp lệ: ${buildingKey}`); return null; }
    try {
      const opener = await loader();
      return opener?.(scene) ?? null;
    } catch (error) {
      console.error(`[CityHubUI:${key}] load failed`, error);
      scene?.showToast?.(`⚠️ Không tải được ${key}: ${error?.message || 'module lỗi'}`);
      return null;
    }
  }
}

export function installCityHubUI(MainGameScene){
  if(!MainGameScene?.prototype)return;
  const p=MainGameScene.prototype;if(p.__cityHubUiInstalled)return;p.__cityHubUiInstalled=true;
  p.openCityBuildingUI=function(buildingKey){return CityHubUIManager.openBuildingUI(this,buildingKey);};
}
