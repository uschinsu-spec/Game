import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const assert = (x, m) => { if (!x) throw new Error(m); };
const removed = ['core/idle-progression-controller.js','core/progression-service.js','core/spawn-controller.js','core/combat-controller.js','core/player-input-controller.js','core/combat-ui-adapter.js','idle-adventure.js','progression-systems.js','mobile-controls-fix.js','mobile-minimap.js','assets/characters/player-animation-pro.js','assets/characters/player-upperbody-animation.js','assets/characters/player-combat-facing.js'];
for (const p of removed) assert(!fs.existsSync(path.join(ROOT, p)), `legacy file remains: ${p}`);
const manifest = read('core/build-manifest.js');
const bid = read('core/build-id.js');
for (const p of removed) assert(!manifest.includes(p), `runtime manifest references legacy: ${p}`);
assert(/p18\./.test(bid), 'Phase 18 BUILD_ID missing');
const prod = [];
for (const top of ['core', 'assets']) {
  const walk = (d) => { for (const n of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, n.name); if (n.isDirectory()) walk(p); else if (n.name.endsWith('.js')) prod.push(p); } };
  walk(path.join(ROOT, top));
}
for (const p of ['boot.js', 'game.js', 'mobile-runtime.js', 'skill-vfx.js', 'service-worker.js']) if (fs.existsSync(path.join(ROOT, p))) prod.push(path.join(ROOT, p));
const entries = prod.map((p) => ({ p: path.relative(ROOT, p), s: fs.readFileSync(p, 'utf8') }));
const source = entries.map((x) => x.s).join('\n');
const forbidden = ['IdleProgression','IdleCore','ProgressionService','SoloProgression','SpawnController','CombatController','PlayerInputController','CombatRuntime','startBossWave','bossTimer','getProgressionPower','PLAYER_MOTION_STATE','isPlayerMoving','setPlayerTargetAngle','triggerPlayerSpellPose','currentSkill'];
for (const token of forbidden) { const hit = entries.find((x) => x.s.includes(token)); assert(!hit, `legacy runtime symbol remains: ${token} in ${hit?.p}`); }
for (const re of [/\bCombatEXP\b/i,/\bQuickBattle\b/i,/\bautoRealm\b/i,/\bcurrentStage\b/i,/\bstageIndex\b/i,/\bwaveIndex\b/i,/\bplayerLevel\b/i,/\benemyLevel\b/i,/\bcombatPower\b/i,/\bpowerScore\b/i]) { const hit = entries.find((x) => re.test(x.s)); assert(!hit, `forbidden GAME2 progression token: ${re} in ${hit?.p}`); }
assert(source.includes('realmMultiplier') && source.includes('lethalFloor'), 'Realm Suppression invariant missing');
assert(source.includes("sourceType:'DOT'") || source.includes('sourceType:"DOT"'), 'DoT DamageSystem routing missing');
assert(source.includes('playerMotor'), 'PlayerMotor authority missing');
const journey = ['phase13-catalog.js','quest-system.js','spawn-system.js','resource-node-system.js','waypoint-system.js','crafting-system.js','meditation-system.js','breakthrough-system.js','encounter-system.js','save-system.js','respawn-anchor-system.js'];
for (const f of journey) assert(fs.existsSync(path.join(ROOT, 'core', f)), `release journey dependency missing: ${f}`);
for (const d of ['README.md','docs/RELEASE_NOTES_GAME2.md','docs/SAVE_MIGRATION_GAME2.md','docs/PRODUCTION_RELEASE_CHECKLIST.md']) assert(fs.existsSync(path.join(ROOT, d)), `release document missing: ${d}`);
console.log(JSON.stringify({ ok: true, build: /GAME2_BUILD_ID='([^']+)'/.exec(bid)?.[1], removed: removed.length, invariants: ['no-legacy-runtime','no-level-cp-stage-wave-combatexp-quickbattle-bosstimer-autorealm','realm-suppression','release-journey-contract','release-docs'] }));
