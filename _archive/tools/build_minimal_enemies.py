import math
import os
from PIL import Image, ImageDraw, ImageFilter

SCALE = 4

def hex_to_rgba(hex_str, alpha=255):
    hex_str = hex_str.lstrip('#')
    r, g, b = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    return (r, g, b, alpha)

def draw_capsule(draw, p1, p2, radius, fill):
    x1, y1 = p1
    x2, y2 = p2
    draw.line([p1, p2], fill=fill, width=int(radius * 2))
    draw.ellipse([x1 - radius, y1 - radius, x1 + radius, y1 + radius], fill=fill)
    draw.ellipse([x2 - radius, y2 - radius, x2 + radius, y2 + radius], fill=fill)

def draw_limb(draw, root, mid, tip, r_root, r_mid, r_tip, fill, trim=None):
    draw_capsule(draw, root, mid, (r_root + r_mid) / 2, fill)
    draw_capsule(draw, mid, tip, (r_mid + r_tip) / 2, fill)
    if trim:
        draw.ellipse([tip[0]-r_tip, tip[1]-r_tip, tip[0]+r_tip, tip[1]+r_tip], fill=trim)

# ----------------------------------------------------------------------
# 1. GOBLIN / DEMON MINION (128x128 px, 10 Frames: 2 Idle, 4 Run, 4 Attack)
# ----------------------------------------------------------------------
def render_goblin_frame(idx):
    size = 128 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx = 64 * SCALE
    ground_y = 110 * SCALE

    # Palette
    C_SKIN = hex_to_rgba('#10b981')
    C_SKIN_DARK = hex_to_rgba('#047857')
    C_HORN = hex_to_rgba('#ef4444')
    C_EYE = hex_to_rgba('#fef08a')
    C_EYE_PUPIL = hex_to_rgba('#991b1b')
    C_ARMOR = hex_to_rgba('#1e293b')
    C_ARMOR_GOLD = hex_to_rgba('#f59e0b')
    C_SWORD = hex_to_rgba('#e2e8f0')
    C_SWORD_DARK = hex_to_rgba('#64748b')
    C_SLASH = hex_to_rgba('#ef4444', 210)
    C_SLASH_CORE = hex_to_rgba('#ffffff')
    C_SHADOW = hex_to_rgba('#000000', 80)
    C_DUST = hex_to_rgba('#cbd5e1', 140)

    # 10 Frames:
    # 0, 1: Idle (2 frames)
    # 2, 3, 4, 5: Run (4 frames)
    # 6, 7, 8, 9: Attack (4 frames)

    if idx in (0, 1):
        # --- IDLE (2 Frames) ---
        bob = (0 if idx == 0 else 3) * SCALE
        cy = ground_y - 46 * SCALE + bob
        draw.ellipse([cx - 22*SCALE, ground_y - 4*SCALE, cx + 22*SCALE, ground_y + 4*SCALE], fill=C_SHADOW)

        # Legs
        draw_limb(draw, (cx - 7*SCALE, cy + 12*SCALE), (cx - 9*SCALE, cy + 24*SCALE), (cx - 9*SCALE, ground_y - 2*SCALE), 4*SCALE, 3.5*SCALE, 3.5*SCALE, C_ARMOR)
        draw_limb(draw, (cx + 7*SCALE, cy + 12*SCALE), (cx + 9*SCALE, cy + 24*SCALE), (cx + 9*SCALE, ground_y - 2*SCALE), 4*SCALE, 3.5*SCALE, 3.5*SCALE, C_ARMOR)

        # Torso & Belt
        draw.polygon([(cx - 10*SCALE, cy - 8*SCALE), (cx + 10*SCALE, cy - 8*SCALE), (cx + 8*SCALE, cy + 12*SCALE), (cx - 8*SCALE, cy + 12*SCALE)], fill=C_ARMOR)
        draw.rectangle([cx - 8*SCALE, cy + 8*SCALE, cx + 8*SCALE, cy + 12*SCALE], fill=C_ARMOR_GOLD)

        # Sword arm & Scimitar
        draw_limb(draw, (cx + 8*SCALE, cy - 6*SCALE), (cx + 14*SCALE, cy + 4*SCALE), (cx + 10*SCALE, cy + 10*SCALE), 3.5*SCALE, 3*SCALE, 2.5*SCALE, C_SKIN)
        draw.polygon([(cx + 10*SCALE, cy + 10*SCALE), (cx + 24*SCALE, cy - 8*SCALE), (cx + 28*SCALE, cy - 6*SCALE), (cx + 12*SCALE, cy + 12*SCALE)], fill=C_SWORD)
        draw.line([(cx + 10*SCALE, cy + 10*SCALE), (cx + 26*SCALE, cy - 7*SCALE)], fill=C_SWORD_DARK, width=int(1.5*SCALE))

        # Left Arm
        draw_limb(draw, (cx - 8*SCALE, cy - 6*SCALE), (cx - 13*SCALE, cy + 2*SCALE), (cx - 10*SCALE, cy + 8*SCALE), 3.5*SCALE, 3*SCALE, 2.5*SCALE, C_SKIN)

        # Head & Face
        head_y = cy - 18 * SCALE
        draw.ellipse([cx - 11*SCALE, head_y - 11*SCALE, cx + 11*SCALE, head_y + 11*SCALE], fill=C_SKIN)
        # Red Horns
        draw.polygon([(cx - 8*SCALE, head_y - 8*SCALE), (cx - 14*SCALE, head_y - 18*SCALE), (cx - 4*SCALE, head_y - 10*SCALE)], fill=C_HORN)
        draw.polygon([(cx + 8*SCALE, head_y - 8*SCALE), (cx + 14*SCALE, head_y - 18*SCALE), (cx + 4*SCALE, head_y - 10*SCALE)], fill=C_HORN)
        # Eyes
        draw.ellipse([cx - 7*SCALE, head_y - 2*SCALE, cx - 2*SCALE, head_y + 3*SCALE], fill=C_EYE)
        draw.ellipse([cx + 2*SCALE, head_y - 2*SCALE, cx + 7*SCALE, head_y + 3*SCALE], fill=C_EYE)
        draw.ellipse([cx - 5*SCALE, head_y - 1*SCALE, cx - 3*SCALE, head_y + 2*SCALE], fill=C_EYE_PUPIL)
        draw.ellipse([cx + 3*SCALE, head_y - 1*SCALE, cx + 5*SCALE, head_y + 2*SCALE], fill=C_EYE_PUPIL)

    elif idx in (2, 3, 4, 5):
        # --- RUN (4 Frames: 2, 3, 4, 5) ---
        r_idx = idx - 2
        phase = r_idx / 4.0 * 2 * math.pi
        lean_x = 5 * SCALE
        bounce = abs(math.sin(phase)) * 4 * SCALE
        cy = ground_y - 48 * SCALE - bounce

        draw.ellipse([cx - 20*SCALE, ground_y - 4*SCALE, cx + 20*SCALE, ground_y + 4*SCALE], fill=C_SHADOW)
        if r_idx in (0, 2):
            draw.ellipse([cx - 18*SCALE, ground_y - 4*SCALE, cx - 8*SCALE, ground_y + 2*SCALE], fill=C_DUST)

        # Running Legs
        stride = math.sin(phase)
        foot_lx = cx - 5*SCALE + stride * 16*SCALE
        foot_ly = ground_y - 2*SCALE - max(0, -stride * 12*SCALE)
        foot_rx = cx + 5*SCALE - stride * 16*SCALE
        foot_ry = ground_y - 2*SCALE - max(0, stride * 12*SCALE)

        draw_limb(draw, (cx - 5*SCALE, cy + 12*SCALE), ((cx - 5*SCALE + foot_lx)/2, cy + 22*SCALE), (foot_lx, foot_ly), 4*SCALE, 3.5*SCALE, 3.5*SCALE, C_ARMOR)
        draw_limb(draw, (cx + 5*SCALE, cy + 12*SCALE), ((cx + 5*SCALE + foot_rx)/2, cy + 22*SCALE), (foot_rx, foot_ry), 4*SCALE, 3.5*SCALE, 3.5*SCALE, C_ARMOR)

        # Torso
        draw.polygon([(cx - 10*SCALE + lean_x, cy - 8*SCALE), (cx + 10*SCALE + lean_x, cy - 8*SCALE), (cx + 8*SCALE, cy + 12*SCALE), (cx - 8*SCALE, cy + 12*SCALE)], fill=C_ARMOR)

        # Running Sword Arm (Forward & Back)
        arm_sw = -stride
        hand_x = cx + lean_x + 12*SCALE + arm_sw * 12*SCALE
        hand_y = cy + 2*SCALE
        draw_limb(draw, (cx + lean_x + 8*SCALE, cy - 6*SCALE), (hand_x - 3*SCALE, hand_y + 3*SCALE), (hand_x, hand_y), 3.5*SCALE, 3*SCALE, 2.5*SCALE, C_SKIN)
        draw.polygon([(hand_x, hand_y), (hand_x + 20*SCALE, hand_y - 12*SCALE), (hand_x + 24*SCALE, hand_y - 10*SCALE), (hand_x + 2*SCALE, hand_y + 2*SCALE)], fill=C_SWORD)

        # Left Arm
        draw_limb(draw, (cx + lean_x - 8*SCALE, cy - 6*SCALE), (cx + lean_x - 12*SCALE - arm_sw*8*SCALE, cy + 2*SCALE), (cx + lean_x - 8*SCALE - arm_sw*10*SCALE, cy + 6*SCALE), 3.5*SCALE, 3*SCALE, 2.5*SCALE, C_SKIN)

        # Head
        head_y = cy - 18 * SCALE
        draw.ellipse([cx + lean_x - 11*SCALE, head_y - 11*SCALE, cx + lean_x + 11*SCALE, head_y + 11*SCALE], fill=C_SKIN)
        draw.polygon([(cx + lean_x - 8*SCALE, head_y - 8*SCALE), (cx + lean_x - 14*SCALE, head_y - 18*SCALE), (cx + lean_x - 4*SCALE, head_y - 10*SCALE)], fill=C_HORN)
        draw.polygon([(cx + lean_x + 8*SCALE, head_y - 8*SCALE), (cx + lean_x + 14*SCALE, head_y - 18*SCALE), (cx + lean_x + 4*SCALE, head_y - 10*SCALE)], fill=C_HORN)
        draw.ellipse([cx + lean_x - 6*SCALE, head_y - 2*SCALE, cx + lean_x - 1*SCALE, head_y + 3*SCALE], fill=C_EYE)
        draw.ellipse([cx + lean_x + 3*SCALE, head_y - 2*SCALE, cx + lean_x + 8*SCALE, head_y + 3*SCALE], fill=C_EYE)

    else:
        # --- ATTACK (4 Frames: 6, 7, 8, 9) ---
        a_idx = idx - 6
        lunge_x = [-4, 6, 14, 4][a_idx] * SCALE
        cy = ground_y - 46 * SCALE

        draw.ellipse([cx + lunge_x - 24*SCALE, ground_y - 4*SCALE, cx + lunge_x + 24*SCALE, ground_y + 4*SCALE], fill=C_SHADOW)

        # Stance
        draw_limb(draw, (cx + lunge_x - 6*SCALE, cy + 12*SCALE), (cx + lunge_x - 14*SCALE, cy + 22*SCALE), (cx + lunge_x - 16*SCALE, ground_y - 2*SCALE), 4*SCALE, 3.5*SCALE, 3.5*SCALE, C_ARMOR)
        draw_limb(draw, (cx + lunge_x + 6*SCALE, cy + 12*SCALE), (cx + lunge_x + 12*SCALE, cy + 22*SCALE), (cx + lunge_x + 14*SCALE, ground_y - 2*SCALE), 4*SCALE, 3.5*SCALE, 3.5*SCALE, C_ARMOR)
        draw.polygon([(cx + lunge_x - 10*SCALE, cy - 8*SCALE), (cx + lunge_x + 10*SCALE, cy - 8*SCALE), (cx + lunge_x + 8*SCALE, cy + 12*SCALE), (cx + lunge_x - 8*SCALE, cy + 12*SCALE)], fill=C_ARMOR)

        # Head
        head_y = cy - 18 * SCALE
        draw.ellipse([cx + lunge_x - 11*SCALE, head_y - 11*SCALE, cx + lunge_x + 11*SCALE, head_y + 11*SCALE], fill=C_SKIN)
        draw.polygon([(cx + lunge_x - 8*SCALE, head_y - 8*SCALE), (cx + lunge_x - 14*SCALE, head_y - 18*SCALE), (cx + lunge_x - 4*SCALE, head_y - 10*SCALE)], fill=C_HORN)
        draw.polygon([(cx + lunge_x + 8*SCALE, head_y - 8*SCALE), (cx + lunge_x + 14*SCALE, head_y - 18*SCALE), (cx + lunge_x + 4*SCALE, head_y - 10*SCALE)], fill=C_HORN)
        draw.ellipse([cx + lunge_x - 6*SCALE, head_y - 2*SCALE, cx + lunge_x - 1*SCALE, head_y + 3*SCALE], fill=C_EYE)
        draw.ellipse([cx + lunge_x + 3*SCALE, head_y - 2*SCALE, cx + lunge_x + 8*SCALE, head_y + 3*SCALE], fill=C_EYE)

        # Attack Sword Motion
        if a_idx == 0:
            # Windup
            hand_x = cx + lunge_x - 10*SCALE
            hand_y = cy - 12*SCALE
            draw_limb(draw, (cx + lunge_x + 8*SCALE, cy - 6*SCALE), (cx + lunge_x - 4*SCALE, cy - 10*SCALE), (hand_x, hand_y), 3.5*SCALE, 3*SCALE, 2.5*SCALE, C_SKIN)
            draw.polygon([(hand_x, hand_y), (hand_x - 16*SCALE, hand_y - 18*SCALE), (hand_x - 20*SCALE, hand_y - 14*SCALE), (hand_x - 2*SCALE, hand_y + 2*SCALE)], fill=C_SWORD)
        elif a_idx in (1, 2):
            # Slash Thrust & Arc
            hand_x = cx + lunge_x + 18*SCALE
            hand_y = cy - 2*SCALE
            draw_limb(draw, (cx + lunge_x + 8*SCALE, cy - 6*SCALE), (cx + lunge_x + 14*SCALE, cy - 4*SCALE), (hand_x, hand_y), 3.5*SCALE, 3*SCALE, 2.5*SCALE, C_SKIN)
            draw.polygon([(hand_x, hand_y), (hand_x + 28*SCALE, hand_y + 4*SCALE), (hand_x + 26*SCALE, hand_y + 10*SCALE), (hand_x - 2*SCALE, hand_y + 2*SCALE)], fill=C_SWORD)
            # Red Slash Arc
            draw.arc([hand_x - 10*SCALE, hand_y - 30*SCALE, hand_x + 40*SCALE, hand_y + 24*SCALE], -60, 45, fill=C_SLASH, width=int(8*SCALE))
            draw.arc([hand_x - 8*SCALE, hand_y - 28*SCALE, hand_x + 38*SCALE, hand_y + 22*SCALE], -55, 40, fill=C_SLASH_CORE, width=int(3*SCALE))
        else:
            # Recovery
            hand_x = cx + lunge_x + 10*SCALE
            hand_y = cy + 4*SCALE
            draw_limb(draw, (cx + lunge_x + 8*SCALE, cy - 6*SCALE), (cx + lunge_x + 12*SCALE, cy - 2*SCALE), (hand_x, hand_y), 3.5*SCALE, 3*SCALE, 2.5*SCALE, C_SKIN)
            draw.polygon([(hand_x, hand_y), (hand_x + 18*SCALE, hand_y - 10*SCALE), (hand_x + 22*SCALE, hand_y - 8*SCALE), (hand_x + 2*SCALE, hand_y + 2*SCALE)], fill=C_SWORD)

    return im.resize((128, 128), Image.Resampling.LANCZOS)

