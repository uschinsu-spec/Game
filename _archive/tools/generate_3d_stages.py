import os
import math
from PIL import Image, ImageDraw, ImageFilter

BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'
ICONS_BASE = r'H:\GOOGLE DRIVER\GAME\assets\icons'
STAGES_DIR = os.path.join(ICONS_BASE, 'stages')
os.makedirs(STAGES_DIR, exist_ok=True)

def create_stage_portal(stage_idx, size=128):
    """
    Renders an exquisite 3D Xianxia Realm Portal Medallion for Stage [0..11]:
    0: Linh Sơn Ngoại Vi (Misty Green Mountain & Pagoda)
    1: Thanh Trúc Lâm (Emerald Bamboo Sea)
    2: Hắc Phong Cốc (Dark Wind Thunder Canyon)
    3: Yêu Thú Sơn (Ancient Red Beast Ridge)
    4: Thiên Kiếm Đài (Floating Heavenly Sword Peaks)
    5: Hỏa Diệm Cốc (Lava / Magma Abyss)
    6: Ma Vực (Blood Moon Demon Domain)
    7: Xích Diệm Thiên (Crimson Dragon Inferno)
    8: Băng Phách Sơn (Frost Glaciers & Crystal Mountain)
    9: Lôi Đình Cảnh (Thunderstorm Vortex)
    10: U Minh Thiên (Netherworld Gate of Souls)
    11: Thiên Môn Đỉnh (Golden Heavenly Palace Gate)
    """
    S = size * 2  # 256 for supersampling
    cx, cy = S // 2, S // 2
    r_medallion = int(S * 0.44)
    r_inner = r_medallion - 12
    
    # Outer base
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Portal themes config
    themes = [
        # 0: Linh Sơn
        {'sky': (160, 220, 240), 'horizon': (200, 240, 255), 'rim': (220, 180, 80), 'glow': (100, 220, 180, 180)},
        # 1: Thanh Trúc Lâm
        {'sky': (40, 140, 90), 'horizon': (120, 220, 160), 'rim': (180, 200, 90), 'glow': (60, 240, 140, 180)},
        # 2: Hắc Phong Cốc
        {'sky': (25, 25, 55), 'horizon': (70, 70, 130), 'rim': (160, 170, 210), 'glow': (100, 120, 255, 180)},
        # 3: Yêu Thú Sơn
        {'sky': (180, 90, 40), 'horizon': (240, 180, 110), 'rim': (220, 140, 60), 'glow': (255, 140, 40, 180)},
        # 4: Thiên Kiếm Đài
        {'sky': (120, 180, 230), 'horizon': (210, 235, 255), 'rim': (210, 215, 230), 'glow': (140, 220, 255, 180)},
        # 5: Hỏa Diệm Cốc
        {'sky': (80, 20, 10), 'horizon': (200, 60, 20), 'rim': (230, 110, 40), 'glow': (255, 80, 20, 190)},
        # 6: Ma Vực
        {'sky': (45, 15, 60), 'horizon': (110, 40, 140), 'rim': (190, 110, 230), 'glow': (200, 50, 255, 190)},
        # 7: Xích Diệm Thiên
        {'sky': (120, 30, 20), 'horizon': (255, 120, 40), 'rim': (245, 160, 50), 'glow': (255, 120, 30, 200)},
        # 8: Băng Phách Sơn
        {'sky': (140, 210, 255), 'horizon': (220, 245, 255), 'rim': (180, 230, 255), 'glow': (120, 230, 255, 190)},
        # 9: Lôi Đình Cảnh
        {'sky': (30, 35, 70), 'horizon': (100, 120, 200), 'rim': (160, 190, 255), 'glow': (140, 180, 255, 190)},
        # 10: U Minh Thiên
        {'sky': (25, 10, 40), 'horizon': (80, 30, 110), 'rim': (150, 100, 210), 'glow': (180, 70, 255, 190)},
        # 11: Thiên Môn Đỉnh
        {'sky': (255, 200, 80), 'horizon': (255, 245, 180), 'rim': (255, 225, 90), 'glow': (255, 215, 60, 210)},
    ]
    t = themes[stage_idx]
    
    # Outer glow
    glow_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.ellipse([cx - r_medallion - 8, cy - r_medallion - 8, cx + r_medallion + 8, cy + r_medallion + 8], fill=t['glow'])
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(14))
    img.paste(glow_img, (0, 0), glow_img)
    
    # Inside Landscape Layer (clipped to circle)
    landscape = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    l_draw = ImageDraw.Draw(landscape)
    
    # Sky gradient
    for y in range(cy - r_inner, cy + r_inner):
        ratio = (y - (cy - r_inner)) / float(r_inner * 2)
        sky_c = (
            int(t['sky'][0] * (1 - ratio) + t['horizon'][0] * ratio),
            int(t['sky'][1] * (1 - ratio) + t['horizon'][1] * ratio),
            int(t['sky'][2] * (1 - ratio) + t['horizon'][2] * ratio),
            255
        )
        l_draw.line([(cx - r_inner, y), (cx + r_inner, y)], fill=sky_c)
        
    # Draw themed terrain
    if stage_idx == 0: # Linh Sơn (Green mountains, waterfall, pagoda)
        # Distant peaks
        l_draw.polygon([(cx-80, cy+40), (cx-40, cy-30), (cx, cy+40)], fill=(80, 140, 120, 255))
        l_draw.polygon([(cx-10, cy+40), (cx+40, cy-50), (cx+90, cy+40)], fill=(60, 120, 100, 255))
        # Waterfall
        l_draw.polygon([(cx+35, cy-10), (cx+45, cy-10), (cx+48, cy+60), (cx+32, cy+60)], fill=(220, 250, 255, 230))
        # Pagoda roof
        l_draw.polygon([(cx-55, cy+15), (cx-35, cy-5), (cx-15, cy+15)], fill=(180, 60, 40, 255))
        l_draw.rectangle([cx-42, cy+15, cx-28, cy+32], fill=(220, 190, 120, 255))
        # Fore mountains
        l_draw.polygon([(cx-90, cy+70), (cx-30, cy+10), (cx+20, cy+70)], fill=(40, 90, 60, 255))
        l_draw.polygon([(cx, cy+70), (cx+50, cy+25), (cx+90, cy+70)], fill=(30, 80, 50, 255))
        
    elif stage_idx == 1: # Bamboo Sea
        # Bamboo stalks
        for x in range(cx - 70, cx + 75, 18):
            l_draw.line([(x, cy - 60), (x, cy + 70)], fill=(30, 90, 50, 255), width=7)
            l_draw.line([(x, cy - 60), (x, cy + 70)], fill=(60, 160, 90, 255), width=3)
            # nodes
            for ny in range(cy - 40, cy + 60, 25):
                l_draw.line([(x-4, ny), (x+4, ny)], fill=(180, 220, 120, 255), width=2)
        # Bamboo leaves
        for lx, ly in [(cx-30, cy-20), (cx+20, cy-35), (cx-50, cy+10), (cx+40, cy+5)]:
            l_draw.polygon([(lx, ly), (lx+18, ly-10), (lx+32, ly)], fill=(80, 200, 100, 255))

    elif stage_idx == 2: # Dark Wind Thunder Canyon
        # Jagged cliff sides
        l_draw.polygon([(cx-80, cy-60), (cx-30, cy-20), (cx-50, cy+30), (cx-80, cy+70)], fill=(30, 30, 50, 255))
        l_draw.polygon([(cx+80, cy-60), (cx+30, cy-15), (cx+55, cy+35), (cx+80, cy+70)], fill=(20, 20, 40, 255))
        # Lightning Bolt
        bolt = [(cx-5, cy-55), (cx+8, cy-25), (cx-4, cy-15), (cx+12, cy+25), (cx-2, cy+32), (cx+5, cy+65)]
        l_draw.line(bolt, fill=(255, 255, 255, 255), width=4)
        l_draw.line(bolt, fill=(180, 200, 255, 180), width=10)

    elif stage_idx == 3: # Ancient Red Beast Ridge
        # Sun
        l_draw.ellipse([cx-25, cy-50, cx+25, cy], fill=(255, 220, 140, 255))
        # Red crags
        l_draw.polygon([(cx-80, cy+50), (cx-35, cy-10), (cx+10, cy+50)], fill=(160, 70, 30, 255))
        l_draw.polygon([(cx-20, cy+60), (cx+40, cy-25), (cx+90, cy+60)], fill=(120, 50, 20, 255))
        l_draw.polygon([(cx-90, cy+70), (cx, cy+20), (cx+90, cy+70)], fill=(90, 35, 15, 255))

    elif stage_idx == 4: # Floating Sword Peaks
        # Floating island
        l_draw.polygon([(cx-55, cy+20), (cx+55, cy+20), (cx+30, cy+60), (cx, cy+75), (cx-30, cy+60)], fill=(70, 90, 110, 255))
        l_draw.polygon([(cx-45, cy+18), (cx+45, cy+18), (cx+25, cy+50), (cx-25, cy+50)], fill=(120, 150, 180, 255))
        # Giant Heavenly Sword plunged into rock
        l_draw.polygon([(cx-8, cy+15), (cx+8, cy+15), (cx, cy-65)], fill=(230, 245, 255, 255))
        l_draw.line([(cx, cy-65), (cx, cy+15)], fill=(120, 200, 255, 255), width=2)
        l_draw.line([(cx-16, cy-35), (cx+16, cy-35)], fill=(220, 190, 80, 255), width=5)
        l_draw.line([(cx, cy-35), (cx, cy-50)], fill=(180, 150, 60, 255), width=4)

    elif stage_idx == 5: # Lava Abyss
        # Dark rocks
        l_draw.polygon([(cx-80, cy-30), (cx-25, cy+15), (cx-80, cy+70)], fill=(40, 15, 10, 255))
        l_draw.polygon([(cx+80, cy-30), (cx+25, cy+10), (cx+80, cy+70)], fill=(30, 10, 8, 255))
        # Lava rivers
        l_draw.polygon([(cx-25, cy+15), (cx+25, cy+10), (cx+60, cy+70), (cx-60, cy+70)], fill=(255, 60, 10, 255))
        l_draw.polygon([(cx-15, cy+20), (cx+15, cy+16), (cx+35, cy+70), (cx-35, cy+70)], fill=(255, 200, 30, 255))

    elif stage_idx == 6: # Blood Moon Demon Domain
        # Blood Moon
        l_draw.ellipse([cx-32, cy-52, cx+32, cy+12], fill=(220, 40, 60, 255))
        # Dark spires
        l_draw.polygon([(cx-70, cy+60), (cx-45, cy-20), (cx-20, cy+60)], fill=(35, 15, 45, 255))
        l_draw.polygon([(cx+10, cy+60), (cx+40, cy-35), (cx+70, cy+60)], fill=(25, 10, 35, 255))
        l_draw.polygon([(cx-40, cy+70), (cx, cy+10), (cx+40, cy+70)], fill=(15, 5, 25, 255))

    elif stage_idx == 7: # Crimson Dragon Inferno
        # Dragon horns / flame arches
        l_draw.arc([cx-60, cy-50, cx+60, cy+60], 180, 360, fill=(255, 120, 20, 255), width=10)
        l_draw.polygon([(cx-70, cy+60), (cx-20, cy+10), (cx+30, cy+60)], fill=(140, 30, 10, 255))
        l_draw.polygon([(cx, cy+60), (cx+45, cy-15), (cx+80, cy+60)], fill=(180, 50, 15, 255))
        # Fire burst
        l_draw.polygon([(cx-25, cy+50), (cx, cy-40), (cx+25, cy+50)], fill=(255, 220, 40, 220))

    elif stage_idx == 8: # Frozen Ice Crystal Mountain
        # Glacier peaks
        l_draw.polygon([(cx-80, cy+50), (cx-35, cy-45), (cx+15, cy+50)], fill=(160, 220, 255, 255))
        l_draw.polygon([(cx-10, cy+50), (cx+45, cy-60), (cx+90, cy+50)], fill=(190, 235, 255, 255))
        # Ice shards
        l_draw.polygon([(cx-25, cy+70), (cx-5, cy+10), (cx+15, cy+70)], fill=(220, 245, 255, 255))
        l_draw.line([(cx-35, cy-45), (cx-10, cy+50)], fill=(255, 255, 255, 255), width=3)
        l_draw.line([(cx+45, cy-60), (cx+30, cy+50)], fill=(255, 255, 255, 255), width=3)

    elif stage_idx == 9: # Thunderstorm Vortex
        # Swirling storm vortex
        for r in range(20, 80, 12):
            l_draw.arc([cx-r, cy-r, cx+r, cy+r], 0, 260, fill=(140, 170, 255, 200), width=5)
        # Central eye
        l_draw.ellipse([cx-15, cy-15, cx+15, cy+15], fill=(220, 240, 255, 255))
        # Lightning
        l_draw.line([(cx-40, cy-40), (cx-10, cy-5), (cx+5, cy-25), (cx+45, cy+35)], fill=(255, 255, 255, 255), width=4)

    elif stage_idx == 10: # Netherworld Gate
        # Nether portal arch
        l_draw.polygon([(cx-45, cy+60), (cx-45, cy-20), (cx, cy-55), (cx+45, cy-20), (cx+45, cy+60), (cx+30, cy+60), (cx+30, cy-10), (cx, cy-40), (cx-30, cy-10), (cx-30, cy+60)], fill=(80, 40, 110, 255))
        # Portal void
        l_draw.ellipse([cx-28, cy-35, cx+28, cy+55], fill=(180, 60, 255, 220))
        l_draw.ellipse([cx-16, cy-20, cx+16, cy+40], fill=(240, 160, 255, 255))

    elif stage_idx == 11: # Heavenly Golden Palace Gate
        # Heavenly ascension beams
        for deg in range(0, 180, 25):
            rad = math.radians(deg)
            l_draw.line([(cx, cy), (cx + math.cos(rad)*100, cy - math.sin(rad)*100)], fill=(255, 245, 160, 180), width=6)
        # Golden Heavenly Gate
        # Roof tiers
        l_draw.polygon([(cx-65, cy-10), (cx, cy-45), (cx+65, cy-10)], fill=(255, 190, 40, 255))
        l_draw.polygon([(cx-50, cy+10), (cx, cy-20), (cx+50, cy+10)], fill=(255, 215, 60, 255))
        # Pillars
        l_draw.rectangle([cx-42, cy+10, cx-30, cy+65], fill=(230, 160, 20, 255))
        l_draw.rectangle([cx+30, cy+10, cx+42, cy+65], fill=(230, 160, 20, 255))
        # Arch
        l_draw.polygon([(cx-30, cy+25), (cx, cy+10), (cx+30, cy+25), (cx+30, cy+65), (cx-30, cy+65)], fill=(255, 240, 160, 255))

    # Mask landscape to inner circle
    l_mask = Image.new('L', (S, S), 0)
    l_mask_draw = ImageDraw.Draw(l_mask)
    l_mask_draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], fill=255)
    landscape.putalpha(l_mask)
    img.paste(landscape, (0, 0), landscape)
    
    # Draw 3D Engraved Bezel / Golden Dragon Frame over portal
    for i in range(12):
        rad = r_medallion - i
        ratio = i / 12.0
        rim_c = (
            int(t['rim'][0] * (1 - ratio*0.4)),
            int(t['rim'][1] * (1 - ratio*0.4)),
            int(t['rim'][2] * (1 - ratio*0.4)),
            255
        )
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=rim_c, width=2)
        
    # Celestial pearls on outer rim
    for a in range(0, 360, 30):
        rad_a = math.radians(a)
        px = cx + math.cos(rad_a) * (r_medallion - 6)
        py = cy + math.sin(rad_a) * (r_medallion - 6)
        draw.ellipse([px-3, py-3, px+3, py+3], fill=(255, 245, 180, 255))
        
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def generate_all_stages():
    print("=== Rendering 12 HD 3D Xianxia Stage Portals ===")
    atlas = Image.new('RGBA', (72 * 12, 72), (0, 0, 0, 0))
    for i in range(12):
        icon = create_stage_portal(i, size=128)
        out_p = os.path.join(STAGES_DIR, f'stage_{i}.png')
        icon.save(out_p)
        
        # Place in atlas (centered with 7px margin inside 72x72)
        small_icon = icon.resize((58, 58), Image.Resampling.LANCZOS)
        atlas.paste(small_icon, (i * 72 + 7, 7), small_icon)
        print(f" -> Generated {out_p}")
        
    atlas_path = os.path.join(ICONS_BASE, 'stage_icons.png')
    atlas.save(atlas_path)
    print(f" -> Updated {atlas_path}")

if __name__ == '__main__':
    generate_all_stages()
