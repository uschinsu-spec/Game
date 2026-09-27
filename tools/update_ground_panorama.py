import os
import numpy as np
from PIL import Image, ImageEnhance

BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'
ASSETS_DIR = r'h:\GOOGLE DRIVER\GAME\assets'

def update_panorama():
    bg_file = None
    for f in os.listdir(BRAIN_DIR):
        if f.startswith('xianxia_ground_arena') and (f.endswith('.jpg') or f.endswith('.png')):
            bg_file = os.path.join(BRAIN_DIR, f)
            break
            
    assert bg_file is not None, "Ground arena image not found"
    print(f"Loading ground arena from: {bg_file}")
    
    img = Image.open(bg_file).convert('RGB')
    target_h = 960
    
    w_seamless = 1600
    overlap = 200 # 200px smooth S-curve blend
    base_w = w_seamless + overlap # 1800
    
    resized = img.resize((base_w, target_h), Image.Resampling.LANCZOS)
    arr = np.array(resized, dtype=float)
    
    seamless_unit = np.zeros((target_h, w_seamless, 3), dtype=float)
    seamless_unit[:, :w_seamless, :] = arr[:, :w_seamless, :]
    
    # S-curve smooth cosine alpha blending
    for i in range(overlap):
        u = (1.0 - np.cos(np.pi * i / overlap)) / 2.0
        left_px = arr[:, i, :]
        right_px = arr[:, w_seamless + i, :]
        seamless_unit[:, i, :] = (1.0 - u) * right_px + u * left_px
        
    seamless_unit = np.clip(seamless_unit, 0, 255).astype(np.uint8)
    unit_img = Image.fromarray(seamless_unit)
    
    target_w = 3200
    final_panorama = Image.new('RGB', (target_w, target_h))
    final_panorama.paste(unit_img, (0, 0))
    final_panorama.paste(unit_img, (w_seamless, 0))
    
    # Enhance vibrance & contrast
    enhancer = ImageEnhance.Color(final_panorama)
    final_panorama = enhancer.enhance(1.08)
    final_panorama = ImageEnhance.Brightness(final_panorama).enhance(1.02)
    final_panorama = ImageEnhance.Contrast(final_panorama).enhance(1.04)
    
    out_dir = os.path.join(ASSETS_DIR, 'environment')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'thanh_van_thon_panorama.png')
    final_panorama.save(out_path, quality=95)
    final_panorama.save(os.path.join(out_dir, 'valley_panorama.png'), quality=95)
    final_panorama.save(os.path.join(ASSETS_DIR, 'thanh_van_thon_panorama.png'), quality=95)
    print(f"Saved seamless grounded panorama to: {out_path} ({final_panorama.size})")

if __name__ == '__main__':
    update_panorama()

