import math
import os
from PIL import Image, ImageDraw, ImageFilter

# Supersampling parameters
SCALE = 4
FRAME_SIZE = 128
RENDER_SIZE = FRAME_SIZE * SCALE  # 512x512
GROUND_Y = int(110 * SCALE)       # Exact ground baseline for feet
CENTER_X = int(64 * SCALE)

def hex_to_rgba(hex_str, alpha=255):
    hex_str = hex_str.lstrip('#')
    r, g, b = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    return (r, g, b, alpha)

# Enhanced Minimalist Palette (Chic, High-Readability Xianxia Swordsman)
C_HAIR_DARK   = hex_to_rgba('#0b0f19')
C_HAIR_MID    = hex_to_rgba('#1e293b')
C_HAIR_LIGHT  = hex_to_rgba('#38bdf8')
C_SKIN        = hex_to_rgba('#fed7aa')
C_SKIN_SHADOW = hex_to_rgba('#f97316', 180)
C_BLUSH       = hex_to_rgba('#fb7185', 140)
C_EYE         = hex_to_rgba('#090d16')
C_EYE_HIGHLIGHT = hex_to_rgba('#ffffff')
C_ROBE_DARK   = hex_to_rgba('#0f172a')
C_ROBE_MAIN   = hex_to_rgba('#0284c7')
C_ROBE_LIGHT  = hex_to_rgba('#38bdf8')
C_ROBE_WHITE  = hex_to_rgba('#f8fafc')
C_GOLD        = hex_to_rgba('#fbbf24')
C_GOLD_DARK   = hex_to_rgba('#b45309')
C_BOOTS       = hex_to_rgba('#0f172a')
C_BOOTS_TRIM  = hex_to_rgba('#e2e8f0')
C_RIBBON      = hex_to_rgba('#06b6d4')
C_RIBBON_LIGHT= hex_to_rgba('#67e8f9')
C_SWORD_BLADE = hex_to_rgba('#f1f5f9')
C_SWORD_GLOW  = hex_to_rgba('#38bdf8')
C_SWORD_AURA  = hex_to_rgba('#7dd3fc', 160)
C_SLASH_FX    = hex_to_rgba('#38bdf8', 210)
C_SLASH_CORE  = hex_to_rgba('#ffffff')
C_DUST        = hex_to_rgba('#cbd5e1', 140)
C_SHADOW_BASE = hex_to_rgba('#0b1510', 90)

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

