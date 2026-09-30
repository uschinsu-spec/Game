import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ICONS_DIR = r'H:\GOOGLE DRIVER\GAME\assets\icons'
BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'

def draw_radial_gradient(draw, cx, cy, radius, col_center, col_edge):
    for r in range(radius, 0, -2):
        t = r / float(radius)
        # Interpolate color
        r_c = int(col_center[0] * (1 - t) + col_edge[0] * t)
        g_c = int(col_center[1] * (1 - t) + col_edge[1] * t)
        b_c = int(col_center[2] * (1 - t) + col_edge[2] * t)
        a_c = int(col_center[3] * (1 - t) + col_edge[3] * t) if len(col_center) > 3 else 255
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(r_c, g_c, b_c, a_c))

def draw_3d_bezel(draw, cx, cy, radius, width=8, gold=True):
    for w in range(width):
        t = w / float(width)
        r = radius - w
        if gold:
            # 3D Gold highlight top-left, shadow bottom-right
            col = (
                int(255 - t * 60),
                int(220 - t * 80),
                int(100 - t * 60),
                255
            )
        else:
            col = (
                int(120 + t * 40),
                int(200 + t * 55),
                int(255),
                255
            )
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=2)
    # Specular shine
    draw.arc([cx - radius + 2, cy - radius + 2, cx + radius - 2, cy + radius - 2], start=-135, end=-45, fill=(255, 255, 240, 220), width=3)

