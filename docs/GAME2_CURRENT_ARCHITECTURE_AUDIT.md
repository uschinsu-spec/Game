# GAME2 Current Architecture Audit

**Repository:** `uschinsu-spec/Game`  
**Audited branch:** `main`  
**Audited HEAD:** `efc29373089f987269627a7c3618377653bb9f3c`  
**Audit date:** 2026-09-15  
**Purpose:** Prompt 01 of the GAME2 migration plan. This document is an architecture audit only; it intentionally avoids a large gameplay rewrite.

---

## 1. Source of truth and audit rule

The target gameplay specification is `GAME2_MASTER_SYSTEM_UPGRADE_V2.txt` supplied for the rewrite. The current repository is treated as an implementation source, not as the gameplay authority when it conflicts with the GAME2 specification.

The following current implementation details are nevertheless valuable and should be preserved or migrated where technically sound:

- Babylon.js WebGL runtime and existing asset pipeline.
- `assets/characters/model-rigged.glb` and its verified rig/animation metadata.
- Existing enemy GLB library and enemy animation/collider metadata.
- Recent decomposition of the old monolith into `core/*` controllers.
- Shared `GameEvents`/`GameStorage` concept introduced in `core/game-state.js`.
- Deterministic/cached enemy loading direction in `EnemyLoader`, with the caveat described below.
- Current mobile graphics quality/dynamic-resolution ideas.
- Existing GitHub Pages/PWA deployment infrastructure.

The following gameplay concepts must not survive as authoritative GAME2 progression:

- Player Level.
- Combat EXP.
- Enemy Level.
- CP / total power score.
- Stage / Wave progression.
- EXP/min or kill-based automatic cultivation.
- Quick Battle.
- Mandatory Boss Timer / boss-wave progression.
- Automatic layer/realm advancement.

---

## 2. Current boot dependency graph

Current `boot.js` loads runtime groups in this order:

```text
Babylon.js
  -> Babylon loaders
  -> core/game-state.js
  -> assets/ui/ui-icons.js
  -> game.js
  -> terrain/environment scripts
  -> player rig/animation scripts
  -> enemy registry/animation/loader/ultimate-monsters
  -> core/idle-progression-controller.js
  -> core/player-input-controller.js
  -> core/spawn-controller.js
  -> core/combat-controller.js
  -> idle-adventure.js
  -> skill-vfx.js
  -> core/progression-service.js
  -> progression-systems.js
  -> mobile-runtime.js
  -> mobile-controls-fix.js
  -> mobile-minimap.js
```

This is materially better than the older single-file gameplay arrangement because dependencies are now explicit in boot order. However, it is still a **global-script architecture** based on `window.*` APIs and it still boots the legacy gameplay/UI layer.

### Primary current dependency chain

```text
core/game-state.js
    ├── window.GameEvents
    └── window.GameStorage

core/idle-progression-controller.js
    ├── GameStorage
    ├── GameEvents
    ├── state.stage/xp/stones/power/realm/layer
    └── window.IdleProgression + window.IdleCore

core/progression-service.js
    ├── GameStorage
    ├── GameEvents
    ├── window.IdleCore
    └── window.ProgressionService / SoloProgression / getProgressionPower

core/player-input-controller.js
    ├── GameRuntime.player
    ├── GameRuntime.camera
    ├── direct player.position mutation
    └── setPlayerTargetAngle / isPlayerMoving globals

core/spawn-controller.js
    ├── GameRuntime.player
    ├── IdleProgression.state.stage
    ├── ArenaMonsterEngine
    ├── safe-zone radius 52
    └── boss wave / boss timer

core/combat-controller.js
    ├── GameRuntime
    ├── SpawnController
    ├── IdleProgression
    ├── DOM HUD
    ├── direct monster/player HP logic
    ├── simple enemy chase/attack AI
    └── automatic rotating skills

idle-adventure.js
    ├── IdleProgression
    ├── PlayerInputController
    ├── SpawnController
    ├── CombatController
    ├── pet placeholder meshes
    ├── CombatRuntime facade
    ├── scene onBeforeRender orchestration
    └── 10-second setInterval save

progression-systems.js
    ├── ProgressionService
    ├── IdleCore
    ├── direct legacy panel rendering
    └── gear/skill/pet/research upgrade UI

mobile-minimap.js
    ├── GameRuntime
    ├── CombatRuntime.getMonsters()
    └── scene transform-node fallback scanning
```

