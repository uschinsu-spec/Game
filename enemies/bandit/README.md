# Ma rừng (bandit)

- `config.js`: HP, tốc độ, khoảng cách Attack, damage, cooldown, scale, bảng màu và thời lượng animation.
- `visual.js`: Nâng cấp toàn diện mô hình Ma Rừng 3D (sát thủ áo choàng đỏ sẫm rách vạt, giáp da nẹp đinh khóa đồng, mũ trùm bóng tối che mặt nạ ma quái, mắt đỏ phát quang rực lửa, sừng quỷ rừng cong vút, song đao móng vuốt cẳng tay sắc lẹm, bốt da di chuyển không tiếng động) và hoạt ảnh động tốc độ cao (Stalking Stealth Idle, Ghost Shadow Sprint lướt gió, 2 biến thể ám sát Cú chém chéo song đao chữ X & Đòn đâm móc xoay người 360 độ).
- `textures/`: Bộ texture 3D chân thật **siêu nhẹ tối ưu cho Mobile / Điện thoại** (128x128 & 64x64, tải chớp mắt, 60fps mượt mà, không nóng máy):
  - `bandit_cloth.png` (128x128): Vải dệt áo choàng đỏ sẫm có thớ sợi đan chéo và nếp gấp tối (slot `skin`).
  - `bandit_shroud.png` (128x128): Vải quấn bóng đêm dạng băng quấn sát thủ (slot `secondary`).
  - `bandit_armor.png` (128x128): Giáp da thuộc nẹp đinh tán và khóa đồng thau nổi khối (slot `armor`).
  - `bandit_bone.png` (64x64): Cặp sừng quỷ rừng & bùa chú xương sắc nhọn (slot `bone`).
  - `bandit_claw.png` (64x64): Song đao móng vuốt kim loại sáng bóng & mũi bốt thép (slot `claw`).
  - `bandit_eye.png` (64x64): Đôi mắt ma quái rực lửa đỏ cam phát quang trong hốc mũ trùm (slot `eye`).
  - `bandit_accent.png` (64x64): Cổ ngữ phù ấn thắt lưng vàng rực lửa (slot `accent`).
- `generate_realistic_textures.py`: Script tự động vẽ và tối ưu hóa texture Ma Rừng cho thiết bị di động.
