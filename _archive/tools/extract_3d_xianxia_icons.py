import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'
ICONS_DIR = r'H:\GOOGLE DRIVER\GAME\assets\icons'
os.makedirs(ICONS_DIR, exist_ok=True)

def extract_3d_icons():
    print("=== Extracting 3D Xianxia Icons for Atlases ===")
    
    # 1. PROCESS SKILLS (10 frames, 96x96 each -> 960x96)
    skills_img = Image.open(os.path.join(BRAIN_DIR, 'xianxia_3d_skills_grid_1790485431935.jpg')).convert('RGBA')
    skill_locs = [
        (125, 145, 90), (384, 145, 90), (638, 145, 90), (894, 145, 90),
        (128, 488, 90), (384, 488, 90), (638, 488, 90), (892, 488, 90),
        (130, 818, 90), (384, 818, 90)
    ]
    skill_atlas = Image.new('RGBA', (96 * 10, 96), (0, 0, 0, 0))
    for idx, (cx, cy, r) in enumerate(skill_locs):
        crop_box = (cx - r, cy - r, cx + r, cy + r)
        cropped = skills_img.crop(crop_box)
        mask = Image.new('L', (r * 2, r * 2), 0)
        draw_m = ImageDraw.Draw(mask)
        draw_m.ellipse([3, 3, r*2 - 4, r*2 - 4], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(1.5))
        cropped.putalpha(mask)
        target_size = 76
        resized = cropped.resize((target_size, target_size), Image.Resampling.LANCZOS)
        x_offset = idx * 96 + (96 - target_size) // 2
        y_offset = (96 - target_size) // 2
        skill_atlas.paste(resized, (x_offset, y_offset), resized)
    skill_atlas.save(os.path.join(ICONS_DIR, 'skill_icons.png'))
    print(" -> Saved 3D Xianxia skill_icons.png (960x96)")

    # 2. PROCESS ITEMS (18 frames, 80x80 each -> 1440x80)
    # Measured exact item card coordinates (3 columns of 2 items per row, 3 rows)
    items_img = Image.open(os.path.join(BRAIN_DIR, 'xianxia_items_grid_1790482439060.jpg')).convert('RGBA')
    item_atlas = Image.new('RGBA', (80 * 18, 80), (0, 0, 0, 0))
    item_coords = [
        # Row 1 (y ≈ 120, rad ≈ 50)
        (100, 120, 50), (247, 120, 50), (438, 120, 50), (585, 120, 50), (776, 120, 50), (923, 120, 50),
        # Row 2 (y ≈ 450, rad ≈ 50)
        (100, 450, 50), (247, 450, 50), (438, 450, 50), (585, 450, 50), (776, 450, 50), (923, 450, 50),
        # Row 3 (y ≈ 785, rad ≈ 50)
        (100, 785, 50), (247, 785, 50), (438, 785, 50), (585, 785, 50), (776, 785, 50), (923, 785, 50)
    ]
    for idx, (cx, cy, rad) in enumerate(item_coords):
        crop_box = (cx - rad, cy - rad, cx + rad, cy + rad)
        cropped = items_img.crop(crop_box)
        mask = Image.new('L', (rad * 2, rad * 2), 0)
        draw_m = ImageDraw.Draw(mask)
        draw_m.ellipse([2, 2, rad*2 - 3, rad*2 - 3], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(1.5))
        cropped.putalpha(mask)
        target_size = 64
        resized = cropped.resize((target_size, target_size), Image.Resampling.LANCZOS)
        x_offset = idx * 80 + (80 - target_size) // 2
        y_offset = (80 - target_size) // 2
        item_atlas.paste(resized, (x_offset, y_offset), resized)
    item_atlas.save(os.path.join(ICONS_DIR, 'items_atlas.png'))
    print(" -> Saved 3D Xianxia items_atlas.png (1440x80)")

    # 3. PROCESS STAGES (12 frames, 72x72 each -> 864x72)
    # Measured exact stage circle portal coordinates (4 portals per row, 3 rows)
    stages_img = Image.open(os.path.join(BRAIN_DIR, 'xianxia_stages_grid_1790482492736.jpg')).convert('RGBA')
    stage_atlas = Image.new('RGBA', (72 * 12, 72), (0, 0, 0, 0))
    stage_coords = [
        # Row 1 (y ≈ 142)
        (128, 142, 90), (384, 142, 90), (640, 142, 90), (896, 142, 90),
        # Row 2 (y ≈ 477)
        (128, 477, 90), (384, 477, 90), (640, 477, 90), (896, 477, 90),
        # Row 3 (y ≈ 818)
        (128, 818, 90), (384, 818, 90), (640, 818, 90), (896, 818, 90)
    ]
    for idx, (cx, cy, rad) in enumerate(stage_coords):
        crop_box = (cx - rad, cy - rad, cx + rad, cy + rad)
        cropped = stages_img.crop(crop_box)
        mask = Image.new('L', (rad * 2, rad * 2), 0)
        draw_m = ImageDraw.Draw(mask)
        draw_m.ellipse([3, 3, rad*2 - 4, rad*2 - 4], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(1.5))
        cropped.putalpha(mask)
        target_size = 58
        resized = cropped.resize((target_size, target_size), Image.Resampling.LANCZOS)
        x_offset = idx * 72 + (72 - target_size) // 2
        y_offset = (72 - target_size) // 2
        stage_atlas.paste(resized, (x_offset, y_offset), resized)
    stage_atlas.save(os.path.join(ICONS_DIR, 'stage_icons.png'))
    print(" -> Saved 3D Xianxia stage_icons.png (864x72)")

if __name__ == '__main__':
    extract_3d_icons()
