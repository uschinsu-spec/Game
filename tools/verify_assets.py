"""Validation of all WebP game assets and GitHub Pages entrypoints."""
from pathlib import Path
import json
try:
    from PIL import Image
except ImportError:
    Image = None

ROOT = Path(__file__).resolve().parents[1]
webp_files = {
    'VFX/basic_attack_slash.webp': (256, 256),
    'NPC/npc_truong_thon.webp': (448, 448),
    'MAP/map.webp': (1672, 941),
    'MAP/map2.webp': (1672, 941),
    'PLAYER/player.webp': (1920, 432),
    'NPC/NPC1.webp': (1920, 432),
    'NPC/NPC2.webp': (1920, 432),
    'NPC/NPC3.webp': (1920, 432),
    'NPC/NPC4.webp': (1920, 432),
    'NPC/NPC5.webp': (1920, 432),
    'NPC/NPC6.webp': (1920, 432),
    'NPC/NPC7.webp': (1920, 216),
    'NPC/NPC8.webp': (1920, 216),
    'VFX/luyen_khi_9he_7frame.webp': (1774, 887),
    'VFX/frame_7.webp': (140, 140),
    'UI/avatar.webp': (128, 128),
}
enemy_data = json.loads((ROOT/'src/data/enemies.json').read_text(encoding='utf-8'))
for enemy in enemy_data['enemies'].values():
    webp_files[enemy['path']+'.webp'] = (enemy['columns']*enemy_data['animation']['frameSize'], enemy_data['animation']['rows']*enemy_data['animation']['frameSize'])

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
