# Đặc tả chỉ số và chiến đấu (2026-10-10)

## Quy tắc Tu Vi

- Tu Vi (EXP cảnh giới) **chỉ** tăng bằng tĩnh tọa hoặc dùng **đan Tu Vi**.
- Giết quái/Boss **không** cấp Tu Vi hoặc Linh Thạch cho Player lẫn NPC; chỉ có chiến lợi phẩm Da Thú, Lông Thú, Huyết Thú, và có thể thêm Nội Đan từ Yêu Thú Nhất Phẩm.
- Đan Tu Vi: luyện bằng Linh Thạch, được cất trong `pills`, sử dụng thủ công tại **☯ Tu luyện**; mỗi viên tăng 12% EXP cần cho cảnh giới hiện tại.
- Bỏ hoàn toàn Linh Thảo, không sinh đối tượng hoặc rơi vật phẩm thảo dược. Gỡ bảng nhiệm vụ đánh Yêu Lang và thu thập Linh Thảo; vẫn giữ quái Yêu Lang.
- Đan bình cảnh và đan Tu Vi đều dùng chi phí Linh Thạch, không còn điều kiện nguyên liệu Linh Thảo. Linh Thạch có thể nhận bằng cách **bán nguyên liệu Yêu Thú trong Hành Trang**, không phải từ quái rơi trực tiếp.
- Hệ Nội Đan: Linh Lộc tầng 1 không có Nội Đan; tầng 2–13 yêu thú Nhất Phẩm, tiếp tục mỗi 12 tầng tăng một phẩm tới Cửu Phẩm. 35% xác suất rơi Nội Đan, phẩm chất Hạ/Trung/Thượng/Cực = 70/20/8/2 (tỷ lệ có điều kiện khi đã rơi). Không tự bán Nội Đan.
- Tất cả vật liệu và Nội Đan đều cộng dồn và lưu vào `materials` (save v5).
- Đan **đột phá** thuộc hệ riêng, vẫn được dùng ở bình cảnh.
- Tốc độ tĩnh tọa phụ thuộc công pháp **và EXP yêu cầu của cảnh giới**, dùng `Engine.calcMeditationRate`. Không còn tình trạng vài ngày mới có đủ EXP ở Hóa Thần.
- Thuần thục **Skill** tăng bằng luyện chiêu nhưng không cấp EXP cảnh giới. Thuần thục **công pháp** tăng rất chậm khi thực sự tĩnh tọa (đủ 100% sau nhiều giờ), không tăng từ hạ quái.

## Nguồn dữ liệu chuẩn

- `cultivation_engine.js`: chỉ số cơ bản, 29 cảnh giới, tính damage/defense/MP, crit, tốc đánh, EXP tu luyện.
- `src/core/combat-tempo.js`: một nguồn quy chuẩn cho khoảng cách đòn, thời gian animation, frame phát Skill, vận tốc đạn, FPS VFX. Player và NPC dùng chung.
- `src/cultivation.js`: công thức quái theo tiểu cảnh giới, 6 đơn đan Tu Vi, giới hạn thuần thục NPC.
- `src/systems/combat.js`: xác thực tầm đánh và MP, giảm cooldown, ghi nhận trạng thái cast; sát thương Skill chỉ xảy ra ở **release frame** hoặc khi **projectile va chạm**.
- `src/systems/characters.js`: cập nhật đồng hồ animation; `renderer.js` chỉ vẽ, không tính sát thương.
- `src/systems/progression.js`: tĩnh tọa, luyện đan đột phá, luyện và dùng đan Tu Vi.
- `src/systems/persistence.js`: `save.version=5` và tiếp tục hỗ trợ save v1/v2/v3/v4 với khóa localStorage gốc.

## Quy tắc cân bằng

- Bạo kích tăng theo đường cong logarithm Thần Thức, trần 75%, không còn 95% ngay Trúc Cơ.
- Thần Thức/bonus tốc đánh quyết định cooldown và tốc độ animation. VFX bay bằng pixel/s (theo `dt`), hệ số thuần thục tăng tốc VFX.
- Skill có MP theo phần trăm tối đa và tier (bậc 1–5: 5% / 8% / 12% / 18% / 25%); cooldown riêng **không** bị giảm bởi tốc đánh để tránh nhân đôi DPS.
- Công pháp chuyên hệ cho lợi thế đúng hệ, nhưng nền sát thương và thủ vẫn có tác dụng với các đòn còn lại.
- Quái scale trong tiểu cảnh giới; NPC scale theo tầng như trước. Hiệu ứng choáng/chậm có thể kháng nhờ `controlResistance`.
- NPC đã tu luyện chọn Enemy gần nhất liên tục và thi triển Skill ngay dù mục tiêu ở xa (không tranh mục tiêu với NPC khác, không chờ tiếp cận tầm Skill đầu, không khóa vị trí sau lần cast đầu). Skill AOE NPC lấy Enemy làm tâm; VFX đạn vẫn bay và sát thương được áp dụng khi chạm đích. Phàm Nhân vẫn đánh cận chiến như cũ.
- `equippedGear`, `spiritualSenseBonus`, `congPhapMastery` được lưu; cấp phát trang bị/vật phẩm vẫn có thể mở rộng sau.

## Độ tương thích

- Các sprite WebP, frame sheet, URL GitHub Pages, bản đồ, điều khiển và đường dẫn asset giữ nguyên.
- Một action đánh thường và một action skill không phát đồng thời. Khi Skill được bấm, MP/cooldown trả ngay lúc xác nhận; damage/VFX tại frame phát.
- Chuyển tầng, chết, hồi sinh phải huỷ `pendingSkill`.
- Không tạo timer thứ hai; toàn bộ phép tính dựa trên `dt` vòng lặp chính.

## Kiểm thử

`npm test`: test nền, tốc độ, skill VFX, NPC, lưu tiến trình, không EXP từ hạ quái, đan Tu Vi.
`npm run check:assets`: kiểm tra ảnh (cần Python + Pillow).
