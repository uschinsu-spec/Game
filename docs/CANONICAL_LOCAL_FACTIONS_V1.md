# Canonical Local Factions V1

## Mục tiêu

Thay baseline `generateJurisdictionFactions()` bằng một **canonical faction atlas cố định**. Tông môn/gia tộc nhỏ-trung bình và các phân chi tồn tại từ đầu thế giới, có stable ID, lãnh địa gốc và world-node anchor để World Map/Minimap hiển thị trực tiếp.

Runtime dynamic faction chỉ còn dành cho biến động gameplay sau khi thế giới đã tồn tại: player-created faction, chiến tranh, chuyển lãnh thổ, diệt môn/phục hưng, reputation và diplomacy state. Không dùng runtime generator để quyết định "vùng này có faction gì".

## Quy mô baseline

Theo Human Realm hiện tại:

- 42 vùng cấp cao: mỗi vùng có 1 Đại Tông + 1 Đại Gia Tộc = **84 thế lực cấp vùng**.
- 437 Châu/Đạo/Lĩnh/Phủ: mỗi lãnh thổ có 1 Trung Tông + 1 Trung Gia Tộc + 1 Tiểu Tông + 1 Tiểu Gia Tộc = **1.748 thế lực địa phương**.
- Tổng canonical local atlas: **1.832 faction**.
- Mỗi lãnh thổ có 4 nhánh cố định khi geography đầy đủ: Phân Tông của Đại Tông vùng, Phân Gia của Đại Gia Tộc vùng, Phân Đường của Trung Tông tại Quốc trực thuộc, Chi Tộc của Trung Gia Tộc tại Quốc trực thuộc = khoảng **1.748 branch**.
- Cộng với 59 core faction hiện hữu (Supreme + continent powers + 9 player sect canonical), baseline faction có thể tra cứu trực tiếp là khoảng **1.891 faction** trước player-created/dynamic lifecycle.

## Mô hình thế lực

### Đại Tông cấp vùng

- `scope = PRIMARY_REGION`
- `powerTier = MAJOR`
- Có trụ sở tại node `great_region`.
- Mỗi lãnh thổ trực thuộc có một `phan_tong` canonical.

### Đại Gia Tộc cấp vùng

- `scope = PRIMARY_REGION`
- `powerTier = MAJOR`
- Có tổ địa tại node `great_region`.
- Mỗi lãnh thổ trực thuộc có một `phan_gia` canonical.

### Trung Tông / Trung Gia Tộc

- `scope = SECONDARY_TERRITORY`
- `powerTier = MEDIUM`
- Có HQ/tổ địa cố định tại node Châu/Đạo/Lĩnh/Phủ.
- Trung Tông có `phan_duong` tại một Quốc trực thuộc.
- Trung Gia Tộc có `chi_toc` tại một Quốc trực thuộc.

### Tiểu Tông / Tiểu Gia Tộc

- `scope = SECONDARY_TERRITORY`
- `powerTier = MINOR`
- Có HQ/tổ địa cố định tại node Châu/Đạo/Lĩnh/Phủ.
- Không tự sinh thêm chi nhánh; chỉ mở rộng khi lifecycle/gameplay thay đổi sau này.

## Map marker

Mọi canonical faction/branch có `worldNodeId`/`mapNodeId` bám node trong `worldRegistry`; không có registry tọa độ thứ hai.

World Map dùng ký hiệu:

- `✦` Tông môn.
- `◆` Gia tộc/Cổ tộc.
- `✧` Phân Tông / Phân Gia / Phân Đường / Chi Tộc.

Khi marker chưa có runtime map riêng, click chỉ mở thông tin thế lực. Không tạo map giả và không cho teleport tới một runtime map không tồn tại.

## Runtime contract

`HumanRealmFactionNetwork.getLocalFactionsForJurisdiction()` đọc canonical atlas. `ensureBranchesForTerritory()` đọc canonical branches. Baseline không gọi `generateJurisdictionFactions()` hoặc `planBranchesForTerritory()`.

Các hệ influence, controller, diplomacy, vassal, war, save delta và player-created faction tiếp tục dùng stable faction ID nên không cần thay save format chỉ để nhận diện baseline faction.
