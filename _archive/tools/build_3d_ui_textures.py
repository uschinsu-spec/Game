import math
import os
from PIL import Image, ImageDraw, ImageFilter

SCALE = 4

def hex_to_rgba(hex_str, alpha=255):
    hex_str = hex_str.lstrip('#')
    r, g, b = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    return (r, g, b, alpha)

# -------------------------------------------------------------
# 1. 3D AVATAR FRAME (96x96 px)
# -------------------------------------------------------------
def build_avatar_frame():
    size = 96 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size / 2, size / 2
    r = 44 * SCALE

    # Outer Drop Shadow
    draw.ellipse([cx - r - 3*SCALE, cy - r - 2*SCALE, cx + r + 3*SCALE, cy + r + 5*SCALE], fill=(5, 8, 15, 180))

    # Outer 3D Gold Dragon / Lotus Bezel
    for i in range(int(8 * SCALE)):
        t = i / (8 * SCALE)
        col = (
            int(255 * (1-t) + 180 * t),
            int(235 * (1-t) + 120 * t),
            int(120 * (1-t) + 20 * t),
            255
        )
        draw.ellipse([cx - r + i, cy - r + i, cx + r - i, cy + r - i], outline=col, width=1)

    # Specular Arc Highlights (Top-left)
    draw.arc([cx - r + SCALE, cy - r + SCALE, cx + r - SCALE, cy + r - SCALE], 200, 340, fill=(255, 255, 240, 255), width=int(3*SCALE))
    # Ambient Shadow Arc (Bottom-right)
    draw.arc([cx - r + SCALE, cy - r + SCALE, cx + r - SCALE, cy + r - SCALE], 20, 160, fill=(80, 45, 5, 255), width=int(3*SCALE))

    # 4 Dragon / Lotus Claws at Cardinal Directions
    for ang in (0, 90, 180, 270):
        rad = math.radians(ang)
        sx = cx + math.cos(rad) * (r - 2*SCALE)
        sy = cy + math.sin(rad) * (r - 2*SCALE)
        draw.ellipse([sx - 5*SCALE, sy - 5*SCALE, sx + 5*SCALE, sy + 5*SCALE], fill=(255, 225, 100, 255), outline=(140, 85, 10, 255), width=int(1.5*SCALE))
        draw.ellipse([sx - 2*SCALE, sy - 2*SCALE, sx + 2*SCALE, sy + 2*SCALE], fill=(255, 255, 255, 255))

    # Inner Recessed Ring
    inner_r = r - 8 * SCALE
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=(10, 25, 20, 255), outline=(5, 12, 18, 255), width=int(2*SCALE))

    return im.resize((96, 96), Image.Resampling.LANCZOS)

# -------------------------------------------------------------
# 2. 3D ATTACK BUTTON (128x128 px - Thái Cực Trảm Kiếm Lệnh)
# -------------------------------------------------------------
def build_attack_button():
    size = 128 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size / 2, size / 2
    r = 58 * SCALE

    # 1. Outer Dark Glow Shadow
    draw.ellipse([cx - r - 4*SCALE, cy - r - 2*SCALE, cx + r + 4*SCALE, cy + r + 8*SCALE], fill=(5, 8, 15, 200))

    # 2. Radiant Fire / Golden Aura Flame Tips (8 Petals)
    for a in range(0, 360, 45):
        rad = math.radians(a)
        px = cx + math.cos(rad) * (r - 2*SCALE)
        py = cy + math.sin(rad) * (r - 2*SCALE)
        draw.ellipse([px - 8*SCALE, py - 8*SCALE, px + 8*SCALE, py + 8*SCALE], fill=(251, 191, 36, 220), outline=(180, 83, 9, 255), width=int(1.5*SCALE))

    # 3. Outer 3D Heavy Gold Ring
    for i in range(int(9 * SCALE)):
        t = i / (9 * SCALE)
        col = (
            int(255 * (1-t) + 160 * t),
            int(230 * (1-t) + 100 * t),
            int(100 * (1-t) + 15 * t),
            255
        )
        draw.ellipse([cx - r + i, cy - r + i, cx + r - i, cy + r - i], outline=col, width=1)

    draw.arc([cx - r + SCALE, cy - r + SCALE, cx + r - SCALE, cy + r - SCALE], 195, 345, fill=(255, 255, 230, 255), width=int(3.5*SCALE))
    draw.arc([cx - r + SCALE, cy - r + SCALE, cx + r - SCALE, cy + r - SCALE], 15, 165, fill=(70, 35, 5, 255), width=int(3.5*SCALE))

    # 4. Inner Dark Obsidian / Crimson Battle Core
    inner_r = r - 9 * SCALE
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=(28, 12, 14, 255), outline=(120, 25, 30, 255), width=int(2*SCALE))

    # 5. Crossed Golden Celestial Swords in Center
    # Sword 1 (TL to BR)
    draw.line([(cx - 24*SCALE, cy - 24*SCALE), (cx + 24*SCALE, cy + 24*SCALE)], fill=(254, 240, 138, 255), width=int(6*SCALE))
    draw.line([(cx - 24*SCALE, cy - 24*SCALE), (cx + 24*SCALE, cy + 24*SCALE)], fill=(255, 255, 255, 255), width=int(2.5*SCALE))
    # Crossguards
    draw.line([(cx - 18*SCALE, cy - 10*SCALE), (cx - 10*SCALE, cy - 18*SCALE)], fill=(217, 119, 6, 255), width=int(4*SCALE))

    # Sword 2 (TR to BL)
    draw.line([(cx + 24*SCALE, cy - 24*SCALE), (cx - 24*SCALE, cy + 24*SCALE)], fill=(254, 240, 138, 255), width=int(6*SCALE))
    draw.line([(cx + 24*SCALE, cy - 24*SCALE), (cx - 24*SCALE, cy + 24*SCALE)], fill=(255, 255, 255, 255), width=int(2.5*SCALE))
    draw.line([(cx + 18*SCALE, cy - 10*SCALE), (cx + 10*SCALE, cy - 18*SCALE)], fill=(217, 119, 6, 255), width=int(4*SCALE))

    # Center Radiant Gem / Taiji Medallion
    draw.ellipse([cx - 9*SCALE, cy - 9*SCALE, cx + 9*SCALE, cy + 9*SCALE], fill=(239, 68, 68, 255), outline=(255, 235, 120, 255), width=int(2*SCALE))
    draw.ellipse([cx - 4*SCALE, cy - 4*SCALE, cx + 4*SCALE, cy + 4*SCALE], fill=(255, 255, 255, 255))

    return im.resize((128, 128), Image.Resampling.LANCZOS)

