import { gameState } from '../../state/gameState.js';

const VAN_MOC_MAP_ID = 2;
const NORMAL_ENEMY_BASE_SCALE = 0.50;

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

const ZONE_ENEMY_ASSETS = {
  1: { spriteNum: 5, asset: 'enemy_5', monster: 'Thanh Lang', stage: 'Nhất Phẩm Sơ Kỳ' },
  2: { spriteNum: 4, asset: 'enemy_4', monster: 'Độc Giác Trư', stage: 'Nhất Phẩm Trung Kỳ' },
  3: { spriteNum: 9, asset: 'enemy_9', monster: 'Huyết Tích Ma', stage: 'Nhất Phẩm Hậu Kỳ' },
  4: { spriteNum: 7, asset: 'enemy_7', monster: 'Huyết Lang Vạn Mộc', stage: 'Nhất Phẩm Đỉnh Phong' }
};

const ZONE_SIZE_MULTIPLIERS = {
  1: 1.2,
  2: 1.4,
  3: 1.6,
  4: 1.8
};

function applyVanMocVisual(scene, enemy, strictZone) {
  if (!enemy) return enemy;

  const visual = ZONE_ENEMY_ASSETS[strictZone];
  const sizeMultiplier = ZONE_SIZE_MULTIPLIERS[strictZone] || 1;
  const spriteNum = visual?.spriteNum || enemy.enemySpriteNum;

  if (spriteNum && enemy.enemySpriteNum !== spriteNum) {
    enemy.enemySpriteNum = spriteNum;
    const tex = enemy.isFlying ? `enemy_fly_${spriteNum}` : `enemy_${spriteNum}`;
    enemy.setTexture?.(tex);
    enemy.play?.(`e_${enemy.isFlying ? 'enemy_fly_' : 'enemy_'}${spriteNum}_idle`, true);
  }

  enemy.vanMocZone = strictZone;
  enemy.vanMocStage = ZONE_LABELS[strictZone];
  enemy.vanMocAsset = visual?.asset || `enemy_${spriteNum}`;
  enemy.vanMocSizeMultiplier = sizeMultiplier;

  enemy.baseEnemyScale = NORMAL_ENEMY_BASE_SCALE * sizeMultiplier;
  const perspectiveScale = typeof scene.perspective === 'function' ? scene.perspective(enemy.y) : 1;
  const finalScale = enemy.baseEnemyScale * perspectiveScale;
  enemy.setScale?.(finalScale);

  enemy.barW = 36;
  if (enemy.hpBg) enemy.hpBg.width = 36;
  if (enemy.hpBar) enemy.hpBar.width = 36;
  enemy.hpBg?.setPosition?.(enemy.x, enemy.y - 36 * finalScale);
  enemy.hpBar?.setPosition?.(enemy.x - 18, enemy.y - 36 * finalScale);
  enemy.hpBar?.setFillStyle?.(0xee5533, 1);
  enemy.nameText?.setPosition?.(enemy.x, enemy.y - 47 * finalScale);

  if (enemy.nameText?.setText) {
    const baseName = visual?.monster || enemy.monsterData?.name || 'Yêu Thú';
    enemy.nameText.setText(`${baseName} • ${ZONE_LABELS[strictZone]}`);
    enemy.nameText.setColor?.(ZONE_COLORS[strictZone]);
    enemy.nameText.setFontSize?.(strictZone === 4 ? '10px' : (strictZone === 3 ? '9.5px' : '9px'));
  }

  return enemy;
}

/**
 * Vạn Mộc Sâm Lâm khóa cấp yêu thú tuyệt đối theo độ sâu bản đồ:
 * Zone 1 -> Nhất Phẩm Sơ Kỳ -> enemy_5 -> 1.2x
 * Zone 2 -> Nhất Phẩm Trung Kỳ -> enemy_4 -> 1.4x
 * Zone 3 -> Nhất Phẩm Hậu Kỳ -> enemy_9 -> 1.6x
 * Zone 4 -> Nhất Phẩm Đỉnh Phong -> enemy_7 -> 1.8x
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
    zone = 1
  ) {
    if (Number(gameState.currentMapId) !== VAN_MOC_MAP_ID) {
      return originalSpawnOneFixedEnemy.call(this, homeX, homeY, slotIndex, zone);
    }

    const strictZone = Math.max(1, Math.min(4, Number(zone) || 1));
    const strictSlotIndex = strictZone === 1 ? 0 : (strictZone === 2 ? 1 : (strictZone === 3 ? 1 : 2));

    const enemy = originalSpawnOneFixedEnemy.call(
      this,
      homeX,
      homeY,
      strictSlotIndex,
      strictZone
    );

    return applyVanMocVisual(this, enemy, strictZone);
  };
}
