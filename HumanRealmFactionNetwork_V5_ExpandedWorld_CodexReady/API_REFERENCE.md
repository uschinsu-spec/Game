# V5 PUBLIC API QUICK REFERENCE

Use `src/config/factions/gameFactionRegistry.js` from GAME-facing code.

## Read faction
- `getFaction(id)`
- `getFactionDetail(id, { jurisdictionId? })`
- `getFactionRelation(a, b)`

## Territory / map
- `getFactionsForTerritory(territoryId)`
- `getRelevantFactionsForTerritory(territoryId, { limit })`
- `getFactionInfluenceForTerritory(territoryId)`
- `getFactionControllersForTerritory(territoryId)`
- `resolveFactionTerritoryForMap(mapOrId)`
- `resolveFactionTerritoryIdForMap(mapOrId)`

## Real world hierarchy
- `getJurisdiction(worldNodeId)`
- `listJurisdictionChildren(id, { offset, limit })`
- `getJurisdictionFactionContext(id, { presenceLimit })`
- `getJurisdictionPowerProfile(id)`
- `getFactionContextForWorldNode(locationOrJurisdictionNodeId)`

## Scene runtime
After `installFactionSystemIntegration()`:
- `scene.getFactionRuntime()`
- `scene.refreshFactionContext(mapOrId)`
- `scene.refreshFactionContextForWorldNode(nodeId)`
- `scene.getCurrentFactionContext()`
- `scene.getCurrentFactionControllers()`
- `scene.openFactionPanel(factionId)`
- `scene.openFactionSearchPanel(query)`
- `scene.openPlayerFactionPanel()`
- `scene.getFactionOverlayForWorldNode(nodeId)`

## State/save
- `createEmptyFactionGameState()`
- `ensureFactionGameState(gameState)`
- `serializeGameFactionState(gameState)`
- `hydrateFactionState(gameState, saved)`

## Validation
- `assertGameFactionSystem({ exhaustive })`
- `assertGeographyFactionFree(worldNodes)`
- `assertV5GameBlueprint(...)`