# -------------------------------------------------------------
# 3. 3D JOYSTICK BASE (180x180 px - Bát Quái Trận Đồ)
# -------------------------------------------------------------
def build_joystick_base():
    size = 180 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size / 2, size / 2
    r = 82 * SCALE

    # Dark Shadow
    draw.ellipse([cx - r - 4*SCALE, cy - r - 2*SCALE, cx + r + 4*SCALE, cy + r + 8*SCALE], fill=(5, 8, 15, 160))

    # 3D Outer Bronze / Jade BaGua Octagon / Circle Ring
    for i in range(int(7 * SCALE)):
        t = i / (7 * SCALE)
        col = (
            int(180 * (1-t) + 70 * t),
            int(140 * (1-t) + 50 * t),
            int(80 * (1-t) + 30 * t),
            200
        )
        draw.ellipse([cx - r + i, cy - r + i, cx + r - i, cy + r - i], outline=col, width=1)

    # Inner Dark Jade Pool
    inner_r = r - 8 * SCALE
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=(8, 20, 28, 160), outline=(200, 160, 60, 120), width=int(2*SCALE))

    # 8 BaGua Trigrams around the ring (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài)
    tri_r = r - 16 * SCALE
    for idx, ang in enumerate(range(0, 360, 45)):
        rad = math.radians(ang)
        tx = cx + math.cos(rad) * tri_r
        ty = cy + math.sin(rad) * tri_r
        # Draw 3 miniature trigram lines
        nx = -math.sin(rad) * 6 * SCALE
        ny = math.cos(rad) * 6 * SCALE
        for line_i in (-2.5, 0, 2.5):
            ox = math.cos(rad) * line_i * SCALE
            oy = math.sin(rad) * line_i * SCALE
            # Broken line for Yin, Solid for Yang
            is_broken = (idx + int(line_i + 3)) % 2 == 1
            if is_broken:
                draw.line([(tx + ox - nx, ty + oy - ny), (tx + ox - nx*0.3, ty + oy - ny*0.3)], fill=(250, 204, 21, 190), width=int(1.5*SCALE))
                draw.line([(tx + ox + nx*0.3, ty + oy + ny*0.3), (tx + ox + nx, ty + oy + ny)], fill=(250, 204, 21, 190), width=int(1.5*SCALE))
            else:
                draw.line([(tx + ox - nx, ty + oy - ny), (tx + ox + nx, ty + oy + ny)], fill=(250, 204, 21, 190), width=int(1.5*SCALE))

    return im.resize((180, 180), Image.Resampling.LANCZOS)

