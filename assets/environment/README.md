# Environment assets

Thư mục `assets/environment/` hiện chỉ giữ các phần đang dùng hoặc còn giá trị cho GAME.

```text
assets/environment/
├── terrain/
│   ├── tex_01_Grass_Lush.js      # texture nền hiện đang được GAME nạp
│   └── tex_02...tex_20            # thư viện texture dự phòng, chưa nạp ở runtime
└── world/
    ├── enhanced-world.js          # dựng thế giới mở + placeholder environment
    └── village-safezone.js        # dựng thôn trấn placeholder + safe zone
```

## Placeholder hiện tại
Asset flora cũ và pack THON TRAN đã được gỡ hoàn toàn khỏi repository. Cây, đá và kiến trúc tạm thời được dựng bằng Babylon.js primitive qua:

`assets/placeholders/world-placeholders.js`

Mục tiêu của placeholder là giữ GAME chạy nhẹ, dễ kiểm tra gameplay và dễ thay bằng GLB/GLTF production sau này.

## Quy tắc thêm asset mới
- Asset môi trường thật: ưu tiên GLB/GLTF tối ưu, texture WebP/KTX2.
- Không nhúng asset mới trực tiếp vào file gameplay chính.
- Loader/registry nên đặt riêng theo nhóm asset.
- Không thêm asset vào Service Worker core cache nếu không cần cho màn hình khởi động.