---

## 3. What changed in the latest upgrade and should be preserved

Recent commits show a meaningful refactor toward smaller controllers. The following direction is worth preserving:

1. **Gameplay split by responsibility.** Player input, spawn, combat and progression have been extracted from the old monolith.
2. **Central event bus/storage facade.** `GameEvents` and `GameStorage` establish a migration seam for the next architecture.
3. **Enemy cleanup.** Unused legacy enemy controller, spawn manager, pool, LOD, shadow manager and validator were removed rather than duplicated.
4. **EnemyLoader simplification.** Asset-container caching and explicit loader/animation separation are preferable to legacy enemy-controller coupling.
5. **Mobile input ownership improvement.** `mobile-controls-fix.js` is now mostly a compatibility guard instead of a second movement controller.
6. **Shared combat runtime for minimap.** The minimap no longer needs to discover all enemies only by arbitrary scene naming in the normal path.
7. **Legacy HUD/style cleanup has begun.** Dead scene/UI state is being removed incrementally.

These improvements should be **evolved**, not discarded.

---

## 4. Critical remaining legacy behavior

### 4.1 `core/idle-progression-controller.js`

Still authoritative for:

- `stage`.
- `xp`.
- `stones`.
- `power`.
- automatic `cultivate()` progression.
- automatic layer advancement.
- realm advancement after layer 9.
- stage-based `xpPerMin()` / `stonesPerMin()`.
- offline XP/resource generation.
- kill/boss rewards tied directly to progression.

It also includes legacy realms beyond the target MASTER range.

**GAME2 disposition:** REWRITE/REPLACE as `CultivationSystem`, `MeditationSystem`, `BreakthroughSystem` and dedicated wallet/economy state. Keep only a temporary read-only migration facade if required.

### 4.2 `core/progression-service.js`

Still models character growth as numeric counters:

- `gear`.
- `skill`.
- `pet`.
- `research`.
- `food` / `traps`.
- `coins`.
- `power()`.

It directly spends old `IdleCore.state.stones` and automatically grants gear/skill/pet-like progression on mob/boss events.

**GAME2 disposition:** REWRITE. Replace with real Wallet, Inventory, Equipment, Skill/Mastery and Pet domains. Do not translate these counters into equivalent GAME2 power without an explicit migration rule.

### 4.3 `core/combat-controller.js`

Current useful part: combat is no longer buried inside the large `idle-adventure.js` file.

Current blocking problems:

- Player HP is controller-local (`hp=100`, `maxHp=100`).
- Enemy HP is mutated directly with `m.hp -= applied`.
- Damage is intentionally clamped to approximately 1.
- Crit uses direct `Math.random()`.
- Player auto-attacks every ~680 ms.
- Four skills rotate automatically.
- Targeting sorts all live monsters per attack.
- Enemy damage scales from `prog.state.stage`.
- Enemy AI and player combat are mixed in one file.
- Player regenerates HP automatically by hardcoded `dt*4`.
- Death instantly teleports the Babylon player to `(0,0,0)` and clears enemies.
- DOM HP/cast/skill UI is mutated directly from combat code.

**GAME2 disposition:** REWRITE into Damage/Heal/Shield/Status/Death/Targeting/CombatState systems plus separate Enemy AI and UI presenters. Remove from boot after replacement.

### 4.4 `core/spawn-controller.js`

Current useful part: spawn lifecycle is separate from combat.

Remaining legacy:

