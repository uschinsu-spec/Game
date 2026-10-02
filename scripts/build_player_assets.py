from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
PLAYER_DIR = ROOT / "assets" / "characters" / "player"
MAIN_SCENE = ROOT / "src" / "scenes" / "MainScene.js"
PLAYER_MIXIN = ROOT / "src" / "scenes" / "mixins" / "PlayerMixin.js"
COMBAT_MIXIN = ROOT / "src" / "scenes" / "mixins" / "CombatMixin.js"

# Confirmed by user:
# IMG_7539.png = ATTACK sheet, 5 columns x 4 rows = 20 frames.
# IMG_7540.png = RUN sheet,    5 columns x 5 rows = 25 frames.
SOURCES = {
    "attack": {"path": PLAYER_DIR / "IMG_7539.png", "cols": 5, "rows": 4, "count": 20},
    "run": {"path": PLAYER_DIR / "IMG_7540.png", "cols": 5, "rows": 5, "count": 25},
}

FRAME_SIZE = (192, 192)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly 1 match, found {count}")
    return text.replace(old, new, 1)


def split_sheet(src: Path, kind: str, cols: int, rows: int, count: int) -> None:
    if not src.exists():
        raise FileNotFoundError(src)

    image = Image.open(src).convert("RGBA")
    width, height = image.size
    if width < cols or height < rows:
        raise RuntimeError(f"{src.name}: invalid image size {image.size}")

    for old in PLAYER_DIR.glob(f"player_{kind}_[0-9][0-9].webp"):
        old.unlink()

    # Split by the source grid itself, then normalize every cell to exactly 192x192.
    xs = [round(i * width / cols) for i in range(cols + 1)]
    ys = [round(i * height / rows) for i in range(rows + 1)]

    frame_index = 0
    for row in range(rows):
        for col in range(cols):
            frame_index += 1
            if frame_index > count:
                break

            cell = image.crop((xs[col], ys[row], xs[col + 1], ys[row + 1]))

            # Preserve alpha and remove only near-invisible fringe noise.
            arr = np.asarray(cell).copy()
            arr[arr[:, :, 3] < 4] = (0, 0, 0, 0)
            cell = Image.fromarray(arr, "RGBA")

            # Exactly one runtime frame per file.
            cell = cell.resize(FRAME_SIZE, Image.Resampling.LANCZOS)
            out = PLAYER_DIR / f"player_{kind}_{frame_index:02d}.webp"
            cell.save(out, "WEBP", lossless=True, quality=100, method=6)

    if frame_index != count:
        raise RuntimeError(f"{kind}: generated {frame_index}, expected {count}")