# ----------------------------------------------------------------------
# 2. BOAR / BEAST (128x128 px, 10 Frames: 2 Idle, 4 Run, 4 Attack)
# ----------------------------------------------------------------------
def render_boar_frame(idx):
    size = 128 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx = 64 * SCALE
    ground_y = 110 * SCALE

    C_HIDE = hex_to_rgba('#7f1d1d')
    C_HIDE_DARK = hex_to_rgba('#450a0a')
    C_TUSK = hex_to_rgba('#fef08a')
    C_MANE = hex_to_rgba('#f97316')
    C_EYE = hex_to_rgba('#fef08a')
    C_EYE_P = hex_to_rgba('#dc2626')
    C_SHADOW = hex_to_rgba('#000000', 80)
    C_DUST = hex_to_rgba('#cbd5e1', 140)
    C_CLAW_FX = hex_to_rgba('#f97316', 200)

    if idx in (0, 1):
        # Idle (2 frames)
        bob = (0 if idx == 0 else 3) * SCALE
        cy = ground_y - 36 * SCALE + bob
        draw.ellipse([cx - 26*SCALE, ground_y - 4*SCALE, cx + 26*SCALE, ground_y + 4*SCALE], fill=C_SHADOW)

        # 4 Legs
        for lx in (-18, -10, 10, 18):
            draw_capsule(draw, (cx + lx*SCALE, cy + 8*SCALE), (cx + lx*SCALE, ground_y - 2*SCALE), 4*SCALE, C_HIDE_DARK)

        # Body Oval
        draw.ellipse([cx - 26*SCALE, cy - 16*SCALE, cx + 22*SCALE, cy + 16*SCALE], fill=C_HIDE)
        # Fiery Mane
        draw.polygon([(cx - 20*SCALE, cy - 14*SCALE), (cx - 10*SCALE, cy - 24*SCALE), (cx, cy - 14*SCALE), (cx + 10*SCALE, cy - 24*SCALE), (cx + 18*SCALE, cy - 14*SCALE)], fill=C_MANE)

        # Snout & Massive Tusk
        snout_x = cx + 22 * SCALE
        draw.ellipse([snout_x - 6*SCALE, cy - 6*SCALE, snout_x + 12*SCALE, cy + 8*SCALE], fill=C_HIDE_DARK)
        # Tusk curved up
        draw.polygon([(snout_x + 4*SCALE, cy + 6*SCALE), (snout_x + 16*SCALE, cy - 12*SCALE), (snout_x + 8*SCALE, cy + 8*SCALE)], fill=C_TUSK)
        # Eye
        draw.ellipse([snout_x - 2*SCALE, cy - 6*SCALE, snout_x + 4*SCALE, cy - 1*SCALE], fill=C_EYE)
        draw.ellipse([snout_x, cy - 5*SCALE, snout_x + 3*SCALE, cy - 2*SCALE], fill=C_EYE_P)

    elif idx in (2, 3, 4, 5):
        # Run / Gallop (4 frames)
        r_idx = idx - 2
        phase = r_idx / 4.0 * 2 * math.pi
        lean_x = 6 * SCALE
        bounce = abs(math.sin(phase)) * 6 * SCALE
        cy = ground_y - 38 * SCALE - bounce

        draw.ellipse([cx - 28*SCALE, ground_y - 4*SCALE, cx + 28*SCALE, ground_y + 4*SCALE], fill=C_SHADOW)
        if r_idx in (0, 2):
            draw.ellipse([cx - 28*SCALE, ground_y - 5*SCALE, cx - 14*SCALE, ground_y + 2*SCALE], fill=C_DUST)

        # Gallop Leg Angles
        st_front = math.sin(phase)
        st_back = math.sin(phase + math.pi)

        # Back legs
        draw_capsule(draw, (cx - 16*SCALE, cy + 8*SCALE), (cx - 16*SCALE + st_back*14*SCALE, ground_y - 2*SCALE), 4*SCALE, C_HIDE_DARK)
        draw_capsule(draw, (cx - 10*SCALE, cy + 8*SCALE), (cx - 10*SCALE + st_back*12*SCALE, ground_y - 2*SCALE), 4*SCALE, C_HIDE_DARK)

        # Body
        draw.ellipse([cx - 26*SCALE + lean_x, cy - 16*SCALE, cx + 22*SCALE + lean_x, cy + 16*SCALE], fill=C_HIDE)
        draw.polygon([(cx - 20*SCALE + lean_x, cy - 14*SCALE), (cx - 10*SCALE + lean_x, cy - 24*SCALE), (cx + lean_x, cy - 14*SCALE), (cx + 10*SCALE + lean_x, cy - 24*SCALE), (cx + 18*SCALE + lean_x, cy - 14*SCALE)], fill=C_MANE)

        # Front legs
        draw_capsule(draw, (cx + 10*SCALE + lean_x, cy + 8*SCALE), (cx + 10*SCALE + lean_x + st_front*14*SCALE, ground_y - 2*SCALE), 4*SCALE, C_HIDE_DARK)
        draw_capsule(draw, (cx + 18*SCALE + lean_x, cy + 8*SCALE), (cx + 18*SCALE + lean_x + st_front*16*SCALE, ground_y - 2*SCALE), 4*SCALE, C_HIDE_DARK)

        # Snout & Tusk
        snout_x = cx + lean_x + 22 * SCALE
        draw.ellipse([snout_x - 6*SCALE, cy - 6*SCALE, snout_x + 12*SCALE, cy + 8*SCALE], fill=C_HIDE_DARK)
        draw.polygon([(snout_x + 4*SCALE, cy + 6*SCALE), (snout_x + 18*SCALE, cy - 14*SCALE), (snout_x + 8*SCALE, cy + 8*SCALE)], fill=C_TUSK)
        draw.ellipse([snout_x - 2*SCALE, cy - 6*SCALE, snout_x + 4*SCALE, cy - 1*SCALE], fill=C_EYE)

    else:
        # Attack / Gore Charge (4 frames)
        a_idx = idx - 6
        lunge_x = [-6, 8, 18, 6][a_idx] * SCALE
        cy = ground_y - 34 * SCALE + (4*SCALE if a_idx in (1, 2) else 0)

        draw.ellipse([cx + lunge_x - 30*SCALE, ground_y - 4*SCALE, cx + lunge_x + 30*SCALE, ground_y + 4*SCALE], fill=C_SHADOW)

        # Legs in Charge / Thrust Stance
        draw_capsule(draw, (cx + lunge_x - 18*SCALE, cy + 6*SCALE), (cx + lunge_x - 24*SCALE, ground_y - 2*SCALE), 4.5*SCALE, C_HIDE_DARK)
        draw_capsule(draw, (cx + lunge_x + 14*SCALE, cy + 6*SCALE), (cx + lunge_x + 22*SCALE, ground_y - 2*SCALE), 4.5*SCALE, C_HIDE_DARK)

        # Body
        draw.ellipse([cx + lunge_x - 26*SCALE, cy - 16*SCALE, cx + lunge_x + 22*SCALE, cy + 16*SCALE], fill=C_HIDE)
        draw.polygon([(cx + lunge_x - 20*SCALE, cy - 14*SCALE), (cx + lunge_x - 10*SCALE, cy - 24*SCALE), (cx + lunge_x, cy - 14*SCALE), (cx + lunge_x + 10*SCALE, cy - 24*SCALE), (cx + lunge_x + 18*SCALE, cy - 14*SCALE)], fill=C_MANE)

        # Snout & Tusk Gore Thrust
        snout_x = cx + lunge_x + 22 * SCALE
        draw.ellipse([snout_x - 6*SCALE, cy - 6*SCALE, snout_x + 14*SCALE, cy + 8*SCALE], fill=C_HIDE_DARK)
        draw.polygon([(snout_x + 4*SCALE, cy + 6*SCALE), (snout_x + 24*SCALE, cy - 16*SCALE), (snout_x + 10*SCALE, cy + 8*SCALE)], fill=C_TUSK)

        if a_idx in (1, 2):
            # Slash / Gore Impact Sparks
            draw.arc([snout_x, cy - 32*SCALE, snout_x + 36*SCALE, cy + 24*SCALE], -80, 40, fill=C_CLAW_FX, width=int(8*SCALE))
            draw.ellipse([snout_x + 18*SCALE, cy - 12*SCALE, snout_x + 26*SCALE, cy - 4*SCALE], fill=(255, 255, 255, 255))

    return im.resize((128, 128), Image.Resampling.LANCZOS)

