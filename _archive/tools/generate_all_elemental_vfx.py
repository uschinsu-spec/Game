import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = r'assets/vfx'

ELEMENTS = {
    'fire': {
        'core': (255, 255, 200),
        'mid': (255, 120, 20),
        'edge': (220, 30, 0),
        'tint': 0xff5511
    },
    'lightning': {
        'core': (255, 255, 255),
        'mid': (180, 100, 255),
        'edge': (100, 20, 240),
        'tint': 0xbb44ff
    },
    'metal': {
        'core': (255, 255, 230),
        'mid': (255, 215, 0),
        'edge': (200, 140, 0),
        'tint': 0xffd700
    },
    'water': {
        'core': (230, 255, 255),
        'mid': (0, 200, 255),
        'edge': (0, 80, 220),
        'tint': 0x00ccff
    },
    'wind': {
        'core': (230, 255, 240),
        'mid': (80, 240, 160),
        'edge': (10, 160, 90),
        'tint': 0x33ee99
    },
    'wood': {
        'core': (240, 255, 200),
        'mid': (100, 220, 50),
        'edge': (30, 130, 20),
        'tint': 0x55dd33
    },
    'earth': {
        'core': (255, 240, 200),
        'mid': (210, 140, 60),
        'edge': (120, 70, 20),
        'tint': 0xdd9944
    },
    'physical': {
        'core': (255, 245, 230),
        'mid': (255, 130, 80),
        'edge': (180, 40, 30),
        'tint': 0xff6644
    }
}

def make_glow_ball(size, elem):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    max_r = size // 2 - 6
    cfg = ELEMENTS[elem]
    
    for r in range(max_r, 0, -2):
        t = r / max_r
        if t < 0.3:
            col = tuple(int(cfg['core'][c] * (1-t/0.3) + cfg['mid'][c] * (t/0.3)) for c in range(3))
            a = int(255 * (1 - t))
        else:
            t2 = (t - 0.3) / 0.7
            col = tuple(int(cfg['mid'][c] * (1-t2) + cfg['edge'][c] * t2) for c in range(3))
            a = int(230 * (1 - t2)**1.4)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (a,))
        
    # Add fiery/energy trailing streaks
    for i in range(12):
        ang = math.pi + (i - 6) * 0.22
        length = max_r * 0.85 + (i % 3) * 8
        ex = cx + math.cos(ang) * length
        ey = cy + math.sin(ang) * length * 0.75
        draw.line([cx, cy, ex, ey], fill=cfg['mid'] + (160,), width=3)
        draw.line([cx, cy, ex*0.75 + cx*0.25, ey*0.75 + cy*0.25], fill=cfg['core'] + (220,), width=2)
        
    img = img.filter(ImageFilter.GaussianBlur(1.4))
    core_draw = ImageDraw.Draw(img)
    core_draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=cfg['core'] + (250,))
    return img.filter(ImageFilter.GaussianBlur(0.8))

def make_strike_slash(size, elem):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    cfg = ELEMENTS[elem]
    
    # Draw double crescent / X-cross energy blades
    for stroke in [-1, 1]:
        points = []
        for a in range(-60, 61, 5):
            rad = math.radians(a)
            r = size * 0.42
            px = cx + math.cos(rad) * r * 0.55 * stroke
            py = cy + math.sin(rad) * r
            points.append((px, py))
            
        for w in [8, 5, 2]:
            col = cfg['edge'] if w == 8 else (cfg['mid'] if w == 5 else cfg['core'])
            alpha = 140 if w == 8 else (200 if w == 5 else 255)
            for i in range(len(points)-1):
                draw.line([points[i], points[i+1]], fill=col + (alpha,), width=w)
                
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    # Core energy starburst
    core_draw = ImageDraw.Draw(img)
    for l in [20, 14, 8]:
        core_draw.line([cx - l, cy, cx + l, cy], fill=cfg['core'] + (240,), width=2)
        core_draw.line([cx, cy - l, cx, cy + l], fill=cfg['core'] + (240,), width=2)
    return img.filter(ImageFilter.GaussianBlur(0.8))

def make_ground_array(size, elem):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    cfg = ELEMENTS[elem]
    
    # Outer runic formation ring
    for r, w, col, a in [
        (size * 0.44, 4, cfg['edge'], 180),
        (size * 0.40, 2, cfg['mid'], 220),
        (size * 0.32, 2, cfg['core'], 240),
        (size * 0.20, 3, cfg['mid'], 200),
        (size * 0.08, 2, cfg['core'], 250)
    ]:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col + (a,), width=w)
        
    # 8-direction trigram / runic spokes
    for i in range(8):
        ang = i * (math.pi / 4)
        x1 = cx + math.cos(ang) * (size * 0.08)
        y1 = cy + math.sin(ang) * (size * 0.08)
        x2 = cx + math.cos(ang) * (size * 0.44)
        y2 = cy + math.sin(ang) * (size * 0.44)
        draw.line([x1, y1, x2, y2], fill=cfg['mid'] + (180,), width=2)
        
        # Outer runic nodes
        nx = cx + math.cos(ang) * (size * 0.40)
        ny = cy + math.sin(ang) * (size * 0.40)
        draw.ellipse([nx-5, ny-5, nx+5, ny+5], fill=cfg['core'] + (240,))
        
    return img.filter(ImageFilter.GaussianBlur(1.2))

