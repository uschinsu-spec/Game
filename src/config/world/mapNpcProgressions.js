/**
 * Canonical roaming-NPC progression for the only runtime maps: 0, 1, 2.
 * This is gameplay data, not a second map catalog.
 */
export const MAP_NPC_PROGRESSIONS = Object.freeze({
  0: Object.freeze([
    Object.freeze({ zone: 1, realmIdx: 0, masteryName: 'Sơ Nhập', masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' })
  ]),
  1: Object.freeze([
    Object.freeze({ zone: 1, realmIdx: 0, masteryName: 'Sơ Nhập', masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' }),
    Object.freeze({ zone: 2, realmIdx: 1, masteryName: 'Sơ Nhập', masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' }),
    Object.freeze({ zone: 3, realmIdx: 2, masteryName: 'Tiểu Thành', masteryBonus: 0.15, vfxMul: 1.10, masteryColor: '#55ff99' }),
    Object.freeze({ zone: 4, realmIdx: 3, masteryName: 'Đại Thành', masteryBonus: 0.35, vfxMul: 1.20, masteryColor: '#ffd700' })
  ]),
  2: Object.freeze([
    Object.freeze({ zone: 1, realmIdx: 3, masteryName: 'Sơ Nhập', masteryBonus: 0.00, vfxMul: 1.00, masteryColor: '#aaddff' }),
    Object.freeze({ zone: 2, realmIdx: 6, masteryName: 'Tiểu Thành', masteryBonus: 0.35, vfxMul: 1.15, masteryColor: '#55ff99' }),
    Object.freeze({ zone: 3, realmIdx: 9, masteryName: 'Đại Thành', masteryBonus: 0.80, vfxMul: 1.35, masteryColor: '#ffd700' }),
    Object.freeze({ zone: 4, realmIdx: 12, masteryName: 'Viên Mãn', masteryBonus: 1.50, vfxMul: 1.55, masteryColor: '#ff44dd' })
  ])
});

export function getNpcProgressionForMap(mapId) {
  const id = Number(mapId);
  return MAP_NPC_PROGRESSIONS[id] || MAP_NPC_PROGRESSIONS[0];
}
