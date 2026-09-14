# Asset structure

GAME dùng Babylon.js và tách asset khỏi gameplay để dễ thay thế/nâng cấp.

## Player
- Thư mục: `assets/characters/`
- Runtime hiện tại: `assets/characters/rigged-player.js`
- Khi thay model thật, ưu tiên GLB có animation Idle/Walk/Run/Attack/Skill/Ride/Hit/Death và socket vũ khí/tọa kỵ.

## Enemies
- Thư mục: `assets/enemies/`
- Registry/loader chính: `enemy-registry.js`, `enemy-loader.js`, `ultimate-monsters.js`
- Model GLB được chia theo nhóm `blob/`, `flying/`, `big/`.

## Environment
- Terrain: `assets/environment/terrain/`
- World runtime: `assets/environment/world/`
- Placeholder tạm: `assets/placeholders/world-placeholders.js`
- Flora cũ và pack THON TRAN đã được xóa hoàn toàn.

## UI
- Icon: `assets/ui/icons/`
- Mapping: `assets/ui/ui-icons.js`
- Style icon: `assets/ui/ui-icons.css`

## Quy tắc
- Không đặt test/demo/converter vào runtime production.
- Không tham chiếu asset đã xóa.
- Asset lớn chỉ nạp khi cần; tránh đưa toàn bộ thư viện vào Service Worker core cache.
- Ưu tiên GLB/GLTF tối ưu và texture WebP/KTX2 cho mobile.
