# Thạch quái (golem)

- `config.js`: HP, tốc độ, khoảng cách Attack, damage, cooldown, scale, bảng màu và thời lượng animation.
- `visual.js`: Nâng cấp toàn diện mô hình Thạch quái 3D (thân đá tảng granite nguyên khối, giáp phiến đá ngực, lõi Ma Thạch cổ đại đập nhịp phát quang rực rỡ, gai tinh thể mọc ở vai & đỉnh đầu, nắm đấm búa tạ nghiền nát, chân cột đá vững chắc) và hoạt ảnh động uy nghi (Titan Idle, Heavy Stride rung chuyển mặt đất, 2 biến thể tấn công Địa chấn Búa tạ kép & Cú đấm móc ngàn cân).
- `textures/`: Bộ texture 3D chân thật **siêu nhẹ tối ưu cho Mobile / Điện thoại** (128x128 & 64x64, tải chớp mắt, 60fps mượt mà, không nóng máy):
  - `golem_stone.png` (128x128): Đá granite & bazan chạm đẽo nổi khối, có rêu phong trong khe nứt (slot `skin`).
  - `golem_slate.png` (128x128): Đá phiến hắc diện thạch đen sẫm phân tầng tự nhiên (slot `secondary`).
  - `golem_armor.png` (128x128): Giáp đá tảng megalith viền nẹp sắt thép có đinh tán lõi (slot `armor`).
  - `golem_crystal.png` (64x64): Tinh thể thạch anh sắc nhọn khúc xạ ánh sáng (slot `bone`).
  - `golem_rock_fist.png` (64x64): Nắm đấm đá tảng có khe nứt chấn động bề mặt (slot `claw`).
  - `golem_core_eye.png` (64x64): Lõi năng lượng ma thạch xanh ngọc & mắt quang học phát quang (slot `eye`).
  - `golem_rune.png` (64x64): Cổ ngữ Titan cổ đại khắc chìm phát sáng rực rỡ (slot `accent`).
- `generate_realistic_textures.py`: Script tự động vẽ và tối ưu hóa texture Thạch quái cho thiết bị di động.
