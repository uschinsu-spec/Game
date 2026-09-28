import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';

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

    // Không tu hệ đó thì Damage hệ đó bằng 0.
    // Vật Lý cũng bằng 0 nếu không tu Vật Lý hoặc không có nguồn Damage Vật Lý riêng.
    if (!cultivated || cultivated !== wanted) return 0;

    const realmBase = Math.max(0, Number(this.calcPlayerBaseDmg?.()) || 0);
    const cp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
    const masteryMul = masteryMultiplier(this);
    const cpBonusPct = Math.max(0, Number(cp?.bonusDmgPct) || 0);

    // Hệ đang tu nhận toàn bộ Damage nền cảnh giới, sau đó được khuếch đại bởi
    // độ thuần thục công pháp và bonus riêng của công pháp.
    const masteryPct = 35 + Math.round(masteryMul * 145); // Sơ Nhập ~86% -> Viên Mãn 180%
    const totalPct = masteryPct + cpBonusPct;
    return Math.max(0, Math.floor(realmBase * (1 + totalPct / 100)));
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
    return cultivated ? this.calcPlayerElementalDmg(cultivated) : 0;
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
