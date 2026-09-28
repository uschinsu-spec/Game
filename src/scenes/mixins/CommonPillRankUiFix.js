/**
 * CommonPillRankUiFix.js
 * Compatibility layer.
 * Toàn bộ logic Phàm Phẩm / Nhất Phẩm / Toàn Cấp Phẩm Đan Dược đã được hợp nhất trực tiếp trong SimpleCraftingUI.js.
 */
export function installCommonPillRankUiFix(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__commonPillRankUiFixInstalled) return;
  MainGameScene.prototype.__commonPillRankUiFixInstalled = true;
  // Native openCraftingPanel is now fully handled by SimpleCraftingUI without wrappers.
}
