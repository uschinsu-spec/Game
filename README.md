# Vạn Tiên Lục – Perspective 2.5D AFK Xianxia RPG

Dự án game tiên hiệp 2D AFK RPG mobile-first portrait trên nền tảng web, xây dựng bằng Phaser 3, TypeScript và Vite.

---

## 1. Tổng quan Kiến trúc (Phase 1 – Core Gameplay)

Hệ thống được tái cấu trúc hoàn toàn theo mô hình Module & Clean Architecture:

- **`src/core/`**:
  - `Types.ts`: Định nghĩa toàn bộ interfaces, enums (`PlayerStateEnum`, `MonsterStateEnum`, `SkillType`, `LootQuality`, `CharacterStats`, v.v.).
  - `StateMachine.ts`: Finite State Machine độc lập, quản lý lifecycle (`enter`, `update`, `exit`).
  - `EventBus.ts`: Hệ thống truyền thông tin phân tán (Event-driven Architecture), tách rời logic game khỏi giao diện và rendering.
- **`src/data/`**:
  - `skills.data.ts`: Dữ liệu 4 kỹ năng tự động + 1 Tuyệt kỹ trấn phái (*Vạn Kiếm Quy Tông*).
  - `monsters.data.ts`: Thông số quái vật thường, tinh anh và Boss Lĩnh Chủ.
  - `realms.data.ts`: 10 đại cảnh giới tu tiên (Luyện Khí, Trúc Cơ, Kim Đan...).
- **`src/entities/`**:
  - `Player.ts`: Quản lý nhân vật Kiếm Tiên, phi kiếm hộ thể, vòng hào quang, thanh máu, nạp MP và State Machine đầy đủ 8 trạng thái:
    `IDLE`, `RUNNING`, `DETECTING`, `COMBAT`, `LOOTING`, `RESUMING`, `BOSS_COMBAT`, `DEAD`.
  - `Monster.ts`: Thực thể quái vật, bóng đổ, thanh HP động, nhãn cấp độ, trạng thái AI và hoạt ảnh lùi/chết mượt mà.
  - `LootItem.ts`: Vật phẩm rơi thực tế trên mặt đất với hiệu ứng nảy đất, hào quang ngũ hành và nam châm hút tự động (Auto Magnet).
- **`src/systems/`**:
  - `CombatSystem.ts`: Tính toán sát thương chuẩn (Công kích, Phòng ngự, Xuyên thấu, Bạo kích, Dao động), số nhảy sát thương dạng tiên hiệp, chém kiếm khí, tuyệt kỹ chấn động toàn màn hình.
  - `TargetSystem.ts`: Nhận diện quái vật phía trước, thuật toán Smart Target Selection (ưu tiên Boss > Tinh anh > Gần nhất).
  - `SkillSystem.ts`: Quản lý hồi chiêu, tiêu hao linh lực, tự động xuất chiêu theo độ ưu tiên, quét AOE đa mục tiêu.
  - `SpawnSystem.ts`: Tự động sinh quái vật theo tiến trình, quản lý vòng đời quái và xuất hiện Boss thế giới.
  - `LootSystem.ts`: Rơi bạc, linh thạch, thảo dược quý và hút vào túi đồ nhân vật.
- **`src/ui/`**:
  - `HUDManager.ts`: Đồng bộ giao diện HTML Portrait (HP, MP, Cấp độ, Tu vi, Lực chiến, Nhiệm vụ, Bảng điều khiển Modal).
- **`src/game/`**:
  - `WorldScene.ts`: Điều phối cảnh game, cuộn nền Parallax vô tận, nhân vật neo giữa phía dưới màn hình, chiến trường phối cảnh hướng về chân trời; world coordinates được chiếu qua PerspectiveProjector.

---

## 2. Hướng dẫn cài đặt & Khởi chạy

### Yêu cầu hệ thống:
- Node.js 18+ (hoặc Node.js 20+)
- npm

### Cài đặt thư viện:
```bash
npm install
```

### Chạy môi trường Development:
```bash
npm run dev
```

### Kiểm tra Build & Type Check:
```bash
npm run build
```

### Chạy Preview sau khi Build:
```bash
npm run preview
```

---

## 3. Điều khiển & Tính năng In-Game
- **Auto Combat**: Bật/tắt tự động tuần tra và trảm yêu.
- **Tốc độ trận đấu**: Chuyển đổi giữa x1, x2, x3.
- **Tuyệt kỹ**: Thi triển *Vạn Kiếm Quy Tông* rung chuyển đất trời, quét sạch yêu ma trên toàn màn hình.
- **Hệ thống Menu**:
  - **Nhân vật**: Chi tiết thuộc tính (Lực chiến, HP, MP, Công kích, Phòng ngự, Bạo kích, Xuyên thấu).
  - **Tu luyện**: Tụ khí tu luyện, đột phá tầng cảnh giới.
  - **Kỹ năng**: Xem 4 thức kiếm pháp và Tuyệt kỹ môn phái.
  - **Trang bị**: Xem trang bị vũ khí, giáp, phù bảo và trang sức.
  - **Túi đồ**: Quản lý ngân lượng, linh thạch và nguyên liệu thu thập.


---

## Perspective 2.5D upgrade

The active development branch `feature/perspective-2-5d-upgrade` introduces:

- `src/game/perspective/PerspectiveProjector.ts`: shared normalized-depth projection (world X/Z to portrait screen coordinates).
- `src/game/perspective/WorldMotion.ts`: forward depth progression while exploring and controlled approach/retreat behavior.
- `src/game/perspective/DepthSorter.ts`: reusable back-to-front depth ordering helper.
- Monsters now carry normalized `worldX` / `worldZ` coordinates and are projected each frame.
- Smart target selection uses world-space distance and a forward combat band; it no longer sorts arbitrary screen-space entities or prioritizes a distant boss unconditionally.
- Spawn waves include a short clear delay to give loot collection and resume states time to run.
- Portrait HUD includes four tap-to-toggle auto-skill slots plus the existing ultimate control.

### Current scope and limitations

This is still a 2.5D sprite prototype using temporary generated art, not a full 3D renderer. Offline progression, authoritative server saves, and production asset animation remain separate implementation tasks. Validate on-device and run `npm run build` before release.
