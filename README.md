# Thanh Vân Tiên Vực — GAME2

Web game 3D tiên hiệp chạy trên Babylon.js, tối ưu mobile/iPhone và được tổ chức theo kiến trúc domain-system thay vì Stage/Wave/CP/Level.

## Kiến trúc production
- **Progression:** `CultivationSystem → MeditationSystem → BreakthroughSystem`. Không Player Level, Combat EXP, CP, Stage/Wave hay auto-realm.
- **Combat:** `SkillSystem → CastSystem → SkillEffectResolver/ProjectileSystem → DamageSystem → Death/Respawn`. Realm Suppression và lethal floor nằm trong `DamageSystem`.
- **Movement:** `InputSystem → PlayerMotor → CollisionSystem → Player transform`. Camera do `CameraController` sở hữu.
- **Animation:** `PlayerAnimationStateMachine + FacingController + PlayerRigAdapter`; animation/VFX không gây damage.
- **Enemy:** `EnemyDomain → EnemyEntityRegistry → SpawnSystem → EnemyAISystem/EncounterSystem → EnemyRenderer`.
- **Economy:** `Wallet/Inventory/Item/Equipment/Loot/Pickup/Shop` với transaction/idempotency.
- **Craft:** job persisted + reservation-safe cho Alchemy/Crafting; Artifact/Formation dùng domain riêng.
- **Pet:** Pet entity/AI/skill/capture/pickup dùng chung combat/economy systems.
- **Quest/NPC:** event-driven Quest FSM + NPC/Dialogue/Interaction/ServiceRouter.
- **World:** `World → Region → Zone → SubZone → POI`, chunk streaming/refcount, discovery, waypoint, resource, respawn anchor.
- **Map:** Minimap / Local Map / World Map V2, Fog of War và markers từ authoritative registries.
- **UI:** UIState snapshot + UICommand router; view không sở hữu gameplay mutation.
- **Runtime:** BUILD_ID boot manifest, versioned Service Worker cache, RuntimeLifecycle và PerformanceTelemetry.

## Vertical slice production
Thanh Vân Sơn Mạch gồm: Thanh Vân Thôn → Thanh Trúc Lâm → Linh Khê Cốc → Vân Sơn Đạo → Thanh Vân Đỉnh → Cổ Động Thanh Vân. Safe hub, quest, gather, waypoint, craft/meditate, breakthrough, deeper zones và boss encounter đều dùng các system ở trên, không có central arena shortcut.

## Release gate
Mỗi push `main` phải qua JavaScript syntax check, Phase 17 PWA/performance policy, Phase 18 final migration/invariant audit và GitHub Pages deployment. Xem `docs/PRODUCTION_RELEASE_CHECKLIST.md` và `docs/SAVE_MIGRATION_GAME2.md`.
