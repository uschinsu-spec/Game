# Human Realm Faction Network V5 — Expanded World / Codex Ready

## Mục tiêu

V5 là **source of truth duy nhất cho toàn bộ hệ thế lực/tông môn** của Nhân Giới. Gói này được viết lại theo GAME Drive mới nhất sau khi hệ faction cũ đã được reset/xóa. Geography/map tiếp tục thuộc `humanRealmWorld.js`, `humanRealmExpandedAtlas.js`, `humanRealmDetailedAtlas.js`, `masterMapManifest.js` và `worldRegistry.js`; V5 **không tạo map registry thứ hai**.

## Snapshot GAME đã dùng để thiết kế

- Human Realm world version: `20260929-human-realm-unified-v5-expanded-5qg`
- Master manifest version: `20260929-master-map-manifest-v4-canonical-unified`
- 99,062 world nodes
- 5 Đại Lục
- 42 vùng cấp cao
- 437 Châu / Đạo / Lĩnh / Phủ
- 2,185 Quốc
- 10,925 Thành Vực
- 21,850 Settlement (Thôn/Trấn)
- 63,617 location, gồm 27,699 field, 14,068 secret realm, 21,850 safe hub

Hierarchy V5 **bám đúng node thật**:

`Nhân Giới → Đại Lục → Đại Vực/Huyền Vực/Hoang Vực/Hàn Thiên/Thánh Vực → Châu/Đạo/Lĩnh/Phủ → Quốc → Thành Vực → Settlement/Thôn-Trấn → location`

Không chèn Quận/Trấn ảo nếu geography GAME không có node tương ứng.

## Hệ thống V5 có gì

- 24+ Supreme / Human-Realm powers và backbone quyền lực 5 Đại Lục.
- 9 tông môn player canonical giữ ID gameplay: `van_kiem_tong`, `thai_bach_tong`, `liet_diem_cung`, `bang_phach_cac`, `hau_tho_mon`, `thanh_moc_cac`, `phong_loi_cac`, `cuu_tieu_loi_dien`, `thanh_the_tong`.
- Rank tông môn đầy đủ: Tạp Dịch → Ngoại Môn → Nội Môn → Chân Truyền → Chấp Sự → Trưởng Lão → Điện Chủ → Thái Thượng → Tông Chủ.
- Archetype riêng: Tông Môn, Tu Tiên Gia Tộc, Cổ Tộc, Hoàng Triều, Thành Bang, Thương Hội, Nghề Nghiệp Hội, Học Cung, Tán Tu Minh, Hắc Thị, Ma Đạo, Dị Tộc, Hành Chính, Quân Đoàn, Tình Báo.
- Local faction generator deterministic cho mọi cấp jurisdiction thật.
- Branch / phân tông / chi hội / phân gia / garrison / shop / hidden cell kế thừa từ cấp trên xuống dưới.
- Vassal / protected / affiliate / client network.
- Influence đa chiều và controller riêng: political, cultivation, economic, security, intelligence, underworld; site bổ sung resource/exploration.
- Diplomacy graph, marriage, trade, rival, blood feud, secret alliance.
- Power vector, top cultivator distribution, population aggregate, leadership, internal politics, succession.
- Economy, treasury, resource stock, supply chain, trade network, market modifier.
- Strategic AI, goals, lifecycle, world ticks, offline compressed simulation.
- Events, war, siege, war score, peace terms, vassalization, territory transfer, remnants, power vacuum.
- Player relation: reputation, trust, loyalty, contribution, prestige, fear, notoriety, debt.
- Faction memory, 6 affiliation slots, contracts, law, wanted scope, disguise/identity, underworld heat, intelligence services.
- Player-created faction + progression + recruitment + diplomacy/war.
- Site faction context cho safe hub, wilderness, secret realm, forbidden/resource/battlefield.
- UI mixins, search, player affiliation panel và World Map overlay.
- Save V5 chỉ lưu faction dynamic state/delta, không copy base world/faction catalog.
- Lazy runtime: 5–12 faction active quanh map/player, bounded cache, không preload faction visual assets.

## Những file GAME cần Codex thay/nối

Gói có sẵn full replacement/compatibility file ở đúng path:

- `src/config/sectsData.js` — compatibility re-export, **không còn là source riêng**.
- `src/state/gameState.js` — bỏ `sectId/sectRankIdx/sectContrib/lastSalaryClaim`, dùng `factionState`.
- `src/state/saveSystem.js` — SAVE_VERSION 5, serialize/hydrate `factionState`; save V4 cũ vẫn load gameplay nhưng faction cũ không migrate.
- `src/main.js` — cài V5 sau map runtime và trước streaming/boot final gate.

Các module mới nằm ở `src/config/factions/**` và `src/scenes/mixins/Faction*.js`.

## Performance rule bắt buộc

1. Không materialize toàn bộ logical faction toàn world ở boot.
2. Không thêm faction portraits/banners/NPC/VFX vào preload.
3. Không loop 99,062 node hoặc hàng chục nghìn faction mỗi frame.
4. Current jurisdiction + nearby/player-related faction mới simulate sâu.
5. Background world dùng aggregate ticks + deterministic regeneration.
6. Boot optimization phải giữ cuối chuỗi install.

## Test

- `npm test`: standalone synthetic hierarchy + feature smoke.
- `npm run test:game`: chạy sau khi đặt package vào GAME thật; exhaustive 437 territory.
- `tests/CURRENT_GAME_TEST_RESULT.json`: kết quả đã chạy với snapshot Drive dùng để xây V5.
