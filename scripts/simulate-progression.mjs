#!/usr/bin/env node
/**
 * Deterministic progression estimate based on current Player.addExp and SpawnSystem reward formulas.
 * Usage: node scripts/simulate-progression.mjs [killsPerMinute]
 * This is a model, not telemetry: combat uptime and actual kills/minute must be measured in playtests.
 */
const killsPerMinute = Math.max(1, Number(process.argv[2] || 10));
if (!Number.isFinite(killsPerMinute)) throw new Error('killsPerMinute must be a finite number');
const expPerKillByRealm = [49, 59, 70, 84, 102, 119, 140, 168, 210];
const afkExpPerMinute = 5;
const levelRequirement = level => level === 1 ? 125 : Math.round(100 + 25 * Math.pow(level, 1.6));
const cumulative = new Map([[1, 0]]);
let total = 0;
for (let level = 1; level < 100; level++) {
  total += levelRequirement(level);
  cumulative.set(level + 1, total);
}
const fmt = value => Math.round(value).toLocaleString('en-US');
console.log('VAN TIEN LUC — CHARACTER EXP ESTIMATE');
console.log('Assumptions: current polynomial level curve; base normal-monster EXP by realm; no quest EXP (quests award cultivation EXP); AFK adds 5 character EXP/min.');
console.log('Kills/minute assumption: ' + killsPerMinute);
console.log('Target | Total EXP | Min @ realm 1 | Min @ realm 9');
for (let target = 10; target <= 100; target += 10) {
  const exp = cumulative.get(target);
  const earlyRate = killsPerMinute * expPerKillByRealm[0] + afkExpPerMinute;
  const lateRate = killsPerMinute * expPerKillByRealm[8] + afkExpPerMinute;
  console.log(String(target).padStart(6) + ' | ' + fmt(exp).padStart(9) + ' | ' + fmt(exp / earlyRate).padStart(13) + ' | ' + fmt(exp / lateRate).padStart(13));
}
console.log('\nInterpretation: columns are idealized minutes at a fixed realm reward rate, not a forecast.');
console.log('Next calibration step: collect real kills/minute, death rate and reward/hour at levels 10, 30, 60 and 90.');
