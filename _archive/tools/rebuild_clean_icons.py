import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'
ICONS_DIR = r'H:\GOOGLE DRIVER\GAME\assets\icons'

def get_brain_file(prefix):
    for f in os.listdir(BRAIN_DIR):
        if f.startswith(prefix) and (f.endswith('.jpg') or f.endswith('.png')):
            return os.path.join(BRAIN_DIR, f)
    raise FileNotFoundError(f"File with prefix {prefix} not found in {BRAIN_DIR}")

def create_circular_mask(size, radius, soft_edge=2):
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([size//2 - radius, size//2 - radius, size//2 + radius, size//2 + radius], fill=255)
    if soft_edge > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(soft_edge))
    return mask

def process_skills():
    print("Rebuilding skill_icons.png with centered padding and no bleeding...")
    grid_path = get_brain_file('xianxia_skills_grid')
    grid = Image.open(grid_path).convert('RGBA')
    
    # 10 skills in a grid (e.g. 3x4 or 4x3)
    # Let's crop into 10 frames
    # Skill grid: 1024 x 1024, 10 icons: 3 rows, 4 columns (last row has 2) or 2x5
    gw, gh = grid.size
    cols, rows = 4, 3
    cw, ch = gw / cols, gh / rows
    
    fw, fh = 96, 96
    atlas = Image.new('RGBA', (fw * 10, fh), (0, 0, 0, 0))
    
    # Inner safe size for icon inside 96x96
    target_inner_s = 76 # 10px safe margin all around
    mask = create_circular_mask(target_inner_s, target_inner_s // 2 - 2, soft_edge=1)
    
    count = 0
    for r in range(rows):
        for c in range(cols):
            if count >= 10: break
            
            # Crop cell from original AI grid with safe margin inside cell
            margin = 25
            x1 = int(c * cw + margin)
            y1 = int(r * ch + margin)
            x2 = int((c + 1) * cw - margin)
            y2 = int((r + 1) * ch - margin)
            
            raw_cell = grid.crop((x1, y1, x2, y2))
            
            # Resize to target inner size
            resized_cell = raw_cell.resize((target_inner_s, target_inner_s), Image.Resampling.LANCZOS)
            
            # Apply circular mask so corners never bleed outside round buttons
            masked_cell = Image.new('RGBA', (target_inner_s, target_inner_s), (0, 0, 0, 0))
            masked_cell.paste(resized_cell, (0, 0), mask)
            
            # Draw subtle glowing border
            draw = ImageDraw.Draw(masked_cell)
            draw.ellipse([2, 2, target_inner_s - 3, target_inner_s - 3], outline=(255, 215, 0, 180), width=2)
            
            # Paste centered into 96x96 frame
            frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
            px = (fw - target_inner_s) // 2
            py = (fh - target_inner_s) // 2
            frame.paste(masked_cell, (px, py), masked_cell)
            
            atlas.paste(frame, (count * fw, 0), frame)
            count += 1
            
    out_path = os.path.join(ICONS_DIR, 'skill_icons.png')
    atlas.save(out_path)
    print(f" -> Saved clean skill_icons.png ({atlas.size})")

def process_items():
    print("Rebuilding items_atlas.png with centered padding and no bleeding...")
    grid_path = get_brain_file('xianxia_items_grid')
    grid = Image.open(grid_path).convert('RGBA')
    
    # 18 items: 3 rows x 6 columns
    gw, gh = grid.size
    cols, rows = 6, 3
    cw, ch = gw / cols, gh / rows
    
    fw, fh = 80, 80
    atlas = Image.new('RGBA', (fw * 18, fh), (0, 0, 0, 0))
    
    target_inner_s = 64 # 8px safe margin all around
    mask = create_circular_mask(target_inner_s, target_inner_s // 2 - 2, soft_edge=1)
    
    count = 0
    for r in range(rows):
        for c in range(cols):
            if count >= 18: break
            
            margin = 15
            x1 = int(c * cw + margin)
            y1 = int(r * ch + margin)
            x2 = int((c + 1) * cw - margin)
            y2 = int((r + 1) * ch - margin)
            
            raw_cell = grid.crop((x1, y1, x2, y2))
            resized_cell = raw_cell.resize((target_inner_s, target_inner_s), Image.Resampling.LANCZOS)
            
            masked_cell = Image.new('RGBA', (target_inner_s, target_inner_s), (0, 0, 0, 0))
            masked_cell.paste(resized_cell, (0, 0), mask)
            
            draw = ImageDraw.Draw(masked_cell)
            draw.ellipse([2, 2, target_inner_s - 3, target_inner_s - 3], outline=(212, 175, 55, 160), width=1)
            
            frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
            px = (fw - target_inner_s) // 2
            py = (fh - target_inner_s) // 2
            frame.paste(masked_cell, (px, py), masked_cell)
            
            atlas.paste(frame, (count * fw, 0), frame)
            count += 1
            
    out_path = os.path.join(ICONS_DIR, 'items_atlas.png')
    atlas.save(out_path)
    print(f" -> Saved clean items_atlas.png ({atlas.size})")

def process_stages():
    print("Rebuilding stage_icons.png with centered padding and no bleeding...")
    grid_path = get_brain_file('xianxia_stages_grid')
    grid = Image.open(grid_path).convert('RGBA')
    
    # 12 stages: 3 rows x 4 columns
    gw, gh = grid.size
    cols, rows = 4, 3
    cw, ch = gw / cols, gh / rows
    
    fw, fh = 72, 72
    atlas = Image.new('RGBA', (fw * 12, fh), (0, 0, 0, 0))
    
    target_inner_s = 58 # 7px safe margin all around
    mask = create_circular_mask(target_inner_s, target_inner_s // 2 - 2, soft_edge=1)
    
    count = 0
    for r in range(rows):
        for c in range(cols):
            if count >= 12: break
            
            margin = 18
            x1 = int(c * cw + margin)
            y1 = int(r * ch + margin)
            x2 = int((c + 1) * cw - margin)
            y2 = int((r + 1) * ch - margin)
            
            raw_cell = grid.crop((x1, y1, x2, y2))
            resized_cell = raw_cell.resize((target_inner_s, target_inner_s), Image.Resampling.LANCZOS)
            
            masked_cell = Image.new('RGBA', (target_inner_s, target_inner_s), (0, 0, 0, 0))
            masked_cell.paste(resized_cell, (0, 0), mask)
            
            draw = ImageDraw.Draw(masked_cell)
            draw.ellipse([2, 2, target_inner_s - 3, target_inner_s - 3], outline=(255, 215, 0, 160), width=1)
            
            frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
            px = (fw - target_inner_s) // 2
            py = (fh - target_inner_s) // 2
            frame.paste(masked_cell, (px, py), masked_cell)
            
            atlas.paste(frame, (count * fw, 0), frame)
            count += 1
            
    out_path = os.path.join(ICONS_DIR, 'stage_icons.png')
    atlas.save(out_path)
    print(f" -> Saved clean stage_icons.png ({atlas.size})")

if __name__ == '__main__':
    process_skills()
    process_items()
    process_stages()
    print("ALL ICONS REBUILT, STANDARDIZED & CENTERED WITH ZERO BLEEDING!")
