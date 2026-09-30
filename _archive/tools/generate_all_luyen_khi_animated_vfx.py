import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ASSETS_DIR = r'assets/vfx'

ELEMENTS_CONFIG = {
    'fire': {
        'folder': 'fire',
        'key': 'hoa',
        'core_color': (255, 255, 230, 255),
        'mid_color': (255, 170, 40, 240),
        'glow_color': (255, 60, 10, 180),
        'outer_glow': (200, 20, 0, 70),
        'style': 'flame_lance'
    },
    'lightning': {
        'folder': 'lightning',
        'key': 'loi',
        'core_color': (255, 255, 255, 255),
        'mid_color': (140, 220, 255, 240),
        'glow_color': (170, 70, 255, 200),
        'outer_glow': (90, 20, 230, 80),
        'style': 'lightning_spear'
    },
    'metal': {
        'folder': 'metal',
        'key': 'kim',
        'core_color': (255, 255, 240, 255),
        'mid_color': (255, 230, 110, 240),
        'glow_color': (230, 170, 30, 200),
        'outer_glow': (180, 120, 10, 70),
        'style': 'golden_dart'
    },
    'water': {
        'folder': 'water',
        'key': 'thuy',
        'core_color': (240, 255, 255, 255),
        'mid_color': (80, 220, 255, 240),
        'glow_color': (0, 140, 255, 190),
        'outer_glow': (0, 70, 200, 75),
        'style': 'ice_javelin'
    },
    'wind': {
        'folder': 'wind',
        'key': 'phong',
        'core_color': (240, 255, 250, 255),
        'mid_color': (90, 255, 190, 240),
        'glow_color': (0, 210, 140, 190),
        'outer_glow': (0, 140, 90, 70),
        'style': 'wind_scythe'
    },
    'wood': {
        'folder': 'wood',
        'key': 'moc',
        'core_color': (245, 255, 230, 255),
        'mid_color': (120, 255, 90, 240),
        'glow_color': (40, 200, 60, 190),
        'outer_glow': (20, 130, 30, 70),
        'style': 'vine_lance'
    },
    'earth': {
        'folder': 'earth',
        'key': 'tho',
        'core_color': (255, 250, 220, 255),
        'mid_color': (255, 195, 80, 240),
        'glow_color': (200, 120, 30, 190),
        'outer_glow': (140, 70, 10, 70),
        'style': 'rock_spear'
    },
    'physical': {
        'folder': 'physical',
        'key': 'ly',
        'core_color': (255, 255, 255, 255),
        'mid_color': (255, 235, 215, 240),
        'glow_color': (210, 190, 170, 190),
        'outer_glow': (140, 120, 100, 70),
        'style': 'astral_javelin'
    }
}

W, H = 128, 64
RENDER_SCALE = 4
RW, RH = W * RENDER_SCALE, H * RENDER_SCALE # 512 x 256 for supersampling antialiasing