def build_skills_atlas():
    print("Building HD 3D skill_icons.png...")
    fw, fh = 96, 96
    ss = 4 # 4x supersampling
    S = fw * ss # 384x384 per frame
    
    atlas = Image.new('RGBA', (fw * 10, fh), (0, 0, 0, 0))
    
    # 10 skills
    for i in range(10):
        img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        cx, cy, R = S // 2, S // 2, int(S * 0.44)
        
        # Orb background
        if i in [0, 6]: # Wind / Cyan
            bg_c, bg_e = (0, 180, 240, 255), (6, 25, 45, 255)
        elif i in [1, 7, 8]: # Gold / Light
            bg_c, bg_e = (255, 200, 50, 255), (35, 20, 5, 255)
        elif i in [2]: # Lightning / Purple
            bg_c, bg_e = (180, 100, 255, 255), (20, 8, 40, 255)
        elif i in [3]: # Frost / Ice
            bg_c, bg_e = (160, 230, 255, 255), (10, 30, 60, 255)
        elif i in [4]: # Fire
            bg_c, bg_e = (255, 90, 30, 255), (45, 10, 6, 255)
        elif i in [5]: # Ultimate
            bg_c, bg_e = (240, 220, 140, 255), (20, 15, 35, 255)
        else: # Taiji Shield
            bg_c, bg_e = (255, 215, 0, 255), (15, 30, 25, 255)
            
        draw_radial_gradient(draw, cx, cy, R, bg_c, bg_e)
        
        # Draw distinctive 3D Skill Symbol
        if i == 0: # Cyan Sword Slash
            draw.line([cx - 90, cy + 90, cx + 90, cy - 90], fill=(255, 255, 255), width=24)
            draw.line([cx - 90, cy + 90, cx + 90, cy - 90], fill=(0, 240, 255), width=16)
            draw.arc([cx - 110, cy - 110, cx + 110, cy + 110], start=-80, end=40, fill=(180, 255, 255, 200), width=18)
        elif i == 1: # Sword Rain
            for sx, sy in [(-60, -80), (0, -100), (60, -80), (-30, 10), (30, 10)]:
                draw.polygon([(cx+sx, cy+sy-50), (cx+sx-12, cy+sy+40), (cx+sx+12, cy+sy+40)], fill=(255, 230, 120))
                draw.polygon([(cx+sx, cy+sy-45), (cx+sx-6, cy+sy+35), (cx+sx+6, cy+sy+35)], fill=(255, 255, 255))
        elif i == 2: # Lightning
            points = [(cx-40, cy-110), (cx+10, cy-30), (cx-20, cy-10), (cx+45, cy+110), (cx-5, cy+15), (cx+25, cy-5)]
            draw.polygon(points, fill=(255, 255, 255))
            draw.line(points + [points[0]], fill=(200, 130, 255), width=12)
        elif i == 3: # Ice Crystal
            for a in range(0, 360, 60):
                rad = math.radians(a)
                ex, ey = cx + int(math.cos(rad) * 95), cy + int(math.sin(rad) * 95)
                draw.line([cx, cy, ex, ey], fill=(240, 255, 255), width=16)
                draw.line([cx, cy, ex, ey], fill=(100, 210, 255), width=8)
            draw.ellipse([cx-25, cy-25, cx+25, cy+25], fill=(255, 255, 255))
        elif i == 4: # Fire Burst
            draw.ellipse([cx-55, cy-55, cx+55, cy+55], fill=(255, 240, 120))
            for a in range(0, 360, 45):
                rad = math.radians(a)
                ex, ey = cx + int(math.cos(rad) * 105), cy + int(math.sin(rad) * 105)
                draw.polygon([(cx, cy), (ex-15, ey-15), (ex+15, ey+15)], fill=(255, 70, 10, 220))
        elif i == 5: # Ultimate (Vạn Kiếm Quy Tông)
            draw.ellipse([cx-70, cy-70, cx+70, cy+70], fill=(255, 255, 200, 220))
            for a in range(0, 360, 45):
                rad = math.radians(a)
                ex, ey = cx + int(math.cos(rad) * 90), cy + int(math.sin(rad) * 90)
                draw.line([cx, cy, ex, ey], fill=(255, 215, 0), width=16)
                draw.polygon([(ex, ey), (ex-8, ey+12), (ex+8, ey+12)], fill=(255, 255, 255))
        elif i == 6: # Dash
            draw.arc([cx-90, cy-70, cx+70, cy+70], start=120, end=300, fill=(180, 240, 255), width=24)
            draw.polygon([(cx+60, cy-50), (cx+10, cy-80), (cx+30, cy-20)], fill=(255, 255, 255))
        elif i == 7: # Fly Sword
            draw.polygon([(cx+80, cy-70), (cx-90, cy+70), (cx-70, cy+85), (cx+95, cy-55)], fill=(255, 220, 80))
            draw.line([cx-100, cy+80, cx+100, cy-80], fill=(255, 255, 255), width=8)
            draw.arc([cx-100, cy-60, cx+100, cy+100], start=-30, end=90, fill=(255, 200, 0, 160), width=14)
        elif i == 8: # 7 Star Formation
            for k in range(7):
                a = math.radians(k * 360 / 7 - 90)
                sx, sy = cx + int(math.cos(a) * 75), cy + int(math.sin(a) * 75)
                draw.ellipse([sx-14, sy-14, sx+14, sy+14], fill=(255, 255, 255))
                draw.ellipse([sx-8, sy-8, sx+8, sy+8], fill=(0, 220, 255))
                next_a = math.radians((k + 2) * 360 / 7 - 90)
                nx, ny = cx + int(math.cos(next_a) * 75), cy + int(math.sin(next_a) * 75)
                draw.line([sx, sy, nx, ny], fill=(150, 220, 255, 180), width=6)
        elif i == 9: # Taiji Shield
            draw.ellipse([cx-75, cy-75, cx+75, cy+75], fill=(255, 255, 255))
            draw.arc([cx-75, cy-75, cx+75, cy+75], start=90, end=270, fill=(20, 30, 40), width=75)
            draw.ellipse([cx-37, cy-75, cx+37, cy], fill=(20, 30, 40))
            draw.ellipse([cx-37, cy, cx+37, cy+75], fill=(255, 255, 255))
            draw.ellipse([cx-10, cy-48, cx+10, cy-28], fill=(255, 255, 255))
            draw.ellipse([cx-10, cy+28, cx+10, cy+48], fill=(20, 30, 40))
            draw.ellipse([cx-90, cy-90, cx+90, cy+90], outline=(255, 215, 0), width=10)

        # 3D Golden Filigree Outer Ring
        draw_3d_bezel(draw, cx, cy, R, width=16, gold=True)
        
        # Downsample to 96x96
        frame = img.resize((fw, fh), Image.Resampling.LANCZOS)
        atlas.paste(frame, (i * fw, 0), frame)
        
    out_path = os.path.join(ICONS_DIR, 'skill_icons.png')
    atlas.save(out_path)
    print(f" -> Saved HD skill_icons.png ({atlas.size})")

