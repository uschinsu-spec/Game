import { REALMS, REALM_START_INDEX } from '../../config/realmsData.js';
import { gameState } from '../../state/gameState.js';

// Mapping từ hệ realm cũ (0..20) sang hệ mới (0..28).
// Giữ save cũ không bị nhảy sai đại cảnh giới sau khi Luyện Khí tách thành 12 tầng.
const OLD_TO_NEW_REALM = Object.freeze({
  0: 0,
  1: 1, 2: 4, 3: 8, 4: 12,
  5: 13, 6: 14, 7: 15, 8: 16,
  9: 17, 10: 18, 11: 19, 12: 20,
  13: 21, 14: 22, 15: 23, 16: 24,
  17: 25, 18: 26, 19: 27, 20: 28
});

export function migrateLegacyRealmIndex(idx) {
  const n = Math.max(0, Math.floor(Number(idx) || 0));
  if (n > 20) return Math.min(n, REALMS.length - 1);
  return OLD_TO_NEW_REALM[n] ?? 0;
}

export function stageMinRealm(stage = 'Luyện Khí') {
  return REALM_START_INDEX[stage] ?? 0;
}

export function installRealmIndexCompatibility(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__realmIndexCompatibilityInstalled) return;
  proto.__realmIndexCompatibilityInstalled = true;

  proto.normalizeLegacyRealmIndex = function normalizeLegacyRealmIndex(idx) {
    return migrateLegacyRealmIndex(idx);
  };

  // Chạy đúng 1 lần trên runtime hiện tại. SaveSystem có migration riêng khi import.
  if (!gameState.__realmSchemaV3) {
    gameState.realmIdx = migrateLegacyRealmIndex(gameState.realmIdx);
    gameState.__realmSchemaV3 = true;
  }
}
