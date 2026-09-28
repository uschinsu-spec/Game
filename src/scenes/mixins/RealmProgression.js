/**
 * RealmProgression.js
 * Hợp nhất quản lý tiến trình cảnh giới V3 & tính tương thích cho MainGameScene
 */
import { REALMS, REALM_START_INDEX, REALM_PEAK_INDEX } from '../../config/realmsData.js';
import { LEGACY_TO_V3, migrateLegacyRealmIndex, mapLegacyRealmThreshold } from '../../config/realmMigration.js';
import { gameState } from '../../state/gameState.js';

export { LEGACY_TO_V3, migrateLegacyRealmIndex, mapLegacyRealmThreshold };

export function stageMinRealm(stage = 'Luyện Khí') {
  return REALM_START_INDEX[stage] ?? 0;
}

export function stagePeakRealm(stage = 'Luyện Khí') {
  return REALM_PEAK_INDEX[stage] ?? 0;
}

export function installRealmProgression(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__realmProgressionInstalled) return;
  proto.__realmProgressionInstalled = true;

  // Compatibility helpers
  proto.normalizeLegacyRealmIndex = function normalizeLegacyRealmIndex(idx) {
    return migrateLegacyRealmIndex(idx);
  };
  proto.mapLegacyRealmThreshold = mapLegacyRealmThreshold;

  // V3 Progression helpers
  proto.getRealmIndexForStage = stage => REALM_START_INDEX[stage] ?? 0;
  proto.getPeakRealmIndexForStage = stage => REALM_PEAK_INDEX[stage] ?? 0;

  proto.isRealmUnlocked = function isRealmUnlocked(minRealm = 0, stage = '') {
    const required = stage ? (REALM_START_INDEX[stage] ?? 0) : mapLegacyRealmThreshold(minRealm);
    return Number(gameState.realmIdx || 0) >= required;
  };

  proto.getCurrentRealm = function getCurrentRealm() {
    return REALMS[Math.max(0, Math.min(REALMS.length - 1, Number(gameState.realmIdx) || 0))] || REALMS[0];
  };

  // Run migration once on runtime if not yet marked
  if (!gameState.__realmSchemaV3) {
    gameState.realmIdx = migrateLegacyRealmIndex(gameState.realmIdx, 2);
    gameState.__realmSchemaV3 = true;
  }
}
