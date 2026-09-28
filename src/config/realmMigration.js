/**
 * realmMigration.js
 * Bảng chuyển đổi cảnh giới duy nhất từ hệ cũ (0..20) sang hệ V3 (0..28).
 * 
 * Luyện Khí tách thành 12 tầng (index 1..12).
 * Trúc Cơ (13..16), Kim Đan (17..20), Nguyên Anh (21..24), Hoá Thần (25..28).
 */
import { REALMS } from './realmsData.js';

export const LEGACY_TO_V3 = Object.freeze({
  0: 0,
  1: 1, 2: 4, 3: 8, 4: 12,
  5: 13, 6: 14, 7: 15, 8: 16,
  9: 17, 10: 18, 11: 19, 12: 20,
  13: 21, 14: 22, 15: 23, 16: 24,
  17: 25, 18: 26, 19: 27, 20: 28
});

export function migrateLegacyRealmIndex(idx, version = 2) {
  const n = Math.max(0, Math.floor(Number(idx) || 0));
  if (Number(version) >= 3) {
    return Math.min(n, REALMS.length - 1);
  }
  if (n > 20) {
    return Math.min(n, REALMS.length - 1);
  }
  return LEGACY_TO_V3[n] ?? 0;
}

export function mapLegacyRealmThreshold(idx) {
  const n = Math.max(0, Math.floor(Number(idx) || 0));
  return LEGACY_TO_V3[n] ?? Math.min(n, REALMS.length - 1);
}