def draw_head(draw, hx, hy, angle=0, eye_dir=1, expression='normal'):
    head_r = 13 * SCALE

    # 1. Face Base
    draw.ellipse([hx - head_r, hy - head_r + 2 * SCALE, hx + head_r, hy + head_r], fill=C_SKIN)
    # 2. Subtle Blush
    draw.ellipse([hx - 9 * SCALE, hy + 3 * SCALE, hx - 4 * SCALE, hy + 6 * SCALE], fill=C_BLUSH)
    draw.ellipse([hx + 4 * SCALE, hy + 3 * SCALE, hx + 9 * SCALE, hy + 6 * SCALE], fill=C_BLUSH)

    # 3. Eyes
    look_off = eye_dir * 1.5 * SCALE
    # Left eye
    draw.ellipse([hx - 8 * SCALE + look_off, hy - 1 * SCALE, hx - 4 * SCALE + look_off, hy + 4 * SCALE], fill=C_EYE)
    draw.ellipse([hx - 7 * SCALE + look_off, hy - 0.5 * SCALE, hx - 5 * SCALE + look_off, hy + 1.5 * SCALE], fill=C_EYE_HIGHLIGHT)
    # Right eye
    draw.ellipse([hx + 4 * SCALE + look_off, hy - 1 * SCALE, hx + 8 * SCALE + look_off, hy + 4 * SCALE], fill=C_EYE)
    draw.ellipse([hx + 5 * SCALE + look_off, hy - 0.5 * SCALE, hx + 7 * SCALE + look_off, hy + 1.5 * SCALE], fill=C_EYE_HIGHLIGHT)

    # Eyebrows (Dynamic martial expression)
    if expression == 'intense':
        draw.line([(hx - 9 * SCALE, hy - 2 * SCALE), (hx - 3 * SCALE, hy - 4.5 * SCALE)], fill=C_HAIR_DARK, width=int(2 * SCALE))
        draw.line([(hx + 3 * SCALE, hy - 4.5 * SCALE), (hx + 9 * SCALE, hy - 2 * SCALE)], fill=C_HAIR_DARK, width=int(2 * SCALE))
    else:
        draw.line([(hx - 9 * SCALE, hy - 3 * SCALE), (hx - 4 * SCALE, hy - 4 * SCALE)], fill=C_HAIR_DARK, width=int(1.5 * SCALE))
        draw.line([(hx + 4 * SCALE, hy - 4 * SCALE), (hx + 9 * SCALE, hy - 3 * SCALE)], fill=C_HAIR_DARK, width=int(1.5 * SCALE))

    # 4. Hair
    hair_poly = [
        (hx - 14 * SCALE, hy - 2 * SCALE),
        (hx - 14 * SCALE, hy - 12 * SCALE),
        (hx - 8 * SCALE, hy - 16 * SCALE),
        (hx, hy - 17 * SCALE),
        (hx + 8 * SCALE, hy - 16 * SCALE),
        (hx + 14 * SCALE, hy - 12 * SCALE),
        (hx + 14 * SCALE, hy - 2 * SCALE),
        (hx + 10 * SCALE, hy - 4 * SCALE),
        (hx + 6 * SCALE, hy - 0 * SCALE),
        (hx + 3 * SCALE, hy - 5 * SCALE),
        (hx - 1 * SCALE, hy - 1 * SCALE),
        (hx - 5 * SCALE, hy - 6 * SCALE),
        (hx - 10 * SCALE, hy - 3 * SCALE),
    ]
    draw.polygon(hair_poly, fill=C_HAIR_MID)
    draw.ellipse([hx - 12 * SCALE, hy - 18 * SCALE, hx + 12 * SCALE, hy - 6 * SCALE], fill=C_HAIR_DARK)
    draw.arc([hx - 10 * SCALE, hy - 15 * SCALE, hx + 10 * SCALE, hy - 7 * SCALE], 200, 340, fill=C_HAIR_LIGHT, width=int(2 * SCALE))

    # Headband
    draw.rectangle([hx - 13 * SCALE, hy - 10 * SCALE, hx + 13 * SCALE, hy - 7 * SCALE], fill=C_RIBBON)
    draw.ellipse([hx - 3 * SCALE, hy - 11 * SCALE, hx + 3 * SCALE, hy - 6 * SCALE], fill=C_GOLD)
    # Topknot bun
    draw.ellipse([hx - 5 * SCALE, hy - 23 * SCALE, hx + 5 * SCALE, hy - 15 * SCALE], fill=C_HAIR_DARK)
    draw.ellipse([hx - 2 * SCALE, hy - 20 * SCALE, hx + 2 * SCALE, hy - 16 * SCALE], fill=C_GOLD)

def draw_sword(draw, origin, angle_deg, length_scale=1.0, glow=True):
    rad = math.radians(angle_deg)
    dx = math.cos(rad)
    dy = math.sin(rad)
    nx = -dy
    ny = dx

    x0, y0 = origin
    length = 42 * SCALE * length_scale
    x1 = x0 + dx * length
    y1 = y0 + dy * length

    # Guard
    gx0 = x0 - nx * 8 * SCALE
    gy0 = y0 - ny * 8 * SCALE
    gx1 = x0 + nx * 8 * SCALE
    gy1 = y0 + ny * 8 * SCALE
    draw.line([(gx0, gy0), (gx1, gy1)], fill=C_GOLD, width=int(4 * SCALE))

    # Hilt & Pommel
    hx = x0 - dx * 10 * SCALE
    hy = y0 - dy * 10 * SCALE
    draw.line([(x0, y0), (hx, hy)], fill=C_ROBE_DARK, width=int(3 * SCALE))
    draw.ellipse([hx - 2.5 * SCALE, hy - 2.5 * SCALE, hx + 2.5 * SCALE, hy + 2.5 * SCALE], fill=C_GOLD)

    # Blade Core & Edge
    blade_poly = [
        (x0 + nx * 2.5 * SCALE, y0 + ny * 2.5 * SCALE),
        (x1 - dx * 6 * SCALE + nx * 2 * SCALE, y1 - dy * 6 * SCALE + ny * 2 * SCALE),
        (x1, y1),
        (x1 - dx * 6 * SCALE - nx * 2 * SCALE, y1 - dy * 6 * SCALE - ny * 2 * SCALE),
        (x0 - nx * 2.5 * SCALE, y0 - ny * 2.5 * SCALE),
    ]
    draw.polygon(blade_poly, fill=C_SWORD_BLADE)
    draw.line([(x0, y0), (x1 - dx * 4 * SCALE, y1 - dy * 4 * SCALE)], fill=C_SWORD_GLOW, width=int(1.5 * SCALE))

    # Glow Aura
    if glow:
        draw.line([(x0, y0), (x1, y1)], fill=C_SWORD_AURA, width=int(8 * SCALE))