# ----------------------------------------------------------------------
# 3. BAT / FLYING DEMON (128x128 px, 10 Frames: 2 Idle, 4 Run/Fly, 4 Attack)
# ----------------------------------------------------------------------
def render_bat_frame(idx):
    size = 128 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx = 64 * SCALE
    cy = 60 * SCALE
    ground_y = 110 * SCALE

    C_BODY = hex_to_rgba('#312e81')
    C_WING = hex_to_rgba('#4338ca')
    C_WING_MEMB = hex_to_rgba('#6366f1', 220)
    C_EYE = hex_to_rgba('#ef4444')
    C_SONIC = hex_to_rgba('#a855f7', 180)
    C_SHADOW = hex_to_rgba('#000000', 60)

    # Hover Shadow on Ground
    draw.ellipse([cx - 18*SCALE, ground_y - 4*SCALE, cx + 18*SCALE, ground_y + 4*SCALE], fill=C_SHADOW)

    if idx in (0, 1):
        # Hover Idle (2 frames)
        wing_span = 32 if idx == 0 else 24
        wing_y_off = 10 if idx == 0 else -10

        # Wings
        draw.polygon([(cx, cy), (cx - wing_span*SCALE, cy - wing_y_off*SCALE), (cx - (wing_span-10)*SCALE, cy + 14*SCALE)], fill=C_WING)
        draw.polygon([(cx, cy), (cx + wing_span*SCALE, cy - wing_y_off*SCALE), (cx + (wing_span-10)*SCALE, cy + 14*SCALE)], fill=C_WING)

        # Bat Body
        draw.ellipse([cx - 10*SCALE, cy - 12*SCALE, cx + 10*SCALE, cy + 12*SCALE], fill=C_BODY)
        # Ears & Horns
        draw.polygon([(cx - 8*SCALE, cy - 10*SCALE), (cx - 12*SCALE, cy - 22*SCALE), (cx - 3*SCALE, cy - 12*SCALE)], fill=C_BODY)
        draw.polygon([(cx + 8*SCALE, cy - 10*SCALE), (cx + 12*SCALE, cy - 22*SCALE), (cx + 3*SCALE, cy - 12*SCALE)], fill=C_BODY)
        # Glowing Red Eyes
        draw.ellipse([cx - 6*SCALE, cy - 4*SCALE, cx - 2*SCALE, cy + 1*SCALE], fill=C_EYE)
        draw.ellipse([cx + 2*SCALE, cy - 4*SCALE, cx + 6*SCALE, cy + 1*SCALE], fill=C_EYE)

    elif idx in (2, 3, 4, 5):
        # Fly Cycle (4 frames)
        r_idx = idx - 2
        angles = [-22, 0, 22, 0]
        spans = [34, 30, 22, 28]
        ang = angles[r_idx]
        span = spans[r_idx]

        # Wings
        draw.polygon([(cx, cy), (cx - span*SCALE, cy + ang*SCALE), (cx - (span-10)*SCALE, cy + 16*SCALE)], fill=C_WING)
        draw.polygon([(cx, cy), (cx + span*SCALE, cy + ang*SCALE), (cx + (span-10)*SCALE, cy + 16*SCALE)], fill=C_WING)

        # Body
        draw.ellipse([cx - 10*SCALE, cy - 12*SCALE, cx + 10*SCALE, cy + 12*SCALE], fill=C_BODY)
        draw.polygon([(cx - 8*SCALE, cy - 10*SCALE), (cx - 12*SCALE, cy - 22*SCALE), (cx - 3*SCALE, cy - 12*SCALE)], fill=C_BODY)
        draw.polygon([(cx + 8*SCALE, cy - 10*SCALE), (cx + 12*SCALE, cy - 22*SCALE), (cx + 3*SCALE, cy - 12*SCALE)], fill=C_BODY)
        draw.ellipse([cx - 6*SCALE, cy - 4*SCALE, cx - 2*SCALE, cy + 1*SCALE], fill=C_EYE)
        draw.ellipse([cx + 2*SCALE, cy - 4*SCALE, cx + 6*SCALE, cy + 1*SCALE], fill=C_EYE)

    else:
        # Attack / Sonic Blast & Swoop (4 frames)
        a_idx = idx - 6
        lunge_x = [-4, 6, 14, 4][a_idx] * SCALE

        # Expanded Wings
        draw.polygon([(cx + lunge_x, cy), (cx + lunge_x - 36*SCALE, cy - 18*SCALE), (cx + lunge_x - 22*SCALE, cy + 18*SCALE)], fill=C_WING)
        draw.polygon([(cx + lunge_x, cy), (cx + lunge_x + 36*SCALE, cy - 18*SCALE), (cx + lunge_x + 22*SCALE, cy + 18*SCALE)], fill=C_WING)

        # Body
        draw.ellipse([cx + lunge_x - 10*SCALE, cy - 12*SCALE, cx + lunge_x + 10*SCALE, cy + 12*SCALE], fill=C_BODY)
        draw.ellipse([cx + lunge_x - 6*SCALE, cy - 4*SCALE, cx + lunge_x - 2*SCALE, cy + 1*SCALE], fill=C_EYE)
        draw.ellipse([cx + lunge_x + 2*SCALE, cy - 4*SCALE, cx + lunge_x + 6*SCALE, cy + 1*SCALE], fill=C_EYE)

        # Sonic Shockwave Rings on strike
        if a_idx in (1, 2):
            draw.arc([cx + lunge_x + 6*SCALE, cy - 20*SCALE, cx + lunge_x + 36*SCALE, cy + 20*SCALE], -60, 60, fill=C_SONIC, width=int(6*SCALE))
            draw.arc([cx + lunge_x + 16*SCALE, cy - 30*SCALE, cx + lunge_x + 50*SCALE, cy + 30*SCALE], -60, 60, fill=C_SONIC, width=int(4*SCALE))

    return im.resize((128, 128), Image.Resampling.LANCZOS)

