# 🌲 HỆ THỐNG MÔI TRƯỜNG & ĐỊA HÌNH (ENVIRONMENT)

Thư mục `assets/environment/` bao gồm các thành phần:

```text
assets/environment/
│
├── 🌾 terrain/              # Dữ liệu Texture mặt đất & địa hình tự nhiên
│   └── tex_01_Grass_Lush.js # Texture đồng cỏ tự nhiên liền mạch
│
└── 🌐 world/                # Hệ thống sinh thế giới & logic môi trường (enhanced-world.js)
```

---

## 🚀 Hướng dẫn mở rộng
- Khi thêm texture đất/đá mới: đặt vào `assets/environment/terrain/`.
- Thế giới game được dựng và tinh chỉnh trong `assets/environment/world/enhanced-world.js`.
- Mô hình 3D tùy chỉnh (.GLB/.glTF) được khai báo và quản lý trong hệ thống asset/enemy registry.
