# Cấu trúc và cách mở rộng game

Game chạy ES modules trực tiếp, không cần build hoặc thư viện ngoài.
`src/main.js` tạo `Game`; `src/game.js` điều phối khởi động, input và vòng lặp.

```text
GAME/
  index.html                  Trang chạy game
  cultivation_engine.js      Engine chỉ số, cảnh giới và dữ liệu skill
  src/
    main.js / game.js         Khởi động và điều phối
    core/
      config.js               Sprite, NPC mẫu, MP, tốc độ, bộ nhớ đệm
      assets.js               Tải ảnh từ assets/webp
      math.js                 Hàm toán dùng chung
      runtime.js              Điểm xuất tiện ích core
      systems.js              Đăng ký module, chặn trùng tên phương thức
    systems/
      characters.js           Khởi tạo, animation, di chuyển, hồi sinh
      npc-ai.js               Chọn quái riêng, combo và điều khiển NPC
      combat.js               Tầm đánh, skill, đạn bay, sát thương, phần thưởng
      progression.js          Tu luyện, công pháp, luyện đan, chỉ số quái
      persistence.js          Đọc/ghi save và đặt lại game
      travel.js               Truyền tống và bộ nhớ đệm ảnh map
      world-update.js         Quái, chiến lợi phẩm Linh Thạch và tuổi hiệu ứng
      renderer.js             Vẽ thế giới, nhân vật, VFX và minimap
    cultivation.js            Kết nối engine và giới hạn NPC
    floors.js / world.js      Asset 99 tầng, spawn, địa hình, cửa truyền tống
    skill-vfx.js              Hàng hệ, vùng cắt frame và màu VFX
    input.js                  Bàn phím, chuột, joystick cảm ứng
    ui.js / style.css         HUD, menu và giao diện
  assets/webp/                 Giữ đường dẫn tài nguyên hiện có
  assets/webp/MAP/             Bản đồ các tầng
  tests/                      Bộ chạy chung và kiểm tra cấu trúc
  tools/                      Công cụ asset và các bài kiểm tra hành vi cũ
  docs/                       Tài liệu kỹ thuật
```

## Quy tắc module

Mỗi system xuất object phương thức; `installSystems` đăng ký lên `Game.prototype`.
`this` là phiên Game hiện tại. Player/NPC dùng chung hành động, không sao chép
logic. Không dùng arrow function cho phương thức cần `this`, không import vòng
từ system về game.js. Đăng ký trùng tên phương thức sẽ báo lỗi ngay.

Module mới phải được import và đăng ký tại `game.js`; thêm hàm cập nhật vào `step`
ở thứ tự phù hợp. Dùng vòng lặp hiện có, không tạo timer riêng cho mỗi NPC/quái.

## Trạng thái và save

- `player`: tiến trình và trạng thái người chơi.
- `state`: quái, NPC, chiến lợi phẩm Linh Thạch và hiệu ứng tầng hiện tại.
- `mapStates`: trạng thái tầng đã ghé trong phiên chơi.
- `images` / `mapImages`: ảnh hoạt động và bộ nhớ đệm map có giới hạn.
- `target`: mục tiêu Player; `npc.aiTarget`: mục tiêu riêng của NPC.
- `npc.castTarget`: mục tiêu đã thi triển thành công, NPC đứng đánh đến khi đổi mục tiêu.

Giữ nguyên khóa localStorage và hỗ trợ save phiên bản 1/2. Hiện chỉ tiến trình
Player và tầng đang chơi tồn tại qua tải lại trang. Thêm trường lưu cần sửa cả
`save` và `restore`, xác thực dữ liệu và kiểm tra di trú save.

## Nơi bổ sung tính năng

| Thay đổi | Nơi chỉnh |
| --- | --- |
| NPC / hệ NPC | `core/config.js`: NPC_TEMPLATES; sprite trong TYPES và NPC_RENDER |
| MP, tốc độ, giới hạn ảnh map | `core/config.js`: GAMEPLAY |
| Skill / cảnh giới | `cultivation_engine.js` và `systems/combat.js` |
| Tác dụng skill mới | Combat, AI chọn chiêu, renderer và bài kiểm tra |
| VFX | `skill-vfx.js`; kích thước ảnh trong `tools/verify_assets.py` |
| Ảnh tầng | `floors.js`; cửa và địa hình trong `world.js` |
| Quái mới | World, cultivation, world-update và renderer |
| Nhiệm vụ / hành trang | System riêng, đăng ký game.js, kết nối UI và save |

Skill trừ MP một lần khi thi triển; đạn gây sát thương lúc tới đích. NPC chỉ dùng
chiêu đúng hệ/tu vi. Gọi hành động qua combat để giữ kiểm tra này. VFX chỉ vẽ,
không tự gây sát thương lại. Mỗi system chịu trách nhiệm một nhóm hành vi.

## Kiểm tra

`node tests/run.mjs` hoặc `npm test` kiểm tra cú pháp và tự tìm `test_*.mjs` trong
tests/tools, cùng verify_cultivation.mjs. Giữ các bài cũ trong tools để lệnh cũ
vẫn chạy. Thêm bài mới vào tests.

```powershell
node tests/run.mjs --python python
```

Lệnh trên kiểm tra thêm asset. Có thể thay python sau --python bằng đường dẫn
tuyệt đối tới Python có Pillow. Kiểm tra desktop và cảm ứng sau sửa input/UI/render.
`?debug` cung cấp `window.__GAME_DEBUG__` trong DevTools.

Kiểm tra trình duyệt tùy chọn: chạy HTTP server rồi `node tests/browser-smoke.mjs`.
Cần Playwright và Edge; game không phụ thuộc Playwright khi chạy bình thường.
Biến môi trường: GAME_URL đổi URL server, BROWSER_CHANNEL đổi trình duyệt,
PLAYWRIGHT_MODULE trỏ entrypoint Playwright đã cài, SCREENSHOT_DIR lưu ảnh kiểm tra.

## Giới hạn hiện tại

Collision là vùng đơn giản, chưa có tìm đường qua vật cản. 99 tầng dùng ảnh lặp
theo cấu hình. Chưa có backend hay đồng bộ multiplayer. Asset giữ tên/vị trí để
quy trình thay ảnh đang dùng tiếp tục hoạt động.