def create_element_frame(elem_cfg, frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    img = Image.new('RGBA', (RW, RH), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Projectile body geometry
    # Left tail at x = 70, Right tip at x = 445
    tip_x = RW - 68
    tip_y = RH / 2.0
    tail_x = 72
    tail_y = RH / 2.0
    mid_x = (tail_x + tip_x) / 2.0
    
    core_c = elem_cfg['core_color']
    mid_c = elem_cfg['mid_color']
    glow_c = elem_cfg['glow_color']
    outer_c = elem_cfg['outer_glow']
    style = elem_cfg['style']
    
    # 1. Outer ambient glow layer
    glow_layer = Image.new('RGBA', (RW, RH), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # Outer aura pulsation
    aura_pulsate = 1.0 + 0.12 * math.sin(phase * 2)
    glow_width = (36 * RENDER_SCALE) * aura_pulsate
    
    glow_draw.ellipse(
        [tail_x - 30, tip_y - glow_width/2, tip_x + 20, tip_y + glow_width/2],
        fill=(outer_c[0], outer_c[1], outer_c[2], int(outer_c[3] * 0.9))
    )
    
    # 2. Side energy feathers / flaring aura waves (matching kim_1_frame side spires)
    num_side_spikes = 5
    for i in range(num_side_spikes):
        spike_u = (i + 1) / float(num_side_spikes + 1)
        sx = tail_x + spike_u * (tip_x - tail_x) * 0.85
        
        # Undulating wave motion
        wave = math.sin(phase + i * 1.1)
        spike_len = (16 + 10 * math.sin(spike_u * math.pi) + 6 * wave) * RENDER_SCALE
        spike_angle = math.radians(28 + 12 * wave)
        
        # Upper spike
        sp_top_x = sx - math.cos(spike_angle) * spike_len * 0.6
        sp_top_y = tip_y - math.sin(spike_angle) * spike_len
        
        # Lower spike
        sp_bot_x = sx - math.cos(spike_angle) * spike_len * 0.6
        sp_bot_y = tip_y + math.sin(spike_angle) * spike_len
        
        # Draw energy fins
        fin_poly_top = [(sx + 15 * RENDER_SCALE, tip_y - 4 * RENDER_SCALE), 
                        (sp_top_x, sp_top_y), 
                        (sx - 15 * RENDER_SCALE, tip_y - 2 * RENDER_SCALE)]
        fin_poly_bot = [(sx + 15 * RENDER_SCALE, tip_y + 4 * RENDER_SCALE), 
                        (sp_bot_x, sp_bot_y), 
                        (sx - 15 * RENDER_SCALE, tip_y + 2 * RENDER_SCALE)]
        
        glow_draw.polygon(fin_poly_top, fill=(glow_c[0], glow_c[1], glow_c[2], int(glow_c[3] * 0.75)))
        glow_draw.polygon(fin_poly_bot, fill=(glow_c[0], glow_c[1], glow_c[2], int(glow_c[3] * 0.75)))
    
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=6 * RENDER_SCALE))
    img.paste(glow_layer, (0, 0), glow_layer)
    
    # 3. Main energy blade / projectile body
    body_layer = Image.new('RGBA', (RW, RH), (0, 0, 0, 0))
    body_draw = ImageDraw.Draw(body_layer)
    
    blade_thick = (9.5 + 1.2 * math.sin(phase)) * RENDER_SCALE
    
    # Draw primary diamond lance shape
    body_poly = [
        (tail_x, tip_y),
        (tail_x + 40 * RENDER_SCALE, tip_y - blade_thick),
        (mid_x + 30 * RENDER_SCALE, tip_y - blade_thick * 0.9),
        (tip_x, tip_y),
        (mid_x + 30 * RENDER_SCALE, tip_y + blade_thick * 0.9),
        (tail_x + 40 * RENDER_SCALE, tip_y + blade_thick)
    ]
    body_draw.polygon(body_poly, fill=mid_c)
    
    # Side trailing wings / hilt flourish
    hilt_x = tail_x + 24 * RENDER_SCALE
    hilt_poly = [
        (tail_x - 10 * RENDER_SCALE, tip_y),
        (hilt_x, tip_y - 18 * RENDER_SCALE),
        (hilt_x + 12 * RENDER_SCALE, tip_y),
        (hilt_x, tip_y + 18 * RENDER_SCALE)
    ]
    body_draw.polygon(hilt_poly, fill=(glow_c[0], glow_c[1], glow_c[2], 210))
    
    body_layer = body_layer.filter(ImageFilter.GaussianBlur(radius=1.8 * RENDER_SCALE))
    img.paste(body_layer, (0, 0), body_layer)
    
    # 4. Brilliant White-Hot Core Channel
    core_layer = Image.new('RGBA', (RW, RH), (0, 0, 0, 0))
    core_draw = ImageDraw.Draw(core_layer)
    
    core_thick = (3.6 + 0.8 * math.sin(phase + 1.0)) * RENDER_SCALE
    core_poly = [
        (tail_x + 15 * RENDER_SCALE, tip_y),
        (mid_x, tip_y - core_thick),
        (tip_x - 10 * RENDER_SCALE, tip_y),
        (mid_x, tip_y + core_thick)
    ]
    core_draw.polygon(core_poly, fill=core_c)
    
    # Secondary inner glowing center line
    core_draw.line([(tail_x + 20 * RENDER_SCALE, tip_y), (tip_x - 5 * RENDER_SCALE, tip_y)], 
                   fill=(255, 255, 255, 255), width=int(2.2 * RENDER_SCALE))
    
    # Dynamic traveling light bead across the frames
    bead_u = (t + 0.25) % 1.0
    bead_x = tail_x + bead_u * (tip_x - tail_x)
    bead_r = (5.5 + 2.0 * math.sin(bead_u * math.pi)) * RENDER_SCALE
    core_draw.ellipse([bead_x - bead_r, tip_y - bead_r, bead_x + bead_r, tip_y + bead_r], 
                      fill=(255, 255, 255, 255))
    
    core_layer = core_layer.filter(ImageFilter.GaussianBlur(radius=1.0 * RENDER_SCALE))
    img.paste(core_layer, (0, 0), core_layer)
    
    # 5. Downsample with high quality Lanczos antialiasing to standard (128, 64)
    final_frame = img.resize((W, H), Image.Resampling.LANCZOS)
    return final_frame

def generate_all_frames():
    for elem_name, cfg in ELEMENTS_CONFIG.items():
        out_dir = os.path.join(ASSETS_DIR, cfg['folder'])
        os.makedirs(out_dir, exist_ok=True)
        print(f"Generating 8 Luyen Khi frames for: {elem_name} ({cfg['folder']})...")
        
        frames = []
        for f in range(8):
            frame_img = create_element_frame(cfg, f, 8)
            frames.append(frame_img)
            
            # Save standard naming frame_0.png .. frame_7.png
            fn1 = os.path.join(out_dir, f"frame_{f}.png")
            frame_img.save(fn1, quality=95)
            
            # Save kim_1 equivalent: {elem_key}_1_frame_{f}.png
            fn2 = os.path.join(out_dir, f"{cfg['key']}_1_frame_{f}.png")
            frame_img.save(fn2, quality=95)
            
            # Save proj_1_frame_{f}.png
            fn3 = os.path.join(out_dir, f"proj_1_frame_{f}.png")
            frame_img.save(fn3, quality=95)
        
        # Also update proj_1.png with frame 0 for static preview
        frames[0].save(os.path.join(out_dir, "proj_1.png"), quality=95)
        print(f"  -> Successfully created 8 frames for {elem_name} in {out_dir}")

if __name__ == '__main__':
    generate_all_frames()
