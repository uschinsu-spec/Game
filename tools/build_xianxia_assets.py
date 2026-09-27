import math
import os
from PIL import Image, ImageDraw, ImageFilter

SCALE = 4

def hex_to_rgba(hex_str, alpha=255):
    hex_str = hex_str.lstrip('#')
    r, g, b = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    return (r, g, b, alpha)

def create_radial_gradient(size, inner_color, outer_color):
    w, h = size
    im = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    max_r = math.hypot(w/2, h/2)
    cx, cy = w / 2, h / 2
    for r in range(int(max_r), 0, -1):
        t = r / max_r
        c = (
            int(inner_color[0] * (1 - t) + outer_color[0] * t),
            int(inner_color[1] * (1 - t) + outer_color[1] * t),
            int(inner_color[2] * (1 - t) + outer_color[2] * t),
            int(inner_color[3] * (1 - t) + outer_color[3] * t),
        )
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
    return im

def draw_3d_frame(draw, cx, cy, radius, fill_bg=(15, 23, 42, 255), border_gold=True):
    r = radius
    # 1. Outer Dark Shadow
    draw.ellipse([cx - r - 4*SCALE, cy - r - 2*SCALE, cx + r + 4*SCALE, cy + r + 6*SCALE], fill=(5, 8, 15, 180))

    # 2. Outer 3D Beveled Ring (Gold / Dragon Bronze)
    if border_gold:
        for i in range(int(6 * SCALE)):
            t = i / (6 * SCALE)
            # Top-left highlight (shining gold), bottom-right shadow (bronze)
            col_tl = (255, 235, 140, 255)
            col_br = (120, 75, 15, 255)
            col_mid = (212, 160, 23, 255)
            draw.ellipse([cx - r + i, cy - r + i, cx + r - i, cy + r - i], outline=col_mid, width=1)
        # Highlight rim arc
        draw.arc([cx - r + SCALE, cy - r + SCALE, cx + r - SCALE, cy + r - SCALE], 190, 350, fill=(255, 250, 205, 255), width=int(2.5*SCALE))
        draw.arc([cx - r + SCALE, cy - r + SCALE, cx + r - SCALE, cy + r - SCALE], 10, 170, fill=(70, 42, 8, 255), width=int(2.5*SCALE))

        # 4 Ornate Golden Studs/Claws at N, S, E, W
        stud_dist = r - 3 * SCALE
        for ang in (0, 90, 180, 270):
            rad = math.radians(ang)
            sx = cx + math.cos(rad) * stud_dist
            sy = cy + math.sin(rad) * stud_dist
            draw.ellipse([sx - 3.5*SCALE, sy - 3.5*SCALE, sx + 3.5*SCALE, sy + 3.5*SCALE], fill=(255, 223, 100, 255), outline=(130, 80, 10, 255), width=int(1*SCALE))
            draw.ellipse([sx - 1.5*SCALE, sy - 1.5*SCALE, sx + 1.5*SCALE, sy + 1.5*SCALE], fill=(255, 255, 240, 255))
    else:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(40, 50, 65, 255), outline=(100, 120, 140, 255), width=int(3*SCALE))

    # 3. Inner Dark Jade/Celestial Well
    inner_r = r - 6 * SCALE
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=fill_bg)
    # Inner ambient shadow ring
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], outline=(5, 10, 20, 220), width=int(3*SCALE))

