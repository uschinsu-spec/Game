# Assets - Thanh Vân Tiên Vực

Toàn bộ asset thay thế được đặt trong thư mục này. Game đọc đường dẫn từ `asset-manifest.js`.

## Cấu trúc
- `characters/player/` - nhân vật chính (`player.glb`)
- `characters/enemies/` - quái thường (`enemy.glb`)
- `characters/bosses/` - boss (`boss.glb`)
- `pets/` - linh thú (`spirit-pet.glb`)
- `weapons/` - vũ khí (`sword.glb`)
- `equipment/` - trang bị (`robe.glb`)
- `environment/buildings/` - công trình
- `environment/trees/` - cây, tre
- `environment/rocks/` - đá
- `environment/props/` - đạo cụ
- `ui/icons/`, `ui/panels/`, `ui/buttons/` - giao diện
- `effects/` - VFX 2D
- `textures/` - texture map
- `audio/` - nhạc và âm thanh

## Cách thay asset
1. Upload file mới đúng tên vào thư mục tương ứng.
2. Nếu dùng tên khác, chỉ sửa đường dẫn trong `asset-manifest.js`.
3. GLB nên đặt origin ở chân nhân vật, +Y là hướng lên, kích thước nhân vật khoảng 1.7-1.9 đơn vị.
4. UI ưu tiên WebP nền trong suốt.
5. Khi file chưa tồn tại, game tiếp tục dùng mô hình procedural hiện tại để không bị lỗi.

`asset-loader.js` là loader tập trung dùng cho các bản nâng cấp tiếp theo.