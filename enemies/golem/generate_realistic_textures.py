import os, math, random, time
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

OUT_DIR = r"H:\GOOGLE DRIVER\GAME\enemies\golem\textures"
os.makedirs(OUT_DIR, exist_ok=True)
np.random.seed(2026)
random.seed(2026)

TARGET_SIZES = {
    "golem_stone": (128, 128),
    "golem_slate": (128, 128),
    "golem_armor": (128, 128),
    "golem_crystal": (64, 64),
    "golem_rock_fist": (64, 64),
    "golem_core_eye": (64, 64),
    "golem_rune": (64, 64),
}

print("Generating Bright & Radiant 3D Textures for Golem...")

def create_noise_2d(h, w, scale=32, octaves=4, persistence=0.5):
    result = np.zeros((h, w), dtype=np.float32)
    amp = 1.0
    total_amp = 0.0
    current_scale = scale
    for _ in range(octaves):
        if current_scale < 2:
            break
        grid_h = max(2, int(h / current_scale) + 2)
        grid_w = max(2, int(w / current_scale) + 2)
        noise_grid = np.random.rand(grid_h, grid_w).astype(np.float32)
        im = Image.fromarray((noise_grid * 255).astype(np.uint8)).resize((w, h), Image.Resampling.BICUBIC)
        layer = np.array(im, dtype=np.float32) / 255.0
        result += layer * amp
        total_amp += amp
        amp *= persistence
        current_scale /= 2.0
    return result / max(total_amp, 1e-5)

def apply_emboss_bump(np_rgb, height_map, strength=1.8, light_dir=(-0.6, -0.6, 0.75)):
    lx, ly, lz = light_dir
    ll = math.sqrt(lx*lx + ly*ly + lz*lz)
    lx, ly, lz = lx/ll, ly/ll, lz/ll
    gy, gx = np.gradient(height_map.astype(np.float32) * strength)
    gz = np.ones_like(gx)
    norm = np.sqrt(gx*gx + gy*gy + gz*gz)
    nx, ny, nz = -gx/norm, -gy/norm, gz/norm
    diff = np.clip(nx*lx + ny*ly + nz*lz, 0.0, 1.0)
    ambient = 0.65
    light_factor = ambient + (1.0 - ambient) * diff
    lit = np_rgb * light_factor[:, :, np.newaxis]
    return np.clip(lit, 0, 255).astype(np.uint8)

def finalize_mobile_img(img, target_size, contrast=1.18, brightness=1.16, sharpness=1.35):
    if img.size != target_size:
        img = img.resize(target_size, Image.Resampling.LANCZOS)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Color(img).enhance(1.25)
    img = ImageEnhance.Sharpness(img).enhance(sharpness)
    return img

