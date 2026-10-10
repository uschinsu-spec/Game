# Vạn Mộc Sâm Lâm — Game tu tiên 2D

Game HTML5 Canvas, chạy trên điện thoại và máy tính, không cần npm hoặc backend.

**Quy tắc Tu Vi (cập nhật 10/10/2026):** đánh quái/Boss không tăng EXP cảnh giới. Chỉ **tĩnh tọa tu luyện** hoặc **dùng đan Tu Vi** mới tăng EXP. Quái **không rơi tiền hay Linh Thạch**; chỉ rơi Da Thú, Lông Thú, Huyết Thú, từ Yêu Thú Nhất Phẩm trở lên có thể rơi Nội Đan (Hạ/Trung/Thượng/Cực Phẩm). Nguyên liệu thường có thể bán từ Hành trang lấy Linh Thạch, Nội Đan được giữ lại. Đan Tu Vi luyện và sử dụng tại bảng ☯ Tu luyện, khác đan đột phá. Chi tiết và giới hạn chỉ số: [docs/CULTIVATION_COMBAT.md](docs/CULTIVATION_COMBAT.md).
Máy tính dùng toàn bộ cửa sổ; điện thoại giữ giao diện cảm ứng.

## Chạy game

Cấu trúc module và hướng dẫn thêm tính năng: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Tại thư mục chứa `index.html`:

```powershell
python -m http.server 8000
```

Mở http://localhost:8000 hoặc dùng `run game.bat`.
Để triển khai GitHub Pages, đưa nội dung thư mục GAME lên repository, bao gồm
`index.html`, `src/`, `cultivation_engine.js`, `assets/` và `.nojekyll`;
chọn branch và thư mục gốc trong Settings → Pages.

## Điều khiển

| Hành động | Máy tính | Điện thoại |
| --- | --- | --- |
| Di chuyển | WASD / phím mũi tên / click bản đồ | Chạm và kéo trên bản đồ để hiện joystick; thả để ẩn |
| Chọn quái | Click quái | Chạm nhanh lên quái |
| Đánh thường | Space / J | Nút kiếm |
| Thần thông đang chọn | Q | Nút thần thông |
| Hồi máu | F | Nút hồi máu |
| Menu | Escape | Nút menu |

## Bản đồ và NPC

- Có 99 tầng. Tầng 1 dùng `map.webp`, chỉ có hươu; tầng 2 dùng `map2.webp`, có sói. Tầng 3–99 cũng có sói.
- Cửa góc 5 giờ đi lên tầng tiếp theo, xuất hiện cạnh cửa góc 11 giờ của tầng đó. Cửa góc 11 giờ quay lại tầng trước. Tầng 1 không có cửa lùi, tầng 99 không có cửa đi tiếp.
- Tầng 3 dùng `MAP/map3.webp`. Các tầng sau dùng lần lượt ảnh trong `assets/webp/MAP`, theo cấu hình `src/floors.js`; 21 ảnh được lặp vòng để đủ tầng 3–99.
- Ảnh được tải khi vào tầng, giữ tối đa 3 ảnh bản đồ trong bộ nhớ đệm. Nếu tải lỗi, nhân vật ở nguyên tầng hiện tại và có thể thử lại.
- Từ tầng 2 có hai tu sĩ cùng phe; tầng 2 chỉ ở cảnh giới Phàm Nhân. Tầng 1 có NPC hướng dẫn Trưởng Thôn. Các tu sĩ: Xích Phong (`NPC1.webp`) và Bạch Vân (`NPC2.webp`).
- NPC tầng 1 là Phàm Nhân, chỉ di chuyển và đánh thường. Tầng 2 bắt đầu Luyện Khí Tầng 1.
- Cảnh giới NPC tăng theo bậc: tầng 3 là Luyện Khí Tầng 2, tầng 14 là Trúc Cơ Sơ Kỳ; từ tầng 29 giữ Hóa Thần Đỉnh Phong. Không phụ thuộc cảnh giới Player.
- Từ Luyện Khí, NPC chỉ dùng thần thông khi tấn công, không đánh thường kể cả khi thiếu MP hoặc chờ hồi chiêu. AI luân phiên các chiêu được mở, ưu tiên bậc hiện tại rồi bậc thấp hơn; mỗi chiêu có hồi chiêu riêng và cách lần thi triển tối thiểu 0,65 giây.
- Thuần thục chiêu cùng đại cảnh giới bị giới hạn theo sơ/trung/hậu/đỉnh: Sơ Nhập/Tiểu Thành/Đại Thành/Viên Mãn. Luyện Khí tầng 1–3/4–6/7–9/10–12 tương ứng bốn giai đoạn. Chiêu thuộc đại cảnh giới thấp hơn có thể đạt Viên Mãn. Giới hạn này chỉ áp dụng NPC.
- NPC đã tu luyện có thể hồi máu; mỗi lần thi triển chọn Enemy còn sống gần nhất và đánh ngay tại vị trí đang đứng, không yêu cầu khoảng cách hoặc giữ vị trí sau Skill đầu. Hai NPC có thể cùng nhắm một Enemy; Skill AOE của NPC lấy Enemy mục tiêu làm tâm. NPC Phàm Nhân vẫn phải tiếp cận trong tầm đánh thường. Xích Phong hệ Kim/Kiếm, Bạch Vân hệ Hỏa. Sói có thể tấn công NPC.
- Player và NPC dùng chung di chuyển, animation và hành động trong `src/systems/characters.js` và `src/systems/combat.js`.
- NPC hồi sinh sau 12 giây. Chiến lợi phẩm nguyên liệu của NPC được tính riêng; hạ quái không cộng EXP cho NPC.
- Trạng thái từng map được giữ khi truyền tống trong phiên chơi. Tải lại trang tạo lại quái và NPC.
- Asset dự trữ `assets/webp/ENEMIES/bandit.webp` không được tải vào game.

