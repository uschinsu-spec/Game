import os
import numpy as np
from PIL import Image

icons_dir = r'H:\GOOGLE DRIVER\GAME\assets\icons'

atlases = [
    ('skill_icons.png', 96, 96, 10),
    ('items_atlas.png', 80, 80, 18),
    ('stage_icons.png', 72, 72, 12)
]

for name, fw, fh, count in atlases:
    p = os.path.join(icons_dir, name)
    img = Image.open(p).convert('RGBA')
    print(f"=== {name} ({fw}x{fh}, {count} frames) ===")
    for i in range(count):
        cell = img.crop((i * fw, 0, (i + 1) * fw, fh))
        arr = np.array(cell)
        alpha = arr[:, :, 3]
        v_active = np.where(np.sum(alpha > 10, axis=1) > 0)[0]
        h_active = np.where(np.sum(alpha > 10, axis=0) > 0)[0]
        
        if len(v_active) > 0 and len(h_active) > 0:
            top, bot = v_active[0], v_active[-1]
            left, right = h_active[0], h_active[-1]
            w_act, h_act = right - left + 1, bot - top + 1
            
            bleeds = []
            if left <= 1: bleeds.append('LEFT')
            if right >= fw - 2: bleeds.append('RIGHT')
            if top <= 1: bleeds.append('TOP')
            if bot >= fh - 2: bleeds.append('BOTTOM')
            bleed_str = f" [BLEED: {', '.join(bleeds)}]" if bleeds else ""
            print(f"  Frame {i:2d}: content=[x: {left:2d}..{right:2d} (w={w_act:2d}), y: {top:2d}..{bot:2d} (h={h_act:2d})]{bleed_str}")
        else:
            print(f"  Frame {i:2d}: EMPTY")
