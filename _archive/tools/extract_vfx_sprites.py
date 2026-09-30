import os
import numpy as np
from PIL import Image

def extract_perfect_vfx():
    img1_path = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\vfx_xianxia_elemental_spells_1790494837815.jpg"
    img2_path = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\vfx_xianxia_ultimate_spells_1790494859061.jpg"
    
    out_dir_skills = r"H:\GOOGLE DRIVER\GAME\assets\vfx\skills"
    out_dir_ult = r"H:\GOOGLE DRIVER\GAME\assets\vfx\ultimates"
    
    os.makedirs(out_dir_skills, exist_ok=True)
    os.makedirs(out_dir_ult, exist_ok=True)
    
    # --- 1. Skills (Sheet 1) ---
    img1 = Image.open(img1_path).convert('RGBA')
    w1, h1 = img1.size
    cw1, ch1 = w1 // 4, h1 // 2
    
    skills_map = [
        ('kim', 0, 0), ('hoa', 0, 1), ('thuy', 0, 2), ('tho', 0, 3),
        ('moc', 1, 0), ('phong', 1, 1), ('loi', 1, 2), ('ly', 1, 3)
    ]
    
    for name, r, c in skills_map:
        x1 = c * cw1 + 6
        x2 = (c + 1) * cw1 - 6
        y1 = r * ch1 + int(ch1 * 0.24)
        y2 = (r + 1) * ch1 - 6
        
        crop = img1.crop((x1, y1, x2, y2))
        save_optimized_vfx(crop, os.path.join(out_dir_skills, f'vfx_{name}.png'))
        
    # --- 2. Ultimates (Sheet 2) ---
    img2 = Image.open(img2_path).convert('RGBA')
    w2, h2 = img2.size
    cw2, ch2 = w2 // 4, h2 // 2
    
    ult_boxes = {
        'kim': (0 * cw2 + 4, 0 * ch2 + 4, 1 * cw2 - 4, 1 * ch2 - 4),           # Orbiting Tru Tien Sword Array
        'hoa': (1 * cw2 + 4, 0 * ch2 + 4, 2 * cw2 - 4, 1 * ch2 - 4),           # Cosmic Fire Meteor Strike
        'thuy': (2 * cw2 + 4, 0 * ch2 + int(ch2 * 0.45), 3 * cw2 - 4, 1 * ch2 - 4), # Giant Frost Lotus
        'tho': (3 * cw2 + 4, 0 * ch2 + int(ch2 * 0.25), 4 * cw2 - 4, 1 * ch2 - 4),  # Earth Dragon Fissure
        'moc': (0 * cw2 + 4, 1 * ch2 + 4, 1 * cw2 - 4, 2 * ch2 - int(ch2 * 0.14)), # World Tree
        'phong': (1 * cw2 + 4, 1 * ch2 + 4, 2 * cw2 - 4, 1 * ch2 + int(ch2 * 0.38)), # Void Chaos Vortex
        'loi': (2 * cw2 + 4, 1 * ch2 + 4, 3 * cw2 - 4, 2 * ch2 - int(ch2 * 0.14)),   # Purple Tribulation Lightning
        'ly': (3 * cw2 + 4, 1 * ch2 + 4, 4 * cw2 - 4, 2 * ch2 - int(ch2 * 0.14))     # Asura Divine Fist
    }
    
    for name, box in ult_boxes.items():
        crop = img2.crop(box)
        save_optimized_vfx(crop, os.path.join(out_dir_ult, f'vfx_{name}.png'))

def save_optimized_vfx(crop_img, out_path):
    arr = np.array(crop_img).astype(np.float32)
    r_c, g_c, b_c = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    max_c = np.maximum(np.maximum(r_c, g_c), b_c)
    
    # Smooth thresholding for pure black transparency
    threshold = 28.0
    alpha = np.clip((max_c - threshold) / (220.0 - threshold) * 255.0, 0, 255)
    
    # Non-linear boost for magical glow
    alpha_norm = alpha / 255.0
    alpha_boosted = np.power(alpha_norm, 0.80) * 255.0
    
    # Color un-multiplying so colors stay 100% vibrant without dark halo
    safe_a = np.maximum(alpha_boosted / 255.0, 0.08)
    arr[:, :, 0] = np.clip(r_c / safe_a, 0, 255)
    arr[:, :, 1] = np.clip(g_c / safe_a, 0, 255)
    arr[:, :, 2] = np.clip(b_c / safe_a, 0, 255)
    arr[:, :, 3] = alpha_boosted
    
    out_img = Image.fromarray(arr.astype(np.uint8))
    
    # Auto-trim bounding box of non-empty pixels
    bbox = out_img.getbbox()
    if bbox:
        out_img = out_img.crop(bbox)
        
    # Resize to compact game size: Max dimension 128px (Ultra lightweight, ~15-25KB)
    max_dim = 128
    orig_w, orig_h = out_img.size
    scale = max_dim / max(orig_w, orig_h)
    new_w = max(1, int(orig_w * scale))
    new_h = max(1, int(orig_h * scale))
    out_img = out_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    out_img.save(out_path, optimize=True)
    kb = os.path.getsize(out_path) / 1024
    print(f"Extracted: {out_path} [{new_w}x{new_h}] ({kb:.1f} KB)")

if __name__ == '__main__':
    extract_perfect_vfx()
