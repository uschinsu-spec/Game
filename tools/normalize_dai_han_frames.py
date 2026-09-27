"""Normalize Dai Han Dao NPC frames on a 128 px canvas.

Keep the drawn poses and their relative motion. Apply one scale to every
frame, centered on the same ground anchor, so blade effects have safe margins
without making the character grow and shrink between animation frames.
"""

from pathlib import Path
from shutil import copy2

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / "assets/player/NPC/Dai_Han_Dao/Frames_128"
BACKUP = ROOT / "assets/player/NPC/Dai_Han_Dao/Frames_128_original"
SCALE = 0.92
CANVAS = (128, 128)
GROUND = (64, 116)


def main():
    BACKUP.mkdir(exist_ok=True)
    for path in sorted(FRAMES.glob("dai_han_3d_*.png")):
        source = BACKUP / path.name
        if not source.exists():
            copy2(path, source)
        image = Image.open(source).convert("RGBA")
        if image.size != CANVAS:
            raise ValueError(f"Unexpected dimensions: {path} {image.size}")
        new_size = tuple(round(value * SCALE) for value in CANVAS)
        sprite = image.resize(new_size, Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", CANVAS)
        x = round(GROUND[0] - GROUND[0] * SCALE)
        y = round(GROUND[1] - GROUND[1] * SCALE)
        canvas.alpha_composite(sprite, (x, y))
        bbox = canvas.getbbox()
        if bbox:
            aligned = Image.new("RGBA", CANVAS)
            aligned.alpha_composite(canvas, (0, GROUND[1] - bbox[3]))
            canvas = aligned
        canvas.save(path, optimize=True)


if __name__ == "__main__":
    main()
