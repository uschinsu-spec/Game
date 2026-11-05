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
