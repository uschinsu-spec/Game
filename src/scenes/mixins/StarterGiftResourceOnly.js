import { gameState } from '../../state/gameState.js';
import { addCurrency } from '../../config/currencyData.js';

const LEGACY_STARTER_CP_ID = 'dan_khi_quyet';
const LEGACY_STARTER_SKILLS = ['kiem_1', 'ly_1'];

function hasLegitimateSkillSource(skillId) {
  const unlocked = Array.isArray(gameState.unlockedSkillIds) ? gameState.unlockedSkillIds : [];
  if (unlocked.includes(skillId)) return true;

  const cpIds = Array.isArray(gameState.learnedCongPhapIds) ? gameState.learnedCongPhapIds : [];
  if (skillId === 'kiem_1') return cpIds.some(id => /^cp_kiem_/.test(id));
  if (skillId === 'ly_1') return cpIds.some(id => /^cp_ly_/.test(id));
  return false;
}

function sanitizeLegacyStarterGrant() {
  const ids = Array.isArray(gameState.learnedCongPhapIds) ? gameState.learnedCongPhapIds : [];
  const hadLegacyStarterCp = ids.includes(LEGACY_STARTER_CP_ID);

  if (hadLegacyStarterCp) {
    gameState.learnedCongPhapIds = ids.filter(id => id !== LEGACY_STARTER_CP_ID);
  }
  if (gameState.activeCongPhapId === LEGACY_STARTER_CP_ID) {
    gameState.activeCongPhapId = null;
  }

  if (!hadLegacyStarterCp) return false;

  if (Array.isArray(gameState.equippedSkillIds)) {
    gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => {
      if (!LEGACY_STARTER_SKILLS.includes(id)) return true;
      return hasLegitimateSkillSource(id);
    });
  }

  if (gameState.skillMastery && typeof gameState.skillMastery === 'object') {
    LEGACY_STARTER_SKILLS.forEach(id => {
      if (!hasLegitimateSkillSource(id)) delete gameState.skillMastery[id];
    });
  }
  return true;
}

function walkUi(root, fn, seen = new Set()) {
  if (!root || seen.has(root)) return;
  seen.add(root);
  fn(root);
  if (Array.isArray(root.list)) root.list.forEach(child => walkUi(child, fn, seen));
}

/**
 * Quà Tân Thủ từ Trưởng Thôn chỉ tặng tài nguyên.
 * KHÔNG tặng Công Pháp, KHÔNG mở khóa/trang bị bất kỳ Skill nào.
 */
export function installStarterGiftResourceOnly(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__starterGiftResourceOnlyInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__starterGiftResourceOnlyInstalled = true;

  // Migration an toàn cho save cũ: quà Trưởng Thôn trước đây dùng ID riêng
  // "dan_khi_quyet". Công pháp người chơi tự mua dùng ID chuẩn khác nên không bị xóa.
  const originalCreateSkillBar = proto.createSkillBar;
  if (typeof originalCreateSkillBar === 'function') {
    proto.createSkillBar = function createSkillBarWithoutLegacyStarterSkills(...args) {
      sanitizeLegacyStarterGrant();
      return originalCreateSkillBar.apply(this, args);
    };
  }

  const originalGetLearnedSkills = proto.getLearnedSkills;
  if (typeof originalGetLearnedSkills === 'function') {
    proto.getLearnedSkills = function getLearnedSkillsWithoutLegacyStarterGift(...args) {
      sanitizeLegacyStarterGrant();
      return originalGetLearnedSkills.apply(this, args);
    };
  }

  proto.claimStarterGift = function claimStarterGiftResourceOnly() {
    if (gameState.claimedStarterGift) return;

    gameState.claimedStarterGift = true;
    addCurrency(gameState, 'silver', 1000);

    if (typeof gameState.herbs !== 'object' || gameState.herbs === null) gameState.herbs = {};
    gameState.herbs['Ngưng Khí Thảo'] = (gameState.herbs['Ngưng Khí Thảo'] || 0) + 10;
    gameState.ores = (gameState.ores || 0) + 5;

    if (!gameState.materials) gameState.materials = {};
    gameState.materials.beastPelts = (gameState.materials.beastPelts || 0) + 5;

    // CỐ Ý KHÔNG thay đổi Công Pháp/Skill.
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

  // Đồng bộ hướng dẫn: Trưởng Thôn không còn phát Dẫn Khí Quyết.
  const originalOpenNpcGuideModal = proto.openNpcGuideModal;
  if (typeof originalOpenNpcGuideModal === 'function') {
    proto.openNpcGuideModal = function openNpcGuideWithoutStarterTechnique(...args) {
      const result = originalOpenNpcGuideModal.apply(this, args);
      walkUi(this.activeModal, obj => {
        if (obj?.type !== 'Text' || typeof obj.text !== 'string') return;
        if (obj.text.includes('Đến [Thương Hội] hoặc gặp [Trưởng Thôn] nhận Dẫn Khí Quyết')) {
          obj.setText(obj.text.replace(
            'Đến [Thương Hội] hoặc gặp [Trưởng Thôn] nhận Dẫn Khí Quyết nhập môn',
            'Đến [Thương Hội] tự mua Dẫn Khí Quyết nhập môn'
          ));
        }
      });
      return result;
    };
  }
}
