# V5 POWER HIERARCHY — TỪ VÙNG CẤP CAO ĐẾN THÔN/TRẤN

V5 không nhân bản một faction thành hàng nghìn faction độc lập. Một thế lực cấp cao tạo **presence** xuống cấp dưới (phân tông, phân điện, chi hội, phân gia, đồn trú, cửa hàng, contact, hidden cell), trong khi mỗi jurisdiction vẫn có **local factions** riêng.

## Primary Region — 42 vùng cấp cao

Mỗi Đại Vực / Huyền Vực / Hoang Vực / Hàn Thiên / Thánh Vực có tối đa khoảng 12 local powers được materialize khi cần, ưu tiên:
- bá chủ tông môn / đạo thống;
- hoàng triều hoặc liên minh chính trị;
- cổ tộc;
- thương hội cấp vùng;
- Đan/Khí/Phù/Trận hội;
- mạng tình báo;
- hắc thị;
- tán tu minh;
- học cung;
- dị tộc phù hợp biome.

Institutions: hội đồng vùng, HQ đạo thống, triều đình bá chủ, cổ tộc estate, thương mại hub, nghề nghiệp tổng hội, Thiên Cơ phân các, mạng underground, teleport authority.

## Secondary Territory — 437 Châu/Đạo/Lĩnh/Phủ

Mỗi territory materialize khoảng 10–16 local factions tùy mật độ/importance:
- đại tông địa phương;
- chính quyền/triều đình chủ đạo;
- 2+ đại gia tộc;
- thương hội;
- nghề nghiệp hội;
- tông môn đối trọng;
- quân đoàn/trấn vệ;
- tán tu;
- tình báo;
- hắc thị;
- học cung / dị tộc nếu phù hợp.

Có đủ 6 controller: political, cultivation, economic, security, intelligence, underworld. Resource/exploration được giải ở site context.

## Nation — 2,185 Quốc

Mỗi Quốc có khoảng 8–11 local organizations:
- hoàng thất/chủ quyền;
- hộ quốc tông;
- 2 gia tộc đại thần;
- merchant hall;
- profession guild;
- cấm quân/trấn vệ;
- underworld;
- tán tu;
- intelligence office.

Institutions: royal court, protector sect, capital garrison, noble clans, treasury, merchant hall, profession halls, intelligence, underworld cell, tribute office.

## City — 10,925 Thành Vực

Mỗi Thành có khoảng 6–8 local powers:
- Thành Chủ Phủ;
- tông môn/phân đường;
- 2 gia tộc;
- thương hội;
- nghề nghiệp hội;
- thành vệ;
- hắc thị.

Services gồm đấu giá, luyện đan/luyện khí/phù/trận, truyền tống, bounty board, intelligence contact và underground contact tùy controller/policy.

## Settlement — 21,850 Thôn/Trấn

Mỗi settlement chỉ materialize khoảng 3–5 local factions để giữ mobile nhẹ:
- gia tộc bản địa;
- trưởng lão hội/hành chính;
- trú điểm hoặc ngoại viện tông môn;
- thương nhân/chi hội;
- hắc thị hoặc mật liên lạc.

Thế lực cấp trên xuất hiện bằng inherited presence, không sinh duplicate faction mới. Một thôn có thể về chính trị thuộc Quốc, tu luyện chịu ảnh hưởng một tông môn vùng, kinh tế do thương hội, và underground do một hidden cell.

## Location / site

Location không trở thành faction jurisdiction mới. V5 phân loại thành SAFE_HUB, WILDERNESS, SECRET_REALM, FORBIDDEN_ZONE, RESOURCE_SITE, BATTLEFIELD, SPECIAL_LOCATION và gắn:
- security controller;
- resource controller;
- cultivation controller;
- exploration controller;
- intelligence controller;
- underworld controller;
- claims, contested resources, encounter/quest hooks.

## Lazy rule

99,062 geography nodes không đồng nghĩa hàng trăm nghìn faction object active. Base core power được giữ; local factions được deterministic-generate/cache khi jurisdiction được hỏi; runtime chỉ giữ 5–12 faction quan trọng quanh player. Rời vùng thì cache bị giới hạn/evict, cùng seed sinh lại đúng faction cũ.
