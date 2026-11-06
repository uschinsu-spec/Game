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
  - `SkillSystem.ts`: Quản lý hồi chiêu, tiêu hao linh lực, tự động xuất chiêu theo độ ưu tiên, quét AOE đa mục tiêu và nâng cấp kỹ năng tối đa 5 cấp.
  - `SpawnSystem.ts`: Tự động sinh quái vật theo tiến trình, quản lý Boss thế giới và Bí Cảnh solo 5 tầng với Boss cuối.
  - `LootSystem.ts`: Rơi bạc, linh thạch, thảo dược và trang bị có thuộc tính phụ (bạo kích, bạo thương, xuyên thủng, tốc đánh), sau đó hút về túi đồ.
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
  - **Túi đồ**: Quản lý ngân lượng, linh thạch, nguyên liệu và trang bị có thuộc tính phụ.
- **Bí cảnh**: Phụ bản solo 5 tầng, tăng độ khó theo tầng và Boss cuối; tốn 20 linh thạch, có thưởng hoàn thành.
- **Chiến báo**: Thống kê phiên hiện tại gồm sát thương gây ra/nhận vào, số quái tiêu diệt và thời lượng.
- **Boss nhiều giai đoạn**: Boss chuyển từ đơn kích sang song kích và tam liên kích với cảnh báo trực quan.
- **Cường hóa**: Nâng trang bị đang mặc tối đa +10 bằng bạc và linh thạch.
- **Nâng cấp kỹ năng**: 4 kỹ năng và tuyệt kỹ có thể tăng cấp đến 5; tiến trình được lưu cục bộ.


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

This is a 2.5D sprite prototype, not a full 3D renderer. The visual polish branch adds original SVG character/demon illustrations, horizon-to-camera enemy approach, sword trails, layered water highlights and a responsive combat HUD. The prototype includes localStorage-based offline reward calculation capped at 12 hours; authoritative server validation, durable character saves, and production asset animation remain separate implementation tasks. Validate on-device and run `npm run build` before release.


## Visual & Gameplay Polish v0.3

Branch feature/visual-gameplay-polish-v0.3 adds:

- Original SVG artwork for the white-robed sword cultivator and three demon tiers (normal, elite, boss).
- Enemies enter at normalized horizon depth and advance toward the player with the existing perspective projector.
- Cyan sword trails, additive glow and an impact burst on hit.
- Layered water depth bands, sun reflection highlights and perspective wave glints.
- HP and MP meters plus radial skill/ultimate cooldown overlays.
- Responsive HUD breakpoints for compact phones, short screens and wider desktop viewports.

See docs/visual-gameplay-polish-v0.3.md for the QA matrix and release checks.


## Cinematic Visual Upgrade v0.4

Branch `feature/visual-cinematic-upgrade-v0.4` adds a stronger xianxia art direction while keeping the game as a lightweight Phaser 2.5D mobile prototype:

- `src/game/CinematicEnvironment.ts` draws layered mountain ridges, a floating immortal sanctuary, drifting clouds, atmospheric light and animated spirit motes.
- The environment is integrated into the world scene lifecycle and rebuilds its vector layers when the viewport changes.
- New original SVG portrait and four illustrated skill icons replace emoji-only presentation in the hero avatar and combat skill strip.
- The HUD receives warmer gold framing, richer material gradients, clearer resource meters and premium modal/skill treatments.
- The existing water perspective, enemy projection, combat rules and responsive layout remain in place.

### v0.4 validation notes

Run `npm ci && npm run build`. Then smoke-test portrait viewports at 320×640, 360×800, 390×844 and 430×932, plus one landscape resize. Confirm the floating sanctuary/clouds animate, skill art loads, enemy depth scaling and combat remain functional, and no SVG requests return 404. Manual device testing is still required before release.