- Uses stage for enemy selection and count.
- Uses a single radial safe zone (`52`).
- Spawns around player/arena logic rather than zone ecology.
- `startBossWave()` clears normal enemies then spawns boss + three adds.
- Global 25-second boss timer.

**GAME2 disposition:** REWRITE as map-driven `SpawnSystem` + `EncounterSystem`. Keep no Stage/Wave dependency.

### 4.5 `core/player-input-controller.js`

Current useful part: one main pointer controller now owns joystick/pinch and keyboard.

Remaining architectural problem:

- Directly modifies `player.position.x/z`.
- Directly modifies `camera.radius`.
- Uses globals such as `window.isPlayerMoving` and `setPlayerTargetAngle`.
- Global pointer listeners and simplified pointer ownership.
- No authoritative Movement/Collision system between input and transform.

**GAME2 disposition:** REFACTOR into input adapters -> `InputSystem` -> `PlayerMotor/MovementSystem` -> `CollisionSystem`; camera receives zoom intent through `CameraController`.

### 4.6 `idle-adventure.js`

Now reduced primarily to orchestration/HUD/pet placeholder, which is a positive intermediate state. It still:

- owns legacy HUD refresh for Level/Power/realm.
- grants/displays offline reward.
- creates placeholder pet meshes.
- starts boss wave.
- exposes `CombatRuntime` global facade.
- drives input/combat/spawn on `scene.onBeforeRenderObservable`.
- uses `setInterval(...save...,10000)`.

**GAME2 disposition:** ADAPTER-TEMPORARY, then REMOVE-FROM-BOOT after `main.js`/runtime orchestration is ready.

### 4.7 `progression-systems.js`

UI remains coupled to old counters and directly invokes legacy upgrade methods. It displays:

- gear count and CP-style messages.
- skill level.
- pet level/research.
- EXP/power.
- map stage/ải.

**GAME2 disposition:** REMOVE after GAME2 panels/services exist.

### 4.8 `index.html` / HUD

Current HEAD still contains:

- `playerLevelBadge`.
- CP box / `totalPower`.
- skill `Lv.1` labels.

It has already lost some older Stage/Quick-Battle markup, which is progress.

**GAME2 disposition:** REFACTOR. Do not reintroduce deleted Stage UI during migration.

---

## 5. Player rendering and animation audit

### `game.js`

Useful current foundation:

- Babylon Engine/Scene.
- bright ACES/image-processing setup.
- Hemispheric + directional lighting.
- mobile-aware shadow size.
- DefaultRenderingPipeline.
- resize/orientation handling.

Architectural coupling to remove later:

- `PlayerRoot` is created directly in global runtime.
- `ArcRotateCamera.lockedTarget = player` is direct camera ownership.
- `window.GameRuntime` is global mutable service-locator style.

**Disposition:** KEEP-BUT-REFACTOR. Move toward Runtime/Renderer/Camera ownership rather than replacing Babylon setup wholesale.

### `assets/characters/rigged-player.js`

Valuable:

- robust bone alias discovery.
- model normalization/scaling.
- AnimationGroup discovery.
- weapon/back socket discovery.
- diagnostics.

Needs migration:

- global `window.*` controller APIs.
- visual/projectile responsibility mixed into rig adapter.
- clip map currently reliably targets `idle/walk/run/attack/hit`; death/cast availability must be inspected, not assumed.

**Disposition:** KEEP METADATA/DISCOVERY, REFACTOR into `PlayerRigAdapter` + `PlayerRenderer`. Projectile gameplay must move out.

### `player-animation-pro.js`

Current behavior estimates speed from Babylon position delta and can procedural-drive leg bones while also playing animation groups. This helped repair the old model but creates double-ownership risk.

**Disposition:** REWRITE into an Animation State Machine fed by authoritative PlayerMotor velocity. Retain only verified procedural fallback poses where the GLB genuinely lacks a usable clip.

### `player-upperbody-animation.js`

