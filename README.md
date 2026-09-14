# Thanh Vân Tiên Vực

Web game 3D tiên hiệp tối ưu cho điện thoại, chạy trực tiếp trên trình duyệt bằng Babylon.js.

## Tính năng hiện tại
- Thế giới 3D tiên hiệp Trung Hoa rộng 320x320.
- Camera third-person luôn bám sau lưng nhân vật.
- Joystick mobile, zoom 2 ngón, kỹ năng, nhảy, mount và linh thú.
- Nhân vật tu tiên có khớp vai, khuỷu, cổ tay, hông, gối và cổ chân.
- PWA/fullscreen mobile.
- Tự kiểm tra phiên bản mới.
- Adaptive render resolution để giữ FPS ổn định trên điện thoại.
- Distance culling cho vật thể xa và freeze world matrix cho cảnh tĩnh.
- Service Worker cache để lần mở sau nhanh hơn và vẫn ưu tiên nhận bản cập nhật mới.

## Mục tiêu hiệu năng
- Ưu tiên 30 FPS ổn định trên iPhone/Android phổ thông.
- Tự giảm render resolution nếu FPS thấp và tăng lại khi máy còn dư hiệu năng.
- Cảnh xa được culling theo khoảng cách để giảm draw calls.

## Asset pipeline tiếp theo
Khi thêm asset thật, ưu tiên GLB/GLTF, Meshopt/Draco và texture WebP/KTX2. Nhân vật production nên dùng skinned GLB có animation Idle/Walk/Run/Attack/Skill/Ride/Hit/Death thay cho model procedural hiện tại.
