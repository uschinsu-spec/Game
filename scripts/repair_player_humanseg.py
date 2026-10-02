from pathlib import Path
import subprocess, tempfile
import numpy as np
import cv2
from PIL import Image
from rembg import remove, new_session

ROOT = Path(__file__).resolve().parents[1]
PLAYER = ROOT / "assets" / "characters" / "player"
REF = "23859aeed4dd27e52469ddaa12025d13265a693b"
OUT = 192

SHEETS = {
    "attack": ("IMG_7539.png", 5, 5, 20),
    "run": ("IMG_7540.png", 5, 5, 25),
}


def restore(name, dst):
    with dst.open("wb") as f:
        subprocess.run(
            ["git", "show", f"{REF}:assets/characters/player/{name}"],
            stdout=f, check=True
        )


def clean_human_mask(img):
    arr = np.asarray(img.convert("RGBA")).copy()
    alpha = arr[:, :, 3].copy()

    # Human segmentation occasionally leaves tiny detached crumbs.
    binary = (alpha >= 52).astype(np.uint8)
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, 8)

    keep = np.zeros_like(binary, dtype=bool)
    if n > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        main_label = int(np.argmax(areas)) + 1
        main_area = int(stats[main_label, cv2.CC_STAT_AREA])
        mx, my = centroids[main_label]

        for label in range(1, n):
            area = int(stats[label, cv2.CC_STAT_AREA])
            if area < max(12, main_area * 0.004):
                continue
            x, y = centroids[label]
            # Keep meaningful pieces close to the main body (hair/ribbons/robe).
            if label == main_label or np.hypot(x - mx, y - my) < max(binary.shape) * 0.55:
                keep |= labels == label
    else:
        keep = binary.astype(bool)

    # Expand one pixel to retain antialiased outline around the accepted mask.
    keep = cv2.dilate(keep.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1).astype(bool)
    alpha[~keep] = 0
    alpha[alpha < 28] = 0
    alpha[alpha > 230] = 255
    arr[:, :, 3] = alpha
    return Image.fromarray(arr, "RGBA")


def fit(img):
    # Cell aspect stays square, but keep this safe if source dimensions round unevenly.
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

        cut = remove(
            cell,
            session=session,
            alpha_matting=False,
            post_process_mask=True
        )
        if not isinstance(cut, Image.Image):
            cut = Image.open(cut)

        cut = clean_human_mask(cut)
        cut = fit(cut)
        cut.save(
            PLAYER / f"player_{kind}_{idx + 1:02d}.webp",
            "WEBP", lossless=True, quality=100, method=4
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
                raise RuntimeError(f"{p.name}: wrong size")
            if np.mean(a < 8) < 0.35:
                raise RuntimeError(f"{p.name}: too much opaque background")
            if np.mean(a > 40) < 0.02:
                raise RuntimeError(f"{p.name}: subject missing")


session = new_session("u2net_human_seg")

with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    for kind, (name, cols, rows, count) in SHEETS.items():
        src = td / name
        restore(name, src)
        build(kind, src, cols, rows, count, session)

validate()
print("OK: human-segmented player run=25 attack=20.")
