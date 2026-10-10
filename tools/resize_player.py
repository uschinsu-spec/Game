"""Reduce the current 4x10 player sheet to 75%, preserving frame boundaries.

Idempotent: already resized sheets are left untouched.
"""
from pathlib import Path
from PIL import Image

path = Path(__file__).resolve().parents[1] / 'assets/webp/PLAYER/player.webp'
with Image.open(path) as source:
    if source.size == (1920, 432):
        print('Player is already 1920x432; no change.')
        raise SystemExit(0)
    if source.size != (2560, 576):
        raise SystemExit(f'Unexpected player sheet size: {source.size}')
    sheet = Image.new('RGBA', (1920, 432))
    for row in range(4):
        for col in range(10):
            frame = source.crop((col*256, row*144, (col+1)*256, (row+1)*144))
            frame = frame.resize((192, 108), Image.Resampling.LANCZOS)
            sheet.paste(frame, (col*192, row*108))
before = path.stat().st_size
sheet.save(path, format='WEBP', quality=85, alpha_quality=100, method=6)
with Image.open(path) as result:
    assert result.size == (1920, 432) and result.mode == 'RGBA'
print(f'Player: 2560x576 -> 1920x432; {before:,} -> {path.stat().st_size:,} bytes')
