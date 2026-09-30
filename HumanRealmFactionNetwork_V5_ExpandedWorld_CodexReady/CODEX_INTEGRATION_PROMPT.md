# CODEX INTEGRATION PROMPT — Human Realm Faction Network V5

You are integrating a clean-install faction system into the current GAME. Treat the package files as the intended V5 implementation and the current GAME geography/map system as authoritative.

## Non-negotiable architecture

- `worldRegistry.js` remains the only map/runtime registry.
- `gameFactionRegistry.js` becomes the only faction/social-power registry.
- Do not add faction definitions to `humanRealmWorld.js` or `masterMapManifest.js`.
- Do not reintroduce old faction generators/atlases.
- Preserve all current world IDs, canonical map keys, map streaming, item system and boot optimization.
- Do not create virtual administrative levels that do not exist in `HUMAN_REALM_WORLD_NODES`.
- Actual V5 chain is REALM → CONTINENT → PRIMARY_REGION → SECONDARY_TERRITORY → NATION → CITY → SETTLEMENT; locations are sites.
- Do not change realm cap above Hóa Thần (realmIdx 28).

## Merge steps

1. Read current GAME versions of `humanRealmWorld.js`, `humanRealmExpandedAtlas.js`, `humanRealmDetailedAtlas.js`, `masterMapManifest.js`, `worldRegistry.js`, `playableMaps.js`, `main.js`, `gameState.js`, `saveSystem.js`, `MainScene.js`, `WorldMapRuntime.js`, and `WorldMapHierarchyUI.js` before editing.
2. Confirm geography contains no active faction fields (`makeFactionProfile`, `cultivationFactions`, `factionProfile`, `apexSect`). If a blank manifest placeholder remains, remove it or leave it inert; V5 must not read it.
3. Add package `src/config/factions/**` unchanged unless a current import path has moved.
4. Add the five faction UI/runtime mixins under `src/scenes/mixins/`.
5. Replace/reset `src/config/sectsData.js` with package file. It must re-export the canonical 9 V5 player sects and rank table; it must not own a second catalog.
6. Replace/merge V5 `gameState.js`: remove old `sectId`, `sectRankIdx`, `sectContrib`, `lastSalaryClaim`; add `factionState` from `createEmptyFactionGameState()`.
7. Replace/merge V5 `saveSystem.js`: bump save version to 5; serialize/hydrate factionState. Old v4 saves may keep combat/items/world progress, but old sect membership is intentionally reset rather than migrated because the previous faction system was deleted.
8. Merge `src/main.js` integration in this order: existing general/UI systems → item system → map runtime/UI/content-zone → V5 faction integration/assertion → asset streaming → map invariant → boot optimization LAST.
9. Do not add faction images/NPC sprites/VFX to preload. Emblems/appearance are metadata/lazy.
10. Ensure `FactionSystemIntegration` wraps the existing `applyMapRuntimeConfig`; do not replace `switchMap` or create a second map transition path.
11. Convert any remaining gameplay/UI consumer of old sect state to V5 affiliation/relation APIs.
12. Preserve 9 canonical player sect IDs and bonuses from V5 `playerSects.js`.
13. Run syntax check for every JS file.
14. Run V5 standalone tests.
15. Run `tests/v5CurrentGameIntegrationTest.mjs` against current GAME and require: 99,062 nodes snapshot (or explicitly review if geography has intentionally changed), 437 territories, every sampled/exhaustive territory has political/cultivation/economic/security/intelligence/underworld controller, and every territory has a real Nation → City → Settlement path.
16. Browser regression: Map 0, Map 1, Map 2, one generated territory map, save/load, faction panel, player affiliation panel, world-map overlay, map switch refresh, no boot regression.
17. Search final repo for duplicate faction source. There must be exactly one V5 network.

## Do not “simplify” these V5 features away

Keep: Supreme/continent/region/local powers, local generation at all real jurisdiction levels, branch/vassal networks, influence/controller dimensions, detailed organization profiles, diplomacy, economy/trade, AI/lifecycle/events/war/siege/remnants, player relation/memory/contracts/wanted/intel, player-created faction, site control, save delta, lazy caches and mobile simulation budget.

Finish by reporting files changed, tests run, exact pass/fail counts, and any current GAME change that invalidated the snapshot contract.
