# Modular MMORPG Player v3.2 — Locomotion / Animation Upgrade

Player dùng **1 Master Rig + modular equipment slots** với logical movement tách khỏi visual animation.

## Quy ước kích thước
- **1 Babylon world unit = 1 mét = 100 cm**.
- Sole = `Y 0.00`, crown = `Y 1.75`.
- Player reference height = **175 cm**.
- Toàn bộ số đo chuẩn nằm trong `core/config.js -> anthropometry` và `core/rig.js` đọc trực tiếp từ đó.

## Runtime architecture

```text
Input / Click Path
      ↓
PlayerController
      ↓
PlayerMotor               (logical position + yaw only)
      ↓
World constrain/path
      ↓
player root               (upright collision/navigation root)
      ↓
player_visualRoot         (bank/lean only)
      ↓
PlayerRig + Animator + Equipment
```

### `core/motor.js`
- Là owner duy nhất của translation/yaw player.
- Acceleration/deceleration, accepted-distance velocity, smooth turn.
- Sau `world.constrain()`, velocity được tính lại từ displacement thật để animation không chạy nhanh hơn chuyển động.
- `player` logical root luôn có X/Z rotation = 0; body banking chỉ đi vào visual root.

### `core/player.js`
- Giữ API cũ (`path`, `playAttack`, `playSkill`, `takeDamage`) để tương thích game/combat hiện tại.
- Joystick analog dùng dead-zone + smooth response curve.
- Click-to-move có look-ahead steering để bo góc mượt hơn.
- Truyền `strafeX`, `strafeZ`, accepted distance và velocity thực sang Animator.

### `core/animations.js`
- Lower/Upper animation mask hoạt động thật: khi vừa chạy vừa đánh/cast, action không được ghi đè chân.
- Gait phase dùng **distance travelled thực tế**, giảm foot skating sau collision/path correction.
- Crossfade rotation dùng **Quaternion.Slerp**, tránh Euler wrap/gimbal ở slash/spin lớn.
- Action priority: Death/Reaction > Cast/Attack > Locomotion, giảm tranh chấp state giữa hệ thống.
- Animation markers chuẩn hóa (`hit`, `cast`, `comboOpen`, `comboClose`) để combat/VFX/SFX có thể đồng bộ theo animation event thay vì hard-code thời gian.
- Strafe/backpedal tiếp tục dùng 2D locomotion context.

### Camera
`game.js` dùng velocity-aware camera target: camera nhìn hơi về phía trước khi chạy và tự trở về player khi dừng.

## Cấu trúc
- `core/config.js`: dimensions, stats, animation durations + animation markers.
- `core/rig.js`: humanoid procedural master rig + sockets.
- `core/animations.js`: locomotion/action animator.
- `core/motor.js`: logical character motor.
- `core/player.js`: high-level player controller.
- `systems/part-registry.js`: registry bộ phận.
- `systems/equipment-system.js`: equip/unequip/loadout + rigid GLB sockets.
- `systems/visual.js`: materials, rig, animator, equipment orchestrator.
- `parts/<slot>/procedural.js`: procedural fallback body/equipment.
- `models/`: modular GLB player assets tương lai.

## Slots
`body`, `head`, `hair`, `chest`, `hands`, `legs`, `boots`, `mainhand`, `offhand`, `back`, `accessory`.

## GLB roadmap
Khi có bộ GLB player + animation thật, giữ nguyên `PlayerMotor` và gameplay API; thay phần procedural pose bằng `Skeleton + AnimationGroup`, sau đó gắn procedural layers cho foot IK, look-at/weapon IK, body lean và motion/orientation warping. Character/skinned gear phải author cùng master skeleton/rest pose và scale **1.75 m**.
