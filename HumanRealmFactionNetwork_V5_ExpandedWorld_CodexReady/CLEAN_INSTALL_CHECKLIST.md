# CLEAN_INSTALL_CHECKLIST

1. Copy `src/config/factions/` into GAME.
2. Copy faction UI mixins: `src/scenes/mixins/FactionSystemIntegration.js`, `FactionUI.js`, `FactionSearchUI.js`, `PlayerFactionUI.js`, `WorldMapFactionOverlay.js`.
3. Replace GAME `src/config/sectsData.js` with the V5 compatibility file from this package. Do not recreate a separate `SECTS` catalog elsewhere.
4. Replace `src/state/gameState.js` and `src/state/saveSystem.js` with V5 copies (or apply equivalent diff exactly).
5. Merge `src/main.js` V5 integration. Preserve all unrelated current mixins. Boot optimization remains last.
6. Keep `worldRegistry.js` as sole map registry. Keep `gameFactionRegistry.js` as sole faction registry.
7. Do not copy old faction fields back into `humanRealmWorld.js`.
8. Remove any obsolete faction-only block from `masterMapManifest.js` if it still exposes `factionProfile`; V5 does not use it.
9. Do not rename current geography IDs/canonical map keys.
10. Keep V5 `gameFactionRegistry.js` world import query strings identical to current GAME import query strings unless all importers are updated together.
11. Search repo after merge for old state usage: `sectId`, `sectRankIdx`, `sectContrib`, `lastSalaryClaim`. Convert any remaining UI/gameplay consumer to `gameState.factionState`.
12. Search geography for `makeFactionProfile`, `cultivationFactions`, `factionProfile`, `apexSect` and confirm no active world-node faction data remains.
13. Run `npm test` from this package before copying.
14. From GAME root run `node tests/v5CurrentGameIntegrationTest.mjs` (or equivalent browser test) and require 437/437 territory pass.
15. Test Map 0/1/2 plus a generated territory map: enter/switch, UI, save/load, combat, map overlay, faction context refresh.
