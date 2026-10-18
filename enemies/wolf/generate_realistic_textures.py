import os, math, random, time
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

OUT_DIR = r"H:\GOOGLE DRIVER\GAME\enemies\wolf\textures"
os.makedirs(OUT_DIR, exist_ok=True)
np.random.seed(1337)
random.seed(1337)

TARGET_SIZES = {
    "wolf_fur": (128, 128),
    "wolf_underbelly": (128, 128),
    "wolf_armor": (128, 128),
    "wolf_bone": (64, 64),
    "wolf_claw": (64, 64),
    "wolf_eye": (64, 64),
    "wolf_accent": (64, 64),
}

print("Generating Bright & Vibrant 3D Textures for Wolf...")

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

def apply_emboss_bump(np_rgb, height_map, strength=1.8, light_dir=(-0.5, -0.6, 0.8)):
    lx, ly, lz = light_dir
    ll = math.sqrt(lx*lx + ly*ly + lz*lz)
    lx, ly, lz = lx/ll, ly/ll, lz/ll
    gy, gx = np.gradient(height_map.astype(np.float32) * strength)
    gz = np.ones_like(gx)
    norm = np.sqrt(gx*gx + gy*gy + gz*gz)
    nx, ny, nz = -gx/norm, -gy/norm, gz/norm
    diff = np.clip(nx*lx + ny*ly + nz*lz, 0.0, 1.0)
    ambient = 0.65  # Bright ambient light for clean, vibrant look
    light_factor = ambient + (1.0 - ambient) * diff
    lit = np_rgb * light_factor[:, :, np.newaxis]
    return np.clip(lit, 0, 255).astype(np.uint8)

def finalize_mobile_img(img, target_size, contrast=1.18, brightness=1.15, sharpness=1.35):
    if img.size != target_size:
        img = img.resize(target_size, Image.Resampling.LANCZOS)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Color(img).enhance(1.25) # Boost vibrant color saturation
    img = ImageEnhance.Sharpness(img).enhance(sharpness)
    return img

