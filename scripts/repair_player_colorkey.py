from pathlib import Path
from collections import Counter
import subprocess, tempfile
import numpy as np
import cv2
from PIL import Image

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


def palette_from_sheet(sheet):
    rgb = np.asarray(sheet.convert("RGB"))
    sample = rgb[::4, ::4].reshape(-1, 3)
    spread = sample.max(axis=1) - sample.min(axis=1)
    neutral = sample[(spread <= 10) & (sample.mean(axis=1) >= 145)]
    q = (neutral // 2) * 2
    counts = Counter(map(tuple, q.tolist()))

    palette = []
    for color, n in counts.most_common(100):
        c = np.array(color, dtype=np.int16)
        if all(np.linalg.norm(c - p) >= 18 for p in palette):
            palette.append(c)
        if len(palette) == 2:
            break

    if len(palette) != 2:
        raise RuntimeError(f"Could not detect checker palette: {palette}")
    print("checker palette:", [p.tolist() for p in palette])
    return np.stack(palette)


def dilate(mask):
    return cv2.dilate(mask.astype(np.uint8), np.ones((3,3), np.uint8), iterations=1).astype(bool)


def remove_checker(cell, palette):
    arr = np.asarray(cell.convert("RGBA")).copy()
    rgb = arr[:, :, :3].astype(np.int16)
    dists = [np.sqrt(np.sum((rgb - p) ** 2, axis=2)) for p in palette]
    dist = np.minimum.reduce(dists)

    alpha = arr[:, :, 3].astype(np.float32)
    exact_bg = dist <= 12
    alpha[exact_bg] = 0

    # Clean only the immediate antialiased fringe around already-proven bg.
    edge_zone = dilate(exact_bg) & ~exact_bg & (dist < 32)
    edge_alpha = np.clip((dist - 10) / 22 * 255, 0, 255)
    alpha[edge_zone] = np.minimum(alpha[edge_zone], edge_alpha[edge_zone])

    arr[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def keep_main(img):
    arr = np.asarray(img.convert("RGBA")).copy()
    mask = (arr[:, :, 3] > 18).astype(np.uint8)
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)
    if n <= 1:
        return Image.fromarray(arr, "RGBA")

    h, w = mask.shape
    center = np.array([w/2, h/2])
    best = None
    score_best = -1
    for lab in range(1, n):
        area = int(stats[lab, cv2.CC_STAT_AREA])
        if area < 16:
            continue
        c = centroids[lab]
        dist = np.linalg.norm(c - center)
        score = area / (1 + 1.6 * dist / max(w, h))
        if score > score_best:
            best, score_best = lab, score

    if best is not None:
        arr[:, :, 3][labels != best] = 0
    return Image.fromarray(arr, "RGBA")


def fit(img):
    w, h = img.size
    scale = min(OUT/w, OUT/h)
    nw, nh = max(1, round(w*scale)), max(1, round(h*scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (OUT, OUT), (0,0,0,0))
    canvas.alpha_composite(resized, ((OUT-nw)//2, (OUT-nh)//2))
    return canvas


def build(kind, src, cols, rows, count):
    sheet = Image.open(src).convert("RGBA")
    palette = palette_from_sheet(sheet)
    w, h = sheet.size
    xs = [round(i*w/cols) for i in range(cols+1)]
    ys = [round(i*h/rows) for i in range(rows+1)]

    for p in PLAYER.glob(f"player_{kind}_[0-9][0-9].webp"):
        p.unlink()

    for idx in range(count):
        row, col = divmod(idx, cols)
        cell = sheet.crop((xs[col], ys[row], xs[col+1], ys[row+1]))
        cell = remove_checker(cell, palette)
        cell = keep_main(cell)
        cell = fit(cell)
        cell.save(
            PLAYER / f"player_{kind}_{idx+1:02d}.webp",
            "WEBP", lossless=True, quality=100, method=6
        )


def validate():
    for kind, (_,_,_,expected) in SHEETS.items():
        fs = sorted(PLAYER.glob(f"player_{kind}_[0-9][0-9].webp"))
        if len(fs) != expected:
            raise RuntimeError(f"{kind}: {len(fs)} != {expected}")
        for p in fs:
            im = Image.open(p).convert("RGBA")
            a = np.asarray(im)[:,:,3]
            if im.size != (192,192):
                raise RuntimeError(f"{p.name}: wrong size")
            if np.mean(a < 8) < 0.35:
                raise RuntimeError(f"{p.name}: background still too opaque")
            if np.mean(a > 20) < 0.02:
                raise RuntimeError(f"{p.name}: player missing")
            corners = np.concatenate((a[:5,:5].ravel(),a[:5,-5:].ravel(),a[-5:,:5].ravel(),a[-5:,-5:].ravel()))
            if corners.max() > 20:
                raise RuntimeError(f"{p.name}: corner background remains")


def cleanup():
    for p in (
        ROOT/"scripts"/"repair_player_colorkey.py",
        ROOT/".github"/"workflows"/"repair-player-colorkey.yml",
    ):
        if p.exists():
            p.unlink()


with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    for kind,(name,cols,rows,count) in SHEETS.items():
        src=td/name
        restore(name,src)
        build(kind,src,cols,rows,count)

validate()
cleanup()
print("OK: exact checkerboard colors removed; run=25 attack=20.")
