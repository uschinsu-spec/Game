import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';
import { getEquipmentStats } from './ItemSystem.js?v=20261001-item-icons-v4';

export const ELEMENTS_8 = Object.freeze(['Vật Lý', 'Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ', 'Lôi', 'Phong']);

function normalizeElement(elem = 'Vật Lý') {
  if (elem === 'Kiếm') return 'Kim';
  return ELEMENTS_8.includes(elem) ? elem : 'Vật Lý';
}

function resolveCultivationElement() {
  const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
  if (!cp || cp.elem === 'Toàn Hệ') return null;
  return normalizeElement(cp.elem);
}

function masteryMultiplier(scene) {
  const raw = Number(scene?.getCongPhapMasteryMultiplier?.(gameState.activeCongPhapId));
  return Number.isFinite(raw) && raw > 0 ? raw : 0.35;
}

export function installElementalCombatProgression(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__elementalCombatProgressionInstalled) return;
  proto.__elementalCombatProgressionInstalled = true;

  proto.getCultivationElement = function getCultivationElement() {
    return resolveCultivationElement();
  };

  proto.calcPlayerElementalDmg = function calcPlayerElementalDmg(elem = 'Vật Lý') {
    const wanted = normalizeElement(elem);
    const cultivated = resolveCultivationElement();
    const realmBase = Math.max(1, Number(this.calcPlayerBaseDmg?.()) || 5);

    // Nếu đang vận hành công pháp đúng hệ: được khuếch đại cực mạnh bởi Công Pháp & Thuần Thục
    if (cultivated && cultivated === wanted) {
      const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
      const masteryMul = masteryMultiplier(this);
      const cpBonusPct = Math.max(0, Number(cp?.bonusDmgPct) || 0);
      const masteryPct = 35 + Math.round(masteryMul * 145); // Sơ Nhập ~86% -> Viên Mãn 180%
      const totalPct = masteryPct + cpBonusPct;
      const itemElementPct = Math.max(0, Number(getEquipmentStats().elementDamage || 0));
      return Math.max(1, Math.floor(realmBase * (1 + totalPct / 100) * (1 + itemElementPct / 100)));
    }

    // Nếu không có công pháp chuyên biệt: Người chơi vẫn sở hữu 100% Sát Thương Cảnh Giới gốc
    const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
    if (cp && cp.elem === 'Toàn Hệ') {
      const bonusPct = Math.max(0, Number(cp.bonusDmgPct) || 10);
      const itemElementPct = Math.max(0, Number(getEquipmentStats().elementDamage || 0));
      return Math.max(1, Math.floor(realmBase * (1 + bonusPct / 100) * (1 + itemElementPct / 100)));
    }

    if (wanted !== 'Vật Lý') {
      const itemElementPct = Math.max(0, Number(getEquipmentStats().elementDamage || 0));
      return Math.max(1, Math.floor(realmBase * (1 + itemElementPct / 100)));
    }
    return realmBase;
  };

  proto.calcPlayerElementalDef = function calcPlayerElementalDef(elem = 'Vật Lý') {
    const wanted = normalizeElement(elem);
    const cultivated = resolveCultivationElement();
    const baseDef = Math.max(0, Number(this.calcPlayerBaseDef?.()) || 0);

    // Tất cả hệ luôn có DEF nền theo cảnh giới.
    if (!cultivated || cultivated !== wanted) return baseDef;

    const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
    const masteryMul = masteryMultiplier(this);
    const cpBonusPct = Math.max(0, Number(cp?.bonusDefPct) || 0);
    const masteryPct = 25 + Math.round(masteryMul * 95); // Sơ Nhập ~58% -> Viên Mãn 120%
    const totalPct = masteryPct + cpBonusPct;
    return Math.max(0, Math.floor(baseDef * (1 + totalPct / 100)));
  };

  proto.calcPlayerDmg = function calcPlayerDmg() {
    const cultivated = resolveCultivationElement();
    return cultivated ? this.calcPlayerElementalDmg(cultivated) : (this.calcPlayerBaseDmg ? this.calcPlayerBaseDmg() : 5);
  };

  proto.calcPlayerDef = function calcPlayerDef() {
    const cultivated = resolveCultivationElement();
    return this.calcPlayerElementalDef(cultivated || 'Vật Lý');
  };

  // Damage - DEF đúng hệ. Giữ tối thiểu 1 Damage để tránh trạng thái vô hạn khi DEF vượt Damage.
  proto.applyElementalDefenseToDamage = function applyElementalDefenseToDamage(rawDmg, elem = 'Vật Lý', targetDef = 0) {
    return Math.max(1, Math.floor((Number(rawDmg) || 0) - Math.max(0, Number(targetDef) || 0)));
  };
}
