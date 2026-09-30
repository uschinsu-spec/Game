import math
from PIL import Image, ImageDraw, ImageFilter

# Constants for supersampling
SCALE = 4
FRAME_SIZE = 128
RENDER_SIZE = FRAME_SIZE * SCALE  # 512x512
GROUND_Y = int(108 * SCALE)  # baseline for feet on ground
CENTER_X = int(64 * SCALE)

def hex_to_rgba(hex_str, alpha=255):
    hex_str = hex_str.lstrip('#')
    r, g, b = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    return (r, g, b, alpha)

# Color Palette (Minimalist Xianxia Swordsman)
C_HAIR_DARK = hex_to_rgba('#090d16')
C_HAIR_MID = hex_to_rgba('#1e293b')
C_HAIR_LIGHT = hex_to_rgba('#38bdf8')
C_SKIN = hex_to_rgba('#fde68a')
C_SKIN_SHADOW = hex_to_rgba('#f59e0b')
C_EYE = hex_to_rgba('#0f172a')
C_EYE_HIGHLIGHT = hex_to_rgba('#ffffff')
C_ROBE_DARK = hex_to_rgba('#0f172a')
C_ROBE_MAIN = hex_to_rgba('#0284c7')
C_ROBE_LIGHT = hex_to_rgba('#38bdf8')
C_ROBE_WHITE = hex_to_rgba('#f8fafc')
C_GOLD = hex_to_rgba('#fbbf24')
C_GOLD_DARK = hex_to_rgba('#b45309')
C_BOOTS = hex_to_rgba('#1e293b')
C_BOOTS_TRIM = hex_to_rgba('#e2e8f0')
C_RIBBON = hex_to_rgba('#06b6d4')
C_RIBBON_LIGHT = hex_to_rgba('#67e8f9')
C_SWORD_STEEL = hex_to_rgba('#e2e8f0')
C_SWORD_GLOW = hex_to_rgba('#38bdf8')
C_SLASH_FX = hex_to_rgba('#38bdf8')
C_SLASH_CORE = hex_to_rgba('#ffffff')
C_DUST = hex_to_rgba('#cbd5e1', 160)

def draw_capsule(draw, p1, p2, radius, fill, outline=None, width=1):
    x1, y1 = p1
    x2, y2 = p2
    draw.line([p1, p2], fill=fill, width=int(radius * 2))
    draw.ellipse([x1 - radius, y1 - radius, x1 + radius, y1 + radius], fill=fill)
    draw.ellipse([x2 - radius, y2 - radius, x2 + radius, y2 + radius], fill=fill)
    if outline:
        # Outline logic if needed
        pass

def draw_limb(draw, root, mid, tip, r_root, r_mid, r_tip, fill, trim=None):
    draw_capsule(draw, root, mid, (r_root + r_mid) / 2, fill)
    draw_capsule(draw, mid, tip, (r_mid + r_tip) / 2, fill)
    if trim:
        draw.ellipse([tip[0]-r_tip, tip[1]-r_tip, tip[0]+r_tip, tip[1]+r_tip], fill=trim)