Currently observes skill-card CSS class mutations and converts them into a cast pose.

**Disposition:** REMOVE this DOM-driven trigger. CastSystem events must drive animation.

### `player-combat-facing.js`

Currently monkey-patches `window.setPlayerTargetAngle` and maintains a global facing lock.

**Disposition:** REWRITE as explicit FacingController/PlayerMotor integration.

---

## 6. Enemy asset/runtime audit

The enemy repository is one of the strongest reusable parts of the current game.

### Keep

- Existing GLB library under `assets/enemies/**`.
- Vietnamese display names where suitable.
- model paths.
- animation-name metadata.
- collider defaults.
- authored height/radius/ground offsets.
- normalized combat timing metadata when validated against clips.

### Refactor

`enemy-registry.js` currently mixes reusable asset metadata with old HP/damage/speed balance. Split eventually into:

```text
EnemyAssetDefinition
EnemyArchetype
EnemyTemplate
EnemyInstance
```

Old `hp/damage` values may be used only as migration/reference baselines, not as the final GAME2 realm/grade formula.

### `enemy-loader.js`

Good:

- AssetContainer cache.
- loading promise deduplication.
- separated instantiate step.
- explicit cache inspection/unload.

Caveat:

- default `nameSuffix` still uses `Date.now()` and `Math.random()` when caller does not supply one. Deterministic creation therefore depends on callers supplying a stable suffix/ID.

**Disposition:** KEEP-BUT-REFACTOR. Require entity ID suffix from the entity/spawn system; do not regress to removed legacy enemy-controller coupling.

---

## 7. Minimap audit

`mobile-minimap.js` currently:

- renders a lightweight 2D canvas at roughly 12.5 Hz.
- uses `CombatRuntime.getMonsters()` as primary enemy source.
- has a fallback that scans scene transform nodes by metadata/name.
- rotates around player yaw.
- supports edge indicators.

This is a useful lightweight renderer and should not be replaced blindly with a second full 3D camera.

Problems for GAME2:

- source is combat-arena centric.
- no world/zone discovery, POI, waypoint, quest or Fog of War.
- fallback scene scanning is not a scalable entity registry.

**Disposition:** KEEP RENDERING IDEA, REFACTOR DATA SOURCE to World/EntityRegistry/Discovery and expand into Minimap + Local Map + World Map.

---

## 8. Mobile controls compatibility audit

`mobile-controls-fix.js` has already been correctly reduced to a compatibility guard. It no longer moves the player itself. It sets `touchAction`, blocks iOS gesture events and resets `PlayerInputController` on blur/hidden.

**Disposition:** KEEP TEMPORARILY while PlayerInputController is refactored; then merge its necessary iOS browser guards into the final InputSystem lifecycle and remove the duplicate file from boot.

---

## 9. Mobile graphics/performance audit

`mobile-runtime.js` contains several good concepts:

- device-aware presets.
- hardware scaling.
- FXAA/bloom/shadow tuning.
- adaptive resolution with hysteresis.
- static-world freezing.
- distance culling.
- hidden-tab render pause.

Problems:

- `setInterval` owns streaming/perf loops outside a central scheduler.
- static/cull classification is based on mesh name prefixes.
- culling scans `scene.meshes` rather than a metadata/spatial registry.
- visibility lifecycle overlaps future world streaming ownership.
- render-loop stop/start should belong to one RuntimeController.

**Disposition:** KEEP ALGORITHMIC IDEAS, REFACTOR into PerformanceManager + TickScheduler + metadata-driven render registry.

---

## 10. PWA/service-worker audit

Current `service-worker.js` is already more robust than a static precache-only worker:

- network-first for code/critical GLB.
- stale-while-revalidate for static imagery/fonts.
- strips query strings into stable cache keys.
- supports purge messages.

Problems:

- cache names are not tied to an explicit immutable build ID.
- boot uses `?t=${Date.now()}` for local scripts, forcing unnecessary network churn even though SW normalizes keys.
- no transaction-aware controlled reload/update flow.
- final GAME2 should ensure retired legacy scripts can never be revived from stale caches.