# ----------------------------------------------------------------------
# SKILL ICONS (10 Icons, 96x96 px)
# ----------------------------------------------------------------------
def render_skill_icon(skill_idx):
    size = 96 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size / 2, size / 2
    r = 44 * SCALE

    # Background color scheme by element/skill
    bg_palettes = [
        (10, 35, 30, 255),   # 0: Qingyun Jade / Wood
        (35, 28, 10, 255),   # 1: Golden Heaven Sword Rain
        (25, 15, 45, 255),   # 2: Purple Thunder
        (10, 30, 50, 255),   # 3: Frost Ice Glacial
        (45, 15, 10, 255),   # 4: Blazing Flame Phoenix
        (40, 32, 10, 255),   # 5: Omnipresent Golden Taiji
        (15, 38, 42, 255),   # 6: Wind Flash Dash
        (12, 30, 48, 255),   # 7: Celestial Flying Sword
        (10, 25, 45, 255),   # 8: Seven Star Constellation
        (42, 34, 12, 255),   # 9: Golden Bell Aegis
    ]

    draw_3d_frame(draw, cx, cy, r, fill_bg=bg_palettes[skill_idx], border_gold=True)

    # Inner Glow layer
    glow_im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_im)

    if skill_idx == 0:
        # 0: THANH VÂN KIẾM KHÍ (3D Emerald Jade Sword + Swirling Cyan Qi Blades)
        # Swirling Wind/Aura Rings
        for i in range(3):
            glow_draw.arc([cx - (26+i*4)*SCALE, cy - (26+i*4)*SCALE, cx + (26+i*4)*SCALE, cy + (26+i*4)*SCALE], 40 + i*60, 200 + i*60, fill=(34, 211, 238, 180), width=int(3*SCALE))
        # Sword diagonal from top-right to bottom-left
        glow_draw.line([(cx + 26*SCALE, cy - 26*SCALE), (cx - 24*SCALE, cy + 24*SCALE)], fill=(52, 211, 153, 200), width=int(12*SCALE))
        # Solid 3D Sword
        draw.polygon([
            (cx + 28*SCALE, cy - 28*SCALE),
            (cx - 16*SCALE, cy + 16*SCALE),
            (cx - 18*SCALE, cy + 24*SCALE),
            (cx - 24*SCALE, cy + 18*SCALE),
            (cx - 16*SCALE, cy + 16*SCALE),
        ], fill=(240, 253, 250, 255))
        draw.line([(cx + 28*SCALE, cy - 28*SCALE), (cx - 16*SCALE, cy + 16*SCALE)], fill=(45, 212, 191, 255), width=int(4*SCALE))
        # Jade Hilt & Gold Guard
        draw.line([(cx - 14*SCALE, cy + 10*SCALE), (cx - 8*SCALE, cy + 22*SCALE)], fill=(251, 191, 36, 255), width=int(6*SCALE))
        draw.ellipse([cx - 22*SCALE, cy + 18*SCALE, cx - 14*SCALE, cy + 26*SCALE], fill=(16, 185, 129, 255), outline=(255, 230, 100, 255), width=int(1.5*SCALE))

    elif skill_idx == 1:
        # 1: VẠN KIẾM VŨ (3D Golden Celestial Sword Rain)
        # Golden sky radiant rays
        for a in range(-45, 46, 18):
            rad = math.radians(a + 90)
            glow_draw.line([(cx, cy - 25*SCALE), (cx + math.cos(rad)*45*SCALE, cy - 25*SCALE + math.sin(rad)*45*SCALE)], fill=(253, 224, 71, 120), width=int(3*SCALE))
        # 5 Golden Flying Swords descending
        offsets = [(-16, -10, 0.8), (0, -4, 1.2), (16, -10, 0.8), (-8, 10, 0.9), (10, 12, 0.9)]
        for sx, sy, sc in offsets:
            px, py = cx + sx*SCALE, cy + sy*SCALE
            # Golden Blade
            draw.polygon([
                (px, py + 18*SCALE*sc),
                (px - 3.5*SCALE*sc, py - 10*SCALE*sc),
                (px + 3.5*SCALE*sc, py - 10*SCALE*sc)
            ], fill=(254, 240, 138, 255))
            draw.line([(px, py + 18*SCALE*sc), (px, py - 10*SCALE*sc)], fill=(255, 255, 255, 255), width=int(2*SCALE*sc))
            # Crossguard & Hilt
            draw.line([(px - 6*SCALE*sc, py - 10*SCALE*sc), (px + 6*SCALE*sc, py - 10*SCALE*sc)], fill=(217, 119, 6, 255), width=int(3*SCALE*sc))
            draw.line([(px, py - 10*SCALE*sc), (px, py - 16*SCALE*sc)], fill=(180, 83, 9, 255), width=int(2.5*SCALE*sc))
            draw.ellipse([px - 2*SCALE*sc, py - 18*SCALE*sc, px + 2*SCALE*sc, py - 14*SCALE*sc], fill=(253, 224, 71, 255))

    elif skill_idx == 2:
        # 2: LÔI KIẾM LIÊN HOÀN (3D Violet/Cyan Thunder Sword with Crackling Lightning)
        # Lightning Bolts
        lightning_paths = [
            [(cx - 28*SCALE, cy - 24*SCALE), (cx - 10*SCALE, cy - 8*SCALE), (cx - 18*SCALE, cy + 4*SCALE), (cx + 6*SCALE, cy + 26*SCALE)],
            [(cx + 24*SCALE, cy - 20*SCALE), (cx + 8*SCALE, cy - 2*SCALE), (cx + 20*SCALE, cy + 12*SCALE), (cx - 4*SCALE, cy + 24*SCALE)],
        ]
        for path in lightning_paths:
            glow_draw.line(path, fill=(192, 132, 252, 220), width=int(6*SCALE))
            glow_draw.line(path, fill=(255, 255, 255, 255), width=int(2*SCALE))
        # Central Lightning Dao Sword
        draw.polygon([
            (cx + 22*SCALE, cy - 24*SCALE),
            (cx - 14*SCALE, cy + 12*SCALE),
            (cx - 18*SCALE, cy + 20*SCALE),
            (cx - 10*SCALE, cy + 16*SCALE)
        ], fill=(238, 242, 255, 255))
        draw.line([(cx + 22*SCALE, cy - 24*SCALE), (cx - 12*SCALE, cy + 14*SCALE)], fill=(147, 51, 234, 255), width=int(4*SCALE))
        # Violet Dragon Guard
        draw.ellipse([cx - 16*SCALE, cy + 12*SCALE, cx - 8*SCALE, cy + 20*SCALE], fill=(168, 85, 247, 255), outline=(250, 204, 21, 255), width=int(2*SCALE))

    elif skill_idx == 3:
        # 3: HÀN BĂNG TRẢM (3D Crystalline Frosted Ice Glacial Blade)
        # Ice Crystals in background
        for a in (30, 90, 150, 210, 270, 330):
            rad = math.radians(a)
            ix = cx + math.cos(rad) * 26 * SCALE
            iy = cy + math.sin(rad) * 26 * SCALE
            glow_draw.polygon([
                (cx, cy),
                (ix - math.sin(rad)*5*SCALE, iy + math.cos(rad)*5*SCALE),
                (cx + math.cos(rad)*36*SCALE, cy + math.sin(rad)*36*SCALE),
                (ix + math.sin(rad)*5*SCALE, iy - math.cos(rad)*5*SCALE),
            ], fill=(125, 211, 252, 140))
        # Massive Ice Greatsword
        draw.polygon([
            (cx + 26*SCALE, cy - 26*SCALE),
            (cx + 10*SCALE, cy + 8*SCALE),
            (cx - 14*SCALE, cy + 22*SCALE),
            (cx - 8*SCALE, cy - 10*SCALE)
        ], fill=(224, 242, 254, 255))
        draw.polygon([
            (cx + 26*SCALE, cy - 26*SCALE),
            (cx + 10*SCALE, cy + 8*SCALE),
            (cx + 4*SCALE, cy + 2*SCALE)
        ], fill=(56, 189, 248, 255))
        draw.line([(cx + 26*SCALE, cy - 26*SCALE), (cx - 14*SCALE, cy + 22*SCALE)], fill=(255, 255, 255, 255), width=int(3*SCALE))
        # Frost Hilt
        draw.line([(cx - 12*SCALE, cy + 18*SCALE), (cx - 24*SCALE, cy + 28*SCALE)], fill=(14, 116, 144, 255), width=int(6*SCALE))
        draw.ellipse([cx - 26*SCALE, cy + 26*SCALE, cx - 20*SCALE, cy + 32*SCALE], fill=(186, 230, 253, 255))

    elif skill_idx == 4:
        # 4: HỎA KIẾM BẠO (3D Flaming Phoenix / Dragon Fire Burst Sword)
        # Fiery aura / flame tongues
        for a in range(0, 360, 45):
            rad = math.radians(a)
            fx = cx + math.cos(rad) * 28 * SCALE
            fy = cy + math.sin(rad) * 28 * SCALE
            glow_draw.ellipse([fx - 10*SCALE, fy - 10*SCALE, fx + 10*SCALE, fy + 10*SCALE], fill=(239, 68, 68, 150))
            glow_draw.ellipse([fx - 6*SCALE, fy - 6*SCALE, fx + 6*SCALE, fy + 6*SCALE], fill=(251, 146, 60, 200))
            glow_draw.ellipse([fx - 3*SCALE, fy - 3*SCALE, fx + 3*SCALE, fy + 3*SCALE], fill=(254, 240, 138, 240))
        # Crimson Fiery Broadsword
        draw.polygon([
            (cx + 26*SCALE, cy - 26*SCALE),
            (cx - 8*SCALE, cy + 14*SCALE),
            (cx - 16*SCALE, cy + 22*SCALE),
            (cx - 6*SCALE, cy + 8*SCALE)
        ], fill=(255, 241, 242, 255))
        draw.line([(cx + 26*SCALE, cy - 26*SCALE), (cx - 12*SCALE, cy + 16*SCALE)], fill=(220, 38, 38, 255), width=int(5*SCALE))
        draw.line([(cx + 26*SCALE, cy - 26*SCALE), (cx - 12*SCALE, cy + 16*SCALE)], fill=(254, 215, 170, 255), width=int(2*SCALE))
        # Phoenix Gold Guard
        draw.ellipse([cx - 16*SCALE, cy + 12*SCALE, cx - 6*SCALE, cy + 22*SCALE], fill=(245, 158, 11, 255), outline=(180, 83, 9, 255), width=int(2*SCALE))

    elif skill_idx == 5:
        # 5: VẠN KIẾM QUY TÔNG (3D Golden Taiji Yin-Yang BaGua + Radiant Blade Nova)
        # Radiant Blade Ring (12 golden blades pointing outwards)
        for a in range(0, 360, 30):
            rad = math.radians(a)
            bx = cx + math.cos(rad) * 28 * SCALE
            by = cy + math.sin(rad) * 28 * SCALE
            glow_draw.line([(cx, cy), (bx, by)], fill=(250, 204, 21, 200), width=int(4*SCALE))
            glow_draw.ellipse([bx - 3*SCALE, by - 3*SCALE, bx + 3*SCALE, by + 3*SCALE], fill=(255, 255, 255, 255))
        # Golden Taiji BaGua Plate in Center
        draw.ellipse([cx - 18*SCALE, cy - 18*SCALE, cx + 18*SCALE, cy + 18*SCALE], fill=(254, 240, 138, 255), outline=(180, 83, 9, 255), width=int(2.5*SCALE))
        # Yin-Yang Halves
        draw.chord([cx - 16*SCALE, cy - 16*SCALE, cx + 16*SCALE, cy + 16*SCALE], 90, 270, fill=(15, 23, 42, 255))
        draw.ellipse([cx - 8*SCALE, cy - 16*SCALE, cx + 8*SCALE, cy], fill=(15, 23, 42, 255))
        draw.ellipse([cx - 8*SCALE, cy, cx + 8*SCALE, cy + 16*SCALE], fill=(254, 240, 138, 255))
        draw.ellipse([cx - 3*SCALE, cy - 11*SCALE, cx + 3*SCALE, cy - 5*SCALE], fill=(254, 240, 138, 255))
        draw.ellipse([cx - 3*SCALE, cy + 5*SCALE, cx + 3*SCALE, cy + 11*SCALE], fill=(15, 23, 42, 255))

    elif skill_idx == 6:
        # 6: THIÊN BỘ / NGỰ PHONG (3D Winged Celestial Boots / Wind Tornado)
        # Swirling Wind Tornado
        for y_off in range(-20, 22, 10):
            w = (28 - abs(y_off)*0.5) * SCALE
            glow_draw.arc([cx - w, cy + y_off*SCALE - 6*SCALE, cx + w, cy + y_off*SCALE + 6*SCALE], 0, 360, fill=(103, 232, 249, 140), width=int(3*SCALE))
        # Golden Winged Boot
        # Wings of light
        glow_draw.polygon([(cx - 6*SCALE, cy - 10*SCALE), (cx - 28*SCALE, cy - 24*SCALE), (cx - 18*SCALE, cy - 2*SCALE)], fill=(253, 224, 71, 230))
        glow_draw.polygon([(cx - 6*SCALE, cy - 4*SCALE), (cx - 26*SCALE, cy + 8*SCALE), (cx - 14*SCALE, cy + 8*SCALE)], fill=(250, 204, 21, 200))
        # 3D Boot shape
        draw.polygon([
            (cx - 8*SCALE, cy - 16*SCALE),
            (cx + 6*SCALE, cy - 16*SCALE),
            (cx + 6*SCALE, cy + 6*SCALE),
            (cx + 22*SCALE, cy + 14*SCALE),
            (cx + 20*SCALE, cy + 22*SCALE),
            (cx - 8*SCALE, cy + 22*SCALE),
        ], fill=(251, 191, 36, 255))
        draw.polygon([
            (cx - 6*SCALE, cy - 14*SCALE),
            (cx + 4*SCALE, cy - 14*SCALE),
            (cx + 4*SCALE, cy + 4*SCALE),
            (cx + 18*SCALE, cy + 12*SCALE),
            (cx + 16*SCALE, cy + 18*SCALE),
            (cx - 6*SCALE, cy + 18*SCALE),
        ], fill=(254, 240, 138, 255))
        # Gem on ankle
        draw.ellipse([cx - 2*SCALE, cy + 2*SCALE, cx + 6*SCALE, cy + 10*SCALE], fill=(6, 182, 212, 255), outline=(255, 255, 255, 255), width=int(1.5*SCALE))

    elif skill_idx == 7:
        # 7: NGỰ KIẾM PHI HÀNH (3D Soaring Ancient Sword on Auspicious Clouds)
        # Auspicious Golden/White Clouds (Tường Vân)
        cloud_pts = [(-16, 16, 14), (0, 20, 16), (16, 16, 14), (-8, 12, 12), (8, 12, 12)]
        for clx, cly, clr in cloud_pts:
            glow_draw.ellipse([cx + clx*SCALE - clr*SCALE, cy + cly*SCALE - clr*SCALE, cx + clx*SCALE + clr*SCALE, cy + cly*SCALE + clr*SCALE], fill=(254, 240, 138, 140))
            draw.ellipse([cx + clx*SCALE - (clr-2)*SCALE, cy + cly*SCALE - (clr-2)*SCALE, cx + clx*SCALE + (clr-2)*SCALE, cy + cly*SCALE + (clr-2)*SCALE], fill=(248, 250, 252, 240))
        # Flying Sword soaring upward at 45 deg
        glow_draw.line([(cx - 22*SCALE, cy + 14*SCALE), (cx + 26*SCALE, cy - 22*SCALE)], fill=(56, 189, 248, 220), width=int(12*SCALE))
        draw.polygon([
            (cx + 28*SCALE, cy - 24*SCALE),
            (cx - 16*SCALE, cy + 12*SCALE),
            (cx - 22*SCALE, cy + 18*SCALE),
            (cx - 18*SCALE, cy + 8*SCALE)
        ], fill=(255, 255, 255, 255))
        draw.line([(cx + 28*SCALE, cy - 24*SCALE), (cx - 16*SCALE, cy + 12*SCALE)], fill=(14, 165, 233, 255), width=int(3*SCALE))
        # Ornate Golden Pommel
        draw.ellipse([cx - 25*SCALE, cy + 15*SCALE, cx - 17*SCALE, cy + 23*SCALE], fill=(251, 191, 36, 255))

    elif skill_idx == 8:
        # 8: THẤT TINH KIẾM TRẬN (3D Seven-Star Constellation Sword Matrix)
        # Big Dipper 7 Stars & Connecting Beams
        stars = [
            (-22, -18), (-12, -22), (-2, -14), (8, -8), (14, 4), (24, 12), (18, 24)
        ]
        # Connecting Starlight Lines
        for i in range(len(stars) - 1):
            p1 = (cx + stars[i][0]*SCALE, cy + stars[i][1]*SCALE)
            p2 = (cx + stars[i+1][0]*SCALE, cy + stars[i+1][1]*SCALE)
            glow_draw.line([p1, p2], fill=(103, 232, 249, 220), width=int(3*SCALE))
        # 7 Glowing Celestial Swords at Nodes
        for sx, sy in stars:
            px, py = cx + sx*SCALE, cy + sy*SCALE
            glow_draw.ellipse([px - 7*SCALE, py - 7*SCALE, px + 7*SCALE, py + 7*SCALE], fill=(56, 189, 248, 180))
            draw.ellipse([px - 4*SCALE, py - 4*SCALE, px + 4*SCALE, py + 4*SCALE], fill=(255, 255, 255, 255), outline=(250, 204, 21, 255), width=int(1.5*SCALE))
            # Tiny golden sword icon
            draw.line([(px, py - 5*SCALE), (px, py + 5*SCALE)], fill=(253, 224, 71, 255), width=int(1.5*SCALE))

    elif skill_idx == 9:
        # 9: HỘ THỂ KIM CHUNG (3D Ancient Golden Divine Bell / Pagoda Shield)
        # Radiant Barrier Halo
        for r_ring in range(22, 34, 4):
            glow_draw.ellipse([cx - r_ring*SCALE, cy - r_ring*SCALE, cx + r_ring*SCALE, cy + r_ring*SCALE], outline=(250, 204, 21, 160), width=int(2*SCALE))
        # Golden Temple Bell Body (Kim Chung)
        bell_poly = [
            (cx, cy - 24*SCALE),
            (cx + 10*SCALE, cy - 18*SCALE),
            (cx + 18*SCALE, cy + 4*SCALE),
            (cx + 22*SCALE, cy + 18*SCALE),
            (cx + 16*SCALE, cy + 22*SCALE),
            (cx - 16*SCALE, cy + 22*SCALE),
            (cx - 22*SCALE, cy + 18*SCALE),
            (cx - 18*SCALE, cy + 4*SCALE),
            (cx - 10*SCALE, cy - 18*SCALE),
        ]
        draw.polygon(bell_poly, fill=(251, 191, 36, 255), outline=(180, 83, 9, 255), width=int(2*SCALE))
        # Inner Gold Shading
        draw.polygon([
            (cx, cy - 20*SCALE),
            (cx + 7*SCALE, cy - 14*SCALE),
            (cx + 14*SCALE, cy + 2*SCALE),
            (cx + 16*SCALE, cy + 16*SCALE),
            (cx - 16*SCALE, cy + 16*SCALE),
            (cx - 14*SCALE, cy + 2*SCALE),
            (cx - 7*SCALE, cy - 14*SCALE),
        ], fill=(254, 240, 138, 255))
        # Daoist Sanskrit Runic Band across bell
        draw.rectangle([cx - 16*SCALE, cy + 2*SCALE, cx + 16*SCALE, cy + 8*SCALE], fill=(180, 83, 9, 255))
        draw.ellipse([cx - 5*SCALE, cy + 3*SCALE, cx + 5*SCALE, cy + 7*SCALE], fill=(254, 240, 138, 255))
        # Bell Crown Ring
        draw.ellipse([cx - 6*SCALE, cy - 28*SCALE, cx + 6*SCALE, cy - 20*SCALE], fill=(251, 191, 36, 255), outline=(180, 83, 9, 255), width=int(2*SCALE))

    # Composite glow and sharpen
    glow_blurred = glow_im.filter(ImageFilter.GaussianBlur(radius=2*SCALE))
    im.alpha_composite(glow_blurred)
    im.alpha_composite(glow_im)

    return im.resize((96, 96), Image.Resampling.LANCZOS)

