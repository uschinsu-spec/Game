# CHANGELOG – VẠN TIÊN LỤC

## [v0.3] - Visual & Gameplay Polish (05/11/2026)

### Visuals
- Added original vector-illustrated SVG sprites for the white-robed sword cultivator, standard demon, elite demon and demon lord.
- Replaced orb-like placeholder enemy art with distinct creature silhouettes.
- Added layered water depth shading, sun-glint reflection and brighter perspective ripples.

### Combat
- Spawned enemies close to the horizon and let world-depth progression scale them naturally as they approach.
- Improved sword projectiles with cyan glow, a luminous trail and an impact burst before damage resolves.

### HUD & responsive layout
- Added an MP meter beside the HP bar.
- Added radial cooldown sweeps and remaining-time labels for four skills and the ultimate.
- Added compact-phone and short-screen layout breakpoints while preserving safe-area spacing.

### Validation
- GitHub Actions build/type-check workflow is configured for feature/** pushes and PRs into main.
- Device/browser viewport QA remains a manual release gate; see docs/visual-gameplay-polish-v0.3.md.


Tất cả các thay đổi và cột mốc phát triển của dự án Vạn Tiên Lục được ghi nhận tại đây.

---

## [Phase 1.1.0] - 2.5D Forward Perspective (Đạp Thủy Trảm Yêu) (04/11/2026)

### Đã chuyển đổi kiến trúc đồ họa & góc nhìn (Perspective Shift)
- Chuyển đổi toàn diện từ **2D Cuộn ngang (Side-scrolling)** sang **2.5D Chiều sâu hướng tâm (Forward Pseudo-Depth / Đạp Thủy Phi Hành)** theo phong cách các tựa game Tiên hiệp màn hình dọc thịnh hành:
  - **Mặt biển mây hoàng hôn**: Tái hiện chân trời rực rỡ với vầng thái dương lặn và các gợn sóng phối cảnh động (Perspective Waves) cuộn về phía trước.
  - **Nhân vật Bạch Y Kiếm Tiên (Góc nhìn từ sau lưng 3/4)**: Đứng ở trung tâm phía dưới (`X: 50%, Y: 58%`), chân đạp đài sen linh lực tỏa gợn sóng nước, tóc dài và tiên y phất phơ.
  - **Chiến trường phía trước**: Ma vật U Minh (*Thiên Mục Yêu - 千目妖*) lơ lửng trên mặt biển ở đường chân trời.
  - **Quỹ đạo đòn đánh**: Phi kiếm và kiếm khí phóng thẳng từ nhân vật hướng lên trước găm vào kẻ địch.
  - **Số sát thương phong cách Tiên hiệp**: Hiển thị chữ bạo kích thư pháp màu đỏ viền vàng (`暴击 893`, `暴击 1819`) cực kỳ hoành tráng.
  - **Pháp bảo Tiên Đỉnh**: Lò luyện đan Hỗn Nguyên Đỉnh lơ lửng ngay dưới chân nhân vật, tự động gom nhặt tinh hoa linh khí.
  - **Giao diện Dock Xianxia chuẩn**: Tái lập toàn bộ thanh Dock vòng cung với 7 nút tròn huy hiệu phát sáng (`Nhân vật`, `Luyện khí`, `Chí bảo`, `Động phủ` trung tâm, `Tiên thuật`, `Hóa linh`, `Đạo lữ`, `Tông môn`), thanh Lực chiến (战力 20,825+), VIP 0 và icon sự kiện.

---

## [Phase 1.0.0] - Core Gameplay & Modular Refactoring (04/11/2026)
- Xây dựng kiến trúc module tách rời Core, Entities, Systems, Data và UI.
- Hoàn thiện FSM 8 trạng thái cho Player và AI State Machine cho Monster.
- Hệ thống tính toán sát thương, bạo kích, 4 auto skills + 1 tuyệt kỹ Vạn Kiếm Quy Tông.
- Hệ thống rơi đồ và nam châm linh lực tự động hút vật phẩm.


## [v0.4] - Cinematic Xianxia Visual Upgrade (05/11/2026)
- Bổ sung lớp núi tiên nhiều tầng, tiên đảo lơ lửng có tiên điện, mây trôi, ánh sáng khí quyển và linh quang chuyển động bằng vector.
- Tích hợp môi trường điện ảnh vào vòng đời WorldScene; dựng lại lớp cảnh khi thay đổi kích thước màn hình.
- Vẽ mới chân dung Bạch Y Kiếm Tiên và bốn icon kỹ năng SVG nguyên bản: Kiếm khí, Phong hành, Hỏa kiếm, Kiếm trận.
- Nâng cấp HUD với khung chân dung, viền vàng, chất liệu nền, thanh HP/MP và nút kỹ năng đồng bộ mỹ thuật.
- Giữ nguyên logic chiến đấu, phối cảnh quái vật và hỗ trợ màn hình mobile hiện có.