**Disposition:** KEEP STRATEGY CONCEPTS, REFACTOR later around BUILD_ID/version manifest and SaveSystem flush.

---

## 11. File migration matrix

| Current file / area | Classification | GAME2 action |
|---|---|---|
| `.github/workflows/pages.yml` | KEEP | Preserve Pages deployment; verify final build path/version behavior. |
| `index.html` | REFACTOR-IN-PLACE | Remove Level/CP/skill-level legacy HUD; become GAME2 shell only. |
| `boot.js` | REFACTOR-IN-PLACE | Preserve ordered dependency idea; migrate toward stable module bootstrap/build ID. |
| `game.js` | KEEP-BUT-REFACTOR | Preserve Babylon setup; split runtime/camera/render ownership. |
| `core/game-state.js` | KEEP-BUT-REWRITE | Evolve EventBus/Storage facade into core EventBus + SaveSystem. |
| `core/idle-progression-controller.js` | REWRITE | Replace authoritative progression with Cultivation/Meditation/Breakthrough. |
| `core/player-input-controller.js` | REFACTOR-IN-PLACE | Input intents only; remove direct transform/camera mutation. |
| `core/spawn-controller.js` | REWRITE | Zone ecology SpawnSystem + EncounterSystem. |
| `core/combat-controller.js` | REWRITE | Damage/Heal/Shield/Status/Death/Targeting; remove AI/UI coupling. |
| `core/progression-service.js` | REWRITE | Wallet/Inventory/Equipment/Skill/Pet real domains. |
| `idle-adventure.js` | ADAPTER-TEMPORARY | Reduce to nothing as new composition root replaces it; then remove from boot. |
| `progression-systems.js` | REMOVE-AFTER-MIGRATION | Replace panels with GAME2 state-driven UI. |
| `skill-vfx.js` | KEEP-BUT-REFACTOR | VFX-only subscriber; no gameplay authority. |
| `assets/characters/model-rigged.glb` | KEEP ASSET | Preserve canonical current player model. |
| `assets/characters/rigged-player.js` | KEEP-METADATA + REFACTOR | PlayerRigAdapter/Renderer. |
| `assets/characters/player-animation-pro.js` | REWRITE | AnimationStateMachine fed by motor velocity/action events. |
| `assets/characters/player-upperbody-animation.js` | DELETE-AFTER-MIGRATION | Replace DOM observer with Cast events. |
| `assets/characters/player-combat-facing.js` | DELETE-AFTER-MIGRATION | Replace global monkey patch with FacingController. |
| `assets/enemies/**/*.glb` | KEEP ASSET | Preserve enemy model library. |
| `assets/enemies/enemy-registry.js` | KEEP-METADATA + REFACTOR | Split asset metadata from GAME2 stat/archetype definitions. |
| `assets/enemies/enemy-animation.js` | KEEP-BUT-REFACTOR | Renderer/animation service only. |
| `assets/enemies/enemy-loader.js` | KEEP-BUT-REFACTOR | Retain cache/instantiate model; require stable entity IDs. |
| `assets/enemies/ultimate-monsters.js` | REFACTOR | Asset/runtime adapter only; no Stage-based gameplay. |
| `assets/environment/**` | KEEP-ASSET + REFACTOR | Convert global world builder into Zone asset/data builders. |
| `mobile-runtime.js` | KEEP-ALGORITHMS + REFACTOR | PerformanceManager + Scheduler + metadata-driven culling. |
| `mobile-controls-fix.js` | ADAPTER-TEMPORARY | Merge iOS guards into final InputSystem then remove. |
| `mobile-minimap.js` | KEEP-RENDERER + REFACTOR | New EntityRegistry/Discovery/POI data source. |
| `service-worker.js` | KEEP-BUT-REFACTOR | Build-ID caches + controlled update after Save flush. |
| `style.css` | REFACTOR | Continue removing dead Level/CP/Stage styles as new UI lands. |
| `manifest.webmanifest` | KEEP | Adjust only if final app metadata/assets change. |
| `assets/ui/**` | KEEP ASSET | Reuse icons where appropriate; replace semantics that encode legacy systems. |

