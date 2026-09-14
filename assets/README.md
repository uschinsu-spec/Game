# Hướng dẫn đưa Asset trực tiếp vào Game

Toàn bộ hệ thống game hiện tại đang chạy ở chế độ **Local Placeholder & Offline 100%**. Bạn có thể đưa trực tiếp các file 3D (.glb, .gltf) hoặc hình ảnh vào các thư mục tương ứng:

## 1. Nhân vật (Player)
- **Thư mục:** `assets/characters/`
- **Cách tích hợp:** Đặt file model 3D (ví dụ: `player.glb`) vào thư mục này.
- **Loader:** Tùy biến trong `assets/characters/rigged-player.js` để nạp trực tiếp qua `BABYLON.SceneLoader.ImportMeshAsync('', './assets/characters/', 'player.glb', scene)`.

## 2. Quái vật & Boss (Enemies)
- **Thư mục:** `assets/enemies/`
- **Cách tích hợp:** Đặt các file model quái (ví dụ: `mob.glb`, `elite.glb`, `boss.glb`) vào thư mục này.
- **Loader:** Cấu hình danh mục và load trong `assets/enemies/ultimate-monsters.js`.

## 3. Bản đồ & Môi trường (Environment)
- **Thư mục:** `assets/environment/`
- **Cách tích hợp:** Đặt các prop, kiến trúc đình chùa hoặc file map tổng `world.glb` vào thư mục này.
- **Loader:** Quản lý trong `assets/environment/enhanced-world.js`.

## 4. Giao diện (UI & Icons)
- **Thư mục:** `assets/ui/icons/`
- **Cách tích hợp:** Bổ sung hoặc thay thế các file icon `.svg` / `.png`.