def patch_main_scene() -> None:
    path = MAIN_SCENE
    text = path.read_text(encoding="utf-8")

    text = text.replace(
        "CombatMixin.js?v=20261002-shared-vfx-pool-v5",
        "CombatMixin.js?v=20261002-player-assets-v2",
    )
    text = text.replace(
        "PlayerMixin.js?v=20261002-shared-vfx-pool-v5",
        "PlayerMixin.js?v=20261002-player-assets-v2",
    )

    old_preload = """    this.load.spritesheet('player_idle', A + 'characters/player/player_idle.webp', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('player_run', A + 'characters/player/player_run.webp', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('player_attack', A + 'characters/player/player_attack.webp', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('player_fly', A + 'characters/player/player_fly.webp', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('player_fly_attack', A + 'characters/player/player_fly_attack.webp', { frameWidth: 192, frameHeight: 192 });
"""
    new_preload = """    // Player uses only run (25 frames) + attack (20 frames).
    for (let f = 1; f <= 25; f++) {
      const pad = String(f).padStart(2, '0');
      this.load.image(\`player_run_\${pad}\`, \`\${A}characters/player/player_run_\${pad}.webp\`);
    }
    for (let f = 1; f <= 20; f++) {
      const pad = String(f).padStart(2, '0');
      this.load.image(\`player_attack_\${pad}\`, \`\${A}characters/player/player_attack_\${pad}.webp\`);
    }
"""
    text = replace_once(text, old_preload, new_preload, "MainScene preload")

    text = text.replace(
        "// Smooth acceleration/deceleration so 12-frame locomotion does not snap between states.",
        "// Smooth acceleration/deceleration so the 25-frame locomotion does not snap between states.",
    )

    old_state = """    const isMoving = Math.abs(appliedVx) > 7 || Math.abs(appliedVy) > 7;
    if (this.time.now >= (this.attackUntil || 0)) {
      if (Math.abs(appliedVx) > 7) this.player.setFlipX(appliedVx < 0);
      if (this.player.anims) this.player.anims.timeScale = 1;
      if (isTrucCoOrAbove) {
        // Trúc Cơ trở lên: idle khi đứng yên, fly khi di chuyển.
        this.player.play(isMoving ? 'p_fly' : 'p_idle', true);
      } else {
        // Dưới Trúc Cơ: chỉ idle/run.
        this.player.play(isMoving ? 'p_run' : 'p_idle', true);
      }
    }
"""
    new_state = """    const isMoving = Math.abs(appliedVx) > 7 || Math.abs(appliedVy) > 7;
    if (this.time.now >= (this.attackUntil || 0)) {
      if (Math.abs(appliedVx) > 7) this.player.setFlipX(appliedVx < 0);
      if (this.player.anims) this.player.anims.timeScale = 1;

      if (isMoving) {
        if (this.player.anims?.currentAnim?.key !== 'p_run' || !this.player.anims.isPlaying) {
          this.player.play('p_run', true);
        }
      } else {
        // No idle asset: hold a clean frame from the run sheet.
        this.player.stop();
        if (this.player.texture?.key !== 'player_run_01') this.player.setTexture('player_run_01');
      }
    }
"""
    text = replace_once(text, old_state, new_state, "MainScene player animation state")

    old_anims = """    const make = (key, tex, start, end, rate, repeat = -1, yoyo = false) => { if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start, end }), frameRate: rate, repeat, yoyo }); };
    make('p_idle', 'player_idle', 0, 11, 11, -1); make('p_run', 'player_run', 0, 11, 12, -1); make('p_attack', 'player_attack', 0, 11, 24, 0); make('p_fly', 'player_fly', 0, 11, 15, -1); make('p_fly_attack', 'player_fly_attack', 0, 11, 24, 0);
"""
    new_anims = """    const make = (key, tex, start, end, rate, repeat = -1, yoyo = false) => { if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start, end }), frameRate: rate, repeat, yoyo }); };
    const playerFrames = (kind, count) => Array.from({ length: count }, (_, i) => ({ key: \`player_\${kind}_\${String(i + 1).padStart(2, '0')}\` }));
    if (!this.anims.exists('p_run')) this.anims.create({ key: 'p_run', frames: playerFrames('run', 25), frameRate: 25, repeat: -1 });
    if (!this.anims.exists('p_attack')) this.anims.create({ key: 'p_attack', frames: playerFrames('attack', 20), frameRate: 40, repeat: 0 });
"""
    text = replace_once(text, old_anims, new_anims, "MainScene player animations")

    path.write_text(text, encoding="utf-8")


def patch_player_mixin() -> None:
    path = PLAYER_MIXIN
    text = path.read_text(encoding="utf-8")

    old_create = """    const spawn = this.currentMap?.spawn || { x: 350, y: 620 };
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player_idle', 0)
      .setScale(0.85)
      .setDepth(620);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(44, 70).setOffset(42, 40);
    this.player.play('p_idle');
"""
    new_create = """    const spawn = this.currentMap?.spawn || { x: 350, y: 620 };
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player_run_01')
      .setScale(0.85)
      .setDepth(620);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(44, 70).setOffset(42, 40);
    this.player.stop();
"""
    text = replace_once(text, old_create, new_create, "PlayerMixin createPlayer")

    old_comment = """  // Animation tier:
  // - Dưới Trúc Cơ (realmIdx < 13): idle / run / attack.
  // - Trúc Cơ Sơ Kỳ trở lên (realmIdx >= 13): idle / fly / fly_attack.
"""
    new_comment = """  // Realm still affects movement speed, but player visuals use only run + attack.
"""
    text = replace_once(text, old_comment, new_comment, "PlayerMixin tier comment")

    old_attack = """  playPlayerAttackAnimation(durationMs = 360) {
    if (!this.player || !this.player.active) return;
    const safeDuration = Phaser.Math.Clamp(Math.floor(Number(durationMs) || 360), 280, 520);
    const animKey = this.isPlayerFlyingRealm() ? 'p_fly_attack' : 'p_attack';

    // p_attack / p_fly_attack are 12 frames at 24 fps => 500ms base duration.
    // timeScale keeps every frame while matching the actual combat cadence.
    if (this.player.anims) this.player.anims.timeScale = 500 / safeDuration;
    this.attackUntil = this.time.now + safeDuration;
    this.player.play(animKey, true);
  },
"""
    new_attack = """  playPlayerAttackAnimation(durationMs = 500) {
    if (!this.player || !this.player.active) return;

    // 20 attack frames at 40 fps = 500ms base.
    // Minimum 340ms keeps the 20-frame motion close to the 60Hz display limit.
    const safeDuration = Phaser.Math.Clamp(Math.floor(Number(durationMs) || 500), 340, 650);
    const baseDuration = 500;

    if (this.player.anims) this.player.anims.timeScale = baseDuration / safeDuration;
    this.attackUntil = this.time.now + safeDuration;
    this.player.play('p_attack', true);
  },
"""
    text = replace_once(text, old_attack, new_attack, "PlayerMixin attack animation")

    text = text.replace(
        "      this.player.play('p_idle', true);",
        "      this.player.stop();\n      this.player.setTexture('player_run_01');",
    )

    path.write_text(text, encoding="utf-8")


