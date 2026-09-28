import { gameState } from '../../state/gameState.js';
import { addCurrency } from '../../config/currencyData.js';

/**
 * Quà Tân Thủ từ Trưởng Thôn chỉ tặng tài nguyên.
 * KHÔNG tặng Công Pháp, KHÔNG mở khóa/trang bị bất kỳ Skill nào.
 */
export function installStarterGiftResourceOnly(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__starterGiftResourceOnlyInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__starterGiftResourceOnlyInstalled = true;

  proto.claimStarterGift = function claimStarterGiftResourceOnly() {
    if (gameState.claimedStarterGift) return;

    gameState.claimedStarterGift = true;
    addCurrency(gameState, 'silver', 1000);

    if (typeof gameState.herbs !== 'object' || gameState.herbs === null) gameState.herbs = {};
    gameState.herbs['Ngưng Khí Thảo'] = (gameState.herbs['Ngưng Khí Thảo'] || 0) + 10;

    gameState.ores = (gameState.ores || 0) + 5;

    if (!gameState.materials) gameState.materials = {};
    gameState.materials.beastPelts = (gameState.materials.beastPelts || 0) + 5;

    // CỐ Ý KHÔNG thay đổi:
    // - learnedCongPhapIds / activeCongPhapId
    // - unlockedSkillIds / equippedSkillIds / skillMastery
    // Người chơi phải tự mua/học Công Pháp và Thần Thông về sau.

    this.spawnSpellVfx?.(this.player.x, this.player.y, 'vfx_heal', 1.2, 800, false);
    this.showFloatingText?.(
      this.player.x,
      this.player.y - 80,
      '🎉 Quà Tân Thủ: +1.000 Bạc, +10 Ngưng Khí Thảo, +5 Khoáng, +5 Da Thú!',
      '#ffd700',
      '14px'
    );
    this.updateHUD?.();
    this.closeModal?.();
  };
}
