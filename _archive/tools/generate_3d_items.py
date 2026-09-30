import os
import math
from PIL import Image, ImageDraw, ImageFilter

BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'
ICONS_BASE = r'H:\GOOGLE DRIVER\GAME\assets\icons'
ITEMS_DIR = os.path.join(ICONS_BASE, 'items')
os.makedirs(ITEMS_DIR, exist_ok=True)

def create_item_icon(item_type, tier, size=128):
    """
    Renders a high-end 3D Xianxia Item Icon:
    item_type:
      0: Tiên Kiếm (Flying Sword)
      1: Chiến Giáp (Daoist Robe / Immortal Plate)
      2: Đạo Quan (Daoist Jade Crown)
      3: Tiên Hài (Cloud Stepping Boots)
      4: Càn Khôn Giới (Spatial Dragon Ring)
      5: Hộ Thể Phù (Taiji Jade Seal / Talisman)
    tier:
      0: Azure Spirit (Cyan / Jade / Silver)
      1: Mystic Purple (Purple / Violet / Platinum)
      2: Imperial Gold (Golden Dragon / Ruby / Celestial)
    """
    palettes = [
        {'rim': (140, 210, 255, 255), 'rim_dark': (20, 60, 100, 255), 'glow': (50, 180, 255, 180), 'main': (210, 245, 255), 'sec': (70, 160, 230), 'gold': (230, 210, 140), 'gem': (0, 255, 220)},
        {'rim': (225, 165, 255, 255), 'rim_dark': (70, 25, 105, 255), 'glow': (190, 70, 255, 190), 'main': (245, 225, 255), 'sec': (160, 85, 230), 'gold': (245, 195, 110), 'gem': (255, 110, 245)},
        {'rim': (255, 225, 130, 255), 'rim_dark': (100, 55, 15, 255), 'glow': (255, 170, 30, 210), 'main': (255, 248, 210), 'sec': (235, 145, 35), 'gold': (255, 220, 10), 'gem': (255, 65, 65)}
    ]
    p = palettes[tier]
    
    # 2x supersampling for high fidelity
    S = size * 2
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = S // 2, S // 2
    r_medallion = int(S * 0.42)
    
    # Outer mystic glow
    glow_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.ellipse([cx - r_medallion - 6, cy - r_medallion - 6, cx + r_medallion + 6, cy + r_medallion + 6], fill=p['glow'])
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(12))
    img.paste(glow_img, (0, 0), glow_img)
    
    # Base dark circular plate (Obsidian / Deep Jade)
    draw.ellipse([cx - r_medallion, cy - r_medallion, cx + r_medallion, cy + r_medallion], fill=(12, 16, 26, 255))
    
    # Gradient rings on rim
    for i in range(7):
        rad = r_medallion - i
        ratio = i / 7.0
        color = (
            int(p['rim'][0] * (1 - ratio) + p['rim_dark'][0] * ratio),
            int(p['rim'][1] * (1 - ratio) + p['rim_dark'][1] * ratio),
            int(p['rim'][2] * (1 - ratio) + p['rim_dark'][2] * ratio),
            255
        )
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=color, width=2)
    
    # Inner dark velvet background
    inner_rad = r_medallion - 9
    draw.ellipse([cx - inner_rad, cy - inner_rad, cx + inner_rad, cy + inner_rad], fill=(8, 12, 20, 255))
    
    # Inner mystical runic circle
    for a in range(0, 360, 30):
        rad_a = math.radians(a)
        px = cx + math.cos(rad_a) * (inner_rad - 6)
        py = cy + math.sin(rad_a) * (inner_rad - 6)
        draw.ellipse([px-2, py-2, px+2, py+2], fill=p['gold'])
    
    # Draw item specific graphics:
    if item_type == 0: # WEAPON (Flying Sword)
        blade_len = int(S * 0.32)
        angle = -45
        rad_ang = math.radians(angle)
        
        tip = (cx + math.cos(rad_ang) * blade_len, cy + math.sin(rad_ang) * blade_len)
        base = (cx - math.cos(rad_ang) * (blade_len * 0.3), cy - math.sin(rad_ang) * (blade_len * 0.3))
        perp_ang = rad_ang + math.pi / 2
        w = 12
        left_p = (base[0] + math.cos(perp_ang) * w, base[1] + math.sin(perp_ang) * w)
        right_p = (base[0] - math.cos(perp_ang) * w, base[1] - math.sin(perp_ang) * w)
        
        # Blade glow
        draw.line([base, tip], fill=p['glow'], width=22)
        # Blade body
        draw.polygon([left_p, tip, (base[0], base[1])], fill=p['main'])
        draw.polygon([right_p, tip, (base[0], base[1])], fill=p['sec'])
        # Blade centerline
        draw.line([base, tip], fill=(255, 255, 255, 255), width=3)
        
        # Guard
        g_w = 26
        g_left = (base[0] + math.cos(perp_ang) * g_w, base[1] + math.sin(perp_ang) * g_w)
        g_right = (base[0] - math.cos(perp_ang) * g_w, base[1] - math.sin(perp_ang) * g_w)
        draw.line([g_left, g_right], fill=p['gold'], width=10)
        draw.ellipse([base[0]-6, base[1]-6, base[0]+6, base[1]+6], fill=p['gem'])
        
        # Handle & Pommel
        h_end = (base[0] - math.cos(rad_ang) * 28, base[1] - math.sin(rad_ang) * 28)
        draw.line([base, h_end], fill=(60, 30, 10, 255), width=7)
        draw.ellipse([h_end[0]-7, h_end[1]-7, h_end[0]+7, h_end[1]+7], fill=p['gold'])
        
    elif item_type == 1: # ARMOR (Immortal Robe / Chestplate)
        # Neck / collar
        draw.ellipse([cx-18, cy-36, cx+18, cy-22], fill=p['gold'])
        # Shoulders
        draw.polygon([(cx-48, cy-26), (cx-20, cy-34), (cx-14, cy-6), (cx-44, cy+4)], fill=p['gold'])
        draw.polygon([(cx+48, cy-26), (cx+20, cy-34), (cx+14, cy-6), (cx+44, cy+4)], fill=p['gold'])
        # Chest plate
        draw.polygon([(cx-26, cy-24), (cx+26, cy-24), (cx+32, cy+20), (cx, cy+44), (cx-32, cy+20)], fill=p['main'])
        draw.polygon([(cx-20, cy-18), (cx+20, cy-18), (cx+24, cy+16), (cx, cy+36), (cx-24, cy+16)], fill=p['sec'])
        # Core gem
        draw.ellipse([cx-12, cy-6, cx+12, cy+18], fill=p['gold'])
        draw.ellipse([cx-8, cy-2, cx+8, cy+14], fill=p['gem'])
        # Rib ribbons / sash
        draw.line([(cx-24, cy+16), (cx-36, cy+48)], fill=p['gold'], width=5)
        draw.line([(cx+24, cy+16), (cx+36, cy+48)], fill=p['gold'], width=5)
        
    elif item_type == 2: # HELM (Daoist Crown / Phoenix Tiara)
        draw.arc([cx-36, cy-10, cx+36, cy+30], start=10, end=170, fill=p['gold'], width=8)
        peaks = [
            [(cx-32, cy+10), (cx-38, cy-24), (cx-20, cy-10)],
            [(cx-18, cy+6), (cx-14, cy-38), (cx, cy-12)],
            [(cx+18, cy+6), (cx+14, cy-38), (cx, cy-12)],
            [(cx+32, cy+10), (cx+38, cy-24), (cx+20, cy-10)],
            [(cx-12, cy+2), (cx, cy-52), (cx+12, cy+2)]
        ]
        for poly in peaks:
            draw.polygon(poly, fill=p['gold'])
        draw.ellipse([cx-12, cy-14, cx+12, cy+10], fill=p['sec'])
        draw.ellipse([cx-8, cy-10, cx+8, cy+6], fill=p['gem'])
        draw.line([(cx-54, cy-4), (cx+54, cy-4)], fill=p['main'], width=5)
        draw.ellipse([cx-58, cy-7, cx-50, cy-1], fill=p['gold'])
        draw.ellipse([cx+50, cy-7, cx+58, cy-1], fill=p['gold'])
        
    elif item_type == 3: # BOOTS (Cloud Stepping Boots)
        # Left boot
        draw.polygon([(cx-40, cy-32), (cx-18, cy-32), (cx-20, cy+10), (cx-44, cy+26), (cx-52, cy+20), (cx-38, cy+4)], fill=p['sec'])
        draw.polygon([(cx-36, cy-28), (cx-22, cy-28), (cx-24, cy+8), (cx-42, cy+20), (cx-36, cy+4)], fill=p['main'])
        draw.polygon([(cx-40, cy-24), (cx-62, cy-38), (cx-42, cy-10)], fill=p['gold'])
        # Right boot
        draw.polygon([(cx+18, cy-32), (cx+40, cy-32), (cx+38, cy+4), (cx+52, cy+20), (cx+44, cy+26), (cx+20, cy+10)], fill=p['sec'])
        draw.polygon([(cx+22, cy-28), (cx+36, cy-28), (cx+36, cy+4), (cx+42, cy+20), (cx+24, cy+8)], fill=p['main'])
        draw.polygon([(cx+40, cy-24), (cx+62, cy-38), (cx+42, cy-10)], fill=p['gold'])
        # Cloud swirl
        draw.arc([cx-34, cy+18, cx+34, cy+44], start=0, end=180, fill=p['gold'], width=6)
        
    elif item_type == 4: # RING (Spatial / Dragon Ring)
        draw.ellipse([cx-42, cy-26, cx+42, cy+42], fill=p['gold'])
        draw.ellipse([cx-30, cy-14, cx+30, cy+32], fill=(12, 16, 26, 255))
        draw.ellipse([cx-28, cy-12, cx+28, cy+30], fill=(8, 12, 20, 255))
        gem_poly = [(cx, cy-48), (cx+24, cy-28), (cx+16, cy-10), (cx-16, cy-10), (cx-24, cy-28)]
        draw.polygon(gem_poly, fill=p['gem'])
        draw.polygon([(cx, cy-48), (cx+12, cy-26), (cx, cy-12), (cx-12, cy-26)], fill=p['main'])
        draw.line([(cx-18, cy-12), (cx-24, cy-30)], fill=p['gold'], width=5)
        draw.line([(cx+18, cy-12), (cx+24, cy-30)], fill=p['gold'], width=5)
        
    elif item_type == 5: # TALISMAN / PENDANT (Taiji Yin-Yang Jade Seal)
        draw.line([(cx, cy-52), (cx, cy-30)], fill=(200, 30, 30, 255), width=5)
        draw.ellipse([cx-8, cy-38, cx+8, cy-22], fill=p['gold'])
        m_r = 34
        draw.ellipse([cx-m_r-4, cy+4-m_r-4, cx+m_r+4, cy+4+m_r+4], fill=p['gold'])
        draw.ellipse([cx-m_r, cy+4-m_r, cx+m_r, cy+4+m_r], fill=p['sec'])
        draw.pieslice([cx-m_r, cy+4-m_r, cx+m_r, cy+4+m_r], 90, 270, fill=p['main'])
        draw.ellipse([cx-m_r//2, cy+4-m_r, cx+m_r//2, cy+4], fill=p['main'])
        draw.ellipse([cx-m_r//2, cy+4, cx+m_r//2, cy+4+m_r], fill=p['sec'])
        draw.ellipse([cx-6, cy+4-m_r//2-6, cx+6, cy+4-m_r//2+6], fill=p['sec'])
        draw.ellipse([cx-6, cy+4+m_r//2-6, cx+6, cy+4+m_r//2+6], fill=p['main'])
        draw.polygon([(cx, cy+4+m_r), (cx-12, cy+52), (cx+12, cy+52)], fill=(220, 30, 30, 255))
        draw.ellipse([cx-6, cy+4+m_r-2, cx+6, cy+4+m_r+10], fill=p['gold'])

    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def generate_all_items():
    print("=== Rendering 18 HD 3D Xianxia Items ===")
    atlas = Image.new('RGBA', (80 * 18, 80), (0, 0, 0, 0))
    for tier in range(3):
        for item_type in range(6):
            frame_idx = tier * 6 + item_type
            icon = create_item_icon(item_type, tier, size=128)
            out_p = os.path.join(ITEMS_DIR, f'item_{frame_idx}.png')
            icon.save(out_p)
            
            # Place in atlas (centered with 8px margin inside 80x80)
            small_icon = icon.resize((64, 64), Image.Resampling.LANCZOS)
            atlas.paste(small_icon, (frame_idx * 80 + 8, 8), small_icon)
            print(f" -> Generated {out_p}")
            
    atlas_path = os.path.join(ICONS_BASE, 'items_atlas.png')
    atlas.save(atlas_path)
    print(f" -> Updated {atlas_path}")

if __name__ == '__main__':
    generate_all_items()
