import os
import shutil
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance

SRC_IMAGE = r'C:\Users\nguye\Desktop\ENEMI\ChatGPT Image Sep 27, 2026, 11_18_56 AM.png'
ASSETS_DIR = r'h:\GOOGLE DRIVER\GAME\assets'
BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'

def extract_and_calibrate():
    print(f"Loading user player asset from: {SRC_IMAGE}")
    src = Image.open(SRC_IMAGE).convert('RGBA')
    arr = np.array(src)
    alpha = arr[:, :, 3]
    
    rows_def = [
        ('player_idle', 14, 230),
        ('player_run', 235, 460),
        ('player_attack', 465, 705)
    ]
    
    fw, fh = 128, 128
    ground_y = 114 # Ground baseline in 128x128 frame
    target_character_height = 96 # Standard character visual height
    
    sheets = {}
    
    for row_name, y_min, y_max in rows_def:
        row_alpha = alpha[y_min:y_max, 180:] # skip title text
        col_active = np.sum(row_alpha > 20, axis=0) > 0
        
        # Get contiguous spans
        spans = []
        in_span = False
        start = 0
        for x, val in enumerate(col_active):
            if val and not in_span:
                in_span = True
                start = x
            elif not val and in_span:
                in_span = False
                spans.append((start, x))
        if in_span:
            spans.append((start, len(col_active)))
            
        # Filter noise spans (width < 30)
        valid_spans = [s for s in spans if (s[1] - s[0]) >= 30]
        print(f"{row_name}: Extracted {len(valid_spans)} frames")
        assert len(valid_spans) == 8, f"Expected 8 frames, got {len(valid_spans)}"
        
        spritesheet = Image.new('RGBA', (fw * 8, fh), (0, 0, 0, 0))
        
        for idx, (sx, ex) in enumerate(valid_spans):
            real_sx = 180 + sx
            real_ex = 180 + ex
            
            # Find tight vertical bounding box
            sub_alpha = alpha[y_min:y_max, real_sx:real_ex]
            v_has = np.where(np.sum(sub_alpha > 15, axis=1) > 0)[0]
            top = y_min + v_has[0]
            bot = y_min + v_has[-1]
            
            # Crop exact character sprite
            raw_sprite = src.crop((real_sx, top, real_ex, bot + 1))
            
            # Clean isolated noise pixels if any
            spr_w, spr_h = raw_sprite.size
            
            # Scale proportionally based on reference height
            # Height in original is around 210-220px
            scale = target_character_height / 215.0
            new_w = max(1, int(spr_w * scale))
            new_h = max(1, int(spr_h * scale))
            
            # Ensure it fits within 128x128
            if new_w > 124:
                scale_w = 124 / new_w
                new_w = 124
                new_h = int(new_h * scale_w)
            if new_h > 118:
                scale_h = 118 / new_h
                new_h = 118
                new_w = int(new_w * scale_h)
                
            resized_sprite = raw_sprite.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Position inside 128x128 frame
            # Centered horizontally
            pos_x = (fw - new_w) // 2
            # Grounded to ground_y baseline
            pos_y = ground_y - new_h
            if pos_y < 2:
                pos_y = 2
                
            frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
            frame.paste(resized_sprite, (pos_x, pos_y), resized_sprite)
            
            # Paste into spritesheet
            spritesheet.paste(frame, (idx * fw, 0), frame)
            
        out_path = os.path.join(ASSETS_DIR, f"{row_name}.png")
        spritesheet.save(out_path)
        sheets[row_name] = spritesheet
        print(f" -> Saved {out_path} ({spritesheet.size})")
        
    # Copy aliases
    shutil.copyfile(os.path.join(ASSETS_DIR, 'player_idle.png'), os.path.join(ASSETS_DIR, 'player.png'))
    shutil.copyfile(os.path.join(ASSETS_DIR, 'player_attack.png'), os.path.join(ASSETS_DIR, 'player_skill.png'))
    print(" -> Synchronized player.png and player_skill.png")
    
    # Generate visual calibration contact sheet
    canvas_w = 1150
    canvas_h = 520
    preview = Image.new('RGBA', (canvas_w, canvas_h), (12, 20, 32, 255))
    draw = ImageDraw.Draw(preview)
    
    draw.text((25, 18), 'BẢNG CĂN CHUẨN SPRITESHEET PLAYER TỪ USER ASSET', fill=(255, 215, 0))
    draw.text((25, 40), 'Chuẩn hóa tỷ lệ, căn trục mặt đất (Ground Baseline), 8 Frames chuẩn mỗi trạng thái', fill=(160, 220, 255))
    
    rows = [
        ('1. IDLE (Tĩnh tại/Thế thủ)', 'player_idle', (50, 200, 120)),
        ('2. RUN (Di chuyển/Lướt)', 'player_run', (60, 170, 255)),
        ('3. ATTACK (Xuất kiếm/Kỹ năng)', 'player_attack', (255, 80, 80))
    ]
    
    for r_idx, (r_title, r_key, color) in enumerate(rows):
        y_top = 75 + r_idx * 145
        draw.text((25, y_top + 45), r_title, fill=color)
        
        sheet = sheets[r_key]
        for f in range(8):
            fx = f * fw
            sub = sheet.crop((fx, 0, fx + fw, fh))
            px = 280 + f * 105
            py = y_top
            
            # Draw frame box & baseline
            draw.rectangle([px, py, px + 96, py + 96], fill=(20, 32, 50, 255), outline=color, width=1)
            # Baseline red dash
            draw.line([px + 5, py + 86, px + 91, py + 86], fill=(100, 140, 180, 100), width=1)
            
            sub_res = sub.resize((96, 96), Image.Resampling.LANCZOS)
            preview.paste(sub_res, (px, py), sub_res)
            draw.text((px + 35, py + 100), f'F{f+1}', fill=(180, 180, 180))
            
    preview_path = os.path.join(ASSETS_DIR, 'user_player_calibrated_preview.png')
    preview.save(preview_path)
    
    brain_dst = os.path.join(BRAIN_DIR, 'user_player_calibrated_preview.png')
    shutil.copyfile(preview_path, brain_dst)
    print(f" -> Saved calibration preview to: {preview_path} and artifacts!")

if __name__ == '__main__':
    extract_and_calibrate()