---

## 12. Current authoritative ownership vs target ownership

| Concern | Current owner | Target owner |
|---|---|---|
| Event bus | `core/game-state.js` global | Core `EventBus` with lifecycle ownership |
| Save/storage | `GameStorage` + subsystem localStorage | `SaveSystem` + migrations/backups/checksum |
| Cultivation | `IdleProgression` | `CultivationSystem` |
| Meditation | absent/idle reward proxy | `MeditationSystem` |
| Breakthrough | automatic while-loop | `BreakthroughSystem` manual transaction |
| Wallet | `IdleProgression.stones` | `WalletSystem` 4 stone tiers |
| Equipment | integer `gear` | `Inventory/Equipment/ItemGeneration` |
| Player transform | `PlayerInputController` direct Babylon transform | `PlayerMotor/Movement/Collision` |
| Camera zoom | `PlayerInputController` direct radius | `CameraController` |
| Damage | `CombatController` direct HP mutation | `DamageSystem` |
| Heal/regen | hardcoded combat update | `HealSystem` / status/stat rules |
| Status | absent | `StatusSystem` |
| Enemy AI | `CombatController.updateAi` | `AI/Aggro/Navigation` systems |
| Spawn | `SpawnController` stage arena | Zone `SpawnSystem` ecology |
| Boss | boss wave/timer | `EncounterSystem` |
| Skill cast | timer/automatic rotation | `Skill/Cast/Cooldown/Targeting` systems |
| Projectile | player rig visual helper | `ProjectileSystem` + renderer |
| Pet | placeholder mesh + integer level | `PetSystem` |
| Quest/NPC | effectively absent | `Quest/NPC/Dialogue/Interaction` systems |
| Map | arena + simple minimap | World/Region/Zone/SubZone/POI + maps |
| Minimap entity source | `CombatRuntime` | EntityRegistry + MapDiscovery |
| UI state | direct DOM reads/writes | State selectors/ViewModels + commands |
| Performance | `mobile-runtime` intervals | PerformanceManager + TickScheduler |
| PWA update | immediate SW update/skip waiting | versioned controlled update + Save flush |

---

## 13. Target dependency graph after migration

```text
index.html
  -> boot/runtime loader
      -> core Config / Logger / EventBus / Clock / Scheduler / RNG / Transaction / Save / Validator
      -> Data Catalogs
      -> Babylon Runtime
      -> World/Zone/AssetLoader
      -> Entity Registry
          -> Player Domain
          -> Enemy Domain
          -> Pet Domain
      -> Systems
          -> Stat / Cultivation / Meditation / Breakthrough
          -> Wallet / Inventory / Item / Equipment
          -> Input -> PlayerMotor -> Collision -> Camera
          -> Skill -> Cast -> Cooldown -> Targeting -> Projectile
          -> Damage / Heal / Shield / Status / Death
          -> AI / Aggro / Spawn / Encounter
          -> Loot / Pickup
          -> Alchemy / Crafting / Artifact / Formation
          -> Quest / NPC / Dialogue / Interaction
          -> MapDiscovery / Waypoint / Teleport
      -> Renderers
          -> Player / Enemy / Pet / Terrain / Environment / VFX / Map
      -> UI Presenters
      -> Audio
      -> PerformanceManager
```

Rules:

- Systems never infer authoritative state from DOM classes.
- Renderers never directly grant items, damage HP or advance quests.
- Input never directly edits Babylon transforms.
- Zone unload disposes every owned listener/task/render object.
- Save stores canonical domain state, not render references.

---

## 14. Symbol migration checklist

