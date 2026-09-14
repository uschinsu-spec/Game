# Assets - Thanh Vân Tiên Vực

Runtime hiện chỉ giữ các asset/module thực sự đang dùng.

## Player
- `characters/player-rig-config.js`: URL model + animation + socket config.
- `characters/rigged-player.js`: loader, skeleton, retarget animation, socket.
- `characters/xianxia-player-style.js`: ngoại hình/phụ kiện tu tiên gắn vào rig.

## Enemy
- `enemies/ultimate-monsters-config.js`: catalog Quaternius Ultimate Monsters.
- `enemies/ultimate-monsters.js`: model/animation/state enemy.
- `enemies/ULTIMATE_MONSTERS.md`: nguồn và license.

## Environment
- `environment/enhanced-world.js`: map Thanh Vân Sơn chính.
- `environment/free-nature-assets.js`: cây/đá/prop CC0 tải runtime.
- `environment/THIRD_PARTY_ASSETS.md`: nguồn và license.

## UI
- `ui/icons/*.svg`: icon đang sử dụng.
- `ui/ui-icons.js`: ánh xạ icon.
- `ui/ui-icons.css`: style icon/UI.

Không còn `asset-manifest.js` hoặc `asset-loader.js` legacy. Mỗi hệ thống tự sở hữu config/loader của chính nó để tránh hai lớp asset registry chạy song song.