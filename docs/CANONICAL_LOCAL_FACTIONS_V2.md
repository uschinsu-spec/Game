# Canonical Local Factions V2 — Complete Baseline

## Mục tiêu

V2 hoàn thiện baseline tông môn/gia tộc cố định của Nhân Giới. Faction không còn được quyết định khi player bước vào vùng. Mỗi thế lực có stable ID, tổng bộ/tổ địa, quy mô, truyền thừa, kinh tế, tài nguyên, cơ cấu và các phân chi neo vào world node thật.

## Quy mô

- 42 vùng cấp cao: mỗi vùng có 1 Đại Tông + 1 Đại Gia Tộc = **84 thế lực**.
- 437 Châu/Đạo/Lĩnh/Phủ: mỗi lãnh thổ có 1 Trung Tông + 1 Trung Gia Tộc + 1 Tiểu Tông + 1 Tiểu Gia Tộc = **1.748 thế lực**.
- Tổng canonical local faction = **1.832**.
- Mỗi lãnh thổ có đúng **6 phân chi canonical**:
  1. Phân Tông của Đại Tông cấp vùng.
  2. Phân Gia của Đại Gia Tộc cấp vùng.
  3. Phân Đường của Trung Tông.
  4. Chi Tộc của Trung Gia Tộc.
  5. Ngoại Viện của Tiểu Tông.
  6. Chi Phòng của Tiểu Gia Tộc.
- Tổng canonical branch = **2.622**.

## Hồ sơ mỗi thế lực

Mỗi faction canonical có dữ liệu baseline thực thay vì placeholder 0:

- rank/cấp thế lực và archetype;
- tổng bộ hoặc tổ địa + worldNodeId;
- người đứng đầu, tuổi đời, khẩu quyết và truyền thừa chủ đạo;
- chuyên môn tu luyện theo đặc trưng đại lục;
- population, cultivators, elite cultivators, elders, top experts;
- leaderRealmIdx và ancestorRealmIdx;
- treasury, income, trade/resource income, upkeep và expenses;
- Linh Thạch, linh thảo, khoáng, yêu liệu, trận liệu, đan liệu, khí liệu, dị bảo;
- luật nội bộ;
- cơ cấu rank tông môn hoặc gia tộc;
- chính sách tuyển người;
- branch policy.

## Bản đồ

Marker tiếp tục dùng worldRegistry làm single source of truth:

- `✦` Tông môn.
- `◆` Gia tộc.
- `✧` Phân Tông / Phân Gia / Phân Đường / Chi Tộc / Ngoại Viện / Chi Phòng.

Một lãnh thổ có thể có 10 marker baseline (4 HQ + 6 branch), nhưng World Map chỉ render tối đa 8 marker theo context để tránh quá tải UI mobile.

Marker không có runtime map riêng chỉ mở hồ sơ thế lực; không tạo map giả và không teleport giả.

## Runtime

Catalog 1.832 faction + 2.622 branch là dữ liệu nền để tra cứu. Simulation không quét toàn bộ catalog mỗi frame:

- `FactionRuntime`: tối đa 12 active faction quanh player.
- `FactionRuntimeCoordinator`: simulation bubble tối đa 60 faction.

Dynamic state chỉ dành cho biến động gameplay: player-created faction, reputation, diplomacy, war, vassal, lifecycle, diệt môn/phục hưng và influence delta.

## Boot invariant

`assertFactionBootReady()` kiểm tra:

- 42 vùng;
- 437 lãnh thổ;
- 1.832 canonical faction;
- 2.622 canonical branch;
- đúng 6 branch/lãnh thổ;
- 4 local faction/lãnh thổ;
- marker đầy đủ;
- population/economy/resources/cultivator/organization của faction mẫu không được rỗng.
