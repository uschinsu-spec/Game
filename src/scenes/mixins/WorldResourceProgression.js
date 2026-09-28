/**
 * WorldResourceProgression.js
 * Compatibility module re-exporting constants and maintaining safe interface.
 * Toàn bộ logic quản lý tài nguyên Linh Thảo & Khai Khoáng đã được hợp nhất trực tiếp trong HerbsMixin.js.
 */
import {
  HERB_QUALITY,
  COMMON_MINERALS,
  VAN_MOC_MINERALS
} from './HerbsMixin.js';

export {
  HERB_QUALITY,
  COMMON_MINERALS,
  VAN_MOC_MINERALS
};

export function installWorldResourceProgression(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__worldResourceProgressionInstalled) return;
  MainGameScene.prototype.__worldResourceProgressionInstalled = true;
  // All native handlers (initHerbs, spawnOneHerb, harvestHerb, interactWithMineral, updateHerbs)
  // are already cleanly provided by HerbsMixin in MainGameScene.
}
