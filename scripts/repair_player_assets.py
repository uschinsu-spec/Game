from pathlib import Path
from collections import Counter, deque
import subprocess
import tempfile
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PLAYER = ROOT / "assets" / "characters" / "player"
SOURCE_REF = "23859aeed4dd27e52469ddaa12025d13265a693b"
FRAME_OUT = 192

SHEETS = {
    "attack": ("IMG_7539.png", 5, 4, 20),
    "run": ("IMG_7540.png", 5, 5, 25),
}


def historical_png(name: str, dst: Path):
    spec = f"{SOURCE_REF}:assets/characters/player/{name}"
    with dst.open("wb") as f:
        subprocess.run(["git", "show", spec], stdout=f, check=True)


def neutral_palette(rgb):
    h, w, _ = rgb.shape
    bw = max(4, min(h, w) // 24)
    border = np.concatenate([
        rgb[:bw].reshape(-1, 3),
        rgb[-bw:].reshape(-1, 3),
        rgb[:, :bw].reshape(-1, 3),
        rgb[:, -bw:].reshape(-1, 3),
    ])
    # Checkerboard is neutral grey/white. Quantize slightly to absorb PNG noise.
    q = (border // 4) * 4
    counts = Counter(map(tuple, q.tolist()))
    ranked = [np.array(c, dtype=np.int16) for c, _ in counts.most_common(80)]
    neutral = [c for c in ranked if int(c.max()) - int(c.min()) <= 18]
    if not neutral:
        neutral = ranked
    palette = []
    for c in neutral:
        if all(np.linalg.norm(c - p) >= 12 for p in palette):
            palette.append(c)
        if len(palette) == 2:
            break
    if len(palette) < 2:
        palette = ranked[:2]
    return np.stack(palette).astype(np.int16)


def flood_background(candidate):
    h, w = candidate.shape
    seen = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if candidate[0, x]:
            seen[0, x] = True; q.append((0, x))
        if candidate[h - 1, x] and not seen[h - 1, x]:
            seen[h - 1, x] = True; q.append((h - 1, x))
    for y in range(h):
        if candidate[y, 0] and not seen[y, 0]:
            seen[y, 0] = True; q.append((y, 0))
        if candidate[y, w - 1] and not seen[y, w - 1]:
            seen[y, w - 1] = True; q.append((y, w - 1))
    while q:
        y, x = q.popleft()
        for yy, xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0 <= yy < h and 0 <= xx < w and candidate[yy, xx] and not seen[yy, xx]:
                seen[yy, xx] = True
                q.append((yy, xx))
    return seen


def dilate(mask):
    out = mask.copy()
    out[1:] |= mask[:-1]
    out[:-1] |= mask[1:]
    out[:, 1:] |= mask[:, :-1]
    out[:, :-1] |= mask[:, 1:]
    return out


def remove_checkerboard(cell: Image.Image):
    arr = np.asarray(cell.convert("RGBA")).copy()
    rgb = arr[:, :, :3].astype(np.int16)
    pal = neutral_palette(rgb)
    d0 = np.sqrt(np.sum((rgb - pal[0]) ** 2, axis=2))
    d1 = np.sqrt(np.sum((rgb - pal[1]) ** 2, axis=2))
    dist = np.minimum(d0, d1)

    # The two checker colors form one connected background region.
    bg = flood_background(dist <= 20)
    alpha = arr[:, :, 3].astype(np.float32)
    alpha[bg] = 0

    # Feather only the immediate checker-contaminated edge, not interior clothing.
    ring = dilate(bg) & ~bg
    feather = ring & (dist < 58)
    a = np.clip((dist - 18) / 40 * 255, 0, 255)
    alpha[feather] = np.minimum(alpha[feather], a[feather])

    arr[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def keep_main_component(img: Image.Image):
    arr = np.asarray(img).copy()
    mask = arr[:, :, 3] > 18
    h, w = mask.shape
    seen = np.zeros_like(mask)
    comps = []
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or seen[y, x]:
                continue
            q = deque([(y, x)])
            seen[y, x] = True
            pts = []
            while q:
                yy, xx = q.popleft()
                pts.append((yy, xx))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if not dx and not dy:
                            continue
                        ny, nx = yy + dy, xx + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            q.append((ny, nx))
            comps.append(pts)

    if not comps:
        return img

    cy, cx = h / 2, w / 2
    def score(pts):
        area = len(pts)
        ys = np.fromiter((p[0] for p in pts), dtype=float)
        xs = np.fromiter((p[1] for p in pts), dtype=float)
        dist = np.hypot(xs.mean() - cx, ys.mean() - cy)
        return area / (1 + dist / max(h, w))

    main = max(comps, key=score)
    keep = np.zeros_like(mask)
    ys, xs = zip(*main)
    keep[np.array(ys), np.array(xs)] = True
    # Preserve antialias pixels immediately touching the main silhouette.
    keep = dilate(keep)
    arr[:, :, 3][~keep] = 0
    return Image.fromarray(arr, "RGBA")


def fit_192(img: Image.Image):
    w, h = img.size
    scale = min(FRAME_OUT / w, FRAME_OUT / h)
    nw = max(1, round(w * scale))
    nh = max(1, round(h * scale))
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (FRAME_OUT, FRAME_OUT), (0, 0, 0, 0))
    canvas.alpha_composite(img, ((FRAME_OUT - nw) // 2, (FRAME_OUT - nh) // 2))
    return canvas


def build(kind, png_path, cols, rows, count):
    sheet = Image.open(png_path).convert("RGBA")
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
            cell = remove_checkerboard(cell)
            cell = keep_main_component(cell)
            cell = fit_192(cell)
            cell.save(
                PLAYER / f"player_{kind}_{idx:02d}.webp",
                "WEBP", lossless=True, quality=100, method=6
            )


def validate():
    for kind, (_, _, _, count) in SHEETS.items():
        frames = sorted(PLAYER.glob(f"player_{kind}_[0-9][0-9].webp"))
        if len(frames) != count:
            raise RuntimeError(f"{kind}: expected {count}, got {len(frames)}")
        for path in frames:
            with Image.open(path).convert("RGBA") as im:
                if im.size != (192, 192):
                    raise RuntimeError(f"{path.name}: wrong size {im.size}")
                alpha = np.asarray(im)[:, :, 3]
                transparent_ratio = float(np.mean(alpha < 8))
                if transparent_ratio < 0.20:
                    raise RuntimeError(f"{path.name}: background still looks opaque ({transparent_ratio:.2%} transparent)")


def cleanup():
    # Keep the game repo clean after this one-shot repair.
    for p in (
        ROOT / "scripts" / "repair_player_assets.py",
        ROOT / ".github" / "workflows" / "repair-player-assets.yml",
    ):
        if p.exists():
            p.unlink()


def main():
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        for kind, (name, cols, rows, count) in SHEETS.items():
            src = td / name
            historical_png(name, src)
            build(kind, src, cols, rows, count)
    validate()
    cleanup()
    print("Player repaired from original PNGs: run 25, attack 20, transparent WebP.")


if __name__ == "__main__":
    main()
