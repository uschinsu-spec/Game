/**
 * mapNpcProgressions.js
 * =========================================================================
 * DYNAMIC NPC PROGRESSION SYSTEM
 * =========================================================================
 * Không hard-code map ID 0, 1, 2.
 * Tự động tính toán cấp bậc tu vi, mastery, VFX và cảnh giới của NPC
 * dựa trên metadata của Map và Zone:
 * - map.realmRange / map.minRealm / map.access.minRealmIdx
 * - zoneNumber / tổng số zones
 * - locationKind / isPeaceZone
 */
import { REALMS } from '../realmsData.js';
import { CANONICAL_MAP_KEYS } from './masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';
import { getMapById, getMapZones } from './worldRegistry.js?v=20260930-canonical-geography-v1';

const MASTERY_TIERS = Object.freeze([
  Object.freeze({ threshold: 0, name: 'Sơ Nhập', bonus: 0.00, vfxMul: 1.00, color: '#aaddff' }),
  Object.freeze({ threshold: 3, name: 'Tiểu Thành', bonus: 0.15, vfxMul: 1.10, color: '#55ff99' }),
  Object.freeze({ threshold: 7, name: 'Đại Thành', bonus: 0.35, vfxMul: 1.25, color: '#ffd700' }),
  Object.freeze({ threshold: 12, name: 'Viên Mãn', bonus: 0.80, vfxMul: 1.45, color: '#ff44dd' }),
  Object.freeze({ threshold: 18, name: 'Đại Viên Mãn', bonus: 1.50, vfxMul: 1.65, color: '#f43f5e' })
]);

function getMasteryInfo(realmIdx) {
  let matched = MASTERY_TIERS[0];
  for (const tier of MASTERY_TIERS) {
    if (realmIdx >= tier.threshold) matched = tier;
  }
  return matched;
}

/**
 * Tính toán dynamic NPC progression cho bất kỳ map nào trong toàn bộ Nhân Giới.
 */
export function getNpcProgressionForMap(mapOrId) {
  const map = typeof mapOrId === 'object' && mapOrId ? mapOrId : getMapById(mapOrId);
  if (!map) {
    return Object.freeze([
      Object.freeze({ zone: 1, realmIdx: 0, masteryName: 'Sơ Nhập', masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' })
    ]);
  }

  const isPeace = map.isPeaceZone || map.type === 'safe_village' || map.type === 'safe_city' || map.type === 'safe_sect' || map.type === 'safe_clan';
  const minRealm = Number(map.access?.minRealmIdx ?? map.realmRange?.[0] ?? map.minRealm ?? 0);
  const maxRealm = Number(map.realmRange?.[1] ?? (minRealm + 3));
  const zones = getMapZones(map.id) || [];
  const zoneCount = Math.max(1, zones.length || 4);

  if (isPeace) {
    const mastery = getMasteryInfo(minRealm);
    return Object.freeze([
      Object.freeze({
        zone: 1,
        realmIdx: minRealm,
        masteryName: mastery.name,
        masteryBonus: mastery.bonus,
        vfxMul: mastery.vfxMul,
        masteryColor: mastery.color
      })
    ]);
  }

  // Tạo progression động theo từng zone của map
  const progression = [];
  for (let z = 1; z <= zoneCount; z++) {
    const ratio = zoneCount > 1 ? (z - 1) / (zoneCount - 1) : 0;
    const realmIdx = Math.min(REALMS.length - 1, Math.round(minRealm + ratio * (maxRealm - minRealm)));
    const mastery = getMasteryInfo(realmIdx);
    progression.push(Object.freeze({
      zone: z,
      realmIdx,
      masteryName: mastery.name,
      masteryBonus: mastery.bonus,
      vfxMul: mastery.vfxMul,
      masteryColor: mastery.color
    }));
  }

  return Object.freeze(progression);
}

/**
 * Lấy cấu hình NPC cho một zone cụ thể của map.
 */
export function getNpcZoneConfig(mapOrId, zoneNumber = 1) {
  const progression = getNpcProgressionForMap(mapOrId);
  const zIdx = Math.max(0, Math.min(progression.length - 1, (Number(zoneNumber) || 1) - 1));
  return progression[zIdx] || progression[0];
}