## Chiến lợi phẩm Yêu Thú

- Tầng 1: Linh Lộc phàm thú, không có Nội Đan. Tầng 2–13: Nhất Phẩm; 14–25: Nhị Phẩm; 26–37: Tam Phẩm; 38–49: Tứ Phẩm; **50–99: Ngũ Phẩm (tối đa)**. Từ tầng 59 trở lên yêu thú luôn đạt Ngũ Phẩm Đỉnh Phong; không xuất hiện Lục–Cửu Phẩm.
- Mỗi quái rơi Da Thú; Lông Thú có xác suất 72%, Huyết Thú 42%. Không bao giờ rơi tiền, Linh Thạch hoặc EXP.
- Mỗi đại phẩm chia thành bốn tiểu cảnh giới, mỗi cảnh giới tương ứng ba tầng: **Sơ Kỳ → Nội Đan Hạ Phẩm (50% cơ hội rơi)**, **Trung Kỳ → Trung Phẩm (30%)**, **Hậu Kỳ → Thượng Phẩm (15%)**, **Đỉnh Phong → Cực Phẩm (5%)**. Ví dụ tầng 11–13: Yêu Lang Nhất Phẩm Đỉnh Phong, khi rơi Nội Đan luôn là **Nội Đan 1 Phẩm · Cực Phẩm**.
- **Yêu thú càng cao cấp thì Nội Đan càng hiếm**: mỗi đại phẩm cao hơn có tỷ lệ chỉ bằng **85% của đại phẩm trước** ở cùng tiểu cảnh giới (ví dụ Nhị Phẩm Sơ Kỳ 42,5%; Ngũ Phẩm Đỉnh Phong khoảng 2,61%). Phẩm chất Nội Đan **không quay ngẫu nhiên** sau khi rơi mà phụ thuộc tiểu cảnh giới của yêu thú.
- Nhấn chọn quái để xem phẩm cấp và tiểu cảnh giới trên đầu quái.
- Vật phẩm nhặt tự động khi tiến đến gần, được cộng dồn trong **Hành trang** và lưu qua các lần đăng nhập. Nội Đan phân biệt cả phẩm cấp yêu thú (**1–5**) lẫn phẩm chất (Hạ/Trung/Thượng/Cực). Nếu save cũ chứa Nội Đan 6–9 Phẩm, khi tải sẽ tự quy đổi thành Nội Đan 5 Phẩm tương ứng cùng phẩm chất, giữ số lượng.
- Hành trang có nút **Bán Da/Lông/Huyết** để đổi nguyên liệu thường lấy Linh Thạch phục vụ học công pháp và luyện đan; **không tự bán Nội Đan**.

## Tu luyện và kỹ năng

Có 29 cảnh giới từ Phàm Nhân đến Hóa Thần Đỉnh Phong, công pháp, đột phá,
luyện đan bằng Linh Thạch, 40 thần thông thuộc 8 hệ và 4 bậc thuần thục.
Không còn hệ Linh Thảo, nhiệm vụ thu thập Linh Thảo hay nhiệm vụ đánh bại 10 Yêu Lang.
Chọn thần thông Q trong bảng ☯ Tu luyện. Chế độ tự đánh của Player chỉ tự đánh thường.
EXP của kẻ địch không còn là nguồn Tu Vi. Tốc độ tu luyện tĩnh tọa tự mở rộng theo yêu cầu cảnh giới và phẩm cấp công pháp; dùng đan Tu Vi để chủ động tăng Tu Vi.
Game lưu tiến trình Player và map hiện tại vào localStorage (schema v5, đọc được save v1/v2/v3/v4). Ngoài công pháp và Skill, save giữ Thần Thức thưởng, trang bị, thuần thục công pháp và đan Tu Vi.