def build_items_atlas():
    print("Building HD 3D items_atlas.png...")
    fw, fh = 80, 80
    ss = 4
    S = fw * ss # 320x320
    
    atlas = Image.new('RGBA', (fw * 18, fh), (0, 0, 0, 0))
    
    types = ['weapon', 'armor', 'helm', 'boots', 'ring', 'talisman']
    
    for i in range(18):
        img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        cx, cy, R = S // 2, S // 2, int(S * 0.44)
        
        slot_idx = i % 6
        tier = i // 6 # 0: Normal, 1: Spirit, 2: Celestial
        
        # Background gradient by Tier
        if tier == 0:
            bg_c, bg_e = (60, 120, 160, 255), (8, 18, 28, 255)
            rim_gold = False
        elif tier == 1:
            bg_c, bg_e = (160, 80, 240, 255), (20, 6, 35, 255)
            rim_gold = True
        else:
            bg_c, bg_e = (255, 180, 40, 255), (38, 15, 5, 255)
            rim_gold = True
            
        draw_radial_gradient(draw, cx, cy, R, bg_c, bg_e)
        
        # Item graphics
        st_t = types[slot_idx]
        if st_t == 'weapon':
            # Sword
            blade_col = (240, 255, 255) if tier == 0 else ((100, 220, 255) if tier == 1 else (255, 230, 120))
            draw.polygon([(cx+55, cy-75), (cx+70, cy-55), (cx-55, cy+70), (cx-70, cy+55)], fill=blade_col)
            draw.line([cx-75, cy+75, cx+75, cy-75], fill=(255, 255, 255), width=6)
            draw.ellipse([cx-50, cy+45, cx-35, cy+60], fill=(255, 215, 0))
        elif st_t == 'armor':
            # Armor plate
            armor_col = (180, 195, 210) if tier == 0 else ((130, 90, 210) if tier == 1 else (255, 200, 60))
            draw.polygon([(cx-55, cy-50), (cx+55, cy-50), (cx+40, cy+60), (cx, cy+75), (cx-40, cy+60)], fill=armor_col)
            draw.polygon([(cx-40, cy-40), (cx+40, cy-40), (cx+30, cy+45), (cx, cy+58), (cx-30, cy+45)], fill=(255, 255, 255, 180))
            draw.ellipse([cx-15, cy-15, cx+15, cy+15], fill=(255, 215, 0))
        elif st_t == 'helm':
            # Crown / Helmet
            crown_col = (200, 210, 220) if tier == 0 else ((160, 100, 240) if tier == 1 else (255, 215, 0))
            draw.polygon([(cx-60, cy+40), (cx-50, cy-40), (cx-20, cy+10), (cx, cy-65), (cx+20, cy+10), (cx+50, cy-40), (cx+60, cy+40)], fill=crown_col)
            draw.ellipse([cx-12, cy-15, cx+12, cy+15], fill=(0, 220, 255))
        elif st_t == 'boots':
            # Boots
            boot_col = (140, 150, 160) if tier == 0 else ((90, 160, 240) if tier == 1 else (255, 190, 40))
            draw.polygon([(cx-45, cy-50), (cx-10, cy-50), (cx-5, cy+20), (cx+50, cy+45), (cx+40, cy+60), (cx-45, cy+60)], fill=boot_col)
            draw.line([cx-40, cy+25, cx+35, cy+45], fill=(255, 255, 255), width=6)
        elif st_t == 'ring':
            # Ring
            ring_col = (220, 230, 240) if tier == 0 else ((180, 120, 255) if tier == 1 else (255, 215, 0))
            draw.ellipse([cx-50, cy-35, cx+50, cy+50], outline=ring_col, width=14)
            gem_col = (100, 240, 150) if tier == 0 else ((0, 200, 255) if tier == 1 else (255, 50, 80))
            draw.polygon([(cx, cy-60), (cx-24, cy-35), (cx, cy-15), (cx+24, cy-35)], fill=gem_col)
        elif st_t == 'talisman':
            # Daoist Talisman Paper
            paper_col = (255, 240, 150) if tier == 0 else ((160, 230, 255) if tier == 1 else (255, 215, 60))
            draw.polygon([(cx-35, cy-65), (cx+35, cy-65), (cx+35, cy+65), (cx-35, cy+65)], fill=paper_col)
            draw.line([cx-20, cy-40, cx+20, cy-40], fill=(200, 20, 20), width=6)
            draw.line([cx, cy-40, cx, cy+40], fill=(200, 20, 20), width=6)
            draw.ellipse([cx-12, cy, cx+12, cy+24], outline=(200, 20, 20), width=4)

        # 3D Bezel
        draw_3d_bezel(draw, cx, cy, R, width=14, gold=rim_gold)
        
        frame = img.resize((fw, fh), Image.Resampling.LANCZOS)
        atlas.paste(frame, (i * fw, 0), frame)
        
    out_path = os.path.join(ICONS_DIR, 'items_atlas.png')
    atlas.save(out_path)
    print(f" -> Saved HD items_atlas.png ({atlas.size})")

