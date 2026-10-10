# ENEMIES MASTER — Quy chuẩn yêu thú

Danh mục runtime: `src/core/enemy-master.js`. Đường dẫn sprite: `src/core/assets.js`.

| Nhóm | Thư mục | Hàng đầu (row 0) | Hàng thứ hai (row 1) | Idle |
|---|---|---|---|---|
| GROUND | GROUND/ | Run — chạy khi di chuyển | Attack — đánh | Ảnh đầu hàng đầu (row 0, column 0) |
| WINGED | WINGED/ | Fly — bay khi di chuyển | Attack — đánh | Ảnh đầu hàng đầu (row 0, column 0) |
| DEER | DEER/ | Di chuyển | Hàng dự trữ | Ảnh đầu hàng đầu |

## Kích thước và phát hoạt ảnh

- GROUND/WINGED: 1760 × 352 px, 10 cột × 2 hàng, mỗi ô 176 × 176 px.
- DEER: deer.webp, 1408 × 352 px, 8 cột × 2 hàng.
- Khi di chuyển: lặp các khung hàng đầu theo moveAge. Đứng yên: cố định khung đầu, không phát Run/Fly.
- Khi đánh: hàng thứ hai, từ khung đầu đến khung cuối trong 0,6 giây. Attack được ưu tiên hơn di chuyển; không đọc lấn sang hàng khác.
- Neo chân trong ô tại y=173; lật ngang theo hướng nhìn, không kéo méo sprite.

## Yêu thú bay và bóng

- WINGED được nâng hình lên 26 px so với vị trí mặt đất (x, y) để bóng nằm tách phía dưới.
- Bóng vẫn ở vị trí mặt đất, hẹp và nhạt hơn GROUND: rộng 44% chiều rộng hiển thị, cao 8 px, opacity 65% so với bóng thường.
- Tên, cấp độ và thanh máu đi theo vị trí hình đã nâng. Vòng chọn, vị trí di chuyển và va chạm vẫn dùng tọa độ mặt đất.
- GROUND/DEER không nâng hình; bóng sát chân, rộng 57% chiều rộng hiển thị, cao 12 px.

## Danh mục và nhập ảnh

- DEER: 1 sprite; WINGED: 18 sprite; GROUND: 46 sprite.
- bandit.webp và wolf.webp đã gỡ. Loại chiến đấu Yêu Lang dùng sprite enemy2.webp.
- Công cụ nhập: tools/normalize_enemies.py. Phân nhóm xuất ảnh: src/data/enemies.json.
- Ảnh nguồn có ít hơn 10 cột được giữ nguyên các khung, lặp khung cuối cho đủ 10 cột; tách theo lưới thực, giữ tỷ lệ và nền trong suốt.
- Phân nhóm, sprite và quy tắc hoạt ảnh không tự thay đổi chỉ số chiến đấu hoặc danh sách xuất hiện ở các tầng.

File quản lý chính: src/data/enemies.json. Sửa danh mục enemies, kindSprites và floorRules tại đây; runtime và công cụ asset đọc trực tiếp.

## Chỉ số chiến đấu theo cấp yêu thú

combatLevels trong src/data/enemies.json chứa 21 bộ HP/ATK/DEF cố định: Phàm Thú và Nhất–Ngũ Phẩm, mỗi phẩm có Sơ/Trung/Hậu/Đỉnh. Cùng beastRank/beastStage được dùng cho chiến đấu, tên hiển thị và nội đan. Chỉ số không tăng theo tu vi player. Linh Lộc áp dụng 50% HP và 0 sát thương qua groups.DEER.combat.

## Cân bằng với player

Mỗi cấp chiến đấu dùng 112% HP/ATK/DEF nền player tại playerRealmIdx trong combatLevels. Tối đa 2 chữ số thập phân để bảo đảm mức tăng 10–15% cả ở ATK thấp; không cộng công pháp, trang bị, kỹ năng hoặc bạo kích vào mốc đối chiếu. DEF nền 0 vẫn bằng 0. Phàm Thú chiến đấu: 112 HP, 5.6 ATK, 0 DEF. Linh Lộc là ngoại lệ không chiến đấu, giữ 43 HP/0 ATK/0 DEF.