# ----------------------------------------------------------------------
# ITEM ATLAS (18 Icons, 80x80 px: 6 Categories x 3 Tiers)
# ----------------------------------------------------------------------
def render_item_icon(item_idx):
    size = 80 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size / 2, size / 2
    r = 36 * SCALE

    category = item_idx % 6   # 0: Weapon, 1: Armor, 2: Helm, 3: Boots, 4: Ring, 5: Talisman
    tier = item_idx // 6      # 0: Phàm (Steel/Bronze), 1: Lam/Tím (Spirit/Thunder), 2: Tiên (Celestial Gold/Dragon)

    tier_bgs = [
        (25, 30, 40, 255),    # Tier 0: Steel Charcoal
        (15, 25, 55, 255),    # Tier 1: Deep Sapphire / Amethyst
        (45, 30, 10, 255),    # Tier 2: Emperor Gold / Dragon Jade
    ]

    draw_3d_frame(draw, cx, cy, r, fill_bg=tier_bgs[tier], border_gold=(tier >= 1))

    glow_im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_im)

    if category == 0:
        # WEAPON (Divine Swords)
        blade_cols = [
            ((226, 232, 240, 255), (148, 163, 184, 255), (71, 85, 105, 255)),     # T0: Steel
            ((224, 242, 254, 255), (56, 189, 248, 255), (147, 51, 234, 255)),     # T1: Violet Astral
            ((254, 240, 138, 255), (251, 191, 36, 255), (220, 38, 38, 255)),      # T2: Dragon Xuan-Yuan
        ]
        b_light, b_mid, b_dark = blade_cols[tier]
        if tier > 0:
            glow_draw.line([(cx - 20*SCALE, cy + 20*SCALE), (cx + 22*SCALE, cy - 22*SCALE)], fill=b_mid, width=int(10*SCALE))
        # Sword Blade
        draw.polygon([
            (cx + 24*SCALE, cy - 24*SCALE),
            (cx - 12*SCALE, cy + 12*SCALE),
            (cx - 18*SCALE, cy + 18*SCALE),
            (cx - 14*SCALE, cy + 8*SCALE)
        ], fill=b_light)
        draw.line([(cx + 24*SCALE, cy - 24*SCALE), (cx - 14*SCALE, cy + 14*SCALE)], fill=b_mid, width=int(3*SCALE))
        # Guard & Hilt
        draw.line([(cx - 10*SCALE, cy + 8*SCALE), (cx - 6*SCALE, cy + 18*SCALE)], fill=b_dark, width=int(5*SCALE))
        draw.ellipse([cx - 22*SCALE, cy + 14*SCALE, cx - 14*SCALE, cy + 22*SCALE], fill=b_mid)

    elif category == 1:
        # ARMOR (Cuirass / Battle Robe)
        armor_cols = [
            ((148, 163, 184, 255), (71, 85, 105, 255)),
            ((56, 189, 248, 255), (14, 116, 144, 255)),
            ((251, 191, 36, 255), (180, 83, 9, 255)),
        ]
        a_light, a_dark = armor_cols[tier]
        # Armor Torso & Pauldrons
        draw.polygon([
            (cx - 20*SCALE, cy - 14*SCALE),
            (cx + 20*SCALE, cy - 14*SCALE),
            (cx + 14*SCALE, cy + 18*SCALE),
            (cx, cy + 24*SCALE),
            (cx - 14*SCALE, cy + 18*SCALE),
        ], fill=a_light, outline=a_dark, width=int(2*SCALE))
        # Center Dragon Emblem / Gem
        draw.ellipse([cx - 6*SCALE, cy - 4*SCALE, cx + 6*SCALE, cy + 8*SCALE], fill=(255, 255, 255, 255) if tier==2 else a_dark)

    elif category == 2:
        # HELM / CROWN (Đạo Quan / Tiên Quan)
        draw.polygon([
            (cx - 16*SCALE, cy + 14*SCALE),
            (cx - 18*SCALE, cy - 8*SCALE),
            (cx, cy - 22*SCALE),
            (cx + 18*SCALE, cy - 8*SCALE),
            (cx + 16*SCALE, cy + 14*SCALE),
        ], fill=(251, 191, 36, 255) if tier>=1 else (148, 163, 184, 255), outline=(180, 83, 9, 255), width=int(2*SCALE))
        # Top Jewel / Pearl
        draw.ellipse([cx - 5*SCALE, cy - 14*SCALE, cx + 5*SCALE, cy - 4*SCALE], fill=(239, 68, 68, 255) if tier==2 else (56, 189, 248, 255))

    elif category == 3:
        # BOOTS (Chiến Hài)
        draw.polygon([
            (cx - 12*SCALE, cy - 16*SCALE),
            (cx + 6*SCALE, cy - 16*SCALE),
            (cx + 6*SCALE, cy + 4*SCALE),
            (cx + 20*SCALE, cy + 12*SCALE),
            (cx + 18*SCALE, cy + 18*SCALE),
            (cx - 12*SCALE, cy + 18*SCALE),
        ], fill=(251, 191, 36, 255) if tier==2 else ((56, 189, 248, 255) if tier==1 else (71, 85, 105, 255)))

    elif category == 4:
        # RING (Càn Khôn Giới)
        draw.ellipse([cx - 18*SCALE, cy - 12*SCALE, cx + 18*SCALE, cy + 18*SCALE], fill=(251, 191, 36, 255) if tier>=1 else (148, 163, 184, 255), outline=(180, 83, 9, 255), width=int(2*SCALE))
        draw.ellipse([cx - 11*SCALE, cy - 5*SCALE, cx + 11*SCALE, cy + 12*SCALE], fill=tier_bgs[tier])
        # Ring Gem Crest
        draw.polygon([
            (cx, cy - 20*SCALE),
            (cx + 8*SCALE, cy - 12*SCALE),
            (cx, cy - 6*SCALE),
            (cx - 8*SCALE, cy - 12*SCALE)
        ], fill=(239, 68, 68, 255) if tier==2 else (147, 51, 234, 255))

    elif category == 5:
        # TALISMAN / PENDANT (Thần Hồn Phù / Ngọc Bội)
        if tier == 0:
            # Yellow Daoist Paper Talisman with Red Cinnabar Rune
            draw.rectangle([cx - 12*SCALE, cy - 18*SCALE, cx + 12*SCALE, cy + 18*SCALE], fill=(254, 240, 138, 255), outline=(217, 119, 6, 255), width=int(2*SCALE))
            draw.line([(cx, cy - 14*SCALE), (cx, cy + 14*SCALE)], fill=(220, 38, 38, 255), width=int(2.5*SCALE))
            draw.ellipse([cx - 6*SCALE, cy - 10*SCALE, cx + 6*SCALE, cy - 2*SCALE], outline=(220, 38, 38, 255), width=int(2*SCALE))
        elif tier == 1:
            # Azure Jade Pendant (Thái Ất Ngọc Bội)
            draw.ellipse([cx - 16*SCALE, cy - 16*SCALE, cx + 16*SCALE, cy + 16*SCALE], fill=(52, 211, 153, 255), outline=(251, 191, 36, 255), width=int(3*SCALE))
            draw.ellipse([cx - 6*SCALE, cy - 6*SCALE, cx + 6*SCALE, cy + 6*SCALE], fill=tier_bgs[tier])
            # Red Silk Tassel
            draw.line([(cx, cy + 16*SCALE), (cx, cy + 26*SCALE)], fill=(239, 68, 68, 255), width=int(3*SCALE))
        else:
            # Primordial Chaos Mirror (Hỗn Nguyên Kính / Bát Quái Kính)
            draw.ellipse([cx - 18*SCALE, cy - 18*SCALE, cx + 18*SCALE, cy + 18*SCALE], fill=(251, 191, 36, 255), outline=(180, 83, 9, 255), width=int(3*SCALE))
            draw.ellipse([cx - 12*SCALE, cy - 12*SCALE, cx + 12*SCALE, cy + 12*SCALE], fill=(254, 240, 138, 255))
            draw.ellipse([cx - 5*SCALE, cy - 5*SCALE, cx + 5*SCALE, cy + 5*SCALE], fill=(239, 68, 68, 255))

    glow_blurred = glow_im.filter(ImageFilter.GaussianBlur(radius=2*SCALE))
    im.alpha_composite(glow_blurred)
    im.alpha_composite(glow_im)

    return im.resize((80, 80), Image.Resampling.LANCZOS)

