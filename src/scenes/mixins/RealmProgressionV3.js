import { REALMS, REALM_START_INDEX, REALM_PEAK_INDEX } from '../../config/realmsData.js';
import { gameState } from '../../state/gameState.js';

const LEGACY_TO_V3 = Object.freeze({
  0: 0,
  1: 1, 2: 4, 3: 8, 4: 12,
  5: 13, 6: 14, 7: 15, 8: 16,
  9: 17, 10: 18, 11: 19, 12: 20,
  13: 21, 14: 22, 15: 23, 16: 24,
  17: 25, 18: 26, 19: 27, 20: 28
});

function mapLegacyIndex(idx) {
  const n = Math.max(0, Math.floor(Number(idx) || 0));
  return LEGACY_TO_V3[n] ?? Math.min(n, REALMS.length - 1);
}

function stageStart(stage) {
  return REALM_START_INDEX[stage] ?? 0;
}

export function installRealmProgressionV3(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__realmProgressionV3Installed) return;
  proto.__realmProgressionV3Installed = true;

  proto.getRealmIndexForStage = stageStart;
  proto.getPeakRealmIndexForStage = stage => REALM_PEAK_INDEX[stage] ?? 0;
  proto.mapLegacyRealmThreshold = mapLegacyIndex;

  // Các UI/logic cũ thường so trực tiếp minRealm 0/4/8/12/16.
  // Hàm này cho phép các mixin mới/ghi đè chuyển threshold cũ sang schema mới.
  proto.isRealmUnlocked = function isRealmUnlocked(minRealm = 0, stage = '') {
    const required = stage ? stageStart(stage) : mapLegacyIndex(minRealm);
    return Number(gameState.realmIdx || 0) >= required;
  };

  proto.getCurrentRealm = function getCurrentRealm() {
    return REALMS[Math.max(0, Math.min(REALMS.length - 1, Number(gameState.realmIdx) || 0))] || REALMS[0];
  };
}
