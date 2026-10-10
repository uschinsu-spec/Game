# Vạn Mộc Sâm Lâm — Game tu tiên 2D

Game HTML5 Canvas, chạy trên điện thoại và máy tính, không cần npm hoặc backend.
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
- Mỗi map có hai tu sĩ cùng phe: Xích Phong (`NPC1.webp`) và Bạch Vân (`NPC2.webp`).
- NPC tầng 1 là Phàm Nhân, chỉ di chuyển và đánh thường. Tầng 2 bắt đầu Luyện Khí Tầng 1.
- Cảnh giới NPC tăng theo bậc: tầng 3 là Luyện Khí Tầng 2, tầng 14 là Trúc Cơ Sơ Kỳ; từ tầng 29 giữ Hóa Thần Đỉnh Phong. Không phụ thuộc cảnh giới Player.
- Từ Luyện Khí, NPC chỉ dùng thần thông khi tấn công, không đánh thường kể cả khi thiếu MP hoặc chờ hồi chiêu. AI luân phiên các chiêu được mở, ưu tiên bậc hiện tại rồi bậc thấp hơn; mỗi chiêu có hồi chiêu riêng và cách lần thi triển tối thiểu 0,65 giây.
- Thuần thục chiêu cùng đại cảnh giới bị giới hạn theo sơ/trung/hậu/đỉnh: Sơ Nhập/Tiểu Thành/Đại Thành/Viên Mãn. Luyện Khí tầng 1–3/4–6/7–9/10–12 tương ứng bốn giai đoạn. Chiêu thuộc đại cảnh giới thấp hơn có thể đạt Viên Mãn. Giới hạn này chỉ áp dụng NPC.
- NPC đã tu luyện có thể hồi máu; vào tầm thi triển lần đầu rồi đứng đánh mục tiêu đó. Mỗi NPC chọn quái riêng trên map. Xích Phong hệ Kim/Kiếm, Bạch Vân hệ Hỏa. Sói có thể tấn công NPC.
- Player và NPC dùng chung di chuyển, animation và hành động trong `src/systems/characters.js` và `src/systems/combat.js`.
- NPC hồi sinh sau 12 giây. XP, số quái hạ và vật phẩm của NPC tính riêng.
- Trạng thái từng map được giữ khi truyền tống trong phiên chơi. Tải lại trang tạo lại quái và NPC.
- Asset dự trữ `bandit.webp` và `assets/webp/map3.webp` ở ngoài thư mục MAP không được tải vào game.

## Tu luyện và kỹ năng

Có 29 cảnh giới từ Phàm Nhân đến Hóa Thần Đỉnh Phong, công pháp, đột phá,
luyện đan, 40 thần thông thuộc 8 hệ và 4 bậc thuần thục.
Chọn thần thông Q trong bảng ☯ Tu luyện. Chế độ tự đánh của Player chỉ tự đánh thường.
Game lưu tiến trình Player và map hiện tại vào localStorage; save cũ phiên bản 1 vẫn được hỗ trợ.

`cultivation_engine.js` tính chỉ số và kết quả giao tranh; `src/cultivation.js`
kết nối engine vào game. Linh lực dùng duy nhất `mp`, mỗi thần thông tốn 1 MP.
Hồi phục từ thần thông được áp dụng một lần mỗi lượt thi triển, kể cả khi đánh nhiều mục tiêu.
Vạn Vật Tái Sinh có thể dùng khi không có địch và gây sát thương trong bán kính 260px.

Thần thông Luyện Khí (bậc 1) dùng sprite đạn bay 12 frame từ nhân vật tới địch;
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
| map.webp / map2.webp | 1672×941 | Bản đồ ngang |
| player.webp / NPC1.webp / NPC2.webp | 1920×432 | 4 hàng × 10 cột; ô 192×108 |
| wolf.webp / deer.webp | 1408×352 | 2 hàng × 8 cột; ô 176×176 |
| avatar.webp | 128×128 | Avatar |

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