def render_frame_idle(frame_idx, total_frames=8):
    im = Image.new('RGBA', (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    phase = frame_idx / total_frames * 2 * math.pi
    bob_y = math.sin(phase) * 4 * SCALE
    breathe = math.cos(phase) * 1.5 * SCALE
    ribbon_sway = math.sin(phase - 0.5) * 8 * SCALE

    cx = CENTER_X
    cy = GROUND_Y - int(48 * SCALE) + int(bob_y)

    # Feet on ground (fixed baseline)
    foot_l = (cx - 10 * SCALE, GROUND_Y - 3 * SCALE)
    foot_r = (cx + 10 * SCALE, GROUND_Y - 3 * SCALE)

    # 1. Back ribbon/scarf
    ribbon_p = [
        (cx - 2 * SCALE, cy - 18 * SCALE),
        (cx - 16 * SCALE + ribbon_sway * 0.5, cy - 8 * SCALE),
        (cx - 28 * SCALE + ribbon_sway, cy + 4 * SCALE),
        (cx - 36 * SCALE + ribbon_sway * 1.2, cy + 18 * SCALE)
    ]
    draw.line(ribbon_p, fill=C_RIBBON, width=int(5 * SCALE))
    draw.line([(p[0], p[1]-SCALE) for p in ribbon_p], fill=C_RIBBON_LIGHT, width=int(2 * SCALE))

    # 2. Back Sword on Scabbard
    sword_top = (cx - 18 * SCALE, cy - 32 * SCALE + int(bob_y * 0.3))
    sword_bot = (cx + 14 * SCALE, cy + 16 * SCALE)
    draw.line([sword_top, sword_bot], fill=C_ROBE_DARK, width=int(6 * SCALE))
    draw.line([sword_top, (cx - 12 * SCALE, cy - 24 * SCALE)], fill=C_GOLD, width=int(8 * SCALE))
    # Sword hilt & pommel
    draw.ellipse([sword_top[0]-4*SCALE, sword_top[1]-4*SCALE, sword_top[0]+4*SCALE, sword_top[1]+4*SCALE], fill=C_GOLD)
    # Luminous gem
    draw.ellipse([sword_top[0]-1.5*SCALE, sword_top[1]-1.5*SCALE, sword_top[0]+1.5*SCALE, sword_top[1]+1.5*SCALE], fill=C_SWORD_GLOW)

    # 3. Legs
    hip_l = (cx - 7 * SCALE, cy + 12 * SCALE)
    hip_r = (cx + 7 * SCALE, cy + 12 * SCALE)
    knee_l = (cx - 9 * SCALE, cy + 26 * SCALE + int(bob_y * 0.4))
    knee_r = (cx + 9 * SCALE, cy + 26 * SCALE + int(bob_y * 0.4))
    draw_limb(draw, hip_l, knee_l, foot_l, 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)
    draw_limb(draw, hip_r, knee_r, foot_r, 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)

    # 4. Robe Skirt (Lower Body)
    skirt_poly = [
        (cx - 11 * SCALE, cy + 8 * SCALE),
        (cx + 11 * SCALE, cy + 8 * SCALE),
        (cx + 14 * SCALE + int(breathe * 0.5), cy + 26 * SCALE),
        (cx + 6 * SCALE, cy + 29 * SCALE),
        (cx, cy + 27 * SCALE),
        (cx - 6 * SCALE, cy + 29 * SCALE),
        (cx - 14 * SCALE - int(breathe * 0.5), cy + 26 * SCALE),
    ]
    draw.polygon(skirt_poly, fill=C_ROBE_MAIN)
    # Inner robe split
    draw.polygon([
        (cx - 4 * SCALE, cy + 10 * SCALE),
        (cx + 4 * SCALE, cy + 10 * SCALE),
        (cx + 5 * SCALE, cy + 27 * SCALE),
        (cx - 5 * SCALE, cy + 27 * SCALE),
    ], fill=C_ROBE_WHITE)

    # 5. Torso / Upper Robe
    torso_poly = [
        (cx - 11 * SCALE - int(breathe * 0.5), cy - 10 * SCALE),
        (cx + 11 * SCALE + int(breathe * 0.5), cy - 10 * SCALE),
        (cx + 10 * SCALE, cy + 10 * SCALE),
        (cx - 10 * SCALE, cy + 10 * SCALE),
    ]
    draw.polygon(torso_poly, fill=C_ROBE_DARK)
    # Robe collar / lapel
    draw.polygon([
        (cx - 8 * SCALE, cy - 10 * SCALE),
        (cx, cy + 2 * SCALE),
        (cx + 8 * SCALE, cy - 10 * SCALE),
        (cx + 4 * SCALE, cy - 10 * SCALE),
        (cx, cy - 4 * SCALE),
        (cx - 4 * SCALE, cy - 10 * SCALE),
    ], fill=C_ROBE_WHITE)
    # Gold Sash / Belt
    draw.rectangle([cx - 10 * SCALE, cy + 6 * SCALE, cx + 10 * SCALE, cy + 10 * SCALE], fill=C_GOLD)
    draw.ellipse([cx - 3 * SCALE, cy + 5 * SCALE, cx + 3 * SCALE, cy + 11 * SCALE], fill=C_GOLD_DARK)

    # 6. Arms (Idle posture, hands gracefully held or resting near belt)
    shoulder_l = (cx - 10 * SCALE, cy - 7 * SCALE)
    shoulder_r = (cx + 10 * SCALE, cy - 7 * SCALE)
    elbow_l = (cx - 13 * SCALE, cy + 2 * SCALE)
    elbow_r = (cx + 13 * SCALE, cy + 2 * SCALE)
    hand_l = (cx - 7 * SCALE, cy + 7 * SCALE)
    hand_r = (cx + 7 * SCALE, cy + 7 * SCALE)
    draw_limb(draw, shoulder_l, elbow_l, hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
    draw_limb(draw, shoulder_r, elbow_r, hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

    # 7. Head & Face
    head_cx = cx
    head_cy = cy - 20 * SCALE
    head_r = 13 * SCALE

    # Face skin base
    draw.ellipse([head_cx - head_r, head_cy - head_r + 2 * SCALE, head_cx + head_r, head_cy + head_r], fill=C_SKIN)
    # Subtle blush
    draw.ellipse([head_cx - 9 * SCALE, head_cy + 3 * SCALE, head_cx - 4 * SCALE, head_cy + 6 * SCALE], fill=C_SKIN_SHADOW)
    draw.ellipse([head_cx + 4 * SCALE, head_cy + 3 * SCALE, head_cx + 9 * SCALE, head_cy + 6 * SCALE], fill=C_SKIN_SHADOW)

    # Eyes (Minimalist, charming martial anime eyes)
    # Left eye
    draw.ellipse([head_cx - 8 * SCALE, head_cy - 1 * SCALE, head_cx - 4 * SCALE, head_cy + 4 * SCALE], fill=C_EYE)
    draw.ellipse([head_cx - 7 * SCALE, head_cy - 0.5 * SCALE, head_cx - 5 * SCALE, head_cy + 1.5 * SCALE], fill=C_EYE_HIGHLIGHT)
    # Right eye
    draw.ellipse([head_cx + 4 * SCALE, head_cy - 1 * SCALE, head_cx + 8 * SCALE, head_cy + 4 * SCALE], fill=C_EYE)
    draw.ellipse([head_cx + 5 * SCALE, head_cy - 0.5 * SCALE, head_cx + 7 * SCALE, head_cy + 1.5 * SCALE], fill=C_EYE_HIGHLIGHT)

    # Eyebrows
    draw.line([(head_cx - 9 * SCALE, head_cy - 3 * SCALE), (head_cx - 4 * SCALE, head_cy - 4 * SCALE)], fill=C_HAIR_DARK, width=int(1.5 * SCALE))
    draw.line([(head_cx + 4 * SCALE, head_cy - 4 * SCALE), (head_cx + 9 * SCALE, head_cy - 3 * SCALE)], fill=C_HAIR_DARK, width=int(1.5 * SCALE))

    # 8. Hair & Headband
    # Back hair
    # Bangs / Front hair
    hair_poly = [
        (head_cx - 14 * SCALE, head_cy - 2 * SCALE),
        (head_cx - 14 * SCALE, head_cy - 12 * SCALE),
        (head_cx - 8 * SCALE, head_cy - 16 * SCALE),
        (head_cx, head_cy - 17 * SCALE),
        (head_cx + 8 * SCALE, head_cy - 16 * SCALE),
        (head_cx + 14 * SCALE, head_cy - 12 * SCALE),
        (head_cx + 14 * SCALE, head_cy - 2 * SCALE),
        (head_cx + 10 * SCALE, head_cy - 4 * SCALE),
        (head_cx + 6 * SCALE, head_cy - 0 * SCALE),
        (head_cx + 3 * SCALE, head_cy - 5 * SCALE),
        (head_cx - 1 * SCALE, head_cy - 1 * SCALE),
        (head_cx - 5 * SCALE, head_cy - 6 * SCALE),
        (head_cx - 10 * SCALE, head_cy - 3 * SCALE),
    ]
    draw.polygon(hair_poly, fill=C_HAIR_MID)
    # Top hair volume
    draw.ellipse([head_cx - 12 * SCALE, head_cy - 18 * SCALE, head_cx + 12 * SCALE, head_cy - 6 * SCALE], fill=C_HAIR_DARK)
    # Hair highlight streak
    draw.arc([head_cx - 10 * SCALE, head_cy - 15 * SCALE, head_cx + 10 * SCALE, head_cy - 7 * SCALE], 200, 340, fill=C_HAIR_LIGHT, width=int(2 * SCALE))

    # Headband / Topknot
    draw.rectangle([head_cx - 13 * SCALE, head_cy - 10 * SCALE, head_cx + 13 * SCALE, head_cy - 7 * SCALE], fill=C_RIBBON)
    draw.ellipse([head_cx - 3 * SCALE, head_cy - 11 * SCALE, head_cx + 3 * SCALE, head_cy - 6 * SCALE], fill=C_GOLD)
    # Topknot bun
    draw.ellipse([head_cx - 5 * SCALE, head_cy - 23 * SCALE, head_cx + 5 * SCALE, head_cy - 15 * SCALE], fill=C_HAIR_DARK)
    draw.ellipse([head_cx - 2 * SCALE, head_cy - 20 * SCALE, head_cx + 2 * SCALE, head_cy - 16 * SCALE], fill=C_GOLD)

    return im.resize((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS)

# Build a test idle sheet and check
test_sheet = Image.new('RGBA', (FRAME_SIZE * 8, FRAME_SIZE))
for i in range(8):
    frame = render_frame_idle(i, 8)
    test_sheet.paste(frame, (i * FRAME_SIZE, 0))
test_sheet.save('assets/test_player.png')
print('Rendered test_player.png successfully!')
