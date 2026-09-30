# GAME WORLD CONTRACT — V5

V5 không sở hữu geography hoặc runtime map. Nó chỉ đọc cây world canonical do GAME cung cấp.

Snapshot đã kiểm:
- `HUMAN_REALM_VERSION = 20260929-human-realm-unified-v5-expanded-5qg`
- 99,062 world nodes
- 5 continent
- 42 `great_region`
- 437 `province` — Châu/Đạo/Lĩnh/Phủ
- 2,185 `nation`
- 10,925 `city_territory`
- 21,850 `settlement`
- 63,617 `location`

Hierarchy faction phải bám node thật:

`realm → continent → great_region → province → nation → city_territory → settlement`

`location` là site, không tự biến thành cấp hành chính/faction mới.

V5 cấm geography chứa faction data canonical. Các field `factionProfile`, `cultivationFactions`, `apexSect`, `makeFactionProfile` chỉ được validator dùng để báo lỗi nếu chúng quay lại.

`worldRegistry.js` tiếp tục là source-of-truth duy nhất của map/runtime. `gameFactionRegistry.js` là source-of-truth duy nhất của thế lực.
