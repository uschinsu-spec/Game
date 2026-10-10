"""Validation of all WebP game assets and GitHub Pages entrypoints."""
from pathlib import Path
try:
    from PIL import Image
except ImportError:
    Image = None

ROOT = Path(__file__).resolve().parents[1]
webp_files = {
    'map.webp': (1672, 941),
    'map2.webp': (1672, 941),
    'player.webp': (1920, 432),
    'NPC1.webp': (1920, 432),
    'NPC2.webp': (1920, 432),
    'luyen_khi_9he_7frame.webp': (1774, 887),
    'frame_7.webp': (140, 140),
    'wolf.webp': (1408, 352),
    'deer.webp': (1408, 352),
    'avatar.webp': (128, 128),
}
for asset in sorted((ROOT / 'assets' / 'webp' / 'MAP').glob('*.webp')):
    webp_files['MAP/' + asset.name] = (1672, 941)

errors = []
for name, (w, h) in webp_files.items():
    f = ROOT / 'assets' / 'webp' / name
    if not f.is_file():
        errors.append(f'missing WEBP: {name}')
        continue
    data = f.read_bytes()
    if len(data) < 12 or data[:4] != b'RIFF' or data[8:12] != b'WEBP':
        errors.append(f'{name}: invalid WebP header')
        continue
    if Image:
        with Image.open(f) as im:
            if im.size != (w, h):
                errors.append(f'{name}: expected {w}x{h}, got {im.size[0]}x{im.size[1]}')
            print(f'OK {name}: {im.size[0]}x{im.size[1]}, format={im.format}, size={len(data)/1024:.1f} KB')
    else:
        print(f'OK {name}: {len(data)/1024:.1f} KB (valid WebP RIFF)')

for name in ['index.html', 'src/main.js', 'src/game.js', 'src/style.css', '.nojekyll']:
    if not (ROOT / name).is_file():
        errors.append(f'missing {name}')

if errors:
    raise SystemExit('ASSET CHECK FAILED:\n' + '\n'.join(errors))
print('PASS: all WebP game assets and static site files are present and verified.')
