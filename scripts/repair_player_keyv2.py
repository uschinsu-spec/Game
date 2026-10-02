from pathlib import Path
import subprocess, tempfile
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PLAYER = ROOT / "assets" / "characters" / "player"
REF = "23859aeed4dd27e52469ddaa12025d13265a693b"
OUT = 192
PALETTE = np.array([[254,254,254],[198,198,198]], dtype=np.int32)

SHEETS = {
    "attack": ("IMG_7539.png", 20),  # source canvas 5x5; first 20 cells are attack
    "run": ("IMG_7540.png", 25),
}

def restore(name, dst):
    with dst.open("wb") as f:
        subprocess.run(
            ["git","show",f"{REF}:assets/characters/player/{name}"],
            stdout=f, check=True
        )

def checker_key(cell):
    arr = np.asarray(cell.convert("RGBA")).copy()
    rgb = arr[:,:,:3].astype(np.int32)

    d0 = np.sqrt(np.sum((rgb - PALETTE[0])**2, axis=2))
    d1 = np.sqrt(np.sum((rgb - PALETTE[1])**2, axis=2))
    dist = np.minimum(d0, d1)

    # High-confidence checker pixels.
    candidate = (dist <= 72).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(candidate, 8)

    border_labels = np.unique(np.concatenate([
        labels[0,:], labels[-1,:], labels[:,0], labels[:,-1]
    ]))
    border_labels = border_labels[border_labels != 0]
    bg = np.isin(labels, border_labels)

    # Grow only from proven background through near-neutral antialias pixels.
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    mean = rgb.mean(axis=2)
    for _ in range(4):
        ring = cv2.dilate(bg.astype(np.uint8), np.ones((3,3),np.uint8), iterations=1).astype(bool) & ~bg
        growable = (dist <= 115) | ((spread <= 24) & (mean >= 155))
        add = ring & growable
        if not add.any():
            break
        bg |= add

    # Foreground candidates are everything not proven background.
    fg = (~bg).astype(np.uint8)
    n, flabels, fstats, fcent = cv2.connectedComponentsWithStats(fg, 8)
    if n <= 1:
        raise RuntimeError("No foreground found")

    h,w = fg.shape
    cx,cy = w/2,h/2
    best = None
    best_score = -1
    for lab in range(1,n):
        area = int(fstats[lab,cv2.CC_STAT_AREA])
        if area < 20:
            continue
        x,y = fcent[lab]
        center_dist = np.hypot(x-cx,y-cy)
        score = area / (1 + center_dist/max(w,h))
        if score > best_score:
            best_score = score
            best = lab

    if best is None:
        raise RuntimeError("No main foreground component")

    main = flabels == best

    # Preserve meaningful detached pieces very close to the main player:
    # hair tips, belt tails, robe tips.
    ys,xs = np.where(main)
    x0,x1 = xs.min(),xs.max()
    y0,y1 = ys.min(),ys.max()
    keep = main.copy()
    main_area = int(main.sum())

    for lab in range(1,n):
        if lab == best:
            continue
        area = int(fstats[lab,cv2.CC_STAT_AREA])
        if area < max(14, int(main_area*0.0025)):
            continue
        lx = int(fstats[lab,cv2.CC_STAT_LEFT])
        ly = int(fstats[lab,cv2.CC_STAT_TOP])
        lw = int(fstats[lab,cv2.CC_STAT_WIDTH])
        lh = int(fstats[lab,cv2.CC_STAT_HEIGHT])
        dx = max(x0-(lx+lw), lx-x1, 0)
        dy = max(y0-(ly+lh), ly-y1, 0)
        if dx <= 3 and dy <= 3:
            keep |= flabels == lab

    # Smooth 1px silhouette edge without bringing checker blocks back.
    alpha = (keep.astype(np.uint8)*255)
    alpha = cv2.GaussianBlur(alpha, (3,3), 0.55)
    alpha[alpha < 20] = 0
    alpha[alpha > 235] = 255

    arr[:,:,3] = alpha
    return Image.fromarray(arr, "RGBA")

def fit(img):
    w,h = img.size
    scale = min(OUT/w, OUT/h)
    nw,nh = max(1,round(w*scale)),max(1,round(h*scale))
    img = img.resize((nw,nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA",(OUT,OUT),(0,0,0,0))
    canvas.alpha_composite(img,((OUT-nw)//2,(OUT-nh)//2))
    return canvas

def build(kind, src, count):
    sheet = Image.open(src).convert("RGBA")
    w,h = sheet.size
    xs=[round(i*w/5) for i in range(6)]
    ys=[round(i*h/5) for i in range(6)]

    for p in PLAYER.glob(f"player_{kind}_[0-9][0-9].webp"):
        p.unlink()

    for idx in range(count):
        row,col=divmod(idx,5)
        cell=sheet.crop((xs[col],ys[row],xs[col+1],ys[row+1]))
        out=fit(checker_key(cell))
        out.save(
            PLAYER/f"player_{kind}_{idx+1:02d}.webp",
            "WEBP",lossless=True,quality=100,method=4
        )

with tempfile.TemporaryDirectory() as td:
    td=Path(td)
    for kind,(name,count) in SHEETS.items():
        src=td/name
        restore(name,src)
        build(kind,src,count)

print("OK: rebuilt directly from original sheets using checker-key foreground extraction.")