# 1. GOLEM STONE (Bright Silver Granite with Fresh Emerald Lichen)
def generate_stone():
    target_w, target_h = TARGET_SIZES["golem_stone"]
    w, h = 512, 512
    print(f"Generating 1. golem_stone.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (185, 192, 202, 255))
    draw = ImageDraw.Draw(img)
    
    for _ in range(8000):
        x, y = random.randint(0, w), random.randint(0, h)
        rad = random.randint(1, 4)
        c_val = random.choice([(150, 160, 175), (220, 228, 238), (130, 140, 155), (245, 250, 255)])
        draw.ellipse([x-rad, y-rad, x+rad, y+rad], fill=c_val + (random.randint(120, 240),))
        
    for _ in range(35):
        cx, cy = random.randint(0, w), random.randint(0, h)
        for _ in range(random.randint(3, 7)):
            dx, dy = random.randint(-45, 45), random.randint(-45, 45)
            draw.line([(cx, cy), (cx+dx, cy+dy)], fill=(95, 105, 120, 220), width=random.randint(1, 3))
            cx, cy = cx+dx, cy+dy
            
    # Fresh emerald/cyan lichen
    for _ in range(600):
        mx, my = random.randint(0, w), random.randint(0, h)
        mrad = random.randint(2, 6)
        draw.ellipse([mx-mrad, my-mrad, mx+mrad, my+mrad], fill=(90, 195, 160, random.randint(80, 180)))
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=32, octaves=5)
    lit = apply_emboss_bump(rgb_arr, noise, strength=2.0)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.16)
    out_path = os.path.join(OUT_DIR, "golem_stone.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 2. GOLEM SLATE (Clean Blue Slate)
def generate_slate():
    target_w, target_h = TARGET_SIZES["golem_slate"]
    w, h = 512, 512
    print(f"Generating 2. golem_slate.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (135, 148, 165, 255))
    draw = ImageDraw.Draw(img)
    for y in range(0, h, 8):
        c_base = random.randint(120, 175)
        draw.line([(0, y), (w, y+random.randint(-3, 3))], fill=(c_base, c_base+8, c_base+20, 220), width=random.randint(2, 5))
        
    for _ in range(4000):
        x, y = random.randint(0, w), random.randint(0, h)
        length = random.randint(15, 60)
        c = random.randint(110, 190)
        draw.line([(x, y), (x + length, y + random.randint(-2, 2))], fill=(c, c+6, c+16, random.randint(100, 200)), width=random.randint(1, 2))
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=48, octaves=4)
    lit = apply_emboss_bump(rgb_arr, noise, strength=1.8)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.15)
    out_path = os.path.join(OUT_DIR, "golem_slate.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 3. GOLEM ARMOR (Bright Megalith Stone & Gold/Iron Plates)
def generate_armor():
    target_w, target_h = TARGET_SIZES["golem_armor"]
    w, h = 512, 512
    print(f"Generating 3. golem_armor.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (160, 170, 185, 255))
    draw = ImageDraw.Draw(img)
    tile_size = 128
    for gy in range(0, h, tile_size):
        for gx in range(0, w, tile_size):
            x0, y0 = gx + 4, gy + 4
            x1, y1 = gx + tile_size - 4, gy + tile_size - 4
            draw.rectangle([x0+4, y0+4, x1+6, y1+6], fill=(85, 95, 110, 200))
            draw.rectangle([x0, y0, x1, y1], fill=(180, 190, 205, 255), outline=(105, 115, 130, 255), width=4)
            draw.rectangle([x0+6, y0+6, x1-6, y1-6], outline=(225, 235, 250, 255), width=2)
            
            draw.line([(x0+12, y0+12), (x1-12, y1-12)], fill=(215, 175, 80, 255), width=6)
            draw.line([(x0+12, y0+12), (x1-12, y1-12)], fill=(255, 240, 160, 255), width=2)
            
            for rx, ry in [(x0+14, y0+14), (x1-14, y0+14), (x0+14, y1-14), (x1-14, y1-14)]:
                draw.ellipse([rx-5, ry-5, rx+5, ry+5], fill=(95, 105, 120, 255), outline=(225, 235, 255, 255), width=1)
                draw.ellipse([rx-2, ry-2, rx+2, ry+2], fill=(255, 255, 255, 255))
                
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=24, octaves=4)
    lit = apply_emboss_bump(rgb_arr, noise, strength=2.2)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.16)
    out_path = os.path.join(OUT_DIR, "golem_armor.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 4. GOLEM CRYSTAL (Luminous Azure Crystal Spikes)
def generate_crystal():
    target_w, target_h = TARGET_SIZES["golem_crystal"]
    w, h = 256, 256
    print(f"Generating 4. golem_crystal.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (90, 215, 255, 255))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        draw.line([(0, y), (w, y)], fill=(int(80 + t*100), int(220 - t*30), 255, 255))
        
    pts_facets = [
        [(20, 20), (128, 10), (80, 128)],
        [(128, 10), (236, 30), (180, 130)],
        [(80, 128), (180, 130), (128, 240)],
        [(20, 20), (80, 128), (30, 230)],
        [(180, 130), (236, 30), (220, 230)]
    ]
    for pts in pts_facets:
        draw.polygon(pts, fill=(random.randint(120, 200), random.randint(220, 255), 255, 230), outline=(255, 255, 255, 255), width=2)
        
    for _ in range(120):
        x, y, length = random.randint(0, w), random.randint(0, h), random.randint(20, 70)
        draw.line([(x, y), (x + random.randint(-15, 15), y + length)], fill=(255, 255, 255, random.randint(140, 255)), width=2)
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=20, octaves=3)
    lit = apply_emboss_bump(rgb_arr, noise, strength=1.2)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.18)
    out_path = os.path.join(OUT_DIR, "golem_crystal.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 5. GOLEM ROCK FIST (Clean Chiseled Knuckle Stone)
def generate_rock_fist():
    target_w, target_h = TARGET_SIZES["golem_rock_fist"]
    w, h = 256, 256
    print(f"Generating 5. golem_rock_fist.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (145, 155, 170, 255))
    draw = ImageDraw.Draw(img)
    for _ in range(600):
        cx, cy, rad = random.randint(0, w), random.randint(0, h), random.randint(4, 14)
        c_val = random.randint(140, 195)
        draw.ellipse([cx-rad, cy-rad, cx+rad, cy+rad], fill=(c_val, c_val+6, c_val+15, 255), outline=(95, 105, 120, 255), width=2)
        if random.random() < 0.4:
            draw.ellipse([cx-rad+2, cy-rad+2, cx-rad+5, cy-rad+5], fill=(245, 250, 255, 220))
            
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=16, octaves=4)
    lit = apply_emboss_bump(rgb_arr, noise, strength=2.2)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.16)
    out_path = os.path.join(OUT_DIR, "golem_rock_fist.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 6. GOLEM CORE & EYE (Radiant Electric Azure Cyan Mana Core)
def generate_core_eye():
    target_w, target_h = TARGET_SIZES["golem_core_eye"]
    w, h = 256, 256
    print(f"Generating 6. golem_core_eye.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (20, 80, 110, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    r_core = int(w * 0.44)
    
    draw.ellipse([cx - r_core - 8, cy - r_core - 8, cx + r_core + 8, cy + r_core + 8], 
                 fill=(60, 120, 150, 255), outline=(20, 50, 75, 255), width=6)
    
    for r in range(r_core, 10, -3):
        t = r / r_core
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(int(120 * (1-t) + 30), int(255 - t*40), 255, 255))
        
    for _ in range(800):
        ang = random.uniform(0, math.pi * 2)
        r0 = random.uniform(10, r_core * 0.4)
        r1 = random.uniform(r_core * 0.5, r_core - 4)
        draw.line([(cx + math.cos(ang)*r0, cy + math.sin(ang)*r0), 
                   (cx + math.cos(ang)*r1, cy + math.sin(ang)*r1)], fill=(255, 255, 255, random.randint(180, 255)), width=2)
        
    draw.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], fill=(255, 255, 255, 255))
    
    result = finalize_mobile_img(img.convert("RGB"), (target_w, target_h), brightness=1.2)
    out_path = os.path.join(OUT_DIR, "golem_core_eye.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 7. GOLEM RUNE (Radiant Glowing Azure Glyph)
def generate_rune():
    target_w, target_h = TARGET_SIZES["golem_rune"]
    w, h = 256, 256
    print(f"Generating 7. golem_rune.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (30, 85, 115, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    
    for r in range(int(w * 0.46), 10, -6):
        t = r / (w * 0.46)
        alpha = int(255 * (1.0 - t) ** 1.3)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(40, 215, 255, alpha))
        
    pts = [(cx, cy - 80), (cx + 65, cy), (cx, cy + 80), (cx - 65, cy)]
    draw.polygon(pts, outline=(140, 235, 255, 255), width=6)
    draw.polygon(pts, outline=(255, 255, 255, 255), width=2)
    draw.line([(cx - 70, cy), (cx + 70, cy)], fill=(255, 255, 255, 255), width=3)
    draw.line([(cx, cy - 85), (cx, cy + 85)], fill=(255, 255, 255, 255), width=3)
    draw.ellipse([cx - 15, cy - 15, cx + 15, cy + 15], fill=(255, 255, 255, 255))
    
    result = finalize_mobile_img(Image.fromarray(np.array(img.convert("RGB"))), (target_w, target_h), brightness=1.2)
    out_path = os.path.join(OUT_DIR, "golem_rune.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

if __name__ == "__main__":
    t0 = time.time()
    generate_stone()
    generate_slate()
    generate_armor()
    generate_crystal()
    generate_rock_fist()
    generate_core_eye()
    generate_rune()
    print(f"\nAll 7 Bright Golem Textures Generated in {time.time() - t0:.2f}s!")