`cultivation_engine.js` tính chỉ số và kết quả giao tranh; `src/cultivation.js`
kết nối engine vào game. Linh lực dùng duy nhất `mp`, chi phí thần thông theo bậc và MP tối đa.
Skill tiêu hao MP theo bậc và MP tối đa; Thần Thức tăng tốc ra đòn và tốc độ animation/VFX, không giảm thời gian hồi chiêu. Sát thương Skill được phát tại frame xuất chiêu hoặc lúc đạn chạm quái.
Hồi phục từ thần thông được áp dụng một lần mỗi lượt thi triển, kể cả khi đánh nhiều mục tiêu.
Vạn Vật Tái Sinh có thể dùng khi không có địch và gây sát thương trong bán kính 260px.

Thần thông Luyện Khí (bậc 1) dùng sprite đạn bay 12 frame từ nhân vật tới địch, vận tốc theo Thần Thức và độ thuần thục;
sát thương và trạng thái được áp dụng lúc chạm đích. Chiêu diện rộng bậc 1 nổ
quanh mục tiêu khi đạn tới. Bậc cao hơn hiện vẫn xử lý tức thời và dùng hiệu ứng Canvas.
Asset VFX: `luyen_khi_9he_7frame.webp`, 1774×887, 9 hàng × 12 cột không đều;
cắt theo tọa độ từng ô, bỏ đường phân cách và hiển thị ở kích thước 128×64.
Thứ tự hàng: Kiếm, Hỏa, Lôi, Kim, Thủy/Băng, Phong, Mộc, Thổ, Vật Lý.
Các chiêu `kiem_*` dùng hàng Kiếm. Cấu hình hệ và màu ở `src/skill-vfx.js`.
Khi chạm địch, phát `frame_7.webp` (140×140), nhuộm màu hệ và quầng sáng mờ;
không phát thêm flash va chạm chung. Player và NPC dùng chung cơ chế này.
Collision bản đồ
là các vùng đơn giản trong `src/world.js`, chưa phải tilemap chính xác theo từng vật cản.

## Asset đang dùng

| Tệp | Kích thước | Bố cục |
| --- | --- | --- |
| MAP/map.webp / MAP/map2.webp | 1672×941 | Bản đồ ngang |
| PLAYER/player.webp / NPC/NPC1.webp / NPC/NPC2.webp | 1920×432 | 4 hàng × 10 cột; ô 192×108 |
| ENEMIES/wolf.webp / ENEMIES/deer.webp | 1408×352 | 2 hàng × 8 cột; ô 176×176 |
| UI/avatar.webp | 128×128 | Avatar |

Player/NPC: hàng 1 idle, 2 run, 3 attack, 4 skill. Hướng trái lật ngang.
NPC được điều chỉnh theo chiều cao nhân vật thực tế để tương đương Player.

Chạy `python tools/build_assets.py` không tham số để kiểm tra asset, không ghi đè.
Để nhập một sprite mới đúng bố cục:

```powershell
python tools/build_assets.py --name player --source new_player.png --replace
```

Công cụ giữ ranh giới từng frame, kiểm tra tỷ lệ ảnh và xuất đúng kích thước hiện tại.
Có thể dùng `--output path.webp` để xuất ra tệp khác; tệp có sẵn chỉ được thay khi có `--replace`.
Nguồn phải có đúng bố cục hàng/cột; công cụ không chuyển đổi animation hoặc tự xóa nền.
`tools/resize_player.py` chỉ dành cho di trú sheet cũ 2560×576 về 1920×432;
với asset hiện tại công cụ không thay đổi gì.

## Kiểm tra

Chạy toàn bộ kiểm tra JavaScript bằng `node tests/run.mjs` hoặc `npm test`.
Chạy kèm kiểm tra ảnh: `node tests/run.mjs --python python`.
Không cần `npm install`. Những lệnh kiểm tra riêng dưới đây vẫn được hỗ trợ.

```powershell
node tools/verify_cultivation.mjs
node tools/test_npcs.mjs
node tools/test_npc_combos.mjs
node tools/test_floors.mjs
node tools/test_skill_vfx.mjs
python tools/verify_assets.py
```

Các kiểm tra bao gồm chỉ số, đột phá, save cũ, 40 thần thông, hồi máu một lần,
MP, AI, sát thương, hồi sinh và truyền tống hai chiều.

Mã nguồn cấp phép MIT, xem LICENSE.
