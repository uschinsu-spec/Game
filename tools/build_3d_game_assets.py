import os
import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageOps

BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'
ASSETS_DIR = r'h:\GOOGLE DRIVER\GAME\assets'

def find_file(prefix):
    for f in os.listdir(BRAIN_DIR):
        if f.startswith(prefix) and (f.endswith('.jpg') or f.endswith('.png')):
            return os.path.join(BRAIN_DIR, f)
    raise FileNotFoundError(f"No file starting with {prefix} in {BRAIN_DIR}")

def extract_alpha(img_path, bg_thresh=18, soft_range=30, bbox_trim=True):
    raw = Image.open(img_path).convert('RGBA')
    arr = np.array(raw, dtype=np.float32)
    rgb = arr[:, :, :3]
    v = np.max(rgb, axis=2)
    alpha = np.clip((v - bg_thresh) / soft_range, 0.0, 1.0)
    
    # Smooth edges slightly
    safe_alpha = np.maximum(alpha[:, :, np.newaxis], 1e-4)
    unmult_rgb = np.clip(rgb / safe_alpha, 0, 255)
    
    arr[:, :, :3] = unmult_rgb
    arr[:, :, 3] = alpha * 255.0
    result = Image.fromarray(arr.astype(np.uint8))
    
    if bbox_trim:
        # Get bounding box of visible content
        bbox = result.getbbox()
        if bbox:
            result = result.crop(bbox)
    return result

def draw_fx_slash(draw, cx, cy, radius, start_angle, end_angle, color, width=6, glow_color=None):
    if glow_color:
        for w_offset, a_scale in [(8, 0.3), (4, 0.6)]:
            gc = glow_color[:3] + (int(glow_color[3] * a_scale),)
            bbox = [cx - radius - w_offset, cy - radius - w_offset, cx + radius + w_offset, cy + radius + w_offset]
            draw.arc(bbox, start=start_angle, end=end_angle, fill=gc, width=width + w_offset)
    bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
    draw.arc(bbox, start=start_angle, end=end_angle, fill=color, width=width)

