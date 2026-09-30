"""
Process new VFX images: remove dark backgrounds, trim to bounding box, optimize size.
Input: JPG files from artifacts dir
Output: PNG transparent files in game vfx dirs
"""

import os
import numpy as np
from PIL import Image

ARTIFACTS_DIR = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92"
GAME_DIR = r"H:\GOOGLE DRIVER\GAME\assets\vfx"
MAX_DIM = 130

def remove_bg_and_trim(img_path, out_path, dark_threshold=30):
    """Remove checker/dark background, trim to content bounding box, resize."""
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img, dtype=np.float32)
    
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # If it's a JPEG (no alpha), we need to detect and remove the checkerboard or dark background
    # Check if original had alpha channel (PNG with transparency)
    original = Image.open(img_path)
    has_alpha = original.mode == 'RGBA'
    
    if has_alpha:
        # Already has transparency - just trim and resize
        pass
    else:
        # Detect background: checkerboard gray (#888 ~= 136) or dark solid
        # Checkerboard pattern: alternating ~119 and ~153 gray
        # Dark background: R,G,B all < 50
        
        # Method: pixels that are "near gray" (low saturation) AND (medium-light gray OR dark)
        # are background. Content pixels have high saturation or are very bright.
        
        max_rgb = np.maximum(r, np.maximum(g, b))
        min_rgb = np.minimum(r, np.minimum(g, b))
        saturation = np.where(max_rgb > 0, (max_rgb - min_rgb) / max_rgb, 0)
        brightness = max_rgb / 255.0
        
        # Checkerboard detection: gray values between 100-170, very low saturation
        is_checker = (saturation < 0.08) & (brightness > 0.35) & (brightness < 0.75)
        
        # Dark solid background: all channels < dark_threshold
        is_dark_bg = (r < dark_threshold) & (g < dark_threshold) & (b < dark_threshold)
        
        # Combined background mask
        is_bg = is_checker | is_dark_bg
        
        # Set background pixels to transparent
        arr[:,:,3] = np.where(is_bg, 0, 255)
        
        # Un-multiply: make colors brighter for ADD blend mode
        # (restore colors that were darkened by premult or background leakage)
        mask_fg = ~is_bg
        if mask_fg.any():
            # For bright VFX on ADD mode: keep as-is, just ensure transparency
            pass
    
    img_result = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    # Trim to bounding box of non-transparent pixels
    bbox = img_result.getbbox()
    if bbox:
        img_result = img_result.crop(bbox)
    
    # Resize to max dimension 130px maintaining aspect ratio
    w, h = img_result.size
    if max(w, h) > MAX_DIM:
        scale = MAX_DIM / max(w, h)
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        img_result = img_result.resize((new_w, new_h), Image.LANCZOS)
    
    img_result.save(out_path, 'PNG', optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  OK {os.path.basename(out_path)}: {img_result.size} -> {size_kb:.1f}KB")
    return img_result.size

# Mapping: artifact filename -> output path
VFX_JOBS = [
    # Mid-tier skills (Trúc Cơ level)
    ("vfx_mid_kim_1790495424395.jpg", f"{GAME_DIR}/skills/vfx_mid_kim.png"),
    ("vfx_mid_hoa_1790495617106.jpg", f"{GAME_DIR}/skills/vfx_mid_hoa.png"),
    ("vfx_mid_thuy_1790495630446.jpg", f"{GAME_DIR}/skills/vfx_mid_thuy.png"),
    ("vfx_mid_tho_1790495646604.jpg", f"{GAME_DIR}/skills/vfx_mid_tho.png"),
    ("vfx_mid_moc_1790495673506.jpg", f"{GAME_DIR}/skills/vfx_mid_moc.png"),
    ("vfx_mid_phong_1790495688591.jpg", f"{GAME_DIR}/skills/vfx_mid_phong.png"),
    ("vfx_mid_loi_1790495701001.jpg", f"{GAME_DIR}/skills/vfx_mid_loi.png"),
    ("vfx_mid_ly_1790495715067.jpg", f"{GAME_DIR}/skills/vfx_mid_ly.png"),
    # Special VFX (Heal, Shield, Speed, Divine)
    ("vfx_heal_moc_1790495742332.jpg", f"{GAME_DIR}/skills/vfx_heal.png"),
    ("vfx_shield_tho_1790495755407.jpg", f"{GAME_DIR}/skills/vfx_shield.png"),
    ("vfx_speed_phong_1790495768273.jpg", f"{GAME_DIR}/skills/vfx_speed.png"),
    ("vfx_divine_ult_1790495784025.jpg", f"{GAME_DIR}/ultimates/vfx_divine.png"),
]

print("Processing new VFX assets...")
print("Source:", ARTIFACTS_DIR)
print("Output:", GAME_DIR)
print()

success = 0
errors = []

for (src_name, dst_path) in VFX_JOBS:
    src_path = os.path.join(ARTIFACTS_DIR, src_name)
    if not os.path.exists(src_path):
        print("  NOT FOUND:", src_name)
        errors.append(src_name)
        continue
    
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    
    try:
        remove_bg_and_trim(src_path, dst_path)
        success += 1
    except Exception as e:
        print("  ERROR", src_name, str(e))
        errors.append(src_name)

print()
print(f"Done: {success}/{len(VFX_JOBS)} VFX processed")
if errors:
    print("Failed:", errors)