def make_celestial_missile(size, elem):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    cfg = ELEMENTS[elem]
    
    # Aerodynamic bird / spear shape pointing right
    tip_x = cx + size * 0.40
    tip_y = cy
    tail_top = (cx - size * 0.35, cy - size * 0.25)
    tail_bot = (cx - size * 0.35, cy + size * 0.25)
    tail_mid = (cx - size * 0.20, cy)
    
    poly = [(tip_x, tip_y), tail_top, tail_mid, tail_bot]
    draw.polygon(poly, fill=cfg['mid'] + (210,), outline=cfg['core'] + (240,))
    
    # Core energy spine
    draw.line([tail_mid[0], cy, tip_x, cy], fill=cfg['core'] + (255,), width=3)
    img = img.filter(ImageFilter.GaussianBlur(1.0))
    return img

def make_giant_colossus(size, elem):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    cx = size // 2
    cfg = ELEMENTS[elem]
    
    # Giant celestial pillar / lotus / thunder bolt pointing down (origin near bottom center)
    top_y = 20
    bot_y = size - 20
    
    # Central divine beam
    w_top = size * 0.18
    w_bot = size * 0.04
    poly = [
        (cx - w_top, top_y),
        (cx + w_top, top_y),
        (cx + w_bot, bot_y),
        (cx, bot_y + 12),
        (cx - w_bot, bot_y)
    ]
    draw.polygon(poly, fill=cfg['mid'] + (220,), outline=cfg['core'] + (255,))
    
    # Energy wings / aura rings along the shaft
    for y_pos, span in [(size*0.25, size*0.35), (size*0.48, size*0.28), (size*0.70, size*0.20)]:
        draw.line([cx - span, y_pos, cx + span, y_pos], fill=cfg['core'] + (210,), width=3)
        draw.ellipse([cx - span - 6, y_pos - 6, cx - span + 6, y_pos + 6], fill=cfg['mid'] + (230,))
        draw.ellipse([cx + span - 6, y_pos - 6, cx + span + 6, y_pos + 6], fill=cfg['mid'] + (230,))
        
    draw.line([cx, top_y, cx, bot_y + 10], fill=cfg['core'] + (255,), width=4)
    return img.filter(ImageFilter.GaussianBlur(1.4))

def make_shockwave(size, elem):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    cfg = ELEMENTS[elem]
    
    for r, w, a, col in [
        (size * 0.44, 8, 160, cfg['edge']),
        (size * 0.40, 5, 210, cfg['mid']),
        (size * 0.36, 2, 255, cfg['core'])
    ]:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col + (a,), width=w)
        
    return img.filter(ImageFilter.GaussianBlur(1.5))

def make_impact_slash(size, elem):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    cfg = ELEMENTS[elem]
    
    # 3 sharp diagonal slashes
    for off in [-16, 0, 16]:
        p1 = (cx - 40 + off, cy - 40)
        p2 = (cx + 40 + off, cy + 40)
        draw.line([p1, p2], fill=cfg['edge'] + (160,), width=7)
        draw.line([p1, p2], fill=cfg['mid'] + (220,), width=4)
        draw.line([p1, p2], fill=cfg['core'] + (255,), width=2)
        
    return img.filter(ImageFilter.GaussianBlur(1.2))

def generate_all():
    for elem_key in ELEMENTS.keys():
        elem_dir = os.path.join(BASE_DIR, elem_key)
        os.makedirs(elem_dir, exist_ok=True)
        
        # 1. Projectile (Luyện Khí)
        p1 = make_glow_ball(128, elem_key)
        p1.save(os.path.join(elem_dir, 'proj_1.png'))
        
        # 2. Strike / Burst (Trúc Cơ)
        p2 = make_strike_slash(160, elem_key)
        p2.save(os.path.join(elem_dir, 'proj_2.png'))
        
        # 3. Ground Formation Array (Kim Đan)
        p3 = make_ground_array(256, elem_key)
        p3.save(os.path.join(elem_dir, 'array_3.png'))
        
        # 4. Multi-missile swarm (Nguyên Anh)
        p4 = make_celestial_missile(128, elem_key)
        p4.save(os.path.join(elem_dir, 'swarm_4.png'))
        
        # 5. Colossal Celestial Drop (Hóa Thần)
        p5 = make_giant_colossus(256, elem_key)
        p5.save(os.path.join(elem_dir, 'colossus_5.png'))
        
        # 6. Shockwave Ring
        p6 = make_shockwave(256, elem_key)
        p6.save(os.path.join(elem_dir, 'shockwave.png'))
        
        # 7. Impact Slash
        p7 = make_impact_slash(128, elem_key)
        p7.save(os.path.join(elem_dir, 'impact.png'))
        
        print(f"Generated complete VFX set for: {elem_key}")

if __name__ == '__main__':
    generate_all()