# -------------------------------------------------------------
# 4. 3D JOYSTICK KNOB (90x90 px - Thái Cực Âm Dương Châu)
# -------------------------------------------------------------
def build_joystick_knob():
    size = 90 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size / 2, size / 2
    r = 40 * SCALE

    # Drop Shadow
    draw.ellipse([cx - r - 2*SCALE, cy - r, cx + r + 2*SCALE, cy + r + 6*SCALE], fill=(5, 8, 15, 180))

    # Outer 3D Gold Ring
    for i in range(int(6 * SCALE)):
        t = i / (6 * SCALE)
        col = (
            int(255 * (1-t) + 160 * t),
            int(220 * (1-t) + 110 * t),
            int(80 * (1-t) + 20 * t),
            255
        )
        draw.ellipse([cx - r + i, cy - r + i, cx + r - i, cy + r - i], outline=col, width=1)

    draw.arc([cx - r + SCALE, cy - r + SCALE, cx + r - SCALE, cy + r - SCALE], 200, 340, fill=(255, 255, 230, 255), width=int(2.5*SCALE))

    # Inner Yin-Yang Disc
    inner_r = r - 6 * SCALE
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=(245, 245, 250, 255))
    # Dark Half
    draw.chord([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], 90, 270, fill=(15, 23, 42, 255))
    draw.ellipse([cx - inner_r/2, cy - inner_r, cx + inner_r/2, cy], fill=(15, 23, 42, 255))
    draw.ellipse([cx - inner_r/2, cy, cx + inner_r/2, cy + inner_r], fill=(245, 245, 250, 255))
    # Inner Dots
    draw.ellipse([cx - 4*SCALE, cy - inner_r/2 - 4*SCALE, cx + 4*SCALE, cy - inner_r/2 + 4*SCALE], fill=(245, 245, 250, 255))
    draw.ellipse([cx - 4*SCALE, cy + inner_r/2 - 4*SCALE, cx + 4*SCALE, cy + inner_r/2 + 4*SCALE], fill=(15, 23, 42, 255))

    return im.resize((90, 90), Image.Resampling.LANCZOS)

# -------------------------------------------------------------
# 5. 3D MODAL BACKGROUND (500x700 px - Luxury Imperial Jade & Dragon Trim)
# -------------------------------------------------------------
def build_modal_background():
    w, h = 500, 700
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # 1. Dark Imperial Jade Rounded Box
    draw.rounded_rectangle([10, 10, w - 10, h - 10], radius=24, fill=(6, 16, 26, 248), outline=(212, 160, 23, 255), width=3)
    # Inner thin gold border
    draw.rounded_rectangle([16, 16, w - 16, h - 16], radius=20, fill=None, outline=(120, 85, 20, 180), width=1)

    # 2. Header Banner Plate
    draw.rounded_rectangle([50, 22, w - 50, 75], radius=12, fill=(18, 38, 55, 255), outline=(251, 191, 36, 255), width=2)
    draw.rounded_rectangle([54, 26, w - 54, 71], radius=10, fill=None, outline=(254, 240, 138, 140), width=1)

    # 3. 4 Golden Dragon Corner Brackets
    corner_size = 36
    # Top-Left
    draw.line([(12, 12 + corner_size), (12, 12), (12 + corner_size, 12)], fill=(255, 223, 100, 255), width=4)
    draw.ellipse([10, 10, 18, 18], fill=(239, 68, 68, 255), outline=(255, 255, 255, 255), width=1)
    # Top-Right
    draw.line([(w - 12 - corner_size, 12), (w - 12, 12), (w - 12, 12 + corner_size)], fill=(255, 223, 100, 255), width=4)
    draw.ellipse([w - 18, 10, w - 10, 18], fill=(239, 68, 68, 255), outline=(255, 255, 255, 255), width=1)
    # Bottom-Left
    draw.line([(12, h - 12 - corner_size), (12, h - 12), (12 + corner_size, h - 12)], fill=(255, 223, 100, 255), width=4)
    draw.ellipse([10, h - 18, 18, h - 10], fill=(239, 68, 68, 255), outline=(255, 255, 255, 255), width=1)
    # Bottom-Right
    draw.line([(w - 12 - corner_size, h - 12), (w - 12, h - 12), (w - 12, h - 12 - corner_size)], fill=(255, 223, 100, 255), width=4)
    draw.ellipse([w - 18, h - 18, w - 10, h - 10], fill=(239, 68, 68, 255), outline=(255, 255, 255, 255), width=1)

    return im

def build_all_ui():
    os.makedirs('assets', exist_ok=True)
    print("Generating 3D Avatar Frame...")
    build_avatar_frame().save('assets/ui_avatar_frame.png')

    print("Generating 3D Attack Button...")
    build_attack_button().save('assets/ui_btn_attack.png')

    print("Generating 3D Joystick Base...")
    build_joystick_base().save('assets/ui_joystick_base.png')

    print("Generating 3D Joystick Knob...")
    build_joystick_knob().save('assets/ui_joystick_knob.png')

    print("Generating 3D Modal Background...")
    build_modal_background().save('assets/ui_modal_bg.png')

    print("All 3D UI textures built successfully!")

if __name__ == '__main__':
    build_all_ui()
