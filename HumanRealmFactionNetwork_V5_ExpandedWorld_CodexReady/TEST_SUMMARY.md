# TEST SUMMARY — V5 FINAL

Đã kiểm trên package V5 và snapshot GAME Drive mới nhất dùng để xây hệ thống.

- JavaScript syntax: **121/121 PASS**
- Standalone smoke test: **PASS**
- Faction library index import: **PASS** — 229 exports
- Current GAME world integration: **PASS**
- World nodes đọc từ `humanRealmWorld.js`: **99,062**
- 5 Đại Lục: **PASS**
- 42 vùng cấp cao: **PASS**
- Territory Châu/Đạo/Lĩnh/Phủ: **437/437 PASS**
- Nation: **2,185**
- City territory: **10,925**
- Settlement: **21,850**
- Location: **63,617**
- Mỗi 437 territory có đường thật `Province → Nation → City → Settlement`: **437/437 PASS**
- Controller bắt buộc political/cultivation/economic/security/intelligence/underworld: **437/437 PASS**
- 9 player sect canonical: **9/9 PASS**
- Core faction definitions nạp sẵn: **59**; local faction/presence còn lại sinh deterministic + lazy
- Save V5 factionState round-trip: **PASS**
- `sectId / sectRankIdx / sectContrib / lastSalaryClaim` trong V5 source: **0**
- dependency `namLangFactionAtlas.js / namLangWorld.js / worldFactionSeedAdapter.js`: **0**
- Các chuỗi `factionProfile / cultivationFactions / apexSect / makeFactionProfile` chỉ còn trong validator để phát hiện geography cũ quay trở lại; V5 không đọc chúng làm dữ liệu faction.

## Lệnh test

```bash
npm test
GAME_ROOT=/duong/dan/toi/GAME npm run test:game
```

`test:game` phải được chạy lại sau khi Codex merge vào repo thực để xác nhận snapshot world không thay đổi ngoài chủ đích.