def patch_combat_mixin() -> None:
    path = COMBAT_MIXIN
    text = path.read_text(encoding="utf-8")

    old_fallback = """      else {
        const isTrucCoOrAbove = (Number(gameState.realmIdx) || 0) >= 13;
        this.attackUntil = this.time.now + animDuration;
        this.player.play(isTrucCoOrAbove ? 'p_fly_attack' : 'p_attack', true);
      }
"""
    new_fallback = """      else {
        this.attackUntil = this.time.now + animDuration;
        this.player.play('p_attack', true);
      }
"""
    count = text.count(old_fallback)
    if count != 2:
        raise RuntimeError(f"CombatMixin attack fallback: expected 2 matches, found {count}")
    text = text.replace(old_fallback, new_fallback)

    text = replace_once(
        text,
        "    this.player.play('p_idle', true);\n",
        "    this.player.stop();\n    this.player.setTexture('player_run_01');\n",
        "CombatMixin respawn",
    )

    path.write_text(text, encoding="utf-8")


def validate() -> None:
    expected = {"run": 25, "attack": 20}
    for kind, count in expected.items():
        files = sorted(PLAYER_DIR.glob(f"player_{kind}_[0-9][0-9].webp"))
        if len(files) != count:
            raise RuntimeError(f"{kind}: expected {count} frames, found {len(files)}")
        for file in files:
            with Image.open(file) as im:
                if im.size != FRAME_SIZE or im.format != "WEBP":
                    raise RuntimeError(f"{file.name}: invalid {im.format} {im.size}")

    main = MAIN_SCENE.read_text(encoding="utf-8")
    player = PLAYER_MIXIN.read_text(encoding="utf-8")
    combat = COMBAT_MIXIN.read_text(encoding="utf-8")
    combined = "\n".join((main, player, combat))

    forbidden = (
        "player_idle.webp",
        "player_fly.webp",
        "player_fly_attack.webp",
        "'p_idle'",
        "'p_fly'",
        "'p_fly_attack'",
    )
    leftovers = [token for token in forbidden if token in combined]
    if leftovers:
        raise RuntimeError(f"Old player animation references remain: {leftovers}")


def cleanup_old_assets() -> None:
    old_files = [
        "player_attack.webp",
        "player_fly.webp",
        "player_fly_attack.webp",
        "player_idle.webp",
        "player_run.webp",
        "IMG_7539.png",
        "IMG_7540.png",
    ]
    for name in old_files:
        path = PLAYER_DIR / name
        if path.exists():
            path.unlink()

    # One-shot migration: remove helper files from the final repository.
    for path in (
        ROOT / "scripts" / "build_player_assets.py",
        ROOT / ".github" / "workflows" / "build-player-assets.yml",
    ):
        if path.exists():
            path.unlink()


def main() -> None:
    for kind, spec in SOURCES.items():
        split_sheet(spec["path"], kind, spec["cols"], spec["rows"], spec["count"])

    patch_main_scene()
    patch_player_mixin()
    patch_combat_mixin()
    validate()
    cleanup_old_assets()
    print("Player migration complete: run 25 frames + attack 20 frames, each 192x192 WebP.")


if __name__ == "__main__":
    main()
