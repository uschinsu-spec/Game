from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / "assets" / "characters" / "player"
MAIN = ROOT / "src" / "scenes" / "MainScene.js"
PMIX = ROOT / "src" / "scenes" / "mixins" / "PlayerMixin.js"
FRAME = 192


def load(prefix, count):
    out = []
    for i in range(1, count + 1):
        path = P / f"{prefix}_{i:02d}.webp"
        if not path.exists():
            raise FileNotFoundError(path)
        out.append(Image.open(path).convert("RGBA"))
    return out


def rebuild():
    # Current mistaken output:
    # player_attack_* is actually the correct RUN 5x5.
    # player_run_* is ATTACK 5x4 mistakenly sliced as 5x5.
    run_src = load("player_attack", 25)
    attack_wrong = load("player_run", 25)

    sheet = Image.new("RGBA", (960, 960), (0, 0, 0, 0))
    for idx, img in enumerate(attack_wrong):
        row, col = divmod(idx, 5)
        sheet.paste(img, (col * FRAME, row * FRAME))

    attack_src = []
    for row in range(4):
        for col in range(5):
            cell = sheet.crop((col * 192, row * 240, (col + 1) * 192, (row + 1) * 240))
            attack_src.append(cell.resize((192, 192), Image.Resampling.LANCZOS))

    for path in P.glob("player_run_[0-9][0-9].webp"):
        path.unlink()
    for path in P.glob("player_attack_[0-9][0-9].webp"):
        path.unlink()

    for i, img in enumerate(run_src, 1):
        img.save(P / f"player_run_{i:02d}.webp", "WEBP", lossless=True, quality=100, method=6)
    for i, img in enumerate(attack_src, 1):
        img.save(P / f"player_attack_{i:02d}.webp", "WEBP", lossless=True, quality=100, method=6)


def patch_main():
    t = MAIN.read_text(encoding="utf-8")
    bt = chr(96)

    # Fix accidental escaped template literals from the first migration.
    t = t.replace("\\" + bt, bt)
    t = t.replace("\\${", "${")

    old_preload = (
        "    // Player: only 2 animations, 25 fixed 192x192 frames each.\n"
        "    for (let f = 1; f <= 25; f++) {\n"
        "      const pad = String(f).padStart(2, '0');\n"
        "      this.load.image(" + bt + "player_run_${pad}" + bt + ", " + bt + "${A}characters/player/player_run_${pad}.webp" + bt + ");\n"
        "      this.load.image(" + bt + "player_attack_${pad}" + bt + ", " + bt + "${A}characters/player/player_attack_${pad}.webp" + bt + ");\n"
        "    }\n"
    )
    new_preload = (
        "    // Player uses only run (25 frames) + attack (20 frames).\n"
        "    for (let f = 1; f <= 25; f++) {\n"
        "      const pad = String(f).padStart(2, '0');\n"
        "      this.load.image(" + bt + "player_run_${pad}" + bt + ", " + bt + "${A}characters/player/player_run_${pad}.webp" + bt + ");\n"
        "    }\n"
        "    for (let f = 1; f <= 20; f++) {\n"
        "      const pad = String(f).padStart(2, '0');\n"
        "      this.load.image(" + bt + "player_attack_${pad}" + bt + ", " + bt + "${A}characters/player/player_attack_${pad}.webp" + bt + ");\n"
        "    }\n"
    )
    if old_preload not in t:
        raise RuntimeError("preload block not found")
    t = t.replace(old_preload, new_preload, 1)

    old_anim = (
        "    const playerFrames = kind => Array.from({ length: 25 }, (_, i) => ({ key: "
        + bt + "player_${kind}_${String(i + 1).padStart(2, '0')}" + bt
        + " }));\n"
        "    if (!this.anims.exists('p_run')) this.anims.create({ key: 'p_run', frames: playerFrames('run'), frameRate: 25, repeat: -1 });\n"
        "    if (!this.anims.exists('p_attack')) this.anims.create({ key: 'p_attack', frames: playerFrames('attack'), frameRate: 40, repeat: 0 });\n"
    )
    new_anim = (
        "    const playerFrames = (kind, count) => Array.from({ length: count }, (_, i) => ({ key: "
        + bt + "player_${kind}_${String(i + 1).padStart(2, '0')}" + bt
        + " }));\n"
        "    if (!this.anims.exists('p_run')) this.anims.create({ key: 'p_run', frames: playerFrames('run', 25), frameRate: 25, repeat: -1 });\n"
        "    if (!this.anims.exists('p_attack')) this.anims.create({ key: 'p_attack', frames: playerFrames('attack', 20), frameRate: 40, repeat: 0 });\n"
    )
    if old_anim not in t:
        raise RuntimeError("animation block not found")
    t = t.replace(old_anim, new_anim, 1)

    t = t.replace("CombatMixin.js?v=20261002-player25-v1", "CombatMixin.js?v=20261002-player-assets-v3")
    t = t.replace("PlayerMixin.js?v=20261002-player25-v1", "PlayerMixin.js?v=20261002-player-assets-v3")
    MAIN.write_text(t, encoding="utf-8")


def patch_player():
    t = PMIX.read_text(encoding="utf-8")
    old = (
        "    // 25 frames need ~420ms minimum on a 60Hz display to avoid obvious frame loss.\n"
        "    const safeDuration = Phaser.Math.Clamp(Math.floor(Number(durationMs) || 500), 420, 650);\n"
        "    const baseDuration = 625; // 25 frames at 40 fps.\n"
    )
    new = (
        "    // 20 attack frames at 40 fps = 500ms base.\n"
        "    // 340ms stays close to the 60Hz display limit while keeping combat responsive.\n"
        "    const safeDuration = Phaser.Math.Clamp(Math.floor(Number(durationMs) || 500), 340, 650);\n"
        "    const baseDuration = 500;\n"
    )
    if old not in t:
        raise RuntimeError("attack timing block not found")
    PMIX.write_text(t.replace(old, new, 1), encoding="utf-8")


def validate():
    run = sorted(P.glob("player_run_[0-9][0-9].webp"))
    attack = sorted(P.glob("player_attack_[0-9][0-9].webp"))
    if len(run) != 25 or len(attack) != 20:
        raise RuntimeError(f"bad counts run={len(run)} attack={len(attack)}")
    for path in run + attack:
        with Image.open(path) as im:
            if im.size != (192, 192) or im.format != "WEBP":
                raise RuntimeError(f"bad frame {path.name}: {im.format} {im.size}")
    t = MAIN.read_text(encoding="utf-8")
    if "\\" + chr(96) in t:
        raise RuntimeError("escaped backtick remains")
    if "playerFrames('run', 25)" not in t or "playerFrames('attack', 20)" not in t:
        raise RuntimeError("frame counts not patched")


def cleanup():
    for path in (
        ROOT / "scripts" / "build_player_assets.py",
        ROOT / ".github" / "workflows" / "build-player-assets.yml",
    ):
        if path.exists():
            path.unlink()


rebuild()
patch_main()
patch_player()
validate()
cleanup()
print("OK: RUN 25 frames, ATTACK 20 frames, 192x192 WebP.")
