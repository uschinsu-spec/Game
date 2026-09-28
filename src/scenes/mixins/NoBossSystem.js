import { MONSTER_RANKS } from '../../config/monstersData.js';

/**
 * Khóa Boss toàn cục.
 *
 * Một số code legacy trong EnemyMixin vẫn có tham số isBoss để tương thích API.
 * Module này cài ở tầng cuối của hệ enemy, ép mọi đường spawn/kill về quái thường:
 * - không boss spawn
 * - không boss rankOffset
 * - không boss scale
 * - không boss HP/name style
 * - không boss loot multiplier
 * - không boss flag trong monster data runtime
 */
export function installNoBossSystem(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__noBossSystemInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__noBossSystemInstalled = true;

  // Bảo vệ cả dữ liệu runtime nếu save/module cũ còn tham chiếu các object này.
  MONSTER_RANKS.forEach(monster => {
    if (!monster || typeof monster !== 'object') return;
    if ('isBoss' in monster) delete monster.isBoss;
    if (typeof monster.rank === 'string') {
      monster.rank = monster.rank
        .replace(/\s*\(Yêu Vương\)/gi, '')
        .replace(/\s*\(Boss\)/gi, '')
        .trim();
    }
  });

  const previousSpawnOneFixedEnemy = proto.spawnOneFixedEnemy;
  if (typeof previousSpawnOneFixedEnemy === 'function') {
    proto.spawnOneFixedEnemy = function spawnEnemyWithoutBoss(
      homeX,
      homeY,
      slotIndex,
      zone = 1,
      _legacyBossFlag = false
    ) {
      // Luôn truyền false: mọi nhánh boss legacy bên dưới đều bị vô hiệu hóa.
      const enemy = previousSpawnOneFixedEnemy.call(this, homeX, homeY, slotIndex, zone, false);
      if (!enemy) return enemy;

      enemy.isBoss = false;
      if (enemy.monsterData && typeof enemy.monsterData === 'object' && 'isBoss' in enemy.monsterData) {
        delete enemy.monsterData.isBoss;
      }

      const hasCustomRankVisual = Number.isFinite(enemy.vanMocSizeMultiplier);

      // Chỉ chuẩn hóa scale/màu mặc định với quái không có visual phẩm cấp riêng.
      if (!hasCustomRankVisual) {
        enemy.baseEnemyScale = 0.50;
        enemy.nameText?.setColor?.('#ffd700');
      }

      // HP bar luôn dùng kiểu quái thường; không còn thanh boss 48px/màu đỏ riêng.
      enemy.barW = 36;
      if (enemy.hpBg) enemy.hpBg.width = 36;
      if (enemy.hpBar) enemy.hpBar.width = 36;
      enemy.hpBar?.setFillStyle?.(0xee5533, 1);

      return enemy;
    };
  }

  const previousKillEnemy = proto.killEnemy;
  if (typeof previousKillEnemy === 'function') {
    proto.killEnemy = function killEnemyWithoutBossBonus(enemy) {
      if (enemy) {
        enemy.isBoss = false;
        if (enemy.monsterData && typeof enemy.monsterData === 'object' && 'isBoss' in enemy.monsterData) {
          delete enemy.monsterData.isBoss;
        }
      }
      return previousKillEnemy.call(this, enemy);
    };
  }

  // Dùng cho debug/test để xác nhận hệ boss đã bị vô hiệu hóa.
  proto.isBossSystemEnabled = function isBossSystemEnabled() {
    return false;
  };
}
