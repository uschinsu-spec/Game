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

# Both source canvases are 5x5 cells.
# ATTACK uses only the first 4 rows = first 20 cells; row 5 is blank/text.
SHEETS = {
    "attack": ("IMG_7539.png", 5, 5, 20),
    "run": ("IMG_7540.png", 5, 5, 25),
}


def restore_source(name, dst):
    spec = f"{SOURCE_REF}:assets/characters/player/{name}"
    with dst.open("wb") as f:
        subprocess.run(["git", "show", spec], stdout=f, check=True)


def isolate_main_subject(img):
    arr = np.asarray(img.convert("RGBA")).copy()
    alpha = arr[:, :, 3]

    # Remove weak segmentation residue from checkerboard edges.
    alpha[alpha < 40] = 0
    arr[:, :, 3] = alpha

    mask = (alpha >= 40).astype(np.uint8)
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)
    if n <= 1:
        return Image.fromarray(arr, "RGBA")

    h, w = mask.shape
    cx, cy = w / 2, h / 2
    best = None
    best_score = -1.0
    for label in range(1, n):
        area = int(stats[label, cv2.CC_STAT_AREA])
        if area < 20:
            continue
        x, y = centroids[label]
        dist = float(np.hypot(x - cx, y - cy))
        score = area / (1.0 + 1.7 * dist / max(w, h))
        if score > best_score:
            best_score = score
            best = label

    if best is None:
        return Image.fromarray(arr, "RGBA")

    # Keep exactly the main connected player silhouette.
    arr[:, :, 3][labels != best] = 0
    return Image.fromarray(arr, "RGBA")


def fit_192(img):
    img = img.convert("RGBA")
    w, h = img.size
    scale = min(OUT / w, OUT / h)
    nw = max(1, round(w * scale))
    nh = max(1, round(h * scale))
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

    for idx in range(count):
        row, col = divmod(idx, cols)
        cell = sheet.crop((xs[col], ys[row], xs[col + 1], ys[row + 1]))

        cut = remove(cell, session=session, post_process_mask=True)
        if not isinstance(cut, Image.Image):
            cut = Image.open(cut)
        cut = isolate_main_subject(cut)
        cut = fit_192(cut)
        cut.save(
            PLAYER / f"player_{kind}_{idx + 1:02d}.webp",
            "WEBP", lossless=True, quality=100, method=6
        )


def validate():
    for kind, (_, _, _, expected) in SHEETS.items():
        frames = sorted(PLAYER.glob(f"player_{kind}_[0-9][0-9].webp"))
        if len(frames) != expected:
            raise RuntimeError(f"{kind}: expected {expected}, got {len(frames)}")
        for p in frames:
            im = Image.open(p).convert("RGBA")
            a = np.asarray(im)[:, :, 3]
            if im.size != (192, 192):
                raise RuntimeError(f"{p.name}: size {im.size}")
            if float(np.mean(a < 8)) < 0.30:
                raise RuntimeError(f"{p.name}: background not transparent enough")
            if float(np.mean(a > 40)) < 0.02:
                raise RuntimeError(f"{p.name}: subject missing")
            corners = np.concatenate((a[:6,:6].ravel(),a[:6,-6:].ravel(),a[-6:,:6].ravel(),a[-6:,-6:].ravel()))
            if float(corners.mean()) > 8:
                raise RuntimeError(f"{p.name}: opaque corners remain")


def cleanup():
    for p in (
        ROOT / "scripts" / "repair_player_final.py",
        ROOT / ".github" / "workflows" / "repair-player-final.yml",
        ROOT / "scripts" / "debug_player_source.py",
        ROOT / ".github" / "workflows" / "debug-player-source.yml",
        PLAYER / "debug_IMG_7539.webp",
        PLAYER / "debug_IMG_7540.webp",
    ):
        if p.exists():
            p.unlink()


session = new_session("isnet-general-use")
with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    for kind, (name, cols, rows, count) in SHEETS.items():
        src = td / name
        restore_source(name, src)
        build(kind, src, cols, rows, count, session)

validate()
cleanup()
print("OK: RUN 25 + ATTACK 20 rebuilt from true 5x5 cell geometry.")
