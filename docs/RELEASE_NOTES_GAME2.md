# GAME2 Release Notes — Phase 18

Build: **2026.09.15-p18.1**

## Hoàn tất migration
- Xóa compatibility facade còn lại: IdleProgression/IdleCore, ProgressionService/SoloProgression, SpawnController, CombatController, PlayerInputController facade, CombatRuntime/idle-adventure và minimap/progression/mobile-control legacy.
- Xóa ba animation compatibility globals cũ; PlayerAnimationStateMachine/FacingController là owner duy nhất.
- Cast interrupt đọc trực tiếp PlayerMotor, không còn global movement mirror.
- Combat presentation chỉ render damage/death feedback; enemy lifecycle thuộc SpawnSystem/EnemyRenderer.
- Legacy save keys chỉ được đọc bởi `LegacyMigrationReader`, ghi migration audit rồi dọn key cũ; legacy gear/skill/pet counters không được convert thành sức mạnh GAME2.

## Gameplay release
Vertical slice hỗ trợ hub → quest → combat/gather → waypoint → craft/meditate → breakthrough → deeper zones → cave boss → save/reload/death/respawn theo domain systems GAME2.

## Bất biến release
Không Player Level, CP, Stage, Wave, Combat EXP, Quick Battle, Boss Timer hoặc auto Realm. Damage, loot, crafting, quest reward và save giữ ownership/transaction rules từ MASTER.
