from pathlib import Path
import subprocess
import tempfile
import numpy as np
import cv2
from PIL import Image
from rembg import remove, new_session

ROOT = Path(__file__).resolve().parents[1]
PLAYER = ROOT / "assets" / "characters" / "player"
SOURCE_REF = "23859aeed4dd27e52469ddaa12025d13265a693b"
OUT = 192

SHEETS = {
    "attack": ("IMG_7539.png", 5, 4, 20),
    "run": ("IMG_7540.png", 5, 5, 25),
}


def restore_source(name, dst):
    spec = f"{SOURCE_REF}:assets/characters/player/{name}"
    with dst.open("wb") as f:
        subprocess.run(["git", "show", spec], stdout=f, check=True)


def keep_primary_subject(img):
    arr = np.asarray(img.convert("RGBA")).copy()
    alpha = arr[:, :, 3]
    mask = (alpha > 12).astype(np.uint8)
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)

    if n <= 1:
        return img.convert("RGBA")

    h, w = mask.shape
    cx, cy = w / 2, h / 2
    best_label = None
    best_score = -1.0

    for label in range(1, n):
        area = int(stats[label, cv2.CC_STAT_AREA])
        if area < 12:
            continue
        x, y = centroids[label]
        d = float(np.hypot(x - cx, y - cy))
        # Favors the large centered player over stray limbs/text from adjacent cells.
        score = area / (1.0 + 1.8 * d / max(w, h))
        if score > best_score:
            best_score = score
            best_label = label

    if best_label is None:
        return img.convert("RGBA")

    core = (labels == best_label).astype(np.uint8)
    # Include antialiased outline immediately around the selected component.
    keep = cv2.dilate(core, np.ones((3, 3), np.uint8), iterations=1).astype(bool)
    arr[:, :, 3][~keep] = 0
    return Image.fromarray(arr, "RGBA")


def fit_frame(img):
    img = img.convert("RGBA")
    w, h = img.size
    scale = min(OUT / w, OUT / h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
    canvas.alpha_composite(img, ((OUT - nw) // 2, (OUT - nh) // 2))
    return canvas


def build(kind, src, cols, rows, count, session):
    sheet = Image.open(src).convert("RGBA")
    w, h = sheet.size
    xs = [round(i * w / cols) for i in range(cols + 1)]
    ys = [round(i * h / rows) for i in range(rows + 1)]

    for old in PLAYER.glob(f"player_{kind}_[0-9][0-9].webp"):
        old.unlink()

    idx = 0
    for row in range(rows):
        for col in range(cols):
            if idx >= count:
                break
            idx += 1
            cell = sheet.crop((xs[col], ys[row], xs[col + 1], ys[row + 1]))

            # AI segmentation removes the baked checkerboard without deleting
            # the player's white/grey clothing or black hair.
            cut = remove(cell, session=session, post_process_mask=True)
            if not isinstance(cut, Image.Image):
                cut = Image.open(cut)
            cut = keep_primary_subject(cut)
            cut = fit_frame(cut)

            cut.save(
                PLAYER / f"player_{kind}_{idx:02d}.webp",
                "WEBP", lossless=True, quality=100, method=6
            )


def validate():
    for kind, (_, _, _, expected) in SHEETS.items():
        frames = sorted(PLAYER.glob(f"player_{kind}_[0-9][0-9].webp"))
        if len(frames) != expected:
            raise RuntimeError(f"{kind}: expected {expected}, got {len(frames)}")

        for p in frames:
            im = Image.open(p).convert("RGBA")
            if im.size != (OUT, OUT):
                raise RuntimeError(f"{p.name}: wrong size {im.size}")
            a = np.asarray(im)[:, :, 3]
            transparent = float(np.mean(a < 8))
            visible = float(np.mean(a > 32))
            corners = np.concatenate([
                a[:8, :8].ravel(), a[:8, -8:].ravel(),
                a[-8:, :8].ravel(), a[-8:, -8:].ravel()
            ])
            if transparent < 0.25:
                raise RuntimeError(f"{p.name}: insufficient transparency {transparent:.1%}")
            if visible < 0.02:
                raise RuntimeError(f"{p.name}: player subject is nearly empty")
            if float(corners.mean()) > 18:
                raise RuntimeError(f"{p.name}: opaque background remains in corners")


def cleanup():
    for p in (
        ROOT / "scripts" / "repair_player_with_rembg.py",
        ROOT / ".github" / "workflows" / "repair-player-rembg.yml",
    ):
        if p.exists():
            p.unlink()


def main():
    session = new_session("isnet-general-use")
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        for kind, (name, cols, rows, count) in SHEETS.items():
            src = td / name
            restore_source(name, src)
            build(kind, src, cols, rows, count, session)

    validate()
    cleanup()
    print("OK: player rebuilt from original sheets with transparent background.")


if __name__ == "__main__":
    main()
