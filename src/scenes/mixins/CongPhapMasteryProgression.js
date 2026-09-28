import { REALMS } from '../../config/realmsData.js';
import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';

export const CONG_PHAP_MASTERY_TIERS = Object.freeze([
  { idx: 0, name: 'Sơ Nhập',   usesReq: 120,  bonusMul: 0.35, color: '#aaddff' },
  { idx: 1, name: 'Tiểu Thành', usesReq: 420,  bonusMul: 0.60, color: '#55ff99' },
  { idx: 2, name: 'Đại Thành',  usesReq: 1200, bonusMul: 0.82, color: '#ffd700' },
  { idx: 3, name: 'Viên Mãn',   usesReq: 0,    bonusMul: 1.00, color: '#ff44dd' }
]);

function ensureBag() {
  if (!gameState.congPhapMastery || typeof gameState.congPhapMastery !== 'object') gameState.congPhapMastery = {};
  return gameState.congPhapMastery;
}

function getRealmTierIndex(realmIdx) {
  const realm = REALMS[Math.max(0, Number(realmIdx) || 0)] || REALMS[0];
  if (realm.major === 'Luyện Khí') {
    const floor = Math.max(1, Math.min(12, Number(String(realm.tier || '').match(/\d+/)?.[0]) || realm.id || 1));
    if (floor <= 3) return 0;
    if (floor <= 6) return 1;
    if (floor <= 9) return 2;
    return 3;
  }
  if (realm.tier === 'Sơ Kỳ') return 0;
  if (realm.tier === 'Trung Kỳ') return 1;
  if (realm.tier === 'Hậu Kỳ') return 2;
  if (realm.tier === 'Đỉnh Phong') return 3;
  return -1;
}

function getMasteryCapByRealm(realmIdx) {
  return getRealmTierIndex(realmIdx);
}

export function installCongPhapMasteryProgression(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__congPhapMasteryInstalled) return;
  proto.__congPhapMasteryInstalled = true;

  proto.getCongPhapMastery = function getCongPhapMastery(cpId = gameState.activeCongPhapId) {
    if (!cpId) return null;
    const bag = ensureBag();
    if (!bag[cpId]) bag[cpId] = { tierIdx: 0, uses: 0 };
    const data = bag[cpId];
    const tierIdx = Math.max(0, Math.min(3, Number(data.tierIdx) || 0));
    const tier = CONG_PHAP_MASTERY_TIERS[tierIdx];
    const nextTier = CONG_PHAP_MASTERY_TIERS[tierIdx + 1] || null;
    const masteryCap = getMasteryCapByRealm(gameState.realmIdx);
    return { cpId, tierIdx, tier, nextTier, uses: Math.max(0, Number(data.uses) || 0), masteryCap, realmReady: nextTier ? masteryCap >= nextTier.idx : true, isMax: !nextTier };
  };

  proto.getCongPhapMasteryMultiplier = function getCongPhapMasteryMultiplier(cpId = gameState.activeCongPhapId) {
    return this.getCongPhapMastery?.(cpId)?.tier?.bonusMul ?? 0.35;
  };

  proto.gainCongPhapCombatUse = function gainCongPhapCombatUse(amt = 1) {
    const cpId = gameState.activeCongPhapId;
    if (!cpId || !getCongPhapById(cpId)) return null;
    const bag = ensureBag();
    if (!bag[cpId]) bag[cpId] = { tierIdx: 0, uses: 0 };
    let mastery = this.getCongPhapMastery(cpId);
    if (!mastery || mastery.isMax) return mastery;
    bag[cpId].uses += Math.max(0, Number(amt) || 0);
    mastery = this.getCongPhapMastery(cpId);
    const nextTier = mastery.nextTier;
    if (!nextTier) return mastery;
    const currentTierReq = mastery.tier.usesReq || 0;
    if (bag[cpId].uses < currentTierReq) return mastery;
    const masteryCap = getMasteryCapByRealm(gameState.realmIdx);
    if (masteryCap < nextTier.idx) {
      bag[cpId].uses = currentTierReq;
      return this.getCongPhapMastery(cpId);
    }
    bag[cpId].tierIdx = nextTier.idx;
    bag[cpId].uses = 0;
    const cp = getCongPhapById(cpId);
    const realmName = REALMS[gameState.realmIdx]?.name || '';
    this.showFloatingText?.(this.player?.x ?? 270, (this.player?.y ?? 620) - 90, `📜 [${cp?.name || cpId}] → ${nextTier.name.toUpperCase()} • ${realmName}`, nextTier.color, '15px');
    this.spawnVfx?.(this.player?.x ?? 270, this.player?.y ?? 620, 0, 1.15, { duration: 480 });
    this.updateHUD?.();
    return this.getCongPhapMastery(cpId);
  };

  const originalCastSkill = proto.castSkill;
  if (typeof originalCastSkill === 'function' && !originalCastSkill.__congPhapMasteryWrapped) {
    const wrapped = function castSkillWithCongPhapMastery(skillId, ...args) {
      const beforeCd = Number(this.activeSkillCds?.[skillId] || 0);
      const beforeStamp = Number(this[`last_${skillId}_cast`] || 0);
      const result = originalCastSkill.call(this, skillId, ...args);
      const afterCd = Number(this.activeSkillCds?.[skillId] || 0);
      const afterStamp = Number(this[`last_${skillId}_cast`] || 0);
      if ((afterCd > 0 && (beforeCd <= 0 || afterCd !== beforeCd)) || afterStamp !== beforeStamp) this.gainCongPhapCombatUse?.(1);
      return result;
    };
    wrapped.__congPhapMasteryWrapped = true;
    proto.castSkill = wrapped;
  }

  const originalBasicAttack = proto.basicAttack;
  if (typeof originalBasicAttack === 'function' && !originalBasicAttack.__congPhapMasteryWrapped) {
    const wrapped = function basicAttackWithCongPhapMastery(...args) {
      const target = this.nearestEnemy?.(110);
      const result = originalBasicAttack.apply(this, args);
      if (target?.active && !target?.isDead) {
        this.__cpBasicHitCounter = (this.__cpBasicHitCounter || 0) + 1;
        if (this.__cpBasicHitCounter >= 4) {
          this.__cpBasicHitCounter = 0;
          this.gainCongPhapCombatUse?.(1);
        }
      }
      return result;
    };
    wrapped.__congPhapMasteryWrapped = true;
    proto.basicAttack = wrapped;
  }

  const originalOpenCongPhapPanel = proto.openCongPhapPanel;
  if (typeof originalOpenCongPhapPanel === 'function' && !originalOpenCongPhapPanel.__cpMasteryInitWrapped) {
    const wrapped = function openCongPhapPanelWithMasteryInit(...args) {
      (gameState.learnedCongPhapIds || []).forEach(cpId => {
        const bag = ensureBag();
        if (!bag[cpId]) bag[cpId] = { tierIdx: 0, uses: 0 };
      });
      return originalOpenCongPhapPanel.apply(this, args);
    };
    wrapped.__cpMasteryInitWrapped = true;
    proto.openCongPhapPanel = wrapped;
  }
}