# ----------------------------------------------------------------------
# 4. BOSS / DEMON KING (192x192 px, 10 Frames: 2 Idle, 4 Run, 4 Attack)
# ----------------------------------------------------------------------
def render_boss_frame(idx):
    size = 192 * SCALE
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx = 96 * SCALE
    ground_y = 168 * SCALE

    C_BODY = hex_to_rgba('#0f172a')
    C_ARMOR = hex_to_rgba('#334155')
    C_GOLD = hex_to_rgba('#f59e0b')
    C_MAGMA = hex_to_rgba('#ef4444')
    C_MAGMA_GLOW = hex_to_rgba('#f97316')
    C_EYE = hex_to_rgba('#fef08a')
    C_SHADOW = hex_to_rgba('#000000', 95)
    C_DUST = hex_to_rgba('#cbd5e1', 160)
    C_SMASH = hex_to_rgba('#ef4444', 220)

    if idx in (0, 1):
        # Idle (2 frames)
        bob = (0 if idx == 0 else 4) * SCALE
        cy = ground_y - 70 * SCALE + bob
        draw.ellipse([cx - 42*SCALE, ground_y - 6*SCALE, cx + 42*SCALE, ground_y + 6*SCALE], fill=C_SHADOW)

        # Heavy Legs
        draw_limb(draw, (cx - 14*SCALE, cy + 20*SCALE), (cx - 18*SCALE, cy + 42*SCALE), (cx - 18*SCALE, ground_y - 4*SCALE), 7*SCALE, 6*SCALE, 6*SCALE, C_ARMOR)
        draw_limb(draw, (cx + 14*SCALE, cy + 20*SCALE), (cx + 18*SCALE, cy + 42*SCALE), (cx + 18*SCALE, ground_y - 4*SCALE), 7*SCALE, 6*SCALE, 6*SCALE, C_ARMOR)

        # Heavy Torso & Magma Core
        draw.polygon([(cx - 24*SCALE, cy - 16*SCALE), (cx + 24*SCALE, cy - 16*SCALE), (cx + 18*SCALE, cy + 22*SCALE), (cx - 18*SCALE, cy + 22*SCALE)], fill=C_BODY)
        draw.polygon([(cx - 8*SCALE, cy - 8*SCALE), (cx + 8*SCALE, cy - 8*SCALE), (cx, cy + 12*SCALE)], fill=C_MAGMA)
        # Gold Belt
        draw.rectangle([cx - 18*SCALE, cy + 16*SCALE, cx + 18*SCALE, cy + 22*SCALE], fill=C_GOLD)

        # Colossal Greatsword in Right Hand
        draw.line([(cx + 28*SCALE, cy + 10*SCALE), (cx + 38*SCALE, ground_y - 20*SCALE)], fill=C_ARMOR, width=int(12*SCALE))
        draw.line([(cx + 28*SCALE, cy + 10*SCALE), (cx + 38*SCALE, ground_y - 20*SCALE)], fill=C_MAGMA_GLOW, width=int(4*SCALE))

        # Arms
        draw_limb(draw, (cx - 20*SCALE, cy - 12*SCALE), (cx - 28*SCALE, cy + 6*SCALE), (cx - 22*SCALE, cy + 18*SCALE), 6*SCALE, 5*SCALE, 4.5*SCALE, C_ARMOR)
        draw_limb(draw, (cx + 20*SCALE, cy - 12*SCALE), (cx + 28*SCALE, cy + 4*SCALE), (cx + 28*SCALE, cy + 10*SCALE), 6*SCALE, 5*SCALE, 4.5*SCALE, C_ARMOR)

        # Head & Horns
        head_y = cy - 32 * SCALE
        draw.ellipse([cx - 18*SCALE, head_y - 18*SCALE, cx + 18*SCALE, head_y + 18*SCALE], fill=C_BODY)
        # Giant Magma Horns
        draw.polygon([(cx - 14*SCALE, head_y - 10*SCALE), (cx - 32*SCALE, head_y - 36*SCALE), (cx - 6*SCALE, head_y - 18*SCALE)], fill=C_MAGMA)
        draw.polygon([(cx + 14*SCALE, head_y - 10*SCALE), (cx + 32*SCALE, head_y - 36*SCALE), (cx + 6*SCALE, head_y - 18*SCALE)], fill=C_MAGMA)
        # Glowing Eyes
        draw.ellipse([cx - 10*SCALE, head_y - 4*SCALE, cx - 3*SCALE, head_y + 3*SCALE], fill=C_EYE)
        draw.ellipse([cx + 3*SCALE, head_y - 4*SCALE, cx + 10*SCALE, head_y + 3*SCALE], fill=C_EYE)

    elif idx in (2, 3, 4, 5):
        # March Run (4 frames)
        r_idx = idx - 2
        phase = r_idx / 4.0 * 2 * math.pi
        lean_x = 8 * SCALE
        bounce = abs(math.sin(phase)) * 6 * SCALE
        cy = ground_y - 72 * SCALE - bounce

        draw.ellipse([cx - 44*SCALE, ground_y - 6*SCALE, cx + 44*SCALE, ground_y + 6*SCALE], fill=C_SHADOW)
        if r_idx in (0, 2):
            draw.ellipse([cx - 38*SCALE, ground_y - 6*SCALE, cx - 18*SCALE, ground_y + 4*SCALE], fill=C_DUST)

        stride = math.sin(phase)
        foot_lx = cx - 10*SCALE + stride * 22*SCALE
        foot_ly = ground_y - 4*SCALE - max(0, -stride * 16*SCALE)
        foot_rx = cx + 10*SCALE - stride * 22*SCALE
        foot_ry = ground_y - 4*SCALE - max(0, stride * 16*SCALE)

        draw_limb(draw, (cx - 14*SCALE, cy + 20*SCALE), ((cx - 14*SCALE + foot_lx)/2, cy + 38*SCALE), (foot_lx, foot_ly), 7*SCALE, 6*SCALE, 6*SCALE, C_ARMOR)
        draw_limb(draw, (cx + 14*SCALE, cy + 20*SCALE), ((cx + 14*SCALE + foot_rx)/2, cy + 38*SCALE), (foot_rx, foot_ry), 7*SCALE, 6*SCALE, 6*SCALE, C_ARMOR)

        # Torso
        draw.polygon([(cx - 24*SCALE + lean_x, cy - 16*SCALE), (cx + 24*SCALE + lean_x, cy - 16*SCALE), (cx + 18*SCALE, cy + 22*SCALE), (cx - 18*SCALE, cy + 22*SCALE)], fill=C_BODY)
        draw.polygon([(cx - 8*SCALE + lean_x, cy - 8*SCALE), (cx + 8*SCALE + lean_x, cy - 8*SCALE), (cx + lean_x, cy + 12*SCALE)], fill=C_MAGMA)

        # Greatsword marching
        draw.line([(cx + lean_x + 28*SCALE, cy + 8*SCALE), (cx + lean_x + 42*SCALE, ground_y - 14*SCALE)], fill=C_ARMOR, width=int(12*SCALE))
        draw.line([(cx + lean_x + 28*SCALE, cy + 8*SCALE), (cx + lean_x + 42*SCALE, ground_y - 14*SCALE)], fill=C_MAGMA_GLOW, width=int(4*SCALE))

        # Head
        head_y = cy - 32 * SCALE
        draw.ellipse([cx + lean_x - 18*SCALE, head_y - 18*SCALE, cx + lean_x + 18*SCALE, head_y + 18*SCALE], fill=C_BODY)
        draw.polygon([(cx + lean_x - 14*SCALE, head_y - 10*SCALE), (cx + lean_x - 32*SCALE, head_y - 36*SCALE), (cx + lean_x - 6*SCALE, head_y - 18*SCALE)], fill=C_MAGMA)
        draw.polygon([(cx + lean_x + 14*SCALE, head_y - 10*SCALE), (cx + lean_x + 32*SCALE, head_y - 36*SCALE), (cx + lean_x + 6*SCALE, head_y - 18*SCALE)], fill=C_MAGMA)
        draw.ellipse([cx + lean_x - 8*SCALE, head_y - 4*SCALE, cx + lean_x - 2*SCALE, head_y + 3*SCALE], fill=C_EYE)
        draw.ellipse([cx + lean_x + 4*SCALE, head_y - 4*SCALE, cx + lean_x + 10*SCALE, head_y + 3*SCALE], fill=C_EYE)

    else:
        # Colossal Smash Attack (4 frames)
        a_idx = idx - 6
        lunge_x = [-8, 10, 24, 8][a_idx] * SCALE
        cy = ground_y - 68 * SCALE

        draw.ellipse([cx + lunge_x - 48*SCALE, ground_y - 6*SCALE, cx + lunge_x + 48*SCALE, ground_y + 6*SCALE], fill=C_SHADOW)

        # Lunge Stance
        draw_limb(draw, (cx + lunge_x - 14*SCALE, cy + 20*SCALE), (cx + lunge_x - 26*SCALE, cy + 38*SCALE), (cx + lunge_x - 28*SCALE, ground_y - 4*SCALE), 7*SCALE, 6*SCALE, 6*SCALE, C_ARMOR)
        draw_limb(draw, (cx + lunge_x + 14*SCALE, cy + 20*SCALE), (cx + lunge_x + 26*SCALE, cy + 38*SCALE), (cx + lunge_x + 28*SCALE, ground_y - 4*SCALE), 7*SCALE, 6*SCALE, 6*SCALE, C_ARMOR)
        draw.polygon([(cx + lunge_x - 24*SCALE, cy - 16*SCALE), (cx + lunge_x + 24*SCALE, cy - 16*SCALE), (cx + lunge_x + 18*SCALE, cy + 22*SCALE), (cx + lunge_x - 18*SCALE, cy + 22*SCALE)], fill=C_BODY)

        # Head
        head_y = cy - 32 * SCALE
        draw.ellipse([cx + lunge_x - 18*SCALE, head_y - 18*SCALE, cx + lunge_x + 18*SCALE, head_y + 18*SCALE], fill=C_BODY)
        draw.polygon([(cx + lunge_x - 14*SCALE, head_y - 10*SCALE), (cx + lunge_x - 32*SCALE, head_y - 36*SCALE), (cx + lunge_x - 6*SCALE, head_y - 18*SCALE)], fill=C_MAGMA)
        draw.polygon([(cx + lunge_x + 14*SCALE, head_y - 10*SCALE), (cx + lunge_x + 32*SCALE, head_y - 36*SCALE), (cx + lunge_x + 6*SCALE, head_y - 18*SCALE)], fill=C_MAGMA)
        draw.ellipse([cx + lunge_x - 8*SCALE, head_y - 4*SCALE, cx + lunge_x - 2*SCALE, head_y + 3*SCALE], fill=C_EYE)
        draw.ellipse([cx + lunge_x + 4*SCALE, head_y - 4*SCALE, cx + lunge_x + 10*SCALE, head_y + 3*SCALE], fill=C_EYE)

        # Smash Greatsword Motion
        if a_idx == 0:
            # High Raise Windup
            draw.line([(cx + lunge_x - 10*SCALE, cy - 24*SCALE), (cx + lunge_x - 30*SCALE, cy - 80*SCALE)], fill=C_ARMOR, width=int(14*SCALE))
            draw.line([(cx + lunge_x - 10*SCALE, cy - 24*SCALE), (cx + lunge_x - 30*SCALE, cy - 80*SCALE)], fill=C_MAGMA_GLOW, width=int(5*SCALE))
        elif a_idx in (1, 2):
            # Ground Slam Impact
            draw.line([(cx + lunge_x + 20*SCALE, cy - 10*SCALE), (cx + lunge_x + 56*SCALE, ground_y - 4*SCALE)], fill=C_ARMOR, width=int(14*SCALE))
            draw.line([(cx + lunge_x + 20*SCALE, cy - 10*SCALE), (cx + lunge_x + 56*SCALE, ground_y - 4*SCALE)], fill=C_MAGMA_GLOW, width=int(5*SCALE))
            # Magma Shockwave Fissure
            draw.arc([cx + lunge_x + 30*SCALE, ground_y - 40*SCALE, cx + lunge_x + 80*SCALE, ground_y + 20*SCALE], -90, 40, fill=C_SMASH, width=int(12*SCALE))
            draw.ellipse([cx + lunge_x + 56*SCALE, ground_y - 10*SCALE, cx + lunge_x + 72*SCALE, ground_y + 2*SCALE], fill=(255, 255, 255, 255))
        else:
            # Recovery
            draw.line([(cx + lunge_x + 24*SCALE, cy + 4*SCALE), (cx + lunge_x + 38*SCALE, ground_y - 16*SCALE)], fill=C_ARMOR, width=int(12*SCALE))

    return im.resize((192, 192), Image.Resampling.LANCZOS)

