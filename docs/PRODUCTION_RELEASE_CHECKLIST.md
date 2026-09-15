# Production Release Checklist — GAME2

## Automated CI gate
- `node --check` toàn bộ JS/MJS.
- `tests/phase17-ci.mjs`: BUILD_ID/PWA/cache/offline/scheduler policy.
- `tests/phase18-ci.mjs`: legacy files + runtime symbols + GAME2 invariant + release journey dependency contract.

## Production gameplay smoke
Chạy trên URL GitHub Pages của build hiện tại, với fresh storage/profile test:
1. Boot vào **Thanh Vân Thôn**; HUD, joystick, minimap và safe hub hoạt động.
2. Nhận quest từ NPC; interaction/dialogue không bypass range.
3. Rời hub, combat và gather; damage đi qua Realm Suppression, loot qua GroundLoot/Pickup.
4. Khám phá waypoint và teleport sau khi unlock.
5. Tương tác Forge/Đan Lô; tạo job, reload giữa job, claim một lần.
6. Thiền định và đột phá thủ công khi đủ điều kiện; không auto realm.
7. Đi qua các zone sâu hơn tới **Cổ Động Thanh Vân**.
8. Phá Ma Ấn, hoàn tất boss encounter; reward/loot chỉ một lần.
9. Save/reload; xác minh quest/world/discovery/inventory/craft job giữ state.
10. Chết và respawn tại anchor/waypoint gần nhất; có invulnerability theo Death/Respawn FSM.
11. Reload trang sau deploy mới; BUILD_ID và Service Worker phải trùng release hiện hành.

Không sign-off nếu xuất hiện Level/CP/Stage/Wave/CombatEXP/QuickBattle/BossTimer/autoRealm hoặc legacy facade nào trong runtime.
