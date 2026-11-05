# Gameplay Depth & Combat Balance v0.9

## Scope

This patch is a stability pass on the merged v0.8 gameplay foundation. It deliberately fixes combat correctness before introducing new economy or progression multipliers.

## Combat correctness

- Player mitigation is calculated in one place by `Player.calculateIncomingDamage`.
- Floating damage numbers for incoming enemy attacks now display the mitigated damage actually deducted from HP, rather than raw monster ATK.
- Enemy projectiles that reach the player after the player has entered DEAD state are discarded. This prevents queued projectiles from damaging or displaying damage against a dead character.
- Skill and ultimate cooldowns are enforced inside the cast methods, not only by the auto-cast selector or HUD display. This prevents direct/manual calls from bypassing cooldowns; rejected casts do not spend MP.
- The underlying raw attack value remains the monster's configured ATK; defense mitigation remains 35% of player DEF, with a minimum hit of 1.

## Balance guardrails

- No existing realm thresholds, save keys, inventory formats, reward values, or equipment values are changed in this patch.
- This avoids silently invalidating existing v0.8 local saves while the full progression curve is measured.
- Future gear affixes, boss phases, dungeons, and AFK efficiency should be added only after playtest telemetry establishes time-to-kill, death rate, level-up time, and reward/hour baselines.

## Verification checklist

Run `npm install` then `npm run build`.

Manual combat QA still required:
1. Compare enemy floating damage with the exact HP delta at multiple DEF values.
2. Let multiple enemy projectiles enter flight, die before impact, and verify no late damage numbers or HP changes occur.
3. Verify respawn restores normal incoming damage.
4. Repeat at x1, x2, and x3 speed.
5. Attempt to cast each skill and the ultimate repeatedly before cooldown expiry; verify the cast is rejected and MP is unchanged, then verify it succeeds after expiry.
6. Reopen an existing v0.8 save and verify inventory, equipment, realm, resources, and quest claims remain intact.

## Deliberate non-goals

This patch does not claim to implement server saves, multiplayer, sect/social systems, payment, anti-clock-tampering, or a complete boss-phase framework. Those require separate backend/product decisions and dedicated QA.


## Boss phases and reward pass

- Bosses now transition at 70% and 35% HP, increasing attack power and shortening attack intervals in each phase.
- Phase transitions update the boss label/aura and emit battle-log/toast feedback.
- Enemy attacks now show a ground warning marker before the projectile launches. The warning is aimed at the player's position when the attack begins; the attack can be avoided by moving before impact only if movement controls are available.
- Boss kills guarantee one Epic crafting core, `Thiên Mục Ma Hạch`. Other material and equipment drops remain chance-based; no claim is made that a full affix/set loot system exists yet.
- Boss phases are implemented as stat escalation and presentation, not unique phase-specific skill patterns or adds.

## Progression curve simulation (current v0.8 formulas)

Assumptions: level 1 starts with 100 EXP required; each level multiplies the next requirement by 1.35; each level-up consumes the current requirement. This isolates the level gate and does not assume daily rewards, quest rewards, AFK, or realm breakthrough EXP consumption.

| Level reached | Cumulative EXP required |
|---:|---:|
| 5 | 663 |
| 10 | 3,970 |
| 15 | 18,795 |
| 20 | 85,275 |
| 25 | 383,371 |
| 30 | 1,720,042 |
| 35 | 7,713,722 |
| 40 | 34,589,584 |
| 45 | 155,101,847 |

The ten realm breakthrough EXP thresholds sum to 38,950, while the current realm gate formula requires level 45 to enter the final listed realm (realmIndex 8 to 9 requires level 45). Under the isolated level curve, level 45 requires about 3,982 times the sum of all listed realm EXP thresholds. Normal monster EXP is 25 before level scaling (maximum +200% from the current 20-level cap); boss EXP is 280 before scaling (maximum 840). This is a material progression mismatch, not a small tuning issue.

**Decision:** do not silently change the progression formula in this boss/loot patch. A separate balance change should replace the 1.35 exponential level curve with a measured, bounded curve, then simulate kills/time-to-level, breakthrough resource costs, AFK contribution, and expected boss loot per hour before changing live values.

## Expanded manual QA

1. Damage boss through 70% and 35% HP; confirm exactly one transition message per phase and correct attack escalation.
2. Confirm the boss warning marker appears before each attack projectile and no projectile lands after the boss is dead.
3. Defeat a boss repeatedly and verify exactly one guaranteed `Thiên Mục Ma Hạch` per kill.
4. Verify ordinary monsters still have chance-based material drops and boss equipment remains chance-based.
5. Test phase transitions with a single hit that crosses both thresholds; phase should advance directly to the final phase once.
