import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ASSETS_DIR = r'assets/vfx'
SW, SH = 256, 128
OW, OH = 128, 64

# ==============================================================================
# 1. HỎA (Fireball / Quả Cầu Lửa 3D)
# ==============================================================================
def render_fire_frame(frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    cx, cy = 175.0, SH / 2.0  # Fireball center towards the front
    r_core = 24.0
    
    # 1a. Trailing 3D Flame Tail (stretching left to x=30)
    tail_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(tail_layer)
    
    for i in range(12):
        u = i / 11.0
        tx = cx - u * 135.0
        wave1 = math.sin(phase * 2 + u * 6.0 + i * 0.5) * (10.0 + 12.0 * u)
        wave2 = math.cos(phase * 2 + u * 5.0) * (6.0 + 8.0 * u)
        
        tr = (r_core * (1.0 - u * 0.75) + 4.0)
        c_alpha = int(220 * (1.0 - u * 0.85))
        
        # Outer fire
        t_draw.ellipse([tx - tr, cy + wave1 - tr, tx + tr, cy + wave1 + tr], 
                       fill=(255, int(60 + 100 * (1.0 - u)), 0, c_alpha))
        # Inner flame
        if u < 0.7:
            t_draw.ellipse([tx - tr*0.6, cy + wave2 - tr*0.6, tx + tr*0.6, cy + wave2 + tr*0.6], 
                           fill=(255, int(180 + 60 * (1.0 - u)), 30, int(c_alpha * 1.2)))
            
    tail_layer = tail_layer.filter(ImageFilter.GaussianBlur(radius=4.5))
    canvas.paste(tail_layer, (0, 0), tail_layer)
    
    # 1b. 3D Flame Tendrils & Swirling Fire Spikes around the orb
    tendril_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    td_draw = ImageDraw.Draw(tendril_layer)
    for k in range(8):
        angle = (k / 8.0) * 2 * math.pi + phase
        flame_len = 16.0 + 10.0 * math.sin(phase * 2 + k * 1.2)
        fx = cx + math.cos(angle) * (r_core + flame_len)
        fy = cy + math.sin(angle) * (r_core * 0.85 + flame_len * 0.85)
        
        # Tendril triangle
        bx1 = cx + math.cos(angle - 0.25) * r_core
        by1 = cy + math.sin(angle - 0.25) * r_core
        bx2 = cx + math.cos(angle + 0.25) * r_core
        by2 = cy + math.sin(angle + 0.25) * r_core
        
        td_draw.polygon([(bx1, by1), (fx, fy), (bx2, by2)], fill=(255, 140, 10, 200))
    tendril_layer = tendril_layer.filter(ImageFilter.GaussianBlur(radius=2.5))
    canvas.paste(tendril_layer, (0, 0), tendril_layer)
    
    # 1c. 3D Spherical Core (Phong shading)
    Y, X = np.ogrid[:SH, :SW]
    dist = np.sqrt((X - cx)**2 + ((Y - cy) * 1.1)**2)
    core_mask = dist <= r_core
    
    # Spherical normal
    z = np.sqrt(np.maximum(0.0, r_core**2 - dist**2)) / r_core
    nx = (X - cx) / r_core
    ny = (Y - cy) / r_core
    
    # Lighting from top-left
    NdotL = np.clip(-nx * 0.45 - ny * 0.55 + z * 0.70, 0.0, 1.0)
    spec = np.power(np.clip(-nx * 0.45 - ny * 0.55 + z * 0.70, 0.0, 1.0), 18)
    
    core_rgb = np.zeros((SH, SW, 4), dtype=np.uint8)
    # Molten gradient
    core_rgb[:, :, 0] = 255
    core_rgb[:, :, 1] = np.clip(160 * NdotL + 95 * spec + 60, 0, 255).astype(np.uint8)
    core_rgb[:, :, 2] = np.clip(40 + 215 * spec, 0, 255).astype(np.uint8)
    core_rgb[:, :, 3] = np.where(core_mask, np.clip((1.0 - (dist/r_core)**3) * 255, 0, 255), 0).astype(np.uint8)
    
    core_img = Image.fromarray(core_rgb, mode='RGBA')
    canvas.paste(core_img, (0, 0), core_img)
    
    # 1d. White-hot center spot
    draw.ellipse([cx - 9, cy - 8, cx + 9, cy + 8], fill=(255, 255, 240, 245))
    
    return canvas.resize((OW, OH), Image.Resampling.LANCZOS)

# ==============================================================================
# 2. LÔI (Lightning Bolt / Lôi Điện 3D)
# ==============================================================================
def render_lightning_frame(frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    
    # Plasma Sphere at Front (x: 180, cy)
    fx, fy = 180.0, SH / 2.0
    
    # 2a. Crackling Lightning Arcs (Random seed per frame for organic electricity)
    rng = np.random.RandomState(seed=frame_idx * 17 + 42)
    
    arc_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    a_draw = ImageDraw.Draw(arc_layer)
    
    # 4 major lightning branches from tail (x: 35) to front (x: 185)
    for branch in range(4):
        pts = [(35, fy + rng.randint(-12, 12))]
        curr_x = 35
        curr_y = pts[0][1]
        
        while curr_x < 180:
            step_x = rng.randint(18, 36)
            curr_x = min(180, curr_x + step_x)
            jitter_y = rng.randint(-22, 22)
            curr_y = (SH / 2.0) + jitter_y * (1.0 - (curr_x / 200.0) * 0.4)
            pts.append((curr_x, curr_y))
            
            # Sub-branches (tia sét phụ)
            if rng.rand() > 0.45:
                sub_pts = [(curr_x, curr_y)]
                sub_x, sub_y = curr_x, curr_y
                for _ in range(3):
                    sub_x += rng.randint(8, 20)
                    sub_y += rng.randint(-16, 16)
                    sub_pts.append((sub_x, sub_y))
                a_draw.line(sub_pts, fill=(160, 100, 255, 180), width=3)
                a_draw.line(sub_pts, fill=(230, 245, 255, 230), width=1)
                
        # Main branch
        a_draw.line(pts, fill=(130, 60, 255, 220), width=6)
        a_draw.line(pts, fill=(180, 140, 255, 240), width=3)
        a_draw.line(pts, fill=(255, 255, 255, 255), width=2)
        
    arc_layer = arc_layer.filter(ImageFilter.GaussianBlur(radius=1.5))
    canvas.paste(arc_layer, (0, 0), arc_layer)
    
    # 2b. Electric Plasma Orb at head
    p_draw = ImageDraw.Draw(canvas)
    p_draw.ellipse([fx - 28, fy - 24, fx + 28, fy + 24], fill=(140, 50, 255, 90))
    p_draw.ellipse([fx - 18, fy - 16, fx + 18, fy + 16], fill=(180, 120, 255, 180))
    p_draw.ellipse([fx - 10, fy - 9, fx + 10, fy + 9], fill=(255, 255, 255, 255))
    
    # Ion discharge sparks
    for _ in range(6):
        sp_a = rng.uniform(0, 2 * math.pi)
        sp_d = rng.uniform(12, 32)
        sx = fx + math.cos(sp_a) * sp_d
        sy = fy + math.sin(sp_a) * sp_d
        p_draw.line([(fx, fy), (sx, sy)], fill=(200, 240, 255, 200), width=2)
        
    return canvas.resize((OW, OH), Image.Resampling.LANCZOS)

# ==============================================================================
# 3. KIM (Golden Needle Dart / Kim Tiễn 3D)
# ==============================================================================
def render_metal_frame(frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    
    # Slender 3D Needle Body (x: 40 to 215)
    Y, X = np.ogrid[:SH, :SW]
    cy = SH / 2.0
    dy = np.abs(Y - cy)
    
    u = np.clip((X - 40.0) / (215.0 - 40.0), 0.0, 1.0)
    
    # Diamond needle profile
    needle_w = np.where(u < 0.85, 4.0 + 4.0 * np.sin(u * math.pi), 8.0 * (1.0 - (u - 0.85) / 0.15))
    mask = (X >= 40) & (X <= 215) & (dy <= needle_w)
    
    # 3D Normal & Specular
    norm_y = np.clip(dy / np.maximum(needle_w, 1e-3), 0.0, 1.0)
    H3D = np.maximum(0.0, 1.0 - norm_y)
    
    sobel_x = np.gradient(H3D, axis=1) * 3.0
    sobel_y = np.gradient(H3D, axis=0) * 3.0
    Nz = np.ones_like(H3D) * 0.8
    Nlen = np.sqrt(sobel_x**2 + sobel_y**2 + Nz**2) + 1e-6
    Nx = -sobel_x / Nlen
    Ny = -sobel_y / Nlen
    
    NdotL = np.clip(-Nx * 0.4 - Ny * 0.6 + (Nz / Nlen) * 0.7, 0.0, 1.0)
    spec = np.power(np.clip(-Nx * 0.4 - Ny * 0.6 + (Nz / Nlen) * 0.7, 0.0, 1.0), 32)
    
    gold_rgb = np.zeros((SH, SW, 4), dtype=np.uint8)
    gold_rgb[:, :, 0] = np.clip(230 * NdotL + 25 * spec + 25, 0, 255).astype(np.uint8)
    gold_rgb[:, :, 1] = np.clip(185 * NdotL + 70 * spec + 10, 0, 255).astype(np.uint8)
    gold_rgb[:, :, 2] = np.clip(30 * NdotL + 225 * spec, 0, 255).astype(np.uint8)
    gold_rgb[:, :, 3] = np.where(mask, 255, 0).astype(np.uint8)
    
    needle_img = Image.fromarray(gold_rgb, mode='RGBA')
    
    # Side floating golden needles / Qi feathers
    spire_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(spire_layer)
    for i in range(5):
        su = 0.2 + (i / 4.0) * 0.6
        sx = 45.0 + su * 155.0
        wave = math.sin(phase + i * 1.2)
        flen = 10.0 + 6.0 * wave
        
        s_draw.line([(sx, cy - 4), (sx - 12, cy - 4 - flen)], fill=(255, 235, 120, 210), width=3)
        s_draw.line([(sx, cy + 4), (sx - 12, cy + 4 + flen)], fill=(255, 235, 120, 210), width=3)
        
    spire_layer = spire_layer.filter(ImageFilter.GaussianBlur(radius=1.5))
    canvas.paste(spire_layer, (0, 0), spire_layer)
    canvas.paste(needle_img, (0, 0), needle_img)
    
    # Glint flare at tip
    f_draw = ImageDraw.Draw(canvas)
    f_draw.ellipse([208, cy - 6, 220, cy + 6], fill=(255, 255, 240, 240))
    f_draw.line([(204, cy), (224, cy)], fill=(255, 255, 255, 255), width=2)
    
    return canvas.resize((OW, OH), Image.Resampling.LANCZOS)

# ==============================================================================
# 4. THỦY (Glacial Ice Spear / Băng Trùy 3D)
# ==============================================================================
def render_water_frame(frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    
    # 3D Faceted Glacial Crystal (x: 45 to 215)
    Y, X = np.ogrid[:SH, :SW]
    cy = SH / 2.0
    dy = np.abs(Y - cy)
    
    u = np.clip((X - 45.0) / (215.0 - 45.0), 0.0, 1.0)
    
    # Multi-faceted crystal width
    crystal_w = np.where(u < 0.70, 15.0 * np.sin(u * math.pi * 0.75 + 0.3), 14.0 * (1.0 - (u - 0.70) / 0.30))
    mask = (X >= 45) & (X <= 215) & (dy <= crystal_w)
    
    # Facet lines & Refraction
    facet_pattern = np.cos((X - 45) * 0.18 + dy * 0.45)
    H3D = np.maximum(0.0, 1.0 - (dy / np.maximum(crystal_w, 1e-3))) * (0.75 + 0.25 * facet_pattern)
    
    ice_rgb = np.zeros((SH, SW, 4), dtype=np.uint8)
    ice_rgb[:, :, 0] = np.clip(40 + 190 * H3D, 0, 255).astype(np.uint8)
    ice_rgb[:, :, 1] = np.clip(160 + 95 * H3D, 0, 255).astype(np.uint8)
    ice_rgb[:, :, 2] = 255
    ice_rgb[:, :, 3] = np.where(mask, np.clip(H3D * 240 + 30, 0, 245), 0).astype(np.uint8)
    
    ice_img = Image.fromarray(ice_rgb, mode='RGBA')
    
    # Frost mist aura
    mist_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    m_draw = ImageDraw.Draw(mist_layer)
    for i in range(8):
        mu = i / 7.0
        mx = 50.0 + mu * 150.0
        my = cy + math.sin(phase + mu * 4.0) * 12.0
        mr = 12.0 + 8.0 * math.cos(mu * math.pi)
        m_draw.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=(0, 170, 255, 65))
    mist_layer = mist_layer.filter(ImageFilter.GaussianBlur(radius=6.0))
    
    canvas.paste(mist_layer, (0, 0), mist_layer)
    canvas.paste(ice_img, (0, 0), ice_img)
    
    # Sparkling ice needles
    sp_draw = ImageDraw.Draw(canvas)
    for k in range(5):
        ku = 0.25 + (k / 4.0) * 0.55
        kx = 50.0 + ku * 140.0
        kw = math.sin(phase + k * 1.3)
        sp_draw.line([(kx, cy - 8), (kx - 8, cy - 18 - 4*kw)], fill=(220, 250, 255, 220), width=3)
        sp_draw.line([(kx, cy + 8), (kx - 8, cy + 18 + 4*kw)], fill=(220, 250, 255, 220), width=3)
        
    return canvas.resize((OW, OH), Image.Resampling.LANCZOS)

# ==============================================================================
# 5. PHONG (Wind Scythe / Phong Nhẫn 3D)
# ==============================================================================
def render_wind_frame(frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    
    # 3D Curved Crescent Wind Blade (x: 40 to 215)
    blade_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(blade_layer)
    
    # Sweeping aerodynamic crescent arcs
    for layer in range(4):
        rot = phase + layer * (math.pi / 2.0)
        c_poly = [
            (45, SH / 2.0),
            (120, SH / 2.0 - 22.0 * math.sin(rot * 0.5 + 1.0)),
            (215, SH / 2.0),
            (135, SH / 2.0 + 16.0 * math.sin(rot * 0.5 + 1.0))
        ]
        b_draw.polygon(c_poly, fill=(40, int(210 + layer * 12), int(140 + layer * 20), int(150 + layer * 25)))
        
    blade_layer = blade_layer.filter(ImageFilter.GaussianBlur(radius=2.0))
    canvas.paste(blade_layer, (0, 0), blade_layer)
    
    # Spiraling vortex rings around the wind blade
    v_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    v_draw = ImageDraw.Draw(v_layer)
    for i in range(6):
        vu = i / 5.0
        vx = 55.0 + vu * 140.0
        v_rad_y = 18.0 * (1.0 - (vu - 0.5)**2)
        v_phase = phase + vu * 6.0
        
        vy1 = (SH / 2.0) + math.sin(v_phase) * v_rad_y
        vy2 = (SH / 2.0) + math.sin(v_phase + math.pi) * v_rad_y
        
        v_draw.line([(vx - 10, vy1), (vx + 10, vy2)], fill=(180, 255, 220, 220), width=3)
        
    v_layer = v_layer.filter(ImageFilter.GaussianBlur(radius=1.2))
    canvas.paste(v_layer, (0, 0), v_layer)
    
    # Razor wind tip
    draw = ImageDraw.Draw(canvas)
    draw.polygon([(195, SH/2.0 - 6), (222, SH/2.0), (195, SH/2.0 + 6)], fill=(240, 255, 245, 255))
    
    return canvas.resize((OW, OH), Image.Resampling.LANCZOS)

# ==============================================================================
# 6. MỘC (Thorny Vine Spear / Mộc Gai 3D)
# ==============================================================================
def render_wood_frame(frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    
    # 3D Twisted Briar Vine Core (x: 40 to 215)
    v_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    v_draw = ImageDraw.Draw(v_layer)
    
    cy = SH / 2.0
    pts1 = []
    pts2 = []
    
    for x in range(40, 216, 6):
        u = (x - 40.0) / 175.0
        w = 10.0 * (1.0 - u * 0.7)
        y1 = cy + math.sin(u * 8.0 + phase) * w
        y2 = cy + math.sin(u * 8.0 + phase + math.pi) * w
        pts1.append((x, y1))
        pts2.append((x, y2))
        
    v_draw.line(pts1, fill=(70, 160, 45, 230), width=6)
    v_draw.line(pts2, fill=(110, 200, 60, 230), width=5)
    v_draw.line(pts1, fill=(180, 245, 120, 240), width=2)
    
    # Sharp thorns sprouting along the vines
    for i in range(7):
        tu = 0.15 + (i / 6.0) * 0.75
        tx = 40.0 + tu * 165.0
        twave = math.sin(phase + i * 1.1)
        t_len = 12.0 + 5.0 * twave
        
        # Upper & lower thorn
        v_draw.polygon([(tx, cy - 4), (tx - 8, cy - 6 - t_len), (tx + 4, cy - 4)], fill=(160, 230, 80, 240))
        v_draw.polygon([(tx, cy + 4), (tx - 8, cy + 6 + t_len), (tx + 4, cy + 4)], fill=(160, 230, 80, 240))
        
    v_layer = v_layer.filter(ImageFilter.GaussianBlur(radius=1.0))
    canvas.paste(v_layer, (0, 0), v_layer)
    
    # Glowing spearhead
    draw = ImageDraw.Draw(canvas)
    draw.polygon([(200, cy - 8), (224, cy), (200, cy + 8)], fill=(220, 255, 180, 255))
    
    return canvas.resize((OW, OH), Image.Resampling.LANCZOS)

# ==============================================================================
# 7. THỔ (Rocky Meteorite / Nham Thạch 3D)
# ==============================================================================
def render_earth_frame(frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    cx, cy = 165.0, SH / 2.0
    r_rock = 22.0
    
    # 7a. Trail of Floating Stone Shards stretching left (x: 40 to 160)
    rng = np.random.RandomState(seed=frame_idx * 23 + 101)
    
    for i in range(9):
        u = i / 8.0
        rx = cx - u * 125.0 + rng.randint(-6, 6)
        ry = cy + math.sin(phase + u * 4.0) * 14.0 + rng.randint(-8, 8)
        rs = int(8.0 * (1.0 - u * 0.6) + rng.randint(2, 6))
        
        # Jagged polygon
        poly = [
            (rx - rs, ry),
            (rx - rs*0.4, ry - rs),
            (rx + rs*0.8, ry - rs*0.5),
            (rx + rs, ry + rs*0.3),
            (rx, ry + rs)
        ]
        draw.polygon(poly, fill=(int(170 - u*60), int(100 - u*40), int(30 - u*10), int(240 - u*120)))
        draw.line(poly + [poly[0]], fill=(255, 200, 80, int(200 - u*100)), width=2)
        
    # 7b. Main Meteorite Body (3D faceted rock with magma fissures)
    Y, X = np.ogrid[:SH, :SW]
    dist = np.sqrt((X - cx)**2 + ((Y - cy) * 1.15)**2)
    rock_mask = dist <= r_rock
    
    fissure = np.sin((X - cx) * 0.35 + (Y - cy) * 0.25 + phase) * np.cos((X - cx) * 0.2)
    
    rock_rgb = np.zeros((SH, SW, 4), dtype=np.uint8)
    rock_rgb[:, :, 0] = np.where(fissure > 0.4, 255, np.clip(180 - dist * 3.0, 40, 200)).astype(np.uint8)
    rock_rgb[:, :, 1] = np.where(fissure > 0.4, 180, np.clip(110 - dist * 2.0, 20, 140)).astype(np.uint8)
    rock_rgb[:, :, 2] = np.where(fissure > 0.4, 30, 20).astype(np.uint8)
    rock_rgb[:, :, 3] = np.where(rock_mask, 255, 0).astype(np.uint8)
    
    rock_img = Image.fromarray(rock_rgb, mode='RGBA').filter(ImageFilter.GaussianBlur(radius=0.8))
    canvas.paste(rock_img, (0, 0), rock_img)
    
    # Glowing magma core glow
    glow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse([cx - 28, cy - 24, cx + 28, cy + 24], fill=(255, 140, 20, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=4.0))
    canvas.paste(glow, (0, 0), glow)
    
    return canvas.resize((OW, OH), Image.Resampling.LANCZOS)

# ==============================================================================
# 8. VẬT LÝ (Astral Shockwave / Kình Khí Ba 3D)
# ==============================================================================
def render_physical_frame(frame_idx, total_frames=8):
    t = frame_idx / float(total_frames)
    phase = t * 2 * math.pi
    
    canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    cx, cy = 175.0, SH / 2.0
    
    # 8a. Concentric Toroidal Shockwave Rings expanding backward
    ring_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    r_draw = ImageDraw.Draw(ring_layer)
    
    for i in range(5):
        ru = (i / 4.0 + t) % 1.0
        rx = cx - ru * 135.0
        rw = 8.0 + ru * 24.0
        rh = 12.0 + ru * 38.0
        alpha = int(240 * (1.0 - ru))
        
        r_draw.ellipse([rx - rw, cy - rh, rx + rw, cy + rh], outline=(255, 255, 255, alpha), width=3)
        r_draw.ellipse([rx - rw*0.7, cy - rh*0.7, rx + rw*0.7, cy + rh*0.7], outline=(200, 210, 240, int(alpha * 0.6)), width=2)
        
    ring_layer = ring_layer.filter(ImageFilter.GaussianBlur(radius=1.8))
    canvas.paste(ring_layer, (0, 0), ring_layer)
    
    # 8b. High-Pressure Astral Qi Force Core at front
    draw.ellipse([cx - 30, cy - 24, cx + 30, cy + 24], fill=(220, 230, 255, 90))
    draw.ellipse([cx - 18, cy - 15, cx + 18, cy + 15], fill=(245, 250, 255, 190))
    draw.ellipse([cx - 9, cy - 8, cx + 9, cy + 8], fill=(255, 255, 255, 255))
    
    # Pressure conical rays
    draw.polygon([(cx - 20, cy - 22), (cx + 22, cy), (cx - 20, cy + 22)], fill=(255, 255, 255, 140))
    
    return canvas.resize((OW, OH), Image.Resampling.LANCZOS)

# ==============================================================================
# MAIN RENDER DISPATCHER
# ==============================================================================
RENDERERS = {
    'fire': ('fire', 'hoa', render_fire_frame),
    'lightning': ('lightning', 'loi', render_lightning_frame),
    'metal': ('metal', 'kim', render_metal_frame),
    'water': ('water', 'thuy', render_water_frame),
    'wind': ('wind', 'phong', render_wind_frame),
    'wood': ('wood', 'moc', render_wood_frame),
    'earth': ('earth', 'tho', render_earth_frame),
    'physical': ('physical', 'ly', render_physical_frame)
}

def generate_all():
    print("Generating unique, natural 3D elemental shapes for all 8 elements...")
    for elem_name, (folder, elem_key, func) in RENDERERS.items():
        out_dir = os.path.join(ASSETS_DIR, folder)
        os.makedirs(out_dir, exist_ok=True)
        print(f"Rendering 8 custom 3D frames for: {elem_name} ({folder})...")
        
        frames = []
        for f in range(8):
            frame_img = func(f, 8)
            frames.append(frame_img)
            
            frame_img.save(os.path.join(out_dir, f"frame_{f}.png"), quality=95)
            frame_img.save(os.path.join(out_dir, f"{elem_key}_1_frame_{f}.png"), quality=95)
            frame_img.save(os.path.join(out_dir, f"proj_1_frame_{f}.png"), quality=95)
            
        frames[0].save(os.path.join(out_dir, "proj_1.png"), quality=95)
        print(f"  -> Successfully rendered {elem_name}")

if __name__ == '__main__':
    generate_all()
