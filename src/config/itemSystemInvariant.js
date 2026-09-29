/**
 * itemSystemInvariant.js
 * Bảo đảm game chỉ có MỘT item runtime duy nhất.
 *
 * Các file itemsData/herbsData/mineralsData/craftingData chỉ là registry dữ liệu theo nhóm,
 * không phải các item system độc lập. Runtime duy nhất phải là ElementalItemSystem.
 */
const EXPECTED_OWNER = 'ElementalItemSystem';

export function assertSingleItemSystem(MainGameScene) {
  const proto = MainGameScene?.prototype;
  const errors = [];

  if (!proto) {
    throw new Error('[ItemSystemInvariant] MainGameScene.prototype không tồn tại.');
  }

  if (proto.__itemSystemOwner && proto.__itemSystemOwner !== EXPECTED_OWNER) {
    errors.push(`Item runtime đã có owner khác: ${String(proto.__itemSystemOwner)}.`);
  }

  // Claim owner sau khi installer chính đã chạy.
  proto.__itemSystemOwner = EXPECTED_OWNER;

  if (proto.__elementalItemSystemInstalled !== true) {
    errors.push('ElementalItemSystem chưa được cài đặt.');
  }
  if (typeof proto.addElementalItemToInventory !== 'function') {
    errors.push('Thiếu addElementalItemToInventory().');
  }
  if (typeof proto.spawnElementalItemGroundDrop !== 'function') {
    errors.push('Thiếu spawnElementalItemGroundDrop().');
  }
  if (!proto.elementalItemCatalogStats || typeof proto.elementalItemCatalogStats !== 'object') {
    errors.push('Thiếu catalog thống nhất của item system.');
  }

  // Cấm các marker runtime kiểu V1/V2 chạy song song nếu sau này vô tình được thêm lại.
  const forbiddenParallelMarkers = [
    '__itemSystemV1Installed',
    '__itemSystemV2Installed',
    '__legacyItemSystemInstalled',
    '__secondaryItemSystemInstalled'
  ];
  forbiddenParallelMarkers.forEach(marker => {
    if (proto[marker]) errors.push(`Phát hiện item runtime song song: ${marker}.`);
  });

  if (errors.length) {
    throw new Error(`[ItemSystemInvariant] Chỉ được phép có 1 item system (${EXPECTED_OWNER}). ${errors.join(' ')}`);
  }

  return Object.freeze({
    owner: EXPECTED_OWNER,
    singleRuntime: true,
    catalogStats: proto.elementalItemCatalogStats
  });
}
