from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PLAYER = ROOT / "assets" / "characters" / "player"
PALETTE = [
    np.array([254, 254, 254], dtype=np.int32),
    np.array([198, 198, 198], dtype=np.int32),
]


def remove_checker_blocks(img):
    arr = np.asarray(img.convert("RGBA")).copy()
    rgb = arr[:, :, :3].astype(np.int32)
    alpha = arr[:, :, 3].copy()

    dist = np.minimum.reduce([
        np.sqrt(np.sum((rgb - p) ** 2, axis=2)) for p in PALETTE
    ])
    candidate = ((dist <= 42) & (alpha > 12)).astype(np.uint8)

    # Delete only sizeable flat checker-color islands, not tiny similarly-colored
    # highlights on the robe/armor.
    n, labels, stats, _ = cv2.connectedComponentsWithStats(candidate, 8)
    for lab in range(1, n):
        area = int(stats[lab, cv2.CC_STAT_AREA])
        width = int(stats[lab, cv2.CC_STAT_WIDTH])
        height = int(stats[lab, cv2.CC_STAT_HEIGHT])
        if area >= 18 and (width >= 4 or height >= 4):
            alpha[labels == lab] = 0

    # Checker anti-alias fringe: once the flat core is gone, clear nearby
    # neutral pixels immediately bordering transparent regions.
    transparent = (alpha == 0).astype(np.uint8)
    near_bg = cv2.dilate(transparent, np.ones((3,3), np.uint8), iterations=1).astype(bool)
    fringe = near_bg & (dist <= 68) & (alpha > 0)
    alpha[fringe] = 0

    # After removing checker cores, keep the principal connected silhouette.
    binary = (alpha > 24).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, 8)
    if n > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        main = int(np.argmax(areas)) + 1
        main_area = int(stats[main, cv2.CC_STAT_AREA])

        # Preserve main player plus substantial nearby components (belt ribbons,
        # hair tips) while dropping thin rectangular remnants.
        main_mask = labels == main
        yx = np.argwhere(main_mask)
        y0, x0 = yx.min(axis=0)
        y1, x1 = yx.max(axis=0)
        keep = main_mask.copy()

        for lab in range(1, n):
            if lab == main:
                continue
            area = int(stats[lab, cv2.CC_STAT_AREA])
            if area < max(10, main_area * 0.002):
                continue
            sx = int(stats[lab, cv2.CC_STAT_LEFT])
            sy = int(stats[lab, cv2.CC_STAT_TOP])
            sw = int(stats[lab, cv2.CC_STAT_WIDTH])
            sh = int(stats[lab, cv2.CC_STAT_HEIGHT])
            # Only keep detached pieces sitting very close to the player bbox.
            dx = max(x0 - (sx + sw), sx - x1, 0)
            dy = max(y0 - (sy + sh), sy - y1, 0)
            if dx <= 5 and dy <= 5:
                keep |= labels == lab

        # Preserve one-pixel antialias edge around accepted shape.
        expanded = cv2.dilate(keep.astype(np.uint8), np.ones((3,3), np.uint8), iterations=1).astype(bool)
        alpha[~expanded] = 0

    alpha[alpha < 20] = 0
    arr[:, :, 3] = alpha
    return Image.fromarray(arr, "RGBA")


def clean_file(path):
    img = Image.open(path).convert("RGBA")
    img = remove_checker_blocks(img)
    img.save(path, "WEBP", lossless=True, quality=100, method=4)


for path in sorted(PLAYER.glob("player_run_[0-9][0-9].webp")):
    clean_file(path)
for path in sorted(PLAYER.glob("player_attack_[0-9][0-9].webp")):
    clean_file(path)

print("Cleaned checker blocks from player frames.")
