# Hệ thống bản đồ Nam Lăng Đại Lục

## Mục tiêu

- Nam Lăng có quy mô lore cực lớn nhưng không tạo hàng triệu file map.
- Runtime chỉ materialize những Location người chơi thực sự có thể vào.
- 1 Map Template có thể dùng cho nhiều Location bằng seed, asset pack, quái, tài nguyên, thời tiết và lighting khác nhau.
- Mobile chỉ quản lý map hiện tại và dữ liệu lân cận.
- Giữ `mapId` 0–13 để không phá save cũ.

## Cây thế giới

`Nam Lăng → 9 Đại Vực → 108 Châu → Quốc gia/Thế lực → Quận → Thành Vực → Location`.

Tuyến khởi đầu:

`Nam Lăng → Thanh Linh Vực → Thanh Châu → Đại Ly Quốc → Nam Sơn Quận → Thanh Hà Thành Vực → Thanh Vân Thôn / Thanh Vân Ngoại Vi / Vạn Mộc Sâm Lâm / Huyết Lạc Cấm Địa`.

Map 0–3 chỉ là một cụm nhỏ trong Thanh Hà Thành Vực, không đại diện cho toàn Nam Lăng.

## Quy mô ảo

Không tạo đầy đủ hàng trăm quốc/quận/thành ngay khi khởi động. Mỗi node có `generationProfile` mô tả số lượng lore dự kiến. Chỉ các node quan trọng hoặc đã được người chơi tiếp cận mới materialize thành dữ liệu chi tiết.

Điều này giúp quy mô có thể đạt hàng triệu địa danh mà bộ nhớ runtime vẫn nhỏ.

## Panorama chuẩn

`PANORAMA_STANDARD` quy định:

- 70% mặt đất.
- 30% chân trời/bầu trời.
- Base panorama không chứa NPC, quái, tài nguyên, công trình lớn hoặc landmark cố định.
- Cây, đá, nhà, cỏ, khoáng, linh dược, NPC, quái, VFX là các layer/asset rời.

Công thức map:

`Base Panorama + Template + Seed + Asset Pack + Weather + Lighting + Enemy Pool + Resource Pool + Events`.

## 47 Map Template

Template được chia thành Hub, Field và Dungeon: thôn, trấn, thành, đồng bằng, rừng, cổ lâm, núi, cốc, sông, hồ, đầm lầy, sa mạc, tuyết, biển, đảo, hang, mỏ, di tích, mộ, thần điện, chiến trường, ma địa, tiên địa, bí cảnh và vực sâu.

Field mặc định rộng 32.000×960, chia 4 zone và chunk 1.024 px. Dungeon mặc định 16.000×960. Hub mặc định 540×960.

## World Registry

`src/config/world/worldRegistry.js` là API đọc trung tâm. Code gameplay không cần biết dữ liệu nằm ở file nào.

Các API chính:

- `getMapById(mapId)`
- `getWorldNode(nodeId)`
- `getWorldChildren(nodeId)`
- `getWorldBreadcrumb(nodeId)`
- `getWorldNodeForMap(mapId)`
- `canEnterMap(mapId, gameState)`
- `getTravelRoutesForMap(mapId)`
- `resolvePanoramaMap(map)`

`src/config/regionsData.js` chỉ còn là compatibility facade để code cũ tiếp tục chạy.

## Travel

Portal không còn hard-code trong `MainScene.js` ở runtime mới. Tất cả route nằm ở `travelRoutes.js` và `WorldMapRuntime.js` override phần cũ khi khởi động.

Yêu cầu cảnh giới lấy từ chính target map, tránh lỗi một nơi yêu cầu Luyện Khí 3 nhưng UI lại yêu cầu Luyện Khí 7.

Map 2 hiện thống nhất yêu cầu Luyện Khí tầng 3; Map 3 yêu cầu Trúc Cơ.

## Khám phá thế giới

Save chỉ giữ:

- `discoveredNodeIds`
- `visitedMapIds`
- `unlockedWaypointMapIds`
- boss quan trọng
- dungeon hoàn thành
- bí mật đã khám phá
- progress theo khu vực

Không lưu state của từng cây, đá hay quái thông thường.

Trong giai đoạn hiện tại, waypoint được tự mở khi lần đầu ghé Location để tương thích gameplay hiện có. Map 0 luôn được giữ làm điểm hồi hương an toàn để save legacy ở map cũ không bị mắc kẹt.

## Đại bản đồ mobile

UI mới duyệt theo từng cấp và phân trang 6 item/lần. Vì vậy 108 Châu không tạo 108 button cùng lúc.

Điểm chưa materialize vẫn có thể xuất hiện như lore/data node, nhưng không có nút vào Combat Map.

Fast travel chỉ bật khi:

1. Đã từng đến map.
2. Waypoint đã mở.
3. Đủ điều kiện access.

## Thêm Location mới

1. Chọn hoặc thêm node trong `namLangWorld.js`.
2. Nếu là playable, tạo map trong `playableMaps.js` và trỏ `locationNodeId` đến node đó.
3. Chọn `templateId`.
4. Khai báo `access`, `zones`, panorama và runtime profile.
5. Nếu có portal vật lý, thêm route trong `travelRoutes.js`.

Không thêm logic `if (mapId === ...)` mới vào `MainScene` nữa.

## Tối ưu tiếp theo

Khi bộ asset modular sẵn sàng, runtime có thể bổ sung Chunk Decor Manager để chỉ tạo asset cây/đá/props trong 1–2 chunk quanh camera. Data model hiện tại đã có `chunkWidth`, `activeChunkRadius`, `objectPooling` và `seedDrivenDecor` để nối bước này mà không phải thiết kế lại hệ thống map.