Before final GAME2 release the following symbols must have **zero authoritative runtime use**:

```text
IdleProgression
IdleCore
SoloProgression
ProgressionService
state.stage
xpPerMin
stonesPerMin
getProgressionPower
totalPower
playerLevelBadge
startBossWave
bossTimer
CombatRuntime as arena authority
```

The following symbols/concepts may exist temporarily only behind migration adapters:

```text
PlayerInputController
SpawnController
CombatController
GameStorage
GameEvents global facade
setPlayerTargetAngle
isPlayerMoving
PLAYER_ANIMATION_STATE
```

Each temporary adapter should emit a development deprecation warning or be tracked in the migration checklist.

---

## 15. Order for Prompts 02–18

1. **Prompt 02:** evolve core EventBus/Storage into Clock/Scheduler/Transaction/Save/Validation/Lifecycle.
2. **Prompt 03:** replace IdleProgression with Player/Cultivation/Meditation/Breakthrough.
3. **Prompt 04:** replace CombatController with authoritative combat kernel.
4. **Prompt 05:** implement Skill/Cast/Cooldown/Targeting/Projectile and remove auto-skill rotation.
5. **Prompt 06:** refactor PlayerInputController into InputSystem + PlayerMotor + CameraController.
6. **Prompt 07:** replace global/DOM-driven player animation stack with AnimationStateMachine.
7. **Prompt 08:** evolve deterministic enemy loading into Enemy Domain + AI + ecology/encounters.
8. **Prompt 09:** replace ProgressionService counters with economy/inventory/equipment/loot/shop.
9. **Prompt 10:** alchemy/crafting/pills/artifacts/formations.
10. **Prompt 11:** pet domain.
11. **Prompt 12:** NPC/quest/dialogue/interaction.
12. **Prompt 13:** world/map/streaming/terrain/discovery/teleport.
13. **Prompt 14:** complete Thanh Vân Sơn Mạch vertical slice.
14. **Prompt 15:** minimap/local/world map and world events/weather/tooling.
15. **Prompt 16:** final GAME2 UI/mobile/audio/settings; retire `progression-systems.js`.
16. **Prompt 17:** performance/boot/PWA versioning; retire Date.now script cache busting.
17. **Prompt 18:** remove adapters/legacy, full regression and production verification.

This ordering intentionally keeps the newly split controllers useful as migration seams instead of deleting them all on day one.

---

## 16. Prompt 01 acceptance results

| Acceptance item | Result | Evidence / note |
|---|---|---|
| Audit reflects latest modularized repo | PASS | Current boot/core controller split inspected at current HEAD. |
| Does not assume removed enemy modules still exist | PASS | Recent removal commits accounted for; no plan to restore them blindly. |
| New core modules are included | PASS | GameState, IdleProgression, PlayerInput, Spawn, Combat, ProgressionService mapped. |
| Assets are protected | PASS | Player GLB, enemy GLBs, UI/environment assets classified KEEP/KEEP-METADATA. |
| No large gameplay rewrite in Prompt 01 | PASS | Only this audit document is added. |
| Preserve valuable recent refactors | PASS | Event/storage seam, controller split, EnemyLoader direction and input guard explicitly retained. |
| Clear migration list for Prompt 02 onward | PASS | Sections 11–15. |

---

## 17. Final Prompt 01 conclusion

The repository is in a **useful intermediate refactor state**, not yet in the GAME2 architecture.

The correct next move is **not** to revert the new modularization and **not** to preserve its gameplay rules. The migration should keep the new seams while replacing the authoritative legacy concepts behind them.

Most important technical priorities for Prompt 02–06 are:

1. establish transaction-safe/versioned core state;
2. replace Stage/XP/Power progression;
3. replace direct HP mutation;
4. replace automatic timer-driven skills;
5. remove direct transform/camera mutation from input;
6. eliminate global/DOM-driven animation ownership.

Only after these foundations are authoritative should the larger economy, pet, quest and world/map systems be layered on top.
