"""Validate runtime assets or explicitly import a sheet into the current layout.

No arguments: validate only. Import example:
python tools/build_assets.py --name player --source new_player.png --replace
"""
import argparse
import json
from pathlib import Path
import subprocess
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WEBP = ROOT / 'assets' / 'webp'
ENEMY_DATA = json.loads((ROOT / 'src/data/enemies.json').read_text(encoding='utf-8'))
ASSET_PATHS = {
    **{id: entry['path'] for id, entry in ENEMY_DATA['enemies'].items()},
    "map": "MAP/map",
    "map2": "MAP/map2",
    "player": "PLAYER/player",
    "NPC1": "NPC/NPC1",
    "NPC2": "NPC/NPC2",
    "NPC3": "NPC/NPC3",
    "NPC4": "NPC/NPC4",
    "NPC5": "NPC/NPC5",
    "NPC6": "NPC/NPC6",
    "NPC7": "NPC/NPC7",
    "NPC8": "NPC/NPC8",
    "frame_7": "VFX/frame_7",
    "basic_attack_slash": "VFX/basic_attack_slash",
    "luyen_khi_9he_7frame": "VFX/luyen_khi_9he_7frame",
    "avatar": "UI/avatar"
}
# (native output size, columns, rows); art is scaled per cell without recropping.
LAYOUTS = {
    **{id: ((entry['columns']*ENEMY_DATA['animation']['frameSize'], ENEMY_DATA['animation']['rows']*ENEMY_DATA['animation']['frameSize']), entry['columns'], ENEMY_DATA['animation']['rows']) for id, entry in ENEMY_DATA['enemies'].items()},
    'player': ((1920, 432), 10, 4),
    'NPC1': ((1920, 432), 10, 4),
    'NPC2': ((1920, 432), 10, 4),
    'NPC3': ((1920, 432), 10, 4),
    'NPC4': ((1920, 432), 10, 4),
    'NPC5': ((1920, 432), 10, 4),
    'NPC6': ((1920, 432), 10, 4),
    'NPC7': ((1920, 216), 10, 2),
    'NPC8': ((1920, 216), 10, 2),
    'map': ((1672, 941), 1, 1),
    'map2': ((1672, 941), 1, 1),
    'avatar': ((128, 128), 1, 1),
}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--name', choices=LAYOUTS)
    parser.add_argument('--source', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--replace', action='store_true', help='Allow replacing an existing output')
    args = parser.parse_args()
    if not args.name and not args.source:
        if args.output or args.replace:
            parser.error('--output/--replace requires --name and --source')
        return subprocess.call([sys.executable, str(ROOT / 'tools' / 'verify_assets.py')])
    if not args.name or not args.source:
        parser.error('Provide both --name and --source')
    target = (args.output or WEBP / (ASSET_PATHS[args.name] + '.webp')).resolve()
    source = args.source.resolve()
    if source == target:
        parser.error('Source and output must be different files')
    if target.suffix.lower() != '.webp':
        parser.error('Output must be a .webp file')
    if target.exists() and not args.replace:
        parser.error('Output exists; use --replace to overwrite it explicitly')
    size, cols, rows = LAYOUTS[args.name]
    with Image.open(source) as image:
        if image.width % cols or image.height % rows:
            parser.error(f'Source must divide evenly into {rows} rows x {cols} columns')
        if abs(image.width / image.height - size[0] / size[1]) > .005:
            parser.error(f'Incorrect aspect ratio; expected {size[0]}:{size[1]} with {rows} rows x {cols} columns')
        image = image.convert('RGBA')
        sheet = Image.new('RGBA', size)
        sw, sh = image.width // cols, image.height // rows
        dw, dh = size[0] // cols, size[1] // rows
        for row in range(rows):
            for col in range(cols):
                cell = image.crop((col*sw, row*sh, (col+1)*sw, (row+1)*sh))
                cell = cell.resize((dw, dh), Image.Resampling.LANCZOS)
                sheet.paste(cell, (col*dw, row*dh))
    target.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(target, format='WEBP', quality=85, alpha_quality=100, method=6)
    print(f'Saved {target}: {size[0]}x{size[1]}, {rows} rows x {cols} columns')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
