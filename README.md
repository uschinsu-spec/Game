# Linh Sơn Phi Kiếm — chiến trường dọc

Game web Phaser 3, khung 540 × 960 (9:16), thiết kế cho PC và điện thoại.

## Hệ thống bản đồ duy nhất

GAME chỉ còn một hệ thống map: `src/config/regionsData.js`.

- Mỗi mục trong `WORLD_REGIONS[].maps` vừa là khu vực thế giới, vừa là chiến trường gameplay thật.
- Không còn lớp `stage`/bí cảnh tách riêng khỏi bản đồ.
- `gameState.currentMapId` là nguồn trạng thái duy nhất xác định player đang ở map nào.
- Mỗi map có cấu hình panorama, kích thước world, vùng di chuyển, điểm spawn và nhóm quái riêng.

### Map khởi đầu — Thanh Vân Thôn Ngoại Vi

- Map ID: `0`
- Player xuất hiện tại đây khi bắt đầu GAME.
- Panorama: `assets/environment/valley_panorama.png` (nguồn 3200 × 960).
- World gameplay: 2880 × 960.
- Camera bám theo nhân vật khi đi ngang; panorama không lặp lại.
- Đây là mẫu runtime chuẩn cho toàn bộ các map khác.

Các map chưa có panorama riêng hiện dùng panorama Map 0 làm template runtime để gameplay không bị gãy. Khi có ảnh panorama riêng, chỉ cần khai báo `panoramaKey` và `panoramaAsset` trong map tương ứng; core gameplay không cần viết lại.

## Gameplay theo map panorama

- Nhân vật và quái di chuyển tự do hai chiều trong vùng chiến trường của map.
- Quái tự áp sát; player có đánh thường, skill, lướt, phi kiếm và tự động chiến đấu.
- Mỗi map quyết định bộ quái bằng `monsterIdxStart`.
- Khi đổi map, GAME cập nhật panorama/world bounds, đưa player về spawn của map, làm mới quái, minimap và HUD.
- Đại Bản Đồ chỉ chọn/chuyển giữa các map thật trong `WORLD_REGIONS`; không còn đổi một stage logic độc lập.

## Điều khiển

- PC: WASD hoặc phím mũi tên để di chuyển, F đánh thường, Q lướt, E bật/tắt phi kiếm, 1–4 dùng bốn kỹ năng đã chọn.
- Điện thoại: chạm và kéo ở vùng trống để hiện joystick mờ; nhấc tay để ẩn. Chạm nhanh ô Skill để thi triển; giữ khoảng nửa giây để đổi kỹ năng.
- Hai mũi tên bên phải ẩn/hiện riêng hàng Skill và hàng menu.
- Nút **Tự Động** bật/tắt di chuyển và tấn công tự động.

## Chạy local

Từ thư mục `GAME` chạy:

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`.