# ----------------------------------------------------------------------
# STAGE ICONS (12 Icons, 72x72 px: 12 Realms/Stages)
# ----------------------------------------------------------------------
def render_stage_icon(stage_idx):
    size = 72 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size / 2, size / 2
    r = 32 * SCALE

    stage_colors = [
        (16, 185, 129),   # 0: Linh Sơn
        (34, 197, 94),    # 1: Thanh Trúc
        (107, 114, 128),  # 2: Hắc Phong
        (249, 115, 22),   # 3: Yêu Thú
        (56, 189, 248),   # 4: Thiên Kiếm
        (239, 68, 68),    # 5: Hỏa Diệm
        (168, 85, 247),   # 6: Ma Vực
        (244, 63, 94),    # 7: Xích Diệm
        (186, 230, 253),  # 8: Băng Phách
        (99, 102, 241),   # 9: Lôi Đình
        (139, 92, 246),   # 10: U Minh
        (234, 179, 8),    # 11: Thiên Môn
    ]
    main_col = stage_colors[stage_idx % len(stage_colors)]

    draw_3d_frame(draw, cx, cy, r, fill_bg=(15, 23, 42, 255), border_gold=True)

    # 3D Mountain / Pagoda / Cloud Silhouette in realm color
    draw.polygon([
        (cx, cy - 16*SCALE),
        (cx + 18*SCALE, cy + 16*SCALE),
        (cx - 18*SCALE, cy + 16*SCALE),
    ], fill=main_col + (200,))
    draw.polygon([
        (cx - 6*SCALE, cy - 8*SCALE),
        (cx + 8*SCALE, cy + 16*SCALE),
        (cx - 16*SCALE, cy + 16*SCALE),
    ], fill=main_col + (255,))

    # Glowing stage numeral / rune
    draw.ellipse([cx - 4*SCALE, cy - 20*SCALE, cx + 4*SCALE, cy - 12*SCALE], fill=(255, 255, 255, 255))

    return im.resize((72, 72), Image.Resampling.LANCZOS)

