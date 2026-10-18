# HỆ THỐNG QUÁI VẬT TOÀN DIỆN (UNIFIED ENEMY ARCHITECTURE)

Hệ thống kẻ địch đã được tái cấu trúc và tối ưu hóa tập trung toàn bộ về thư mục `H:\GOOGLE DRIVER\GAME\enemies/`. Kiến trúc này cho phép:
1. **Dễ dàng thêm bất kỳ model 3D GLB nào trong tương lai** chỉ với 1 file config hoặc 1 folder mới.
2. **Mỗi loại quái vật có 1 logic tấn công (Attack Logic) và hiệu ứng chiến đấu riêng biệt** (Cận chiến Melee, Bắn chưởng Projectile, Dậm đất chấn động AOE Slam, Lướt chém Dash Strike, hoặc Custom Script).
3. **Quản lý vòng đời quái vật tập trung (EnemyManager)**: Tự động pooling, định tuyến tìm đường (Pathfinding), vật lý đẩy chống chồng lấn, và đồng bộ hoạt ảnh.

---

## 📁 CẤU TRÚC THƯ MỤC `enemies/`

```
enemies/
├── core/
│   ├── enemy-registry.js        # Registry trung tâm: đăng ký config, visual, attack logic
│   ├── base-enemy-visual.js     # Lớp cơ sở rendering, vật liệu PBR/Standard, texture mapping
│   ├── glb-enemy-visual.js      # Universal 3D GLB Engine (Asset Container cache 1 lần, auto animation mapping)
│   ├── attack-system.js         # Hệ thống Attack Logic (Melee, Projectile, AOE Slam, Dash, Custom)
│   ├── monster.js               # Thực thể quái vật (AI, Stats, State Machine, Animation sync, Combat)
│   └── enemy-manager.js         # Quản lý tập trung toàn bộ quái vật (Spawn, Batch Update, Push physics, Target pick)
│
├── shared/                      # Cầu nối tương thích ngược (Backward compatibility)
│   ├── registry.js
│   └── base-visual.js
│
├── wolf/                        # Quái vật Dã Thú Sói (Procedural 3D + Textures)
│   ├── config.js
│   ├── visual.js
│   └── textures/
│
├── golem/                       # Quái vật Thạch Quái (AOE Earthquake Slam)
│   ├── config.js
│   ├── visual.js
│   └── textures/
│
├── bandit/                      # Quái vật Ma Rừng Sát Thủ (Dash Strike)
│   ├── config.js
│   ├── visual.js
│   └── textures/
│
└── README.md                    # Tài liệu hướng dẫn sử dụng & mở rộng
```

---

## 🚀 HƯỚNG DẪN: CÁCH THÊM 1 MÔ HÌNH GLB MỚI VÀ GÁN LOGIC RIÊNG

### Cách 1: Thêm nhanh trực tiếp chỉ bằng 1 file `config.js` (Khuyên dùng)
Tạo file config cho quái vật mới (Ví dụ `enemies/dragon/config.js`):

```javascript
window.EnemyRegistry.registerConfig("dragon", {
  kind: "dragon",
  name: "Hắc Long Thần",
  
  // 1. Cấu hình mô hình GLB (Universal GLB Engine tự động xử lý)
  model: {
    type: "glb",
    path: "./assets/models/dragon.glb", // Đường dẫn tới file GLB
    scale: 1.2,                         // Tỉ lệ kích thước
    rotationY: Math.PI,                 // Góc xoay hướng mặt (Math.PI hoặc 0 tùy export)
    positionOffset: [0, 0, 0],          // Dịch chuyển tâm gốc
    
    // Tự động map animation groups từ file GLB
    animations: {
      Idle: ["Idle", "Hover", "Stand"],
      Run: ["Fly_Forward", "Run", "Walk"],
      Attack: ["Breathe_Fire", "Claw_Attack"],
      Hit: ["Get_Hit", "Impact"],
      Death: ["Fall_Dead", "Die"]
    },
    
    // Tốc độ phát từng animation
    animationSpeeds: {
      Run: 1.4,
      Attack: 1.2
    }
  },

  // 2. Chỉ số chiến đấu & Kiểu tấn công
  combat: {
    attackType: "ranged_projectile", // Kiểu đánh: "melee" | "ranged_projectile" | "area_slam" | "dash_strike" | "custom"
    attackRange: 8.5,                // Tầm phát hiện và xuất chiêu
    attackCooldown: 2.2,             // Thời gian hồi chiêu
    damageBase: 25,                  // Sát thương gốc
    damagePerLevel: 4.5
  },

  // 3. Chỉ số sinh tồn & Tốc độ
  stats: { hpBase: 150, hpPerLevel: 35 },
  movement: { speed: 4.2 },
  visual: { scalePerLevel: 0.08, rootYOffset: 1.2 },
  animation: { spawnDuration: 0.5, attackDuration: 1.0, hitDuration: 0.35, deathDuration: 1.8 }
});
```

---

### Cách 2: Tự định nghĩa Logic Tấn Công Riêng Biệt (Custom Attack Logic)
Nếu một quái vật có đòn đánh đặc biệt (ví dụ: triệu hồi quái con, bắn chùm 3 tia lôi điện, buff giáp, v.v.), bạn có thể đăng ký trực tiếp:

```javascript
window.EnemyRegistry.registerAttackLogic("boss_demon", (monster, player, damagePlayer, world, scene) => {
  monster.visual.trigger("Attack");
  
  // Ví dụ: Bắn 3 tia sét tỏa ra
  for (let i = -1; i <= 1; i++) {
    const damage = monster.damageBase + monster.level * 2;
    damagePlayer(damage);
  }
});
```

---

## ⚡ CÁC KIỂU ATTACK CÓ SẴN TRONG HỆ THỐNG (`attack-system.js`)

| `attackType` | Mô tả hành vi | Hiệu ứng đi kèm |
|---|---|---|
| `melee` | Tấn công cận chiến (chém, vồ, cắn) | Đánh trúng theo frame animation |
| `ranged_projectile` | Bắn đạn / cầu lửa / phi tiễn từ xa | Đạn 3D phát sáng bay tới vị trí người chơi và nổ |
| `area_slam` | Dậm đất xung chấn diện rộng (AOE) | Vòng sóng xung kích tỏa ra xung quanh, gây sát thương bán kính |
| `dash_strike` | Lướt tốc biến xuyên qua mục tiêu | Quái vật lướt nhanh về phía trước chém chớp nhoáng |
| `custom` | Tự định nghĩa qua `registerAttackLogic` | Tùy biến 100% theo ý muốn |

---

## 🌟 TỐI ƯU HÓA HIỆU NĂNG CAO (OPTIMIZATIONS)

1. **Asset Container Caching**: File GLB chỉ được tải và parse vào RAM đúng **1 lần duy nhất**. Khi sinh 100 con quái trên map, hệ thống chỉ nhân bản lightweight instance (0ms độ trễ, không tốn thêm bộ nhớ).
2. **Animation Group Decoupling**: Tránh hoàn toàn lỗi méo hình, xoay ngược hướng hay kẹt frame khi quái đổi mục tiêu hoặc chuyển đổi giữa chạy/đánh/chết.
3. **Modular Scripts in `index.html`**: Code được phân tách rành mạch, dễ nâng cấp và bảo trì độc lập.
