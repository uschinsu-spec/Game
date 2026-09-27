"""Build clean 128x64 Luyện Khí frames from the transparent concept sheet.

The concept art has overlapping glows between grid cells. Its first column has
one complete, separate projectile per element, so use that silhouette as the
source and animate it within a safe, centered cell instead of slicing through
the overlapping middle columns.
"""

from collections import deque
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/vfx/luyen_khi_9he_7frame.png"
ELEMENTS = ["sword", "fire", "lightning", "metal", "water", "wind", "wood", "earth", "physical"]
# Connected silhouettes in the first column of the generated sheet. Some
# cross a nominal row boundary, so these bounds follow the actual artwork.
BOUNDS = [
    (24, 29, 50, 16), (40, 82, 42, 23), (29, 140, 58, 28),
    (26, 204, 58, 19), (32, 262, 55, 21), (24, 317, 63, 34),
    (33, 384, 57, 26), (31, 445, 54, 24), (38, 506, 58, 38),
]
SCALES = [1.25, 1.45, 1.62, 1.78, 1.70, 1.50, 1.30]
BRIGHTNESS = [0.83, 0.94, 1.04, 1.14, 1.10, 0.96, 0.82]


def main():
    sheet = Image.open(SOURCE).convert("RGBA")
    assert sheet.size == (896, 576)
    for row, element in enumerate(ELEMENTS):
        x, y, width, height = BOUNDS[row]
        src = sheet.crop((max(0, x - 6), max(0, y - 6), x + width + 6, y + height + 6))
        src = keep_largest_shape(src)
        box = src.getbbox()
        if box is None:
            raise ValueError(f"No artwork for {element}")
        src = src.crop(box)
        for frame, scale in enumerate(SCALES):
            w = min(112, round(src.width * scale))
            h = min(54, round(src.height * scale))
            sprite = src.resize((w, h), Image.Resampling.LANCZOS)
            rgb = ImageEnhance.Brightness(sprite.convert("RGB")).enhance(BRIGHTNESS[frame])
            rgb.putalpha(sprite.getchannel("A"))
            canvas = Image.new("RGBA", (128, 64))
            canvas.alpha_composite(rgb, ((128 - w) // 2, (64 - h) // 2))
            name = f"kim_1_frame_{frame}.png" if element == "sword" else f"frame_{frame}.png"
            canvas.save(ROOT / "assets/vfx" / element / name, optimize=True)


def keep_largest_shape(img):
    """Remove detached bright pixels that spilled from adjacent rows."""
    alpha = img.getchannel("A")
    w, h = img.size
    pixels = alpha.load()
    seen = set()
    groups = []
    for y in range(h):
        for x in range(w):
            if (x, y) in seen or pixels[x, y] < 65:
                continue
            todo = deque([(x, y)])
            seen.add((x, y))
            group = []
            while todo:
                px, py = todo.popleft()
                group.append((px, py))
                for nx, ny in ((px-1, py), (px+1, py), (px, py-1), (px, py+1)):
                    if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and pixels[nx, ny] >= 65:
                        seen.add((nx, ny))
                        todo.append((nx, ny))
            groups.append(group)
    if not groups:
        return img
    mask = Image.new("L", img.size)
    mp = mask.load()
    for x, y in max(groups, key=len):
        mp[x, y] = 255
    mask = mask.filter(ImageFilter.MaxFilter(9))
    cleaned = img.copy()
    cleaned.putalpha(Image.composite(alpha, Image.new("L", img.size), mask))
    return cleaned


if __name__ == "__main__":
    main()
