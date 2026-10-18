import os, math, random, time
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

OUT_DIR = r"H:\GOOGLE DRIVER\GAME\enemies\bandit\textures"
os.makedirs(OUT_DIR, exist_ok=True)
np.random.seed(31415)
random.seed(31415)

TARGET_SIZES = {
    "bandit_cloth": (128, 128),
    "bandit_shroud": (128, 128),
    "bandit_armor": (128, 128),
    "bandit_bone": (64, 64),
    "bandit_claw": (64, 64),
    "bandit_eye": (64, 64),
    "bandit_accent": (64, 64),
}

print("Generating Bright & Vibrant 3D Textures for Bandit...")

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

def apply_emboss_bump(np_rgb, height_map, strength=1.8, light_dir=(-0.5, -0.6, 0.75)):
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

def finalize_mobile_img(img, target_size, contrast=1.18, brightness=1.18, sharpness=1.35):
    if img.size != target_size:
        img = img.resize(target_size, Image.Resampling.LANCZOS)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Color(img).enhance(1.30)
    img = ImageEnhance.Sharpness(img).enhance(sharpness)
    return img

# 1. BANDIT CLOTH (Bright Rich Scarlet / Crimson Woven Cloak)
def generate_cloth():
    target_w, target_h = TARGET_SIZES["bandit_cloth"]
    w, h = 512, 512
    print(f"Generating 1. bandit_cloth.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (215, 45, 55, 255))
    draw = ImageDraw.Draw(img)
    for y in range(0, h, 4):
        c_val = random.randint(185, 245)
        draw.line([(0, y), (w, y)], fill=(c_val, int(c_val*0.25), int(c_val*0.28), 180), width=1)
    for x in range(0, w, 4):
        c_val = random.randint(180, 235)
        draw.line([(x, 0), (x, h)], fill=(c_val, int(c_val*0.22), int(c_val*0.25), 160), width=1)
        
    for _ in range(120):
        fx, fy = random.randint(0, w), random.randint(0, h)
        length = random.randint(30, 140)
        ang = random.uniform(0.3, 0.8)
        draw.line([(fx, fy), (fx + length*math.cos(ang), fy + length*math.sin(ang))], 
                  fill=(135, 20, 28, random.randint(80, 160)), width=random.randint(2, 5))
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=16, octaves=4)
    lit = apply_emboss_bump(rgb_arr, noise, strength=1.8)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.18)
    out_path = os.path.join(OUT_DIR, "bandit_cloth.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 2. BANDIT SHROUD (Clean Ash-Grey Fabric Wrappings)
def generate_shroud():
    target_w, target_h = TARGET_SIZES["bandit_shroud"]
    w, h = 512, 512
    print(f"Generating 2. bandit_shroud.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (135, 125, 138, 255))
    draw = ImageDraw.Draw(img)
    for y in range(-h, h*2, 16):
        draw.line([(0, y), (w, y + w * 0.4)], fill=(165, 155, 170, 220), width=6)
        draw.line([(0, y+4), (w, y + w * 0.4 + 4)], fill=(95, 85, 100, 255), width=2)
        
    for _ in range(3000):
        x, y = random.randint(0, w), random.randint(0, h)
        length = random.randint(8, 25)
        draw.line([(x, y), (x + length, y + random.randint(-1, 1))], fill=(185, 175, 190, random.randint(80, 180)), width=1)
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=24, octaves=4)
    lit = apply_emboss_bump(rgb_arr, noise, strength=1.8)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.16)
    out_path = os.path.join(OUT_DIR, "bandit_shroud.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 3. BANDIT ARMOR (Rich Chestnut Leather & Gold Buckles)
def generate_armor():
    target_w, target_h = TARGET_SIZES["bandit_armor"]
    w, h = 512, 512
    print(f"Generating 3. bandit_armor.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (175, 105, 75, 255))
    draw = ImageDraw.Draw(img)
    tile_size = 128
    for gy in range(0, h, tile_size):
        for gx in range(0, w, tile_size):
            x0, y0 = gx + 4, gy + 4
            x1, y1 = gx + tile_size - 4, gy + tile_size - 4
            draw.rectangle([x0+4, y0+4, x1+6, y1+6], fill=(85, 45, 30, 200))
            draw.rectangle([x0, y0, x1, y1], fill=(195, 125, 90, 255), outline=(115, 65, 45, 255), width=3)
            draw.rectangle([x0+6, y0+6, x1-6, y1-6], outline=(235, 165, 125, 255), width=2)
            
            cx, cy = gx + tile_size//2, gy + tile_size//2
            draw.ellipse([cx-16, cy-16, cx+16, cy+16], fill=(235, 185, 80, 255), outline=(145, 105, 35, 255), width=3)
            draw.ellipse([cx-8, cy-8, cx+8, cy+8], fill=(175, 105, 75, 255))
            draw.ellipse([cx-12, cy-12, cx-6, cy-6], fill=(255, 245, 195, 255))
            
            for rx, ry in [(x0+12, y0+12), (x1-12, y0+12), (x0+12, y1-12), (x1-12, y1-12)]:
                draw.ellipse([rx-4, ry-4, rx+4, ry+4], fill=(225, 175, 75, 255), outline=(135, 95, 30, 255), width=1)
                draw.ellipse([rx-2, ry-2, rx+1, ry+1], fill=(255, 250, 220, 255))
                
    rgb_arr = np.array(img.convert("RGB"))
    leather_noise = create_noise_2d(h, w, scale=16, octaves=4)
    lit = apply_emboss_bump(rgb_arr, leather_noise, strength=2.0)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.16)
    out_path = os.path.join(OUT_DIR, "bandit_armor.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 4. BANDIT BONE (Bright Ivory Demon Horns)
def generate_bone():
    target_w, target_h = TARGET_SIZES["bandit_bone"]
    w, h = 256, 256
    print(f"Generating 4. bandit_bone.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (252, 242, 222, 255))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        draw.line([(0, y), (w, y)], fill=(int(255 - t*25), int(248 - t*35), int(230 - t*50), 255))
        
    for _ in range(300):
        x, y, length = random.randint(0, w), random.randint(0, h), random.randint(30, 100)
        draw.line([(x, y), (x + random.uniform(-2, 2), y + length)], 
                  fill=random.choice([(255, 255, 255), (235, 220, 195)]) + (random.randint(80, 160),), width=1)
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=20, octaves=3)
    lit = apply_emboss_bump(rgb_arr, noise, strength=1.2)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.14)
    out_path = os.path.join(OUT_DIR, "bandit_bone.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 5. BANDIT CLAW (Gleaming Silver-White Steel Blades)
def generate_claw():
    target_w, target_h = TARGET_SIZES["bandit_claw"]
    w, h = 256, 256
    print(f"Generating 5. bandit_claw.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (205, 215, 225, 255))
    draw = ImageDraw.Draw(img)
    for x in range(w):
        val = int(math.sin(x * 0.08) * 35 + 215)
        draw.line([(x, 0), (x, h)], fill=(val, val+2, val+4, 255))
        
    for _ in range(250):
        x, y, length = random.randint(0, w), random.randint(0, h), random.randint(20, 90)
        draw.line([(x, y), (x + length, y + random.randint(-1, 1))], fill=(255, 255, 255, random.randint(90, 200)), width=1)
        
    rgb_arr = np.array(img.convert("RGB"))
    noise = create_noise_2d(h, w, scale=16, octaves=3)
    lit = apply_emboss_bump(rgb_arr, noise, strength=1.8)
    
    result = finalize_mobile_img(Image.fromarray(lit), (target_w, target_h), brightness=1.16)
    out_path = os.path.join(OUT_DIR, "bandit_claw.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 6. BANDIT EYE (Radiant Fiery Red-Orange Eyes)
def generate_eye():
    target_w, target_h = TARGET_SIZES["bandit_eye"]
    w, h = 256, 256
    print(f"Generating 6. bandit_eye.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (120, 20, 15, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    r_eye = int(w * 0.44)
    
    draw.ellipse([cx - r_eye - 8, cy - r_eye - 8, cx + r_eye + 8, cy + r_eye + 8], 
                 fill=(160, 30, 20, 255), outline=(75, 10, 8, 255), width=6)
    
    for r in range(r_eye, 10, -3):
        t = r / r_eye
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, int(180 * (1-t) + 30), 20, 255))
        
    for _ in range(800):
        ang = random.uniform(0, math.pi * 2)
        r0 = random.uniform(15, r_eye * 0.35)
        r1 = random.uniform(r_eye * 0.45, r_eye - 2)
        c_val = random.choice([(255, 255, 180), (255, 180, 50), (255, 230, 90)])
        draw.line([(cx + math.cos(ang)*r0, cy + math.sin(ang)*r0), 
                   (cx + math.cos(ang)*r1, cy + math.sin(ang)*r1)], fill=c_val + (random.randint(140, 240),), width=random.randint(1, 2))
        
    pw, ph = int(w * 0.09), int(h * 0.60)
    draw.ellipse([cx - pw, cy - ph//2, cx + pw, cy + ph//2], fill=(25, 2, 2, 255))
    draw.ellipse([cx - pw - 14, cy - ph//3 - 14, cx - pw + 6, cy - ph//3 + 4], fill=(255, 255, 255, 255))
    
    result = finalize_mobile_img(img.convert("RGB"), (target_w, target_h), brightness=1.2)
    out_path = os.path.join(OUT_DIR, "bandit_eye.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

# 7. BANDIT ACCENT (Radiant Gold Talisman Rune)
def generate_accent():
    target_w, target_h = TARGET_SIZES["bandit_accent"]
    w, h = 256, 256
    print(f"Generating 7. bandit_accent.png (Bright {target_w}x{target_h})...")
    
    img = Image.new("RGBA", (w, h), (85, 40, 15, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    
    for r in range(int(w * 0.46), 10, -6):
        t = r / (w * 0.46)
        alpha = int(255 * (1.0 - t) ** 1.3)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 180, 30, alpha))
        
    pts = [
        (cx, cy - 75), (cx + 55, cy - 25), (cx + 40, cy + 50),
        (cx, cy + 80), (cx - 40, cy + 50), (cx - 55, cy - 25)
    ]
    draw.polygon(pts, outline=(255, 220, 60, 255), width=5)
    draw.polygon(pts, outline=(255, 255, 180, 255), width=2)
    draw.line([(cx, cy - 75), (cx, cy + 80)], fill=(255, 255, 200, 255), width=2)
    draw.line([(cx - 55, cy - 25), (cx + 55, cy - 25)], fill=(255, 255, 200, 255), width=2)
    draw.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], fill=(255, 240, 80, 255), outline=(255, 180, 20, 255), width=3)
    draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(255, 255, 255, 255))
    
    result = finalize_mobile_img(Image.fromarray(np.array(img.convert("RGB"))), (target_w, target_h), brightness=1.2)
    out_path = os.path.join(OUT_DIR, "bandit_accent.png")
    result.save(out_path, format="PNG", optimize=True)
    print("Saved ->", out_path)

if __name__ == "__main__":
    t0 = time.time()
    generate_cloth()
    generate_shroud()
    generate_armor()
    generate_bone()
    generate_claw()
    generate_eye()
    generate_accent()
    print(f"\nAll 7 Bright Bandit Textures Generated in {time.time() - t0:.2f}s!")