def build_all_xianxia_assets():
    os.makedirs('assets', exist_ok=True)

    # 1. Skill Icons (10 x 96x96 -> 960x96)
    print("Generating 3D Xianxia Skill Icons (skill_icons.png)...")
    skill_sheet = Image.new('RGBA', (96 * 10, 96))
    for i in range(10):
        icon = render_skill_icon(i)
        skill_sheet.paste(icon, (i * 96, 0))
    skill_sheet.save('assets/skill_icons.png')

    # 2. Item Atlas (18 x 80x80 -> 1440x80)
    print("Generating 3D Xianxia Item Atlas (items_atlas.png)...")
    item_sheet = Image.new('RGBA', (80 * 18, 80))
    for i in range(18):
        icon = render_item_icon(i)
        item_sheet.paste(icon, (i * 80, 0))
    item_sheet.save('assets/items_atlas.png')

    # 3. Stage Icons (12 x 72x72 -> 864x72)
    print("Generating 3D Xianxia Stage Icons (stage_icons.png)...")
    stage_sheet = Image.new('RGBA', (72 * 12, 72))
    for i in range(12):
        icon = render_stage_icon(i)
        stage_sheet.paste(icon, (i * 72, 0))
    stage_sheet.save('assets/stage_icons.png')

    print("All 3D Xianxia icons generated successfully!")

if __name__ == '__main__':
    build_all_xianxia_assets()
