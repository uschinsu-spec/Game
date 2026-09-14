# 🌲 HỆ THỐNG ASSET MÔI TRƯỜNG (ENVIRONMENT ASSETS)

Thư mục `assets/environment/` được phân chia thành các module con chuyên biệt:

```text
assets/environment/
│
├── 🌾 terrain/              # Dữ liệu Texture mặt đất & địa hình tự nhiên (20 texture độc lập)
│   ├── tex_01_Grass_Lush.js -> tex_20_RiverSand_Pebbles.js
│   └── (Đóng gói nén DataURL nhúng trực tiếp, hỗ trợ nạp động tức thì)
│
├── 🌳 flora/                # 63 Module 3D Thực vật, Cây cối, Hoa lá độc lập
│   ├── flora_manifest.json  # Danh mục toàn bộ 63 asset
│   ├── tree_birch_asset.js  # Cây Bạch Dương 1 (tương thích ngược)
│   ├── asset_birchtree_1.js -> asset_birchtree_5.js (5 loại Cây Bạch Dương)
│   ├── asset_normaltree_1.js -> asset_normaltree_5.js (5 loại Cây Rừng Thường)
│   ├── asset_pinetree_1.js -> asset_pinetree_5.js (5 loại Cây Thông)
│   ├── asset_mapletree_1.js -> asset_mapletree_5.js (5 loại Cây Phong Đỏ)
│   ├── asset_palmtree_1.js -> asset_palmtree_5.js (5 loại Cây Dừa/Cọ Nhiệt Đới)
│   ├── asset_deadtree_1.js -> asset_deadtree_10.js (10 loại Cây Khô)
│   ├── asset_bush*.js (6 loại Bụi Cây & Bụi Hoa)
│   ├── asset_flower*.js (7 loại Bụi Hoa & Cụm Hoa)
│   ├── asset_grass*.js (3 loại Cụm Cỏ Tự Nhiên)
│   ├── asset_plant*.js (3 loại Cây Cảnh & Cây Hoa)
│   ├── asset_petals*.js (4 loại Cụm Cánh Hoa)
│   └── asset_rock_1.js -> asset_rock_5.js (5 loại Đá Tự Nhiên)
│
├── 🗿 models/               # Toàn bộ Asset 3D & Texture nguyên bản gốc (Raw glTF/GLB, bin, textures)
└── 🌐 world/                # Hệ thống sinh thế giới & logic môi trường (enhanced-world.js)
```

---

## 🚀 Cách Sử Dụng Bất Kỳ Asset Nào Trong Game / Editor:
Mỗi file asset tự đăng ký vào `window.FloraAssetRegistry[ModelName]`:
```javascript
// Ví dụ: Nạp Cây Thông hoặc Bụi Cây
const pine = window.FloraAssetRegistry['PineTree_1'].create(scene, { x: 20, y: 0, z: 30 });

// Hoặc tạo rừng hàng nghìn cây bằng Thin Instances (2 draw calls):
window.FloraAssetRegistry['NormalTree_1'].createThinForest(scene, coordsArray);
```

---

## 🚀 Hướng dẫn mở rộng
- Khi thêm cây mới (ví dụ Cây Thông `tree_pine_asset.js`, Cây Phong `tree_maple_asset.js`): đặt vào `assets/environment/flora/`.
- Khi thêm texture đất/đá mới: đặt vào `assets/environment/terrain/`.