def process_panorama():
    print("Processing 3D World Panorama...")
    world_path = find_file('xianxia_3d_world')
    world_img = Image.open(world_path).convert('RGB')
    
    # Target 3200 x 960
    target_w, target_h = 3200, 960
    # Scale keeping aspect ratio then crop or seamless fill
    w, h = world_img.size
    scale = max(target_w / w, target_h / h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized = world_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center crop
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    cropped = resized.crop((left, top, left + target_w, top + target_h))
    
    # Slight color boost for rich celestial contrast
    enhancer = ImageEnhance.Color(cropped)
    boosted = enhancer.enhance(1.12)
    bright = ImageEnhance.Brightness(boosted).enhance(1.05)
    bright.save(os.path.join(ASSETS_DIR, 'valley_panorama.png'))
    print("-> valley_panorama.png saved!")

def build_player_sheets():
    print("Building 3D Player Spritesheets...")
    player_path = find_file('xianxia_3d_player')
    cutout = extract_alpha(player_path, bg_thresh=16, soft_range=28)
    
    fw, fh = 128, 128
    # Fit player into box, grounded near bottom
    target_h = 104
    aspect = cutout.width / cutout.height
    target_w = int(target_h * aspect)
    base_sprite = cutout.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # 1. Idle (8 frames)
    idle_sheet = Image.new('RGBA', (fw * 8, fh), (0, 0, 0, 0))
    for f in range(8):
        t = f / 8.0
        frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
        
        # Gentle floating / breathing
        dy = math.sin(t * 2 * math.pi) * 3.5
        sx = 1.0 + math.cos(t * 2 * math.pi) * 0.02
        sy = 1.0 - math.cos(t * 2 * math.pi) * 0.02
        
        cur_w, cur_h = int(target_w * sx), int(target_h * sy)
        spr = base_sprite.resize((cur_w, cur_h), Image.Resampling.LANCZOS)
        
        px = (fw - cur_w) // 2
        py = fh - cur_h - 10 + int(dy)
        
        # Ground shadow
        sh_draw = ImageDraw.Draw(frame)
        sh_w = 40 + int(math.cos(t * 2 * math.pi) * 4)
        sh_h = 10
        sh_draw.ellipse([fw//2 - sh_w//2, fh - 14, fw//2 + sh_w//2, fh - 14 + sh_h], fill=(10, 25, 40, 90))
        
        frame.paste(spr, (px, py), spr)
        
        # Spirit sword particles
        glow_draw = ImageDraw.Draw(frame)
        glow_r = 5 + int(math.sin(t * 4 * math.pi) * 2)
        glow_draw.ellipse([px + 16 - glow_r, py + 48 - glow_r, px + 16 + glow_r, py + 48 + glow_r], fill=(0, 220, 255, 60))
        
        idle_sheet.paste(frame, (f * fw, 0), frame)
    idle_sheet.save(os.path.join(ASSETS_DIR, 'player_idle.png'))
    print("-> player_idle.png saved!")
    
    # 2. Run (8 frames)
    run_sheet = Image.new('RGBA', (fw * 8, fh), (0, 0, 0, 0))
    for f in range(8):
        t = f / 8.0
        frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
        
        # Running bounce & forward tilt
        bounce = -abs(math.sin(t * 2 * math.pi)) * 6.0
        tilt_angle = -5 + math.sin(t * 2 * math.pi) * 3
        
        spr = base_sprite.rotate(tilt_angle, resample=Image.Resampling.BICUBIC, expand=True)
        sw, sh = spr.size
        
        px = (fw - sw) // 2 + int(math.sin(t * 2 * math.pi) * 3)
        py = fh - sh - 8 + int(bounce)
        
        # Footstep dust & shadow
        sh_draw = ImageDraw.Draw(frame)
        sh_w = 46 + int(math.sin(t * 2 * math.pi) * 6)
        sh_draw.ellipse([fw//2 - sh_w//2, fh - 13, fw//2 + sh_w//2, fh - 5], fill=(10, 25, 40, 110))
        
        # Speed wind trail
        for k in range(3):
            wx = px - 10 - k * 8
            wy = py + 35 + k * 12 + int(math.sin(t * 4 * math.pi + k) * 4)
            sh_draw.line([wx, wy, wx + 12, wy - 4], fill=(120, 230, 255, 70 - k * 20), width=2)
            
        frame.paste(spr, (px, py), spr)
        run_sheet.paste(frame, (f * fw, 0), frame)
    run_sheet.save(os.path.join(ASSETS_DIR, 'player_run.png'))
    print("-> player_run.png saved!")
    
    # 3. Attack (8 frames)
    atk_sheet = Image.new('RGBA', (fw * 8, fh), (0, 0, 0, 0))
    for f in range(8):
        frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        # Shadow
        draw.ellipse([fw//2 - 25, fh - 14, fw//2 + 25, fh - 4], fill=(10, 25, 40, 120))
        
        if f <= 1:
            # Windup
            rot = 8 - f * 4
            spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
            sw, sh = spr.size
            px = (fw - sw) // 2 - 8 - f * 4
            py = fh - sh - 10
            frame.paste(spr, (px, py), spr)
            # Charging glow
            draw.ellipse([px + 10, py + 20, px + 35, py + 45], fill=(0, 240, 255, 80 + f * 50))
        elif f <= 4:
            # Thrust / Slash
            progress = (f - 2) / 2.0
            rot = -12 - (1 - progress) * 8
            spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
            sw, sh = spr.size
            px = (fw - sw) // 2 + 12 + int(progress * 10)
            py = fh - sh - 10 + int(progress * 3)
            frame.paste(spr, (px, py), spr)
            
            # Massive Cyan Blade Slash Arc
            arc_r = 38 + int(progress * 15)
            draw_fx_slash(draw, px + sw - 10, py + sh//2, arc_r, -70, 70, (220, 255, 255, 255), width=5, glow_color=(0, 200, 255, 180))
            # Energy burst lines
            for el in range(4):
                ex = px + sw + 5 + el * 8
                ey = py + 20 + el * 14
                draw.line([ex, ey, ex + 18, ey + 4], fill=(150, 240, 255, 220), width=3)
        else:
            # Recovery
            decay = (f - 5) / 2.0
            rot = -6 * (1 - decay)
            spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
            sw, sh = spr.size
            px = (fw - sw) // 2 + int(6 * (1 - decay))
            py = fh - sh - 10
            frame.paste(spr, (px, py), spr)
            
            # Fading aura
            alpha_fade = int(120 * (1 - decay))
            draw_fx_slash(draw, px + sw - 5, py + sh//2, 45, -30, 30, (100, 220, 255, alpha_fade), width=2)
            
        atk_sheet.paste(frame, (f * fw, 0), frame)
    atk_sheet.save(os.path.join(ASSETS_DIR, 'player_attack.png'))
    print("-> player_attack.png saved!")

def build_enemy_spritesheet(name, src_prefix, fw, fh, target_h, is_flying=False, is_quadruped=False):
    print(f"Building 3D Spritesheet for {name} ({fw}x{fh})...")
    src_path = find_file(src_prefix)
    cutout = extract_alpha(src_path, bg_thresh=18, soft_range=30)
    
    aspect = cutout.width / cutout.height
    target_w = int(target_h * aspect)
    base_sprite = cutout.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # 10 Frames: [0-1: Idle], [2-5: Run], [6-9: Attack]
    sheet = Image.new('RGBA', (fw * 10, fh), (0, 0, 0, 0))
    
    for f in range(10):
        frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        # Shadow
        if not is_flying:
            sh_w = int(target_w * 0.7)
            draw.ellipse([fw//2 - sh_w//2, fh - 14, fw//2 + sh_w//2, fh - 4], fill=(15, 8, 12, 120))
        else:
            # Hover shadow higher up
            sh_w = int(target_w * 0.5)
            draw.ellipse([fw//2 - sh_w//2, fh - 12, fw//2 + sh_w//2, fh - 4], fill=(15, 8, 12, 60))
            
        if f < 2:
            # --- 2 IDLE FRAMES ---
            t = f / 2.0
            if is_flying:
                dy = math.sin(t * 2 * math.pi) * 5.0
                rot = math.sin(t * 2 * math.pi) * 3.0
            else:
                dy = math.sin(t * 2 * math.pi) * 2.5
                rot = 0
            
            spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
            sw, sh = spr.size
            px = (fw - sw) // 2
            py = fh - sh - (20 if is_flying else 10) + int(dy)
            frame.paste(spr, (px, py), spr)
            
        elif f < 6:
            # --- 4 RUN FRAMES ---
            rf = f - 2
            t = rf / 4.0
            
            if is_flying:
                dy = math.sin(t * 2 * math.pi) * 6.0
                rot = -8 + math.sin(t * 2 * math.pi) * 5.0
                spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
                sw, sh = spr.size
                px = (fw - sw) // 2 + int(math.sin(t * 2 * math.pi) * 4)
                py = fh - sh - 20 + int(dy)
            elif is_quadruped:
                # 4-legged heavy gallop stride
                bounce = -abs(math.sin(t * 2 * math.pi)) * 5.0
                rot = math.sin(t * 2 * math.pi) * 4.0
                spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
                sw, sh = spr.size
                px = (fw - sw) // 2 + int(math.sin(t * 2 * math.pi) * 3)
                py = fh - sh - 8 + int(bounce)
            else:
                # Bipedal run
                bounce = -abs(math.sin(t * 2 * math.pi)) * 6.0
                rot = -6 + math.sin(t * 2 * math.pi) * 3.0
                spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
                sw, sh = spr.size
                px = (fw - sw) // 2 + int(math.sin(t * 2 * math.pi) * 4)
                py = fh - sh - 8 + int(bounce)
                
            frame.paste(spr, (px, py), spr)
            
        else:
            # --- 4 ATTACK FRAMES ---
            af = f - 6
            if af == 0:
                # Windup pullback
                rot = 8 if not is_flying else 12
                spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
                sw, sh = spr.size
                px = (fw - sw) // 2 - 8
                py = fh - sh - (20 if is_flying else 10)
                frame.paste(spr, (px, py), spr)
                # Ominous aura
                draw.ellipse([px + 10, py + 15, px + 40, py + 45], fill=(255, 30, 30, 70))
            elif af == 1 or af == 2:
                # Main strike & massive shockwave
                rot = -14
                spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
                sw, sh = spr.size
                px = (fw - sw) // 2 + 10 + (af - 1) * 6
                py = fh - sh - (20 if is_flying else 10)
                frame.paste(spr, (px, py), spr)
                
                # Dynamic FX Slash based on enemy type
                if name == 'goblin':
                    draw_fx_slash(draw, px + sw - 8, py + sh//2, 40, -60, 60, (230, 100, 255, 255), width=5, glow_color=(180, 0, 255, 180))
                elif name == 'boar':
                    # Fiery Magma Gore
                    draw_fx_slash(draw, px + sw, py + sh//2 + 5, 42, -45, 45, (255, 200, 50, 255), width=6, glow_color=(255, 50, 0, 200))
                    draw.ellipse([px + sw + 5, py + sh//2 - 10, px + sw + 25, py + sh//2 + 10], fill=(255, 120, 0, 160))
                elif name == 'bat':
                    # Blood Energy Wave
                    draw_fx_slash(draw, px + sw, py + sh//2, 46, -70, 70, (255, 50, 80, 255), width=5, glow_color=(200, 0, 30, 200))
                elif name == 'boss':
                    # Demonic 4-Halberd Cleave & Lightning
                    draw_fx_slash(draw, px + sw, py + sh//2, 65, -80, 80, (255, 180, 255, 255), width=8, glow_color=(160, 0, 255, 220))
                    # Ground shock crack
                    draw.line([px + sw - 20, fh - 12, px + sw + 40, fh - 12], fill=(255, 100, 255, 240), width=4)
            else:
                # Recovery
                rot = -4
                spr = base_sprite.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
                sw, sh = spr.size
                px = (fw - sw) // 2 + 4
                py = fh - sh - (20 if is_flying else 10)
                frame.paste(spr, (px, py), spr)
                
        sheet.paste(frame, (f * fw, 0), frame)
        
    out_file = os.path.join(ASSETS_DIR, f'{name}.png')
    sheet.save(out_file)
    print(f"-> {name}.png saved successfully ({sheet.size})!")

def build_enemy_preview():
    print("Generating comprehensive 3D preview contact sheet...")
    enemies = [
        ('Yêu Binh (3D Goblin)', 'goblin.png', 128, 128),
        ('Hắc Trư Ma Thú (3D Boar)', 'boar.png', 128, 128),
        ('Huyết Ma Bức (3D Blood Bat)', 'bat.png', 128, 128),
        ('Huyết Ma Thần (3D World Boss)', 'boss.png', 192, 192)
    ]
    
    canvas_w = 1450
    canvas_h = 760
    img = Image.new('RGBA', (canvas_w, canvas_h), (8, 14, 24, 255))
    draw = ImageDraw.Draw(img)
    
    draw.text((30, 20), 'CHÂN THỰC 3D - BỘ QUÁI VẬT & BOSS TU TIÊN (UNREAL ENGINE 5 CULTIVATION ASSETS)', fill=(255, 215, 0))
    draw.text((30, 44), 'Chuẩn 10 Frames mỗi Quái: [Frames 0-1: 2 Idle]  |  [Frames 2-5: 4 Run]  |  [Frames 6-9: 4 Attack]', fill=(140, 210, 255))
    
    y_offset = 80
    for title, fname, fw, fh in enemies:
        src = Image.open(os.path.join(ASSETS_DIR, fname)).convert('RGBA')
        draw.text((30, y_offset + 35), title, fill=(245, 245, 245))
        
        disp_s = 100
        for f in range(10):
            fx = f * fw
            frame = src.crop((fx, 0, fx + fw, fh))
            frame_resized = frame.resize((disp_s, disp_s), Image.Resampling.LANCZOS)
            
            px = 280 + f * 112
            py = y_offset + 5
            
            if f < 2:
                border_col = (40, 200, 120)
                tag = f'Idle {f+1}'
            elif f < 6:
                border_col = (60, 160, 255)
                tag = f'Run {f-1}'
            else:
                border_col = (255, 75, 75)
                tag = f'Atk {f-5}'
                
            draw.rectangle([px-2, py-2, px+disp_s+2, py+disp_s+2], fill=(15, 25, 42, 255), outline=border_col, width=2)
            img.paste(frame_resized, (px, py), frame_resized)
            draw.text((px + 28, py + disp_s + 4), tag, fill=border_col)
            
        y_offset += 160
        
    preview_path = os.path.join(ASSETS_DIR, 'enemy_preview_sheet.png')
    img.save(preview_path)
    print("-> enemy_preview_sheet.png saved successfully!")

if __name__ == '__main__':
    process_panorama()
    build_player_sheets()
    build_enemy_spritesheet('goblin', 'xianxia_3d_goblin', 128, 128, target_h=100)
    build_enemy_spritesheet('boar', 'xianxia_3d_boar', 128, 128, target_h=96, is_quadruped=True)
    build_enemy_spritesheet('bat', 'xianxia_3d_bat', 128, 128, target_h=100, is_flying=True)
    build_enemy_spritesheet('boss', 'xianxia_3d_boss', 192, 192, target_h=165)
    build_enemy_preview()
    print("ALL 3D GAME ASSETS COMPLETED!")