def build_all_enemies():
    os.makedirs('assets', exist_ok=True)

    # 1. Goblin (10 frames x 128x128 = 1280x128)
    print("Building Goblin (10 frames: 2 Idle, 4 Run, 4 Attack)...")
    goblin_sheet = Image.new('RGBA', (128 * 10, 128))
    for i in range(10):
        frame = render_goblin_frame(i)
        goblin_sheet.paste(frame, (i * 128, 0))
    goblin_sheet.save('assets/goblin.png')

    # 2. Boar (10 frames x 128x128 = 1280x128)
    print("Building Boar (10 frames: 2 Idle, 4 Run, 4 Attack)...")
    boar_sheet = Image.new('RGBA', (128 * 10, 128))
    for i in range(10):
        frame = render_boar_frame(i)
        boar_sheet.paste(frame, (i * 128, 0))
    boar_sheet.save('assets/boar.png')

    # 3. Bat (10 frames x 128x128 = 1280x128)
    print("Building Bat (10 frames: 2 Idle, 4 Run, 4 Attack)...")
    bat_sheet = Image.new('RGBA', (128 * 10, 128))
    for i in range(10):
        frame = render_bat_frame(i)
        bat_sheet.paste(frame, (i * 128, 0))
    bat_sheet.save('assets/bat.png')

    # 4. Boss (10 frames x 192x192 = 1920x192)
    print("Building Boss (10 frames: 2 Idle, 4 Run, 4 Attack)...")
    boss_sheet = Image.new('RGBA', (192 * 10, 192))
    for i in range(10):
        frame = render_boss_frame(i)
        boss_sheet.paste(frame, (i * 192, 0))
    boss_sheet.save('assets/boss.png')

    print("All minimalist enemy assets created successfully!")

if __name__ == '__main__':
    build_all_enemies()