# 1. WOLF FUR (Bright Golden Amber & Silver Timber Wolf Fur)
def generate_fur():
    target_w, target_h = TARGET_SIZES["wolf_fur"]
    w, h = 512, 512
    print(f"Generating 1. wolf_fur.png (Bright {target_w}x{target_h})...")
    
    noise_base = create_noise_2d(h, w, scale=64, octaves=4)
    img = Image.new("RGBA", (w, h), (185, 135, 95, 255))
    draw = ImageDraw.Draw(img)
    
    for y in range(h):
        spine = math.exp(-((y - h * 0.45) / (h * 0.35)) ** 2)
        base_r = int(210 * (1 - spine * 0.35) + 120 * spine)
        base_g = int(160 * (1 - spine * 0.35) + 85 * spine)
        base_b = int(115 * (1 - spine * 0.35) + 60 * spine)
        draw.line([(0, y), (w, y)], fill=(base_r, base_g, base_b, 255))
        
    for _ in range(12000):
        x, y = random.randint(-20, w + 20), random.randint(-20, h + 20)
        length = random.randint(12, 30)
        angle = random.uniform(0.18, 0.36)
        dx, dy = length * math.cos(angle), length * math.sin(angle)
        val = random.uniform(0.85, 1.3)
        r = int(np.clip((195 + random.randint(-15, 20)) * val, 50, 255))
        g = int(np.clip((145 + random.randint(-12, 18)) * val, 40, 240))
        b = int(np.clip((100 + random.randint(-10, 15)) * val, 30, 210))
        draw.line([(x, y), (x + dx, y + dy)], fill=(r, g, b, random.randint(100, 200)), width=random.randint(1, 2))
        
    for _ in range(9000):
        x, y = random.randint(-20, w + 20), random.randint(-20, h + 20)
        length = random.randint(22, 45)
        angle = random.uniform(0.20, 0.32)
        c_base, c_mid, c_tip = (145, 95, 60), (225, 175, 120), (255, 230, 190)
        dx, dy = length * math.cos(angle), length * math.sin(angle)
        draw.line([(x, y), (x + dx * 0.5, y + dy * 0.5)], fill=c_base + (220,), width=2)
        draw.line([(x + dx * 0.5, y + dy * 0.5), (x + dx, y + dy)], fill=c_tip + (240,), width=1)
        
    for _ in range(3500):
        x, y = random.randint(0, w), random.randint(0, h)
        length = random.randint(16, 35)
        angle = random.uniform(0.22, 0.30)
        draw.line([(x, y), (x + length*math.cos(angle), y + length*math.sin(angle))], 
                  fill=(255, 245, 220, random.randint(140, 230)), width=1)
        
    rgb_arr = np.array(img.convert("RGB"))
    lum = (rgb_arr[:, :, 0] * 0.3 + rgb_arr[:, :, 1] * 0.59 + rgb_arr[:, :, 2] * 0.11) / 255.0
    lit = apply_emboss_bump(rgb_arr, lum * 0.5 + noise_base * 0.5, strength=1.8)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.18)
    out_path = os.path.join(OUT_DIR, "wolf_fur.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 2. WOLF UNDERBELLY (Clean Radiant Cream/Ivory Fur)
def generate_underbelly():
    target_w, target_h = TARGET_SIZES["wolf_underbelly"]
    w, h = 512, 512
    print(f"Generating 2. wolf_underbelly.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (242, 232, 218, 255))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        draw.line([(0, y), (w, y)], fill=(int(255 - t*25), int(245 - t*25), int(230 - t*25), 255))
        
    for _ in range(15000):
        x, y = random.randint(-20, w + 20), random.randint(-20, h + 20)
        length = random.randint(10, 28)
        angle = random.uniform(0.15, 0.45)
        dx, dy = length * math.cos(angle), length * math.sin(angle)
        c = random.choice([(255, 250, 240), (245, 235, 215), (225, 210, 190)])
        draw.line([(x, y), (x + dx, y + dy)], fill=c + (random.randint(90, 180),), width=random.randint(1, 2))
        
    for _ in range(6000):
        x, y = random.randint(0, w), random.randint(0, h)
        length = random.randint(14, 32)
        draw.line([(x, y), (x + length*0.9, y + length*0.3)], fill=(255, 255, 250, random.randint(120, 220)), width=1)
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=64, octaves=3)
    lum = (rgb_arr[:, :, 0] * 0.3 + rgb_arr[:, :, 1] * 0.59 + rgb_arr[:, :, 2] * 0.11) / 255.0
    lit = apply_emboss_bump(rgb_arr, lum * 0.4 + noise * 0.6, strength=1.4)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.12)
    out_path = os.path.join(OUT_DIR, "wolf_underbelly.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 3. WOLF ARMOR (Polished Warm Chestnut Leather & Gold Rivets)
def generate_armor():
    target_w, target_h = TARGET_SIZES["wolf_armor"]
    w, h = 512, 512
    print(f"Generating 3. wolf_armor.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (145, 90, 60, 255))
    draw = ImageDraw.Draw(img)
    tile_size = 128
    for gy in range(0, h, tile_size):
        for gx in range(0, w, tile_size):
            x0, y0 = gx + 4, gy + 4
            x1, y1 = gx + tile_size - 4, gy + tile_size - 4
            draw.rectangle([x0+4, y0+4, x1+6, y1+6], fill=(75, 45, 25, 200))
            draw.rectangle([x0, y0, x1, y1], fill=(165, 105, 70, 255), outline=(95, 55, 35, 255), width=3)
            draw.rectangle([x0+8, y0+8, x1-8, y1-8], outline=(205, 145, 95, 255), width=2)
            
            bx0, by0, bx1, by1 = x0 + 16, y0 + 16, x1 - 16, y1 - 16
            draw.rectangle([bx0, by0, bx1, by1], fill=(185, 145, 85, 255), outline=(115, 85, 45, 255), width=2)
            draw.line([(bx0+2, by0+2), (bx1-2, by0+2)], fill=(255, 230, 160, 255), width=1)
            
            for rx, ry in [(gx + tile_size//2, gy + tile_size//2), (x0+14, y0+14), (x1-14, y0+14), (x0+14, y1-14), (x1-14, y1-14)]:
                rad = 6
                draw.ellipse([rx-rad+1, ry-rad+2, rx+rad+2, ry+rad+3], fill=(65, 40, 20, 200))
                draw.ellipse([rx-rad, ry-rad, rx+rad, ry+rad], fill=(225, 175, 85, 255), outline=(125, 85, 35, 255), width=1)
                draw.ellipse([rx-rad+2, ry-rad+2, rx-rad+5, ry-rad+5], fill=(255, 250, 220, 255))
                
    rgb_arr = np.array(img.convert("RGB"))
    leather_noise = create_noise_2d(h, w, scale=16, octaves=4)
    lit = apply_emboss_bump(rgb_arr, leather_noise, strength=2.2)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.15)
    out_path = os.path.join(OUT_DIR, "wolf_armor.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 4. WOLF BONE (Bright Polished Enamel Ivory)
def generate_bone():
    target_w, target_h = TARGET_SIZES["wolf_bone"]
    w, h = 256, 256
    print(f"Generating 4. wolf_bone.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (255, 250, 238, 255))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        draw.line([(0, y), (w, y)], fill=(int(255 - t*15), int(252 - t*25), int(245 - t*40), 255))
        
    for _ in range(250):
        x, y, length = random.randint(0, w), random.randint(0, h), random.randint(30, 120)
        draw.line([(x, y), (x + random.uniform(-2, 2), y + length)], 
                  fill=random.choice([(255, 255, 255), (245, 235, 210)]) + (random.randint(80, 160),), width=1)
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=24, octaves=3)
    lit = apply_emboss_bump(rgb_arr, noise, strength=1.0)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.12)
    out_path = os.path.join(OUT_DIR, "wolf_bone.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 5. WOLF CLAW (Clean Silver-Black Keratin)
def generate_claw():
    target_w, target_h = TARGET_SIZES["wolf_claw"]
    w, h = 256, 256
    print(f"Generating 5. wolf_claw.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (75, 80, 92, 255))
    draw = ImageDraw.Draw(img)
    for _ in range(1200):
        cx, cy, rad = random.randint(0, w), random.randint(0, h), random.randint(2, 6)
        c_val = random.randint(90, 135)
        draw.ellipse([cx-rad, cy-rad, cx+rad, cy+rad], fill=(c_val, c_val+5, c_val+12, 255), outline=(45, 50, 60, 255), width=1)
        if random.random() < 0.4:
            draw.ellipse([cx-rad+1, cy-rad+1, cx-rad+3, cy-rad+3], fill=(235, 240, 255, 220))
            
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=12, octaves=3)
    lit = apply_emboss_bump(rgb_arr, noise, strength=1.8)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.18)
    out_path = os.path.join(OUT_DIR, "wolf_claw.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 6. WOLF EYE (Glowing Golden Amber Radiant Eye)
def generate_eye():
    target_w, target_h = TARGET_SIZES["wolf_eye"]
    w, h = 256, 256
    print(f"Generating 6. wolf_eye.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (85, 35, 10, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    r_iris = int(w * 0.44)
    
    draw.ellipse([cx - r_iris - 10, cy - r_iris - 10, cx + r_iris + 10, cy + r_iris + 10], 
                 fill=(125, 55, 15, 255), outline=(55, 20, 5, 255), width=8)
    
    for r in range(r_iris, 15, -2):
        t = r / r_iris
        red = 255
        green = int(240 * (1.0 - t * 0.5) + 60)
        blue = int(45 * (1.0 - t * 0.8))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, 255))
        
    for _ in range(1500):
        ang = random.uniform(0, math.pi * 2)
        r0 = random.uniform(20, r_iris * 0.35)
        r1 = random.uniform(r_iris * 0.45, r_iris - 2)
        c_fiber = random.choice([(255, 255, 180), (255, 215, 80), (255, 160, 30)])
        draw.line([(cx + math.cos(ang)*r0, cy + math.sin(ang)*r0), 
                   (cx + math.cos(ang)*r1, cy + math.sin(ang)*r1)], fill=c_fiber + (random.randint(140, 240),), width=random.randint(1, 2))
        
    pw, ph = int(w * 0.11), int(h * 0.64)
    draw.ellipse([cx - pw, cy - ph//2, cx + pw, cy + ph//2], fill=(20, 4, 4, 255))
    draw.ellipse([cx - pw - 16, cy - ph//3 - 18, cx - pw + 8, cy - ph//3 + 6], fill=(255, 255, 255, 255))
    
    result = finalize_mobile_img(img.convert("RGB"), (target_w, target_h), brightness=1.2)
    out_path = os.path.join(OUT_DIR, "wolf_eye.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 7. WOLF ACCENT (Radiant Golden Fire Rune)
def generate_accent():
    target_w, target_h = TARGET_SIZES["wolf_accent"]
    w, h = 256, 256
    print(f"Generating 7. wolf_accent.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (45, 22, 10, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    
    for r in range(int(w * 0.48), 10, -6):
        t = r / (w * 0.48)
        alpha = int(255 * (1.0 - t) ** 1.3)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, int(180 - t*90), 30, alpha))
        
    pts = [
        (cx, cy - 70), (cx + 50, cy - 20), (cx + 35, cy + 40),
        (cx, cy + 75), (cx - 35, cy + 40), (cx - 50, cy - 20)
    ]
    draw.polygon(pts, outline=(255, 220, 60, 255), width=6)
    draw.polygon(pts, outline=(255, 255, 180, 255), width=2)
    draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(255, 240, 100, 255), outline=(255, 180, 30, 255), width=3)
    draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 255, 255, 255))
    
    result = finalize_mobile_img(Image.fromarray(np.array(img.convert("RGB"))), (target_w, target_h), brightness=1.2)
    out_path = os.path.join(OUT_DIR, "wolf_accent.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

if __name__ == "__main__":
    t0 = time.time()
    generate_fur()
    generate_underbelly()
    generate_armor()
    generate_bone()
    generate_claw()
    generate_eye()
    generate_accent()
    print(f"\nAll 7 Bright Wolf Textures Generated in {time.time() - t0:.2f}s!")