# -------------------------------------------------------------
# 1. IDLE ANIMATION GENERATION (8 Frames)
# -------------------------------------------------------------
def render_idle_frame(idx, total=8):
    im = Image.new('RGBA', (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    phase = idx / total * 2 * math.pi
    bob_y = math.sin(phase) * 3 * SCALE
    breathe = math.cos(phase) * 1.5 * SCALE
    ribbon_sway = math.sin(phase - 0.4) * 7 * SCALE

    cx = CENTER_X
    cy = GROUND_Y - int(48 * SCALE) + int(bob_y)

    # 1. Ground Contact Shadow
    shadow_w = (26 + breathe * 0.5) * SCALE
    draw.ellipse([cx - shadow_w, GROUND_Y - 4 * SCALE, cx + shadow_w, GROUND_Y + 4 * SCALE], fill=C_SHADOW_BASE)

    # 2. Back Flowing Ribbon
    ribbon_pts = [
        (cx - 2 * SCALE, cy - 18 * SCALE),
        (cx - 16 * SCALE + ribbon_sway * 0.5, cy - 8 * SCALE),
        (cx - 28 * SCALE + ribbon_sway, cy + 4 * SCALE),
        (cx - 38 * SCALE + ribbon_sway * 1.2, cy + 18 * SCALE)
    ]
    draw.line(ribbon_pts, fill=C_RIBBON, width=int(5 * SCALE))
    draw.line([(p[0], p[1]-SCALE) for p in ribbon_pts], fill=C_RIBBON_LIGHT, width=int(2 * SCALE))

    # 3. Sheathed Sword on Back
    draw_sword(draw, (cx - 4 * SCALE, cy - 16 * SCALE), -135, 0.85, glow=False)

    # 4. Legs (Grounded firmly)
    hip_l = (cx - 7 * SCALE, cy + 12 * SCALE)
    hip_r = (cx + 7 * SCALE, cy + 12 * SCALE)
    foot_l = (cx - 9 * SCALE, GROUND_Y - 3 * SCALE)
    foot_r = (cx + 9 * SCALE, GROUND_Y - 3 * SCALE)
    knee_l = (cx - 10 * SCALE, cy + 26 * SCALE)
    knee_r = (cx + 10 * SCALE, cy + 26 * SCALE)
    draw_limb(draw, hip_l, knee_l, foot_l, 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)
    draw_limb(draw, hip_r, knee_r, foot_r, 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)

    # 5. Robe Skirt
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
    # Inner silk split
    draw.polygon([
        (cx - 4 * SCALE, cy + 10 * SCALE),
        (cx + 4 * SCALE, cy + 10 * SCALE),
        (cx + 5 * SCALE, cy + 27 * SCALE),
        (cx - 5 * SCALE, cy + 27 * SCALE),
    ], fill=C_ROBE_WHITE)

    # 6. Torso
    draw.polygon([
        (cx - 11 * SCALE - int(breathe * 0.5), cy - 10 * SCALE),
        (cx + 11 * SCALE + int(breathe * 0.5), cy - 10 * SCALE),
        (cx + 10 * SCALE, cy + 10 * SCALE),
        (cx - 10 * SCALE, cy + 10 * SCALE),
    ], fill=C_ROBE_DARK)
    # Collar / Lapel
    draw.polygon([
        (cx - 8 * SCALE, cy - 10 * SCALE),
        (cx, cy + 2 * SCALE),
        (cx + 8 * SCALE, cy - 10 * SCALE),
        (cx + 4 * SCALE, cy - 10 * SCALE),
        (cx, cy - 4 * SCALE),
        (cx - 4 * SCALE, cy - 10 * SCALE),
    ], fill=C_ROBE_WHITE)
    # Sash & Jade Belt
    draw.rectangle([cx - 10 * SCALE, cy + 6 * SCALE, cx + 10 * SCALE, cy + 10 * SCALE], fill=C_GOLD)
    draw.ellipse([cx - 3 * SCALE, cy + 5 * SCALE, cx + 3 * SCALE, cy + 11 * SCALE], fill=C_GOLD_DARK)

    # 7. Arms
    shoulder_l = (cx - 10 * SCALE, cy - 7 * SCALE)
    shoulder_r = (cx + 10 * SCALE, cy - 7 * SCALE)
    elbow_l = (cx - 13 * SCALE, cy + 2 * SCALE)
    elbow_r = (cx + 13 * SCALE, cy + 2 * SCALE)
    hand_l = (cx - 7 * SCALE, cy + 7 * SCALE)
    hand_r = (cx + 7 * SCALE, cy + 7 * SCALE)
    draw_limb(draw, shoulder_l, elbow_l, hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
    draw_limb(draw, shoulder_r, elbow_r, hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

    # 8. Head
    draw_head(draw, cx, cy - 20 * SCALE, eye_dir=1)

    return im.resize((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS)

# -------------------------------------------------------------
# 2. RUN ANIMATION GENERATION (8 Frames - Ground Runner Cycle)
# -------------------------------------------------------------
def render_run_frame(idx, total=8):
    im = Image.new('RGBA', (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    phase = idx / total * 2 * math.pi
    # Vertical bounce for running
    bounce = abs(math.sin(phase)) * 6 * SCALE
    lean_x = 6 * SCALE  # Forward sprint lean

    cx = CENTER_X + lean_x
    cy = GROUND_Y - int(50 * SCALE) - int(bounce)

    # Shadow under player
    shadow_cx = CENTER_X + int(math.sin(phase) * 4 * SCALE)
    shadow_w = (22 - bounce * 0.4) * SCALE
    draw.ellipse([shadow_cx - shadow_w, GROUND_Y - 4 * SCALE, shadow_cx + shadow_w, GROUND_Y + 4 * SCALE], fill=C_SHADOW_BASE)

    # Trailing Wind / Dust at push-off
    if idx in (0, 1, 4, 5):
        dust_x = cx - 22 * SCALE
        dust_y = GROUND_Y - 4 * SCALE
        draw.ellipse([dust_x - 6 * SCALE, dust_y - 4 * SCALE, dust_x + 6 * SCALE, dust_y + 2 * SCALE], fill=C_DUST)
        draw.ellipse([dust_x - 12 * SCALE, dust_y - 3 * SCALE, dust_x - 4 * SCALE, dust_y + 1 * SCALE], fill=C_DUST)

    # Back Flowing Ribbon (Trails far behind in sprint)
    ribbon_sway = math.sin(phase * 2) * 5 * SCALE
    ribbon_pts = [
        (cx - 6 * SCALE, cy - 18 * SCALE),
        (cx - 24 * SCALE, cy - 14 * SCALE + ribbon_sway * 0.6),
        (cx - 42 * SCALE, cy - 6 * SCALE + ribbon_sway),
        (cx - 58 * SCALE, cy + 2 * SCALE + ribbon_sway * 1.3)
    ]
    draw.line(ribbon_pts, fill=C_RIBBON, width=int(5 * SCALE))
    draw.line([(p[0], p[1]-SCALE) for p in ribbon_pts], fill=C_RIBBON_LIGHT, width=int(2 * SCALE))

    # Sword angled back dynamically during run
    draw_sword(draw, (cx - 10 * SCALE, cy - 12 * SCALE), -155, 0.85, glow=True)

    # Leg Kinematics (Left & Right strides 180 degrees apart)
    stride_l = math.sin(phase)
    stride_r = math.sin(phase + math.pi)

    hip_l = (cx - 5 * SCALE, cy + 12 * SCALE)
    hip_r = (cx + 5 * SCALE, cy + 12 * SCALE)

    # Foot positions (Contacting ground baseline)
    foot_lx = hip_l[0] + stride_l * 18 * SCALE
    foot_ly = GROUND_Y - 3 * SCALE - max(0, -stride_l * 14 * SCALE)
    knee_lx = (hip_l[0] + foot_lx) / 2 + (5 * SCALE if stride_l < 0 else -3 * SCALE)
    knee_ly = cy + 24 * SCALE - max(0, -stride_l * 8 * SCALE)

    foot_rx = hip_r[0] + stride_r * 18 * SCALE
    foot_ry = GROUND_Y - 3 * SCALE - max(0, -stride_r * 14 * SCALE)
    knee_rx = (hip_r[0] + foot_rx) / 2 + (5 * SCALE if stride_r < 0 else -3 * SCALE)
    knee_ry = cy + 24 * SCALE - max(0, -stride_r * 8 * SCALE)

    # Draw Back Leg first
    if stride_l < stride_r:
        draw_limb(draw, hip_l, (knee_lx, knee_ly), (foot_lx, foot_ly), 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)
    else:
        draw_limb(draw, hip_r, (knee_rx, knee_ry), (foot_rx, foot_ry), 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)

    # Robe Skirt (Wind-blown backwards)
    skirt_poly = [
        (cx - 10 * SCALE, cy + 8 * SCALE),
        (cx + 12 * SCALE, cy + 8 * SCALE),
        (cx + 16 * SCALE, cy + 24 * SCALE),
        (cx + 4 * SCALE, cy + 28 * SCALE),
        (cx - 14 * SCALE, cy + 27 * SCALE),
        (cx - 24 * SCALE, cy + 20 * SCALE),
    ]
    draw.polygon(skirt_poly, fill=C_ROBE_MAIN)
    draw.polygon([
        (cx - 2 * SCALE, cy + 9 * SCALE),
        (cx + 6 * SCALE, cy + 9 * SCALE),
        (cx + 8 * SCALE, cy + 25 * SCALE),
        (cx - 4 * SCALE, cy + 26 * SCALE),
    ], fill=C_ROBE_WHITE)

    # Draw Front Leg
    if stride_l >= stride_r:
        draw_limb(draw, hip_l, (knee_lx, knee_ly), (foot_lx, foot_ly), 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)
    else:
        draw_limb(draw, hip_r, (knee_rx, knee_ry), (foot_rx, foot_ry), 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)

    # Torso (Angled forward)
    draw.polygon([
        (cx - 10 * SCALE, cy - 10 * SCALE),
        (cx + 12 * SCALE, cy - 10 * SCALE),
        (cx + 10 * SCALE, cy + 10 * SCALE),
        (cx - 10 * SCALE, cy + 10 * SCALE),
    ], fill=C_ROBE_DARK)
    # Lapel & Belt
    draw.polygon([
        (cx - 6 * SCALE, cy - 10 * SCALE),
        (cx + 3 * SCALE, cy + 2 * SCALE),
        (cx + 10 * SCALE, cy - 10 * SCALE),
        (cx + 6 * SCALE, cy - 10 * SCALE),
        (cx + 2 * SCALE, cy - 4 * SCALE),
        (cx - 2 * SCALE, cy - 10 * SCALE),
    ], fill=C_ROBE_WHITE)
    draw.rectangle([cx - 10 * SCALE, cy + 6 * SCALE, cx + 10 * SCALE, cy + 10 * SCALE], fill=C_GOLD)
    draw.ellipse([cx - 3 * SCALE, cy + 5 * SCALE, cx + 3 * SCALE, cy + 11 * SCALE], fill=C_GOLD_DARK)

    # Running Arms (Opposite arm swing)
    arm_l_swing = -stride_l
    arm_r_swing = -stride_r

    shoulder_l = (cx - 8 * SCALE, cy - 7 * SCALE)
    shoulder_r = (cx + 10 * SCALE, cy - 7 * SCALE)

    hand_lx = shoulder_l[0] + arm_l_swing * 14 * SCALE
    hand_ly = cy + 4 * SCALE + max(0, -arm_l_swing * 6 * SCALE)
    elbow_lx = (shoulder_l[0] + hand_lx) / 2 - 4 * SCALE
    elbow_ly = (shoulder_l[1] + hand_ly) / 2 + 3 * SCALE

    hand_rx = shoulder_r[0] + arm_r_swing * 14 * SCALE
    hand_ry = cy + 4 * SCALE + max(0, -arm_r_swing * 6 * SCALE)
    elbow_rx = (shoulder_r[0] + hand_rx) / 2 + 4 * SCALE
    elbow_ly = (shoulder_r[1] + hand_ry) / 2 + 3 * SCALE

    draw_limb(draw, shoulder_l, (elbow_lx, elbow_ly), (hand_lx, hand_ly), 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
    draw_limb(draw, shoulder_r, (elbow_rx, elbow_ly), (hand_rx, hand_ry), 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

    # Head (Focused forward)
    draw_head(draw, cx + 3 * SCALE, cy - 20 * SCALE, eye_dir=1, expression='intense')

    return im.resize((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS)

# -------------------------------------------------------------
# 3. ATTACK / SKILL ANIMATION GENERATION (8 Frames - Slash & Chi Wave)
# -------------------------------------------------------------
def render_skill_frame(idx, total=8):
    im = Image.new('RGBA', (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Action Sequence:
    # 0: Windup / step back, sword charged
    # 1: Lunge forward, swing begins
    # 2: Full speed slash arc + energy burst
    # 3: Crescent sword wave blast forward!
    # 4: Follow-through extension
    # 5: Flourish spin
    # 6: Recovery step
    # 7: Settle back to guard

    lunge_offsets = [-4, 4, 14, 18, 12, 6, 2, 0]
    lean_x = lunge_offsets[idx] * SCALE

    cx = CENTER_X + lean_x
    cy = GROUND_Y - int(48 * SCALE) + (2 * SCALE if idx in (2, 3) else 0)

    # Ground Shadow
    shadow_w = (28 + abs(lunge_offsets[idx]) * 0.5) * SCALE
    draw.ellipse([cx - shadow_w, GROUND_Y - 4 * SCALE, cx + shadow_w, GROUND_Y + 4 * SCALE], fill=C_SHADOW_BASE)

    # Ground Dust on lunge
    if idx in (1, 2, 3):
        dust_x = cx - 24 * SCALE
        dust_y = GROUND_Y - 4 * SCALE
        draw.ellipse([dust_x - 8 * SCALE, dust_y - 5 * SCALE, dust_x + 8 * SCALE, dust_y + 2 * SCALE], fill=C_DUST)

    # Trailing Ribbon
    ribbon_pts = [
        (cx - 2 * SCALE, cy - 18 * SCALE),
        (cx - 20 * SCALE, cy - 12 * SCALE),
        (cx - 36 * SCALE, cy - 2 * SCALE),
        (cx - 48 * SCALE, cy + 12 * SCALE)
    ]
    draw.line(ribbon_pts, fill=C_RIBBON, width=int(5 * SCALE))

    # Legs Stance (Dynamic martial lunge)
    hip_l = (cx - 7 * SCALE, cy + 12 * SCALE)
    hip_r = (cx + 7 * SCALE, cy + 12 * SCALE)

    if idx in (2, 3, 4):
        # Deep lunge: right foot forward, left foot planted back
        foot_l = (cx - 24 * SCALE, GROUND_Y - 3 * SCALE)
        foot_r = (cx + 18 * SCALE, GROUND_Y - 3 * SCALE)
        knee_l = (cx - 10 * SCALE, cy + 24 * SCALE)
        knee_r = (cx + 16 * SCALE, cy + 24 * SCALE)
    else:
        foot_l = (cx - 10 * SCALE, GROUND_Y - 3 * SCALE)
        foot_r = (cx + 10 * SCALE, GROUND_Y - 3 * SCALE)
        knee_l = (cx - 10 * SCALE, cy + 26 * SCALE)
        knee_r = (cx + 10 * SCALE, cy + 26 * SCALE)

    draw_limb(draw, hip_l, knee_l, foot_l, 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)
    draw_limb(draw, hip_r, knee_r, foot_r, 4.5 * SCALE, 3.8 * SCALE, 4 * SCALE, C_BOOTS, C_BOOTS_TRIM)

    # Robe Skirt
    skirt_poly = [
        (cx - 11 * SCALE, cy + 8 * SCALE),
        (cx + 11 * SCALE, cy + 8 * SCALE),
        (cx + 18 * SCALE, cy + 26 * SCALE),
        (cx + 6 * SCALE, cy + 29 * SCALE),
        (cx - 6 * SCALE, cy + 29 * SCALE),
        (cx - 18 * SCALE, cy + 26 * SCALE),
    ]
    draw.polygon(skirt_poly, fill=C_ROBE_MAIN)
    draw.polygon([
        (cx - 4 * SCALE, cy + 10 * SCALE),
        (cx + 4 * SCALE, cy + 10 * SCALE),
        (cx + 6 * SCALE, cy + 27 * SCALE),
        (cx - 6 * SCALE, cy + 27 * SCALE),
    ], fill=C_ROBE_WHITE)

    # Torso
    draw.polygon([
        (cx - 11 * SCALE, cy - 10 * SCALE),
        (cx + 11 * SCALE, cy - 10 * SCALE),
        (cx + 10 * SCALE, cy + 10 * SCALE),
        (cx - 10 * SCALE, cy + 10 * SCALE),
    ], fill=C_ROBE_DARK)
    draw.polygon([
        (cx - 8 * SCALE, cy - 10 * SCALE),
        (cx, cy + 2 * SCALE),
        (cx + 8 * SCALE, cy - 10 * SCALE),
        (cx + 4 * SCALE, cy - 10 * SCALE),
        (cx, cy - 4 * SCALE),
        (cx - 4 * SCALE, cy - 10 * SCALE),
    ], fill=C_ROBE_WHITE)
    draw.rectangle([cx - 10 * SCALE, cy + 6 * SCALE, cx + 10 * SCALE, cy + 10 * SCALE], fill=C_GOLD)

    # Sword & Arms by Frame:
    shoulder_l = (cx - 9 * SCALE, cy - 7 * SCALE)
    shoulder_r = (cx + 9 * SCALE, cy - 7 * SCALE)

    if idx == 0:
        # Windup: Sword held back & high
        sword_orig = (cx - 14 * SCALE, cy - 16 * SCALE)
        draw_sword(draw, sword_orig, -110, 1.0, glow=True)
        hand_r = (cx - 10 * SCALE, cy - 12 * SCALE)
        hand_l = (cx + 8 * SCALE, cy + 4 * SCALE)
        draw_limb(draw, shoulder_r, (cx - 6 * SCALE, cy - 8 * SCALE), hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
        draw_limb(draw, shoulder_l, (cx + 4 * SCALE, cy - 2 * SCALE), hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

    elif idx == 1:
        # Forward thrust windup
        sword_orig = (cx - 6 * SCALE, cy - 10 * SCALE)
        draw_sword(draw, sword_orig, -45, 1.05, glow=True)
        hand_r = (cx + 2 * SCALE, cy - 4 * SCALE)
        hand_l = (cx - 8 * SCALE, cy + 6 * SCALE)
        draw_limb(draw, shoulder_r, (cx + 8 * SCALE, cy - 6 * SCALE), hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
        draw_limb(draw, shoulder_l, (cx - 10 * SCALE, cy), hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

    elif idx == 2:
        # Maximum speed slash arc
        sword_orig = (cx + 10 * SCALE, cy - 4 * SCALE)
        draw_sword(draw, sword_orig, 20, 1.25, glow=True)
        hand_r = (cx + 14 * SCALE, cy - 2 * SCALE)
        hand_l = (cx - 12 * SCALE, cy + 4 * SCALE)
        draw_limb(draw, shoulder_r, (cx + 12 * SCALE, cy - 6 * SCALE), hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
        draw_limb(draw, shoulder_l, (cx - 10 * SCALE, cy), hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

        # Huge Radiant Slash Trail
        arc_cx = cx + 24 * SCALE
        arc_cy = cy - 4 * SCALE
        draw.arc([arc_cx - 42 * SCALE, arc_cy - 38 * SCALE, arc_cx + 42 * SCALE, arc_cy + 38 * SCALE], -75, 45, fill=C_SLASH_FX, width=int(14 * SCALE))
        draw.arc([arc_cx - 40 * SCALE, arc_cy - 36 * SCALE, arc_cx + 40 * SCALE, arc_cy + 36 * SCALE], -70, 40, fill=C_SLASH_CORE, width=int(5 * SCALE))

    elif idx == 3:
        # Full Extension & Crescent Wave Release
        sword_orig = (cx + 14 * SCALE, cy - 2 * SCALE)
        draw_sword(draw, sword_orig, 10, 1.2, glow=True)
        hand_r = (cx + 16 * SCALE, cy - 1 * SCALE)
        hand_l = (cx - 14 * SCALE, cy + 6 * SCALE)
        draw_limb(draw, shoulder_r, (cx + 14 * SCALE, cy - 5 * SCALE), hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
        draw_limb(draw, shoulder_l, (cx - 12 * SCALE, cy), hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

        # Crescent Wave Projectile Burst
        cres_x = cx + 46 * SCALE
        cres_y = cy - 2 * SCALE
        draw.arc([cres_x - 18 * SCALE, cres_y - 32 * SCALE, cres_x + 18 * SCALE, cres_y + 32 * SCALE], -80, 80, fill=C_SLASH_FX, width=int(12 * SCALE))
        draw.arc([cres_x - 16 * SCALE, cres_y - 30 * SCALE, cres_x + 16 * SCALE, cres_y + 30 * SCALE], -75, 75, fill=C_SLASH_CORE, width=int(4 * SCALE))

    elif idx == 4:
        # Follow through pose
        sword_orig = (cx + 12 * SCALE, cy + 4 * SCALE)
        draw_sword(draw, sword_orig, 40, 1.1, glow=True)
        hand_r = (cx + 14 * SCALE, cy + 4 * SCALE)
        hand_l = (cx - 10 * SCALE, cy + 8 * SCALE)
        draw_limb(draw, shoulder_r, (cx + 12 * SCALE, cy - 2 * SCALE), hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
        draw_limb(draw, shoulder_l, (cx - 8 * SCALE, cy + 2 * SCALE), hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

    elif idx == 5:
        # Sword Flourish Spin
        sword_orig = (cx + 6 * SCALE, cy - 10 * SCALE)
        draw_sword(draw, sword_orig, -60, 0.95, glow=False)
        hand_r = (cx + 8 * SCALE, cy - 6 * SCALE)
        hand_l = (cx - 6 * SCALE, cy + 6 * SCALE)
        draw_limb(draw, shoulder_r, (cx + 10 * SCALE, cy - 8 * SCALE), hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
        draw_limb(draw, shoulder_l, (cx - 6 * SCALE, cy), hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

    else:
        # Settle back to ready guard
        sword_orig = (cx - 6 * SCALE, cy - 16 * SCALE)
        draw_sword(draw, sword_orig, -125, 0.9, glow=False)
        hand_r = (cx - 2 * SCALE, cy + 4 * SCALE)
        hand_l = (cx + 6 * SCALE, cy + 6 * SCALE)
        draw_limb(draw, shoulder_r, (cx + 4 * SCALE, cy), hand_r, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)
        draw_limb(draw, shoulder_l, (cx - 4 * SCALE, cy), hand_l, 4 * SCALE, 3.5 * SCALE, 3 * SCALE, C_ROBE_MAIN, C_SKIN)

    # Head
    draw_head(draw, cx + (4 * SCALE if idx in (1, 2, 3) else 0), cy - 20 * SCALE, eye_dir=1, expression='intense' if idx in (1, 2, 3, 4) else 'normal')

    return im.resize((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS)

def build_all_player_sheets():
    os.makedirs('assets', exist_ok=True)

    # 1. Idle Sheet (assets/player.png)
    print("Generating Idle Sheet (player.png)...")
    idle_sheet = Image.new('RGBA', (FRAME_SIZE * 8, FRAME_SIZE))
    for i in range(8):
        frame = render_idle_frame(i, 8)
        idle_sheet.paste(frame, (i * FRAME_SIZE, 0))
    idle_sheet.save('assets/player.png')

    # 2. Run Sheet (assets/player_run.png)
    print("Generating Run Sheet (player_run.png)...")
    run_sheet = Image.new('RGBA', (FRAME_SIZE * 8, FRAME_SIZE))
    for i in range(8):
        frame = render_run_frame(i, 8)
        run_sheet.paste(frame, (i * FRAME_SIZE, 0))
    run_sheet.save('assets/player_run.png')

    # 3. Skill / Attack Sheet (assets/player_skill.png)
    print("Generating Skill Sheet (player_skill.png)...")
    skill_sheet = Image.new('RGBA', (FRAME_SIZE * 8, FRAME_SIZE))
    for i in range(8):
        frame = render_skill_frame(i, 8)
        skill_sheet.paste(frame, (i * FRAME_SIZE, 0))
    skill_sheet.save('assets/player_skill.png')

    print("All player sheets generated successfully!")

if __name__ == '__main__':
    build_all_player_sheets()
