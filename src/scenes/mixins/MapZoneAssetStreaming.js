/**
 * MapZoneAssetStreaming.js
 * Quản lý nạp tài nguyên bản đồ trực tiếp, không chia cắt/xóa quái theo Zone 1D.
 */
import { gameState } from '../../state/gameState.js';
import { getMapById } from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';

const OWNER = 'MapZoneAssetStreaming';

export function installMapZoneAssetStreaming(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__mapZoneAssetStreamingInstalled) return;
  proto.__mapZoneAssetStreamingInstalled = true;
  proto.__mapZoneAssetStreamingOwner = OWNER;
  proto.__combatAssetsReady = true;

  proto.ensureCombatSharedAssets = function ensureCombatSharedAssets() {
    this.__combatAssetsReady = true;
    return Promise.resolve(true);
  };

  proto.ensureMapZoneAssets = function ensureMapZoneAssets() {
    this.__combatAssetsReady = true;
    return Promise.resolve(true);
  };

  proto.activateCombatZone = function activateCombatZone() {
    this.__combatAssetsReady = true;
    return Promise.resolve(true);
  };

  proto.ensureActiveMapZoneAssets = function ensureActiveMapZoneAssets() {
    this.__combatAssetsReady = true;
    return Promise.resolve(true);
  };
}