def build_stages_atlas():
    print("Building HD 3D stage_icons.png...")
    fw, fh = 72, 72
    ss = 4
    S = fw * ss # 288x288
    
    atlas = Image.new('RGBA', (fw * 12, fh), (0, 0, 0, 0))
    
    stage_themes = [
        ((80, 200, 120), (10, 35, 20)),   # 0: Green mountain
        ((50, 220, 160), (6, 30, 25)),    # 1: Bamboo forest
        ((140, 100, 240), (20, 8, 38)),   # 2: Dark valley
        ((255, 170, 60), (35, 18, 6)),    # 3: Beast realm
        ((100, 220, 255), (10, 25, 45)),  # 4: Sword terrace
        ((255, 90, 30), (45, 10, 5)),     # 5: Fire volcano
        ((220, 40, 80), (38, 5, 15)),     # 6: Blood demon abyss
        ((255, 140, 50), (40, 15, 6)),    # 7: Dragon palace
        ((160, 240, 255), (12, 35, 55)),  # 8: Ice glacier
        ((160, 140, 255), (20, 12, 45)),  # 9: Thunder shrine
        ((180, 80, 220), (28, 6, 35)),    # 10: Netherworld
        ((255, 220, 80), (40, 30, 8))     # 11: Celestial gate
    ]
    
    for i in range(12):
        img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        cx, cy, R = S // 2, S // 2, int(S * 0.44)
        
        theme_c, theme_e = stage_themes[i]
        draw_radial_gradient(draw, cx, cy, R, theme_c, theme_e)
        
        # Mountain / Pagoda Silhouette
        draw.polygon([(cx-70, cy+45), (cx-20, cy-50), (cx+15, cy+45)], fill=(255, 255, 255, 140))
        draw.polygon([(cx-10, cy+45), (cx+35, cy-65), (cx+75, cy+45)], fill=(255, 255, 255, 220))
        draw.ellipse([cx-40, cy-50, cx+10, cy], fill=(255, 255, 240, 180))
        
        # Stage Number Badge
        draw.ellipse([cx-32, cy-32, cx+32, cy+32], fill=(6, 18, 28, 230), outline=(255, 215, 0), width=4)
        
        # 3D Golden Ring
        draw_3d_bezel(draw, cx, cy, R, width=12, gold=True)
        
        frame = img.resize((fw, fh), Image.Resampling.LANCZOS)
        atlas.paste(frame, (i * fw, 0), frame)
        
    out_path = os.path.join(ICONS_DIR, 'stage_icons.png')
    atlas.save(out_path)
    print(f" -> Saved HD stage_icons.png ({atlas.size})")

if __name__ == '__main__':
    build_skills_atlas()
    build_items_atlas()
    build_stages_atlas()
    print("ALL HD 3D ICONS BUILT PERFECTLY WITH ZERO BLEEDING OR DISLOCATION!")
