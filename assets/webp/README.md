# Tài nguyên WebP

- MAP/: toàn bộ ảnh bản đồ, kể cả tầng 1 và 2.
- PLAYER/: sprite nhân vật chính.
- NPC/: sprite tu sĩ và NPC chức năng, gồm Trưởng Thôn.
- ENEMIES/: hươu, sói, bandit và enemy1.webp–enemy40.webp (sprite 10 cột × 2 hàng, ô 176 × 176).
- VFX/: đánh thường, hiệu ứng va chạm và bảng thần thông.
- UI/: avatar giao diện.

Giữ nguyên nội dung và tên ảnh. ID trong game (player, NPC1, wolf...) được ánh xạ trong src/core/assets.js. Cấu hình bản đồ ở src/floors.js. Icon nằm riêng tại assets/icons/.

Bộ enemy1–40 được nhập theo thứ tự tên PNG trong Downloads/New folder (2). Nguồn 9, 11, 19, 23, 38 có 9 cột: giữ nguyên 9 khung, lặp khung cuối thành cột 10. Công cụ tools/normalize_enemies.py tách theo đường lưới thật, giữ tỷ lệ, neo chân ở y=173 và sao lưu bản cũ trong ../output/enemy-repair-*/backup. enemy11 được sửa kênh alpha bị dính nền xám.

Bộ mới enemy41–64: 24 PNG từ Downloads/New folder, thứ tự theo tên file. enemy52 có 9 cột, enemy64 có 8 cột; lặp khung cuối để đủ 10 cột. Nhập bằng: python tools/normalize_enemies.py "SOURCE" --start 41 --columns "52:9,64:8".

ENEMIES chia 3 nhóm: DEER/ chỉ deer.webp; WINGED/ gồm 18 yêu thú có cánh; GROUND/ gồm 48 sprite còn lại. Danh mục src/data/enemies.json được công cụ chuẩn hóa sử dụng để xuất đúng thư mục. ID asset giữ nguyên, đường dẫn nằm trong src/core/assets.js.

bandit.webp và wolf.webp đã gỡ. Yêu Lang dùng enemy2.webp (10 khung/hàng); DEER: 1 ảnh, WINGED: 18 ảnh, GROUND: 46 ảnh.

Quy chuẩn hoạt ảnh Run/Fly, Attack, Idle và bóng bay: ENEMIES/MASTER.md. Master runtime: src/core/enemy-master.js.

File quản lý chính: src/data/enemies.json. Sửa danh mục enemies, kindSprites và floorRules tại đây; runtime và công cụ asset đọc trực tiếp.
