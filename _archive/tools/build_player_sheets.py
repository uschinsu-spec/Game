"""Cut the generated 8x8 art into aligned 128px frames and Phaser sheets."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
FRAME = 128
ART = 118
FLIPPED_ROWS = {5: 3, 6: 2, 7: 1}


def build(action: str) -> None:
    source = Image.open(ASSETS / f"player_{action}_source_8x8.png").convert("RGBA")
    sheet = Image.new("RGBA", (FRAME * 8, FRAME * 8))
    frame_dir = ASSETS / "player_frames" / action
    frame_dir.mkdir(parents=True, exist_ok=True)

    for row in range(8):
        source_row = FLIPPED_ROWS.get(row, row)
        for column in range(8):
            x0 = round(column * source.width / 8) + 4
            x1 = round((column + 1) * source.width / 8) - 4
            y0 = round(source_row * source.height / 8) + 4
            y1 = round((source_row + 1) * source.height / 8) - 4
            art = source.crop((x0, y0, x1, y1))
            art = art.resize((ART, ART), Image.Resampling.LANCZOS)
            if row in FLIPPED_ROWS:
                art = art.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            frame = Image.new("RGBA", (FRAME, FRAME))
            frame.alpha_composite(art, ((FRAME - ART) // 2, (FRAME - ART) // 2))
            sheet.alpha_composite(frame, (column * FRAME, row * FRAME))
            frame.save(frame_dir / f"{row:02d}_{column:02d}.png")

    sheet.save(ASSETS / f"player_{action}_8x8.png")


for name in ("idle", "attack"):
    build(name)
