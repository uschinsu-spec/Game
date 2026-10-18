# Player GLB Models — 175 cm Canonical Scale

Chuẩn bắt buộc khi thêm Player/gear GLB:

- **1 unit = 1 metre**.
- Player từ sole đến crown = **1.75 m (175 cm)**.
- Ground/sole ở `Y=0`; crown ở `Y=1.75`.
- Eye level tham chiếu = `Y=1.64`.
- Hip joint = `Y=0.92`, knee = `Y=0.49`, ankle = `Y=0.08`, shoulder = `Y=1.43`.
- Body và skinned clothing phải dùng cùng Master Skeleton, bone names và rest pose.
- Không import model 2.0–2.5 m rồi thu nhỏ bằng runtime scale; chuẩn hóa trong Blender trước khi export GLB.
- Texture mobile: ưu tiên 1K–2K; tối ưu KTX2/Basis khi pipeline hỗ trợ.

Rigid gear (weapon/shield/back/accessory) gắn qua socket và cũng phải dùng kích thước mét thật.
