# Thanh Vân Tiên Vực

Web game 3D tiên hiệp tối ưu cho điện thoại, chạy trực tiếp trên trình duyệt bằng Babylon.js.

## Tính năng hiện tại
- Thế giới 3D tiên hiệp Trung Hoa rộng 320x320.
- Gameplay ưu tiên màn hình dọc và chơi một tay.
- Joystick 360 độ, tốc độ di chuyển theo độ kéo.
- Camera third-person tự bám sau lưng và giữ nhân vật ở 1/3 dưới màn hình.
- Auto-target/soft-lock quái gần phía trước.
- 1 nút đánh chính + 3 kỹ năng: Kiếm Khí, Liên Trảm, Pháp Trận.
- Thanh máu mục tiêu và phản hồi đánh trúng.
- Menu phụ thu gọn cho vũ khí, trang bị, tọa kỵ và linh thú.
- Zoom hai ngón, PWA/fullscreen mobile và khóa portrait-primary khi cài ra màn hình chính.
- Nhân vật tu tiên có khớp vai, khuỷu, cổ tay, hông, gối và cổ chân.
- Adaptive render resolution để giữ FPS ổn định trên điện thoại.
- Distance culling cho vật thể xa và freeze world matrix cho cảnh tĩnh.
- Service Worker cache để lần mở sau nhanh hơn và vẫn ưu tiên nhận bản cập nhật mới.

## Mục tiêu hiệu năng
- Ưu tiên 30 FPS ổn định trên iPhone/Android phổ thông.
- Tự giảm render resolution nếu FPS thấp và tăng lại khi máy còn dư hiệu năng.
- Cảnh xa được culling theo khoảng cách để giảm draw calls.

## Asset pipeline tiếp theo
Khi thêm asset thật, ưu tiên GLB/GLTF, Meshopt/Draco và texture WebP/KTX2. Nhân vật production nên dùng skinned GLB có animation Idle/Walk/Run/Attack/Skill/Ride/Hit/Death thay cho model procedural hiện tại.
