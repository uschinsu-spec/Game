import { gameState } from '../../state/gameState.js';

const VAN_MOC_MAP_ID = 2;

const ZONE_LABELS = {
  1: 'Sơ Kỳ',
  2: 'Trung Kỳ',
  3: 'Hậu Kỳ',
  4: 'Đỉnh Phong'
};

const ZONE_COLORS = {
  1: '#a7f3d0',
  2: '#fde68a',
  3: '#fdba74',
  4: '#fb7185'
};

/**
 * Vạn Mộc Sâm Lâm dùng cùng density gradient với Thanh Vân Ngoại Vi,
 * nhưng khóa cấp yêu thú tuyệt đối theo độ sâu bản đồ:
 * Zone 1 -> Nhất Phẩm Sơ Kỳ
 * Zone 2 -> Nhất Phẩm Trung Kỳ
 * Zone 3 -> Nhất Phẩm Hậu Kỳ
 * Zone 4 -> Nhất Phẩm Đỉnh Phong
 *
 * EnemyMixin gốc tính rankOffset từ zone + slotIndex. Ta truyền slotIndex
 * chuẩn hóa để tái sử dụng toàn bộ AI/combat/respawn/drop hiện có mà không
 * nhân bản logic EnemyMixin lớn.
 */
export function installVanMocEnemyProgression(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__vanMocEnemyProgressionInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__vanMocEnemyProgressionInstalled = true;

  const originalSpawnOneFixedEnemy = proto.spawnOneFixedEnemy;
  if (typeof originalSpawnOneFixedEnemy !== 'function') return;

  proto.spawnOneFixedEnemy = function spawnVanMocStrictRank(
    homeX,
    homeY,
    slotIndex,
    zone = 1,
    isBoss = false
  ) {
    if (Number(gameState.currentMapId) !== VAN_MOC_MAP_ID) {
      return originalSpawnOneFixedEnemy.call(this, homeX, homeY, slotIndex, zone, isBoss);
    }

    const strictZone = Math.max(1, Math.min(4, Number(zone) || 1));

    // Mapping vào công thức rankOffset của EnemyMixin gốc:
    // zone 1: slot % 2 = 0 -> offset 0
    // zone 2: slot % 3 = 1 -> offset 1
    // zone 3: 1 + slot % 3 = 2 -> offset 2
    // zone 4: 1 + slot % 3 = 3 -> offset 3
    const strictSlotIndex = strictZone === 1 ? 0 : (strictZone === 2 ? 1 : (strictZone === 3 ? 1 : 2));

    // Không cho boss ngẫu nhiên ở Zone 2 kéo cấp quái nhảy thẳng lên Đỉnh Phong.
    // Chỉ Zone 4 mới giữ Yêu Vương định kỳ theo lịch spawn gốc.
    const strictBoss = strictZone === 4 && !!isBoss;

    const enemy = originalSpawnOneFixedEnemy.call(
      this,
      homeX,
      homeY,
      strictSlotIndex,
      strictZone,
      strictBoss
    );

    if (!enemy) return enemy;

    enemy.vanMocZone = strictZone;
    enemy.vanMocStage = ZONE_LABELS[strictZone];

    // Hiển thị ngắn gọn cấp yêu thú để người chơi nhận biết độ sâu khu vực.
    if (enemy.nameText?.setText) {
      const baseName = enemy.monsterData?.name || 'Yêu Thú';
      enemy.nameText.setText(`${baseName} • ${ZONE_LABELS[strictZone]}`);
      enemy.nameText.setColor?.(ZONE_COLORS[strictZone]);
      enemy.nameText.setFontSize?.(strictBoss ? '10px' : '8.5px');
    }

    return enemy;
  };
}
