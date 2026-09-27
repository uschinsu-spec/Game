import os
import shutil
import cv2
import numpy as np
from PIL import Image, ImageDraw

SRC_ENEMI = r'h:\GOOGLE DRIVER\GAME\assets\ENEMI.png'
ASSETS_DIR = r'h:\GOOGLE DRIVER\GAME\assets'
BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'

def process_enemies():
    print(f"Processing user enemies from: {SRC_ENEMI}")
    src = Image.open(SRC_ENEMI).convert('RGBA')
    arr = np.array(src)
    alpha = arr[:, :, 3]
    
    # 8 Rows
    row_y = [
        (15, 145),
        (150, 285),
        (295, 420),
        (430, 560),
        (570, 695),
        (700, 845),
        (855, 965),
        (975, 1115)
    ]
    
    # 10 Columns
    col_x = [
        (10, 140), (145, 275), (280, 420), (425, 560), (565, 700),
        (705, 840), (845, 980), (980, 1125), (1125, 1265), (1265, 1395)
    ]
    
    fw, fh = 128, 128
    ground_y = 114
    target_character_h = 96
    
    enemy_names = [f"enemy_{i+1}" for i in range(8)]
    
    for r_idx, (y1, y2) in enumerate(row_y):
        ename = enemy_names[r_idx]
        spritesheet = Image.new('RGBA', (fw * 10, fh), (0, 0, 0, 0))
        
        for c_idx, (x1, x2) in enumerate(col_x):
            cell = src.crop((x1, y1, x2, y2))
            cell_alpha = np.array(cell)[:, :, 3]
            v_has = np.where(np.sum(cell_alpha > 15, axis=1) > 0)[0]
            h_has = np.where(np.sum(cell_alpha > 15, axis=0) > 0)[0]
            
            if len(v_has) > 0 and len(h_has) > 0:
                top, bot = v_has[0], v_has[-1]
                left, right = h_has[0], h_has[-1]
                sprite = cell.crop((left, top, right + 1, bot + 1))
                
                # Scale sprite
                sw, sh = sprite.size
                scale = min(target_character_h / max(1, sh), (fw - 12) / max(1, sw))
                # For big row (e.g. boss row 5), scale up slightly
                if r_idx in [1, 5, 7]:
                    scale = min(110 / max(1, sh), (fw - 8) / max(1, sw))
                    
                nw = max(1, int(sw * scale))
                nh = max(1, int(sh * scale))
                resized = sprite.resize((nw, nh), Image.Resampling.LANCZOS)
                
                # Center and ground
                px = (fw - nw) // 2
                py = ground_y - nh
                if py < 2:
                    py = 2
                    
                frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
                frame.paste(resized, (px, py), resized)
                spritesheet.paste(frame, (c_idx * fw, 0), frame)
                
        out_file = os.path.join(ASSETS_DIR, f"{ename}.png")
        spritesheet.save(out_file)
        print(f" -> Saved {ename}.png ({spritesheet.size})")
        
    # Map to classic names for instant compatibility:
    # goblin -> enemy_1
    # boar -> enemy_5
    # bat -> enemy_7
    # boss -> enemy_6
    shutil.copyfile(os.path.join(ASSETS_DIR, "enemy_1.png"), os.path.join(ASSETS_DIR, "goblin.png"))
    shutil.copyfile(os.path.join(ASSETS_DIR, "enemy_5.png"), os.path.join(ASSETS_DIR, "boar.png"))
    shutil.copyfile(os.path.join(ASSETS_DIR, "enemy_7.png"), os.path.join(ASSETS_DIR, "bat.png"))
    shutil.copyfile(os.path.join(ASSETS_DIR, "enemy_6.png"), os.path.join(ASSETS_DIR, "boss.png"))
    print(" -> Synced goblin, boar, bat, boss to user enemy assets!")
    
    # Generate Contact Sheet Preview
    preview = Image.new('RGBA', (1360, 8 * 115 + 80), (10, 16, 26, 255))
    draw = ImageDraw.Draw(preview)
    draw.text((25, 18), 'BỘ TOÀN BỘ 8 QUÁI VẬT TỪ USER ASSET (ENEMI.png)', fill=(255, 215, 0))
    draw.text((25, 40), '10 Frames Chuẩn: [0-1: 2 Idle] | [2-5: 4 Run] | [6-9: 4 Attack]', fill=(150, 210, 255))
    
    for r in range(8):
        ename = enemy_names[r]
        sheet = Image.open(os.path.join(ASSETS_DIR, f"{ename}.png"))
        y_top = 70 + r * 115
        draw.text((25, y_top + 45), f"Quái {r+1}", fill=(230, 230, 230))
        
        for f in range(10):
            fx = f * fw
            sub = sheet.crop((fx, 0, fx + fw, fh))
            px = 140 + f * 115
            py = y_top
            
            border_col = (40, 200, 120) if f < 2 else ((60, 160, 255) if f < 6 else (255, 75, 75))
            draw.rectangle([px, py, px + 100, py + 100], fill=(18, 28, 44, 255), outline=border_col, width=1)
            
            sub_res = sub.resize((100, 100), Image.Resampling.LANCZOS)
            preview.paste(sub_res, (px, py), sub_res)
            
            tag = f'Idle {f+1}' if f < 2 else (f'Run {f-1}' if f < 6 else f'Atk {f-5}')
            draw.text((px + 30, py + 102), tag, fill=border_col)
            
    prev_path = os.path.join(ASSETS_DIR, 'enemy_preview_sheet.png')
    preview.save(prev_path)
    shutil.copyfile(prev_path, os.path.join(BRAIN_DIR, 'enemy_preview_sheet.png'))
    print(" -> Saved enemy_preview_sheet.png!")

if __name__ == '__main__':
    process_enemies()
