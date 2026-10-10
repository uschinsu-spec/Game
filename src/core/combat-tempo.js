import {Engine,SKILL_MASTERY_TIERS} from '../cultivation.js';

/**
 * Combat tempo: one source of timing for Player and NPC.
 * Damage is an event owned by combat, never by the renderer.
 */
export function combatTempo(actor, skillId='basic_attack') {
  const interval = Engine.calcAttackInterval(actor) / 1000;
  const speed = .65 / interval;
  const mastery = SKILL_MASTERY_TIERS[actor.skillMastery?.[skillId] || 0] || SKILL_MASTERY_TIERS[0];
  return Object.freeze({
    attackInterval: interval,
    attackDuration: Math.min(interval, Math.max(.15, .38 / speed)),
    attackHitTime: Math.min(interval * .35, .11 / speed),
    skillDuration: Math.max(.20, .52 / speed),
    releaseRatio: .40,
    projectileSpeed: Math.min(1300, 520 * Math.pow(speed,.65) * mastery.vfxMul),
    vfxFps: Math.min(30, 16 * Math.sqrt(speed) * mastery.vfxMul)
  });
}
