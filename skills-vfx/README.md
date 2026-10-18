# Skills VFX architecture

Mục tiêu: hàng trăm skill nhưng `forest-vfx.js` không phải phình to và không phải sửa khi thêm VFX mới.

## Quy tắc

- `registry.js`: đăng ký/tra cứu skill theo **Skill ID** ổn định.
- `manifest.js`: danh sách file VFX cần tải.
- `loader.js`: tự nạp tất cả file có trong manifest trước `game.js`.
- `forest-vfx.js`: engine/helper dùng chung (texture, material, ring, spark, lifecycle...).
- Mỗi skill: **1 file JS riêng** và tự gọi `SkillVfxRegistry.register(...)`.

## Thêm VFX skill mới

1. Tạo file, ví dụ `kiem_thien_101.js`.
2. Trong file đăng ký:

```js
(() => {
  'use strict';
  SkillVfxRegistry.register({
    id: 'kiem_thien_101',
    aliases: [],
    file: 'kiem_thien_101.js',
    run(vfx, ctx) {
      // VFX riêng của skill ở đây.
    }
  });
})();
```

3. Thêm đúng 1 dòng vào `manifest.js`:

```js
{ id:'kiem_thien_101', file:'kiem_thien_101.js' },
```

4. Gameplay gọi VFX bằng ID:

```js
vfx.skill(origin, target, 'kiem_thien_101');
```

> Lưu ý: thêm file VFX chỉ tạo **phần hình ảnh**. Nếu muốn skill mới xuất hiện trong combat/HUD, vẫn cần thêm dữ liệu gameplay của skill đó (damage, range, cooldown, icon, phím/hotbar...) vào hệ skill gameplay.

## Tương thích 5 skill cũ

5 skill hiện tại có alias số `0..4`, nên code cũ vẫn chạy; game mới đã chuyển event VFX sang Skill ID.
