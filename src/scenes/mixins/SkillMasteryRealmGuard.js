import { REALMS } from '../../config/realmsData.js';
import { SKILL_MASTERY_TIERS, ELEMENTAL_SKILLS } from '../../config/skillsData.js?v=20260928-vfx-original-restore-v1';
import { gameState } from '../../state/gameState.js';

function getRealmMasteryCap(realmIdx) {
  const realm = REALMS[Math.max(0, Number(realmIdx) || 0)] || REALMS[0];

  // Luyện Khí có 12 tầng: 1-3 / 4-6 / 7-9 / 10-12
  // tương ứng Sơ Nhập / Tiểu Thành / Đại Thành / Viên Mãn.
  if (realm.major === 'Luyện Khí') {
    const floor = Math.max(
      1,
      Math.min(12, Number(String(realm.tier || '').match(/\d+/)?.[0]) || Number(realm.id) || 1)
    );
    if (floor <= 3) return 0;
    if (floor <= 6) return 1;
    if (floor <= 9) return 2;
    return 3;
  }

  if (realm.tier === 'Sơ Kỳ') return 0;
  if (realm.tier === 'Trung Kỳ') return 1;
  if (realm.tier === 'Hậu Kỳ') return 2;
  if (realm.tier === 'Đỉnh Phong') return 3;

  // Phàm Nhân và mọi trường hợp chưa xác định chỉ được dùng VFX Sơ Nhập.
  return 0;
}

function ensureSkillMastery(skillId) {
  if (!gameState.skillMastery || typeof gameState.skillMastery !== 'object') gameState.skillMastery = {};
  if (!gameState.skillMastery[skillId]) gameState.skillMastery[skillId] = { tierIdx: 0, exp: 0 };
  return gameState.skillMastery[skillId];
}

export function installSkillMasteryRealmGuard(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__skillMasteryRealmGuardInstalled) return;
  proto.__skillMasteryRealmGuardInstalled = true;

  // Chỉ sửa cách xác định BẬC THUẦN THỤC được phép dùng.
  // Không thay asset, số projectile, kích thước, màu, choreography hay VFX gốc.
  proto.getSkillMastery = function getSkillMastery(skillId) {
    const data = ensureSkillMastery(skillId);
    const masteryCap = getRealmMasteryCap(gameState.realmIdx);
    const storedTierIdx = Math.max(0, Math.min(3, Number(data.tierIdx) || 0));
    const tierIdx = Math.min(storedTierIdx, masteryCap);
    const tier = SKILL_MASTERY_TIERS[tierIdx] || SKILL_MASTERY_TIERS[0];
    const nextTier = SKILL_MASTERY_TIERS[tierIdx + 1] || null;

    // Save cũ có bậc cao hơn cảnh giới sẽ không bị xóa dữ liệu,
    // nhưng runtime/UI/VFX chỉ được dùng đến trần cảnh giới hiện tại.
    const exp = storedTierIdx > masteryCap
      ? Math.min(Math.max(0, Number(data.exp) || 0), Math.max(0, Number(tier.expReq) || 0))
      : Math.max(0, Number(data.exp) || 0);

    return {
      tierIdx,
      storedTierIdx,
      exp,
      tier,
      nextTier,
      masteryCap,
      realmReady: nextTier ? masteryCap >= nextTier.idx : true,
      isMax: !nextTier
    };
  };

  proto.gainSkillExp = function gainSkillExp(skillId, amt = 1) {
    const data = ensureSkillMastery(skillId);
    let mastery = this.getSkillMastery(skillId);

    // Save cũ từng vượt trần: giữ dữ liệu nhưng tuyệt đối không cho VFX dùng bậc vượt trần.
    if (mastery.storedTierIdx > mastery.masteryCap) return mastery;
    if (mastery.isMax) return mastery;

    const skillObj = ELEMENTAL_SKILLS.find(s => s.id === skillId);
    const sName = skillObj ? skillObj.name : skillId;
    data.exp = Math.max(0, Number(data.exp) || 0) + Math.max(0, Number(amt) || 0);

    const currentReq = Math.max(0, Number(mastery.tier.expReq) || 0);
    if (data.exp < currentReq || !mastery.nextTier) return this.getSkillMastery(skillId);

    // Đủ EXP nhưng cảnh giới chưa mở bậc kế tiếp: dừng đúng tại trần.
    if (mastery.masteryCap < mastery.nextTier.idx) {
      data.exp = currentReq;
      return this.getSkillMastery(skillId);
    }

    data.tierIdx = mastery.nextTier.idx;
    data.exp = 0;
    const newTier = SKILL_MASTERY_TIERS[data.tierIdx];

    this.spawnVfx?.(this.player?.x ?? 270, this.player?.y ?? 620, 0, 1.4, {
      tint: newTier.badgeBg,
      duration: 600
    });
    this.showFloatingText?.(
      this.player?.x ?? 270,
      (this.player?.y ?? 620) - 85,
      `⚡ [${sName}] ĐỘT PHÁ [${newTier.name.toUpperCase()}]! (ST +${Math.round(newTier.dmgBonus * 100)}%)`,
      newTier.color,
      '15px'
    );
    this.createSkillBar?.();

    return this.getSkillMastery(skillId);
  };
}
