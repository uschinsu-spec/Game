# Babylon MMORPG Prototype — CDN + Python

Bản này **không dùng npm, Node.js, Vite hay TypeScript build**.
Babylon.js và GLTF loader được tải trực tiếp từ CDN chính thức của Babylon.js.

## Chạy trên Windows

1. Giải nén ZIP.
2. Double-click `RUN_GAME.bat`.
3. Trình duyệt sẽ tự mở `http://localhost:8000`.

Yêu cầu duy nhất: Python 3.

## Chạy bằng CMD

```bat
py server.py
```

hoặc

```bat
python server.py
```

## Điện thoại

Máy tính và điện thoại cùng Wi-Fi. Khi server chạy, cửa sổ CMD sẽ in URL LAN, ví dụ:

`http://192.168.1.10:8000`

Mở URL đó trên điện thoại.

Nếu Windows Firewall hỏi, cho phép Python trên **Private networks**.

## Hắc Lâm — rừng hoang sinh tồn

Player và quái được tạo trực tiếp bằng Babylon.js, không cần file GLB.
Địa hình hiện tại nằm trong `forest-world.js`: rừng rộng với cây cổ thụ,
thông, cỏ, bụi rậm, đá và sương mù. Player xuất hiện giữa rừng;
16 quái từ nhiều hướng đuổi theo và tấn công, sau khi bị hạ sẽ xuất hiện lại
quanh vị trí hiện tại của player. Chết sẽ hồi sinh sau 3 giây, với thời gian bảo vệ ngắn.
Camera bám nhân vật và có nút khóa góc/zoom cạnh minimap.
`mountain-world.js` giữ lớp dùng chung cho vật liệu và giới hạn di chuyển.

Nút **Auto: TẮT/BẬT** cạnh minimap tự chọn quái trong tầm và dùng skill theo hồi chiêu.
Auto mặc định tắt; không tự di chuyển nhân vật. Có thể bật/tắt bất cứ lúc nào.
Năm skill: Kiếm khí, Phong luân (vùng), Lôi kích (tầm xa), Liên hoa
(hồi máu và đánh vùng), Thiên thạch (vùng quanh mục tiêu).
Hiệu ứng nằm trong `forest-vfx.js`, có giới hạn số lượng và tự thu hồi sau khi kết thúc.

## Điều khiển

- WASD / Arrow: di chuyển
- Click/chạm nền: tự đi đến vòng đánh dấu, tìm đường vòng qua vật cản
- WASD hoặc joystick: hủy đường đi tự động và chuyển sang điều khiển tay
- Kéo chuột: xoay camera
- Wheel: zoom
- Click quái: chọn target
- 1–5: skill
- Space: skill 1
- I: inventory
- Mobile: chạm nền hoặc joystick + các nút skill cảm ứng; kéo/pinch camera không ra lệnh di chuyển

## Kiểm tra navigation (tùy chọn)

Nếu có Node.js, chạy `node tests/navigation.cjs` để kiểm tra tìm đường,
giới hạn quảng trường, dừng tại đích, điều khiển tay và hồi sinh.
Chạy `node tests/combat.cjs` để kiểm tra Auto, hồi chiêu, tầm đánh, sát thương vùng và hồi máu.

## GitHub Pages

Bản này cũng có thể upload thẳng lên GitHub Pages vì toàn bộ game là static HTML/CSS/JS.
Không cần GitHub Actions để build. Chỉ cần Pages phục vụ thư mục chứa `index.html`.

## Lưu ý CDN

Lần mở game cần Internet để tải Babylon.js từ `cdn.babylonjs.com`.
Sau này khi chuẩn bị production, nên quay lại bundler hoặc self-host Babylon.js để kiểm soát version/cache tốt hơn.
